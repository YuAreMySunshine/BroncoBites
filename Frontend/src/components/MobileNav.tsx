import { useEffect } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../style/components/MobileNav.css';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = isLoaded && user && user.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;
  const isActive = (path: string) => location.pathname === path;

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {isOpen && <div className="mobile-nav__backdrop" onClick={onClose} />}
      <div className={`mobile-nav ${isOpen ? 'mobile-nav--open' : ''}`}>
        <div className="mobile-nav__header">
          <h2 className="mobile-nav__title">Menu</h2>
          <button
            className="mobile-nav__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-nav__links">
          <Link
            to="/menus"
            className={`mobile-nav__link ${isActive('/menus') ? 'mobile-nav__link--active' : ''}`}
          >
            Menus
          </Link>
          <SignedIn>
            <Link
              to="/dashboard"
              className={`mobile-nav__link ${isActive('/dashboard') ? 'mobile-nav__link--active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/preferences"
              className={`mobile-nav__link ${isActive('/preferences') ? 'mobile-nav__link--active' : ''}`}
            >
              Preferences
            </Link>
            <Link
              to="/settings"
              className={`mobile-nav__link ${isActive('/settings') ? 'mobile-nav__link--active' : ''}`}
            >
              Settings
            </Link>
          </SignedIn>

          {isAdmin && (
            <Link
              to="/admin"
              className={`mobile-nav__link mobile-nav__link--admin ${isActive('/admin') ? 'mobile-nav__link--active' : ''}`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="mobile-nav__footer">
          <button
            className="mobile-nav__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
          </button>

          <div className="mobile-nav__auth">
            <SignedOut>
              <SignInButton>
                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <div className="mobile-nav__user">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonBox: {
                        flexDirection: 'row-reverse',
                      },
                    },
                  }}
                  showName={true}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </>
  );
}
