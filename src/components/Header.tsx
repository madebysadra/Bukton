import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Menu,
  X,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAccountPanel } from './UserAccountPanel';
import { toPersianDigits } from '../utils/formatters';

interface HeaderProps {
  currentPage: 'home' | 'search';
  onNavigateHome: () => void;
  onNavigateSearch: (category?: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenQuickBook: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigateHome,
  onNavigateSearch,
  onOpenSearch,
  onOpenAuth,
  onOpenQuickBook,
}) => {
  const { user, userProfile, bookings, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, []);

  /*
   * Lock page scrolling while the mobile navigation is open.
   */
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  /*
   * Close mobile menu with Escape.
   */
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [mobileMenuOpen]);

  /*
   * If viewport changes to desktop while the mobile menu is open,
   * close the mobile menu and restore normal page scrolling.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () =>
      window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = (id: string) => {
    closeMobileMenu();

    if (currentPage !== 'home') {
      onNavigateHome();

      setTimeout(() => {
        const element = document.getElementById(id);

        if (element) {
          const yOffset = -75;

          const y =
            element.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({
            top: y,
            behavior: 'smooth',
          });
        }
      }, 100);

      return;
    }

    const element = document.getElementById(id);

    if (element) {
      const yOffset = -75;

      const y =
        element.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    }
  };

  const handleHomeClick = () => {
    closeMobileMenu();
    onNavigateHome();
  };

  const handleSearchNavigation = () => {
    closeMobileMenu();
    onNavigateSearch();
  };

  const displayName =
    userProfile?.name ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'کاربر';

  return (
    <>
      {/*
       * Keep the header attached to the viewport while the page scrolls.
       * The spacer below preserves the document flow so the fixed header
       * does not cover the first section.
       */}
      <div className="h-[72px] sm:h-[80px]" aria-hidden="true" />

      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-250 ${
          isScrolled
            ? 'bg-[#FAF8F5]/96 backdrop-blur-md border-b border-[#E7E2DA] shadow-[0_2px_12px_-4px_rgba(26,24,22,0.03)] py-3'
            : 'bg-[#FAF8F5] border-b border-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* Brand */}
          <button
            type="button"
            onClick={handleHomeClick}
            className="font-serif-brand text-2xl sm:text-[28px] font-semibold tracking-[0.2em] text-[#1A1816] hover:text-[#7C2D32] transition-colors cursor-pointer text-right select-none"
            aria-label="BUKTON - صفحه اصلی"
          >
            BUKTON
          </button>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-7 lg:gap-9 text-[14px] font-normal text-[#4A4641]"
            aria-label="ناوبری اصلی"
          >
            <button
              type="button"
              onClick={() => handleNavClick('services')}
              className="hover:text-[#1A1816] transition-colors cursor-pointer py-1 relative group"
            >
              خدمات

              <span className="absolute bottom-0 right-0 w-0 h-[1.5px] bg-[#7C2D32] transition-all duration-200 group-hover:w-full" />
            </button>

            <button
              type="button"
              onClick={handleSearchNavigation}
              className={`transition-colors cursor-pointer py-1 relative group ${
                currentPage === 'search'
                  ? 'text-[#7C2D32] font-medium'
                  : 'hover:text-[#1A1816]'
              }`}
            >
              متخصص‌ها

              <span
                className={`absolute bottom-0 right-0 h-[1.5px] bg-[#7C2D32] transition-all duration-200 ${
                  currentPage === 'search'
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick('categories')
              }
              className="hover:text-[#1A1816] transition-colors cursor-pointer py-1 relative group"
            >
              دسته‌بندی‌ها

              <span className="absolute bottom-0 right-0 w-0 h-[1.5px] bg-[#7C2D32] transition-all duration-200 group-hover:w-full" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="hover:text-[#1A1816] transition-colors cursor-pointer py-1 relative group"
            >
              درباره ما

              <span className="absolute bottom-0 right-0 w-0 h-[1.5px] bg-[#7C2D32] transition-all duration-200 group-hover:w-full" />
            </button>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 text-[#4A4641] hover:text-[#1A1816] hover:bg-[#F2ECE4] rounded-lg transition-colors cursor-pointer"
              title="جستجو"
              aria-label="جستجو در خدمات و متخصصین"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Authenticated Account / Login */}
            {user ? (
              <UserAccountPanel
                onNavigateSearch={() =>
                  onNavigateSearch()
                }
                onOpenBooking={onOpenQuickBook}
              />
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-[#4A4641] hover:text-[#1A1816] hover:bg-[#F2ECE4] rounded-lg transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>ورود</span>
              </button>
            )}

            {/* Primary Booking CTA */}
            <button
              type="button"
              onClick={onOpenQuickBook}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <span>رزرو کنید</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              className="md:hidden p-2 text-[#1A1816] hover:bg-[#F2ECE4] rounded-lg transition-colors cursor-pointer"
              aria-label={
                mobileMenuOpen
                  ? 'بستن منو'
                  : 'باز کردن منو'
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="bukton-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          id="bukton-mobile-menu"
          className="fixed inset-0 z-50 md:hidden flex flex-col bg-[#FAF8F5]/98 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="منوی اصلی بوکتون"
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2DA]">
            <button
              type="button"
              onClick={handleHomeClick}
              className="font-serif-brand text-2xl font-semibold tracking-[0.2em] text-[#1A1816] hover:text-[#7C2D32] transition-colors"
              aria-label="BUKTON - صفحه اصلی"
            >
              BUKTON
            </button>

            <button
              type="button"
              onClick={closeMobileMenu}
              className="p-2 text-[#1A1816] hover:bg-[#F2ECE4] rounded-lg transition-colors cursor-pointer"
              aria-label="بستن منو"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="px-6 py-6 flex flex-col gap-4 text-base font-medium text-[#1A1816] flex-1 overflow-y-auto">
            {/* User Summary */}
            {user && (
              <div className="p-3.5 bg-[#F2ECE4] border border-[#DDD7CE] rounded-xl flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#7C2D32] text-[#FAF8F5] flex items-center justify-center font-serif-brand font-semibold text-sm shadow-xs shrink-0">
                    {displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="text-right min-w-0">
                    <span className="text-xs font-semibold text-[#1A1816] block truncate">
                      {displayName}
                    </span>

                    <span className="text-[11px] text-[#7A746B] block dir-ltr text-right truncate">
                      {user.email}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-[#7C2D32] bg-[#7C2D32]/10 px-2 py-0.5 rounded shrink-0 mr-2">
                  {toPersianDigits(
                    bookings.length
                  )}{' '}
                  نوبت
                </span>
              </div>
            )}

            {/* Home */}
            <button
              type="button"
              onClick={handleHomeClick}
              className="text-right py-2 hover:text-[#7C2D32] transition-colors border-b border-[#E7E2DA]/60"
            >
              صفحه اصلی
            </button>

            {/* Services */}
            <button
              type="button"
              onClick={() =>
                handleNavClick('services')
              }
              className="text-right py-2 hover:text-[#7C2D32] transition-colors border-b border-[#E7E2DA]/60"
            >
              خدمات
            </button>

            {/* Specialists */}
            <button
              type="button"
              onClick={handleSearchNavigation}
              className={`text-right py-2 hover:text-[#7C2D32] transition-colors border-b border-[#E7E2DA]/60 ${
                currentPage === 'search'
                  ? 'text-[#7C2D32] font-semibold'
                  : ''
              }`}
            >
              متخصص‌ها و نتایج جستجو
            </button>

            {/* Categories */}
            <button
              type="button"
              onClick={() =>
                handleNavClick('categories')
              }
              className="text-right py-2 hover:text-[#7C2D32] transition-colors border-b border-[#E7E2DA]/60"
            >
              دسته‌بندی‌ها
            </button>

            {/* About */}
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-right py-2 hover:text-[#7C2D32] transition-colors border-b border-[#E7E2DA]/60"
            >
              درباره ما
            </button>

            {/* Bottom Actions */}
            <div className="pt-4 mt-auto flex flex-col gap-2.5">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="w-full py-2.5 text-center text-xs sm:text-sm font-medium border border-[#F8B4B4] bg-[#FDF2F2] text-[#9B1C1C] rounded-lg transition-colors flex items-center justify-center gap-1.5 hover:bg-[#FBE8E8]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب کاربری</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 text-center text-xs sm:text-sm font-medium border border-[#DDD7CE] rounded-lg text-[#1A1816] hover:bg-[#F2ECE4] transition-colors"
                >
                  ورود به حساب کاربری
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  onOpenQuickBook();
                }}
                className="w-full py-2.5 text-center text-xs sm:text-sm font-medium bg-[#7C2D32] text-[#FAF8F5] rounded-lg hover:bg-[#672226] transition-colors"
              >
                رزرو نوبت جدید
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};