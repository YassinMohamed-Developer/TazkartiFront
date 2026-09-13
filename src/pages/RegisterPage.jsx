import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GOVERNORATES, GENDER_OPTIONS, getAllClubs } from '../services/authService';
import { mapAuthErrorsToFields } from '../services/authErrors';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [errorInfo, setErrorInfo] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [clubOptions, setClubOptions] = useState([]);
  const [isClubsLoading, setIsClubsLoading] = useState(true);
  const [clubsLoadError, setClubsLoadError] = useState('');

  // Form State initialized with empty fields for user entry
  const [formData, setFormData] = useState({
    nationality: 'egyptian',
    nationalId: '',
    nationalName: '',
    dateOfBirth: '',
    gender: 1, // 1: Male, 2: Female
    avatarPreview: '',
    phoneNumber: '',
    email: '',
    governorate: 1, // 1: Cairo
    favoriteClub: '',
    password: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadClubs = async () => {
      setIsClubsLoading(true);
      setClubsLoadError('');

      try {
        const clubs = await getAllClubs();
        const validClubs = clubs
          .filter((club) => club && club.id !== undefined && club.id !== null && club.name)
          .map((club) => ({ id: String(club.id), name: club.name }));

        if (isMounted) {
          setClubOptions(validClubs);
          if (validClubs.length === 0) {
            setClubsLoadError('No clubs are currently available. Please try again later.');
          }
        }
      } catch (error) {
        if (isMounted) {
          setClubOptions([]);
          setClubsLoadError(error?.message || 'Unable to load clubs right now.');
        }
      } finally {
        if (isMounted) setIsClubsLoading(false);
      }
    };

    loadClubs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('avatarPreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteRegistration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorInfo(null);
    setFieldErrors({});

    // 1. National ID validation: 14 numeric digits
    const NATIONAL_ID_REGEX = /^[0-9]{14}$/;
    if (!formData.nationalId || !NATIONAL_ID_REGEX.test(formData.nationalId.trim())) {
      setErrorInfo({
        message: 'National ID must be exactly 14 numeric digits.',
        isNetworkError: false,
      });
      setFieldErrors({ nationalId: 'National ID must be 14 digits.' });
      setCurrentStep(1);
      return;
    }

    // 2. Full Name validation
    if (!formData.nationalName.trim()) {
      setErrorInfo({
        message: 'Please enter your full official name as on your ID.',
        isNetworkError: false,
      });
      setFieldErrors({ nationalName: 'Full name is required.' });
      setCurrentStep(2);
      return;
    }

    // 3. Date of Birth validation
    if (!formData.dateOfBirth) {
      setErrorInfo({
        message: 'Please provide your date of birth.',
        isNetworkError: false,
      });
      setFieldErrors({ dateOfBirth: 'Date of birth is required.' });
      setCurrentStep(2);
      return;
    }

    // 4. Egyptian Phone Number validation: ^01[0125]\d{8}$
    const EGYPTIAN_PHONE_REGEX = /^01[0125]\d{8}$/;
    const cleanPhone = formData.phoneNumber.trim().replace(/^\+20/, '').replace(/^20/, '');
    const phoneToTest = cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`;
    if (!formData.phoneNumber || !EGYPTIAN_PHONE_REGEX.test(phoneToTest)) {
      setErrorInfo({
        message: 'Please enter a valid Egyptian phone number (11 digits, e.g. 01012345678).',
        isNetworkError: false,
      });
      setFieldErrors({ phoneNumber: 'Please enter a valid Egyptian phone number (010, 011, 012, 015).' });
      return;
    }

    // 5. Email validation
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
      setErrorInfo({
        message: 'Please provide a valid email address (e.g. name@example.com).',
        isNetworkError: false,
      });
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    // 6. Favourite Club validation
    if (!formData.favoriteClub) {
      setErrorInfo({
        message: 'Please choose your favourite club to complete your Fan ID profile.',
        isNetworkError: false,
      });
      setFieldErrors({ favoriteClub: 'Favourite club is required.' });
      return;
    }

    // 7. Password validation: Starts with uppercase letter (A-Z) and min 6 characters
    const PASSWORD_REGEX = /^[A-Z][A-Za-z\d@$!%*?&#^(){}[\]<>_+=|\\~`:;,\.\/-]{5,}$/;
    if (!formData.password || !PASSWORD_REGEX.test(formData.password)) {
      setErrorInfo({
        message: 'Password must start with an uppercase letter (A-Z) and be at least 6 characters long.',
        isNetworkError: false,
      });
      setFieldErrors({ password: 'Password must start with an uppercase letter (A-Z) and contain at least 6 characters.' });
      return;
    }

    try {
      const payload = {
        nationalId: formData.nationalId.trim(),
        nationalName: formData.nationalName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: Number(formData.gender),
        phoneNumber: phoneToTest,
        email: formData.email.trim(),
        Password: formData.password,
        governorate: Number(formData.governorate),
        favouriteClubId: Number(formData.favoriteClub),
        avatarUrl: formData.avatarPreview || null,
      };

      const result = await register(payload);
      // Temporary persistence until the registration/profile APIs support the club field.
      const selectedClub = clubOptions.find((club) => club.id === formData.favoriteClub);
      localStorage.setItem('tazkarti_favorite_club', formData.favoriteClub);
      localStorage.setItem('tazkarti_favorite_club_name', selectedClub?.name || '');
      navigate('/login', {
        state: {
          from: location.state?.from,
          notice: location.state?.notice,
          message: result?.message || 'Registration completed successfully! Please sign in with your National ID.',
        },
      });
    } catch (err) {
      console.error('Registration failed:', err);
      const allErrors = err.errors && err.errors.length > 0 ? err.errors : [err.message || 'Registration failed.'];
      const mapped = mapAuthErrorsToFields(allErrors);
      
      setErrorInfo({
        message: mapped.primaryMessage || 'Registration could not be completed. Please review your details.',
        isNetworkError: mapped.isNetworkError || err?.isNetworkError || false,
        isAlreadyRegistered: mapped.isAlreadyRegistered || false,
        isCredentialError: mapped.isCredentialError || false,
      });
      setFieldErrors(mapped.fieldErrors);

      // Auto switch back to step if error belongs to a previous step
      if (mapped.fieldErrors.nationalId) {
        setCurrentStep(1);
      } else if (mapped.fieldErrors.nationalName || mapped.fieldErrors.dateOfBirth) {
        setCurrentStep(2);
      }
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col relative text-on-surface">
      {/* Background Texture & Ambient Accent */}
      <div
        className="absolute inset-0 z-0 bg-surface-dim opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDrEFNkowlUVUuF7ZI3ULywtECxO6JjFSD3hXFLgmpN2UyloAHPunAswWWcNZY1prgcCKppFhavg-Unl_1h9IHf4HQtvVzVaL9YoNBk_VOEhRBlWuq2ILtxHjYRcZrocuk9XQPeCofImIYoFrOmLUR4dkNv2Nh0VXiiObWcw4DHKQaUHM0my0lv53nMWF5wA_VoVNnbi3Pe1mzRgRSoL-QjBqBUbGg93-vKrMn1AokreqTRqifAWJXJLQ")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      />

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center py-8 md:py-12 px-margin-mobile relative z-10">
        {/* Glassmorphism Form Card */}
        <div className="w-full max-w-3xl bg-surface/90 backdrop-blur-xl border border-outline-variant/30 rounded-xl shadow-lg p-6 md:p-10 relative overflow-hidden">
          {/* Subtle Security Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-container to-primary" />

          {/* Header & Progress */}
          <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-1 font-bold">
                {currentStep === 1 && 'Identity Verification'}
                {currentStep === 2 && 'Personal Information'}
                {currentStep === 3 && 'Contact & Security'}
              </h2>
              <p className="font-body-md text-body-md text-secondary">
                Step {currentStep} of 3: Build your official Fan ID profile.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
              <div
                className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= 1 ? 'bg-status-success' : 'bg-surface-variant'
                }`}
              />
              <div
                className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= 2
                    ? 'bg-primary shadow-[0_0_8px_rgba(226,30,38,0.4)]'
                    : 'bg-surface-variant'
                }`}
              />
              <div
                className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= 3
                    ? 'bg-primary shadow-[0_0_8px_rgba(226,30,38,0.4)]'
                    : 'bg-surface-variant'
                }`}
              />
            </div>
          </div>

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
                  : errorInfo.isAlreadyRegistered
                  ? 'account_circle'
                  : 'error'}
              </span>
              <div className="text-sm flex-grow">
                <p className="font-bold">
                  {errorInfo.isNetworkError
                    ? 'Connection Issue'
                    : errorInfo.isAlreadyRegistered
                    ? 'Account Already Exists'
                    : 'Registration Notice'}
                </p>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {errorInfo.message}
                </p>

                {/* Inline Action for Network Retry */}
                {errorInfo.isNetworkError && (
                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    disabled={isLoading}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    <span>{isLoading ? 'Retrying...' : 'Retry Registration'}</span>
                  </button>
                )}

                {/* Inline Action to Sign In if account already exists */}
                {errorInfo.isAlreadyRegistered && (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Sign In to Your Account</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Security Badge */}
              <div className="flex items-start bg-surface-container-low p-4 rounded-lg border border-surface-variant">
                <span className="material-symbols-outlined text-tertiary mr-3 mt-0.5 fill text-2xl">
                  security
                </span>
                <div>
                  <h4 className="font-body-md font-semibold text-on-surface">Secure Identity Verification</h4>
                  <p className="font-label-sm text-secondary mt-1">
                    Your data is encrypted and securely verified against Egyptian civil records in accordance with national platform standards.
                  </p>
                </div>
              </div>

              {/* Nationality */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-2 font-semibold">
                  Nationality
                </label>
                <div className="relative">
                  <select
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="egyptian">Egyptian (بطاقة الرقم القومي)</option>
                    <option value="other">Foreign / International Passport</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-secondary">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* National ID */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-2 font-semibold">
                  National ID Number (14 Digits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-secondary">
                    <span className="material-symbols-outlined">badge</span>
                  </div>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                    placeholder="Enter 14-digit National ID (e.g. 30208022234567)"
                    className={`w-full bg-surface-container-lowest border rounded-lg pl-12 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-1 ${
                      fieldErrors.nationalId
                        ? 'border-primary focus:border-primary focus:ring-primary'
                        : 'border-outline-variant/60 focus:border-primary focus:ring-primary'
                    }`}
                  />
                </div>
                {fieldErrors.nationalId && (
                  <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    {fieldErrors.nationalId}
                  </p>
                )}
                <p className="font-label-sm text-secondary mt-2 text-right">
                  {formData.nationalId.length}/14 digits
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs text-secondary flex items-center gap-1.5">
                  <span>Already have a Fan ID?</span>
                  <Link to="/login" className="text-primary font-bold hover:underline flex items-center gap-0.5">
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={formData.nationalId.length < 14}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-container text-on-primary px-8 py-3 rounded-lg font-body-md font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue to Personal Info</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL INFORMATION & PHOTO */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2 font-semibold" htmlFor="nationalName">
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  Full Name (as per National ID)
                </label>
                <input
                  id="nationalName"
                  type="text"
                  value={formData.nationalName}
                  onChange={(e) => handleInputChange('nationalName', e.target.value)}
                  placeholder="Enter your full name as per National ID"
                  className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-1 transition-all placeholder:text-secondary-fixed-dim ${
                    fieldErrors.nationalName
                      ? 'border-primary focus:border-primary focus:ring-primary'
                      : 'border-outline-variant/60 focus:border-primary focus:ring-primary'
                  }`}
                  required
                />
                {fieldErrors.nationalName && (
                  <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    {fieldErrors.nationalName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2 font-semibold" htmlFor="dateOfBirth">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-1 transition-all ${
                      fieldErrors.dateOfBirth
                        ? 'border-primary focus:border-primary focus:ring-primary'
                        : 'border-outline-variant/60 focus:border-primary focus:ring-primary'
                    }`}
                    required
                  />
                  {fieldErrors.dateOfBirth && (
                    <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      {fieldErrors.dateOfBirth}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">wc</span>
                    Gender
                  </label>
                  <div className="flex gap-4 h-[50px]">
                    {GENDER_OPTIONS.map((g) => (
                      <label
                        key={g.id}
                        className={`flex-1 flex items-center justify-center gap-2 bg-surface-container-lowest border rounded-lg cursor-pointer transition-all font-body-md ${
                          formData.gender === g.id
                            ? 'border-primary bg-primary-fixed/20 text-primary font-bold'
                            : 'border-outline-variant/60 text-on-surface hover:border-primary'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g.id}
                          checked={formData.gender === g.id}
                          onChange={() => handleInputChange('gender', g.id)}
                          className="sr-only"
                        />
                        <span>{g.labelEn} ({g.labelAr})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Upload Area */}
              <div className="pt-4 border-t border-outline-variant/30">
                <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2 mb-4 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  Fan ID Passport Photo (Optional)
                </label>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Preview Placeholder */}
                  <div className="w-32 h-32 rounded-lg bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden shrink-0 relative group cursor-pointer hover:border-primary transition-colors">
                    {formData.avatarPreview ? (
                      <img
                        src={formData.avatarPreview}
                        alt="Fan ID Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[48px] text-secondary group-hover:text-primary transition-colors">
                        face
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 py-1 text-center font-label-sm text-xs text-white opacity-90 group-hover:opacity-100 transition-opacity">
                      {formData.avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </div>
                    <input
                      id="photoUpload"
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Guidelines */}
                  <div className="flex-1 bg-surface-container-low p-4 rounded-lg border border-outline-variant/30">
                    <h4 className="font-body-md text-body-md font-semibold text-on-surface mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">gpp_good</span>
                      Photo Requirements
                    </h4>
                    <ul className="font-label-sm text-label-sm text-secondary space-y-1 list-disc list-inside">
                      <li>Clear, front-facing portrait with good lighting.</li>
                      <li>Solid, light-colored background (white preferred).</li>
                      <li>No sunglasses, caps, or heavy photo filters.</li>
                      <li>Max file size: 5MB (JPG, PNG).</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex flex-col-reverse md:flex-row justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full md:w-auto px-6 py-3 rounded-lg border-2 border-outline-variant text-on-surface font-body-md font-semibold hover:bg-surface-container-high transition-colors text-center cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.nationalName.trim()) {
                      setErrorInfo({
                        message: 'Please enter your full name as per National ID.',
                        isNetworkError: false,
                      });
                      setFieldErrors({ nationalName: 'Full name is required.' });
                      return;
                    }
                    if (!formData.dateOfBirth) {
                      setErrorInfo({
                        message: 'Please select your date of birth.',
                        isNetworkError: false,
                      });
                      setFieldErrors({ dateOfBirth: 'Date of birth is required.' });
                      return;
                    }
                    setErrorInfo(null);
                    setCurrentStep(3);
                  }}
                  className="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-on-primary font-body-md font-semibold shadow-[0_8px_24px_rgba(226,30,38,0.2)] hover:bg-primary-container transition-colors text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Contact Details</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT DETAILS & PASSWORD */}
          {currentStep === 3 && (
            <form onSubmit={handleCompleteRegistration} className="space-y-6">
              {/* Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-sm text-on-surface mb-2 font-semibold">
                    Egyptian Mobile Number (رقم الموبايل)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-secondary">
                      <span className="material-symbols-outlined text-base">phone_iphone</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={11}
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="01012345678"
                      className={`w-full bg-surface-container-lowest border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none ${
                        fieldErrors.phoneNumber
                          ? 'border-primary focus:border-primary'
                          : 'border-outline-variant/60 focus:border-primary'
                      }`}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-secondary mt-1">
                    11 digits starting with 010, 011, 012, or 015
                  </p>
                  {fieldErrors.phoneNumber && (
                    <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      {fieldErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-label-sm text-on-surface mb-2 font-semibold">
                    Email Address (البريد الإلكتروني)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3 text-sm focus:outline-none ${
                      fieldErrors.email
                        ? 'border-primary focus:border-primary'
                        : 'border-outline-variant/60 focus:border-primary'
                    }`}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-sm text-on-surface mb-2 font-semibold">
                    Governorate (المحافظة)
                  </label>
                  <div className="relative">
                    <select
                      value={formData.governorate}
                      onChange={(e) => handleInputChange('governorate', Number(e.target.value))}
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {gov.nameEn} ({gov.nameAr})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-secondary">
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-label-sm text-on-surface mb-2 font-semibold">
                    Create Password (كلمة المرور)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="e.g. Pass@123"
                      className={`w-full bg-surface-container-lowest border rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none ${
                        fieldErrors.password
                          ? 'border-primary focus:border-primary'
                          : 'border-outline-variant/60 focus:border-primary'
                      }`}
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
                  <p className="text-[11px] text-secondary mt-1">
                    Must start with uppercase letter (A-Z) and be at least 6 characters
                  </p>
                  {fieldErrors.password && (
                    <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Favourite Club */}
              <div className="pt-2">
                <label htmlFor="favoriteClub" className="block font-label-sm text-on-surface mb-2 font-semibold">
                  <span className="inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">sports_soccer</span>
                    Favourite Club
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="favoriteClub"
                    value={formData.favoriteClub}
                    onChange={(e) => handleInputChange('favoriteClub', e.target.value)}
                    disabled={isClubsLoading || !!clubsLoadError || clubOptions.length === 0}
                    className={`w-full appearance-none rounded-lg border bg-surface-container-lowest px-4 py-3 pr-12 text-sm text-on-surface focus:outline-none focus:ring-1 cursor-pointer ${
                      fieldErrors.favoriteClub
                        ? 'border-primary focus:border-primary focus:ring-primary'
                        : 'border-outline-variant/60 focus:border-primary focus:ring-primary'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    required
                  >
                    <option value="">
                      {isClubsLoading
                        ? 'Loading clubs...'
                        : clubsLoadError
                        ? 'Clubs unavailable'
                        : clubOptions.length === 0
                        ? 'No clubs available'
                        : 'Select your favourite club'}
                    </option>
                    {clubOptions.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-secondary">
                    expand_more
                  </span>
                </div>
                {isClubsLoading && (
                  <p className="mt-2 text-xs text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Loading available clubs...
                  </p>
                )}
                {!isClubsLoading && clubsLoadError && (
                  <p className="mt-2 text-xs text-primary font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {clubsLoadError}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Choose one club to personalise your Fan ID experience.
                  </p>
                  <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                    One choice
                  </span>
                </div>
                {fieldErrors.favoriteClub && (
                  <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    {fieldErrors.favoriteClub}
                  </p>
                )}
              </div>

              {/* Security confirmation banner */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-surface-variant flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-pitch-green text-2xl">verified_user</span>
                  <div>
                    <h5 className="font-semibold text-sm text-on-surface">National ID Verification</h5>
                    <p className="text-xs text-secondary">Your data will be securely registered with the platform.</p>
                  </div>
                </div>
                <span className="bg-pitch-green/10 text-pitch-green font-bold text-xs px-3 py-1.5 rounded-lg border border-pitch-green/20">
                  Secure ✓
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex flex-col-reverse md:flex-row justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full md:w-auto px-6 py-3 rounded-lg border-2 border-outline-variant text-on-surface font-body-md font-semibold hover:bg-surface-container-high transition-colors text-center cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-8 py-3.5 rounded-lg bg-status-success text-white font-body-md font-bold shadow-lg hover:opacity-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      <span>Creating Fan ID...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      <span>Issue Fan ID & Activate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer matching design */}
      <footer className="w-full mt-auto bg-surface-container-lowest border-t border-outline-variant/40 py-12 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-max-width mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="flex flex-col gap-4">
            <span className="font-headline-md text-headline-md text-primary font-bold">Tazkarti</span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              © 2026 Tazkarti Egypt. All Rights Reserved. Secure National Platform.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Security Standards</a>
          </div>
          <div className="flex flex-col gap-3">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Sponsorships</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;
