import React, { useState, useEffect } from 'react';
import { CampaignRecord } from '../../types';
import {
  CAMPAIGN_VENDORS,
  SENDERS_BY_VENDOR_CHANNEL,
  TEMPLATES_DATA,
  CampaignTemplate,
  getVendorShortenedUrl,
} from '../../data/campaignMockData';
import { PhonePreview } from './PhonePreview';
import { CustomConfigDropdown } from './CustomConfigDropdown';
import { Lightbulb, Send, CheckCircle2, Save } from 'lucide-react';

interface TemplateConfigurationProps {
  campaign: CampaignRecord;
  onBack: () => void;
  onSaveDraft?: (updatedCampaign: CampaignRecord) => void;
  onSaveAndNext?: (updatedCampaign: CampaignRecord) => void;
  onNext?: (updatedCampaign: CampaignRecord) => void;
  onShowToast?: (msg: string) => void;
  onRefresh?: () => void;
}

export const TemplateConfiguration: React.FC<TemplateConfigurationProps> = ({
  campaign,
  onBack,
  onSaveDraft,
  onSaveAndNext,
  onNext,
  onShowToast,
  onRefresh,
}) => {
  // Available Templates based on Channel
  const availableTemplates = TEMPLATES_DATA.filter((t) => t.channel === campaign.channel);
  const fallbackTemplates = availableTemplates.length > 0 ? availableTemplates : TEMPLATES_DATA;
  const defaultRecommendedTpl = fallbackTemplates.find((t) => t.isRecommended) || fallbackTemplates[0];

  // Config state initialized from campaign.config
  const [vendor, setVendor] = useState(campaign.config?.vendor || 'Karix');

  // Available Senders based on Vendor and Channel
  const availableSenders = SENDERS_BY_VENDOR_CHANNEL[vendor]?.[campaign.channel] || [
    'Default_Sender',
  ];

  const [sender, setSender] = useState(
    campaign.config?.sender && availableSenders.includes(campaign.config.sender)
      ? campaign.config.sender
      : availableSenders[0] || ''
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    campaign.config?.template && fallbackTemplates.some((t) => t.name === campaign.config?.template || t.id === campaign.config?.template)
      ? campaign.config.template
      : defaultRecommendedTpl?.name || 'Personalization_8march'
  );

  // Selected template object
  const currentTemplate: CampaignTemplate | undefined =
    fallbackTemplates.find((t) => t.name === selectedTemplateId || t.id === selectedTemplateId) ||
    fallbackTemplates[0];

  const [headerLink, setHeaderLink] = useState(
    campaign.config?.headerLink || currentTemplate?.defaultHeaderLink || ''
  );
  const [ctaLink, setCtaLink] = useState(
    campaign.config?.ctaLink || currentTemplate?.defaultCtaLink || 'https://www.bajajmarkets.com'
  );
  const [variable, setVariable] = useState(
    campaign.config?.variable || currentTemplate?.defaultVariable || 'There'
  );

  const shortenedUrl = getVendorShortenedUrl(vendor, ctaLink);

  const [testNumber, setTestNumber] = useState(campaign.config?.testMobileNumber || '');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  // When vendor changes, reset sender and template if not matching
  const handleVendorChange = (newVendor: string) => {
    setVendor(newVendor);
    const newSenders = SENDERS_BY_VENDOR_CHANNEL[newVendor]?.[campaign.channel] || [];
    const nextSender = newSenders[0] || '';
    setSender(nextSender);
    onShowToast?.(`Vendor updated to ${newVendor}`);
  };

  const handleSenderChange = (newSender: string) => {
    setSender(newSender);
    onShowToast?.(`Sender updated to ${newSender}`);
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplateId(templateName);
    const tpl = fallbackTemplates.find((t) => t.name === templateName || t.id === templateName);
    if (tpl) {
      if (tpl.defaultHeaderLink !== undefined) setHeaderLink(tpl.defaultHeaderLink);
      if (tpl.defaultCtaLink !== undefined) setCtaLink(tpl.defaultCtaLink);
      if (tpl.defaultVariable !== undefined) setVariable(tpl.defaultVariable);
    }
    onShowToast?.(`Template updated to ${tpl?.name || templateName}`);
  };

  // Set initial sender if empty or not in availableSenders
  useEffect(() => {
    if ((!sender || !availableSenders.includes(sender)) && availableSenders.length > 0) {
      setSender(availableSenders[0]);
    }
  }, [availableSenders, sender]);

  const handleTestSend = () => {
    if (!testNumber.trim()) {
      onShowToast?.('Please enter a valid Indian mobile number with +91');
      return;
    }
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestSentSuccess(true);
      onShowToast?.(`Test campaign successfully dispatched to ${testNumber}`);
      setTimeout(() => setTestSentSuccess(false), 4000);
    }, 1200);
  };

  const buildUpdatedCampaign = (): CampaignRecord => {
    const isSMS = campaign.channel === 'SMS';
    return {
      ...campaign,
      assignment: 'Assigned',
      config: {
        ...campaign.config,
        vendor,
        sender,
        template: currentTemplate?.name || selectedTemplateId,
        headerLink: isSMS || !currentTemplate?.hasHeaderLink ? '' : headerLink,
        ctaLink: isSMS ? shortenedUrl : (!currentTemplate?.hasCtaLink ? '' : ctaLink),
        variable,
        testMobileNumber: testNumber,
      },
    };
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSaveDraftClick = () => {
    setIsRefreshing(true);
    const updated = buildUpdatedCampaign();
    onSaveDraft?.(updated);
    onShowToast?.('Template configuration saved as draft');
    onRefresh?.();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleSaveNextClick = () => {
    if (!vendor) {
      onShowToast?.('Please select a Vendor before proceeding.');
      return;
    }
    if (!sender) {
      onShowToast?.('Please select a Sender ID before proceeding.');
      return;
    }
    if (!selectedTemplateId) {
      onShowToast?.('Please select a Template before proceeding.');
      return;
    }
    const isSMS = campaign.channel === 'SMS';
    if (isSMS && !ctaLink?.trim()) {
      onShowToast?.('Please enter a CTA Link before proceeding.');
      return;
    }
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
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#1A1816]">
          <span className="w-4 h-4 rounded-full border-2 border-[#1A1816] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1816]" />
          </span>
          <span>Template Configuration</span>
        </div>
        <div className="flex-1 h-px bg-[#E2DDD5]" />
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#9E988E]">
          <span className="w-4 h-4 rounded-full border-2 border-[#D5D0C7]" />
          <span>Suppression</span>
        </div>
      </div>

      {/* ── Main Two-Column Workspace ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Configuration Forms (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[10px] border border-[#E2DDD5] p-6 shadow-xs flex flex-col justify-between h-full space-y-4 lg:space-y-0">
          {/* Select Vendor */}
          <CustomConfigDropdown
            label="Select Vendor"
            value={vendor}
            onChange={handleVendorChange}
            options={CAMPAIGN_VENDORS.map((v) => ({ value: v, label: v }))}
            searchPlaceholder="Search vendor..."
          />

          {/* Select Sender */}
          <CustomConfigDropdown
            label="Select Sender"
            value={sender}
            onChange={handleSenderChange}
            options={availableSenders.map((s) => ({ value: s, label: s }))}
            searchPlaceholder="Search sender ID..."
          />

          {/* Select Template */}
          <CustomConfigDropdown
            label="Select Template"
            badge={
              currentTemplate?.isRecommended ? (
                <div className="flex items-center gap-1 text-[11px] text-[#EA580C] font-semibold bg-[#FFF7ED] px-2 py-0.5 rounded-[4px] border border-[#FFEDD5]">
                  <Lightbulb className="w-3 h-3 text-[#EA580C]" />
                  <span>Recommended</span>
                </div>
              ) : undefined
            }
            value={currentTemplate?.name || selectedTemplateId}
            onChange={handleTemplateChange}
            options={fallbackTemplates.map((t) => ({
              value: t.name,
              label: t.name,
              isRecommended: t.isRecommended,
            }))}
            searchPlaceholder="Search templates..."
          />

          {/* Header Link */}
          {campaign.channel !== 'SMS' && currentTemplate?.hasHeaderLink !== false && (
            <div>
              <label className="text-[13px] font-semibold text-[#1A1816] block mb-1.5">
                Header Link
              </label>
              <input
                type="text"
                value={headerLink}
                onChange={(e) => setHeaderLink(e.target.value)}
                placeholder="suggested: www.image.png"
                className="w-full h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] text-[13.5px] text-[#1A1816] outline-none hover:border-[#807A70] focus:border-[#1A1816]"
              />
            </div>
          )}

          {/* CTA Link */}
          <div>
            <label className="text-[13px] font-semibold text-[#1A1816] block mb-1.5">
              CTA Link
            </label>
            <input
              type="text"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="Suggested: www.bajajmarkets.com"
              className="w-full h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] text-[13.5px] text-[#1A1816] outline-none hover:border-[#807A70] focus:border-[#1A1816]"
            />
          </div>

          {/* Variable */}
          <div>
            <label className="text-[13px] font-semibold text-[#1A1816] block mb-1.5">
              Variable Value
            </label>
            <input
              type="text"
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              placeholder="There"
              className="w-full h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] text-[13.5px] text-[#1A1816] outline-none hover:border-[#807A70] focus:border-[#1A1816]"
            />
          </div>
        </div>

        {/* Right Column: Inline Live Phone Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          {/* Live Preview Container */}
          <div className="bg-white rounded-[10px] border border-[#E2DDD5] p-6 shadow-xs flex flex-col items-center justify-between h-full">
            <span className="text-[13px] font-semibold text-[#1A1816] self-start mb-1">
              Preview
            </span>
            <div className="my-auto py-1">
              <PhonePreview
                channel={campaign.channel}
                sender={sender}
                vendor={vendor}
                headerLink={headerLink}
                ctaLink={ctaLink}
                variable={variable}
                shortenedUrl={shortenedUrl}
                templateName={currentTemplate?.name || selectedTemplateId}
                previewHeading={currentTemplate?.previewHeading}
                previewBody={currentTemplate?.previewBody}
                previewCtaText={currentTemplate?.previewCtaText}
                hasHeaderLink={currentTemplate?.hasHeaderLink}
                hasCtaLink={currentTemplate?.hasCtaLink}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Test Campaign Box (Full Spread - matching Image 3) ───────────────── */}
      <div className="bg-white rounded-[10px] border border-[#E2DDD5] p-5 shadow-xs space-y-3">
        <span className="text-[13.5px] font-semibold text-[#1A1816] block">
          Test Campaign
        </span>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            placeholder="Enter Mobile Number with +91"
            className="flex-1 h-[42px] px-3.5 bg-white border border-[#D5D0C7] rounded-[8px] text-[13.5px] text-[#1A1816] placeholder:text-[#9E988E] outline-none hover:border-[#807A70] focus:border-[#1A1816] transition-colors"
          />
          <button
            type="button"
            onClick={handleTestSend}
            disabled={isSendingTest}
            className="h-[42px] px-6 rounded-[8px] bg-[#E8E4DD] hover:bg-[#D5D0C7] text-[#1A1816] font-medium text-[13.5px] transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            {isSendingTest ? (
              <span>Sending...</span>
            ) : testSentSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                <span>Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Bottom Action Navigation ────────────────────────────────────────── */}
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
          onClick={handleSaveNextClick}
          className="px-8 py-2 rounded-[8px] text-[13.5px] font-medium bg-[#E8E4DD] text-[#4A453E] hover:bg-[#DDD8D0] hover:text-[#1A1816] transition-colors cursor-pointer"
        >
          Save &amp; Next
        </button>
      </div>
    </div>
  );
};
