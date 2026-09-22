import React from 'react';
import { UseCaseRecord } from '../../types';
import { X, Calendar, Target, DollarSign, Users, Megaphone } from 'lucide-react';
import { formatIndianCurrency, formatNumberWithCommas } from '../../utils/formatters';

interface ViewUseCaseModalProps {
  useCase: UseCaseRecord;
  onClose: () => void;
  onEdit: () => void;
}

export const ViewUseCaseModal: React.FC<ViewUseCaseModalProps> = ({
  useCase,
  onClose,
  onEdit,
}) => {
  const { config } = useCase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-body">
      <div className="bg-white rounded-[12px] border border-[#D5D0C7] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DD] bg-[#FAF8F5]">
          <div>
            <span className="text-[11px] font-bold text-[#FF5C35] uppercase tracking-wider block">
              {useCase.lifecycleStatus} Use Case
            </span>
            <h2 className="text-[16px] font-bold text-[#1A1816] mt-0.5 line-clamp-1">
              {useCase.useCaseName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[#706B62] hover:text-[#1A1816] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-[13px] text-[#3A3631]">
          {/* Section 1: Objective */}
          <div className="p-4 rounded-[8px] bg-[#F8F6F2] border border-[#E5E0D7] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#1A1816]">
              <Target className="w-4 h-4 text-[#FF5C35]" />
              <span>Objective</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px] pt-1">
              <div>
                <span className="text-[#706B62] block">Product / Partner</span>
                <span className="font-semibold text-[#1A1816]">
                  {config.productL1 || 'Unsecured'} ({config.partner || 'BFL'})
                </span>
              </div>
              <div>
                <span className="text-[#706B62] block">Goal</span>
                <span className="font-semibold text-[#1A1816]">{config.conversionMetric}</span>
              </div>
              <div>
                <span className="text-[#706B62] block">Quantity</span>
                <span className="font-semibold text-[#1A1816] font-data">
                  {formatNumberWithCommas(config.conversionQuantity)}
                </span>
              </div>
              <div>
                <span className="text-[#706B62] block">COA Rule</span>
                <span className="font-semibold text-[#1A1816]">
                  {config.coaOperator} {config.coaValue1}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Budget & Schedule */}
          <div className="p-4 rounded-[8px] bg-[#F8F6F2] border border-[#E5E0D7] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#1A1816]">
              <Calendar className="w-4 h-4 text-[#FF5C35]" />
              <span>Budget & Schedule</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12.5px] pt-1">
              <div>
                <span className="text-[#706B62] block">Duration</span>
                <span className="font-semibold text-[#1A1816]">
                  {config.startDate} to {config.endDate} ({config.durationDays} days)
                </span>
              </div>
              <div>
                <span className="text-[#706B62] block">Overall Budget</span>
                <span className="font-semibold text-[#1A1816] font-data">
                  {formatIndianCurrency(config.overallBudget)}
                </span>
              </div>
              <div>
                <span className="text-[#706B62] block">Channels</span>
                <span className="font-semibold text-[#1A1816]">
                  {config.selectedChannels?.join(', ') || 'WhatsApp, RCS, SMS'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Audience & Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-[8px] bg-[#F8F6F2] border border-[#E5E0D7] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1A1816]">
                <Users className="w-4 h-4 text-[#FF5C35]" />
                <span>Audience</span>
              </div>
              <div className="text-[12.5px]">
                <span className="text-[#706B62] block">Audience Count</span>
                <span className="text-[15px] font-bold text-[#1A1816] font-data">
                  {config.audienceCount?.toLocaleString('en-IN') || '50,000'} users
                </span>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F6F2] border border-[#E5E0D7] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1A1816]">
                <Megaphone className="w-4 h-4 text-[#FF5C35]" />
                <span>Content & Vendors</span>
              </div>
              <div className="text-[12.5px]">
                <span className="text-[#706B62] block">Active Channels</span>
                <span className="font-semibold text-[#1A1816]">
                  {Object.keys(config.channelConfigs || {}).join(', ') || 'WhatsApp, RCS, SMS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E8E4DD] bg-[#FAF8F5]">
          <span className="text-[12px] text-[#706B62] font-data">
            Created: {useCase.createdDateFormatted}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-[6px] text-[13px] font-medium text-[#3A3631] bg-[#E5DFD5] hover:bg-[#DCD5C8] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="px-4 py-1.5 rounded-[6px] text-[13px] font-medium text-white bg-[#FF5C35] hover:bg-[#E04823] transition-colors cursor-pointer"
            >
              Edit Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
