import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UseCaseRecord, ProgressStatus, LifecycleStatus } from '../../types';
import {
  BarChart2,
  TrendingUp,
  IndianRupee,
  Percent,
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Table as TableIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PauseCircle,
  StopCircle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Search,
  Check,
} from 'lucide-react';
import { formatIndianCurrency, parseRawNumber } from '../../utils/formatters';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface InsightDashboardProps {
  useCase: UseCaseRecord;
  onBackToHome: () => void;
  onEditUseCase?: (record: UseCaseRecord) => void;
  onUpdateLifecycleStatus?: (id: string, newStatus: LifecycleStatus) => void;
}

type MetricDisplayMode = 'achieved' | 'remaining';
type MetricValueUnit = 'number' | 'percentage';
type Granularity = 'Days' | 'Weeks' | 'Months';
type ChartViewType = 'chart' | 'table';
type ChartSubtype = 'line' | 'bar';

/**
 * Image 8-styled Compact Multi-Select Dropdown
 * Compact size, theme-aligned colors, search bar, select/clear all in theme orange,
 * black-checked checkbox with peach/orange active highlight.
 */
interface CompactMultiSelectProps {
  items: string[];
  selectedItems: string[];
  onChange: (items: string[]) => void;
  allLabel?: string;
  placeholder?: string;
  itemUnitLabel?: string;
  widthClass?: string;
}

const CompactMultiSelect: React.FC<CompactMultiSelectProps> = ({
  items,
  selectedItems,
  onChange,
  allLabel = 'All Channels',
  placeholder = 'Select Channel',
  itemUnitLabel = 'Channels',
  widthClass = 'w-[250px]',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (item: string) => {
    if (selectedItems.includes(item)) {
      onChange(selectedItems.filter((c) => c !== item));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([...items]);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const displayText = useMemo(() => {
    if (selectedItems.length === 0) return placeholder;
    if (selectedItems.length === items.length) return allLabel;
    if (selectedItems.length === 1) return selectedItems[0];
    return `${selectedItems.length} ${itemUnitLabel}`;
  }, [selectedItems, items, allLabel, placeholder, itemUnitLabel]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Compact Trigger Button (Theme styled matching Image 8) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-[32px] px-3 text-[12px] font-medium rounded-[7px] border transition-colors flex items-center gap-2 cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-[#FAF8F5] border-[#B8B2A7] text-[#1A1816]'
            : 'bg-white border-[#D5D0C7] text-[#1A1816] hover:bg-[#FAF8F5]'
        }`}
      >
        <span className="text-[#1A1816] font-medium whitespace-nowrap">{displayText}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#706B62] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#1A1816]' : ''
          }`}
        />
      </button>

      {/* Popover Menu (Matching Image 8) */}
      {isOpen && (
        <div
          className={`absolute top-[calc(100%+4px)] right-0 z-50 bg-white rounded-[8px] border border-[#DCD5C8] shadow-lg p-2.5 ${widthClass} animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Header Controls: Search + Select all / Clear all in theme orange */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#ECE7DE]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#807A70] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2 py-1 text-[12px] bg-[#FAF9F7] text-[#1A1816] border border-[#DCD5C8] rounded-[5px] outline-none focus:bg-white placeholder:text-[#807A70]"
              />
            </div>
            <div className="flex items-center text-[11px] font-semibold text-[#FF5C35] whitespace-nowrap pl-1">
              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:underline hover:text-[#E54A25] cursor-pointer"
              >
                Select all
              </button>
              <span className="mx-1 text-[#DCD5C8]">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="hover:underline hover:text-[#E54A25] cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto pr-0.5 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="py-3 text-center text-[12px] text-[#807A70]">No matches found</div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item);
                return (
                  <label
                    key={item}
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggle(item);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[12.5px] cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? 'bg-[#FFF2ED] text-[#1A1816] font-medium'
                        : 'hover:bg-[#F5F2EC] text-[#3A3631]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Checkbox matching Image 8: black square with check when selected */}
                      <span
                        className={`w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#1A1816] border border-[#1A1816]'
                            : 'border border-[#807A70] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                      </span>
                      <span className="truncate">{item}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// All product combinations requested by user
const ALL_PRODUCT_COMBINATIONS = [
  'BFL_SOL_S1',
  'BFL_SOL_PL',
  'BFL_SOL_PLCC',
  'BFL_SOL_PLTB',
  'BFL_SOL_PLCS',
  'BFL_BOL',
  'BFL_PROL',
  'OA_SOL',
  'OA_BOL',
  'T5_SOL',
  'T5_BOL',
];

export const InsightDashboard: React.FC<InsightDashboardProps> = ({
  useCase,
  onBackToHome,
  onEditUseCase,
  onUpdateLifecycleStatus,
}) => {
  // ── Available Channels ────────────────────────────────────────────
  const availableChannels = useMemo(() => {
    return useCase.config.selectedChannels && useCase.config.selectedChannels.length > 0
      ? useCase.config.selectedChannels
      : ['WhatsApp', 'RCS', 'SMS'];
  }, [useCase.config.selectedChannels]);

  // ── Mode & Filter States ──────────────────────────────────────────
  const [metricMode, setMetricMode] = useState<MetricDisplayMode>('achieved');
  const [valueUnit, setValueUnit] = useState<MetricValueUnit>('number');

  // Graph 1: Conversion Goal Performance States (Days, Weeks, Months)
  const [goalGranularity, setGoalGranularity] = useState<Granularity>('Days');
  const [goalViewType, setGoalViewType] = useState<ChartViewType>('chart');
  const [goalChartSubtype, setGoalChartSubtype] = useState<ChartSubtype>('line');

  // Graph 2: Channel-Wise Targeted vs AIP & Budget Spent States
  const [selectedChannels, setSelectedChannels] = useState<string[]>(availableChannels);
  const [channelGranularity, setChannelGranularity] = useState<Granularity>('Days');
  const [channelViewType, setChannelViewType] = useState<ChartViewType>('chart');
  const [channelChartSubtype, setChannelChartSubtype] = useState<ChartSubtype>('bar');

  // Graph 3: Targeted Product AIP vs Others AIP States
  const [selectedProducts, setSelectedProducts] = useState<string[]>(ALL_PRODUCT_COMBINATIONS);
  const [productGranularity, setProductGranularity] = useState<Granularity>('Days');
  const [productViewType, setProductViewType] = useState<ChartViewType>('chart');
  const [productChartSubtype, setProductChartSubtype] = useState<ChartSubtype>('bar');

  // Simulation mode for Drafts
  const [previewSimulatedDraft, setPreviewSimulatedDraft] = useState(false);

  // Status is fixed to the use case's real status
  const currentProgress: ProgressStatus = useCase.progressStatus || 'Green';

  // ── Metrics Math Calculation ──────────────────────────────────────
  const targetGoal = parseRawNumber(useCase.config.conversionQuantity) || 10000;
  const goalPercent = useCase.goalAchievedPercent || 68;
  const achievedGoal = Math.round((targetGoal * goalPercent) / 100);
  const remainingGoal = Math.max(0, targetGoal - achievedGoal);

  const totalBudget = parseRawNumber(useCase.config.overallBudget) || 40000000;
  const budgetSpentPercent = useCase.budgetSpentPercent || 54;
  const spentBudget = Math.round((totalBudget * budgetSpentPercent) / 100);
  const remainingBudget = Math.max(0, totalBudget - spentBudget);

  const expectedCoa = useCase.config.coaValue1 ? `${useCase.config.coaValue1}%` : '2.0%';
  const coaOperator = useCase.config.coaOperator || 'Less than';
  const actualCoaPercent = 1.85;
  const coaVariance = 0.15;

  const totalAudience = useCase.config.audienceCount || 50000;
  const reachPercent = Math.min(100, Math.round(goalPercent * 1.05));
  const reachedAudience = Math.round((totalAudience * reachPercent) / 100);
  const remainingAudience = Math.max(0, totalAudience - reachedAudience);

  // ── Uniform Theme Palette Across Graphs ──────────────────────────
  // User requested: "change sent colour into - dark blue"
  const THEME_COLORS = {
    targeted: '#78716C', // Slate / Warm stone
    sent: '#1E40AF',     // Dark blue (as explicitly requested)
    converted: '#FF5C35',// Theme primary orange
    failed: '#DC2626',   // Warning crimson red
    budget: '#C2410C',   // Deep terracotta line for budget
    grid: '#EAE5DC',     // Subtle warm grid
    axisText: '#857E73', // Muted text
  };

  // ── Mock Data for Graph 1: Conversion Goal Performance ────────────
  // Image 4: Hours removed, only Days, Weeks, Months. Global campaign goal performance.
  const conversionTelemetryData = useMemo(() => {
    if (goalGranularity === 'Weeks') {
      return [
        {
          label: 'Week 1',
          targetedAudience: 28000,
          sent: 27100,
          converted: 1820,
          failed: 900,
          revenue: 546000,
        },
        {
          label: 'Week 2',
          targetedAudience: 34000,
          sent: 32900,
          converted: 2280,
          failed: 1100,
          revenue: 684000,
        },
        {
          label: 'Week 3',
          targetedAudience: 22000,
          sent: 21400,
          converted: 1540,
          failed: 600,
          revenue: 462000,
        },
        {
          label: 'Week 4',
          targetedAudience: 16000,
          sent: 15600,
          converted: 1160,
          failed: 400,
          revenue: 348000,
        },
      ];
    }
    if (goalGranularity === 'Months') {
      return [
        {
          label: 'Aug 2026',
          targetedAudience: 45000,
          sent: 43800,
          converted: 3100,
          failed: 1200,
          revenue: 930000,
        },
        {
          label: 'Sep 2026',
          targetedAudience: 100000,
          sent: 97000,
          converted: 6800,
          failed: 3000,
          revenue: 2040000,
        },
      ];
    }
    // Default: Days
    return [
      {
        label: '09 Sep',
        targetedAudience: 1400,
        sent: 1350,
        converted: 98,
        failed: 50,
        revenue: 29400,
      },
      {
        label: '10 Sep',
        targetedAudience: 3800,
        sent: 3700,
        converted: 265,
        failed: 100,
        revenue: 79500,
      },
      {
        label: '11 Sep',
        targetedAudience: 8200,
        sent: 7950,
        converted: 580,
        failed: 250,
        revenue: 174000,
      },
      {
        label: '12 Sep',
        targetedAudience: 12500,
        sent: 12100,
        converted: 860,
        failed: 400,
        revenue: 258000,
      },
      {
        label: '13 Sep',
        targetedAudience: 54000,
        sent: 52100,
        converted: 3420,
        failed: 1900,
        revenue: 1026000,
      },
      {
        label: '14 Sep',
        targetedAudience: 20100,
        sent: 19800,
        converted: 1577,
        failed: 300,
        revenue: 473100,
      },
    ];
  }, [goalGranularity]);

  // ── Mock Data for Graph 2: Channel-Wise Targeted vs AIP & Budget Spent
  const channelPerformanceData = useMemo(() => {
    const activeChannels =
      selectedChannels.length > 0 ? selectedChannels : availableChannels;

    const factor =
      channelGranularity === 'Days'
        ? 0.2319
        : channelGranularity === 'Weeks'
        ? 0.3353
        : 1.0;

    return activeChannels.map((channel) => {
      let targetAudienceShare = Math.round(20000 * factor);
      let aipAchievedShare = Math.round(3200 * factor);
      let spentRupees = Math.round(1120000 * factor);
      let budgetAllocated = Math.round(20000000 * factor);
      let coaRate = '1.68%';

      if (channel === 'WhatsApp') {
        targetAudienceShare = Math.round(25000 * factor);
        aipAchievedShare = Math.round(4120 * factor);
        spentRupees = Math.round(1120000 * factor);
        budgetAllocated = Math.round(20000000 * factor);
        coaRate = '1.68%';
      } else if (channel === 'RCS') {
        targetAudienceShare = Math.round(15000 * factor);
        aipAchievedShare = Math.round(1840 * factor);
        spentRupees = Math.round(610000 * factor);
        budgetAllocated = Math.round(10000000 * factor);
        coaRate = '1.94%';
      } else if (channel === 'SMS') {
        targetAudienceShare = Math.round(10000 * factor);
        aipAchievedShare = Math.round(840 * factor);
        spentRupees = Math.round(430000 * factor);
        budgetAllocated = Math.round(10000000 * factor);
        coaRate = '2.15%';
      }

      return {
        channel,
        targetedAudience: targetAudienceShare,
        aipAchieved: aipAchievedShare,
        budgetSpent: spentRupees,
        budgetAllocated,
        coaRate,
      };
    });
  }, [availableChannels, selectedChannels, channelGranularity]);

  // ── Mock Data for Graph 3: Targeted Product AIP vs Others AIP ───────
  const targetedProductCode = 'BFL_SOL_S1';

  const productPerformanceData = useMemo(() => {
    const factor =
      productGranularity === 'Days'
        ? 0.2319
        : productGranularity === 'Weeks'
        ? 0.3353
        : 1.0;

    const rawProducts = [
      {
        code: 'BFL_SOL_S1',
        name: 'BFL Salaried Open Loan (S1)',
        isTargeted: true,
        aipCount: Math.round(4624 * factor),
        sharePercent: 68.0,
        convRate: '9.2%',
        sanctionedRevenue: Math.round(462400000 * factor),
      },
      {
        code: 'BFL_SOL_PL',
        name: 'BFL Personal Loan',
        isTargeted: false,
        aipCount: Math.round(544 * factor),
        sharePercent: 8.0,
        convRate: '6.5%',
        sanctionedRevenue: Math.round(54400000 * factor),
      },
      {
        code: 'BFL_SOL_PLCC',
        name: 'BFL PL Credit Card',
        isTargeted: false,
        aipCount: Math.round(381 * factor),
        sharePercent: 5.6,
        convRate: '5.8%',
        sanctionedRevenue: Math.round(38100000 * factor),
      },
      {
        code: 'BFL_SOL_PLTB',
        name: 'BFL PL Top-Up / Balance Transfer',
        isTargeted: false,
        aipCount: Math.round(299 * factor),
        sharePercent: 4.4,
        convRate: '5.1%',
        sanctionedRevenue: Math.round(29900000 * factor),
      },
      {
        code: 'BFL_SOL_PLCS',
        name: 'BFL PL Customer Specific',
        isTargeted: false,
        aipCount: Math.round(245 * factor),
        sharePercent: 3.6,
        convRate: '4.9%',
        sanctionedRevenue: Math.round(24500000 * factor),
      },
      {
        code: 'BFL_BOL',
        name: 'BFL Business Open Loan',
        isTargeted: false,
        aipCount: Math.round(218 * factor),
        sharePercent: 3.2,
        convRate: '4.2%',
        sanctionedRevenue: Math.round(28340000 * factor),
      },
      {
        code: 'BFL_PROL',
        name: 'BFL Professional Loan',
        isTargeted: false,
        aipCount: Math.round(177 * factor),
        sharePercent: 2.6,
        convRate: '3.8%',
        sanctionedRevenue: Math.round(23010000 * factor),
      },
      {
        code: 'OA_SOL',
        name: 'Open Architecture SOL',
        isTargeted: false,
        aipCount: Math.round(136 * factor),
        sharePercent: 2.0,
        convRate: '3.5%',
        sanctionedRevenue: Math.round(13600000 * factor),
      },
      {
        code: 'OA_BOL',
        name: 'Open Architecture BOL',
        isTargeted: false,
        aipCount: Math.round(95 * factor),
        sharePercent: 1.4,
        convRate: '3.1%',
        sanctionedRevenue: Math.round(10450000 * factor),
      },
      {
        code: 'T5_SOL',
        name: 'Tier-5 Salaried Open Loan',
        isTargeted: false,
        aipCount: Math.round(54 * factor),
        sharePercent: 0.8,
        convRate: '2.4%',
        sanctionedRevenue: Math.round(5400000 * factor),
      },
      {
        code: 'T5_BOL',
        name: 'Tier-5 Business Open Loan',
        isTargeted: false,
        aipCount: Math.round(27 * factor),
        sharePercent: 0.4,
        convRate: '1.8%',
        sanctionedRevenue: Math.round(2970000 * factor),
      },
    ];

    const activeList =
      selectedProducts.length > 0
        ? rawProducts.filter((p) => selectedProducts.includes(p.code))
        : rawProducts;

    return activeList;
  }, [selectedProducts, productGranularity]);

  const productSummary = useMemo(() => {
    const targeted = productPerformanceData.find((p) => p.isTargeted);
    const targetedAip = targeted ? targeted.aipCount : 0;
    const targetedSanctioned = targeted ? targeted.sanctionedRevenue : 0;

    const others = productPerformanceData.filter((p) => !p.isTargeted);
    const othersAip = others.reduce((sum, p) => sum + p.aipCount, 0);
    const othersSanctioned = others.reduce((sum, p) => sum + p.sanctionedRevenue, 0);

    const totalAip = targetedAip + othersAip;
    const totalSanctioned = targetedSanctioned + othersSanctioned;

    const targetedPercent = totalAip > 0 ? ((targetedAip / totalAip) * 100).toFixed(1) : '68.0';
    const othersPercent = totalAip > 0 ? ((othersAip / totalAip) * 100).toFixed(1) : '32.0';

    return {
      targetedAip,
      targetedPercent,
      targetedSanctioned,
      othersAip,
      othersPercent,
      othersSanctioned,
      totalAip,
      totalSanctioned,
      otherCount: others.length,
    };
  }, [productPerformanceData]);

  // Product trend over time comparing Targeted (BFL_SOL_S1) vs All Others
  const productTrendData = useMemo(() => {
    if (productGranularity === 'Weeks') {
      return [
        { label: 'Week 1', targetedAip: 1238, othersAip: 582, totalAip: 1820 },
        { label: 'Week 2', targetedAip: 1550, othersAip: 730, totalAip: 2280 },
        { label: 'Week 3', targetedAip: 1047, othersAip: 493, totalAip: 1540 },
        { label: 'Week 4', targetedAip: 789, othersAip: 371, totalAip: 1160 },
      ];
    }
    if (productGranularity === 'Months') {
      return [
        { label: 'Aug 2026', targetedAip: 2108, othersAip: 992, totalAip: 3100 },
        { label: 'Sep 2026', targetedAip: 4624, othersAip: 2176, totalAip: 6800 },
      ];
    }
    return [
      { label: '09 Sep', targetedAip: 67, othersAip: 31, totalAip: 98 },
      { label: '10 Sep', targetedAip: 180, othersAip: 85, totalAip: 265 },
      { label: '11 Sep', targetedAip: 394, othersAip: 186, totalAip: 580 },
      { label: '12 Sep', targetedAip: 585, othersAip: 275, totalAip: 860 },
      { label: '13 Sep', targetedAip: 2325, othersAip: 1095, totalAip: 3420 },
      { label: '14 Sep', targetedAip: 1073, othersAip: 504, totalAip: 1577 },
    ];
  }, [productGranularity]);

  // ── Export Chart Helpers ──────────────────────────────────────────
  const exportGoalTelemetryCsv = () => {
    const headers = [
      'Period',
      'Targeted_Audience',
      'Sent',
      'Converted_AIP',
      'Failed_Bounced',
      'Revenue_INR',
    ];
    const rows = conversionTelemetryData.map((d) => [
      d.label,
      d.targetedAudience,
      d.sent,
      d.converted,
      d.failed,
      d.revenue,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${useCase.useCaseName}-goal-telemetry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportChannelPerformanceCsv = () => {
    const headers = [
      'Channel',
      'Targeted_Audience',
      'AIP_Achieved',
      'Budget_Spent_INR',
      'Budget_Allocated_INR',
      'COA_Rate',
    ];
    const rows = channelPerformanceData.map((c) => [
      c.channel,
      c.targetedAudience,
      c.aipAchieved,
      c.budgetSpent,
      c.budgetAllocated,
      c.coaRate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${useCase.useCaseName}-channel-performance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProductAipCsv = () => {
    const headers = [
      'Product_Code',
      'Classification',
      'AIP_Conversions',
      'Conversion_Rate',
      'Sanctioned_Revenue_INR',
    ];
    const rows = productPerformanceData.map((p) => [
      p.code,
      p.isTargeted ? 'Targeted' : 'Other',
      p.aipCount,
      p.convRate,
      p.sanctionedRevenue,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${useCase.useCaseName}-product-aip-attribution.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isDraft = useCase.lifecycleStatus === 'Draft';
  const showLiveTelemetry = !isDraft || previewSimulatedDraft;

  return (
    <div className="w-full max-w-[1240px] mx-auto py-2 space-y-6 animate-in fade-in duration-200 font-body">
      {/* ── Header: Directly on raw canvas background (box ke bahar) ───── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-1">
        <div>
          {/* Eyebrow with bar chart icon */}
          <div className="flex items-center gap-2 text-[#706B62] text-[13px] font-medium mb-1">
            <BarChart2 className="w-4 h-4 text-[#FF5C35]" />
            <span className="font-semibold text-[#1A1816]">Insights</span>
          </div>

          {/* Use Case Title */}
          <h1 className="font-serif-title text-[28px] sm:text-[34px] text-[#1A1816] leading-tight font-bold">
            {useCase.useCaseName}
          </h1>

          {/* Metadata line */}
          <div className="text-[13px] text-[#706B62] mt-1.5 font-data flex flex-wrap items-center gap-2">
            <span>Created: {useCase.createdDateFormatted}</span>
            <span>·</span>
            <span>Goal: {useCase.goal || 'AIP'}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              Progress:
              <span
                className={`font-bold px-2 py-0.5 rounded-[4px] text-[12px] ${
                  currentProgress === 'Green'
                    ? 'bg-emerald-50 text-[#16A34A]'
                    : currentProgress === 'Amber'
                    ? 'bg-amber-50 text-[#D97706]'
                    : 'bg-red-50 text-[#DC2626]'
                }`}
              >
                {currentProgress}
              </span>
            </span>
          </div>
        </div>

        {/* Image 2: Status : Active as pure text directly on background (no button, no box) */}
        <div className="flex items-center gap-1.5 self-start pt-1">
          <span className="text-[13.5px] text-[#706B62] font-medium">Status :</span>
          <span
            className={`text-[13.5px] font-bold ${
              useCase.lifecycleStatus === 'Active'
                ? 'text-[#FF5C35]'
                : useCase.lifecycleStatus === 'Scheduled'
                ? 'text-blue-600'
                : useCase.lifecycleStatus === 'Completed'
                ? 'text-[#16A34A]'
                : useCase.lifecycleStatus === 'Paused'
                ? 'text-[#D97706]'
                : useCase.lifecycleStatus === 'Stopped'
                ? 'text-[#DC2626]'
                : 'text-[#6B665E]'
            }`}
          >
            {useCase.lifecycleStatus}
          </span>
        </div>
      </div>

      {/* ── Main White Background Container: From Cards to Last Graph ──── */}
      <div className="bg-white rounded-[12px] border border-[#E2DDD5] p-6 sm:p-8 shadow-xs space-y-7">
        {/* ── Notice Banner: ONLY Shown for Draft ─────────────────────── */}
        {isDraft && !previewSimulatedDraft && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 bg-[#FFF9F6] rounded-[10px] border border-[#FFE0D6] text-[13px] text-[#555047] leading-relaxed shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF5C35] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#1A1816] block mb-0.5">
                  Draft Use Case Analytical Telemetry
                </span>
                <span>
                  This use case is currently in Draft status. Live telemetry, real-time conversion
                  graphs, and channel performance metrics activate automatically post-launch. You
                  can continue editing or test preview simulation.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onEditUseCase && (
                <button
                  type="button"
                  onClick={() => onEditUseCase(useCase)}
                  className="px-3.5 py-1.5 text-[12.5px] font-semibold text-[#1A1816] bg-white border border-[#D9D4CB] hover:bg-[#F9F7F3] rounded-[7px] shadow-2xs cursor-pointer"
                >
                  Edit Draft
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewSimulatedDraft(true)}
                className="px-3.5 py-1.5 text-[12.5px] font-semibold text-white bg-[#FF5C35] hover:bg-[#E04823] rounded-[7px] shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Telemetry</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 4 Metric Cards with Number vs Percentage Filter ──────────── */}
        {showLiveTelemetry && (
          <div className="space-y-3.5">
            {/* Header row: Headline on left; Number vs % & Achieved vs Remaining on right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-[15px] font-bold text-[#1A1816]">Campaign Key Metrics</h2>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Number vs Percentage Filter (User request 1) */}
                <div className="inline-flex bg-[#EAE5DC] p-0.5 rounded-[7px] border border-[#D5CEC0]">
                  <button
                    type="button"
                    onClick={() => setValueUnit('number')}
                    className={`px-2.5 py-1 text-[11.5px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                      valueUnit === 'number'
                        ? 'bg-white text-[#1A1816] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    Number
                  </button>
                  <button
                    type="button"
                    onClick={() => setValueUnit('percentage')}
                    className={`px-2.5 py-1 text-[11.5px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                      valueUnit === 'percentage'
                        ? 'bg-white text-[#1A1816] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    % Percentage
                  </button>
                </div>

                {/* Achieved vs Remaining Mode Toggle */}
                <div className="inline-flex bg-[#EAE5DC] p-0.5 rounded-[7px] border border-[#D5CEC0]">
                  <button
                    type="button"
                    onClick={() => setMetricMode('achieved')}
                    className={`px-3 py-1 text-[11.5px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                      metricMode === 'achieved'
                        ? 'bg-white text-[#1A1816] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    Achieved
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricMode('remaining')}
                    className={`px-3 py-1 text-[11.5px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                      metricMode === 'remaining'
                        ? 'bg-white text-[#1A1816] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    Remaining
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Cards Grid - Styled consistently inside white container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ── Card 1: Goal Achievement ──────────────────────────── */}
              <div
                onClick={() =>
                  setMetricMode(metricMode === 'achieved' ? 'remaining' : 'achieved')
                }
                className="p-4.5 rounded-[10px] bg-[#FAF8F5] border border-[#E8E3DA] hover:border-[#FF5C35]/50 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[#706B62] text-[12.5px] font-medium mb-1.5">
                    <span>Goal Achievement ({useCase.goal || 'AIP'})</span>
                    <TrendingUp className="w-4 h-4 text-[#FF5C35] group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Number or Percentage display based on filter */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[25px] font-bold font-data text-[#1A1816] leading-none">
                      {valueUnit === 'percentage'
                        ? metricMode === 'achieved'
                          ? `${goalPercent}%`
                          : `${100 - goalPercent}%`
                        : metricMode === 'achieved'
                        ? achievedGoal.toLocaleString('en-IN')
                        : remainingGoal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[12px] font-semibold text-[#857E73] font-data">
                      {metricMode === 'achieved' ? 'Achieved' : 'Remaining'}
                    </span>
                  </div>

                  {/* Progress bar using Image 4 colors */}
                  <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden flex bg-[#E5DFD5]">
                    <div
                      className="bg-[#FF5C35] h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${goalPercent}%` }}
                    />
                    <div className="bg-[#E5DFD5] h-full flex-1" />
                  </div>

                  {/* Subtext matching Image 4 */}
                  <div className="flex items-center justify-between text-[11px] text-[#706B62] mt-1.5 font-medium">
                    <span>{useCase.goal || 'AIP'} : Achieved vs Remaining</span>
                    <span className="font-data text-[#555047]">{goalPercent}%</span>
                  </div>
                </div>

                {/* Second line: Targeted Goal */}
                <div className="mt-3.5 pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-[12px]">
                  <span className="text-[#706B62]">Targeted Goal:</span>
                  <span className="font-bold text-[#1A1816] font-data">
                    {targetGoal.toLocaleString('en-IN')} {useCase.goal || 'AIP'}
                  </span>
                </div>
              </div>

              {/* ── Card 2: Budget Utilization ───────────────────────── */}
              <div
                onClick={() =>
                  setMetricMode(metricMode === 'achieved' ? 'remaining' : 'achieved')
                }
                className="p-4.5 rounded-[10px] bg-[#FAF8F5] border border-[#E8E3DA] hover:border-[#FF5C35]/50 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[#706B62] text-[12.5px] font-medium mb-1.5">
                    <span>Budget Utilization</span>
                    <IndianRupee className="w-4 h-4 text-[#FF5C35] group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Rupee value or Percentage display based on filter */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[25px] font-bold font-data text-[#1A1816] leading-none">
                      {valueUnit === 'percentage'
                        ? metricMode === 'achieved'
                          ? `${budgetSpentPercent}%`
                          : `${100 - budgetSpentPercent}%`
                        : metricMode === 'achieved'
                        ? formatIndianCurrency(spentBudget)
                        : formatIndianCurrency(remainingBudget)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#857E73] font-data">
                      {metricMode === 'achieved' ? 'Spent' : 'Remaining'}
                    </span>
                  </div>

                  {/* Progress bar using Image 4 colors */}
                  <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden flex bg-[#E5DFD5]">
                    <div
                      className="bg-[#FF5C35] h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${budgetSpentPercent}%` }}
                    />
                    <div className="bg-[#E5DFD5] h-full flex-1" />
                  </div>

                  {/* Subtext matching Image 4 */}
                  <div className="flex items-center justify-between text-[11px] text-[#706B62] mt-1.5 font-medium">
                    <span>Budget : Spent vs Remaining</span>
                    <span className="font-data text-[#555047]">{budgetSpentPercent}%</span>
                  </div>
                </div>

                {/* Second line: Targeted Total Budget */}
                <div className="mt-3.5 pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-[12px]">
                  <span className="text-[#706B62]">Total Budget:</span>
                  <span className="font-bold text-[#1A1816] font-data">
                    {formatIndianCurrency(totalBudget)}
                  </span>
                </div>
              </div>

              {/* ── Card 3: COA Performance ──────────────────────────── */}
              <div
                onClick={() =>
                  setMetricMode(metricMode === 'achieved' ? 'remaining' : 'achieved')
                }
                className="p-4.5 rounded-[10px] bg-[#FAF8F5] border border-[#E8E3DA] hover:border-[#FF5C35]/50 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[#706B62] text-[12.5px] font-medium mb-1.5">
                    <span>COA Performance</span>
                    <Percent className="w-4 h-4 text-[#FF5C35] group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Percentage value */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[25px] font-bold font-data text-[#1A1816] leading-none">
                      {metricMode === 'achieved' ? `${actualCoaPercent}%` : `+${coaVariance}%`}
                    </span>
                    <span className="text-[12px] font-semibold text-[#857E73] font-data">
                      {metricMode === 'achieved' ? 'Actual' : 'Buffer'}
                    </span>
                  </div>

                  {/* Progress bar using Image 4 colors */}
                  <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden flex bg-[#E5DFD5]">
                    <div className="bg-[#FF5C35] h-full w-[85%] rounded-l-full" />
                    <div className="bg-[#E5DFD5] h-full flex-1" />
                  </div>

                  {/* Subtext */}
                  <div className="flex items-center justify-between text-[11px] text-[#706B62] mt-1.5 font-medium">
                    <span>Current: {actualCoaPercent}% vs Max: {coaOperator} {expectedCoa}</span>
                  </div>
                </div>

                {/* Second line: Expected COA */}
                <div className="mt-3.5 pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-[12px]">
                  <span className="text-[#706B62]">Expected COA:</span>
                  <span className="font-bold text-[#1A1816] font-data">
                    {coaOperator} {expectedCoa}
                  </span>
                </div>
              </div>

              {/* ── Card 4: Audience Reach ───────────────────────────── */}
              <div
                onClick={() =>
                  setMetricMode(metricMode === 'achieved' ? 'remaining' : 'achieved')
                }
                className="p-4.5 rounded-[10px] bg-[#FAF8F5] border border-[#E8E3DA] hover:border-[#FF5C35]/50 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[#706B62] text-[12.5px] font-medium mb-1.5">
                    <span>Audience Reach</span>
                    <Users className="w-4 h-4 text-[#FF5C35] group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Audience Reach count or percentage based on filter */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[25px] font-bold font-data text-[#1A1816] leading-none">
                      {valueUnit === 'percentage'
                        ? metricMode === 'achieved'
                          ? `${reachPercent}%`
                          : `${(100 - reachPercent).toFixed(1)}%`
                        : metricMode === 'achieved'
                        ? reachedAudience.toLocaleString('en-IN')
                        : remainingAudience.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[12px] font-semibold text-[#857E73] font-data">
                      {metricMode === 'achieved' ? 'Reached' : 'To Contact'}
                    </span>
                  </div>

                  {/* Progress bar using Image 4 colors */}
                  <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden flex bg-[#E5DFD5]">
                    <div
                      className="bg-[#FF5C35] h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${reachPercent}%` }}
                    />
                    <div className="bg-[#E5DFD5] h-full flex-1" />
                  </div>

                  {/* Subtext */}
                  <div className="flex items-center justify-between text-[11px] text-[#706B62] mt-1.5 font-medium">
                    <span>Reach : Active on {availableChannels.length} channels</span>
                    <span className="font-data text-[#555047]">{reachPercent}%</span>
                  </div>
                </div>

                {/* Second line: Total Audience */}
                <div className="mt-3.5 pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-[12px]">
                  <span className="text-[#706B62]">Total Audience:</span>
                  <span className="font-bold text-[#1A1816] font-data">
                    {totalAudience.toLocaleString('en-IN')} Users
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Recommended Action Section ──────────────────────────────── */}
        {showLiveTelemetry && (
          <div
            className={`p-5 rounded-[10px] border transition-all shadow-2xs ${
              currentProgress === 'Red'
                ? 'bg-[#FEF2F2] border-[#FECACA]'
                : currentProgress === 'Amber'
                ? 'bg-[#FFFBEB] border-[#FDE68A]'
                : 'bg-[#F0FDF4] border-[#BBF7D0]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    currentProgress === 'Red'
                      ? 'bg-[#FEE2E2] text-[#DC2626]'
                      : currentProgress === 'Amber'
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'bg-[#DCFCE7] text-[#16A34A]'
                  }`}
                >
                  {currentProgress === 'Red' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : currentProgress === 'Amber' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#1A1816]">
                      Recommended Action:
                    </span>
                    <span
                      className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                        currentProgress === 'Red'
                          ? 'bg-[#DC2626] text-white'
                          : currentProgress === 'Amber'
                          ? 'bg-[#D97706] text-white'
                          : 'bg-[#16A34A] text-white'
                      }`}
                    >
                      {currentProgress === 'Red'
                        ? 'Underperforming · Stop / Pause Advised'
                        : currentProgress === 'Amber'
                        ? 'Velocity Alert · Schedule Adjustment'
                        : 'On Track · Scale Budget Ready'}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#4A453E] mt-1 leading-relaxed max-w-3xl">
                    {currentProgress === 'Red' ? (
                      <>
                        Conversion run rate is <strong>34% below expected benchmark</strong> and
                        effective COA has escalated past the safety threshold. High drop-off
                        detected on SMS channel (delivery failure rate 4.8%). We strongly recommend
                        <strong> stopping or pausing this use case</strong> to prevent budget drain,
                        or shifting remaining {formatIndianCurrency(remainingBudget)} to WhatsApp.
                      </>
                    ) : currentProgress === 'Amber' ? (
                      <>
                        Audience reach is healthy, but mid-funnel AIP conversion pace is trailing
                        weekly run-rate milestones by <strong>8%</strong>. Message dispatch peaks
                        between 12:00 PM – 2:00 PM are suffering delivery queue latency. Recommend
                        re-scheduling dispatches to evening hours (6:00 PM – 8:00 PM IST).
                      </>
                    ) : (
                      <>
                        Campaign is outperforming AIP target run-rate by <strong>+18%</strong> with an
                        exceptional effective COA of <strong>1.72%</strong> (well below the 2.0%
                        ceiling). WhatsApp channel is yielding the highest conversion velocity. You
                        can safely maintain active execution or scale the daily budget cap by 15%.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Direct contextual action buttons */}
              <div className="flex items-center gap-2 shrink-0 md:self-center">
                {currentProgress === 'Red' ? (
                  <>
                    {onUpdateLifecycleStatus && (
                      <button
                        type="button"
                        onClick={() => onUpdateLifecycleStatus(useCase.id, 'Stopped')}
                        className="px-3.5 py-2 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[12.5px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>Stop Use Case</span>
                      </button>
                    )}
                    {onUpdateLifecycleStatus && (
                      <button
                        type="button"
                        onClick={() => onUpdateLifecycleStatus(useCase.id, 'Paused')}
                        className="px-3.5 py-2 rounded-[8px] bg-white border border-[#D5D0C7] hover:bg-[#F4F1EB] text-[#2D2A26] text-[12.5px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <PauseCircle className="w-4 h-4 text-[#706B62]" />
                        <span>Pause Delivery</span>
                      </button>
                    )}
                  </>
                ) : currentProgress === 'Amber' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setGoalGranularity('Days')}
                      className="px-3.5 py-2 rounded-[8px] bg-[#D97706] hover:bg-[#B45309] text-white text-[12.5px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Optimize Dispatch</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-[8px] bg-[#16A34A] hover:bg-[#15803D] text-white text-[12.5px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Scale Budget (+15%)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Graph 1: Conversion Goal Performance Graph ──────────────── */}
        {showLiveTelemetry && (
          <div className="bg-[#FAF8F5] rounded-[10px] border border-[#E8E3DA] p-5 sm:p-6 space-y-4 shadow-2xs">
            {/* Header: Title on Left, Controls & Export chart at right corner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DC] pb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#1A1816]">
                  Conversion Goal Performance ({useCase.goal || 'AIP'})
                </h3>
              </div>

              {/* Controls Bar: Granularity filter (Days, Weeks, Months), Views, Export chart at right corner */}
              <div className="flex items-center gap-2.5 ml-auto flex-wrap sm:flex-nowrap">
                {/* Days, Weeks, Months segmented pill control */}
                <div className="flex items-center gap-1 bg-[#EAE5DC] p-0.5 rounded-[7px]">
                  {(['Days', 'Weeks', 'Months'] as Granularity[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoalGranularity(g)}
                      className={`px-3 py-1 text-[11.5px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                        goalGranularity === g
                          ? 'bg-white text-[#1A1816] shadow-2xs'
                          : 'text-[#706B62] hover:text-[#1A1816]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* View switcher: Line vs Bar vs Table */}
                <div className="flex items-center gap-1 bg-[#EAE5DC] p-0.5 rounded-[7px]">
                  <button
                    type="button"
                    onClick={() => {
                      setGoalViewType('chart');
                      setGoalChartSubtype('line');
                    }}
                    title="Line Chart View"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      goalViewType === 'chart' && goalChartSubtype === 'line'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <LineChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoalViewType('chart');
                      setGoalChartSubtype('bar');
                    }}
                    title="Bar Chart View"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      goalViewType === 'chart' && goalChartSubtype === 'bar'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <BarChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalViewType('table')}
                    title="Table View"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      goalViewType === 'table'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Export chart at right corner */}
                <button
                  type="button"
                  onClick={exportGoalTelemetryCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#1A1816] bg-white border border-[#D5D0C7] hover:bg-[#F4F1EB] rounded-[7px] shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF5C35]" />
                  <span>Export chart</span>
                </button>
              </div>
            </div>

            {/* Visualizer: Chart vs Table */}
            {goalViewType === 'chart' ? (
              <div className="w-full">
                <div className="h-[280px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {goalChartSubtype === 'line' ? (
                      <LineChart
                        data={conversionTelemetryData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} vertical={false} />
                        <XAxis
                          dataKey="label"
                          stroke={THEME_COLORS.axisText}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                        />
                        <YAxis
                          stroke={THEME_COLORS.axisText}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                          tickFormatter={(val) =>
                            val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #D5D0C7',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px',
                          }}
                          formatter={(val: any, name: any) => [
                            Number(val).toLocaleString('en-IN'),
                            name,
                          ]}
                        />
                        {/* Targeted Audience (Slate), Sent (Dark Blue as requested), Converted (Orange), Failed (Red) */}
                        <Line
                          type="monotone"
                          dataKey="targetedAudience"
                          name="Targeted Audience"
                          stroke={THEME_COLORS.targeted}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: THEME_COLORS.targeted }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sent"
                          name="Sent"
                          stroke={THEME_COLORS.sent}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: THEME_COLORS.sent }}
                        />
                        <Line
                          type="monotone"
                          dataKey="converted"
                          name="Converted Users (AIP Goal)"
                          stroke={THEME_COLORS.converted}
                          strokeWidth={3}
                          dot={{ r: 5, fill: THEME_COLORS.converted }}
                        />
                        <Line
                          type="monotone"
                          dataKey="failed"
                          name="Failed / Bounced"
                          stroke={THEME_COLORS.failed}
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: THEME_COLORS.failed }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart
                        data={conversionTelemetryData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} vertical={false} />
                        <XAxis
                          dataKey="label"
                          stroke={THEME_COLORS.axisText}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                        />
                        <YAxis
                          stroke={THEME_COLORS.axisText}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                          tickFormatter={(val) =>
                            val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #D5D0C7',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px',
                          }}
                          formatter={(val: any, name: any) => [
                            Number(val).toLocaleString('en-IN'),
                            name,
                          ]}
                        />
                        <Bar dataKey="targetedAudience" name="Targeted Audience" fill={THEME_COLORS.targeted} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="sent" name="Sent" fill={THEME_COLORS.sent} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="converted" name="Converted Users (AIP Goal)" fill={THEME_COLORS.converted} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="failed" name="Failed / Bounced" fill={THEME_COLORS.failed} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Legend matching Image 7 & 8 with Sent in Dark Blue */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-[12px] text-[#4A453E] border-t border-[#EAE5DC] mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: THEME_COLORS.targeted }} />
                    <span className="font-medium text-[#555047]">Targeted Audience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: THEME_COLORS.sent }} />
                    <span className="font-semibold text-[#1E40AF]">Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: THEME_COLORS.converted }} />
                    <span className="font-bold text-[#FF5C35]">Converted Users (AIP Goal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: THEME_COLORS.failed }} />
                    <span className="font-medium text-[#555047]">Failed / Bounced</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Table View for Graph 1 */
              <div className="overflow-x-auto border border-[#E2DDD5] rounded-[8px] bg-white">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#DDD6C9] border-b border-[#D5CEC0] font-bold text-[#1A1816]">
                      <th className="py-2.5 px-3.5">Time Period</th>
                      <th className="py-2.5 px-3.5 text-right">Targeted Audience</th>
                      <th className="py-2.5 px-3.5 text-right text-[#1E40AF]">Sent</th>
                      <th className="py-2.5 px-3.5 text-right text-[#FF5C35]">Converted Users (AIP Goal)</th>
                      <th className="py-2.5 px-3.5 text-right text-[#DC2626]">Failed / Bounced</th>
                      <th className="py-2.5 px-3.5 text-right">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC] font-data">
                    {conversionTelemetryData.map((row) => {
                      const rate = ((row.converted / (row.sent || 1)) * 100).toFixed(1);
                      return (
                        <tr key={row.label} className="hover:bg-[#FAF8F5]">
                          <td className="py-2.5 px-3.5 font-medium text-[#1A1816]">{row.label}</td>
                          <td className="py-2.5 px-3.5 text-right text-[#706B62]">
                            {row.targetedAudience.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-semibold text-[#1E40AF]">
                            {row.sent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-bold text-[#FF5C35]">
                            {row.converted.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right text-[#DC2626]">
                            {row.failed.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-bold text-[#1A1816]">
                            {rate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Graph 2: Channel-Wise Targeted vs AIP & Budget Spent ──────── */}
        {showLiveTelemetry && (
          <div className="bg-[#FAF8F5] rounded-[10px] border border-[#E8E3DA] p-5 sm:p-6 space-y-4 shadow-2xs">
            {/* Header: Title & Channel Attribution subtitle on Left, Controls & Export button at right corner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DC] pb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#1A1816]">
                  Channel-Wise Targeted vs AIP Achieved & Budget Spent
                </h3>
                <p className="text-[12px] text-[#706B62] mt-0.5">Channel Attribution</p>
              </div>

              {/* Controls bar: Channel dropdown (Image 8 theme), Granularity pill, Views, Export at right corner */}
              <div className="flex items-center gap-2.5 ml-auto flex-wrap sm:flex-nowrap">
                {/* Image 7 & 8: Channel Dropdown matching Image 8 */}
                <CompactMultiSelect
                  items={availableChannels}
                  selectedItems={selectedChannels}
                  onChange={setSelectedChannels}
                  allLabel="All Channels"
                  placeholder="Select Channel"
                  itemUnitLabel="Channels"
                  widthClass="w-[230px]"
                />

                {/* Days, Weeks, Months segmented pill control */}
                <div className="flex items-center gap-1 bg-[#EAE5DC] p-0.5 rounded-[7px]">
                  {(['Days', 'Weeks', 'Months'] as Granularity[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setChannelGranularity(g)}
                      className={`px-3 py-1 text-[11.5px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                        channelGranularity === g
                          ? 'bg-white text-[#1A1816] shadow-2xs'
                          : 'text-[#706B62] hover:text-[#1A1816]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* View switcher */}
                <div className="flex items-center gap-1 bg-[#EAE5DC] p-0.5 rounded-[7px]">
                  <button
                    type="button"
                    onClick={() => {
                      setChannelViewType('chart');
                      setChannelChartSubtype('bar');
                    }}
                    title="Grouped Bar View (Recommended)"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      channelViewType === 'chart' && channelChartSubtype === 'bar'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <BarChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChannelViewType('chart');
                      setChannelChartSubtype('line');
                    }}
                    title="Trend Line View"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      channelViewType === 'chart' && channelChartSubtype === 'line'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <LineChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelViewType('table')}
                    title="Table View"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      channelViewType === 'table'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Export chart at right corner */}
                <button
                  type="button"
                  onClick={exportChannelPerformanceCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#1A1816] bg-white border border-[#D5D0C7] hover:bg-[#F4F1EB] rounded-[7px] shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF5C35]" />
                  <span>Export chart</span>
                </button>
              </div>
            </div>

            {/* Quick Channel Stat Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {channelPerformanceData.map((c) => (
                <div
                  key={c.channel}
                  className="bg-white p-3.5 rounded-[8px] border border-[#E2DDD5] flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#1A1816]">{c.channel}</span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      COA: {c.coaRate}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] text-[#706B62] space-y-0.5 font-data">
                    <div className="flex justify-between">
                      <span>AIP Achieved:</span>
                      <strong className="text-[#FF5C35]">{c.aipAchieved.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget Spent:</span>
                      <strong className="text-[#C2410C]">{formatIndianCurrency(c.budgetSpent)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart or Table View */}
            {channelViewType === 'chart' ? (
              <div className="w-full">
                <div className="h-[300px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {channelChartSubtype === 'bar' ? (
                      <ComposedChart
                        data={channelPerformanceData}
                        margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} vertical={false} />
                        <XAxis
                          dataKey="channel"
                          stroke={THEME_COLORS.axisText}
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                        />
                        {/* Left axis: Volume */}
                        <YAxis
                          yAxisId="left"
                          stroke={THEME_COLORS.axisText}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                          tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`}
                        />
                        {/* Right axis: Budget Spent (INR) */}
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke={THEME_COLORS.budget}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: THEME_COLORS.budget }}
                          tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #D5D0C7',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px',
                          }}
                          formatter={(value: any, name: any) => {
                            if (name === 'Budget Spent (INR)') {
                              return [formatIndianCurrency(value), name];
                            }
                            return [Number(value).toLocaleString('en-IN'), name];
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="targetedAudience"
                          name="Targeted Audience"
                          fill={THEME_COLORS.targeted}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="aipAchieved"
                          name="AIP Achieved"
                          fill={THEME_COLORS.converted}
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="budgetSpent"
                          name="Budget Spent (INR)"
                          stroke={THEME_COLORS.budget}
                          strokeWidth={3}
                          dot={{ r: 5, fill: THEME_COLORS.budget }}
                        />
                      </ComposedChart>
                    ) : (
                      <LineChart
                        data={channelPerformanceData}
                        margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} vertical={false} />
                        <XAxis
                          dataKey="channel"
                          stroke={THEME_COLORS.axisText}
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                        />
                        <YAxis
                          stroke={THEME_COLORS.axisText}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#D9D4CB' }}
                          tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #D5D0C7',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="targetedAudience"
                          name="Targeted Audience"
                          stroke={THEME_COLORS.targeted}
                          strokeWidth={2.5}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="aipAchieved"
                          name="AIP Achieved"
                          stroke={THEME_COLORS.converted}
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Legend matching Image 1 */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-[12px] text-[#4A453E] border-t border-[#EAE5DC] mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: THEME_COLORS.targeted }} />
                    <span className="font-medium text-[#555047]">Targeted Audience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: THEME_COLORS.converted }} />
                    <span className="font-bold text-[#FF5C35]">AIP Achieved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: THEME_COLORS.budget }} />
                    <span className="font-medium text-[#555047]">Budget Spent (INR)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Table View for Graph 2 */
              <div className="overflow-x-auto border border-[#E2DDD5] rounded-[8px] bg-white">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#DDD6C9] border-b border-[#D5CEC0] font-bold text-[#1A1816]">
                      <th className="py-2.5 px-3.5">Channel</th>
                      <th className="py-2.5 px-3.5 text-right">Targeted Audience</th>
                      <th className="py-2.5 px-3.5 text-right text-[#FF5C35]">AIP Achieved</th>
                      <th className="py-2.5 px-3.5 text-right">Conversion Rate</th>
                      <th className="py-2.5 px-3.5 text-right text-[#C2410C]">Budget Spent (INR)</th>
                      <th className="py-2.5 px-3.5 text-right">Effective COA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC] font-data">
                    {channelPerformanceData.map((row) => {
                      const convRate = ((row.aipAchieved / (row.targetedAudience || 1)) * 100).toFixed(1);
                      return (
                        <tr key={row.channel} className="hover:bg-[#FAF8F5]">
                          <td className="py-2.5 px-3.5 font-bold text-[#1A1816]">{row.channel}</td>
                          <td className="py-2.5 px-3.5 text-right text-[#706B62]">
                            {row.targetedAudience.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-bold text-[#FF5C35]">
                            {row.aipAchieved.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-semibold text-[#1A1816]">
                            {convRate}%
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-bold text-[#C2410C]">
                            {formatIndianCurrency(row.budgetSpent)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-medium text-[#1A1816]">
                            {row.coaRate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Graph 3: Targeted Product AIP vs Others AIP ──────────────── */}
        {showLiveTelemetry && (
          <div className="bg-[#FAF8F5] rounded-[10px] border border-[#E8E3DA] p-5 sm:p-6 space-y-4 shadow-2xs">
            {/* Header: Title & Subtitle on Left, Controls & Export button at right corner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DC] pb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#1A1816]">
                  Targeted Product AIP vs Others AIP
                </h3>
              </div>

              {/* Controls bar: Product filter dropdown, Granularity pill, Views, Export at right corner */}
              <div className="flex items-center gap-2.5 ml-auto flex-wrap sm:flex-nowrap">
                {/* Product Multi-select Dropdown (Theme matching Image 8) */}
                <CompactMultiSelect
                  items={ALL_PRODUCT_COMBINATIONS}
                  selectedItems={selectedProducts}
                  onChange={setSelectedProducts}
                  allLabel="All Products"
                  placeholder="Select Products"
                  itemUnitLabel="Products"
                  widthClass="w-[260px]"
                />

                {/* Granularity Pill (Days, Weeks, Months) */}
                <div className="flex items-center gap-1 bg-[#EAE5DC] p-0.5 rounded-[7px]">
                  {(['Days', 'Weeks', 'Months'] as Granularity[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setProductGranularity(g)}
                      className={`px-3 py-1 text-[11.5px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                        productGranularity === g
                          ? 'bg-white text-[#1A1816] shadow-2xs'
                          : 'text-[#706B62] hover:text-[#1A1816]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* View Switcher: Bar vs Line vs Table */}
                <div className="flex items-center gap-1 bg-[#EAE5DC] p-0.5 rounded-[7px]">
                  <button
                    type="button"
                    onClick={() => {
                      setProductViewType('chart');
                      setProductChartSubtype('bar');
                    }}
                    title="Product Bar Chart"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      productViewType === 'chart' && productChartSubtype === 'bar'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <BarChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProductViewType('chart');
                      setProductChartSubtype('line');
                    }}
                    title="Trend Line View"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      productViewType === 'chart' && productChartSubtype === 'line'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <LineChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductViewType('table')}
                    title="Table View"
                    className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                      productViewType === 'table'
                        ? 'bg-white text-[#FF5C35] shadow-2xs'
                        : 'text-[#706B62] hover:text-[#1A1816]'
                    }`}
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Export chart at right corner */}
                <button
                  type="button"
                  onClick={exportProductAipCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#1A1816] bg-white border border-[#D5D0C7] hover:bg-[#F4F1EB] rounded-[7px] shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF5C35]" />
                  <span>Export chart</span>
                </button>
              </div>
            </div>

            {/* Quick Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-[8px] border border-[#E2DDD5] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium text-[#706B62]">
                    Targeted Product ({targetedProductCode})
                  </span>
                  <span className="text-[11.5px] font-bold text-[#FF5C35]">
                    Targeted Goal
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[22px] font-bold font-data text-[#1A1816]">
                    {productSummary.targetedAip.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] font-semibold text-[#FF5C35] font-data">
                    {productSummary.targetedPercent}% of Total AIP
                  </span>
                </div>
                <p className="text-[11px] text-[#706B62] mt-1 font-data">
                  Sanctioned: {formatIndianCurrency(productSummary.targetedSanctioned)} • 9.2% conv rate
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-[8px] border border-[#E2DDD5] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium text-[#706B62]">
                    Other Products
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#1E40AF]">
                    {productSummary.otherCount} Combinations
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[22px] font-bold font-data text-[#1A1816]">
                    {productSummary.othersAip.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] font-semibold text-[#1E40AF] font-data">
                    {productSummary.othersPercent}% of Total AIP
                  </span>
                </div>
                <p className="text-[11px] text-[#706B62] mt-1 font-data">
                  Sanctioned: {formatIndianCurrency(productSummary.othersSanctioned)}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-[8px] border border-[#E2DDD5] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium text-[#706B62]">Total AIP Conversions</span>
                  <span className="text-[11.5px] font-semibold text-[#16A34A]">
                    100% Volume
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[22px] font-bold font-data text-[#1A1816]">
                    {productSummary.totalAip.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] font-medium text-[#706B62] font-data">Total AIPs</span>
                </div>
                <p className="text-[11px] text-[#706B62] mt-1 font-data">
                  Total Disbursed: {formatIndianCurrency(productSummary.totalSanctioned)}
                </p>
              </div>
            </div>

            {/* Visualizer: Chart vs Table */}
            {productViewType === 'chart' ? (
              <div className="w-full">
                {productChartSubtype === 'bar' ? (
                  /* Bar Chart: All 11 combinations with targeted product highlighted */
                  <div className="h-[290px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={productPerformanceData}
                        margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE7DE" />
                        <XAxis
                          dataKey="code"
                          angle={-30}
                          textAnchor="end"
                          interval={0}
                          tick={{ fontSize: 11, fill: '#706B62' }}
                          tickLine={false}
                          axisLine={{ stroke: '#DCD5C8' }}
                          height={45}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#706B62' }}
                          tickLine={false}
                          axisLine={{ stroke: '#DCD5C8' }}
                          tickFormatter={(v) => v.toLocaleString('en-IN')}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white border border-[#D5D0C7] p-3 rounded-[8px] shadow-md text-[12px] space-y-1.5 font-body">
                                  <div className="flex items-center justify-between gap-3 border-b border-[#ECE7DE] pb-1.5">
                                    <span className="font-bold text-[#1A1816]">{data.code}</span>
                                    <span
                                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                                        data.isTargeted
                                          ? 'bg-[#FFF0EB] text-[#FF5C35] border border-[#FFD9CE]'
                                          : 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]'
                                      }`}
                                    >
                                      {data.isTargeted ? 'Target Product' : 'Other Product (Spillover)'}
                                    </span>
                                  </div>
                                  <div className="pt-1 font-data space-y-1">
                                    <div className="flex justify-between gap-4">
                                      <span className="text-[#706B62]">AIP Conversions:</span>
                                      <span className="font-bold text-[#1A1816]">
                                        {data.aipCount.toLocaleString('en-IN')} ({data.sharePercent}%)
                                      </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-[#706B62]">Conversion Rate:</span>
                                      <span className="font-semibold text-[#1A1816]">{data.convRate}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-[#706B62]">Sanctioned Volume:</span>
                                      <span className="font-bold text-[#16A34A]">
                                        {formatIndianCurrency(data.sanctionedRevenue)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="aipCount"
                          name="AIP Conversions"
                          radius={[4, 4, 0, 0]}
                        >
                          {productPerformanceData.map((entry) => (
                            <Cell
                              key={`cell-${entry.code}`}
                              fill={entry.isTargeted ? '#FF5C35' : '#1E40AF'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  /* Line Chart: Trend comparing Targeted vs Others */
                  <div className="h-[290px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={productTrendData}
                        margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE7DE" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: '#706B62' }}
                          tickLine={false}
                          axisLine={{ stroke: '#DCD5C8' }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#706B62' }}
                          tickLine={false}
                          axisLine={{ stroke: '#DCD5C8' }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white border border-[#D5D0C7] p-3 rounded-[8px] shadow-md text-[12px] space-y-1.5 font-body">
                                  <div className="font-bold text-[#1A1816] border-b border-[#ECE7DE] pb-1">
                                    Period: {label}
                                  </div>
                                  <div className="font-data space-y-1 pt-1">
                                    {payload.map((entry, index) => (
                                      <div
                                        key={`p-${index}`}
                                        className="flex items-center justify-between gap-4"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <span className="text-[#706B62]">{entry.name}:</span>
                                        </div>
                                        <span className="font-bold text-[#1A1816]">
                                          {entry.value?.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="targetedAip"
                          name={`Targeted (${targetedProductCode})`}
                          stroke="#FF5C35"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#FF5C35' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="othersAip"
                          name="Others Combined (Spillover)"
                          stroke="#1E40AF"
                          strokeWidth={2}
                          dot={{ r: 3.5, fill: '#1E40AF' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalAip"
                          name="Total AIP"
                          stroke="#059669"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: '#059669' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Legend matching Image 1 */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-[12px] text-[#4A453E] border-t border-[#EAE5DC] mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-[#FF5C35]" />
                    <span className="font-bold text-[#FF5C35]">
                      Targeted Product ({targetedProductCode}) - {productSummary.targetedPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-[#1E40AF]" />
                    <span className="font-medium text-[#555047]">
                      Other Products - {productSummary.othersPercent}%
                    </span>
                  </div>
                  {productChartSubtype === 'line' && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-[3px] bg-[#059669]" />
                      <span className="font-medium text-[#555047]">Total AIP</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Table View for Graph 3 */
              <div className="overflow-x-auto border border-[#E2DDD5] rounded-[8px] bg-white">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#DDD6C9] border-b border-[#D5CEC0] font-bold text-[#1A1816]">
                      <th className="py-2.5 px-3.5">Product Code</th>
                      <th className="py-2.5 px-3.5">Classification</th>
                      <th className="py-2.5 px-3.5 text-right text-[#FF5C35]">AIP Achieved</th>
                      <th className="py-2.5 px-3.5 text-right">Conversion Rate</th>
                      <th className="py-2.5 px-3.5 text-right text-[#16A34A]">Sanctioned Volume (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC] font-data">
                    {productPerformanceData.map((row) => (
                      <tr
                        key={row.code}
                        className={`hover:bg-[#FAF8F5] ${
                          row.isTargeted ? 'bg-[#FFF8F5] font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3.5 font-bold text-[#1A1816]">
                          <div className="flex items-center gap-2">
                            <span>{row.code}</span>
                            {row.isTargeted && (
                              <span className="text-[10px] font-bold text-[#FF5C35] bg-[#FFF0EB] border border-[#FFD9CE] px-1.5 py-0.5 rounded-[4px]">
                                TARGET
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              row.isTargeted
                                ? 'text-[#FF5C35] bg-[#FFF0EB] border border-[#FFD9CE]'
                                : 'text-[#1E40AF] bg-[#EFF6FF] border border-[#BFDBFE]'
                            }`}
                          >
                            {row.isTargeted ? 'Target Product' : 'Other'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-[#FF5C35]">
                          {row.aipCount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-semibold text-[#1A1816]">
                          {row.convRate}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-[#16A34A]">
                          {formatIndianCurrency(row.sanctionedRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Image 3: Back Button (Matching Objective & Audience pages) ───── */}
      <div className="flex items-center justify-between pt-4 pb-8">
        <button
          type="button"
          onClick={onBackToHome}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] hover:text-[#1A1816] transition-colors cursor-pointer"
        >
          Back
        </button>
      </div>
    </div>
  );
};
