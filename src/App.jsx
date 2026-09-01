import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { ChatBot } from './components/ChatBot';

import { HomePage } from './pages/HomePage';
import { MatchesPage } from './pages/MatchesPage';
import { MatchBookingPage } from './pages/MatchBookingPage';
import { EventsPage } from './pages/EventsPage';
import { EventBookingPage } from './pages/EventBookingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { TicketVerifyPage } from './pages/TicketVerifyPage';
import { VenuesPage } from './pages/VenuesPage';

export function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Certain pages like login or register have minimal header & footer built-in
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* Top Navbar */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Routed Page */}
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:id/book" element={<MatchBookingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id/book" element={<EventBookingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<MyTicketsPage />} />
          <Route path="/ticket/verify/:id" element={<TicketVerifyPage />} />
          <Route path="/ticket/verify/:bookingOrderId" element={<TicketVerifyPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      {/* Global AI ChatBot Assistant */}
      <ChatBot />

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Bottom Navigation on Mobile */}
      <BottomNav />

      {/* Footer (unless on auth pages that have custom footer) */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
