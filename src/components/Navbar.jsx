import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Menu, X, Shield, QrCode, User, Ticket, Calendar, Sun, Moon, Laptop } from 'lucide-react';

export const Navbar = ({ onOpenSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // If this is minimal header mode on onboarding/auth pages
  if (isAuthPage) {
    const isLoginPage = location.pathname === '/login';
    return (
      <header className="w-full py-6 px-margin-mobile md:px-margin-desktop relative z-20 flex justify-between items-center max-w-max-width mx-auto">
        <Link to="/" className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary tracking-tight font-bold hover:opacity-90 transition-opacity">
          Tazkarti
        </Link>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isLoginPage ? (
            <Link
              to="/register"
              className="text-xs sm:text-sm font-bold text-primary hover:text-primary-container bg-surface-container-lowest border border-outline-variant/60 hover:border-primary/50 px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1"
            >
              <span>Register Fan ID</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold text-primary hover:text-primary-container bg-surface-container-lowest border border-outline-variant/60 hover:border-primary/50 px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="p-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:text-primary hover:border-primary/50 transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isDark ? (
              <span className="material-symbols-outlined text-[20px] text-amber-400">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-[20px] text-slate-700">dark_mode</span>
            )}
          </button>
        </div>
      </header>
    );
  }

  const navLinks = [
    { name: 'Sports', path: '/matches' },
    { name: 'Entertainment', path: '/events' },
    { name: 'Venues', path: '/venues' },
    { name: 'Schedule', path: '/matches' },
  ];

  return (
    <header className="bg-surface/80 dark:bg-surface/90 backdrop-blur-xl docked full-width top-0 sticky border-b border-outline-variant/30 shadow-sm z-50 transition-colors duration-200">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-headline-md font-headline-md font-bold text-primary hover:opacity-90 transition-all">
            Tazkarti
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-body-md text-body-md transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary font-semibold' : 'text-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full hover:bg-surface-container text-secondary hover:text-primary transition-colors flex items-center gap-1"
            title="Search matches and events"
          >
            <span className="material-symbols-outlined text-on-surface">search</span>
            <span className="hidden lg:inline text-xs text-secondary">Search...</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="p-2 rounded-full hover:bg-surface-container text-secondary hover:text-primary transition-all flex items-center justify-center group cursor-pointer"
          >
            {isDark ? (
              <span className="material-symbols-outlined text-amber-400 transition-transform duration-300">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-on-surface transition-transform duration-300">dark_mode</span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/tickets"
                className="hidden sm:flex items-center gap-1 text-secondary hover:text-primary p-2 text-sm font-medium"
              >
                <span className="material-symbols-outlined text-lg">confirmation_number</span>
                <span className="hidden md:inline">My Tickets</span>
              </Link>

              <Link
                to="/dashboard"
                className="bg-primary-container text-on-primary px-3 sm:px-4 py-2 rounded-lg font-label-sm text-xs sm:text-sm font-semibold scale-95 active:scale-90 transition-transform shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-1.5 hover:bg-primary"
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>My Fan ID</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                title="Sign Out"
                className="p-2 rounded-full hover:bg-surface-container text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-on-surface font-body-md text-sm px-3 py-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary font-body-md text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm"
              >
                Register Fan ID
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface hover:text-primary rounded-lg"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-surface-variant px-4 py-4 space-y-4">
          <div className="flex flex-col space-y-2">
            <Link
              to="/matches"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md font-medium text-on-surface hover:bg-surface-container flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-primary text-xl">sports_soccer</span>
              <span>Sports & Matches</span>
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md font-medium text-on-surface hover:bg-surface-container flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-tertiary text-xl">theater_comedy</span>
              <span>Entertainment & Concerts</span>
            </Link>
            <Link
              to="/venues"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md font-medium text-on-surface hover:bg-surface-container flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-golden-gate text-xl">stadium</span>
              <span>Stadiums & Venues</span>
            </Link>

            {/* Theme Selector inside mobile drawer */}
            <div className="pt-2 pb-1 border-t border-surface-variant">
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 px-3">
                Theme Appearance
              </div>
              <div className="grid grid-cols-3 gap-2 px-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    theme === 'light'
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'border-surface-variant text-secondary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-amber-500">light_mode</span>
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    theme === 'dark'
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'border-surface-variant text-secondary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-sky-400">dark_mode</span>
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    theme === 'system'
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'border-surface-variant text-secondary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">computer</span>
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md font-medium text-on-surface hover:bg-surface-container flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">confirmation_number</span>
                    <span>My Booked Tickets</span>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">Active</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md font-bold text-primary hover:bg-primary/10 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                  <span>Fan ID Pass & QR Code</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full px-3 py-2 rounded-md font-medium text-secondary hover:text-primary hover:bg-surface-container flex items-center gap-2 cursor-pointer text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-surface-variant flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 border border-outline-variant rounded-lg font-medium text-sm text-on-surface"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-primary text-white rounded-lg font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
