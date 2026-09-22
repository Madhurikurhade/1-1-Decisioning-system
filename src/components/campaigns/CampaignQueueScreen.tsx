import React, { useState, useMemo } from 'react';
import { CampaignRecord } from '../../types';
import { Search, RotateCw, Rocket, Check } from 'lucide-react';
import { CustomMultiSelectDropdown } from './CustomMultiSelectDropdown';
import {
  CreatedDateDropdown,
  CreatedDateFilterValue,
  matchesCreatedDateFilter,
  isDateInPast,
} from '../home/CreatedDateDropdown';

function parseCampaignDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/[\s/]+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);
    const monthName = parts[1].toLowerCase();
    const monthsMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };
    if (monthName in monthsMap) {
      return new Date(year, monthsMap[monthName], day);
    }
    const mNum = parseInt(parts[1], 10);
    if (!isNaN(mNum)) {
      return new Date(year, mNum - 1, day);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getCampaignQueueStatus(c: CampaignRecord): 'Launch' | 'Launched' | 'Not Launched' {
  if (c.status === 'Launched' || c.status === 'Scheduled' || c.status === 'Completed') {
    return 'Launched';
  }
  const rawDate = c.launchDate || c.decisionDate;
  if (isDateInPast(rawDate)) {
    return 'Not Launched';
  }
  return 'Launch';
}

interface CampaignQueueScreenProps {
  campaigns: CampaignRecord[];
  onOpenReviewLaunch: (campaign: CampaignRecord) => void;
  onRefresh: () => void;
}

export const CampaignQueueScreen: React.FC<CampaignQueueScreenProps> = ({
  campaigns,
  onOpenReviewLaunch,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  // By default select Today as requested
  const [dateFilter, setDateFilter] = useState<CreatedDateFilterValue>({
    type: 'preset',
    value: 'Today',
  });
  const [statusFilter, setStatusFilter] = useState<'All' | 'Launch' | 'Launched' | 'Not Launched'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const channelsList = ['WhatsApp', 'SMS', 'RCS'];

  // Campaigns only enter the queue once approved or launched, plus past campaigns that were not launched
  const queueCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const rawDate = c.launchDate || c.decisionDate;
      const past = isDateInPast(rawDate);
      if (past) {
        return true;
      }
      return c.status === 'Approved' || c.status === 'Scheduled' || c.status === 'Launched';
    });
  }, [campaigns]);

  const allUseCases = useMemo(() => {
    return Array.from(new Set(queueCampaigns.map((c) => c.useCaseName)));
  }, [queueCampaigns]);

  const filtered = useMemo(() => {
    return queueCampaigns.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.campaignName.toLowerCase().includes(q) ||
          c.useCaseName.toLowerCase().includes(q) ||
          c.theme.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedChannels.length > 0 && !selectedChannels.includes(c.channel)) {
        return false;
      }
      if (selectedUseCases.length > 0 && !selectedUseCases.includes(c.useCaseName)) {
        return false;
      }
      if (dateFilter) {
        const rawDate = c.launchDate || c.decisionDate;
        if (!matchesCreatedDateFilter(rawDate, dateFilter)) {
          return false;
        }
      }
      if (statusFilter !== 'All') {
        const qStatus = getCampaignQueueStatus(c);
        if (qStatus !== statusFilter) {
          return false;
        }
      }
      return true;
    });
  }, [queueCampaigns, searchQuery, selectedChannels, selectedUseCases, dateFilter, statusFilter]);

  const countsByTab = useMemo(() => {
    const baseList = queueCampaigns.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.campaignName.toLowerCase().includes(q) ||
          c.useCaseName.toLowerCase().includes(q) ||
          c.theme.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedChannels.length > 0 && !selectedChannels.includes(c.channel)) return false;
      if (selectedUseCases.length > 0 && !selectedUseCases.includes(c.useCaseName)) return false;
      if (dateFilter) {
        const rawDate = c.launchDate || c.decisionDate;
        if (!matchesCreatedDateFilter(rawDate, dateFilter)) return false;
      }
      return true;
    });

    const launchCount = baseList.filter((c) => getCampaignQueueStatus(c) === 'Launch').length;
    const launchedCount = baseList.filter((c) => getCampaignQueueStatus(c) === 'Launched').length;
    const notLaunchedCount = baseList.filter((c) => getCampaignQueueStatus(c) === 'Not Launched').length;

    return {
      All: baseList.length,
      Launch: launchCount,
      Launched: launchedCount,
      'Not Launched': notLaunchedCount,
    };
  }, [queueCampaigns, searchQuery, selectedChannels, selectedUseCases, dateFilter]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <div className="space-y-5 font-body">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1A1816] tracking-tight">Campaign Queue</h1>
          <p className="text-[13px] text-[#706B62] mt-0.5">
            Review and validate campaigns before launch
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshClick}
          className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium text-[#FF5C35] border border-[#FF5C35] bg-transparent hover:bg-[#FF5C35]/5 active:bg-[#FF5C35]/10 transition-colors cursor-pointer"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Filter Bar (matching Image 4, 5, 6) ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Entries........"
            className="w-full h-[40px] pl-3.5 pr-9 bg-white border border-[#D5D0C7] rounded-[8px] text-[13px] text-[#1A1816] placeholder:text-[#9E988E] outline-none focus:border-[#1A1816] transition-colors shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#807A70] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Use Case Dropdown */}
        <CustomMultiSelectDropdown
          label="Use Case Name"
          options={allUseCases}
          selected={selectedUseCases}
          onChange={setSelectedUseCases}
          searchPlaceholder="Search use cases..."
          dropdownWidth="w-full sm:w-[360px]"
        />

        {/* Channel Dropdown */}
        <CustomMultiSelectDropdown
          label="Select Channel"
          options={channelsList}
          selected={selectedChannels}
          onChange={setSelectedChannels}
          searchPlaceholder="Search..."
          dropdownWidth="w-full sm:w-[260px]"
        />

        {/* Launch Date */}
        <CreatedDateDropdown
          value={dateFilter}
          onChange={setDateFilter}
          defaultLabel="Select launch date"
          headerTitle="Select launch date"
          align="right"
          className="w-full"
        />
      </div>

      {/* ── Table: Approved & Schedule Campaigns ───────────────────────────── */}
      <div className="bg-white rounded-[10px] border border-[#E2DDD5] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#EAE5DC] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#807A70]">
            Approved &amp; Scheduled Campaigns ({filtered.length})
          </span>

          {/* Status Filter Tabs (All / Launch / Launched / Not Launched) */}
          <div className="flex items-center gap-1.5">
            {(['All', 'Launch', 'Launched', 'Not Launched'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-[6px] text-[11.5px] font-medium transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#1A1816] text-white shadow-2xs font-semibold'
                    : 'bg-[#F2EEE7] text-[#666056] hover:bg-[#E8E2D8] hover:text-[#1A1816]'
                }`}
              >
                {tab} ({countsByTab[tab]})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EAE5DC] text-[11.5px] font-bold text-[#666056] uppercase tracking-wide">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Use Case Name</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Audience Count</th>
                <th className="py-3 px-3">Spent</th>
                <th className="py-3 px-3">Theme</th>
                <th className="py-3 px-3">Launch Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5DC] text-[12.5px] text-[#2D2A26]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-[#8C857B]">
                    No campaigns waiting in queue.
                  </td>
                </tr>
              ) : (
                filtered.map((camp) => {
                  const qStatus = getCampaignQueueStatus(camp);
                  return (
                    <tr
                      key={camp.id}
                      className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                      onClick={() => onOpenReviewLaunch(camp)}
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#1A1816] max-w-[220px] truncate group-hover:text-[#FF5C35]">
                        {camp.campaignName}
                      </td>
                      <td className="py-3.5 px-4 text-[#555047] max-w-[200px] truncate">
                        {camp.useCaseName}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#F2EEE7] text-[11px] font-semibold">
                          {camp.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-data font-medium text-[#1A1816]">
                        {camp.audienceCount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 font-data text-[#555047]">
                        ₹ {camp.spent.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-[#555047]">{camp.theme}</td>
                      <td className="py-3.5 px-3 text-[#706B62] font-data">
                        {camp.launchDate || camp.decisionDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {qStatus === 'Launch' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReviewLaunch(camp);
                            }}
                            className="text-[#FF5C35] hover:text-[#E04823] font-semibold text-[13px] hover:underline cursor-pointer inline-flex items-center gap-1"
                          >
                            Launch
                          </button>
                        ) : qStatus === 'Launched' ? (
                          <span className="text-[#1E40AF] font-medium text-[12px] inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Launched
                          </span>
                        ) : (
                          <span className="text-[#8C857B] font-medium text-[12px]">
                            Not Launched
                          </span>
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
    </div>
  );
};
