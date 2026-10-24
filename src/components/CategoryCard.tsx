import React from 'react';

interface CategoryCardProps {
  title: string;
  countText: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
  statusDotColor?: string;
  isActive?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  countText,
  icon,
  gradient,
  onClick,
  statusDotColor,
  isActive = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3 flex flex-col items-center text-center cursor-pointer border transition-all duration-200 hover:-translate-y-0.5 shadow-card-soft ${
        isActive
          ? 'border-[#4F63E8] ring-2 ring-[#4F63E8]/20'
          : 'border-transparent hover:border-indigo-100 hover:shadow-md'
      }`}
    >
      <div className="relative mb-2">
        <div
          className={`w-9 h-9 rounded-lg ${gradient} flex items-center justify-center text-white shadow-sm`}
        >
          {icon}
        </div>
        {statusDotColor && (
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: statusDotColor }}
          />
        )}
      </div>
      <span className="text-[11px] font-bold text-[#1F2350] leading-tight block truncate w-full">
        {title}
      </span>
      <span className="text-[9.5px] font-medium text-[#8C91AB] mt-0.5 block">
        {countText}
      </span>
    </div>
  );
};
