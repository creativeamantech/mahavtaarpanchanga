const fs = require('fs');
const file = 'src/components/NextMajorIngressWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update imports
content = content.replace(
  'import React, { useMemo } from "react";',
  'import React, { useMemo, useState, useEffect } from "react";'
);

// Add state and update useMemo
const targetStr = `  const isNight = theme === "nightSky";

  const nextMajorIngress = useMemo(() => {
    const events = data.planet_transitions?.upcomingEvents || [];
    // Return the chronologically first rasi transit, regardless of planet
    return events.find((e) => e.type === "rasi") || null;
  }, [data]);`;

const repStr = `  const isNight = theme === "nightSky";

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const nextMajorIngress = useMemo(() => {
    const events = data.planet_transitions?.upcomingEvents || [];
    // Return the chronologically first rasi transit that is strictly in the future
    return events.find((e) => e.type === "rasi" && new Date(e.timestamp).getTime() > now) || null;
  }, [data, now]);`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(file, content);
console.log('patched time logic');
