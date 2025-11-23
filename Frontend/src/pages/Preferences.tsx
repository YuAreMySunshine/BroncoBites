import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import {
  Heart,
  Star,
  Ban,
  Store,
  UtensilsCrossed,
  X,
  Calendar,
  ChevronRight
} from 'lucide-react';
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

  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/preferences`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setPreferences(await res.json());
      } catch (err) {
        console.error('Error fetching preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user, API_BASE, getToken]);

  const removeFavoriteItem = async (item: FavoriteItem) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId: item.restaurantId, itemId: item.itemId, itemName: item.itemName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const removeBlacklistedItem = async (item: FavoriteItem) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId: item.restaurantId, itemId: item.itemId, itemName: item.itemName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error removing from blacklist:', err);
    }
  };

  const removeFavoriteRestaurant = async (restaurant: FavoriteRestaurant) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/favorite/restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId: restaurant.restaurantId, restaurantName: restaurant.restaurantName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error removing favorite restaurant:', err);
    }
  };

  const removeBlacklistedRestaurant = async (restaurant: FavoriteRestaurant) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/preferences/blacklist/restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId: restaurant.restaurantId, restaurantName: restaurant.restaurantName })
      });
      if (res.ok) setPreferences(await res.json());
    } catch (err) {
      console.error('Error removing from blacklist:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isLoaded) {
    return (
      <div className="page">
        <Navbar />
        <main className="preferences-main">
          <div className="preferences-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
      <main className="preferences-main">
        <div className="preferences-container">
          <header className="preferences-header">
            <div className="preferences-header__content">
              <h1 className="preferences-title">
                <Heart size={32} className="preferences-title-icon" />
                Preferences
              </h1>
              <p className="preferences-subtitle">Manage your favorites and blacklisted items</p>
            </div>
          </header>

          {/* Tabs */}
          <div className="preferences-tabs">
            <button
              className={`pref-tab ${activeTab === 'favorites' ? 'pref-tab--active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <Star size={18} />
              <span>Favorites</span>
              <span className="pref-tab__count">{favoriteItemsCount + favoriteRestaurantsCount}</span>
            </button>
            <button
              className={`pref-tab ${activeTab === 'blacklist' ? 'pref-tab--active' : ''}`}
              onClick={() => setActiveTab('blacklist')}
            >
              <Ban size={18} />
              <span>Blacklist</span>
              <span className="pref-tab__count">{blacklistedItemsCount + blacklistedRestaurantsCount}</span>
            </button>
          </div>

          {loading ? (
            <div className="preferences-loading">
              <div className="spinner"></div>
              <p>Loading preferences...</p>
            </div>
          ) : (
            <div className="preferences-content">
              {activeTab === 'favorites' && (
                <>
                  {/* Favorite Items */}
                  <section className="pref-section">
                    <div className="pref-section__header">
                      <div className="pref-section__icon pref-section__icon--items">
                        <UtensilsCrossed size={20} />
                      </div>
                      <div className="pref-section__title-group">
                        <h2 className="pref-section__title">Favorite Items</h2>
                        <span className="pref-section__count">{favoriteItemsCount} items</span>
                      </div>
                    </div>

                    {favoriteItemsCount === 0 ? (
                      <div className="pref-empty">
                        <Star size={40} className="pref-empty__icon" />
                        <h3>No favorite items yet</h3>
                        <p>Browse the menu and star items you love</p>
                        <Link to="/menus" className="pref-empty__link">
                          Browse Menus <ChevronRight size={16} />
                        </Link>
                      </div>
                    ) : (
                      <div className="pref-list">
                        {preferences?.favoriteItems.map(item => (
                          <div key={item.itemId} className="pref-item">
                            <div className="pref-item__icon">
                              <Star size={16} fill="currentColor" />
                            </div>
                            <div className="pref-item__content">
                              <span className="pref-item__name">{item.itemName}</span>
                              <span className="pref-item__date">
                                <Calendar size={12} />
                                Added {formatDate(item.addedAt)}
                              </span>
                            </div>
                            <button
                              className="pref-item__remove"
                              onClick={() => removeFavoriteItem(item)}
                              title="Remove from favorites"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Favorite Restaurants */}
                  <section className="pref-section">
                    <div className="pref-section__header">
                      <div className="pref-section__icon pref-section__icon--restaurants">
                        <Store size={20} />
                      </div>
                      <div className="pref-section__title-group">
                        <h2 className="pref-section__title">Favorite Restaurants</h2>
                        <span className="pref-section__count">{favoriteRestaurantsCount} restaurants</span>
                      </div>
                    </div>

                    {favoriteRestaurantsCount === 0 ? (
                      <div className="pref-empty">
                        <Store size={40} className="pref-empty__icon" />
                        <h3>No favorite restaurants yet</h3>
                        <p>Star restaurants to find them quickly</p>
                        <Link to="/menus" className="pref-empty__link">
                          Browse Menus <ChevronRight size={16} />
                        </Link>
                      </div>
                    ) : (
                      <div className="pref-list">
                        {preferences?.favoriteRestaurants.map(restaurant => (
                          <div key={restaurant.restaurantId} className="pref-item">
                            <div className="pref-item__icon pref-item__icon--restaurant">
                              <Store size={16} />
                            </div>
                            <div className="pref-item__content">
                              <span className="pref-item__name">{restaurant.restaurantName}</span>
                              <span className="pref-item__date">
                                <Calendar size={12} />
                                Added {formatDate(restaurant.addedAt)}
                              </span>
                            </div>
                            <button
                              className="pref-item__remove"
                              onClick={() => removeFavoriteRestaurant(restaurant)}
                              title="Remove from favorites"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {activeTab === 'blacklist' && (
                <>
                  {/* Blacklisted Items */}
                  <section className="pref-section">
                    <div className="pref-section__header">
                      <div className="pref-section__icon pref-section__icon--blacklist">
                        <Ban size={20} />
                      </div>
                      <div className="pref-section__title-group">
                        <h2 className="pref-section__title">Blacklisted Items</h2>
                        <span className="pref-section__count">{blacklistedItemsCount} items</span>
                      </div>
                    </div>

                    {blacklistedItemsCount === 0 ? (
                      <div className="pref-empty">
                        <Ban size={40} className="pref-empty__icon pref-empty__icon--blacklist" />
                        <h3>No blacklisted items</h3>
                        <p>Items you blacklist won't appear in auto-generated meal plans</p>
                      </div>
                    ) : (
                      <div className="pref-list">
                        {preferences?.blacklistedItems.map(item => (
                          <div key={item.itemId} className="pref-item pref-item--blacklist">
                            <div className="pref-item__icon pref-item__icon--blacklist">
                              <Ban size={16} />
                            </div>
                            <div className="pref-item__content">
                              <span className="pref-item__name">{item.itemName}</span>
                              <span className="pref-item__date">
                                <Calendar size={12} />
                                Added {formatDate(item.addedAt)}
                              </span>
                            </div>
                            <button
                              className="pref-item__remove"
                              onClick={() => removeBlacklistedItem(item)}
                              title="Remove from blacklist"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Blacklisted Restaurants */}
                  <section className="pref-section">
                    <div className="pref-section__header">
                      <div className="pref-section__icon pref-section__icon--blacklist">
                        <Store size={20} />
                      </div>
                      <div className="pref-section__title-group">
                        <h2 className="pref-section__title">Blacklisted Restaurants</h2>
                        <span className="pref-section__count">{blacklistedRestaurantsCount} restaurants</span>
                      </div>
                    </div>

                    {blacklistedRestaurantsCount === 0 ? (
                      <div className="pref-empty">
                        <Store size={40} className="pref-empty__icon pref-empty__icon--blacklist" />
                        <h3>No blacklisted restaurants</h3>
                        <p>Restaurants you blacklist won't appear in auto-generated meal plans</p>
                      </div>
                    ) : (
                      <div className="pref-list">
                        {preferences?.blacklistedRestaurants.map(restaurant => (
                          <div key={restaurant.restaurantId} className="pref-item pref-item--blacklist">
                            <div className="pref-item__icon pref-item__icon--blacklist">
                              <Store size={16} />
                            </div>
                            <div className="pref-item__content">
                              <span className="pref-item__name">{restaurant.restaurantName}</span>
                              <span className="pref-item__date">
                                <Calendar size={12} />
                                Added {formatDate(restaurant.addedAt)}
                              </span>
                            </div>
                            <button
                              className="pref-item__remove"
                              onClick={() => removeBlacklistedRestaurant(restaurant)}
                              title="Remove from blacklist"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
