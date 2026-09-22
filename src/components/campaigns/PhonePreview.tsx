import React from 'react';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { TEMPLATES_DATA, getVendorShortenedUrl } from '../../data/campaignMockData';

interface PhonePreviewProps {
  channel?: 'RCS' | 'SMS' | 'WhatsApp';
  sender?: string;
  headerLink?: string;
  ctaLink?: string;
  variable?: string;
  targetUrl?: string;
  shortenedUrl?: string;
  vendor?: string;
  templateName?: string;
  previewBody?: string;
  previewHeading?: string;
  previewCtaText?: string;
  hasHeaderLink?: boolean;
  hasCtaLink?: boolean;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  channel = 'RCS',
  sender = 'B4nuadchf',
  headerLink = 'https://www.imagebajaj.png',
  ctaLink = 'https://www.bajajmarkets.com',
  variable = 'There',
  targetUrl,
  shortenedUrl,
  vendor,
  templateName = 'Personalization_8march',
  previewBody,
  previewHeading,
  previewCtaText,
  hasHeaderLink,
  hasCtaLink,
}) => {
  const matchedTemplate = TEMPLATES_DATA.find(
    (t) => t.name === templateName || t.id === templateName
  );

  const isSMS = channel === 'SMS';
  const hasHeader = hasHeaderLink !== undefined ? hasHeaderLink : (matchedTemplate ? matchedTemplate.hasHeaderLink : !isSMS);
  const hasCta = hasCtaLink !== undefined ? hasCtaLink : (matchedTemplate ? matchedTemplate.hasCtaLink : !isSMS);

  const heading = previewHeading || matchedTemplate?.previewHeading || 'A Pair for Every Plan 👟';
  const ctaText = previewCtaText || matchedTemplate?.previewCtaText || 'Shop Now';

  // Compute shortened URL for SMS links if needed
  const effectiveShortUrl =
    shortenedUrl ||
    (vendor && (ctaLink || targetUrl)
      ? getVendorShortenedUrl(vendor, ctaLink || targetUrl || '')
      : ctaLink || targetUrl || 'https://bjm.in/app');

  // Construct message content
  let bodyText = previewBody || matchedTemplate?.previewBody || '';
  if (!bodyText) {
    if (isSMS) {
      bodyText = `Hi ${variable || 'Customer'}, your pre-approved loan of up to ₹5,00,000 is ready for instant disbursal with zero paperwork. Apply now at ${effectiveShortUrl} to claim your special interest rate before the offer expires. T&Cs apply.`;
    } else {
      bodyText = `Hi ${variable || 'There'}, coffee runs, dinner dates, city strolls or spontaneous plans. Discover Flats, sneakers & more from Call It Spring at ₹1,999. Plus, enjoy an extra 5% off with HDFC Cards. Shop before it's gone. T&Cs apply.`;
    }
  } else {
    bodyText = bodyText.replace(/\{\{name\}\}/g, variable || (isSMS ? 'Customer' : 'There'));
    bodyText = bodyText.replace(/\{\{link\}\}/g, effectiveShortUrl);
  }

  // Calculate characters in message
  const charCount = bodyText.length;
  // Multi-part SMS split count (160 characters for single, 153 for concatenated segments)
  const communicationsCount = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  return (
    <div className="flex flex-col items-center">
      {/* Smartphone frame */}
      <div className="w-[280px] sm:w-[295px] h-[475px] bg-white rounded-[32px] border-[6px] border-[#2D2A26] shadow-xl overflow-hidden flex flex-col relative font-body select-none">
        {/* Top Speaker / Camera Notch */}
        <div className="h-5 bg-[#2D2A26] flex items-center justify-center relative">
          <div className="w-12 h-2.5 bg-[#1A1816] rounded-full" />
        </div>

        {/* Message App Header */}
        <div className="px-3.5 py-2.5 bg-[#F9F7F4] border-b border-[#E8E4DD] flex items-center gap-2.5">
          <button type="button" className="text-[#807A70] hover:text-[#1A1816]">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-[#1A1816] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
            {channel === 'WhatsApp' ? 'WA' : channel === 'RCS' ? 'RC' : 'SM'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-[#1A1816] truncate">
                {sender || 'Bajaj Markets'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            </div>
            <span className="text-[10px] text-[#807A70] truncate block">
              {channel} Verified Sender
            </span>
          </div>
        </div>

        {/* Message Thread Content */}
        <div className="flex-1 bg-[#ECE5DD]/40 p-3 overflow-y-auto space-y-2.5">
          {/* Timestamp chip */}
          <div className="flex justify-center">
            <span className="text-[9.5px] font-medium text-[#8C857B] bg-white/80 px-2 py-0.5 rounded-full shadow-2xs">
              Today • 10:45 AM
            </span>
          </div>

          {/* Message Thread Content */}
          {isSMS ? (
            /* Native SMS Message Bubble (SMS has no header banner or CTA button) */
            <div className="space-y-1.5 max-w-[250px] mr-auto animate-in fade-in duration-200">
              <div className="bg-white rounded-[16px] rounded-tl-[3px] p-3 border border-[#E2DDD5] shadow-2xs text-[11px] text-[#1A1816] leading-relaxed">
                <p className="whitespace-pre-wrap">{bodyText}</p>
              </div>
              <div className="text-[9px] text-[#8C857B] px-1 font-medium flex items-center justify-between">
                <span>SMS</span>
                <span>10:45 AM</span>
              </div>
            </div>
          ) : (
            /* Rich Card Message for RCS & WhatsApp */
            <div className="bg-white rounded-[12px] overflow-hidden border border-[#E2DDD5] shadow-xs max-w-[250px] mx-auto animate-in fade-in duration-200">
              {/* Header Image Area (only if template supports header and link is provided) */}
              {hasHeader && headerLink ? (
                <div className="relative h-28 bg-gradient-to-br from-[#2D2A26] to-[#1A1816] flex items-center justify-center text-white overflow-hidden">
                  <div className="w-full h-full relative flex items-center justify-center bg-[#1F1C18]">
                    <div className="absolute inset-0 bg-cover bg-center opacity-80" />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[9px] font-bold font-data">
                      ₹ 1,999/-
                    </div>
                    <div className="text-center z-10 px-2">
                      <span className="text-[9px] font-bold tracking-widest text-[#D5D0C7] uppercase block">
                        CALL IT SPRING
                      </span>
                      <span className="text-[13px] font-bold text-white leading-tight block mt-0.5">
                        1999/-
                      </span>
                    </div>
                  </div>
                </div>
              ) : hasHeader ? (
                <div className="relative h-24 bg-gradient-to-br from-[#2D2A26] to-[#1A1816] flex items-center justify-center text-white overflow-hidden">
                  <div className="text-center p-3">
                    <span className="text-[11px] font-semibold text-[#D5D0C7]">
                      Header Banner
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Card Body */}
              <div className="p-3 space-y-1.5 text-[11px] text-[#4A453E] leading-relaxed">
                {heading && (
                  <div className="font-bold text-[#1A1816] text-[12px] flex items-center justify-between">
                    <span>{heading}</span>
                  </div>
                )}
                <p className="text-[#555047] text-[10.5px]">
                  {bodyText}
                </p>
              </div>

              {/* Card Action Link / CTA (only if template supports CTA) */}
              {hasCta && (
                <div className="border-t border-[#F0ECE4] bg-[#FAF8F5] p-2 text-center">
                  <a
                    href={ctaLink || '#'}
                    onClick={(e) => e.preventDefault()}
                    className="w-full py-1.5 px-3 rounded-[6px] bg-[#FF5C35] hover:bg-[#E04823] text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <span>{ctaText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom indicator */}
        <div className="h-4 bg-[#2D2A26] flex items-center justify-center">
          <div className="w-20 h-1 bg-[#807A70] rounded-full" />
        </div>
      </div>

      {/* ── Character Count & SMS Split Notice (Replacing Image 1 line) ── */}
      <div className="flex flex-col items-center text-center mt-3 space-y-1 max-w-[280px] sm:max-w-[300px]">
        <div className="text-[12.5px] font-medium text-[#555047]">
          Characters used: <span className="font-bold text-[#1A1816] font-data">{charCount}</span>
        </div>

        {isSMS && charCount > 160 && (
          <p className="text-[12px] font-medium text-[#EA580C] leading-snug">
            This message exceeds 160 characters and will be delivered across {communicationsCount} communications.
          </p>
        )}
      </div>
    </div>
  );
};
