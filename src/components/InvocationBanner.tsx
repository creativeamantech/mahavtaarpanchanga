import React from "react";
import type { Language } from "../i18n";
import type { AppTheme, PanchangaResponse } from "../types";

interface InvocationBannerProps {
  lang: Language;
  theme?: AppTheme;
  data?: PanchangaResponse | null;
}

export const InvocationBanner: React.FC<InvocationBannerProps> = ({
  lang,
  theme = "parchment",
  data,
}) => {
  const isNight = theme === "nightSky";

  // Determine day's sacred shloka based on Vaara (day of week)
  const vaara = data?.vaara || "";
  let shlokaDevanagari = "ॐ गणेशाय नमः। ॐ सरस्वत्यै नमः।\nॐ गुरवे नमः। ॐ कुलदेवताभ्यो नमः।";
  let deityNote = "मङ्गलाचरणम् · Universal Mangalacharana";

  if (vaara.includes("Som") || vaara.includes("सोम")) {
    shlokaDevanagari = "ॐ नमः शिवाय। चन्द्रशेखराय नमः।\nसौभाग्यं देहि मे देवि नमस्तुभ्यं जगद्धातृ।";
    deityNote = "सोमवार आराधना · Lord Shiva & Chandra Deva";
  } else if (vaara.includes("Bhaum") || vaara.includes("Mangal") || vaara.includes("मङ्गल")) {
    shlokaDevanagari =
      "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।\nवातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये।";
    deityNote = "मङ्गलवार आराधना · Lord Hanuman & Mangala Deva";
  } else if (vaara.includes("Budh") || vaara.includes("बुध")) {
    shlokaDevanagari =
      "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा।";
    deityNote = "बुधवार आराधना · Lord Ganesha & Budha Deva";
  } else if (vaara.includes("Guru") || vaara.includes("गुरु") || vaara.includes("Brihaspati")) {
    shlokaDevanagari =
      "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः।";
    deityNote = "गुरुवार आराधना · Dakshinamurti & Guru Brihaspati";
  } else if (vaara.includes("Shukra") || vaara.includes("शुक्र")) {
    shlokaDevanagari =
      "नमस्तेस्तु महामाये श्रीपीठे सुरपूजिते।\nशङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते।";
    deityNote = "शुक्रवार आराधना · Mahalakshmi & Shukra Deva";
  } else if (vaara.includes("Shani") || vaara.includes("शनि")) {
    shlokaDevanagari =
      "नीलांजनसमाभासं रविपुत्रं यमाग्रजम्।\nछायामार्तण्डसम्भूतं तं नमामि शनैश्चरम्।";
    deityNote = "शनिवार आराधना · Lord Shanaishchara & Hanuman";
  } else if (vaara.includes("Ravi") || vaara.includes("रवि") || vaara.includes("Surya")) {
    shlokaDevanagari =
      "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्।";
    deityNote = "रविवार आराधना · Gayatri & Lord Surya Narayana";
  }

  const title = lang === "hi" ? "दैनिक मङ्गलाचरणम्" : "Today's Sacred Invocation";

  return (
    <div
      id="vedic-invocation-banner"
      className={`rounded-2xl p-3.5 sm:p-4 mb-4 flex items-center gap-3.5 sm:gap-4 shadow-sm border transition-all ${
        isNight
          ? "bg-gradient-to-r from-[#121832] to-[#20153D] border-indigo-900/60 text-white"
          : "bg-gradient-to-r from-[#1A1F5E] to-[#2C1654] border-[#2C1654]/40 text-white"
      }`}
    >
      <div className="text-3xl sm:text-4xl text-[#F0C96A] font-serif-vedic font-bold leading-none shrink-0 drop-shadow-sm">
        ॐ
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#F0A44A]">
            {title}
          </span>
          <span className="text-[10px] text-white/50 font-serif-vedic hidden sm:inline-block">
            {deityNote}
          </span>
        </div>
        <div className="font-devanagari text-xs sm:text-[13px] leading-relaxed text-[#E8E6F0] whitespace-pre-line">
          {shlokaDevanagari}
        </div>
      </div>
    </div>
  );
};
