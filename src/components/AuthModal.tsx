import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ASSET_IMAGES } from '../data/mockData';
import { FIREBASE_PROJECT_ID } from '../utils/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: (userEmail: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { login, loginGoogle, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    code: string;
    message: string;
    description: string;
  } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading && !isGoogleLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const parseFirebaseError = (err: any) => {
    const code = err?.code || 'unknown-error';
    const message = err?.message || String(err);

    // Log exact Firebase Auth error code and details to console for debugging
    console.error('[BUKTON Firebase Auth Error]:', {
      code,
      message,
      project: FIREBASE_PROJECT_ID,
      errorObj: err,
    });

    let description = '';

    switch (code) {
      case 'auth/operation-not-allowed':
        description =
          'ورود با ایمیل و رمز عبور در حال حاضر در دسترس نیست. می‌توانید با روش دیگری وارد شوید یا بعداً دوباره تلاش کنید.';
        break;
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid':
        description = 'کلید API پروژه فایربیس نامعتبر است. لطفاً پیکربندی فایربیس را بررسی کنید.';
        break;
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        description = 'ایمیل یا رمز عبور واردشده نادرست است. لطفاً مجدداً بررسی فرمایید.';
        break;
      case 'auth/email-already-in-use':
        description = 'این ایمیل قبلاً در سیستم ثبت‌نام شده است. لطفاً وارد حساب خود شوید.';
        break;
      case 'auth/weak-password':
        description = 'رمز عبور باید حداقل ۶ کاراکتر داشته باشد.';
        break;
      case 'auth/invalid-email':
        description = 'فرمت ایمیل واردشده نامعتبر است (مثال صحیح: name@example.com).';
        break;
      case 'auth/network-request-failed':
        description = 'ارتباط با سرویس ورود برقرار نشد. اتصال اینترنت و دسترسی شبکه را بررسی کنید و دوباره تلاش نمایید.';
        break;
      case 'auth/too-many-requests':
        description = 'تعداد تلاش‌های ناموفق بیش از حد مجاز بوده است. لطفاً کمی بعد مجدداً تلاش کنید.';
        break;
      case 'auth/popup-closed-by-user':
        description = 'پنجره ورود توسط کاربر قبل از تکمیل بسته شد.';
        break;
      case 'auth/cancelled-popup-request':
        description = 'درخواست ورود با گوگل لغو گردید.';
        break;
      default:
        description = message || 'خطایی در ارتباط با سرور احراز هویت رخ داد.';
        break;
    }

    return { code, message, description };
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorDetails({
        code: 'validation/missing-fields',
        message: 'Missing fields',
        description: 'لطفاً نشانی ایمیل و رمز عبور را وارد نمایید.',
      });
      return;
    }

    setErrorDetails(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(loggedInUser.email || email);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorDetails(parseFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorDetails({
        code: 'validation/missing-name',
        message: 'Name required',
        description: 'لطفاً نام و نام‌خانوادگی خود را وارد کنید.',
      });
      return;
    }
    if (!email.trim()) {
      setErrorDetails({
        code: 'validation/missing-email',
        message: 'Email required',
        description: 'لطفاً نشانی ایمیل خود را وارد فرمایید.',
      });
      return;
    }
    if (password.length < 6) {
      setErrorDetails({
        code: 'auth/weak-password',
        message: 'Password too short',
        description: 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
      });
      return;
    }

    setErrorDetails(null);
    setIsLoading(true);

    try {
      const newUser = await register(name.trim(), email.trim(), password);
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(newUser.email || email);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorDetails(parseFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorDetails(null);
    setIsGoogleLoading(true);

    try {
      const gUser = await loginGoogle();
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(gUser.email || 'Google');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorDetails(parseFirebaseError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isLoading && !isGoogleLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-[#1A1816]/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? 'ورود به حساب بوکتون' : 'ساخت حساب بوکتون'}
    >
      <div
        className="bg-[#FAF8F5] border border-[#DDD7CE] rounded-2xl w-full max-w-4xl lg:h-[640px] max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col lg:flex-row my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MOBILE HERO BRAND BANNER (visible on small screens only) */}
        <div className="lg:hidden relative h-36 sm:h-44 w-full overflow-hidden shrink-0 border-b border-[#E7E2DA] select-none">
          <img
            src={ASSET_IMAGES.authBrandVisual}
            alt="BUKTON Brand Identity"
            className="w-full h-full object-cover object-center filter brightness-[0.96]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/80 via-[#1A1816]/35 to-transparent" />
          <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-right">
            <div className="flex items-center justify-between">
              <span className="font-serif-brand text-lg font-semibold tracking-[0.24em] text-[#FAF8F5]">
                BUKTON
              </span>
              <button
                onClick={onClose}
                className="p-1.5 text-[#FAF8F5] hover:bg-[#FAF8F5]/20 rounded-full transition-colors cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#FAF8F5] tracking-tight">
                وقت بهتر، تجربه بهتر
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/80 mt-0.5">
                گزینش و رزرو اختصاصی خدمات در فضایی آرام
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (in RTL): Clean Premium Authentication Panel */}
        <div className="w-full lg:w-[52%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto bg-[#FAF8F5]">
          <div>
            {/* Desktop Panel Header */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <span className="font-serif-brand text-xl font-semibold tracking-[0.25em] text-[#1A1816]">
                BUKTON
              </span>
              <button
                onClick={onClose}
                className="p-1.5 text-[#7A746B] hover:text-[#1A1816] hover:bg-[#F2ECE4] rounded-lg transition-colors cursor-pointer"
                aria-label="بستن پنجره"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Splash */}
            {isSuccess ? (
              <div className="py-12 text-center animate-in fade-in zoom-in-98 duration-150">
                <div className="w-14 h-14 bg-[#F2ECE4] border border-[#DDD7CE] text-[#7C2D32] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1816] mb-1.5 font-serif-brand">
                  {mode === 'login' ? 'خوش آمدید' : 'حساب کاربری ایجاد شد'}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C564E]">
                  در حال بارگذاری اطلاعات حساب کاربری بوکتون...
                </p>
              </div>
            ) : (
              <div>
                {/* Heading & Subtitle */}
                <div className="mb-6 text-right">
                  <h2 className="text-2xl sm:text-[28px] font-semibold text-[#1A1816] tracking-tight mb-2">
                    {mode === 'login' ? 'خوش آمدید' : 'ساخت حساب کاربری'}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#554F47] leading-relaxed">
                    {mode === 'login'
                      ? 'برای مدیریت رزروها و تجربه بهتر خدمات وارد حساب خود شوید.'
                      : 'مشخصات خود را وارد نمایید تا نوبت‌ها و سوابق شما ثبت گردد.'}
                  </p>
                </div>

                {/* User-facing error banner */}
                {errorDetails && (
                  <div
                    className="mb-5 p-3.5 bg-[#FDF2F2] border border-[#F8B4B4] rounded-xl text-xs text-[#9B1C1C] animate-in fade-in text-right"
                    role="alert"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#9B1C1C] shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">
                        {errorDetails.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* FORM: Floating Labels */}
                <form
                  onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
                  className="space-y-4"
                >
                  {/* Field: Name (in Register mode only) */}
                  {mode === 'register' && (
                    <div className="relative group">
                      <input
                        id="auth-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder=" "
                        className="peer w-full px-4 pt-5 pb-2 text-xs sm:text-sm bg-transparent border border-[#DDD7CE] rounded-lg text-[#1A1816] placeholder-transparent focus:outline-none focus:border-[#7C2D32] focus:ring-1 focus:ring-[#7C2D32] transition-all"
                      />
                      <label
                        htmlFor="auth-name"
                        className="absolute right-4 top-2 text-[11px] font-medium text-[#7A746B] transition-all pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#8C867E] peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#7C2D32]"
                      >
                        نام و نام‌خانوادگی
                      </label>
                    </div>
                  )}

                  {/* Field: Email */}
                  <div className="relative group">
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete={mode === 'login' ? 'email' : 'email'}
                      dir="ltr"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      className="peer w-full px-4 pt-5 pb-2 text-xs sm:text-sm bg-transparent border border-[#DDD7CE] rounded-lg text-[#1A1816] placeholder-transparent focus:outline-none focus:border-[#7C2D32] focus:ring-1 focus:ring-[#7C2D32] transition-all text-left"
                    />
                    <label
                      htmlFor="auth-email"
                      className="absolute right-4 top-2 text-[11px] font-medium text-[#7A746B] transition-all pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#8C867E] peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#7C2D32]"
                    >
                      ایمیل
                    </label>
                  </div>

                  {/* Field: Password */}
                  <div className="relative group">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      dir="ltr"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      className="peer w-full pl-10 pr-4 pt-5 pb-2 text-xs sm:text-sm bg-transparent border border-[#DDD7CE] rounded-lg text-[#1A1816] placeholder-transparent focus:outline-none focus:border-[#7C2D32] focus:ring-1 focus:ring-[#7C2D32] transition-all text-left font-mono"
                    />
                    <label
                      htmlFor="auth-password"
                      className="absolute right-4 top-2 text-[11px] font-medium text-[#7A746B] transition-all pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#8C867E] peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#7C2D32]"
                    >
                      رمز عبور
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8C867E] hover:text-[#1A1816] transition-colors cursor-pointer"
                      aria-label="تغییر نمایش رمز"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Primary Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full mt-2 py-3 px-4 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] active:scale-[0.99] disabled:opacity-60 rounded-lg transition-all duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>در حال پردازش...</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'ورود' : 'ساخت حساب'}</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider: "یا" */}
                <div className="flex items-center gap-3 my-5">
                  <span className="h-[1px] bg-[#E7E2DA] flex-1" />
                  <span className="text-xs text-[#8C867E] font-medium">یا</span>
                  <span className="h-[1px] bg-[#E7E2DA] flex-1" />
                </div>

                {/* Google Authentication Button: "ادامه با Google" */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-2.5 sm:py-3 px-4 border border-[#DDD7CE] hover:border-[#BFB6A8] hover:bg-[#F2ECE4] bg-transparent text-xs sm:text-sm font-medium text-[#1A1816] rounded-lg transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] disabled:opacity-60 shadow-2xs"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#7C2D32]" />
                      <span>اتصال به Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>ادامه با Google</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Switcher: "حساب ندارید؟ ساخت حساب" */}
          {!isSuccess && (
            <div className="pt-6 mt-6 border-t border-[#E7E2DA] text-center text-xs text-[#554F47]">
              {mode === 'login' ? (
                <div className="flex items-center justify-center gap-1.5">
                  <span>حساب ندارید؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorDetails(null);
                    }}
                    className="font-semibold text-[#7C2D32] hover:text-[#5E1F23] hover:underline cursor-pointer transition-colors"
                  >
                    ساخت حساب
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>قبلاً ثبت‌نام کرده‌اید؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorDetails(null);
                    }}
                    className="font-semibold text-[#7C2D32] hover:text-[#5E1F23] hover:underline cursor-pointer transition-colors"
                  >
                    ورود به حساب
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LEFT SIDE: Luxury Brand Visual Section (Non-human, Abstract Architectural Still Life) */}
        <div className="hidden lg:flex w-[48%] relative overflow-hidden bg-[#F5EFEB] border-r border-[#E7E2DA] flex-col justify-between p-8 xl:p-10 select-none">
          {/* Abstract Brand Artwork */}
          <img
            src={ASSET_IMAGES.authBrandVisual}
            alt="BUKTON Brand Sculpture"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.02] transition-transform duration-1000 ease-out hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />

          {/* Gentle warm ambient lighting gradient overlay for readability and depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/85 via-[#1A1816]/30 to-[#FAF8F5]/30" />

          {/* Top Brand Monogram Header */}
          <div className="relative z-10 flex items-center justify-between text-right">
            <div className="flex items-center gap-2 bg-[#FAF8F5]/85 backdrop-blur-xs px-3 py-1 rounded-full border border-[#DDD7CE]/70 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C2D32]" />
              <span className="font-serif-brand text-[11px] font-semibold tracking-[0.28em] text-[#1A1816]">
                BUKTON
              </span>
            </div>
            <span className="text-[10px] tracking-wider text-[#5C564E] font-medium border border-[#FAF8F5]/50 bg-[#FAF8F5]/70 backdrop-blur-xs px-2.5 py-1 rounded-full">
              آتلیه خدمات برتر
            </span>
          </div>

          {/* Bottom Editorial Statement & Values */}
          <div className="relative z-10 text-right space-y-4">
            <div className="space-y-1.5">
              <span className="font-serif-brand text-xs tracking-[0.3em] uppercase text-[#FAF8F5]/80 font-medium block">
                BUKTON
              </span>
              <h3 className="text-2xl xl:text-3xl font-semibold text-[#FAF8F5] leading-snug tracking-tight">
                وقت بهتر، تجربه بهتر
              </h3>
              <p className="text-xs text-[#EAE4DC] leading-relaxed font-normal opacity-90 max-w-xs pt-1">
                پلتفرم گزینش و رزرو اختصاصی متخصصان سلامت و زیبایی در محیطی آرام و مطمئن.
              </p>
            </div>

            {/* Subtle Brand Pillars: Trust, Premium, Calm, Personalization */}
            <div className="pt-3.5 border-t border-[#FAF8F5]/20 grid grid-cols-2 gap-2 text-[11px] text-[#DDD7CE]">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#E5D7C7]" />
                <span>متخصصان برگزیده و ارزیابی‌شده</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#E5D7C7]" />
                <span>رزرو شخصی‌سازی‌شده و مستقیم</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
