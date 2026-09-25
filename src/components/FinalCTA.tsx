import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';

interface FinalCTAProps {
  onStartSearch: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartSearch }) => {
  return (
    <section aria-labelledby="final-cta-title" className="py-20 md:py-28 bg-[#FAF8F5] border-t border-[#E7E2DA]/80 relative">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">
        
        {/* Soft elegant container */}
        <div className="bg-[#F3EFEA] border border-[#DDD7CE] rounded-xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-[0_4px_20px_rgba(26,24,22,0.02)]">
          
          {/* Subtle architectural hairline accents */}
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-[#7C2D32]/40" />
          
          <span className="text-xs font-serif-brand tracking-[0.2em] text-[#7C2D32] uppercase block mb-3">
            Begin Your Experience
          </span>

          <h2 id="final-cta-title" className="text-3xl sm:text-4xl md:text-[44px] font-semibold text-[#1A1816] tracking-tight leading-[1.28] text-balance mb-4">
            وقتشه برای وقتت برنامه داشته باشی.
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-[#554F47] max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            خدمت موردنظرتان را پیدا کنید، زمان مناسب را انتخاب کنید و نوبت خود را مستقیم ثبت کنید.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartSearch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg shadow-xs transition-all duration-160 cursor-pointer active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              <span>شروع جستجو</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-6 text-xs text-[#8C867E]">
            <span>انتخاب خدمت و زمان در یک مسیر ساده</span>
            <span aria-hidden="true" className="text-[#DDD7CE]">·</span>
            <span>مشاهده جزئیات رزرو در حساب شما</span>
          </div>

        </div>

      </div>
    </section>
  );
};
