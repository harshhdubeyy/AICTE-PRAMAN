import React from 'react';
import { CheckCircle2, FileX2, GitCompare, CalendarX2, Flag } from 'lucide-react';
import { ValidationStatus } from '../types';

interface StatCardProps {
  type: 'Passed' | 'Missing' | 'Mismatch' | 'Expired' | 'Suspicious';
  count: number;
  label?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  type,
  count,
  label,
  onClick,
  isSelected
}) => {
  const formattedCount = count < 10 ? `0${count}` : `${count}`;

  const getStyle = () => {
    switch (type) {
      case 'Passed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#3DBE8B]" />,
          bg: 'bg-[#EBF7F3]',
          textColor: 'text-[#1F2350]',
          countColor: 'text-[#1F2350]'
        };
      case 'Missing':
        return {
          icon: <FileX2 className="w-4 h-4 text-[#F0566A]" />,
          bg: 'bg-[#FEEBED]',
          textColor: 'text-[#F0566A]',
          countColor: 'text-[#F0566A]'
        };
      case 'Mismatch':
        return {
          icon: <GitCompare className="w-4 h-4 text-[#F59A3C]" />,
          bg: 'bg-[#FFF5EB]',
          textColor: 'text-[#F59A3C]',
          countColor: 'text-[#F59A3C]'
        };
      case 'Expired':
        return {
          icon: <CalendarX2 className="w-4 h-4 text-[#F0566A]" />,
          bg: 'bg-[#FFF1F0]',
          textColor: 'text-[#F0566A]',
          countColor: 'text-[#F0566A]'
        };
      case 'Suspicious':
      default:
        return {
          icon: <Flag className="w-4 h-4 text-[#4F63E8]" />,
          bg: 'bg-[#F3F0FF]',
          textColor: 'text-[#4F63E8]',
          countColor: 'text-[#4F63E8]'
        };
    }
  };

  const config = getStyle();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3.5 shadow-card-soft flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border ${
        isSelected ? 'border-[#4F63E8] ring-2 ring-[#4F63E8]/20' : 'border-transparent'
      }`}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB]">
          {label || type}
        </p>
        <h3 className={`text-xl font-extrabold ${config.countColor} mt-0.5`}>
          {formattedCount}
        </h3>
      </div>
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center font-bold shrink-0`}>
        {config.icon}
      </div>
    </div>
  );
};
