import React, { useState } from 'react';
import { CampaignRecord, SuppressionRule } from '../../types';
import {
  SUPPRESSION_PROPERTIES,
  SUPPRESSION_OPERATORS,
  CUSTOM_SUPPRESSION_GROUPS,
  getSuppressionProperty,
} from '../../data/campaignMockData';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { CustomConfigDropdown } from './CustomConfigDropdown';

interface SuppressionScreenProps {
  campaign: CampaignRecord;
  onBack: () => void;
  onSaveDraft?: (updatedCampaign: CampaignRecord) => void;
  onSaveAndNext?: (updatedCampaign: CampaignRecord) => void;
  onNext?: (updatedCampaign: CampaignRecord) => void;
  onShowToast?: (msg: string) => void;
  onRefresh?: () => void;
}

export interface RuleGroup {
  id: string;
  title: string;
  isNested: boolean;
  connector: 'AND' | 'OR';
  rules: SuppressionRule[];
}

export const SuppressionScreen: React.FC<SuppressionScreenProps> = ({
  campaign,
  onBack,
  onSaveDraft,
  onSaveAndNext,
  onNext,
  onShowToast,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'User Property' | 'Custom supression Group'>(
    'User Property'
  );

  // Grouped rules supporting bracketed first box and nested filter box
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    {
      id: 'group-base',
      title: 'Rule Group 1',
      isNested: false,
      connector: 'AND',
      rules: campaign.config?.suppressionRules?.length
        ? campaign.config.suppressionRules.map((r) => {
            const p = getSuppressionProperty(r.property);
            const op = p.operators.includes(r.operator) ? r.operator : p.operators[0];
            return {
              ...r,
              property: p.id,
              operator: op,
            };
          })
        : [
            {
              id: 'rule-1',
              property: 'Mobile_campaign_flag (MCF)',
              operator: 'is',
              value: '0',
              connector: 'AND',
            },
            {
              id: 'rule-2',
              property: 'unsec_model_flag',
              operator: 'is',
              value: 'Model A',
              connector: 'AND',
            },
          ],
    },
  ]);

  const [customGroups, setCustomGroups] = useState<string[]>(
    campaign.config?.customSuppressionGroups?.length
      ? campaign.config.customSuppressionGroups
      : ['High Risk Customer Blacklist']
  );

  const [activeGroupId, setActiveGroupId] = useState<string>('group-base');
  const [isCountClicked, setIsCountClicked] = useState<boolean>(false);

  const [groupConnector, setGroupConnector] = useState<'AND' | 'OR'>('AND');

  // Counts - suppression volume always decreases from original audience
  const initialAudience = campaign.config?.audienceBeforeSuppression || campaign.audienceCount || 30000;
  const [suppressedCount, setSuppressedCount] = useState<number>(
    campaign.config?.suppressedUserCount !== undefined ? campaign.config.suppressedUserCount : 3
  );
  const [finalAudience, setFinalAudience] = useState<number>(() => {
    if (
      campaign.config?.audienceAfterSuppression !== undefined &&
      campaign.config.audienceAfterSuppression < initialAudience
    ) {
      return campaign.config.audienceAfterSuppression;
    }
    const suppressed =
      campaign.config?.suppressedUserCount !== undefined ? campaign.config.suppressedUserCount : 3;
    return Math.max(0, initialAudience - suppressed);
  });

  const hasNested = ruleGroups.some((g) => g.isNested);

  const handlePropertyChange = (groupId: string, ruleIdx: number, newProp: string) => {
    const propConfig = getSuppressionProperty(newProp);
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const newRules = [...g.rules];
        const currentRule = newRules[ruleIdx];
        const isOpValid = propConfig.operators.includes(currentRule.operator);
        const nextOp = isOpValid ? currentRule.operator : propConfig.operators[0];

        let nextVal = currentRule.value;
        if (nextOp === 'is empty') {
          nextVal = 'Blank';
        } else if (nextOp === 'is between') {
          nextVal = '1 - 5';
        } else if (!propConfig.allowedValues.includes(nextVal)) {
          nextVal = propConfig.allowedValues[0];
        }

        newRules[ruleIdx] = {
          ...currentRule,
          property: propConfig.id,
          operator: nextOp,
          value: nextVal,
        };
        return { ...g, rules: newRules };
      })
    );
  };

  const handleOperatorChange = (groupId: string, ruleIdx: number, newOp: string) => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const newRules = [...g.rules];
        const currentRule = newRules[ruleIdx];
        const propConfig = getSuppressionProperty(currentRule.property);

        let nextVal = currentRule.value;
        if (newOp === 'is empty') {
          nextVal = 'Blank';
        } else if (newOp === 'is between') {
          if (!nextVal || !nextVal.includes('-')) {
            nextVal = '1 - 5';
          }
        } else {
          if (nextVal.includes('-') || !propConfig.allowedValues.includes(nextVal)) {
            nextVal = propConfig.allowedValues[0];
          }
        }

        newRules[ruleIdx] = {
          ...currentRule,
          operator: newOp,
          value: nextVal,
        };
        return { ...g, rules: newRules };
      })
    );
  };

  const handleRangeChange = (
    groupId: string,
    ruleIdx: number,
    minVal: string,
    maxVal: string
  ) => {
    const combined = `${minVal} - ${maxVal}`;
    handleValueChange(groupId, ruleIdx, combined);
  };

  const handleValueChange = (groupId: string, ruleIdx: number, newVal: string) => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const newRules = [...g.rules];
        newRules[ruleIdx] = { ...newRules[ruleIdx], value: newVal };
        return { ...g, rules: newRules };
      })
    );
  };

  const handleSetConnector = (groupId: string, ruleIdx: number, connector: 'AND' | 'OR') => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const newRules = [...g.rules];
        newRules[ruleIdx] = { ...newRules[ruleIdx], connector };
        return { ...g, rules: newRules };
      })
    );
  };

  const handleSetGroupConnector = (groupIndex: number, connector: 'AND' | 'OR') => {
    setRuleGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex] = { ...copy[groupIndex], connector };
      return copy;
    });
  };

  const handleAddProperty = () => {
    const newRule: SuppressionRule = {
      id: `rule-${Date.now()}`,
      property: 'Mobile_campaign_flag (MCF)',
      operator: 'is',
      value: '0',
      connector: 'AND',
    };
    setRuleGroups((prev) => {
      // Add to activeGroupId if found; otherwise add to the latest group (the nested filter if added)
      let targetIdx = prev.findIndex((g) => g.id === activeGroupId);
      if (targetIdx === -1) {
        targetIdx = prev.length - 1;
      }
      const copy = [...prev];
      copy[targetIdx] = {
        ...copy[targetIdx],
        rules: [...copy[targetIdx].rules, newRule],
      };
      return copy;
    });

    const activeGroupObj = ruleGroups.find((g) => g.id === activeGroupId);
    onShowToast?.(
      activeGroupObj?.isNested
        ? 'New property added to Nested Filter'
        : 'New property rule added'
    );
  };

  const handleAddRuleToGroup = (groupId: string) => {
    const newRule: SuppressionRule = {
      id: `rule-${Date.now()}`,
      property: 'Mobile_campaign_flag (MCF)',
      operator: 'is',
      value: '0',
      connector: 'AND',
    };
    setActiveGroupId(groupId);
    setRuleGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, rules: [...g.rules, newRule] } : g))
    );
    const targetGroup = ruleGroups.find((g) => g.id === groupId);
    onShowToast?.(
      targetGroup?.isNested
        ? 'Property added to Nested Filter'
        : 'Property added to group'
    );
  };

  const handleRemoveRuleFromGroup = (groupId: string, ruleIdx: number) => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.rules.length <= 1 && !g.isNested) {
          onShowToast?.('At least one suppression rule is required in the base group');
          return g;
        }
        return {
          ...g,
          rules: g.rules.filter((_, i) => i !== ruleIdx),
        };
      })
    );
  };

  const handleRemoveGroup = (groupId: string) => {
    setRuleGroups((prev) => {
      const remaining = prev.filter((g) => g.id !== groupId);
      if (activeGroupId === groupId) {
        setActiveGroupId(remaining[remaining.length - 1]?.id || 'group-base');
      }
      return remaining;
    });
    onShowToast?.('Nested filter removed');
  };

  const handleAddGroup = () => {
    const available = CUSTOM_SUPPRESSION_GROUPS.find((g) => !customGroups.includes(g));
    if (available) {
      setCustomGroups([...customGroups, available]);
      onShowToast?.('Custom suppression group added');
    } else {
      setCustomGroups([...customGroups, CUSTOM_SUPPRESSION_GROUPS[0]]);
    }
  };

  const handleRemoveCustomGroup = (idx: number) => {
    setCustomGroups(customGroups.filter((_, i) => i !== idx));
  };

  const handleAddNestedFilter = () => {
    const newId = `group-nested-${Date.now()}`;
    const newNestedGroup: RuleGroup = {
      id: newId,
      title: 'Nested Filter',
      isNested: true,
      connector: 'AND',
      rules: [
        {
          id: `rule-nested-${Date.now()}`,
          property: 'BFL_DECILE_TAGGING',
          operator: 'is between',
          value: '1 - 5',
          connector: 'AND',
        },
      ],
    };
    setRuleGroups((prev) => [...prev, newNestedGroup]);
    setActiveGroupId(newId);
    setIsCountClicked(false);
    onShowToast?.('Nested filter added and selected for new properties');
  };

  const handleShowCount = () => {
    setActiveGroupId('');
    setIsCountClicked(true);
    const allRules = ruleGroups.flatMap((g) => g.rules);
    const calculatedSuppressed = allRules.length > 0 ? 3 : 0;
    const calculatedFinal = Math.max(0, initialAudience - calculatedSuppressed);
    setSuppressedCount(calculatedSuppressed);
    setFinalAudience(calculatedFinal);
    onShowToast?.(`Count updated: Suppression count is ${calculatedSuppressed}, Final audience is ${calculatedFinal.toLocaleString('en-IN')}`);
  };

  const handleApplySuppression = () => {
    handleShowCount();
    onShowToast?.('Suppression filters applied successfully!');
  };

  const buildUpdatedCampaign = (): CampaignRecord => {
    const allRules = ruleGroups.flatMap((g) => g.rules);
    const calculatedSuppressed = suppressedCount;
    const calculatedFinal = Math.max(0, initialAudience - calculatedSuppressed);
    return {
      ...campaign,
      audienceCount: calculatedFinal,
      config: {
        ...campaign.config,
        suppressionRules: allRules,
        customSuppressionGroups: customGroups,
        audienceBeforeSuppression: initialAudience,
        suppressedUserCount: calculatedSuppressed,
        audienceAfterSuppression: calculatedFinal,
      },
    };
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSaveDraftClick = () => {
    setIsRefreshing(true);
    handleSaveDraft();
    onRefresh?.();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(buildUpdatedCampaign());
    onShowToast?.('Suppression configuration saved as draft');
  };

  const handleSaveAndNext = () => {
    const updated = buildUpdatedCampaign();
    if (onSaveAndNext) {
      onSaveAndNext(updated);
    } else if (onNext) {
      onNext(updated);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1A1816] tracking-tight">Campaigns</h1>
          <p className="text-[13px] text-[#706B62] mt-0.5">
            Review, configure, and manage <span className="text-[#FF5C35] font-medium">recommended campaigns</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveDraftClick}
          className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium text-[#FF5C35] border border-[#FF5C35] bg-transparent hover:bg-[#FF5C35]/5 active:bg-[#FF5C35]/10 transition-colors cursor-pointer"
        >
          {isRefreshing ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>

      {/* ── Read-only Campaign Info Bar ────────────────────────────────────── */}
      <div className="bg-white rounded-[10px] border border-[#E2DDD5] p-4 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12.5px]">
          <div>
            <span className="text-[11px] text-[#807A70] uppercase font-bold tracking-wider block">
              Campaign Name
            </span>
            <span className="font-semibold text-[#1A1816] truncate block mt-0.5" title={campaign.campaignName}>
              {campaign.campaignName}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#807A70] uppercase font-bold tracking-wider block">
              Use Case Name
            </span>
            <span className="text-[#4A453E] truncate block mt-0.5" title={campaign.useCaseName}>
              {campaign.useCaseName}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#807A70] uppercase font-bold tracking-wider block">
              Audience Count
            </span>
            <span className="font-data font-semibold text-[#1A1816] block mt-0.5">
              {campaign.audienceCount.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#807A70] uppercase font-bold tracking-wider block">
              Estimated Spents
            </span>
            <span className="font-data font-semibold text-[#1A1816] block mt-0.5">
              ₹ {campaign.spent.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#807A70] uppercase font-bold tracking-wider block">
              Channel
            </span>
            <span className="font-medium text-[#1A1816] block mt-0.5">
              {campaign.channel}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#807A70] uppercase font-bold tracking-wider block">
              Theme
            </span>
            <span className="text-[#4A453E] block mt-0.5">{campaign.theme}</span>
          </div>

          <div>
            <span className="text-[11px] text-[#807A70] uppercase font-bold tracking-wider block">
              Decision Date
            </span>
            <span className="font-data text-[#4A453E] block mt-0.5">
              {campaign.decisionDate}
            </span>
          </div>
        </div>
      </div>

      {/* ── Workflow Stage Indicator ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#807A70]">
          <span className="w-4 h-4 rounded-full border-2 border-[#807A70]" />
          <span>Template Configuration</span>
        </div>
        <div className="flex-1 h-px bg-[#E2DDD5]" />
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#1A1816]">
          <span className="w-4 h-4 rounded-full border-2 border-[#1A1816] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1816]" />
          </span>
          <span>Suppression</span>
        </div>
      </div>

      {/* ── Main Suppression Workspace ─────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Navigation Tabs (User Property | Custom supression Group) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab('User Property')}
            className={`px-6 py-2 text-[13px] font-bold transition-all cursor-pointer border ${
              activeTab === 'User Property'
                ? 'bg-white text-[#1A1816] border-[#D5D0C7] border-b-white rounded-t-[4px] shadow-2xs z-10'
                : 'bg-[#ECE7DF] text-[#706B62] border-transparent hover:text-[#1A1816] rounded-t-[4px]'
            }`}
          >
            User Property
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Custom supression Group')}
            className={`px-6 py-2 text-[13px] font-medium transition-all cursor-pointer border ${
              activeTab === 'Custom supression Group'
                ? 'bg-white text-[#1A1816] font-bold border-[#D5D0C7] border-b-white rounded-t-[4px] shadow-2xs z-10'
                : 'bg-[#ECE7DF] text-[#706B62] border-transparent hover:text-[#1A1816] rounded-t-[4px]'
            }`}
          >
            Custom supression Group
          </button>
        </div>

        {/* Card 1: User Property */}
        {activeTab === 'User Property' && (
          <div className="bg-[#FAF8F5]/80 rounded-[10px] border border-[#E8E3DA] p-6 space-y-4 shadow-2xs">
            {ruleGroups.map((group, gIdx) => {
              const isFirstGroup = gIdx === 0;
              const isNestedGroup = group.isNested;

              return (
                <React.Fragment key={group.id}>
                  {/* Connector between groups */}
                  {gIdx > 0 && (
                    <div className="flex items-center justify-center my-3">
                      <div className="inline-flex rounded-[2px] overflow-hidden select-none border border-[#DDD8CF]/80 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleSetGroupConnector(gIdx, 'AND')}
                          className={`min-w-[65px] py-1.5 px-4 text-[12px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                            group.connector === 'AND'
                              ? 'bg-[#FCE5DC] text-[#D06738]'
                              : 'bg-[#E3DFD7] text-[#748393] hover:bg-[#DDD8CE]'
                          }`}
                        >
                          AND
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetGroupConnector(gIdx, 'OR')}
                          className={`min-w-[65px] py-1.5 px-4 text-[12px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                            group.connector === 'OR'
                              ? 'bg-[#FCE5DC] text-[#D06738]'
                              : 'bg-[#E3DFD7] text-[#748393] hover:bg-[#DDD8CE]'
                          }`}
                        >
                          OR
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Group Box: Using the clean solid box style from Image 1 for both primary and nested groups */}
                  <div
                    onClick={() => {
                      if (!isCountClicked) {
                        setActiveGroupId(group.id);
                      }
                    }}
                    className={`relative rounded-[10px] border-2 bg-white p-5 space-y-3.5 shadow-xs transition-all ${
                      !isCountClicked && hasNested && activeGroupId === group.id
                        ? 'border-[#FF5C35] ring-2 ring-[#FF5C35]/15'
                        : 'border-[#D5D0C7]'
                    }`}
                  >
                    {/* Header when hasNested is true */}
                    {hasNested && (
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE5DC]">
                        <div className="flex items-center gap-2">
                          <span className="text-[17px] font-black font-mono leading-none px-2 py-0.5 rounded-[4px] select-none text-[#FF5C35] bg-[#FF5C35]/10">
                            [
                          </span>
                          <span className="text-[13px] font-bold tracking-wide uppercase text-[#1A1816]">
                            {isNestedGroup
                              ? ruleGroups.filter((g) => g.isNested).length > 1
                                ? `Nested Filter ${gIdx}`
                                : 'Nested Filter'
                              : 'Rule Group 1'}
                          </span>
                          <span className="text-[17px] font-black font-mono leading-none px-2 py-0.5 rounded-[4px] select-none text-[#FF5C35] bg-[#FF5C35]/10">
                            ]
                          </span>
                          {!isCountClicked && activeGroupId === group.id && (
                            <span className="text-[10px] font-bold text-[#FF5C35] bg-[#FF5C35]/15 px-2 py-0.5 rounded-[4px] tracking-wider uppercase select-none ml-1">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRuleToGroup(group.id);
                            }}
                            className="text-[#FF5C35] hover:text-[#E04823] font-medium text-[12px] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Property</span>
                          </button>
                          {isNestedGroup && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveGroup(group.id);
                              }}
                              className="text-[#807A70] hover:text-[#DC2626] p-1 rounded-[4px] hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove nested filter"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rules inside this group */}
                    {group.rules.map((rule, idx) => (
                      <React.Fragment key={rule.id}>
                        {/* Connector between rules inside the same group */}
                        {idx > 0 && (
                          <div className="flex items-center justify-center my-2.5">
                            <div className="inline-flex rounded-[2px] overflow-hidden select-none border border-[#DDD8CF]/80 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleSetConnector(group.id, idx, 'AND')}
                                className={`min-w-[60px] py-1 px-3 text-[11.5px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                                  rule.connector === 'AND'
                                    ? 'bg-[#FCE5DC] text-[#D06738]'
                                    : 'bg-[#E3DFD7] text-[#748393] hover:bg-[#DDD8CE]'
                                }`}
                              >
                                AND
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetConnector(group.id, idx, 'OR')}
                                className={`min-w-[60px] py-1 px-3 text-[11.5px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                                  rule.connector === 'OR'
                                    ? 'bg-[#FCE5DC] text-[#D06738]'
                                    : 'bg-[#E3DFD7] text-[#748393] hover:bg-[#DDD8CE]'
                                }`}
                              >
                                OR
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Filter Row: Searchable Property, Dynamic Operator, and Values matching Image 2 */}
                        <div
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center relative"
                          style={{ zIndex: 60 - idx * 2 }}
                        >
                          {/* Where Property (Box 1) */}
                          <div className="md:col-span-3">
                            <div className="h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] flex items-center text-[13px] font-normal text-[#1A1816]">
                              Where Property
                            </div>
                          </div>

                          {/* Select Property dropdown (Box 2) - Searchable, matching Image 2 */}
                          <div className="md:col-span-4 relative">
                            {(() => {
                              const propConfig = getSuppressionProperty(rule.property);
                              return (
                                <CustomConfigDropdown
                                  value={propConfig.id}
                                  onChange={(val) => handlePropertyChange(group.id, idx, val)}
                                  options={SUPPRESSION_PROPERTIES.map((p) => ({
                                    value: p.id,
                                    label: p.name,
                                  }))}
                                  placeholder="Select Property"
                                  searchPlaceholder="Search property..."
                                  withSearch={true}
                                />
                              );
                            })()}
                          </div>

                          {/* Operator dropdown (Box 3) - Theme matching Image 2, dynamic based on property */}
                          <div className="md:col-span-2 relative">
                            {(() => {
                              const propConfig = getSuppressionProperty(rule.property);
                              return (
                                <CustomConfigDropdown
                                  value={rule.operator}
                                  onChange={(val) => handleOperatorChange(group.id, idx, val)}
                                  options={propConfig.operators.map((op) => ({
                                    value: op,
                                    label: op,
                                  }))}
                                  placeholder="Select Operator"
                                  withSearch={false}
                                />
                              );
                            })()}
                          </div>

                          {/* Attributes Input / Select (Box 4) */}
                          <div className="md:col-span-3 relative flex items-center gap-2">
                            <div className="relative flex-1">
                              {idx === 0 && isFirstGroup && !hasNested && (
                                <span className="absolute -top-[19px] left-1 text-[11px] font-medium text-[#706B62] pointer-events-none z-10">
                                  Attributes
                                </span>
                              )}
                              {(() => {
                                const propConfig = getSuppressionProperty(rule.property);

                                // Condition 1: Operator is "is empty"
                                if (rule.operator === 'is empty') {
                                  return (
                                    <div className="h-[42px] px-3.5 bg-[#FAF9F7] border border-[#D5D0C7] rounded-[8px] flex items-center justify-between text-[13px] text-[#807A70] select-none">
                                      <span className="italic">Blank / Empty</span>
                                      <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#EAE6DF] text-[#59544D] px-2 py-0.5 rounded-[4px] not-italic">
                                        Auto
                                      </span>
                                    </div>
                                  );
                                }

                                // Condition 2: Decile Tagging with "is between" range operator
                                if (propConfig.type === 'decile' && rule.operator === 'is between') {
                                  const parts = (rule.value || '1 - 5')
                                    .split(/[-to]/)
                                    .map((s) => s.trim());
                                  const fromVal = parts[0] || '1';
                                  const toVal = parts[1] || '5';

                                  return (
                                    <div className="flex items-center gap-1.5 h-[42px]">
                                      <div className="relative flex-1">
                                        <select
                                          value={fromVal}
                                          onChange={(e) =>
                                            handleRangeChange(group.id, idx, e.target.value, toVal)
                                          }
                                          className="w-full h-[42px] pl-2.5 pr-6 bg-white border border-[#D5D0C7] rounded-[8px] text-[12.5px] font-medium text-[#1A1816] outline-none appearance-none cursor-pointer focus:border-[#FF5C35]"
                                        >
                                          {propConfig.allowedValues.map((v) => (
                                            <option key={v} value={v}>
                                              From {v}
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-[#706B62] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      </div>

                                      <span className="text-[#807A70] text-[11.5px] font-semibold shrink-0">
                                        to
                                      </span>

                                      <div className="relative flex-1">
                                        <select
                                          value={toVal}
                                          onChange={(e) =>
                                            handleRangeChange(group.id, idx, fromVal, e.target.value)
                                          }
                                          className="w-full h-[42px] pl-2.5 pr-6 bg-white border border-[#D5D0C7] rounded-[8px] text-[12.5px] font-medium text-[#1A1816] outline-none appearance-none cursor-pointer focus:border-[#FF5C35]"
                                        >
                                          {propConfig.allowedValues.map((v) => (
                                            <option key={v} value={v}>
                                              To {v}
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-[#706B62] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      </div>
                                    </div>
                                  );
                                }

                                // Condition 3: Allowed values dropdown with theme matching Image 2
                                if (propConfig.allowedValues && propConfig.allowedValues.length > 0) {
                                  return (
                                    <CustomConfigDropdown
                                      value={rule.value}
                                      onChange={(val) => handleValueChange(group.id, idx, val)}
                                      options={propConfig.allowedValues.map((val) => ({
                                        value: val,
                                        label: val,
                                      }))}
                                      placeholder="Select Value"
                                      withSearch={propConfig.allowedValues.length > 5}
                                      searchPlaceholder="Search value..."
                                    />
                                  );
                                }

                                return (
                                  <input
                                    type="text"
                                    value={rule.value}
                                    onChange={(e) => handleValueChange(group.id, idx, e.target.value)}
                                    placeholder="Enter value"
                                    className="w-full h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] text-[13px] text-[#1A1816] outline-none focus:border-[#FF5C35]"
                                  />
                                );
                              })()}
                            </div>
                            {group.rules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRuleFromGroup(group.id, idx)}
                                className="text-[#807A70] hover:text-[#DC2626] p-1.5 rounded-[4px] hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                title="Delete rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Action buttons: + Property, + Nested Filter, Show Count */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleAddProperty}
                  className="text-[#FF5C35] hover:text-[#E04823] font-medium text-[13px] cursor-pointer"
                >
                  + Property
                </button>
                <button
                  type="button"
                  onClick={handleAddNestedFilter}
                  className="text-[#FF5C35] hover:text-[#E04823] font-medium text-[13px] cursor-pointer"
                >
                  + Nested Filter
                </button>
              </div>

              <button
                type="button"
                onClick={handleShowCount}
                className="px-5 py-2 rounded-[6px] bg-[#E5DFD5] hover:bg-[#DDD8D0] text-[#554F47] font-medium text-[12.5px] transition-colors cursor-pointer"
              >
                Show Count
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom suppression Group */}
        {activeTab === 'Custom supression Group' && (
          <div className="bg-[#FAF8F5]/80 rounded-[10px] border border-[#E8E3DA] p-6 space-y-4 shadow-2xs">
            {customGroups.map((grp, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className="flex items-center justify-center my-3">
                    <div className="inline-flex rounded-[2px] overflow-hidden select-none border border-[#DDD8CF]/80 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setGroupConnector('AND')}
                        className={`min-w-[65px] py-1.5 px-4 text-[12px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                          groupConnector === 'AND'
                            ? 'bg-[#FCE5DC] text-[#D06738]'
                            : 'bg-[#E3DFD7] text-[#748393] hover:bg-[#DDD8CE]'
                        }`}
                      >
                        AND
                      </button>
                      <button
                        type="button"
                        onClick={() => setGroupConnector('OR')}
                        className={`min-w-[65px] py-1.5 px-4 text-[12px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                          groupConnector === 'OR'
                            ? 'bg-[#FCE5DC] text-[#D06738]'
                            : 'bg-[#E3DFD7] text-[#748393] hover:bg-[#DDD8CE]'
                        }`}
                      >
                        OR
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4">
                    <div className="h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] flex items-center text-[13px] font-medium text-[#1A1816]">
                      Select Supression Group
                    </div>
                  </div>
                  <div className="md:col-span-7 relative">
                    <select
                      value={grp}
                      onChange={(e) => {
                        const next = [...customGroups];
                        next[idx] = e.target.value;
                        setCustomGroups(next);
                      }}
                      className="w-full h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] text-[13px] text-[#1A1816] outline-none appearance-none cursor-pointer pr-9 focus:border-[#1A1816]"
                    >
                      {CUSTOM_SUPPRESSION_GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#706B62] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="md:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomGroup(idx)}
                      className="p-2 text-[#807A70] hover:text-[#DC2626] transition-colors"
                      title="Remove group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={handleAddGroup}
                className="text-[#FF5C35] hover:text-[#E04823] font-medium text-[13px] cursor-pointer"
              >
                + Suppression Group
              </button>

              <button
                type="button"
                onClick={handleShowCount}
                className="px-5 py-2 rounded-[6px] bg-[#E5DFD5] hover:bg-[#DDD8D0] text-[#554F47] font-medium text-[12.5px] transition-colors cursor-pointer"
              >
                Show Count
              </button>
            </div>
          </div>
        )}

        {/* ── Audience Impact Counts & Apply Suppression (Second Box matching image) ── */}
        <div className="bg-[#FAF8F5]/80 rounded-[10px] border border-[#E8E3DA] p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center gap-8">
            {/* Supression count */}
            <div className="w-[200px] space-y-1.5">
              <label className="text-[12.5px] font-bold text-[#1A1816] block">
                Supression count
              </label>
              <div className="h-[46px] bg-white border border-[#D5D0C7] rounded-[8px] flex items-center justify-center text-[18px] font-bold text-[#1A1816]">
                {suppressedCount}
              </div>
            </div>

            {/* Final Audience Count */}
            <div className="w-[280px] space-y-1.5">
              <label className="text-[12.5px] font-bold text-[#1A1816] block">
                Final Audience Count
              </label>
              <div className="h-[46px] bg-white border border-[#D5D0C7] rounded-[8px] flex items-center justify-center text-[18px] font-bold text-[#FF5C35] font-data">
                {finalAudience.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Apply Suppresion Button below the box */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleApplySuppression}
            className="px-5 py-2.5 rounded-[6px] bg-[#E5DFD5] hover:bg-[#DDD8D0] text-[#554F47] font-medium text-[12.5px] transition-colors cursor-pointer"
          >
            Apply Suppresion
          </button>
        </div>
      </div>

      {/* ── Bottom Navigation ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 pb-12 border-t border-[#E2DDD5]">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] hover:text-[#1A1816] transition-colors cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleSaveAndNext}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] hover:text-[#1A1816] transition-colors cursor-pointer"
        >
          Save &amp; Next
        </button>
      </div>
    </div>
  );
};
