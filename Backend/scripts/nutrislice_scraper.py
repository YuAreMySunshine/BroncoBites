from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import csv
import time

def setup_driver():
    """Set up Chrome driver with headless options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def click_view_menus_button(driver):
    """Click the 'View Menus' button on the splash page"""
    try:
        wait = WebDriverWait(driver, 10)
        view_menus_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[data-testid="view-menus-button"]'))
        )
        view_menus_btn.click()
        print("Clicked 'View Menus' button")
        time.sleep(3)  # Wait for menu to load
        return True
    except TimeoutException:
        print("Could not find 'View Menus' button")
        return False

def parse_allergens(soup):
    """Parse allergen icons and return comma-separated codes"""
    allergen_map = {
        'wheat': 'W',
        'soy': 'S',
        'milk': 'M',
        'egg': 'E',
        'fish': 'F',
        'shellfish': 'SF',
        'peanut': 'P',
        'tree nut': 'T',
        'treenut': 'T',
        'sesame': 'SS'
    }
    
    allergens = []
    # Find allergen icons
    allergen_items = soup.find_all('li', {'aria-label': lambda x: x and 'contains' in x.lower()})
    
    for item in allergen_items:
        aria_label = item.get('aria-label', '').lower()
        for allergen_name, code in allergen_map.items():
            if allergen_name in aria_label:
                allergens.append(code)
                break
    
    return ','.join(sorted(set(allergens)))

def extract_nutrition_from_modal(driver, item_name, save_first_modal=False):
    """Extract nutrition information from the opened modal"""
    try:
        wait = WebDriverWait(driver, 10)
        # Wait for nutrition facts to load
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.nutrition-container')))
        time.sleep(2)  # Additional wait for values to populate
        
        # Save first modal HTML for inspection
        if save_first_modal:
            with open('nutrislice_modal.html', 'w', encoding='utf-8') as f:
                f.write(driver.page_source)
            print(f"  Saved modal HTML to nutrislice_modal.html")
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        nutrition_data = {
            'calories': '',
            'protein': '',
            'carbs': '',
            'fats': '',
            'vegetarian': '',
            'allergens': '',
            'serving_size': ''
        }
        
        # Extract serving size
        serving_size_div = soup.find('div', class_='serving-size')
        if serving_size_div:
            # Get the bold divs which contain the serving size value
            bold_divs = serving_size_div.find_all('div', class_='bold')
            if len(bold_divs) >= 2:
                nutrition_data['serving_size'] = bold_divs[1].get_text(strip=True)
        
        # Extract calories
        calories_div = soup.find('div', class_='calories-row')
        if calories_div:
            # Get all divs in calories-row
            divs = calories_div.find_all('div', recursive=False)
            for div in divs:
                text = div.get_text(strip=True)
                if text.isdigit():
                    nutrition_data['calories'] = text
                    break
        
        # Extract other nutrition values from nutrition-label spans
        saturated_fat = 0
        trans_fat = 0
        
        nutrition_rows = soup.find_all('div', class_='nutrition-label')
        for row in nutrition_rows:
            spans = row.find_all('span')
            if len(spans) >= 2:
                label = spans[0].get_text(strip=True).lower()
                value = spans[1].get_text(strip=True)
                
                # Extract numeric value from strings like "20g"
                import re
                numeric_match = re.search(r'(\d+(?:\.\d+)?)', value)
                if numeric_match:
                    numeric_value = numeric_match.group(1)
                    
                    if 'protein' in label:
                        nutrition_data['protein'] = numeric_value
                    elif 'total carbohydrate' in label:
                        nutrition_data['carbs'] = numeric_value
                    elif 'total fat' in label and not nutrition_data['fats']:  # Only get total fat, not saturated
                        nutrition_data['fats'] = numeric_value
                    elif 'saturated fat' in label:
                        saturated_fat = float(numeric_value)
                    elif 'trans fat' in label:
                        trans_fat = float(numeric_value)
        
        # If Total Fat wasn't found, calculate it from saturated + trans fat
        if not nutrition_data['fats'] and (saturated_fat > 0 or trans_fat > 0):
            total_fat = saturated_fat + trans_fat
            nutrition_data['fats'] = str(int(total_fat) if total_fat == int(total_fat) else total_fat)
        
        # Parse allergens
        nutrition_data['allergens'] = parse_allergens(soup)
        
        # Check for vegetarian indicator - look for vegan/vegetarian icons
        food_icons = soup.find('menus-food-icons')
        if food_icons:
            icon_text = food_icons.get_text().lower()
            if 'vegan' in icon_text or 'vegetarian' in icon_text:
                nutrition_data['vegetarian'] = 'Yes'
        
        # Skip items with all zero nutrition values
        if (nutrition_data['calories'] == '0' and 
            nutrition_data['protein'] == '0' and 
            nutrition_data['carbs'] == '0' and 
            (nutrition_data['fats'] == '0' or not nutrition_data['fats'])):
            print(f"  Skipping {item_name} - all nutrition values are zero")
            return None
        
        return nutrition_data
    except TimeoutException:
        print(f"  Timeout waiting for nutrition data to load")
        return None
    except Exception as e:
        print(f"  Error extracting nutrition: {e}")
        return None

def click_menu_item_and_extract(driver, item_element, item_name, is_first=False):
    """Click a menu item and extract its nutrition info"""
    try:
        # Scroll item into view
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", item_element)
        time.sleep(0.5)
        
        # Click the item
        item_element.click()
        print(f"  Clicked: {item_name}")
        time.sleep(1)
        
        # Extract nutrition from modal
        nutrition_data = extract_nutrition_from_modal(driver, item_name, save_first_modal=is_first)
        
        # Close modal (look for close button)
        try:
            close_btn = driver.find_element(By.CSS_SELECTOR, 'button.close, button[aria-label*="Close"], .modal button[class*="close"]')
            close_btn.click()
            time.sleep(0.5)
        except:
            # If no close button, try pressing Escape
            from selenium.webdriver.common.keys import Keys
            driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
            time.sleep(0.5)
        
        if nutrition_data:
            # Add serving size to item name
            if nutrition_data.get('serving_size'):
                nutrition_data['name'] = f"{item_name} ({nutrition_data['serving_size']})"
            else:
                nutrition_data['name'] = item_name
            return nutrition_data
        
    except Exception as e:
        print(f"    Error processing {item_name}: {e}")
    
    return None

def extract_menu_items(driver):
    """Extract menu items from the page"""
    wait = WebDriverWait(driver, 10)
    
    # Wait for menu items to load
    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.menu-item-wrapper')))
        time.sleep(2)
    except TimeoutException:
        print("Menu items didn't load in time")
        return []
    
    print("Finding menu items...")
    
    # Find all menu item wrappers
    menu_item_elements = driver.find_elements(By.CSS_SELECTOR, '.menu-item-wrapper[data-testid^="menu-item-"]')
    
    print(f"Found {len(menu_item_elements)} menu items")
    
    menu_items = []
    
    # Process all items
    for i, item_element in enumerate(menu_item_elements):
        # Extract item name from data-testid
        data_testid = item_element.get_attribute('data-testid')
        item_name = data_testid.replace('menu-item-', '') if data_testid else f"Unknown Item {i+1}"
        
        print(f"\nProcessing ({i+1}/{len(menu_item_elements)}): {item_name}")
        
        # Click and extract nutrition
        nutrition_data = click_menu_item_and_extract(driver, item_element, item_name, is_first=(i==0))
        
        if nutrition_data:
            menu_items.append(nutrition_data)
    
    return menu_items

def scrape_nutrislice_menu(url):
    """Main scraping function"""
    print(f"Starting Nutrislice scraper for: {url}")
    
    driver = setup_driver()
    menu_items = []
    
    try:
        # Load the page
        driver.get(url)
        print("Page loaded")
        time.sleep(2)
        
        # Click the "View Menus" button
        if not click_view_menus_button(driver):
            print("Failed to access menu. Saving page for inspection...")
            with open('nutrislice_error.html', 'w', encoding='utf-8') as f:
                f.write(driver.page_source)
            return []
        
        # Extract menu items
        menu_items = extract_menu_items(driver)
        
    except Exception as e:
        print(f"Error during scraping: {e}")
    finally:
        driver.quit()
    
    return menu_items

def save_to_csv(menu_items, filename='nutrislice_menu.csv'):
    """Save menu items to CSV"""
    if not menu_items:
        print("No items to save")
        return
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['Item Name', 'Calories', 'Protein', 'Carbs', 'Fats', 'Vegetarian', 'Allergens']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        writer.writeheader()
        for item in menu_items:
            writer.writerow({
                'Item Name': item.get('name', ''),
                'Calories': item.get('calories', ''),
                'Protein': item.get('protein', ''),
                'Carbs': item.get('carbs', ''),
                'Fats': item.get('fats', ''),
                'Vegetarian': item.get('vegetarian', ''),
                'Allergens': item.get('allergens', '')
            })
    
    print(f"\nSaved {len(menu_items)} items to {filename}")

if __name__ == "__main__":
    # URL for CPP Centerpointe Dining Commons lunch menu
    url = "https://cpp.nutrislice.com/menu/centerpointe-dining-commons/lunch/2025-11-24"
    
    # Scrape the menu
    items = scrape_nutrislice_menu(url)
    
    print(f"\nTotal items found: {len(items)}")
    
    if items:
        print("\nSample items:")
        for item in items[:5]:
            print(f"  - {item.get('name', 'Unknown')}")
        
        # Save to CSV
        save_to_csv(items)
    else:
        print("\nNo items found. Check the saved HTML files to understand the page structure.")
