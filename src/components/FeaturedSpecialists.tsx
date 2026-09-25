import React from 'react';
import { Star, MapPin, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Specialist, ServiceCategory } from '../types';
import { formatTomanPrice, toPersianDigits } from '../utils/formatters';

interface FeaturedSpecialistsProps {
  specialists: Specialist[];
  activeCategory: ServiceCategory | 'all';
  onCategoryChange: (category: ServiceCategory | 'all') => void;
  onSelectSpecialist: (specialist: Specialist) => void;
}

const CATEGORY_TABS: { id: ServiceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'همه متخصص‌ها' },
  { id: 'skin', label: 'پوست و فیشیال' },
  { id: 'hair', label: 'مو و پیرایش' },
  { id: 'massage', label: 'ماساژ و آرامش' },
  { id: 'fitness', label: 'پیلاتس و فیتنس' },
  { id: 'photography', label: 'عکاسی پرتره' },
  { id: 'style', label: 'استایل و کمد' },
];

export const FeaturedSpecialists: React.FC<FeaturedSpecialistsProps> = ({
  specialists,
  activeCategory,
  onCategoryChange,
  onSelectSpecialist,
}) => {
  const filteredSpecialists = activeCategory === 'all'
    ? specialists
    : specialists.filter((s) => s.category === activeCategory);

  return (
    <section id="specialists" className="py-16 md:py-24 bg-[#F5F2EB]/40 border-t border-[#E7E2DA]/80">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-serif-brand tracking-[0.2em] text-[#7C2D32] uppercase block mb-2">
            Selected Practitioners
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#1A1816] tracking-tight mb-3">
            متخصص‌هایی که ارزش وقتت رو دارن.
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#5C564E] font-normal leading-relaxed">
            متخصص‌ها را بر اساس دسته‌بندی، امتیاز، موقعیت و زمان‌های موجود پیدا کن و برای خدمت موردنظرت رزرو انجام بده.
          </p>
        </div>

        {/* Filter Tabs (Disciplined Segmented Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                aria-pressed={isActive}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1816] text-[#FAF8F5] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#554F47] hover:text-[#1A1816] border border-[#DDD7CE] hover:border-[#C4BCB0]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Specialists Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredSpecialists.map((specialist) => (
            <div
              key={specialist.id}
              className="group bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(26,24,22,0.03)] hover:shadow-[0_10px_30px_-4px_rgba(26,24,22,0.06)] hover:border-[#DDD7CE] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Specialist Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECE7DF]">
                  <img
                    src={specialist.image}
                    alt={`تصویر ${specialist.name}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle category badge and verification */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {specialist.isVerified && (
                      <span className="bg-[#FAF8F5]/95 backdrop-blur-sm border border-[#E7E2DA] px-2.5 py-1 rounded-md text-[11px] font-medium text-[#1A1816] flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7C2D32]" />
                        <span>تأییدشده</span>
                      </span>
                    )}
                    <span className="bg-[#FAF8F5]/90 backdrop-blur-sm border border-[#E7E2DA] px-2 py-1 rounded-md text-[11px] font-medium text-[#4A4641]">
                      {specialist.categoryLabel}
                    </span>
                  </div>

                  {/* Rating Overlay */}
                  <div className="absolute bottom-3 left-3 bg-[#1A1816]/85 backdrop-blur-sm text-[#FAF8F5] px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 tabular-nums">
                    <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                    <span>{toPersianDigits(specialist.rating)}</span>
                    <span className="text-[#DDD7CE]/75 text-[10px]">
                      ({toPersianDigits(specialist.reviewsCount)})
                    </span>
                  </div>

                  {/* Next available time if available */}
                  {specialist.nextAvailableTime && (
                    <div className="absolute bottom-3 right-3 bg-[#1A1816]/85 backdrop-blur-sm text-[#FAF8F5] px-2.5 py-1 rounded-md text-[10px] font-medium">
                      <span>اولین نوبت: {specialist.nextAvailableTime}</span>
                    </div>
                  )}
                </div>

                {/* Card Information */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-[#1A1816] group-hover:text-[#7C2D32] transition-colors">
                      {specialist.name}
                    </h3>
                    <div className="text-[11px] text-[#7A746B] tabular-nums whitespace-nowrap pt-0.5">
                      {toPersianDigits(specialist.bookingCount)}+ رزرو
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#7C2D32] font-medium mb-3">
                    {specialist.specialty}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-[#5C564E] mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#8C867E] shrink-0" />
                    <span className="truncate">{specialist.location}</span>
                  </div>

                  <p className="text-xs text-[#554F47] leading-relaxed line-clamp-2 mb-3">
                    {specialist.bio}
                  </p>
                </div>
              </div>

              {/* Card Footer: Starting Price & Action */}
              <div className="px-5 py-3.5 bg-[#F8F5F0] border-t border-[#E7E2DA] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8C867E] block leading-none">شروع قیمت از</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#1A1816] tabular-nums mt-0.5 block">
                    {formatTomanPrice(specialist.startingPriceToman)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectSpecialist(specialist)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg transition-all cursor-pointer active:scale-98 shadow-xs"
                >
                  <span>مشاهده و رزرو</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Empty State if filter returns no specialist */}
        {filteredSpecialists.length === 0 && (
          <div className="text-center py-16 bg-[#FAF8F5] rounded-xl border border-[#E7E2DA] p-8">
            <Calendar className="w-8 h-8 text-[#8C867E] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1A1816] mb-1">
              در این دسته‌بندی فعلاً متخصصی یافت نشد
            </p>
            <p className="text-xs text-[#7A746B] mb-4">
              می‌توانید فیلتر دسته‌بندی را تغییر داده یا به همه متخصص‌ها بازگردید.
            </p>
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className="px-4 py-2 text-xs font-medium bg-[#1A1816] text-[#FAF8F5] rounded-lg"
            >
              مشاهده همه متخصص‌ها
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
