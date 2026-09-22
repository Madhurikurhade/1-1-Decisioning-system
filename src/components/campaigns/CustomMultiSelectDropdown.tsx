import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface CustomMultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
  searchPlaceholder?: string;
  dropdownWidth?: string;
}

export const CustomMultiSelectDropdown: React.FC<CustomMultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder = 'Search...',
  dropdownWidth = 'w-full sm:w-[280px]',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Working selection state inside the dropdown until "Save" is clicked
  const [tempSelected, setTempSelected] = useState<string[]>(selected);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync tempSelected whenever dropdown opens or outer selected prop changes
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selected);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, selected]);

  // Close when clicking outside (discards unsaved changes)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempSelected([...options]);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempSelected([]);
  };

  const toggleOption = (opt: string) => {
    if (tempSelected.includes(opt)) {
      setTempSelected(tempSelected.filter((item) => item !== opt));
    } else {
      setTempSelected([...tempSelected, opt]);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(tempSelected);
    setIsOpen(false);
    setSearch('');
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempSelected(selected);
    setIsOpen(false);
    setSearch('');
  };

  const triggerLabel =
    selected.length === 0
      ? label
      : selected.length === 1 && options.length <= 5
      ? `${selected[0]}`
      : `${selected.length} selected`;

  const isHighlighted = selected.length > 0;

  return (
    <div className="relative font-body" ref={containerRef}>
      {/* ── Trigger Button ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[40px] px-3.5 rounded-[8px] text-[13px] font-medium flex items-center justify-between shadow-2xs transition-colors cursor-pointer ${
          isHighlighted
            ? 'bg-[#FFF9F6] border border-[#FF5C35] text-[#FF5C35]'
            : 'bg-white border border-[#D5D0C7] text-[#1A1816] hover:border-[#A8A29E]'
        }`}
      >
        <span className={`truncate ${isHighlighted ? 'font-semibold text-[#FF5C35]' : 'text-[#1A1816]'}`}>
          {triggerLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isHighlighted ? 'text-[#FF5C35]' : 'text-[#807A70]'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Popover Menu (Matching Budget page Select Channel dropdown) ── */}
      {isOpen && (
        <div
          className={`absolute top-[calc(100%+5px)] left-0 z-50 ${dropdownWidth} bg-white rounded-[8px] border border-[#DCD5C8] shadow-lg p-2.5 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Header Controls: Search + Select all / Clear all */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#ECE7DE]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#807A70] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
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
              <span className="mx-1 text-[#DCD5C8] select-none">|</span>
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
              <div className="py-4 text-center text-[12px] text-[#807A70]">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = tempSelected.includes(opt);
                return (
                  <label
                    key={opt}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleOption(opt);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] cursor-pointer transition-colors duration-100 ${
                      isChecked
                        ? 'bg-[#FFF2ED] text-[#1A1816] font-medium'
                        : 'hover:bg-[#F5F2EC] text-[#3A3631]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Square Checkbox */}
                      <span
                        className={`w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[#1A1816] border border-[#1A1816]'
                            : 'border border-[#807A70] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {/* ── Save Action Footer (User requested Save button for multi-select) ── */}
          <div className="pt-2 mt-2 border-t border-[#ECE7DE] flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#807A70] font-medium">
              {tempSelected.length} chosen
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 rounded-[5px] text-[12px] font-medium text-[#706B62] hover:text-[#1A1816] hover:bg-[#F4F1EB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-1 rounded-[5px] text-[12px] font-semibold text-white bg-[#FF5C35] hover:bg-[#E54A25] shadow-2xs transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
