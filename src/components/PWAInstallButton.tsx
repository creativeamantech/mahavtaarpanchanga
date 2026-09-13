import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex h-7 items-center gap-1.5 rounded-lg border px-2 shadow-2xs transition-all border-emerald-600/60 bg-emerald-950/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-900/40"
        title="Install App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex h-7 items-center gap-1.5 rounded-lg border px-2 shadow-2xs transition-all border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-indigo-900/60 dark:bg-[#12182b] dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl relative text-card-foreground">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold mb-2">Install on iPhone / iPad</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
