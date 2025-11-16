import { useUser } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import '../style/home/Home.css';
import Navbar from '../components/Navbar';

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
    <div className="bb">
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem', padding: '2rem 0' }}>
          <h1 style={{ color: 'var(--text)' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted, #b7c2d6)' }}>
            Welcome, {user?.firstName || user?.primaryEmailAddress?.emailAddress}
          </p>
        </header>

        <main>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--text)' }}>Restaurant Management</h2>
            <div className="card">
              <p>Add, edit, or remove restaurants from the platform.</p>
              <Link to="/admin/restaurants" className="btn primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
                Manage Restaurants
              </Link>
            </div>
          </section>
        </main>

        <footer style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <Link to="/" className="btn" style={{ textDecoration: 'none' }}>
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}
