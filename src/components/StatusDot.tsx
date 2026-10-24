import React from 'react';
import { ValidationStatus } from '../types';

interface StatusDotProps {
  status: ValidationStatus;
  showText?: boolean;
  className?: string;
  isInverseWhite?: boolean;
}

export const getStatusColor = (status: ValidationStatus): string => {
  switch (status) {
    case 'Passed':
      return '#3DBE8B'; // status-green
    case 'Mismatch':
      return '#F59A3C'; // status-orange
    case 'Missing':
    case 'Expired':
      return '#F0566A'; // status-red
    case 'Suspicious':
      return '#4F63E8'; // primary-blue / purple
    case 'Needs Manual Review':
      return '#5FD0C0'; // status-teal
    case 'Ready for Decision':
      return '#3DBE8B'; // green
    case 'Verification Unavailable':
    default:
      return '#8C91AB'; // text-muted
  }
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  showText = true,
  className = '',
  isInverseWhite = false
}) => {
  const dotColor = isInverseWhite ? '#FFFFFF' : getStatusColor(status);

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium text-[11px] ${className}`}>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      {showText && <span className={isInverseWhite ? 'text-white' : 'text-[#1F2350]'}>{status}</span>}
    </span>
  );
};
