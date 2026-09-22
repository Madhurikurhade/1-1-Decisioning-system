import React from 'react';
import { UseCaseRecord } from '../../types';
import { AlertTriangle, X, ArrowRight, ShieldAlert } from 'lucide-react';

interface EditUseCaseWarningModalProps {
  useCase: UseCaseRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const EditUseCaseWarningModal: React.FC<EditUseCaseWarningModalProps> = ({
  useCase,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-body">
      <div className="bg-white rounded-[14px] border border-[#D5D0C7] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Warning Header */}
        <div className="bg-[#FFF7ED] border-b border-[#FED7AA] px-6 py-4.5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#C2410C] bg-[#FFEDD5] px-2 py-0.5 rounded-[4px]">
                  Protected Action
                </span>
                <span className="text-[12px] font-medium text-[#7C2D12]">
                  Status: <strong className="font-bold">{useCase.lifecycleStatus}</strong>
                </span>
              </div>
              <h2 className="text-[17px] font-bold text-[#1A1816] mt-1 leading-tight">
                Confirm Use Case Modification
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#9A3412] hover:text-[#1A1816] hover:bg-[#FFEDD5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-[13px] text-[#3A3631]">
          {/* Target Use Case Card */}
          <div className="p-3.5 rounded-[8px] bg-[#FAF8F5] border border-[#E5E0D7] flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wide block">
                Target Use Case
              </span>
              <p className="font-semibold text-[#1A1816] text-[14px] truncate mt-0.5">
                {useCase.useCaseName}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11.5px] text-[#706B62]">
                <span>Product: <strong>{useCase.config.productL1 || 'Unsecured'}</strong></span>
                <span>•</span>
                <span>Partner: <strong>{useCase.config.partner || 'BFL'}</strong></span>
                <span>•</span>
                <span>Goal: <strong>{useCase.goal || 'AIP'}</strong></span>
              </div>
            </div>
          </div>

          {/* Warning Advisory: first line only */}
          <div className="p-4 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="text-[12.5px] text-[#991B1B] leading-relaxed">
              <p className="font-semibold text-[#7F1D1D] mb-1">
                Editing is subject to policy constraints
              </p>
              Editing an existing use case impacts attribution tracking and downstream vendor schedules.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF8F5] border-t border-[#E5E0D7] px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[7px] text-[13px] font-medium text-[#555047] hover:text-[#1A1816] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4.5 py-2 rounded-[7px] text-[13px] font-semibold flex items-center gap-2 transition-all shadow-xs bg-[#FF5C35] hover:bg-[#E04823] text-white cursor-pointer"
          >
            <span>Confirm &amp; Proceed to Edit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
