import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Clock,
  MapPin,
  Star,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Phone
} from 'lucide-react';
import { Specialist, ServiceItem } from '../types';
import { formatTomanPrice, formatMinutes, toPersianDigits } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  specialist: Specialist;
  onClose: () => void;
  onBookSuccess?: (bookingDetails: {
    specialistName: string;
    serviceTitle: string;
    day: string;
    slot: string;
    code: string;
  }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  specialist,
  onClose,
  onBookSuccess,
}) => {
  const { user, userProfile, login, loginGoogle, register, saveBooking } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'booking'>('profile');
  const [step, setStep] = useState<'service_time' | 'client_info' | 'confirmed'>('service_time');

  // Booking selections
  const [selectedService, setSelectedService] = useState<ServiceItem>(
    specialist.services[0] || {
      id: 'default',
      title: specialist.specialty,
      durationMinutes: 60,
      priceToman: specialist.startingPriceToman,
      description: specialist.bio,
    }
  );

  const [selectedDayKey, setSelectedDayKey] = useState<string>(
    specialist.availableDays[0]?.dateKey || ''
  );

  const activeDay = specialist.availableDays.find((d) => d.dateKey === selectedDayKey) || specialist.availableDays[0];

  const [selectedSlot, setSelectedSlot] = useState<string>(
    activeDay?.slots[0] || '۱۰:۰۰'
  );

  // Client info form
  const [clientName, setClientName] = useState(userProfile?.name || user?.displayName || '');
  const [clientPhone, setClientPhone] = useState(userProfile?.phone || '');
  const [notes, setNotes] = useState('');

  // Inline auth state for unauthenticated users
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Generated confirmation code & booking ID
  const [bookingCode, setBookingCode] = useState('');

  // Auto-fill client info when user is available or updates
  useEffect(() => {
    if (user) {
      if (!clientName && (userProfile?.name || user.displayName)) {
        setClientName(userProfile?.name || user.displayName || '');
      }
      if (!clientPhone && userProfile?.phone) {
        setClientPhone(userProfile.phone);
      }
    }
  }, [user, userProfile]);

  // Close the modal with Escape and prevent background page scrolling while it is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSubmitting, onClose]);

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleDaySelect = (dayKey: string) => {
    setSelectedDayKey(dayKey);
    const day = specialist.availableDays.find((d) => d.dateKey === dayKey);
    if (day && day.slots.length > 0) {
      setSelectedSlot(day.slots[0]);
    }
  };

  const handleProceedToClientInfo = () => {
    setStep('client_info');
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!clientName.trim()) {
      setFormError('لطفاً نام و نام‌خانوادگی خود را وارد کنید.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.trim().length < 10) {
      setFormError('لطفاً یک شماره همراه معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    setIsSubmitting(true);

    try {
      // If user is not authenticated yet, perform Firebase authentication first
      if (!user) {
        if (!authEmail.trim() || !authPassword) {
          setFormError('جهت ثبت نوبت در سیستم، لطفاً ایمیل و رمز عبور را وارد فرمایید.');
          setIsSubmitting(false);
          return;
        }

        if (authPassword.length < 6) {
          setFormError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
          setIsSubmitting(false);
          return;
        }

        if (authMode === 'register') {
          try {
            await register(clientName.trim(), authEmail.trim(), authPassword, clientPhone.trim());
          } catch (regErr: any) {
            console.error('[BookingModal Registration Error]:', {
              code: regErr?.code,
              message: regErr?.message,
              fullError: regErr,
            });
            if (regErr?.code === 'auth/operation-not-allowed') {
              setFormError('خطای فایربیس (auth/operation-not-allowed): ارائه‌دهنده ایمیل در کنسول فایربیس فعال نیست. لطفاً از دکمه «ورود سریع با گوگل» استفاده کنید یا در کنسول فایربیس Email/Password را فعال فرمایید.');
              setIsSubmitting(false);
              return;
            } else if (regErr?.code === 'auth/email-already-in-use') {
              // Try logging in instead if already registered
              try {
                await login(authEmail.trim(), authPassword);
              } catch (loginErr: any) {
                console.error('[BookingModal Fallback Login Error]:', loginErr);
                setFormError('این ایمیل قبلاً ثبت شده است. لطفاً حالت «ورود» را انتخاب و رمز عبور را وارد کنید.');
                setIsSubmitting(false);
                return;
              }
            } else {
              setFormError(`خطای ثبت‌نام (${regErr?.code || 'نامشخص'}): ${regErr?.message || 'خطا در ایجاد حساب کاربری.'}`);
              setIsSubmitting(false);
              return;
            }
          }
        } else {
          try {
            await login(authEmail.trim(), authPassword);
          } catch (loginErr: any) {
            console.error('[BookingModal Login Error]:', {
              code: loginErr?.code,
              message: loginErr?.message,
              fullError: loginErr,
            });
            if (loginErr?.code === 'auth/operation-not-allowed') {
              setFormError('خطای فایربیس (auth/operation-not-allowed): ارائه‌دهنده ایمیل در کنسول فایربیس فعال نیست. لطفاً از دکمه «ورود سریع با گوگل» استفاده فرمایید.');
            } else {
              setFormError(`خطای ورود (${loginErr?.code || 'نامشخص'}): ایمیل یا رمز عبور اشتباه است.`);
            }
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Generate unique confirmation code
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const code = `BUK-${randomNum}`;
      const dayFormatted = `${activeDay.dayName} ${activeDay.dayNumber} ${activeDay.monthName}`;

      // Save real booking document to Firebase Firestore associated with user UID
      await saveBooking({
        specialistId: specialist.id,
        specialistName: specialist.name,
        serviceName: selectedService.title,
        date: dayFormatted,
        time: selectedSlot,
        price: selectedService.priceToman,
        bookingStatus: 'confirmed',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        notes: notes.trim(),
        bookingCode: code,
      });

      setBookingCode(code);
      setStep('confirmed');

      if (onBookSuccess) {
        onBookSuccess({
          specialistName: specialist.name,
          serviceTitle: selectedService.title,
          day: dayFormatted,
          slot: selectedSlot,
          code,
        });
      }
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      setFormError(err?.message || 'خطایی در ثبت نوبت در سرور رخ داد. لطفاً مجدداً تلاش فرمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#1A1816]/65 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label={step === 'confirmed' ? 'تأیید نوبت' : 'پروفایل متخصص و رزرو نوبت'}
    >
      <div
        className="bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E7E2DA] bg-[#F7F4EE] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-serif-brand tracking-widest text-[#7C2D32] uppercase">
              {step === 'confirmed' ? 'Booking Confirmed' : 'Specialist Profile & Booking'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5C564E] hover:text-[#1A1816] hover:bg-[#EAE4DC] rounded-lg transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher if not confirmed */}
        {step !== 'confirmed' && (
          <div className="flex border-b border-[#E7E2DA] bg-[#FAF8F5] px-6 pt-2 shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-4 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[#7C2D32] text-[#7C2D32]'
                  : 'border-transparent text-[#686259] hover:text-[#1A1816]'
              }`}
            >
              پروفایل و معرفی خدمات
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`pb-2.5 px-4 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'booking'
                  ? 'border-[#7C2D32] text-[#7C2D32]'
                  : 'border-transparent text-[#686259] hover:text-[#1A1816]'
              }`}
            >
              رزرو نوبت و زمان‌های آزاد
            </button>
          </div>
        )}

        {/* Modal Body Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: Profile & Services */}
          {activeTab === 'profile' && step !== 'confirmed' && (
            <div className="space-y-6">
              {/* Header profile card */}
              <div className="flex items-start gap-4">
                <img
                  src={specialist.image}
                  alt={specialist.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#DDD7CE] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1816]">
                      {specialist.name}
                    </h3>
                    {specialist.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7C2D32] bg-[#7C2D32]/8 px-2 py-0.5 rounded-full border border-[#7C2D32]/15">
                        <CheckCircle2 className="w-3 h-3" />
                        گزینش‌شده بوکتون
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#5C564E] mb-2">{specialist.specialty}</p>

                  <div className="flex items-center gap-3 text-xs text-[#7A746B] flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7C2D32]" />
                      {specialist.location}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[#1A1816] font-medium">
                      <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                      {toPersianDigits(specialist.rating)} ({toPersianDigits(specialist.reviewsCount)} نظر)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-[#F8F5EE] border border-[#E7E2DA] rounded-lg p-3.5 text-xs sm:text-sm text-[#4A4641] leading-relaxed">
                {specialist.bio}
              </div>

              {/* Services List */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#1A1816] mb-3">
                  خدمات قابل ارائه و تعرفه‌ها
                </h4>
                <div className="space-y-2.5">
                  {specialist.services.map((srv) => {
                    const isSelected = selectedService.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv);
                          setActiveTab('booking');
                        }}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#7C2D32] bg-[#7C2D32]/4 shadow-2xs'
                            : 'border-[#DDD7CE] bg-[#FAF8F5] hover:border-[#BFB6A8]'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <h5 className="text-xs sm:text-sm font-semibold text-[#1A1816] mb-0.5">
                            {srv.title}
                          </h5>
                          <p className="text-xs text-[#686259] line-clamp-1 mb-1">{srv.description}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#8C867E]">
                            <Clock className="w-3 h-3" />
                            {formatMinutes(srv.durationMinutes)}
                          </span>
                        </div>

                        <div className="text-left shrink-0 pl-1">
                          <span className="text-xs sm:text-sm font-bold text-[#1A1816] block">
                            {formatTomanPrice(srv.priceToman)}
                          </span>
                          <span className="text-[11px] text-[#7C2D32] font-medium mt-1 inline-flex items-center gap-1">
                            انتخاب و رزرو
                            <ArrowLeft className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-[#E7E2DA] flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <span>رفتن به انتخاب زمان و رزرو</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Step 1 - Service & Time Selection */}
          {activeTab === 'booking' && step === 'service_time' && (
            <div className="space-y-6">
              {/* Select Service Dropdown/Pills */}
              <div>
                <label className="text-xs font-semibold text-[#1A1816] block mb-2">
                  ۱. انتخاب خدمت مورد نظر:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {specialist.services.map((srv) => {
                    const isSelected = selectedService.id === srv.id;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`text-right p-3 rounded-lg border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#7C2D32] bg-[#7C2D32]/5 text-[#1A1816] ring-1 ring-[#7C2D32]'
                            : 'border-[#DDD7CE] bg-[#FAF8F5] text-[#4A4641] hover:border-[#BFB6A8]'
                        }`}
                      >
                        <span className="font-semibold mb-1 truncate block">{srv.title}</span>
                        <div className="flex items-center justify-between text-[11px] mt-1 text-[#686259]">
                          <span>{formatMinutes(srv.durationMinutes)}</span>
                          <span className="font-bold text-[#1A1816]">{formatTomanPrice(srv.priceToman)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Day */}
              <div>
                <label className="text-xs font-semibold text-[#1A1816] block mb-2">
                  ۲. انتخاب روز مراجعه:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {specialist.availableDays.map((d) => {
                    const isSelected = selectedDayKey === d.dateKey;
                    return (
                      <button
                        key={d.dateKey}
                        type="button"
                        onClick={() => handleDaySelect(d.dateKey)}
                        className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#7C2D32] bg-[#7C2D32] text-[#FAF8F5] shadow-xs'
                            : 'border-[#DDD7CE] bg-[#FAF8F5] text-[#1A1816] hover:border-[#BFB6A8] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        <span className="text-[11px] opacity-80 block">{d.dayName}</span>
                        <span className="text-base font-bold my-0.5 block">{toPersianDigits(d.dayNumber)}</span>
                        <span className="text-[10px] opacity-80 block">{d.monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Time Slot */}
              <div>
                <label className="text-xs font-semibold text-[#1A1816] block mb-2">
                  ۳. انتخاب ساعت حضور:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {activeDay.slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 text-center text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#7C2D32] bg-[#7C2D32] text-[#FAF8F5] shadow-xs'
                            : 'border-[#DDD7CE] bg-[#FAF8F5] text-[#1A1816] hover:border-[#BFB6A8] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {toPersianDigits(slot)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Proceed Bar */}
              <div className="pt-4 border-t border-[#E7E2DA] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#7A746B] block">هزینه خدمت</span>
                  <span className="text-sm sm:text-base font-bold text-[#1A1816]">
                    {formatTomanPrice(selectedService.priceToman)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToClientInfo}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <span>ادامه و ثبت مشخصات</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Step 2 - Client Info Form with Real Firebase Auth Integration */}
          {activeTab === 'booking' && step === 'client_info' && (
            <form onSubmit={handleConfirmBooking} className="space-y-5">
              <div className="pb-3 border-b border-[#E7E2DA]">
                <h4 className="text-sm sm:text-base font-semibold text-[#1A1816] mb-1">
                  اطلاعات مراجع و ثبت نوبت در بوکتون
                </h4>
                <p className="text-xs text-[#686259]">
                  اطلاعات نوبت در پایگاه داده ذخیره شده و کد پیگیری صادر خواهد شد.
                </p>
              </div>

              {/* Booking Summary strip */}
              <div className="bg-[#F4EFEA] border border-[#DDD7CE] rounded-lg p-3.5 text-xs text-[#4A4641] space-y-1.5">
                <div className="flex justify-between">
                  <span>متخصص:</span>
                  <span className="font-semibold text-[#1A1816]">{specialist.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>خدمت انتخابی:</span>
                  <span className="font-semibold text-[#1A1816]">{selectedService.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>زمان نوبت:</span>
                  <span className="font-semibold text-[#7C2D32]">
                    {activeDay.dayName} {activeDay.dayNumber} {activeDay.monthName} — ساعت {selectedSlot}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#DDD7CE]">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="font-bold text-xs sm:text-sm text-[#1A1816]">
                    {formatTomanPrice(selectedService.priceToman)}
                  </span>
                </div>
              </div>

              {/* Authenticated user status or login/registration prompts */}
              {user ? (
                <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg flex items-center justify-between text-xs text-[#065F46]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>
                      وارد شده با حساب: <strong>{user.displayName || user.email}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-[#047857] font-mono dir-ltr">{user.email}</span>
                </div>
              ) : (
                <div className="p-4 bg-[#FAF8F5] border border-[#7C2D32]/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1A1816]">
                      حساب کاربری بوکتون (جهت ثبت رسمی نوبت)
                    </span>
                    <div className="flex items-center gap-1 bg-[#EFE9E0] p-0.5 rounded text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          authMode === 'register' ? 'bg-[#FAF8F5] text-[#7C2D32] font-medium' : 'text-[#6A645B]'
                        }`}
                      >
                        ثبت‌نام سریع
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          authMode === 'login' ? 'bg-[#FAF8F5] text-[#7C2D32] font-medium' : 'text-[#6A645B]'
                        }`}
                      >
                        ورود
                      </button>
                    </div>
                  </div>

                  {/* Google 1-click option */}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        setFormError('');
                        await loginGoogle();
                      } catch (gErr: any) {
                        console.error('[BookingModal Google Auth Error]:', gErr);
                        setFormError(gErr?.message || 'خطا در ورود با حساب گوگل');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-full py-2 px-3 border border-[#DDD7CE] hover:border-[#BFB6A8] hover:bg-[#F2ECE4] bg-[#FAF8F5] rounded-lg text-xs font-medium text-[#1A1816] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                    <span>ورود سریع با حساب گوگل</span>
                  </button>

                  <div className="flex items-center gap-2 my-1">
                    <span className="h-[1px] bg-[#E7E2DA] flex-1" />
                    <span className="text-[10px] text-[#8C867E]">یا با ایمیل و رمز عبور</span>
                    <span className="h-[1px] bg-[#E7E2DA] flex-1" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-[#2A2724] block mb-1">
                        ایمیل <span className="text-[#7C2D32]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          dir="ltr"
                          required
                          placeholder="name@example.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32]"
                        />
                        <Mail className="w-3.5 h-3.5 text-[#8C867E] absolute left-2.5 top-2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-[#2A2724] block mb-1">
                        رمز عبور <span className="text-[#7C2D32]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          dir="ltr"
                          required
                          minLength={6}
                          placeholder="حداقل ۶ کاراکتر"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32]"
                        />
                        <Lock className="w-3.5 h-3.5 text-[#8C867E] absolute left-2.5 top-2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {formError && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] rounded-lg text-xs text-[#9B1C1C]">
                  {formError}
                </div>
              )}

              {/* Client Name & Phone */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-[#2A2724] block mb-1">
                    نام و نام‌خانوادگی مراجع <span className="text-[#7C2D32]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مریم کریمی"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#2A2724] block mb-1">
                    شماره تلفن همراه <span className="text-[#7C2D32]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32] text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#2A2724] block mb-1">
                    توضیحات یا نیازمندی خاص (اختیاری)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="مثال: پوست حساسی دارم یا برای مراسم خاصی آماده می‌شوم..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E7E2DA] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('service_time')}
                  disabled={isSubmitting}
                  className="text-xs font-medium text-[#686259] hover:text-[#1A1816] cursor-pointer"
                >
                  بازگشت به انتخاب زمان
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] disabled:opacity-60 rounded-lg transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ذخیره نوبت در سرور...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>تأیید نهایی و ثبت در بوکتون</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Step 3 - Confirmed Success State with Real Firestore Details */}
          {step === 'confirmed' && (
            <div className="py-4 text-center animate-in fade-in zoom-in-98 duration-150">
              <div className="w-12 h-12 bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Check className="w-6 h-6" />
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-[#1A1816] mb-1.5">
                نوبت شما با موفقیت در سیستم ثبت شد
              </h3>

              <p className="text-xs sm:text-sm text-[#5C564E] max-w-md mx-auto mb-4">
                جزئیات نوبت در پایگاه‌داده Firestore ذخیره شد و در پنل حساب کاربری شما فوراً قابل مشاهده و پیگیری است.
              </p>

              <div className="bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg p-4 max-w-md mx-auto text-right text-xs text-[#4A4641] space-y-2 mb-6 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E7E2DA]">
                  <span className="text-[#8C867E]">کد رهگیری نوبت:</span>
                  <span className="font-mono text-sm font-bold text-[#7C2D32] tracking-wider">
                    {bookingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>متخصص:</span>
                  <span className="font-medium text-[#1A1816]">{specialist.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>خدمت رزروشده:</span>
                  <span className="font-medium text-[#1A1816]">{selectedService.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>زمان مراجعه:</span>
                  <span className="font-medium text-[#1A1816]">
                    {activeDay.dayName} {activeDay.dayNumber} {activeDay.monthName} · ساعت {selectedSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>موقعیت مکانی:</span>
                  <span className="font-medium text-[#1A1816] truncate max-w-[220px]">
                    {specialist.location}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E7E2DA]">
                  <span>وضعیت در پایگاه‌داده:</span>
                  <span className="inline-flex items-center gap-1 text-[#059669] font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    تأییدشده و فعال
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-7 py-2.5 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg transition-all cursor-pointer shadow-xs active:scale-98"
              >
                متوجه شدم و بستن
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
