import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="services"
      aria-labelledby="how-it-works-title"
      className="py-20 md:py-28 border-t border-[#E7E2DA]/80 bg-[#FAF8F5]"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <span className="text-xs font-serif-brand tracking-[0.2em] text-[#7C2D32] uppercase block mb-3">
            The Bukton Method
          </span>
          <h2
            id="how-it-works-title"
            className="text-3xl sm:text-4xl font-semibold text-[#1E1C1A] tracking-tight leading-snug"
          >
            تجربه رزروی که شایسته زمان شماست.
          </h2>
        </div>

        {/* 3 Steps Columns */}
        <ol
          aria-label="مراحل رزرو در بوکتون"
          className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 list-none m-0 p-0"
        >
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li
              key={step.number}
              className="flex flex-col justify-between border-t border-[#DDD7CE] pt-6 relative group"
            >
              <div>
                {/* Large Editorial Serif Number */}
                <div
                  aria-hidden="true"
                  className="font-serif-brand text-4xl sm:text-5xl font-normal text-[#B0A79A] group-hover:text-[#7C2D32] transition-colors mb-6 tracking-wider"
                >
                  {step.number}
                </div>

                {/* Step Title */}
                <h3 className="text-xl sm:text-2xl font-semibold text-[#1E1C1A] mb-3">
                  {step.title}
                </h3>

                {/* Main Step Description */}
                <p className="text-base text-[#2E2B27] font-medium leading-relaxed mb-3">
                  {step.description}
                </p>

                {/* Supporting Micro Copy */}
                <p className="text-xs sm:text-sm text-[#7A746B] leading-relaxed">
                  {step.details}
                </p>
              </div>

              {/* Step indicator hairline accent */}
              <div
                aria-hidden="true"
                className="mt-8 pt-4 border-t border-[#E7E2DA]/50 flex items-center justify-between text-[11px] text-[#A69E93]"
              >
                <span>گام {step.persianNumber} از ۰۳</span>
                <span className="w-2 h-2 rounded-full bg-[#E7E2DA] group-hover:bg-[#7C2D32] transition-colors" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
