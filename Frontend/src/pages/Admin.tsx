import { useUser } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import '../style/home/Home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Admin email is read from VITE_ADMIN_EMAIL environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function Admin() {
  const { user, isLoaded } = useUser();

  // Wait for user data to load
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

  // Check if user is the admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <header className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Welcome, {user?.firstName || user?.primaryEmailAddress?.emailAddress}
          </p>
        </header>

        <div className="grid-2" style={{ marginTop: 'var(--space-8)' }}>
          {/* Restaurant Management Card */}
          <div className="card card-interactive">
            <div className="feature-card__icon" style={{ marginBottom: 'var(--space-4)' }}>
              🍽️
            </div>
            <h3 className="card-title">Restaurant Management</h3>
            <p className="card-subtitle" style={{ marginBottom: 'var(--space-4)' }}>
              Add, edit, or remove restaurants from the platform.
            </p>
            <Link to="/admin/restaurants" className="btn btn-primary">
              Manage Restaurants
            </Link>
          </div>

          {/* Analytics Card (placeholder for future) */}
          <div className="card" style={{ opacity: 0.6 }}>
            <div className="feature-card__icon" style={{ marginBottom: 'var(--space-4)' }}>
              📊
            </div>
            <h3 className="card-title">Analytics</h3>
            <p className="card-subtitle" style={{ marginBottom: 'var(--space-4)' }}>
              View usage statistics and insights.
            </p>
            <span className="badge badge-default">Coming Soon</span>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-12)', textAlign: 'center' }}>
          <Link to="/" className="btn btn-ghost">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
