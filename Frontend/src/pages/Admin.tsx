import { useUser } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import '../App.css';

// Admin email is read from VITE_ADMIN_EMAIL environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function Admin() {
  const { user, isLoaded } = useUser();

  // Wait for user data to load
  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
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

  return (
    <div className="page-root">
      <div className="container">
        <header className="admin-header" style={{ marginBottom: '2rem', padding: '2rem 0' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#666' }}>
          Welcome, {user?.firstName || user?.primaryEmailAddress?.emailAddress}
        </p>
      </header>

      <main>
        <section className="admin-section" style={{ marginBottom: '3rem' }}>
          <h2>User Management</h2>
          <div className="card">
            <p>Manage registered users, view activity, and moderate content.</p>
            <button className="btn primary" style={{ marginTop: '1rem' }}>
              View Users
            </button>
          </div>
        </section>

        <section className="admin-section" style={{ marginBottom: '3rem' }}>
          <h2>Restaurant Management</h2>
          <div className="card">
            <p>Add, edit, or remove restaurants from the platform.</p>
            <Link to="/admin/restaurants" className="btn primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
              Manage Restaurants
            </Link>
          </div>
        </section>

        <section className="admin-section" style={{ marginBottom: '3rem' }}>
          <h2>Reviews & Moderation</h2>
          <div className="card">
            <p>Review flagged content and moderate user reviews.</p>
            <button className="btn primary" style={{ marginTop: '1rem' }}>
              View Reports
            </button>
          </div>
        </section>

        <section className="admin-section">
          <h2>Analytics</h2>
          <div className="card">
            <p>View platform statistics and user engagement metrics.</p>
            <button className="btn primary" style={{ marginTop: '1rem' }}>
              View Analytics
            </button>
          </div>
        </section>
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem 0' }}>
        <Link to="/" className="btn" style={{ textDecoration: 'none' }}>
          Back to Home
        </Link>
      </footer>
      </div>
    </div>
  );
}
