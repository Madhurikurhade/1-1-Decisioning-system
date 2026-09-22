import React from 'react';
import {
  LayoutGrid,
  Box,
  Brain,
  CreditCard,
  Shield,
  TrendingUp,
  Settings,
  Check,
  Target,
  CalendarDays,
  Users,
  Megaphone,
  FileCheck2,
  Lightbulb,
  BarChart2,
  Home as HomeIcon,
  PlusCircle,
  Layers,
  Filter,
  CheckCircle2,
  Send,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AppViewMode } from '../types';

interface ShellProps {
  viewMode?: AppViewMode;
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
  onSaveDraft: () => void;
  onNavigateHome: () => void;
  onNewUseCase: () => void;
  onNavigateInsight?: () => void;
  onNavigateCampaigns?: () => void;
  onNavigateCampaignStep?: (mode: AppViewMode) => void;
  canAccessTemplate?: boolean;
  canAccessSuppression?: boolean;
  canAccessReviewApproved?: boolean;
  canAccessReviewLaunch?: boolean;
  onBlockedNavigation?: (mode: AppViewMode) => void;
  lastSavedAt: string | null;
  children: React.ReactNode;
}

const STEPS = [
  { id: 1, code: '01', label: 'Objective', icon: Target },
  { id: 2, code: '02', label: 'Budget & Schedule', icon: CalendarDays },
  { id: 3, code: '03', label: 'Audience', icon: Users },
  { id: 4, code: '04', label: 'Channels & Content', icon: Megaphone },
  { id: 5, code: '05', label: 'Review & Launch', icon: FileCheck2 },
];

export const Shell: React.FC<ShellProps> = ({
  viewMode = 'orchestration',
  currentStep,
  completedSteps,
  onStepClick,
  onSaveDraft,
  onNavigateHome,
  onNewUseCase,
  onNavigateInsight,
  onNavigateCampaigns,
  onNavigateCampaignStep,
  canAccessTemplate = false,
  canAccessSuppression = false,
  canAccessReviewApproved = false,
  canAccessReviewLaunch = false,
  onBlockedNavigation,
  lastSavedAt,
  children,
}) => {
  const isCampaignView = [
    'campaigns_list',
    'template_config',
    'suppression',
    'review_approved',
    'campaign_queue',
    'review_launch',
  ].includes(viewMode);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F1EB] select-none font-body">
      {/* ── 1. Primary Left Dark Rail (~52px) ─────────────────────────────── */}
      <aside className="w-[52px] bg-[#13100D] flex flex-col items-center justify-between py-3 flex-shrink-0 z-20 border-r border-[#231E1A]">
        {/* Top: Logo Mark */}
        <div className="flex flex-col items-center gap-5">
          <div
            onClick={onNavigateHome}
            className="w-8 h-8 rounded-[7px] p-0.5 cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
            title="Attributics · Content Studio"
          >
            {/* SVG Logo mark */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#98242A" />
                  <stop offset="48%" stopColor="#C64D20" />
                  <stop offset="100%" stopColor="#D39741" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="7" fill="url(#logo-grad)" />
              <rect x="11" y="11" width="10" height="10" rx="1.5" fill="white" transform="rotate(45 16 16)" />
              <line x1="0" y1="0" x2="11" y2="11" stroke="white" strokeWidth="1.8" />
              <line x1="21" y1="21" x2="32" y2="32" stroke="white" strokeWidth="1.8" />
            </svg>
          </div>

          {/* Rail Icons */}
          <nav className="flex flex-col items-center gap-3">
            {/* 1. Grid (Dashboard / Home) */}
            <button
              type="button"
              onClick={onNavigateHome}
              title="Dashboard"
              className="w-9 h-9 rounded-[7px] flex items-center justify-center text-[#807A70] hover:text-white hover:bg-[#231E1A] transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* 2. Cube (Use Case Orchestration) */}
            <button
              type="button"
              onClick={onNavigateHome}
              title="Use Case Orchestration"
              className={`w-9 h-9 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                !isCampaignView && viewMode !== 'insight' && viewMode !== 'decision_insight'
                  ? 'bg-[#FF5C35] text-white shadow-sm'
                  : 'text-[#807A70] hover:text-white hover:bg-[#231E1A]'
              }`}
            >
              <Box className="w-[18px] h-[18px] stroke-[2]" />
            </button>

            {/* 3. Brain (Campaigns & Decisioning - highlighted when in Campaign View) */}
            <button
              type="button"
              onClick={onNavigateCampaigns}
              title="Campaigns & Decisioning"
              className={`w-9 h-9 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                isCampaignView
                  ? 'bg-[#FF5C35] text-white shadow-sm'
                  : 'text-[#807A70] hover:text-white hover:bg-[#231E1A]'
              }`}
            >
              <Brain className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* 4. Content Agent (Content Studio) */}
            <button
              type="button"
              title="Content Agent (Content Studio)"
              className="w-9 h-9 rounded-[7px] flex items-center justify-center text-[#807A70] hover:text-white hover:bg-[#231E1A] transition-colors cursor-pointer"
            >
              <Sparkles className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* 5. Shield (Compliance) */}
            <button
              type="button"
              title="Compliance & Governance"
              className="w-9 h-9 rounded-[7px] flex items-center justify-center text-[#807A70] hover:text-white hover:bg-[#231E1A] transition-colors cursor-pointer"
            >
              <Shield className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* 6. Trending Chart (Analytics / Insight) */}
            <button
              type="button"
              onClick={onNavigateInsight}
              title="Analytics"
              className="w-9 h-9 rounded-[7px] flex items-center justify-center text-[#807A70] hover:text-white hover:bg-[#231E1A] transition-colors cursor-pointer"
            >
              <TrendingUp className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>
          </nav>
        </div>

        {/* Bottom Rail: Settings */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            title="Settings"
            className="w-9 h-9 rounded-[7px] flex items-center justify-center text-[#807A70] hover:text-white hover:bg-[#231E1A] transition-colors cursor-pointer"
          >
            <Settings className="w-[18px] h-[18px] stroke-[1.75]" />
          </button>
        </div>
      </aside>

      {/* ── 2. Secondary Sidebar Menu (~210px) ────────────────────────────── */}
      <aside className="w-[210px] bg-[#F4F1EB] flex flex-col flex-shrink-0 z-10 border-r border-[#E6E2DA] overflow-y-auto">
        {isCampaignView ? (
          /* Campaign Configuration Navigation Menu */
          <>
            <div className="px-4 pt-4 pb-2">
              <span className="text-[11.5px] font-normal text-[#A8A299] tracking-wide block">
                Campaign Configuration
              </span>
            </div>

            <nav className="flex flex-col space-y-0.5 px-3 flex-1">
              {/* Level 0: Campaigns (List) */}
              <button
                type="button"
                onClick={() => onNavigateCampaignStep?.('campaigns_list')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] transition-all cursor-pointer relative ${
                  viewMode === 'campaigns_list'
                    ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                    : 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium'
                }`}
              >
                {viewMode === 'campaigns_list' && (
                  <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                )}
                <Megaphone className={`w-4 h-4 flex-shrink-0 ${viewMode === 'campaigns_list' ? 'text-[#1A1816]' : 'text-[#706B62]'}`} />
                <span>Campaigns</span>
              </button>

              {/* Level 1 Sub-item: Template Configuration (indented) */}
              <button
                type="button"
                onClick={() => {
                  if (canAccessTemplate) {
                    onNavigateCampaignStep?.('template_config');
                  } else {
                    onBlockedNavigation?.('template_config');
                  }
                }}
                className={`w-full flex items-center gap-2.5 pl-7 pr-3 py-2 text-left text-[13px] rounded-[6px] transition-all relative ${
                  viewMode === 'template_config'
                    ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                    : canAccessTemplate
                    ? 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium cursor-pointer'
                    : 'text-[#A8A299] cursor-not-allowed opacity-80'
                }`}
              >
                {viewMode === 'template_config' && (
                  <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                )}
                <Layers
                  className={`w-4 h-4 flex-shrink-0 ${
                    viewMode === 'template_config'
                      ? 'text-[#1A1816]'
                      : canAccessTemplate
                      ? 'text-[#706B62]'
                      : 'text-[#A8A299]'
                  }`}
                />
                <span>Template Configuration</span>
              </button>

              {/* Level 1 Sub-item: Supression (indented) */}
              <button
                type="button"
                onClick={() => {
                  if (canAccessSuppression) {
                    onNavigateCampaignStep?.('suppression');
                  } else {
                    onBlockedNavigation?.('suppression');
                  }
                }}
                className={`w-full flex items-center gap-2.5 pl-7 pr-3 py-2 text-left text-[13px] rounded-[6px] transition-all relative ${
                  viewMode === 'suppression'
                    ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                    : canAccessSuppression
                    ? 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium cursor-pointer'
                    : 'text-[#A8A299] cursor-not-allowed opacity-80'
                }`}
              >
                {viewMode === 'suppression' && (
                  <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                )}
                <Users
                  className={`w-4 h-4 flex-shrink-0 ${
                    viewMode === 'suppression'
                      ? 'text-[#1A1816]'
                      : canAccessSuppression
                      ? 'text-[#706B62]'
                      : 'text-[#A8A299]'
                  }`}
                />
                <span>Supression</span>
              </button>

              {/* Level 1 Sub-item: Review & Approved (indented) */}
              <button
                type="button"
                onClick={() => {
                  if (canAccessReviewApproved) {
                    onNavigateCampaignStep?.('review_approved');
                  } else {
                    onBlockedNavigation?.('review_approved');
                  }
                }}
                className={`w-full flex items-center gap-2.5 pl-7 pr-3 py-2 text-left text-[13px] rounded-[6px] transition-all relative ${
                  viewMode === 'review_approved'
                    ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                    : canAccessReviewApproved
                    ? 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium cursor-pointer'
                    : 'text-[#A8A299] cursor-not-allowed opacity-80'
                }`}
              >
                {viewMode === 'review_approved' && (
                  <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                )}
                <FileCheck2
                  className={`w-4 h-4 flex-shrink-0 ${
                    viewMode === 'review_approved'
                      ? 'text-[#1A1816]'
                      : canAccessReviewApproved
                      ? 'text-[#706B62]'
                      : 'text-[#A8A299]'
                  }`}
                />
                <span>Review &amp; Approved</span>
              </button>

              {/* Level 0: Campaign Queue (QA) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateCampaignStep?.('campaign_queue')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] transition-all cursor-pointer relative ${
                    viewMode === 'campaign_queue'
                      ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                      : 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium'
                  }`}
                >
                  {viewMode === 'campaign_queue' && (
                    <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                  )}
                  <Target className={`w-4 h-4 flex-shrink-0 ${viewMode === 'campaign_queue' ? 'text-[#1A1816]' : 'text-[#706B62]'}`} />
                  <span>Campaign Queue (QA)</span>
                </button>
              </div>

              {/* Level 1 Sub-item: Review & Launch (indented) */}
              <button
                type="button"
                onClick={() => {
                  if (canAccessReviewLaunch) {
                    onNavigateCampaignStep?.('review_launch');
                  } else {
                    onBlockedNavigation?.('review_launch');
                  }
                }}
                className={`w-full flex items-center gap-2.5 pl-7 pr-3 py-2 text-left text-[13px] rounded-[6px] transition-all relative ${
                  viewMode === 'review_launch'
                    ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                    : canAccessReviewLaunch
                    ? 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium cursor-pointer'
                    : 'text-[#A8A299] cursor-not-allowed opacity-80'
                }`}
              >
                {viewMode === 'review_launch' && (
                  <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                )}
                <FileCheck2
                  className={`w-4 h-4 flex-shrink-0 ${
                    viewMode === 'review_launch'
                      ? 'text-[#1A1816]'
                      : canAccessReviewLaunch
                      ? 'text-[#706B62]'
                      : 'text-[#A8A299]'
                  }`}
                />
                <span>Review &amp; Launch</span>
              </button>

              {/* Level 0: Insight */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateInsight}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] transition-all cursor-pointer relative ${
                    viewMode === 'decision_insight' || viewMode === 'insight'
                      ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                      : 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium'
                  }`}
                >
                  {(viewMode === 'decision_insight' || viewMode === 'insight') && (
                    <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                  )}
                  <BarChart2
                    className={`w-4 h-4 flex-shrink-0 ${
                      viewMode === 'decision_insight' || viewMode === 'insight'
                        ? 'text-[#1A1816]'
                        : 'text-[#706B62]'
                    }`}
                  />
                  <span>Insight</span>
                </button>
              </div>
            </nav>

            {/* Quick switcher to Use Cases */}
            <div className="p-3 border-t border-[#E8E4DD] mt-auto">
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] text-[#706B62] hover:text-[#1A1816] hover:bg-[#EAE5DC] font-medium transition-colors cursor-pointer"
              >
                <Box className="w-3.5 h-3.5 text-[#FF5C35]" />
                <span>Use Case Home</span>
              </button>
            </div>
          </>
        ) : (
          /* Use Case Orchestration Navigation Menu */
          <>
            <div className="px-5 pt-5 pb-3">
              <span className="text-[11px] font-medium text-[#A8A299] tracking-wide block">
                Use Case Orchestration
              </span>
            </div>

            {viewMode === 'home' ? (
              <nav className="flex flex-col space-y-1 px-3 flex-1">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] bg-white text-[#1A1816] font-bold shadow-xs border border-[#E2DDD5]/60 transition-all cursor-pointer"
                >
                  <HomeIcon className="w-4 h-4 text-[#1A1816] stroke-[2.2] flex-shrink-0" />
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  onClick={onNewUseCase}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#706B62] stroke-[1.8] flex-shrink-0" />
                  <span>New Use Case</span>
                </button>

                <div className="my-2 border-t border-[#E8E4DD]" />

                {/* Recommended Campaigns */}
                <button
                  type="button"
                  title="Recommended Campaigns"
                  onClick={onNavigateCampaigns}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 flex-shrink-0 text-[#B5B0A6] stroke-[1.5]" />
                  <span className="truncate">Recommended Cam...</span>
                </button>

                {/* Insights */}
                <button
                  type="button"
                  title="Insights"
                  onClick={onNavigateInsight}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium transition-colors cursor-pointer"
                >
                  <BarChart2 className="w-4 h-4 flex-shrink-0 text-[#B5B0A6] stroke-[1.5]" />
                  <span>Insights</span>
                </button>
              </nav>
            ) : (
              <nav className="flex flex-col space-y-1 px-3 flex-1">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px] rounded-[6px] text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium transition-colors cursor-pointer mb-1"
                >
                  <HomeIcon className="w-3.5 h-3.5 text-[#706B62] flex-shrink-0" />
                  <span>Home</span>
                </button>

                {STEPS.map((step) => {
                  const isActive = viewMode === 'orchestration' && currentStep === step.id;
                  const isCompleted = completedSteps.includes(step.id);
                  const isClickable = isCompleted || step.id === currentStep;
                  const IconComponent = step.icon;

                  return (
                    <button
                      type="button"
                      key={step.id}
                      onClick={() => isClickable && onStepClick(step.id)}
                      disabled={!isClickable}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] transition-all relative ${
                        isActive
                          ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                          : isCompleted
                          ? 'text-[#1A1816] hover:bg-[#F2EEE7] font-medium cursor-pointer'
                          : 'text-[#9E988E] cursor-not-allowed'
                      }`}
                    >
                      {isActive && (
                        <span className="w-[3.5px] h-4 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                      )}

                      <IconComponent
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? 'text-[#1A1816] stroke-[2.2]'
                            : isCompleted
                            ? 'text-[#1A1816] stroke-[1.8]'
                            : 'text-[#B5B0A6] stroke-[1.5]'
                        }`}
                      />
                      <span className="truncate">{step.label}</span>
                    </button>
                  );
                })}

                <div className="my-2 border-t border-[#E8E4DD]" />

                {/* Recommended Campaigns (Image 2) */}
                <button
                  type="button"
                  title="Recommended Campaigns"
                  onClick={onNavigateCampaigns}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] transition-colors cursor-pointer ${
                    viewMode === 'campaigns_list'
                      ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                      : 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 flex-shrink-0 text-[#B5B0A6] stroke-[1.5]" />
                  <span className="truncate">Recommended Cam...</span>
                </button>

                {/* Insight (Image 2) */}
                <button
                  type="button"
                  title="Insights"
                  onClick={onNavigateInsight}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] rounded-[6px] transition-colors cursor-pointer ${
                    viewMode === 'decision_insight' || viewMode === 'insight'
                      ? 'bg-white text-[#1A1816] font-bold shadow-xs'
                      : 'text-[#706B62] hover:text-[#1A1816] hover:bg-[#F2EEE7] font-medium'
                  }`}
                >
                  {viewMode === 'decision_insight' || viewMode === 'insight' ? (
                    <span className="w-[3px] h-3.5 bg-[#FF5C35] rounded-full flex-shrink-0 -ml-1 mr-0.5" />
                  ) : null}
                  <BarChart2
                    className={`w-4 h-4 flex-shrink-0 ${
                      viewMode === 'decision_insight' || viewMode === 'insight'
                        ? 'text-[#FF5C35] stroke-[2.2]'
                        : 'text-[#B5B0A6] stroke-[1.5]'
                    }`}
                  />
                  <span>Insights</span>
                </button>
              </nav>
            )}
          </>
        )}
      </aside>

      {/* ── 3. Main Content Area ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F4F1EB] p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-[1240px] mx-auto flex flex-col min-h-full">
          {viewMode !== 'orchestration' ? (
            /* In Home, Campaigns, and Insight views, children render their custom header & controls */
            <div className="flex-1">{children}</div>
          ) : (
            /* In 5-step Orchestration Flow, retain exact wireframe layout */
            <>
              {/* Top Header Row */}
              <div className="flex items-start justify-between pb-2">
                <div>
                  <h1 className="font-serif-title text-[30px] sm:text-[34px] font-normal text-[#1A1816] tracking-[-0.02em] leading-tight">
                    Use Case Orchestration
                  </h1>
                  <p className="text-[13px] text-[#807A70] mt-1 font-body">
                    Create, configure, and manage Use Case
                  </p>
                </div>

                {/* Save as Draft Button */}
                <div className="flex items-center gap-3">
                  {lastSavedAt && (
                    <span className="text-[11px] text-[#807A70] font-data hidden sm:inline-block">
                      Saved at {lastSavedAt}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-[8px] text-[13px] font-semibold text-[#FF5C35] bg-transparent hover:bg-[#FF5C35]/5 transition-colors border border-[#FF5C35] cursor-pointer"
                  >
                    <span>Save as Draft</span>
                  </button>
                </div>
              </div>

              {/* Stepper Card */}
              <div className="w-full bg-white rounded-[12px] px-6 sm:px-8 py-3.5 border border-[#E2DDD5] shadow-xs flex items-center justify-between my-5 relative">
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[1px] bg-[#DCD5C8] z-0" />

                {STEPS.map((s) => {
                  const isActive = currentStep === s.id;
                  const isCompleted = completedSteps.includes(s.id);
                  const isClickable = isCompleted || s.id === currentStep;

                  return (
                    <div
                      key={s.id}
                      onClick={() => isClickable && onStepClick(s.id)}
                      className={`relative z-10 flex items-center gap-2 bg-white px-2 cursor-pointer transition-all ${
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-150 ${
                          isActive
                            ? 'border-4 border-[#1A1816] bg-white'
                            : isCompleted
                            ? 'bg-[#16A34A] border border-[#16A34A]'
                            : 'bg-white border-2 border-[#807A70]'
                        }`}
                      >
                        {isCompleted && !isActive && (
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        )}
                      </div>

                      <span
                        className={`text-[13px] whitespace-nowrap transition-colors ${
                          isActive
                            ? 'font-bold text-[#1A1816]'
                            : isCompleted
                            ? 'font-medium text-[#1A1816] hover:text-[#FF5C35]'
                            : 'font-normal text-[#807A70]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Form Content */}
              <div className="flex-1 mt-1">{children}</div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

