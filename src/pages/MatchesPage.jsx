import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllMatches } from '../services/authService';

const TeamBadge = ({ team }) => (
  <div className="w-16 h-16 rounded-full bg-surface-container-low border border-surface-variant flex items-center justify-center p-2 mb-2 shadow-sm">
    {team.logo ? (
      <img src={team.logo} alt={team.name} className="max-h-full max-w-full object-contain" />
    ) : (
      <span className="text-primary font-bold text-sm">{team.shortName}</span>
    )}
  </div>
);

export const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [selectedVenue, setSelectedVenue] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      try {
        const matchData = await getAllMatches();
        if (isMounted) {
          setMatches(matchData);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.message || 'Unable to load matches right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  const leagues = ['All', ...new Set(matches.map(match => match.league))];
  const venues = ['All', ...new Set(matches.map(match => match.venue))];
  const normalizedSearch = searchQuery.toLowerCase();

  const filteredMatches = matches.filter(match => {
    const matchesLeague = selectedLeague === 'All' || match.league === selectedLeague;
    const matchesVenue = selectedVenue === 'All' || match.venue === selectedVenue;
    const matchesSearch = [match.title, match.homeTeam.name, match.awayTeam.name]
      .some(value => value.toLowerCase().includes(normalizedSearch));

    return matchesLeague && matchesVenue && matchesSearch;
  });

  return (
    <div className="flex-grow max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-variant pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">sports_soccer</span>
            <span>Official Fixtures & Stadium Tickets</span>
          </div>
          <h1 className="font-headline-md text-3xl font-bold text-on-surface">Football Matches</h1>
          <p className="font-body-md text-secondary text-sm">Select a match to choose your stadium seats and entrance gate.</p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
          <input
            type="text"
            placeholder="Search teams or match..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-surface-variant shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Competition:</span>
          {leagues.map(league => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedLeague === league
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-secondary hover:text-on-surface'
              }`}
            >
              {league}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-semibold text-secondary">Venue:</span>
          <select
            value={selectedVenue}
            onChange={(event) => setSelectedVenue(event.target.value)}
            className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            {venues.map(venue => (
              <option key={venue} value={venue}>{venue}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant p-10 text-center text-secondary">
            Loading matches and ticket categories...
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-10 text-center text-primary">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredMatches.length > 0 && filteredMatches.map(match => {
          const canBook = match.availability !== 'Sold Out' && match.categories.length > 0;

          return (
            <div
              key={match.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm hover:border-primary/40 hover:shadow-md transition-all p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              {/* Match Date & League Info */}
              <div className="lg:col-span-3 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-surface-variant pb-4 lg:pb-0 lg:pr-6">
                <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-md self-start uppercase tracking-wider mb-2">
                  {match.league}
                </span>
                <div className="flex items-center gap-2 text-on-surface font-semibold text-base">
                  <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                  <span>{match.date}</span>
                </div>
                <div className="text-xs text-secondary mt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span>Kickoff: {match.time}</span>
                </div>
                <div className="text-xs text-secondary mt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">stadium</span>
                  <span className="truncate">{match.venue}</span>
                </div>
              </div>

              {/* Teams Clash */}
              <div className="lg:col-span-6 flex items-center justify-between px-2 sm:px-6">
                <div className="flex flex-col items-center text-center w-1/3">
                  <TeamBadge team={match.homeTeam} />
                  <h4 className="font-semibold text-sm text-on-surface">{match.homeTeam.name}</h4>
                  <span className="text-[11px] text-secondary font-label-sm">Home</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary font-bold text-xs border border-surface-variant">
                    VS
                  </span>
                  <span className={`text-[10px] font-semibold mt-2 ${match.availability === 'Sold Out' ? 'text-primary' : 'text-pitch-green'}`}>
                    {match.availability}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center w-1/3">
                  <TeamBadge team={match.awayTeam} />
                  <h4 className="font-semibold text-sm text-on-surface">{match.awayTeam.name}</h4>
                  <span className="text-[11px] text-secondary font-label-sm">Away</span>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center border-t lg:border-t-0 lg:border-l border-surface-variant pt-4 lg:pt-0 lg:pl-6 space-y-3">
                <div className="text-center lg:text-right">
                  <span className="text-xs text-secondary block font-label-sm">Tickets starting from</span>
                  <span className="text-2xl font-bold text-primary">{match.minPrice} EGP</span>
                </div>
                {canBook ? (
                  <Link
                    to={`/matches/${match.id}/book`}
                    className="w-full bg-primary-container hover:bg-primary text-on-primary font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    <span>Choose Seats</span>
                    <span className="material-symbols-outlined text-lg">chair</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-surface-variant text-secondary font-semibold py-3 px-6 rounded-xl text-sm cursor-not-allowed"
                  >
                    {match.availability === 'Sold Out' ? 'Sold Out' : 'No Categories Available'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!isLoading && !error && filteredMatches.length === 0 && (
          <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant">
            <span className="material-symbols-outlined text-secondary text-5xl mb-2">event_busy</span>
            <h3 className="font-semibold text-lg text-on-surface">No matches found</h3>
            <p className="text-sm text-secondary mt-1">Try adjusting your competition or venue filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
