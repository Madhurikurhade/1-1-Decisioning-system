import React, { useState } from 'react';
import { UseCaseState } from '../../types';
import { formatNumberWithCommas } from '../../utils/formatters';
import { THEMES_BY_VENDOR } from '../../data/mockData';
import { Check } from 'lucide-react';

interface Step5Props {
  state: UseCaseState;
  updateState: (updates: Partial<UseCaseState>) => void;
  onBack: () => void;
  onGoToHome?: () => void;
}

export const Step5ReviewConfirm: React.FC<Step5Props> = ({
  state,
  updateState,
  onBack,
  onGoToHome,
}) => {
  const [showLaunchSuccess, setShowLaunchSuccess] = useState(false);

  // Compute Product-Partner Name
  const productPartnerName =
    [
      state.partner,
      state.productL2.join('-'),
      state.productL3.join('-'),
    ]
      .filter(Boolean)
      .join('_') || 'BFL_SOL_S1';

  // COA string
  const getCoaDisplay = (): string => {
    if (state.coaOperator === 'Between') {
      return `Between ${state.coaValue1 || '1'}% to ${state.coaValue2 || '3'}%`;
    }
    if (state.coaOperator === 'Less than') {
      return `lower than ${state.coaValue1 || '2'}%`;
    }
    if (state.coaOperator === 'Is') {
      return `is ${state.coaValue1 || '2'}%`;
    }
    return 'lower than 2%';
  };

  // Timeline
  const timelineDisplay =
    state.startDate && state.endDate
      ? `${state.startDate} to ${state.endDate}`
      : 'DD/MM/YYYY to 30/09/2026';

  // Selected Channels
  const channelsToDisplay =
    state.selectedChannels.length > 0 ? state.selectedChannels : ['WhatsApp', 'RCS', 'SMS'];

  // Weekly amount helper
  const getWeekAmount = (weekNum: number): string => {
    const w = state.weeklyAllocations?.find((item) => item.week === weekNum);
    if (w && w.amount > 0) {
      return formatNumberWithCommas(Math.round(w.amount));
    }
    const total = Number(state.overallBudget) || 40000000;
    return formatNumberWithCommas(Math.round(total / 4));
  };

  // Channel theme list helper
  const getChannelThemeNames = (channel: string): string => {
    const cfg = state.channelConfigs[channel];
    if (cfg && cfg.themes && cfg.themes.length > 0) {
      const allThemes = Object.values(THEMES_BY_VENDOR).flat();
      const themeNames = cfg.themes.map((tid) => {
        const found = allThemes.find((t) => t.id === tid);
        return found ? found.name : tid;
      });
      const uniqueNames = Array.from(new Set(themeNames));
      if (uniqueNames.length > 0) {
        return uniqueNames.join(', ');
      }
    }

    if (channel.toLowerCase().includes('whatsapp')) {
      return 'Account, Aspiration, Commitment / Consistency, Convenience / Ease, Empowerment / Control, Fear / Security, FOMO, Gratitude / Recognition, Loss Aversion';
    }
    if (channel.toLowerCase().includes('rcs')) {
      return 'Promotional, Sample Theme, Account Verification, Festive Flash Nudge';
    }
    if (channel.toLowerCase().includes('sms')) {
      return 'Promotional, Critical Alerts, Payment Reminder';
    }
    return 'Account, Aspiration, Commitment / Consistency, Convenience / Ease';
  };

  // Handle Launch button click
  const handleLaunch = () => {
    updateState({
      status: 'scheduled',
      scheduledDate: state.startDate || '01/10/2026',
    });
    setShowLaunchSuccess(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-body">
      {/* ── Main White Card ────────────────────────────────────────────── */}
      <div className="w-full bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E2DDD5] shadow-xs space-y-6">
        <h2 className="text-[16px] font-bold text-[#1A1816]">Review &amp; Confirm</h2>

        {/* ── Section 1: Objective & Hierarchy Details ──────────────────── */}
        <div className="bg-[#F5F2EB] rounded-[10px] p-5 sm:p-6 space-y-5">
          {/* Row 1: Use Case Name, Product-Partner Name, Timeline, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Use Case Name</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 break-words">
                {state.useCaseName || 'Sample: Unsecured AIP Optimization'}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Product-Partner Name</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 italic font-data">
                {productPartnerName}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Timeline</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 font-data">
                {timelineDisplay}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Duration</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 font-data">
                {state.durationDays > 0 ? `${state.durationDays} Days` : '30 Days'}
              </div>
            </div>
          </div>

          {/* Row 2: Product L1, Partner, Product L2, Product L3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Product L1</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5">
                {state.productL1 || 'Unsecured'}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Partner</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5">
                {state.partner || 'BFL'}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Product L2</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5">
                {state.productL2.length > 0 ? state.productL2.join(', ') : 'SOL'}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Product L3</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5">
                {state.productL3.length > 0 ? state.productL3.join(', ') : 'S1'}
              </div>
            </div>
          </div>

          {/* Row 3: Conversion Metric, Conversion Quantity, COA (4th place left empty blank to keep alignment) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Conversion Metric</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5">
                {state.conversionMetric || 'AIP'}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Conversion Quantity</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 font-data">
                {state.conversionQuantity ? formatNumberWithCommas(state.conversionQuantity) : '10,000'}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">COA</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 italic">
                {getCoaDisplay()}
              </div>
            </div>
            {/* 4th column left blank to maintain alignment */}
            <div />
          </div>
        </div>

        {/* ── Section 2: Budget Details ──────────────────────────────────── */}
        <div className="bg-[#F5F2EB] rounded-[10px] p-5 sm:p-6 space-y-5">
          {/* Overall Budget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Budget</div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Overall</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 font-data">
                {formatNumberWithCommas(state.overallBudget || '60000000')}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Daily Min</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 font-data">
                {formatNumberWithCommas(state.dailyMin || '50000')}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A1816]">Daily Max</div>
              <div className="text-[12.5px] text-[#706B62] mt-1.5 font-data">
                {formatNumberWithCommas(state.dailyMax || '300000')}
              </div>
            </div>
          </div>

          {/* Channel Level Budgets */}
          {channelsToDisplay.map((ch, idx) => {
            const b = state.channelBudgets[ch] || {
              overall: ch === 'WhatsApp' ? '20000000' : '10000000',
              dailyMin: '10000',
              dailyMax: '100000',
            };

            return (
              <div key={ch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  {idx === 0 && <div className="text-[13px] font-bold text-[#1A1816] mb-1.5">Channel</div>}
                  <div className="text-[12.5px] text-[#706B62] capitalize">{ch}</div>
                </div>
                <div>
                  {idx === 0 && <div className="text-[13px] font-bold text-[#1A1816] mb-1.5">Overall</div>}
                  <div className="text-[12.5px] text-[#706B62] font-data">
                    {formatNumberWithCommas(b.overall)}
                  </div>
                </div>
                <div>
                  {idx === 0 && <div className="text-[13px] font-bold text-[#1A1816] mb-1.5">Daily Min</div>}
                  <div className="text-[12.5px] text-[#706B62] font-data">
                    {formatNumberWithCommas(b.dailyMin)}
                  </div>
                </div>
                <div>
                  {idx === 0 && <div className="text-[13px] font-bold text-[#1A1816] mb-1.5">Daily Max</div>}
                  <div className="text-[12.5px] text-[#706B62] font-data">
                    {formatNumberWithCommas(b.dailyMax)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Weekly Budget Allocation */}
          <div className="pt-2">
            <div className="text-[13px] font-bold text-[#1A1816] mb-3">Weekly Budget</div>
            <div className={`grid gap-4 ${
              state.weeklyAllocations.length === 5
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-4'
            }`}>
              {state.weeklyAllocations.map((w) => (
                <div key={w.week}>
                  <div className="text-[13px] font-bold text-[#1A1816]">Week {w.week}</div>
                  <div className="text-[12.5px] text-[#706B62] mt-1.5 font-data">
                    {formatNumberWithCommas(Math.round(w.amount))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 3: Audience Details ────────────────────────────────── */}
        <div className="bg-[#F5F2EB] rounded-[10px] p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-3">
              <div className="text-[13px] font-bold text-[#1A1816] mb-1.5">Audience Query</div>
              <div className="text-[12.5px] text-[#706B62] font-data leading-relaxed break-all">
                Sample SQL Query:{' '}
                {state.sqlQuery ||
                  'SELECT DISTINCT context_id FROM dev.gold_customerfeaturestore WHERE context_id IS NOT NULL;'}
              </div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-[#1A1816] mb-1.5">Audience Count</div>
              <div className="text-[12.5px] text-[#706B62] font-data">
                {state.audienceCount ? state.audienceCount : '6000000000'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Channel & Themes ────────────────────────────────── */}
        <div className="bg-[#F5F2EB] rounded-[10px] p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-[13px] font-bold text-[#1A1816]">Channel</div>
            <div className="md:col-span-3 text-[13px] font-bold text-[#1A1816]">Theme</div>
          </div>

          {channelsToDisplay.map((ch) => (
            <div key={ch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="text-[12.5px] text-[#706B62] capitalize font-medium">{ch}</div>
              <div className="md:col-span-3 text-[12.5px] text-[#706B62] leading-relaxed">
                {getChannelThemeNames(ch)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Actions Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-12">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E5DFD5] text-[#3A3631] hover:bg-[#DCD5C8] transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleLaunch}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E5DFD5] text-[#3A3631] hover:bg-[#DCD5C8] transition-colors cursor-pointer"
        >
          Launch
        </button>
      </div>

      {/* ── Single-Line Launch Success Popup ────────────────────────────── */}
      {showLaunchSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[10px] border border-[#DCD5C8] shadow-xl px-6 py-4 flex items-center justify-between gap-6 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span className="text-[14px] font-medium text-[#1A1816] truncate">
                Use case launched successfully.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowLaunchSuccess(false);
                if (onGoToHome) {
                  onGoToHome();
                }
              }}
              className="px-4 py-1.5 rounded-[6px] text-[13px] font-medium bg-[#E5DFD5] text-[#3A3631] hover:bg-[#DCD5C8] transition-colors cursor-pointer flex-shrink-0"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

