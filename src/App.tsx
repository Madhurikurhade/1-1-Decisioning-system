import React, { useState, useEffect } from 'react';
import { UseCaseRecord, UseCaseState, LifecycleStatus, AppViewMode, CampaignRecord } from './types';
import { Shell } from './components/Shell';
import { Step1Objective } from './components/steps/Step1Objective';
import { Step2BudgetSchedule } from './components/steps/Step2BudgetSchedule';
import { Step3Audience } from './components/steps/Step3Audience';
import { Step4ChannelsContent } from './components/steps/Step4ChannelsContent';
import { Step5ReviewConfirm } from './components/steps/Step5ReviewConfirm';
import { UseCaseHome } from './components/home/UseCaseHome';
import { InsightDashboard } from './components/home/InsightDashboard';
import { EditUseCaseWarningModal } from './components/home/EditUseCaseWarningModal';
import { CampaignsList } from './components/campaigns/CampaignsList';
import { TemplateConfiguration } from './components/campaigns/TemplateConfiguration';
import { SuppressionScreen } from './components/campaigns/SuppressionScreen';
import { ReviewApprovedScreen } from './components/campaigns/ReviewApprovedScreen';
import { CampaignQueueScreen } from './components/campaigns/CampaignQueueScreen';
import { ReviewLaunchScreen } from './components/campaigns/ReviewLaunchScreen';
import { INITIAL_CAMPAIGN_RECORDS, getTodayDecisionDate } from './data/campaignMockData';
import { SEED_USE_CASES, DEFAULT_INITIAL_CONFIG } from './data/initialUseCases';
import { formatDateForTable, isDateInFuture } from './utils/formatters';
import { isDateInPast } from './components/home/CreatedDateDropdown';
import { BookmarkCheck } from 'lucide-react';

const USE_CASES_STORAGE_KEY = 'use_case_orchestration_records_v3';
const CAMPAIGNS_STORAGE_KEY = 'use_case_campaigns_records_v1';

export default function App() {
  // ── View Mode: 'home' | 'orchestration' | 'decision_insight' | 'campaigns_list' | ...
  const [viewMode, setViewMode] = useState<AppViewMode>('home');

  // ── List of all use cases (persisted in localStorage) ──────────────
  const [useCases, setUseCases] = useState<UseCaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(USE_CASES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return SEED_USE_CASES;
  });

  // ── List of all campaigns (persisted in localStorage) ──────────────
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(() => {
    try {
      const saved = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const todayStr = getTodayDecisionDate(0);
          // Merge any newly introduced initial campaigns that are not in localStorage
          const existingIds = new Set(parsed.map((c: CampaignRecord) => c.id));
          const missing = INITIAL_CAMPAIGN_RECORDS.filter((c) => !existingIds.has(c.id));
          let merged = missing.length > 0 ? [...parsed, ...missing] : parsed;

          // Always ensure seeded campaigns reflect updated demo state and past campaigns are archived
          merged = merged.map((c: CampaignRecord) => {
            const seed = INITIAL_CAMPAIGN_RECORDS.find((ic) => ic.id === c.id);
            if (seed && seed.id.startsWith('cmp-')) {
              // Ensure cmp-001 through cmp-003b have the proper Launched / Pending demo statuses
              if (seed.id === 'cmp-001' || seed.id === 'cmp-003' || seed.id === 'cmp-003b') {
                return { ...c, status: 'Launched', assignment: 'Assigned', decisionDate: seed.decisionDate };
              }
              if (seed.id === 'cmp-002' || seed.id === 'cmp-002b' || seed.id === 'cmp-002c') {
                return { ...c, status: 'Pending', assignment: 'Assign', decisionDate: seed.decisionDate };
              }
              return { ...c, status: seed.status, assignment: seed.assignment, decisionDate: seed.decisionDate };
            }
            // For any other campaign with past decision date, ensure Pending is converted to Archived / Unassigned
            if (isDateInPast(c.decisionDate) && c.status === 'Pending') {
              return { ...c, status: 'Archived', assignment: 'Unassigned' };
            }
            if (c.status === 'Scheduled') {
              return { ...c, status: 'Launched' };
            }
            return c;
          });

          // Ensure today's campaigns have today's date if date changed across days
          const hasToday = merged.some((c: CampaignRecord) => c.decisionDate === todayStr);
          if (!hasToday) {
            merged = merged.map((c: CampaignRecord, idx: number) => ({
              ...c,
              decisionDate: idx < 3 ? todayStr : c.decisionDate,
            }));
          }
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CAMPAIGN_RECORDS;
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string>(
    () => INITIAL_CAMPAIGN_RECORDS[0]?.id || 'camp-1'
  );

  // Tracks which campaign is actively being configured/assigned in the flow
  const [activeConfigCampaignId, setActiveConfigCampaignId] = useState<string | null>(null);

  // Tracks campaigns that have completed "Save & Next" or are already approved/launched
  const [unlockedReviewIds, setUnlockedReviewIds] = useState<string[]>(() => {
    return INITIAL_CAMPAIGN_RECORDS.filter(
      (c) =>
        c.status === 'Launched' ||
        c.status === 'Scheduled' ||
        c.status === 'Approved' ||
        c.status === 'Archived' ||
        c.status === 'Completed' ||
        isDateInPast(c.decisionDate)
    ).map((c) => c.id);
  });

  useEffect(() => {
    try {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  }, [campaigns]);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0] || INITIAL_CAMPAIGN_RECORDS[0];

  const updateCampaign = (updated: CampaignRecord) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const canAccessTemplate = Boolean(activeConfigCampaignId);
  const canAccessSuppression = Boolean(activeConfigCampaignId);
  const canAccessReviewApproved = Boolean(
    activeConfigCampaignId && unlockedReviewIds.includes(activeConfigCampaignId)
  );
  const canAccessReviewLaunch = Boolean(
    viewMode === 'review_launch' || campaigns.some((c) => c.status === 'Approved')
  );


  // Active use case being configured or viewed
  const [activeUseCaseId, setActiveUseCaseId] = useState<string | null>(null);

  // Active form configuration state (the 5-step state)
  const [state, setState] = useState<UseCaseState>(DEFAULT_INITIAL_CONFIG);

  // Use case selected for Decision / Insight view
  const [insightUseCase, setInsightUseCase] = useState<UseCaseRecord | null>(null);

  // Warning popup state for Edit Use Case action
  const [pendingEditUseCase, setPendingEditUseCase] = useState<UseCaseRecord | null>(null);
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Persist useCases whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(USE_CASES_STORAGE_KEY, JSON.stringify(useCases));
    } catch {
      // ignore
    }
  }, [useCases]);

  // ── Auto-save active draft on state changes ────────────────────────
  useEffect(() => {
    if (!activeUseCaseId || viewMode !== 'orchestration') return;

    setUseCases((prevList) =>
      prevList.map((item) => {
        if (item.id === activeUseCaseId) {
          return {
            ...item,
            useCaseName: state.useCaseName || item.useCaseName,
            goal: state.conversionMetric || item.goal,
            lastSavedStep: state.currentStep,
            config: {
              ...state,
            },
          };
        }
        return item;
      })
    );
  }, [state, activeUseCaseId, viewMode]);

  // Helper to update current form state
  const updateState = (updates: Partial<UseCaseState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // ── 1. Create New Use Case (+ Use Case entry point) ───────────────
  const handleNewUseCase = () => {
    const newId = `uc-${Date.now()}`;
    const now = new Date();
    const createdFormatted = formatDateForTable(now);

    const newConfig: UseCaseState = {
      ...DEFAULT_INITIAL_CONFIG,
      currentStep: 1,
      completedSteps: [],
      status: 'draft',
      isEditMode: false,
      originalEndDate: undefined,
      originalDurationDays: undefined,
      lastSavedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newRecord: UseCaseRecord = {
      id: newId,
      useCaseName: newConfig.useCaseName,
      createdAt: now.toISOString(),
      createdDateFormatted: createdFormatted,
      goal: newConfig.conversionMetric,
      lifecycleStatus: 'Draft',
      progressStatus: 'Amber',
      goalAchievedPercent: 0,
      budgetSpentPercent: 0,
      lastSavedStep: 1,
      config: newConfig,
    };

    // Prepend to list
    setUseCases((prev) => [newRecord, ...prev]);
    setActiveUseCaseId(newId);
    setState(newConfig);
    setViewMode('orchestration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 2. Open / Edit Use Case (Warning Popup -> Confirm -> Edit) ────
  const handleEditUseCase = (target: UseCaseRecord) => {
    // Show warning confirmation modal before editing
    setPendingEditUseCase(target);
    setShowEditWarningModal(true);
  };

  const handleConfirmEditUseCase = () => {
    if (!pendingEditUseCase) return;
    const target = pendingEditUseCase;
    setActiveUseCaseId(target.id);

    const stepToOpen = 1;

    // Calculate or set achieved metrics for edit mode indicators
    const qtyNum = parseInt(target.config.conversionQuantity?.replace(/[^0-9]/g, '') || '10000', 10);
    const achievedPercent = target.goalAchievedPercent > 0 ? target.goalAchievedPercent : 50;
    const achievedQty = Math.round(qtyNum * (achievedPercent / 100));
    const achievedQtyStr = achievedQty > 0 ? achievedQty.toLocaleString('en-IN') : '5,000';

    const budgetNum = parseInt(target.config.overallBudget?.replace(/[^0-9]/g, '') || '20000000', 10);
    const spentPercent = target.budgetSpentPercent > 0 ? target.budgetSpentPercent : 50;
    const spentBudget = Math.round(budgetNum * (spentPercent / 100));
    const spentBudgetStr = spentBudget > 0 ? spentBudget.toLocaleString('en-IN') : '10,00,000';

    const restoredConfig: UseCaseState = {
      ...target.config,
      isEditMode: true,
      originalEndDate: target.config.endDate,
      originalDurationDays: target.config.durationDays,
      achievedConversions: achievedQtyStr,
      tillDateCoa: '3%',
      alreadySpentBudget: spentBudgetStr,
      currentStep: stepToOpen,
    };

    setState(restoredConfig);
    setShowEditWarningModal(false);
    setPendingEditUseCase(null);
    setViewMode('orchestration');
    showToast(`Edit Mode Active: Product, Partner, and Goal are locked.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 3. Duplicate Use Case ─────────────────────────────────────────
  const handleDuplicateUseCase = (target: UseCaseRecord) => {
    const newId = `uc-copy-${Date.now()}`;
    const now = new Date();
    const copyName = `${target.useCaseName} (Copy)`;

    const duplicatedRecord: UseCaseRecord = {
      ...target,
      id: newId,
      useCaseName: copyName,
      createdAt: now.toISOString(),
      createdDateFormatted: formatDateForTable(now),
      lifecycleStatus: 'Draft',
      progressStatus: 'Amber',
      goalAchievedPercent: 0,
      budgetSpentPercent: 0,
      lastSavedStep: 1,
      config: {
        ...target.config,
        useCaseName: copyName,
        currentStep: 1,
        completedSteps: [],
        status: 'draft',
      },
    };

    setUseCases((prev) => [duplicatedRecord, ...prev]);
    setActiveUseCaseId(newId);
    setState(duplicatedRecord.config);
    setViewMode('orchestration');
    showToast(`Duplicated as new Draft: "${copyName}".`);
  };

  // ── 4. Lifecycle Status Actions (Pause, Stop, Resume, Archive) ─────────────
  const handleUpdateLifecycleStatus = (id: string, newStatus: LifecycleStatus) => {
    setUseCases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            lifecycleStatus: newStatus,
          };
        }
        return item;
      })
    );
    showToast(`Use case status updated to ${newStatus}.`);
  };

  // ── 4b. Delete Single Draft ──────────────────────────────────────
  const handleDeleteUseCase = (id: string) => {
    setUseCases((prev) => prev.filter((item) => item.id !== id));
    showToast('Draft use case deleted successfully.');
  };

  // ── 4c. Batch Delete Drafts ──────────────────────────────────────
  const handleBatchDeleteUseCases = (ids: string[]) => {
    setUseCases((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast(`${ids.length} draft use cases deleted successfully.`);
  };

  // ── 4d. Batch Archive Drafts ─────────────────────────────────────
  const handleBatchArchiveUseCases = (ids: string[]) => {
    setUseCases((prev) =>
      prev.map((item) => {
        if (ids.includes(item.id)) {
          return {
            ...item,
            lifecycleStatus: 'Archived',
          };
        }
        return item;
      })
    );
    showToast(`${ids.length} drafts moved to Archived.`);
  };

  // ── 5. Save as Draft (Explicit button) ────────────────────────────
  const handleSaveDraft = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updateState({ lastSavedAt: timeStr });

    if (activeUseCaseId) {
      setUseCases((prev) =>
        prev.map((item) => {
          if (item.id === activeUseCaseId) {
            return {
              ...item,
              useCaseName: state.useCaseName || item.useCaseName,
              goal: state.conversionMetric || item.goal,
              lastSavedStep: state.currentStep,
              config: {
                ...state,
                lastSavedAt: timeStr,
              },
            };
          }
          return item;
        })
      );
    }
    showToast(`Draft saved successfully at ${timeStr}. Current step preserved.`);
  };

  // ── 6. Step 5 Launch -> Confirm -> Go To Home ─────────────────────
  const handleLaunchSuccessAndGoHome = () => {
    if (activeUseCaseId) {
      const isFuture = isDateInFuture(state.startDate);
      const isEditing = Boolean(state.isEditMode);

      setUseCases((prev) =>
        prev.map((item) => {
          if (item.id === activeUseCaseId) {
            const computedStatus: LifecycleStatus = isEditing
              ? (item.lifecycleStatus === 'Draft' ? (isFuture ? 'Scheduled' : 'Active') : item.lifecycleStatus)
              : (isFuture ? 'Scheduled' : 'Active');

            return {
              ...item,
              useCaseName: state.useCaseName || item.useCaseName,
              goal: state.conversionMetric || item.goal,
              lifecycleStatus: computedStatus,
              progressStatus: computedStatus === 'Active' ? 'Green' : item.progressStatus,
              goalAchievedPercent: item.goalAchievedPercent || (computedStatus === 'Active' ? 12 : 0),
              budgetSpentPercent: item.budgetSpentPercent || (computedStatus === 'Active' ? 10 : 0),
              lastSavedStep: 5,
              config: {
                ...state,
                isEditMode: false,
                status: 'scheduled',
                scheduledDate: state.startDate,
              },
            };
          }
          return item;
        })
      );
      showToast(isEditing ? 'Use case updated successfully.' : 'Use case launched successfully.');
    }
    setViewMode('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 7. Open Decision / Insight (Click on Use Case Name) ────────────
  const handleOpenDecisionInsight = (record: UseCaseRecord) => {
    setInsightUseCase(record);
    setViewMode('decision_insight');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step navigation helpers for the 5-step wireframe flow
  const goToNextStep = (nextStepNum: number) => {
    const completed = Array.from(new Set([...state.completedSteps, state.currentStep]));
    updateState({
      currentStep: nextStepNum,
      completedSteps: completed,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevStep = (prevStepNum: number) => {
    updateState({ currentStep: prevStepNum });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (stepId: number) => {
    if (state.completedSteps.includes(stepId) || stepId === state.currentStep) {
      updateState({ currentStep: stepId });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Campaign Flow Handlers ─────────────────────────────────────────
  const handleAssignCampaign = (camp: CampaignRecord) => {
    if (isDateInPast(camp.decisionDate) || camp.status === 'Archived') {
      showToast('Past campaigns cannot be assigned or launched.');
      return;
    }
    setActiveCampaignId(camp.id);
    setActiveConfigCampaignId(camp.id);
    setViewMode('template_config');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCampaign = (camp: CampaignRecord) => {
    setActiveCampaignId(camp.id);
    setActiveConfigCampaignId(camp.id);
    if (
      camp.status === 'Launched' ||
      camp.status === 'Scheduled' ||
      camp.status === 'Approved' ||
      camp.status === 'Archived' ||
      camp.status === 'Completed' ||
      isDateInPast(camp.decisionDate)
    ) {
      setUnlockedReviewIds((prev) => Array.from(new Set([...prev, camp.id])));
      setViewMode('review_approved');
    } else {
      setViewMode('template_config');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTemplateConfigNext = (updated: CampaignRecord) => {
    updateCampaign(updated);
    setUnlockedReviewIds((prev) => Array.from(new Set([...prev, updated.id])));
    showToast('Template configuration saved. Proceeding to Suppression.');
    setViewMode('suppression');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuppressionNext = (updated: CampaignRecord) => {
    updateCampaign(updated);
    setUnlockedReviewIds((prev) => Array.from(new Set([...prev, updated.id])));
    showToast('Suppression rules saved. Ready for review & approval.');
    setViewMode('review_approved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApproveCampaign = (updated: CampaignRecord) => {
    updateCampaign(updated);
    showToast('Campaign approved and queued for QA.');
    setViewMode('campaign_queue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApproveAndLaunchCampaign = (updated: CampaignRecord) => {
    updateCampaign(updated);
    showToast('Campaign approved. Ready to launch.');
    setViewMode('review_launch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQueueOpenLaunch = (camp: CampaignRecord) => {
    setActiveCampaignId(camp.id);
    setViewMode('review_launch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchSuccess = (launched: CampaignRecord) => {
    updateCampaign(launched);
    showToast('Campaign launched successfully!');
    setViewMode('campaign_queue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Shell
      viewMode={viewMode}
      currentStep={state.currentStep}
      completedSteps={state.completedSteps}
      onStepClick={handleStepClick}
      onSaveDraft={handleSaveDraft}
      onNavigateHome={() => setViewMode('home')}
      onNewUseCase={handleNewUseCase}
      onNavigateInsight={() => {
        const target = insightUseCase || useCases.find((u) => u.lifecycleStatus === 'Active') || useCases[0];
        if (target) {
          setInsightUseCase(target);
          setViewMode('decision_insight');
        }
      }}
      onNavigateCampaigns={() => {
        setActiveConfigCampaignId(null);
        setViewMode('campaigns_list');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onNavigateCampaignStep={(targetMode) => {
        if (targetMode === 'campaigns_list') {
          setActiveConfigCampaignId(null);
          setViewMode('campaigns_list');
        } else if (targetMode === 'template_config') {
          if (!canAccessTemplate) {
            showToast('Please click "Assign" or select a campaign to open Template Configuration.');
            return;
          }
          setViewMode('template_config');
        } else if (targetMode === 'suppression') {
          if (!canAccessSuppression) {
            showToast('Please click "Assign" or select a campaign first.');
            return;
          }
          setViewMode('suppression');
        } else if (targetMode === 'review_approved') {
          if (!canAccessReviewApproved) {
            showToast('Please fill all values and click "Save & Next" to open Review & Approved.');
            return;
          }
          setViewMode('review_approved');
        } else if (targetMode === 'campaign_queue') {
          setViewMode('campaign_queue');
        } else if (targetMode === 'review_launch') {
          if (!canAccessReviewLaunch) {
            showToast('Please select a campaign from Campaign Queue (QA) to review and launch.');
            return;
          }
          setViewMode('review_launch');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      canAccessTemplate={canAccessTemplate}
      canAccessSuppression={canAccessSuppression}
      canAccessReviewApproved={canAccessReviewApproved}
      canAccessReviewLaunch={canAccessReviewLaunch}
      onBlockedNavigation={(targetMode) => {
        if (targetMode === 'template_config') {
          showToast('Please click "Assign" or select a campaign to open Template Configuration.');
        } else if (targetMode === 'suppression') {
          showToast('Please click "Assign" or select a campaign first.');
        } else if (targetMode === 'review_approved') {
          showToast('Please fill all values and click "Save & Next" to open Review & Approved.');
        } else if (targetMode === 'review_launch') {
          showToast('Please select a campaign from Campaign Queue (QA) to review and launch.');
        }
      }}
      lastSavedAt={state.lastSavedAt}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#1A1816] text-white rounded-[10px] shadow-2xl border border-[#231E1A] text-[13px] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <BookmarkCheck className="w-4 h-4 text-[#FF5C35]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Home View ─────────────────────────────────────────────── */}
      {viewMode === 'home' && (
        <UseCaseHome
          useCases={useCases}
          onNewUseCase={handleNewUseCase}
          onEditUseCase={handleEditUseCase}
          onOpenDecisionInsight={handleOpenDecisionInsight}
          onDuplicateUseCase={handleDuplicateUseCase}
          onUpdateLifecycleStatus={handleUpdateLifecycleStatus}
          onDeleteUseCase={handleDeleteUseCase}
          onBatchDeleteUseCases={handleBatchDeleteUseCases}
          onBatchArchiveUseCases={handleBatchArchiveUseCases}
        />
      )}

      {/* ── 2. Insights Destination (Use Case Name clicked) ──────────── */}
      {viewMode === 'decision_insight' && insightUseCase && (
        <InsightDashboard
          useCase={insightUseCase}
          onBackToHome={() => setViewMode('home')}
          onEditUseCase={handleEditUseCase}
          onUpdateLifecycleStatus={(id, newStatus) => {
            handleUpdateLifecycleStatus(id, newStatus);
            setInsightUseCase((prev) => (prev && prev.id === id ? { ...prev, lifecycleStatus: newStatus } : prev));
          }}
        />
      )}

      {/* ── 3. Orchestration 5-Step Flow (Unchanged Wireframes) ──────── */}
      {viewMode === 'orchestration' && (
        <>
          {state.currentStep === 1 && (
            <Step1Objective
              state={state}
              updateState={updateState}
              onNext={() => goToNextStep(2)}
              onBack={() => setViewMode('home')}
            />
          )}

          {state.currentStep === 2 && (
            <Step2BudgetSchedule
              state={state}
              updateState={updateState}
              onNext={() => goToNextStep(3)}
              onBack={() => goToPrevStep(1)}
            />
          )}

          {state.currentStep === 3 && (
            <Step3Audience
              state={state}
              updateState={updateState}
              onNext={() => goToNextStep(4)}
              onBack={() => goToPrevStep(2)}
            />
          )}

          {state.currentStep === 4 && (
            <Step4ChannelsContent
              state={state}
              updateState={updateState}
              onNext={() => goToNextStep(5)}
              onBack={() => goToPrevStep(3)}
              onGoToStep2={() => goToPrevStep(2)}
            />
          )}

          {state.currentStep === 5 && (
            <Step5ReviewConfirm
              state={state}
              updateState={updateState}
              onBack={() => goToPrevStep(4)}
              onGoToHome={handleLaunchSuccessAndGoHome}
            />
          )}
        </>
      )}

      {/* ── 4. Campaigns Flow (Screens 1 to 7) ─────────────────────────── */}
      {viewMode === 'campaigns_list' && (
        <CampaignsList
          campaigns={campaigns}
          onAssignCampaign={handleAssignCampaign}
          onViewCampaign={handleViewCampaign}
          onRefresh={() => {
            showToast('Campaign recommendations refreshed');
          }}
        />
      )}

      {viewMode === 'template_config' && (
        <TemplateConfiguration
          campaign={activeCampaign}
          onBack={() => {
            setActiveConfigCampaignId(null);
            setViewMode('campaigns_list');
          }}
          onSaveDraft={(updated) => {
            updateCampaign(updated);
            showToast('Draft template configuration saved');
          }}
          onSaveAndNext={handleTemplateConfigNext}
          onNext={handleTemplateConfigNext}
          onShowToast={showToast}
          onRefresh={() => {
            showToast('Template refreshed from vendor library');
          }}
        />
      )}

      {viewMode === 'suppression' && (
        <SuppressionScreen
          campaign={activeCampaign}
          onBack={() => setViewMode('template_config')}
          onSaveDraft={(updated) => {
            updateCampaign(updated);
            showToast('Suppression rules draft saved');
          }}
          onSaveAndNext={handleSuppressionNext}
          onNext={handleSuppressionNext}
          onShowToast={showToast}
          onRefresh={() => {
            showToast('Audience counts recomputed');
          }}
        />
      )}

      {viewMode === 'review_approved' && (
        <ReviewApprovedScreen
          campaign={activeCampaign}
          onBack={() => {
            if (
              activeCampaign.status === 'Launched' ||
              activeCampaign.status === 'Scheduled' ||
              activeCampaign.status === 'Archived' ||
              activeCampaign.status === 'Completed' ||
              isDateInPast(activeCampaign.decisionDate)
            ) {
              setActiveConfigCampaignId(null);
              setViewMode('campaigns_list');
            } else {
              setViewMode('suppression');
            }
          }}
          onApprove={handleApproveCampaign}
          onApproveAndLaunch={handleApproveAndLaunchCampaign}
          onRefresh={() => {
            showToast('Review data refreshed');
          }}
        />
      )}

      {viewMode === 'campaign_queue' && (
        <CampaignQueueScreen
          campaigns={campaigns}
          onOpenReviewLaunch={handleQueueOpenLaunch}
          onRefresh={() => {
            showToast('Queue refreshed');
          }}
        />
      )}

      {viewMode === 'review_launch' && (
        <ReviewLaunchScreen
          campaign={activeCampaign}
          onBack={() => setViewMode('campaign_queue')}
          onLaunchSuccess={handleLaunchSuccess}
          onRefresh={() => {
            showToast('Campaign status re-verified');
          }}
        />
      )}

      {/* Edit Use Case Warning & Policy Modal */}
      {showEditWarningModal && pendingEditUseCase && (
        <EditUseCaseWarningModal
          isOpen={showEditWarningModal}
          useCase={pendingEditUseCase}
          onClose={() => {
            setShowEditWarningModal(false);
            setPendingEditUseCase(null);
          }}
          onConfirm={handleConfirmEditUseCase}
        />
      )}
    </Shell>
  );
}
