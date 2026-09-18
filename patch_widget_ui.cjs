const fs = require('fs');
const file = 'src/components/NextMajorIngressWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the UI return block
const targetStr = `  return (
    <div className={\`mb-10 overflow-hidden rounded-2xl border shadow-lg relative \${isNight ? "bg-[#0b101e]/90 border-indigo-900/50" : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100"}\`}>
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        
        {/* Left: Icon & Label */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className={\`w-16 h-16 flex items-center justify-center rounded-2xl mb-3 shadow-inner \${isNight ? "bg-indigo-900/40 text-indigo-300" : "bg-white text-indigo-600"}\`}>
            <Orbit className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-70 text-center">
            {lang === "hi" ? "आगामी गोचर (Next Ingress)" : "Next Ingress"}
          </div>
          <div className={\`text-xs mt-1 font-medium px-2 py-0.5 rounded-full \${isMajor ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"}\`}>
            {isMajor ? (lang === "hi" ? "महा गोचर" : "Maha Gochara") : (lang === "hi" ? "सामान्य गोचर" : "Regular Transit")}
          </div>
        </div>

        {/* Center: Transit Info */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold tracking-tight">
              {planetName}
            </span>
            <span className={\`text-2xl opacity-70\`}>{nextMajorIngress.symbol}</span>
          </div>
          
          <div className="flex items-center gap-3 text-lg font-medium mt-2">
            <span className="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              {fromRasi}
            </span>
            <ArrowRight className="w-5 h-5 opacity-50" />
            <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-md">
              {toRasi}
            </span>
          </div>
        </div>

        {/* Right: Date & Time Info */}
        <div className={\`flex flex-col gap-3 shrink-0 p-4 rounded-xl border \${isNight ? "bg-black/20 border-white/5" : "bg-white/60 border-white/40"}\`}>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 opacity-60 text-indigo-500" />
            <span className="font-medium">{dateFormat}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 opacity-60 text-purple-500" />
            <span className="font-mono font-medium">{timeFormat}</span>
          </div>
          <div className="text-xs opacity-60 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {getRelativeTime(new Date(nextMajorIngress.timestamp).getTime(), now, lang)}
          </div>
        </div>
      </div>
    </div>
  );`;

const repStr = `  return (
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

if (content.includes("mb-10 overflow-hidden rounded-2xl border shadow-lg relative")) {
  content = content.replace(targetStr, repStr);
  fs.writeFileSync(file, content);
  console.log('patched next widget');
} else {
  console.log('could not find widget target');
}
