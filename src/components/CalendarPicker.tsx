import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseDDMMYYYY } from '../utils/formatters';

interface CalendarPickerProps {
  label?: string;
  required?: boolean;
  value: string; // 'DD/MM/YYYY'
  onChange: (val: string) => void;
  minDate?: Date;
  maxDate?: Date;
  lockToMonthYear?: { year: number; month: number }; // 0-indexed month
  onlyMonthEnd?: boolean; // When true, only the final day of the month (28/29/30/31) is selectable
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  label,
  required = false,
  value,
  onChange,
  minDate,
  maxDate,
  lockToMonthYear,
  onlyMonthEnd = false,
  placeholder = 'DD/MM/YYYY',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date
  const selectedDate = useMemo(() => parseDDMMYYYY(value), [value]);

  // Current view month and year
  const [viewYear, setViewYear] = useState(() => {
    if (lockToMonthYear) return lockToMonthYear.year;
    if (selectedDate) return selectedDate.getFullYear();
    return minDate ? minDate.getFullYear() : 2026;
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (lockToMonthYear) return lockToMonthYear.month;
    if (selectedDate) return selectedDate.getMonth();
    return minDate ? minDate.getMonth() : 8; // September
  });

  // Keep view in sync when lockToMonthYear changes
  useEffect(() => {
    if (lockToMonthYear) {
      setViewYear(lockToMonthYear.year);
      setViewMonth(lockToMonthYear.month);
    } else if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [lockToMonthYear, selectedDate]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  // Calculate days in view month
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  // Month navigation
  const canPrevMonth = !lockToMonthYear && (!minDate || new Date(viewYear, viewMonth, 1) > minDate);
  const canNextMonth = !lockToMonthYear && (!maxDate || new Date(viewYear, viewMonth + 1, 0) < maxDate);

  const handlePrevMonth = () => {
    if (!canPrevMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canNextMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDaySelectable = (dayNum: number) => {
    // If onlyMonthEnd is set, only the last day of the month is selectable
    if (onlyMonthEnd && dayNum !== daysInMonth) {
      return false;
    }

    const dayDate = new Date(viewYear, viewMonth, dayNum);
    dayDate.setHours(0, 0, 0, 0);

    if (minDate) {
      const minCopy = new Date(minDate);
      minCopy.setHours(0, 0, 0, 0);
      if (dayDate < minCopy) return false;
    }

    if (maxDate) {
      const maxCopy = new Date(maxDate);
      maxCopy.setHours(23, 59, 59, 999);
      if (dayDate > maxCopy) return false;
    }

    return true;
  };

  const handleSelectDay = (dayNum: number) => {
    if (!isDaySelectable(dayNum)) return;
    const dayStr = String(dayNum).padStart(2, '0');
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const formatted = `${dayStr}/${monthStr}/${viewYear}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const isSelected = (dayNum: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === dayNum &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  return (
    <div className={`relative flex flex-col ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[13px] font-medium text-[#1A1816] mb-1.5 flex items-center gap-1">
          <span>{label}</span>
        </label>
      )}

      {/* Input row */}
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full h-[42px] px-3.5 pr-10 bg-white border rounded-[8px] text-[14px] font-data outline-none transition-colors ${
            disabled
              ? 'bg-[#EFECE6] text-[#A8A299] border-[#DCD5C8] cursor-not-allowed'
              : isOpen
              ? 'border-[#1A1816] shadow-xs'
              : 'border-[#DCD5C8] hover:border-[#807A70] focus:border-[#1A1816]'
          }`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#807A70] hover:text-[#1A1816] cursor-pointer"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white border border-[#DCD5C8] rounded-[10px] shadow-lg p-3.5 w-[260px] animate-in fade-in zoom-in-95 duration-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#E8E4DD]">
            <span className="text-[13px] font-bold text-[#1A1816]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={!canPrevMonth}
                className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors ${
                  canPrevMonth
                    ? 'hover:bg-[#F2EEE7] text-[#1A1816] cursor-pointer'
                    : 'text-[#DCD5C8] cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={!canNextMonth}
                className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors ${
                  canNextMonth
                    ? 'hover:bg-[#F2EEE7] text-[#1A1816] cursor-pointer'
                    : 'text-[#DCD5C8] cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center mb-1">
            {DAY_HEADERS.map((day) => (
              <span key={day} className="text-[11px] font-semibold text-[#807A70] py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-7 h-7" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const selectable = isDaySelectable(dayNum);
              const selected = isSelected(dayNum);

              return (
                <button
                  type="button"
                  key={dayNum}
                  disabled={!selectable}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`w-7 h-7 rounded-[6px] text-[12px] font-data flex items-center justify-center transition-colors ${
                    selected
                      ? 'bg-[#1A1816] text-white font-bold shadow-2xs'
                      : selectable
                      ? 'hover:bg-[#F2EEE7] text-[#1A1816] cursor-pointer font-medium'
                      : 'text-[#D5D0C6] cursor-not-allowed bg-transparent'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Month-End Rule footer when onlyMonthEnd is active */}
          {onlyMonthEnd && (
            <div className="mt-2.5 pt-2 border-t border-[#E8E4DD] flex items-center justify-between gap-1 text-[11px]">
              <span className="text-[#807A70] text-[10.5px]">Must end on 30/31</span>
              <button
                type="button"
                onClick={() => handleSelectDay(daysInMonth)}
                className="font-semibold text-[#FF5C35] hover:underline cursor-pointer"
              >
                Pick {daysInMonth} {MONTH_NAMES[viewMonth].slice(0, 3)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
