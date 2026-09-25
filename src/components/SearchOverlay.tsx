import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  X,
  MapPin,
  Star,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { SPECIALISTS } from '../data/mockData';
import { Specialist } from '../types';
import {
  formatTomanPrice,
  toPersianDigits,
} from '../utils/formatters';

interface SearchOverlayProps {
  onClose: () => void;
  onSelectSpecialist: (specialist: Specialist) => void;
  onViewAllResults?: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  onClose,
  onSelectSpecialist,
  onViewAllResults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input + lock background scroll while overlay is open
  useEffect(() => {
    inputRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Close with Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const filtered = SPECIALISTS.filter((specialist) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return true;

    return (
      specialist.name.toLowerCase().includes(term) ||
      specialist.specialty.toLowerCase().includes(term) ||
      specialist.location.toLowerCase().includes(term) ||
      specialist.categoryLabel.toLowerCase().includes(term) ||
      specialist.services.some((service) =>
        service.title.toLowerCase().includes(term)
      )
    );
  });

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSelectSpecialist = (specialist: Specialist) => {
    onSelectSpecialist(specialist);
    onClose();
  };

  const handleViewAllResults = () => {
    if (!onViewAllResults) return;

    onViewAllResults(searchTerm);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:p-6 pt-8 sm:pt-16 bg-[#1A1816]/65 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="جستجوی متخصص و خدمات"
    >
      <div
        className="w-full max-w-2xl bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl shadow-[0_24px_70px_-22px_rgba(0,0,0,0.4)] overflow-hidden relative animate-in fade-in zoom-in-98 duration-200"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3.5 border-b border-[#E7E2DA] bg-[#FAF8F5]">
          <Search className="w-4 h-4 text-[#7C2D32] shrink-0" />

          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="جستجوی متخصص، خدمت یا منطقه..."
            aria-label="جستجو"
            className="min-w-0 flex-1 text-xs sm:text-sm bg-transparent border-none outline-none text-[#1A1816] placeholder:text-[#9E968B] py-1"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              className="p-1.5 text-[#8C867E] hover:text-[#1A1816] hover:bg-[#F3EFEA] rounded-md transition-colors cursor-pointer shrink-0"
              aria-label="پاک کردن جستجو"
              title="پاک کردن"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#7A746B] hover:text-[#1A1816] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="بستن جستجو"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-2.5 sm:p-4 max-h-[min(62vh,520px)] overflow-y-auto overscroll-contain">
          {/* Results Meta */}
          <div className="px-2 py-1.5 mb-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#7A746B]">
              <span>
                {searchTerm.trim()
                  ? `${toPersianDigits(filtered.length)} نتیجه`
                  : 'متخصص‌های پیشنهادی'}
              </span>

              {searchTerm.trim() && (
                <span className="text-[#C7BFB5]">•</span>
              )}

              {searchTerm.trim() && (
                <span className="text-[#7C2D32] truncate max-w-[140px] sm:max-w-[220px]">
                  «{searchTerm.trim()}»
                </span>
              )}
            </div>

            {filtered.length > 0 && (
              <span className="hidden sm:block text-[10px] text-[#9E968B]">
                برای مشاهده جزئیات انتخاب کنید
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            /* Empty State */
            <div className="py-12 sm:py-16 px-5 text-center">
              <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-[#F2ECE4] flex items-center justify-center">
                <Search className="w-4 h-4 text-[#7C2D32]" />
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#4A4641]">
                نتیجه‌ای پیدا نشد.
              </p>

              <p className="text-[11px] sm:text-xs text-[#9E968B] mt-1.5 leading-5">
                نام متخصص، خدمت یا منطقه دیگری را امتحان کنید.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#7C2D32] hover:text-[#5B1E22] transition-colors cursor-pointer"
              >
                <span>نمایش همه متخصص‌ها</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          ) : (
            /* Results */
            <div className="space-y-1">
              {filtered.map((specialist) => (
                <button
                  key={specialist.id}
                  type="button"
                  onClick={() =>
                    handleSelectSpecialist(specialist)
                  }
                  className="w-full flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-[#F3EFEA] border border-transparent hover:border-[#E7E2DA] transition-all cursor-pointer group text-right"
                >
                  {/* Specialist Info */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <img
                      src={specialist.image}
                      alt={specialist.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover border border-[#DDD7CE] shrink-0"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#1A1816] group-hover:text-[#7C2D32] transition-colors truncate">
                        {specialist.name}
                      </h4>

                      <p className="text-[11px] sm:text-xs text-[#5C564E] truncate mt-0.5">
                        {specialist.specialty}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[#8C867E] mt-1 min-w-0">
                        <span className="flex items-center gap-0.5 min-w-0">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {specialist.location}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className="text-[#CFC7BD] shrink-0"
                        >
                          ·
                        </span>

                        <span className="flex items-center gap-0.5 text-[#1A1816] font-medium shrink-0">
                          <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                          {toPersianDigits(specialist.rating)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price / CTA */}
                  <div className="text-left shrink-0">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#1A1816] block whitespace-nowrap">
                      {formatTomanPrice(
                        specialist.startingPriceToman
                      )}
                    </span>

                    <span className="text-[10px] sm:text-[11px] text-[#7C2D32] group-hover:underline inline-flex items-center justify-end gap-1 mt-1 whitespace-nowrap">
                      <span>رزرو وقت</span>
                      <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Search Footer */}
        {onViewAllResults && (
          <div className="px-3.5 sm:px-5 py-3 border-t border-[#E7E2DA] bg-[#F7F4EE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#5C564E]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7C2D32] shrink-0" />
              <span>
                فیلتر دقیق‌تر بر اساس قیمت، امتیاز و منطقه
              </span>
            </div>

            <button
              type="button"
              onClick={handleViewAllResults}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-medium text-[#7C2D32] hover:text-[#5B1E22] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>مشاهده همه نتایج</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};