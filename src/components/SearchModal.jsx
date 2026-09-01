import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MATCHES, MOCK_EVENTS } from '../data/mockData';
import { Search, X, Calendar, MapPin, Tag } from 'lucide-react';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredMatches = MOCK_MATCHES.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase()) ||
    m.league.toLowerCase().includes(query.toLowerCase()) ||
    m.venue.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEvents = MOCK_EVENTS.filter(e =>
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    e.artist?.toLowerCase().includes(query.toLowerCase()) ||
    e.venue.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="p-4 border-b border-surface-variant flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">search</span>
          <input
            type="text"
            placeholder="Search teams, matches, concerts, venues..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none font-body-md text-on-surface placeholder:text-secondary-fixed-dim text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* Matches */}
          <div>
            <h4 className="font-label-sm uppercase tracking-wider text-xs text-secondary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">sports_soccer</span>
              Matches ({filteredMatches.length})
            </h4>
            {filteredMatches.length > 0 ? (
              <div className="space-y-2">
                {filteredMatches.map(match => (
                  <div
                    key={match.id}
                    onClick={() => {
                      navigate(`/matches/${match.id}/book`);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-surface-variant bg-surface hover:border-primary cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {match.title}
                      </h5>
                      <p className="text-xs text-secondary flex items-center gap-2 mt-0.5">
                        <span>{match.date} • {match.venue}</span>
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">
                          From {match.minPrice} EGP
                        </span>
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">
                      arrow_forward
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary italic">No matches found matching "{query}"</p>
            )}
          </div>

          {/* Events */}
          <div>
            <h4 className="font-label-sm uppercase tracking-wider text-xs text-secondary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-tertiary">theater_comedy</span>
              Events & Concerts ({filteredEvents.length})
            </h4>
            {filteredEvents.length > 0 ? (
              <div className="space-y-2">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => {
                      navigate(`/events/${event.id}/book`);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-surface-variant bg-surface hover:border-tertiary cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="font-body-md font-semibold text-on-surface group-hover:text-tertiary transition-colors">
                        {event.title}
                      </h5>
                      <p className="text-xs text-secondary flex items-center gap-2 mt-0.5">
                        <span>{event.date} • {event.venue}</span>
                        <span className="bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded text-[10px] font-bold">
                          From {event.minPrice} EGP
                        </span>
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:text-tertiary transition-colors">
                      arrow_forward
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary italic">No entertainment events found</p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-surface-container-low border-t border-surface-variant text-center text-xs text-secondary">
          Press <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant font-mono">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};
