import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DayItem {
  day: string;
  date: number;
  dotColor?: string;
  dotTitle?: string;
}

export const CalendarStrip: React.FC = () => {
  const [activeDate, setActiveDate] = useState<number>(24);

  const days: DayItem[] = [
    { day: 'Mon', date: 22, dotColor: '#3DBE8B', dotTitle: 'Scheduled Inspection' },
    { day: 'Tue', date: 23, dotColor: '#F59A3C', dotTitle: 'Discrepancy Review' },
    { day: 'Wed', date: 24, dotColor: '#FFFFFF', dotTitle: 'Active Day - Today' },
    { day: 'Thu', date: 25, dotColor: 'transparent' },
    { day: 'Fri', date: 26, dotColor: '#F0566A', dotTitle: 'Decision Deadline' }
  ];

  return (
    <div className="mb-5" data-purpose="calendar-widget">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-[#1F2350]">Review Schedule</span>
          <div className="flex items-center text-[#8C91AB] text-[10px] space-x-0.5 ml-0.5">
            <button className="hover:text-[#4F63E8] p-0.5" title="Previous Week">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button className="hover:text-[#4F63E8] p-0.5" title="Next Week">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Month Pill */}
        <button className="text-[10px] font-bold text-[#1F2350] bg-[#F4F5FE] hover:bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
          <Calendar className="w-3 h-3 text-[#8C91AB]" />
          <span>May</span>
        </button>
      </div>

      {/* Calendar Days Row (Mon 22 to Fri 26) */}
      <div className="grid grid-cols-5 gap-1.5 text-center">
        {days.map(item => {
          const isActive = item.date === activeDate;

          return (
            <div
              key={item.date}
              onClick={() => setActiveDate(item.date)}
              className={`py-2 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#4F63E8] text-white shadow-pill-active'
                  : 'hover:bg-gray-50 text-[#1F2350]'
              }`}
            >
              <span
                className={`text-[9px] font-semibold block ${
                  isActive ? 'text-white/80' : 'text-[#8C91AB]'
                }`}
              >
                {item.day}
              </span>
              <span className={`text-[12px] font-bold ${isActive ? 'text-white' : 'text-[#1F2350]'}`}>
                {item.date}
              </span>
              <div
                className="w-1 h-1 rounded-full mx-auto mt-1"
                style={{ backgroundColor: isActive ? '#FFFFFF' : item.dotColor || 'transparent' }}
                title={item.dotTitle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
