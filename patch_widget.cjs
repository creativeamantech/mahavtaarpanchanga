const fs = require('fs');
const file = 'src/components/NextMajorIngressWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

const helpers = `
function getCountdownParts(targetDateMs: number, nowMs: number) {
  const diffMs = targetDateMs - nowMs;
  if (diffMs < 0) return { days: 0, hours: 0, minutes: 0, isPast: true };
  
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  
  return { days, hours, minutes, isPast: false };
}
`;

const renderTarget = `  return (
    <div className={\`mb-12 border-b pb-8 \${isNight ? "border-slate-800" : "border-stone-200"}\`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-slate-400">
              {lang === "hi" ? "आगामी गोचर" : "Next Ingress"}
            </div>
            <span className={\`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm \${isMajor ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400" : "bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-400"}\`}>
              {isMajor ? (lang === "hi" ? "महा गोचर" : "Maha Gochara") : (lang === "hi" ? "सामान्य गोचर" : "Regular")}
            </span>
          </div>
          
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mt-2">
            <h3 className={\`text-3xl sm:text-4xl font-bold tracking-tight \${isNight ? "text-slate-100" : "text-stone-900"}\`}>
              {planetName}
            </h3>
            <span className={\`text-2xl \${isNight ? "text-slate-500" : "text-stone-400"}\`}>{nextMajorIngress.symbol}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <span className={\`text-sm font-medium \${isNight ? "text-slate-300" : "text-stone-600"}\`}>
              {fromRasi}
            </span>
            <ArrowRight className={\`w-4 h-4 \${isNight ? "text-slate-600" : "text-stone-400"}\`} />
            <span className={\`text-sm font-bold \${isNight ? "text-indigo-400" : "text-indigo-700"}\`}>
              {toRasi}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 md:items-end md:text-right">
          <div className={\`text-sm font-medium \${isNight ? "text-slate-300" : "text-stone-700"}\`}>
            {dateFormat}
          </div>
          <div className={\`text-xs font-mono \${isNight ? "text-slate-400" : "text-stone-500"}\`}>
            {timeFormat}
          </div>
          <div className={\`text-xs font-medium mt-1 \${isNight ? "text-amber-400/80" : "text-amber-700"}\`}>
            {getRelativeTime(new Date(nextMajorIngress.timestamp).getTime(), now, lang)}
          </div>
        </div>
      </div>
    </div>
  );`;

const renderRep = `  const { days, hours, minutes, isPast } = getCountdownParts(new Date(nextMajorIngress.timestamp).getTime(), now);

  return (
    <div className={\`mb-12 rounded-2xl overflow-hidden border \${isNight ? "border-indigo-900/40 bg-[#0e1424]/80" : "border-stone-200 bg-stone-50/50"}\`}>
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        
        {/* Left: Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <div className={\`text-xs font-bold uppercase tracking-widest \${isNight ? "text-indigo-400" : "text-indigo-600"}\`}>
              {lang === "hi" ? "आगामी गोचर" : "Next Ingress"}
            </div>
            {isMajor && (
              <span className={\`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm \${isNight ? "bg-amber-900/50 text-amber-400" : "bg-amber-100 text-amber-800"}\`}>
                {lang === "hi" ? "महा गोचर" : "Maha Gochara"}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <h3 className={\`text-3xl sm:text-4xl font-bold tracking-tight \${isNight ? "text-slate-100" : "text-stone-900"}\`}>
              {planetName}
            </h3>
            <span className={\`text-3xl \${isNight ? "text-slate-500" : "text-stone-400"}\`}>{nextMajorIngress.symbol}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            <span className={\`text-sm font-medium \${isNight ? "text-slate-400" : "text-stone-500"}\`}>
              {fromRasi}
            </span>
            <ArrowRight className={\`w-4 h-4 \${isNight ? "text-slate-600" : "text-stone-400"}\`} />
            <span className={\`text-sm font-bold \${isNight ? "text-indigo-300" : "text-indigo-700"}\`}>
              {toRasi}
            </span>
          </div>
          
          <div className={\`flex items-center gap-2 mt-4 text-xs font-mono \${isNight ? "text-slate-400" : "text-stone-500"}\`}>
             <Calendar className="w-3.5 h-3.5" />
             {dateFormat} &nbsp;•&nbsp; <Clock className="w-3.5 h-3.5" /> {timeFormat}
          </div>
        </div>

        {/* Right: The Countdown */}
        <div className="flex flex-col items-center md:items-end justify-center shrink-0">
          {isPast ? (
            <div className={\`px-6 py-3 rounded-xl border font-bold tracking-wide \${isNight ? "bg-stone-800/80 border-stone-700 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-500"}\`}>
              {lang === "hi" ? "हो चुका है" : "Transition Complete"}
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center">
                <div className={\`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-2xl sm:text-4xl font-light font-mono border shadow-sm \${isNight ? "bg-[#161f36] border-indigo-900/50 text-slate-100" : "bg-white border-stone-200 text-stone-800"}\`}>
                  {String(days).padStart(2, '0')}
                </div>
                <div className={\`mt-2 text-[10px] uppercase font-bold tracking-widest \${isNight ? "text-slate-500" : "text-stone-500"}\`}>
                  {lang === "hi" ? "दिन" : "Days"}
                </div>
              </div>
              <div className={\`text-2xl font-light pb-6 \${isNight ? "text-slate-600" : "text-stone-300"}\`}>:</div>
              <div className="flex flex-col items-center">
                <div className={\`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-2xl sm:text-4xl font-light font-mono border shadow-sm \${isNight ? "bg-[#161f36] border-indigo-900/50 text-slate-100" : "bg-white border-stone-200 text-stone-800"}\`}>
                  {String(hours).padStart(2, '0')}
                </div>
                <div className={\`mt-2 text-[10px] uppercase font-bold tracking-widest \${isNight ? "text-slate-500" : "text-stone-500"}\`}>
                  {lang === "hi" ? "घंटे" : "Hrs"}
                </div>
              </div>
              <div className={\`text-2xl font-light pb-6 \${isNight ? "text-slate-600" : "text-stone-300"}\`}>:</div>
              <div className="flex flex-col items-center">
                <div className={\`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-2xl sm:text-4xl font-light font-mono border shadow-sm \${isNight ? "bg-[#161f36] border-indigo-900/50 text-indigo-400" : "bg-white border-stone-200 text-indigo-600"}\`}>
                  {String(minutes).padStart(2, '0')}
                </div>
                <div className={\`mt-2 text-[10px] uppercase font-bold tracking-widest \${isNight ? "text-slate-500" : "text-stone-500"}\`}>
                  {lang === "hi" ? "मिनट" : "Mins"}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );`;

content = content.replace("function getRelativeTime", helpers + "\nfunction getRelativeTime");
content = content.replace(renderTarget, renderRep);

fs.writeFileSync(file, content);
console.log('patched countdown');
