import React from 'react';

interface ConfidenceRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  score,
  size = 36,
  strokeWidth = 3.5,
  label,
  subLabel = 'AI Confidence'
}) => {
  const radius = 15.9155;
  const circumference = 100;
  const strokeDasharray = `${Math.min(100, Math.max(0, score))}, ${circumference}`;

  return (
    <div className="flex items-center gap-2 shrink-0 bg-[#F8F9FE] px-2.5 py-1.5 rounded-lg border border-indigo-50">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" viewBox="0 0 36 36" style={{ width: size, height: size }}>
          <path
            className="text-[#E8EAF5]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <path
            className="text-[#4F63E8]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
        <span className="absolute text-[9px] font-extrabold text-[#4F63E8]">{score}%</span>
      </div>
      <div className="leading-none text-left">
        <span className="text-[10.5px] font-bold text-[#1F2350] block">{label || `${score}%`}</span>
        <span className="text-[8px] text-[#8C91AB] font-medium">{subLabel}</span>
      </div>
    </div>
  );
};
