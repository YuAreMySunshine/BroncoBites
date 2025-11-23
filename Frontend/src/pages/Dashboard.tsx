import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
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

const MEAL_ICONS: Record<string, string> = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snack: '🍎'
};

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

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (date.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Navigate dates
  const goToDate = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Fetch data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch in parallel
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

    // Sort: favorites first
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
        <main className="container" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Loading...</p>
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
      <main className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header__left">
            <h1 className="page-title">Meal Plan</h1>
            <div className="date-nav">
              <button className="date-nav__btn" onClick={() => goToDate(-1)}>
                ←
              </button>
              <span className="date-nav__current">{formatDate(currentDate)}</span>
              <button className="date-nav__btn" onClick={() => goToDate(1)}>
                →
              </button>
              {currentDate !== new Date().toISOString().split('T')[0] && (
                <span className="date-nav__today" onClick={goToToday}>
                  Today
                </span>
              )}
            </div>
          </div>
          <div className="dashboard-header__right">
            <button
              className="btn btn-secondary"
              onClick={generatePlan}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Auto-Generate'}
            </button>
            {mealPlan?.exists && (
              <button className="btn btn-ghost" onClick={clearPlan}>
                Clear Plan
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
              Loading your meal plan...
            </p>
          </div>
        ) : (
          <>
            {/* Goals Summary */}
            {userGoals ? (
              <div className="goals-summary">
                <div className="goals-summary__header">
                  <h2 className="goals-summary__title">Daily Progress</h2>
                  <span className={`plan-status plan-status--${mealPlan?.status || 'draft'}`}>
                    {mealPlan?.status || 'draft'}
                  </span>
                </div>
                <div className="goals-summary__grid">
                  {/* Calories */}
                  <div className="goal-item">
                    <div className="goal-item__label">Calories</div>
                    <div className="goal-item__value goal-item__value--calories">
                      {totals.calories}
                    </div>
                    <div className="goal-item__target">/ {userGoals.calories}</div>
                    <div className="goal-item__progress">
                      <div
                        className={`goal-item__progress-fill goal-item__progress-fill--calories ${
                          totals.calories > userGoals.calories ? 'goal-item__progress-fill--over' : ''
                        }`}
                        style={{ width: `${getProgress(totals.calories, userGoals.calories)}%` }}
                      />
                    </div>
                  </div>
                  {/* Protein */}
                  <div className="goal-item">
                    <div className="goal-item__label">Protein</div>
                    <div className="goal-item__value goal-item__value--protein">
                      {totals.protein}g
                    </div>
                    <div className="goal-item__target">/ {userGoals.protein}g</div>
                    <div className="goal-item__progress">
                      <div
                        className="goal-item__progress-fill goal-item__progress-fill--protein"
                        style={{ width: `${getProgress(totals.protein, userGoals.protein)}%` }}
                      />
                    </div>
                  </div>
                  {/* Carbs */}
                  <div className="goal-item">
                    <div className="goal-item__label">Carbs</div>
                    <div className="goal-item__value goal-item__value--carbs">
                      {totals.carbs}g
                    </div>
                    <div className="goal-item__target">/ {userGoals.carbs}g</div>
                    <div className="goal-item__progress">
                      <div
                        className="goal-item__progress-fill goal-item__progress-fill--carbs"
                        style={{ width: `${getProgress(totals.carbs, userGoals.carbs)}%` }}
                      />
                    </div>
                  </div>
                  {/* Fats */}
                  <div className="goal-item">
                    <div className="goal-item__label">Fats</div>
                    <div className="goal-item__value goal-item__value--fats">
                      {totals.fats}g
                    </div>
                    <div className="goal-item__target">/ {userGoals.fats}g</div>
                    <div className="goal-item__progress">
                      <div
                        className="goal-item__progress-fill goal-item__progress-fill--fats"
                        style={{ width: `${getProgress(totals.fats, userGoals.fats)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
                Set up your nutrition goals in <a href="/settings">Settings</a> to see progress tracking.
              </div>
            )}

            {/* Meal Sections */}
            <div className="meal-sections">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(category => {
                const items = getItemsByCategory(category);
                const categoryCalories = items.reduce((sum, item) => sum + item.calories, 0);

                return (
                  <div key={category} className="meal-section">
                    <div className="meal-section__header">
                      <h3 className="meal-section__title">
                        <span className="meal-section__icon">{MEAL_ICONS[category]}</span>
                        {category}
                      </h3>
                      <span className="meal-section__calories">{categoryCalories} cal</span>
                    </div>
                    <div className="meal-section__content">
                      {items.length === 0 ? (
                        <div className="meal-section__empty">
                          <p className="meal-section__empty-text">No items added yet</p>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setAddCategory(category);
                              setShowAddModal(true);
                            }}
                          >
                            + Add Item
                          </button>
                        </div>
                      ) : (
                        <>
                          {items.map(item => (
                            <div key={item._id} className="meal-item">
                              <div className="meal-item__info">
                                <div className="meal-item__name">{item.name}</div>
                                <div className="meal-item__restaurant">{item.restaurantName}</div>
                              </div>
                              <div className="meal-item__macros">
                                <div className="meal-item__macro">
                                  <span className="meal-item__macro-value">{item.calories}</span>
                                  <span className="meal-item__macro-label">cal</span>
                                </div>
                                <div className="meal-item__macro">
                                  <span className="meal-item__macro-value">{item.protein}g</span>
                                  <span className="meal-item__macro-label">pro</span>
                                </div>
                              </div>
                              <button
                                className="meal-item__remove"
                                onClick={() => item._id && removeItem(item._id)}
                                title="Remove item"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginTop: 'var(--space-2)' }}
                            onClick={() => {
                              setAddCategory(category);
                              setShowAddModal(true);
                            }}
                          >
                            + Add More
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="add-item-modal" onClick={() => setShowAddModal(false)}>
            <div className="add-item-modal__content" onClick={e => e.stopPropagation()}>
              <div className="add-item-modal__header">
                <h2 className="add-item-modal__title">Add to {addCategory}</h2>
                <button
                  className="add-item-modal__close"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="add-item-modal__search">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="add-item-modal__list">
                {getFilteredItems().slice(0, 50).map(({ item, restaurant, isFavorite }) => (
                  <div
                    key={`${restaurant._id}-${item._id}`}
                    className={`add-item-modal__item ${isFavorite ? 'add-item-modal__item--favorite' : ''}`}
                    onClick={() => addItem(item, restaurant)}
                  >
                    <div className="add-item-modal__item-info">
                      <div className="add-item-modal__item-name">
                        {isFavorite && '⭐ '}{item.itemName}
                      </div>
                      <div className="add-item-modal__item-restaurant">{restaurant.name}</div>
                    </div>
                    <div className="add-item-modal__item-macros">
                      {item.calories} cal · {item.nutrition?.protein || 0}g protein
                    </div>
                  </div>
                ))}
                {getFilteredItems().length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No items found
                  </p>
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
