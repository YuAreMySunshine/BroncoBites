import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import BroncoBites from '../images/BroncoBites.png';
import '../style/components/Navbar.css';

// Admin email is read from VITE_ADMIN_EMAIL environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function Navbar() {
  const { user, isLoaded } = useUser();

  // Check if the current user is the admin
  const isAdmin = isLoaded && user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  return (
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
          {isAdmin && (
            <Link to="/admin" style={{ color: '#4cc9f0', fontWeight: '600' }}>
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
            {user && (
              <span style={{ 
                fontSize: '0.85rem', 
                color: '#999', 
                marginRight: '0.75rem',
                fontFamily: 'monospace'
              }}>
                ID: {user.id}
              </span>
            )}
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
