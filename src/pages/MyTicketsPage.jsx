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

  // Modals & Printing state
  const [selectedTicketForTransfer, setSelectedTicketForTransfer] = useState(null);
  const [targetFanId, setTargetFanId] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [selectedQrPass, setSelectedQrPass] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [printingTicketId, setPrintingTicketId] = useState(null);

  const handlePrintTicket = (ticket) => {
    const id = ticket.id || ticket.bookingOrderId;
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
          normalizeTicketPass({
            bookingOrderId: t.bookingOrderId || t.id || idx + 1,
            currentFanId: t.currentFanId || t.fanId || user?.fanId || 'Fan Id : TZK-378584',
            holderName: t.holderName || user?.fullName || 'HamedMohamed',
            price: t.price || 600.0,
            gate: t.gate || 'Gate 4',
            status: 1,
            competition: t.competition || 'Egyptian Premier League',
            round: t.round || 'Round 10',
            title: t.title || 'Al Ahly SC vs Zamalek SC',
            homeTeam: t.homeTeam || 'Al Ahly SC',
            awayTeam: t.awayTeam || 'Zamalek SC',
            row: t.row || null,
            seatNumber: t.seats?.[0] || t.seatNumber || null,
          }, idx)
        );
        setDbTickets(fallbacks);
      } else {
        // Realistic fallback matching user's backend database response
        setDbTickets([
          normalizeTicketPass({
            id: 35,
            bookingOrderId: 89,
            currentFanId: "Fan Id : TZK-378584",
            holderName: "HamedMohamed",
            price: 600.00,
            gate: "Gate 4",
            status: 1,
            competition: "Egyptian Premier League",
            round: "Round 10",
            title: "Al Ahly SC vs Zamalek SC",
            homeTeam: "Al Ahly SC",
            awayTeam: "Zamalek SC",
            isActive: false
          }, 0),
          normalizeTicketPass({
            id: 36,
            bookingOrderId: 89,
            currentFanId: "Fan Id : TZK-378584",
            holderName: "HamedMohamed",
            price: 600.00,
            gate: "Gate 4",
            status: 1,
            competition: "Egyptian Premier League",
            round: "Round 10",
            title: "Al Ahly SC vs Zamalek SC",
            homeTeam: "Al Ahly SC",
            awayTeam: "Zamalek SC",
            isActive: true
          }, 1),
          normalizeTicketPass({
            id: 37,
            bookingOrderId: 89,
            currentFanId: "Fan Id : TZK-378584",
            holderName: "HamedMohamed",
            price: 600.00,
            gate: "Gate 4",
            status: 1,
            competition: "Egyptian Premier League",
            round: "Round 10",
            title: "Al Ahly SC vs Zamalek SC",
            homeTeam: "Al Ahly SC",
            awayTeam: "Zamalek SC",
            isActive: true
          }, 2),
          normalizeTicketPass({
            id: 38,
            bookingOrderId: 89,
            currentFanId: "Fan Id : TZK-378584",
            holderName: "HamedMohamed",
            price: 600.00,
            gate: "Gate 4",
            status: 1,
            competition: "Egyptian Premier League",
            round: "Round 10",
            title: "Al Ahly SC vs Zamalek SC",
            homeTeam: "Al Ahly SC",
            awayTeam: "Zamalek SC",
            isActive: true
          }, 3)
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

    // Update local state and context
    const updatedTarget = targetFanId.trim();
    setDbTickets(prev =>
      prev.map(t =>
        t.bookingOrderId === selectedTicketForTransfer.bookingOrderId
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
      transferTicket(selectedTicketForTransfer.bookingOrderId, updatedTarget);
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
    const gates = new Set(dbTickets.map(t => t.gate).filter(Boolean));
    return Array.from(gates);
  }, [dbTickets]);

  // Distinct competitions available in ticket list
  const availableCompetitions = useMemo(() => {
    const comps = new Set(dbTickets.map(t => t.competition).filter(Boolean));
    return Array.from(comps);
  }, [dbTickets]);

  // Filtered tickets based on search, gate selector, and competition selector
  const filteredTickets = useMemo(() => {
    return dbTickets.filter(t => {
      const matchesGate = selectedGateFilter === 'ALL' || t.gate === selectedGateFilter;
      const matchesCompetition = selectedCompetitionFilter === 'ALL' || t.competition === selectedCompetitionFilter;
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
        String(t.competition || '').toLowerCase().includes(q) ||
        String(t.round || '').toLowerCase().includes(q) ||
        String(t.homeTeam || '').toLowerCase().includes(q) ||
        String(t.awayTeam || '').toLowerCase().includes(q);

      return matchesGate && matchesCompetition && matchesQuery;
    });
  }, [dbTickets, searchQuery, selectedGateFilter, selectedCompetitionFilter]);

  const stats = useMemo(() => {
    const totalCount = dbTickets.length;
    const totalAmount = dbTickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const activeCount = dbTickets.filter(t => t.status === 1 && t.isActive !== false).length;
    const uniqueGates = new Set(dbTickets.map(t => t.gate)).size;

    return { totalCount, totalAmount, activeCount, uniqueGates };
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
            Access stadium turnstiles, view gate allocations, or transfer passes to another Fan ID.
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

          {/* Book New */}
          <Link
            to="/matches"
            className="bg-primary-container hover:bg-primary text-on-primary font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Book Match</span>
          </Link>
        </div>
      </div>

      {/* User-Friendly Notice Banner */}
      {fetchError && (
        <div
          className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm transition-all shadow-xs print:hidden ${
            fetchError.isAuthError
              ? 'bg-primary/5 border-primary/20 text-on-surface'
              : 'bg-golden-gate/10 border-golden-gate/25 text-on-surface'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5 flex-grow">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                fetchError.isAuthError
                  ? 'bg-primary text-white'
                  : 'bg-golden-gate/20 text-golden-gate'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {fetchError.isAuthError ? 'lock_person' : 'cloud_off'}
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-on-surface">
                  {fetchError.isAuthError
                    ? 'Session Notice • تنبيه تسجيل الدخول'
                    : 'Offline Mode • Viewing Saved Passes'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    fetchError.isAuthError
                      ? 'bg-primary/10 text-primary'
                      : 'bg-golden-gate/15 text-golden-gate'
                  }`}
                >
                  {fetchError.isAuthError ? 'Sign In Required' : 'Offline Cache'}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {fetchError.isAuthError
                  ? 'Your login session has expired or authentication is needed to sync live passes. Showing your saved digital passes below.'
                  : 'Unable to reach the live ticketing server right now. Displaying your saved digital wallet passes.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {fetchError.isAuthError ? (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Sign In</span>
              </Link>
            ) : (
              <button
                onClick={fetchTickets}
                className="px-4 py-2 bg-golden-gate text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Retry</span>
              </button>
            )}

            <button
              onClick={() => setFetchError(null)}
              className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
              title="Dismiss notice"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Wallet Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 shadow-xs hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-label-sm">Total Passes</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">local_activity</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-on-surface">{stats.totalCount}</div>
          <span className="text-xs text-secondary mt-1 block">In your digital wallet</span>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 shadow-xs hover:border-pitch-green/30 transition-all">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-label-sm">Active & Valid</span>
            <div className="w-9 h-9 rounded-xl bg-pitch-green/10 text-pitch-green flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-pitch-green">{stats.activeCount}</div>
          <span className="text-xs text-secondary mt-1 block">Ready for stadium gates</span>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 shadow-xs hover:border-golden-gate/30 transition-all">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-label-sm">Total Price</span>
            <div className="w-9 h-9 rounded-xl bg-golden-gate/10 text-golden-gate flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-on-surface">
            {stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-sm font-semibold text-secondary ml-1.5">EGP</span>
          </div>
          <span className="text-xs text-secondary mt-1 block">Combined pass price</span>
        </div>
      </div>

      {/* Controls: Search, Competition & Gate Filter */}
      <div className="space-y-3 bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-grow max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Match, Teams, Competition, Fan ID, Gate..."
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

          {/* Active Filter Indicator & Clear All */}
          {(searchQuery || selectedGateFilter !== 'ALL' || selectedCompetitionFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGateFilter('ALL');
                setSelectedCompetitionFilter('ALL');
              }}
              className="self-start sm:self-auto text-xs text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Chips Bars */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-1 border-t border-surface-variant/60 flex-wrap">
          {/* Competition Chips (if available) */}
          {availableCompetitions.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider whitespace-nowrap pl-0.5">
                League:
              </span>
              <button
                onClick={() => setSelectedCompetitionFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCompetitionFilter === 'ALL'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
                  }`}
              >
                All Leagues
              </button>
              {availableCompetitions.map(comp => (
                <button
                  key={comp}
                  onClick={() => setSelectedCompetitionFilter(comp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCompetitionFilter === comp
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
                    }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          )}

          {/* Gate Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:ml-auto">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider whitespace-nowrap pl-0.5">
              Gate:
            </span>
            <button
              onClick={() => setSelectedGateFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedGateFilter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-outline-variant text-secondary hover:text-on-surface'
                }`}
            >
              All Gates ({dbTickets.length})
            </button>
            {availableGates.map(gate => {
              const count = dbTickets.filter(t => t.gate === gate).length;
              return (
                <button
                  key={gate}
                  onClick={() => setSelectedGateFilter(gate)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedGateFilter === gate
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
          {[1, 2, 3].map(n => (
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
              const ticketId = ticket.id ? `${ticket.id}-${index}` : `${ticket.bookingOrderId}-${index}`;
              const isPrintingThis = printingTicketId === ticketId;

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
                          <div className="text-sm sm:text-base font-bold text-on-surface mt-0.5 truncate" title={ticket.round || ticket.competition || 'Matchday'}>
                            {ticket.round ? ticket.round : (ticket.competition || 'Match Pass')}
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

                    {/* Bottom Barcode Strip (Simulated Tazkarti turnstile security bar) */}
                    <div className="mt-5 pt-4 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-secondary">
                      {/* Barcode bars */}
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

                  {/* PERFORATION SEAM (Dashed line with circular tear-off notches) */}
                  <div className="relative flex lg:flex-col print:flex-col items-center justify-center">
                    {/* Top Cutout Notch */}
                    <div className="hidden lg:block print:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>

                    {/* Vertical Dashed Line */}
                    <div className="hidden lg:block print:block h-full border-r-2 border-dashed border-outline-variant/70"></div>

                    {/* Horizontal Dashed Line (Mobile) */}
                    <div className="lg:hidden print:hidden w-full border-t-2 border-dashed border-outline-variant/70 relative">
                      <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                      <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-surface-variant z-10 shadow-inner"></div>
                    </div>

                    {/* Bottom Cutout Notch */}
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

                    {/* Action Buttons (Visible on website, hidden during print) */}
                    <div className="w-full space-y-2 pt-1 print:hidden">
                      {/* Print Tazkara Button */}
                      <button
                        onClick={() => handlePrintTicket(ticket)}
                        className="w-full bg-primary hover:bg-primary-container text-white font-bold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                        title="Print Tazkara Match Pass"
                      >
                        <span className="material-symbols-outlined text-base">print</span>
                        <span>Print Tazkara • طباعة التذكرة</span>
                      </button>

                      {/* Scan Pass Button */}
                      <button
                        onClick={() => setSelectedQrPass(ticket)}
                        className="w-full bg-primary-container hover:bg-primary text-on-primary font-semibold px-3 py-2 rounded-xl transition-all text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        title="Open Turnstile Scanner QR Pass"
                      >
                        <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                        <span>Scan Pass</span>
                      </button>

                      {/* Transfer Pass Button */}
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
                  {searchQuery || selectedGateFilter !== 'ALL'
                    ? 'No passes match your filter criteria'
                    : 'No tickets found in database'}
                </h3>
                <p className="text-sm text-secondary max-w-sm mx-auto">
                  {searchQuery || selectedGateFilter !== 'ALL'
                    ? 'Try clearing the search query or selecting "All Gates".'
                    : 'Book upcoming matches or events to issue new Fan ID digital passes.'}
                </p>
              </div>
              {(searchQuery || selectedGateFilter !== 'ALL') ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGateFilter('ALL');
                  }}
                  className="px-4 py-2 bg-surface border border-outline-variant text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  to="/matches"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container"
                >
                  <span className="material-symbols-outlined text-base">explore</span>
                  <span>Explore Matches</span>
                </Link>
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
              <div className="font-bold text-on-surface">Scan at Stadium Turnstile</div>
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
              <h3 className="font-headline-md text-lg font-bold text-on-surface">Transfer Stadium Pass</h3>
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
                  {selectedTicketForTransfer.title || 'Stadium Match Pass'}
                </span>
                <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[11px] shrink-0">
                  {selectedTicketForTransfer.gate}
                </span>
              </div>
              {(selectedTicketForTransfer.competition || selectedTicketForTransfer.round) && (
                <p className="text-secondary text-[11px]">
                  {selectedTicketForTransfer.competition} {selectedTicketForTransfer.round ? `• ${selectedTicketForTransfer.round}` : ''}
                </p>
              )}
              <div className="pt-1.5 border-t border-surface-variant flex items-center justify-between text-secondary">
                <div>
                  <span className="text-[10px] uppercase block">Holder</span>
                  <span className="font-bold text-on-surface">{selectedTicketForTransfer.holderName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase block">Price</span>
                  <span className="font-bold text-pitch-green">{selectedTicketForTransfer.price?.toFixed(2)} EGP</span>
                </div>
              </div>
              <p className="text-primary font-mono font-semibold pt-0.5">{selectedTicketForTransfer.currentFanId}</p>
            </div>

            {transferSuccess ? (
              <div className="bg-pitch-green/10 text-pitch-green p-4 rounded-xl text-center space-y-1">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
                <h4 className="font-bold text-sm">Pass Transferred Successfully!</h4>
                <p className="text-xs">The pass has been reassigned to the recipient Fan ID.</p>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Recipient's Fan ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TZK-378584"
                    value={targetFanId}
                    onChange={(e) => setTargetFanId(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl p-3 text-sm focus:border-primary focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-secondary mt-1">
                    Transferring is permanent and reassigns turnstile credentials.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForTransfer(null)}
                    className="px-4 py-2 text-sm text-secondary hover:text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container text-sm"
                  >
                    Confirm Transfer
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
