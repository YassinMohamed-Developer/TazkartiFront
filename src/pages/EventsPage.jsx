import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEntertainmentEvents } from '../services/authService';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCategories = [
    'All',
    'Music & Concerts',
    'Classical & Orchestra',
    'Rock & Indie',
    'Comedy & Theater',
  ];

  const categories = events.length > 0
    ? ['All', ...Array.from(new Set(events.map((e) => e.category).filter(Boolean)))]
    : defaultCategories;

  const loadEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllEntertainmentEvents();
      setEvents(data);
    } catch (err) {
      setError(err?.message || 'Unable to load entertainment events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesCat =
      selectedCategory === 'All' ||
      event.category === selectedCategory ||
      event.tag === selectedCategory ||
      String(event.categoryEnum) === String(selectedCategory);

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCat;

    const matchesSearch =
      event.title?.toLowerCase().includes(query) ||
      event.artist?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query) ||
      event.city?.toLowerCase().includes(query) ||
      event.tag?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query);

    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-grow max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-variant pb-6">
        <div>
          <div className="flex items-center gap-2 text-tertiary text-sm font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">theater_comedy</span>
            <span>Live Music, Festivals & Theater in Egypt</span>
          </div>
          <h1 className="font-headline-md text-3xl font-bold text-on-surface">Entertainment & Concerts</h1>
          <p className="font-body-md text-secondary text-sm">
            Discover and book the biggest cultural, musical, and theatrical experiences.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search artists, festivals, cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-tertiary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface text-xs"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-error">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{error}</span>
          </div>
          <button
            onClick={loadEvents}
            className="px-4 py-1.5 bg-error text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const count =
            cat === 'All'
              ? events.length
              : events.filter((e) => e.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-tertiary text-white shadow-sm'
                  : 'bg-surface-container text-secondary hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span>{cat}</span>
              {events.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-surface-dim text-secondary'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-surface-container-lowest rounded-2xl border border-surface-variant overflow-hidden animate-pulse flex flex-col"
            >
              <div className="h-52 bg-surface-container" />
              <div className="p-5 space-y-3 flex-grow">
                <div className="h-5 bg-surface-container rounded w-3/4" />
                <div className="h-3 bg-surface-container rounded w-full" />
                <div className="h-3 bg-surface-container rounded w-2/3" />
                <div className="pt-4 border-t border-surface-variant flex justify-between items-center">
                  <div className="h-6 bg-surface-container rounded w-24" />
                  <div className="h-9 bg-surface-container rounded-xl w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const isInactive = event.isActive === false;

              return (
                <div
                  key={event.id}
                  className={`bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group ${
                    isInactive ? 'opacity-85' : ''
                  }`}
                >
                  {/* Banner & Badges */}
                  <div className="relative h-52 bg-surface-dim overflow-hidden">
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

                    {/* Tag pill */}
                    <span className="absolute top-3 right-3 bg-tertiary text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      {event.tag}
                    </span>

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      {event.category}
                    </span>

                    {/* Inactive pill */}
                    {isInactive && (
                      <span className="absolute top-12 left-3 bg-error/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow">
                        Sold Out / Inactive
                      </span>
                    )}

                    {/* Artist Title on Banner */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-headline-md text-lg font-bold line-clamp-1">{event.artist}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-body-md font-bold text-on-surface text-base group-hover:text-tertiary transition-colors line-clamp-1">
                        {event.title}
                      </h4>
                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="pt-2 space-y-1.5 text-xs text-secondary">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary text-base shrink-0">
                            calendar_month
                          </span>
                          <span>
                            {event.date} • {event.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary text-base shrink-0">
                            location_on
                          </span>
                          <span className="truncate">
                            {event.venue}, {event.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Price & Action */}
                    <div className="pt-4 border-t border-surface-variant flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-secondary block font-label-sm">
                          Passes starting from
                        </span>
                        <span className="text-xl font-bold text-tertiary">{event.minPrice} EGP</span>
                      </div>

                      {isInactive ? (
                        <span className="bg-surface-container text-secondary font-semibold px-4 py-2.5 rounded-xl text-xs cursor-not-allowed inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">block</span>
                          <span>Unavailable</span>
                        </span>
                      ) : (
                        <Link
                          to={`/events/${event.id}/book`}
                          state={{ event }}
                          className="bg-tertiary hover:bg-tertiary-container text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm text-sm"
                        >
                          <span>Book Pass</span>
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant">
              <span className="material-symbols-outlined text-secondary text-5xl mb-2">theater_comedy</span>
              <h3 className="font-semibold text-lg text-on-surface">No events found</h3>
              <p className="text-sm text-secondary mt-1">
                Try switching categories or searching for a different term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
