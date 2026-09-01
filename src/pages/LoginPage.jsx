import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { mapAuthErrorsToFields } from '../services/authErrors';

export const LoginPage = () => {
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Clean any old saved nid from previous sessions
  React.useEffect(() => {
    localStorage.removeItem('tazkarti_saved_nid');
  }, []);

  // Redirect notice if sent from register or checkout
  const successNotice = location.state?.message;
  const authNotice = location.state?.notice;

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorInfo(null);
    setFieldErrors({});

    if (!nationalId.trim()) {
      setErrorInfo({
        message: 'Please enter your 14-digit National ID.',
        isNetworkError: false,
        isCredentialError: false,
      });
      setFieldErrors({ nationalId: 'National ID is required.' });
      return;
    }

    if (!password) {
      setErrorInfo({
        message: 'Please enter your password.',
        isNetworkError: false,
        isCredentialError: false,
      });
      setFieldErrors({ password: 'Password is required.' });
      return;
    }

    try {
      await login(nationalId.trim(), password);
      const destination = location.state?.from || '/dashboard';
      if (location.state?.from) {
        showToast('Signed in successfully! Continuing with your booking.', 'success');
      }
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login failure:', err);
      const allErrors = err.errors && err.errors.length > 0 ? err.errors : [err.message || 'Login failed.'];
      const mapped = mapAuthErrorsToFields(allErrors);
      
      setErrorInfo({
        message: mapped.primaryMessage || 'Login failed. Please check your credentials.',
        isNetworkError: mapped.isNetworkError || err?.isNetworkError || false,
        isCredentialError: mapped.isCredentialError || false,
        isAlreadyRegistered: mapped.isAlreadyRegistered || false,
      });
      setFieldErrors(mapped.fieldErrors);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      {/* Background Texture & Ambient Accent */}
      <main className="flex-grow flex items-center justify-center py-12 px-margin-mobile relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-surface-dim opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDrEFNkowlUVUuF7ZI3ULywtECxO6JjFSD3hXFLgmpN2UyloAHPunAswWWcNZY1prgcCKppFhavg-Unl_1h9IHf4HQtvVzVaL9YoNBk_VOEhRBlWuq2ILtxHjYRcZrocuk9XQPeCofImIYoFrOmLUR4dkNv2Nh0VXiiObWcw4DHKQaUHM0my0lv53nMWF5wA_VoVNnbi3Pe1mzRgRSoL-QjBqBUbGg93-vKrMn1AokreqTRqifAWJXJLQ")',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        />

        <div className="relative z-10 w-full max-w-md bg-surface-container-lowest/95 rounded-xl shadow-lg border border-surface-variant p-8 md:p-10 backdrop-blur-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="font-headline-md text-headline-md text-primary mb-2 font-bold tracking-tight">
                Tazkarti
              </h1>
            </Link>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Secure National Platform Login
            </p>
          </div>

          {/* Notice Banner (e.g. redirected from Checkout / Pay button) */}
          {authNotice && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-900 dark:text-amber-200 animate-fadeIn">
              <span className="material-symbols-outlined text-xl shrink-0 mt-0.5 text-golden-gate fill">lock</span>
              <div className="text-sm">
                <p className="font-semibold">{authNotice}</p>
                <p className="text-xs opacity-90 mt-0.5">Please sign in to your Fan ID to complete your ticket booking.</p>
              </div>
            </div>
          )}

          {/* Success Banner from Registration */}
          {successNotice && (
            <div className="mb-6 p-4 bg-status-success/10 border border-status-success/30 rounded-xl flex items-start gap-3 text-status-success">
              <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">check_circle</span>
              <div className="text-sm">
                <p className="font-semibold">{successNotice}</p>
                <p className="text-xs text-status-success/80 mt-0.5">Please sign in with your credentials to continue.</p>
              </div>
            </div>
          )}

          {/* User-Friendly Error Banner */}
          {errorInfo && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 transition-all animate-shake border ${
                errorInfo.isNetworkError
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-primary/10 border-primary/30 text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-2xl shrink-0 mt-0.5">
                {errorInfo.isNetworkError
                  ? 'cloud_off'
                  : errorInfo.isCredentialError
                  ? 'lock_person'
                  : 'error'}
              </span>
              <div className="text-sm flex-grow">
                <p className="font-bold">
                  {errorInfo.isNetworkError
                    ? 'Connection Issue'
                    : errorInfo.isCredentialError
                    ? 'Authentication Failed'
                    : 'Sign In Failed'}
                </p>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {errorInfo.message}
                </p>

                {/* Inline Action for Network Retry */}
                {errorInfo.isNetworkError && (
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    <span>{isLoading ? 'Retrying...' : 'Retry Connection'}</span>
                  </button>
                )}

                {/* Inline Action for Password Reset if Invalid Credentials */}
                {errorInfo.isCredentialError && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="mt-2 text-xs font-semibold underline hover:opacity-80 block cursor-pointer"
                  >
                    Need to reset your password?
                  </button>
                )}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-2 font-semibold" htmlFor="national-id">
                National ID Number (14 Digits)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">badge</span>
                </div>
                <input
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-surface font-body-md text-body-md placeholder-secondary-fixed-dim transition-colors ${
                    fieldErrors.nationalId
                      ? 'border-primary focus:ring-primary focus:border-primary'
                      : 'border-outline-variant focus:ring-primary focus:border-primary'
                  }`}
                  id="national-id"
                  name="national-id"
                  placeholder="Enter your 14-digit National ID"
                  type="text"
                  maxLength={14}
                  value={nationalId}
                  onChange={(e) => {
                    setNationalId(e.target.value);
                    if (fieldErrors.nationalId) {
                      setFieldErrors((prev) => ({ ...prev, nationalId: '' }));
                    }
                  }}
                  required
                />
              </div>
              {fieldErrors.nationalId && (
                <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  {fieldErrors.nationalId}
                </p>
              )}
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-2 font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
                </div>
                <input
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface font-body-md text-body-md placeholder-secondary-fixed-dim transition-colors ${
                    fieldErrors.password
                      ? 'border-primary focus:ring-primary focus:border-primary'
                      : 'border-outline-variant focus:ring-primary focus:border-primary'
                  }`}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface cursor-pointer"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="ml-2 block font-body-md text-sm text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div>
              <button
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-sm text-label-sm font-bold text-on-primary bg-primary hover:bg-primary-container transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have a Fan ID?
              <Link
                className="font-label-sm text-label-sm text-primary hover:text-primary-container font-bold ml-1 transition-colors"
                to="/register"
                state={location.state}
              >
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Reset Password</h3>
            <p className="text-sm text-secondary">
              Enter your National ID or registered Mobile number to receive an SMS verification code.
            </p>
            {resetSent ? (
              <div className="bg-pitch-green/10 text-pitch-green p-3 rounded-lg text-sm font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Verification code sent to your registered mobile.</span>
              </div>
            ) : (
              <input
                type="text"
                placeholder="National ID / Mobile Number"
                className="w-full bg-surface text-on-surface border border-outline-variant rounded-lg p-3 text-sm focus:border-primary focus:outline-none"
              />
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSent(false);
                }}
                className="px-4 py-2 text-sm text-secondary hover:text-on-surface cursor-pointer"
              >
                Close
              </button>
              {!resetSent && (
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="px-4 py-2 text-sm bg-primary text-white font-bold rounded-lg hover:bg-primary-container cursor-pointer"
                >
                  Send Reset Code
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Component matching login design */}
      <footer className="w-full mt-auto border-t border-outline-variant bg-surface-container-lowest">
        <div className="w-full py-12 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="col-span-1 md:col-span-3 mb-6">
            <span className="font-headline-md text-primary font-bold">Tazkarti</span>
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-wrap gap-x-6 gap-y-3">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Security Standards</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Sponsorships</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
          <div className="col-span-1 md:col-span-3 mt-8 pt-8 border-t border-surface-variant text-center md:text-left">
            <p className="font-body-md text-body-md text-secondary">© 2026 Tazkarti Egypt. All Rights Reserved. Secure National Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
