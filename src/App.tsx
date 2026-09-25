import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PopularServices } from './components/PopularServices';
import { FeaturedSpecialists } from './components/FeaturedSpecialists';
import { HowItWorks } from './components/HowItWorks';
import { EditorialBrand } from './components/EditorialBrand';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { ContactModal } from './components/ContactModal';
import { SearchOverlay } from './components/SearchOverlay';
import { SearchResultsPage } from './components/SearchResultsPage';
import { AuthProvider } from './context/AuthContext';

import { SPECIALISTS } from './data/mockData';
import {
  Specialist,
  ServiceCategory,
  SearchQuery,
} from './types';
import { CheckCircle2, X } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'home' | 'search'>(
    'home'
  );

  const [activeCategory, setActiveCategory] = useState<
    ServiceCategory | 'all'
  >('all');

  // Search page initial props
  const [searchInitialParams, setSearchInitialParams] = useState<{
    category: ServiceCategory | 'all';
    query: string;
    area: string;
  }>({
    category: 'all',
    query: '',
    area: 'all',
  });

  // Modals state
  const [
    selectedSpecialistForBooking,
    setSelectedSpecialistForBooking,
  ] = useState<Specialist | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] =
    useState(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(
    null
  );

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);

    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4500);
  };

  const handleNavigateHome = () => {
    setCurrentPage('home');
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleNavigateSearch = (
    category: ServiceCategory | 'all' = 'all',
    query = '',
    area = 'all'
  ) => {
    setSearchInitialParams({
      category,
      query,
      area,
    });

    setCurrentPage('search');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Search handler from Hero
  const handleHeroSearch = (query: SearchQuery) => {
    let cat: ServiceCategory | 'all' = 'all';

    if (query.service) {
      if (
        query.service.includes('پوست') ||
        query.service.includes('فیشیال')
      ) {
        cat = 'skin';
      } else if (
        query.service.includes('مو') ||
        query.service.includes('استایل')
      ) {
        cat = 'hair';
      } else if (query.service.includes('ماساژ')) {
        cat = 'massage';
      } else if (
        query.service.includes('پیلاتس') ||
        query.service.includes('فیتنس')
      ) {
        cat = 'fitness';
      } else if (
        query.service.includes('عکاسی') ||
        query.service.includes('پرتره')
      ) {
        cat = 'photography';
      } else if (
        query.service.includes('استایلینگ') ||
        query.service.includes('کمد')
      ) {
        cat = 'style';
      }
    }

    let areaVal = 'all';

    if (query.location) {
      if (query.location.includes('نیاوران')) {
        areaVal = 'نیاوران';
      } else if (query.location.includes('فرشته')) {
        areaVal = 'فرشته';
      } else if (query.location.includes('زعفرانیه')) {
        areaVal = 'زعفرانیه';
      } else if (query.location.includes('شهرک غرب')) {
        areaVal = 'شهرک غرب';
      } else if (query.location.includes('سعادت‌آباد')) {
        areaVal = 'سعادت‌آباد';
      } else if (query.location.includes('گاندی')) {
        areaVal = 'گاندی';
      }
    }

    handleNavigateSearch(
      cat,
      query.service,
      areaVal
    );

    showToast(
      query.service
        ? `در حال نمایش نتایج برای «${query.service}»`
        : 'در حال نمایش همه متخصص‌ها'
    );
  };

  const handleSelectCategoryFromGrid = (
    cat: ServiceCategory
  ) => {
    setActiveCategory(cat);
    handleNavigateSearch(cat, '', 'all');
  };

  const handleNavScroll = (id: string) => {
    if (currentPage !== 'home') {
      setCurrentPage('home');

      setTimeout(() => {
        const el = document.getElementById(id);

        if (el) {
          const yOffset = -75;
          const y =
            el.getBoundingClientRect().top +
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

    const el = document.getElementById(id);

    if (el) {
      const yOffset = -75;
      const y =
        el.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    }
  };

  const handleOpenQuickBook = () => {
    setSelectedSpecialistForBooking(SPECIALISTS[0]);
  };

  const handleBookingSuccess = (details: {
    specialistName: string;
    serviceTitle: string;
    day: string;
    slot: string;
    code: string;
  }) => {
    showToast(
      `نوبت شما با موفقیت ثبت شد • کد پیگیری ${details.code}`
    );
  };

  const handleAuthSuccess = (email: string) => {
    showToast(
      `خوش آمدید؛ ورود با ${email} با موفقیت انجام شد.`
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] flex flex-col font-persian selection:bg-[#7C2D32]/12 selection:text-[#7C2D32]">

      {/* Header */}
      <Header
        currentPage={currentPage}
        onNavigateHome={handleNavigateHome}
        onNavigateSearch={() => handleNavigateSearch()}
        onOpenSearch={() => setIsSearchOverlayOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenQuickBook={handleOpenQuickBook}
      />

      {/* Main Pages */}
      {currentPage === 'home' ? (
        <main className="flex-1">

          {/* Hero */}
          <Hero
            onSearch={handleHeroSearch}
            onSelectCategory={(catId) =>
              handleSelectCategoryFromGrid(
                catId as ServiceCategory
              )
            }
          />

          {/* Popular Services */}
          <PopularServices
            onSelectCategory={handleSelectCategoryFromGrid}
            activeCategory={activeCategory}
          />

          {/* Featured Specialists */}
          <FeaturedSpecialists
            specialists={SPECIALISTS}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onSelectSpecialist={(spec) =>
              setSelectedSpecialistForBooking(spec)
            }
          />

          {/* How It Works */}
          <HowItWorks />

          {/* Editorial Brand */}
          <EditorialBrand />

          {/* Final CTA */}
          <FinalCTA
            onStartSearch={() =>
              handleNavigateSearch()
            }
          />
        </main>
      ) : (
        /* Search / Results Page */
        <main className="flex-1">
          <SearchResultsPage
            specialists={SPECIALISTS}
            initialCategory={
              searchInitialParams.category
            }
            initialQuery={
              searchInitialParams.query
            }
            initialArea={
              searchInitialParams.area
            }
            onSelectSpecialist={(spec) =>
              setSelectedSpecialistForBooking(spec)
            }
            onNavigateHome={handleNavigateHome}
            onShowToast={showToast}
          />
        </main>
      )}

      {/* Footer */}
      <Footer
        onNavClick={handleNavScroll}
        onOpenContact={() =>
          setIsContactOpen(true)
        }
      />

      {/* Booking & Specialist Profile Modal */}
      {selectedSpecialistForBooking && (
        <BookingModal
          specialist={selectedSpecialistForBooking}
          onClose={() =>
            setSelectedSpecialistForBooking(null)
          }
          onBookSuccess={handleBookingSuccess}
        />
      )}

      {/* Authentication Modal */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Contact Modal */}
      {isContactOpen && (
        <ContactModal
          onClose={() =>
            setIsContactOpen(false)
          }
        />
      )}

      {/* Search Overlay */}
      {isSearchOverlayOpen && (
        <SearchOverlay
          onClose={() =>
            setIsSearchOverlayOpen(false)
          }
          onSelectSpecialist={(spec) =>
            setSelectedSpecialistForBooking(spec)
          }
          onViewAllResults={(q) =>
            handleNavigateSearch('all', q)
          }
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-4 left-4 sm:left-auto sm:max-w-md z-[70] bg-[#1A1816] text-[#FAF8F5] px-4 py-3 rounded-lg shadow-2xl border border-[#38342F] flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-250"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium min-w-0">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />

            <span className="leading-5">
              {toastMessage}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
                toastTimerRef.current = null;
              }

              setToastMessage(null);
            }}
            className="text-[#DDD7CE] hover:text-[#FAF8F5] hover:bg-[#2A2724] p-1 rounded-md transition-colors cursor-pointer shrink-0"
            aria-label="بستن پیام"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}