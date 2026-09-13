import React, { useState, useEffect } from 'react';
import { DailyHoras, Hora, TattvaPeriod, computeDailyHoras } from '../horaEngine';
import { Sun, Moon, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export function VedicHorasView({ panchangaData }: { panchangaData: any }) {
  const [dailyHoras, setDailyHoras] = useState<DailyHoras | null>(null);
  const [now, setNow] = useState(Date.now());
  const [expandedHora, setExpandedHora] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (panchangaData) {
      const parts = panchangaData.date.split('/');
      const dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const weekday = dateObj.getDay();
      
      const horas = computeDailyHoras(
        panchangaData.date,
        panchangaData.sunrise_hours,
        panchangaData.sunset_hours,
        panchangaData.next_sunrise_hours,
        weekday,
        panchangaData.tithi[0]?.number || 1,
        now
      );
      setDailyHoras(horas);
    }
  }, [panchangaData, now]);

  if (!dailyHoras) return null;

  const { activeHora, activeTattva } = dailyHoras;

  // Auspicious activities map based on Planet & Element
  const adviceMap = {
    Sun: 'Leadership, authority, health, spiritual practices.',
    Moon: 'Public relations, emotions, mother, food, changes.',
    Mars: 'Courage, technical work, physical activity, surgery.',
    Mercury: 'Communication, business, writing, analytics.',
    Jupiter: 'Wisdom, wealth, education, religious acts.',
    Venus: 'Arts, romance, luxury, comforts, diplomacy.',
    Saturn: 'Discipline, hard work, dealing with elders, delays.'
  };

  const getTattvaColor = (name: string) => {
    switch (name) {
      case 'Space': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Air': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Fire': return 'bg-red-100 text-red-900 border-red-300';
      case 'Earth': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Water': return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* SCREEN 1: Real-Time Live Dashboard ("Now" View) */}
      <div className="glass-card rounded-[2rem] p-6 shadow-sm transition-all">
        <h2 className="mb-4 flex items-center space-x-2 text-lg font-bold text-stone-800">
          <Clock className="h-5 w-5 text-indigo-600" />
          <span>Real-Time Vedic Hora (Planetary Hour)</span>
        </h2>
        
        {activeHora && activeTattva ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active State Hero Banner */}
            <div className="rounded-2xl bg-linear-to-br from-indigo-50 to-purple-50 p-6 border border-indigo-100 shadow-inner flex flex-col items-center justify-center space-y-4 text-center">
              <div className="text-sm font-semibold text-indigo-800 uppercase tracking-widest">Active Planetary Ruler</div>
              <div className="text-4xl font-extrabold text-indigo-950 flex items-center space-x-3">
                {activeHora.isDay ? <Sun className="h-8 w-8 text-amber-500" /> : <Moon className="h-8 w-8 text-indigo-400" />}
                <span>{activeHora.ruler}</span>
              </div>
              <div className="flex space-x-3 mt-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${activeHora.nadi === 'ida' ? 'bg-sky-100 text-sky-800 border-sky-300' : activeHora.nadi === 'pingala' ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-purple-100 text-purple-800 border-purple-300'}`}>
                  Nadi: {activeHora.nadi === 'ida' ? 'Ida 🔵' : activeHora.nadi === 'pingala' ? 'Pingala 🔴' : 'Sushumna 🟣'}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getTattvaColor(activeTattva.name)}`}>
                  Tattva: {activeTattva.sanskrit} ({activeTattva.name})
                </span>
              </div>
            </div>

            {/* Visual Progress & Advice */}
            <div className="rounded-2xl bg-white p-6 border border-stone-100 shadow-xs flex flex-col justify-center space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">
                  <span>Hora Progress</span>
                  <span>{Math.round((now - activeHora.startTimeMs) / 60000)} / {Math.round(activeHora.durationMs / 60000)} mins</span>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden relative border border-stone-200">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, ((now - activeHora.startTimeMs) / activeHora.durationMs) * 100))}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">
                  <span>Tattva Progress</span>
                  <span>{Math.round((now - activeTattva.startTimeMs) / 60000)} / {Math.round(activeTattva.durationMs / 60000)} mins</span>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden relative border border-stone-200">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, ((now - activeTattva.startTimeMs) / activeTattva.durationMs) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-stone-100">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Auspicious Focus</div>
                <div className="text-sm text-stone-700 italic">"{adviceMap[activeHora.ruler as keyof typeof adviceMap]}"</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-stone-500">Loading live data...</div>
        )}
      </div>

      {/* SCREEN 2: 24-Hour Timeline */}
      <div className="glass-card rounded-[2rem] p-6 shadow-sm transition-all">
        <h2 className="mb-4 text-lg font-bold text-stone-800">
          Daily Schedule: 24 Vedic Horas
        </h2>
        
        <div className="space-y-2.5">
          {dailyHoras.horas.map((hora) => {
            const isActive = hora.index === activeHora?.index;
            const isExpanded = expandedHora === hora.index || isActive;
            
            return (
              <div 
                key={hora.index}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isActive ? 'border-indigo-400 shadow-md bg-indigo-50/30' : 'border-stone-200 bg-white hover:border-indigo-200'}`}
              >
                <div 
                  className="flex cursor-pointer items-center justify-between p-4"
                  onClick={() => setExpandedHora(isExpanded && !isActive ? null : hora.index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${isActive ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                      {hora.index}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        {hora.isDay ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                        <span className={`font-bold ${isActive ? 'text-indigo-900' : 'text-stone-700'}`}>{hora.ruler}</span>
                        {isActive && <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full animate-pulse">Now</span>}
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {hora.startTime} - {hora.endTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${hora.nadi === 'ida' ? 'bg-sky-50 text-sky-700 border-sky-200' : hora.nadi === 'pingala' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                      {hora.nadi === 'ida' ? 'Ida' : hora.nadi === 'pingala' ? 'Pingala' : 'Sushumna'}
                    </span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-stone-100 bg-stone-50/50 p-4 animate-in slide-in-from-top-2">
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Pancha Tattva (5 Elements) Micro-Periods</div>
                    <div className="space-y-2">
                      {hora.tattvas.map((tattva, tIdx) => {
                        const isTattvaActive = isActive && activeTattva?.name === tattva.name;
                        return (
                          <div 
                            key={tIdx} 
                            className={`flex items-center justify-between p-2.5 rounded-xl border ${isTattvaActive ? 'border-emerald-400 shadow-xs bg-white' : 'border-stone-100 bg-white/50'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTattvaColor(tattva.name)}`}>
                                {tattva.sanskrit} ({tattva.name})
                              </span>
                              {isTattvaActive && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                            </div>
                            <div className="text-[11px] font-mono text-stone-600">
                              {tattva.startTime} - {tattva.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
