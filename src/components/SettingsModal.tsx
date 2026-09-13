import React, { useState, useEffect } from 'react';
import { Settings, X, Check, BookmarkCheck, RotateCcw, ShieldCheck, MapPin, Sparkles, Sun, Moon } from 'lucide-react';
import type { CoordinateSelection, MonthSystem, AppTheme } from '../types';
import { type Language, translations } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayanamsa: CoordinateSelection;
  monthSystem: MonthSystem;
  currentCity: string;
  theme: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
  customCoords?: {
    lat: number;
    lon: number;
    tz: string;
    name: string;
    isDeviceLocation?: boolean;
    accuracyMeters?: number;
  } | null;
  onUpdateSettings: (
    ayanamsa: CoordinateSelection,
    monthSystem: MonthSystem,
    saveToDevice?: boolean,
    theme?: AppTheme
  ) => void;
  onResetDefaults: () => void;
  lang: Language;
}

const AYANAMSA_OPTIONS: { key: CoordinateSelection; name: string; desc: string; descHi: string; descSa: string }[] = [
  {
    key: 'citra',
    name: 'Chitra Paksha (Lahiri)',
    desc: 'Official standard adopted by the Calendar Reform Committee of Government of India.',
    descHi: 'भारत सरकार की राष्ट्रीय पंचांग सुधार समिति द्वारा स्वीकृत मानक अयनांश (लाहिड़ी)।',
    descSa: 'भारतसर्वकारस्य पञ्चाङ्गसुधारसमित्या अङ्गीकृतः चित्रपक्ष-लाहिरी-अयनांशः।',
  },
  {
    key: 'krishnamurti',
    name: 'Krishnamurti Paddhati (KP)',
    desc: 'Widely used in KP astrology system; derived by Prof. K.S. Krishnamurti.',
    descHi: 'कृष्णमूर्ति पद्धति (KP) ज्योतिष में प्रयुक्त मानक अयनांश।',
    descSa: 'कृष्णमूर्ति-पद्धत्यां बहुप्रयुक्तः अयनांशः।',
  },
  {
    key: 'raman',
    name: 'B.V. Raman',
    desc: 'Formulated by Dr. B.V. Raman, based on traditional Hindu astronomy texts.',
    descHi: 'डॉ. बी.वी. रामन द्वारा प्राचीन ग्रन्थों के अनुसार प्रतिपादित अयनांश।',
    descSa: 'डा. बी.वी. रामण-महोदयेन प्रतिपादितः पारम्परिक-अयनांशः।',
  },
  {
    key: 'tropical',
    name: 'Sayana (Tropical / Western)',
    desc: 'Western tropical zodiac (Ayanāṁśa = 0°); 0° Aries aligns with Vernal Equinox.',
    descHi: 'सायान पद्धति (पश्चिमी निरयनांश = ०°), वसन्त विषुव पर आधारित।',
    descSa: 'सायनायन-पद्धतिः (शून्य-अयनांशः), विषुवबिन्दुसंलग्नम्।',
  },
  {
    key: 'revati',
    name: 'Revati (Usha-Shashi)',
    desc: 'Zero point anchored at the star Zeta Piscium (Revatī).',
    descHi: 'रेवती तारा (Zeta Piscium) को शून्य बिन्दु मानकर गणना।',
    descSa: 'रेवती-तारकां शून्यबिन्दुं मत्वा निरयण-गणना।',
  },
  {
    key: 'pushya',
    name: 'Pushya Paksha',
    desc: 'Ancient Vedic star system referencing Delta Cancri (Puṣya).',
    descHi: 'प्राचीन वैदिक गणना जो पुष्य नक्षत्र (Delta Cancri) को आधार बनाती है।',
    descSa: 'पुष्यनक्षत्र-केन्द्रिता प्राचीनवैदिकी गणना।',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ayanamsa,
  monthSystem,
  currentCity,
  theme,
  onThemeChange,
  customCoords,
  onUpdateSettings,
  onResetDefaults,
  lang,
}) => {
  const [selectedAyanamsa, setSelectedAyanamsa] = useState<CoordinateSelection>(ayanamsa);
  const [selectedMonthSystem, setSelectedMonthSystem] = useState<MonthSystem>(monthSystem);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);
  const [saveToLocalStorage, setSaveToLocalStorage] = useState<boolean>(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  const t = translations[lang];

  useEffect(() => {
    setSelectedAyanamsa(ayanamsa);
    setSelectedMonthSystem(monthSystem);
    setSelectedTheme(theme);
    setSaveSuccessMsg(false);
  }, [ayanamsa, monthSystem, theme, isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: AppTheme) => {
    setSelectedTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const handleSave = () => {
    onUpdateSettings(selectedAyanamsa, selectedMonthSystem, saveToLocalStorage, selectedTheme);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReset = () => {
    onResetDefaults();
    setSaveSuccessMsg(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="settings-modal-dialog"
        className="w-full max-w-lg rounded-[1.5rem] border border-stone-200/60 bg-stone-50/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif-vedic">
                {t.settings}
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                {lang === 'hi'
                  ? 'अयनांश, मास गणना एवं स्थायी डिवाइस सेटिंग्स'
                  : lang === 'sa'
                  ? 'अयनांश-मासमान-उपकरणव्यवस्थाश्च'
                  : 'Ayanāṁśa, Month Reckoning & Saved Device Preferences'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-settings-modal-btn"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in duration-300">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{t.settingsSavedToast}</span>
          </div>
        )}

        <div className="mt-5 space-y-6">
          {/* Current Device Status Banner */}
          <div className="rounded-2xl border border-amber-200/70 bg-white/80 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  {t.savedSettingsTitle}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Active on Device
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-100">
              <span className="flex items-center gap-1.5 font-medium text-stone-700">
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                {currentCity}
              </span>
              {customCoords?.isDeviceLocation && (
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold border border-amber-200">
                  GPS Active
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-stone-700 select-none">
              <input
                type="checkbox"
                id="save-to-device-toggle"
                checked={saveToLocalStorage}
                onChange={(e) => setSaveToLocalStorage(e.target.checked)}
                className="h-4 w-4 rounded text-amber-700 focus:ring-amber-500 border-stone-300"
              />
              <span className="font-semibold text-stone-800">
                {t.saveAsDefault}
              </span>
            </label>
          </div>

          {/* Theme Selection (Parchment vs Night Sky) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 font-devanagari">
              {t.theme}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Parchment Theme */}
              <button
                type="button"
                id="select-theme-parchment"
                onClick={() => handleSelectTheme('parchment')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedTheme === 'parchment'
                    ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600/30'
                    : 'border-stone-200 hover:bg-stone-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-stone-900 text-sm font-devanagari">
                      {t.parchment}
                    </span>
                  </div>
                  {selectedTheme === 'parchment' && (
                    <Check className="h-4 w-4 text-amber-700" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                  {t.parchmentDesc}
                </p>
              </button>

              {/* Night Sky Theme */}
              <button
                type="button"
                id="select-theme-night-sky"
                onClick={() => handleSelectTheme('nightSky')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedTheme === 'nightSky'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/40 text-stone-100'
                    : 'border-stone-200 hover:bg-stone-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <span className="font-bold text-stone-900 text-sm font-devanagari">
                      {t.nightSky}
                    </span>
                  </div>
                  {selectedTheme === 'nightSky' && (
                    <Check className="h-4 w-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                  {t.nightSkyDesc}
                </p>
              </button>
            </div>
          </div>

          {/* Lunar Month System (Amānta vs Pūrṇimānta) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 font-devanagari">
              {t.monthScheme}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-amanta"
                onClick={() => setSelectedMonthSystem('amanta')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedMonthSystem === 'amanta'
                    ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600/30'
                    : 'border-stone-200 hover:bg-stone-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm font-devanagari">
                    {t.amanta}
                  </span>
                  {selectedMonthSystem === 'amanta' && (
                    <Check className="h-4 w-4 text-amber-700" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  {lang === 'sa'
                    ? 'अमावास्यान्तः मासः। दक्षिणभारते मुख्यतया आचर्यते।'
                    : lang === 'hi'
                    ? 'अमावस्या के अंत पर नवीन मास प्रारंभ (दक्षिण भारत, महाराष्ट्र, गुजरात में प्रचलित)।'
                    : 'Month ends at New Moon (Amāvasyā). Standard in South India, Maharashtra & Gujarat.'}
                </p>
              </button>

              <button
                type="button"
                id="select-purnimanta"
                onClick={() => setSelectedMonthSystem('purnimanta')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedMonthSystem === 'purnimanta'
                    ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600/30'
                    : 'border-stone-200 hover:bg-stone-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm font-devanagari">
                    {t.purnimanta}
                  </span>
                  {selectedMonthSystem === 'purnimanta' && (
                    <Check className="h-4 w-4 text-amber-700" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  {lang === 'sa'
                    ? 'पूर्णिमान्तः मासः। उत्तरभारते मुख्यतया आचर्यते।'
                    : lang === 'hi'
                    ? 'पूर्णिमा के अंत पर नवीन मास प्रारंभ (उत्तर भारत में सर्वाधिक प्रचलित)।'
                    : 'Month ends at Full Moon (Pūrṇimā). Standard in North India.'}
                </p>
              </button>
            </div>
          </div>

          {/* Ayanāṁśa Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 font-devanagari">
              {t.ayanamsaSystem}
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {AYANAMSA_OPTIONS.map((opt) => (
                <div
                  key={opt.key}
                  id={`ayanamsa-opt-${opt.key}`}
                  onClick={() => setSelectedAyanamsa(opt.key)}
                  className={`flex items-start justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedAyanamsa === opt.key
                      ? 'border-amber-600 bg-amber-50/80 ring-1 ring-amber-600/30'
                      : 'border-stone-200 hover:bg-stone-50 bg-white'
                  }`}
                >
                  <div className="pr-3">
                    <div className="font-bold text-stone-900 text-sm">{opt.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5 font-sans">
                      {lang === 'sa' ? opt.descSa : lang === 'hi' ? opt.descHi : opt.desc}
                    </div>
                  </div>
                  {selectedAyanamsa === opt.key && (
                    <Check className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-stone-200/80 pt-4">
          <button
            type="button"
            id="reset-settings-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-700 transition-colors py-1.5 px-2 rounded-lg hover:bg-rose-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.resetDefaults}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              id="cancel-settings-btn"
              onClick={onClose}
              className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              id="apply-settings-btn"
              onClick={handleSave}
              className="rounded-xl bg-amber-700 px-5 py-2 text-xs font-bold text-white hover:bg-amber-800 shadow-xs flex items-center gap-1.5"
            >
              <BookmarkCheck className="h-3.5 w-3.5" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
