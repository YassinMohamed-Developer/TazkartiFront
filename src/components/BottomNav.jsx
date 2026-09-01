import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const BottomNav = () => {
  const location = useLocation();

  // Hide bottom nav on full screen flow pages like checkout or register wizard
  if (['/register', '/login', '/checkout'].includes(location.pathname)) {
    return null;
  }

  const items = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Events', path: '/events', icon: 'event' },
    { name: 'Tickets', path: '/tickets', icon: 'confirmation_number' },
    { name: 'Profile', path: '/dashboard', icon: 'account_circle' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-3 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 md:hidden">
      {items.map(item => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center font-label-sm text-[11px] tap-highlight-transparent active:bg-surface-container-low p-2 rounded-lg transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] mb-0.5 ${isActive ? 'fill text-primary' : ''}`}
            >
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
