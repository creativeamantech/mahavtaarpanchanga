const fs = require('fs');

let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Imports
content = content.replace(
  'import { type Language, translations } from "../i18n";',
  'import { type Language, translations } from "../i18n";\nimport { getNotificationPreferences, saveNotificationPreferences, NotificationPreferences, defaultNotificationPreferences } from "../lib/notificationEngine";\nimport { Bell, BellOff, BellRing } from "lucide-react";'
);

// State
content = content.replace(
  'const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);',
  'const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);\n  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(defaultNotificationPreferences);\n\n  useEffect(() => {\n    if (isOpen) {\n      setNotifPrefs(getNotificationPreferences());\n    }\n  }, [isOpen]);'
);

// handleSave
content = content.replace(
  'onUpdateSettings(selectedAyanamsa, selectedMonthSystem, true, selectedTheme);',
  'onUpdateSettings(selectedAyanamsa, selectedMonthSystem, true, selectedTheme);\n    saveNotificationPreferences(notifPrefs);\n    // Dispatch a custom event to notify the app to reload notifications\n    window.dispatchEvent(new Event("mahavtaar_notif_prefs_updated"));'
);

// handleReset
content = content.replace(
  'setSelectedTheme("parchment");',
  'setSelectedTheme("parchment");\n    setNotifPrefs(defaultNotificationPreferences);'
);

// UI Addition
const modalActionsIdx = content.indexOf('{/* Modal Actions */}');
const newUI = `
          {/* Notification Settings */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 font-devanagari">
              <div className="flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-amber-700" />
                Push Notifications
              </div>
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-stone-900 font-devanagari">Enable Push Alerts</span>
                  <span className="text-[11px] text-stone-500">Requires browser permission. Keep app open in background.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !notifPrefs.enabled;
                    setNotifPrefs({ ...notifPrefs, enabled: nextVal });
                    if (nextVal && "Notification" in window && Notification.permission !== "granted") {
                      Notification.requestPermission();
                    }
                  }}
                  className={\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${notifPrefs.enabled ? "bg-amber-600" : "bg-stone-300"}\`}
                >
                  <span className={\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${notifPrefs.enabled ? "translate-x-4" : "translate-x-0"}\`} />
                </button>
              </div>

              {notifPrefs.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 sm:pl-4 border-l-2 border-amber-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={notifPrefs.sunriseSunset} onChange={(e) => setNotifPrefs({...notifPrefs, sunriseSunset: e.target.checked})} className="rounded text-amber-600 focus:ring-amber-600" />
                    <span className="text-xs font-medium text-stone-700">Sunrise & Sunset</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={notifPrefs.muhurtas} onChange={(e) => setNotifPrefs({...notifPrefs, muhurtas: e.target.checked})} className="rounded text-amber-600 focus:ring-amber-600" />
                    <span className="text-xs font-medium text-stone-700">Important Muhurtas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={notifPrefs.horas} onChange={(e) => setNotifPrefs({...notifPrefs, horas: e.target.checked})} className="rounded text-amber-600 focus:ring-amber-600" />
                    <span className="text-xs font-medium text-stone-700">Horas & Elements</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          
`;

content = content.substring(0, modalActionsIdx) + newUI + content.substring(modalActionsIdx);

fs.writeFileSync('src/components/SettingsModal.tsx', content);
