import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicketById, verifyTicket, createTeam } from '../services/authService';

/**
 * Public Ticket Verification Page
 * Route: /ticket/verify/:bookingOrderId
 *
 * When a fan or staff scans the QR code on a Tazkara,
 * this page loads and shows the ticket's current status and match details.
 */
export const TicketVerifyPage = () => {
  const params = useParams();
  const ticketId = params.id || params.bookingOrderId;

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Gate verification state
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await getTicketById(ticketId);
        if (response?.isSuccess && response?.data) {
          setTicket(response.data);
        } else {
          setFetchError({
            message: response?.message || 'Ticket not found in database',
            isAuth: false,
          });
        }
      } catch (err) {
        const isAuth =
          err?.statusCode === 401 ||
          String(err?.message || '').toLowerCase().includes('session') ||
          String(err?.message || '').toLowerCase().includes('sign in') ||
          String(err?.message || '').toLowerCase().includes('authentication') ||
          String(err?.message || '').toLowerCase().includes('unauthorized');

        setFetchError({
          message: isAuth
            ? 'Your login session has expired or authentication is required to verify this ticket.'
            : (err?.message || 'Unable to connect to Tazkarti services'),
          isAuth,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleVerifyAtGate = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    try {
      const response = await verifyTicket(ticketId);
      setVerifyResult(response);

      // If verification changed status, re-fetch ticket to update display
      if (response?.isSuccess) {
        try {
          const refreshed = await getTicketById(ticketId);
          if (refreshed?.isSuccess && refreshed?.data) {
            setTicket(refreshed.data);
          }
        } catch (_) {
          // Ignore refresh error
        }
      }
    } catch (err) {
      setVerifyError(err?.message || 'Verification request failed');
      setVerifyResult({ isSuccess: false, message: err?.message || 'Verification request failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusConfig = (status, isActive) => {
    const sNum = Number.isInteger(Number(status)) ? Number(status) : null;
    const sStr = String(status || '').toLowerCase().trim();

    const isConfirmed = sNum === 1 || sStr === '1' || sStr === 'confirmed' || sStr === 'active';
    const isTransferred = sNum === 2 || sStr === '2' || sStr === 'transferred';
    const isAttended = sNum === 3 || sStr === '3' || sStr === 'attended';
    const isCancelled = sNum === 4 || sStr === '4' || sStr === 'cancelled' || sStr === 'canceled';

    if (isAttended) {
      return {
        label: 'ATTENDED',
        labelAr: 'تم الحضور',
        icon: 'event_available',
        color: 'text-tertiary',
        bgColor: 'bg-tertiary/10',
        borderColor: 'border-tertiary/30',
        ringColor: 'ring-tertiary/20',
      };
    }
    if (isTransferred) {
      return {
        label: 'TRANSFERRED',
        labelAr: 'تم التحويل',
        icon: 'swap_horiz',
        color: 'text-golden-gate',
        bgColor: 'bg-golden-gate/10',
        borderColor: 'border-golden-gate/30',
        ringColor: 'ring-golden-gate/20',
      };
    }
    if (isCancelled) {
      return {
        label: 'CANCELLED',
        labelAr: 'تذكرة ملغاة',
        icon: 'cancel',
        color: 'text-error',
        bgColor: 'bg-error/10',
        borderColor: 'border-error/30',
        ringColor: 'ring-error/20',
      };
    }
    if (isActive !== false && (isConfirmed || sNum === 1)) {
      return {
        label: 'VALID & ACTIVE',
        labelAr: 'صالحة وفعّالة',
        icon: 'verified',
        color: 'text-pitch-green',
        bgColor: 'bg-pitch-green/10',
        borderColor: 'border-pitch-green/30',
        ringColor: 'ring-pitch-green/20',
      };
    }
    return {
      label: 'INACTIVE',
      labelAr: 'غير فعّالة',
      icon: 'block',
      color: 'text-secondary',
      bgColor: 'bg-surface-container',
      borderColor: 'border-outline-variant',
      ringColor: 'ring-secondary/20',
    };
  };

  const homeTeamDetails = ticket?.homeTeam ? createTeam(ticket.homeTeam) : null;
  const awayTeamDetails = ticket?.awayTeam ? createTeam(ticket.awayTeam) : null;
  const statusConfig = ticket ? getStatusConfig(ticket.status, ticket.isActive) : null;

  return (
    <div className="flex-grow max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 w-full space-y-6">

      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-base">qr_code_scanner</span>
          <span>Ticket Verification • التحقق من التذكرة</span>
        </div>
        <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
          Tazkarti Pass Verification
        </h1>
        <p className="text-sm text-secondary max-w-md mx-auto">
          Verify the authenticity and current status of this stadium match pass.
        </p>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-3xl p-8 space-y-6 animate-pulse">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-surface-container-high"></div>
          </div>
          <div className="h-6 bg-surface-container-high rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-surface-container-high rounded w-3/4 mx-auto"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-surface-container-high rounded-2xl"></div>
            <div className="h-16 bg-surface-container-high rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* Error / Auth Required State */}
      {!isLoading && fetchError && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 text-center space-y-5 shadow-sm">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-4 shadow-xs ${
              fetchError.isAuth
                ? 'bg-primary/10 text-primary ring-primary/20'
                : 'bg-golden-gate/10 text-golden-gate ring-golden-gate/20'
            }`}
          >
            <span className="material-symbols-outlined text-4xl">
              {fetchError.isAuth ? 'lock_person' : 'error_outline'}
            </span>
          </div>
          <div className="space-y-1.5">
            <h2 className="font-bold text-xl text-on-surface">
              {fetchError.isAuth ? 'Authentication Required' : 'Ticket Not Found'}
            </h2>
            <p className="text-sm text-secondary max-w-sm mx-auto">
              {fetchError.message}
            </p>
            <p className="text-xs text-secondary font-mono mt-2">
              Ticket Pass Reference: #{ticketId}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {fetchError.isAuth ? (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container transition-all flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Sign In to Verify</span>
              </Link>
            ) : (
              <Link
                to="/tickets"
                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">confirmation_number</span>
                <span>View My Tickets</span>
              </Link>
            )}
            <Link
              to="/"
              className="px-5 py-2.5 border border-outline-variant text-on-surface font-semibold rounded-xl text-sm hover:bg-surface-container transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      )}

      {/* Ticket Found — Verification Card */}
      {!isLoading && ticket && (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-3xl overflow-hidden shadow-lg">

          {/* Status Hero Section */}
          <div className={`${statusConfig.bgColor} border-b ${statusConfig.borderColor} p-6 md:p-8 text-center space-y-4`}>
            <div className={`w-20 h-20 rounded-full ${statusConfig.bgColor} ${statusConfig.color} flex items-center justify-center mx-auto ring-4 ${statusConfig.ringColor} shadow-sm`}>
              <span className="material-symbols-outlined text-5xl">{statusConfig.icon}</span>
            </div>
            <div>
              <h2 className={`font-bold text-2xl ${statusConfig.color} tracking-wide`}>
                {statusConfig.label}
              </h2>
              <p className={`text-base font-semibold ${statusConfig.color} opacity-80`}>
                {statusConfig.labelAr}
              </p>
            </div>
          </div>

          {/* Match Fixture Banner */}
          <div className="p-5 md:p-7 space-y-5">
            {(ticket.homeTeam || ticket.awayTeam) && (
              <div className="bg-gradient-to-r from-surface via-surface-container-low to-surface p-5 rounded-2xl border border-surface-variant/80 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Home Team */}
                  <div className="flex items-center gap-3 w-full sm:w-5/12 justify-start">
                    <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-surface-variant shadow-xs flex items-center justify-center shrink-0">
                      {homeTeamDetails?.logo ? (
                        <img src={homeTeamDetails.logo} alt={ticket.homeTeam} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 text-primary font-black text-sm rounded-xl flex items-center justify-center">
                          {homeTeamDetails?.shortName || ticket.homeTeam?.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block">Home • المستضيف</span>
                      <h4 className="font-bold text-base text-on-surface truncate">{ticket.homeTeam}</h4>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center shadow-md border-2 border-surface">VS</div>
                    {ticket.round && (
                      <span className="text-[10px] text-secondary font-semibold mt-1">{ticket.round}</span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-3 w-full sm:w-5/12 justify-start sm:justify-end flex-row sm:flex-row-reverse sm:text-right">
                    <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-surface-variant shadow-xs flex items-center justify-center shrink-0">
                      {awayTeamDetails?.logo ? (
                        <img src={awayTeamDetails.logo} alt={ticket.awayTeam} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high text-secondary font-black text-sm rounded-xl flex items-center justify-center">
                          {awayTeamDetails?.shortName || ticket.awayTeam?.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block">Away • الضيف</span>
                      <h4 className="font-bold text-base text-on-surface truncate">{ticket.awayTeam}</h4>
                    </div>
                  </div>
                </div>

                {/* Match Title & Competition */}
                <div className="mt-3 pt-2.5 border-t border-surface-variant/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="font-bold text-on-surface flex items-center gap-1.5">
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

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Holder */}
              <div className="col-span-2 bg-surface p-3.5 rounded-2xl border border-surface-variant flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base shrink-0 border border-primary/20 shadow-xs">
                  {ticket.holderName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold block">
                    Ticket Holder • صاحب التذكرة
                  </span>
                  <h3 className="font-bold text-base text-on-surface">{ticket.holderName}</h3>
                  <span className="font-mono text-xs text-primary font-semibold">{ticket.currentFanId}</span>
                </div>
              </div>

              {/* Gate */}
              <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold block">Gate • البوابة</span>
                <div className="text-lg font-bold text-primary mt-0.5">{ticket.gate}</div>
              </div>

              {/* Price */}
              <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl text-center">
                <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold block">Price • السعر</span>
                <div className="text-lg font-bold text-pitch-green mt-0.5">
                  {ticket.price?.toFixed(2)} <span className="text-[11px] font-normal text-secondary">EGP</span>
                </div>
              </div>
            </div>

            {/* Competition & Round Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {ticket.competition && (
                <span className="bg-surface-container border border-surface-variant text-on-surface text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">emoji_events</span>
                  <span>{ticket.competition}</span>
                </span>
              )}
              {ticket.round && (
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-full">
                  {ticket.round}
                </span>
              )}
              <span className="bg-surface-container border border-surface-variant text-secondary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">door_front</span>
                <span>{ticket.gate}</span>
              </span>
            </div>

            {/* Gate Verification Action */}
            <div className="border-t border-surface-variant pt-5 space-y-3">
              <div className="text-center">
                <h3 className="font-bold text-sm text-on-surface">Stadium Gate Validation</h3>
                <p className="text-xs text-secondary mt-0.5">
                  Staff only: Validate this ticket for stadium entry. This will mark the ticket as attended.
                </p>
              </div>

              {/* Verification Result */}
              {verifyResult && (
                <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${verifyResult.isSuccess
                    ? 'bg-pitch-green/10 border-pitch-green/30'
                    : 'bg-primary/5 border-primary/20'
                  }`}>
                  <div className={`flex items-center justify-center gap-2 font-bold text-lg ${verifyResult.isSuccess ? 'text-pitch-green' : 'text-primary'
                    }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {verifyResult.isSuccess ? 'check_circle' : 'block'}
                    </span>
                    <span>{verifyResult.isSuccess ? 'APPROVED' : 'DENIED'}</span>
                  </div>
                  <p className={`text-xs font-semibold ${verifyResult.isSuccess ? 'text-pitch-green' : 'text-primary'
                    }`}>
                    {verifyResult.message}
                  </p>
                </div>
              )}

              {verifyError && !verifyResult && (
                <div className="p-3 rounded-xl bg-golden-gate/10 border border-golden-gate/30 text-center">
                  <p className="text-xs font-semibold text-golden-gate">{verifyError}</p>
                </div>
              )}

              <button
                onClick={handleVerifyAtGate}
                disabled={isVerifying}
                className="w-full py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    <span>Validate Gate Entry • تأكيد الدخول</span>
                  </>
                )}
              </button>
            </div>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-secondary pt-2">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>
                Verified by Tazkarti Digital Pass System • Pass #{ticket.id ?? ticketId}
                {ticket.bookingOrderId && ` • Order #${ticket.bookingOrderId}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Back to Tickets */}
      <div className="text-center">
        <Link
          to="/tickets"
          className="text-sm text-primary hover:underline font-semibold inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to My Tickets</span>
        </Link>
      </div>
    </div>
  );
};

export default TicketVerifyPage;
