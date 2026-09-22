import React, { useState } from 'react';
import { UseCaseState, ProductL1, Partner, ConversionMetric, CoaOperator } from '../../types';
import {
  PRODUCT_L1_OPTIONS,
  PARTNER_OPTIONS,
  PRODUCT_L2_MAP,
  PRODUCT_L3_OPTIONS,
  CONVERSION_METRICS,
  COA_OPERATORS,
} from '../../data/mockData';
import { SingleSelectDropdown } from '../SingleSelectDropdown';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { generateSuggestedUseCaseName, formatNumberWithCommas } from '../../utils/formatters';
import { Sparkles, AlertCircle, Lock } from 'lucide-react';

interface Step1Props {
  state: UseCaseState;
  updateState: (updates: Partial<UseCaseState>) => void;
  onNext: () => void;
  onBack?: () => void;
}

export const Step1Objective: React.FC<Step1Props> = ({ state, updateState, onNext, onBack }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [decimalWarning, setDecimalWarning] = useState<string | null>(null);

  // Check if Product L3 should appear: Partner = BFL AND Product L2 contains SOL
  const isL3Visible = state.partner === 'BFL' && state.productL2.includes('SOL');

  // When L1 changes, clear invalid L2
  const handleL1Change = (newVal: string) => {
    const l1 = newVal as ProductL1;
    const validL2Options = PRODUCT_L2_MAP[l1] || [];
    const filteredL2 = state.productL2.filter((item) => validL2Options.includes(item));

    // Check if L3 condition would still hold
    const willL3Hold = state.partner === 'BFL' && filteredL2.includes('SOL');
    const newL3 = willL3Hold ? state.productL3 : [];

    const updates: Partial<UseCaseState> = {
      productL1: l1,
      productL2: filteredL2,
      productL3: newL3,
    };

    if (!state.isNameManuallyEdited) {
      updates.useCaseName = generateSuggestedUseCaseName(
        state.conversionQuantity,
        state.conversionMetric,
        l1,
        state.partner,
        filteredL2,
        newL3
      );
    }

    updateState(updates);
    if (errors.productL1) setErrors((prev) => ({ ...prev, productL1: '' }));
  };

  // When Partner changes
  const handlePartnerChange = (newVal: string) => {
    const p = newVal as Partner;
    const willL3Hold = p === 'BFL' && state.productL2.includes('SOL');
    const newL3 = willL3Hold ? state.productL3 : [];

    const updates: Partial<UseCaseState> = {
      partner: p,
      productL3: newL3,
    };

    if (!state.isNameManuallyEdited) {
      updates.useCaseName = generateSuggestedUseCaseName(
        state.conversionQuantity,
        state.conversionMetric,
        state.productL1,
        p,
        state.productL2,
        newL3
      );
    }

    updateState(updates);
    if (errors.partner) setErrors((prev) => ({ ...prev, partner: '' }));
  };

  // When Product L2 changes
  const handleL2Change = (newVals: string[]) => {
    const willL3Hold = state.partner === 'BFL' && newVals.includes('SOL');
    const newL3 = willL3Hold ? state.productL3 : [];

    const updates: Partial<UseCaseState> = {
      productL2: newVals,
      productL3: newL3,
    };

    if (!state.isNameManuallyEdited) {
      updates.useCaseName = generateSuggestedUseCaseName(
        state.conversionQuantity,
        state.conversionMetric,
        state.productL1,
        state.partner,
        newVals,
        newL3
      );
    }

    updateState(updates);
    if (errors.productL2) setErrors((prev) => ({ ...prev, productL2: '' }));
  };

  // When Product L3 changes
  const handleL3Change = (newVals: string[]) => {
    const updates: Partial<UseCaseState> = { productL3: newVals };
    if (!state.isNameManuallyEdited) {
      updates.useCaseName = generateSuggestedUseCaseName(
        state.conversionQuantity,
        state.conversionMetric,
        state.productL1,
        state.partner,
        state.productL2,
        newVals
      );
    }
    updateState(updates);
    if (errors.productL3) setErrors((prev) => ({ ...prev, productL3: '' }));
  };

  // When Conversion Metric changes
  const handleMetricChange = (newVal: string) => {
    const m = newVal as ConversionMetric;
    const updates: Partial<UseCaseState> = { conversionMetric: m };
    if (!state.isNameManuallyEdited) {
      updates.useCaseName = generateSuggestedUseCaseName(
        state.conversionQuantity,
        m,
        state.productL1,
        state.partner,
        state.productL2,
        state.productL3
      );
    }
    updateState(updates);
    if (errors.conversionMetric) setErrors((prev) => ({ ...prev, conversionMetric: '' }));
  };

  // When Conversion Quantity changes (integer only with pop-up notification on decimal)
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    // Detect if user typed a decimal or non-digit
    if (/[.,]/.test(inputVal) && inputVal.includes('.')) {
      setDecimalWarning('Whole numbers only, decimals are not accepted');
      setTimeout(() => setDecimalWarning(null), 3000);
    } else {
      setDecimalWarning(null);
    }

    const cleanNumber = inputVal.replace(/[^0-9]/g, '');
    const updates: Partial<UseCaseState> = { conversionQuantity: cleanNumber };

    if (!state.isNameManuallyEdited) {
      updates.useCaseName = generateSuggestedUseCaseName(
        cleanNumber,
        state.conversionMetric,
        state.productL1,
        state.partner,
        state.productL2,
        state.productL3
      );
    }
    updateState(updates);
    if (errors.conversionQuantity) setErrors((prev) => ({ ...prev, conversionQuantity: '' }));
  };

  // COA Handlers
  const handleCoaOpChange = (op: string) => {
    updateState({ coaOperator: op as CoaOperator });
    if (errors.coa) setErrors((prev) => ({ ...prev, coa: '' }));
  };

  const handleCoaVal1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    updateState({ coaValue1: val });
    if (errors.coa) setErrors((prev) => ({ ...prev, coa: '' }));
  };

  const handleCoaVal2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    updateState({ coaValue2: val });
    if (errors.coa) setErrors((prev) => ({ ...prev, coa: '' }));
  };

  // Use Case Name Manual Edit
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({
      useCaseName: e.target.value,
      isNameManuallyEdited: true,
    });
    if (errors.useCaseName) setErrors((prev) => ({ ...prev, useCaseName: '' }));
  };

  const handleResetNameToSuggested = () => {
    const suggested = generateSuggestedUseCaseName(
      state.conversionQuantity,
      state.conversionMetric,
      state.productL1,
      state.partner,
      state.productL2,
      state.productL3
    );
    updateState({
      useCaseName: suggested,
      isNameManuallyEdited: false,
    });
  };

  // Validation before next
  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    if (!state.productL1) newErrors.productL1 = 'Please select Product L1';
    if (!state.partner) newErrors.partner = 'Please select Partner';

    // L2 is required unless Product L1 is Credit Card (where L2 is hidden)
    if (state.productL1 !== 'Credit Card' && state.productL2.length === 0) {
      newErrors.productL2 = 'Please select at least one Product L2 option';
    }

    // L3 is required if visible
    if (isL3Visible && state.productL3.length === 0) {
      newErrors.productL3 = 'Please select at least one Product L3 option';
    }

    if (!state.conversionMetric) newErrors.conversionMetric = 'Please select Conversion Metric';
    if (!state.conversionQuantity || parseInt(state.conversionQuantity, 10) <= 0) {
      newErrors.conversionQuantity = 'Please enter a valid whole number quantity';
    }

    // COA validation: value 0-100, and for Between: val2 > val1
    const v1 = parseFloat(state.coaValue1);
    if (isNaN(v1) || v1 < 0 || v1 > 100) {
      newErrors.coa = 'COA value must be between 0% and 100%';
    } else if (state.coaOperator === 'Between') {
      const v2 = parseFloat(state.coaValue2);
      if (isNaN(v2) || v2 < 0 || v2 > 100) {
        newErrors.coa = 'Second COA value must be between 0% and 100%';
      } else if (v2 <= v1) {
        newErrors.coa = 'Second value must be greater than first value';
      }
    }

    if (!state.useCaseName.trim()) {
      newErrors.useCaseName = 'Please enter a Use Case Name';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Passed validation
    setErrors({});
    onNext();
  };

  const l2Options = state.productL1 ? PRODUCT_L2_MAP[state.productL1] || [] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150 font-body">
      {/* ── Edit Mode Policy Advisory Banner (Neutral theme styling, no yellow) ─ */}
      {state.isEditMode && (
        <div className="p-4 rounded-[10px] bg-[#F8F6F1] border border-[#E2DDD5] flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#E5DFD5] text-[#555047] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Lock className="w-4 h-4 text-[#4A453E]" />
          </div>
          <div className="text-[13px] text-[#4A453E] leading-relaxed">
            <p className="font-semibold text-[#1A1816] text-[13.5px] mb-0.5">
              Edit Mode Policy: Core Attributes Locked
            </p>
            <span>
              Product, Partner, and Goal are locked to preserve attribution consistency. You can modify the Conversion Quantity, COA Target %, Budget, Channels &amp; Themes, and extend the Timeline.
            </span>
          </div>
        </div>
      )}

      {/* ── The White Form Card Container ─────────────────────────────────── */}
      <div className="w-full bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E2DDD5] shadow-xs space-y-8">
        {/* ── First Row: 4 Columns Aligned with Canva Wireframe (Image 4) ──────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Column 1: Select Product L1 */}
          <SingleSelectDropdown
            label="Select Product L1"
            placeholder="All L1 Products"
            options={PRODUCT_L1_OPTIONS}
            value={state.productL1}
            onChange={handleL1Change}
            disabled={Boolean(state.isEditMode)}
            error={errors.productL1}
          />

          {/* Column 2: Select Partner* */}
          <SingleSelectDropdown
            label="Select Partner"
            placeholder="All Partners"
            required
            options={PARTNER_OPTIONS}
            value={state.partner}
            onChange={handlePartnerChange}
            disabled={Boolean(state.isEditMode)}
            error={errors.partner}
          />

          {/* Column 3: Select Product L2* (Multi-select) */}
          {state.productL1 !== 'Credit Card' ? (
            <MultiSelectDropdown
              label="Select Product L2"
              placeholder={l2Options.length > 0 ? 'All L2 Products' : 'Select L1 first'}
              required
              disabled={Boolean(state.isEditMode) || !state.productL1}
              options={l2Options}
              selectedValues={state.productL2}
              onChange={handleL2Change}
              error={errors.productL2}
            />
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-[13px] font-medium text-[#1A1816] mb-1.5">Select Product L2</span>
              <div className="h-[42px] px-3.5 flex items-center border border-[#D1CCC4] rounded-[8px] bg-[#F9F7F4] text-[#807A70] text-[13px]">
                Not applicable
              </div>
            </div>
          )}

          {/* Column 4: Select Product L3 (Multi-select, conditional) */}
          {isL3Visible ? (
            <MultiSelectDropdown
              label="Select Product L3"
              placeholder="All L3 Products"
              required
              disabled={Boolean(state.isEditMode)}
              options={PRODUCT_L3_OPTIONS}
              selectedValues={state.productL3}
              onChange={handleL3Change}
              error={errors.productL3}
            />
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-[13px] font-medium text-[#1A1816] mb-1.5">Select Product L3</span>
              <div className="h-[42px] px-3.5 flex items-center border border-[#D1CCC4] rounded-[8px] bg-[#F9F7F4] text-[#807A70] text-[13px]">
                All L3 Products
              </div>
            </div>
          )}
        </div>

        {/* ── Second Row: 4 Columns (Row 2 items aligned under Row 1) ──────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Column 1: Conversion Metric (aligned under Select Product L1) */}
          <SingleSelectDropdown
            label="Conversion Metric"
            placeholder="All Conversion Metric"
            required
            options={CONVERSION_METRICS}
            value={state.conversionMetric}
            onChange={handleMetricChange}
            disabled={Boolean(state.isEditMode)}
            error={errors.conversionMetric}
          />

          {/* Column 2: Conversion Quantity (aligned under Select Partner) */}
          <div className="flex flex-col relative">
            <label className="text-[13px] font-medium text-[#1A1816] mb-1.5 flex items-center gap-0.5">
              <span>Conversion Quantity</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={state.conversionQuantity ? formatNumberWithCommas(state.conversionQuantity) : ''}
                onChange={handleQuantityChange}
                placeholder="sample - 5000"
                className={`w-full h-[42px] px-3.5 py-2 rounded-[8px] text-[13.5px] bg-white border transition-colors outline-none ${
                  errors.conversionQuantity
                    ? 'border-[#DC2626]'
                    : 'border-[#D1CCC4] hover:bg-[#F9F7F4] focus:border-[#C8C2B8]'
                }`}
              />

              {/* Pop-up line only shown when user enters decimal/invalid character */}
              {decimalWarning && (
                <div className="absolute left-0 -bottom-6 z-20 flex items-center gap-1 text-[11px] text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-[4px] border border-[#DC2626]/20 shadow-xs animate-in fade-in duration-150 whitespace-nowrap">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{decimalWarning}</span>
                </div>
              )}
            </div>
            {/* Small orange line + achieved metric in Edit Mode */}
            {state.isEditMode && (
              <div className="flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-150">
                <span className="w-3 h-[2px] bg-[#FF5C35] rounded-full shrink-0" />
                <span className="text-[12px] font-medium text-[#C2410C]">
                  {state.achievedConversions || '5,000'} achieved
                </span>
              </div>
            )}
            {errors.conversionQuantity && !decimalWarning && (
              <span className="text-[11px] text-[#DC2626] mt-1 font-medium">{errors.conversionQuantity}</span>
            )}
          </div>

          {/* Column 3: COA (aligned under Select Product L2) */}
          <div className="flex flex-col relative">
            <label className="text-[13px] font-medium text-[#1A1816] mb-1.5 flex items-center gap-0.5">
              <span>COA</span>
            </label>

            <div className="flex items-center gap-2">
              {/* Operator dropdown matching Conversion Metric dropdown */}
              <div className="w-[110px] flex-shrink-0">
                <SingleSelectDropdown
                  options={COA_OPERATORS}
                  value={state.coaOperator}
                  onChange={(val) => handleCoaOpChange(val as CoaOperator)}
                />
              </div>

              {/* Value 1 */}
              <div className="relative flex-1 min-w-[70px]">
                <input
                  type="text"
                  value={state.coaValue1}
                  onChange={handleCoaVal1Change}
                  placeholder="sample - 2%"
                  className="w-full h-[42px] pl-2.5 pr-6 bg-white border border-[#D1CCC4] rounded-[8px] text-[13.5px] outline-none hover:bg-[#F9F7F4] focus:border-[#C8C2B8] transition-colors"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-[#807A70] font-semibold pointer-events-none">
                  %
                </span>
              </div>

              {/* Value 2 (if Between) */}
              {state.coaOperator === 'Between' && (
                <>
                  <span className="text-[12px] text-[#807A70] font-medium">to</span>
                  <div className="relative flex-1 min-w-[70px]">
                    <input
                      type="text"
                      value={state.coaValue2}
                      onChange={handleCoaVal2Change}
                      placeholder="2.5"
                      className="w-full h-[42px] pl-2.5 pr-6 bg-white border border-[#D1CCC4] rounded-[8px] text-[13.5px] outline-none hover:bg-[#F9F7F4] focus:border-[#C8C2B8] transition-colors"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-[#807A70] font-semibold pointer-events-none">
                      %
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Small orange line + achieved metric in Edit Mode */}
            {state.isEditMode && (
              <div className="flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-150">
                <span className="w-3 h-[2px] bg-[#FF5C35] rounded-full shrink-0" />
                <span className="text-[12px] font-medium text-[#C2410C]">
                  Till date {state.tillDateCoa || '3%'} COA
                </span>
              </div>
            )}

            {/* Dynamic error pop-up only when validation fails */}
            {errors.coa && (
              <div className="absolute left-0 -bottom-6 z-20 flex items-center gap-1 text-[11px] text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-[4px] border border-[#DC2626]/20 shadow-xs whitespace-nowrap">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.coa}</span>
              </div>
            )}
          </div>

          {/* Column 4: Empty space to match Image 4 alignment */}
          <div className="hidden md:block" />
        </div>

        {/* ── Third Row: Use Case Name (Width matches Columns 1 & 2 in Image 4) ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-[#1A1816] flex items-center gap-0.5">
                <span>Use Case Name</span>
              </label>
              {state.isNameManuallyEdited && (
                <button
                  type="button"
                  onClick={handleResetNameToSuggested}
                  className="text-[12px] text-[#FF5C35] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Reset name
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={state.useCaseName}
                onChange={handleNameChange}
                placeholder="Sample use case name"
                className={`w-full h-[42px] px-3.5 py-2 rounded-[8px] text-[13.5px] bg-white border outline-none transition-colors ${
                  errors.useCaseName
                    ? 'border-[#DC2626]'
                    : 'border-[#D1CCC4] hover:bg-[#F9F7F4] focus:border-[#C8C2B8]'
                }`}
              />
            </div>
            <span className="text-[11px] text-[#A8A299] mt-1.5 font-normal tracking-wide">
              This is system generated and editable
            </span>
            {errors.useCaseName && (
              <span className="text-[11px] text-[#DC2626] mt-1 font-medium">{errors.useCaseName}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Actions Bar (Space & Bottom Buttons on Canvas Background) ── */}
      <div className="flex items-center justify-between pt-4 pb-12">
        {/* Back Button (Active and working on first page as requested) */}
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] transition-colors cursor-pointer"
        >
          Back
        </button>

        {/* Next Button */}
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
