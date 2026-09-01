import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../data/mockData';

export const EventsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Music & Concerts', 'Classical & Orchestra', 'Rock & Indie', 'Comedy & Theater'];

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesCat = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.venue.toLowerCase().includes(searchQuery.toLowerCase());
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
          <p className="font-body-md text-secondary text-sm">Discover and book the biggest cultural and musical experiences.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
          <input
            type="text"
            placeholder="Search artists or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-tertiary"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-tertiary text-white shadow-sm'
                : 'bg-surface-container text-secondary hover:text-on-surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group"
            >
              <div className="relative h-52 bg-surface-dim overflow-hidden">
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <span className="absolute top-3 right-3 bg-tertiary text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {event.tag}
                </span>
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {event.category}
                </span>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-headline-md text-lg font-bold line-clamp-1">{event.artist}</h3>
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-body-md font-bold text-on-surface text-base group-hover:text-tertiary transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-xs text-secondary line-clamp-2 leading-relaxed">{event.description}</p>
                  
                  <div className="pt-2 space-y-1.5 text-xs text-secondary">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-base">calendar_month</span>
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-base">location_on</span>
                      <span>{event.venue}, {event.city}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-variant flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-secondary block font-label-sm">Passes starting from</span>
                    <span className="text-xl font-bold text-tertiary">{event.minPrice} EGP</span>
                  </div>
                  <Link
                    to={`/events/${event.id}/book`}
                    className="bg-tertiary hover:bg-tertiary-container text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm text-sm"
                  >
                    <span>Book Pass</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant">
            <span className="material-symbols-outlined text-secondary text-5xl mb-2">theater_comedy</span>
            <h3 className="font-semibold text-lg text-on-surface">No events found</h3>
            <p className="text-sm text-secondary mt-1">Try switching categories or searching another term.</p>
          </div>
        )}
      </div>
    </div>
  );
};
