import React from 'react';
import { UseCaseRecord } from '../../types';
import { ArrowLeft, BarChart2, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/formatters';

interface DecisionInsightPlaceholderProps {
  useCase: UseCaseRecord;
  onBackToHome: () => void;
}

export const DecisionInsightPlaceholder: React.FC<DecisionInsightPlaceholderProps> = ({
  useCase,
  onBackToHome,
}) => {
  return (
    <div className="w-full max-w-[1240px] mx-auto py-4 animate-in fade-in duration-200 font-body">
      {/* Top back navigation */}
      <div className="flex items-center justify-between pb-6">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#706B62] hover:text-[#1A1816] transition-colors cursor-pointer bg-white px-3.5 py-1.5 rounded-[8px] border border-[#D9D4CB]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Use Case Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#706B62]">Status:</span>
          <span
            className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
              useCase.lifecycleStatus === 'Active'
                ? 'bg-[#FF5C35]/15 text-[#FF5C35]'
                : useCase.lifecycleStatus === 'Scheduled'
                ? 'bg-blue-50 text-blue-600'
                : useCase.lifecycleStatus === 'Completed'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {useCase.lifecycleStatus}
          </span>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-[12px] border border-[#E2DDD5] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-[#706B62] text-[12.5px] font-medium mb-1">
            <BarChart2 className="w-4 h-4 text-[#FF5C35]" />
            <span>Decision / Insight Experience</span>
          </div>
          <h1 className="font-serif-title text-[28px] sm:text-[32px] text-[#1A1816] leading-tight">
            {useCase.useCaseName}
          </h1>
          <p className="text-[13px] text-[#706B62] mt-1.5 font-data">
            Created: {useCase.createdDateFormatted} · Goal: {useCase.goal} · Progress:{' '}
            <span className="font-bold text-[#16A34A]">{useCase.progressStatus}</span>
          </p>
        </div>

        {/* Notice banner */}
        <div className="flex items-start gap-3 p-4 bg-[#F8F6F2] rounded-[8px] border border-[#E5E0D7] text-[13px] text-[#555047] leading-relaxed">
          <AlertCircle className="w-5 h-5 text-[#FF5C35] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#1A1816] block mb-0.5">
              Post-Launch Analytical Telemetry
            </span>
            <span>
              This is the dedicated post-launch Decision / Insight module. Configuration is locked while active execution runs. Real-time funnel telemetry, attribution modeling, and vendor optimizations will be rendered here.
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-[10px] bg-[#FAF8F5] border border-[#E8E3DA]">
            <div className="flex items-center justify-between text-[#706B62] text-[12px] mb-2">
              <span>Goal Achievement ({useCase.goal})</span>
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="text-[22px] font-bold font-data text-[#1A1816]">
              {useCase.goalAchievedPercent}%
            </div>
            <div className="mt-2 w-full h-2 rounded-full overflow-hidden flex bg-[#DC2626]/20">
              <div
                className="bg-[#16A34A] h-full"
                style={{ width: `${useCase.goalAchievedPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-[#706B62] mt-1.5 block">
              Achieved vs Remaining
            </span>
          </div>

          <div className="p-4 rounded-[10px] bg-[#FAF8F5] border border-[#E8E3DA]">
            <div className="flex items-center justify-between text-[#706B62] text-[12px] mb-2">
              <span>Budget Spent</span>
              <DollarSign className="w-4 h-4 text-[#FF5C35]" />
            </div>
            <div className="text-[22px] font-bold font-data text-[#1A1816]">
              {useCase.budgetSpentPercent}%
            </div>
            <div className="mt-2 w-full h-2 rounded-full overflow-hidden flex bg-[#DC2626]/20">
              <div
                className="bg-[#16A34A] h-full"
                style={{ width: `${useCase.budgetSpentPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-[#706B62] mt-1.5 block font-data">
              Total Budget: {formatIndianCurrency(useCase.config.overallBudget)}
            </span>
          </div>

          <div className="p-4 rounded-[10px] bg-[#FAF8F5] border border-[#E8E3DA]">
            <div className="flex items-center justify-between text-[#706B62] text-[12px] mb-2">
              <span>Audience Reach</span>
              <Users className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-[22px] font-bold font-data text-[#1A1816]">
              {useCase.config.audienceCount?.toLocaleString('en-IN') || '50,000'}
            </div>
            <span className="text-[11px] text-[#706B62] mt-3.5 block">
              Active across {useCase.config.selectedChannels.length || 3} channels ({useCase.config.selectedChannels.join(', ')})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
