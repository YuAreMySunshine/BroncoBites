import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  Plus,
  X,
  Search,
  Star,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Sun,
  Cloud,
  Moon,
  Apple,
  MapPin,
  AlertCircle,
  Settings
} from 'lucide-react';
import '../style/home/Home.css';
import '../style/pages/Dashboard.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface MealPlanItem {
  _id?: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  restaurantId?: string;
  restaurantName?: string;
  itemId?: string;
  vegetarian?: boolean;
  allergens?: string[];
}

interface MealPlan {
  _id?: string;
  userId: string;
  date: string;
  status: 'draft' | 'active' | 'completed';
  items: MealPlanItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  exists?: boolean;
}

interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MenuItem {
  _id: string;
  itemName: string;
  calories: number;
  nutrition: {
    protein: number;
    carbs: number;
    fats: number;
  };
  vegetarian?: boolean;
  allergens?: string[];
}

interface Restaurant {
  _id: string;
  name: string;
  menuItems: MenuItem[];
  isOpen?: boolean;
}

interface UserPreferences {
  favoriteItems: Array<{ itemId: string; restaurantId: string; itemName: string }>;
  blacklistedItems: Array<{ itemId: string }>;
}

const MEAL_CATEGORIES = [
  { key: 'Breakfast', label: 'Breakfast', icon: Sun, color: '#F59E0B' },
  { key: 'Lunch', label: 'Lunch', icon: Cloud, color: '#3B82F6' },
  { key: 'Dinner', label: 'Dinner', icon: Moon, color: '#8B5CF6' },
  { key: 'Snack', label: 'Snacks', icon: Apple, color: '#10B981' }
] as const;

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategory, setAddCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

  // Generate week dates for mini calendar
  const getWeekDates = () => {
    const current = new Date(currentDate + 'T00:00:00');
    const dayOfWeek = current.getDay();
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Navigate week
  const goToWeek = (direction: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + (direction * 7));
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  // Fetch data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [planRes, profileRes, restaurantsRes, prefsRes] = await Promise.all([
          fetch(`${API_BASE}/api/mealplans/date/${currentDate}`, { headers }),
          fetch(`${API_BASE}/api/users/profile`, { headers }),
          fetch(`${API_BASE}/api/restaurants`),
          fetch(`${API_BASE}/api/preferences`, { headers })
        ]);

        if (planRes.ok) {
          const planData = await planRes.json();
          setMealPlan(planData);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserGoals(profileData.goal);
        }

        if (restaurantsRes.ok) {
          const restaurantsData = await restaurantsRes.json();
          setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
        }

        if (prefsRes.ok) {
          const prefsData = await prefsRes.json();
          setPreferences(prefsData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, currentDate, API_BASE, getToken]);

  // Add item to meal plan
  const addItem = async (item: MenuItem, restaurant: Restaurant) => {
    try {
      const token = await getToken();
      const newItem: MealPlanItem = {
        name: item.itemName,
        category: addCategory,
        calories: item.calories,
        protein: item.nutrition?.protein || 0,
        carbs: item.nutrition?.carbs || 0,
        fats: item.nutrition?.fats || 0,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        itemId: item._id,
        vegetarian: item.vegetarian,
        allergens: item.allergens
      };

      const res = await fetch(`${API_BASE}/api/mealplans/date/${currentDate}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });

      if (res.ok) {
        const updatedPlan = await res.json();
        setMealPlan(updatedPlan);
        setShowAddModal(false);
        setSearchQuery('');
      }
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  // Remove item from meal plan
  const removeItem = async (itemId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/mealplans/date/${currentDate}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedPlan = await res.json();
        setMealPlan(updatedPlan);
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  // Generate meal plan
  const generatePlan = async () => {
    setGenerating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/mealplans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: currentDate })
      });

      if (res.ok) {
        const data = await res.json();
        setMealPlan(data.mealPlan);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to generate meal plan');
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Clear meal plan
  const clearPlan = async () => {
    if (!confirm('Are you sure you want to clear this meal plan?')) return;

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/mealplans/date/${currentDate}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setMealPlan({
          userId: user?.id || '',
          date: currentDate,
          status: 'draft',
          items: [],
          totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
          exists: false
        });
      }
    } catch (err) {
      console.error('Error clearing plan:', err);
    }
  };

  // Filter menu items for search
  const getFilteredItems = () => {
    const blacklistedIds = preferences?.blacklistedItems.map(i => i.itemId) || [];
    const favoriteIds = preferences?.favoriteItems.map(i => i.itemId) || [];

    const allItems: Array<{ item: MenuItem; restaurant: Restaurant; isFavorite: boolean }> = [];

    restaurants.forEach(restaurant => {
      restaurant.menuItems.forEach(item => {
        if (blacklistedIds.includes(item._id)) return;
        if (searchQuery && !item.itemName.toLowerCase().includes(searchQuery.toLowerCase())) return;

        allItems.push({
          item,
          restaurant,
          isFavorite: favoriteIds.includes(item._id)
        });
      });
    });

    return allItems.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  };

  // Get items by category
  const getItemsByCategory = (category: string) => {
    return mealPlan?.items.filter(item => item.category === category) || [];
  };

  // Calculate progress percentage
  const getProgress = (current: number, goal: number) => {
    if (!goal) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="page">
        <Navbar />
        <main className="dashboard-main">
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if not signed in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const totals = mealPlan?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  return (
    <div className="page">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Header Section */}
          <header className="dashboard-header">
            <div className="dashboard-header__title-section">
              <h1 className="dashboard-title">Meal Planner</h1>
              <p className="dashboard-subtitle">Plan your daily nutrition</p>
            </div>

            {/* Mini Calendar */}
            <div className="mini-calendar">
              <div className="mini-calendar__header">
                <button className="mini-calendar__nav" onClick={() => goToWeek(-1)} aria-label="Previous week">
                  <ChevronLeft size={16} />
                </button>
                <span className="mini-calendar__month">
                  {new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button className="mini-calendar__nav" onClick={() => goToWeek(1)} aria-label="Next week">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="mini-calendar__week">
                {weekDates.map(dateStr => {
                  const date = new Date(dateStr + 'T00:00:00');
                  const isSelected = dateStr === currentDate;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  return (
                    <button
                      key={dateStr}
                      className={`mini-calendar__day ${isSelected ? 'mini-calendar__day--selected' : ''} ${isToday ? 'mini-calendar__day--today' : ''}`}
                      onClick={() => setCurrentDate(dateStr)}
                    >
                      <span className="mini-calendar__day-name">
                        {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                      </span>
                      <span className="mini-calendar__day-num">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-actions">
              <button
                className="action-btn action-btn--generate"
                onClick={generatePlan}
                disabled={generating}
              >
                <Sparkles size={18} />
                {generating ? 'Generating...' : 'Auto-Generate'}
              </button>
              {mealPlan?.exists && (
                <button className="action-btn action-btn--clear" onClick={clearPlan}>
                  <Trash2 size={18} />
                  Clear
                </button>
              )}
            </div>
          </header>

          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Loading your meal plan...</p>
            </div>
          ) : (
            <>
              {/* Nutrition Overview */}
              {userGoals ? (
                <section className="nutrition-overview">
                  <div className="nutrition-card">
                    <div className="nutrition-card__icon nutrition-card__icon--calories">
                      <Flame size={24} />
                    </div>
                    <div className="nutrition-card__content">
                      <span className="nutrition-card__label">Calories</span>
                      <div className="nutrition-card__values">
                        <span className="nutrition-card__current">{totals.calories}</span>
                        <span className="nutrition-card__separator">/</span>
                        <span className="nutrition-card__goal">{userGoals.calories}</span>
                      </div>
                      <div className="nutrition-card__progress">
                        <div
                          className={`nutrition-card__progress-fill nutrition-card__progress-fill--calories ${
                            totals.calories > userGoals.calories ? 'nutrition-card__progress-fill--over' : ''
                          }`}
                          style={{ width: `${getProgress(totals.calories, userGoals.calories)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="nutrition-card">
                    <div className="nutrition-card__icon nutrition-card__icon--protein">
                      <Beef size={24} />
                    </div>
                    <div className="nutrition-card__content">
                      <span className="nutrition-card__label">Protein</span>
                      <div className="nutrition-card__values">
                        <span className="nutrition-card__current">{totals.protein}g</span>
                        <span className="nutrition-card__separator">/</span>
                        <span className="nutrition-card__goal">{userGoals.protein}g</span>
                      </div>
                      <div className="nutrition-card__progress">
                        <div
                          className="nutrition-card__progress-fill nutrition-card__progress-fill--protein"
                          style={{ width: `${getProgress(totals.protein, userGoals.protein)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="nutrition-card">
                    <div className="nutrition-card__icon nutrition-card__icon--carbs">
                      <Wheat size={24} />
                    </div>
                    <div className="nutrition-card__content">
                      <span className="nutrition-card__label">Carbs</span>
                      <div className="nutrition-card__values">
                        <span className="nutrition-card__current">{totals.carbs}g</span>
                        <span className="nutrition-card__separator">/</span>
                        <span className="nutrition-card__goal">{userGoals.carbs}g</span>
                      </div>
                      <div className="nutrition-card__progress">
                        <div
                          className="nutrition-card__progress-fill nutrition-card__progress-fill--carbs"
                          style={{ width: `${getProgress(totals.carbs, userGoals.carbs)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="nutrition-card">
                    <div className="nutrition-card__icon nutrition-card__icon--fats">
                      <Droplets size={24} />
                    </div>
                    <div className="nutrition-card__content">
                      <span className="nutrition-card__label">Fats</span>
                      <div className="nutrition-card__values">
                        <span className="nutrition-card__current">{totals.fats}g</span>
                        <span className="nutrition-card__separator">/</span>
                        <span className="nutrition-card__goal">{userGoals.fats}g</span>
                      </div>
                      <div className="nutrition-card__progress">
                        <div
                          className="nutrition-card__progress-fill nutrition-card__progress-fill--fats"
                          style={{ width: `${getProgress(totals.fats, userGoals.fats)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <div className="no-goals-banner">
                  <AlertCircle size={20} />
                  <span>Set up your nutrition goals in</span>
                  <Link to="/settings" className="no-goals-link">
                    <Settings size={16} />
                    Settings
                  </Link>
                  <span>to track your progress.</span>
                </div>
              )}

              {/* Meal Sections */}
              <section className="meals-grid">
                {MEAL_CATEGORIES.map(({ key, label, icon: Icon, color }) => {
                  const items = getItemsByCategory(key);
                  const categoryCalories = items.reduce((sum, item) => sum + item.calories, 0);

                  return (
                    <div key={key} className="meal-card">
                      <div className="meal-card__header" style={{ '--meal-color': color } as React.CSSProperties}>
                        <div className="meal-card__title">
                          <div className="meal-card__icon">
                            <Icon size={20} />
                          </div>
                          <h3>{label}</h3>
                        </div>
                        <span className="meal-card__calories">{categoryCalories} cal</span>
                      </div>

                      <div className="meal-card__body">
                        {items.length === 0 ? (
                          <div className="meal-card__empty">
                            <p>No items yet</p>
                            <button
                              className="add-meal-btn"
                              onClick={() => {
                                setAddCategory(key);
                                setShowAddModal(true);
                              }}
                            >
                              <Plus size={16} />
                              Add Item
                            </button>
                          </div>
                        ) : (
                          <div className="meal-card__items">
                            {items.map(item => (
                              <div key={item._id} className="meal-item">
                                <div className="meal-item__content">
                                  <span className="meal-item__name">{item.name}</span>
                                  <span className="meal-item__restaurant">
                                    <MapPin size={12} />
                                    {item.restaurantName}
                                  </span>
                                </div>
                                <div className="meal-item__stats">
                                  <span className="meal-item__cal">{item.calories} cal</span>
                                  <span className="meal-item__protein">{item.protein}g pro</span>
                                </div>
                                <button
                                  className="meal-item__remove"
                                  onClick={() => item._id && removeItem(item._id)}
                                  aria-label="Remove item"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              className="add-more-btn"
                              onClick={() => {
                                setAddCategory(key);
                                setShowAddModal(true);
                              }}
                            >
                              <Plus size={14} />
                              Add More
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}
        </div>

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal__header">
                <h2>Add to {addCategory}</h2>
                <button className="modal__close" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal__search">
                <Search size={18} className="modal__search-icon" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal__list">
                {getFilteredItems().slice(0, 50).map(({ item, restaurant, isFavorite }) => (
                  <div
                    key={`${restaurant._id}-${item._id}`}
                    className={`modal__item ${isFavorite ? 'modal__item--favorite' : ''}`}
                    onClick={() => addItem(item, restaurant)}
                  >
                    <div className="modal__item-info">
                      <span className="modal__item-name">
                        {isFavorite && <Star size={14} className="favorite-icon" />}
                        {item.itemName}
                      </span>
                      <span className="modal__item-restaurant">
                        <MapPin size={12} />
                        {restaurant.name}
                      </span>
                    </div>
                    <div className="modal__item-stats">
                      <span>{item.calories} cal</span>
                      <span>{item.nutrition?.protein || 0}g protein</span>
                    </div>
                  </div>
                ))}
                {getFilteredItems().length === 0 && (
                  <p className="modal__empty">No items found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
