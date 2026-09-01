import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllVenues } from '../services/authService';

const VENUE_IMAGES = {
  'Cairo International Stadium': '/venues/cairo-international-stadium.png',
  'Borg El Arab Stadium': '/venues/borg-el-arab-stadium.png',
  '30 June Stadium (Air Defense)': '/venues/30-june-stadium.png',
  'Alexandria Stadium': '/venues/alexandria-stadium.png',
  'Ismailia Stadium': '/venues/ismailia-stadium.png',
  'Ghazl El Mahalla Stadium': '/venues/ghazl-el-mahalla-stadium.png',
};

export const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadVenues = async () => {
      try {
        const venueData = await getAllVenues();

        if (isMounted) {
          setVenues(venueData);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.message || 'Unable to load venues right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVenues();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCapacity = (capacity) => {
    const numericCapacity = Number(capacity);
    return Number.isFinite(numericCapacity)
      ? `${numericCapacity.toLocaleString()} Seats`
      : capacity || 'Capacity unavailable';
  };

  return (
    <div className="flex-grow max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 w-full space-y-12">
      {/* Header */}
      <div className="border-b border-surface-variant pb-6">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
          <span className="material-symbols-outlined text-[18px]">stadium</span>
          <span>Stadium Guides & Entry Gates</span>
        </div>
        <h1 className="font-headline-md text-3xl font-bold text-on-surface">Egyptian Stadiums & Venues</h1>
        <p className="font-body-md text-secondary text-sm">
          Everything you need to know about gate allocations, transportation, and safety guidelines.
        </p>
      </div>

      {/* Venues List */}
      <div className="space-y-8">
        {isLoading && (
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant p-8 text-center text-secondary">
            Loading venues and gate information...
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center text-primary">
            {error}
          </div>
        )}

        {!isLoading && !error && venues.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant p-8 text-center text-secondary">
            No venues are available right now.
          </div>
        )}

        {!isLoading && !error && venues.map((venue, venueIndex) => {
          const gateNames = Array.isArray(venue.gateName) ? venue.gateName : [];
          const allocatedFor = Array.isArray(venue.allocatedFor) ? venue.allocatedFor : [];

          return (
            <div
              key={`${venue.name}-${venueIndex}`}
              className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12"
            >
              <div className="lg:col-span-5 relative h-64 lg:h-auto bg-surface-dim">
                <img
                  src={venue.imageUrl || VENUE_IMAGES[venue.name]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {formatCapacity(venue.capacity)}
                </span>
              </div>

              <div className="lg:col-span-7 p-6 md:p-8 space-y-5">
                <div>
                  <h3 className="font-headline-md text-2xl font-bold text-on-surface">{venue.name}</h3>
                  <p className="text-xs text-secondary flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-primary text-base">location_on</span>
                    <span>{venue.location}</span>
                    <span className="mx-1">•</span>
                    <span className="material-symbols-outlined text-tertiary text-base">directions_subway</span>
                    <span>{venue.metroAccess}</span>
                  </p>
                  <p className="text-sm text-secondary mt-3 leading-relaxed">{venue.description}</p>
                </div>

                {/* Gate Allocations */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider font-label-sm block">
                    Designated Gate Entrances
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {gateNames.length > 0 ? (
                      gateNames.map((gateName, gateIndex) => (
                        <div
                          key={`${gateName}-${gateIndex}`}
                          className="bg-surface-container-low p-2.5 rounded-lg border border-surface-variant text-xs"
                        >
                          <span className="font-bold text-primary block">{gateName}</span>
                          <span className="text-secondary">{allocatedFor[gateIndex] || 'General admission'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-secondary">Gate information is not available.</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/matches"
                    className="inline-flex items-center gap-1.5 bg-surface border border-outline-variant hover:border-primary text-on-surface font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    <span>Browse Matches at this Venue</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Stadium Regulations */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant p-6 md:p-8 space-y-4">
        <h3 className="font-headline-md text-xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">gpp_maybe</span>
          <span>Official Stadium Entry Regulations & Prohibited Items</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-secondary">
          <div className="bg-surface p-4 rounded-xl border border-surface-variant space-y-1">
            <h5 className="font-bold text-on-surface text-sm">Fan ID & National ID</h5>
            <p>Every attendee must present their physical National ID / Passport matching the registered Fan ID on the pass.</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-surface-variant space-y-1">
            <h5 className="font-bold text-on-surface text-sm">Strictly Prohibited</h5>
            <p>Power banks, glass bottles, metal objects, fireworks, laser pens, and wooden flagpoles are prohibited at gates.</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-surface-variant space-y-1">
            <h5 className="font-bold text-on-surface text-sm">Gate Closure Policy</h5>
            <p>Stadium turnstiles open 4 hours prior to kickoff and shut down strictly 30 minutes before match start.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
