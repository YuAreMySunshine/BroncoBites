import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Ban,
  Clock,
  Leaf,
  Flame,
  Beef,
  Wheat,
  Droplets,
  AlertTriangle,
  Store,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import '../style/home/Home.css';
import '../style/pages/Menus.css';
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

const allergenMap: Record<string, string> = {
  'E': 'Egg',
  'F': 'Fish',
  'M': 'Milk',
  'P': 'Peanuts',
  'SF': 'Shellfish',
  'S': 'Soy',
  'T': 'Tree Nuts',
  'W': 'Wheat',
  'SS': 'Sesame'
};

export default function RestaurantMenus() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);

  // Nutrition filters
  const [caloriesMin, setCaloriesMin] = useState<number | ''>('');
  const [caloriesMax, setCaloriesMax] = useState<number | ''>('');
  const [proteinMin, setProteinMin] = useState<number | ''>('');
  const [proteinMax, setProteinMax] = useState<number | ''>('');
  const [carbsMin, setCarbsMin] = useState<number | ''>('');
  const [carbsMax, setCarbsMax] = useState<number | ''>('');
  const [fatsMin, setFatsMin] = useState<number | ''>('');
  const [fatsMax, setFatsMax] = useState<number | ''>('');

  const [excludedAllergens, setExcludedAllergens] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

  const isItemFavorited = (itemId: string) =>
    preferences?.favoriteItems.some(i => i.itemId === itemId) || false;
  const isItemBlacklisted = (itemId: string) =>
    preferences?.blacklistedItems.some(i => i.itemId === itemId) || false;
  const isRestaurantFavorited = (restaurantId: string) =>
    preferences?.favoriteRestaurants.some(r => r.restaurantId === restaurantId) || false;
  const isRestaurantBlacklisted = (restaurantId: string) =>
    preferences?.blacklistedRestaurants.some(r => r.restaurantId === restaurantId) || false;

  const toggleFavoriteItem = async (restaurantId: string, itemId: string, itemName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId, itemId, itemName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const toggleBlacklistItem = async (restaurantId: string, itemId: string, itemName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId, itemId, itemName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error toggling blacklist:', err);
    }
  };

  const toggleFavoriteRestaurant = async (restaurantId: string, restaurantName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId, restaurantName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error toggling favorite restaurant:', err);
    }
  };

  const toggleBlacklistRestaurant = async (restaurantId: string, restaurantName: string) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId, restaurantName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error toggling blacklist restaurant:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantsRes = await fetch(`${API_BASE}/api/restaurants`);
        if (!restaurantsRes.ok) throw new Error(`HTTP error! status: ${restaurantsRes.status}`);
        const data = await restaurantsRes.json();
        setRestaurants(Array.isArray(data) ? data : data.restaurants || []);

        if (user) {
          const token = await getToken();
          const prefsRes = await fetch(`${API_BASE}/api/preferences`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (prefsRes.ok) setPreferences(await prefsRes.json());
        }
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE, user, getToken]);

  const filteredRestaurants = restaurants.map((restaurant) => {
    const filteredItems = restaurant.menuItems.filter((item) => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVegetarian = !filterVegetarian || item.vegetarian;
      const matchesCalories = (caloriesMin === '' || item.calories >= caloriesMin) &&
        (caloriesMax === '' || item.calories <= caloriesMax);
      const matchesProtein = (proteinMin === '' || item.nutrition.protein >= proteinMin) &&
        (proteinMax === '' || item.nutrition.protein <= proteinMax);
      const matchesCarbs = (carbsMin === '' || item.nutrition.carbs >= carbsMin) &&
        (carbsMax === '' || item.nutrition.carbs <= carbsMax);
      const matchesFats = (fatsMin === '' || item.nutrition.fats >= fatsMin) &&
        (fatsMax === '' || item.nutrition.fats <= fatsMax);
      const hasExcludedAllergen = item.allergens.some(allergen => excludedAllergens.has(allergen));

      return matchesSearch && matchesVegetarian && matchesCalories &&
        matchesProtein && matchesCarbs && matchesFats && !hasExcludedAllergen;
    });
    return { ...restaurant, menuItems: filteredItems };
  })
    .filter((restaurant) => restaurant.menuItems.length > 0 || searchTerm === '')
    .sort((a, b) => b.menuItems.length - a.menuItems.length);

  const allAllergens = Array.from(
    new Set(restaurants.flatMap(r => r.menuItems.flatMap(item => item.allergens)))
  ).sort();

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

  const totalItems = filteredRestaurants.reduce((sum, r) => sum + r.menuItems.length, 0);

  return (
    <div className="page">
      <Navbar />
      <main className="menus-main">
        <div className="menus-container">
          {/* Header */}
          <header className="menus-header">
            <div className="menus-header__content">
              <h1 className="menus-title">
                <UtensilsCrossed size={32} className="menus-title-icon" />
                Campus Menus
              </h1>
              <p className="menus-subtitle">
                Discover {restaurants.length} restaurants and {totalItems} menu items
              </p>
            </div>
          </header>

          {/* Search & Filters */}
          <section className="search-section">
            <div className="search-bar">
              <Search size={20} className="search-bar__icon" />
              <input
                type="text"
                placeholder="Search for food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar__input"
              />
              {searchTerm && (
                <button className="search-bar__clear" onClick={() => setSearchTerm('')}>
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="filter-actions">
              <button
                className={`filter-toggle ${showFilters ? 'filter-toggle--active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={18} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button className="filter-reset" onClick={clearAllFilters}>
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="filter-panel">
                {/* Quick Filters */}
                <div className="filter-group">
                  <h4 className="filter-group__title">Quick Filters</h4>
                  <div className="filter-chips">
                    <button
                      className={`filter-chip ${filterVegetarian ? 'filter-chip--active' : ''}`}
                      onClick={() => setFilterVegetarian(!filterVegetarian)}
                    >
                      <Leaf size={14} />
                      Vegetarian
                    </button>
                  </div>
                </div>

                {/* Nutrition Ranges */}
                <div className="filter-group">
                  <h4 className="filter-group__title">Nutrition Ranges</h4>
                  <div className="nutrition-filters">
                    <div className="nutrition-filter">
                      <label><Flame size={14} /> Calories</label>
                      <div className="range-inputs">
                        <input type="number" placeholder="Min" value={caloriesMin}
                          onChange={(e) => setCaloriesMin(e.target.value ? Number(e.target.value) : '')} />
                        <span>-</span>
                        <input type="number" placeholder="Max" value={caloriesMax}
                          onChange={(e) => setCaloriesMax(e.target.value ? Number(e.target.value) : '')} />
                      </div>
                    </div>
                    <div className="nutrition-filter">
                      <label><Beef size={14} /> Protein (g)</label>
                      <div className="range-inputs">
                        <input type="number" placeholder="Min" value={proteinMin}
                          onChange={(e) => setProteinMin(e.target.value ? Number(e.target.value) : '')} />
                        <span>-</span>
                        <input type="number" placeholder="Max" value={proteinMax}
                          onChange={(e) => setProteinMax(e.target.value ? Number(e.target.value) : '')} />
                      </div>
                    </div>
                    <div className="nutrition-filter">
                      <label><Wheat size={14} /> Carbs (g)</label>
                      <div className="range-inputs">
                        <input type="number" placeholder="Min" value={carbsMin}
                          onChange={(e) => setCarbsMin(e.target.value ? Number(e.target.value) : '')} />
                        <span>-</span>
                        <input type="number" placeholder="Max" value={carbsMax}
                          onChange={(e) => setCarbsMax(e.target.value ? Number(e.target.value) : '')} />
                      </div>
                    </div>
                    <div className="nutrition-filter">
                      <label><Droplets size={14} /> Fats (g)</label>
                      <div className="range-inputs">
                        <input type="number" placeholder="Min" value={fatsMin}
                          onChange={(e) => setFatsMin(e.target.value ? Number(e.target.value) : '')} />
                        <span>-</span>
                        <input type="number" placeholder="Max" value={fatsMax}
                          onChange={(e) => setFatsMax(e.target.value ? Number(e.target.value) : '')} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allergens */}
                {allAllergens.length > 0 && (
                  <div className="filter-group">
                    <h4 className="filter-group__title">
                      <AlertTriangle size={14} /> Exclude Allergens
                    </h4>
                    <div className="filter-chips">
                      {allAllergens.map((allergen) => (
                        <button
                          key={allergen}
                          className={`filter-chip filter-chip--allergen ${excludedAllergens.has(allergen) ? 'filter-chip--active' : ''}`}
                          onClick={() => {
                            const newSet = new Set(excludedAllergens);
                            newSet.has(allergen) ? newSet.delete(allergen) : newSet.add(allergen);
                            setExcludedAllergens(newSet);
                          }}
                        >
                          {allergenMap[allergen] || allergen}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Content */}
          {loading ? (
            <div className="menus-loading">
              <div className="spinner"></div>
              <p>Loading delicious options...</p>
            </div>
          ) : error ? (
            <div className="menus-error">
              <AlertTriangle size={48} />
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="menus-empty">
              <Search size={48} />
              <h3>No items found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="restaurants-list">
              {filteredRestaurants.map((restaurant) => (
                <article key={restaurant._id} className="restaurant-card">
                  <div
                    className="restaurant-card__header"
                    onClick={() => setExpandedRestaurant(
                      expandedRestaurant === restaurant._id ? null : restaurant._id
                    )}
                  >
                    <div className="restaurant-card__info">
                      <div className="restaurant-card__icon">
                        <Store size={24} />
                      </div>
                      <div className="restaurant-card__details">
                        <h2 className="restaurant-card__name">{restaurant.name}</h2>
                        <div className="restaurant-card__meta">
                          <span className={`status-badge ${restaurant.isOpen ? 'status-badge--open' : 'status-badge--closed'}`}>
                            <Clock size={12} />
                            {restaurant.isOpen ? 'Open' : 'Closed'}
                          </span>
                          <span className="item-count">{restaurant.menuItems.length} items</span>
                        </div>
                      </div>
                    </div>

                    <div className="restaurant-card__actions">
                      {user && (
                        <>
                          <button
                            className={`action-icon ${isRestaurantFavorited(restaurant._id) ? 'action-icon--active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleFavoriteRestaurant(restaurant._id, restaurant.name); }}
                            title="Favorite"
                          >
                            <Star size={18} fill={isRestaurantFavorited(restaurant._id) ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            className={`action-icon action-icon--ban ${isRestaurantBlacklisted(restaurant._id) ? 'action-icon--active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleBlacklistRestaurant(restaurant._id, restaurant.name); }}
                            title="Blacklist"
                          >
                            <Ban size={18} />
                          </button>
                        </>
                      )}
                      <div className="expand-icon">
                        {expandedRestaurant === restaurant._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {expandedRestaurant === restaurant._id && (
                    <div className="restaurant-card__body">
                      <div className="menu-items-grid">
                        {restaurant.menuItems.map((item, index) => (
                          <div key={item._id || index} className="menu-item-card">
                            <div className="menu-item-card__header">
                              <h4 className="menu-item-card__name">{item.itemName}</h4>
                              <div className="menu-item-card__badges">
                                {item.vegetarian && (
                                  <span className="veg-badge" title="Vegetarian">
                                    <Leaf size={14} />
                                  </span>
                                )}
                                {user && item._id && (
                                  <>
                                    <button
                                      className={`item-action ${isItemFavorited(item._id) ? 'item-action--favorited' : ''}`}
                                      onClick={() => toggleFavoriteItem(restaurant._id, item._id!, item.itemName)}
                                      title="Favorite"
                                    >
                                      <Star size={14} fill={isItemFavorited(item._id) ? 'currentColor' : 'none'} />
                                    </button>
                                    <button
                                      className={`item-action item-action--ban ${isItemBlacklisted(item._id) ? 'item-action--blacklisted' : ''}`}
                                      onClick={() => toggleBlacklistItem(restaurant._id, item._id!, item.itemName)}
                                      title="Blacklist"
                                    >
                                      <Ban size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {item.allergens.length > 0 && (
                              <div className="menu-item-card__allergens">
                                {item.allergens.map((a) => (
                                  <span key={a} className="allergen-tag">
                                    {allergenMap[a] || a}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="menu-item-card__macros">
                              <div className="macro macro--calories">
                                <Flame size={14} />
                                <span className="macro__value">{item.calories}</span>
                                <span className="macro__label">cal</span>
                              </div>
                              <div className="macro macro--protein">
                                <Beef size={14} />
                                <span className="macro__value">{item.nutrition.protein}g</span>
                                <span className="macro__label">protein</span>
                              </div>
                              <div className="macro macro--carbs">
                                <Wheat size={14} />
                                <span className="macro__value">{item.nutrition.carbs}g</span>
                                <span className="macro__label">carbs</span>
                              </div>
                              <div className="macro macro--fats">
                                <Droplets size={14} />
                                <span className="macro__value">{item.nutrition.fats}g</span>
                                <span className="macro__label">fats</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
