import React from 'react';
import { Check, Sparkles, UserCheck, Award, Cpu, FileText } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  subtitle?: string;
  timestamp?: string;
  completed?: boolean;
  current?: boolean;
}

interface StepperProps {
  currentStage?: string;
  steps?: StepItem[];
  subtitleSubmitted?: string;
  subtitleProcessing?: string;
  subtitleValidation?: string;
  subtitleOfficer?: string;
  subtitleDecision?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStage = 'Validation',
  steps: customSteps,
  subtitleSubmitted = '14 Oct 2026',
  subtitleProcessing = 'OCR Ingested',
  subtitleValidation = 'Rules Run',
  subtitleOfficer = 'Under Scrutiny',
  subtitleDecision = 'Pending Hearing'
}) => {
  // Canonical 5-stage statutory workflow:
  // Submitted → Processing → Validation → Officer Review → Decision
  const defaultSteps: (StepItem & { icon: any })[] = [
    {
      id: 'Submitted',
      label: 'Submitted',
      subtitle: subtitleSubmitted,
      icon: Check
    },
    {
      id: 'Processing',
      label: 'Processing',
      subtitle: subtitleProcessing,
      icon: Cpu
    },
    {
      id: 'Validation',
      label: 'Validation',
      subtitle: subtitleValidation,
      icon: Sparkles
    },
    {
      id: 'Officer Review',
      label: 'Officer Review',
      subtitle: subtitleOfficer,
      icon: UserCheck
    },
    {
      id: 'Decision',
      label: 'Decision',
      subtitle: subtitleDecision,
      icon: Award
    }
  ];

  const getStageIndex = (stage: string) => {
    const s = (stage || '').toLowerCase();
    if (s.includes('draft') || s === 'submitted') return 0;
    if (s.includes('processing') || s.includes('ingestion') || s.includes('ocr')) return 1;
    if (s.includes('validation') || s.includes('ai validation') || s.includes('in_validation')) return 2;
    if (s.includes('officer') || s.includes('review') || s.includes('clarification') || s.includes('inspection')) return 3;
    if (s.includes('decision') || s.includes('approved') || s.includes('rejected')) return 4;
    return 2;
  };

  const activeIndex = getStageIndex(currentStage);
  const displaySteps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;
  const totalCount = displaySteps.length;

  return (
    <div className="relative pt-2 pb-1">
      <div
        className="grid items-start relative"
        style={{ gridTemplateColumns: `repeat(${totalCount}, minmax(0, 1fr))` }}
      >
        {/* Connecting Track Behind */}
        <div
          className="absolute top-4 h-0.5 bg-[#ECEEFF] -z-0 transition-all"
          style={{
            left: `${100 / (totalCount * 2)}%`,
            right: `${100 / (totalCount * 2)}%`,
          }}
        >
          <div
            className="h-full bg-[#4F63E8] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, (activeIndex / (totalCount - 1)) * 100))}%` }}
          />
        </div>

        {displaySteps.map((step, idx) => {
          const isPassed = step.completed !== undefined ? step.completed : idx < activeIndex;
          const isCurrent = step.current !== undefined ? step.current : idx === activeIndex;
          const IconComponent = (step as any).icon || (idx === 0 ? Check : idx === 1 ? Cpu : idx === 2 ? Sparkles : idx === 3 ? UserCheck : Award);

          return (
            <div key={step.id} className="flex flex-col items-center text-center z-10 px-1">
              {isPassed ? (
                <div className="w-8 h-8 rounded-full bg-[#3DBE8B] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
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
                className={`text-[11.5px] mt-2 font-bold ${
                  isCurrent ? 'text-[#4F63E8]' : isPassed ? 'text-[#1F2350]' : 'text-[#8C91AB]'
                }`}
              >
                {step.label}
              </span>

              <span
                className={`text-[10px] mt-0.5 truncate max-w-[110px] ${
                  isCurrent ? 'text-[#F59A3C] font-semibold' : 'text-[#8C91AB]'
                }`}
              >
                {step.subtitle || (step as any).timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
