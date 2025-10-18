import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import '../App.css';

// Admin email is read from VITE_ADMIN_EMAIL environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

interface Restaurant {
  id: string | number;
  name: string;
  address?: string;
  cuisine?: string;
  rating?: number;
  description?: string;
  [key: string]: any; // Allow for other fields
}

export default function ManageRestaurants() {
  const { user, isLoaded } = useUser();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://54.193.99.243:3001';

  // Wait for user data to load
  if (!isLoaded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Check if user is the admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Fetch restaurants from API
  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Handle different response formats
        const restaurantList = Array.isArray(data) ? data : data.restaurants || [];
        setRestaurants(restaurantList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching restaurants:', err);
        setError(err.message || 'Failed to load restaurants');
        setLoading(false);
      });
  }, [API_BASE]);

  return (
    <div className="page-root">
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Link to="/admin" className="btn">
            ← Back to Admin
          </Link>
        </div>
        <h1>Manage Restaurants</h1>
        <p style={{ color: '#666' }}>
          View and manage all restaurants in the database
        </p>
      </header>

      <main>
        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ padding: '2rem', border: '2px solid #ff4444' }}>
            <h3 style={{ color: '#ff4444', marginTop: 0 }}>Error</h3>
            <p>{error}</p>
            <button 
              className="btn primary" 
              style={{ marginTop: '1rem' }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No restaurants found</h3>
            <p style={{ color: '#666' }}>The database doesn't contain any restaurant entries yet.</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f7f8ff', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: '600' }}>
                Total Restaurants: <span style={{ color: '#605bfd' }}>{restaurants.length}</span>
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {restaurants.map((restaurant, index) => (
                <div key={restaurant.id || index} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#222' }}>
                        {restaurant.name || 'Unnamed Restaurant'}
                      </h3>
                      {restaurant.cuisine && (
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: '#605bfd',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          {restaurant.cuisine}
                        </span>
                      )}
                    </div>
                    {restaurant.rating && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#605bfd'
                      }}>
                        ⭐ {restaurant.rating}
                      </div>
                    )}
                  </div>

                  {restaurant.address && (
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      📍 {restaurant.address}
                    </p>
                  )}

                  {restaurant.description && (
                    <p style={{ margin: '0.75rem 0 0 0', color: '#555' }}>
                      {restaurant.description}
                    </p>
                  )}

                  {restaurant.id && (
                    <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
                      ID: {restaurant.id}
                    </p>
                  )}

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ fontSize: '0.9rem' }}>
                      Edit
                    </button>
                    <button className="btn" style={{ fontSize: '0.9rem', background: '#ffebee', color: '#c62828' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center' }}>
        <Link to="/admin" className="btn">
          Back to Admin Dashboard
        </Link>
      </footer>
    </div>
  );
}
