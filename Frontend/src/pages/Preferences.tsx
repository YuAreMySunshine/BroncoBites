import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import '../style/home/Home.css';
import '../style/pages/Preferences.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface FavoriteItem {
  restaurantId: string;
  itemId: string;
  itemName: string;
  addedAt: string;
}

interface FavoriteRestaurant {
  restaurantId: string;
  restaurantName: string;
  addedAt: string;
}

interface UserPreferences {
  userId: string;
  favoriteItems: FavoriteItem[];
  blacklistedItems: FavoriteItem[];
  favoriteRestaurants: FavoriteRestaurant[];
  blacklistedRestaurants: FavoriteRestaurant[];
}

type TabType = 'favorites' | 'blacklist';

export default function Preferences() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('favorites');

  const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

  // Fetch preferences
  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/preferences`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setPreferences(data);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user, API_BASE, getToken]);

  // Remove favorite item
  const removeFavoriteItem = async (item: FavoriteItem) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: item.restaurantId,
          itemId: item.itemId,
          itemName: item.itemName
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  // Remove blacklisted item
  const removeBlacklistedItem = async (item: FavoriteItem) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: item.restaurantId,
          itemId: item.itemId,
          itemName: item.itemName
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error removing from blacklist:', err);
    }
  };

  // Remove favorite restaurant
  const removeFavoriteRestaurant = async (restaurant: FavoriteRestaurant) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/restaurant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurant.restaurantId,
          restaurantName: restaurant.restaurantName
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error removing favorite restaurant:', err);
    }
  };

  // Remove blacklisted restaurant
  const removeBlacklistedRestaurant = async (restaurant: FavoriteRestaurant) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/restaurant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurant.restaurantId,
          restaurantName: restaurant.restaurantName
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (err) {
      console.error('Error removing from blacklist:', err);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const favoriteItemsCount = preferences?.favoriteItems.length || 0;
  const favoriteRestaurantsCount = preferences?.favoriteRestaurants.length || 0;
  const blacklistedItemsCount = preferences?.blacklistedItems.length || 0;
  const blacklistedRestaurantsCount = preferences?.blacklistedRestaurants.length || 0;

  return (
    <div className="page">
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: '900px' }}>
        <header className="page-header">
          <h1 className="page-title">Preferences</h1>
          <p className="page-subtitle">Manage your favorite and blacklisted items</p>
        </header>

        {/* Tabs */}
        <div className="preferences-tabs">
          <button
            className={`preferences-tab ${activeTab === 'favorites' ? 'preferences-tab--active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites ({favoriteItemsCount + favoriteRestaurantsCount})
          </button>
          <button
            className={`preferences-tab ${activeTab === 'blacklist' ? 'preferences-tab--active' : ''}`}
            onClick={() => setActiveTab('blacklist')}
          >
            Blacklist ({blacklistedItemsCount + blacklistedRestaurantsCount})
          </button>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
              Loading preferences...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'favorites' && (
              <>
                {/* Favorite Items */}
                <div className="preference-section">
                  <div className="preference-section__header">
                    <h2 className="preference-section__title">
                      <span>Favorite Items</span>
                      <span className="preference-section__count">{favoriteItemsCount}</span>
                    </h2>
                  </div>

                  {favoriteItemsCount === 0 ? (
                    <div className="preference-empty">
                      <div className="preference-empty__icon">⭐</div>
                      <h3 className="preference-empty__title">No favorite items yet</h3>
                      <p className="preference-empty__text">
                        Browse the <Link to="/menus">menu</Link> and click the star icon to add favorites
                      </p>
                    </div>
                  ) : (
                    <div className="preference-list">
                      {preferences?.favoriteItems.map(item => (
                        <div key={item.itemId} className="preference-item">
                          <div className="preference-item__info">
                            <div className="preference-item__name">{item.itemName}</div>
                            <div className="preference-item__meta">
                              Added {formatDate(item.addedAt)}
                            </div>
                          </div>
                          <div className="preference-item__actions">
                            <button
                              className="preference-item__btn preference-item__btn--remove"
                              onClick={() => removeFavoriteItem(item)}
                              title="Remove from favorites"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favorite Restaurants */}
                <div className="preference-section">
                  <div className="preference-section__header">
                    <h2 className="preference-section__title">
                      <span>Favorite Restaurants</span>
                      <span className="preference-section__count">{favoriteRestaurantsCount}</span>
                    </h2>
                  </div>

                  {favoriteRestaurantsCount === 0 ? (
                    <div className="preference-empty">
                      <div className="preference-empty__icon">🏪</div>
                      <h3 className="preference-empty__title">No favorite restaurants yet</h3>
                      <p className="preference-empty__text">
                        Browse the <Link to="/menus">menu</Link> and click the star icon on restaurants
                      </p>
                    </div>
                  ) : (
                    <div className="preference-list">
                      {preferences?.favoriteRestaurants.map(restaurant => (
                        <div key={restaurant.restaurantId} className="preference-item">
                          <div className="preference-item__info">
                            <div className="preference-item__name">{restaurant.restaurantName}</div>
                            <div className="preference-item__meta">
                              Added {formatDate(restaurant.addedAt)}
                            </div>
                          </div>
                          <div className="preference-item__actions">
                            <button
                              className="preference-item__btn preference-item__btn--remove"
                              onClick={() => removeFavoriteRestaurant(restaurant)}
                              title="Remove from favorites"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'blacklist' && (
              <>
                {/* Blacklisted Items */}
                <div className="preference-section">
                  <div className="preference-section__header">
                    <h2 className="preference-section__title">
                      <span>Blacklisted Items</span>
                      <span className="preference-section__count">{blacklistedItemsCount}</span>
                    </h2>
                  </div>

                  {blacklistedItemsCount === 0 ? (
                    <div className="preference-empty">
                      <div className="preference-empty__icon">🚫</div>
                      <h3 className="preference-empty__title">No blacklisted items</h3>
                      <p className="preference-empty__text">
                        Items you blacklist won't appear in auto-generated meal plans
                      </p>
                    </div>
                  ) : (
                    <div className="preference-list">
                      {preferences?.blacklistedItems.map(item => (
                        <div key={item.itemId} className="preference-item">
                          <div className="preference-item__info">
                            <div className="preference-item__name">{item.itemName}</div>
                            <div className="preference-item__meta">
                              Added {formatDate(item.addedAt)}
                            </div>
                          </div>
                          <div className="preference-item__actions">
                            <button
                              className="preference-item__btn preference-item__btn--remove"
                              onClick={() => removeBlacklistedItem(item)}
                              title="Remove from blacklist"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Blacklisted Restaurants */}
                <div className="preference-section">
                  <div className="preference-section__header">
                    <h2 className="preference-section__title">
                      <span>Blacklisted Restaurants</span>
                      <span className="preference-section__count">{blacklistedRestaurantsCount}</span>
                    </h2>
                  </div>

                  {blacklistedRestaurantsCount === 0 ? (
                    <div className="preference-empty">
                      <div className="preference-empty__icon">🏚️</div>
                      <h3 className="preference-empty__title">No blacklisted restaurants</h3>
                      <p className="preference-empty__text">
                        Restaurants you blacklist won't appear in auto-generated meal plans
                      </p>
                    </div>
                  ) : (
                    <div className="preference-list">
                      {preferences?.blacklistedRestaurants.map(restaurant => (
                        <div key={restaurant.restaurantId} className="preference-item">
                          <div className="preference-item__info">
                            <div className="preference-item__name">{restaurant.restaurantName}</div>
                            <div className="preference-item__meta">
                              Added {formatDate(restaurant.addedAt)}
                            </div>
                          </div>
                          <div className="preference-item__actions">
                            <button
                              className="preference-item__btn preference-item__btn--remove"
                              onClick={() => removeBlacklistedRestaurant(restaurant)}
                              title="Remove from blacklist"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
