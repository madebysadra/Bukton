import React from 'react';

interface FooterProps {
  onNavClick: (id: string) => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenContact }) => {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#E7E2DA] pt-16 pb-12 text-[#4A4641]" aria-label="پاورقی بوکتون">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Top Part */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-[#E7E2DA]">
          
          {/* Logo & Essence */}
          <div className="max-w-sm">
            <span className="font-serif-brand text-2xl sm:text-3xl font-semibold tracking-[0.2em] text-[#1E1C1A] block mb-2">
              BUKTON
            </span>
            <p className="text-xs text-[#7A746B] leading-relaxed">
              پلتفرم جستجو، انتخاب و رزرو خدمات فردی، زیبایی و سلامت.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-sm font-normal text-[#2A2724]">
            <button
              type="button"
              onClick={() => onNavClick('services')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              خدمات
            </button>
            <button
              type="button"
              onClick={() => onNavClick('specialists')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              متخصص‌ها
            </button>
            <button
              type="button"
              onClick={() => onNavClick('categories')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              دسته‌بندی‌ها
            </button>
            <button
              type="button"
              onClick={() => onNavClick('about')}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              درباره ما
            </button>
            <button
              type="button"
              onClick={onOpenContact}
              className="hover:text-[#7C2D32] transition-colors cursor-pointer"
            >
              تماس
            </button>
          </div>

        </div>

        {/* Bottom Part: Copyright and statement */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C867E]">
          <div>
            <span>© ۲۰۲۶ بوکتون (BUKTON). تمامی حقوق محفوظ است.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#A69E93]">
            <span>طراحی‌شده با تمرکز بر تجربه‌ای ساده و روشن</span>
            <span aria-hidden="true">·</span>
            <span>نسخه نمایشی BUKTON</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
