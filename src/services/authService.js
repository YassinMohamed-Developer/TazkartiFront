import { formatAuthErrorMessage } from './authErrors';

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
  const rawPhoneNumber = String(registrationData.phoneNumber || registrationData.phone || '').trim();
  const phoneNumber = rawPhoneNumber.startsWith('+20')
    ? rawPhoneNumber
    : rawPhoneNumber.startsWith('20')
    ? `+${rawPhoneNumber}`
    : rawPhoneNumber.startsWith('0')
    ? `+20${rawPhoneNumber}`
    : rawPhoneNumber;

  const rawDateOfBirth = registrationData.dateOfBirth || registrationData.dob || '';
  const dateOfBirth = /^\d{4}-\d{2}-\d{2}$/.test(rawDateOfBirth)
    ? `${rawDateOfBirth}T00:00:00Z`
    : rawDateOfBirth;

  const body = {
    nationalName: registrationData.nationalName || registrationData.fullName,
    email: registrationData.email,
    dateOfBirth,
    gender: Number(registrationData.gender),
    governorate: Number(registrationData.governorate),
    phoneNumber,
    nationalId: registrationData.nationalId,
    favouriteClubId: Number(registrationData.favouriteClubId ?? registrationData.favoriteClubId),
    Password: registrationData.Password || registrationData.password,
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
 * Fetches all matches and maps the backend arrays into the shape used by the UI.
 * GET https://localhost:7020/api/Matches/GetAllMatches
 */
export const getAllMatches = async () => {
  const response = await apiRequest('/Matches/GetAllMatches', {
    method: 'GET',
  });

  if (!Array.isArray(response?.data)) return [];

  return response.data.map((match, matchIndex) => {
    const categoryNames = Array.isArray(match.nameOfCategoryMatch) ? match.nameOfCategoryMatch : [];
    const prices = Array.isArray(match.price) ? match.price : [];
    const availableSeats = Array.isArray(match.available) ? match.available : [];
    const gates = Array.isArray(match.gateAllocation) ? match.gateAllocation : [];
    const categoryIds = [
      match.categoryIds,
      match.categoryIDs,
      match.matchTicketCategoryIds,
      match.matchTicketCategoryIDs,
      match.idOfCategoryMatch,
      match.categoryId,
    ].find(Array.isArray) || [];
    const categoryObjects = Array.isArray(match.categories) ? match.categories : [];

    const fallbackData = KNOWN_MATCH_BACKEND_DATA[matchIndex] || {};

    const rawMatchId = toNullablePositiveInteger(match.matchId ?? match.matchID ?? match.id);
    const matchId = rawMatchId || fallbackData.matchId || (matchIndex + 2);

    const rawVenueId = toNullablePositiveInteger(match.venueId ?? match.venueID);
    const venueId = rawVenueId || fallbackData.venueId || VENUE_NAME_TO_ID[match.venueName] || 1;

    const city = (match.city || fallbackData.city || VENUE_ID_TO_CITY[venueId] || 'Cairo').trim();

    // Use string matchId for URL routing (e.g. "2") while supporting legacy match-1 links
    const id = String(matchId);

    const knownCatIds = fallbackData.categoryIds || [];

    return {
      ...match,
      id,
      matchId,
      venueId,
      title: match.title || 'Untitled Match',
      league: match.competition || 'Football Match',
      date: formatDate(match.matchDate),
      time: match.kickoffTime || 'Time unavailable',
      venue: match.venueName || 'Venue unavailable',
      city,
      gateOpen: match.gateOpenTime || '',
      availability: getAvailabilityLabel(match.availabilityStatus, match.availabilityPercent),
      availabilityPercent: Number(match.availabilityPercent) || 0,
      minPrice: Number(match.minPrice) || 0,
      homeTeam: createTeam(match.homeTeamName),
      awayTeam: createTeam(match.awayTeamName),
      categories: categoryNames.map((rawName, categoryIndex) => {
        const categoryObject = typeof rawName === 'object' ? rawName : categoryObjects[categoryIndex];
        const name = typeof rawName === 'object'
          ? (rawName.name || rawName.categoryName || rawName.title || `Category ${categoryIndex + 1}`)
          : rawName;
        const rawId = categoryIds[categoryIndex]
          ?? categoryObject?.id
          ?? categoryObject?.categoryId
          ?? knownCatIds[categoryIndex];

        const categoryId = toNullablePositiveInteger(rawId) || (knownCatIds[categoryIndex] ?? (categoryIndex + 1));

        return {
          id: categoryId,
          categoryId,
          name,
          price: Number(prices[categoryIndex]) || 0,
          available: Number(availableSeats[categoryIndex]) || 0,
          gate: gates[categoryIndex] || 'Main Gate',
          color: TEAM_COLORS[categoryIndex % TEAM_COLORS.length],
        };
      }),
    };
  });
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

  const rawBookingId = ticket.bookingOrderId ?? ticket.bookingId ?? ticket.id;
  const bookingOrderId = toNullablePositiveInteger(rawBookingId) || (index + 1);

  const rawFanId = String(ticket.currentFanId || ticket.fanId || '').trim();
  // Strip optional "Fan Id :" prefix if returned like "Fan Id : TZK-378584"
  const cleanFanId = rawFanId.replace(/^Fan\s*Id\s*:\s*/i, '').trim();

  const holderName = (ticket.holderName || ticket.name || 'Fan Pass Holder').trim();
  const price = Number(ticket.price) >= 0 ? Number(ticket.price) : 0;
  const gate = ticket.gate ? String(ticket.gate).trim() : 'Gate 1';

  const rawRow = ticket.row !== null && ticket.row !== undefined && String(ticket.row).trim() !== ''
    ? String(ticket.row).trim()
    : null;

  const rawSeat = ticket.seatNumber !== null && ticket.seatNumber !== undefined && String(ticket.seatNumber).trim() !== ''
    ? String(ticket.seatNumber).trim()
    : null;

  const isActive = ticket.isActive !== undefined
    ? Boolean(ticket.isActive)
    : ticket.IsActive !== undefined
    ? Boolean(ticket.IsActive)
    : true;

  const statusNum = Number.isInteger(Number(ticket.status)) ? Number(ticket.status) : null;
  const statusStr = String(ticket.status || '').toLowerCase().trim();

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

  // New match attributes from TicketDto
  const competition = (ticket.competition || ticket.Competition || '').trim() || null;
  const round = (ticket.round || ticket.Round || '').trim() || null;
  const homeTeamName = (ticket.homeTeam || ticket.HomeTeam || '').trim() || null;
  const awayTeamName = (ticket.awayTeam || ticket.AwayTeam || '').trim() || null;

  const title = (ticket.title || ticket.Title || '').trim()
    || (homeTeamName && awayTeamName ? `${homeTeamName} vs ${awayTeamName}` : 'Match Pass');

  const homeTeam = homeTeamName ? createTeam(homeTeamName) : null;
  const awayTeam = awayTeamName ? createTeam(awayTeamName) : null;

  const ticketPassId = ticket.id ?? ticket.ticketPassId ?? ticket.Id ?? ticket.ticketId ?? (ticket.bookingOrderId || bookingOrderId);
  const verifyUrl = `${window.location.origin}/ticket/verify/${ticketPassId}`;
  const qrData = verifyUrl;
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}`;

  return {
    ...ticket,
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
  };
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
 * Fetches a single ticket pass by TicketPass Id.
 * GET https://localhost:7020/api/TicketPass/GetTicket/{id}
 */
export const getTicketById = async (id) => {
  const response = await apiRequest(`/TicketPass/GetTicket/${id}`, {
    method: 'GET',
  });
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
};

