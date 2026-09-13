import React from 'react';
import { motion } from 'motion/react';
import { type ActiveView } from './Header';
import { type Language, translations } from '../i18n';
import type { AppTheme } from '../types';
import { Sun, Clock, Moon, Wind, Calendar } from 'lucide-react';

interface SpiritualTabsProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  lang: Language;
  theme?: AppTheme;
}

export const SpiritualTabs: React.FC<SpiritualTabsProps> = ({
  activeView,
  onViewChange,
  lang,
  theme = 'parchment',
}) => {
  const t = translations[lang];

  const tabs = [
    {
      id: 'panchanga' as ActiveView,
      label: t.dailyPanchanga,
      icon: Sun,
    },
    {
      id: 'timings' as ActiveView,
      label: t.muhurtasAndTimings,
      icon: Clock,
    },
    {
      id: 'planets' as ActiveView,
      label: t.grahaSthiti,
      icon: Moon,
    },
    {
      id: 'swara' as ActiveView,
      label: t.views.swara,
      icon: Wind,
    },
    {
      id: 'horas' as ActiveView,
      label: lang === 'hi' ? 'वैदिक होरा' : lang === 'sa' ? 'वैदिकहोरा' : 'Vedic Horas',
      icon: Clock,
    },
    {
      id: 'calendar' as ActiveView,
      label: t.monthCalendar,
      icon: Calendar,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className={`glass-card rounded-2xl p-1.5 flex items-center justify-start lg:justify-center space-x-1 sm:space-x-2 overflow-x-auto hide-scrollbar ${
          theme === 'nightSky'
            ? 'bg-[#0e1424]/90 border-indigo-950/70'
            : 'border-amber-200/60'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-devanagari whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? theme === 'nightSky'
                    ? 'text-amber-300 font-bold'
                    : 'text-amber-950 font-bold'
                  : theme === 'nightSky'
                  ? 'text-slate-300 hover:text-white font-semibold hover:bg-slate-800/50'
                  : 'text-stone-600 hover:text-stone-900 font-semibold hover:bg-stone-100/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-xl shadow-xs border ${
                    theme === 'nightSky'
                      ? 'bg-indigo-900/80 border-indigo-500/50 shadow-indigo-950/50'
                      : 'bg-white shadow-xs border-amber-200/80'
                  }`}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative flex items-center space-x-2 z-10">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive
                      ? theme === 'nightSky'
                        ? 'text-amber-300 scale-105'
                        : 'text-amber-700 scale-105'
                      : theme === 'nightSky'
                      ? 'text-slate-400'
                      : 'text-stone-500'
                  }`}
                />
                <span className="text-sm tracking-wide">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
