import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { getAllClubs } from '../services/authService';

export const DashboardPage = () => {
  const { user, fetchProfile, isProfileLoading } = useAuth();
  const { tickets } = useBooking();

  // Dynamic QR Code Timer (15-second live countdown)
  const [timeLeft, setTimeLeft] = useState(15);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [syncStatus, setSyncStatus] = useState(null);
  const [clubOptions, setClubOptions] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    getAllClubs()
      .then((clubs) => {
        if (isMounted) setClubOptions(Array.isArray(clubs) ? clubs : []);
      })
      .catch(() => {
        // The saved club name or the profile response can still be displayed if clubs are offline.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (text, fieldName) => {
    if (!text || text === '---') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSyncProfile = async () => {
    setSyncStatus(null);
    const res = await fetchProfile();
    if (res && res.success) {
      setSyncStatus({
        type: 'success',
        message: 'Profile refreshed and up to date with official records.',
      });
    } else {
      setSyncStatus({
        type: 'warning',
        message: 'Live server currently unreachable. Displaying your saved offline Fan ID profile.',
      });
    }
    setTimeout(() => {
      setSyncStatus(null);
    }, 5000);
  };

  const latestTicket = tickets?.[0];
  const storedFavoriteClubId = localStorage.getItem('tazkarti_favorite_club');
  const storedFavoriteClubName = localStorage.getItem('tazkarti_favorite_club_name');
  const favoriteClubId = user?.favoriteClubId || user?.favoriteClub || storedFavoriteClubId;
  const favoriteClub =
    user?.favoriteClubName ||
    storedFavoriteClubName ||
    clubOptions.find((club) => String(club.id) === String(favoriteClubId))?.name ||
    favoriteClubId ||
    '---';

  return (
    <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      {/* Top Welcome & Sync Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-surface-container-lowest border border-surface-container rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
            <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              Official Fan ID Profile
            </h1>
          </div>
          <p className="font-body-md text-secondary text-sm">
            National platform identity verified with Egyptian Civil Registry.
          </p>
        </div>
        <button
          onClick={handleSyncProfile}
          disabled={isProfileLoading}
          className="self-start sm:self-auto flex items-center gap-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          title="Refresh Profile from Server"
        >
          <span className={`material-symbols-outlined text-base ${isProfileLoading ? 'animate-spin text-primary' : ''}`}>
            sync
          </span>
          <span>{isProfileLoading ? 'Syncing...' : 'Sync Profile'}</span>
        </button>
      </div>

      {/* Sync Status Toast/Banner */}
      {syncStatus && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between gap-3 border transition-all animate-fadeIn ${
            syncStatus.type === 'success'
              ? 'bg-status-success/10 border-status-success/30 text-status-success'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm">
            <span className="material-symbols-outlined text-xl">
              {syncStatus.type === 'success' ? 'check_circle' : 'cloud_off'}
            </span>
            <span className="font-medium">{syncStatus.message}</span>
          </div>
          <button
            onClick={() => setSyncStatus(null)}
            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Official Fan ID Card & Live Entry QR */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Official Fan ID Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-md p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary-container to-primary" />
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-md mb-3 relative group">
                <img
                  className="w-full h-full object-cover"
                  src={user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfEi-JMbLcmZW_6rD67Pyr-uhdmKzgBTpCCFpqq5h4QJY0PnvkWWa8jUB1j9seQpGEWThxgEoTTG57SifuNQ__G7RbtqgJW5ck3gvsE3XkOldtTjl71rPOz5kUvhOSyvPOt_hS8GaYCvzTQUfukDGcQZ5toXnbC4pIfsmm1EAX5GojaZ_5Xv9lV0yDtJWRAEffhLeu-wAZNQrSr7Ynj2OmoruglCuLwkqBSDlsM5gWHVYTx95CJvtqXg'}
                  alt={user?.fullName || 'Fan ID'}
                />
                <div className="absolute bottom-0 right-0 bg-status-success rounded-full p-1 border-2 border-surface-container-lowest">
                  <span className="material-symbols-outlined text-white text-sm fill">verified</span>
                </div>
              </div>

              <h2 className="font-headline-md text-xl font-bold text-on-surface mb-1">
                {user?.fullName || 'Citizen Fan'}
              </h2>

              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="material-symbols-outlined text-sm">badge</span>
                <span>{user?.fanId || user?.rawFanId || 'TZK-2026'}</span>
              </div>

              {/* Summary Badges */}
              <div className="w-full space-y-2 text-left text-sm">
                <div className="bg-surface-container-low rounded-xl p-3 flex justify-between items-center">
                  <span className="text-secondary text-xs font-medium">National ID</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-on-surface text-xs md:text-sm">
                      {user?.nationalId || user?.id || '---'}
                    </span>
                    <button
                      onClick={() => handleCopy(user?.nationalId || user?.id, 'nid')}
                      className="p-1 text-secondary hover:text-primary transition-colors"
                      title="Copy National ID"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {copiedField === 'nid' ? 'done' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-3 flex justify-between items-center">
                  <span className="text-secondary text-xs font-medium">Governorate</span>
                  <span className="font-semibold text-on-surface text-xs md:text-sm">
                    {user?.governorate || 'Cairo'} {user?.governorateAr ? `(${user.governorateAr})` : ''}
                  </span>
                </div>

                <div className="bg-surface-container-low rounded-xl p-3 flex justify-between items-center">
                  <span className="text-secondary text-xs font-medium">Nationality</span>
                  <span className="font-semibold text-on-surface text-xs md:text-sm">
                    {user?.nationality || 'Egyptian'} {user?.nationalityAr ? `(${user.nationalityAr})` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Match Entry QR Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-md p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="flex items-center gap-1 text-xs font-bold text-pitch-green bg-pitch-green/10 px-3 py-1 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-pitch-green animate-ping"></span>
              <span>LIVE TURNSTILE ENCRYPTION</span>
            </div>

            <h3 className="font-body-lg text-base font-bold text-on-surface mb-1">Gate Pass QR Code</h3>
            <p className="font-label-sm text-xs text-secondary mb-4">Scan at turnstiles and security checkpoints</p>

            <div className="p-4 bg-white rounded-2xl qr-pulse border-2 border-primary-container inline-block mb-4 relative shadow-sm">
              <img
                className="w-44 h-44 object-contain"
                src={user?.qrCode || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBer5HRCfR9UYy3WLm51yAkpxZEfvYzGP5J27c1CJMSJ7S0LLcbfSYef9s-yCbtOqiB1eG3R_yzDhpV4NX7N4hMJ3Q68SV6w_IZ_KD0lAfimhgv47pQk_8Jo2p7vyWugSEYnVQUd4Bijl6tDUfsyJt4YljoOQICaCcEfiDeQQtx4aWrg9Wd5V6k4c3fBEorNqG9CAMqFrcxCWJQY_uUAuV0o3lv_wviFWDu8xfQG9gPUitQd9jWeZaLkw'}
                alt="Dynamic Fan ID QR Code"
              />
              <div className="absolute inset-0 bg-primary-container/5 rounded-2xl pointer-events-none" />
            </div>

            {/* Live Refresh Timer */}
            <div className="flex items-center gap-2 text-primary font-label-sm text-xs bg-primary/10 px-4 py-1.5 rounded-full font-semibold border border-primary/20">
              <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
              <span>
                Refreshes in <span className="font-bold text-sm">{timeLeft}</span>s
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Profile Data & Bento Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Loyalty & Tier Status Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-golden-gate text-3xl fill">workspace_premium</span>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">
                  {user?.tier || 'Silver Tier Fan'}
                </h3>
              </div>
              <p className="font-body-md text-secondary text-sm">
                Official Tazkarti loyalty membership level. Attend matches and concerts to unlock Gold and Platinum perks.
              </p>
            </div>
            <div className="text-right flex-shrink-0 bg-surface-container-low px-6 py-4 rounded-xl border border-surface-container">
              <div className="font-display-lg text-3xl text-primary-container font-bold">
                {(user?.attendancePoints ?? 0).toLocaleString()}
              </div>
              <div className="font-label-sm text-xs text-secondary uppercase tracking-wider font-semibold mt-0.5">
                Attendance Points
              </div>
            </div>
          </div>

          {/* Full Profile Information Grid */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  Civil & Contact Details
                </h3>
              </div>
              <span className="bg-pitch-green/10 text-pitch-green border border-pitch-green/20 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pitch-green"></span>
                <span>Active Citizen</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex flex-col justify-center">
                <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">badge</span>
                  Full Name (الاسم بالكامل)
                </span>
                <span className="text-sm font-bold text-on-surface">{user?.fullName || '---'}</span>
              </div>

              {/* National ID */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex justify-between items-center">
                <div>
                  <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                    National ID (الرقم القومي)
                  </span>
                  <span className="text-sm font-mono font-bold text-on-surface">
                    {user?.nationalId || user?.id || '---'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(user?.nationalId || user?.id, 'fullNid')}
                  className="p-1.5 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
                  title="Copy National ID"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedField === 'fullNid' ? 'done' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Mobile Phone */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex justify-between items-center">
                <div>
                  <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                    Phone Number (رقم الموبايل)
                  </span>
                  <span className="text-sm font-bold text-on-surface">{user?.phoneNumber || '---'}</span>
                </div>
                <span className="text-[11px] bg-pitch-green/10 text-pitch-green px-2 py-0.5 rounded font-bold">
                  Verified
                </span>
              </div>

              {/* Email Address */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex justify-between items-center">
                <div>
                  <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    Email Address (البريد الإلكتروني)
                  </span>
                  <span className="text-sm font-bold text-on-surface truncate block max-w-[200px] sm:max-w-none">
                    {user?.email || '---'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(user?.email, 'email')}
                  className="p-1.5 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
                  title="Copy Email"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedField === 'email' ? 'done' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Date of Birth */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex flex-col justify-center">
                <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cake</span>
                  Date of Birth (تاريخ الميلاد)
                </span>
                <span className="text-sm font-bold text-on-surface">
                  {user?.formattedDob || user?.dateOfBirth || '---'}
                </span>
              </div>

              {/* Gender */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex flex-col justify-center">
                <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">wc</span>
                  Gender (النوع)
                </span>
                <span className="text-sm font-bold text-on-surface">
                  {user?.genderLabel || (user?.gender === 2 ? 'Female (أنثى)' : 'Male (ذكر)')}
                </span>
              </div>

              {/* Governorate */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex flex-col justify-center">
                <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  Governorate (المحافظة)
                </span>
                <span className="text-sm font-bold text-on-surface">
                  {user?.governorate || 'Cairo'} {user?.governorateAr ? `(${user.governorateAr})` : ''}
                </span>
              </div>

              {/* Nationality */}
              {/* Favourite Club */}
              <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between md:col-span-2">
                <div>
                  <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">sports_soccer</span>
                    Favourite Club
                  </span>
                  <span className="text-sm font-bold text-on-surface">{favoriteClub}</span>
                </div>
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">sports_soccer</span>
                </span>
              </div>

              {/* Nationality */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container flex flex-col justify-center">
                <span className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">public</span>
                  Nationality (الجنسية)
                </span>
                <span className="text-sm font-bold text-on-surface">
                  {user?.nationality || 'Egyptian'} {user?.nationalityAr ? `(${user.nationalityAr})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Bento Grid Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Tickets Action */}
            <Link
              to="/tickets"
              className="group relative bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs p-6 overflow-hidden transition-transform hover:-translate-y-1 block"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[90px] text-primary-container">
                  confirmation_number
                </span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary-container text-2xl">local_activity</span>
                </div>
                <h3 className="font-body-lg text-base text-on-surface font-bold mb-1">My Booked Tickets</h3>
                <p className="font-body-md text-xs text-secondary mb-4">
                  View and manage your {tickets?.length || 0} active match & concert passes.
                </p>
                <span className="font-label-sm text-xs text-primary font-bold group-hover:underline flex items-center gap-1">
                  <span>View All Tickets</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>
            </Link>

            {/* Payment Methods Action */}
            <button
              onClick={() => setShowWalletModal(true)}
              className="text-left group relative bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs p-6 overflow-hidden transition-transform hover:-translate-y-1 block cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[90px] text-on-surface">account_balance_wallet</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-surface text-2xl">payments</span>
                </div>
                <h3 className="font-body-lg text-base text-on-surface font-bold mb-1">Payment Methods</h3>
                <p className="font-body-md text-xs text-secondary mb-4">Manage InstaPay, Meeza cards, and E-wallets.</p>
                <span className="font-label-sm text-xs text-on-surface font-bold group-hover:underline flex items-center gap-1">
                  <span>Manage Wallet</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>
            </button>
          </div>

          {/* Upcoming Event Mini-Card */}
          {latestTicket && (
            <div className="mt-2">
              <h4 className="font-body-md text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">event_upcoming</span>
                <span>Next Upcoming Event</span>
              </h4>
              <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex flex-col items-center justify-center border border-outline-variant shrink-0">
                  <span className="font-label-sm text-xs text-primary-container font-bold uppercase">
                    {latestTicket.date?.split(' ')?.[1] || 'OCT'}
                  </span>
                  <span className="font-body-lg text-lg text-on-surface font-bold leading-none mt-1">
                    {latestTicket.date?.split(' ')?.[0] || '15'}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h5 className="font-body-md text-sm font-bold text-on-surface">{latestTicket.title}</h5>
                    <span className="text-[11px] bg-pitch-green/10 text-pitch-green font-bold px-2.5 py-0.5 rounded-full border border-pitch-green/20">
                      {latestTicket.status || 'Confirmed'}
                    </span>
                  </div>
                  <p className="font-label-sm text-xs text-secondary mt-0.5">
                    {latestTicket.venue} • {latestTicket.block} ({latestTicket.seats?.join(', ') || 'Seat Allocated'})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <h3 className="font-headline-md text-lg font-bold text-on-surface">Payment Methods</h3>
              <button onClick={() => setShowWalletModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-surface-variant bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
                  <div>
                    <h5 className="font-semibold text-sm">InstaPay (IPA)</h5>
                    <p className="text-xs text-secondary">{user?.email ? `${user.email.split('@')[0]}@instapay` : 'citizen@instapay'}</p>
                  </div>
                </div>
                <span className="text-xs bg-pitch-green/10 text-pitch-green px-2 py-0.5 rounded font-bold">Linked</span>
              </div>

              <div className="p-3 rounded-xl border border-surface-variant bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-2xl">credit_card</span>
                  <div>
                    <h5 className="font-semibold text-sm">Meeza National Card</h5>
                    <p className="text-xs text-secondary">•••• 5824</p>
                  </div>
                </div>
                <span className="text-xs bg-pitch-green/10 text-pitch-green px-2 py-0.5 rounded font-bold">Primary</span>
              </div>
            </div>
            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <h3 className="font-headline-md text-lg font-bold text-on-surface">Security & 2FA Settings</h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-variant">
                <div>
                  <h5 className="font-semibold">Two-Factor Authentication (SMS OTP)</h5>
                  <p className="text-xs text-secondary">Linked to {user?.phoneNumber || 'registered mobile'}</p>
                </div>
                <span className="bg-pitch-green/10 text-pitch-green text-xs font-bold px-2 py-1 rounded">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-variant">
                <div>
                  <h5 className="font-semibold">Turnstile Biometrics (Face ID)</h5>
                  <p className="text-xs text-secondary">Matched with National ID records</p>
                </div>
                <span className="bg-pitch-green/10 text-pitch-green text-xs font-bold px-2 py-1 rounded">Active</span>
              </div>
            </div>
            <button
              onClick={() => setShowSecurityModal(false)}
              className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default DashboardPage;
