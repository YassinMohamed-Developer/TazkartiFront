/**
 * Backend AuthError string constants matching the ASP.NET Core backend AuthError static class.
 */
export const AuthErrors = {
  HaveSameNationalId: 'This National Id already exists.',
  InvalidNationalId: 'This is Invalid National Id ',
  InvalidEmail: 'This is Invalid Email ',
  InvalidCredentials: 'Invalid credentials for ',
  EmailAlreadyExists: 'This Email already exists',
  UserNameAlreadyExists: 'Username already exists.',
  RegistrationSucceeded: 'Registration completed successfully.',
  RegistrationFailed: 'Registration failed.',
  PasswordResetFailed: 'The operation could not be completed.',
  PasswordChanged: 'Your password has been changed.',
  CheckYourEmail: 'Please check your email.',
  FailedToCreateUser: 'Failed to create the user.',
  InvalidToken: 'Invalid token.',
  GoogleAuthenticationFailed: 'Google authentication failed.',
  LoginSucceeded: 'Login successful.',
};

/**
 * Translates technical, raw backend, or network error messages into friendly,
 * human-readable messages that are easy for regular users to understand.
 * 
 * @param {string} raw - The raw error string or code
 * @returns {string} - User-friendly message
 */
export const formatAuthErrorMessage = (raw) => {
  if (!raw || typeof raw !== 'string') {
    return 'An unexpected issue occurred. Please try again.';
  }

  const clean = raw.trim();
  const lower = clean.toLowerCase();

  // Network / Server Connection Failures
  if (
    lower.includes('unable to connect') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('connection refused') ||
    lower.includes('localhost') ||
    lower.includes('net::err') ||
    lower.includes('cors') ||
    lower.includes('econnrefused')
  ) {
    return 'Unable to connect to Tazkarti services. Please check your internet connection or try again in a few moments.';
  }

  // HTTP Server Error Responses
  if (lower.includes('http error 500') || lower.includes('http error 502') || lower.includes('http error 503') || lower.includes('http error 504') || lower.includes('internal server error')) {
    return 'Our servers are currently experiencing high traffic or undergoing maintenance. Please try again shortly.';
  }
  if (lower.includes('http error 401') || lower.includes('unauthorized')) {
    return 'Authentication failed or session expired. Please sign in again.';
  }
  if (lower.includes('http error 403') || lower.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }
  if (lower.includes('http error 404') || lower.includes('not found')) {
    return 'The requested resource could not be found.';
  }

  // Credentials / Auth
  if (
    clean.includes(AuthErrors.InvalidCredentials.trim()) ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid username or password') ||
    lower.includes('wrong password')
  ) {
    return 'Invalid National ID or Password. Please check your credentials and try again.';
  }

  // National ID
  if (
    clean.includes(AuthErrors.HaveSameNationalId.trim()) ||
    (lower.includes('national id') && lower.includes('already exists'))
  ) {
    return 'An account with this National ID already exists. Please sign in or reset your password.';
  }
  if (
    clean.includes(AuthErrors.InvalidNationalId.trim()) ||
    lower.includes('invalid national id')
  ) {
    return 'Please enter a valid 14-digit Egyptian National ID number.';
  }

  // Email
  if (
    clean.includes(AuthErrors.EmailAlreadyExists.trim()) ||
    (lower.includes('email') && lower.includes('already exists'))
  ) {
    return 'This email address is already registered. Please sign in or use another email.';
  }
  if (
    clean.includes(AuthErrors.InvalidEmail.trim()) ||
    lower.includes('invalid email')
  ) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }

  // Username / National Name
  if (
    clean.includes(AuthErrors.UserNameAlreadyExists.trim()) ||
    (lower.includes('username') && lower.includes('already exists'))
  ) {
    return 'This name is already in use. Please enter your full official name.';
  }

  // User creation failure
  if (
    clean.includes(AuthErrors.FailedToCreateUser.trim()) ||
    lower.includes('failed to create')
  ) {
    return 'We were unable to create your account. Please review your details and try again.';
  }

  // Token errors
  if (clean.includes(AuthErrors.InvalidToken.trim()) || lower.includes('invalid token')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Password reset failure
  if (
    clean.includes(AuthErrors.PasswordResetFailed.trim()) ||
    lower.includes('operation could not be completed')
  ) {
    return 'Unable to complete password reset at this time. Please try again later.';
  }

  // Phone number
  if (
    lower.includes('phone') ||
    lower.includes('egyptian phone') ||
    lower.includes('phonenumber')
  ) {
    return 'Please enter a valid Egyptian phone number (11 digits, starting with 010, 011, 012, or 015).';
  }

  // Password complexity / regex from ASP.NET Identity & DTO
  if (lower.includes('password') && (lower.includes('regular expression') || lower.includes('regex') || lower.includes('pattern') || lower.includes('match'))) {
    return 'Password must start with an uppercase letter (A-Z) and contain at least 6 characters.';
  }
  if (lower.includes('non alphanumeric')) {
    return 'Password must contain at least one special character (e.g. !@#$%^&*).';
  }
  if (lower.includes('digit') && lower.includes('password')) {
    return 'Password must contain at least one number (0-9).';
  }
  if (lower.includes('uppercase') && lower.includes('password')) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (lower.includes('lowercase') && lower.includes('password')) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (lower.includes('must be at least') && lower.includes('characters') && lower.includes('password')) {
    return 'Password must be at least 6 characters in length.';
  }

  // National ID format
  if (lower.includes('national id') && (lower.includes('14') || lower.includes('digit') || lower.includes('regular expression'))) {
    return 'National ID must be exactly 14 numeric digits.';
  }

  return clean;
};

/**
 * Maps error messages received from the backend to specific form field names and user-friendly text.
 * 
 * @param {string|Array<string>|Object} rawErrors
 * @returns {Object} { 
 *   fieldErrors: { [fieldName]: string }, 
 *   generalErrors: string[], 
 *   primaryMessage: string,
 *   isNetworkError: boolean,
 *   isAlreadyRegistered: boolean,
 *   isCredentialError: boolean
 * }
 */
export const mapAuthErrorsToFields = (rawErrors) => {
  let errorList = [];
  const fieldErrors = {};
  const generalErrors = [];
  let isNetworkError = false;
  let isAlreadyRegistered = false;
  let isCredentialError = false;

  if (Array.isArray(rawErrors)) {
    errorList = rawErrors;
  } else if (typeof rawErrors === 'string') {
    errorList = [rawErrors];
  } else if (rawErrors && typeof rawErrors === 'object') {
    if (Array.isArray(rawErrors.errors)) {
      errorList = rawErrors.errors;
    } else if (rawErrors.errors && typeof rawErrors.errors === 'object') {
      // Map dictionary of errors like { PhoneNumber: ["Please enter..."], Password: [...] }
      for (const [fieldKey, msgs] of Object.entries(rawErrors.errors)) {
        const msgList = Array.isArray(msgs) ? msgs : [msgs];
        const kLower = fieldKey.toLowerCase();
        for (const msg of msgList) {
          const friendly = formatAuthErrorMessage(msg);
          if (kLower.includes('phone')) {
            fieldErrors.phoneNumber = friendly;
          } else if (kLower.includes('password')) {
            fieldErrors.password = friendly;
          } else if (kLower.includes('nationalid') || kLower.includes('national id')) {
            fieldErrors.nationalId = friendly;
          } else if (kLower.includes('nationalname') || kLower.includes('fullname') || kLower.includes('name')) {
            fieldErrors.nationalName = friendly;
          } else if (kLower.includes('email')) {
            fieldErrors.email = friendly;
          } else if (kLower.includes('dateofbirth') || kLower.includes('dob')) {
            fieldErrors.dateOfBirth = friendly;
          } else if (kLower.includes('club')) {
            fieldErrors.favoriteClub = friendly;
          } else {
            generalErrors.push(friendly);
          }
          errorList.push(msg);
        }
      }
    } else if (rawErrors.message) {
      errorList = [rawErrors.message];
    }
  }

  for (const err of errorList) {
    if (!err || typeof err !== 'string') continue;
    const friendly = formatAuthErrorMessage(err);
    const lower = err.toLowerCase();

    // Check for network error indicators
    if (
      lower.includes('unable to connect') ||
      lower.includes('failed to fetch') ||
      lower.includes('network error') ||
      lower.includes('connection refused') ||
      lower.includes('localhost') ||
      lower.includes('net::err') ||
      lower.includes('cors')
    ) {
      isNetworkError = true;
      generalErrors.push(friendly);
      continue;
    }

    // Check field classifications
    if (
      err.includes(AuthErrors.HaveSameNationalId.trim()) ||
      lower.includes('national id already exists')
    ) {
      isAlreadyRegistered = true;
      fieldErrors.nationalId = friendly;
      generalErrors.push(friendly);
    } else if (
      err.includes(AuthErrors.InvalidNationalId.trim()) ||
      (lower.includes('national id') && !lower.includes('credentials'))
    ) {
      fieldErrors.nationalId = friendly;
      generalErrors.push(friendly);
    } else if (
      err.includes(AuthErrors.InvalidEmail.trim()) ||
      err.includes(AuthErrors.EmailAlreadyExists.trim()) ||
      lower.includes('email')
    ) {
      if (err.includes(AuthErrors.EmailAlreadyExists.trim()) || lower.includes('already exists')) {
        isAlreadyRegistered = true;
      }
      fieldErrors.email = friendly;
      generalErrors.push(friendly);
    } else if (
      err.includes(AuthErrors.InvalidCredentials.trim()) ||
      lower.includes('credentials') ||
      lower.includes('password')
    ) {
      if (lower.includes('credentials') || err.includes(AuthErrors.InvalidCredentials.trim())) {
        isCredentialError = true;
      }
      fieldErrors.password = friendly;
      generalErrors.push(friendly);
    } else if (
      err.includes(AuthErrors.UserNameAlreadyExists.trim()) ||
      lower.includes('username') ||
      lower.includes('nationalname')
    ) {
      fieldErrors.nationalName = friendly;
      generalErrors.push(friendly);
    } else if (lower.includes('date of birth') || lower.includes('dateofbirth') || lower.includes('dob')) {
      fieldErrors.dateOfBirth = friendly;
      generalErrors.push(friendly);
    } else if (lower.includes('phone')) {
      fieldErrors.phoneNumber = friendly;
      generalErrors.push(friendly);
    } else if (lower.includes('club')) {
      fieldErrors.favoriteClub = friendly;
      generalErrors.push(friendly);
    } else {
      generalErrors.push(friendly);
    }
  }

  const primaryMessage =
    generalErrors.length > 0
      ? generalErrors[0]
      : Object.values(fieldErrors)[0] || 'An error occurred. Please try again.';

  return {
    fieldErrors,
    generalErrors: generalErrors.length > 0 ? generalErrors : [primaryMessage],
    primaryMessage,
    isNetworkError,
    isAlreadyRegistered,
    isCredentialError,
  };
};

export default AuthErrors;
