import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * BUKTON demo authentication layer.
 *
 * This version intentionally uses localStorage instead of Firebase so the
 * portfolio demo works without a network connection to Firebase.
 * It is suitable for the portfolio/demo version only, not production auth.
 */

export interface LocalUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface BookingRecord {
  id?: string;
  userId: string;
  specialistId: string;
  specialistName: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  bookingStatus: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  clientName?: string;
  clientPhone?: string;
  notes?: string;
  bookingCode?: string;
}

interface StoredDemoUser extends UserProfile {
  password: string;
}

interface AuthContextType {
  user: LocalUser | null;
  userProfile: UserProfile | null;
  bookings: BookingRecord[];
  isLoadingAuth: boolean;
  isLoadingBookings: boolean;
  login: (email: string, pass: string) => Promise<LocalUser>;
  loginGoogle: () => Promise<LocalUser>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<LocalUser>;
  logout: () => Promise<void>;
  saveBooking: (
    bookingData: Omit<BookingRecord, 'id' | 'userId' | 'createdAt' | 'bookingStatus'> & {
      bookingStatus?: 'confirmed' | 'completed' | 'cancelled';
    }
  ) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  users: 'bukton_demo_users',
  currentUser: 'bukton_demo_current_user',
  bookings: 'bukton_demo_bookings',
} as const;

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[BUKTON Demo] Could not save local data:', error);
  }
};

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createLocalUser = (profile: UserProfile): LocalUser => ({
  uid: profile.id,
  email: profile.email,
  displayName: profile.name,
  phoneNumber: profile.phone || '',
});

const getCurrentUserFromStorage = (): LocalUser | null => {
  return safeRead<LocalUser | null>(STORAGE_KEYS.currentUser, null);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Restore the demo session when the page is refreshed.
  useEffect(() => {
    const storedUser = getCurrentUserFromStorage();

    if (storedUser) {
      const storedUsers = safeRead<StoredDemoUser[]>(STORAGE_KEYS.users, []);
      const storedProfile = storedUsers.find((item) => item.id === storedUser.uid);

      setUser(storedUser);
      setUserProfile(
        storedProfile || {
          id: storedUser.uid,
          name: storedUser.displayName || 'کاربر بوکتون',
          email: storedUser.email,
          phone: storedUser.phoneNumber || '',
          createdAt: new Date().toISOString(),
        }
      );
    }

    setIsLoadingAuth(false);
  }, []);

  // Load bookings from localStorage whenever the active user changes.
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setIsLoadingBookings(false);
      return;
    }

    setIsLoadingBookings(true);

    const allBookings = safeRead<BookingRecord[]>(STORAGE_KEYS.bookings, []);
    const userBookings = allBookings
      .filter((booking) => booking.userId === user.uid)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    setBookings(userBookings);
    setIsLoadingBookings(false);
  }, [user]);

  const login = async (email: string, pass: string): Promise<LocalUser> => {
    const normalizedEmail = normalizeEmail(email);
    const users = safeRead<StoredDemoUser[]>(STORAGE_KEYS.users, []);
    const storedUser = users.find((item) => item.email === normalizedEmail);

    if (!storedUser) {
      const error = new Error('کاربر پیدا نشد.') as Error & { code?: string };
      error.code = 'auth/user-not-found';
      throw error;
    }

    if (storedUser.password !== pass) {
      const error = new Error('رمز عبور نادرست است.') as Error & { code?: string };
      error.code = 'auth/wrong-password';
      throw error;
    }

    const nextUser = createLocalUser(storedUser);
    safeWrite(STORAGE_KEYS.currentUser, nextUser);
    setUser(nextUser);
    setUserProfile(storedUser);

    return nextUser;
  };

  const loginGoogle = async (): Promise<LocalUser> => {
    // Portfolio-demo replacement for Google OAuth.
    // It keeps the existing UI flow working without an external provider.
    const demoEmail = 'google-demo@bukton.local';
    const users = safeRead<StoredDemoUser[]>(STORAGE_KEYS.users, []);
    let demoUser = users.find((item) => item.email === demoEmail);

    if (!demoUser) {
      demoUser = {
        id: createId('user'),
        name: 'کاربر گوگل',
        email: demoEmail,
        phone: '',
        createdAt: new Date().toISOString(),
        password: createId('google'),
      };

      safeWrite(STORAGE_KEYS.users, [...users, demoUser]);
    }

    const nextUser = createLocalUser(demoUser);
    safeWrite(STORAGE_KEYS.currentUser, nextUser);
    setUser(nextUser);
    setUserProfile(demoUser);

    return nextUser;
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    phone?: string
  ): Promise<LocalUser> => {
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = name.trim();

    if (!trimmedName) {
      const error = new Error('نام را وارد کنید.') as Error & { code?: string };
      error.code = 'auth/invalid-display-name';
      throw error;
    }

    if (!normalizedEmail) {
      const error = new Error('ایمیل را وارد کنید.') as Error & { code?: string };
      error.code = 'auth/invalid-email';
      throw error;
    }

    if (pass.length < 6) {
      const error = new Error('رمز عبور باید حداقل ۶ کاراکتر داشته باشد.') as Error & { code?: string };
      error.code = 'auth/weak-password';
      throw error;
    }

    const users = safeRead<StoredDemoUser[]>(STORAGE_KEYS.users, []);

    if (users.some((item) => item.email === normalizedEmail)) {
      const error = new Error('این ایمیل قبلاً ثبت شده است.') as Error & { code?: string };
      error.code = 'auth/email-already-in-use';
      throw error;
    }

    const newUser: StoredDemoUser = {
      id: createId('user'),
      name: trimmedName,
      email: normalizedEmail,
      phone: phone?.trim() || '',
      createdAt: new Date().toISOString(),
      password: pass,
    };

    safeWrite(STORAGE_KEYS.users, [...users, newUser]);

    const nextUser = createLocalUser(newUser);
    safeWrite(STORAGE_KEYS.currentUser, nextUser);
    setUser(nextUser);
    setUserProfile(newUser);

    return nextUser;
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    setUser(null);
    setUserProfile(null);
    setBookings([]);
  };

  const saveBooking = async (
    bookingData: Omit<BookingRecord, 'id' | 'userId' | 'createdAt' | 'bookingStatus'> & {
      bookingStatus?: 'confirmed' | 'completed' | 'cancelled';
    }
  ): Promise<string> => {
    if (!user) {
      throw new Error('برای ثبت نوبت باید وارد حساب کاربری خود شوید.');
    }

    const bookingId = createId('booking');
    const booking: BookingRecord = {
      ...bookingData,
      id: bookingId,
      userId: user.uid,
      bookingStatus: bookingData.bookingStatus || 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const allBookings = safeRead<BookingRecord[]>(STORAGE_KEYS.bookings, []);
    const nextBookings = [booking, ...allBookings];

    safeWrite(STORAGE_KEYS.bookings, nextBookings);
    setBookings(
      nextBookings
        .filter((item) => item.userId === user.uid)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    );

    return bookingId;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        bookings,
        isLoadingAuth,
        isLoadingBookings,
        login,
        loginGoogle,
        register,
        logout,
        saveBooking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
