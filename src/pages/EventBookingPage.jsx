import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../data/mockData';
import { useBooking } from '../context/BookingContext';

export const EventBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectEventBooking } = useBooking();

  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  const [selectedTier, setSelectedTier] = useState(event.tiers[0]);
  const [quantity, setQuantity] = useState(1);

  const totalPrice = selectedTier.price * quantity;

  const handleProceedToPayment = () => {
    selectEventBooking(event, selectedTier, quantity);
    navigate('/checkout');
  };

  return (
    <div className="flex-grow flex flex-col pt-8 pb-24 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full gap-8">
      {/* Stepper */}
      <div className="w-full flex items-center justify-between text-label-sm font-label-sm relative max-w-3xl mx-auto mb-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-container -z-10"></div>
        <Link to="/events" className="flex flex-col items-center gap-2 bg-background px-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary group-hover:bg-tertiary/20 group-hover:text-tertiary transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
          </div>
          <span className="text-secondary group-hover:text-tertiary transition-colors">Select Event</span>
        </Link>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-tertiary text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center font-bold">
            2
          </div>
          <span className="text-tertiary font-bold">Choose Tier</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2 opacity-50">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            3
          </div>
          <span className="text-secondary">Payment</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2 opacity-50">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            4
          </div>
          <span className="text-secondary">Confirmation</span>
        </div>
      </div>

      {/* Event Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm border border-surface-variant">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-tertiary/10 text-tertiary text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              {event.category}
            </span>
            <span className="text-xs text-secondary">{event.tag}</span>
          </div>
          <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">{event.title}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-secondary text-sm">
            <span className="material-symbols-outlined text-tertiary text-lg">calendar_today</span>
            <span>{event.date}, {event.time}</span>
            <span className="mx-2">•</span>
            <span className="material-symbols-outlined text-tertiary text-lg">location_on</span>
            <span>{event.venue}, {event.city}</span>
          </div>
        </div>

        <div className="w-32 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 hidden md:block">
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tier Options */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">loyalty</span>
            <span>Available Ticket Tiers & Categories</span>
          </h3>

          <div className="space-y-4">
            {event.tiers.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isSelected
                      ? 'border-tertiary bg-tertiary/5 shadow-md'
                      : 'border-surface-variant hover:border-tertiary/40'
                  }`}
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-tertiary bg-tertiary' : 'border-outline-variant'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <h4 className="font-body-md font-bold text-on-surface text-base">{tier.name}</h4>
                    </div>

                    {/* Perks List */}
                    <div className="pl-8 space-y-1">
                      {tier.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-secondary">
                          <span className="material-symbols-outlined text-pitch-green text-sm fill">check_circle</span>
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-left md:text-right pl-8 md:pl-0">
                    <span className="text-xs text-secondary block font-label-sm">Price per pass</span>
                    <span className="text-2xl font-bold text-tertiary">{tier.price} EGP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Quantity */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-2xl border border-surface-variant shadow-sm sticky top-24 space-y-6">
            <h3 className="font-headline-md text-lg font-bold text-on-surface border-b border-surface-variant pb-3">
              Booking Summary
            </h3>

            <div className="space-y-4">
              <div className="bg-surface p-4 rounded-xl border border-surface-variant space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-label-sm">Selected Tier</span>
                <h4 className="font-bold text-on-surface text-sm">{selectedTier.name}</h4>
                <p className="text-xs text-tertiary font-semibold">{selectedTier.price} EGP / ticket</p>
              </div>

              {/* Quantity Counter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-secondary block">Number of Tickets (Max 4)</label>
                <div className="flex items-center justify-between bg-surface-container-low border border-surface-variant rounded-xl p-2">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center justify-center text-on-surface hover:text-tertiary transition-colors disabled:opacity-40 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                  </button>
                  <span className="font-bold text-lg text-on-surface">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(4, prev + 1))}
                    disabled={quantity >= 4}
                    className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center justify-center text-on-surface hover:text-tertiary transition-colors disabled:opacity-40 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-3 border-t border-surface-variant text-xs text-secondary">
                <div className="flex justify-between">
                  <span>Subtotal ({quantity} tickets)</span>
                  <span>{totalPrice} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT & Service Fee (Included)</span>
                  <span>0 EGP</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-surface-variant flex justify-between items-center">
                <span className="font-bold text-on-surface">Total Amount</span>
                <span className="font-headline-md text-2xl font-bold text-tertiary">{totalPrice} EGP</span>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-tertiary hover:bg-tertiary-container text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <p className="text-center font-label-sm text-xs text-secondary flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Verified with Tazkarti Fan ID</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
