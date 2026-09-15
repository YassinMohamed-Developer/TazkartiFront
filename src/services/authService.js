import { formatAuthErrorMessage } from './authErrors';
import { MOCK_EVENTS } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7020/api';

// These values match the API enum values used by the booking endpoint.
// Keep them in one place so they can be adjusted if the backend enum changes.
export const BOOKING_TYPE_VALUES = {
  match: 1,
  event: 2,
};

export const PAYMENT_METHOD_VALUES = {
  card: 1,
  instapay: 2,
  meeza: 3,
  fawry: 4,
  wallet: 5,
};

export const GENDER_OPTIONS = [
  { id: 1, value: 'male', labelEn: 'Male', labelAr: 'ذكر' },
  { id: 2, value: 'female', labelEn: 'Female', labelAr: 'أنثى' },
];

export const LOYALTY_TIERS = {
  1: 'Silver Tier Fan',
  2: 'Gold Tier Fan',
  3: 'Platinum Tier Fan',
  4: 'Diamond VIP Fan',
};

export const GOVERNORATES = [
  { id: 1, nameEn: 'Cairo', nameAr: 'القاهرة' },
  { id: 2, nameEn: 'Giza', nameAr: 'الجيزة' },
  { id: 3, nameEn: 'Alexandria', nameAr: 'الإسكندرية' },
  { id: 4, nameEn: 'Dakahlia', nameAr: 'الدقهلية' },
  { id: 5, nameEn: 'Red Sea', nameAr: 'البحر الأحمر' },
  { id: 6, nameEn: 'Beheira', nameAr: 'البحيرة' },
  { id: 7, nameEn: 'Fayoum', nameAr: 'الفيوم' },
  { id: 8, nameEn: 'Gharbia', nameAr: 'الغربية' },
  { id: 9, nameEn: 'Ismailia', nameAr: 'الإسماعيلية' },
  { id: 10, nameEn: 'Menofia', nameAr: 'المنوفية' },
  { id: 11, nameEn: 'Minya', nameAr: 'المنيا' },
  { id: 12, nameEn: 'Qaliubiya', nameAr: 'القليوبية' },
  { id: 13, nameEn: 'New Valley', nameAr: 'الوادي الجديد' },
  { id: 14, nameEn: 'Suez', nameAr: 'السويس' },
  { id: 15, nameEn: 'Aswan', nameAr: 'أسوان' },
  { id: 16, nameEn: 'Assiut', nameAr: 'أسيوط' },
  { id: 17, nameEn: 'Beni Suef', nameAr: 'بني سويف' },
  { id: 18, nameEn: 'Port Said', nameAr: 'بورسعيد' },
  { id: 19, nameEn: 'Damietta', nameAr: 'دمياط' },
  { id: 20, nameEn: 'Sharkia', nameAr: 'الشرقية' },
  { id: 21, nameEn: 'South Sinai', nameAr: 'جنوب سيناء' },
  { id: 22, nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ' },
  { id: 23, nameEn: 'Matrouh', nameAr: 'مطروح' },
  { id: 24, nameEn: 'Luxor', nameAr: 'الأقصر' },
  { id: 25, nameEn: 'Qena', nameAr: 'قنا' },
  { id: 26, nameEn: 'North Sinai', nameAr: 'شمال سيناء' },
  { id: 27, nameEn: 'Sohag', nameAr: 'سوهاج' },
];

export const DEFAULT_MALE_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfEi-JMbLcmZW_6rD67Pyr-uhdmKzgBTpCCFpqq5h4QJY0PnvkWWa8jUB1j9seQpGEWThxgEoTTG57SifuNQ__G7RbtqgJW5ck3gvsE3XkOldtTjl71rPOz5kUvhOSyvPOt_hS8GaYCvzTQUfukDGcQZ5toXnbC4pIfsmm1EAX5GojaZ_5Xv9lV0yDtJWRAEffhLeu-wAZNQrSr7Ynj2OmoruglCuLwkqBSDlsM5gWHVYTx95CJvtqXg';
export const DEFAULT_FEMALE_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
export const DEFAULT_QR_CODE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBer5HRCfR9UYy3WLm51yAkpxZEfvYzGP5J27c1CJMSJ7S0LLcbfSYef9s-yCbtOqiB1eG3R_yzDhpV4NX7N4hMJ3Q68SV6w_IZ_KD0lAfimhgv47pQk_8Jo2p7vyWugSEYnVQUd4Bijl6tDUfsyJt4YljoOQICaCcEfiDeQQtx4aWrg9Wd5V6k4c3fBEorNqG9CAMqFrcxCWJQY_uUAuV0o3lv_wviFWDu8xfQG9gPUitQd9jWeZaLkw';

/**
 * Formats date from "2002-08-11T00:00:00" to readable "11 Aug 2002" or "2002-08-11"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '---';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString.split('T')[0] || dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Maps raw backend Profile response data to clean application state.
 */
export const formatProfileData = (data) => {
  if (!data) return null;

  const gov = GOVERNORATES.find((g) => g.id === Number(data.governorate));
  const isFemale = Number(data.gender) === 2;
  const rawFanId = data.fanId || '';
  const cleanFanId = rawFanId.replace(/^Fan\s*Id\s*:\s*/i, '').trim();

  return {
    id: data.id || data.nationalId,
    nationalId: data.id || data.nationalId || '---',
    fanId: cleanFanId ? `TZK-${cleanFanId.replace(/^TZK-?/i, '')}` : (data.fanId || 'TZK-2026'),
    rawFanId: data.fanId || '',
    fullName: data.fullName || 'Citizen Fan',
    email: data.email || '---',
    phoneNumber: data.phoneNumber || '---',
    dateOfBirth: data.dateOfBirth || '',
    formattedDob: formatDate(data.dateOfBirth),
    gender: data.gender,
    genderLabel: isFemale ? 'Female (أنثى)' : 'Male (ذكر)',
    governorateId: data.governorate,
    governorate: gov ? gov.nameEn : 'Cairo',
    governorateAr: gov ? gov.nameAr : 'القاهرة',
    nationalityId: data.nationality,
    nationality: Number(data.nationality) === 1 ? 'Egyptian' : 'International',
    nationalityAr: Number(data.nationality) === 1 ? 'مصري' : 'أجنبي',
    avatar: data.avatarUrl || (isFemale ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR),
    loyaltyTierId: data.loyaltyTier || 1,
    tier: LOYALTY_TIERS[data.loyaltyTier] || 'Silver Tier Fan',
    attendancePoints: data.attendancePoints ?? 0,
    favoriteClubId:
      data.favoriteClubId ??
      data.favouriteClubId ??
      data.favoriteClub?.id ??
      data.favouriteClub?.id ??
      '',
    favoriteClubName:
      data.favoriteClubName ??
      data.favouriteClubName ??
      data.favoriteClub?.name ??
      data.favouriteClub?.name ??
      data.favoriteClub ??
      data.favouriteClub ??
      '',
    qrCode: DEFAULT_QR_CODE,
  };
};

/**
 * Safely decodes a JWT token without requiring external libraries.
 */
export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT payload:', error);
    return null;
  }
};

/**
 * Standard HTTP request wrapper with user-friendly structured error handling.
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('tazkarti_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    console.warn(`[Tazkarti Service] Network request failed to ${url}:`, networkError.message);
    throw {
      isSuccess: false,
      isNetworkError: true,
      statusCode: 0,
      message: 'Unable to connect to Tazkarti services. Please check your internet connection or try again in a few moments.',
      errors: ['Unable to connect to Tazkarti services. Please check your internet connection or try again in a few moments.'],
      technicalDetails: `Could not connect to ${API_BASE_URL} (${networkError.message || 'Connection failed'})`,
    };
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    if (!response.ok) {
      let friendlyMessage = 'An unexpected server error occurred. Please try again.';
      if (response.status >= 500) {
        friendlyMessage = 'Our servers are currently undergoing maintenance or experiencing high traffic. Please try again shortly.';
      } else if (response.status === 401) {
        friendlyMessage = 'Your session has expired or authentication failed. Please sign in again.';
      } else if (response.status === 403) {
        friendlyMessage = 'You do not have permission to perform this action.';
      } else if (response.status === 404) {
        friendlyMessage = 'The requested resource could not be found.';
      }

      throw {
        isSuccess: false,
        statusCode: response.status,
        message: friendlyMessage,
        errors: [friendlyMessage],
        technicalDetails: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    data = { isSuccess: true, statusCode: response.status };
  }

  if (!response.ok || (data && data.isSuccess === false)) {
    const rawMessage = data?.message || data?.title || '';
    const rawErrors = data?.errors 
      ? (Array.isArray(data.errors) ? data.errors : Object.values(data.errors).flat())
      : (rawMessage ? [rawMessage] : []);

    // Format errors to be user-friendly
    const friendlyErrors = rawErrors.length > 0
      ? rawErrors.map((err) => formatAuthErrorMessage(err))
      : [formatAuthErrorMessage(rawMessage || `Request failed (${response.status})`)];

    const primaryFriendlyMessage = friendlyErrors[0] || 'Request failed. Please try again.';

    throw {
      isSuccess: false,
      isNetworkError: false,
      statusCode: data?.statusCode || response.status,
      message: primaryFriendlyMessage,
      errors: friendlyErrors,
      data: data?.data || null,
      technicalDetails: rawMessage || `Status code ${response.status}`,
    };
  }

  return data;
};

const toNullablePositiveInteger = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
};

/**
 * Builds and validates the exact payload expected by POST /Booking/Booking.
 * The API uses the authenticated user's bearer token to identify the user;
 * userId is therefore intentionally not sent by the browser.
 */
export const VENUE_NAME_TO_ID = {
  'Cairo International Stadium': 1,
  'Borg El Arab Stadium': 2,
  '30 June Stadium (Air Defense)': 3,
  '30 June Stadium': 3,
  'Alexandria Stadium': 4,
  'Ismailia Stadium': 5,
  'Ghazl El Mahalla Stadium': 6,
};

export const VENUE_ID_TO_CITY = {
  1: 'Cairo',
  2: 'Alexandria',
  3: 'Cairo',
  4: 'Alexandria',
  5: 'Ismailia',
  6: 'Gharbia',
};

// Known backend DB IDs for matches and categories when not returned in GetAllMatches
export const KNOWN_MATCH_BACKEND_DATA = [
  {
    matchId: 2,
    venueId: 1, // Cairo International Stadium
    city: 'Cairo',
    categoryIds: [2, 3, 4, 5],
  },
  {
    matchId: 3,
    venueId: 3, // 30 June Stadium (Air Defense)
    city: 'Cairo',
    categoryIds: [6, 7, 8],
  },
  {
    matchId: 4,
    venueId: 4, // Alexandria Stadium
    city: 'Alexandria',
    categoryIds: [9, 10, 11, 12, 13],
  },
  {
    matchId: 5,
    venueId: 1, // Cairo International Stadium
    city: 'Cairo',
    categoryIds: [14, 15, 16],
  },
  {
    matchId: 6,
    venueId: 6, // Ghazl El Mahalla Stadium
    city: 'Gharbia',
    categoryIds: [],
  },
];

/**
 * Builds and validates the exact payload expected by POST /Booking/Booking.
 * The API uses the authenticated user's bearer token to identify the user;
 * userId is therefore intentionally not sent by the browser.
 */
export const buildBookingRequest = (booking, paymentMethod) => {
  if (!booking || !booking.item) {
    throw new Error('Your booking session has expired. Please select your tickets again.');
  }

  const bookingType = BOOKING_TYPE_VALUES[booking.type] || 1;
  const paymentValue = PAYMENT_METHOD_VALUES[paymentMethod] || 1;
  const quantity = Math.max(1, Math.min(4, Number(booking.quantity ?? booking.seats?.length ?? 1)));

  // Safely resolve venueId
  const venueId = toNullablePositiveInteger(booking.item.venueId ?? booking.item.venueID)
    || VENUE_NAME_TO_ID[booking.item.venue]
    || VENUE_NAME_TO_ID[booking.item.venueName]
    || 1;

  // Safely resolve matchId
  const rawMatchId = toNullablePositiveInteger(
    booking.item.matchId ?? booking.item.matchID ?? booking.item.id
  );
  const matchId = rawMatchId
    || (typeof booking.item.id === 'string' && booking.item.id.startsWith('match-')
        ? (Number(booking.item.id.replace('match-', '')) + 1)
        : 2);

  // Safely resolve eventId
  const eventId = toNullablePositiveInteger(
    booking.item.eventId ?? booking.item.eventID ?? booking.item.apiId ?? booking.item.id
  ) || (booking.type === 'event' ? 1 : null);

  // Safely resolve categoryId
  const categoryId = toNullablePositiveInteger(booking.category?.categoryId ?? booking.category?.id)
    || (booking.type === 'match' ? 2 : null);

  // Safely resolve tierId
  const tierId = toNullablePositiveInteger(booking.tier?.tierId ?? booking.tier?.id)
    || (booking.type === 'event' ? 1 : null);

  const city = (
    booking.item.city
    || VENUE_ID_TO_CITY[venueId]
    || 'Cairo'
  ).trim();

  const totalAmount = Number.isFinite(Number(booking.totalAmount)) && Number(booking.totalAmount) > 0
    ? Number(booking.totalAmount)
    : (booking.category?.price || booking.tier?.price || 150) * quantity;

  if (!bookingType || !paymentValue) {
    throw new Error('Please choose a valid booking and payment method.');
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 4) {
    throw new Error('Quantity must be between 1 and 4 tickets per Fan ID.');
  }

  if (!venueId || !city) {
    throw new Error('The selected venue and city are not available. Please choose another ticket.');
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('The booking total is invalid. Please select your tickets again.');
  }

  if (booking.type === 'match' && (!matchId || !categoryId)) {
    throw new Error('The selected match ticket category is missing a valid ID. Please reload the match and try again.');
  }

  if (booking.type === 'event' && (!eventId || !tierId)) {
    throw new Error('The selected event tier is missing a valid ID. Please reload the event and try again.');
  }

  const gate = booking.category?.gate || booking.item.gate || 'Gate 1 - Main Entrance';
  const block = booking.category?.name || booking.tier?.name || 'Standard';

  return {
    bookingType,
    matchId: booking.type === 'match' ? matchId : null,
    eventId: booking.type === 'event' ? eventId : null,
    categoryId: booking.type === 'match' ? categoryId : null,
    tierId: booking.type === 'event' ? tierId : null,
    venueId,
    city,
    gate,
    block,
    totalAmount,
    quantity,
    paymentMethod: paymentValue,
  };
};

/**
 * Creates a confirmed booking through the backend.
 * POST https://localhost:7020/api/Booking/Booking
 */
export const createBooking = async (booking, paymentMethod) => {
  const payload = buildBookingRequest(booking, paymentMethod);
  return apiRequest('/Booking/Booking', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Authenticates user with National ID and Password.
 * @param {Object} credentials - { nationalId, password }
 */
export const signIn = async ({ nationalId, password }) => {
  const body = {
    nationalId: nationalId.trim(),
    Password: password,
  };

  const response = await apiRequest('/Auth/SignIn', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return response;
};

/**
 * Registers a new citizen / fan.
 * @param {Object} registrationData
 */
export const registerUser = async (registrationData) => {
  let phoneNumber = String(registrationData.phoneNumber || registrationData.phone || '').trim();

  // Normalize phone number to Egyptian format: 01xxxxxxxxx (11 digits) expected by backend regex ^01[0125]\d{8}$
  if (phoneNumber.startsWith('+200')) {
    phoneNumber = phoneNumber.slice(3);
  } else if (phoneNumber.startsWith('+20')) {
    phoneNumber = '0' + phoneNumber.slice(3);
  } else if (phoneNumber.startsWith('200')) {
    phoneNumber = phoneNumber.slice(2);
  } else if (phoneNumber.startsWith('20') && phoneNumber.length === 12) {
    phoneNumber = '0' + phoneNumber.slice(2);
  }

  const rawDateOfBirth = registrationData.dateOfBirth || registrationData.dob || '';
  const dateOfBirth = /^\d{4}-\d{2}-\d{2}$/.test(rawDateOfBirth)
    ? `${rawDateOfBirth}T00:00:00Z`
    : rawDateOfBirth;

  const body = {
    nationalId: String(registrationData.nationalId || '').trim(),
    nationalName: String(registrationData.nationalName || registrationData.fullName || '').trim(),
    dateOfBirth,
    gender: Number(registrationData.gender),
    phoneNumber,
    email: String(registrationData.email || '').trim(),
    Password: registrationData.Password || registrationData.password,
    governorate: Number(registrationData.governorate),
    favouriteClubId: Number(registrationData.favouriteClubId ?? registrationData.favoriteClubId),
    avatarUrl: registrationData.avatarUrl || registrationData.avatarPreview || null,
  };

  const response = await apiRequest('/Auth/Register', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return response;
};

/**
 * Fetches the authenticated user's profile.
 * GET https://localhost:7020/api/Profile/GetProfile
 */
export const getProfile = async () => {
  const response = await apiRequest('/Profile/GetProfile', {
    method: 'GET',
  });

  return response;
};

/**
 * Fetches all clubs available for Favourite Club selection.
 * GET https://localhost:7020/api/Club/GetAllClubs
 */
export const getAllClubs = async () => {
  const response = await apiRequest('/Club/GetAllClubs', {
    method: 'GET',
  });

  return Array.isArray(response?.data) ? response.data : [];
};

/**
 * Fetches all venues and their gate allocations.
 * GET https://localhost:7020/api/Venues/GetAllVenues
 */
export const getAllVenues = async () => {
  const response = await apiRequest('/Venues/GetAllVenues', {
    method: 'GET',
  });

  if (!Array.isArray(response?.data)) return [];

  return response.data.map((venue, index) => {
    const venueId = toNullablePositiveInteger(venue.id ?? venue.venueId ?? venue.venueID)
      || VENUE_NAME_TO_ID[venue.name]
      || (index + 1);
    return {
      ...venue,
      id: venueId,
      venueId,
    };
  });
};

export const TEAM_LOGOS = {
  'Al Ahly SC': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Al_Ahly_SC_logo.svg/1200px-Al_Ahly_SC_logo.svg.png',
  'Al Ahly': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Al_Ahly_SC_logo.svg/1200px-Al_Ahly_SC_logo.svg.png',
  'Zamalek SC': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/ZamalekSC.png/1200px-ZamalekSC.png',
  'Zamalek': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/ZamalekSC.png/1200px-ZamalekSC.png',
  'Pyramids FC': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/Pyramids_FC_logo.svg/1200px-Pyramids_FC_logo.svg.png',
  'Pyramids': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/Pyramids_FC_logo.svg/1200px-Pyramids_FC_logo.svg.png',
  'Al Masry SC': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Al-Masry_SC_logo.png/220px-Al-Masry_SC_logo.png',
  'Al Masry': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Al-Masry_SC_logo.png/220px-Al-Masry_SC_logo.png',
  'Al Ittihad Alexandria': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/83/Al_Ittihad_Alexandria_Club_logo.png/220px-Al_Ittihad_Alexandria_Club_logo.png',
  'Al Ittihad': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/83/Al_Ittihad_Alexandria_Club_logo.png/220px-Al_Ittihad_Alexandria_Club_logo.png',
  'Ismaily SC': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Ismaily_SC_logo.png/220px-Ismaily_SC_logo.png',
  'Ismaily': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Ismaily_SC_logo.png/220px-Ismaily_SC_logo.png',
  'Ceramica Cleopatra FC': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Ceramica_Cleopatra_FC_logo.png/220px-Ceramica_Cleopatra_FC_logo.png',
  'Ceramica Cleopatra': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Ceramica_Cleopatra_FC_logo.png/220px-Ceramica_Cleopatra_FC_logo.png',
  'Modern Sport FC': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Future_FC_logo.png/220px-Future_FC_logo.png',
  'Modern Sport': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Future_FC_logo.png/220px-Future_FC_logo.png',
  'Ghazl El Mahalla SC': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Ghazl_El_Mahalla_SC_logo.png/220px-Ghazl_El_Mahalla_SC_logo.png',
  'Ghazl El Mahalla': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Ghazl_El_Mahalla_SC_logo.png/220px-Ghazl_El_Mahalla_SC_logo.png',
};

export const TEAM_COLORS = ['#e21e26', '#00618d', '#1DA95E', '#AF7928'];

export const createTeam = (name) => {
  const cleanName = (name || '').trim();
  const foundLogo = TEAM_LOGOS[cleanName] ||
    Object.entries(TEAM_LOGOS).find(([key]) => key.toLowerCase() === cleanName.toLowerCase())?.[1] ||
    null;

  return {
    name: cleanName || 'Unknown Team',
    shortName: (cleanName || 'Team').split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase(),
    logo: foundLogo,
  };
};

const getAvailabilityLabel = (availabilityStatus, availabilityPercent) => {
  if (Number(availabilityStatus) === 1) return 'Sold Out';
  if (Number(availabilityPercent) >= 90) return 'Selling Fast';
  if (Number(availabilityPercent) <= 30) return 'Limited Availability';
  return 'Available';
};

/**
 * Normalizes match data whether from GetAllMatches (summary) or GetMatchById (details with categories).
 */
export const normalizeMatchData = (match, matchIndex = 0) => {
  if (!match || typeof match !== 'object') return null;

  const fallbackData = KNOWN_MATCH_BACKEND_DATA[matchIndex] || {};

  const rawMatchId = toNullablePositiveInteger(match.id ?? match.matchId ?? match.matchID);
  const matchId = rawMatchId || fallbackData.matchId || (matchIndex + 2);

  const rawVenueId = toNullablePositiveInteger(match.venueId ?? match.venueID);
  const venueId = rawVenueId || fallbackData.venueId || VENUE_NAME_TO_ID[match.venueName] || 1;

  const city = (match.city || fallbackData.city || VENUE_ID_TO_CITY[venueId] || 'Cairo').trim();
  const id = String(matchId);

  const categoryNames = Array.isArray(match.nameOfCategoryMatch) ? match.nameOfCategoryMatch : [];
  const prices = Array.isArray(match.price) ? match.price : [];
  const availableSeats = Array.isArray(match.available) ? match.available : [];
  const gates = Array.isArray(match.gateAllocation) ? match.gateAllocation : [];
  const categoryIds = [
    match.categoryId,
    match.categoryIds,
    match.categoryIDs,
    match.matchTicketCategoryIds,
    match.matchTicketCategoryIDs,
    match.idOfCategoryMatch,
  ].find(Array.isArray) || [];
  const categoryObjects = Array.isArray(match.categories) ? match.categories : [];

  const knownCatIds = fallbackData.categoryIds || [];

  const venueImages = {
    'Cairo International Stadium': '/venues/cairo-international-stadium.png',
    'Borg El Arab Stadium': '/venues/borg-el-arab-stadium.png',
    '30 June Stadium (Air Defense)': '/venues/30-june-stadium.png',
    'Alexandria Stadium': '/venues/alexandria-stadium.png',
    'Ismailia Stadium': '/venues/ismailia-stadium.png',
    'Ghazl El Mahalla Stadium': '/venues/ghazl-el-mahalla-stadium.png',
  };

  const bannerImage = (match.bannerImage && typeof match.bannerImage === 'string' && match.bannerImage.trim())
    ? match.bannerImage.trim()
    : (venueImages[match.venueName] || venueImages[match.venue] || '/venues/cairo-international-stadium.png');

  let categories = categoryNames.map((rawName, categoryIndex) => {
    const categoryObject = typeof rawName === 'object' ? rawName : categoryObjects[categoryIndex];
    const name = typeof rawName === 'object'
      ? (rawName.name || rawName.categoryName || rawName.title || `Category ${categoryIndex + 1}`)
      : rawName;
    const rawId = categoryIds[categoryIndex]
      ?? categoryObject?.id
      ?? categoryObject?.categoryId
      ?? knownCatIds[categoryIndex];

    const resolvedCatId = toNullablePositiveInteger(rawId) || (knownCatIds[categoryIndex] ?? (categoryIndex + 1));

    return {
      id: resolvedCatId,
      categoryId: resolvedCatId,
      name,
      price: Number(prices[categoryIndex]) || Number(match.minPrice) || 100,
      available: Number(availableSeats[categoryIndex]) || 100,
      gate: gates[categoryIndex] || 'Main Gate',
      color: TEAM_COLORS[categoryIndex % TEAM_COLORS.length],
    };
  });

  // If no categories were returned (e.g. from GetAllMatches summary), provide standard categories based on minPrice
  if (categories.length === 0) {
    const basePrice = Number(match.minPrice) || 100;
    categories = [
      { id: knownCatIds[0] || 2, categoryId: knownCatIds[0] || 2, name: 'Category 1 - Lower Central', price: basePrice * 3, available: 150, gate: 'Gate 1', color: TEAM_COLORS[0] },
      { id: knownCatIds[1] || 3, categoryId: knownCatIds[1] || 3, name: 'Category 2 - Upper Center', price: basePrice * 2, available: 300, gate: 'Gate 2', color: TEAM_COLORS[1] },
      { id: knownCatIds[2] || 4, categoryId: knownCatIds[2] || 4, name: 'Category 3 - Curva Fan End', price: basePrice, available: 500, gate: 'Gate 4', color: TEAM_COLORS[2] },
    ];
  }

  return {
    ...match,
    id,
    matchId,
    venueId,
    title: match.title || 'Untitled Match',
    league: match.competition || 'Egyptian Premier League',
    competition: match.competition || 'Egyptian Premier League',
    round: match.round || '',
    date: formatDate(match.matchDate),
    time: match.kickoffTime || '20:00',
    venue: match.venueName || match.venue || 'Cairo International Stadium',
    venueName: match.venueName || match.venue || 'Cairo International Stadium',
    city,
    gateOpen: match.gateOpenTime || '',
    availability: getAvailabilityLabel(match.availabilityStatus, match.availabilityPercent),
    availabilityPercent: Number(match.availabilityPercent) || 0,
    minPrice: Number(match.minPrice) || 0,
    bannerImage,
    homeTeam: createTeam(match.homeTeamName || match.homeTeam),
    awayTeam: createTeam(match.awayTeamName || match.awayTeam),
    categories,
  };
};

/**
 * Fetches all matches from backend database.
 * GET https://localhost:7020/api/Matches/GetAllMatches
 */
export const getAllMatches = async () => {
  const response = await apiRequest('/Matches/GetAllMatches', {
    method: 'GET',
  });

  if (!Array.isArray(response?.data)) return [];

  return response.data.map((match, matchIndex) => normalizeMatchData(match, matchIndex)).filter(Boolean);
};

/**
 * Fetches single match details with categories by Match ID.
 * GET https://localhost:7020/api/Matches/GetMatchById/{id}
 */
export const getMatchById = async (id) => {
  const numericId = Number(String(id).replace(/^match-?/i, ''));

  try {
    const response = await apiRequest(`/Matches/GetMatchById/${numericId || id}`, {
      method: 'GET',
    });

    if (response?.data) {
      return normalizeMatchData(response.data);
    }
  } catch (error) {
    console.warn(`[Tazkarti Service] Failed to fetch match ${id} via GetMatchById, falling back to GetAllMatches:`, error.message);
  }

  // Fallback: load all matches and find the match
  const matches = await getAllMatches();
  return matches.find(m => String(m.id) === String(id) || String(m.matchId) === String(id) || String(m.matchId) === String(numericId)) || null;
};

/**
 * Normalizes a ticket pass object returned from the database response.
 * Attributes from database (TicketDto):
 * - bookingOrderId: number
 * - currentFanId: string
 * - holderName: string
 * - price: number
 * - gate: string
 * - status: number
 * - competition: string?
 * - round: string?
 * - title: string?
 * - homeTeam: string?
 * - awayTeam: string?
 * - row: string | number | null
 * - seatNumber: string | number | null
 */
export const normalizeTicketPass = (ticket, index = 0) => {
  if (!ticket || typeof ticket !== 'object') return null;

  try {
    const details = ticket.details && typeof ticket.details === 'object' ? ticket.details : {};

    const rawBookingId = ticket.bookingOrderId ?? ticket.bookingId ?? details.bookingOrderId ?? ticket.id;
    const bookingOrderId = toNullablePositiveInteger(rawBookingId) || (index + 1);

    const rawFanId = String(ticket.currentFanId || ticket.fanId || details.currentFanId || '').trim();
    // Strip optional "Fan Id :" prefix if returned like "Fan Id : TZK-378584"
    const cleanFanId = rawFanId.replace(/^Fan\s*Id\s*:\s*/i, '').trim();

    const holderName = String(ticket.holderName || details.holderName || ticket.name || 'Fan Pass Holder').trim();
    const price = Number(ticket.price ?? details.price) >= 0 ? Number(ticket.price ?? details.price) : 0;
    const gate = String(ticket.gate || details.gate || 'Gate 1').trim();

    const rawRow = (ticket.row ?? details.row) !== null && (ticket.row ?? details.row) !== undefined && String(ticket.row ?? details.row).trim() !== ''
      ? String(ticket.row ?? details.row).trim()
      : null;

    const rawSeat = (ticket.seatNumber ?? details.seatNumber ?? details.seat) !== null && (ticket.seatNumber ?? details.seatNumber ?? details.seat) !== undefined && String(ticket.seatNumber ?? details.seatNumber ?? details.seat).trim() !== ''
      ? String(ticket.seatNumber ?? details.seatNumber ?? details.seat).trim()
      : null;

    const isActive = ticket.isActive !== undefined
      ? Boolean(ticket.isActive)
      : ticket.IsActive !== undefined
      ? Boolean(ticket.IsActive)
      : details.isActive !== undefined
      ? Boolean(details.isActive)
      : true;

    const statusNum = Number.isInteger(Number(ticket.status ?? details.status)) ? Number(ticket.status ?? details.status) : null;
    const statusStr = String(ticket.status ?? details.status ?? '').toLowerCase().trim();

    const isConfirmed = statusNum === 1 || statusStr === '1' || statusStr === 'confirmed' || statusStr === 'active';
    const isTransferred = statusNum === 2 || statusStr === '2' || statusStr === 'transferred';
    const isAttended = statusNum === 3 || statusStr === '3' || statusStr === 'attended';
    const isCancelled = statusNum === 4 || statusStr === '4' || statusStr === 'cancelled' || statusStr === 'canceled';

    const status = isCancelled ? 4 : isAttended ? 3 : isTransferred ? 2 : isConfirmed ? 1 : (statusNum ?? 1);
    const statusLabel = !isActive
      ? 'Inactive Pass'
      : isCancelled
      ? 'Cancelled'
      : isAttended
      ? 'Attended'
      : isTransferred
      ? 'Transferred'
      : 'Active Pass';

    const rawType = String(ticket.type || details.type || '').trim().toLowerCase();
    const isEvent = rawType === 'event' || Boolean(
      details.eventId ||
      ticket.eventId ||
      ticket.EventId ||
      details.tierName ||
      ticket.tierName ||
      details.tierId ||
      ticket.tierId ||
      details.artist ||
      ticket.artist ||
      (details.competition && details.competition.toLowerCase().includes('entertainment')) ||
      (ticket.competition && ticket.competition.toLowerCase().includes('entertainment'))
    );

    // Entertainment Event attributes
    const eventId = toNullablePositiveInteger(details.eventId ?? ticket.eventId ?? ticket.EventId) || null;
    const categoryNum = Number(details.category ?? ticket.category) || 1;
    const categoryLabel = getEventCategoryLabel(details.category ?? ticket.category);
    const artist = String(details.artist || ticket.artist || '').trim();
    const tierId = toNullablePositiveInteger(details.tierId ?? ticket.tierId) || null;
    const tierName = String(details.tierName || ticket.tierName || ticket.tier?.name || (tierId ? `Tier ${tierId}` : 'VIP Pass')).trim();

    // Match attributes from details or ticket
    const competition = String(details.competition || ticket.competition || ticket.Competition || '').trim() || (isEvent ? null : 'Egyptian Premier League');
    const round = String(details.round || ticket.round || ticket.Round || '').trim() || null;
    const homeTeamName = String(details.homeTeam || ticket.homeTeam || ticket.HomeTeam || '').trim() || null;
    const awayTeamName = String(details.awayTeam || ticket.awayTeam || ticket.AwayTeam || '').trim() || null;
    const categoryId = toNullablePositiveInteger(details.categoryId ?? ticket.categoryId) || null;
    const categoryName = String(
      details.categoryName ||
      ticket.categoryName ||
      (isEvent ? categoryLabel : (details.category ? `Category ${details.category}` : 'Category 1'))
    ).trim();
    const block = String(details.block || ticket.block || 'Section B-12').trim();
    const kickoffTime = String(details.kickoffTime || ticket.kickoffTime || details.time || ticket.time || '20:00').trim();
    const gateOpenTime = String(details.gateOpenTime || ticket.gateOpenTime || '16:00').trim();

    let perksList = [];
    const rawPerks = details.perks ?? ticket.perks;
    if (Array.isArray(rawPerks)) {
      perksList = rawPerks.filter(p => p !== null && p !== undefined && String(p).trim() !== '');
    } else if (typeof rawPerks === 'string' && rawPerks.trim()) {
      perksList = rawPerks.includes(',')
        ? rawPerks.split(',').map(s => s.trim()).filter(Boolean)
        : [rawPerks.trim()];
    }
    if (isEvent && perksList.length === 0) {
      perksList = [
        tierName ? `${tierName} Admission` : 'Standard Event Entry',
        'Access to Event Venue & Hospitality Areas',
      ];
    }

    // Dates & Times
    const rawDate = isEvent
      ? (details.eventDate || ticket.eventDate || details.date || ticket.date)
      : (details.matchDate || ticket.matchDate || details.date || ticket.date);
    const formattedDate = formatDate(rawDate);

    const formattedTime = isEvent
      ? (details.eventTime || ticket.eventTime || details.time || ticket.time || '20:30')
      : kickoffTime;

    const city = String(details.city || ticket.city || (isEvent ? 'New Orleans' : 'Cairo')).trim();
    const venue = String(details.venueName || ticket.venueName || ticket.venue || `${city} ${isEvent ? 'Arena' : 'Stadium'}`).trim();

    const rawBanner = details.bannerImage || ticket.bannerImage;
    const bannerImage = (rawBanner && typeof rawBanner === 'string' && rawBanner.trim())
      ? rawBanner.trim()
      : isEvent
      ? (DEFAULT_EVENT_IMAGES[categoryNum] || FALLBACK_EVENT_IMAGES_BY_INDEX[index % FALLBACK_EVENT_IMAGES_BY_INDEX.length])
      : (FALLBACK_EVENT_IMAGES_BY_INDEX[index % FALLBACK_EVENT_IMAGES_BY_INDEX.length] || DEFAULT_EVENT_IMAGES[1]);

    const rawTitle = String(details.title || ticket.title || ticket.Title || '').trim();
    const title = rawTitle
      || (homeTeamName && awayTeamName
        ? `${homeTeamName} vs ${awayTeamName}`
        : (isEvent ? (artist ? `${artist} Live` : 'Live Entertainment Event') : 'Match Pass'));

    const homeTeam = homeTeamName ? createTeam(homeTeamName) : null;
    const awayTeam = awayTeamName ? createTeam(awayTeamName) : null;

    const ticketPassId = ticket.id ?? ticket.ticketPassId ?? ticket.Id ?? ticket.ticketId ?? (ticket.bookingOrderId || bookingOrderId);
    const verifyUrl = `${window.location.origin}/ticket/verify/${ticketPassId}`;
    const qrData = verifyUrl;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}`;

    return {
      ...ticket,
      ...details,
      details,
      ticketPassId,
      id: ticket.id ?? `PASS-${bookingOrderId}-${index}`,
      bookingOrderId,
      isActive,
      currentFanId: rawFanId || (cleanFanId ? `Fan Id : ${cleanFanId}` : 'Fan Id : TZK-000000'),
      cleanFanId: cleanFanId || 'TZK-000000',
      holderName,
      row: rawRow,
      seatNumber: rawSeat,
      price,
      gate,
      status,
      statusLabel,
      competition,
      round,
      title,
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
      homeTeamDetails: homeTeam,
      awayTeamDetails: awayTeam,
      qrData,
      qrCode,
      isGeneralAdmission: !rawRow && !rawSeat,
      // Match specific attributes
      matchId: isEvent ? null : (details.matchId ?? ticket.matchId ?? null),
      categoryId,
      categoryName,
      block,
      kickoffTime,
      gateOpenTime,
      // Entertainment Event attributes
      isEvent,
      type: isEvent ? 'event' : 'match',
      eventId,
      artist: isEvent ? artist : null,
      category: isEvent ? categoryLabel : (categoryName || competition),
      categoryEnum: isEvent ? categoryNum : null,
      tierId: isEvent ? tierId : null,
      tierName: isEvent ? tierName : null,
      perks: perksList,
      date: formattedDate,
      time: formattedTime,
      city,
      venue,
      venueName: details.venueName || ticket.venueName || null,
      bannerImage,
    };
  } catch (err) {
    console.warn('[Tazkarti Service] Error normalizing ticket pass at index', index, err, ticket);
    const fallbackId = ticket.id ?? ticket.ticketPassId ?? (index + 1);
    return {
      ...ticket,
      id: fallbackId,
      ticketPassId: fallbackId,
      bookingOrderId: ticket.bookingOrderId ?? fallbackId,
      title: ticket.title || ticket.details?.title || 'Event / Match Pass',
      holderName: ticket.holderName || ticket.details?.holderName || 'Fan Pass Holder',
      gate: ticket.gate || ticket.details?.gate || 'Gate 1',
      price: Number(ticket.price ?? ticket.details?.price) || 0,
      status: ticket.status ?? 1,
      statusLabel: 'Active Pass',
      isActive: ticket.isActive ?? true,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${window.location.origin}/ticket/verify/${fallbackId}`)}`,
    };
  }
};

/**
 * Fetches all ticket passes stored in the database.
 * GET https://localhost:7020/api/TicketPass/GetAllTickets
 */
export const getAllTicketPasses = async () => {
  const response = await apiRequest('/TicketPass/GetAllTickets', {
    method: 'GET',
  });

  const rawList = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : [];

  return {
    ...response,
    data: rawList.map((item, index) => normalizeTicketPass(item, index)).filter(Boolean),
    rawList,
    rawCount: rawList.length,
  };
};

/**
 * Fetches a single ticket pass by TicketPass Id (handles both Match and Entertainment Event tickets).
 * GET https://localhost:7020/api/TicketPass/GetTicket/{id}
 */
export const getTicketById = async (id) => {
  const response = await apiRequest(`/TicketPass/GetTicket/${id}`, {
    method: 'GET',
  });
  if (response?.data) {
    return {
      ...response,
      data: normalizeTicketPass(response.data),
    };
  }
  return response;
};

/**
 * Validates a ticket at stadium gate by TicketPass Id — checks validity and updates status.
 * POST https://localhost:7020/api/TicketPass/Verify/{id}
 */
export const verifyTicket = async (id) => {
  const response = await apiRequest(`/TicketPass/Verify/${id}`, {
    method: 'POST',
  });
  return response;
};

/**
 * C# Backend EventCategory Enum mapping:
 * public enum EventCategory
 * {
 *     MusicAndConcerts = 1,
 *     ClassicalAndOrchestra = 2,
 *     RockAndIndie = 3,
 *     ComedyAndTheater = 4
 * }
 */
export const EVENT_CATEGORY_ENUM = {
  MusicAndConcerts: 1,
  ClassicalAndOrchestra: 2,
  RockAndIndie: 3,
  ComedyAndTheater: 4,
};

export const EVENT_CATEGORY_MAP = {
  1: 'Music & Concerts',
  2: 'Classical & Orchestra',
  3: 'Rock & Indie',
  4: 'Comedy & Theater',
};

export const getEventCategoryLabel = (category) => {
  if (category === null || category === undefined) return 'Music & Concerts';
  const num = Number(category);
  if (EVENT_CATEGORY_MAP[num]) {
    return EVENT_CATEGORY_MAP[num];
  }
  if (typeof category === 'string') {
    const trimmed = category.trim();
    if (trimmed === 'MusicAndConcerts') return 'Music & Concerts';
    if (trimmed === 'ClassicalAndOrchestra') return 'Classical & Orchestra';
    if (trimmed === 'RockAndIndie') return 'Rock & Indie';
    if (trimmed === 'ComedyAndTheater') return 'Comedy & Theater';
    return trimmed;
  }
  return 'Music & Concerts';
};

export const DEFAULT_EVENT_IMAGES = {
  1: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  2: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
  3: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  4: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
};

export const FALLBACK_EVENT_IMAGES_BY_INDEX = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
];

/**
 * Normalizes an entertainment event object from the API response into the UI shape.
 */
export const normalizeEntertainmentEvent = (event, index = 0) => {
  if (!event || typeof event !== 'object') return null;

  const rawEventId = toNullablePositiveInteger(event.id ?? event.eventId ?? event.entertainmentEventId);
  const eventId = rawEventId || (index + 1);
  const id = String(eventId);

  const categoryNum = Number(event.category) || 1;
  const categoryLabel = getEventCategoryLabel(event.category);

  const rawDate = event.eventDate || event.date;
  const formattedDate = formatDate(rawDate);
  const eventTime = event.eventTime || event.time || '20:00';

  const city = (event.city || 'Cairo').trim();
  const venue = (event.venueName || event.venue || `${city} Cultural Arena`).trim();
  const venueId = toNullablePositiveInteger(event.venueId) || 1;

  const bannerImage = (event.bannerImage && typeof event.bannerImage === 'string' && event.bannerImage.trim())
    ? event.bannerImage.trim()
    : (DEFAULT_EVENT_IMAGES[categoryNum] || FALLBACK_EVENT_IMAGES_BY_INDEX[index % FALLBACK_EVENT_IMAGES_BY_INDEX.length]);

  const isActive = event.isActive !== undefined ? Boolean(event.isActive) : true;

  // Normalize ticket tiers - supports both backend parallel arrays and object arrays
  const tierIds = Array.isArray(event.tierId)
    ? event.tierId
    : [];

  const tierNames = Array.isArray(event.nameOfTicketTier)
    ? event.nameOfTicketTier
    : Array.isArray(event.tiers)
    ? event.tiers.map(t => t.name)
    : [];

  const prices = Array.isArray(event.price)
    ? event.price
    : Array.isArray(event.tiers)
    ? event.tiers.map(t => t.price)
    : [];

  const perks = Array.isArray(event.perks)
    ? event.perks
    : Array.isArray(event.tiers)
    ? event.tiers.map(t => t.perks)
    : [];

  let tiers = tierNames.map((name, tierIndex) => {
    const rawPrice = prices[tierIndex];
    const tierPrice = Number(rawPrice) >= 0 ? Number(rawPrice) : (Number(event.minPrice) || 50);
    const rawPerk = perks[tierIndex];
    const resolvedTierId = toNullablePositiveInteger(tierIds[tierIndex]) ?? (tierIndex + 1);

    let perksList = [];
    if (Array.isArray(rawPerk)) {
      perksList = rawPerk.filter(p => p !== null && p !== undefined && String(p).trim() !== '');
    } else if (typeof rawPerk === 'string' && rawPerk.trim()) {
      perksList = rawPerk.includes(',')
        ? rawPerk.split(',').map(s => s.trim()).filter(Boolean)
        : [rawPerk.trim()];
    }

    if (perksList.length === 0) {
      if (tierIndex === 0) {
        perksList = ['Standard event admission', 'Access to general event grounds'];
      } else {
        perksList = ['Premium seating area', 'Express entry & fast track access', 'Dedicated hospitality service'];
      }
    }

    return {
      id: `tier-${resolvedTierId}`,
      tierId: resolvedTierId,
      name: name || `Tier ${resolvedTierId}`,
      price: tierPrice,
      perks: perksList,
    };
  });

  // If no tier arrays existed but event.tiers is an array of objects
  if (tiers.length === 0 && Array.isArray(event.tiers) && event.tiers.length > 0) {
    tiers = event.tiers.map((t, tIdx) => {
      const resolvedTierId = toNullablePositiveInteger(t.tierId ?? t.id) ?? (tIdx + 1);
      return {
        id: `tier-${resolvedTierId}`,
        tierId: resolvedTierId,
        name: t.name || `Tier ${resolvedTierId}`,
        price: Number(t.price) || 50,
        perks: Array.isArray(t.perks)
          ? t.perks.filter(Boolean)
          : [t.perks || 'Standard entry'],
      };
    });
  }

  if (tiers.length === 0) {
    tiers = [
      {
        id: 'tier-1',
        tierId: 1,
        name: 'General Admission',
        price: Number(event.minPrice) || 50,
        perks: ['Standard event entry', 'General access to grounds'],
      },
    ];
  }

  const calculatedMinPrice = Number(event.minPrice) > 0
    ? Number(event.minPrice)
    : Math.min(...tiers.map(t => t.price));

  return {
    ...event,
    id,
    eventId,
    title: event.title || 'Untitled Entertainment Event',
    category: categoryLabel,
    categoryEnum: categoryNum,
    tag: event.tag || 'Festival',
    artist: event.artist || 'Featured Artist',
    date: formattedDate,
    rawEventDate: rawDate,
    time: eventTime,
    venueId,
    venueName: event.venueName || null,
    venue,
    city,
    minPrice: calculatedMinPrice,
    bannerImage,
    description: event.description || 'Join us for an unforgettable live entertainment experience in Egypt.',
    isActive,
    nameOfTicketTier: tierNames,
    price: prices,
    perks: perks,
    tiers,
  };
};

/**
 * Fetches all entertainment events from backend API.
 * GET https://localhost:7020/api/EntertainmentEvents/GetAllEntertainmentEvent
 */
export const getAllEntertainmentEvents = async () => {
  try {
    const response = await apiRequest('/EntertainmentEvents/GetAllEntertainmentEvent', {
      method: 'GET',
    });

    const rawList = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
      ? response
      : [];

    if (rawList.length > 0) {
      return rawList.map((item, index) => normalizeEntertainmentEvent(item, index)).filter(Boolean);
    }
  } catch (error) {
    console.warn('[Tazkarti Service] Failed to fetch entertainment events from API, using fallback data:', error.message || error);
  }

  return MOCK_EVENTS.map((item, index) => normalizeEntertainmentEvent(item, index)).filter(Boolean);
};

export default {
  signIn,
  registerUser,
  getProfile,
  formatProfileData,
  parseJwt,
  GOVERNORATES,
  GENDER_OPTIONS,
  LOYALTY_TIERS,
  getAllClubs,
  getAllVenues,
  getAllMatches,
  getMatchById,
  normalizeMatchData,
  createBooking,
  buildBookingRequest,
  BOOKING_TYPE_VALUES,
  PAYMENT_METHOD_VALUES,
  getAllTicketPasses,
  normalizeTicketPass,
  createTeam,
  TEAM_LOGOS,
  getTicketById,
  verifyTicket,
  EVENT_CATEGORY_ENUM,
  EVENT_CATEGORY_MAP,
  getEventCategoryLabel,
  normalizeEntertainmentEvent,
  getAllEntertainmentEvents,
};


