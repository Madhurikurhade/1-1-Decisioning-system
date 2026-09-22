import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export type CreatedDatePreset =
  | 'ALL'
  | 'Today'
  | 'Yesterday'
  | 'Last 7 Days'
  | 'This Week'
  | 'Last Week'
  | 'Last 30 Days'
  | 'This Month'
  | 'Last Month'
  | 'Custom Range';

export interface RelativePeriodFilter {
  amount: number;
  unit: 'D' | 'W' | 'M';
}

export type CreatedDateFilterValue =
  | { type: 'preset'; value: CreatedDatePreset }
  | { type: 'relative'; value: RelativePeriodFilter }
  | { type: 'custom_single'; date: string; display: string }
  | { type: 'custom_range'; startDate: string; endDate: string; display: string }
  | null;

export function parseCampaignOrStandardDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (trimmed.toLowerCase() === 'today') {
    return new Date();
  }
  if (trimmed.toLowerCase() === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  const parts = trimmed.split(/[\s/]+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);
    const monthName = parts[1].toLowerCase();
    const monthsMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };
    if (monthName in monthsMap) {
      return new Date(year, monthsMap[monthName], day);
    }
    const mNum = parseInt(parts[1], 10);
    if (!isNaN(mNum)) {
      return new Date(year, mNum - 1, day);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function isDateInPast(dateStr: string, refDate: Date = new Date()): boolean {
  const d = parseCampaignOrStandardDate(dateStr);
  if (!d) return false;
  const todayMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 0, 0, 0, 0);
  const targetMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  return targetMidnight.getTime() < todayMidnight.getTime();
}

export function isFilterForTodayOnly(filter: CreatedDateFilterValue, refDate: Date = new Date()): boolean {
  if (!filter) return false;
  if (filter.type === 'preset') {
    return filter.value === 'Today';
  }
  if (filter.type === 'custom_single') {
    const d = parseCampaignOrStandardDate(filter.date);
    if (!d) return false;
    return (
      d.getFullYear() === refDate.getFullYear() &&
      d.getMonth() === refDate.getMonth() &&
      d.getDate() === refDate.getDate()
    );
  }
  return false;
}

export function matchesCreatedDateFilter(
  dateObjOrStr: Date | string | null,
  dateFilter: CreatedDateFilterValue,
  refDate: Date = new Date()
): boolean {
  if (!dateFilter || (dateFilter.type === 'preset' && dateFilter.value === 'ALL')) {
    return true;
  }
  if (!dateObjOrStr) return false;

  let itemDate: Date | null = null;
  if (typeof dateObjOrStr === 'string') {
    itemDate = parseCampaignOrStandardDate(dateObjOrStr);
  } else {
    itemDate = dateObjOrStr;
  }

  if (!itemDate || isNaN(itemDate.getTime())) return false;

  if (dateFilter.type === 'preset') {
    const preset = dateFilter.value;
    if (preset === 'Today') {
      return (
        itemDate.getFullYear() === refDate.getFullYear() &&
        itemDate.getMonth() === refDate.getMonth() &&
        itemDate.getDate() === refDate.getDate()
      );
    } else if (preset === 'Yesterday') {
      const yesterday = new Date(refDate);
      yesterday.setDate(refDate.getDate() - 1);
      return (
        itemDate.getFullYear() === yesterday.getFullYear() &&
        itemDate.getMonth() === yesterday.getMonth() &&
        itemDate.getDate() === yesterday.getDate()
      );
    } else if (preset === 'Last 7 Days') {
      const refMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 23, 59, 59, 999);
      const past7 = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - 7, 0, 0, 0, 0);
      return itemDate >= past7 && itemDate <= refMidnight;
    } else if (preset === 'Last 30 Days') {
      const refMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 23, 59, 59, 999);
      const past30 = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - 30, 0, 0, 0, 0);
      return itemDate >= past30 && itemDate <= refMidnight;
    } else if (preset === 'This Week') {
      const day = refDate.getDay();
      const diffToMon = (day + 6) % 7;
      const monday = new Date(refDate);
      monday.setDate(refDate.getDate() - diffToMon);
      monday.setHours(0, 0, 0, 0);
      return itemDate >= monday && itemDate <= refDate;
    } else if (preset === 'Last Week') {
      const day = refDate.getDay();
      const diffToMon = (day + 6) % 7;
      const thisMonday = new Date(refDate);
      thisMonday.setDate(refDate.getDate() - diffToMon);
      thisMonday.setHours(0, 0, 0, 0);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      return itemDate >= lastMonday && itemDate < thisMonday;
    } else if (preset === 'This Month') {
      return (
        itemDate.getFullYear() === refDate.getFullYear() &&
        itemDate.getMonth() === refDate.getMonth()
      );
    } else if (preset === 'Last Month') {
      const lastMonth = refDate.getMonth() === 0 ? 11 : refDate.getMonth() - 1;
      const lastMonthYear =
        refDate.getMonth() === 0
          ? refDate.getFullYear() - 1
          : refDate.getFullYear();
      return (
        itemDate.getFullYear() === lastMonthYear &&
        itemDate.getMonth() === lastMonth
      );
    }
  } else if (dateFilter.type === 'relative') {
    const { amount, unit } = dateFilter.value;
    const diffMs = refDate.getTime() - itemDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return false;
    if (unit === 'D' && diffDays > amount) return false;
    if (unit === 'W' && diffDays > amount * 7) return false;
    if (unit === 'M' && diffDays > amount * 30) return false;
    return true;
  } else if (dateFilter.type === 'custom_single') {
    const [tY, tM, tD] = dateFilter.date.split('-').map(Number);
    return (
      itemDate.getFullYear() === tY &&
      itemDate.getMonth() === tM - 1 &&
      itemDate.getDate() === tD
    );
  } else if (dateFilter.type === 'custom_range') {
    const [sY, sM, sD] = dateFilter.startDate.split('-').map(Number);
    const [eY, eM, eD] = dateFilter.endDate.split('-').map(Number);
    const startRange = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
    const endRange = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
    return itemDate >= startRange && itemDate <= endRange;
  }

  return true;
}

interface CreatedDateDropdownProps {
  value: CreatedDateFilterValue;
  onChange: (val: CreatedDateFilterValue) => void;
  defaultLabel?: string;
  headerTitle?: string;
  maxDate?: Date;
  align?: 'left' | 'right';
  className?: string;
}

const PRESETS: CreatedDatePreset[] = [
  'Today',
  'Yesterday',
  'Last 7 Days',
  'This Week',
  'Last Week',
  'Last 30 Days',
  'This Month',
  'Last Month',
  'Custom Range',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CreatedDateDropdown: React.FC<CreatedDateDropdownProps> = ({
  value,
  onChange,
  defaultLabel = 'Created date',
  headerTitle = 'Select created date',
  maxDate,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Stepper relative filter
  const [relativeAmount, setRelativeAmount] = useState<number>(1);
  const [relativeUnit, setRelativeUnit] = useState<'D' | 'W' | 'M'>('D');

  // Calendar state: "on" (single date) or "between" (date range)
  const [calendarMode, setCalendarMode] = useState<'on' | 'between'>('between');

  // Navigating year & month for left calendar (default September 2026 to match data)
  const [navYear, setNavYear] = useState<number>(2026);
  const [navMonth, setNavMonth] = useState<number>(8); // 8 = September (0-indexed)

  // Selected single date (YYYY-MM-DD)
  const [selectedSingleDate, setSelectedSingleDate] = useState<string>('2026-09-12');

  // Selected range dates (YYYY-MM-DD)
  const [rangeStart, setRangeStart] = useState<string>('2026-09-01');
  const [rangeEnd, setRangeEnd] = useState<string>('2026-09-15');
  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>('start');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const maxDateStr = useMemo(() => {
    if (!maxDate) return null;
    const y = maxDate.getFullYear();
    const m = String(maxDate.getMonth() + 1).padStart(2, '0');
    const d = String(maxDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [maxDate]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync internal state when value prop changes
  useEffect(() => {
    if (value?.type === 'custom_single') {
      setShowCalendar(true);
      setCalendarMode('on');
      setSelectedSingleDate(value.date);
      const d = new Date(value.date);
      if (!isNaN(d.getTime())) {
        setNavYear(d.getFullYear());
        setNavMonth(d.getMonth());
      }
    } else if (value?.type === 'custom_range') {
      setShowCalendar(true);
      setCalendarMode('between');
      setRangeStart(value.startDate);
      setRangeEnd(value.endDate);
      const d = new Date(value.startDate);
      if (!isNaN(d.getTime())) {
        setNavYear(d.getFullYear());
        setNavMonth(d.getMonth());
      }
    }
  }, [value]);

  // Label to display on closed button
  const displayLabel = (): string => {
    if (!value) return defaultLabel;
    if (value.type === 'preset') {
      return value.value === 'ALL' ? defaultLabel : value.value;
    }
    if (value.type === 'relative') {
      const unitLabel =
        value.value.unit === 'D' ? 'Day' : value.value.unit === 'W' ? 'Week' : 'Month';
      const plural = value.value.amount > 1 ? 's' : '';
      return `Last ${value.value.amount} ${unitLabel}${plural}`;
    }
    if (value.type === 'custom_single') {
      return `On: ${value.display}`;
    }
    if (value.type === 'custom_range') {
      return value.display;
    }
    return defaultLabel;
  };

  const handleSelectPreset = (preset: CreatedDatePreset) => {
    if (preset === 'Custom Range') {
      setShowCalendar(true);
      return;
    }
    setShowCalendar(false);
    onChange({ type: 'preset', value: preset });
    setIsOpen(false);
  };

  const handleApplyRelative = (unit: 'D' | 'W' | 'M') => {
    setRelativeUnit(unit);
    setShowCalendar(false);
    onChange({
      type: 'relative',
      value: { amount: relativeAmount, unit },
    });
    setIsOpen(false);
  };

  // Helper to format date YYYY-MM-DD into "DD Mon YYYY"
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = MONTH_NAMES[parseInt(parts[1], 10) - 1];
    const day = parts[2].padStart(2, '0');
    return `${day} ${month} ${year}`;
  };

  // Helper to format date YYYY-MM-DD into "DD Mon"
  const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const month = MONTH_NAMES[parseInt(parts[1], 10) - 1];
    const day = parts[2].padStart(2, '0');
    return `${day} ${month}`;
  };

  // Build grid of days for a given year & month (0-indexed)
  const buildMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
    }[] = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill up to 35 or 42 cells
    const remaining = 35 - (days.length % 35);
    if (remaining > 0 && remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextM = month === 11 ? 0 : month + 1;
        const nextY = month === 11 ? year + 1 : year;
        const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
      }
    }

    return days;
  };

  const leftMonthDays = useMemo(() => buildMonthDays(navYear, navMonth), [navYear, navMonth]);

  const rightYear = navMonth === 11 ? navYear + 1 : navYear;
  const rightMonth = navMonth === 11 ? 0 : navMonth + 1;
  const rightMonthDays = useMemo(() => buildMonthDays(rightYear, rightMonth), [rightYear, rightMonth]);

  // Date click handler
  const handleDateClick = (dateStr: string) => {
    if (maxDateStr && dateStr > maxDateStr) {
      return;
    }
    if (calendarMode === 'on') {
      setSelectedSingleDate(dateStr);
    } else {
      if (selectingStep === 'start') {
        setRangeStart(dateStr);
        setRangeEnd(dateStr);
        setSelectingStep('end');
      } else {
        if (dateStr < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(dateStr);
        } else {
          setRangeEnd(dateStr);
        }
        setSelectingStep('start');
      }
    }
  };

  const handleApplyCalendar = () => {
    if (calendarMode === 'on') {
      onChange({
        type: 'custom_single',
        date: selectedSingleDate,
        display: formatDateDisplay(selectedSingleDate),
      });
    } else {
      const startStr = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
      const endStr = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
      onChange({
        type: 'custom_range',
        startDate: startStr,
        endDate: endStr,
        display: `${formatShortDate(startStr)} - ${formatDateDisplay(endStr)}`,
      });
    }
    setIsOpen(false);
  };

  const handleResetCalendar = () => {
    setSelectedSingleDate('2026-09-12');
    setRangeStart('2026-09-01');
    setRangeEnd('2026-09-15');
    setSelectingStep('start');
  };

  const nextMonthNav = () => {
    if (maxDate) {
      const nextM = navMonth === 11 ? 0 : navMonth + 1;
      const nextY = navMonth === 11 ? navYear + 1 : navYear;
      const firstOfNext = new Date(nextY, nextM, 1);
      if (firstOfNext > maxDate) return;
    }
    if (navMonth === 11) {
      setNavYear(navYear + 1);
      setNavMonth(0);
    } else {
      setNavMonth(navMonth + 1);
    }
  };

  const prevMonthNav = () => {
    if (navMonth === 0) {
      setNavYear(navYear - 1);
      setNavMonth(11);
    } else {
      setNavMonth(navMonth - 1);
    }
  };

  const nextYearNav = () => {
    if (maxDate) {
      const nextY = navYear + 1;
      const firstOfNextYear = new Date(nextY, navMonth, 1);
      if (firstOfNextYear > maxDate) return;
    }
    setNavYear(navYear + 1);
  };

  const prevYearNav = () => {
    setNavYear(navYear - 1);
  };

  // Helper to determine day styling in calendar
  const getDayStyle = (dateStr: string, isCurrentMonth: boolean) => {
    if (maxDateStr && dateStr > maxDateStr) {
      return 'text-[#C4BEB4] opacity-35 cursor-not-allowed pointer-events-none select-none';
    }

    if (!isCurrentMonth) {
      return 'text-[#C4BEB4] hover:bg-[#F4F1EB] cursor-pointer';
    }

    if (calendarMode === 'on') {
      if (dateStr === selectedSingleDate) {
        return 'bg-[#FF5C35] text-white font-bold rounded-full shadow-2xs cursor-pointer';
      }
      return 'text-[#2D2A26] hover:bg-[#F4F1EB] rounded-full cursor-pointer';
    }

    // In Between Mode
    const isStart = dateStr === rangeStart;
    const isEnd = dateStr === rangeEnd;
    const isBetween =
      rangeStart && rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;

    if (isStart && isEnd) {
      return 'bg-[#FF5C35] text-white font-bold rounded-full shadow-2xs cursor-pointer';
    }
    if (isStart) {
      return 'bg-[#FF5C35] text-white font-bold rounded-l-full shadow-2xs cursor-pointer';
    }
    if (isEnd) {
      return 'bg-[#FF5C35] text-white font-bold rounded-r-full shadow-2xs cursor-pointer';
    }
    if (isBetween) {
      return 'bg-[#FFEFEA] text-[#1A1816] font-medium cursor-pointer rounded-none';
    }

    return 'text-[#2D2A26] hover:bg-[#F4F1EB] rounded-full cursor-pointer';
  };

  const isSelected = value !== null && (value.type !== 'preset' || value.value !== 'ALL');

  return (
    <div className={`relative ${className || 'inline-block'}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 px-3.5 rounded-[8px] text-[13px] font-medium flex items-center justify-between gap-2.5 transition-colors cursor-pointer shadow-2xs ${
          className ? 'w-full' : 'min-w-[160px]'
        } ${
          isSelected
            ? 'bg-[#FFF9F6] border border-[#FF5C35] text-[#FF5C35]'
            : 'bg-white border border-[#D5D0C7] text-[#2D2A26] hover:bg-[#F4F1EB]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FF5C35]' : 'text-[#706B62]'}`} />
          <span className={`truncate ${isSelected ? 'font-semibold text-[#FF5C35]' : 'text-[#2D2A26]'}`}>
            {displayLabel()}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
            isSelected ? 'text-[#FF5C35]' : 'text-[#706B62]'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0 left-auto' : 'left-0'} top-full mt-1.5 z-40 bg-white rounded-[10px] border border-[#D5D0C7] shadow-2xl p-0 animate-in fade-in zoom-in-95 duration-150 font-body flex flex-col md:flex-row overflow-hidden ${
            showCalendar ? 'w-[760px] max-w-[95vw]' : 'w-[240px]'
          }`}
        >
          {/* Left Panel: Presets & Relative Stepper */}
          <div className="w-[240px] shrink-0 p-3 border-r border-[#E8E4DD] bg-white flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#E8E4DD] mb-1.5">
                <span className="text-[12px] text-[#706B62] font-semibold">{headerTitle}</span>
                <CalendarIcon className="w-3.5 h-3.5 text-[#706B62]" />
              </div>

              {/* Presets List */}
              <div className="py-1 space-y-0.5 max-h-[310px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setShowCalendar(false);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-[13px] text-[#706B62] hover:text-[#1A1816] hover:bg-[#F4F1EB] rounded-[5px] transition-colors cursor-pointer"
                >
                  All Dates
                </button>

                {PRESETS.map((preset) => {
                  const isSelected =
                    (value?.type === 'preset' && value.value === preset) ||
                    (preset === 'Custom Range' && showCalendar);

                  return (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-[5px] transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'font-semibold text-[#FF5C35] bg-[#FFF0EB]'
                          : 'text-[#2D2A26] hover:bg-[#F4F1EB]'
                      }`}
                    >
                      <span>{preset}</span>
                      {preset === 'Custom Range' && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#948D82]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Relative Row: Last [ 1 ] [D] [W] [M] */}
            <div className="pt-2.5 mt-2 border-t border-[#E8E4DD] px-1 flex items-center justify-between gap-1.5">
              <span className="text-[12.5px] text-[#2D2A26] font-medium">Last</span>

              {/* Stepper input */}
              <input
                type="number"
                min={1}
                max={99}
                value={relativeAmount}
                onChange={(e) => setRelativeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 h-7 px-1 text-center text-[12.5px] font-medium border border-[#D5D0C7] rounded-[5px] bg-white text-[#1A1816] focus:outline-hidden focus:border-[#FF5C35]"
              />

              {/* Circular pill buttons: (D), (W), (M) with theme orange borders */}
              <div className="flex items-center gap-1">
                {(['D', 'W', 'M'] as const).map((unit) => {
                  const isActive =
                    value?.type === 'relative' &&
                    value.value.unit === unit &&
                    value.value.amount === relativeAmount;
                  return (
                    <button
                      type="button"
                      key={unit}
                      onClick={() => handleApplyRelative(unit)}
                      title={unit === 'D' ? 'Days' : unit === 'W' ? 'Weeks' : 'Months'}
                      className={`w-6 h-6 rounded-full text-[11.5px] font-semibold flex items-center justify-center transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-[#FF5C35] text-white border-[#FF5C35]'
                          : 'bg-white text-[#FF5C35] border-[#FF5C35] hover:bg-[#FF5C35]/10'
                      }`}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Calendar (Shown when Custom Range is selected) */}
          {showCalendar && (
            <div className="flex-1 p-4 bg-[#FAF8F5] flex flex-col justify-between">
              {/* Top Controls: Mode Switcher & Summary Date Range Bar */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DD]">
                  {/* Mode Switcher: "On" vs "In Between" */}
                  <div className="flex items-center bg-[#EFEBE3] p-0.5 rounded-[7px] border border-[#DDD6C9]">
                    <button
                      type="button"
                      onClick={() => setCalendarMode('on')}
                      className={`px-3 py-1 text-[12px] font-medium rounded-[5px] transition-colors cursor-pointer ${
                        calendarMode === 'on'
                          ? 'bg-white text-[#1A1816] shadow-2xs font-semibold'
                          : 'text-[#706B62] hover:text-[#1A1816]'
                      }`}
                    >
                      On (Single Date)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMode('between')}
                      className={`px-3 py-1 text-[12px] font-medium rounded-[5px] transition-colors cursor-pointer ${
                        calendarMode === 'between'
                          ? 'bg-white text-[#1A1816] shadow-2xs font-semibold'
                          : 'text-[#706B62] hover:text-[#1A1816]'
                      }`}
                    >
                      In Between (Range)
                    </button>
                  </div>

                  {/* Summary & Reset Button */}
                  <div className="flex items-center gap-3">
                    <div className="text-[12.5px] font-semibold text-[#1A1816] font-data">
                      {calendarMode === 'on' ? (
                        <span>On: {formatDateDisplay(selectedSingleDate)}</span>
                      ) : (
                        <span>
                          {formatShortDate(rangeStart)} - {formatDateDisplay(rangeEnd)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleResetCalendar}
                      className="text-[11.5px] text-[#FF5C35] hover:underline font-medium cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Calendar Months Display (Two Months side-by-side matching image 5) */}
                <div className="pt-3">
                  {/* Month Navigation Row */}
                  <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={prevYearNav}
                        title="Previous Year"
                        className="p-1 hover:bg-[#EAE5DC] rounded-[4px] text-[#706B62] hover:text-[#1A1816] transition-colors cursor-pointer"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={prevMonthNav}
                        title="Previous Month"
                        className="p-1 hover:bg-[#EAE5DC] rounded-[4px] text-[#706B62] hover:text-[#1A1816] transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-around flex-1 text-[13.5px] font-bold text-[#1A1816]">
                      <span>
                        {MONTH_NAMES[navMonth]} {navYear}
                      </span>
                      <span>
                        {MONTH_NAMES[rightMonth]} {rightYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={nextMonthNav}
                        title="Next Month"
                        className="p-1 hover:bg-[#EAE5DC] rounded-[4px] text-[#706B62] hover:text-[#1A1816] transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextYearNav}
                        title="Next Year"
                        className="p-1 hover:bg-[#EAE5DC] rounded-[4px] text-[#706B62] hover:text-[#1A1816] transition-colors cursor-pointer"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dual Grid: Month 1 and Month 2 */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {/* Month 1: Left */}
                    <div>
                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 text-center text-[10.5px] font-semibold text-[#706B62] pb-1">
                        {DAY_LABELS.map((d) => (
                          <div key={`m1-${d}`} className="py-1">
                            {d}
                          </div>
                        ))}
                      </div>
                      {/* Days Grid */}
                      <div className="grid grid-cols-7 text-center text-[12px] gap-y-1">
                        {leftMonthDays.map((item, idx) => (
                          <div
                            key={`m1-day-${idx}`}
                            onClick={() => handleDateClick(item.dateStr)}
                            className={`h-7 flex items-center justify-center text-[12px] font-data transition-colors ${getDayStyle(
                              item.dateStr,
                              item.isCurrentMonth
                            )}`}
                          >
                            {item.dayNumber}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Month 2: Right */}
                    <div>
                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 text-center text-[10.5px] font-semibold text-[#706B62] pb-1">
                        {DAY_LABELS.map((d) => (
                          <div key={`m2-${d}`} className="py-1">
                            {d}
                          </div>
                        ))}
                      </div>
                      {/* Days Grid */}
                      <div className="grid grid-cols-7 text-center text-[12px] gap-y-1">
                        {rightMonthDays.map((item, idx) => (
                          <div
                            key={`m2-day-${idx}`}
                            onClick={() => handleDateClick(item.dateStr)}
                            className={`h-7 flex items-center justify-center text-[12px] font-data transition-colors ${getDayStyle(
                              item.dateStr,
                              item.isCurrentMonth
                            )}`}
                          >
                            {item.dayNumber}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Cancel & Done */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-3 border-t border-[#E8E4DD]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 text-[12.5px] font-medium text-[#555047] hover:text-[#1A1816] hover:bg-[#EAE5DC] rounded-[6px] border border-[#D5CEC0] bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCalendar}
                  className="px-5 py-1.5 text-[12.5px] font-semibold text-white bg-[#FF5C35] hover:bg-[#E04823] rounded-[6px] transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
