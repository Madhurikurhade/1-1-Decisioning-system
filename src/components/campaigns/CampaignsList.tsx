import React, { useState, useMemo, useEffect } from 'react';
import { CampaignRecord, CampaignStatus } from '../../types';
import { Search, RotateCw } from 'lucide-react';
import { CustomMultiSelectDropdown } from './CustomMultiSelectDropdown';
import {
  CreatedDateDropdown,
  CreatedDateFilterValue,
  matchesCreatedDateFilter,
  isDateInPast,
  isFilterForTodayOnly,
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

interface CampaignsListProps {
  campaigns: CampaignRecord[];
  onAssignCampaign: (campaign: CampaignRecord) => void;
  onViewCampaign: (campaign: CampaignRecord) => void;
  onRefresh: () => void;
}

export const CampaignsList: React.FC<CampaignsListProps> = ({
  campaigns,
  onAssignCampaign,
  onViewCampaign,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending Review' | 'Approved' | 'Launched / Completed' | 'Archived'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<CreatedDateFilterValue>({
    type: 'preset',
    value: 'Today',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper to determine effective status and assignment (past campaigns cannot be assigned or pending)
  const getCampaignMeta = (c: CampaignRecord) => {
    const isPast = isDateInPast(c.decisionDate);
    let effectiveStatus: CampaignStatus =
      isPast && c.status === 'Pending' ? 'Archived' : c.status;
    if (effectiveStatus === 'Scheduled') {
      effectiveStatus = 'Launched';
    }
    const effectiveAssignment: 'Assigned' | 'Unassigned' | 'Assign' = isPast
      ? (c.assignment === 'Assigned' || c.status === 'Completed' || c.status === 'Scheduled' || c.status === 'Launched' ? 'Assigned' : 'Unassigned')
      : c.assignment;
    return { isPast, effectiveStatus, effectiveAssignment };
  };

  // Channel & Use Case options derived from data
  const channelsList = useMemo(() => ['WhatsApp', 'SMS', 'RCS'], []);
  const allUseCases = useMemo(() => {
    return Array.from(new Set(campaigns.map((c) => c.useCaseName)));
  }, [campaigns]);

  // Campaigns matching the decision date filter (used for counts and further filtering)
  const dateFilteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (dateFilter && !matchesCreatedDateFilter(c.decisionDate, dateFilter, new Date())) {
        return false;
      }
      return true;
    });
  }, [campaigns, dateFilter]);

  // Determine whether Archived tab should be visible: only when past dates / anything not Today is selected
  const isTodayOnly = isFilterForTodayOnly(dateFilter);
  const showArchivedTab = !isTodayOnly;

  // Counts for status cards reflecting selected date range
  const counts = useMemo(() => {
    const total = dateFilteredCampaigns.length;
    const pending = dateFilteredCampaigns.filter((c) => getCampaignMeta(c).effectiveStatus === 'Pending').length;
    const approved = dateFilteredCampaigns.filter((c) => getCampaignMeta(c).effectiveStatus === 'Approved').length;
    const launched = dateFilteredCampaigns.filter((c) => {
      const s = getCampaignMeta(c).effectiveStatus;
      return s === 'Launched' || s === 'Completed';
    }).length;
    const archived = dateFilteredCampaigns.filter((c) => getCampaignMeta(c).effectiveStatus === 'Archived').length;
    return { total, pending, approved, launched, archived };
  }, [dateFilteredCampaigns]);

  // Auto switch tab to 'All' if activeTab is 'Archived' but the tab is hidden
  useEffect(() => {
    if (!showArchivedTab && activeTab === 'Archived') {
      setActiveTab('All');
    }
  }, [showArchivedTab, activeTab]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const { effectiveStatus } = getCampaignMeta(c);

      // Status tab filter
      if (activeTab === 'Pending Review' && effectiveStatus !== 'Pending') return false;
      if (activeTab === 'Approved' && effectiveStatus !== 'Approved') return false;
      if (
        activeTab === 'Launched / Completed' &&
        effectiveStatus !== 'Launched' &&
        effectiveStatus !== 'Completed'
      ) {
        return false;
      }
      if (activeTab === 'Archived' && effectiveStatus !== 'Archived') return false;

      // Search query (campaign name or use case name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.campaignName.toLowerCase().includes(q) ||
          c.useCaseName.toLowerCase().includes(q) ||
          c.theme.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Channel filter
      if (selectedChannels.length > 0 && !selectedChannels.includes(c.channel)) {
        return false;
      }

      // Use Case filter
      if (selectedUseCases.length > 0 && !selectedUseCases.includes(c.useCaseName)) {
        return false;
      }

      // Decision Date filter (using standardized CreatedDateFilter)
      if (dateFilter) {
        if (!matchesCreatedDateFilter(c.decisionDate, dateFilter, new Date())) {
          return false;
        }
      }

      return true;
    });
  }, [campaigns, activeTab, searchQuery, selectedChannels, selectedUseCases, dateFilter]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="space-y-5 font-body">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1A1816] tracking-tight">Campaigns</h1>
          <p className="text-[13px] text-[#706B62] mt-0.5">
            Review, configure, and manage <span className="text-[#FF5C35] font-medium">recommended campaigns</span>
          </p>
        </div>

        {/* Refresh button (matching Image 2) */}
        <button
          type="button"
          onClick={handleRefreshClick}
          className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium text-[#FF5C35] border border-[#FF5C35] bg-transparent hover:bg-[#FF5C35]/5 active:bg-[#FF5C35]/10 transition-colors cursor-pointer"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Filter Bar & Dropdowns (matching Image 4, 5, 6) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Entries */}
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

        {/* Dropdown 1: Use Case Name (matching Image 4 & Image 5) */}
        <CustomMultiSelectDropdown
          label="Use Case Name"
          options={allUseCases}
          selected={selectedUseCases}
          onChange={setSelectedUseCases}
          searchPlaceholder="Search use cases..."
          dropdownWidth="w-full sm:w-[360px]"
        />

        {/* Dropdown 2: Select Channel (matching Image 5) */}
        <CustomMultiSelectDropdown
          label="Select Channel"
          options={channelsList}
          selected={selectedChannels}
          onChange={setSelectedChannels}
          searchPlaceholder="Search..."
          dropdownWidth="w-full sm:w-[260px]"
        />

        {/* Dropdown 3: Decision Date (Standardized CreatedDateDropdown theme) */}
        <CreatedDateDropdown
          value={dateFilter}
          onChange={setDateFilter}
          defaultLabel="Select decision date"
          headerTitle="Select decision date"
          maxDate={new Date()}
          align="right"
          className="w-full"
        />
      </div>

      {/* ── Summary Status Tabs / Counts ───────────────────────────────────── */}
      <div className="bg-white rounded-[10px] border border-[#E2DDD5] p-3 shadow-2xs flex items-center justify-around text-center divide-x divide-[#EAE5DC]">
        {/* Tab 1: All */}
        <button
          type="button"
          onClick={() => setActiveTab('All')}
          className="flex-1 px-3 py-1 cursor-pointer transition-colors"
        >
          <span className={`text-[12px] font-semibold block ${activeTab === 'All' ? 'text-[#FF5C35]' : 'text-[#807A70]'}`}>
            All
          </span>
          <span className={`text-[18px] font-bold font-data block mt-0.5 ${activeTab === 'All' ? 'text-[#FF5C35]' : 'text-[#1A1816]'}`}>
            {counts.total}
          </span>
        </button>

        {/* Tab 2: Pending Review */}
        <button
          type="button"
          onClick={() => setActiveTab('Pending Review')}
          className="flex-1 px-3 py-1 cursor-pointer transition-colors"
        >
          <span className={`text-[12px] font-semibold block ${activeTab === 'Pending Review' ? 'text-[#FF5C35]' : 'text-[#807A70]'}`}>
            Pending Review
          </span>
          <span className={`text-[18px] font-bold font-data block mt-0.5 ${activeTab === 'Pending Review' ? 'text-[#FF5C35]' : 'text-[#1A1816]'}`}>
            {counts.pending}
          </span>
        </button>

        {/* Tab 3: Approved */}
        <button
          type="button"
          onClick={() => setActiveTab('Approved')}
          className="flex-1 px-3 py-1 cursor-pointer transition-colors"
        >
          <span className={`text-[12px] font-semibold block ${activeTab === 'Approved' ? 'text-[#FF5C35]' : 'text-[#807A70]'}`}>
            Approved
          </span>
          <span className={`text-[18px] font-bold font-data block mt-0.5 ${activeTab === 'Approved' ? 'text-[#FF5C35]' : 'text-[#1A1816]'}`}>
            {counts.approved}
          </span>
        </button>

        {/* Tab 4: Launched */}
        <button
          type="button"
          onClick={() => setActiveTab('Launched / Completed')}
          className="flex-1 px-3 py-1 cursor-pointer transition-colors"
        >
          <span className={`text-[12px] font-semibold block ${activeTab === 'Launched / Completed' ? 'text-[#FF5C35]' : 'text-[#807A70]'}`}>
            Launched
          </span>
          <span className={`text-[18px] font-bold font-data block mt-0.5 ${activeTab === 'Launched / Completed' ? 'text-[#FF5C35]' : 'text-[#1A1816]'}`}>
            {counts.launched}
          </span>
        </button>

        {/* Tab 5: Archived (Only visible for past dates / anything not Today) */}
        {showArchivedTab && (
          <button
            type="button"
            onClick={() => setActiveTab('Archived')}
            className="flex-1 px-3 py-1 cursor-pointer transition-colors"
          >
            <span className={`text-[12px] font-semibold block ${activeTab === 'Archived' ? 'text-[#FF5C35]' : 'text-[#807A70]'}`}>
              Archived
            </span>
            <span className={`text-[18px] font-bold font-data block mt-0.5 ${activeTab === 'Archived' ? 'text-[#FF5C35]' : 'text-[#1A1816]'}`}>
              {counts.archived}
            </span>
          </button>
        )}
      </div>

      {/* ── Subtitle Count: "Listing Campaigns" (matching Image 2) ──────── */}
      <div className="space-y-2">
        <div className="text-[11.5px] text-[#706B62] font-normal px-0.5">
          Listing Campaigns
        </div>

        {/* ── Main Wireframe Table ─────────────────────────────────────── */}
        <div className="w-full bg-white rounded-[12px] border border-[#E2DDD5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              {/* Table Header: Sand/Tan background matching wireframe (#DDD6C9) */}
              <thead>
                <tr className="bg-[#DDD6C9] border-b border-[#D5CEC0] text-[13px] font-bold text-[#1A1816]">
                  <th className="py-3 px-4 font-bold">Campaign Name</th>
                  <th className="py-3 px-4 font-bold">Use Case Name</th>
                  <th className="py-3 px-3 font-bold text-center">Channel</th>
                  <th className="py-3 px-3 font-bold text-center">Audience Count</th>
                  <th className="py-3 px-3 font-bold text-center">Spent</th>
                  <th className="py-3 px-3 font-bold text-center">Theme</th>
                  <th className="py-3 px-3 font-bold text-center">Status</th>
                  <th className="py-3 px-3 font-bold text-center">Decision Date</th>
                  <th className="py-3 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] text-[12.5px] text-[#2D2A26]">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-[#8C857B]">
                    No campaigns matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => {
                  const { isPast, effectiveStatus, effectiveAssignment } = getCampaignMeta(camp);
                  return (
                  <tr
                    key={camp.id}
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    onClick={() => onViewCampaign(camp)}
                  >
                    {/* Campaign Name */}
                    <td className="py-3.5 px-4 font-semibold text-[#1A1816] max-w-[220px] truncate group-hover:text-[#FF5C35] transition-colors">
                      {camp.campaignName}
                    </td>

                    {/* Use Case Name */}
                    <td className="py-3.5 px-4 text-[#555047] max-w-[200px] truncate">
                      {camp.useCaseName}
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-3 font-medium text-[#1A1816]">
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#F2EEE7] text-[11px] font-semibold">
                        {camp.channel}
                      </span>
                    </td>

                    {/* Audience Count */}
                    <td className="py-3.5 px-3 font-data font-medium text-[#1A1816]">
                      {camp.audienceCount.toLocaleString('en-IN')}
                    </td>

                    {/* Spent */}
                    <td className="py-3.5 px-3 font-data text-[#555047]">
                      ₹ {camp.spent.toLocaleString('en-IN')}
                    </td>

                    {/* Theme */}
                    <td className="py-3.5 px-3 text-[#555047]">
                      {camp.theme}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {effectiveStatus === 'Launched' ? (
                        <span className="text-[#1E40AF] font-medium text-[13px]">
                          Launched
                        </span>
                      ) : effectiveStatus === 'Pending' ? (
                        <span className="text-[#92400E] font-medium text-[13px]">
                          Pending
                        </span>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            effectiveStatus === 'Approved'
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : effectiveStatus === 'Completed'
                              ? 'bg-[#F3E8FF] text-[#6B21A8]'
                              : effectiveStatus === 'Archived'
                              ? 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                          }`}
                        >
                          {effectiveStatus}
                        </span>
                      )}
                    </td>

                    {/* Decision Date */}
                    <td className="py-3.5 px-3 text-[#706B62] text-[12px] font-data">
                      {camp.decisionDate}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      {isPast || effectiveStatus === 'Archived' ? (
                        <span
                          className={`text-[12px] font-medium ${
                            effectiveAssignment === 'Unassigned'
                              ? 'text-[#8C857B]'
                              : 'text-[#4B5563]'
                          }`}
                        >
                          {effectiveAssignment === 'Unassigned' ? 'Unassigned' : 'Assigned'}
                        </span>
                      ) : effectiveStatus === 'Pending' || effectiveAssignment === 'Assign' || effectiveAssignment === 'Unassigned' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignCampaign(camp);
                          }}
                          className="text-[#FF5C35] hover:text-[#E04823] font-semibold text-[13px] hover:underline cursor-pointer"
                        >
                          Assign
                        </button>
                      ) : effectiveStatus === 'Approved' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignCampaign(camp);
                          }}
                          className="text-[#2563EB] hover:text-[#1D4ED8] font-medium text-[12.5px] hover:underline cursor-pointer"
                        >
                          Reassign
                        </button>
                      ) : (
                        <span className="text-[#8C857B] text-[12px]">Assigned</span>
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
  </div>
);
};
