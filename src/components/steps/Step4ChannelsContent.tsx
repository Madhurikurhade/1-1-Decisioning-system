import React, { useState, useRef, useEffect } from 'react';
import { UseCaseState, ChannelContentConfig, ThemeOption } from '../../types';
import { CHANNELS_AVAILABLE, VENDORS_BY_CHANNEL, THEMES_BY_VENDOR } from '../../data/mockData';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { AlertCircle, AlertTriangle, ArrowRight, Check, ChevronDown, Search, X } from 'lucide-react';

interface Step4Props {
  state: UseCaseState;
  updateState: (updates: Partial<UseCaseState>) => void;
  onNext: () => void;
  onBack: () => void;
  onGoToStep2: () => void;
}

export const Step4ChannelsContent: React.FC<Step4Props> = ({
  state,
  updateState,
  onNext,
  onBack,
  onGoToStep2,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [themeSearch, setThemeSearch] = useState<Record<string, string>>({});
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [showChannelRedirectModal, setShowChannelRedirectModal] = useState(false);
  const channelDropdownRef = useRef<HTMLDivElement>(null);
  const channelSearchInputRef = useRef<HTMLInputElement>(null);

  // Auto-selected channels from Step 2 (Budget & Schedule)
  const currentChannels = state.selectedChannels.length > 0 ? state.selectedChannels : ['WhatsApp', 'RCS', 'SMS'];
  const allAvailableChannels = ['WhatsApp', 'RCS', 'SMS'];

  // Close channel dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target as Node)) {
        setIsChannelDropdownOpen(false);
      }
    }
    if (isChannelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => channelSearchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChannelDropdownOpen]);

  const handleAttemptEditChannel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsChannelDropdownOpen(false);
    setShowChannelRedirectModal(true);
  };

  const getChannelConfig = (ch: string): ChannelContentConfig => {
    return state.channelConfigs[ch] || { vendors: [], themes: [] };
  };

  const handleVendorsChange = (ch: string, newVendors: string[]) => {
    const prevConfig = getChannelConfig(ch);

    // Filter themes to only those belonging to remaining selected vendors
    const availableThemesForVendors = newVendors.flatMap(
      (v) => THEMES_BY_VENDOR[v] || []
    );
    const validThemeIds = availableThemesForVendors.map((t) => t.id);
    const filteredThemes = prevConfig.themes.filter((tid) => validThemeIds.includes(tid));

    const updatedConfigs = {
      ...state.channelConfigs,
      [ch]: {
        vendors: newVendors,
        themes: filteredThemes,
      },
    };

    updateState({ channelConfigs: updatedConfigs });
    if (errors[ch]) setErrors((prev) => ({ ...prev, [ch]: '' }));
  };

  const handleToggleTheme = (ch: string, themeId: string) => {
    const prevConfig = getChannelConfig(ch);
    let newThemes: string[];
    if (prevConfig.themes.includes(themeId)) {
      newThemes = prevConfig.themes.filter((id) => id !== themeId);
    } else {
      newThemes = [...prevConfig.themes, themeId];
    }

    const updatedConfigs = {
      ...state.channelConfigs,
      [ch]: {
        ...prevConfig,
        themes: newThemes,
      },
    };

    updateState({ channelConfigs: updatedConfigs });
    if (errors[ch]) setErrors((prev) => ({ ...prev, [ch]: '' }));
  };

  const handleSelectAllThemes = (ch: string, availableThemes: ThemeOption[]) => {
    const prevConfig = getChannelConfig(ch);
    const allIds = availableThemes.map((t) => t.id);
    const merged = Array.from(new Set([...prevConfig.themes, ...allIds]));
    const updatedConfigs = {
      ...state.channelConfigs,
      [ch]: { ...prevConfig, themes: merged },
    };
    updateState({ channelConfigs: updatedConfigs });
  };

  const handleClearAllThemes = (ch: string) => {
    const prevConfig = getChannelConfig(ch);
    const updatedConfigs = {
      ...state.channelConfigs,
      [ch]: { ...prevConfig, themes: [] },
    };
    updateState({ channelConfigs: updatedConfigs });
  };

  // Validation before proceed to Review
  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    currentChannels.forEach((ch) => {
      const cfg = getChannelConfig(ch);
      if (cfg.vendors.length === 0) {
        newErrors[ch] = `Please select at least one vendor for ${ch}`;
      } else if (cfg.themes.length === 0) {
        newErrors[ch] = `Please select at least one theme for ${ch}`;
      }
    });

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
      <div className="w-full bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E2DDD5] shadow-xs space-y-7">
        {/* ── Select Channel Dropdown (Image 2 style with auto-selected channels from budget page) ─────────── */}
        <div className="pb-3 border-b border-[#ECE7DE]">
          <div className="w-full sm:w-72 relative" ref={channelDropdownRef}>
            <label className="text-[13px] font-medium text-[#1A1816] mb-1.5 block">
              Select Channel
            </label>

            {/* Trigger Button matching Image 2 */}
            <button
              type="button"
              onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
              className={`w-full min-h-[42px] px-3.5 py-2 rounded-[8px] text-left text-[14px] flex items-center justify-between transition-colors duration-150 outline-none cursor-pointer ${
                isChannelDropdownOpen
                  ? 'bg-[#F9F7F4] border border-[#DCD5C8] shadow-xs'
                  : 'bg-white border border-[#DCD5C8] hover:bg-[#F9F7F4]'
              }`}
            >
              <span className="truncate pr-2 text-[#1A1816] font-medium">
                {state.selectedChannels.length === 0
                  ? '3 selected'
                  : state.selectedChannels.length === 1
                  ? state.selectedChannels[0]
                  : `${state.selectedChannels.length} selected`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#807A70] transition-transform duration-200 flex-shrink-0 ${
                  isChannelDropdownOpen ? 'rotate-180 text-[#1A1816]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu matching Image 2 */}
            {isChannelDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-white rounded-[8px] border border-[#DCD5C8] shadow-lg p-2.5 w-full min-w-[260px] animate-in fade-in zoom-in-95 duration-100">
                {/* Header Controls: Search + Select all / Clear all */}
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#ECE7DE]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-[#807A70] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={channelSearchInputRef}
                      type="text"
                      value={channelSearchQuery}
                      onChange={(e) => setChannelSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-8 pr-2 py-1 text-[12px] bg-[#FAF9F7] text-[#1A1816] border border-[#DCD5C8] rounded-[5px] outline-none focus:bg-white placeholder:text-[#807A70]"
                    />
                  </div>

                  {/* Select all | Clear all in coral/orange */}
                  <div className="flex items-center text-[11px] font-semibold text-[#FF5C35] whitespace-nowrap pl-1">
                    <button
                      type="button"
                      onClick={handleAttemptEditChannel}
                      className="hover:underline hover:text-[#E54A25] cursor-pointer"
                    >
                      Select all
                    </button>
                    <span className="mx-1 text-[#DCD5C8]">|</span>
                    <button
                      type="button"
                      onClick={handleAttemptEditChannel}
                      className="hover:underline hover:text-[#E54A25] cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                {/* Channel options list with auto-selected state */}
                <div className="max-h-56 overflow-y-auto pr-0.5 space-y-1">
                  {allAvailableChannels
                    .filter((c) => c.toLowerCase().includes(channelSearchQuery.toLowerCase()))
                    .map((channelName) => {
                      const isSelected =
                        state.selectedChannels.length === 0
                          ? true
                          : state.selectedChannels.includes(channelName);
                      return (
                        <div
                          key={channelName}
                          onClick={handleAttemptEditChannel}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] cursor-pointer transition-colors duration-100 ${
                            isSelected
                              ? 'bg-[#FFF2ED] text-[#1A1816] font-medium'
                              : 'hover:bg-[#F5F2EC] text-[#3A3631]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-[#1A1816] border border-[#1A1816]'
                                  : 'border border-[#807A70] bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                            </span>
                            <span className="truncate">{channelName}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columns for each channel (fixed height and no outer border) ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {currentChannels.map((channel) => {
            const config = getChannelConfig(channel);
            const availableVendors = VENDORS_BY_CHANNEL[channel] || ['Infobip', 'Netcore'];
            const q = themeSearch[channel] || '';

            // Gather all themes for selected vendors grouped by vendor
            const vendorThemeGroups = config.vendors.map((vendorName) => {
              const themes = (THEMES_BY_VENDOR[vendorName] || []).filter((t) =>
                t.name.toLowerCase().includes(q.toLowerCase())
              );
              return { vendorName, themes };
            });

            const allAvailableThemesForChannel = config.vendors.flatMap(
              (v) => THEMES_BY_VENDOR[v] || []
            );

            // Check if any selected theme has 0 templates
            const selectedZeroTemplateThemes = allAvailableThemesForChannel.filter(
              (t) => config.themes.includes(t.id) && t.templateCount === 0
            );

            return (
              <div
                key={channel}
                className="bg-[#F5F2EB] rounded-[12px] p-5 flex flex-col justify-between h-[560px]"
              >
                <div className="space-y-4">
                  {/* Channel Header Pill Centered (Image 1) */}
                  <div className="flex items-center justify-center pb-1">
                    <span className="px-5 py-1 rounded-[6px] bg-[#E5DFD5] text-[#3A3631] text-[13px] font-semibold">
                      {channel}
                    </span>
                  </div>

                  {/* Select Vendor Dropdown */}
                  <div className="space-y-1">
                    <MultiSelectDropdown
                      label="Select Vendor"
                      placeholder="All Vendors"
                      options={availableVendors}
                      selectedValues={config.vendors}
                      onChange={(newVendors) => handleVendorsChange(channel, newVendors)}
                    />
                  </div>

                  {/* Select Themes Area */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-[#1A1816] block">
                      Select Themes
                    </label>

                    {/* Search Input Box */}
                    {config.vendors.length > 0 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#807A70] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={q}
                          onChange={(e) =>
                            setThemeSearch((prev) => ({ ...prev, [channel]: e.target.value }))
                          }
                          placeholder="Search themes..."
                          className="w-full pl-8 pr-7 py-1.5 text-[12px] bg-white border border-[#D1CCC4] rounded-[6px] outline-none focus:border-[#1A1816] placeholder:text-[#807A70]"
                        />
                        {q && (
                          <button
                            type="button"
                            onClick={() => setThemeSearch((prev) => ({ ...prev, [channel]: '' }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#807A70] hover:text-[#1A1816]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Select all | Clear all with count */}
                    {config.vendors.length > 0 && (
                      <div className="flex items-center justify-between px-0.5 pt-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5C35]">
                          <button
                            type="button"
                            onClick={() => handleSelectAllThemes(channel, allAvailableThemesForChannel)}
                            className="hover:underline hover:text-[#E54A25] cursor-pointer"
                          >
                            Select all
                          </button>
                          <span className="text-[#DCD5C8]">|</span>
                          <button
                            type="button"
                            onClick={() => handleClearAllThemes(channel)}
                            className="hover:underline hover:text-[#E54A25] cursor-pointer"
                          >
                            Clear all
                          </button>
                        </div>
                        <span className="text-[11px] text-[#807A70] font-normal font-data">
                          {config.themes.length}/{allAvailableThemesForChannel.length}
                        </span>
                      </div>
                    )}

                    {/* Outlined Scrollable Theme Box with FIXED height so empty space stays blank */}
                    <div className="border border-[#D1CCC4] rounded-[8px] p-3 h-[255px] overflow-y-auto space-y-3 bg-white">
                      {config.vendors.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center text-[12px] text-[#807A70] px-4">
                          Please select vendor(s) above to view applicable themes
                        </div>
                      ) : vendorThemeGroups.length === 0 || allAvailableThemesForChannel.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center text-[12px] text-[#807A70]">
                          No themes found
                        </div>
                      ) : (
                        vendorThemeGroups.map((grp) => (
                          <div key={grp.vendorName} className="space-y-1">
                            {/* Vendor Subheading in Dark Warm Neutral */}
                            <div className="text-[11px] font-bold text-[#3D372E] uppercase tracking-wider px-1 pt-1 pb-0.5 border-b border-[#ECE7DE]">
                              {grp.vendorName}
                            </div>

                            {grp.themes.map((theme) => {
                              const isSelected = config.themes.includes(theme.id);
                              return (
                                <div
                                  key={theme.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleToggleTheme(channel, theme.id);
                                  }}
                                  className="flex items-center justify-between px-2 py-1.5 rounded-[5px] text-[12px] cursor-pointer transition-colors hover:bg-[#FAF9F7] text-[#1A1816]"
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

                                  {/* Active Template Count */}
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
                  </div>
                </div>

                {/* Validation error for this channel */}
                {errors[channel] && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#DC2626] font-medium pt-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors[channel]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Actions Bar (Beige Buttons) ── */}
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
      {/* ── Channel Redirect Confirmation Modal ── */}
      {showChannelRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[12px] border border-[#DCD5C8] shadow-xl max-w-md w-full p-6 space-y-4 font-body animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FFF2ED] flex items-center justify-center flex-shrink-0 text-[#FF5C35]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-[16px] font-semibold text-[#1A1816]">
                  Modify Channel Selection
                </h3>
                <p className="text-[13px] text-[#807A70] leading-relaxed">
                  Channels are configured and budgeted in <strong className="text-[#1A1816]">Step 2 (Budget &amp; Schedule)</strong>. Would you like to redirect to the Budget &amp; Schedule page to modify which channels are active?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECE7DE]">
              <button
                type="button"
                onClick={() => setShowChannelRedirectModal(false)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium text-[#3A3631] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChannelRedirectModal(false);
                  onGoToStep2();
                }}
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium bg-[#FF5C35] text-white hover:bg-[#E54A25] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>Go to Budget &amp; Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
