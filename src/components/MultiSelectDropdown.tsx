import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: (string | MultiSelectOption)[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  placeholder = 'Select options',
  options,
  selectedValues,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options
  const normalizedOptions: MultiSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Filter options by search
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allValues = normalizedOptions.map((o) => o.value);
    // Combine existing with all
    const merged = Array.from(new Set([...selectedValues, ...allValues]));
    onChange(merged);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Trigger text preview
  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const match = normalizedOptions.find((o) => o.value === selectedValues[0]);
      return match ? match.label : selectedValues[0];
    }
    return `${selectedValues.length} selected`;
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
        <span
          className={`truncate pr-2 ${
            selectedValues.length === 0 ? 'text-[#807A70]' : 'text-[#1A1816] font-medium'
          }`}
        >
          {getDisplayText()}
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
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-[8px] border border-[#DCD5C8] shadow-lg p-2.5 min-w-[240px] animate-in fade-in zoom-in-95 duration-100">
          {/* Header Controls: Search + Select all / Clear all */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#ECE7DE]">
            {/* Search input with soft-white bg and subtle border */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#807A70] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2 py-1 text-[12px] bg-[#FAF9F7] text-[#1A1816] border border-[#DCD5C8] rounded-[5px] outline-none focus:bg-white placeholder:text-[#807A70]"
              />
            </div>

            {/* Select all | Clear all in locked brand orange */}
            <div className="flex items-center text-[11px] font-semibold text-[#FF5C35] whitespace-nowrap pl-1">
              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:underline hover:text-[#E54A25] cursor-pointer"
              >
                Select all
              </button>
              <span className="mx-1 text-[#DCD5C8]">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="hover:underline hover:text-[#E54A25] cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto pr-0.5 space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-[12px] text-[#807A70]">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleOption(opt.value);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? 'bg-[#FFF2ED] text-[#1A1816] font-medium'
                        : 'hover:bg-[#F5F2EC] text-[#3A3631]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Checkbox */}
                      <span
                        className={`w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#1A1816] border border-[#1A1816]'
                            : 'border border-[#807A70] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {opt.count !== undefined && (
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.5 rounded-[4px] ml-2 ${
                          opt.count === 0
                            ? 'bg-[#FEE2E2] text-[#DC2626] font-semibold'
                            : 'bg-[#E5EBF2] text-[#1A3A5C] font-medium'
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
