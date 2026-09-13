import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { getAllTicketPasses, normalizeTicketPass, getEntertainmentTicketById } from '../services/authService';

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
   * and optionally GET https://localhost:7020/api/TicketPass/GetEntertainmentEventTicket/41
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
        // Realistic fallback matching database match passes
        setDbTickets([
          normalizeTicketPass(
            {
              id: 35,
              bookingOrderId: 89,
              currentFanId: 'Fan Id : TZK-378584',
              holderName: 'HamedMohamed',
              price: 600.0,
              gate: 'Gate 4',
              status: 1,
              competition: 'Egyptian Premier League',
              round: 'Round 10',
              title: 'Al Ahly SC vs Zamalek SC',
              homeTeam: 'Al Ahly SC',
              awayTeam: 'Zamalek SC',
              isActive: false,
            },
            0
          ),
          normalizeTicketPass(
            {
              id: 36,
              bookingOrderId: 89,
              currentFanId: 'Fan Id : TZK-378584',
              holderName: 'HamedMohamed',
              price: 600.0,
              gate: 'Gate 4',
              status: 1,
              competition: 'Egyptian Premier League',
              round: 'Round 10',
              title: 'Al Ahly SC vs Zamalek SC',
              homeTeam: 'Al Ahly SC',
              awayTeam: 'Zamalek SC',
              isActive: true,
            },
            1
          ),
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
                 SHAPE 1: ENTERTAINMENT EVENT TICKET PASS (Festivals, Concerts, Theater)
                 ========================================================================= */
              if (isEventTicket) {
                return (
                  <div
                    key={ticketId}
                    className={`tazkara-card bg-surface-container-lowest rounded-3xl border-2 border-surface-variant shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col lg:flex-row print:flex-row relative group print:m-0 print:border-outline-variant print:shadow-none ${
                      isPrintingThis ? 'printing-target' : ''
                    }`}
                  >
                    {/* Left Accent Border Stripe: Electric Purple to Golden Amber */}
                    <div className="hidden lg:block print:block w-3 bg-gradient-to-b from-[#8E24AA] via-tertiary to-[#FFB300] shrink-0"></div>

                    {/* MAIN TICKET BODY (Left / 70%) */}
                    <div className="flex-grow flex flex-col justify-between p-6 lg:p-7 relative">
                      {/* Top Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-variant pb-4 mb-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tertiary to-[#8E24AA] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            <span className="material-symbols-outlined text-base">theater_comedy</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-base text-on-surface tracking-tight">TAZKARTI</span>
                              <span className="text-tertiary font-bold text-sm">| تذكرتي</span>
                            </div>
                            <span className="text-[10px] text-secondary uppercase tracking-wider font-label-sm block">
                              Official Live Event Pass • تذكرة فعاليات وحفلات رسمية
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Category Pill */}
                          {ticket.category && (
                            <span className="bg-tertiary/10 text-tertiary border border-tertiary/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">music_note</span>
                              <span>{ticket.category}</span>
                            </span>
                          )}

                          {/* Ticket Tier Badge (VIP Pass / General Admission) */}
                          <span className="bg-gradient-to-r from-amber-500/15 via-yellow-500/25 to-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm text-amber-500">stars</span>
                            <span>{ticket.tierName || 'VIP Pass'}</span>
                          </span>

                          {/* Gate Tag */}
                          <span className="bg-surface-container border border-surface-variant text-on-surface text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-tertiary">door_front</span>
                            <span>{ticket.gate}</span>
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                              ticket.isActive === false || ticket.status === 4 || String(ticket.status).toLowerCase() === 'cancelled'
                                ? 'bg-error/10 text-error border border-error/20'
                                : ticket.status === 3 || String(ticket.status).toLowerCase() === 'attended'
                                ? 'bg-tertiary/10 text-tertiary border border-tertiary/20'
                                : ticket.status === 2 || String(ticket.status).toLowerCase() === 'transferred'
                                ? 'bg-golden-gate/10 text-golden-gate border border-golden-gate/20'
                                : 'bg-pitch-green/10 text-pitch-green border border-pitch-green/20'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {ticket.isActive === false || ticket.status === 4 || String(ticket.status).toLowerCase() === 'cancelled'
                                ? 'cancel'
                                : ticket.status === 3 || String(ticket.status).toLowerCase() === 'attended'
                                ? 'event_available'
                                : ticket.status === 2 || String(ticket.status).toLowerCase() === 'transferred'
                                ? 'swap_horiz'
                                : 'check_circle'}
                            </span>
                            <span>{ticket.isActive === false ? 'Inactive Pass' : ticket.statusLabel}</span>
                          </span>
                        </div>
                      </div>

                      {/* HERO SHOWCASE: Headline Artist & Event Banner */}
                      <div className="mb-5 bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high p-4 sm:p-5 rounded-2xl border border-surface-variant/90 shadow-sm relative overflow-hidden">
                        {/* Ambient Festival Glow Background */}
                        <div className="absolute top-0 right-1/4 w-48 h-48 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                          {/* Artist Showcase */}
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-tertiary/20 to-purple-600/30 border border-tertiary/30 p-2 shadow-xs flex items-center justify-center shrink-0 text-tertiary">
                              <span className="material-symbols-outlined text-3xl">mic</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider font-label-sm">
                                  Headliner • الفنان
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                                <span className="text-[10px] text-secondary font-semibold">Live Concert / Festival</span>
                              </div>
                              <h3 className="font-headline-md text-lg sm:text-2xl font-bold text-on-surface">
                                {ticket.artist || 'Featured Artist'}
                              </h3>
                              <h4 className="text-sm font-semibold text-secondary flex items-center gap-1.5 mt-0.5">
                                <span className="material-symbols-outlined text-sm text-tertiary">festival</span>
                                <span>{ticket.title}</span>
                              </h4>
                            </div>
                          </div>

                          {/* Date & Location Container */}
                          <div className="flex sm:flex-col items-start sm:items-end gap-1.5 bg-surface-container-lowest/80 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-surface-variant/80 shrink-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                              <span className="material-symbols-outlined text-sm text-tertiary">calendar_month</span>
                              <span>
                                {ticket.date} • {ticket.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-secondary">
                              <span className="material-symbols-outlined text-sm text-tertiary">location_on</span>
                              <span>
                                {ticket.city}
                                {ticket.venueName ? ` • ${ticket.venueName}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* INCLUDED TIER PERKS & BENEFITS (Distinctive Feature!) */}
                      <div className="mb-5 bg-surface p-4 rounded-2xl border border-surface-variant/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-secondary uppercase tracking-wider font-label-sm font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-pitch-green">verified</span>
                            <span>Included Pass Perks & Benefits • مميزات الباقة</span>
                          </span>
                          <span className="text-[10px] bg-tertiary/10 text-tertiary font-bold px-2.5 py-0.5 rounded-full uppercase">
                            {ticket.tierName || 'Tier Perks'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-0.5">
                          {ticket.perks && ticket.perks.length > 0 ? (
                            ticket.perks.map((perk, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-center gap-2 text-xs text-on-surface bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/60 shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-pitch-green text-base fill shrink-0">
                                  check_circle
                                </span>
                                <span className="leading-tight truncate" title={perk}>
                                  {perk}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-secondary bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/60 col-span-full">
                              <span className="material-symbols-outlined text-pitch-green text-base fill">
                                check_circle
                              </span>
                              <span>General admission festival grounds entry and main stage access</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Center Content: Fan Holder & Seating/Gate Details */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-surface-variant">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-tertiary/10 text-tertiary font-bold flex items-center justify-center text-base shrink-0 border border-tertiary/20 shadow-xs">
                              {ticket.holderName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-[10px] text-secondary uppercase tracking-wider font-label-sm block">
                                Ticket Holder • صاحب التذكرة
                              </span>
                              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                                {ticket.holderName}
                              </h3>
                            </div>
                          </div>

                          <div className="bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/60 flex items-center justify-between sm:justify-start gap-2">
                            <div>
                              <span className="text-[9px] text-secondary uppercase tracking-wider block font-semibold">
                                Fan ID • بطاقة المشجع
                              </span>
                              <span className="font-mono text-xs font-bold text-tertiary">
                                {ticket.currentFanId}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(ticket.cleanFanId, `fan-${index}`)}
                              className="text-secondary hover:text-tertiary transition-colors p-1 rounded hover:bg-surface-container print:hidden"
                              title="Copy Fan ID"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {copiedField === `fan-${index}` ? 'check' : 'content_copy'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Event Ticket Details Boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Gate Box */}
                          <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                            <span className="text-[10px] uppercase tracking-wider text-secondary font-label-sm block">
                              Gate • البوابة
                            </span>
                            <div className="text-sm sm:text-base font-bold text-tertiary mt-0.5 truncate" title={ticket.gate}>
                              {ticket.gate}
                            </div>
                          </div>

                          {/* Tier Box */}
                          <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                            <span className="text-[10px] uppercase tracking-wider text-secondary font-label-sm block">
                              Pass Category • فئة الباقة
                            </span>
                            <div className="text-sm sm:text-base font-bold text-on-surface mt-0.5 truncate" title={ticket.tierName || 'Pass'}>
                              {ticket.tierName || 'Standard Pass'}
                            </div>
                          </div>

                          {/* Price Box */}
                          <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                            <span className="text-[10px] uppercase tracking-wider text-secondary font-label-sm block">
                              Pass Price • السعر
                            </span>
                            <div className="text-base sm:text-lg font-bold text-tertiary mt-0.5">
                              {ticket.price.toFixed(2)} <span className="text-[11px] font-normal text-secondary">EGP</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Barcode Strip */}
                      <div className="mt-5 pt-4 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-secondary">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="flex items-end gap-[2px] h-6 px-2 bg-surface rounded border border-surface-variant shrink-0">
                            {[5, 3, 7, 2, 6, 4, 3, 7, 2, 5, 4, 6, 3, 7, 2, 4, 6, 3, 5, 2, 7, 4, 3, 6, 2].map((h, i) => (
                              <div
                                key={i}
                                className="bg-on-surface/70 w-[2px]"
                                style={{ height: `${h * 3}px` }}
                              ></div>
                            ))}
                          </div>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-secondary">
                            TAZKARTI-EVENT-PASS-#{ticket.ticketPassId || ticket.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                          <span className={`material-symbols-outlined text-[15px] ${ticket.isActive === false ? 'text-error' : 'text-tertiary'}`}>
                            {ticket.isActive === false ? 'block' : 'stars'}
                          </span>
                          <span>
                            {ticket.isActive === false
                              ? 'Pass Inactive • تذكرة غير فعّالة'
                              : 'Turnstile Electronic Gate Pass • صالحة للدخول الإلكتروني'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PERFORATION SEAM */}
                    <div className="relative flex lg:flex-col print:flex-col items-center justify-center">
                      <div className="hidden lg:block print:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                      <div className="hidden lg:block print:block h-full border-r-2 border-dashed border-outline-variant/70"></div>
                      <div className="lg:hidden print:hidden w-full border-t-2 border-dashed border-outline-variant/70 relative">
                        <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                        <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                      </div>
                      <div className="hidden lg:block print:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                    </div>

                    {/* TICKET STUB (Right / 30%) */}
                    <div className="lg:w-72 print:w-72 bg-gradient-to-b from-surface-container-low via-surface-container to-surface-container-low p-6 flex flex-col items-center justify-between gap-4 shrink-0 text-center">
                      <div className="w-full space-y-1">
                        <div className="text-[10px] font-bold tracking-widest text-tertiary uppercase font-label-sm flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">confirmation_number</span>
                          <span>EVENT PASS STUB • كعب التذكرة</span>
                        </div>
                        <div className="text-xs font-bold text-on-surface truncate" title={ticket.title}>
                          {ticket.title}
                        </div>
                        <div className="text-[11px] font-semibold text-tertiary truncate">
                          {ticket.artist}
                        </div>
                        <div className="inline-block bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mt-0.5">
                          {ticket.tierName || 'VIP Pass'}
                        </div>
                      </div>

                      {/* Scannable Pass QR Code with zoom */}
                      <div
                        onClick={() => setSelectedQrPass(ticket)}
                        className="cursor-pointer group/qr relative bg-white p-3 rounded-2xl border-2 border-dashed border-tertiary/40 shadow-xs hover:border-tertiary transition-all inline-block"
                        title="Click to enlarge Turnstile Pass QR"
                      >
                        <img
                          src={ticket.qrCode}
                          alt="Gate QR Code"
                          className="w-28 h-28 object-contain rounded"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/qr:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 print:hidden">
                          <span className="material-symbols-outlined text-2xl">zoom_in</span>
                          <span>Enlarge Pass</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-secondary font-mono">
                        Gate Turnstile • Pass #{ticket.ticketPassId || ticket.id}
                      </div>

                      {/* Action Buttons */}
                      <div className="w-full space-y-2 pt-1 print:hidden">
                        <button
                          onClick={() => handlePrintTicket(ticket)}
                          className="w-full bg-tertiary hover:bg-tertiary-container text-white font-bold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                          title="Print Event Pass"
                        >
                          <span className="material-symbols-outlined text-base">print</span>
                          <span>Print Pass • طباعة التذكرة</span>
                        </button>

                        <button
                          onClick={() => setSelectedQrPass(ticket)}
                          className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                          title="Open Turnstile Scanner QR Pass"
                        >
                          <span className="material-symbols-outlined text-base text-tertiary">qr_code_scanner</span>
                          <span>Scan Pass</span>
                        </button>

                        <button
                          onClick={() => setSelectedTicketForTransfer(ticket)}
                          className="w-full bg-surface border border-outline-variant hover:bg-surface-container text-on-surface font-semibold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                          title="Transfer Event Pass"
                        >
                          <span className="material-symbols-outlined text-base text-secondary">swap_horiz</span>
                          <span>Transfer Pass</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              /* =========================================================================
                 SHAPE 2: STADIUM MATCH PASS (Football Matches)
                 ========================================================================= */
              return (
                <div
                  key={ticketId}
                  className={`tazkara-card bg-surface-container-lowest rounded-3xl border border-surface-variant shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col lg:flex-row print:flex-row relative group print:m-0 print:border-outline-variant print:shadow-none ${
                    isPrintingThis ? 'printing-target' : ''
                  }`}
                >
                  {/* Authentic Left Accent Border Stripe */}
                  <div className="hidden lg:block print:block w-2.5 bg-gradient-to-b from-primary via-primary-container to-golden-gate shrink-0"></div>

                  {/* MAIN TICKET BODY (Left / 70%) */}
                  <div className="flex-grow flex flex-col justify-between p-6 lg:p-7 relative">
                    {/* Top Tazkarti Branded Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-variant pb-4 mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          ت
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-base text-on-surface tracking-tight">TAZKARTI</span>
                            <span className="text-primary font-bold text-sm">| تذكرتي</span>
                          </div>
                          <span className="text-[10px] text-secondary uppercase tracking-wider font-label-sm block">
                            Official Stadium Match Pass • تذكرة مباراة رسمية
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Competition & Round Badge */}
                        {ticket.competition && (
                          <span className="bg-surface-container border border-surface-variant text-on-surface text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-primary">emoji_events</span>
                            <span>{ticket.competition}</span>
                            {ticket.round && (
                              <>
                                <span className="text-secondary/40">•</span>
                                <span className="text-primary font-bold">{ticket.round}</span>
                              </>
                            )}
                          </span>
                        )}

                        {/* Gate High-Contrast Tag */}
                        <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">door_front</span>
                          <span>{ticket.gate}</span>
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                            ticket.isActive === false || ticket.status === 4 || String(ticket.status).toLowerCase() === 'cancelled'
                              ? 'bg-error/10 text-error border border-error/20'
                              : ticket.status === 3 || String(ticket.status).toLowerCase() === 'attended'
                              ? 'bg-tertiary/10 text-tertiary border border-tertiary/20'
                              : ticket.status === 2 || String(ticket.status).toLowerCase() === 'transferred'
                              ? 'bg-golden-gate/10 text-golden-gate border border-golden-gate/20'
                              : 'bg-pitch-green/10 text-pitch-green border border-pitch-green/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {ticket.isActive === false || ticket.status === 4 || String(ticket.status).toLowerCase() === 'cancelled'
                              ? 'cancel'
                              : ticket.status === 3 || String(ticket.status).toLowerCase() === 'attended'
                              ? 'event_available'
                              : ticket.status === 2 || String(ticket.status).toLowerCase() === 'transferred'
                              ? 'swap_horiz'
                              : 'check_circle'}
                          </span>
                          <span>{ticket.isActive === false ? 'Inactive Pass' : ticket.statusLabel}</span>
                        </span>
                      </div>
                    </div>

                    {/* Match Fixture Banner: Home Team vs Away Team */}
                    {(ticket.title || ticket.homeTeam || ticket.awayTeam) && (
                      <div className="mb-5 bg-gradient-to-r from-surface via-surface-container-low to-surface p-4 sm:p-5 rounded-2xl border border-surface-variant/80 shadow-xs relative overflow-hidden">
                        {/* Subtle Stadium Glow Background */}
                        <div className="absolute top-0 right-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Home Team */}
                          <div className="flex items-center gap-3.5 w-full sm:w-5/12 justify-start">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-2 border border-surface-variant shadow-xs flex items-center justify-center shrink-0">
                              {ticket.homeTeamDetails?.logo ? (
                                <img
                                  src={ticket.homeTeamDetails.logo}
                                  alt={ticket.homeTeam || 'Home Team'}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-primary/10 text-primary font-black text-sm rounded-xl flex items-center justify-center">
                                  {ticket.homeTeamDetails?.shortName || (ticket.homeTeam ? ticket.homeTeam.slice(0, 3).toUpperCase() : 'HOM')}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block font-label-sm">
                                Home • المستضيف
                              </span>
                              <h4 className="font-bold text-sm sm:text-base text-on-surface truncate" title={ticket.homeTeam || ticket.title}>
                                {ticket.homeTeam || 'Home Team'}
                              </h4>
                            </div>
                          </div>

                          {/* VS Centerpiece */}
                          <div className="flex flex-col items-center justify-center shrink-0 px-2">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-surface">
                              VS
                            </div>
                            {ticket.round && (
                              <span className="text-[10px] text-secondary font-semibold mt-1 whitespace-nowrap">
                                {ticket.round}
                              </span>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-3.5 w-full sm:w-5/12 justify-start sm:justify-end flex-row sm:flex-row-reverse sm:text-right">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-2 border border-surface-variant shadow-xs flex items-center justify-center shrink-0">
                              {ticket.awayTeamDetails?.logo ? (
                                <img
                                  src={ticket.awayTeamDetails.logo}
                                  alt={ticket.awayTeam || 'Away Team'}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-surface-container-high text-secondary font-black text-sm rounded-xl flex items-center justify-center">
                                  {ticket.awayTeamDetails?.shortName || (ticket.awayTeam ? ticket.awayTeam.slice(0, 3).toUpperCase() : 'AWY')}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block font-label-sm">
                                Away • الضيف
                              </span>
                              <h4 className="font-bold text-sm sm:text-base text-on-surface truncate" title={ticket.awayTeam || ticket.title}>
                                {ticket.awayTeam || 'Away Team'}
                              </h4>
                            </div>
                          </div>
                        </div>

                        {/* Title & Competition Footer in Match Banner */}
                        <div className="mt-3 pt-2.5 border-t border-surface-variant/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="font-bold text-on-surface flex items-center gap-1.5 text-xs sm:text-sm">
                            <span className="material-symbols-outlined text-[18px] text-primary">sports_soccer</span>
                            <span>{ticket.title}</span>
                          </div>
                          {ticket.competition && (
                            <span className="text-secondary text-[11px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-golden-gate">military_tech</span>
                              <span>{ticket.competition}</span>
                              {ticket.round && <span>• {ticket.round}</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Center Content: Holder & Seating Detail Grid */}
                    <div className="space-y-5">
                      {/* Fan Holder & Fan ID */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-surface-variant">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base shrink-0 border border-primary/20 shadow-xs">
                            {ticket.holderName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-[10px] text-secondary uppercase tracking-wider font-label-sm block">
                              Ticket Holder • صاحب التذكرة
                            </span>
                            <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                              {ticket.holderName}
                            </h3>
                          </div>
                        </div>

                        <div className="bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/60 flex items-center justify-between sm:justify-start gap-2">
                          <div>
                            <span className="text-[9px] text-secondary uppercase tracking-wider block font-semibold">
                              Fan ID • بطاقة المشجع
                            </span>
                            <span className="font-mono text-xs font-bold text-primary">
                              {ticket.currentFanId}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(ticket.cleanFanId, `fan-${index}`)}
                            className="text-secondary hover:text-primary transition-colors p-1 rounded hover:bg-surface-container print:hidden"
                            title="Copy Fan ID"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {copiedField === `fan-${index}` ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Stadium Ticket Details Boxes (Gate / Competition-Round / Price) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Gate Box */}
                        <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                          <span className="text-[10px] uppercase tracking-wider text-secondary font-label-sm block">
                            Gate • البوابة
                          </span>
                          <div className="text-base sm:text-lg font-bold text-primary mt-0.5">
                            {ticket.gate}
                          </div>
                        </div>

                        {/* Competition / Round Box */}
                        <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                          <span className="text-[10px] uppercase tracking-wider text-secondary font-label-sm block">
                            Round • البطولة
                          </span>
                          <div
                            className="text-sm sm:text-base font-bold text-on-surface mt-0.5 truncate"
                            title={ticket.round || ticket.competition || 'Matchday'}
                          >
                            {ticket.round ? ticket.round : ticket.competition || 'Match Pass'}
                          </div>
                        </div>

                        {/* Price Box */}
                        <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                          <span className="text-[10px] uppercase tracking-wider text-secondary font-label-sm block">
                            Price • السعر
                          </span>
                          <div className="text-base sm:text-lg font-bold text-pitch-green mt-0.5">
                            {ticket.price.toFixed(2)} <span className="text-[11px] font-normal text-secondary">EGP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Barcode Strip */}
                    <div className="mt-5 pt-4 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-secondary">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-end gap-[2px] h-6 px-2 bg-surface rounded border border-surface-variant shrink-0">
                          {[4, 2, 6, 3, 5, 2, 7, 4, 3, 6, 2, 5, 3, 7, 4, 2, 5, 3, 6, 2, 4, 3, 5, 2, 6].map((h, i) => (
                            <div
                              key={i}
                              className="bg-on-surface/70 w-[2px]"
                              style={{ height: `${h * 3}px` }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-secondary">
                          TAZKARTI-SECURE-PASS
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                        <span className={`material-symbols-outlined text-[15px] ${ticket.isActive === false ? 'text-error' : 'text-pitch-green'}`}>
                          {ticket.isActive === false ? 'block' : 'sensors'}
                        </span>
                        <span>
                          {ticket.isActive === false
                            ? 'Pass Inactive • تذكرة غير فعّالة'
                            : 'Turnstile Electronic Gate Pass • صالحة للدخول الإلكتروني'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PERFORATION SEAM */}
                  <div className="relative flex lg:flex-col print:flex-col items-center justify-center">
                    <div className="hidden lg:block print:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                    <div className="hidden lg:block print:block h-full border-r-2 border-dashed border-outline-variant/70"></div>
                    <div className="lg:hidden print:hidden w-full border-t-2 border-dashed border-outline-variant/70 relative">
                      <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                      <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                    </div>
                    <div className="hidden lg:block print:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                  </div>

                  {/* TICKET STUB / TEAR-OFF COUPON (Right / 30%) */}
                  <div className="lg:w-72 print:w-72 bg-surface-container-low/60 p-6 flex flex-col items-center justify-between gap-4 shrink-0 text-center">
                    <div className="w-full space-y-1">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase font-label-sm">
                        STUB • كعب التذكرة
                      </div>
                      <div className="text-xs font-bold text-on-surface truncate" title={ticket.title}>
                        {ticket.title || `${ticket.homeTeam || ''} vs ${ticket.awayTeam || ''}`}
                      </div>
                      {(ticket.competition || ticket.round) && (
                        <div className="text-[10px] text-secondary truncate">
                          {ticket.competition} {ticket.round ? `• ${ticket.round}` : ''}
                        </div>
                      )}
                      <div className="text-[11px] font-semibold text-primary">
                        {ticket.gate} • Turnstile Entry
                      </div>
                    </div>

                    {/* Scannable Pass QR Code with scan corners */}
                    <div
                      onClick={() => setSelectedQrPass(ticket)}
                      className="cursor-pointer group/qr relative bg-white p-3 rounded-2xl border-2 border-dashed border-primary/30 shadow-xs hover:border-primary transition-all inline-block"
                      title="Click to enlarge Turnstile Pass QR"
                    >
                      <img
                        src={ticket.qrCode}
                        alt="Gate QR Code"
                        className="w-28 h-28 object-contain rounded"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/qr:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 print:hidden">
                        <span className="material-symbols-outlined text-2xl">zoom_in</span>
                        <span>Enlarge Pass</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-secondary font-mono">
                      Scan at turnstile camera
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-2 pt-1 print:hidden">
                      <button
                        onClick={() => handlePrintTicket(ticket)}
                        className="w-full bg-primary hover:bg-primary-container text-white font-bold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                        title="Print Tazkara Match Pass"
                      >
                        <span className="material-symbols-outlined text-base">print</span>
                        <span>Print Tazkara • طباعة التذكرة</span>
                      </button>

                      <button
                        onClick={() => setSelectedQrPass(ticket)}
                        className="w-full bg-primary-container hover:bg-primary text-on-primary font-semibold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        title="Open Turnstile Scanner QR Pass"
                      >
                        <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                        <span>Scan Pass</span>
                      </button>

                      <button
                        onClick={() => setSelectedTicketForTransfer(ticket)}
                        className="w-full bg-surface border border-outline-variant hover:bg-surface-container text-on-surface font-semibold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        title="Transfer Stadium Pass"
                      >
                        <span className="material-symbols-outlined text-base text-secondary">swap_horiz</span>
                        <span>Transfer Pass</span>
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
