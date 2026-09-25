import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Heart,
  ArrowLeft,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Specialist, ServiceCategory } from '../types';
import {
  CATEGORIES,
  DISCOVERY_AREAS,
  PRICE_TIERS,
  RATING_FILTER_OPTIONS,
  AVAILABILITY_OPTIONS,
  SORT_OPTIONS
} from '../data/mockData';
import { formatTomanPrice, toPersianDigits } from '../utils/formatters';

interface SearchResultsPageProps {
  specialists: Specialist[];
  initialCategory?: ServiceCategory | 'all';
  initialQuery?: string;
  initialArea?: string;
  onSelectSpecialist: (specialist: Specialist) => void;
  onNavigateHome: () => void;
  onShowToast: (message: string) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  specialists,
  initialCategory = 'all',
  initialQuery = '',
  initialArea = 'all',
  onSelectSpecialist,
  onNavigateHome,
  onShowToast,
}) => {
  // Search bar input state
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [barServiceCategory, setBarServiceCategory] = useState<ServiceCategory | 'all'>(initialCategory);
  const [barArea, setBarArea] = useState<string>(initialArea);
  const [barPriceTier, setBarPriceTier] = useState<string>('all');

  // Active filter state (Sidebar & chips)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>(initialCategory);
  const [selectedArea, setSelectedArea] = useState<string>(initialArea);
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number>(0);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevant');

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Mobile filters drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Return to the first page whenever the active search/filter state changes.
  useEffect(() => {
    setVisibleCount(6);
  }, [
    searchTerm,
    selectedCategory,
    selectedArea,
    selectedPriceTier,
    selectedMinRating,
    selectedAvailability,
    verifiedOnly,
    sortBy,
  ]);

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedArea !== 'all') count++;
    if (selectedPriceTier !== 'all') count++;
    if (selectedMinRating > 0) count++;
    if (selectedAvailability !== 'all') count++;
    if (verifiedOnly) count++;
    if (searchTerm.trim() !== '') count++;
    return count;
  }, [
    selectedCategory,
    selectedArea,
    selectedPriceTier,
    selectedMinRating,
    selectedAvailability,
    verifiedOnly,
    searchTerm,
  ]);

  const handleToggleFavorite = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        onShowToast(`«${name}» از فهرست نشان‌شده‌ها حذف شد.`);
      } else {
        next.add(id);
        onShowToast(`«${name}» به فهرست نشان‌شده‌های شما افزوده شد.`);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedArea('all');
    setSelectedPriceTier('all');
    setSelectedMinRating(0);
    setSelectedAvailability('all');
    setVerifiedOnly(false);
    setSearchTerm('');
    setBarServiceCategory('all');
    setBarArea('all');
    setBarPriceTier('all');
    onShowToast('تمامی فیلترها بازنشانی شدند.');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSelectedCategory(barServiceCategory);
    setSelectedArea(barArea);
    setSelectedPriceTier(barPriceTier);
  };

  // Filter & Sort Logic
  const filteredAndSortedSpecialists = useMemo(() => {
    let result = [...specialists];

    // Search query keyword filter
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.specialty.toLowerCase().includes(term) ||
          s.location.toLowerCase().includes(term) ||
          s.categoryLabel.toLowerCase().includes(term) ||
          s.bio.toLowerCase().includes(term) ||
          s.services.some((srv) => srv.title.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // Area filter
    if (selectedArea !== 'all') {
      result = result.filter(
        (s) => s.area === selectedArea || s.location.includes(selectedArea)
      );
    }

    // Price tier filter
    if (selectedPriceTier !== 'all') {
      const tier = PRICE_TIERS.find((p) => p.id === selectedPriceTier);
      if (tier) {
        if (tier.min && tier.max) {
          result = result.filter(
            (s) => s.startingPriceToman >= tier.min! && s.startingPriceToman <= tier.max!
          );
        } else if (tier.max) {
          result = result.filter((s) => s.startingPriceToman <= tier.max!);
        } else if (tier.min) {
          result = result.filter((s) => s.startingPriceToman >= tier.min!);
        }
      }
    }

    // Rating filter
    if (selectedMinRating > 0) {
      result = result.filter((s) => s.rating >= selectedMinRating);
    }

    // Availability filter
    if (selectedAvailability === 'today') {
      result = result.filter((s) => s.nextAvailableTime?.includes('امروز'));
    } else if (selectedAvailability === 'tomorrow') {
      result = result.filter((s) => s.nextAvailableTime?.includes('فردا'));
    } else if (selectedAvailability === 'weekend') {
      result = result.filter(
        (s) =>
          s.nextAvailableTime?.includes('پنج‌شنبه') ||
          s.nextAvailableTime?.includes('جمعه') ||
          s.nextAvailableTime?.includes('شنبه')
      );
    }

    // Verified only
    if (verifiedOnly) {
      result = result.filter((s) => s.isVerified);
    }

    // Sorting
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => b.bookingCount - a.bookingCount);
        break;
      case 'price_asc':
        result.sort((a, b) => a.startingPriceToman - b.startingPriceToman);
        break;
      case 'price_desc':
        result.sort((a, b) => b.startingPriceToman - a.startingPriceToman);
        break;
      case 'relevant':
      default:
        result.sort((a, b) => b.rating * 100 + b.bookingCount - (a.rating * 100 + a.bookingCount));
        break;
    }

    return result;
  }, [
    specialists,
    searchTerm,
    selectedCategory,
    selectedArea,
    selectedPriceTier,
    selectedMinRating,
    selectedAvailability,
    verifiedOnly,
    sortBy,
  ]);

  const visibleSpecialists = filteredAndSortedSpecialists.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedSpecialists.length;

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1816]">
      {/* Top Breadcrumb & Page Introduction */}
      <div className="border-b border-[#E7E2DA] bg-[#F7F4EE]/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 md:py-9">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-[#7A746B] mb-3">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              صفحه اصلی
            </button>
            <span aria-hidden="true" className="text-[#C4BCB0]">/</span>
            <span className="text-[#1A1816] font-medium">کشف و مقایسه متخصص‌ها</span>
            {selectedCategory !== 'all' && (
              <>
                <span aria-hidden="true" className="text-[#C4BCB0]">/</span>
                <span className="text-[#7C2D32] font-medium">
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.title}
                </span>
              </>
            )}
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-semibold text-[#1A1816] tracking-tight mb-2.5">
              متخصص مناسب برای خودت پیدا کن
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#554F47] leading-relaxed">
              فهرست معتبر و گزینش‌شده از حرفه‌ای‌ترین ارائه‌دهندگان خدمات فردی در تهران. فیلترها را تنظیم کنید، زمان‌های آزاد را بررسی کرده و آنلاین رزرو کنید.
            </p>
          </div>

          {/* Core Search & Multi-Filter Bar */}
          <div className="mt-7 bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl p-2 sm:p-2.5 shadow-[0_2px_15px_-3px_rgba(26,24,22,0.03)]">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-1.5 sm:gap-2 items-center">
              
              {/* Keyword / Name Search (4 cols) */}
              <div className="md:col-span-4 flex items-center px-3.5 py-2 border-b md:border-b-0 md:border-l border-[#E7E2DA]">
                <Search className="w-4 h-4 text-[#7C2D32] shrink-0 ml-2.5" />
                <input
                  type="text"
                  placeholder="نام متخصص، خدمت یا منطقه..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-w-0 text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder:text-[#9E968B] text-[#1A1816]"
                />
              </div>

              {/* Service Category (3 cols) */}
              <div className="md:col-span-3 flex items-center px-3.5 py-2 border-b md:border-b-0 md:border-l border-[#E7E2DA]">
                <Sparkles className="w-3.5 h-3.5 text-[#8C867E] shrink-0 ml-2" />
                <div className="w-full min-w-0">
                  <span className="block text-[10px] text-[#8C867E] font-medium leading-none">نوع خدمت</span>
                  <select
                    value={barServiceCategory}
                    onChange={(e) => setBarServiceCategory(e.target.value as ServiceCategory | 'all')}
                    className="w-full text-xs font-medium text-[#1A1816] bg-transparent border-none focus:outline-none cursor-pointer mt-0.5 truncate"
                  >
                    <option value="all">همه خدمات</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title} ({cat.englishTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area / Location (3 cols) */}
              <div className="md:col-span-3 flex items-center px-3.5 py-2 border-b md:border-b-0 md:border-l border-[#E7E2DA]">
                <MapPin className="w-3.5 h-3.5 text-[#8C867E] shrink-0 ml-2" />
                <div className="w-full min-w-0">
                  <span className="block text-[10px] text-[#8C867E] font-medium leading-none">منطقه</span>
                  <select
                    value={barArea}
                    onChange={(e) => setBarArea(e.target.value)}
                    className="w-full text-xs font-medium text-[#1A1816] bg-transparent border-none focus:outline-none cursor-pointer mt-0.5 truncate"
                  >
                    {DISCOVERY_AREAS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Search Button (2 cols) */}
              <div className="md:col-span-2 flex items-center">
                <button
                  type="submit"
                  className="w-full h-full min-h-[44px] bg-[#7C2D32] hover:bg-[#672226] text-[#FAF8F5] text-xs sm:text-sm font-medium rounded-lg px-4 py-2 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>جستجو</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters (Right) + Results (Left) in RTL */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-12">
        
        {/* Results Bar: Count, Sort Control & Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#E7E2DA] gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg text-[#1A1816]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7C2D32]" />
              <span>فیلترها ({toPersianDigits(activeFiltersCount)})</span>
            </button>

            <span className="text-xs sm:text-sm font-medium text-[#1A1816]">
              <span className="font-bold text-sm sm:text-base text-[#7C2D32]">
                {toPersianDigits(filteredAndSortedSpecialists.length)}
              </span>{' '}
              متخصص پیدا شد
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A746B] whitespace-nowrap">مرتب‌سازی:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#FAF8F5] border border-[#DDD7CE] text-xs font-medium text-[#1A1816] py-1.5 pl-7 pr-3 rounded-lg focus:outline-none focus:border-[#7C2D32] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#7A746B] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 p-2.5 sm:p-3 bg-[#F5F2EB]/70 border border-[#E7E2DA] rounded-lg text-xs">
            <span className="text-[#5C564E] font-medium ml-1">فیلترهای فعال:</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD7CE] rounded-md text-[#1A1816]">
                <span>خدمت: {CATEGORIES.find((c) => c.id === selectedCategory)?.title}</span>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setBarServiceCategory('all');
                  }}
                  className="hover:text-[#7C2D32] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedArea !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD7CE] rounded-md text-[#1A1816]">
                <span>منطقه: {DISCOVERY_AREAS.find((a) => a.id === selectedArea)?.label || selectedArea}</span>
                <button
                  onClick={() => {
                    setSelectedArea('all');
                    setBarArea('all');
                  }}
                  className="hover:text-[#7C2D32] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPriceTier !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD7CE] rounded-md text-[#1A1816]">
                <span>قیمت: {PRICE_TIERS.find((p) => p.id === selectedPriceTier)?.label}</span>
                <button
                  onClick={() => {
                    setSelectedPriceTier('all');
                    setBarPriceTier('all');
                  }}
                  className="hover:text-[#7C2D32] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedMinRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD7CE] rounded-md text-[#1A1816]">
                <span>امتیاز: {toPersianDigits(selectedMinRating)}+</span>
                <button
                  onClick={() => setSelectedMinRating(0)}
                  className="hover:text-[#7C2D32] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAvailability !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD7CE] rounded-md text-[#1A1816]">
                <span>زمان: {AVAILABILITY_OPTIONS.find((a) => a.id === selectedAvailability)?.label}</span>
                <button
                  onClick={() => setSelectedAvailability('all')}
                  className="hover:text-[#7C2D32] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD7CE] rounded-md text-[#1A1816]">
                <span>فقط تأییدشده</span>
                <button
                  onClick={() => setVerifiedOnly(false)}
                  className="hover:text-[#7C2D32] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD7CE] rounded-md text-[#1A1816]">
                <span>جستجو: «{searchTerm}»</span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-[#7C2D32] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="mr-auto inline-flex items-center gap-1 text-[11px] text-[#7C2D32] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>پاک کردن همه</span>
            </button>
          </div>
        )}

        {/* 2-Column Grid Layout: Filter Sidebar (Right) + Results Cards (Left) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7 lg:gap-8 items-start">
          
          {/* Desktop Filter Sidebar (RTL Right side) */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-4 space-y-6 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl p-5 shadow-xs sticky top-24">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#7C2D32]" />
                <h3 className="text-sm font-semibold text-[#1A1816]">فیلترهای پیشرفته</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#7C2D32] hover:underline cursor-pointer"
                >
                  بازنشانی
                </button>
              )}
            </div>

            {/* Filter 1: دسته‌بندی خدمت */}
            <div>
              <label className="text-xs font-semibold text-[#4A4641] uppercase tracking-wider block mb-2.5">
                دسته‌بندی خدمت
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-right px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#1A1816] text-[#FAF8F5] font-medium'
                      : 'text-[#4A4641] hover:bg-[#F3EFEA]'
                  }`}
                >
                  <span>همه خدمات</span>
                  <span className="text-[11px] opacity-75">{toPersianDigits(specialists.length)}</span>
                </button>
                {CATEGORIES.map((cat) => {
                  const count = specialists.filter((s) => s.category === cat.id).length;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-right px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A1816] text-[#FAF8F5] font-medium'
                          : 'text-[#4A4641] hover:bg-[#F3EFEA]'
                      }`}
                    >
                      <span>{cat.title} ({cat.englishTitle})</span>
                      <span className="text-[11px] opacity-75">{toPersianDigits(count)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 2: محدوده / منطقه */}
            <div className="pt-4 border-t border-[#E7E2DA]">
              <label className="text-xs font-semibold text-[#4A4641] uppercase tracking-wider block mb-2.5">
                محدوده و منطقه
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full text-xs font-medium text-[#1A1816] bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg p-2 focus:outline-none focus:border-[#7C2D32] cursor-pointer"
              >
                {DISCOVERY_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: بازه قیمت */}
            <div className="pt-4 border-t border-[#E7E2DA]">
              <label className="text-xs font-semibold text-[#4A4641] uppercase tracking-wider block mb-2.5">
                بازه قیمت شروع
              </label>
              <div className="space-y-1.5">
                {PRICE_TIERS.map((tier) => (
                  <label
                    key={tier.id}
                    className="flex items-center gap-2 text-xs text-[#332F2A] cursor-pointer hover:text-[#1A1816]"
                  >
                    <input
                      type="radio"
                      name="priceTier"
                      checked={selectedPriceTier === tier.id}
                      onChange={() => setSelectedPriceTier(tier.id)}
                      className="accent-[#7C2D32]"
                    />
                    <span>{tier.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 4: حداقل امتیاز */}
            <div className="pt-4 border-t border-[#E7E2DA]">
              <label className="text-xs font-semibold text-[#4A4641] uppercase tracking-wider block mb-2.5">
                حداقل امتیاز
              </label>
              <div className="space-y-1.5">
                {RATING_FILTER_OPTIONS.map((rate) => (
                  <label
                    key={rate.id}
                    className="flex items-center gap-2 text-xs text-[#332F2A] cursor-pointer hover:text-[#1A1816]"
                  >
                    <input
                      type="radio"
                      name="minRating"
                      checked={selectedMinRating === rate.min}
                      onChange={() => setSelectedMinRating(rate.min)}
                      className="accent-[#7C2D32]"
                    />
                    <span className="flex items-center gap-1">
                      {rate.min > 0 && <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />}
                      <span>{rate.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 5: زمان‌های آزاد */}
            <div className="pt-4 border-t border-[#E7E2DA]">
              <label className="text-xs font-semibold text-[#4A4641] uppercase tracking-wider block mb-2.5">
                زمان‌های آزاد
              </label>
              <div className="space-y-1.5">
                {AVAILABILITY_OPTIONS.map((av) => (
                  <label
                    key={av.id}
                    className="flex items-center gap-2 text-xs text-[#332F2A] cursor-pointer hover:text-[#1A1816]"
                  >
                    <input
                      type="radio"
                      name="availability"
                      checked={selectedAvailability === av.id}
                      onChange={() => setSelectedAvailability(av.id)}
                      className="accent-[#7C2D32]"
                    />
                    <span>{av.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 6: فقط متخصص‌های تأییدشده */}
            <div className="pt-4 border-t border-[#E7E2DA]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-[#1A1816] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7C2D32]" />
                  فقط متخصص‌های تأییدشده
                </span>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#7C2D32] rounded cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-[#7A746B] mt-1 leading-relaxed">
                تأیید مدارک مهارتی و بازرسی استودیو توسط بوکتون
              </p>
            </div>

          </aside>

          {/* Results Grid (RTL Left side) */}
          <section className="md:col-span-8 lg:col-span-8">
            
            {/* Empty State */}
            {filteredAndSortedSpecialists.length === 0 ? (
              <div className="text-center py-20 px-6 bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl p-8">
                <div className="w-12 h-12 bg-[#F5F2EB] border border-[#E7E2DA] rounded-full flex items-center justify-center mx-auto mb-4 text-[#7C2D32]">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#1A1816] mb-2">
                  متخصصی با این مشخصات یافت نشد
                </h3>
                <p className="text-xs sm:text-sm text-[#5C564E] max-w-md mx-auto leading-relaxed mb-6">
                  پیشنهاد می‌کنیم فیلترهای اعمال‌شده (مانند منطقه یا بازه قیمت) را گسترده‌تر کنید یا با کلیک روی دکمه زیر همه فیلترها را بازنشانی نمایید.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بازنشانی همه فیلترها</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Specialist Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {visibleSpecialists.map((specialist) => {
                    const isFavorite = favorites.has(specialist.id);

                    return (
                      <div
                        key={specialist.id}
                        className="group bg-[#FAF8F5] border border-[#E7E2DA] hover:border-[#DDD7CE] rounded-xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(26,24,22,0.03)] hover:shadow-[0_10px_30px_-4px_rgba(26,24,22,0.06)] transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Portrait Container */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECE7DF]">
                            <img
                              src={specialist.image}
                              alt={specialist.name}
                              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103"
                              referrerPolicy="no-referrer"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/40 via-transparent to-transparent opacity-60" />

                            {/* Verification Badge */}
                            {specialist.isVerified && (
                              <div className="absolute top-3 right-3 bg-[#FAF8F5]/95 backdrop-blur-sm border border-[#E7E2DA] px-2.5 py-1 rounded-md text-[11px] font-medium text-[#1A1816] flex items-center gap-1.5 shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C2D32]" />
                                <span>تأییدشده بوکتون</span>
                              </div>
                            )}

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => handleToggleFavorite(specialist.id, specialist.name, e)}
                              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#FAF8F5]/90 backdrop-blur-sm border border-[#E7E2DA] flex items-center justify-center text-[#5C564E] hover:text-[#7C2D32] transition-colors cursor-pointer shadow-xs"
                              aria-label="نشان کردن متخصص"
                            >
                              <Heart
                                className={`w-4 h-4 transition-transform active:scale-125 ${
                                  isFavorite
                                    ? 'fill-[#7C2D32] text-[#7C2D32]'
                                    : 'text-[#5C564E]'
                                }`}
                              />
                            </button>

                            {/* Next Available Time Floating Badge */}
                            {specialist.nextAvailableTime && (
                              <div className="absolute bottom-3 right-3 bg-[#1A1816]/85 backdrop-blur-sm text-[#FAF8F5] px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-[#E7E2DA]" />
                                <span>اولین نوبت: {specialist.nextAvailableTime}</span>
                              </div>
                            )}
                          </div>

                          {/* Content Information */}
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <h3 className="text-lg font-semibold text-[#1A1816] group-hover:text-[#7C2D32] transition-colors">
                                  {specialist.name}
                                </h3>
                                <p className="text-xs text-[#7C2D32] font-medium mt-0.5">
                                  {specialist.specialty}
                                </p>
                              </div>

                              {/* Rating & Reviews */}
                              <div className="flex items-center gap-1 text-xs font-semibold text-[#1A1816] bg-[#F4EFEA] px-2.5 py-1 rounded-md tabular-nums shrink-0">
                                <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                                <span>{toPersianDigits(specialist.rating)}</span>
                                <span className="text-[10px] text-[#7A746B] font-normal">
                                  ({toPersianDigits(specialist.reviewsCount)})
                                </span>
                              </div>
                            </div>

                            {/* Location & Category */}
                            <div className="flex items-center gap-2 text-xs text-[#5C564E] my-2.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#8C867E] shrink-0" />
                                <span>{specialist.location}</span>
                              </span>
                              <span>·</span>
                              <span className="text-[11px] text-[#7A746B]">
                                {toPersianDigits(specialist.bookingCount)}+ رزرو انجام‌شده
                              </span>
                            </div>

                            {/* Bio / Editorial Snippet */}
                            <p className="text-xs text-[#554F47] leading-relaxed line-clamp-2 mb-3">
                              {specialist.bio}
                            </p>

                            {/* Featured Services chips */}
                            <div className="pt-1.5 flex flex-wrap gap-1.5">
                              {specialist.services.slice(0, 2).map((srv) => (
                                <span
                                  key={srv.id}
                                  className="text-[10px] bg-[#F7F4EE] border border-[#E7E2DA] text-[#4A4641] px-2 py-0.5 rounded-md truncate max-w-[200px]"
                                >
                                  {srv.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer Bar: Price & CTA */}
                        <div className="px-5 py-3.5 bg-[#F8F5F0] border-t border-[#E7E2DA] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#8C867E] block leading-none">شروع قیمت از</span>
                            <span className="text-xs sm:text-sm font-semibold text-[#1A1816] tabular-nums mt-0.5 block">
                              {formatTomanPrice(specialist.startingPriceToman)}
                            </span>
                          </div>

                          <button
                            onClick={() => onSelectSpecialist(specialist)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg transition-all cursor-pointer shadow-xs active:scale-98"
                          >
                            <span>مشاهده و رزرو</span>
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Pagination / Load More Button */}
                {hasMore && (
                  <div className="text-center pt-8">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-8 py-2.5 text-xs sm:text-sm font-medium bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1A1816] border border-[#DDD7CE] rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      نمایش متخصص‌های بیشتر ({toPersianDigits(filteredAndSortedSpecialists.length - visibleCount)} متخصص دیگر)
                    </button>
                  </div>
                )}

              </div>
            )}

          </section>

        </div>

      </div>

      {/* Mobile Filters Slide-Over / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-[#1A1816]/60 backdrop-blur-sm animate-in fade-in duration-200" onMouseDown={(e) => { if (e.target === e.currentTarget) setMobileFilterOpen(false); }}>
          <div
            className="bg-[#FAF8F5] border-t border-[#DDD7CE] rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2DA] bg-[#F7F4EE]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#7C2D32]" />
                <h3 className="text-sm font-semibold text-[#1A1816]">فیلترهای جستجو</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 text-[#5C564E] hover:text-[#1A1816] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-6">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-[#4A4641] block mb-2">
                  دسته‌بندی خدمت
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`py-2 px-3 text-xs rounded-lg border text-center transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]'
                        : 'bg-[#FAF8F5] text-[#332F2A] border-[#E7E2DA] hover:bg-[#F3EFEA]'
                    }`}
                  >
                    همه خدمات
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`py-2 px-3 text-xs rounded-lg border text-center transition-colors ${
                        selectedCategory === c.id
                          ? 'bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]'
                          : 'bg-[#FAF8F5] text-[#332F2A] border-[#E7E2DA] hover:bg-[#F3EFEA]'
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="text-xs font-semibold text-[#4A4641] block mb-2">
                  محدوده و منطقه
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full text-xs font-medium text-[#1A1816] bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg p-2.5 focus:outline-none focus:border-[#7C2D32]"
                >
                  {DISCOVERY_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-semibold text-[#4A4641] block mb-2">
                  بازه قیمت شروع
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRICE_TIERS.map((tier) => (
                    <label
                      key={tier.id}
                      className="flex items-center gap-2 text-xs text-[#332F2A] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobilePriceTier"
                        checked={selectedPriceTier === tier.id}
                        onChange={() => setSelectedPriceTier(tier.id)}
                        className="accent-[#7C2D32]"
                      />
                      <span>{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-semibold text-[#4A4641] block mb-2">
                  حداقل امتیاز
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RATING_FILTER_OPTIONS.map((rate) => (
                    <label
                      key={rate.id}
                      className="flex items-center gap-2 text-xs text-[#332F2A] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobileMinRating"
                        checked={selectedMinRating === rate.min}
                        onChange={() => setSelectedMinRating(rate.min)}
                        className="accent-[#7C2D32]"
                      />
                      <span className="flex items-center gap-1">
                        {rate.min > 0 && (
                          <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                        )}
                        <span>{rate.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="text-xs font-semibold text-[#4A4641] block mb-2">
                  زمان‌های آزاد
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABILITY_OPTIONS.map((av) => (
                    <label
                      key={av.id}
                      className="flex items-center gap-2 text-xs text-[#332F2A] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobileAvailability"
                        checked={selectedAvailability === av.id}
                        onChange={() => setSelectedAvailability(av.id)}
                        className="accent-[#7C2D32]"
                      />
                      <span>{av.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verified */}
              <div className="pt-1">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <span className="text-xs font-semibold text-[#1A1816] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7C2D32]" />
                    فقط متخصص‌های تأییدشده
                  </span>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#7C2D32] rounded cursor-pointer shrink-0"
                  />
                </label>
                <p className="text-[11px] text-[#7A746B] mt-1.5 leading-relaxed">
                  تأیید مدارک مهارتی و بازرسی استودیو توسط بوکتون
                </p>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-4 border-t border-[#E7E2DA] flex items-center gap-3 bg-[#FAF8F5]">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-1/3 py-2.5 text-xs font-medium text-[#5C564E] border border-[#DDD7CE] rounded-lg hover:bg-[#F3EFEA]"
              >
                بازنشانی
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 py-2.5 text-xs font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg shadow-xs"
              >
                مشاهده نتایج ({toPersianDigits(filteredAndSortedSpecialists.length)})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
