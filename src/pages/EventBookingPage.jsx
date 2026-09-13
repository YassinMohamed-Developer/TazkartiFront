import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getAllEntertainmentEvents } from '../services/authService';
import { useBooking } from '../context/BookingContext';

export const EventBookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectEventBooking } = useBooking();

  const [event, setEvent] = useState(location.state?.event || null);
  const [selectedTier, setSelectedTier] = useState(location.state?.event?.tiers?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(!location.state?.event);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    // If event was not passed in location.state or ID changed, fetch from API
    if (!event || String(event.id) !== String(id)) {
      setIsLoading(true);
      setError('');

      getAllEntertainmentEvents()
        .then((eventsList) => {
          if (!isMounted) return;

          const matchedEvent = eventsList.find(
            (e) =>
              String(e.id) === String(id) ||
              String(e.eventId) === String(id) ||
              `event-${eventsList.indexOf(e) + 1}` === String(id)
          ) || eventsList[0];

          if (matchedEvent) {
            setEvent(matchedEvent);
            setSelectedTier(matchedEvent.tiers?.[0] || null);
          } else {
            setError('The requested entertainment event could not be found.');
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err?.message || 'Unable to load event details. Please try again.');
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else if (event && !selectedTier && event.tiers?.length > 0) {
      setSelectedTier(event.tiers[0]);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isInactive = event?.isActive === false;
  const currentTier = selectedTier || event?.tiers?.[0];
  const totalPrice = (currentTier?.price || 0) * quantity;

  const handleProceedToPayment = () => {
    if (isInactive) return;
    if (!event || !currentTier) return;

    selectEventBooking(event, currentTier, quantity);
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="w-12 h-12 border-4 border-tertiary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-secondary font-medium text-sm">Loading event passes and ticket tiers...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-grow max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <span className="material-symbols-outlined text-error text-5xl">event_busy</span>
        <h2 className="text-2xl font-bold text-on-surface">Event Unavailable</h2>
        <p className="text-secondary text-sm">
          {error || 'We could not find the entertainment event you requested.'}
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-tertiary text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-tertiary-container transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to All Events</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col pt-8 pb-24 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full gap-8">
      {/* Stepper */}
      <div className="w-full flex items-center justify-between text-label-sm font-label-sm relative max-w-3xl mx-auto mb-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-container -z-10"></div>
        <Link to="/events" className="flex flex-col items-center gap-2 bg-background px-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary group-hover:bg-tertiary/20 group-hover:text-tertiary transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              check
            </span>
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

      {/* Inactive Notice Banner */}
      {isInactive && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-error max-w-4xl mx-auto w-full">
          <span className="material-symbols-outlined text-2xl shrink-0">block</span>
          <div>
            <p className="font-bold text-sm">Pass Bookings Unavailable</p>
            <p className="text-xs opacity-90">
              This event is currently sold out or marked inactive by the organizers. Passes cannot be booked at this time.
            </p>
          </div>
        </div>
      )}

      {/* Event Header Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm border border-surface-variant">
        <div className="flex flex-col gap-2 text-center md:text-left flex-grow">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span className="bg-tertiary/10 text-tertiary text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              {event.category}
            </span>
            <span className="text-xs bg-surface-container text-secondary font-medium px-2 py-0.5 rounded-full">
              {event.tag}
            </span>
            {isInactive && (
              <span className="text-xs bg-error text-white font-bold px-2 py-0.5 rounded-full uppercase">
                Inactive
              </span>
            )}
          </div>
          <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
            {event.title}
          </h1>
          <p className="text-sm font-semibold text-tertiary">{event.artist}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-secondary text-sm flex-wrap">
            <span className="material-symbols-outlined text-tertiary text-lg">calendar_today</span>
            <span>
              {event.date}, {event.time}
            </span>
            <span className="mx-1">•</span>
            <span className="material-symbols-outlined text-tertiary text-lg">location_on</span>
            <span>
              {event.venue}, {event.city}
            </span>
          </div>
        </div>

        <div className="w-36 h-24 rounded-xl overflow-hidden shadow-sm shrink-0 hidden md:block border border-surface-variant">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tier Options */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">loyalty</span>
              <span>Available Ticket Tiers & Perks</span>
            </h3>
            <span className="text-xs text-secondary">
              {event.tiers?.length || 0} tier{event.tiers?.length === 1 ? '' : 's'} available
            </span>
          </div>

          <div className="space-y-4">
            {event.tiers && event.tiers.length > 0 ? (
              event.tiers.map((tier) => {
                const isSelected = currentTier?.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      if (!isInactive) setSelectedTier(tier);
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      isInactive
                        ? 'opacity-60 cursor-not-allowed border-surface-variant'
                        : isSelected
                        ? 'border-tertiary bg-tertiary/5 shadow-md cursor-pointer'
                        : 'border-surface-variant hover:border-tertiary/40 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-tertiary bg-tertiary' : 'border-outline-variant'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <h4 className="font-body-md font-bold text-on-surface text-base">
                          {tier.name}
                        </h4>
                      </div>

                      {/* Perks Checklist */}
                      <div className="pl-8 space-y-1.5 pt-1">
                        {tier.perks && tier.perks.length > 0 ? (
                          tier.perks.map((perk, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-secondary">
                              <span className="material-symbols-outlined text-pitch-green text-sm fill shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span className="leading-snug">{perk}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-secondary">
                            <span className="material-symbols-outlined text-pitch-green text-sm fill">
                              check_circle
                            </span>
                            <span>Standard general admission pass</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-left md:text-right pl-8 md:pl-0 shrink-0">
                      <span className="text-xs text-secondary block font-label-sm">Price per pass</span>
                      <span className="text-2xl font-bold text-tertiary">{tier.price} EGP</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-surface-variant text-secondary text-sm">
                No ticket tiers available for this event.
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Quantity */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-2xl border border-surface-variant shadow-sm sticky top-24 space-y-6">
            <h3 className="font-headline-md text-lg font-bold text-on-surface border-b border-surface-variant pb-3">
              Booking Summary
            </h3>

            <div className="space-y-4">
              {currentTier ? (
                <div className="bg-surface p-4 rounded-xl border border-surface-variant space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-secondary font-label-sm">
                    Selected Tier
                  </span>
                  <h4 className="font-bold text-on-surface text-sm">{currentTier.name}</h4>
                  <p className="text-xs text-tertiary font-semibold">{currentTier.price} EGP / ticket</p>
                </div>
              ) : null}

              {/* Quantity Counter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-secondary block">
                  Number of Passes (Max 4 per Fan ID)
                </label>
                <div className="flex items-center justify-between bg-surface-container-low border border-surface-variant rounded-xl p-2">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1 || isInactive}
                    className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center justify-center text-on-surface hover:text-tertiary transition-colors disabled:opacity-40 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                  </button>
                  <span className="font-bold text-lg text-on-surface">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(4, prev + 1))}
                    disabled={quantity >= 4 || isInactive}
                    className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center justify-center text-on-surface hover:text-tertiary transition-colors disabled:opacity-40 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-3 border-t border-surface-variant text-xs text-secondary">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({quantity} pass{quantity === 1 ? '' : 'es'})
                  </span>
                  <span>{totalPrice} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT & Service Fee</span>
                  <span className="text-pitch-green font-medium">Included (0 EGP)</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-surface-variant flex justify-between items-center">
                <span className="font-bold text-on-surface">Total Amount</span>
                <span className="font-headline-md text-2xl font-bold text-tertiary">
                  {totalPrice} EGP
                </span>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isInactive || !currentTier}
                className="w-full bg-tertiary hover:bg-tertiary-container disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{isInactive ? 'Event Unavailable' : 'Proceed to Checkout'}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <p className="text-center font-label-sm text-xs text-secondary flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs text-pitch-green">verified_user</span>
                <span>Secured by Tazkarti Fan ID System</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBookingPage;
