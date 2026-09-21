import React, { useState } from "react";
import {
  FullKundliData,
  KundliChartType,
  KundliChartStyle,
  KundliPlanet,
  KundliHouse,
  ZODIAC_SIGNS,
} from "../lib/kundliEngine";
import { Sparkles, Info, Eye, Layers, Compass, ZoomIn, ZoomOut, Check, ChevronRight } from "lucide-react";

interface KundliChartRendererProps {
  kundliData: FullKundliData;
  activeChartType: KundliChartType;
  chartStyle: KundliChartStyle;
  showDegrees?: boolean;
  onSelectHouse?: (house: KundliHouse) => void;
  onSelectPlanet?: (planet: KundliPlanet) => void;
  selectedHouseNumber?: number | null;
  chartSize?: "standard" | "large" | "compact";
}

export const KundliChartRenderer: React.FC<KundliChartRendererProps> = ({
  kundliData,
  activeChartType,
  chartStyle,
  showDegrees = true,
  onSelectHouse,
  onSelectPlanet,
  selectedHouseNumber,
  chartSize = "standard",
}) => {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  // Select the appropriate house layout based on active chart type
  let currentHouses: KundliHouse[] = kundliData.housesD1;
  let chartTitle = "लग्न कुण्डली (D1 - Birth Chart)";
  let chartSubtitle = "मूल जन्म चक्र (Rasi Chart) - शारीरिक संरचना, स्वभाव, स्वास्थ्य एवं जीवन का आधार";

  if (activeChartType === "d9") {
    currentHouses = kundliData.housesD9;
    chartTitle = "नवांश कुण्डली (D9 - Navamsha)";
    chartSubtitle = "धर्म, भाग्य, जीवनसाथी, वैवाहिक सुख एवं उत्तरार्ध जीवन का सूक्ष्म चक्र";
  } else if (activeChartType === "chandra") {
    currentHouses = kundliData.housesChandra;
    chartTitle = "चन्द्र कुण्डली (Chandra Lagna)";
    chartSubtitle = "मन, भावनाएं, मानसिक शांति, माता एवं जनसम्पर्क का विश्लेषण";
  } else if (activeChartType === "surya") {
    currentHouses = kundliData.housesSurya;
    chartTitle = "सूर्य कुण्डली (Surya Lagna)";
    chartSubtitle = "आत्मबल, पिता, मान-सम्मान, प्रतिष्ठा एवं आत्मिक तेज का चक्र";
  } else if (activeChartType === "d10") {
    currentHouses = kundliData.housesD10 || kundliData.housesD1;
    chartTitle = "दशांश कुण्डली (D10 - Dashamsha)";
    chartSubtitle = "कार्यक्षेत्र, व्यवसाय, आजीविका, प्रसिद्धि एवं कर्मफल का सूक्ष्म विश्लेषण";
  } else if (activeChartType === "chalit") {
    currentHouses = kundliData.housesChalit || kundliData.housesD1;
    chartTitle = "भाव चलित कुण्डली (Bhava Chalita)";
    chartSubtitle = "भाव-मध्य व भाव-संधि आधारित वास्तविक ग्रह स्थिति एवं भाव फल";
  }

  // Active inspected house is selectedHouseNumber or hoveredHouse or House 1
  const inspectedHouseNum = hoveredHouse || selectedHouseNumber || 1;
  const inspectedHouse = currentHouses[inspectedHouseNum - 1] || currentHouses[0];

  // North Indian Chart House Polygon Coordinates for 400x400 SVG
  // Diamond Center: (200, 200)
  // House 1 (Top Center Diamond): (200,0) -> (300,100) -> (200,200) -> (100,100)
  // House 2 (Top Left Triangle): (0,0) -> (200,0) -> (100,100)
  // House 3 (Left Top Triangle): (0,0) -> (100,100) -> (0,200)
  // House 4 (Left Center Diamond): (0,200) -> (100,100) -> (200,200) -> (100,300)
  // House 5 (Left Bottom Triangle): (0,200) -> (100,300) -> (0,400)
  // House 6 (Bottom Left Triangle): (0,400) -> (100,300) -> (200,400)
  // House 7 (Bottom Center Diamond): (200,200) -> (300,300) -> (200,400) -> (100,300)
  // House 8 (Bottom Right Triangle): (200,400) -> (300,300) -> (400,400)
  // House 9 (Right Bottom Triangle): (400,400) -> (300,300) -> (400,200)
  // House 10 (Right Center Diamond): (200,200) -> (300,100) -> (400,200) -> (300,300)
  // House 11 (Right Top Triangle): (400,200) -> (300,100) -> (400,0)
  // House 12 (Top Right Triangle): (400,0) -> (300,100) -> (200,0)

  const northHousePolygons: {
    points: string;
    center: { x: number; y: number };
    signPos: { x: number; y: number };
    isKendra: boolean;
    isTrikona: boolean;
  }[] = [
    // House 1 (Kendra & Trikona)
    { points: "200,0 300,100 200,200 100,100", center: { x: 200, y: 110 }, signPos: { x: 200, y: 32 }, isKendra: true, isTrikona: true },
    // House 2
    { points: "0,0 200,0 100,100", center: { x: 100, y: 48 }, signPos: { x: 50, y: 24 }, isKendra: false, isTrikona: false },
    // House 3
    { points: "0,0 100,100 0,200", center: { x: 48, y: 100 }, signPos: { x: 22, y: 55 }, isKendra: false, isTrikona: false },
    // House 4 (Kendra)
    { points: "0,200 100,100 200,200 100,300", center: { x: 105, y: 200 }, signPos: { x: 38, y: 200 }, isKendra: true, isTrikona: false },
    // House 5 (Trikona)
    { points: "0,200 100,300 0,400", center: { x: 48, y: 300 }, signPos: { x: 22, y: 345 }, isKendra: false, isTrikona: true },
    // House 6
    { points: "0,400 100,300 200,400", center: { x: 100, y: 352 }, signPos: { x: 50, y: 376 }, isKendra: false, isTrikona: false },
    // House 7 (Kendra)
    { points: "200,200 300,300 200,400 100,300", center: { x: 200, y: 290 }, signPos: { x: 200, y: 368 }, isKendra: true, isTrikona: false },
    // House 8
    { points: "200,400 300,300 400,400", center: { x: 300, y: 352 }, signPos: { x: 350, y: 376 }, isKendra: false, isTrikona: false },
    // House 9 (Trikona)
    { points: "400,400 300,300 400,200", center: { x: 352, y: 300 }, signPos: { x: 378, y: 345 }, isKendra: false, isTrikona: true },
    // House 10 (Kendra)
    { points: "200,200 300,100 400,200 300,300", center: { x: 295, y: 200 }, signPos: { x: 362, y: 200 }, isKendra: true, isTrikona: false },
    // House 11
    { points: "400,200 300,100 400,0", center: { x: 352, y: 100 }, signPos: { x: 378, y: 55 }, isKendra: false, isTrikona: false },
    // House 12
    { points: "400,0 300,100 200,0", center: { x: 300, y: 48 }, signPos: { x: 350, y: 24 }, isKendra: false, isTrikona: false },
  ];

  // South Indian Grid coordinates (12 fixed rasis in clockwise grid)
  const southGridCells: { signIndex: number; col: number; row: number }[] = [
    { signIndex: 11, col: 0, row: 0 }, // Pisces (मीन)
    { signIndex: 0, col: 1, row: 0 }, // Aries (मेष)
    { signIndex: 1, col: 2, row: 0 }, // Taurus (वृषभ)
    { signIndex: 2, col: 3, row: 0 }, // Gemini (मिथुन)
    { signIndex: 3, col: 3, row: 1 }, // Cancer (कर्क)
    { signIndex: 4, col: 3, row: 2 }, // Leo (सिंह)
    { signIndex: 5, col: 3, row: 3 }, // Virgo (कन्या)
    { signIndex: 6, col: 2, row: 3 }, // Libra (तुला)
    { signIndex: 7, col: 1, row: 3 }, // Scorpio (वृश्चिक)
    { signIndex: 8, col: 0, row: 3 }, // Sagittarius (धनु)
    { signIndex: 9, col: 0, row: 2 }, // Capricorn (मकर)
    { signIndex: 10, col: 0, row: 1 }, // Aquarius (कुम्भ)
  ];

  // Container width styling based on chartSize
  const chartContainerClass =
    chartSize === "large"
      ? "w-full max-w-[540px]"
      : chartSize === "compact"
      ? "w-full max-w-[340px]"
      : "w-full max-w-[440px]";

  return (
    <div className="bg-gradient-to-b from-stone-950/90 via-amber-950/40 to-stone-950/90 rounded-2xl sm:rounded-3xl border border-amber-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-amber-500/20 gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 className="text-base sm:text-xl font-black text-amber-100 tracking-tight">
              {chartTitle}
            </h3>
          </div>
          <p className="text-xs text-amber-300/80 mt-0.5">{chartSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="bg-amber-900/50 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            {chartStyle === "north" ? "उत्तर भारतीय (Diamond)" : "दक्षिण भारतीय (Square)"}
          </span>
          {showDegrees && (
            <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium hidden sm:inline-block">
              डिग्री दृश्य सक्रिय
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Chart on Left, Enriched Inspector Panel on Right */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chart SVG Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className={`${chartContainerClass} aspect-square relative select-none`}>
            {chartStyle === "north" ? (
              /* ================= NORTH INDIAN DIAMOND SVG ================= */
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full drop-shadow-2xl select-none"
                style={{ filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.6))" }}
              >
                <defs>
                  {/* Rich Royal Vedic Background */}
                  <linearGradient id="northBgGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1c0f08" />
                    <stop offset="45%" stopColor="#2c160a" />
                    <stop offset="100%" stopColor="#140a05" />
                  </linearGradient>

                  {/* Kendra (Vishnu Sthan) Houses Glow */}
                  <linearGradient id="kendraGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#b45309" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0.08" />
                  </linearGradient>

                  {/* Trikona (Lakshmi Sthan) Houses Glow */}
                  <linearGradient id="trikonaGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#92400e" stopOpacity="0.06" />
                  </linearGradient>

                  {/* Selected / Hovered House Gradient */}
                  <linearGradient id="activeHouseGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.3" />
                  </linearGradient>

                  <linearGradient id="hoverHouseGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0.18" />
                  </linearGradient>
                </defs>

                {/* Main Outer Background */}
                <rect width="400" height="400" fill="url(#northBgGrad)" rx="14" />

                {/* 12 House Polygons */}
                {northHousePolygons.map((poly, idx) => {
                  const houseNum = idx + 1;
                  const houseData = currentHouses[idx];
                  const isSelected = selectedHouseNumber === houseNum;
                  const isHovered = hoveredHouse === houseNum;
                  const signNumber = houseData ? houseData.signIndex + 1 : idx + 1;
                  const signInfo = ZODIAC_SIGNS[houseData ? houseData.signIndex : idx];

                  // Fill color logic
                  let fillUrl = "transparent";
                  if (isSelected) {
                    fillUrl = "url(#activeHouseGrad)";
                  } else if (isHovered) {
                    fillUrl = "url(#hoverHouseGrad)";
                  } else if (poly.isKendra) {
                    fillUrl = "url(#kendraGrad)";
                  } else if (poly.isTrikona) {
                    fillUrl = "url(#trikonaGrad)";
                  }

                  return (
                    <g
                      key={`north-house-${houseNum}`}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => onSelectHouse && houseData && onSelectHouse(houseData)}
                      onMouseEnter={() => setHoveredHouse(houseNum)}
                      onMouseLeave={() => setHoveredHouse(null)}
                    >
                      {/* House Area */}
                      <polygon
                        points={poly.points}
                        fill={fillUrl}
                        stroke={isSelected ? "#f59e0b" : "transparent"}
                        strokeWidth={isSelected ? "2" : "0"}
                        className="transition-colors duration-150"
                      />

                      {/* Zodiac Sign Number (1 to 12) */}
                      <circle
                        cx={poly.signPos.x}
                        cy={poly.signPos.y}
                        r="10"
                        fill="#2b170c"
                        stroke="#b45309"
                        strokeWidth="1"
                        className="opacity-90"
                      />
                      <text
                        x={poly.signPos.x}
                        y={poly.signPos.y + 1}
                        fill="#fbbf24"
                        fontSize="11"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="select-none pointer-events-none font-mono"
                      >
                        {signNumber}
                      </text>

                      {/* House 1 Ascendant Identifier Pill */}
                      {houseNum === 1 && (
                        <g className="pointer-events-none select-none">
                          <rect
                            x={poly.center.x - 34}
                            y={poly.center.y - 38}
                            width="68"
                            height="18"
                            rx="9"
                            fill="#78350f"
                            stroke="#fbbf24"
                            strokeWidth="1"
                          />
                          <text
                            x={poly.center.x}
                            y={poly.center.y - 28}
                            fill="#fef3c7"
                            fontSize="9.5"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            letterSpacing="0.5"
                          >
                            {activeChartType === "d9"
                              ? "नवांश लग्न"
                              : activeChartType === "chandra"
                              ? "चन्द्र लग्न"
                              : activeChartType === "surya"
                              ? "सूर्य लग्न"
                              : "लग्न (Asc)"}
                          </text>
                        </g>
                      )}

                      {/* Residing Planets in this House */}
                      {houseData && houseData.planets.length > 0 && (
                        <g className="pointer-events-none select-none">
                          {houseData.planets.map((planet, pIdx) => {
                            const count = houseData.planets.length;
                            // Vertical spacing calculation for multi-planet houses
                            const rowHeight = showDegrees ? 17 : 15;
                            const yStart =
                              poly.center.y +
                              (houseNum === 1 ? -4 : -(count - 1) * (rowHeight / 2));
                            const posY = yStart + pIdx * rowHeight;

                            // Color coding per dignity
                            let planetColor = "#fef08a"; // Default yellow-gold
                            let dignityBadge = "";
                            if (planet.dignity === "exalted") {
                              planetColor = "#34d399"; // Emerald Exalted
                              dignityBadge = "↑";
                            } else if (planet.dignity === "debilitated") {
                              planetColor = "#f87171"; // Coral Debilitated
                              dignityBadge = "↓";
                            } else if (planet.dignity === "own") {
                              planetColor = "#60a5fa"; // Blue Own Sign
                              dignityBadge = "★";
                            }

                            // Degree text format (e.g. 14°22')
                            const degStr = showDegrees
                              ? `${planet.degreeInSign.toFixed(0)}°`
                              : "";

                            return (
                              <g key={planet.id}>
                                <text
                                  x={poly.center.x}
                                  y={posY}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill={planetColor}
                                  fontSize={count > 3 ? "10" : "11"}
                                  fontWeight="700"
                                  className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                                >
                                  {planet.nameHi}
                                  {planet.isRetrograde ? "(व)" : ""}
                                  {planet.isCombust ? "*" : ""}
                                  {dignityBadge}
                                  {showDegrees ? ` ${degStr}` : ""}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Golden Geometry Lines */}
                <g
                  stroke="#d97706"
                  strokeWidth="1.8"
                  strokeOpacity="0.9"
                  strokeLinecap="round"
                  className="pointer-events-none"
                >
                  {/* Outer Square Border */}
                  <rect
                    x="2"
                    y="2"
                    width="396"
                    height="396"
                    rx="14"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeOpacity="0.9"
                  />
                  {/* Main Diagonals */}
                  <line x1="0" y1="0" x2="400" y2="400" />
                  <line x1="400" y1="0" x2="0" y2="400" />
                  {/* Diamond Intersections */}
                  <line x1="200" y1="0" x2="0" y2="200" />
                  <line x1="0" y1="200" x2="200" y2="400" />
                  <line x1="200" y1="400" x2="400" y2="200" />
                  <line x1="400" y1="200" x2="200" y2="0" />
                </g>
              </svg>
            ) : (
              /* ================= SOUTH INDIAN SQUARE SVG ================= */
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full drop-shadow-2xl select-none"
                style={{ filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.6))" }}
              >
                <defs>
                  <linearGradient id="southBgGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1c0f08" />
                    <stop offset="50%" stopColor="#2b160a" />
                    <stop offset="100%" stopColor="#140a05" />
                  </linearGradient>
                  <linearGradient id="southActive" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                <rect width="400" height="400" fill="url(#southBgGrad)" rx="14" />

                {/* 12 Rasi Cells */}
                {southGridCells.map((cell) => {
                  const sMeta = ZODIAC_SIGNS[cell.signIndex];
                  const houseData = currentHouses.find((h) => h.signIndex === cell.signIndex);
                  const x = cell.col * 100;
                  const y = cell.row * 100;
                  const isLagnaSign = houseData && houseData.houseNumber === 1;
                  const isSelected = houseData && selectedHouseNumber === houseData.houseNumber;
                  const isHovered = houseData && hoveredHouse === houseData.houseNumber;

                  return (
                    <g
                      key={`south-cell-${cell.signIndex}`}
                      className="cursor-pointer"
                      onClick={() => onSelectHouse && houseData && onSelectHouse(houseData)}
                      onMouseEnter={() => houseData && setHoveredHouse(houseData.houseNumber)}
                      onMouseLeave={() => setHoveredHouse(null)}
                    >
                      {/* Cell Area */}
                      <rect
                        x={x}
                        y={y}
                        width="100"
                        height="100"
                        fill={
                          isSelected
                            ? "url(#southActive)"
                            : isHovered
                            ? "rgba(217, 119, 6, 0.25)"
                            : isLagnaSign
                            ? "rgba(180, 83, 9, 0.2)"
                            : "transparent"
                        }
                        stroke="#d97706"
                        strokeWidth="1.2"
                      />

                      {/* Rasi Name & Index */}
                      <text
                        x={x + 6}
                        y={y + 16}
                        fill="#fbbf24"
                        fontSize="10"
                        fontWeight="bold"
                        className="select-none"
                      >
                        {sMeta.hi} ({cell.signIndex + 1})
                      </text>

                      {/* Lagna Diagonal Marker */}
                      {isLagnaSign && (
                        <g>
                          <line
                            x1={x}
                            y1={y}
                            x2={x + 100}
                            y2={y + 100}
                            stroke="#fbbf24"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                            className="opacity-60"
                          />
                          <rect
                            x={x + 62}
                            y={y + 4}
                            width="34"
                            height="16"
                            rx="4"
                            fill="#78350f"
                            stroke="#fbbf24"
                            strokeWidth="1"
                          />
                          <text
                            x={x + 79}
                            y={y + 15}
                            fill="#fef3c7"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            लग्न
                          </text>
                        </g>
                      )}

                      {/* House Number Relative to Lagna */}
                      {houseData && (
                        <text
                          x={x + 94}
                          y={y + 92}
                          fill="#d97706"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="end"
                          className="opacity-75 select-none"
                        >
                          H{houseData.houseNumber}
                        </text>
                      )}

                      {/* Occupant Planets in this Sign */}
                      {houseData && houseData.planets.length > 0 && (
                        <g>
                          {houseData.planets.map((planet, pIdx) => {
                            let planetColor = "#fef08a";
                            let dignityBadge = "";
                            if (planet.dignity === "exalted") {
                              planetColor = "#34d399";
                              dignityBadge = "↑";
                            } else if (planet.dignity === "debilitated") {
                              planetColor = "#f87171";
                              dignityBadge = "↓";
                            } else if (planet.dignity === "own") {
                              planetColor = "#60a5fa";
                              dignityBadge = "★";
                            }

                            const degStr = showDegrees
                              ? ` ${planet.degreeInSign.toFixed(0)}°`
                              : "";

                            return (
                              <text
                                key={planet.id}
                                x={x + 50}
                                y={y + 36 + pIdx * 15}
                                textAnchor="middle"
                                fill={planetColor}
                                fontSize="10.5"
                                fontWeight="700"
                                className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                              >
                                {planet.nameHi}
                                {planet.isRetrograde ? "(व)" : ""}
                                {dignityBadge}
                                {degStr}
                              </text>
                            );
                          })}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Center Courtyard Box */}
                <rect
                  x="100"
                  y="100"
                  width="200"
                  height="200"
                  fill="#170c06"
                  stroke="#d97706"
                  strokeWidth="2"
                />
                <circle cx="200" cy="200" r="70" fill="none" stroke="#78350f" strokeWidth="1" strokeDasharray="3 3" />
                <text
                  x="200"
                  y="180"
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="15"
                  fontWeight="bold"
                  letterSpacing="0.5"
                >
                  {chartTitle.split("(")[0].trim()}
                </text>
                <text
                  x="200"
                  y="204"
                  textAnchor="middle"
                  fill="#fde68a"
                  fontSize="12"
                  fontWeight="600"
                >
                  {kundliData.profile.name}
                </text>
                <text
                  x="200"
                  y="226"
                  textAnchor="middle"
                  fill="#d97706"
                  fontSize="10"
                  className="font-mono"
                >
                  {kundliData.profile.birthDate} • {kundliData.profile.cityName.split(",")[0]}
                </text>

                {/* Outer Border */}
                <rect
                  x="2"
                  y="2"
                  width="396"
                  height="396"
                  rx="14"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                />
              </svg>
            )}
          </div>

          {/* Quick Chart Legends Underneath */}
          <div className="mt-3 flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-[11px] text-amber-200/90 font-medium">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>उच्च (Exalted ↑)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span>नीच (Debilitated ↓)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span>स्वराशि (Own ★)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-300 font-bold">(व)</span>
              <span>वक्री (Retrograde)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-300 font-bold">*</span>
              <span>अस्त (Combust)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive House Inspector Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm sm:text-base font-bold text-amber-100">
                  भाव सूक्ष्म विश्लेषक (House Inspector)
                </h4>
              </div>
              <span className="bg-amber-800/60 text-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-400/40">
                {inspectedHouse.houseNumber}म भाव
              </span>
            </div>

            {/* Inspected House Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-semibold">भाव नाम (Sanskrit):</span>
                <span className="text-amber-100 font-bold text-sm">
                  {inspectedHouse.nameSanskrit} ({inspectedHouse.houseNumber}th House)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-semibold">राशि व भावेश (Sign & Lord):</span>
                <span className="text-amber-200 font-bold">
                  {inspectedHouse.signNameHi} (स्वामी: {inspectedHouse.lordHi})
                </span>
              </div>

              <div className="p-2.5 bg-amber-950/50 rounded-xl border border-amber-500/15 text-amber-200/90 leading-relaxed text-[11px] sm:text-xs">
                {inspectedHouse.significanceHi}
              </div>

              {/* Occupant Planets in Inspected House */}
              <div className="pt-2 border-t border-amber-500/15 space-y-1.5">
                <span className="text-amber-300 font-semibold block">
                  स्थित ग्रह ({inspectedHouse.planets.length}):
                </span>
                {inspectedHouse.planets.length > 0 ? (
                  <div className="space-y-1.5">
                    {inspectedHouse.planets.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-stone-950/80 border border-amber-500/20 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">{p.symbol}</span>
                          <span className="font-bold text-amber-100">{p.nameHi}</span>
                          {p.isRetrograde && (
                            <span className="text-[10px] bg-amber-800 text-amber-200 px-1 rounded">वक्री</span>
                          )}
                          {p.isCombust && (
                            <span className="text-[10px] bg-rose-900 text-rose-200 px-1 rounded">अस्त</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-amber-200 font-semibold">
                            {p.degreeInSign.toFixed(2)}°
                          </span>
                          <span className="text-[10px] text-amber-400/80 block">
                            {p.nakshatraNameHi} (पाद {p.pada})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-amber-400/60 italic p-2 bg-stone-950/40 rounded-lg border border-amber-500/10">
                    इस भाव में कोई ग्रह प्रत्यक्ष रूप से स्थित नहीं है।
                  </div>
                )}
              </div>

              {/* Aspecting Planets (दृष्टि प्रभाव) */}
              <div className="pt-2 border-t border-amber-500/15 space-y-1">
                <span className="text-amber-300 font-semibold block">
                  दृष्टि डालने वाले ग्रह ({inspectedHouse.aspectingPlanets.length}):
                </span>
                {inspectedHouse.aspectingPlanets.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {inspectedHouse.aspectingPlanets.map((p) => (
                      <span
                        key={p.id}
                        className="bg-amber-900/40 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-medium"
                      >
                        {p.nameHi} ({p.nameEn})
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-400/60 italic">
                    किसी भी प्रत्यक्ष ग्रह की पूर्ण दृष्टि नहीं है।
                  </span>
                )}
              </div>
            </div>

            {/* Click to inspect prompt */}
            <div className="pt-2 text-[11px] text-amber-300/60 flex items-center justify-between">
              <span>चार्ट में किसी भी भाव पर क्लिक करें</span>
              <span className="text-amber-400 font-mono">1 - 12 भाव</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
