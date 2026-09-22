import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, AlertTriangle, X } from 'lucide-react';
import { ThemeOption } from '../types';

interface ThemeSelectorDropdownProps {
  label?: string;
  required?: boolean;
  selectedThemeIds: string[];
  availableThemes: ThemeOption[];
  vendorThemeGroups: { vendorName: string; themes: ThemeOption[] }[];
  onToggleTheme: (themeId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  hasVendors: boolean;
  error?: string;
}

export const ThemeSelectorDropdown: React.FC<ThemeSelectorDropdownProps> = ({
  label = 'Select Themes',
  required = false,
  selectedThemeIds,
  availableThemes,
  vendorThemeGroups,
  onToggleTheme,
  onSelectAll,
  onClearAll,
  hasVendors,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter groups by search query
  const filteredGroups = vendorThemeGroups.map((grp) => ({
    vendorName: grp.vendorName,
    themes: grp.themes.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((grp) => grp.themes.length > 0);

  // Check 0-template themes currently selected
  const selectedZeroTemplateThemes = availableThemes.filter(
    (t) => selectedThemeIds.includes(t.id) && t.templateCount === 0
  );

  return (
    <div className="relative flex flex-col space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-[13px] font-medium text-[#1A1816] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-[#FF5C35] font-bold">*</span>}
          </span>
          {hasVendors && (
            <span className="text-[11px] text-[#807A70] font-normal">
              {selectedThemeIds.length} selected
            </span>
          )}
        </label>
      )}

      {/* Dropdown Trigger Box (replaces the static box with click popup) */}
      <button
        type="button"
        disabled={!hasVendors}
        onClick={() => hasVendors && setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] px-3.5 py-2 bg-white border rounded-[8px] text-[13px] text-left flex items-center justify-between transition-colors ${
          !hasVendors
            ? 'bg-[#EFECE6] text-[#A8A299] border-[#DCD5C8] cursor-not-allowed'
            : isOpen
            ? 'border-[#1A1816] shadow-xs'
            : error
            ? 'border-[#DC2626]'
            : 'border-[#DCD5C8] hover:border-[#807A70] focus:border-[#1A1816] cursor-pointer'
        }`}
      >
        <div className="flex-1 truncate mr-2">
          {!hasVendors ? (
            <span className="text-[#A8A299]">Select vendors first</span>
          ) : selectedThemeIds.length === 0 ? (
            <span className="text-[#807A70]">Choose themes...</span>
          ) : (
            <span className="text-[#1A1816] font-medium">
              {selectedThemeIds.length} of {availableThemes.length} themes selected
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#807A70] transition-transform duration-150 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popup Overlay Dropdown Container */}
      {isOpen && hasVendors && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-[#DCD5C8] rounded-[10px] shadow-xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100 flex flex-col min-w-[280px]">
          {/* Header with Search and Select/Clear Actions */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#807A70] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search themes..."
                className="w-full pl-8 pr-7 py-1.5 text-[12px] bg-[#FAF9F7] border border-[#DCD5C8] rounded-[6px] outline-none focus:border-[#1A1816] placeholder:text-[#807A70]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#807A70] hover:text-[#1A1816]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-[#FF5C35] px-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="hover:underline hover:text-[#E54A25] cursor-pointer"
                >
                  Select all
                </button>
                <span className="text-[#DCD5C8]">|</span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="hover:underline hover:text-[#E54A25] cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <span className="text-[11px] text-[#807A70] font-normal">
                {selectedThemeIds.length}/{availableThemes.length}
              </span>
            </div>
          </div>

          {/* Grouped Theme Checkboxes List */}
          <div className="border border-[#E8E4DD] rounded-[8px] p-2 max-h-[220px] overflow-y-auto space-y-2.5 bg-[#FAF9F7]/60">
            {filteredGroups.length === 0 ? (
              <div className="py-5 text-center text-[12px] text-[#807A70]">
                No matching themes found
              </div>
            ) : (
              filteredGroups.map((grp) => (
                <div key={grp.vendorName} className="space-y-1">
                  {/* Vendor Heading in Dark Warm Neutral */}
                  <div className="text-[10.5px] font-bold text-[#3D372E] uppercase tracking-wider px-1 pt-1 pb-0.5 border-b border-[#E8E4DD]">
                    {grp.vendorName}
                  </div>

                  {grp.themes.map((theme) => {
                    const isSelected = selectedThemeIds.includes(theme.id);
                    return (
                      <div
                        key={theme.id}
                        onClick={(e) => {
                          e.preventDefault();
                          onToggleTheme(theme.id);
                        }}
                        className="flex items-center justify-between px-2 py-1.5 rounded-[5px] text-[12px] cursor-pointer transition-colors hover:bg-white text-[#1A1816]"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#1A1816] border border-[#1A1816]'
                                : 'border border-[#807A70] bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[2.5]" />}
                          </span>
                          <span className="truncate">{theme.name}</span>
                        </div>

                        {/* Template count: No background behind number! Red for 0, dark beige/black otherwise */}
                        <span
                          className={`text-[12px] font-data flex-shrink-0 ${
                            theme.templateCount === 0
                              ? 'text-[#DC2626] font-bold'
                              : 'text-[#3A3631] font-semibold'
                          }`}
                        >
                          {theme.templateCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* 0-Template Warning if user selected a 0-template theme */}
          {selectedZeroTemplateThemes.length > 0 && (
            <div className="flex items-start gap-1.5 p-2 bg-[#FFF2ED] border border-[#FF5C35]/30 rounded-[6px] text-[11px] text-[#8B3118]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF5C35] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> No active template for {selectedZeroTemplateThemes.map((t) => t.name).join(', ')}.
              </span>
            </div>
          )}

          {/* Done Button */}
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-[#1A1816] hover:bg-black text-white text-[12px] font-medium rounded-[6px] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
