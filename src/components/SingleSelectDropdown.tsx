import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SingleSelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  label,
  placeholder = 'Select option',
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className={`relative flex flex-col ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[13px] font-medium text-[#1A1816] mb-1.5 flex items-center gap-1">
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] px-3.5 py-2 rounded-[8px] text-left text-[14px] flex items-center justify-between transition-colors duration-150 outline-none ${
          disabled
            ? 'bg-[#EFECE6] text-[#A8A299] cursor-not-allowed border border-[#DCD5C8]'
            : error
            ? 'bg-white border border-[#DC2626]'
            : isOpen
            ? 'bg-[#F9F7F4] border border-[#DCD5C8] shadow-xs'
            : 'bg-white border border-[#DCD5C8] hover:bg-[#F9F7F4] hover:border-[#DCD5C8]'
        }`}
      >
        <span className={`truncate pr-2 ${!value ? 'text-[#807A70]' : 'text-[#1A1816] font-medium'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#807A70] transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-[#1A1816]' : ''
          }`}
        />
      </button>

      {error && <span className="text-[11px] text-[#DC2626] mt-1 font-medium">{error}</span>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-[8px] border border-[#DCD5C8] shadow-lg p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-[6px] text-[13px] transition-colors ${
                    isSelected
                      ? 'bg-[#FFF2ED] text-[#FF5C35] font-semibold'
                      : 'hover:bg-[#F5F2EC] text-[#1A1816]'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#FF5C35]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
