import React, { useState } from 'react';
import { CampaignRecord } from '../../types';
import { PhonePreview } from './PhonePreview';
import { Rocket, RotateCw, CheckCircle2 } from 'lucide-react';
import { getTodayDecisionDate, TEMPLATES_DATA, getVendorShortenedUrl } from '../../data/campaignMockData';

interface ReviewLaunchScreenProps {
  campaign: CampaignRecord;
  onBack: () => void;
  onLaunchSuccess: (launchedCampaign: CampaignRecord) => void;
  onRefresh: () => void;
}

export const ReviewLaunchScreen: React.FC<ReviewLaunchScreenProps> = ({
  campaign,
  onBack,
  onLaunchSuccess,
  onRefresh,
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchedSuccess, setLaunchedSuccess] = useState(false);

  const config = campaign.config;
  const beforeCount = config?.audienceBeforeSuppression || campaign.audienceCount || 30000;
  const suppressedCount = config?.suppressedUserCount !== undefined ? config.suppressedUserCount : 3;
  const afterCount =
    config?.audienceAfterSuppression !== undefined && config.audienceAfterSuppression < beforeCount
      ? config.audienceAfterSuppression
      : Math.max(0, beforeCount - suppressedCount);

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setLaunchedSuccess(true);
      const updated: CampaignRecord = {
        ...campaign,
        status: 'Launched',
        assignment: 'Assigned',
        audienceCount: afterCount,
        launchDate: campaign.launchDate || getTodayDecisionDate(0),
        config: {
          ...campaign.config,
          audienceBeforeSuppression: beforeCount,
          suppressedUserCount: suppressedCount,
          audienceAfterSuppression: afterCount,
        },
      };
      setTimeout(() => {
        onLaunchSuccess(updated);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="space-y-6 font-body">
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
          onClick={onRefresh}
          className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium text-[#FF5C35] border border-[#FF5C35] bg-transparent hover:bg-[#FF5C35]/5 active:bg-[#FF5C35]/10 transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* ── Subtitle ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#FF5C35]">Review &amp; Confirm</h2>
      </div>

      {/* ── Campaign Header Bar ────────────────────────────────────────────── */}
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
              Decision Date
            </span>
            <span className="font-data text-[#4A453E] block mt-0.5">
              {campaign.decisionDate}
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
        </div>
      </div>

      {/* ── Creative (Left) vs Audience (Right) ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Creative Details + Preview */}
        <div className="lg:col-span-7 bg-white rounded-[10px] border border-[#E2DDD5] p-5 shadow-xs space-y-4">
          <h3 className="text-[15px] font-bold text-[#FF5C35] mb-2">Creative</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="space-y-3.5 text-[13px]">
              <div>
                <span className="text-[13px] text-[#706B62] block mb-0.5">Channel</span>
                <span className="text-[14px] font-semibold text-[#1A1816] block">{campaign.channel}</span>
              </div>

              <div>
                <span className="text-[13px] text-[#706B62] block mb-0.5">Theme</span>
                <span className="text-[14px] font-semibold text-[#1A1816] block">{campaign.theme}</span>
              </div>

              <div>
                <span className="text-[13px] text-[#706B62] block mb-0.5">Vendor</span>
                <span className="text-[14px] font-semibold text-[#1A1816] block">{config?.vendor || 'Karix'}</span>
              </div>

              <div>
                <span className="text-[13px] text-[#706B62] block mb-0.5">Sender</span>
                <span className="text-[14px] font-semibold text-[#1A1816] block font-mono">{config?.sender || 'BFDLMT'}</span>
              </div>

              <div>
                <span className="text-[13px] text-[#706B62] block mb-0.5">template Name</span>
                <span className="text-[14px] font-semibold text-[#1A1816] block">{config?.template || 'Personalization_8march'}</span>
              </div>

              {config?.headerLink ? (
                <div>
                  <span className="text-[13px] text-[#706B62] block mb-0.5">header Link</span>
                  <a
                    href={config.headerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-semibold text-[#FF5C35] hover:underline truncate block max-w-[240px]"
                    title={config?.headerLink}
                  >
                    {config?.headerLink}
                  </a>
                </div>
              ) : null}

              <div>
                <span className="text-[13px] text-[#706B62] block mb-0.5">Variable</span>
                <span className="text-[14px] font-semibold text-[#1A1816] block">{config?.variable || 'There'}</span>
              </div>

              <div>
                <span className="text-[13px] text-[#706B62] block mb-0.5">CTA Link</span>
                <a
                  href={config?.ctaLink || 'https://www.bajajmarkets.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-[#FF5C35] hover:underline truncate block max-w-[240px]"
                  title={config?.ctaLink}
                >
                  {config?.ctaLink || 'https://www.bajajmarkets.com'}
                </a>
              </div>
            </div>

            <div className="flex justify-center">
              <PhonePreview
                channel={campaign.channel}
                sender={config?.sender}
                vendor={config?.vendor}
                headerLink={config?.headerLink}
                ctaLink={config?.ctaLink}
                variable={config?.variable}
                targetUrl={config?.ctaLink}
                shortenedUrl={config?.ctaLink}
                templateName={config?.template}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Audience & Suppression Statistics */}
        <div className="lg:col-span-5 bg-white rounded-[10px] border border-[#E2DDD5] p-5 shadow-xs space-y-5">
          <h3 className="text-[15px] font-bold text-[#FF5C35]">Audience</h3>

          <div className="space-y-4 text-[13px]">
            <div className="bg-[#FAF8F5] p-3 rounded-[8px] border border-[#EAE5DC]">
              <span className="text-[12px] text-[#807A70] font-semibold block">
                Audience Count Before Suppression
              </span>
              <span className="text-[20px] font-bold font-data text-[#1A1816] block mt-0.5">
                {beforeCount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-[8px] border border-[#EAE5DC]">
              <span className="text-[12px] text-[#807A70] font-semibold block">
                Suppression User Count
              </span>
              <span className="text-[20px] font-bold font-data text-[#1A1816] block mt-0.5">
                {suppressedCount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-[8px] border border-[#EAE5DC]">
              <span className="text-[12px] text-[#807A70] font-semibold block">
                Audience Count After Suppression
              </span>
              <span className="text-[20px] font-bold font-data text-[#FF5C35] block mt-0.5">
                {afterCount.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[12.5px] font-bold text-[#1A1816] block mb-2">
                Suppression Logic
              </span>
              <div className="bg-[#FAF8F5] p-3.5 rounded-[8px] border border-[#E2DDD5] space-y-1.5 text-[12px] font-mono text-[#4A453E]">
                {config?.suppressionRules && config.suppressionRules.length > 0 ? (
                  config.suppressionRules.map((r, i) => (
                    <div key={r.id}>
                      {i > 0 && <span className="text-[#FF5C35] font-bold block my-0.5">{r.connector.toLowerCase()}</span>}
                      <span>
                        {r.property} {r.operator} &ldquo;{r.value}&rdquo;
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <p>mcf flag equal to &ldquo;1&rdquo;</p>
                    <p className="text-[#FF5C35] font-bold">or</p>
                    <p>bfl_decilee flag equal to &ldquo;model A&rdquo;</p>
                    <p className="text-[#FF5C35] font-bold">or</p>
                    <p>bfl_tagging greater than equal to &ldquo;50&rdquo;</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-[8px] border border-[#EAE5DC]">
              <span className="text-[12px] text-[#807A70] font-semibold block">
                Suppress User Count
              </span>
              <span className="text-[18px] font-bold font-data text-[#EA580C] block mt-0.5">
                {suppressedCount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Actions ──────────────────────────────────────────────────── */}
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
          onClick={handleLaunch}
          disabled={isLaunching || launchedSuccess}
          className="px-7 py-2.5 rounded-[8px] bg-[#E8E4DD] hover:bg-[#D5D0C7] text-[#1A1816] font-semibold text-[13px] shadow-2xs transition-all cursor-pointer flex items-center gap-2"
        >
          {isLaunching ? (
            <span>Scheduling...</span>
          ) : launchedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#166534]" />
              <span>Launched!</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 text-[#FF5C35]" />
              <span>Launch</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
