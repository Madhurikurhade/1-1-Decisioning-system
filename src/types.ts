export type ProductL1 = 'Unsecured' | 'Secured' | 'Credit Card' | '';
export type Partner = 'BFL' | 'T5' | 'OA' | '';
export type ConversionMetric = 'Lead' | 'AIP' | 'Disbursement' | '';
export type CoaOperator = 'Less than' | 'Is' | 'Between';

export interface ChannelBudget {
  overall: string;
  dailyMin: string;
  dailyMax: string;
}

export interface WeeklyAllocation {
  week: number;
  percent: string;
  amount: number;
}

export interface ThemeOption {
  id: string;
  name: string;
  templateCount: number;
  vendorId: string;
}

export interface ChannelContentConfig {
  vendors: string[];
  themes: string[]; // theme ids
}

export interface UseCaseState {
  currentStep: number; // 1 to 5
  completedSteps: number[];
  isEditMode?: boolean;
  originalEndDate?: string;
  originalDurationDays?: number;
  achievedConversions?: string;
  tillDateCoa?: string;
  alreadySpentBudget?: string;

  // Step 1: Objective
  productL1: ProductL1;
  partner: Partner;
  productL2: string[];
  productL3: string[];
  conversionMetric: ConversionMetric;
  conversionQuantity: string;
  coaOperator: CoaOperator;
  coaValue1: string;
  coaValue2: string;
  useCaseName: string;
  isNameManuallyEdited: boolean;

  // Step 2: Budget & Schedule
  startDate: string; // DD/MM/YYYY
  endDate: string;   // DD/MM/YYYY
  durationDays: number;
  overallBudget: string; // raw number or formatted
  dailyMin: string;
  dailyMax: string;
  selectedChannels: string[];
  channelBudgets: Record<string, ChannelBudget>;
  weeklyAllocations: WeeklyAllocation[];

  // Step 3: Audience
  sqlQuery: string;
  executedQuery: string | null;
  audienceCount: number | null;
  isQueryRunning: boolean;
  queryError: string | null;
  isStale: boolean;

  // Step 4: Channels & Content
  channelConfigs: Record<string, ChannelContentConfig>;

  // Step 5: Review & Launch
  status: 'draft' | 'scheduled';
  scheduledDate: string | null;
  lastSavedAt: string | null;
}

export type LifecycleStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Active'
  | 'Paused'
  | 'Stopped'
  | 'Completed'
  | 'Archived';

export type ProgressStatus = 'Green' | 'Amber' | 'Red';

export interface UseCaseRecord {
  id: string;
  useCaseName: string;
  createdAt: string; // ISO date
  createdDateFormatted: string; // e.g. "01 Sept 2026"
  goal: ConversionMetric;
  lifecycleStatus: LifecycleStatus;
  progressStatus: ProgressStatus;
  goalAchievedPercent: number; // e.g. 68 for 68% achieved
  budgetSpentPercent: number;  // e.g. 52 for 52% spent
  lastSavedStep: number;       // 1 to 5
  config: UseCaseState;
}

// ── Campaign Types (From Developer Handoff Specification) ───────────────────
export type CampaignStatus = 'Pending' | 'Approved' | 'Scheduled' | 'Launched' | 'Completed' | 'Archived';
export type CampaignAssignment = 'Assign' | 'Assigned' | 'Unassigned';

export interface SuppressionRule {
  id: string;
  property: string;
  operator: string;
  value: string;
  connector: 'AND' | 'OR';
}

export interface CampaignConfigData {
  vendor: string;
  sender: string;
  template: string;
  headerLink: string;
  ctaLink: string;
  variable: string;
  testMobileNumber?: string;
  suppressionRules: SuppressionRule[];
  customSuppressionGroups: string[];
  audienceBeforeSuppression: number;
  suppressedUserCount: number;
  audienceAfterSuppression: number;
  isApproved?: boolean;
}

export interface CampaignRecord {
  id: string;
  campaignName: string;
  useCaseId?: string;
  useCaseName: string;
  channel: 'RCS' | 'SMS' | 'WhatsApp';
  theme: string;
  audienceCount: number;
  spent: number;
  status: CampaignStatus;
  assignment: CampaignAssignment;
  decisionDate: string; // e.g. "01 Sept 2026" or "15 Sept 2026"
  launchDate?: string;
  productL3?: string;
  config: CampaignConfigData;
}

export type MainNavSection = 'use_cases' | 'campaigns';

export type AppViewMode =
  | 'home'
  | 'orchestration'
  | 'decision_insight'
  | 'insight'
  | 'campaigns_list'
  | 'template_config'
  | 'suppression'
  | 'review_approved'
  | 'campaign_queue'
  | 'review_launch';

