import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import BroncoBites from '../images/BroncoBites.png';
import '../style/components/Navbar.css';
import { useTheme } from '../context/ThemeContext';

// Admin email is read from VITE_ADMIN_EMAIL environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Check if the current user is the admin
  const isAdmin = isLoaded && user && user.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  // Helper to check if link is active
  const isActive = (path: string) => location.pathname === path;

  // Handle anchor navigation to home page sections
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();

    if (location.pathname === '/') {
      // Already on home page, just scroll to section
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to home page first, then scroll
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="site-header">
      <div className="brand">
        <Link to="/">
          <img src={BroncoBites} className="logo" alt="BroncoBites logo" />
          <h1>BroncoBites</h1>
        </Link>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <div className="nav-links">
          {/* Core app features - always visible */}
          <Link
            to="/dashboard"
            className={isActive('/dashboard') ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link
            to="/menus"
            className={isActive('/menus') ? 'active' : ''}
          >
            Menus
          </Link>
          <SignedIn>
            <Link
              to="/preferences"
              className={isActive('/preferences') ? 'active' : ''}
            >
              Preferences
            </Link>
            <Link
              to="/settings"
              className={isActive('/settings') ? 'active' : ''}
            >
              Settings
            </Link>
          </SignedIn>

          {/* Show About links only when signed out or on home page */}
          <SignedOut>
            <span className="nav-divider" />
            <a href="/#features" onClick={(e) => handleAnchorClick(e, 'features')}>Features</a>
            <a href="/#team" onClick={(e) => handleAnchorClick(e, 'team')}>Team</a>
          </SignedOut>

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link--admin ${isActive('/admin') ? 'active' : ''}`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="auth-controls">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

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
  );
}
