import * as Astronomy from "astronomy-engine";
import { KundliPlanet, ZODIAC_SIGNS } from "./kundliEngine";

export interface GocharaPlanetTransit {
  planetId: string;
  planetNameHi: string;
  planetNameEn: string;
  transitSignIndex: number;
  transitSignNameHi: string;
  transitDegree: number;
  isRetrograde: boolean;
  houseFromMoon: number; // 1 to 12
  houseFromLagna: number; // 1 to 12
  isFavorableFromMoon: boolean;
  hasVedha: boolean;
  vedhaPlanetName?: string;
  verdictHi: string;
  verdictEn: string;
  predictionHi: string;
  predictionEn: string;
}

export interface GocharaReport {
  transitDate: string;
  natalMoonSignIndex: number;
  natalMoonSignHi: string;
  natalLagnaSignIndex: number;
  natalLagnaSignHi: string;
  transits: GocharaPlanetTransit[];
  sadeSatiTransit: {
    inSadeSati: boolean;
    phase: string;
    phaseHi: string;
    descriptionHi: string;
  };
  summaryAdviceHi: string;
}

// Classical Favorable Houses from Natal Moon
const FAVORABLE_TRANSIT_HOUSES: Record<string, number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 11],
  Ketu: [3, 6, 11],
};

// Vedha pairs for planets [Benefic House -> Obstructing House]
const VEDHA_PAIRS: Record<string, Record<number, number>> = {
  Sun: { 3: 9, 6: 12, 10: 4, 11: 5 },
  Moon: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  Mars: { 3: 12, 6: 9, 11: 5 },
  Mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  Jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  Venus: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  Saturn: { 3: 12, 6: 9, 11: 5 },
};

export function computeGochara(
  natalMoonSignIndex: number,
  natalLagnaSignIndex: number,
  transitDate: Date = new Date(),
  latitude = 28.6139,
  longitude = 77.209
): GocharaReport {
  // Approximate Lahiri Ayanamsa for transit date
  const year = transitDate.getUTCFullYear();
  const ayanamsaDeg = 23.85 + (year - 2000) * 0.01397;

  const observer = new Astronomy.Observer(latitude, longitude, 0);

  const bodies: { id: string; nameEn: string; nameHi: string; body: Astronomy.Body }[] = [
    { id: "Sun", nameEn: "Sun", nameHi: "सूर्य", body: Astronomy.Body.Sun },
    { id: "Moon", nameEn: "Moon", nameHi: "चन्द्र", body: Astronomy.Body.Moon },
    { id: "Mars", nameEn: "Mars", nameHi: "मंगल", body: Astronomy.Body.Mars },
    { id: "Mercury", nameEn: "Mercury", nameHi: "बुध", body: Astronomy.Body.Mercury },
    { id: "Jupiter", nameEn: "Jupiter", nameHi: "गुरु", body: Astronomy.Body.Jupiter },
    { id: "Venus", nameEn: "Venus", nameHi: "शुक्र", body: Astronomy.Body.Venus },
    { id: "Saturn", nameEn: "Saturn", nameHi: "शनि", body: Astronomy.Body.Saturn },
  ];

  // Calculate planetary positions
  const transitPositions: { id: string; nameEn: string; nameHi: string; signIndex: number; degree: number; isRetro: boolean }[] = [];

  bodies.forEach((b) => {
    const equ_now = Astronomy.Equator(b.body, transitDate, observer, true, true);
    const ecl = Astronomy.Ecliptic(equ_now.vec);
    const tropicalDeg = ecl.elon;
    const siderealDeg = ((tropicalDeg - ayanamsaDeg) % 360 + 360) % 360;
    const signIndex = Math.floor(siderealDeg / 30);
    const degree = siderealDeg % 30;

    // Check retro
    const nextDate = new Date(transitDate.getTime() + 86400000);
    const nextEqu = Astronomy.Equator(b.body, nextDate, observer, true, true);
    const nextEcl = Astronomy.Ecliptic(nextEqu.vec);
    const isRetro = nextEcl.elon < tropicalDeg && b.id !== "Sun" && b.id !== "Moon";

    transitPositions.push({
      id: b.id,
      nameEn: b.nameEn,
      nameHi: b.nameHi,
      signIndex,
      degree,
      isRetro,
    });
  });

  // Calculate Rahu/Ketu Mean Node
  const moonNode = Astronomy.MoonNode(transitDate);
  const tropicalRahu = moonNode ? (moonNode.node_ecl.elon + 360) % 360 : 0;
  const siderealRahu = ((tropicalRahu - ayanamsaDeg) % 360 + 360) % 360;
  const rahuSign = Math.floor(siderealRahu / 30);
  const ketuSign = (rahuSign + 6) % 12;

  transitPositions.push({
    id: "Rahu",
    nameEn: "Rahu",
    nameHi: "राहु",
    signIndex: rahuSign,
    degree: siderealRahu % 30,
    isRetro: true,
  });

  transitPositions.push({
    id: "Ketu",
    nameEn: "Ketu",
    nameHi: "केतु",
    signIndex: ketuSign,
    degree: siderealRahu % 30,
    isRetro: true,
  });

  // Map to house from Moon and house from Lagna
  const transits: GocharaPlanetTransit[] = transitPositions.map((tp) => {
    const houseFromMoon = ((tp.signIndex - natalMoonSignIndex + 12) % 12) + 1;
    const houseFromLagna = ((tp.signIndex - natalLagnaSignIndex + 12) % 12) + 1;

    const favorableHouses = FAVORABLE_TRANSIT_HOUSES[tp.id] || [];
    const isFavorable = favorableHouses.includes(houseFromMoon);

    // Check Vedha
    let hasVedha = false;
    let vedhaPlanetName: string | undefined;

    if (isFavorable && VEDHA_PAIRS[tp.id]) {
      const obstructingHouse = VEDHA_PAIRS[tp.id][houseFromMoon];
      if (obstructingHouse) {
        const obstructingSign = (natalMoonSignIndex + (obstructingHouse - 1)) % 12;
        const obstacle = transitPositions.find(
          (other) => other.id !== tp.id && other.id !== "Sun" && other.signIndex === obstructingSign
        );
        if (obstacle) {
          hasVedha = true;
          vedhaPlanetName = obstacle.nameHi;
        }
      }
    }

    let verdictHi = isFavorable ? (hasVedha ? "शुभ (वेध प्रभावित)" : "शुभ एवं फलदायी") : "सामान्य / संघर्षपूर्ण";
    let verdictEn = isFavorable ? (hasVedha ? "Benefic (Obstructed by Vedha)" : "Favorable & Benefic") : "Challenging / Inauspicious";

    let predictionHi = "";
    let predictionEn = "";

    if (tp.id === "Jupiter") {
      if ([2, 5, 7, 9, 11].includes(houseFromMoon)) {
        predictionHi = `गुरु का ${houseFromMoon}वें भाव में गोचर ज्ञान, धन लाभ, पारिवारिक सुख और भाग्य वृद्धि कराएगा।`;
        predictionEn = `Jupiter in ${houseFromMoon}th brings fortune, wealth, family harmony, and wisdom.`;
      } else {
        predictionHi = `गुरु का ${houseFromMoon}वें भाव में गोचर मध्यम है; व्यय व स्वास्थ्य पर ध्यान दें।`;
        predictionEn = `Jupiter transit in ${houseFromMoon}th advises cautious spending and health care.`;
      }
    } else if (tp.id === "Saturn") {
      if ([3, 6, 11].includes(houseFromMoon)) {
        predictionHi = `शनि का ${houseFromMoon}वें भाव में गोचर शत्रुओं पर विजय, पदोन्नति एवं आर्थिक संबल प्रदान करेगा।`;
        predictionEn = `Saturn in ${houseFromMoon}th destroys obstacles and brings professional elevation.`;
      } else {
        predictionHi = `शनि का ${houseFromMoon}वें भाव में गोचर कठोर परिश्रम और संयम की परीक्षा लेगा।`;
        predictionEn = `Saturn in ${houseFromMoon}th demands discipline and patient effort.`;
      }
    } else if (tp.id === "Sun") {
      if (isFavorable) {
        predictionHi = `सूर्य का ${houseFromMoon}वें भाव में गोचर मान-सम्मान, राजकीय कार्य सिद्धि व ओज प्रदान करेगा।`;
        predictionEn = `Sun in ${houseFromMoon}th grants authority, health, and career success.`;
      } else {
        predictionHi = `सूर्य का गोचर क्रोध व पित्त विकारों से बचने का संकेत देता है।`;
        predictionEn = `Sun transit advises controlling anger and maintaining vital balance.`;
      }
    } else {
      predictionHi = isFavorable
        ? `${tp.nameHi} का ${houseFromMoon}वें भाव में गोचर अनुकूल परिणाम दे रहा है।`
        : `${tp.nameHi} का ${houseFromMoon}वें भाव में गोचर सामान्य सावधानी का संकेत है।`;
      predictionEn = `${tp.nameEn} transit in ${houseFromMoon}th house indicates ${isFavorable ? "benefic" : "moderate"} results.`;
    }

    return {
      planetId: tp.id,
      planetNameHi: tp.nameHi,
      planetNameEn: tp.nameEn,
      transitSignIndex: tp.signIndex,
      transitSignNameHi: ZODIAC_SIGNS[tp.signIndex].hi,
      transitDegree: tp.degree,
      isRetrograde: tp.isRetro,
      houseFromMoon,
      houseFromLagna,
      isFavorableFromMoon: isFavorable && !hasVedha,
      hasVedha,
      vedhaPlanetName,
      verdictHi,
      verdictEn,
      predictionHi,
      predictionEn,
    };
  });

  // Sade Sati Live Transit Evaluation
  const saturnTransit = transitPositions.find((p) => p.id === "Saturn");
  const saturnSign = saturnTransit ? saturnTransit.signIndex : 10;
  const diffMoonSaturn = ((saturnSign - natalMoonSignIndex + 12) % 12);

  let inSadeSati = false;
  let phase = "none";
  let phaseHi = "साढ़े साती प्रभाव नहीं";
  let descHi = "वर्तमान में शनि साढ़े साती का प्रभाव नहीं है।";

  if (diffMoonSaturn === 11) {
    inSadeSati = true;
    phase = "rising";
    phaseHi = "प्रथम चरण (उदय मान)";
    descHi = "शनि जन्म चन्द्रमा से १२वें भाव में गोचररत हैं। आर्थिक योजना और व्यय पर नियंत्रण रखें।";
  } else if (diffMoonSaturn === 0) {
    inSadeSati = true;
    phase = "peak";
    phaseHi = "द्वितीय चरण (शिखर काल)";
    descHi = "शनि जन्म चन्द्रमा पर गोचररत हैं। मानसिक धैर्य, ध्यान एवं हनुमान चालीसा का पाठ हितकर है।";
  } else if (diffMoonSaturn === 1) {
    inSadeSati = true;
    phase = "setting";
    phaseHi = "तृतीय चरण (अस्त मान)";
    descHi = "शनि जन्म चन्द्रमा से द्वितीय भाव में गोचररत हैं। वाणी संयम व संचित धन सुरक्षा आवश्यक है।";
  } else if (diffMoonSaturn === 3) {
    phase = "kantaka";
    phaseHi = "कंटक शनि (चतुर्थ ढैय्या)";
    descHi = "शनि चतुर्थ भाव में गोचर कर रहे हैं। माता के स्वास्थ्य व गृह शांति का ध्यान रखें।";
  } else if (diffMoonSaturn === 7) {
    phase = "ashtama";
    phaseHi = "अष्टम शनि (अष्टम ढैय्या)";
    descHi = "शनि अष्टम भाव में गोचररत हैं। वाहन सावधानी व नित्य शनि स्तोत्र पाठ करें।";
  }

  return {
    transitDate: transitDate.toISOString().split("T")[0],
    natalMoonSignIndex,
    natalMoonSignHi: ZODIAC_SIGNS[natalMoonSignIndex].hi,
    natalLagnaSignIndex,
    natalLagnaSignHi: ZODIAC_SIGNS[natalLagnaSignIndex].hi,
    transits,
    sadeSatiTransit: {
      inSadeSati,
      phase,
      phaseHi,
      descriptionHi: descHi,
    },
    summaryAdviceHi:
      "गोचर ग्रह फल सदैव जातक की वर्तमान विंशोत्तरी महादशा व अन्तर्दशा के साथ समन्वित होकर फलित होते हैं।",
  };
}
