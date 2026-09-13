const fs = require('fs');

let content = fs.readFileSync('src/PanchangaApp.tsx', 'utf8');

// Imports
content = content.replace(
  'import { type Language, translations } from "./i18n";',
  'import { type Language, translations } from "./i18n";\nimport { schedulePanchangaNotifications, getNotificationPreferences } from "./lib/notificationEngine";'
);

// inside PanchangaApp component, before useEffects, let's inject a useEffect
const effectIdx = content.indexOf('useEffect(() => {');
const injectCode = `
  // Notification Scheduler
  useEffect(() => {
    if (panchangaData) {
      const prefs = getNotificationPreferences();
      schedulePanchangaNotifications(panchangaData, prefs);
    }
  }, [panchangaData]);

  // Listener for preferences update
  useEffect(() => {
    const handlePrefsUpdate = () => {
      if (panchangaData) {
        const prefs = getNotificationPreferences();
        schedulePanchangaNotifications(panchangaData, prefs);
      }
    };
    window.addEventListener("mahavtaar_notif_prefs_updated", handlePrefsUpdate);
    return () => window.removeEventListener("mahavtaar_notif_prefs_updated", handlePrefsUpdate);
  }, [panchangaData]);

`;

content = content.substring(0, effectIdx) + injectCode + content.substring(effectIdx);

fs.writeFileSync('src/PanchangaApp.tsx', content);
