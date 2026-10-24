import React from 'react';
import { Check, Sparkles, UserCheck, Award } from 'lucide-react';

interface StepperProps {
  currentStage: 'Submitted' | 'AI Validation' | 'Officer Review' | 'Final Decision';
  subtitleSubmitted?: string;
  subtitleAi?: string;
  subtitleOfficer?: string;
  subtitleDecision?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStage,
  subtitleSubmitted = '14 Oct 2026',
  subtitleAi = 'In Progress (3 Flagged)',
  subtitleOfficer = 'Pending AI Fixes',
  subtitleDecision = 'Scheduled 15 Nov'
}) => {
  const steps = [
    {
      id: 'Submitted',
      label: 'Submitted',
      subtitle: subtitleSubmitted,
      icon: Check
    },
    {
      id: 'AI Validation',
      label: 'AI Validation',
      subtitle: subtitleAi,
      icon: Sparkles
    },
    {
      id: 'Officer Review',
      label: 'Officer Review',
      subtitle: subtitleOfficer,
      icon: UserCheck
    },
    {
      id: 'Final Decision',
      label: 'Final Decision',
      subtitle: subtitleDecision,
      icon: Award
    }
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'Submitted':
        return 0;
      case 'AI Validation':
        return 1;
      case 'Officer Review':
        return 2;
      case 'Final Decision':
        return 3;
      default:
        return 1;
    }
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="relative pt-2 pb-1">
      <div className="grid grid-cols-4 items-start relative">
        {/* Connecting Track Behind */}
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-[#ECEEFF] -z-0">
          <div
            className="h-full bg-[#4F63E8] transition-all duration-500"
            style={{ width: `${(activeIndex / 3) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const IconComponent = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center text-center z-10 px-1">
              {isPassed ? (
                <div className="w-8 h-8 rounded-full bg-[#4F63E8] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              ) : isCurrent ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute w-8 h-8 rounded-full bg-[#4F63E8] opacity-30" />
                  <div className="w-8 h-8 rounded-full bg-[#4F63E8] text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-white">
                    <IconComponent className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#ECEEFF] text-[#8C91AB] flex items-center justify-center font-bold text-xs ring-4 ring-white">
                  <IconComponent className="w-4 h-4" />
                </div>
              )}

              <span
                className={`text-[12px] mt-2 font-bold ${
                  isCurrent ? 'text-[#4F63E8]' : isPassed ? 'text-[#1F2350]' : 'text-[#8C91AB]'
                }`}
              >
                {step.label}
              </span>
              <span
                className={`text-[10px] mt-0.5 ${
                  isCurrent ? 'text-[#F59A3C] font-semibold' : 'text-[#8C91AB]'
                }`}
              >
                {step.subtitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
