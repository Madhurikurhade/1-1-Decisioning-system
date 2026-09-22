import React, { useState } from 'react';
import { UseCaseState } from '../../types';
import { formatNumberWithCommas } from '../../utils/formatters';
import {
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Step3Props {
  state: UseCaseState;
  updateState: (updates: Partial<UseCaseState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Audience: React.FC<Step3Props> = ({
  state,
  updateState,
  onNext,
  onBack,
}) => {
  const [showHelper, setShowHelper] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Handle SQL text change
  const handleSqlChange = (newSql: string) => {
    // If query has been run before, check if editing made it stale
    const isNowStale = state.executedQuery !== null && newSql.trim() !== state.executedQuery.trim();
    updateState({
      sqlQuery: newSql,
      isStale: isNowStale,
      queryError: null,
    });
    setValidationMsg(null);
  };

  // Run SQL query simulation
  const handleRunShowCount = () => {
    const trimmed = state.sqlQuery.trim();
    if (!trimmed) {
      updateState({
        queryError: 'Please enter a valid SQL query.',
        audienceCount: null,
        isQueryRunning: false,
      });
      return;
    }

    updateState({ isQueryRunning: true, queryError: null });

    setTimeout(() => {
      // Basic syntax validation
      const lower = trimmed.toLowerCase();
      if (!lower.startsWith('select')) {
        updateState({
          isQueryRunning: false,
          queryError: 'Query error: Query must begin with a SELECT statement.',
          audienceCount: null,
        });
        return;
      }

      if (!lower.includes('from')) {
        updateState({
          isQueryRunning: false,
          queryError: 'Query error: Missing FROM clause in SQL statement.',
          audienceCount: null,
        });
        return;
      }

      // Check for intentional zero count simulation
      if (lower.includes('limit 0') || lower.includes('where 1=0')) {
        updateState({
          isQueryRunning: false,
          executedQuery: trimmed,
          audienceCount: 0,
          isStale: false,
          queryError: null,
        });
        setValidationMsg('Audience count returned 0 customers. Audience must contain customers to proceed.');
        return;
      }

      // Successful query: generate realistic count around 50,000
      let simulatedCount = 50000;
      if (lower.includes('unsecured')) simulatedCount = 68420;
      else if (lower.includes('secured')) simulatedCount = 41200;
      else if (lower.includes('credit')) simulatedCount = 89150;

      updateState({
        isQueryRunning: false,
        executedQuery: trimmed,
        audienceCount: simulatedCount,
        isStale: false,
        queryError: null,
      });
      setValidationMsg(null);
    }, 700);
  };

  // Check if Next is enabled
  const isNextEnabled =
    state.audienceCount !== null &&
    state.audienceCount > 0 &&
    !state.isStale &&
    !state.isQueryRunning &&
    !state.queryError;

  const handleNextClick = () => {
    if (!state.sqlQuery.trim()) {
      setValidationMsg('Please enter a SQL query.');
      return;
    }
    if (state.isStale || state.executedQuery === null) {
      setValidationMsg('The query has been modified. Please click "Show Count" to validate the audience count.');
      return;
    }
    if (state.audienceCount === 0) {
      setValidationMsg('Audience count is 0. The audience must contain customers to proceed.');
      return;
    }
    if (isNextEnabled) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-body">
      {/* ── The White Form Card Container ─────────────────────────────────── */}
      <div className="w-full bg-white rounded-[12px] p-6 sm:p-8 md:p-10 border border-[#E2DDD5] shadow-xs space-y-7">
        {/* ── Heading ───────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-[18px] font-bold text-[#1A1816] tracking-tight">Customer Group Setup</h2>
          <p className="text-[13px] text-[#807A70] mt-0.5">
            Define the customers eligible for this use case.
          </p>
        </div>

      {/* ── SQL Query Editor Area ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#1A1816]">
            <Code2 className="w-4 h-4 text-[#807A70]" />
            <span>SQL Query</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="text-[12px] text-[#1A3A5C] hover:text-[#142D48] flex items-center gap-1 font-medium cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to write a query?</span>
            {showHelper ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Collapsible Helper Box */}
        {showHelper && (
          <div className="p-3.5 bg-[#F2EEE7] border border-[#DCD5C8] rounded-[8px] text-[12px] text-[#3A3631] space-y-2">
            <p className="font-semibold text-[#1A1816]">Target Audience Query Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-[#807A70]">
              <li>Return a unique customer identifier such as <code className="bg-white px-1.5 py-0.5 rounded font-data text-[#1A1816]">context_id</code>.</li>
              <li>Query the feature store table <code className="bg-white px-1.5 py-0.5 rounded font-data text-[#1A1816]">dev.gold_customerfeaturestore</code>.</li>
              <li>Filter active users and non-null identifiers to ensure delivery deliverability.</li>
            </ul>
            <div className="text-[11px] text-[#807A70] font-data bg-white p-2 rounded border border-[#DCD5C8]">
              SELECT DISTINCT context_id FROM dev.gold_customerfeaturestore WHERE context_id IS NOT NULL;
            </div>
          </div>
        )}

        {/* Editor Box */}
        <div className="relative">
          <textarea
            value={state.sqlQuery}
            onChange={(e) => handleSqlChange(e.target.value)}
            placeholder="Sample SQL Query: SELECT DISTINCT context_id FROM dev.gold_customerfeaturestore WHERE context_id IS NOT NULL;"
            rows={7}
            className={`w-full p-4 font-data text-[13px] bg-white border rounded-[10px] outline-none transition-all resize-y leading-relaxed ${
              state.queryError
                ? 'border-2 border-[#DC2626]'
                : state.isStale
                ? 'border-2 border-[#D97706]'
                : 'border-[#DCD5C8] hover:border-[#807A70] focus:border-[#1A1816] focus:border-2'
            }`}
          />
        </div>

        {/* Stale Warning */}
        {state.isStale && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#FEF0D9] border border-[#D97706]/30 rounded-[8px] text-[12px] text-[#78350F] font-medium">
            <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0" />
            <span>
              The SQL query has changed since last execution. Previous count is now stale. Please click <strong>Show Count</strong> to revalidate.
            </span>
          </div>
        )}

        {/* Query Error Display */}
        {state.queryError && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-[8px] text-[12px] text-[#7F1D1D]">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{state.queryError}</div>
              <div className="text-[11px] mt-0.5 text-[#DC2626]">
                Check table and column definitions in <code>dev.gold_customerfeaturestore</code>.
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Show Count aligned right under textarea in dark beige like Back button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRunShowCount}
            disabled={state.isQueryRunning || !state.sqlQuery.trim()}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-[8px] text-[13px] font-semibold transition-all shadow-2xs ${
              state.isQueryRunning
                ? 'bg-[#EFECE6] text-[#807A70] cursor-wait'
                : 'bg-[#DDD8D0] hover:bg-[#D2CDC4] text-[#2C2824] border border-[#C8C2B8] cursor-pointer'
            }`}
          >
            {state.isQueryRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Query…</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Show Count</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Count Display Section ─────────────────────────────────────────── */}
      <div className="w-full md:w-1/3 pt-2">
        <label className="text-[13px] font-medium text-[#1A1816] mb-1.5 block">Count</label>
        <div className="relative">
          <input
            type="text"
            readOnly
            value={
              state.isQueryRunning
                ? 'Calculating…'
                : state.audienceCount !== null
                ? state.isStale
                  ? `${formatNumberWithCommas(state.audienceCount)} (stale)`
                  : formatNumberWithCommas(state.audienceCount)
                : '50,000'
            }
            className={`w-full h-[42px] px-3.5 rounded-[8px] text-[14px] font-data font-semibold outline-none cursor-default transition-all ${
              state.isStale
                ? 'bg-[#FEF0D9] text-[#78350F] border border-[#D97706]'
                : 'bg-[#FAF9F7] text-[#1A1816] border border-[#DCD5C8]'
            }`}
          />
        </div>
      </div>

      {/* Validation Message */}
      {validationMsg && (
        <div className="flex items-center gap-2 p-3 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-[8px] text-[12px] text-[#7F1D1D] font-medium">
          <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
          <span>{validationMsg}</span>
        </div>
      )}
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
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          className={`px-8 py-2 rounded-[8px] text-[13.5px] font-medium transition-all ${
            isNextEnabled
              ? 'bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] hover:text-[#1A1816] cursor-pointer'
              : 'bg-[#F2EEE7] text-[#A8A299] cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
