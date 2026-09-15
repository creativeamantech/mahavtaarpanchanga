import React, { useState } from "react";
import { BirthChart, BirthChartPlanet, PlanetId } from "../lib/lagnaEngine.server";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Language } from "../i18n";

const houseCenters = {
  1: { x: 50, y: 25 },
  2: { x: 25, y: 12.5 },
  3: { x: 12.5, y: 25 },
  4: { x: 25, y: 50 },
  5: { x: 12.5, y: 75 },
  6: { x: 25, y: 87.5 },
  7: { x: 50, y: 75 },
  8: { x: 75, y: 87.5 },
  9: { x: 87.5, y: 75 },
  10: { x: 75, y: 50 },
  11: { x: 87.5, y: 25 },
  12: { x: 75, y: 12.5 },
};

const signNamesEn = ["Ar", "Ta", "Ge", "Ca", "Le", "Vi", "Li", "Sc", "Sa", "Cp", "Aq", "Pi"];
const signNamesHi = [
  "मेष",
  "वृष",
  "मिथुन",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चिक",
  "धनु",
  "मकर",
  "कुंभ",
  "मीन",
];

const planetAbbreviationsEn: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

const planetAbbreviationsHi: Record<string, string> = {
  Sun: "सू",
  Moon: "चं",
  Mars: "मं",
  Mercury: "बु",
  Jupiter: "गु",
  Venus: "शु",
  Saturn: "श",
  Rahu: "रा",
  Ketu: "के",
};

const planetNamesHi: Record<string, string> = {
  Sun: "सूर्य",
  Moon: "चन्द्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "गुरु",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
};

export function VedicLagnaChart({ chart, lang = "en" }: { chart: BirthChart; lang?: Language }) {
  const [selectedPlanet, setSelectedPlanet] = useState<BirthChartPlanet | null>(null);
  const [selectedLagna, setSelectedLagna] = useState<boolean>(false);

  const signNames = lang === "hi" ? signNamesHi : signNamesEn;
  const planetAbbreviations = lang === "hi" ? planetAbbreviationsHi : planetAbbreviationsEn;

  // Group planets by house
  const housePlanets: Record<number, BirthChartPlanet[]> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];

  chart.planets.forEach((p) => {
    // Find the house this planet belongs to
    const house = chart.houses.find((h) => h.signIndex === p.signIndex)?.houseIndex || 1;
    housePlanets[house].push(p);
  });

  const renderHouseText = (houseIndex: number) => {
    const center = houseCenters[houseIndex as keyof typeof houseCenters];
    const signIndex = chart.houses.find((h) => h.houseIndex === houseIndex)?.signIndex || 0;
    const planets = housePlanets[houseIndex];

    // Position sign number
    const signNumber = signIndex + 1;

    return (
      <g key={houseIndex}>
        <text
          x={center.x}
          y={center.y - 8}
          textAnchor="middle"
          fill="currentColor"
          className="text-[6px] font-bold opacity-30 pointer-events-none"
        >
          {signNumber}
        </text>
        {houseIndex === 1 && (
          <text
            x={center.x}
            y={center.y - 14}
            textAnchor="middle"
            fill="currentColor"
            className="text-[4px] font-semibold text-primary cursor-pointer hover:underline"
            onClick={() => {
              setSelectedLagna(true);
              setSelectedPlanet(null);
            }}
          >
            {lang === "hi" ? "लग्न" : "Asc"}
          </text>
        )}

        {/* Draw planets */}
        <g transform={`translate(${center.x}, ${center.y + 2})`}>
          {planets.map((p, idx) => {
            const count = planets.length;
            const xOffset = count > 1 ? (idx - (count - 1) / 2) * 8 : 0;
            const yOffset = count > 3 ? (idx % 2 === 0 ? -4 : 4) : 0;

            return (
              <text
                key={p.id}
                x={count > 3 ? xOffset / 1.5 : xOffset}
                y={yOffset}
                textAnchor="middle"
                fill="currentColor"
                className={`text-[5px] font-medium cursor-pointer hover:font-bold hover:fill-primary transition-all`}
                onClick={() => {
                  setSelectedPlanet(p);
                  setSelectedLagna(false);
                }}
              >
                {planetAbbreviations[p.id]}
                {p.retrograde ? (lang === "hi" ? "(व)" : "(R)") : ""}
              </text>
            );
          })}
        </g>
      </g>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start w-full">
      <Card className="w-full md:w-2/3 shadow-md border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {lang === "hi" ? "लग्न कुण्डली (D1)" : "D1 Rāśi Chart (Lagna)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-square max-w-[500px] mx-auto relative text-foreground">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
              <polygon
                points="50,0 100,50 50,100 0,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(renderHouseText)}
            </svg>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full md:w-1/3 shadow-sm bg-muted/20">
        <CardHeader>
          <CardTitle className="text-md">
            {lang === "hi" ? "चयन विवरण" : "Selection Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedPlanet && !selectedLagna ? (
            <p className="text-sm text-muted-foreground">
              {lang === "hi"
                ? "सटीक खगोलीय विवरण देखने के लिए चार्ट में किसी भी ग्रह या लग्न (Asc) पर टैप करें।"
                : "Tap any planet or the Ascendant (Asc) in the chart to view precise astronomical details."}
            </p>
          ) : selectedLagna ? (
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-primary">
                {lang === "hi" ? "लग्न" : "Lagna (Ascendant)"}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">
                  {lang === "hi" ? "राशि:" : "Rāśi (Sign):"}
                </span>
                <span className="font-medium">{signNames[chart.lagna.signIndex]}</span>

                <span className="text-muted-foreground">{lang === "hi" ? "अंश:" : "Degree:"}</span>
                <span className="font-medium">{chart.lagna.degreeInSign.toFixed(4)}°</span>

                <span className="text-muted-foreground">
                  {lang === "hi" ? "नक्षत्र:" : "Nakshatra:"}
                </span>
                <span className="font-medium">{chart.lagna.nakshatra}</span>

                <span className="text-muted-foreground">{lang === "hi" ? "चरण:" : "Pada:"}</span>
                <span className="font-medium">{chart.lagna.pada}</span>

                <span className="text-muted-foreground">
                  {lang === "hi" ? "स्पष्ट अंश:" : "Absolute Lon:"}
                </span>
                <span className="font-medium">{chart.lagna.longitude.toFixed(4)}°</span>
              </div>
            </div>
          ) : selectedPlanet ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-primary">
                  {lang === "hi"
                    ? planetNamesHi[selectedPlanet.id] || selectedPlanet.id
                    : selectedPlanet.id}
                </h3>
                {selectedPlanet.retrograde && (
                  <Badge variant="outline" className="text-xs">
                    {lang === "hi" ? "वक्री" : "Retrograde"}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">{lang === "hi" ? "भाव:" : "House:"}</span>
                <span className="font-medium">
                  {chart.houses.find((h) => h.signIndex === selectedPlanet.signIndex)?.houseIndex}
                </span>

                <span className="text-muted-foreground">
                  {lang === "hi" ? "राशि:" : "Rāśi (Sign):"}
                </span>
                <span className="font-medium">{signNames[selectedPlanet.signIndex]}</span>

                <span className="text-muted-foreground">{lang === "hi" ? "अंश:" : "Degree:"}</span>
                <span className="font-medium">{selectedPlanet.degreeInSign.toFixed(4)}°</span>

                <span className="text-muted-foreground">
                  {lang === "hi" ? "नक्षत्र:" : "Nakshatra:"}
                </span>
                <span className="font-medium">{selectedPlanet.nakshatra}</span>

                <span className="text-muted-foreground">{lang === "hi" ? "चरण:" : "Pada:"}</span>
                <span className="font-medium">{selectedPlanet.pada}</span>

                <span className="text-muted-foreground">
                  {lang === "hi" ? "स्पष्ट अंश:" : "Absolute Lon:"}
                </span>
                <span className="font-medium">{selectedPlanet.longitude.toFixed(4)}°</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
