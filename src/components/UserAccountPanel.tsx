import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Calendar,
  Clock,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Bookmark,
  ArrowLeft,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatTomanPrice, toPersianDigits } from '../utils/formatters';

interface UserAccountPanelProps {
  onNavigateSearch?: () => void;
  onOpenBooking?: () => void;
}

export const UserAccountPanel: React.FC<UserAccountPanelProps> = ({
  onNavigateSearch,
}) => {
  const { user, userProfile, bookings, logout, isLoadingBookings } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayName = userProfile?.name || user.displayName || user.email?.split('@')[0] || 'کاربر گرامی';
  const initial = displayName.trim().charAt(0).toUpperCase();

  // Filter bookings: upcoming vs history
  const upcomingBookings = bookings.filter((b) => b.bookingStatus === 'confirmed');
  const pastBookings = bookings.filter((b) => b.bookingStatus !== 'confirmed');
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div ref={panelRef} className="relative inline-block text-right">
      {/* Compact Avatar Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="حساب کاربری"
        aria-haspopup="dialog"
        className={`flex items-center gap-2 p-1 pl-2.5 sm:pl-3 rounded-full border transition-all duration-150 cursor-pointer ${
          isOpen
            ? 'bg-[#F2ECE4] border-[#7C2D32]/40 shadow-xs'
            : 'bg-[#FAF8F5] border-[#DDD7CE] hover:border-[#BFB6A8] hover:bg-[#F3EFEA]'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-[#7C2D32] text-[#FAF8F5] flex items-center justify-center font-medium text-xs sm:text-sm shadow-xs select-none">
          {initial}
        </div>
        <span className="hidden sm:inline-block text-xs font-medium text-[#1A1816] max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#7A746B] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#7C2D32]' : ''
          }`}
        />
      </button>

      {/* Mini Account Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-[min(20rem,calc(100vw-1.5rem))] sm:w-96 bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-98 duration-150">
          
          {/* User Profile Header */}
          <div className="p-4 bg-[#F7F4EE] border-b border-[#E7E2DA] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#7C2D32] text-[#FAF8F5] flex items-center justify-center font-serif-brand font-semibold text-base shrink-0 shadow-xs">
                {initial}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-[#1A1816] truncate">
                  {displayName}
                </h4>
                <p className="text-xs text-[#7A746B] font-mono dir-ltr text-right truncate mt-0.5">
                  {user.email}
                </p>
                <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-[#7C2D32] bg-[#7C2D32]/8 px-2 py-0.5 rounded-full border border-[#7C2D32]/15">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>حساب بوکتون</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#8C867E] hover:text-[#1A1816] hover:bg-[#EAE4DC] rounded-lg transition-colors cursor-pointer"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bookings Section Header & Tabs */}
          <div className="px-4 pt-3 pb-2 border-b border-[#E7E2DA] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1816]">
              <Bookmark className="w-3.5 h-3.5 text-[#7C2D32]" />
              <span>نوبت‌های من ({toPersianDigits(bookings.length)})</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] bg-[#EFE9E0] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'upcoming'
                    ? 'bg-[#FAF8F5] text-[#7C2D32] font-medium shadow-2xs'
                    : 'text-[#7A746B] hover:text-[#1A1816]'
                }`}
              >
                پیش‌رو ({toPersianDigits(upcomingBookings.length)})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#FAF8F5] text-[#7C2D32] font-medium shadow-2xs'
                    : 'text-[#7A746B] hover:text-[#1A1816]'
                }`}
              >
                سوابق
              </button>
            </div>
          </div>

          {/* Bookings List Area */}
          <div className="p-3 max-h-64 overflow-y-auto space-y-2">
            {isLoadingBookings ? (
              <div className="py-6 text-center text-xs text-[#7A746B]">
                در حال بارگذاری نوبت‌های فعال...
              </div>
            ) : displayedBookings.length === 0 ? (
              <div className="py-6 px-4 text-center">
                <p className="text-xs text-[#5C564E] font-medium mb-1">
                  {activeTab === 'upcoming' ? 'نوبت پیش‌رو فعالی ندارید.' : 'هنوز سابقه‌ای برای نمایش وجود ندارد.'}
                </p>
                <p className="text-[11px] text-[#8C867E] mb-3">
                  زمان‌های آزاد بهترین متخصصان را رزرو کنید.
                </p>
                {onNavigateSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateSearch();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7C2D32] hover:text-[#5E1F23] bg-[#7C2D32]/8 hover:bg-[#7C2D32]/15 px-3 py-1.5 rounded-lg border border-[#7C2D32]/20 transition-colors cursor-pointer"
                  >
                    <span>جستجو و رزرو نوبت</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              displayedBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg border border-[#E7E2DA] bg-[#FDFCFB] hover:border-[#DDD7CE] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#1A1816] block truncate">
                        {b.specialistName}
                      </span>
                      <span className="text-[11px] text-[#7C2D32] font-medium block truncate">
                        {b.serviceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeTab === 'history' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            b.bookingStatus === 'completed'
                              ? 'text-[#2F6B4F] bg-[#EEF7F1] border-[#CFE5D8]'
                              : 'text-[#8A3B3B] bg-[#FBF0F0] border-[#E8D0D0]'
                          }`}
                        >
                          {b.bookingStatus === 'completed' ? 'انجام‌شده' : 'لغوشده'}
                        </span>
                      )}
                      {b.bookingCode && (
                        <span className="text-[10px] font-mono bg-[#EAE4DC] text-[#4A4641] px-1.5 py-0.5 rounded border border-[#DDD7CE]">
                          {b.bookingCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#F0EBE3] flex items-center justify-between text-[11px] text-[#7A746B]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[#2A2724] font-medium">
                        <Calendar className="w-3 h-3 text-[#7C2D32]" />
                        {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {toPersianDigits(b.time)}
                      </span>
                    </div>

                    <span className="font-semibold text-[#1A1816]">
                      {formatTomanPrice(b.price)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Logout */}
          <div className="p-3 border-t border-[#E7E2DA] bg-[#F7F4EE] flex items-center justify-between">
            {onNavigateSearch && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateSearch();
                }}
                className="text-xs font-medium text-[#4A4641] hover:text-[#1A1816] transition-colors cursor-pointer"
              >
                مشاهده همه متخصص‌ها
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-[#9B1C1C] hover:text-[#771D1D] hover:bg-[#FDF2F2] px-2.5 py-1.5 rounded-md transition-colors cursor-pointer mr-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از حساب</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
