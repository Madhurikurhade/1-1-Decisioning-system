import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Star, Search, X } from 'lucide-react';

export interface ConfigDropdownOption {
  value: string;
  label: string;
  isRecommended?: boolean;
}

interface CustomConfigDropdownProps {
  label?: string;
  badge?: React.ReactNode;
  value: string;
  options: ConfigDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  withSearch?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CustomConfigDropdown: React.FC<CustomConfigDropdownProps> = ({
  label,
  badge,
  value,
  options,
  onChange,
  placeholder = 'Select option',
  searchPlaceholder,
  withSearch = true,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      opt.value.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className={`relative flex flex-col ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={containerRef}>
      {/* Label and optional Badge */}
      {(label || badge) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label className="text-[13px] font-semibold text-[#1A1816]">
              {label}
            </label>
          )}
          {badge && <div>{badge}</div>}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[42px] px-3.5 rounded-[8px] text-left text-[13.5px] flex items-center justify-between transition-colors outline-none cursor-pointer ${
          disabled
            ? 'bg-[#EFECE6] text-[#A8A299] cursor-not-allowed border border-[#D5D0C7]'
            : isOpen
            ? 'bg-[#F9F7F4] border border-[#1A1816] shadow-xs'
            : 'bg-white border border-[#D5D0C7] hover:border-[#807A70]'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          <span className={`truncate ${!value ? 'text-[#807A70]' : 'text-[#1A1816] font-medium'}`}>
            {displayLabel}
          </span>
          {selectedOption?.isRecommended && (
            <span className="text-[11px] font-medium text-[#EA580C] bg-[#FFF7ED] px-1.5 py-0.2 rounded border border-[#FFEDD5] shrink-0">
              ★ (Recommended)
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#807A70] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#1A1816]' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-[8px] border border-[#D5D0C7] shadow-xl p-1.5 min-w-[220px] max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 font-body">
          {/* Search Bar */}
          {withSearch && (
            <div className="p-1 pb-2 border-b border-[#ECE7DE]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#807A70] absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder || `Search ${label ? label.toLowerCase() : 'options'}...`}
                  className="w-full pl-8 pr-7 py-1.5 text-[12.5px] bg-[#FAF9F7] text-[#1A1816] border border-[#D5D0C7] rounded-[6px] outline-none focus:bg-white focus:border-[#FF5C35] placeholder:text-[#807A70] transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 text-[#807A70] hover:text-[#1A1816] p-0.5 rounded cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-52 pt-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-[12.5px] text-[#807A70]">
                {searchTerm ? 'No matching results found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-[6px] text-[13px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF2ED] text-[#FF5C35] font-semibold'
                        : 'text-[#1A1816] hover:bg-[#F5F2EC] font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.isRecommended && (
                        <span className="text-[10.5px] font-semibold text-[#EA580C] bg-[#FFF7ED] px-1.5 py-0.2 rounded border border-[#FFEDD5] shrink-0 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-[#EA580C]" />
                          <span>Recommended</span>
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#FF5C35] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
