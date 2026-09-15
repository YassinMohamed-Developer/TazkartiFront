import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMatchById } from '../services/authService';
import { useBooking } from '../context/BookingContext';

export const MatchBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectMatchBooking } = useBooking();

  const [match, setMatch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMatch = async () => {
      try {
        const selectedMatch = await getMatchById(id);

        if (!selectedMatch) {
          throw new Error('This match could not be found.');
        }

        if (isMounted) {
          setMatch(selectedMatch);
          setSelectedCategory(selectedMatch.categories[0] || null);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.message || 'Unable to load this match right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMatch();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Initial seat map state (50 seats, 5 rows of 10)
  // Pre-seed some sold seats
  const [soldSeats] = useState(() => {
    const sold = new Set([3, 7, 12, 18, 22, 29, 34, 41, 47]);
    return sold;
  });

  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([14]); // Pre-select seat 14 as per design
  const [zoomLevel, setZoomLevel] = useState(1);

  const toggleSeat = (seatNum) => {
    if (soldSeats.has(seatNum)) return;
    if (selectedSeatNumbers.includes(seatNum)) {
      setSelectedSeatNumbers(prev => prev.filter(s => s !== seatNum));
    } else {
      if (selectedSeatNumbers.length >= 4) {
        alert('Maximum 4 tickets can be booked per Fan ID for security regulations.');
        return;
      }
      setSelectedSeatNumbers(prev => [...prev, seatNum].sort((a, b) => a - b));
    }
  };

  const getRowName = (seatNum) => {
    const rowIdx = Math.floor((seatNum - 1) / 10);
    return ['Row A', 'Row B', 'Row C', 'Row D', 'Row E'][rowIdx] || 'Row A';
  };

  const selectedSeatsData = selectedSeatNumbers.map(seatNum => ({
    seatNumber: `Seat ${seatNum}`,
    row: getRowName(seatNum),
    price: selectedCategory?.price || 0
  }));

  const totalPrice = selectedSeatNumbers.length * (selectedCategory?.price || 0);

  const handleProceedToPayment = () => {
    if (selectedSeatNumbers.length === 0) {
      alert('Please select at least 1 seat before proceeding.');
      return;
    }

    const resolvedMatchId = Number.isInteger(Number(match.matchId)) && Number(match.matchId) > 0
      ? Number(match.matchId)
      : (Number.isInteger(Number(match.id)) && Number(match.id) > 0
          ? Number(match.id)
          : (typeof match.id === 'string' && match.id.startsWith('match-')
              ? Number(match.id.replace('match-', '')) + 1
              : 2));

    const resolvedVenueId = Number.isInteger(Number(match.venueId)) && Number(match.venueId) > 0
      ? Number(match.venueId)
      : 1;

    const resolvedCategoryId = Number.isInteger(Number(selectedCategory?.categoryId)) && Number(selectedCategory?.categoryId) > 0
      ? Number(selectedCategory.categoryId)
      : (Number.isInteger(Number(selectedCategory?.id)) && Number(selectedCategory?.id) > 0
          ? Number(selectedCategory.id)
          : 2);

    if (selectedCategory?.available && selectedCategory.available < selectedSeatNumbers.length) {
      alert(`Only ${selectedCategory.available} tickets are available for this category.`);
      return;
    }

    const bookingMatch = {
      ...match,
      matchId: resolvedMatchId,
      venueId: resolvedVenueId,
    };

    const bookingCategory = {
      ...selectedCategory,
      categoryId: resolvedCategoryId,
    };

    selectMatchBooking(bookingMatch, bookingCategory, selectedSeatsData);
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 text-secondary">
        Loading match and ticket categories...
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="material-symbols-outlined text-primary text-5xl">event_busy</span>
        <p className="text-secondary">{error || 'This match is not available.'}</p>
        <Link to="/matches" className="bg-primary text-white font-semibold px-5 py-2.5 rounded-xl">
          Back to Matches
        </Link>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="material-symbols-outlined text-secondary text-5xl">confirmation_number</span>
        <h1 className="text-xl font-bold text-on-surface">No ticket categories available</h1>
        <p className="text-secondary">This match is currently sold out or has no available seating categories.</p>
        <Link to="/matches" className="bg-primary text-white font-semibold px-5 py-2.5 rounded-xl">
          Back to Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col pt-8 pb-24 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full gap-8">
      {/* Progress Stepper */}
      <div className="w-full flex items-center justify-between text-label-sm font-label-sm relative max-w-3xl mx-auto mb-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-container -z-10"></div>
        
        {/* Step 1 */}
        <Link to="/matches" className="flex flex-col items-center gap-2 bg-background px-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
          </div>
          <span className="text-secondary group-hover:text-primary transition-colors">Select Match</span>
        </Link>

        {/* Step 2 */}
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center font-bold">
            2
          </div>
          <span className="text-primary font-bold">Choose Seats</span>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center gap-2 bg-background px-2 opacity-50">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            3
          </div>
          <span className="text-secondary">Payment</span>
        </div>

        {/* Step 4 */}
        <div className="flex flex-col items-center gap-2 bg-background px-2 opacity-50">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            4
          </div>
          <span className="text-secondary">Confirmation</span>
        </div>
      </div>

      {/* Match Header */}
      <div className="glass-panel p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 mb-4 shadow-sm border border-surface-variant">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              {match.league}
            </span>
            <span className="text-xs text-secondary font-label-sm">{match.round}</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{match.title}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-secondary font-body-md text-body-md text-sm">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>calendar_today</span>
            <span>{match.date}, {match.time}</span>
            <span className="mx-2">•</span>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>location_on</span>
            <span>{match.venue}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-lg border border-surface-variant">
            <span className="w-3 h-3 rounded-full bg-pitch-green"></span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">{match.availability}</span>
          </div>
        </div>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-secondary whitespace-nowrap">Select Tier:</span>
        {match.categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedCategory.id === cat.id
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface border-surface-variant hover:border-primary/50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
            <span>{cat.name}</span>
            <span className="font-bold">({cat.price} EGP)</span>
            <span className="text-[10px] opacity-75">{cat.available.toLocaleString()} left</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full min-h-[600px]">
        {/* Stadium Map & Seat Selector Area */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col relative h-full border border-surface-variant shadow-sm">
          {/* Pitch Indicator */}
          <div className="bg-pitch-green text-white text-center py-2 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-inner">
            <span className="material-symbols-outlined text-sm">sports_soccer</span>
            <span>⚽ PITCH DIRECTION / FOOTBALL FIELD ⚽</span>
          </div>

          {/* Interactive View */}
          <div className="flex-grow bg-surface-container-lowest relative overflow-hidden flex items-center justify-center p-4 md:p-8 min-h-[420px]">
            {/* Background stadium graphics */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply pointer-events-none"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADfW9_m5QrKbAJiPy-AjNySQenObNEvc_3e42ast73i0qD3ECqg2tCuapHjcN_PhQaCpSz8r5I9Ujjbz01gTSY3lVa_I-p2bBPLOU_xerbwmi-Jycwa6CYrfolLfCUSJX-R891FTl-TKhYGSa5GskdSVsPwRY2AjDT3YWFeHlgIw3r1y_6lKdiZRsoNuNRiED3nCZQLktC7V_GPx16EUJte1FZ3iB71yjuYbAVAe1uLQ47eQahsoX69A')"
              }}
            />

            {/* Seat Grid Box */}
            <div
              className="relative z-10 w-full max-w-lg bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/40 rounded-xl p-4 md:p-6 flex flex-col gap-4 shadow-lg transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="text-center font-label-sm text-label-sm text-secondary border-b border-surface-variant pb-2 flex items-center justify-between">
                <span className="font-semibold text-on-surface">{selectedCategory.name}</span>
                <span className="text-xs text-primary font-bold">{selectedCategory.price} EGP / seat</span>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((rowIndex) => {
                  const rowLetters = ['Row A', 'Row B', 'Row C', 'Row D', 'Row E'];
                  return (
                    <div key={rowIndex} className="flex items-center gap-2">
                      <span className="w-10 text-[10px] font-bold text-secondary font-label-sm text-right">
                        {rowLetters[rowIndex]}
                      </span>
                      <div className="flex-1 grid grid-cols-10 gap-1.5">
                        {Array.from({ length: 10 }).map((_, colIndex) => {
                          const seatNum = rowIndex * 10 + colIndex + 1;
                          const isSold = soldSeats.has(seatNum);
                          const isSelected = selectedSeatNumbers.includes(seatNum);

                          return (
                            <button
                              key={seatNum}
                              type="button"
                              disabled={isSold}
                              onClick={() => toggleSeat(seatNum)}
                              title={
                                isSold
                                  ? `Seat ${seatNum} (Sold Out)`
                                  : `${rowLetters[rowIndex]}, Seat ${seatNum} (${selectedCategory.price} EGP)`
                              }
                              className={`seat w-full aspect-square rounded border flex items-center justify-center text-[9px] font-bold font-label-sm transition-all ${
                                isSold
                                  ? 'unavailable'
                                  : isSelected
                                  ? 'selected'
                                  : 'border-secondary-container bg-surface text-secondary hover:border-primary'
                              }`}
                            >
                              {colIndex + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center flex-wrap gap-4 md:gap-6 mt-3 font-label-sm text-xs text-secondary border-t border-surface-variant pt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-secondary-container bg-surface"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-primary-container"></div>
                  <span className="font-semibold text-primary">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-surface-variant bg-surface-variant opacity-50"></div>
                  <span>Sold Out</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Overlays */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-20">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.3))}
              className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-md border border-surface-variant flex items-center justify-center text-on-surface hover:text-primary transition-colors"
              title="Zoom in"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.8))}
              className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-md border border-surface-variant flex items-center justify-center text-on-surface hover:text-primary transition-colors"
              title="Zoom out"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="glass-panel rounded-xl p-6 flex flex-col h-full sticky top-24 border border-surface-variant shadow-sm">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-surface-variant pb-4 font-bold">
            Selection Summary
          </h2>

          <div className="flex-grow flex flex-col gap-4">
            {/* Selected Area card */}
            <div className="bg-surface-container-low p-4 rounded-lg border border-surface-variant flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">Selected Area</span>
                  <p className="font-body-md text-body-md font-semibold text-on-surface">{selectedCategory.name}</p>
                  <p className="text-[11px] text-secondary mt-1">Entry: {selectedCategory.gate}</p>
                </div>
                <span className="material-symbols-outlined text-primary text-2xl">stadium</span>
              </div>
            </div>

            {/* Selected Seats List */}
            <div className="space-y-2 max-h-56 overflow-y-auto" id="selected-seats-list">
              {selectedSeatsData.length > 0 ? (
                selectedSeatsData.map((seat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-surface-container-lowest border border-surface-variant p-3 rounded-lg shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-lg">chair</span>
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface font-semibold">
                          {seat.row}, {seat.seatNumber}
                        </p>
                        <p className="font-label-sm text-[11px] text-secondary">Standard Adult Ticket</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-body-md text-body-md font-bold text-on-surface">{seat.price} EGP</p>
                      <button
                        onClick={() => toggleSeat(selectedSeatNumbers[idx])}
                        className="text-secondary hover:text-error p-1 transition-colors"
                        title="Remove seat"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-secondary text-xs italic bg-surface-container-low rounded-lg p-4">
                  No seats selected yet. Click any available seat on the stadium grid.
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 text-xs text-secondary flex items-start gap-2 mt-auto">
              <span className="material-symbols-outlined text-primary text-base">gpp_good</span>
              <span>Each ticket will be cryptographically linked to your Fan ID for gate verification.</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-6 pt-6 border-t border-surface-variant flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-body-lg text-body-lg text-secondary">
                Total ({selectedSeatNumbers.length} {selectedSeatNumbers.length === 1 ? 'ticket' : 'tickets'})
              </span>
              <span className="font-headline-md text-headline-md font-bold text-primary">{totalPrice} EGP</span>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={selectedSeatNumbers.length === 0}
              className={`w-full font-body-md text-body-md py-4 rounded-xl transition-all shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex justify-center items-center gap-2 font-semibold ${
                selectedSeatNumbers.length > 0
                  ? 'bg-primary-container hover:bg-primary text-on-primary active:scale-[0.98]'
                  : 'bg-surface-variant text-secondary cursor-not-allowed opacity-60'
              }`}
            >
              <span>Continue to Payment</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <p className="text-center font-label-sm text-label-sm text-secondary flex items-center justify-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
              <span>Secure transaction via Fan ID</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
