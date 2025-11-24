import requests
from bs4 import BeautifulSoup
import json
import re
import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

class StarbucksScraper:
    def __init__(self):
        self.base_url = "https://www.starbucks.com"
        self.menu_url = f"{self.base_url}/menu"
        self.items = []
        
    def setup_driver(self):
        """Set up Selenium WebDriver with Chrome"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Run in background
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    
    def parse_allergens(self, allergen_text):
        """Extract allergen codes from allergen text"""
        allergen_map = {
            'egg': 'E',
            'fish': 'F',
            'milk': 'M',
            'peanut': 'P',
            'shellfish': 'SF',
            'soy': 'S',
            'tree nut': 'T',
            'treenut': 'T',
            'wheat': 'W',
            'sesame': 'SS'
        }
        
        allergens = []
        if not allergen_text:
            return allergens
        
        allergen_text_lower = allergen_text.lower()
        for allergen, code in allergen_map.items():
            if allergen in allergen_text_lower:
                if code not in allergens:
                    allergens.append(code)
        
        return allergens
    
    def extract_nutrition_from_item(self, driver, item_url):
        """Navigate to item nutrition page and extract nutrition information"""
        try:
            # Navigate to the nutrition page
            nutrition_url = f"{item_url}/nutrition"
            driver.get(nutrition_url)
            time.sleep(2)  # Wait for page to load
            
            nutrition_data = {
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fats': 0,
                'allergens': []
            }
            
            # Get page source and parse with BeautifulSoup for more reliable extraction
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Extract calories from the data-e2e attribute
            try:
                calories_elem = soup.find('span', {'data-e2e': 'calories'})
                if calories_elem:
                    calories_text = calories_elem.text.strip()
                    nutrition_data['calories'] = int(re.findall(r'\d+', calories_text)[0]) if re.findall(r'\d+', calories_text) else 0
            except Exception as e:
                print(f"    Could not extract calories: {e}")
            
            # Find the nutrition section
            nutrition_section = soup.find('div', {'data-e2e': 'nutritionSection'})
            
            if nutrition_section:
                # Extract Total Carbohydrates
                try:
                    for container in nutrition_section.find_all('li'):
                        text_content = container.get_text()
                        if 'Total Carbohydrates' in text_content:
                            carbs_spans = container.find_all('span', class_='text-semibold')
                            for span in carbs_spans:
                                text = span.get_text().strip()
                                if 'g' in text and text != 'Total Carbohydrates':
                                    carbs_match = re.findall(r'\d+', text)
                                    if carbs_match:
                                        nutrition_data['carbs'] = int(carbs_match[0])
                                    break
                            break
                except Exception as e:
                    print(f"    Could not extract carbs: {e}")
                
                # Extract Protein
                try:
                    for container in nutrition_section.find_all('div', class_='container___Ds7kK'):
                        text_content = container.get_text()
                        if 'Protein' in text_content and 'Total' not in text_content:
                            protein_spans = container.find_all('span', class_='text-semibold')
                            for span in protein_spans:
                                text = span.get_text().strip()
                                if 'g' in text and text != 'Protein':
                                    protein_match = re.findall(r'\d+', text)
                                    if protein_match:
                                        nutrition_data['protein'] = int(protein_match[0])
                                    break
                            break
                except Exception as e:
                    print(f"    Could not extract protein: {e}")
                
                # Extract Total Fat
                try:
                    for container in nutrition_section.find_all('li', class_='container___Ds7kK'):
                        text_content = container.get_text()
                        if 'Total Fat' in text_content:
                            fat_spans = container.find_all('span', class_='text-semibold')
                            for span in fat_spans:
                                text = span.get_text().strip()
                                if 'g' in text and text != 'Total Fat':
                                    fat_match = re.findall(r'\d+', text)
                                    if fat_match:
                                        nutrition_data['fats'] = int(fat_match[0])
                                    break
                            break
                except Exception as e:
                    print(f"    Could not extract fats: {e}")
            
            # Extract allergens
            try:
                allergens_section = soup.find('div', {'data-e2e': 'allergensSection'})
                if allergens_section:
                    allergen_p = allergens_section.find('p', class_='my1')
                    if allergen_p:
                        allergen_text = allergen_p.text.strip()
                        nutrition_data['allergens'] = self.parse_allergens(allergen_text)
            except Exception as e:
                print(f"    Could not extract allergens: {e}")
            
            return nutrition_data
            
        except Exception as e:
            print(f"    Error extracting nutrition from {nutrition_url}: {e}")
            return None
    
    def scrape_menu(self):
        """Scrape all menu items from Starbucks menu page"""
        driver = self.setup_driver()
        
        try:
            print(f"Loading menu page: {self.menu_url}")
            driver.get(self.menu_url)
            time.sleep(3)  # Wait for page to load
            
            # Accept cookies if popup appears
            try:
                accept_button = WebDriverWait(driver, 3).until(
                    EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'Accept') or contains(text(), 'accept')]"))
                )
                accept_button.click()
                time.sleep(1)
            except:
                pass
            
            # Find all category links directly from main menu page
            # Looking for links like /menu/drinks/cold-coffee, /menu/food/bakery, etc.
            all_category_urls = []
            
            try:
                # Find links that match the pattern /menu/drinks/* or /menu/food/*
                links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/menu/']")
                
                for link in links:
                    href = link.get_attribute('href')
                    if href:
                        # Check if it's a category link (3 parts: menu/drinks/category or menu/food/category)
                        path = href.replace(self.base_url, '')
                        parts = [p for p in path.split('/') if p]
                        
                        # Should be exactly 3 parts: ['menu', 'drinks'/'food', 'category-name']
                        if len(parts) == 3 and parts[0] == 'menu' and parts[1] in ['drinks', 'food']:
                            if href not in all_category_urls:
                                all_category_urls.append(href)
                                print(f"  Found category: {parts[1]}/{parts[2]}")
                
                print(f"\nTotal categories found: {len(all_category_urls)}")
                
            except Exception as e:
                print(f"Error finding categories: {e}")
            
            # Now scrape products from each category
            item_links = []
            for category_url in all_category_urls:
                category_name = category_url.split('/')[-1]
                print(f"\nLoading category: {category_name}")
                driver.get(category_url)
                time.sleep(2)
                
                try:
                    # Find all product links in this category
                    links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/menu/product/']")
                    
                    category_items = 0
                    for link in links:
                        href = link.get_attribute('href')
                        if href and href not in item_links:
                            item_links.append(href)
                            category_items += 1
                    
                    print(f"  Found {category_items} products")
                    
                except Exception as e:
                    print(f"  Error finding products: {e}")
            
            print(f"\n{'='*50}")
            print(f"Total unique products found: {len(item_links)}")
            print(f"{'='*50}\n")
            
            # Scrape each item
            for idx, item_url in enumerate(item_links, 1):
                product_name = item_url.split('/')[-1]
                print(f"[{idx}/{len(item_links)}] {product_name}")
                
                try:
                    driver.get(item_url)
                    time.sleep(2)
                    
                    # Extract item name
                    item_name = ""
                    try:
                        name_elem = driver.find_element(By.CSS_SELECTOR, "h1, [class*='product-name'], [class*='ProductName']")
                        item_name = name_elem.text.strip()
                    except:
                        # Try alternate selector
                        try:
                            item_name = driver.title.split('|')[0].strip()
                        except:
                            item_name = "Unknown Item"
                    
                    # Extract nutrition data
                    nutrition = self.extract_nutrition_from_item(driver, item_url)
                    
                    if nutrition:
                        item_data = {
                            'itemName': item_name,
                            'calories': nutrition['calories'],
                            'nutrition': {
                                'protein': nutrition['protein'],
                                'carbs': nutrition['carbs'],
                                'fats': nutrition['fats']
                            },
                            'vegetarian': False,  # Would need additional logic to determine
                            'allergens': nutrition['allergens']
                        }
                        
                        self.items.append(item_data)
                        allergen_str = ','.join(nutrition['allergens']) if nutrition['allergens'] else 'None'
                        print(f"  ✓ {item_name} - {nutrition['calories']} cal, P:{nutrition['protein']}g C:{nutrition['carbs']}g F:{nutrition['fats']}g | Allergens: {allergen_str}")
                    else:
                        print(f"  ✗ Could not extract nutrition data")
                    
                except Exception as e:
                    print(f"  ✗ Error: {e}")
                    continue
            
        finally:
            driver.quit()
        
        return self.items
    
    def save_to_csv(self, filename='starbucks_menu.csv'):
        """Save scraped items to CSV file"""
        if not self.items:
            print("No items to save")
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Write header
            writer.writerow([
                'Item Name',
                'Calories',
                'Protein (g)',
                'Carbs (g)',
                'Fats (g)',
                'Vegetarian',
                'Allergens'
            ])
            
            # Write data rows
            for item in self.items:
                writer.writerow([
                    item['itemName'],
                    item['calories'],
                    item['nutrition']['protein'],
                    item['nutrition']['carbs'],
                    item['nutrition']['fats'],
                    'Yes' if item['vegetarian'] else 'No',
                    ', '.join(item['allergens']) if item['allergens'] else ''
                ])
        
        print(f"\n✓ Saved {len(self.items)} items to {filename}")
    
    def print_summary(self):
        """Print summary of scraped data"""
        print("\n" + "="*50)
        print(f"SCRAPING SUMMARY")
        print("="*50)
        print(f"Total items scraped: {len(self.items)}")
        print(f"\nSample items:")
        for item in self.items[:3]:
            print(f"\n- {item['itemName']}")
            print(f"  Calories: {item['calories']}")
            print(f"  Protein: {item['nutrition']['protein']}g")
            print(f"  Carbs: {item['nutrition']['carbs']}g")
            print(f"  Fats: {item['nutrition']['fats']}g")
            print(f"  Allergens: {', '.join(item['allergens']) if item['allergens'] else 'None'}")

if __name__ == "__main__":
    print("Starting Starbucks Menu Scraper...")
    print("="*50)
    
    scraper = StarbucksScraper()
    scraper.scrape_menu()
    scraper.print_summary()
    scraper.save_to_csv()
    
    print("\n✓ Scraping complete!")
