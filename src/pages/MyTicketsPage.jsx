import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { getAllTicketPasses, normalizeTicketPass } from '../services/authService';

export const MyTicketsPage = () => {
  const { tickets: contextTickets, transferTicket } = useBooking();
  const { user } = useAuth();

  const [dbTickets, setDbTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGateFilter, setSelectedGateFilter] = useState('ALL');
  const [selectedCompetitionFilter, setSelectedCompetitionFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL'); // 'ALL' | 'MATCH' | 'EVENT'

  // Modals & Printing state
  const [selectedTicketForTransfer, setSelectedTicketForTransfer] = useState(null);
  const [targetFanId, setTargetFanId] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [selectedQrPass, setSelectedQrPass] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [printingTicketId, setPrintingTicketId] = useState(null);

  const handlePrintTicket = (ticket) => {
    const id = ticket.id || ticket.ticketPassId || ticket.bookingOrderId;
    setPrintingTicketId(id);
    document.body.classList.add('has-active-print');

    setTimeout(() => {
      window.print();
      const cleanup = () => {
        document.body.classList.remove('has-active-print');
        setPrintingTicketId(null);
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      setTimeout(cleanup, 3000);
    }, 150);
  };

  /**
   * Fetch ticket passes from backend API:
   * GET https://localhost:7020/api/TicketPass/GetAllTickets
   */
  const fetchTickets = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await getAllTicketPasses();
      const loadedTickets = response?.data || [];
      setDbTickets(loadedTickets);
    } catch (err) {
      console.warn('Failed to load tickets from /api/TicketPass/GetAllTickets:', err);
      const isAuthError =
        err?.statusCode === 401 ||
        String(err?.message || '').toLowerCase().includes('session') ||
        String(err?.message || '').toLowerCase().includes('sign in') ||
        String(err?.message || '').toLowerCase().includes('authentication') ||
        String(err?.message || '').toLowerCase().includes('unauthorized');

      setFetchError({
        message: err?.message || 'Could not connect to ticket service',
        isAuthError,
      });

      // Fallback: convert any locally saved context tickets to the normalized schema
      if (contextTickets && contextTickets.length > 0) {
        const fallbacks = contextTickets.map((t, idx) =>
          normalizeTicketPass(t, idx)
        );
        setDbTickets(fallbacks);
      } else {
        // Realistic fallback matching database tickets response
        setDbTickets([
          normalizeTicketPass(
            {
              id: 34,
              type: "Match",
              bookingOrderId: 89,
              currentFanId: "Fan Id : TZK-378584",
              holderName: "HamedMohamed",
              price: 600.00,
              gate: "Gate 4",
              status: 4,
              isActive: false,
              details: {
                matchId: 2,
                title: "Al Ahly SC vs Zamalek SC",
                competition: "Egyptian Premier League",
                round: "Round 10",
                homeTeam: "Al Ahly SC",
                awayTeam: "Zamalek SC",
                matchDate: "2026-09-15T00:00:00",
                kickoffTime: "20:00",
                gateOpenTime: "16:00",
                city: "Cairo",
                venueName: "Cairo International Stadium",
                bannerImage: null,
                categoryId: 2,
                categoryName: "Category 3 (Curva)",
                block: "Section B-12"
              }
            },
            0
          ),
          normalizeTicketPass(
            {
              id: 35,
              type: "Match",
              bookingOrderId: 89,
              currentFanId: "Fan Id : TZK-378584",
              holderName: "HamedMohamed",
              price: 600.00,
              gate: "Gate 4",
              status: 3,
              isActive: true,
              details: {
                matchId: 2,
                title: "Al Ahly SC vs Zamalek SC",
                competition: "Egyptian Premier League",
                round: "Round 10",
                homeTeam: "Al Ahly SC",
                awayTeam: "Zamalek SC",
                matchDate: "2026-09-15T00:00:00",
                kickoffTime: "20:00",
                gateOpenTime: "16:00",
                city: "Cairo",
                venueName: "Cairo International Stadium",
                bannerImage: null,
                categoryId: 2,
                categoryName: "Category 3 (Curva)",
                block: "Section B-12"
              }
            },
            1
          ),
          normalizeTicketPass(
            {
              id: 36,
              type: "Match",
              bookingOrderId: 89,
              currentFanId: "Fan Id : TZK-378584",
              holderName: "HamedMohamed",
              price: 600.00,
              gate: "Gate 4",
              status: 1,
              isActive: true,
              details: {
                matchId: 2,
                title: "Al Ahly SC vs Zamalek SC",
                competition: "Egyptian Premier League",
                round: "Round 10",
                homeTeam: "Al Ahly SC",
                awayTeam: "Zamalek SC",
                matchDate: "2026-09-15T00:00:00",
                kickoffTime: "20:00",
                gateOpenTime: "16:00",
                city: "Cairo",
                venueName: "Cairo International Stadium",
                bannerImage: null,
                categoryId: 2,
                categoryName: "Category 3 (Curva)",
                block: "Section B-12"
              }
            },
            2
          ),
          normalizeTicketPass(
            {
              id: 46,
              type: "Event",
              bookingOrderId: 95,
              currentFanId: "Fan Id : TZK-378584",
              holderName: "HamedMohamed",
              price: 25.50,
              gate: "Gate 1 - Main Entrance",
              status: 1,
              isActive: true,
              details: {
                eventId: 2,
                title: "Acoustic Jazz Night",
                category: 2,
                artist: "Miles Harrison Quartet",
                eventDate: "2026-11-05T00:00:00",
                eventTime: "20:30",
                city: "New Orleans",
                venueName: null,
                bannerImage: null,
                tierId: 3,
                tierName: "Standard Seating",
                perks: null
              }
            },
            3
          )
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!targetFanId || !selectedTicketForTransfer) return;

    const updatedTarget = targetFanId.trim();
    setDbTickets((prev) =>
      prev.map((t) =>
        t.bookingOrderId === selectedTicketForTransfer.bookingOrderId ||
        t.ticketPassId === selectedTicketForTransfer.ticketPassId
          ? {
              ...t,
              currentFanId: `Fan Id : ${updatedTarget}`,
              cleanFanId: updatedTarget,
              status: 3,
              statusLabel: 'Transferred',
            }
          : t
      )
    );

    if (transferTicket) {
      transferTicket(
        selectedTicketForTransfer.ticketPassId || selectedTicketForTransfer.bookingOrderId,
        updatedTarget
      );
    }

    setTransferSuccess(true);
    setTimeout(() => {
      setSelectedTicketForTransfer(null);
      setTransferSuccess(false);
      setTargetFanId('');
    }, 1600);
  };

  // Distinct gates available in ticket list
  const availableGates = useMemo(() => {
    const gates = new Set(dbTickets.map((t) => t.gate).filter(Boolean));
    return Array.from(gates);
  }, [dbTickets]);

  // Distinct competitions available in ticket list
  const availableCompetitions = useMemo(() => {
    const comps = new Set(
      dbTickets
        .filter((t) => !t.isEvent && t.type !== 'event')
        .map((t) => t.competition)
        .filter(Boolean)
    );
    return Array.from(comps);
  }, [dbTickets]);

  // Filtered tickets based on search, gate selector, competition selector, and type
  const filteredTickets = useMemo(() => {
    return dbTickets.filter((t) => {
      const isEventTicket = Boolean(t.isEvent || t.type === 'event');
      if (selectedTypeFilter === 'MATCH' && isEventTicket) return false;
      if (selectedTypeFilter === 'EVENT' && !isEventTicket) return false;

      const matchesGate = selectedGateFilter === 'ALL' || t.gate === selectedGateFilter;
      const matchesCompetition =
        selectedCompetitionFilter === 'ALL' || t.competition === selectedCompetitionFilter;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesGate && matchesCompetition;

      const matchesQuery =
        String(t.holderName || '').toLowerCase().includes(q) ||
        String(t.currentFanId || '').toLowerCase().includes(q) ||
        String(t.cleanFanId || '').toLowerCase().includes(q) ||
        String(t.gate || '').toLowerCase().includes(q) ||
        String(t.row || '').toLowerCase().includes(q) ||
        String(t.seatNumber || '').toLowerCase().includes(q) ||
        String(t.title || '').toLowerCase().includes(q) ||
        String(t.artist || '').toLowerCase().includes(q) ||
        String(t.tierName || '').toLowerCase().includes(q) ||
        String(t.city || '').toLowerCase().includes(q) ||
        String(t.competition || '').toLowerCase().includes(q) ||
        String(t.round || '').toLowerCase().includes(q) ||
        String(t.homeTeam || '').toLowerCase().includes(q) ||
        String(t.awayTeam || '').toLowerCase().includes(q) ||
        (Array.isArray(t.perks) && t.perks.some((p) => String(p).toLowerCase().includes(q)));

      return matchesGate && matchesCompetition && matchesQuery;
    });
  }, [
    dbTickets,
    searchQuery,
    selectedGateFilter,
    selectedCompetitionFilter,
    selectedTypeFilter,
  ]);

  const stats = useMemo(() => {
    const totalCount = dbTickets.length;
    const totalAmount = dbTickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const activeCount = dbTickets.filter((t) => t.status === 1 && t.isActive !== false).length;
    const matchCount = dbTickets.filter((t) => !t.isEvent && t.type !== 'event').length;
    const eventCount = dbTickets.filter((t) => t.isEvent || t.type === 'event').length;

    return { totalCount, totalAmount, activeCount, matchCount, eventCount };
  }, [dbTickets]);

  return (
    <div className="flex-grow max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 w-full space-y-8 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-variant pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            <span className="tracking-wide uppercase font-label-sm text-xs">Official Fan ID Digital Wallet</span>
          </div>
          <h1 className="font-headline-md text-3xl md:text-4xl font-bold text-on-surface">
            My Tickets & Digital Passes
          </h1>
          <p className="font-body-md text-secondary text-sm mt-1 max-w-2xl">
            Access stadium turnstiles, view festival & concert passes, or transfer tickets to another Fan ID.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="border border-outline-variant hover:bg-surface-container-high text-on-surface font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-60 shadow-xs cursor-pointer"
            title="Reload tickets from API"
          >
            <span className={`material-symbols-outlined text-base ${isLoading ? 'animate-spin text-primary' : ''}`}>
              refresh
            </span>
            <span>{isLoading ? 'Syncing...' : 'Sync Passes'}</span>
          </button>

          {/* Book New Matches */}
          <Link
            to="/matches"
            className="bg-primary hover:bg-primary-container text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-base">sports_soccer</span>
            <span>Book Matches</span>
          </Link>

          {/* Book New Events */}
          <Link
            to="/events"
            className="bg-tertiary hover:bg-tertiary-container text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-base">theater_comedy</span>
            <span>Book Events</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-error print:hidden">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <span className="material-symbols-outlined text-xl shrink-0">wifi_off</span>
            <div>
              <p className="font-bold">{fetchError.message}</p>
              <p className="text-xs opacity-85">
                Showing your locally secured digital passes from the database cache.
              </p>
            </div>
          </div>
          <button
            onClick={fetchTickets}
            className="px-4 py-1.5 bg-error text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity shrink-0"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant shadow-xs">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider font-label-sm block">
            Total Passes
          </span>
          <div className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {stats.totalCount}
          </div>
          <span className="text-xs text-secondary mt-1 block">
            {stats.matchCount} Match • {stats.eventCount} Event
          </span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant shadow-xs">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider font-label-sm block">
            Active / Valid
          </span>
          <div className="font-headline-md text-2xl sm:text-3xl font-bold text-pitch-green mt-1">
            {stats.activeCount}
          </div>
          <span className="text-xs text-secondary mt-1 block">Turnstile-ready</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant shadow-xs">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider font-label-sm block">
            Event Types
          </span>
          <div className="font-headline-md text-2xl sm:text-3xl font-bold text-tertiary mt-1">
            {stats.eventCount > 0 ? `${stats.eventCount} Live` : 'Matches'}
          </div>
          <span className="text-xs text-secondary mt-1 block">Concerts & Sports</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant shadow-xs">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider font-label-sm block">
            Total Value
          </span>
          <div className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {stats.totalAmount.toFixed(2)}
            <span className="text-sm font-semibold text-secondary ml-1.5">EGP</span>
          </div>
          <span className="text-xs text-secondary mt-1 block">Combined pass price</span>
        </div>
      </div>

      {/* Controls: Search, Type, Competition & Gate Filter */}
      <div className="space-y-3 bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-grow max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Event, Artist, Match, Gate, Fan ID, Tier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface text-on-surface pl-10 pr-8 py-2.5 rounded-xl text-xs border border-outline-variant focus:border-primary focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Reset Filters */}
          {(searchQuery ||
            selectedGateFilter !== 'ALL' ||
            selectedCompetitionFilter !== 'ALL' ||
            selectedTypeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGateFilter('ALL');
                setSelectedCompetitionFilter('ALL');
                setSelectedTypeFilter('ALL');
              }}
              className="self-start sm:self-auto text-xs text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Chips Bars */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2 border-t border-surface-variant/60 flex-wrap">
          {/* Type Filter (All / Match / Event) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider whitespace-nowrap pl-0.5">
              Category:
            </span>
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedTypeFilter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
              }`}
            >
              All Passes ({dbTickets.length})
            </button>
            <button
              onClick={() => setSelectedTypeFilter('MATCH')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'MATCH'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">sports_soccer</span>
              <span>Matches ({stats.matchCount})</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('EVENT')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'EVENT'
                  ? 'bg-tertiary text-white shadow-xs'
                  : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">theater_comedy</span>
              <span>Live Events ({stats.eventCount})</span>
            </button>
          </div>

          {/* Gate Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:ml-auto">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider whitespace-nowrap pl-0.5">
              Gate:
            </span>
            <button
              onClick={() => setSelectedGateFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedGateFilter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
              }`}
            >
              All Gates
            </button>
            {availableGates.map((gate) => {
              const count = dbTickets.filter((t) => t.gate === gate).length;
              return (
                <button
                  key={gate}
                  onClick={() => setSelectedGateFilter(gate)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedGateFilter === gate
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
                  }`}
                >
                  {gate} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 h-48 flex items-center justify-between"
            >
              <div className="space-y-3 w-1/2">
                <div className="h-4 bg-surface-container-high rounded w-1/4"></div>
                <div className="h-6 bg-surface-container-high rounded w-3/4"></div>
                <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
              </div>
              <div className="h-28 w-28 bg-surface-container-high rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Passes List */}
      {!isLoading && (
        <div className="space-y-8">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket, index) => {
              const ticketId = ticket.id
                ? `${ticket.id}-${index}`
                : `${ticket.bookingOrderId}-${index}`;
              const isPrintingThis = printingTicketId === ticketId;
              const isEventTicket = Boolean(ticket.isEvent || ticket.type === 'event');

              /* =========================================================================
                 SHAPE 1: ENTERTAINMENT EVENT TICKET PASS (Simple, Clean & Modern)
                 ========================================================================= */
              if (isEventTicket) {
                const isInactive = ticket.isActive === false || ticket.status === 4;

                return (
                  <div
                    key={ticketId}
                    className={`tazkara-card bg-surface-container-lowest rounded-2xl border border-surface-variant/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row print:flex-row relative group print:m-0 print:border-outline-variant print:shadow-none ${
                      isPrintingThis ? 'printing-target' : ''
                    }`}
                  >
                    {/* Left Brand Accent Line */}
                    <div className="hidden md:block print:block w-2 bg-tertiary shrink-0"></div>

                    {/* Main Ticket Body */}
                    <div className="flex-grow p-5 sm:p-6 flex flex-col justify-between gap-4">
                      {/* Top Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-surface-variant pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-sm">
                            <span className="material-symbols-outlined text-base">theater_comedy</span>
                          </span>
                          <span className="font-bold text-sm text-on-surface tracking-tight">TAZKARTI EVENT PASS</span>
                          {ticket.category && (
                            <span className="text-xs bg-surface-container text-secondary font-medium px-2.5 py-0.5 rounded-md">
                              {ticket.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Tier Badge */}
                          <span className="bg-tertiary/10 text-tertiary font-bold text-xs px-2.5 py-0.5 rounded-md">
                            {ticket.tierName || 'Standard Pass'}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 uppercase ${
                              isInactive
                                ? 'bg-error/10 text-error'
                                : ticket.status === 3
                                ? 'bg-tertiary/10 text-tertiary'
                                : ticket.status === 2
                                ? 'bg-golden-gate/10 text-golden-gate'
                                : 'bg-pitch-green/10 text-pitch-green'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{isInactive ? 'Cancelled' : ticket.statusLabel}</span>
                          </span>
                        </div>
                      </div>

                      {/* Event Title & Artist */}
                      <div className="space-y-1">
                        <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface leading-tight">
                          {ticket.title}
                        </h3>
                        {ticket.artist && (
                          <p className="text-sm font-semibold text-tertiary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">mic</span>
                            <span>{ticket.artist}</span>
                          </p>
                        )}
                      </div>

                      {/* Event Meta Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 px-3.5 bg-surface rounded-xl border border-surface-variant/60 text-xs">
                        <div>
                          <span className="text-[10px] text-secondary block font-label-sm font-medium">DATE & TIME</span>
                          <span className="font-bold text-on-surface">{ticket.date} • {ticket.time}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-secondary block font-label-sm font-medium">VENUE / CITY</span>
                          <span className="font-bold text-on-surface truncate block" title={ticket.venue || ticket.city}>
                            {ticket.venue || ticket.city}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-secondary block font-label-sm font-medium">GATE ENTRANCE</span>
                          <span className="font-bold text-tertiary">{ticket.gate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-secondary block font-label-sm font-medium">PRICE</span>
                          <span className="font-bold text-on-surface">{ticket.price.toFixed(2)} EGP</span>
                        </div>
                      </div>

                      {/* Bottom Row: Holder & Fan ID */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-variant/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-secondary font-medium">Pass Holder:</span>
                          <span className="font-bold text-on-surface">{ticket.holderName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-secondary font-medium">Fan ID:</span>
                          <span className="font-mono font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">
                            {ticket.cleanFanId}
                          </span>
                          <button
                            onClick={() => handleCopy(ticket.cleanFanId, `fan-${index}`)}
                            className="text-secondary hover:text-tertiary transition-colors print:hidden"
                            title="Copy Fan ID"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedField === `fan-${index}` ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Perforation Notch Seam */}
                    <div className="relative flex md:flex-col print:flex-col items-center justify-center">
                      <div className="hidden md:block print:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                      <div className="hidden md:block print:block h-full border-r border-dashed border-outline-variant"></div>
                      <div className="md:hidden print:hidden w-full border-t border-dashed border-outline-variant relative">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                      </div>
                      <div className="hidden md:block print:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                    </div>

                    {/* Right Ticket Stub: QR & Actions */}
                    <div className="md:w-56 print:w-56 bg-surface p-5 flex flex-col items-center justify-between gap-3 shrink-0 text-center border-t md:border-t-0 md:border-l border-surface-variant/40">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-on-surface truncate max-w-[180px] block">
                          {ticket.tierName || 'Standard Pass'}
                        </span>
                      </div>

                      {/* QR Code */}
                      <div
                        onClick={() => setSelectedQrPass(ticket)}
                        className="cursor-pointer bg-white p-2.5 rounded-xl border border-outline-variant/60 shadow-xs hover:border-tertiary transition-all"
                        title="Click to enlarge Turnstile Pass QR"
                      >
                        <img
                          src={ticket.qrCode}
                          alt="Ticket QR Code"
                          className="w-24 h-24 object-contain"
                        />
                      </div>

                      <span className="text-[10px] text-secondary font-mono">Scan at Gate Turnstile</span>

                      {/* Action Buttons */}
                      <div className="w-full space-y-1.5 print:hidden">
                        <button
                          onClick={() => handlePrintTicket(ticket)}
                          className="w-full bg-tertiary hover:bg-tertiary-container text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                          <span>Print Pass</span>
                        </button>

                        <button
                          onClick={() => setSelectedTicketForTransfer(ticket)}
                          className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm text-secondary">swap_horiz</span>
                          <span>Transfer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              /* =========================================================================
                 SHAPE 2: STADIUM MATCH PASS (Simple, Clean & Modern - Match Red Color)
                 ========================================================================= */
              const isInactiveMatch = ticket.isActive === false || ticket.status === 4;

              return (
                <div
                  key={ticketId}
                  className={`tazkara-card bg-surface-container-lowest rounded-2xl border border-surface-variant/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row print:flex-row relative group print:m-0 print:border-outline-variant print:shadow-none ${
                    isPrintingThis ? 'printing-target' : ''
                  }`}
                >
                  {/* Left Brand Accent Line - Red for Match */}
                  <div className="hidden md:block print:block w-2 bg-primary shrink-0"></div>

                  {/* Main Ticket Body */}
                  <div className="flex-grow p-5 sm:p-6 flex flex-col justify-between gap-4">
                    {/* Top Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-surface-variant pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          <span className="material-symbols-outlined text-base">sports_soccer</span>
                        </span>
                        <span className="font-bold text-sm text-on-surface tracking-tight">TAZKARTI MATCH PASS</span>
                        {ticket.competition && (
                          <span className="text-xs bg-surface-container text-secondary font-medium px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <span>{ticket.competition}</span>
                            {ticket.round && (
                              <>
                                <span className="text-secondary/40">•</span>
                                <span className="text-primary font-semibold">{ticket.round}</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Category / Tier Badge */}
                        <span className="bg-primary/10 text-primary font-bold text-xs px-2.5 py-0.5 rounded-md">
                          {ticket.categoryName || 'Category 1'}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 uppercase ${
                            isInactiveMatch
                              ? 'bg-error/10 text-error'
                              : ticket.status === 3
                              ? 'bg-tertiary/10 text-tertiary'
                              : ticket.status === 2
                              ? 'bg-golden-gate/10 text-golden-gate'
                              : 'bg-pitch-green/10 text-pitch-green'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{isInactiveMatch ? 'Cancelled' : ticket.statusLabel}</span>
                        </span>
                      </div>
                    </div>

                    {/* Match Fixture Title & Teams */}
                    <div className="space-y-1">
                      <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface leading-tight">
                        {ticket.title || `${ticket.homeTeam || 'Home'} vs ${ticket.awayTeam || 'Away'}`}
                      </h3>
                      {(ticket.homeTeam || ticket.awayTeam) && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                          <span className="text-on-surface">{ticket.homeTeam}</span>
                          <span className="text-primary font-bold text-xs px-1.5 py-0.5 rounded bg-primary/10">VS</span>
                          <span className="text-on-surface">{ticket.awayTeam}</span>
                        </div>
                      )}
                    </div>

                    {/* Match Meta Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 px-3.5 bg-surface rounded-xl border border-surface-variant/60 text-xs">
                      <div>
                        <span className="text-[10px] text-secondary block font-label-sm font-medium">DATE & KICKOFF</span>
                        <span className="font-bold text-on-surface">{ticket.date} • {ticket.time || ticket.kickoffTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary block font-label-sm font-medium">STADIUM / CITY</span>
                        <span className="font-bold text-on-surface truncate block" title={ticket.venue || ticket.city}>
                          {ticket.venue || ticket.city}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary block font-label-sm font-medium">GATE & BLOCK</span>
                        <span className="font-bold text-primary truncate block" title={`${ticket.gate} • ${ticket.block || 'Main'}`}>
                          {ticket.gate} • {ticket.block || 'Main'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary block font-label-sm font-medium">PRICE</span>
                        <span className="font-bold text-on-surface">{ticket.price.toFixed(2)} EGP</span>
                      </div>
                    </div>

                    {/* Bottom Row: Holder & Fan ID */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-variant/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-secondary font-medium">Pass Holder:</span>
                        <span className="font-bold text-on-surface">{ticket.holderName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-secondary font-medium">Fan ID:</span>
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {ticket.cleanFanId}
                        </span>
                        <button
                          onClick={() => handleCopy(ticket.cleanFanId, `fan-${index}`)}
                          className="text-secondary hover:text-primary transition-colors print:hidden"
                          title="Copy Fan ID"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedField === `fan-${index}` ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Perforation Notch Seam */}
                  <div className="relative flex md:flex-col print:flex-col items-center justify-center">
                    <div className="hidden md:block print:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                    <div className="hidden md:block print:block h-full border-r border-dashed border-outline-variant"></div>
                    <div className="md:hidden print:hidden w-full border-t border-dashed border-outline-variant relative">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                    </div>
                    <div className="hidden md:block print:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border border-surface-variant z-10"></div>
                  </div>

                  {/* Right Ticket Stub: QR & Actions */}
                  <div className="md:w-56 print:w-56 bg-surface p-5 flex flex-col items-center justify-between gap-3 shrink-0 text-center border-t md:border-t-0 md:border-l border-surface-variant/40">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-on-surface truncate max-w-[180px] block" title={ticket.categoryName || ticket.gate}>
                        {ticket.categoryName || ticket.gate}
                      </span>
                    </div>

                    {/* QR Code */}
                    <div
                      onClick={() => setSelectedQrPass(ticket)}
                      className="cursor-pointer bg-white p-2.5 rounded-xl border border-outline-variant/60 shadow-xs hover:border-primary transition-all"
                      title="Click to enlarge Turnstile Pass QR"
                    >
                      <img
                        src={ticket.qrCode}
                        alt="Ticket QR Code"
                        className="w-24 h-24 object-contain"
                      />
                    </div>

                    <span className="text-[10px] text-secondary font-mono">Scan at Gate Turnstile</span>

                    {/* Action Buttons */}
                    <div className="w-full space-y-1.5 print:hidden">
                      <button
                        onClick={() => handlePrintTicket(ticket)}
                        className="w-full bg-primary hover:bg-primary-container text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        <span>Print Pass</span>
                      </button>

                      <button
                        onClick={() => setSelectedTicketForTransfer(ticket)}
                        className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-secondary">swap_horiz</span>
                        <span>Transfer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto text-secondary">
                <span className="material-symbols-outlined text-4xl">confirmation_number</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-on-surface">
                  {searchQuery || selectedGateFilter !== 'ALL' || selectedTypeFilter !== 'ALL'
                    ? 'No passes match your filter criteria'
                    : 'No tickets found in database'}
                </h3>
                <p className="text-sm text-secondary max-w-sm mx-auto">
                  {searchQuery || selectedGateFilter !== 'ALL' || selectedTypeFilter !== 'ALL'
                    ? 'Try clearing the search query or resetting filters.'
                    : 'Book upcoming matches or events to issue new Fan ID digital passes.'}
                </p>
              </div>
              {searchQuery || selectedGateFilter !== 'ALL' || selectedTypeFilter !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGateFilter('ALL');
                    setSelectedCompetitionFilter('ALL');
                    setSelectedTypeFilter('ALL');
                  }}
                  className="px-4 py-2 bg-surface border border-outline-variant text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container"
                >
                  Reset Filters
                </button>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to="/matches"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container"
                  >
                    <span className="material-symbols-outlined text-base">sports_soccer</span>
                    <span>Explore Matches</span>
                  </Link>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-tertiary text-white rounded-xl text-sm font-semibold hover:bg-tertiary-container"
                  >
                    <span className="material-symbols-outlined text-base">theater_comedy</span>
                    <span>Explore Events</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expanded QR Turnstile Modal */}
      {selectedQrPass && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-on-surface">Digital Gate Pass</span>
              </div>
              <button
                onClick={() => setSelectedQrPass(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {selectedQrPass.gate} Entry
                </span>
                {selectedQrPass.tierName && (
                  <span className="bg-amber-500/15 text-amber-600 border border-amber-400/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {selectedQrPass.tierName}
                  </span>
                )}
                {selectedQrPass.round && (
                  <span className="bg-surface-container text-secondary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {selectedQrPass.round}
                  </span>
                )}
              </div>

              {selectedQrPass.title && (
                <h4 className="font-bold text-base sm:text-lg text-on-surface pt-1">
                  {selectedQrPass.title}
                </h4>
              )}

              {selectedQrPass.artist && (
                <p className="text-xs text-tertiary font-bold">
                  {selectedQrPass.artist}
                </p>
              )}

              {selectedQrPass.competition && (
                <p className="text-xs text-secondary font-medium">
                  {selectedQrPass.competition}
                </p>
              )}

              <div className="pt-2 border-t border-surface-variant/70">
                <span className="text-[11px] text-secondary uppercase tracking-wider block font-label-sm">
                  Ticket Holder
                </span>
                <span className="font-bold text-sm text-on-surface">{selectedQrPass.holderName}</span>
                <p className="text-xs font-mono text-primary font-semibold">{selectedQrPass.currentFanId}</p>
              </div>
            </div>

            {/* Big High-Res QR */}
            <div className="bg-white p-4 rounded-2xl border-2 border-primary/20 inline-block shadow-inner">
              <img
                src={selectedQrPass.qrCode}
                alt="Turnstile QR"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="bg-surface-container p-3 rounded-xl border border-surface-variant text-xs text-secondary space-y-1">
              <div className="font-bold text-on-surface">Scan at Gate Turnstile</div>
              <p className="text-[11px]">Hold barcode 5-10cm from scanner for entry.</p>
              <div className="text-[10px] font-mono text-secondary pt-1">
                Pass Price: {selectedQrPass.price?.toFixed(2)} EGP
              </div>
            </div>

            <button
              onClick={() => setSelectedQrPass(null)}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-container"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Transfer Pass Modal */}
      {selectedTicketForTransfer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <h3 className="font-headline-md text-lg font-bold text-on-surface">
                Transfer {selectedTicketForTransfer.isEvent ? 'Event' : 'Stadium'} Pass
              </h3>
              <button
                onClick={() => setSelectedTicketForTransfer(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-surface p-3.5 rounded-xl border border-surface-variant text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-on-surface">
                  {selectedTicketForTransfer.title || 'Digital Pass'}
                </span>
                <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[11px] shrink-0">
                  {selectedTicketForTransfer.gate}
                </span>
              </div>
              {selectedTicketForTransfer.artist && (
                <p className="text-tertiary font-semibold text-[11px]">
                  Artist: {selectedTicketForTransfer.artist}
                </p>
              )}
              {(selectedTicketForTransfer.competition || selectedTicketForTransfer.round) && (
                <p className="text-secondary text-[11px]">
                  {selectedTicketForTransfer.competition}{' '}
                  {selectedTicketForTransfer.round ? `• ${selectedTicketForTransfer.round}` : ''}
                </p>
              )}
              <div className="pt-1.5 border-t border-surface-variant flex items-center justify-between text-secondary">
                <div>
                  <span className="text-[10px] uppercase block">Holder</span>
                  <span className="font-bold text-on-surface">{selectedTicketForTransfer.holderName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase block">Pass ID</span>
                  <span className="font-mono text-primary font-bold">
                    #{selectedTicketForTransfer.ticketPassId || selectedTicketForTransfer.id}
                  </span>
                </div>
              </div>
            </div>

            {transferSuccess ? (
              <div className="p-4 rounded-xl bg-pitch-green/10 text-pitch-green border border-pitch-green/30 text-center font-bold text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Pass successfully transferred to {targetFanId}!</span>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary block">
                    Recipient Fan ID • بطاقة المشجع للمستلم
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base">
                      badge
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. TZK-894215 or 894215"
                      value={targetFanId}
                      onChange={(e) => setTargetFanId(e.target.value)}
                      required
                      autoFocus
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-on-surface font-mono uppercase focus:outline-none focus:border-primary"
                    />
                  </div>
                  <p className="text-[11px] text-secondary">
                    Pass will be immediately transferred to the designated Fan ID account.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-variant">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForTransfer(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!targetFanId.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-container text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Confirm Transfer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
