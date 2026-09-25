import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { ServiceCategory } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface PopularServicesProps {
  onSelectCategory: (category: ServiceCategory) => void;
  activeCategory: ServiceCategory | 'all';
}

export const PopularServices: React.FC<PopularServicesProps> = ({
  onSelectCategory,
  activeCategory,
}) => {
  return (
    <section id="categories" className="py-16 md:py-24 border-t border-[#E7E2DA]/80">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-serif-brand tracking-[0.2em] text-[#7C2D32] uppercase block mb-2">
              Curated Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1A1816] tracking-tight">
              محبوب‌ترین خدمات
            </h2>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#5C564E] max-w-md font-normal leading-relaxed">
            از میان دسته‌بندی‌های مختلف، خدمت موردنظرت را پیدا کن و متخصص مناسب را برای رزرو انتخاب کن.
          </p>
        </div>

        {/* 6 Editorial Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onSelectCategory(cat.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectCategory(cat.id);
                  }
                }}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer bg-[#FAF8F5] flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C2D32] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] ${
                  isSelected
                    ? 'border-[#7C2D32] ring-1 ring-[#7C2D32] shadow-sm'
                    : 'border-[#E7E2DA] hover:border-[#C4BCB0] hover:shadow-[0_6px_25px_rgba(26,24,22,0.04)]'
                }`}
              >
                {/* Large Editorial Photography */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECE7DF]">
                  <img
                    src={cat.image}
                    alt={`دسته‌بندی ${cat.title}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-600 ease-out group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/75 via-[#1A1816]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Category Title Overlay */}
                  <div className="absolute bottom-4 right-5 left-5 flex items-baseline justify-between text-[#FAF8F5]">
                    <div>
                      <span className="text-xs font-serif-brand tracking-widest text-[#FAF8F5]/85 uppercase block mb-0.5">
                        {cat.englishTitle}
                      </span>
                      <h3 className="text-2xl font-semibold tracking-tight text-[#FAF8F5]">
                        {cat.title}
                      </h3>
                    </div>
                    <span className="text-xs font-normal text-[#FAF8F5]/85 tabular-nums">
                      {toPersianDigits(cat.specialistCount)} متخصص
                    </span>
                  </div>
                </div>

                {/* Editorial Content Below */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-[#FAF8F5]">
                  <p className="text-xs sm:text-sm text-[#5C564E] font-normal leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  <div className="flex items-center justify-between pt-3.5 border-t border-[#E7E2DA] text-xs font-medium">
                    <span className="text-[#7C2D32] group-hover:text-[#672226] transition-colors flex items-center gap-1.5">
                      <span>مشاهده متخصصان {cat.title}</span>
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                    </span>
                    <span className="text-[#8C867E]">
                      نوبت‌های آزاد این هفته
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
