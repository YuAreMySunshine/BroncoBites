import { useState, useEffect } from 'react';
import '../style/home/Home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Nutrition {
  protein: number;
  carbs: number;
  fats: number;
}

interface MenuItem {
  _id?: string;
  itemName: string;
  calories: number;
  nutrition: Nutrition;
  vegetarian: boolean;
  allergens: string[];
}

interface DayHours {
  open: string;
  close: string;
}

type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
type HoursMap = Partial<Record<DayName, DayHours>>;

interface Restaurant {
  _id: string;
  name: string;
  menuItems: MenuItem[];
  hours?: HoursMap;
  isOpen?: boolean;
}

export default function RestaurantMenus() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  
  // Nutrition filters
  const [caloriesMin, setCaloriesMin] = useState<number | ''>('');
  const [caloriesMax, setCaloriesMax] = useState<number | ''>('');
  const [proteinMin, setProteinMin] = useState<number | ''>('');
  const [proteinMax, setProteinMax] = useState<number | ''>('');
  const [carbsMin, setCarbsMin] = useState<number | ''>('');
  const [carbsMax, setCarbsMax] = useState<number | ''>('');
  const [fatsMin, setFatsMin] = useState<number | ''>('');
  const [fatsMax, setFatsMax] = useState<number | ''>('');
  
  // Allergen filters
  const [excludedAllergens, setExcludedAllergens] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_URL as string) || '';
  
  // Allergen mapping
  const allergenMap: Record<string, string> = {
    'E': 'Egg',
    'F': 'Fish',
    'M': 'Milk',
    'P': 'Peanuts',
    'SF': 'Shellfish',
    'S': 'Soy',
    'T': 'Treenuts',
    'W': 'Wheat',
    'SS': 'Sesame'
  };
  
  const getAllergenDisplay = (code: string): string => {
    return allergenMap[code] || code;
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const restaurantList: Restaurant[] = Array.isArray(data) ? data : data.restaurants || [];
        setRestaurants(restaurantList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching restaurants:', err);
        setError(err.message || 'Failed to load restaurants');
        setLoading(false);
      });
  }, [API_BASE]);

  const getStatusBadge = (restaurant: Restaurant) => {
    if (typeof restaurant.isOpen !== 'boolean') return null;
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          background: restaurant.isOpen ? '#e8f5e9' : '#ffebee',
          color: restaurant.isOpen ? '#2e7d32' : '#c62828',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        {restaurant.isOpen ? '🟢 Open Now' : '🔴 Closed'}
      </span>
    );
  };

  const formatHours = (hours?: HoursMap) => {
    if (!hours) return null;
    const days: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return (
      <div style={{ fontSize: '0.9rem', color: '#b7c2d6' }}>
        {days.map((day) => {
          const slot = hours[day];
          if (!slot) return null;
          const isClosed = slot.open === slot.close;
          return (
            <div key={day} style={{ marginBottom: '0.25rem' }}>
              <strong>{day}:</strong> {isClosed ? 'Closed' : `${slot.open} - ${slot.close}`}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredRestaurants = restaurants.map((restaurant) => {
    const filteredItems = restaurant.menuItems.filter((item) => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVegetarian = !filterVegetarian || item.vegetarian;
      
      // Nutrition filters
      const matchesCalories = 
        (caloriesMin === '' || item.calories >= caloriesMin) &&
        (caloriesMax === '' || item.calories <= caloriesMax);
      
      const matchesProtein = 
        (proteinMin === '' || item.nutrition.protein >= proteinMin) &&
        (proteinMax === '' || item.nutrition.protein <= proteinMax);
      
      const matchesCarbs = 
        (carbsMin === '' || item.nutrition.carbs >= carbsMin) &&
        (carbsMax === '' || item.nutrition.carbs <= carbsMax);
      
      const matchesFats = 
        (fatsMin === '' || item.nutrition.fats >= fatsMin) &&
        (fatsMax === '' || item.nutrition.fats <= fatsMax);
      
      // Allergen filter - exclude items with any of the selected allergens
      const hasExcludedAllergen = item.allergens.some(allergen => 
        excludedAllergens.has(allergen)
      );
      
      return matchesSearch && matchesVegetarian && matchesCalories && 
             matchesProtein && matchesCarbs && matchesFats && !hasExcludedAllergen;
    });

    return {
      ...restaurant,
      menuItems: filteredItems,
    };
  })
  .filter((restaurant) => restaurant.menuItems.length > 0 || searchTerm === '')
  .sort((a, b) => b.menuItems.length - a.menuItems.length); // Sort by number of menu items (descending)
  
  // Get all unique allergens from all menu items
  const allAllergens = Array.from(
    new Set(
      restaurants.flatMap(r => r.menuItems.flatMap(item => item.allergens))
    )
  ).sort();
  
  const toggleAllergen = (allergen: string) => {
    setExcludedAllergens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(allergen)) {
        newSet.delete(allergen);
      } else {
        newSet.add(allergen);
      }
      return newSet;
    });
  };
  
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterVegetarian(false);
    setCaloriesMin('');
    setCaloriesMax('');
    setProteinMin('');
    setProteinMax('');
    setCarbsMin('');
    setCarbsMax('');
    setFatsMin('');
    setFatsMax('');
    setExcludedAllergens(new Set());
  };

  return (
    <div className="bb">
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--text)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Restaurant Menus
          </h1>
          <p style={{ color: 'var(--text-muted, #b7c2d6)', fontSize: '1.1rem' }}>
            Browse all available restaurants and their menu items
          </p>
        </header>

        {/* Search and Filter Controls */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '12px'
        }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: '1 1 300px',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text)',
                fontSize: '1rem'
              }}
            />
            <button
              className="btn primary"
              onClick={() => setShowFilters(!showFilters)}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
            </button>
            <button
              className="btn"
              onClick={clearAllFilters}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Clear All
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div style={{ 
              marginTop: '1.5rem', 
              paddingTop: '1.5rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
            }}>
              {/* Quick Filters */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>Quick Filters</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filterVegetarian}
                    onChange={(e) => setFilterVegetarian(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ color: 'var(--text)' }}>🌱 Vegetarian Only</span>
                </label>
              </div>

              {/* Nutrition Ranges */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>Nutrition Ranges</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1rem' 
                }}>
                  {/* Calories */}
                  <div>
                    <label style={{ color: 'var(--text)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                      Calories
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={caloriesMin}
                        onChange={(e) => setCaloriesMin(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                      <span style={{ color: '#999' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={caloriesMax}
                        onChange={(e) => setCaloriesMax(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Protein */}
                  <div>
                    <label style={{ color: 'var(--text)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                      Protein (g)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={proteinMin}
                        onChange={(e) => setProteinMin(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                      <span style={{ color: '#999' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={proteinMax}
                        onChange={(e) => setProteinMax(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <label style={{ color: 'var(--text)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                      Carbs (g)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={carbsMin}
                        onChange={(e) => setCarbsMin(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                      <span style={{ color: '#999' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={carbsMax}
                        onChange={(e) => setCarbsMax(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Fats */}
                  <div>
                    <label style={{ color: 'var(--text)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                      Fats (g)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={fatsMin}
                        onChange={(e) => setFatsMin(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                      <span style={{ color: '#999' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={fatsMax}
                        onChange={(e) => setFatsMax(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allergen Exclusions */}
              {allAllergens.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>
                    ⚠️ Exclude Allergens
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.75rem' 
                  }}>
                    {allAllergens.map((allergen) => (
                      <label
                        key={allergen}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: excludedAllergens.has(allergen)
                            ? 'rgba(251, 191, 36, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={excludedAllergens.has(allergen)}
                          onChange={() => toggleAllergen(allergen)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                          {getAllergenDisplay(allergen)} ({allergen})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ padding: '2rem', border: '2px solid #ff4444' }}>
            <h3 style={{ color: '#ff4444', marginTop: 0 }}>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredRestaurants.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No menu items found</h3>
            <p style={{ color: 'var(--text-muted, #b7c2d6)' }}>
              {searchTerm ? 'Try adjusting your search or filters.' : 'No restaurants available yet.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredRestaurants.length > 0 && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant._id} className="card" style={{ padding: '2rem' }}>
                {/* Restaurant Header */}
                <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ color: 'var(--text)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
                        {restaurant.name}
                      </h2>
                      <div style={{ marginTop: '0.5rem' }}>
                        {getStatusBadge(restaurant)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Hours</h4>
                      {formatHours(restaurant.hours)}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div>
                  <h3 style={{ color: 'var(--text)', marginBottom: '1rem' }}>
                    Menu Items ({restaurant.menuItems.length})
                  </h3>
                  
                  {restaurant.menuItems.length === 0 ? (
                    <p style={{ color: 'var(--text-muted, #b7c2d6)', fontStyle: 'italic' }}>
                      No menu items available
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {restaurant.menuItems.map((item, index) => (
                        <div
                          key={item._id || index}
                          style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1rem',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <h4 style={{ color: 'var(--text)', marginBottom: '0.25rem' }}>
                              {item.itemName}
                              {item.vegetarian && (
                                <span style={{ marginLeft: '0.5rem', color: '#4ade80' }}>🌱</span>
                              )}
                            </h4>
                            {item.allergens.length > 0 && (
                              <p style={{ fontSize: '0.85rem', color: '#fbbf24', margin: '0.25rem 0 0 0' }}>
                                ⚠️ Contains: {item.allergens.map(a => getAllergenDisplay(a)).join(', ')}
                              </p>
                            )}
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#999' }}>Calories</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
                              {item.calories}
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#999' }}>Protein</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
                              {item.nutrition.protein}g
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#999' }}>Carbs</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
                              {item.nutrition.carbs}g
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#999' }}>Fats</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
                              {item.nutrition.fats}g
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
