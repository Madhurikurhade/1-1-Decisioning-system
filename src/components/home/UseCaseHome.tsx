import React, { useState, useMemo } from 'react';
import { UseCaseRecord, LifecycleStatus } from '../../types';
import {
  CreatedDateDropdown,
  CreatedDateFilterValue,
} from './CreatedDateDropdown';
import {
  Search,
  ChevronDown,
  MoreVertical,
  Eye,
  Edit3,
  Copy,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Archive,
  Trash2,
  Info,
} from 'lucide-react';
import { ViewUseCaseModal } from './ViewUseCaseModal';
import {
  ActionConfirmationModal,
  ActionModalState,
  ConfirmationActionType,
} from './ActionConfirmationModal';

interface UseCaseHomeProps {
  useCases: UseCaseRecord[];
  onNewUseCase: () => void;
  onEditUseCase: (useCase: UseCaseRecord) => void;
  onOpenDecisionInsight: (useCase: UseCaseRecord) => void;
  onDuplicateUseCase: (useCase: UseCaseRecord) => void;
  onUpdateLifecycleStatus: (id: string, newStatus: LifecycleStatus) => void;
  onDeleteUseCase?: (id: string) => void;
  onBatchDeleteUseCases?: (ids: string[]) => void;
  onBatchArchiveUseCases?: (ids: string[]) => void;
}

const LIFECYCLE_OPTIONS: (LifecycleStatus | 'All')[] = [
  'All',
  'Draft',
  'Scheduled',
  'Active',
  'Paused',
  'Stopped',
  'Completed',
  'Archived',
];

export const UseCaseHome: React.FC<UseCaseHomeProps> = ({
  useCases,
  onNewUseCase,
  onEditUseCase,
  onOpenDecisionInsight,
  onDuplicateUseCase,
  onUpdateLifecycleStatus,
  onDeleteUseCase,
  onBatchDeleteUseCases,
  onBatchArchiveUseCases,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Created Date filter state
  const [dateFilter, setDateFilter] = useState<CreatedDateFilterValue>(null);

  // Lifecycle Status filter state
  const [selectedLifecycle, setSelectedLifecycle] = useState<LifecycleStatus | 'All'>('All');
  const [isLifecycleMenuOpen, setIsLifecycleMenuOpen] = useState(false);

  // Draft filter toggle (from the "Draft" pill button on the right)
  const [draftFilterActive, setDraftFilterActive] = useState(false);

  // Multi-select state for drafts
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);

  // Action Menu dropdown state: ID of the currently open action menu
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // View modal state
  const [viewingUseCase, setViewingUseCase] = useState<UseCaseRecord | null>(null);

  // Confirmation review modal state for duplicate, pause, resume, stop, archive, delete
  const [actionModal, setActionModal] = useState<ActionModalState | null>(null);

  // Filter use cases based on search, date, lifecycle, and draft toggle
  const filteredUseCases = useMemo(() => {
    return useCases.filter((item) => {
      // 1. Search by Use Case Name only
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!item.useCaseName.toLowerCase().includes(q)) {
          return false;
        }
      }

      // 2. Draft quick filter button
      if (draftFilterActive && item.lifecycleStatus !== 'Draft') {
        return false;
      }

      // 3. Lifecycle status filter
      if (selectedLifecycle !== 'All' && item.lifecycleStatus !== selectedLifecycle) {
        return false;
      }

      // 4. Created date filter
      if (dateFilter) {
        const itemDate = new Date(item.createdAt);
        const refDate = new Date(2026, 8, 11); // Reference: 11 Sept 2026

        if (dateFilter.type === 'preset') {
          const preset = dateFilter.value;
          if (preset === 'Today') {
            if (
              itemDate.getFullYear() !== refDate.getFullYear() ||
              itemDate.getMonth() !== refDate.getMonth() ||
              itemDate.getDate() !== refDate.getDate()
            ) {
              return false;
            }
          } else if (preset === 'Yesterday') {
            const yesterday = new Date(refDate);
            yesterday.setDate(refDate.getDate() - 1);
            if (
              itemDate.getFullYear() !== yesterday.getFullYear() ||
              itemDate.getMonth() !== yesterday.getMonth() ||
              itemDate.getDate() !== yesterday.getDate()
            ) {
              return false;
            }
          } else if (preset === 'Last 7 Days') {
            const diffDays = (refDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays < 0 || diffDays > 7) return false;
          } else if (preset === 'Last 30 Days') {
            const diffDays = (refDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays < 0 || diffDays > 30) return false;
          } else if (preset === 'This Week') {
            const day = refDate.getDay();
            const diffToMon = (day + 6) % 7;
            const monday = new Date(refDate);
            monday.setDate(refDate.getDate() - diffToMon);
            monday.setHours(0, 0, 0, 0);
            if (itemDate < monday || itemDate > refDate) return false;
          } else if (preset === 'Last Week') {
            const day = refDate.getDay();
            const diffToMon = (day + 6) % 7;
            const thisMonday = new Date(refDate);
            thisMonday.setDate(refDate.getDate() - diffToMon);
            thisMonday.setHours(0, 0, 0, 0);
            const lastMonday = new Date(thisMonday);
            lastMonday.setDate(thisMonday.getDate() - 7);
            if (itemDate < lastMonday || itemDate >= thisMonday) return false;
          } else if (preset === 'This Month') {
            if (
              itemDate.getFullYear() !== refDate.getFullYear() ||
              itemDate.getMonth() !== refDate.getMonth()
            ) {
              return false;
            }
          } else if (preset === 'Last Month') {
            const lastMonth = refDate.getMonth() === 0 ? 11 : refDate.getMonth() - 1;
            const lastMonthYear =
              refDate.getMonth() === 0
                ? refDate.getFullYear() - 1
                : refDate.getFullYear();
            if (
              itemDate.getFullYear() !== lastMonthYear ||
              itemDate.getMonth() !== lastMonth
            ) {
              return false;
            }
          }
        } else if (dateFilter.type === 'relative') {
          const { amount, unit } = dateFilter.value;
          const diffMs = refDate.getTime() - itemDate.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          if (diffDays < 0) return false;

          if (unit === 'D' && diffDays > amount) return false;
          if (unit === 'W' && diffDays > amount * 7) return false;
          if (unit === 'M' && diffDays > amount * 30) return false;
        } else if (dateFilter.type === 'custom_single') {
          const [tY, tM, tD] = dateFilter.date.split('-').map(Number);
          if (
            itemDate.getFullYear() !== tY ||
            itemDate.getMonth() !== tM - 1 ||
            itemDate.getDate() !== tD
          ) {
            return false;
          }
        } else if (dateFilter.type === 'custom_range') {
          const [sY, sM, sD] = dateFilter.startDate.split('-').map(Number);
          const [eY, eM, eD] = dateFilter.endDate.split('-').map(Number);
          const start = new Date(sY, sM - 1, sD, 0, 0, 0);
          const end = new Date(eY, eM - 1, eD, 23, 59, 59);
          if (itemDate < start || itemDate > end) {
            return false;
          }
        }
      }

      return true;
    });
  }, [useCases, searchQuery, draftFilterActive, selectedLifecycle, dateFilter]);

  // Draft use cases in the current view for multi-select
  const visibleDrafts = useMemo(() => {
    return filteredUseCases.filter((uc) => uc.lifecycleStatus === 'Draft');
  }, [filteredUseCases]);

  const areAllVisibleDraftsSelected =
    visibleDrafts.length > 0 &&
    visibleDrafts.every((d) => selectedDraftIds.includes(d.id));

  const toggleSelectAllVisibleDrafts = () => {
    if (areAllVisibleDraftsSelected) {
      setSelectedDraftIds([]);
    } else {
      setSelectedDraftIds(visibleDrafts.map((d) => d.id));
    }
  };

  const toggleSelectDraft = (id: string) => {
    setSelectedDraftIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Progress status text helper
  const getProgressStatusClass = (status: 'Green' | 'Amber' | 'Red' | '—') => {
    switch (status) {
      case 'Green':
        return 'font-bold text-[#16A34A]';
      case 'Amber':
        return 'font-bold text-[#D97706]';
      case 'Red':
        return 'font-bold text-[#DC2626]';
      default:
        return 'text-[#948D82]';
    }
  };

  const handleModalConfirm = (
    type: ConfirmationActionType,
    payload: { record?: UseCaseRecord; records?: UseCaseRecord[] }
  ) => {
    setActionModal(null);

    if (type === 'duplicate' && payload.record) {
      onDuplicateUseCase(payload.record);
    } else if (type === 'pause' && payload.record) {
      onUpdateLifecycleStatus(payload.record.id, 'Paused');
    } else if (type === 'resume' && payload.record) {
      onUpdateLifecycleStatus(payload.record.id, 'Active');
    } else if (type === 'stop' && payload.record) {
      onUpdateLifecycleStatus(payload.record.id, 'Stopped');
    } else if (type === 'archive' && payload.record) {
      onUpdateLifecycleStatus(payload.record.id, 'Archived');
    } else if (type === 'delete' && payload.record) {
      if (onDeleteUseCase) {
        onDeleteUseCase(payload.record.id);
      }
      setSelectedDraftIds((prev) => prev.filter((id) => id !== payload.record?.id));
    } else if (type === 'batch_archive' && payload.records) {
      const ids = payload.records.map((r) => r.id);
      if (onBatchArchiveUseCases) {
        onBatchArchiveUseCases(ids);
      } else {
        ids.forEach((id) => onUpdateLifecycleStatus(id, 'Archived'));
      }
      setSelectedDraftIds([]);
    } else if (type === 'batch_delete' && payload.records) {
      const ids = payload.records.map((r) => r.id);
      if (onBatchDeleteUseCases) {
        onBatchDeleteUseCases(ids);
      } else if (onDeleteUseCase) {
        ids.forEach((id) => onDeleteUseCase(id));
      }
      setSelectedDraftIds([]);
    }
  };

  return (
    <div className="w-full space-y-4 font-body">
      {/* ── 1. Header Section: Title, Subtitle, Refresh & + Use Case Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-title text-[32px] sm:text-[36px] font-normal text-[#1A1816] tracking-tight leading-tight">
            Use Case Orchestration
          </h1>
          <p className="text-[13px] text-[#555047] mt-0.5 font-body">
            Create, configure, and manage Use Case
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.location.reload()}
            title="Refresh use cases"
            className="h-10 px-5 rounded-[8px] border border-[#FF5C35] bg-transparent hover:bg-[#FF5C35]/10 text-[#FF5C35] text-[13.5px] font-semibold transition-colors cursor-pointer"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onNewUseCase}
            className="h-10 px-6 rounded-[8px] bg-[#FF5C35] hover:bg-[#E04823] text-white text-[13.5px] font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>+ Use Case</span>
          </button>
        </div>
      </div>

      {/* ── 2. Filters Row (Directly on canvas matching wireframe) ────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[320px]">
          {/* 1. Search Entries (with search icon on the right side) */}
          <div className="relative w-full max-w-[420px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Entries......."
              className="w-full pl-3.5 pr-10 h-10 text-[13px] bg-white border border-[#D5D0C7] rounded-[8px] text-[#1A1816] placeholder:text-[#948D82] focus:outline-hidden focus:border-[#FF5C35] shadow-2xs transition-colors"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#706B62]" />
          </div>

          {/* 2. Created Date Filter Dropdown */}
          <CreatedDateDropdown value={dateFilter} onChange={setDateFilter} />

          {/* 3. Lifecycle Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLifecycleMenuOpen(!isLifecycleMenuOpen)}
              className="h-10 px-4 rounded-[8px] border border-[#D5D0C7] bg-white text-[13px] text-[#2D2A26] font-medium hover:bg-[#F4F1EB] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>
                {selectedLifecycle === 'All'
                  ? 'Lifecycle Status'
                  : `Status: ${selectedLifecycle}`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#706B62]" />
            </button>

            {isLifecycleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsLifecycleMenuOpen(false)}
                />
                <div className="absolute left-0 top-11 z-40 w-48 bg-white rounded-[8px] border border-[#D5D0C7] shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                  {LIFECYCLE_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => {
                        setSelectedLifecycle(opt);
                        setIsLifecycleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer ${
                        selectedLifecycle === opt
                          ? 'font-bold text-[#FF5C35] bg-[#FFF0EB]'
                          : 'text-[#2D2A26] hover:bg-[#F4F1EB]'
                      }`}
                    >
                      {opt === 'All' ? 'All Statuses' : opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Draft button with beige/tan fill #E5DDCF or solid orange when active */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (draftFilterActive) {
                setSelectedDraftIds([]);
              }
              setDraftFilterActive(!draftFilterActive);
            }}
            className={`h-10 px-6 rounded-[8px] text-[13px] border transition-colors cursor-pointer flex items-center gap-2 shadow-2xs ${
              draftFilterActive
                ? 'bg-[#FF5C35] text-white border-[#FF5C35] font-semibold hover:bg-[#E04823]'
                : 'bg-[#E5DDCF] hover:bg-[#DBD2C2] text-[#6B6255] border-[#D5CEC0] font-medium'
            }`}
          >
            <span>Draft</span>
            {draftFilterActive && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* ── 3. Subtitle Count: "Listing Use Cases" ───────────────────────── */}
      <div className="text-[11.5px] text-[#706B62] font-normal px-0.5">
        Listing Use Cases
      </div>

      {/* ── 4. Multi-Select Draft Action Bar (when drafts are selected) ─── */}
      {selectedDraftIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#FFF0EB] border border-[#FFD9CE] rounded-[8px] text-[13px] text-[#1A1816] animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="w-5 h-5 rounded-[4px] bg-[#FF5C35] text-white flex items-center justify-center text-[11px] font-bold">
              {selectedDraftIds.length}
            </span>
            <span>
              {selectedDraftIds.length === 1
                ? '1 Draft selected'
                : `${selectedDraftIds.length} Drafts selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const selectedRecords = useCases.filter((u) =>
                  selectedDraftIds.includes(u.id)
                );
                setActionModal({
                  type: 'batch_archive',
                  records: selectedRecords,
                });
              }}
              className="px-3 py-1.5 rounded-[6px] bg-white border border-[#D5CEC0] hover:bg-[#FAF8F5] text-[12.5px] font-medium text-[#4B5563] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Archive className="w-3.5 h-3.5 text-[#4B5563]" />
              <span>Archive Selected</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const selectedRecords = useCases.filter((u) =>
                  selectedDraftIds.includes(u.id)
                );
                setActionModal({
                  type: 'batch_delete',
                  records: selectedRecords,
                });
              }}
              className="px-3 py-1.5 rounded-[6px] bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] text-[12.5px] font-medium text-[#DC2626] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Delete Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDraftIds([])}
              className="px-2.5 py-1.5 text-[12px] text-[#706B62] hover:text-[#1A1816] transition-colors cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* ── 5. Main Wireframe Table ─────────────────────────────────────── */}
      <div className="w-full bg-white rounded-[12px] border border-[#E2DDD5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            {/* Table Header: Sand/Tan background matching wireframe (#DDD6C9) */}
            <thead>
              <tr className="bg-[#DDD6C9] border-b border-[#D5CEC0] text-[13px] font-bold text-[#1A1816]">
                {/* Checkbox column for multi-select (ONLY visible when Draft filter is active) */}
                {draftFilterActive && (
                  <th className="py-3 px-3 w-[4%] text-center">
                    <input
                      type="checkbox"
                      checked={areAllVisibleDraftsSelected}
                      onChange={toggleSelectAllVisibleDrafts}
                      disabled={visibleDrafts.length === 0}
                      title="Select all visible drafts"
                      className="rounded-[4px] border-[#B8AF9F] text-[#FF5C35] focus:ring-[#FF5C35] cursor-pointer w-4 h-4"
                    />
                  </th>
                )}

                <th className={`py-3 px-4 ${draftFilterActive ? 'w-[27%]' : 'w-[31%]'} font-bold`}>
                  Use Case Name
                </th>
                <th className="py-3 px-4 w-[13%] font-bold text-center">Created date</th>
                <th className="py-3 px-4 w-[9%] font-bold text-center">Goal</th>

                {/* Column 4: Lifecycle status (pure text, no oval/badge around them) */}
                <th className="py-3 px-4 w-[13%] font-bold text-center">Lifecycle status</th>

                <th className="py-3 px-4 w-[12%] font-bold text-center">Progress Status</th>

                {/* Column 6: Insight with Info Icon & Floating Legend */}
                <th className="py-3 px-4 w-[18%] font-bold">
                  <div className="flex items-center gap-1.5 relative group cursor-help select-none">
                    <span>Insight</span>
                    <div
                      className="w-4 h-4 rounded-full bg-[#CFC7BA] text-[#1A1816] hover:bg-[#BDB4A5] flex items-center justify-center text-[11px] font-bold transition-colors cursor-help"
                      title="Insight Color Legend"
                    >
                      i
                    </div>

                    {/* Floating Info Tooltip on Hover */}
                    <div className="absolute left-0 top-7 z-50 hidden group-hover:block w-64 p-3 bg-[#1A1816] text-white rounded-[8px] shadow-2xl border border-[#2D2A26] text-[11.5px] font-normal leading-relaxed animate-in fade-in duration-150">
                      <div className="font-semibold text-white mb-2 flex items-center gap-1.5 text-[12px]">
                        <Info className="w-3.5 h-3.5 text-[#FF5C35]" />
                        <span>Insight Color Legend</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-xs bg-[#FF5C35] shrink-0" />
                          <span>
                            <strong className="text-white">Orange:</strong> Achieved (Goal) / Spent (Budget)
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-xs bg-[#E5DFD5] border border-[#A8A29E] shrink-0" />
                          <span>
                            <strong className="text-[#DDD6C9]">Sand:</strong> Remaining
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-[#3A3631] text-[10.5px] text-[#A8A29E]">
                        Hover over each bar to see exact achieved vs remaining numbers.
                      </div>
                    </div>
                  </div>
                </th>

                <th className="py-3 px-4 w-[5%] font-bold text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#EAE5DC]">
              {filteredUseCases.length === 0 ? (
                <tr>
                  <td
                    colSpan={draftFilterActive ? 8 : 7}
                    className="py-12 text-center text-[#706B62] text-[13px]"
                  >
                    No use cases match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUseCases.map((uc) => {
                  const isActionOpen = openActionId === uc.id;
                  const isDraft = uc.lifecycleStatus === 'Draft';
                  const isSelected = selectedDraftIds.includes(uc.id);

                  return (
                    <tr
                      key={uc.id}
                      className={`transition-colors text-[13px] ${
                        isSelected
                          ? 'bg-[#FFEFEA] hover:bg-[#FFE6DC]'
                          : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {/* Checkbox cell (Only shown when Draft filter is active) */}
                      {draftFilterActive && (
                        <td className="py-3.5 px-3 align-middle text-center">
                          {isDraft ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectDraft(uc.id)}
                              className="rounded-[4px] border-[#D5D0C7] text-[#FF5C35] focus:ring-[#FF5C35] cursor-pointer w-4 h-4"
                            />
                          ) : (
                            <span className="w-4 h-4 inline-block" />
                          )}
                        </td>
                      )}

                      {/* Column 1: Use Case Name (Clickable to Insights) */}
                      <td className="py-3.5 px-4 align-middle">
                        <button
                          type="button"
                          onClick={() => onOpenDecisionInsight(uc)}
                          title="Click to view Insights"
                          className="text-left font-normal text-[#2D2A26] hover:text-[#FF5C35] hover:underline transition-colors cursor-pointer leading-snug line-clamp-2"
                        >
                          {uc.useCaseName}
                        </button>
                      </td>

                      {/* Column 2: Created Date */}
                      <td className="py-3.5 px-4 align-middle text-center font-data text-[#555047]">
                        {uc.createdDateFormatted}
                      </td>

                      {/* Column 3: Goal (Clickable to Insights) */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => onOpenDecisionInsight(uc)}
                          title="Click to view Insights"
                          className="font-medium text-[#1A1816] hover:text-[#FF5C35] hover:underline transition-colors cursor-pointer"
                        >
                          {uc.goal}
                        </button>
                      </td>

                      {/* Column 4: Lifecycle status (Pure text without round oval border, matching Image 2 & 3) */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        {uc.lifecycleStatus === 'Active' && (
                          <span className="font-semibold text-[13px] text-[#FF5C35]">
                            Active
                          </span>
                        )}
                        {uc.lifecycleStatus === 'Scheduled' && (
                          <span className="font-semibold text-[13px] text-[#2563EB]">
                            Scheduled
                          </span>
                        )}
                        {uc.lifecycleStatus === 'Draft' && (
                          <span className="font-medium text-[13px] text-[#6B665E]">
                            Draft
                          </span>
                        )}
                        {uc.lifecycleStatus === 'Paused' && (
                          <span className="font-semibold text-[13px] text-[#D97706]">
                            Paused
                          </span>
                        )}
                        {uc.lifecycleStatus === 'Stopped' && (
                          <span className="font-semibold text-[13px] text-[#DC2626]">
                            Stopped
                          </span>
                        )}
                        {uc.lifecycleStatus === 'Completed' && (
                          <span className="font-semibold text-[13px] text-[#16A34A]">
                            Completed
                          </span>
                        )}
                        {uc.lifecycleStatus === 'Archived' && (
                          <span className="font-medium text-[13px] text-[#8C857B]">
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Column 5: Progress Status (Clickable to Insights) */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => onOpenDecisionInsight(uc)}
                          title="Click to view Insights"
                          className="cursor-pointer transition-transform hover:scale-105 inline-block"
                        >
                          <span className={getProgressStatusClass(uc.progressStatus)}>
                            {uc.lifecycleStatus === 'Draft' ? '—' : uc.progressStatus}
                          </span>
                        </button>
                      </td>

                      {/* Column 6: Insight (Clickable to Insights) */}
                      <td className="py-3 px-4 align-middle">
                        {uc.lifecycleStatus === 'Draft' ? (
                          <button
                            type="button"
                            onClick={() => onOpenDecisionInsight(uc)}
                            title="Click to view Insights"
                            className="text-[11.5px] text-[#948D82] italic hover:text-[#FF5C35] hover:underline cursor-pointer"
                          >
                            Draft · Step {uc.lastSavedStep} of 5
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenDecisionInsight(uc)}
                            title="Click to view Insights"
                            className="w-full max-w-[210px] space-y-1.5 text-left cursor-pointer group/insight hover:opacity-85 transition-opacity block"
                          >
                            {/* Row 1: {Goal} : Achieved vs Remaining */}
                            <div
                              className="group/bar"
                              title={`${uc.goal}: ${uc.goalAchievedPercent}% Achieved · ${
                                100 - uc.goalAchievedPercent
                              }% Remaining`}
                            >
                              <div className="flex items-center justify-between text-[10px] text-[#706B62] group-hover/insight:text-[#1A1816] font-medium leading-none mb-1">
                                <span>{uc.goal} : Achieved vs Remaining</span>
                                <span className="font-data text-[9.5px] text-[#555047]">
                                  {uc.goalAchievedPercent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-[#E5DFD5]">
                                <div
                                  className="bg-[#FF5C35] h-full transition-all duration-300 rounded-l-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(0, uc.goalAchievedPercent)
                                    )}%`,
                                  }}
                                />
                                <div className="bg-[#E5DFD5] h-full flex-1" />
                              </div>
                            </div>

                            {/* Row 2: Budget : Spent vs Remaining */}
                            <div
                              className="group/bar"
                              title={`Budget: ${uc.budgetSpentPercent}% Spent · ${
                                100 - uc.budgetSpentPercent
                              }% Remaining`}
                            >
                              <div className="flex items-center justify-between text-[10px] text-[#706B62] group-hover/insight:text-[#1A1816] font-medium leading-none mb-1">
                                <span>Budget : Spent vs Remaining</span>
                                <span className="font-data text-[9.5px] text-[#555047]">
                                  {uc.budgetSpentPercent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-[#E5DFD5]">
                                <div
                                  className="bg-[#FF5C35] h-full transition-all duration-300 rounded-l-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(0, uc.budgetSpentPercent)
                                    )}%`,
                                  }}
                                />
                                <div className="bg-[#E5DFD5] h-full flex-1" />
                              </div>
                            </div>
                          </button>
                        )}
                      </td>

                      {/* Column 7: Action (Three Dots Menu with Confirmation Popups) */}
                      <td className="py-3.5 px-4 align-middle text-center relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionId(isActionOpen ? null : uc.id)
                          }
                          className="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[#706B62] hover:text-[#1A1816] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu Popover */}
                        {isActionOpen && (
                          <>
                            {/* Backdrop to close */}
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenActionId(null)}
                            />

                            <div className="absolute right-4 top-11 z-40 w-[160px] bg-white rounded-[8px] border border-[#D5D0C7] shadow-xl p-1 text-left animate-in fade-in zoom-in-95 duration-100 font-body">
                              {/* 1. View - Available for all */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  setViewingUseCase(uc);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#2D2A26] hover:bg-[#F4F1EB] rounded-[5px] transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#706B62]" />
                                <span>View</span>
                              </button>

                              {/* 2. Edit - Available for all except Archived */}
                              {uc.lifecycleStatus !== 'Archived' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    onEditUseCase(uc);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#2D2A26] hover:bg-[#F4F1EB] rounded-[5px] transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#706B62]" />
                                  <span>Edit</span>
                                </button>
                              )}

                              {/* 3. Duplicate - Available for all */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  setActionModal({ type: 'duplicate', record: uc });
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#2D2A26] hover:bg-[#F4F1EB] rounded-[5px] transition-colors cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#706B62]" />
                                <span>Duplicate</span>
                              </button>

                              {/* Status-specific actions */}

                              {/* A. Active & Scheduled: Pause and Stop */}
                              {(uc.lifecycleStatus === 'Active' || uc.lifecycleStatus === 'Scheduled') && (
                                <>
                                  <div className="h-px bg-[#EAE5DC] my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null);
                                      setActionModal({ type: 'pause', record: uc });
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#2D2A26] hover:bg-[#F4F1EB] rounded-[5px] transition-colors cursor-pointer"
                                  >
                                    <PauseCircle className="w-3.5 h-3.5 text-[#706B62]" />
                                    <span>Pause</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null);
                                      setActionModal({ type: 'stop', record: uc });
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#DC2626] hover:bg-[#FEF2F2] rounded-[5px] transition-colors cursor-pointer"
                                  >
                                    <StopCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                                    <span>Stop</span>
                                  </button>
                                </>
                              )}

                              {/* B. Paused: Active and Archive */}
                              {uc.lifecycleStatus === 'Paused' && (
                                <>
                                  <div className="h-px bg-[#EAE5DC] my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null);
                                      setActionModal({ type: 'resume', record: uc });
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#16A34A] hover:bg-[#F0FDF4] rounded-[5px] transition-colors cursor-pointer"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                                    <span>Active</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null);
                                      setActionModal({ type: 'archive', record: uc });
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#4B5563] hover:bg-[#F3F4F6] rounded-[5px] transition-colors cursor-pointer"
                                  >
                                    <Archive className="w-3.5 h-3.5 text-[#706B62]" />
                                    <span>Archive</span>
                                  </button>
                                </>
                              )}

                              {/* C. Completed, Draft, Stopped: Archive and Delete */}
                              {(uc.lifecycleStatus === 'Completed' ||
                                uc.lifecycleStatus === 'Draft' ||
                                uc.lifecycleStatus === 'Stopped') && (
                                <>
                                  <div className="h-px bg-[#EAE5DC] my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null);
                                      setActionModal({ type: 'archive', record: uc });
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#4B5563] hover:bg-[#F3F4F6] rounded-[5px] transition-colors cursor-pointer"
                                  >
                                    <Archive className="w-3.5 h-3.5 text-[#706B62]" />
                                    <span>Archive</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null);
                                      setActionModal({ type: 'delete', record: uc });
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#DC2626] hover:bg-[#FEF2F2] rounded-[5px] transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}

                              {/* D. Archived: Delete */}
                              {uc.lifecycleStatus === 'Archived' && (
                                <>
                                  <div className="h-px bg-[#EAE5DC] my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null);
                                      setActionModal({ type: 'delete', record: uc });
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[#DC2626] hover:bg-[#FEF2F2] rounded-[5px] transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewingUseCase && (
        <ViewUseCaseModal
          useCase={viewingUseCase}
          onClose={() => setViewingUseCase(null)}
          onEdit={() => {
            const target = viewingUseCase;
            setViewingUseCase(null);
            onEditUseCase(target);
          }}
        />
      )}

      {/* Confirmation Review Modal for Duplicate, Pause, Resume, Stop, Archive, Delete, Batch Actions */}
      {actionModal && (
        <ActionConfirmationModal
          action={actionModal}
          onClose={() => setActionModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
};
