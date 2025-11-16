# Database Schema (Restaurant Menu Items)

## CSV Format Expected

Your CSV files should now have these columns:
```
Item Name,Calories,Protein,Carbohydrates,Fats,Vegetarian,Allergens
```

Example row:
```
Famous Star with Cheese - Single,680,28,57,38,FALSE,"E,M,S,SS,W"
```

### Allergen Codes Reference:
Common allergen abbreviations (adjust as needed):
- E = Eggs
- M = Milk/Dairy
- S = Soy
- SS = Sesame Seeds
- W = Wheat/Gluten
- N = Tree Nuts
- P = Peanuts
- F = Fish
- SF = Shellfish

## Admin Portal UI Changes

Restuarant table displays:
1. Item Name (text input)
2. Calories (number input)
3. Protein (g) (number input)
4. Carbs (g) (number input)
5. Fats (g) (number input)
6. Vegetarian (checkbox)
7. Allergens (text input - comma-separated)
8. Delete button

## Migration Notes

### For Existing Data:
- Items without `calories` will default to 0
- Items without `vegetarian` will default to false
- Items without `allergens` will default to empty array []

### To Repopulate Menus:
1. Ensure all CSV files in `Backend/scripts/Menus/` follow the new format
2. Run: `node Backend/scripts/populateMenus.js`
3. The script handles both old and new CSV column names for backwards compatibility

## Testing Checklist

- [ ] Backend model accepts new fields
- [ ] Admin portal displays new columns
- [ ] Can add new menu items with all fields
- [ ] Can edit calories, vegetarian, and allergens
- [ ] Allergens save correctly as array
- [ ] CSV import script works with new format
- [ ] API endpoints return new fields
- [ ] Old data displays correctly with defaults

## API Response Example

```json
{
  "_id": "...",
  "itemName": "Famous Star with Cheese",
  "calories": 680,
  "nutrition": {
    "protein": 28,
    "carbs": 57,
    "fats": 38
  },
  "vegetarian": false,
  "allergens": ["E", "M", "S", "SS", "W"]
}
```
