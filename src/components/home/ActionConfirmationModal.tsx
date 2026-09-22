import React, { useState } from 'react';
import { UseCaseRecord } from '../../types';
import {
  AlertTriangle,
  Copy,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Archive,
  Trash2,
  X,
  Target,
} from 'lucide-react';

export type ConfirmationActionType =
  | 'duplicate'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'archive'
  | 'delete'
  | 'batch_archive'
  | 'batch_delete';

export interface ActionModalState {
  type: ConfirmationActionType;
  record?: UseCaseRecord;
  records?: UseCaseRecord[];
}

interface ActionConfirmationModalProps {
  action: ActionModalState | null;
  onClose: () => void;
  onConfirm: (
    type: ConfirmationActionType,
    payload: { record?: UseCaseRecord; records?: UseCaseRecord[] }
  ) => void;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  action,
  onClose,
  onConfirm,
}) => {
  const [stopConfirmed, setStopConfirmed] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  if (!action) return null;

  const { type, record, records } = action;
  const isBatch = type === 'batch_archive' || type === 'batch_delete';
  const batchList = records || (record ? [record] : []);
  const batchCount = batchList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-body">
      <div className="bg-white rounded-[14px] shadow-2xl border border-[#D5D0C7] w-full max-w-[540px] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE5DC] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            {type === 'duplicate' && (
              <div className="w-9 h-9 rounded-full bg-[#FFF0EB] text-[#FF5C35] flex items-center justify-center">
                <Copy className="w-5 h-5" />
              </div>
            )}
            {type === 'pause' && (
              <div className="w-9 h-9 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <PauseCircle className="w-5 h-5" />
              </div>
            )}
            {type === 'resume' && (
              <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                <PlayCircle className="w-5 h-5" />
              </div>
            )}
            {type === 'stop' && (
              <div className="w-9 h-9 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            {(type === 'archive' || type === 'batch_archive') && (
              <div className="w-9 h-9 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
            )}
            {(type === 'delete' || type === 'batch_delete') && (
              <div className="w-9 h-9 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
            )}

            <div>
              <h3 className="text-[16px] font-bold text-[#1A1816] leading-tight">
                {type === 'duplicate' && 'Duplicate Use Case'}
                {type === 'pause' && 'Pause Use Case'}
                {type === 'resume' && 'Activate Use Case'}
                {type === 'stop' && 'Stop Use Case'}
                {type === 'archive' && 'Archive Use Case'}
                {type === 'delete' && (record?.lifecycleStatus === 'Draft' ? 'Delete Draft Use Case' : `Delete ${record?.lifecycleStatus || ''} Use Case`)}
                {type === 'batch_archive' && `Archive ${batchCount} Draft Use Cases`}
                {type === 'batch_delete' && `Delete ${batchCount} Draft Use Cases`}
              </h3>
              <p className="text-[12px] text-[#706B62]">
                {type === 'duplicate' && 'Review configuration before cloning into a new Draft'}
                {type === 'pause' && 'Temporarily suspend delivery and message queue'}
                {type === 'resume' && 'Reactivate live customer messaging and channel delivery'}
                {type === 'stop' && 'High-impact permanent operational change'}
                {type === 'archive' && 'Move this use case to archived records'}
                {type === 'delete' && (record?.lifecycleStatus === 'Draft' ? 'Permanently remove draft configuration' : 'Permanently remove this use case and associated records')}
                {type === 'batch_archive' && 'Move selected drafts to archived status'}
                {type === 'batch_delete' && 'Permanently delete all selected draft configurations'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full text-[#706B62] hover:text-[#1A1816] hover:bg-[#EAE5DC] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Single Record Review Card */}
          {!isBatch && record && (
            <div className="bg-[#FAF8F5] border border-[#E8E4DD] rounded-[10px] p-4 space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#948D82]">
                Use Case Review
              </div>
              <div className="text-[14px] font-semibold text-[#1A1816] leading-snug">
                {record.useCaseName}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#EAE5DC] text-[12px]">
                <div>
                  <span className="text-[#706B62] block text-[11px]">Goal Metric</span>
                  <span className="font-semibold text-[#1A1816] flex items-center gap-1 mt-0.5">
                    <Target className="w-3.5 h-3.5 text-[#FF5C35]" />
                    {record.goal}
                  </span>
                </div>
                <div>
                  <span className="text-[#706B62] block text-[11px]">Lifecycle</span>
                  <span className="font-semibold text-[#1A1816] mt-0.5 inline-block">
                    {record.lifecycleStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[#706B62] block text-[11px]">Created Date</span>
                  <span className="font-medium text-[#555047] font-data mt-0.5 inline-block">
                    {record.createdDateFormatted}
                  </span>
                </div>
              </div>

              {/* Performance metrics if not draft */}
              {record.lifecycleStatus !== 'Draft' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EAE5DC] text-[12px]">
                  <div>
                    <span className="text-[#706B62] block text-[11px]">Goal Achieved</span>
                    <span className="font-semibold text-[#16A34A]">
                      {record.goalAchievedPercent}% Completed
                    </span>
                  </div>
                  <div>
                    <span className="text-[#706B62] block text-[11px]">Budget Spent</span>
                    <span className="font-semibold text-[#555047]">
                      {record.budgetSpentPercent}% Utilized
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Batch Records List Card */}
          {isBatch && (
            <div className="bg-[#FAF8F5] border border-[#E8E4DD] rounded-[10px] p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#948D82]">
                <span>Selected Drafts ({batchCount})</span>
                <span>Status: Draft</span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-[#EAE5DC] pr-1">
                {batchList.map((item, idx) => (
                  <div key={item.id} className="py-2 text-[12.5px] flex items-center justify-between">
                    <span className="font-medium text-[#1A1816] truncate max-w-[340px]">
                      {idx + 1}. {item.useCaseName}
                    </span>
                    <span className="text-[11px] text-[#706B62] font-data">
                      {item.createdDateFormatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type-Specific Explanations & Warnings */}
          {type === 'duplicate' && record && (
            <div className="text-[13px] text-[#555047] leading-relaxed bg-[#FFF8F5] border border-[#FFD9CE] p-3.5 rounded-[8px]">
              A new independent copy titled{' '}
              <strong className="text-[#1A1816] font-semibold">
                "{record.useCaseName} (Copy)"
              </strong>{' '}
              will be created as a <strong>Draft</strong>. All target audience configurations, channel
              allocations, creative templates, and budget rules will be copied over so you can adjust
              and launch independently.
            </div>
          )}

          {type === 'pause' && (
            <div className="text-[13px] text-[#555047] leading-relaxed bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-[8px]">
              Are you sure you want to pause this active Use Case? Scheduled message dispatches across
              all active channels will be paused immediately. Tracking and audience state will remain
              preserved, and you can resume this Use Case at any time.
            </div>
          )}

          {type === 'resume' && (
            <div className="text-[13px] text-[#555047] leading-relaxed bg-[#F0FDF4] border border-[#BBF7D0] p-3.5 rounded-[8px]">
              Are you sure you want to resume this Use Case? Channel communication triggers and
              scheduled customer journeys will reactivate immediately according to the original
              flight schedule.
            </div>
          )}

          {type === 'archive' && (
            <div className="text-[13px] text-[#555047] leading-relaxed bg-[#F9FAFB] border border-[#E5E7EB] p-3.5 rounded-[8px]">
              Archiving this Use Case will move it into the <strong>Archived</strong> lifecycle status.
              It will be hidden from the active operational list but can be referenced or viewed at any
              time by selecting the "Archived" lifecycle filter.
            </div>
          )}

          {type === 'batch_archive' && (
            <div className="text-[13px] text-[#555047] leading-relaxed bg-[#F9FAFB] border border-[#E5E7EB] p-3.5 rounded-[8px]">
              Are you sure you want to archive these <strong>{batchCount} selected drafts</strong>?
              They will be moved to the <strong>Archived</strong> lifecycle status and can be accessed
              under the Archived filter.
            </div>
          )}

          {type === 'delete' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] text-[12.5px] text-[#991B1B] leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-[#B91C1C] mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Delete Draft Confirmation</span>
                </div>
                <p>
                  Are you sure you want to permanently delete this draft? All in-progress configuration,
                  budget, audience, and creative settings will be removed permanently.
                </p>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-[8px] border border-[#E8E4DD] hover:bg-[#FAF8F5] cursor-pointer transition-colors select-none">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 rounded-[4px] border-[#D5D0C7] text-[#DC2626] focus:ring-[#DC2626] cursor-pointer w-4 h-4"
                />
                <span className="text-[12px] text-[#1A1816] font-medium leading-tight">
                  I confirm that I want to permanently delete this draft use case.
                </span>
              </label>
            </div>
          )}

          {type === 'batch_delete' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] text-[12.5px] text-[#991B1B] leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-[#B91C1C] mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Permanent Batch Deletion ({batchCount} Drafts)</span>
                </div>
                <p>
                  This will permanently delete all <strong>{batchCount} selected drafts</strong> from
                  the system. This action cannot be reversed.
                </p>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-[8px] border border-[#E8E4DD] hover:bg-[#FAF8F5] cursor-pointer transition-colors select-none">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 rounded-[4px] border-[#D5D0C7] text-[#DC2626] focus:ring-[#DC2626] cursor-pointer w-4 h-4"
                />
                <span className="text-[12px] text-[#1A1816] font-medium leading-tight">
                  I confirm that I want to permanently delete all {batchCount} selected drafts.
                </span>
              </label>
            </div>
          )}

          {type === 'stop' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] text-[12.5px] text-[#991B1B] leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-[#B91C1C] mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Warning: Permanent & Irreversible Action</span>
                </div>
                <p>
                  Stopping a Use Case is a major action. All automated audience orchestration, scheduled
                  channel deliveries (SMS, WhatsApp, RCS, Email), and ongoing budget execution will be
                  <strong> permanently terminated</strong>.
                </p>
                <p className="mt-1 font-semibold">
                  Once stopped, this Use Case cannot be resumed or re-enabled.
                </p>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-[8px] border border-[#E8E4DD] hover:bg-[#FAF8F5] cursor-pointer transition-colors select-none">
                <input
                  type="checkbox"
                  checked={stopConfirmed}
                  onChange={(e) => setStopConfirmed(e.target.checked)}
                  className="mt-0.5 rounded-[4px] border-[#D5D0C7] text-[#DC2626] focus:ring-[#DC2626] cursor-pointer w-4 h-4"
                />
                <span className="text-[12px] text-[#1A1816] font-medium leading-tight">
                  I understand that stopping this Use Case is permanent and cannot be undone. All active
                  communications will be stopped.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#EAE5DC] bg-[#FAF8F5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-[#555047] hover:text-[#1A1816] hover:bg-[#EAE5DC] rounded-[8px] border border-[#D5CEC0] bg-white transition-colors cursor-pointer"
          >
            {type === 'stop' || type === 'delete' || type === 'batch_delete'
              ? 'Cancel / Keep Unchanged'
              : 'Cancel'}
          </button>

          {type === 'duplicate' && record && (
            <button
              type="button"
              onClick={() => onConfirm('duplicate', { record })}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#FF5C35] hover:bg-[#E04823] rounded-[8px] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate & Open Draft</span>
            </button>
          )}

          {type === 'pause' && record && (
            <button
              type="button"
              onClick={() => onConfirm('pause', { record })}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#D97706] hover:bg-[#B45309] rounded-[8px] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Confirm & Pause</span>
            </button>
          )}

          {type === 'resume' && record && (
            <button
              type="button"
              onClick={() => onConfirm('resume', { record })}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#16A34A] hover:bg-[#15803D] rounded-[8px] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Confirm & Activate</span>
            </button>
          )}

          {type === 'archive' && record && (
            <button
              type="button"
              onClick={() => onConfirm('archive', { record })}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#4B5563] hover:bg-[#374151] rounded-[8px] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Confirm & Archive</span>
            </button>
          )}

          {type === 'batch_archive' && (
            <button
              type="button"
              onClick={() => onConfirm('batch_archive', { records: batchList })}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#4B5563] hover:bg-[#374151] rounded-[8px] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive {batchCount} Drafts</span>
            </button>
          )}

          {type === 'delete' && record && (
            <button
              type="button"
              disabled={!deleteConfirmed}
              onClick={() => onConfirm('delete', { record })}
              className={`px-4 py-2 text-[13px] font-medium text-white rounded-[8px] transition-colors flex items-center gap-1.5 shadow-xs ${
                deleteConfirmed
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] cursor-pointer'
                  : 'bg-[#DC2626]/40 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{record.lifecycleStatus === 'Draft' ? 'Yes, Delete Draft' : 'Yes, Delete Use Case'}</span>
            </button>
          )}

          {type === 'batch_delete' && (
            <button
              type="button"
              disabled={!deleteConfirmed}
              onClick={() => onConfirm('batch_delete', { records: batchList })}
              className={`px-4 py-2 text-[13px] font-medium text-white rounded-[8px] transition-colors flex items-center gap-1.5 shadow-xs ${
                deleteConfirmed
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] cursor-pointer'
                  : 'bg-[#DC2626]/40 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Delete {batchCount} Drafts</span>
            </button>
          )}

          {type === 'stop' && record && (
            <button
              type="button"
              disabled={!stopConfirmed}
              onClick={() => onConfirm('stop', { record })}
              className={`px-4 py-2 text-[13px] font-medium text-white rounded-[8px] transition-colors flex items-center gap-1.5 shadow-xs ${
                stopConfirmed
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] cursor-pointer'
                  : 'bg-[#DC2626]/40 cursor-not-allowed'
              }`}
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Yes, Permanently Stop</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
