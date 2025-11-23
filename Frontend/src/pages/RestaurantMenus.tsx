import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import '../style/home/Home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface UserPreferences {
  favoriteItems: Array<{ itemId: string; restaurantId: string; itemName: string }>;
  blacklistedItems: Array<{ itemId: string }>;
  favoriteRestaurants: Array<{ restaurantId: string }>;
  blacklistedRestaurants: Array<{ restaurantId: string }>;
}

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
  const { user } = useUser();
  const { getToken } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

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

  // Check if item is favorited/blacklisted
  const isItemFavorited = (itemId: string) =>
    preferences?.favoriteItems.some(i => i.itemId === itemId) || false;
  const isItemBlacklisted = (itemId: string) =>
    preferences?.blacklistedItems.some(i => i.itemId === itemId) || false;
  const isRestaurantFavorited = (restaurantId: string) =>
    preferences?.favoriteRestaurants.some(r => r.restaurantId === restaurantId) || false;
  const isRestaurantBlacklisted = (restaurantId: string) =>
    preferences?.blacklistedRestaurants.some(r => r.restaurantId === restaurantId) || false;

  // Toggle favorite item
  const toggleFavoriteItem = async (restaurantId: string, itemId: string, itemName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, itemId, itemName })
      });
      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Toggle blacklist item
  const toggleBlacklistItem = async (restaurantId: string, itemId: string, itemName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, itemId, itemName })
      });
      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error toggling blacklist:', err);
    }
  };

  // Toggle favorite restaurant
  const toggleFavoriteRestaurant = async (restaurantId: string, restaurantName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/restaurant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, restaurantName })
      });
      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error toggling favorite restaurant:', err);
    }
  };

  // Toggle blacklist restaurant
  const toggleBlacklistRestaurant = async (restaurantId: string, restaurantName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/restaurant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, restaurantName })
      });
      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error toggling blacklist restaurant:', err);
    }
  };

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
    const fetchData = async () => {
      try {
        // Fetch restaurants
        const restaurantsRes = await fetch(`${API_BASE}/api/restaurants`);
        if (!restaurantsRes.ok) throw new Error(`HTTP error! status: ${restaurantsRes.status}`);
        const data = await restaurantsRes.json();
        const restaurantList: Restaurant[] = Array.isArray(data) ? data : data.restaurants || [];
        setRestaurants(restaurantList);

        // Fetch preferences if user is logged in
        if (user) {
          const token = await getToken();
          const prefsRes = await fetch(`${API_BASE}/api/preferences`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (prefsRes.ok) {
            const prefsData = await prefsRes.json();
            setPreferences(prefsData);
          }
        }
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load restaurants';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, user, getToken]);

  const getStatusBadge = (restaurant: Restaurant) => {
    if (typeof restaurant.isOpen !== 'boolean') return null;
    return (
      <span className={`badge ${restaurant.isOpen ? 'badge-open' : 'badge-closed'}`}>
        {restaurant.isOpen ? 'Open Now' : 'Closed'}
      </span>
    );
  };

  const formatHours = (hours?: HoursMap) => {
    if (!hours) return null;
    const days: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return (
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        {days.map((day) => {
          const slot = hours[day];
          if (!slot) return null;
          const isClosed = slot.open === slot.close;
          return (
            <div key={day} style={{ marginBottom: 'var(--space-1)' }}>
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
  .sort((a, b) => b.menuItems.length - a.menuItems.length);

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
    <div className="page">
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <header className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Restaurant Menus</h1>
          <p className="page-subtitle">Browse all available restaurants and their menu items</p>
        </header>

        {/* Search and Filter Controls */}
        <div className="filter-bar" style={{ marginBottom: 'var(--space-8)', flexDirection: 'column' }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', width: '100%' }}>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ flex: '1 1 300px' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div style={{
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border-light)',
              width: '100%'
            }}>
              {/* Quick Filters */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Quick Filters</h4>
                <label className={`chip ${filterVegetarian ? 'chip--active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={filterVegetarian}
                    onChange={(e) => setFilterVegetarian(e.target.checked)}
                    className="sr-only"
                  />
                  Vegetarian Only
                </label>
              </div>

              {/* Nutrition Ranges */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Nutrition Ranges</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-4)'
                }}>
                  {/* Calories */}
                  <div className="form-group">
                    <label className="form-label">Calories</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={caloriesMin}
                        onChange={(e) => setCaloriesMin(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                      <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={caloriesMax}
                        onChange={(e) => setCaloriesMax(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={proteinMin}
                        onChange={(e) => setProteinMin(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                      <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={proteinMax}
                        onChange={(e) => setProteinMax(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="form-group">
                    <label className="form-label">Carbs (g)</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={carbsMin}
                        onChange={(e) => setCarbsMin(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                      <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={carbsMax}
                        onChange={(e) => setCarbsMax(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="form-group">
                    <label className="form-label">Fats (g)</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={fatsMin}
                        onChange={(e) => setFatsMin(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                      <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={fatsMax}
                        onChange={(e) => setFatsMax(e.target.value ? Number(e.target.value) : '')}
                        className="form-input"
                        style={{ height: '40px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allergen Exclusions */}
              {allAllergens.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>
                    Exclude Allergens
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {allAllergens.map((allergen) => (
                      <label
                        key={allergen}
                        className={`chip ${excludedAllergens.has(allergen) ? 'chip--active' : ''}`}
                        style={{
                          background: excludedAllergens.has(allergen)
                            ? 'var(--color-warning-light)'
                            : undefined,
                          color: excludedAllergens.has(allergen)
                            ? '#92400E'
                            : undefined,
                          borderColor: excludedAllergens.has(allergen)
                            ? 'var(--color-warning)'
                            : undefined
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={excludedAllergens.has(allergen)}
                          onChange={() => toggleAllergen(allergen)}
                          className="sr-only"
                        />
                        {getAllergenDisplay(allergen)}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <h3 style={{ margin: '0 0 var(--space-2) 0' }}>Error</h3>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && !error && filteredRestaurants.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__title">No menu items found</div>
            <p className="empty-state__description">
              {searchTerm ? 'Try adjusting your search or filters.' : 'No restaurants available yet.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredRestaurants.length > 0 && (
          <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
            {filteredRestaurants.map((restaurant) => (
              <article key={restaurant._id} className="restaurant-card">
                {/* Restaurant Header */}
                <div className="restaurant-card__header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <h2 className="restaurant-card__name">{restaurant.name}</h2>
                        {user && (
                          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                            <button
                              onClick={() => toggleFavoriteRestaurant(restaurant._id, restaurant.name)}
                              title={isRestaurantFavorited(restaurant._id) ? 'Remove from favorites' : 'Add to favorites'}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '1.25rem',
                                padding: 'var(--space-1)',
                                opacity: isRestaurantFavorited(restaurant._id) ? 1 : 0.4,
                                transition: 'opacity 150ms ease'
                              }}
                            >
                              {isRestaurantFavorited(restaurant._id) ? '⭐' : '☆'}
                            </button>
                            <button
                              onClick={() => toggleBlacklistRestaurant(restaurant._id, restaurant.name)}
                              title={isRestaurantBlacklisted(restaurant._id) ? 'Remove from blacklist' : 'Add to blacklist'}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '1.25rem',
                                padding: 'var(--space-1)',
                                opacity: isRestaurantBlacklisted(restaurant._id) ? 1 : 0.4,
                                transition: 'opacity 150ms ease'
                              }}
                            >
                              {isRestaurantBlacklisted(restaurant._id) ? '🚫' : '⊘'}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="restaurant-card__status">
                        {getStatusBadge(restaurant)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h4 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Hours</h4>
                      {formatHours(restaurant.hours)}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="restaurant-card__body">
                  <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
                    Menu Items ({restaurant.menuItems.length})
                  </h3>

                  {restaurant.menuItems.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No menu items available
                    </p>
                  ) : (
                    <div className="menu-grid">
                      {restaurant.menuItems.map((item, index) => (
                        <div key={item._id || index} className="menu-card">
                          <div className="menu-card__header">
                            <h4 className="menu-card__title">
                              {item.itemName}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              {item.vegetarian && (
                                <span className="badge badge-vegetarian">Vegetarian</span>
                              )}
                              {user && item._id && (
                                <div style={{ display: 'flex', gap: '2px' }}>
                                  <button
                                    onClick={() => toggleFavoriteItem(restaurant._id, item._id!, item.itemName)}
                                    title={isItemFavorited(item._id) ? 'Remove from favorites' : 'Add to favorites'}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      cursor: 'pointer',
                                      fontSize: '1rem',
                                      padding: '2px',
                                      opacity: isItemFavorited(item._id) ? 1 : 0.4,
                                      transition: 'opacity 150ms ease'
                                    }}
                                  >
                                    {isItemFavorited(item._id) ? '⭐' : '☆'}
                                  </button>
                                  <button
                                    onClick={() => toggleBlacklistItem(restaurant._id, item._id!, item.itemName)}
                                    title={isItemBlacklisted(item._id) ? 'Remove from blacklist' : 'Add to blacklist'}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      cursor: 'pointer',
                                      fontSize: '1rem',
                                      padding: '2px',
                                      opacity: isItemBlacklisted(item._id) ? 1 : 0.4,
                                      transition: 'opacity 150ms ease'
                                    }}
                                  >
                                    {isItemBlacklisted(item._id) ? '🚫' : '⊘'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {item.allergens.length > 0 && (
                            <div className="menu-card__tags">
                              {item.allergens.map((a) => (
                                <span key={a} className="badge badge-allergen badge-sm">
                                  {getAllergenDisplay(a)}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="menu-card__macros">
                            <div className="menu-card__macro menu-card__macro--calories">
                              <span className="menu-card__macro-value">{item.calories}</span>
                              <span className="menu-card__macro-label">cal</span>
                            </div>
                            <div className="menu-card__macro menu-card__macro--protein">
                              <span className="menu-card__macro-value">{item.nutrition.protein}g</span>
                              <span className="menu-card__macro-label">protein</span>
                            </div>
                            <div className="menu-card__macro menu-card__macro--carbs">
                              <span className="menu-card__macro-value">{item.nutrition.carbs}g</span>
                              <span className="menu-card__macro-label">carbs</span>
                            </div>
                            <div className="menu-card__macro menu-card__macro--fats">
                              <span className="menu-card__macro-value">{item.nutrition.fats}g</span>
                              <span className="menu-card__macro-label">fats</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
