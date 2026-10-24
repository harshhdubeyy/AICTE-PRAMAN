import React from 'react';

interface HeroBannerProps {
  greeting: string;
  subtext: string;
  cycleBadge?: string;
  statusBadge?: string;
  primaryButtonText: string;
  onPrimaryClick: () => void;
  secondaryText?: string;
  showCompletenessBadge?: boolean;
  completenessPercent?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  greeting,
  subtext,
  cycleBadge,
  statusBadge = 'OCR Engine Active',
  primaryButtonText,
  onPrimaryClick,
  secondaryText,
  showCompletenessBadge = false,
  completenessPercent = 78
}) => {
  return (
    <div
      className="relative w-full rounded-2xl bg-gradient-to-r from-[#5B6EF0] to-[#4557DC] p-5 sm:p-6 text-white overflow-hidden mb-5 shadow-card-soft"
      data-purpose="hero-banner"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-16 right-56 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      {/* Left Text Content */}
      <div className="relative z-10 max-w-[68%]">
        {cycleBadge && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-white bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
              {cycleBadge}
            </span>
            <span className="text-[10px] text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DBE8B] animate-pulse" />
              {statusBadge}
            </span>
          </div>
        )}

        <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-white mb-1">
          {greeting}
        </h1>

        <p className="text-[11.5px] text-indigo-100 font-normal leading-relaxed mb-4 max-w-lg">
          {subtext}
        </p>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onPrimaryClick}
            className="px-4 py-1.5 bg-white text-[#4F63E8] hover:bg-indigo-50 rounded-md text-[11px] font-bold shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            {primaryButtonText}
          </button>

          {showCompletenessBadge ? (
            <div className="h-[30px] px-3 bg-white/20 backdrop-blur-md rounded-md flex items-center gap-2 text-white text-[10.5px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DBE8B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3DBE8B]" />
              </span>
              <span>Application {completenessPercent}% Complete</span>
            </div>
          ) : (
            <span className="text-[9.5px] text-white/90 bg-white/15 px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DBE8B]" />
              {secondaryText || statusBadge}
            </span>
          )}
        </div>
      </div>

      {/* Right Vector Graphic matching Stitch design */}
      <div className="absolute right-0 bottom-0 top-0 w-[38%] flex items-end justify-center pointer-events-none select-none overflow-hidden">
        <div className="absolute -right-4 top-1 w-36 h-36 bg-white/10 rounded-full blur-xl" />
        <div className="absolute right-12 bottom-0 w-28 h-28 bg-indigo-300/20 rounded-full blur-md" />

        <svg
          className="relative z-10 w-48 h-40 max-w-full drop-shadow-md"
          fill="none"
          viewBox="0 0 200 180"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M120 180C120 130 160 100 180 80C160 110 165 150 160 180H120Z"
            fill="#7588FA"
            fillOpacity="0.45"
          />
          <path
            d="M90 180C95 125 130 90 150 70C130 105 130 145 125 180H90Z"
            fill="#8DA0FE"
            fillOpacity="0.35"
          />
          <path
            d="M60 180C70 135 100 105 120 90C100 115 95 150 90 180H60Z"
            fill="#A5B5FE"
            fillOpacity="0.3"
          />
          <ellipse cx="110" cy="175" fill="#3647BA" fillOpacity="0.4" rx="50" ry="6" />
          <rect fill="#FFFFFF" height="65" rx="10" width="34" x="95" y="105" />
          <circle cx="112" cy="78" fill="#F8C19D" r="14" />
          <path
            d="M98 75C98 65 110 63 118 64C126 65 128 72 128 78C128 82 124 85 122 86C122 80 120 74 112 73C104 72 100 78 98 75Z"
            fill="#1F2350"
          />
          <circle cx="123" cy="67" fill="#1F2350" r="7" />
          <path
            d="M96 112L87 95C85 91 88 88 91 90L99 104"
            stroke="#F8C19D"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <path d="M94 135L128 135L133 148L90 148L94 135Z" fill="#DDE2FB" />
          <path d="M94 135L98 116L126 116L128 135Z" fill="#EEF2FF" stroke="#C5CEF8" strokeWidth="1" />
          <circle cx="112" cy="125" fill="#4F63E8" r="2.5" />
        </svg>
      </div>
    </div>
  );
};
