import React from 'react';
import { MoreVertical, ArrowUpDown } from 'lucide-react';
import { Application } from '../types';
import { StatusDot } from './StatusDot';

interface DataTableProps {
  applications: Application[];
  selectedAppId: string;
  onSelectRow: (app: Application) => void;
  onViewAll?: () => void;
  onToggleSort?: () => void;
  title?: string;
  viewDetailsClick?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  applications,
  selectedAppId,
  onSelectRow,
  onViewAll,
  onToggleSort,
  title = 'AICTE Validation Progress',
  viewDetailsClick
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card-soft" data-purpose="validation-table-card">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-[13px] font-bold text-[#1F2350] tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          {onToggleSort && (
            <button
              onClick={onToggleSort}
              className="w-6 h-6 flex items-center justify-center rounded text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100 transition-colors cursor-pointer"
              title="Filter & Sort"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          )}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-[10px] font-bold text-[#4F63E8] hover:text-[#4458DC] transition-colors px-1 cursor-pointer"
            >
              View All
            </button>
          )}
        </div>
      </div>

      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="mainValidationTable">
          <thead>
            <tr className="text-[10.5px] font-bold text-[#8C91AB] border-b border-[#F4F5FE]">
              <th className="pb-2.5 pl-3 font-semibold">Institution</th>
              <th className="pb-2.5 font-semibold">Application Type</th>
              <th className="pb-2.5 font-semibold">Documents</th>
              <th className="pb-2.5 font-semibold">AI Confidence</th>
              <th className="pb-2.5 font-semibold">Status</th>
              <th className="pb-2.5 pr-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11.5px] font-medium text-[#1F2350] divide-y divide-[#F7F8FE]">
            {applications.map(row => {
              const isSelected = row.id === selectedAppId;
              const selectedClass = isSelected
                ? 'selected-table-row rounded-md'
                : 'hover:bg-indigo-50/40';

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectRow(row)}
                  className={`transition-all duration-150 cursor-pointer ${selectedClass}`}
                >
                  {/* Institution Name */}
                  <td className="py-2.5 pl-3">
                    <span className="font-bold text-[11.5px] block">{row.institutionName}</span>
                    <span
                      className={`text-[9.5px] ${
                        isSelected ? 'text-white/80' : 'text-[#8C91AB]'
                      } font-normal block`}
                    >
                      {row.applicationNumber}
                    </span>
                  </td>

                  {/* Application Type */}
                  <td className={`py-2.5 ${isSelected ? 'text-white/90' : 'text-[#8C91AB]'} font-medium text-[11px]`}>
                    {row.applicationType}
                  </td>

                  {/* Documents Fraction */}
                  <td className={`py-2.5 ${isSelected ? 'text-white' : 'text-[#1F2350]'} font-semibold text-[11px]`}>
                    {row.documentCounts.uploaded}/{row.documentCounts.totalRequired}
                  </td>

                  {/* AI Confidence */}
                  <td className="py-2.5">
                    <span
                      className={`font-bold text-[11px] ${
                        isSelected ? 'text-white' : 'text-[#4F63E8]'
                      }`}
                    >
                      {row.overallConfidence}%
                    </span>
                  </td>

                  {/* Status with Colored Dot */}
                  <td className="py-2.5">
                    <StatusDot
                      status={row.status}
                      isInverseWhite={isSelected}
                      showText={true}
                    />
                  </td>

                  {/* Actions Icon */}
                  <td className="py-2.5 pr-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectRow(row);
                      }}
                      className="p-1 hover:opacity-80 cursor-pointer"
                    >
                      <MoreVertical
                        className={`w-3.5 h-3.5 inline ${
                          isSelected ? 'text-white' : 'text-[#8C91AB]'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="mt-3.5 pt-2 border-t border-[#F4F5FE] flex items-center justify-between text-[9.5px] text-[#8C91AB]">
        <span>* AI recommendations are automated decision support. Final authority rests with AICTE Committee.</span>
        {viewDetailsClick && (
          <span
            onClick={viewDetailsClick}
            className="text-[#4F63E8] font-semibold cursor-pointer hover:underline"
          >
            View Detailed Evaluation →
          </span>
        )}
      </div>
    </div>
  );
};
