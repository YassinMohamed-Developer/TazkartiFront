import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { currentBooking, completePayment } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const booking = currentBooking;

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'instapay' | 'meeza' | 'fawry' | 'wallet'
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('4123 •••• •••• 8842');
  const [expiry, setExpiry] = useState('11/28');
  const [cvv, setCvv] = useState('892');
  const [instaPayHandle, setInstaPayHandle] = useState('ahmed.hassan@instapay');
  const [walletPhone, setWalletPhone] = useState('01001234567');
  const [fawryCode] = useState(() => Math.floor(10000000 + Math.random() * 90000000).toString());
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      showToast('Please sign in before completing your booking.', 'warning');
      navigate('/login', {
        state: {
          from: '/checkout',
          notice: 'Please sign in before completing your booking.',
        },
      });
      return;
    }

    if (!booking) {
      setError('Your booking session has expired. Please select your tickets again.');
      return;
    }

    setIsProcessing(true);

    try {
      const confirmedTicket = await completePayment(
        paymentMethod,
        paymentMethod === 'fawry' ? fawryCode : null
      );

      if (!confirmedTicket?.id) {
        throw new Error('The booking was not confirmed. Please try again.');
      }

      navigate(`/confirmation/${confirmedTicket.id}`);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to complete your booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="material-symbols-outlined text-primary text-5xl">shopping_cart</span>
        <h1 className="text-xl font-bold text-on-surface">No active booking</h1>
        <p className="text-secondary">Choose a match or event before opening checkout.</p>
        <Link to="/matches" className="bg-primary text-white font-semibold px-5 py-2.5 rounded-xl">
          Browse Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col pt-8 pb-24 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full gap-8">
      {/* Progress Stepper */}
      <div className="w-full flex items-center justify-between text-label-sm font-label-sm relative max-w-3xl mx-auto mb-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-container -z-10"></div>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
          </div>
          <span className="text-secondary">Select Event</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
          </div>
          <span className="text-secondary">Seats / Tier</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center font-bold">
            3
          </div>
          <span className="text-primary font-bold">Payment</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-background px-2 opacity-50">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            4
          </div>
          <span className="text-secondary">Confirmation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Payment Options */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-surface-variant shadow-sm space-y-6">
            <div>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface">Secure Payment Gateway</h2>
              <p className="font-body-md text-secondary text-sm">Choose your preferred Egyptian payment method.</p>
            </div>

            {error && (
              <div role="alert" className="bg-primary/10 border border-primary/30 text-primary rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Cards */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${paymentMethod === 'card'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-surface-variant bg-surface hover:border-primary/50 text-secondary'
                  }`}
              >
                <span className="material-symbols-outlined text-2xl">credit_card</span>
                <span className="text-xs">Bank Card</span>
              </button>

              {/* InstaPay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${paymentMethod === 'instapay'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-surface-variant bg-surface hover:border-primary/50 text-secondary'
                  }`}
              >
                <span className="material-symbols-outlined text-2xl text-pitch-green">account_balance</span>
                <span className="text-xs">InstaPay</span>
              </button>

              {/* Meeza */}
              <button
                type="button"
                onClick={() => setPaymentMethod('meeza')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${paymentMethod === 'meeza'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-surface-variant bg-surface hover:border-primary/50 text-secondary'
                  }`}
              >
                <span className="material-symbols-outlined text-2xl text-tertiary">contactless</span>
                <span className="text-xs">Meeza Card</span>
              </button>

              {/* Fawry */}
              <button
                type="button"
                onClick={() => setPaymentMethod('fawry')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${paymentMethod === 'fawry'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-surface-variant bg-surface hover:border-primary/50 text-secondary'
                  }`}
              >
                <span className="material-symbols-outlined text-2xl text-golden-gate">store</span>
                <span className="text-xs">Fawry Pay</span>
              </button>

              {/* Smart Wallets */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${paymentMethod === 'wallet'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-surface-variant bg-surface hover:border-primary/50 text-secondary'
                  }`}
              >
                <span className="material-symbols-outlined text-2xl text-error">phone_android</span>
                <span className="text-xs">Vodafone Cash</span>
              </button>
            </div>

            {/* Payment Method Forms */}
            <form onSubmit={handlePay} className="space-y-6 pt-4 border-t border-surface-variant">
              {/* Credit Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-secondary">Accepted: Visa, Mastercard, Meeza</span>
                    <span className="material-symbols-outlined text-pitch-green text-lg fill">verified_user</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      defaultValue={user?.fullName || 'Citizen Fan'}
                      required
                      className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="w-full bg-surface border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-sm font-mono focus:border-primary focus:outline-none"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                        credit_card
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                        className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-sm font-mono text-center focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">CVV / Security Code</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-sm font-mono text-center focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* InstaPay Form */}
              {paymentMethod === 'instapay' && (
                <div className="space-y-4 bg-pitch-green/5 p-5 rounded-2xl border border-pitch-green/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-pitch-green text-3xl">account_balance</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">InstaPay Instant Transfer (IPN)</h4>
                      <p className="text-xs text-secondary">National Bank of Egypt & Central Bank of Egypt Network</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">InstaPay Address (IPA)</label>
                    <input
                      type="text"
                      value={instaPayHandle}
                      onChange={(e) => setInstaPayHandle(e.target.value)}
                      placeholder="username@instapay"
                      className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl p-3 text-sm focus:border-pitch-green focus:outline-none font-mono"
                    />
                  </div>

                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-pitch-green/20 text-xs text-secondary flex items-center justify-between">
                    <span>Amount to be debited:</span>
                    <span className="font-bold text-pitch-green text-base">{booking.totalAmount} EGP</span>
                  </div>
                </div>
              )}

              {/* Meeza Form */}
              {paymentMethod === 'meeza' && (
                <div className="space-y-4 bg-tertiary/5 p-5 rounded-2xl border border-tertiary/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary text-3xl">contactless</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Meeza National Payment Card (ميزة)</h4>
                      <p className="text-xs text-secondary">Supports all government and bank-issued Meeza cards.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">16-Digit Meeza Number</label>
                    <input
                      type="text"
                      defaultValue="5078 0012 3456 7890"
                      className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl p-3 text-sm focus:border-tertiary focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Fawry Form */}
              {paymentMethod === 'fawry' && (
                <div className="space-y-4 bg-golden-gate/10 p-5 rounded-2xl border border-golden-gate/40">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-golden-gate text-3xl">store</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Fawry Pay Reference Code</h4>
                      <p className="text-xs text-secondary">Pay at any Fawry retail kiosk or POS terminal across Egypt.</p>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-golden-gate/40 text-center space-y-1">
                    <span className="text-xs text-secondary font-label-sm uppercase">Your Fawry Code</span>
                    <div className="font-mono text-2xl font-bold text-primary tracking-widest">{fawryCode}</div>
                    <p className="text-[11px] text-secondary">Valid for 24 hours. Tickets hold automatically.</p>
                  </div>
                </div>
              )}

              {/* Smart Wallets Form */}
              {paymentMethod === 'wallet' && (
                <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">phone_android</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Mobile Smart Wallet</h4>
                      <p className="text-xs text-secondary">Vodafone Cash, Orange Cash, Etisalat Cash, WE Pay</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Mobile Wallet Number</label>
                    <input
                      type="tel"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      placeholder="010 1234 5678"
                      className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl p-3 text-sm focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-secondary">You will receive a prompt on your phone to enter your wallet PIN.</p>
                </div>
              )}

              {/* Fan ID Verification Disclaimer */}
              <div className="flex items-start gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-variant">
                <span className="material-symbols-outlined text-primary text-xl mt-0.5">badge</span>
                <div className="text-xs text-secondary">
                  {isAuthenticated ? (
                    <>
                      <span className="font-bold text-on-surface">Fan ID Bound Ticket:</span> These tickets will be registered under <span className="font-semibold text-on-surface">{user?.fullName || 'Citizen Fan'} ({user?.fanId || 'TZK-2026'})</span>. National ID must be presented upon venue entry.
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-golden-gate">Fan ID Sign-In Required:</span> Tickets must be cryptographically bound to an official Fan ID. Please sign in to complete your booking.
                    </>
                  )}
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    showToast('Please sign in before completing your booking.', 'warning');
                    navigate('/login', {
                      state: {
                        from: '/checkout',
                        notice: 'Please sign in before completing your booking.',
                      },
                    });
                  }
                }}
                disabled={isProcessing}
                className="w-full bg-primary-container hover:bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                    <span>Processing Payment & Generating Pass...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">lock</span>
                    <span>Pay {booking.totalAmount} EGP & Issue Pass</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-2xl border border-surface-variant shadow-sm sticky top-24 space-y-6">
            <h3 className="font-headline-md text-lg font-bold text-on-surface border-b border-surface-variant pb-3">
              Order Summary
            </h3>

            <div className="space-y-4">
              <div className="bg-surface p-4 rounded-xl border border-surface-variant space-y-2">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {booking.type === 'match' ? 'Match Ticket' : 'Event Pass'}
                </span>
                <h4 className="font-bold text-on-surface text-base">{booking.item.title}</h4>
                <p className="text-xs text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span>{booking.item.date} • {booking.item.time}</span>
                </p>
                <p className="text-xs text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">stadium</span>
                  <span>{booking.item.venue}</span>
                </p>
              </div>

              {/* Seats breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-secondary uppercase font-label-sm tracking-wider">
                  Reserved Seats ({booking.seats.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {booking.seats.map((seat, i) => (
                    <div key={i} className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded-lg border border-surface-variant text-xs">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-base">chair</span>
                        <span className="font-semibold text-on-surface">{seat.row} {seat.seatNumber}</span>
                      </div>
                      <span className="font-bold text-on-surface">{seat.price} EGP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-3 border-t border-surface-variant text-xs text-secondary">
                <div className="flex justify-between">
                  <span>Tickets Subtotal</span>
                  <span>{booking.totalAmount} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT & Government Service Tax</span>
                  <span>0 EGP (Included)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-variant flex justify-between items-center">
                <span className="font-bold text-base text-on-surface">Total to Pay</span>
                <span className="font-headline-md text-2xl font-bold text-primary">{booking.totalAmount} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
