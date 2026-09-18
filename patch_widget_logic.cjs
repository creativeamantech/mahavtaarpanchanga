const fs = require('fs');
const file = 'src/components/NextMajorIngressWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const nextMajorIngress = useMemo(() => {
    const events = data.planet_transitions?.upcomingEvents || [];
    // Return the chronologically first rasi transit that is strictly in the future
    return events.find((e) => e.type === "rasi" && new Date(e.timestamp).getTime() > now) || null;
  }, [data, now]);`;

const repStr = `  // Use the data timestamp as the baseline to find the "next" event relative to the requested panchanga time
  const nextMajorIngress = useMemo(() => {
    const events = data.planet_transitions?.upcomingEvents || [];
    // We should NOT use 'now' (the current realtime clock) to filter the next ingress, 
    // because the user might be looking at a Panchanga for a date 5 days ago or 1 month in the future.
    // The Panchanga API returns events sorted chronologically from the start of the requested day.
    // So we just take the first Rasi transit that happens *after* the requested date's timestamp.
    
    // We'll use the 'now' for the *countdown*, but the event selection should be static based on the data.
    return events.find((e) => e.type === "rasi") || null;
  }, [data]);`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(file, content);
console.log('patched selection logic');
