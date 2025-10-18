import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { Link, Outlet } from 'react-router-dom';
import BroncoBites from '../images/BroncoBites.png';
import '../App.css';

// Admin email is read from VITE_ADMIN_EMAIL environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function Layout() {
  const { user, isLoaded } = useUser();

  // Check if the current user is the admin
  const isAdmin = isLoaded && user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  return (
    <div className="page-root">
      <header className="site-header">
        <div className="brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
            <img src={BroncoBites} className="logo" alt="BroncoBites logo" />
            <h1>BroncoBites</h1>
          </Link>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#team">Team</a>
            <a href="#contact">Contact</a>
            {isAdmin && (
              <Link to="/admin" style={{ color: '#605bfd', fontWeight: '600' }}>
                Admin
              </Link>
            )}
          </div>

          <div className="auth-controls">
            <SignedOut>
              <SignInButton>
                <button className="btn">Sign in</button>
              </SignInButton>
              <SignUpButton>
                <button className="btn">Sign up</button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer">
        <small>© {new Date().getFullYear()} BroncoBites — CS4800 Project</small>
      </footer>
    </div>
  );
}
