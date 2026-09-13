import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../data/mockData';
import { getAllMatches, getAllEntertainmentEvents } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState([]);
  const [isMatchesLoading, setIsMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState('');
  const [events, setEvents] = useState(MOCK_EVENTS);

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
          setMatchesError(requestError?.message || 'Unable to load matches right now.');
        }
      } finally {
        if (isMounted) {
          setIsMatchesLoading(false);
        }
      }
    };

    const loadEvents = async () => {
      try {
        const eventData = await getAllEntertainmentEvents();
        if (isMounted && Array.isArray(eventData) && eventData.length > 0) {
          setEvents(eventData);
        }
      } catch (e) {
        // Fallback already handled
      }
    };

    loadMatches();
    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredMatch = matches[0];
  const venueImages = {
    'Cairo International Stadium': '/venues/cairo-international-stadium.png',
    '30 June Stadium (Air Defense)': '/venues/30-june-stadium.png',
    'Alexandria Stadium': '/venues/alexandria-stadium.png',
    'Ghazl El Mahalla Stadium': '/venues/ghazl-el-mahalla-stadium.png',
  };
  const getMatchImage = (match) => match.bannerImage || venueImages[match.venue] || '/venues/cairo-international-stadium.png';

  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-background py-12 md:py-20 border-b border-surface-variant">
        {/* Abstract Background Accent */}
        <div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 50%, rgba(226, 30, 38, 0.08), transparent 30%), radial-gradient(circle at 85% 30%, rgba(0, 97, 141, 0.08), transparent 30%)'
          }}
        />

        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 self-center lg:self-start bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full font-label-sm text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                Official Egyptian Sports & Entertainment Portal
              </div>

              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-bold tracking-tight">
                Your Gate to <span className="text-primary">Live Moments</span> in Egypt.
              </h1>

              <p className="font-body-lg text-body-lg text-secondary max-w-xl">
                Book official tickets for the Egyptian Premier League, CAF Champions League, international tournaments, and the biggest concerts with your verified Fan ID.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/matches"
                  className="bg-primary-container hover:bg-primary text-on-primary font-body-md font-semibold px-8 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(226,30,38,0.25)] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
                  <span>Explore Matches</span>
                </Link>

                <Link
                  to="/events"
                  className="bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface font-body-md font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px] text-tertiary">theater_comedy</span>
                  <span>Concerts & Shows</span>
                </Link>

                {!isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/register"
                      className="text-primary hover:text-primary-container font-label-sm font-bold text-sm px-3 py-3 flex items-center gap-1 hover:underline"
                    >
                      <span>Get Fan ID</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                    <span className="text-secondary opacity-40">|</span>
                    <Link
                      to="/login"
                      className="text-on-surface hover:text-primary font-label-sm font-semibold text-sm px-3 py-3 flex items-center gap-1 hover:underline"
                    >
                      <span>Sign In</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-surface-variant flex flex-wrap justify-center lg:justify-start items-center gap-6 text-xs text-secondary font-label-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-pitch-green text-[18px] fill">verified</span>
                  <span>100% Guaranteed Tickets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">lock</span>
                  <span>Encrypted Fan ID Pass</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-golden-gate text-[18px]">bolt</span>
                  <span>InstaPay & Fawry Enabled</span>
                </div>
              </div>
            </div>

            {/* Featured Match Card Banner */}
            <div className="lg:col-span-5">
              {isMatchesLoading && (
                <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant p-8 text-center text-secondary">
                  Loading featured match...
                </div>
              )}
              {!isMatchesLoading && matchesError && (
                <div className="bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center text-primary">
                  {matchesError}
                </div>
              )}
              {!isMatchesLoading && !matchesError && featuredMatch && (
              <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-[0_12px_32px_rgba(0,0,0,0.1)] overflow-hidden relative group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={getMatchImage(featuredMatch)}
                    alt={featuredMatch.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      {featuredMatch.league}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-xs text-white/80 font-label-sm">{featuredMatch.round}</p>
                    <h3 className="font-headline-md text-xl font-bold">{featuredMatch.title}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
                      <span>{featuredMatch.date} • {featuredMatch.time}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md text-xs font-semibold text-on-surface">
                      <span className="w-2 h-2 rounded-full bg-pitch-green"></span>
                      <span>{featuredMatch.availability}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-sm">stadium</span>
                      <span>{featuredMatch.venue}</span>
                    </div>
                    <span className="font-bold text-primary text-sm">From {featuredMatch.minPrice} EGP</span>
                  </div>

                  {/* Availability bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-label-sm text-secondary">
                      <span>Seat Availability</span>
                      <span className="font-bold text-on-surface">{featuredMatch.availabilityPercent}% Available</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-1000"
                        style={{ width: `${featuredMatch.availabilityPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    to={`/matches/${featuredMatch.id}/book`}
                    className="w-full bg-primary-container hover:bg-primary text-on-primary font-body-md font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow"
                  >
                    <span>Book Seats Now</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                </div>
              </div>
              )}
              {!isMatchesLoading && !matchesError && !featuredMatch && (
                <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant p-8 text-center text-secondary">
                  No featured match is available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12 w-full space-y-16">
        {/* Quick Filter Tabs */}
        <div className="flex items-center justify-between border-b border-surface-variant pb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Upcoming Sports & Entertainment</h2>
            <p className="font-body-md text-secondary text-sm">Find and book your favorite events across Egypt</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-surface-container p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'all' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setActiveTab('sports')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'sports' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
              }`}
            >
              ⚽ Matches
            </button>
            <button
              onClick={() => setActiveTab('entertainment')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'entertainment' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
              }`}
            >
              🎭 Concerts
            </button>
          </div>
        </div>

        {/* Matches Grid */}
        {(activeTab === 'all' || activeTab === 'sports') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">sports_soccer</span>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Football Matches</h3>
              </div>
              <Link to="/matches" className="text-primary hover:text-primary-container font-label-sm text-sm font-bold flex items-center gap-1">
                View All Matches →
              </Link>
            </div>

            {isMatchesLoading && (
              <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-8 text-center text-secondary">
                Loading football matches...
              </div>
            )}
            {!isMatchesLoading && matchesError && (
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-8 text-center text-primary">
                {matchesError}
              </div>
            )}
            {!isMatchesLoading && !matchesError && matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  <div className="relative h-36 bg-surface-dim overflow-hidden">
                    <img
                      src={getMatchImage(match)}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface text-[11px] font-bold px-2.5 py-1 rounded-md">
                      {match.league}
                    </span>
                    <span className="absolute bottom-3 left-3 text-white font-semibold text-sm">
                      {match.venue}
                    </span>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-secondary mb-1">
                        <span>{match.round}</span>
                        <span className="text-pitch-green font-semibold">{match.availability}</span>
                      </div>
                      <h4 className="font-headline-md text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                        {match.title}
                      </h4>
                      <p className="text-xs text-secondary flex items-center gap-1.5 mt-2">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>{match.date} • {match.time}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-surface-variant flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-secondary block font-label-sm">Starting from</span>
                        <span className="text-base font-bold text-primary">{match.minPrice} EGP</span>
                      </div>
                      <Link
                        to={`/matches/${match.id}/book`}
                        className="bg-primary-container hover:bg-primary text-on-primary font-body-md text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Book Seats</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
            {!isMatchesLoading && !matchesError && matches.length === 0 && (
              <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-8 text-center text-secondary">
                No football matches are available right now.
              </div>
            )}
          </section>
        )}

        {/* Events Grid */}
        {(activeTab === 'all' || activeTab === 'entertainment') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-2xl">theater_comedy</span>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Concerts & Entertainment</h3>
              </div>
              <Link to="/events" className="text-tertiary hover:text-tertiary-container font-label-sm text-sm font-bold flex items-center gap-1">
                View All Events →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  <div className="relative h-44 bg-surface-dim overflow-hidden">
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <span className="absolute top-3 right-3 bg-tertiary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {event.tag}
                    </span>
                    {event.isActive === false && (
                      <span className="absolute top-3 left-3 bg-error text-white text-[9px] font-bold px-2 py-0.5 rounded shadow uppercase">
                        Sold Out
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="text-[11px] text-white/80 uppercase tracking-wider font-label-sm">{event.category}</span>
                      <h4 className="font-semibold text-sm leading-tight line-clamp-1">{event.artist}</h4>
                    </div>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-body-md font-bold text-on-surface line-clamp-2 group-hover:text-tertiary transition-colors text-sm">
                        {event.title}
                      </h4>
                      <p className="text-xs text-secondary flex items-center gap-1 mt-1.5">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate">{event.venue}</span>
                      </p>
                      <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        <span>{event.date}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-surface-variant flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-secondary block">From</span>
                        <span className="text-sm font-bold text-tertiary">{event.minPrice} EGP</span>
                      </div>
                      {event.isActive === false ? (
                        <span className="bg-surface-container text-secondary font-body-md text-xs font-semibold px-3 py-1.5 rounded-lg cursor-not-allowed">
                          Unavailable
                        </span>
                      ) : (
                        <Link
                          to={`/events/${event.id}/book`}
                          state={{ event }}
                          className="bg-tertiary hover:bg-tertiary-container text-white font-body-md text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Select Tier
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fan ID Info Banner */}
        {!isAuthenticated && (
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-pitch-green/10 text-pitch-green px-3 py-1 rounded-full text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">gpp_good</span>
                Secure National Fan ID System
              </div>
              <h3 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
                Get Your Tazkarti Fan ID for Hassle-Free Stadium Entry
              </h3>
              <p className="font-body-md text-secondary max-w-2xl">
                Your Fan ID is your official passport to Egypt's sporting stadiums and major cultural arenas. Register in 3 simple steps, upload your photo, and scan your digital QR code at any turnstile.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-surface p-3.5 rounded-xl border border-surface-variant">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs mb-2">1</div>
                  <h5 className="font-semibold text-xs text-on-surface">National ID Verification</h5>
                  <p className="text-[11px] text-secondary mt-0.5">Enter 14-digit Egyptian ID or Passport</p>
                </div>
                <div className="bg-surface p-3.5 rounded-xl border border-surface-variant">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs mb-2">2</div>
                  <h5 className="font-semibold text-xs text-on-surface">Personal Profile & Photo</h5>
                  <p className="text-[11px] text-secondary mt-0.5">Upload a clear portrait picture</p>
                </div>
                <div className="bg-surface p-3.5 rounded-xl border border-surface-variant">
                  <div className="w-7 h-7 rounded-full bg-pitch-green text-white flex items-center justify-center font-bold text-xs mb-2">3</div>
                  <h5 className="font-semibold text-xs text-on-surface">Instant Digital Pass</h5>
                  <p className="text-[11px] text-secondary mt-0.5">Get your dynamic 15s turnstile QR</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-primary text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-primary-container transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Register Fan ID</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant/60 hover:border-primary text-on-surface font-semibold px-6 py-3.5 rounded-xl hover:bg-surface-container transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>Already Registered? Sign In</span>
                </Link>
              </div>
              <span className="text-xs text-secondary mt-2">Free of charge • Instant activation</span>
            </div>
          </div>
        </section>
        )}
      </main>
    </div>
  );
};
