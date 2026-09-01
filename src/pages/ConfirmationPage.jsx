import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export const ConfirmationPage = () => {
  const { bookingId } = useParams();
  const { tickets } = useBooking();
  const { user } = useAuth();
  const ticketRef = useRef();

  const ticket = tickets.find(t => t.id === bookingId) || tickets[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-grow flex flex-col pt-8 pb-24 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full gap-8">
      {/* Progress Stepper */}
      <div className="w-full flex items-center justify-between text-label-sm font-label-sm relative max-w-3xl mx-auto mb-4 print:hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-container -z-10"></div>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-status-success text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-secondary">Select Event</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-status-success text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-secondary">Seats / Tier</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-status-success text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-secondary">Payment</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center font-bold">
            4
          </div>
          <span className="text-primary font-bold">Confirmation</span>
        </div>
      </div>

      {/* Success Notification */}
      <div className="bg-status-success/10 border border-status-success/30 rounded-2xl p-6 md:p-8 text-center max-w-3xl mx-auto w-full space-y-3 print:hidden shadow-sm">
        <div className="w-16 h-16 rounded-full bg-status-success text-white flex items-center justify-center mx-auto shadow-md">
          <span className="material-symbols-outlined text-3xl fill">verified</span>
        </div>
        <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
          Booking Confirmed Successfully!
        </h1>
        <p className="font-body-md text-secondary text-sm max-w-lg mx-auto">
          Your official Fan ID match pass has been issued and linked to your profile. An SMS confirmation was sent to your registered phone.
        </p>
        <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg border border-status-success/30 font-mono text-sm font-bold text-on-surface shadow-xs">
          <span>Booking Reference:</span>
          <span className="text-primary">{ticket.bookingReference || ticket.id}</span>
        </div>
      </div>

      {/* Official Printable E-Ticket Pass */}
      <div
        ref={ticketRef}
        className="max-w-3xl mx-auto w-full bg-surface-container-lowest border border-surface-variant rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-black"
      >
        {/* Ticket Top Banner */}
        <div className="bg-primary text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xl tracking-tight">Tazkarti</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-label-sm uppercase">Official Match Pass</span>
            </div>
            <p className="text-xs text-white/80">
              {ticket.competition
                ? `${ticket.competition}${ticket.round ? ` • ${ticket.round}` : ''}`
                : ticket.subtitle}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-white/80 uppercase font-label-sm block">Ticket Reference</span>
            <span className="font-mono font-bold text-base">{ticket.bookingReference || ticket.id}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Title & Venue */}
          <div className="border-b border-surface-variant pb-4">
            <h2 className="font-headline-md text-2xl font-bold text-on-surface">{ticket.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm text-secondary">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <div>
                  <span className="text-[11px] block font-semibold text-secondary">Date & Time</span>
                  <span className="font-bold text-on-surface">{ticket.date} • {ticket.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">stadium</span>
                <div>
                  <span className="text-[11px] block font-semibold text-secondary">Venue</span>
                  <span className="font-bold text-on-surface">{ticket.venue}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">door_front</span>
                <div>
                  <span className="text-[11px] block font-semibold text-secondary">Entrance Gate</span>
                  <span className="font-bold text-primary">{ticket.gate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seating & Fan ID Card in ticket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low p-5 rounded-xl border border-surface-variant">
            {/* Holder info */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider font-label-sm">
                Pass Holder (Fan ID)
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0 bg-surface-container">
                  <img
                    src={user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfEi-JMbLcmZW_6rD67Pyr-uhdmKzgBTpCCFpqq5h4QJY0PnvkWWa8jUB1j9seQpGEWThxgEoTTG57SifuNQ__G7RbtqgJW5ck3gvsE3XkOldtTjl71rPOz5kUvhOSyvPOt_hS8GaYCvzTQUfukDGcQZ5toXnbC4pIfsmm1EAX5GojaZ_5Xv9lV0yDtJWRAEffhLeu-wAZNQrSr7Ynj2OmoruglCuLwkqBSDlsM5gWHVYTx95CJvtqXg'}
                    alt={user?.fullName || 'Pass Holder'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{user?.fullName || 'Citizen Fan'}</h4>
                  <p className="text-xs text-secondary font-mono">{user?.fanId || 'TZK-2026'}</p>
                  <p className="text-[11px] text-secondary font-mono">ID: {user?.nationalId || '---'}</p>
                </div>
              </div>
            </div>

            {/* Seat & Block */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider font-label-sm">
                Seating Assignment
              </span>
              <div>
                <p className="font-bold text-sm text-on-surface">{ticket.block}</p>
                <p className="text-base font-bold text-primary mt-0.5">{ticket.seats.join(' • ')}</p>
                <span className="text-[11px] text-pitch-green font-semibold">Verified Electronic Pass</span>
              </div>
            </div>
          </div>

          {/* QR Code & Barcode Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-dashed border-outline-variant pt-6">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>DYNAMIC GATE ACCESS QR</span>
              </span>
              <p className="text-xs text-secondary max-w-xs">
                Present this barcode or your live dashboard QR code at turnstile optical scanners.
              </p>
              <div className="font-mono text-xs text-secondary mt-2">
                PAID: {ticket.price} EGP via {ticket.paymentMethod?.toUpperCase() || 'INSTAPAY'}
              </div>
            </div>

            <div className="p-3 bg-white border border-surface-variant rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={user?.qrCode || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBer5HRCfR9UYy3WLm51yAkpxZEfvYzGP5J27c1CJMSJ7S0LLcbfSYef9s-yCbtOqiB1eG3R_yzDhpV4NX7N4hMJ3Q68SV6w_IZ_KD0lAfimhgv47pQk_8Jo2p7vyWugSEYnVQUd4Bijl6tDUfsyJt4YljoOQICaCcEfiDeQQtx4aWrg9Wd5V6k4c3fBEorNqG9CAMqFrcxCWJQY_uUAuV0o3lv_wviFWDu8xfQG9gPUitQd9jWeZaLkw'}
                alt="Match Pass QR"
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto w-full print:hidden">
        <button
          onClick={handlePrint}
          className="bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm text-sm"
        >
          <span className="material-symbols-outlined text-lg">print</span>
          <span>Print / Save PDF Pass</span>
        </button>

        <Link
          to="/dashboard"
          className="bg-primary-container hover:bg-primary text-on-primary font-bold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg text-sm"
        >
          <span className="material-symbols-outlined text-lg">qr_code_2</span>
          <span>Open Fan ID Live Pass</span>
        </Link>

        <Link
          to="/tickets"
          className="text-secondary hover:text-primary font-semibold text-sm px-4 py-3"
        >
          View All Tickets →
        </Link>
      </div>
    </div>
  );
};
