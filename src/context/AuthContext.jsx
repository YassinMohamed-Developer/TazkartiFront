import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signIn, registerUser, getProfile, formatProfileData, parseJwt, DEFAULT_MALE_AVATAR, DEFAULT_QR_CODE } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('tazkarti_token') || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedToken = localStorage.getItem('tazkarti_token');
    if (storedToken) {
      const decoded = parseJwt(storedToken);
      if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
        return true;
      }
    }
    return false;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tazkarti_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('tazkarti_token', token);
    } else {
      localStorage.removeItem('tazkarti_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('tazkarti_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tazkarti_user');
    }
  }, [user]);

  /**
   * Fetches fresh profile data from GET /api/Profile/GetProfile
   */
  const fetchProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('tazkarti_token');
    if (!currentToken) return { success: false, message: 'No active session' };

    setIsProfileLoading(true);
    try {
      const res = await getProfile();
      if (res && res.data) {
        const formattedUser = formatProfileData(res.data);
        setUser(formattedUser);
        setIsAuthenticated(true);
        return { success: true, data: formattedUser, message: 'Profile synced successfully.' };
      }
      return { success: true, data: null };
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
      return { 
        success: false, 
        error: err, 
        message: err?.message || 'Unable to sync with server. Using saved profile.',
        isNetworkError: err?.isNetworkError || false
      };
    } finally {
      setIsProfileLoading(false);
    }
  }, []);


  /**
   * Logs in with National ID and Password and fetches full profile.
   */
  const login = async (nationalId, password) => {
    setIsLoading(true);
    try {
      const res = await signIn({ nationalId, password });
      const authToken = res?.data?.token;

      if (!authToken) {
        throw new Error('Token was not returned by server');
      }

      setToken(authToken);
      localStorage.setItem('tazkarti_token', authToken);
      setIsAuthenticated(true);

      // Fetch official profile from GET /Profile/GetProfile
      try {
        const profileRes = await getProfile();
        if (profileRes && profileRes.data) {
          const profile = formatProfileData(profileRes.data);
          setUser(profile);
          return { success: true, message: res.message || 'Login successful.' };
        }
      } catch (profileErr) {
        console.warn('Profile fetch error after login:', profileErr);
      }

      // Fallback user from JWT decode if profile fetch had an issue
      const decoded = parseJwt(authToken);
      const nid = decoded?.UserId || nationalId;
      const fallbackUser = {
        id: nid,
        nationalId: nid,
        fullName: decoded?.UserName || `Fan ${nid.slice(-4)}`,
        fanId: `TZK-${new Date().getFullYear()}-${nid.slice(-4)}`,
        email: '---',
        phoneNumber: '---',
        dateOfBirth: '',
        formattedDob: '---',
        gender: 1,
        genderLabel: 'Male (ذكر)',
        nationality: 'Egyptian',
        governorate: 'Cairo',
        tier: 'Silver Tier Fan',
        attendancePoints: 0,
        avatar: DEFAULT_MALE_AVATAR,
        qrCode: DEFAULT_QR_CODE,
      };

      setUser(fallbackUser);
      return { success: true, message: res.message || 'Login successful.' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user account.
   */
  const register = async (registrationData) => {
    setIsLoading(true);
    try {
      const res = await registerUser(registrationData);
      return { success: true, message: res.message || 'Registration completed successfully.' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out the active user session.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tazkarti_token');
    localStorage.removeItem('tazkarti_user');
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        isProfileLoading,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
