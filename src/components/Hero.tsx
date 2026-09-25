import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Sparkles, ChevronDown, Check } from 'lucide-react';
import { ASSET_IMAGES, POPULAR_SEARCH_SERVICES, POPULAR_SEARCH_LOCATIONS, POPULAR_SEARCH_TIMES } from '../data/mockData';
import { SearchQuery } from '../types';

interface HeroProps {
  onSearch: (query: SearchQuery) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onSelectCategory }) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [activeDropdown, setActiveDropdown] = useState<'service' | 'location' | 'time' | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveDropdown(null);
    onSearch({
      service: selectedService,
      location: selectedLocation,
      date: selectedTime,
    });
  };

  const handleQuickServiceClick = (service: string, categoryId?: string) => {
    setSelectedService(service);
    if (categoryId) {
      onSelectCategory(categoryId);
    }
  };

  return (
    <section className="relative pt-6 pb-16 md:pt-12 md:pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Editorial Top Headline Layout */}
        <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 text-xs md:text-[13px] font-medium tracking-wider text-[#7C2D32] mb-4 bg-[#7C2D32]/6 px-3 py-1 rounded-md border border-[#7C2D32]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C2D32]" />
            <span>پلتفرم گزینش و رزرو اختصاصی خدمات</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-semibold text-[#1A1816] tracking-tight leading-[1.22] text-balance mb-5">
            وقتِ بهتری برای خودت پیدا کن.
          </h1>

          <p className="text-base sm:text-lg text-[#554F47] font-normal max-w-2xl mx-auto leading-relaxed text-balance">
            متخصص‌ها و خدمات مورد اعتمادت را پیدا کن، زمان مناسب را انتخاب کن و آنلاین رزرو کن.
          </p>
        </div>

        {/* Core Product Search Interface with rock-solid popover anchoring and z-index */}
        <div ref={searchContainerRef} className="max-w-4xl mx-auto mb-12 sm:mb-14 relative z-30">
          <div className="bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl shadow-[0_4px_20px_-4px_rgba(26,24,22,0.04)] p-2 sm:p-2.5 relative">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-1.5 sm:gap-2 items-center">
              
              {/* Field 1: چه خدمتی می‌خوای؟ (4 columns) */}
              <div className="relative md:col-span-4 border-b md:border-b-0 md:border-l border-[#E7E2DA] pb-1.5 md:pb-0 md:pl-2">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'service' ? null : 'service')}
                  className="w-full text-right px-3.5 py-2.5 rounded-lg hover:bg-[#F3EFEA] transition-colors flex flex-col justify-center cursor-pointer"
                  aria-haspopup="listbox"
                  aria-expanded={activeDropdown === 'service'}
                  aria-controls="hero-service-options"
                >
                  <span className="text-[11px] font-medium text-[#7A746B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C2D32] shrink-0" />
                    <span>چه خدمتی می‌خوای؟</span>
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#1A1816] mt-1 truncate flex items-center justify-between gap-2">
                    <span className="truncate">{selectedService || 'انتخاب خدمت یا تخصص...'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C867E] shrink-0" />
                  </span>
                </button>

                {/* Dropdown 1 */}
                {activeDropdown === 'service' && (
                  <div id="hero-service-options"
                    role="listbox"
                    aria-label="انتخاب خدمت"
                    className="absolute top-full right-0 left-0 mt-2 bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-98 duration-100">
                    <div className="text-[11px] text-[#7A746B] px-3 py-1.5 font-medium border-b border-[#E7E2DA] mb-1">
                      خدمات پرطرفدار بوکتون
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {POPULAR_SEARCH_SERVICES.map((srv) => (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => {
                            setSelectedService(srv);
                            setActiveDropdown(null);
                          }}
                          role="option"
                          aria-selected={selectedService === srv}
                          className={`w-full text-right px-3 py-2 text-xs sm:text-[13px] rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            selectedService === srv
                              ? 'bg-[#F2ECE4] text-[#7C2D32] font-semibold'
                              : 'text-[#1A1816] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          <span>{srv}</span>
                          {selectedService === srv && <Check className="w-3.5 h-3.5 text-[#7C2D32] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Field 2: کجا؟ (3 columns) */}
              <div className="relative md:col-span-3 border-b md:border-b-0 md:border-l border-[#E7E2DA] pb-1.5 md:pb-0 md:pl-2">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
                  className="w-full text-right px-3.5 py-2.5 rounded-lg hover:bg-[#F3EFEA] transition-colors flex flex-col justify-center cursor-pointer"
                  aria-haspopup="listbox"
                  aria-expanded={activeDropdown === 'location'}
                  aria-controls="hero-location-options"
                >
                  <span className="text-[11px] font-medium text-[#7A746B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7C2D32] shrink-0" />
                    <span>کجا؟</span>
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#1A1816] mt-1 truncate flex items-center justify-between gap-2">
                    <span className="truncate">{selectedLocation || 'همه مناطق'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C867E] shrink-0" />
                  </span>
                </button>

                {/* Dropdown 2 */}
                {activeDropdown === 'location' && (
                  <div id="hero-location-options"
                    role="listbox"
                    aria-label="انتخاب منطقه"
                    className="absolute top-full right-0 left-0 mt-2 bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-98 duration-100">
                    <div className="text-[11px] text-[#7A746B] px-3 py-1.5 font-medium border-b border-[#E7E2DA] mb-1">
                      مناطق و محله‌های فعال
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {POPULAR_SEARCH_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setActiveDropdown(null);
                          }}
                          role="option"
                          aria-selected={selectedLocation === loc}
                          className={`w-full text-right px-3 py-2 text-xs sm:text-[13px] rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            selectedLocation === loc
                              ? 'bg-[#F2ECE4] text-[#7C2D32] font-semibold'
                              : 'text-[#1A1816] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          <span>{loc}</span>
                          {selectedLocation === loc && <Check className="w-3.5 h-3.5 text-[#7C2D32] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Field 3: چه زمانی؟ (3 columns) */}
              <div className="relative md:col-span-3 border-b md:border-b-0 pb-1.5 md:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
                  className="w-full text-right px-3.5 py-2.5 rounded-lg hover:bg-[#F3EFEA] transition-colors flex flex-col justify-center cursor-pointer"
                  aria-haspopup="listbox"
                  aria-expanded={activeDropdown === 'time'}
                  aria-controls="hero-time-options"
                >
                  <span className="text-[11px] font-medium text-[#7A746B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7C2D32] shrink-0" />
                    <span>چه زمانی؟</span>
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#1A1816] mt-1 truncate flex items-center justify-between gap-2">
                    <span className="truncate">{selectedTime || 'زمان دلخواه'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C867E] shrink-0" />
                  </span>
                </button>

                {/* Dropdown 3: Anchored with proper width, min-width, RTL positioning, and high z-index */}
                {activeDropdown === 'time' && (
                  <div id="hero-time-options"
                    role="listbox"
                    aria-label="انتخاب زمان مراجعه"
                    className="absolute top-full right-0 w-full min-w-[220px] sm:min-w-[250px] mt-2 bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-98 duration-100">
                    <div className="text-[11px] text-[#7A746B] px-3 py-1.5 font-medium border-b border-[#E7E2DA] mb-1">
                      بازه زمانی مراجعه
                    </div>
                    <div className="space-y-0.5">
                      {POPULAR_SEARCH_TIMES.map((tim) => (
                        <button
                          key={tim}
                          type="button"
                          onClick={() => {
                            setSelectedTime(tim);
                            setActiveDropdown(null);
                          }}
                          role="option"
                          aria-selected={selectedTime === tim}
                          className={`w-full text-right px-3 py-2 text-xs sm:text-[13px] rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            selectedTime === tim
                              ? 'bg-[#F2ECE4] text-[#7C2D32] font-semibold'
                              : 'text-[#1A1816] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          <span>{tim}</span>
                          {selectedTime === tim && <Check className="w-3.5 h-3.5 text-[#7C2D32] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Search Button (2 columns) */}
              <div className="md:col-span-2 flex items-center">
                <button
                  type="submit"
                  className="w-full h-full min-h-[46px] bg-[#7C2D32] hover:bg-[#672226] text-[#FAF8F5] font-medium text-xs sm:text-sm rounded-lg px-4 py-2.5 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>جستجو</span>
                </button>
              </div>

            </form>
          </div>

          {/* Quick Category Hints */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-xs text-[#7A746B]">
            <span className="font-medium text-[#4A4641]">پیشنهاد‌های پرطرفدار:</span>
            <button
              type="button"
              onClick={() => handleQuickServiceClick('فیشیال و مراقبت پوست', 'skin')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              فیشیال نیاوران
            </button>
            <span aria-hidden="true" className="text-[#DDD7CE]">·</span>
            <button
              type="button"
              onClick={() => handleQuickServiceClick('کوتاهی مو و استایل', 'hair')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              استایلیست مو فرشته
            </button>
            <span aria-hidden="true" className="text-[#DDD7CE]">·</span>
            <button
              type="button"
              onClick={() => handleQuickServiceClick('ماساژ درمانی بافت عمیق', 'massage')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              ماساژ زعفرانیه
            </button>
            <span aria-hidden="true" className="text-[#DDD7CE]">·</span>
            <button
              type="button"
              onClick={() => handleQuickServiceClick('پیلاتس ریفورمر', 'fitness')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              پیلاتس شهرک غرب
            </button>
          </div>
        </div>

        {/* Editorial Visual Composition with controlled z-index so dropdown sits neatly above it */}
        <div className="relative z-10 rounded-xl overflow-hidden border border-[#E7E2DA] bg-[#F3EFEA] aspect-[16/8.5] max-w-5xl mx-auto shadow-[0_8px_30px_-10px_rgba(26,24,22,0.05)]">
          <img
            src={ASSET_IMAGES.hero}
            alt="فضای آرام و مینیمال رزرو وقت بوکتون"
            className="w-full h-full object-cover object-center filter brightness-[0.98]"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/40 via-transparent to-transparent pointer-events-none" />

          {/* Editorial Floating Caption */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-xs sm:max-w-md bg-[#FAF8F5]/94 backdrop-blur-md border border-[#E7E2DA] rounded-lg p-3.5 sm:p-4 text-right shadow-xs">
            <span className="text-[10px] sm:text-xs font-serif-brand tracking-widest uppercase text-[#7C2D32] block mb-1">
              Curated Appointments · Tehran
            </span>
            <p className="text-xs sm:text-sm text-[#1A1816] font-medium leading-snug">
              دسترسی مستقیم به زمان‌های آزاد متخصصان، با اطلاعات روشن درباره خدمت، زمان و شرایط رزرو.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
