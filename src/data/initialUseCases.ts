import { UseCaseRecord, UseCaseState } from '../types';

export const DEFAULT_INITIAL_CONFIG: UseCaseState = {
  currentStep: 1,
  completedSteps: [1, 2, 3, 4],

  // Step 1: Objective
  productL1: 'Unsecured',
  partner: 'BFL',
  productL2: ['SOL'],
  productL3: ['S1'],
  conversionMetric: 'AIP',
  conversionQuantity: '10000',
  coaOperator: 'Less than',
  coaValue1: '2.0',
  coaValue2: '',
  useCaseName: '10,000 AIP Optimization for Unsecured_BFL_SOL_S1',
  isNameManuallyEdited: false,

  // Step 2: Budget & Schedule
  startDate: '01/09/2026',
  endDate: '30/09/2026',
  durationDays: 30,
  overallBudget: '40000000',
  dailyMin: '400000',
  dailyMax: '400000',
  selectedChannels: ['WhatsApp', 'RCS', 'SMS'],
  channelBudgets: {
    WhatsApp: { overall: '20000000', dailyMin: '100000', dailyMax: '10000000' },
    RCS: { overall: '10000000', dailyMin: '100000', dailyMax: '5000000' },
    SMS: { overall: '10000000', dailyMin: '100000', dailyMax: '5000000' },
  },
  weeklyAllocations: [
    { week: 1, percent: '20.0', amount: 8000000 },
    { week: 2, percent: '20.0', amount: 8000000 },
    { week: 3, percent: '20.0', amount: 8000000 },
    { week: 4, percent: '20.0', amount: 8000000 },
    { week: 5, percent: '20.0', amount: 8000000 },
  ],

  // Step 3: Audience
  sqlQuery: 'SELECT DISTINCT context_id FROM dev.gold_customerfeaturestore WHERE context_id IS NOT NULL;',
  executedQuery: 'SELECT DISTINCT context_id FROM dev.gold_customerfeaturestore WHERE context_id IS NOT NULL;',
  audienceCount: 50000,
  isQueryRunning: false,
  queryError: null,
  isStale: false,

  // Step 4: Channels & Content
  channelConfigs: {
    WhatsApp: {
      vendors: ['Infobip', 'Netcore'],
      themes: ['infobip-promo', 'infobip-acc', 'netcore-promo'],
    },
    RCS: {
      vendors: ['Karix'],
      themes: ['karix-promo', 'karix-sample1'],
    },
    SMS: {
      vendors: ['VILPOWER'],
      themes: ['vil-promo', 'vil-alert'],
    },
  },

  // Step 5: Review & Launch
  status: 'scheduled',
  scheduledDate: '01/09/2026',
  lastSavedAt: '10:30 AM',
};

/**
 * Pre-seeded records representing the wireframe in the screenshot
 */
export const SEED_USE_CASES: UseCaseRecord[] = [
  {
    id: 'uc-seed-1',
    useCaseName: '10,000 AIP Optimization for Unsecured_BFL_SOL_S1',
    createdAt: '2026-09-01T08:00:00.000Z',
    createdDateFormatted: '01 Sept 2026',
    goal: 'AIP',
    lifecycleStatus: 'Active',
    progressStatus: 'Green',
    goalAchievedPercent: 68,
    budgetSpentPercent: 54,
    lastSavedStep: 5,
    config: {
      ...DEFAULT_INITIAL_CONFIG,
      useCaseName: '10,000 AIP Optimization for Unsecured_BFL_SOL_S1',
      startDate: '01/09/2026',
      endDate: '30/09/2026',
    },
  },
  {
    id: 'uc-seed-2',
    useCaseName: '10,000 AIP Optimization for Unsecured_BFL_SOL_S1',
    createdAt: '2026-09-01T09:30:00.000Z',
    createdDateFormatted: '01 Sept 2026',
    goal: 'AIP',
    lifecycleStatus: 'Active',
    progressStatus: 'Green',
    goalAchievedPercent: 72,
    budgetSpentPercent: 60,
    lastSavedStep: 5,
    config: {
      ...DEFAULT_INITIAL_CONFIG,
      useCaseName: '10,000 AIP Optimization for Unsecured_BFL_SOL_S1',
      startDate: '01/09/2026',
      endDate: '30/09/2026',
    },
  },
  {
    id: 'uc-seed-3',
    useCaseName: '10,000 AIP Optimization for Unsecured_BFL_SOL_S1',
    createdAt: '2026-09-01T11:15:00.000Z',
    createdDateFormatted: '01 Sept 2026',
    goal: 'AIP',
    lifecycleStatus: 'Active',
    progressStatus: 'Green',
    goalAchievedPercent: 58,
    budgetSpentPercent: 49,
    lastSavedStep: 5,
    config: {
      ...DEFAULT_INITIAL_CONFIG,
      useCaseName: '10,000 AIP Optimization for Unsecured_BFL_SOL_S1',
      startDate: '01/09/2026',
      endDate: '30/09/2026',
    },
  },
  {
    id: 'uc-seed-4',
    useCaseName: '5,000 Lead Campaign for Secured_BFL_Home Loan',
    createdAt: '2026-09-08T14:20:00.000Z',
    createdDateFormatted: '08 Sept 2026',
    goal: 'Lead',
    lifecycleStatus: 'Scheduled',
    progressStatus: 'Green',
    goalAchievedPercent: 0,
    budgetSpentPercent: 0,
    lastSavedStep: 5,
    config: {
      ...DEFAULT_INITIAL_CONFIG,
      productL1: 'Secured',
      productL2: ['Home Loan'],
      productL3: [],
      conversionMetric: 'Lead',
      conversionQuantity: '5000',
      useCaseName: '5,000 Lead Campaign for Secured_BFL_Home Loan',
      startDate: '20/09/2026',
      endDate: '10/10/2026',
    },
  },
  {
    id: 'uc-seed-5',
    useCaseName: '2,500 Disbursement Optimization for Credit Card_T5',
    createdAt: '2026-09-10T16:45:00.000Z',
    createdDateFormatted: '10 Sept 2026',
    goal: 'Disbursement',
    lifecycleStatus: 'Draft',
    progressStatus: 'Amber',
    goalAchievedPercent: 0,
    budgetSpentPercent: 0,
    lastSavedStep: 3, // left on Audience page
    config: {
      ...DEFAULT_INITIAL_CONFIG,
      productL1: 'Credit Card',
      partner: 'T5',
      conversionMetric: 'Disbursement',
      conversionQuantity: '2500',
      useCaseName: '2,500 Disbursement Optimization for Credit Card_T5',
      currentStep: 3,
      completedSteps: [1, 2],
    },
  },
];
