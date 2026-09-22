import { ThemeOption } from '../types';

export const PRODUCT_L1_OPTIONS = ['Unsecured', 'Secured', 'Credit Card'];
export const PARTNER_OPTIONS = ['BFL', 'T5', 'OA'];

export const PRODUCT_L2_MAP: Record<string, string[]> = {
  Unsecured: ['SOL', 'BOL', 'PROL'],
  Secured: [
    'Home Loan',
    'Home Loan Balance Transfer',
    'Education Loan',
    'Gold Loan',
    'Loan Against Property (LAP)',
    'Loan Against Property – Balance Transfer',
  ],
  'Credit Card': [],
};

export const PRODUCT_L3_OPTIONS = ['PL', 'S1', 'PLCS', 'PLTB'];

export const CONVERSION_METRICS = ['Lead', 'AIP', 'Disbursement'];

export const COA_OPERATORS = ['Less than', 'Is', 'Between'] as const;

export const CHANNELS_AVAILABLE = ['WhatsApp', 'SMS', 'RCS'];

export const VENDORS_BY_CHANNEL: Record<string, string[]> = {
  WhatsApp: ['Infobip', 'Netcore', 'Karix'],
  RCS: ['Infobip', 'Netcore', 'Karix'],
  SMS: ['VILPOWER', 'Karix', 'Netcore'],
};

export const THEMES_BY_VENDOR: Record<string, ThemeOption[]> = {
  Infobip: [
    { id: 'infobip-promo', name: 'Promotional', templateCount: 12, vendorId: 'Infobip' },
    { id: 'infobip-txn', name: 'Transactional', templateCount: 10, vendorId: 'Infobip' },
    { id: 'infobip-acc', name: 'Account', templateCount: 8, vendorId: 'Infobip' },
    { id: 'infobip-asp', name: 'Aspiration', templateCount: 15, vendorId: 'Infobip' },
    { id: 'infobip-conv', name: 'Convenience / Ease', templateCount: 9, vendorId: 'Infobip' },
    { id: 'infobip-emp', name: 'Empowerment / Control', templateCount: 14, vendorId: 'Infobip' },
    { id: 'infobip-fomo', name: 'FOMO', templateCount: 7, vendorId: 'Infobip' },
    { id: 'infobip-grat', name: 'Gratitude / Recognition', templateCount: 11, vendorId: 'Infobip' },
    { id: 'infobip-loss', name: 'Loss Aversion', templateCount: 6, vendorId: 'Infobip' },
    { id: 'infobip-zero', name: 'Seasonal Clearance', templateCount: 0, vendorId: 'Infobip' },
  ],
  Netcore: [
    { id: 'netcore-promo', name: 'Promotional', templateCount: 7, vendorId: 'Netcore' },
    { id: 'netcore-acc', name: 'Account', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-asp', name: 'Aspiration', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-commit', name: 'Commitment / Consistency', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-conv', name: 'Convenience / Ease', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-emp', name: 'Empowerment / Control', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-fear', name: 'Fear / Security', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-fomo', name: 'FOMO', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-grat', name: 'Gratitude / Recognition', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-loss', name: 'Loss Aversion', templateCount: 10, vendorId: 'Netcore' },
    { id: 'netcore-zero', name: 'Pre-Approved Festive Offer', templateCount: 0, vendorId: 'Netcore' },
  ],
  Karix: [
    { id: 'karix-promo', name: 'Promotional', templateCount: 9, vendorId: 'Karix' },
    { id: 'karix-sample1', name: 'Sample Theme', templateCount: 10, vendorId: 'Karix' },
    { id: 'karix-sample2', name: 'Account Verification', templateCount: 12, vendorId: 'Karix' },
    { id: 'karix-sample3', name: 'Festive Flash Nudge', templateCount: 10, vendorId: 'Karix' },
    { id: 'karix-sample4', name: 'Re-engagement Reminder', templateCount: 8, vendorId: 'Karix' },
    { id: 'karix-zero', name: 'VIP Priority Care', templateCount: 0, vendorId: 'Karix' },
  ],
  VILPOWER: [
    { id: 'vil-promo', name: 'Promotional', templateCount: 14, vendorId: 'VILPOWER' },
    { id: 'vil-alert', name: 'Critical Alerts', templateCount: 10, vendorId: 'VILPOWER' },
    { id: 'vil-payment', name: 'Payment Reminder', templateCount: 10, vendorId: 'VILPOWER' },
    { id: 'vil-seasonal', name: 'Seasonal Offer', templateCount: 10, vendorId: 'VILPOWER' },
    { id: 'vil-welcome', name: 'Welcome Message', templateCount: 0, vendorId: 'VILPOWER' },
  ],
};
