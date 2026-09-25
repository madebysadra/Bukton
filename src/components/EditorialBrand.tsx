import React from 'react';
import { ASSET_IMAGES } from '../data/mockData';

export const EditorialBrand: React.FC = () => {
  return (
    <section id="about" aria-labelledby="brand-philosophy-title" className="py-20 md:py-32 bg-[#1C1A18] text-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left / Editorial Image (on RTL right side) */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-[#38342F] aspect-[4/3] sm:aspect-[16/11] bg-[#2A2724] shadow-2xl">
              <img
                src={ASSET_IMAGES.brandStatement}
                alt="بیانیه آرامش و ارزش زمان بوکتون"
                className="w-full h-full object-cover object-center filter brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-5 right-6 left-6 flex items-center justify-between text-xs text-[#FAF8F5]/80">
                <span className="font-serif-brand tracking-widest uppercase text-[#FAF8F5]/70">
                  BUKTON Manifesto
                </span>
                <span>تهران · ۲۰۲۶</span>
              </div>
            </div>
          </div>

          {/* Right / Manifesto Prose */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-2 text-xs font-serif-brand tracking-[0.25em] text-[#C47B7F] uppercase mb-4">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#C47B7F]" />
              <span>Brand Philosophy</span>
            </div>

            <h2 id="brand-philosophy-title" className="font-serif-brand text-4xl sm:text-5xl lg:text-6xl font-normal tracking-wide text-[#FAF8F5] leading-none mb-6">
              “Your time deserves better.”
            </h2>

            <p className="text-lg sm:text-xl text-[#DDD7CE] font-normal leading-relaxed mb-8 text-balance">
              «BUKTON تجربه پیدا کردن و رزرو خدمات را ساده‌تر، روشن‌تر و انسانی‌تر می‌کند.»
            </p>

            <div className="space-y-5 text-sm sm:text-base text-[#A8A196] leading-relaxed font-light border-t border-[#332F2A] pt-6">
              <p>
                ما معتقدیم دریافت یک خدمت حرفه‌ای نباید با تماس‌های مکرر، نامشخص بودن نرخ‌ها یا بلاتکلیفی زمان همراه باشد.
              </p>
              <p>
                بوکتون فضایی آرام برای پیدا کردن و انتخاب خدمات ایجاد می‌کند؛ جایی که اطلاعات روشن، انتخاب آگاهانه و ارزش زمان در مرکز تجربه قرار می‌گیرند.
              </p>
            </div>

            {/* Quiet Three Principles */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-6 border-t border-[#332F2A]">
              <div>
                <span className="text-xs text-[#8C867E] block mb-1">۰۱</span>
                <span className="text-sm font-medium text-[#FAF8F5]">اطلاعات روشن</span>
                <p className="text-[11px] text-[#A8A196] mt-1">قیمت و شرایط مشخص</p>
              </div>
              <div>
                <span className="text-xs text-[#8C867E] block mb-1">۰۲</span>
                <span className="text-sm font-medium text-[#FAF8F5]">انتخاب آگاهانه</span>
                <p className="text-[11px] text-[#A8A196] mt-1">مقایسه متخصص‌ها و خدمات</p>
              </div>
              <div>
                <span className="text-xs text-[#8C867E] block mb-1">۰۳</span>
                <span className="text-sm font-medium text-[#FAF8F5]">ارزش زمان</span>
                <p className="text-[11px] text-[#A8A196] mt-1">انتخاب زمان مناسب</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
