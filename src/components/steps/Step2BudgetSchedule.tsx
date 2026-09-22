import React, { useState, useEffect, useMemo } from 'react';
import { UseCaseState, ChannelBudget, WeeklyAllocation } from '../../types';
import { CHANNELS_AVAILABLE } from '../../data/mockData';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { CalendarPicker } from '../CalendarPicker';
import {
  formatIndianCurrency,
  parseRawNumber,
  parseDDMMYYYY,
  calculateDurationDays,
  calculateNumWeeks,
  generateWeeklyAllocations,
} from '../../utils/formatters';
import { AlertCircle } from 'lucide-react';

interface Step2Props {
  state: UseCaseState;
  updateState: (updates: Partial<UseCaseState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2BudgetSchedule: React.FC<Step2Props> = ({
  state,
  updateState,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [constraintNotice, setConstraintNotice] = useState<string | null>(null);

  // Recalculate duration and number of weeks whenever dates change
  useEffect(() => {
    if (state.startDate && state.endDate) {
      const days = calculateDurationDays(state.startDate, state.endDate);
      const numWeeks = calculateNumWeeks(days);
      const updates: Partial<UseCaseState> = {};

      if (days !== state.durationDays) {
        updates.durationDays = days;
      }

      // If number of weeks changed or uninitialized, regenerate weekly allocations
      if (state.weeklyAllocations.length !== numWeeks) {
        updates.weeklyAllocations = generateWeeklyAllocations(numWeeks, state.overallBudget);
      }

      if (Object.keys(updates).length > 0) {
        updateState(updates);
      }
    }
  }, [state.startDate, state.endDate]);

  // Update weekly amount calculations when overall budget changes
  useEffect(() => {
    const overallNum = parseRawNumber(state.overallBudget);
    const updated = state.weeklyAllocations.map((w) => ({
      ...w,
      amount: (overallNum * (parseFloat(w.percent) || 0)) / 100,
    }));
    updateState({ weeklyAllocations: updated });
  }, [state.overallBudget]);

  // Calculate sum of weekly percentages (rounded to 1 decimal)
  const totalWeeklyPercent = useMemo(() => {
    const sum = state.weeklyAllocations.reduce((acc, w) => acc + (parseFloat(w.percent) || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [state.weeklyAllocations]);

  const remainingPercent = useMemo(() => {
    return Math.round((100 - totalWeeklyPercent) * 10) / 10;
  }, [totalWeeklyPercent]);

  // Date validation helper
  const validateDates = (): string | null => {
    if (!state.startDate) return 'Start date is required';
    if (!state.endDate) return 'End date is required';

    const start = parseDDMMYYYY(state.startDate);
    const end = parseDDMMYYYY(state.endDate);

    if (!start) return 'Start date must be in DD/MM/YYYY format';
    if (!end) return 'End date must be in DD/MM/YYYY format';

    // Must be a future date (or today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Month-End Rule: End date MUST be the last day of its month (30th or 31st, or 28/29)
    const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    if (end.getDate() !== lastDayOfMonth) {
      return 'You cannot change this because of constraints.';
    }

    // In Edit mode: Timeline can only be increased (extended)
    if (state.isEditMode && state.originalEndDate) {
      const origEnd = parseDDMMYYYY(state.originalEndDate);
      if (origEnd && end.getTime() < origEnd.getTime()) {
        return 'You cannot change this because of constraints.';
      }
    }

    // End date must be at least 2 days after start date
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 2) {
      return 'You cannot change this because of constraints.';
    }

    return null;
  };

  // Memoized date objects for calendar limits
  const parsedStartDate = useMemo(() => parseDDMMYYYY(state.startDate), [state.startDate]);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const endDateLimits = useMemo(() => {
    if (!parsedStartDate) return { min: undefined, max: undefined, lock: undefined };
    
    // In edit mode: min date is original end date so timeline can only be increased
    let min = new Date(parsedStartDate);
    min.setDate(min.getDate() + 2);

    if (state.isEditMode && state.originalEndDate) {
      const origEnd = parseDDMMYYYY(state.originalEndDate);
      if (origEnd && origEnd > min) {
        min = origEnd;
      }
    }

    return {
      min,
      max: undefined, // allow increasing forward across months
      lock: undefined, // allow navigating forward to future months
    };
  }, [parsedStartDate, state.isEditMode, state.originalEndDate]);

  // Handle Timeline changes
  const handleStartDateChange = (val: string) => {
    const newStart = parseDDMMYYYY(val);
    const updates: Partial<UseCaseState> = { startDate: val };

    if (newStart) {
      const endMonthEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
      const currentEnd = parseDDMMYYYY(state.endDate);

      // If end date is missing or earlier than start + 2 days, set to month end
      if (
        !currentEnd ||
        currentEnd.getTime() < newStart.getTime() + 2 * 86400000
      ) {
        const dStr = String(endMonthEnd.getDate()).padStart(2, '0');
        const mStr = String(endMonthEnd.getMonth() + 1).padStart(2, '0');
        updates.endDate = `${dStr}/${mStr}/${endMonthEnd.getFullYear()}`;
      }
    }

    updateState(updates);
    if (errors.timeline) setErrors((prev) => ({ ...prev, timeline: '' }));
  };

  const handleEndDateChange = (val: string) => {
    updateState({ endDate: val });
    setConstraintNotice(null);
    if (errors.timeline) setErrors((prev) => ({ ...prev, timeline: '' }));
  };

  // Handle Overall Budget Changes
  const handleOverallBudgetChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    updateState({ overallBudget: raw });
    if (errors.overallBudget) setErrors((prev) => ({ ...prev, overallBudget: '' }));
  };

  const handleDailyMinChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    updateState({ dailyMin: raw });
    if (errors.dailyBudget) setErrors((prev) => ({ ...prev, dailyBudget: '' }));
  };

  const handleDailyMaxChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    updateState({ dailyMax: raw });
    if (errors.dailyBudget) setErrors((prev) => ({ ...prev, dailyBudget: '' }));
  };

  // Handle Channel Selection
  const handleChannelSelect = (channels: string[]) => {
    // Initialise budget for new channels, preserve existing
    const newBudgets = { ...state.channelBudgets };
    channels.forEach((ch) => {
      if (!newBudgets[ch]) {
        newBudgets[ch] = {
          overall: '20000000',
          dailyMin: '100000',
          dailyMax: '10000000',
        };
      }
    });

    // Remove unselected channel budgets
    Object.keys(newBudgets).forEach((ch) => {
      if (!channels.includes(ch)) {
        delete newBudgets[ch];
      }
    });

    updateState({
      selectedChannels: channels,
      channelBudgets: newBudgets,
    });
    if (errors.channels) setErrors((prev) => ({ ...prev, channels: '' }));
  };

  // Handle Channel-Level Budget Changes
  const handleChannelBudgetField = (
    channel: string,
    field: keyof ChannelBudget,
    val: string
  ) => {
    const raw = val.replace(/[^0-9]/g, '');
    const current = state.channelBudgets[channel] || { overall: '0', dailyMin: '0', dailyMax: '0' };
    const updated = {
      ...state.channelBudgets,
      [channel]: {
        ...current,
        [field]: raw,
      },
    };
    updateState({ channelBudgets: updated });
  };

  // Handle Weekly percentage changes
  const handleWeeklyPercentChange = (weekIndex: number, newPercentStr: string) => {
    const clean = newPercentStr.replace(/[^0-9.]/g, '');
    const overallNum = parseRawNumber(state.overallBudget);
    const updated = [...state.weeklyAllocations];
    const pct = parseFloat(clean) || 0;
    updated[weekIndex] = {
      ...updated[weekIndex],
      percent: clean,
      amount: (overallNum * pct) / 100,
    };
    updateState({ weeklyAllocations: updated });
    if (errors.weekly) setErrors((prev) => ({ ...prev, weekly: '' }));
  };

  // Channel Budget Validation totals
  const channelSums = useMemo(() => {
    let overallSum = 0;
    let dailyMinSum = 0;
    let dailyMaxSum = 0;

    state.selectedChannels.forEach((ch) => {
      const b = state.channelBudgets[ch];
      if (b) {
        overallSum += parseRawNumber(b.overall);
        dailyMinSum += parseRawNumber(b.dailyMin);
        dailyMaxSum += parseRawNumber(b.dailyMax);
      }
    });

    return { overallSum, dailyMinSum, dailyMaxSum };
  }, [state.selectedChannels, state.channelBudgets]);

  const overallBudgetNum = parseRawNumber(state.overallBudget);
  const overallDailyMinNum = parseRawNumber(state.dailyMin);
  const overallDailyMaxNum = parseRawNumber(state.dailyMax);

  // Validate Step 2 before proceeding
  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    // 1. Timeline validation
    const timelineErr = validateDates();
    if (timelineErr) newErrors.timeline = timelineErr;

    // 2. Overall budget validation
    if (!overallBudgetNum || overallBudgetNum <= 0) {
      newErrors.overallBudget = 'Please enter a valid Overall Budget';
    }
    if (overallDailyMinNum > overallDailyMaxNum) {
      newErrors.dailyBudget = 'Daily Min cannot exceed Daily Max';
    }

    // 3. Channels validation
    if (state.selectedChannels.length === 0) {
      newErrors.channels = 'Please select at least one channel';
    }

    // 4. Channel budget sums validation
    if (channelSums.overallSum > overallBudgetNum) {
      newErrors.channelTotals = `Sum of Channel Overall (${formatIndianCurrency(
        channelSums.overallSum
      )}) exceeds Overall Budget (${formatIndianCurrency(overallBudgetNum)})`;
    }
    if (channelSums.dailyMinSum > overallDailyMinNum) {
      newErrors.channelTotals = `Sum of Channel Daily Min (${formatIndianCurrency(
        channelSums.dailyMinSum
      )}) exceeds Overall Daily Min (${formatIndianCurrency(overallDailyMinNum)})`;
    }
    if (channelSums.dailyMaxSum > overallDailyMaxNum) {
      newErrors.channelTotals = `Sum of Channel Daily Max (${formatIndianCurrency(
        channelSums.dailyMaxSum
      )}) exceeds Overall Daily Max (${formatIndianCurrency(overallDailyMaxNum)})`;
    }

    // Individual channel validation
    state.selectedChannels.forEach((ch) => {
      const b = state.channelBudgets[ch];
      if (b && parseRawNumber(b.dailyMin) > parseRawNumber(b.dailyMax)) {
        newErrors.channelTotals = `${ch} Daily Min cannot exceed Daily Max`;
      }
    });

    // 5. Weekly allocations validation (must total 100%, every week > 0)
    for (const w of state.weeklyAllocations) {
      const p = parseFloat(w.percent);
      if (isNaN(p) || p <= 0) {
        newErrors.weekly = `Week ${w.week} allocation must be greater than 0%`;
        break;
      }
    }

    if (!newErrors.weekly && Math.abs(totalWeeklyPercent - 100) > 0.1) {
      newErrors.weekly = `Total weekly allocation must equal 100% (currently ${totalWeeklyPercent}%)`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-body">
      {/* ── The White Form Card Container ─────────────────────────────────── */}
      <div className="w-full bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E2DDD5] shadow-xs space-y-9">
        {/* ── Section 1: Timeline ───────────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-[15px] font-bold text-[#1A1816] tracking-tight">Timeline</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Start Date */}
            <div
              className="flex flex-col"
              onClick={() => {
                if (state.isEditMode) {
                  setConstraintNotice('You cannot change this because of constraints.');
                }
              }}
            >
              <CalendarPicker
                label="Start Date"
                required
                value={state.startDate}
                onChange={handleStartDateChange}
                minDate={todayDate}
                disabled={Boolean(state.isEditMode)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <CalendarPicker
                label="End Date"
                required
                value={state.endDate}
                onChange={handleEndDateChange}
                minDate={endDateLimits.min}
                maxDate={endDateLimits.max}
                lockToMonthYear={endDateLimits.lock}
                onlyMonthEnd={true}
                disabled={!state.startDate}
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* Duration (Read-only, auto calculated) */}
            <div className="flex flex-col justify-end">
              <label className="text-[13px] font-medium text-[#1A1816] mb-1.5">
                <span>Duration</span>
              </label>
              <input
                type="text"
                readOnly
                value={state.durationDays > 0 ? `${state.durationDays} days` : '—'}
                className="w-full h-[42px] px-3.5 bg-[#F7F5F2] border border-[#DCD5C8] rounded-[8px] text-[14px] font-data font-medium text-[#1A1816] outline-none cursor-default"
              />
            </div>
          </div>

          {(errors.timeline || constraintNotice) && (
            <div className="flex items-center gap-1.5 text-[12.5px] text-[#DC2626] font-medium mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.timeline || constraintNotice}</span>
            </div>
          )}
        </div>

      {/* ── Section 2: Budget ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-bold text-[#1A1816] tracking-tight">Budget</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Overall */}
          <div className="flex flex-col">
            <label className="text-[13px] font-medium text-[#1A1816] mb-1.5 flex items-center gap-1">
              <span>Overall</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={state.overallBudget ? formatIndianCurrency(state.overallBudget, false) : ''}
                onChange={(e) => handleOverallBudgetChange(e.target.value)}
                placeholder="4,00,00,000"
                className="w-full h-[42px] pl-7 pr-3 bg-white border border-[#DCD5C8] rounded-[8px] text-[14px] font-data font-medium text-[#1A1816] outline-none hover:border-[#807A70] focus:border-[#1A1816]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#807A70] font-data">
                ₹
              </span>
            </div>
            {/* Small orange line + spent metric in Edit Mode */}
            {state.isEditMode && (
              <div className="flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-150">
                <span className="w-3 h-[2px] bg-[#FF5C35] rounded-full shrink-0" />
                <span className="text-[12px] font-medium text-[#C2410C]">
                  ₹{state.alreadySpentBudget || '10,00,000'} already spent
                </span>
              </div>
            )}
            {errors.overallBudget && (
              <span className="text-[11px] text-[#DC2626] mt-1 font-medium">{errors.overallBudget}</span>
            )}
          </div>

          {/* Daily Min */}
          <div className="flex flex-col">
            <label className="text-[13px] font-medium text-[#1A1816] mb-1.5">
              <span>Daily Min</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={state.dailyMin ? formatIndianCurrency(state.dailyMin, false) : ''}
                onChange={(e) => handleDailyMinChange(e.target.value)}
                placeholder="4,00,000"
                className="w-full h-[42px] pl-7 pr-3 bg-white border border-[#DCD5C8] rounded-[8px] text-[14px] font-data font-medium text-[#1A1816] outline-none hover:border-[#807A70] focus:border-[#1A1816]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#807A70] font-data">
                ₹
              </span>
            </div>
          </div>

          {/* Daily Max */}
          <div className="flex flex-col">
            <label className="text-[13px] font-medium text-[#1A1816] mb-1.5">
              <span>Daily Max</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={state.dailyMax ? formatIndianCurrency(state.dailyMax, false) : ''}
                onChange={(e) => handleDailyMaxChange(e.target.value)}
                placeholder="4,00,000"
                className="w-full h-[42px] pl-7 pr-3 bg-white border border-[#DCD5C8] rounded-[8px] text-[14px] font-data font-medium text-[#1A1816] outline-none hover:border-[#807A70] focus:border-[#1A1816]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#807A70] font-data">
                ₹
              </span>
            </div>
          </div>
        </div>
        {errors.dailyBudget && (
          <div className="text-[11px] text-[#DC2626] font-medium">{errors.dailyBudget}</div>
        )}
      </div>

      {/* ── Section 3: Select Channel & Channel-Level Budgets ─────────────── */}
      <div className="space-y-4">
        <div className="w-full md:w-1/3">
          <MultiSelectDropdown
            label="Select Channel"
            placeholder="All Channels"
            required
            options={CHANNELS_AVAILABLE}
            selectedValues={state.selectedChannels}
            onChange={handleChannelSelect}
            error={errors.channels}
          />
        </div>

        {/* Channel level rows if any channel is selected */}
        {state.selectedChannels.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-[12px] font-semibold text-[#807A70] uppercase tracking-wider">
              Channel-Level Budget Allocation
            </div>

            {/* Single outline container enclosing WhatsApp, RCS, SMS */}
            <div className="bg-white border border-[#DCD5C8] rounded-[10px] overflow-hidden shadow-2xs">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#F9F7F4] border-b border-[#E8E4DD] text-[12px] font-semibold text-[#807A70]">
                <div className="col-span-3">Channel</div>
                <div className="col-span-3">Overall</div>
                <div className="col-span-3">Daily Min</div>
                <div className="col-span-3">Daily Max</div>
              </div>

              {/* Channel Rows without divider lines */}
              <div className="py-1">
                {state.selectedChannels.map((channel) => {
                  const b = state.channelBudgets[channel] || { overall: '', dailyMin: '', dailyMax: '' };
                  return (
                    <div
                      key={channel}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-[#FAF9F7]/60 transition-colors"
                    >
                      {/* Channel Badge in Beige */}
                      <div className="md:col-span-3 flex items-center">
                        <span className="px-3.5 py-1.5 rounded-[6px] bg-[#E8E4DD] text-[#3A3631] font-semibold text-[13px]">
                          {channel}
                        </span>
                      </div>

                      {/* Overall */}
                      <div className="md:col-span-3 flex flex-col">
                        <label className="text-[11px] font-medium text-[#807A70] mb-1 md:hidden">
                          Overall
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={b.overall ? formatIndianCurrency(b.overall, false) : ''}
                            onChange={(e) => handleChannelBudgetField(channel, 'overall', e.target.value)}
                            placeholder="2,00,00,000"
                            className="w-full h-[38px] pl-6 pr-2.5 bg-white border border-[#DCD5C8] rounded-[6px] text-[13px] font-data outline-none hover:border-[#807A70] focus:border-[#1A1816]"
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-[#807A70] font-data">
                            ₹
                          </span>
                        </div>
                      </div>

                      {/* Daily Min */}
                      <div className="md:col-span-3 flex flex-col">
                        <label className="text-[11px] font-medium text-[#807A70] mb-1 md:hidden">
                          Daily Min
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={b.dailyMin ? formatIndianCurrency(b.dailyMin, false) : ''}
                            onChange={(e) => handleChannelBudgetField(channel, 'dailyMin', e.target.value)}
                            placeholder="1,00,000"
                            className="w-full h-[38px] pl-6 pr-2.5 bg-white border border-[#DCD5C8] rounded-[6px] text-[13px] font-data outline-none hover:border-[#807A70] focus:border-[#1A1816]"
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-[#807A70] font-data">
                            ₹
                          </span>
                        </div>
                      </div>

                      {/* Daily Max */}
                      <div className="md:col-span-3 flex flex-col">
                        <label className="text-[11px] font-medium text-[#807A70] mb-1 md:hidden">
                          Daily Max
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={b.dailyMax ? formatIndianCurrency(b.dailyMax, false) : ''}
                            onChange={(e) => handleChannelBudgetField(channel, 'dailyMax', e.target.value)}
                            placeholder="1,00,00,000"
                            className="w-full h-[38px] pl-6 pr-2.5 bg-white border border-[#DCD5C8] rounded-[6px] text-[13px] font-data outline-none hover:border-[#807A70] focus:border-[#1A1816]"
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-[#807A70] font-data">
                            ₹
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {errors.channelTotals && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#DC2626] font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.channelTotals}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 4: Weekly Budget ──────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#1A1816] tracking-tight">Weekly Budget</h2>
          <p className="text-[12px] text-[#807A70]">
            Allocated across execution timeline (total must equal 100%)
          </p>
        </div>

        {/* Total must equal 100% warning alert/popup */}
        {Math.abs(totalWeeklyPercent - 100) > 0.1 && (
          <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] text-[13px] text-[#991B1B] font-medium animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
            <span>Total weekly budget allocation must equal 100% (Currently: {totalWeeklyPercent}%)</span>
          </div>
        )}

        {/* Weekly columns (preserves 4-column alignment leaving remaining slots blank, or 5 columns if 5 weeks) */}
        <div className={`grid gap-4 ${
          state.weeklyAllocations.length === 5
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-5'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
        }`}>
          {state.weeklyAllocations.map((w, idx) => (
            <div
              key={w.week}
              className="p-3.5 bg-white border border-[#DCD5C8] rounded-[8px] space-y-2"
            >
              <div className="text-[13px] font-semibold text-[#1A1816]">Week {w.week}</div>
              <div className="relative">
                <input
                  type="text"
                  value={w.percent}
                  onChange={(e) => handleWeeklyPercentChange(idx, e.target.value)}
                  placeholder="25.0"
                  className="w-full h-[38px] pl-3 pr-7 bg-white border border-[#DCD5C8] rounded-[6px] text-[14px] font-data outline-none hover:border-[#807A70] focus:border-[#1A1816]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[#807A70] font-data font-semibold">
                  %
                </span>
              </div>
              <div className="text-[12px] text-[#807A70] font-data">
                {w.amount > 0 ? formatIndianCurrency(Math.round(w.amount)) : '₹0'}
              </div>
            </div>
          ))}
        </div>

        {errors.weekly && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#DC2626] font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.weekly}</span>
          </div>
        )}
        </div>
      </div>

      {/* ── Bottom Actions Bar (Space & Bottom Buttons on Canvas Background) ── */}
      <div className="flex items-center justify-between pt-4 pb-12">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] transition-colors cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          onClick={validateAndProceed}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] hover:text-[#1A1816] transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};
