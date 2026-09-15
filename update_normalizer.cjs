const fs = require("fs");
let content = fs.readFileSync("src/lib/dailyScheduleNormalizer.ts", "utf8");

content = content.replace(
  "subtitle: `${formatTimeInZone(sunriseMs, timeZone)} · Beginning of Vedic Day`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(sunriseMs, timeZone)} · वैदिक दिवस का आरम्भ` : `${formatTimeInZone(sunriseMs, timeZone)} · Beginning of Vedic Day`,',
);

content = content.replace(
  "subtitle: `${formatTimeInZone(sunsetMs, timeZone)} · Beginning of Vedic Night`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(sunsetMs, timeZone)} · वैदिक रात्रि का आरम्भ` : `${formatTimeInZone(sunsetMs, timeZone)} · Beginning of Vedic Night`,',
);

content = content.replace(
  "subtitle: `${formatTimeInZone(moonriseMs, timeZone)} · Chandra Udaya`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(moonriseMs, timeZone)} · चंद्र उदय` : `${formatTimeInZone(moonriseMs, timeZone)} · Chandra Udaya`,',
);

content = content.replace(
  "subtitle: `${formatTimeInZone(moonsetMs, timeZone)} · Chandra Asta`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(moonsetMs, timeZone)} · चंद्र अस्त` : `${formatTimeInZone(moonsetMs, timeZone)} · Chandra Asta`,',
);

// Segment titles
content = content.replace(
  'title: `${seg.name} (${lang === "hi" ? labelHi : labelEn})`,',
  'title: `${seg.name} (${lang === "hi" ? labelHi : labelEn})`,',
); // wait it's already using lang there

content = content.replace(
  "subtitle: `${labelEn} #${seg.number || idx + 1} · ${Math.round(durationMs / 3600000)}h duration`,",
  'subtitle: lang === "hi" ? `${labelHi} #${seg.number || idx + 1} · ${Math.round(durationMs / 3600000)}घंटे की अवधि` : `${labelEn} #${seg.number || idx + 1} · ${Math.round(durationMs / 3600000)}h duration`,',
);

// Hora titles
content = content.replace(
  "title: `${h.ruler} Hora`,",
  'title: lang === "hi" ? `${h.ruler} होरा` : `${h.ruler} Hora`,',
);
content = content.replace(
  'subtitle: `${h.isDay ? "Day" : "Night"} Hora #${h.index} · ${h.nadi === "ida" ? "Lunar Nadi (IDA)" : "Solar Nadi (PINGALA)"}`,',
  'subtitle: lang === "hi" ? `${h.isDay ? "दिन" : "रात्रि"} होरा #${h.index} · ${h.nadi === "ida" ? "चन्द्र नाड़ी (इड़ा)" : "सूर्य नाड़ी (पिंगला)"}` : `${h.isDay ? "Day" : "Night"} Hora #${h.index} · ${h.nadi === "ida" ? "Lunar Nadi (IDA)" : "Solar Nadi (PINGALA)"}`,',
);

// Tattvas
content = content.replace(
  "title: `${tp.sanskrit} Tattva (${tp.name})`,",
  'title: lang === "hi" ? `${tp.sanskrit} तत्त्व (${tp.name})` : `${tp.sanskrit} Tattva (${tp.name})`,',
);
content = content.replace(
  "subtitle: `${h.ruler} Hora · Micro-period ${tIdx + 1}/5`,",
  'subtitle: lang === "hi" ? `${h.ruler} होरा · सूक्ष्म काल ${tIdx + 1}/5` : `${h.ruler} Hora · Micro-period ${tIdx + 1}/5`,',
);

// Swara events
content = content.replace(
  /title: `Sunrise Swara · \${swaraYoga\.sunriseSwara === "ida" \? "Ida \(Lunar \/ Left\)" : "Pingala \(Solar \/ Right\)"}`,/g,
  'title: lang === "hi" ? `सूर्योदय स्वर · ${swaraYoga.sunriseSwara === "ida" ? "इड़ा (बायाँ)" : "पिंगला (दायाँ)"}` : `Sunrise Swara · ${swaraYoga.sunriseSwara === "ida" ? "Ida (Lunar / Left)" : "Pingala (Solar / Right)"}`,',
);
content = content.replace(
  /subtitle: `\${swaraYoga\.sunriseNostril} Nostril · 1st Hour Classical Swara Window`,/g,
  'subtitle: lang === "hi" ? `${swaraYoga.sunriseNostril === "Left" ? "बायाँ" : "दायाँ"} स्वर · प्रथम घंटा शास्त्रीय स्वर` : `${swaraYoga.sunriseNostril} Nostril · 1st Hour Classical Swara Window`,',
);

content = content.replace(
  /title: `Sunset Swara · \${swaraYoga\.sunsetSwara === "ida" \? "Ida \(Lunar \/ Left\)" : "Pingala \(Solar \/ Right\)"}`,/g,
  'title: lang === "hi" ? `सूर्यास्त स्वर · ${swaraYoga.sunsetSwara === "ida" ? "इड़ा (बायाँ)" : "पिंगला (दायाँ)"}` : `Sunset Swara · ${swaraYoga.sunsetSwara === "ida" ? "Ida (Lunar / Left)" : "Pingala (Solar / Right)"}`,',
);
content = content.replace(
  /subtitle: `\${swaraYoga\.sunsetNostril} Nostril · Sandhya Transition Swara Window`,/g,
  'subtitle: lang === "hi" ? `${swaraYoga.sunsetNostril === "Left" ? "बायाँ" : "दायाँ"} स्वर · संध्या काल संधिकाल` : `${swaraYoga.sunsetNostril} Nostril · Sandhya Transition Swara Window`,',
);

content = content.replace(
  /title: `Tithi Start Swara · \${se\.nadi === "ida" \? "Ida Nadi" : "Pingala Nadi"}`,/g,
  'title: lang === "hi" ? `तिथि आरंभ स्वर · ${se.nadi === "ida" ? "इड़ा नाड़ी" : "पिंगला नाड़ी"}` : `Tithi Start Swara · ${se.nadi === "ida" ? "Ida Nadi" : "Pingala Nadi"}`, ',
);
content = content.replace(
  /subtitle: `\${tithiSeg\.name} Beginning · \${se\.nadi === "ida" \? "Left Nostril" : "Right Nostril"} \(60 min\)`,/g,
  'subtitle: lang === "hi" ? `${tithiSeg.name} आरंभ · ${se.nadi === "ida" ? "बायाँ स्वर" : "दायाँ स्वर"} (60 मिनट)` : `${tithiSeg.name} Beginning · ${se.nadi === "ida" ? "Left Nostril" : "Right Nostril"} (60 min)`,',
);

content = content.replace(
  /title: `Tithi End Swara · \${ee\.nadi === "ida" \? "Ida Nadi" : "Pingala Nadi"}`,/g,
  'title: lang === "hi" ? `तिथि समापन स्वर · ${ee.nadi === "ida" ? "इड़ा नाड़ी" : "पिंगला नाड़ी"}` : `Tithi End Swara · ${ee.nadi === "ida" ? "Ida Nadi" : "Pingala Nadi"}`, ',
);
content = content.replace(
  /subtitle: `\${tithiSeg\.name} Completion · \${ee\.nadi === "ida" \? "Left Nostril" : "Right Nostril"} \(60 min\)`,/g,
  'subtitle: lang === "hi" ? `${tithiSeg.name} समापन · ${ee.nadi === "ida" ? "बायाँ स्वर" : "दायाँ स्वर"} (60 मिनट)` : `${tithiSeg.name} Completion · ${ee.nadi === "ida" ? "Left Nostril" : "Right Nostril"} (60 min)`,',
);

content = content.replace(
  /title: `Nakshatra Start Swara · \${se\.nadi === "ida" \? "Ida Nadi" : "Pingala Nadi"}`,/g,
  'title: lang === "hi" ? `नक्षत्र आरंभ स्वर · ${se.nadi === "ida" ? "इड़ा नाड़ी" : "पिंगला नाड़ी"}` : `Nakshatra Start Swara · ${se.nadi === "ida" ? "Ida Nadi" : "Pingala Nadi"}`, ',
);
content = content.replace(
  /subtitle: `\${nakSeg\.name} Beginning · \${se\.nadi === "ida" \? "Left Nostril" : "Right Nostril"} \(60 min\)`,/g,
  'subtitle: lang === "hi" ? `${nakSeg.name} आरंभ · ${se.nadi === "ida" ? "बायाँ स्वर" : "दायाँ स्वर"} (60 मिनट)` : `${nakSeg.name} Beginning · ${se.nadi === "ida" ? "Left Nostril" : "Right Nostril"} (60 min)`,',
);

content = content.replace(
  /title: `Nakshatra End Swara \(Opposite\) · \${ee\.nadi === "ida" \? "Ida Nadi" : "Pingala Nadi"}`,/g,
  'title: lang === "hi" ? `नक्षत्र समापन स्वर (विपरीत) · ${ee.nadi === "ida" ? "इड़ा नाड़ी" : "पिंगला नाड़ी"}` : `Nakshatra End Swara (Opposite) · ${ee.nadi === "ida" ? "Ida Nadi" : "Pingala Nadi"}`, ',
);
content = content.replace(
  /subtitle: `\${nakSeg\.name} Completion · \${ee\.nadi === "ida" \? "Left Nostril" : "Right Nostril"} \(60 min\)`,/g,
  'subtitle: lang === "hi" ? `${nakSeg.name} समापन · ${ee.nadi === "ida" ? "बायाँ स्वर" : "दायाँ स्वर"} (60 मिनट)` : `${nakSeg.name} Completion · ${ee.nadi === "ida" ? "Left Nostril" : "Right Nostril"} (60 min)`,',
);

content = content.replace(
  /subtitle: `\${auspiciousness === "auspicious" \? "Auspicious Timing" : "Inauspicious Period"} · \${Math.round\(durationMs \/ 60000\)} min`,/g,
  'subtitle: lang === "hi" ? `${auspiciousness === "auspicious" ? "शुभ काल" : "अशुभ काल"} · ${Math.round(durationMs / 60000)} मिनट` : `${auspiciousness === "auspicious" ? "Auspicious Timing" : "Inauspicious Period"} · ${Math.round(durationMs / 60000)} min`,',
);

content = content.replace(
  /title: `\${name} \(\${isNight \? "Night" : "Day"} Choghaḍiyā\)`,/g,
  'title: lang === "hi" ? `${name} (${isNight ? "रात्रि" : "दिन"} चौघड़िया)` : `${name} (${isNight ? "Night" : "Day"} Choghaḍiyā)`,',
);
content = content.replace(
  /subtitle: `\${cg\.lord \? "Ruler: " \+ cg\.lord \+ " · " : ""}\${Math\.round\(durationMs \/ 60000\)} min`,/g,
  'subtitle: lang === "hi" ? `${cg.lord ? "स्वामी: " + cg.lord + " · " : ""}${Math.round(durationMs / 60000)} मिनट` : `${cg.lord ? "Ruler: " + cg.lord + " · " : ""}${Math.round(durationMs / 60000)} min`,',
);

fs.writeFileSync("src/lib/dailyScheduleNormalizer.ts", content);
