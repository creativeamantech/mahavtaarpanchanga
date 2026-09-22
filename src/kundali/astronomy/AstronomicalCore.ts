import * as Astronomy from "astronomy-engine";
import {
  AstronomicalContext,
  CanonicalBodyId,
  CLASSICAL_NAVAGRAHA,
  LocationContext,
  PlanetaryPosition,
  SiderealPosition,
  TimeContext,
  LagnaPosition,
} from "./AstronomicalContext";
import { AyanamshaRegistry, normalize360 } from "./AyanamshaProvider";

/**
 * Astronomical Calculator: Single Source of Truth
 */
export class AstronomicalCore {
  /**
   * Constructs TimeContext safely with timezone normalization
   */
  public static createTimeContext(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timezone: string = "Asia/Kolkata",
  ): TimeContext {
    let safeTz = timezone || "Asia/Kolkata";
    let ms = Date.UTC(year, month - 1, day, hour, minute, second);

    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: safeTz,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      });

      for (let i = 0; i < 3; i++) {
        const parts = formatter.formatToParts(new Date(ms));
        const p: Record<string, string> = {};
        parts.forEach((part) => {
          p[part.type] = part.value;
        });

        const fYear = parseInt(p.year, 10);
        const fMonth = parseInt(p.month, 10);
        const fDay = parseInt(p.day, 10);
        let fHour = parseInt(p.hour, 10);
        if (fHour === 24) fHour = 0;
        const fMinute = parseInt(p.minute, 10);
        const fSecond = parseInt(p.second, 10);

        const diff =
          Date.UTC(year, month - 1, day, hour, minute, second) -
          Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute, fSecond);

        if (diff === 0 || isNaN(diff)) break;
        ms += diff;
      }
    } catch {
      safeTz = "Asia/Kolkata";
    }

    const date = new Date(ms);
    const astroTime = Astronomy.MakeTime(date);
    const julianDay = 2451545.0 + astroTime.ut;
    const centuriesSinceJ2000 = astroTime.ut / 36525.0;

    return {
      utcMs: ms,
      isoUtc: date.toISOString(),
      julianDay,
      centuriesSinceJ2000,
      astroTime,
      local: {
        year,
        month,
        day,
        hour,
        minute,
        second,
        timezone: safeTz,
        formattedTime: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`,
      },
    };
  }

  /**
   * Constructs LocationContext
   */
  public static createLocationContext(
    latitude: number,
    longitude: number,
    altitudeMeters: number = 0,
    cityName: string = "Custom Location",
    timezone: string = "Asia/Kolkata",
  ): LocationContext {
    return {
      latitude,
      longitude,
      altitudeMeters,
      cityName,
      timezone,
      observer: new Astronomy.Observer(latitude, longitude, altitudeMeters),
    };
  }

  /**
   * Calculates high-precision Ecliptic Tropical Coordinates for a body
   */
  public static calculatePlanetaryPosition(
    bodyId: CanonicalBodyId,
    t: Astronomy.AstroTime,
  ): PlanetaryPosition {
    // 1. Sun
    if (bodyId === "Sun") {
      const sunPos = Astronomy.SunPosition(t);
      const prevT = Astronomy.MakeTime(new Date(t.date.getTime() - 3600000));
      const prevSun = Astronomy.SunPosition(prevT);
      let diff = sunPos.elon - prevSun.elon;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const speed = diff * 24.0;

      // Equatorial
      const equ = Astronomy.Equator(Astronomy.Body.Sun, t.date, new Astronomy.Observer(0, 0, 0), true, true);

      return {
        id: "Sun",
        tropicalLongitude: normalize360(sunPos.elon),
        tropicalLatitude: 0,
        distanceAU: sunPos.dist_au || 1.0,
        speedDegPerDay: speed,
        isRetrograde: false,
        rightAscensionDeg: equ.ra * 15.0,
        declinationDeg: equ.dec,
      };
    }

    // 2. Moon
    if (bodyId === "Moon") {
      const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, t, true);
      const moonEcl = Astronomy.Ecliptic(moonGeo);
      const prevT = Astronomy.MakeTime(new Date(t.date.getTime() - 3600000));
      const prevMoonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, prevT, true);
      const prevEcl = Astronomy.Ecliptic(prevMoonGeo);
      let diff = moonEcl.elon - prevEcl.elon;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const speed = diff * 24.0;

      const equ = Astronomy.Equator(Astronomy.Body.Moon, t.date, new Astronomy.Observer(0, 0, 0), true, true);

      return {
        id: "Moon",
        tropicalLongitude: normalize360(moonEcl.elon),
        tropicalLatitude: moonEcl.elat,
        distanceAU: moonGeo.Length(),
        speedDegPerDay: speed,
        isRetrograde: false,
        rightAscensionDeg: equ.ra * 15.0,
        declinationDeg: equ.dec,
      };
    }

    // 3. Rahu & Ketu (Standard Mean Node polynomial)
    if (bodyId === "Rahu" || bodyId === "Ketu") {
      const T = t.ut / 36525.0;
      let rahuLon = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
      rahuLon = normalize360(rahuLon);
      const targetLon = bodyId === "Rahu" ? rahuLon : normalize360(rahuLon + 180.0);

      return {
        id: bodyId,
        tropicalLongitude: targetLon,
        tropicalLatitude: 0,
        distanceAU: 0.00257, // average Moon distance
        speedDegPerDay: -0.05295, // standard daily retrograde rate
        isRetrograde: true,
        rightAscensionDeg: targetLon,
        declinationDeg: 0,
      };
    }

    // 4. Other Planets (Mars, Mercury, Jupiter, Venus, Saturn, etc.)
    const bodyMap: Record<string, Astronomy.Body> = {
      Mars: Astronomy.Body.Mars,
      Mercury: Astronomy.Body.Mercury,
      Jupiter: Astronomy.Body.Jupiter,
      Venus: Astronomy.Body.Venus,
      Saturn: Astronomy.Body.Saturn,
      Uranus: Astronomy.Body.Uranus,
      Neptune: Astronomy.Body.Neptune,
      Pluto: Astronomy.Body.Pluto,
    };

    const astroBody = bodyMap[bodyId];
    if (!astroBody) {
      throw new Error(`Unsupported celestial body: ${bodyId}`);
    }

    const geoVector = Astronomy.GeoVector(astroBody, t, true);
    const ecliptic = Astronomy.Ecliptic(geoVector);

    // Compute Speed by delta over 1 hour
    const prevT = Astronomy.MakeTime(new Date(t.date.getTime() - 3600000));
    const prevGeo = Astronomy.GeoVector(astroBody, prevT, true);
    const prevEcl = Astronomy.Ecliptic(prevGeo);
    let diff = ecliptic.elon - prevEcl.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const speed = diff * 24.0;
    const isRetrograde = speed < 0;

    const equ = Astronomy.Equator(astroBody, t.date, new Astronomy.Observer(0, 0, 0), true, true);

    return {
      id: bodyId,
      tropicalLongitude: normalize360(ecliptic.elon),
      tropicalLatitude: ecliptic.elat,
      distanceAU: geoVector.Length(),
      speedDegPerDay: speed,
      isRetrograde,
      rightAscensionDeg: equ.ra * 15.0,
      declinationDeg: equ.dec,
    };
  }

  /**
   * Calculates Topocentric Lagna (Ascendant)
   */
  public static calculateLagna(
    t: Astronomy.AstroTime,
    lat: number,
    lon: number,
    ayanamsaDeg: number,
  ): LagnaPosition {
    const gmstHours = Astronomy.SiderealTime(t);
    const ramcDegrees = normalize360(gmstHours * 15.0 + lon);
    const lastHours = ramcDegrees / 15.0;
    
    // IAU standard formula for mean obliquity of ecliptic (Laskar / IAU 2000)
    const T = t.ut / 36525.0;
    const obliquityDegrees = 23.43929111 - ((46.815 + (0.00059 - 0.001813 * T) * T) * T) / 3600.0;

    const epsRad = (obliquityDegrees * Math.PI) / 180.0;
    const latRad = (lat * Math.PI) / 180.0;
    const ramcRad = (ramcDegrees * Math.PI) / 180.0;

    const sinRAMC = Math.sin(ramcRad);
    const cosRAMC = Math.cos(ramcRad);
    const sinEps = Math.sin(epsRad);
    const cosEps = Math.cos(epsRad);
    const tanLat = Math.tan(latRad);

    const y = -cosRAMC;
    const x = sinRAMC * cosEps + tanLat * sinEps;
    let ascRad = Math.atan2(y, x);
    if (ascRad < 0) ascRad += 2 * Math.PI;
    const tropAsc = normalize360((ascRad * 180.0) / Math.PI);
    const siderealAsc = normalize360(tropAsc - ayanamsaDeg);

    const signIndex = Math.floor(siderealAsc / 30.0);
    const degreeInSign = siderealAsc % 30.0;
    const exactNak = siderealAsc / (360.0 / 27.0);
    const nakIndex = Math.floor(exactNak) + 1;
    const pada = Math.floor((exactNak - Math.floor(exactNak)) * 4) + 1;

    return {
      tropicalAscendant: tropAsc,
      siderealAscendant: siderealAsc,
      signIndex,
      degreeInSign,
      nakshatraIndex: nakIndex,
      pada,
      gmstHours,
      lastHours,
      ramcDegrees,
      obliquityDegrees,
    };
  }

  /**
   * Builds Full Canonical Astronomical Context
   */
  public static buildContext(
    time: TimeContext,
    location: LocationContext,
    ayanamsaKey: string = "lahiri",
    bodies: CanonicalBodyId[] = CLASSICAL_NAVAGRAHA,
  ): AstronomicalContext {
    const provider = AyanamshaRegistry.get(ayanamsaKey);
    const ayanamsaDeg = provider.calculate(time.astroTime);

    const positions: Record<CanonicalBodyId, PlanetaryPosition> = {} as any;
    const siderealPositions: Record<CanonicalBodyId, SiderealPosition> = {} as any;

    for (const bodyId of bodies) {
      const pos = this.calculatePlanetaryPosition(bodyId, time.astroTime);
      positions[bodyId] = pos;

      const sidLon = normalize360(pos.tropicalLongitude - ayanamsaDeg);
      const signIndex = Math.floor(sidLon / 30.0);
      const degreeInSign = sidLon % 30.0;
      const exactNak = sidLon / (360.0 / 27.0);
      const nakIndex = Math.floor(exactNak) + 1;
      const pada = Math.floor((exactNak - Math.floor(exactNak)) * 4) + 1;

      siderealPositions[bodyId] = {
        id: bodyId,
        siderealLongitude: sidLon,
        signIndex,
        degreeInSign,
        nakshatraIndex: Math.min(27, Math.max(1, nakIndex)),
        pada: Math.min(4, Math.max(1, pada)),
        speedDegPerDay: pos.speedDegPerDay,
        isRetrograde: pos.isRetrograde,
      };
    }

    const lagna = this.calculateLagna(
      time.astroTime,
      location.latitude,
      location.longitude,
      ayanamsaDeg,
    );

    return {
      time,
      location,
      positions,
      lagna,
      ayanamsa: {
        system: provider.metadata.key,
        degrees: ayanamsaDeg,
        description: provider.metadata.nameEn,
      },
      siderealPositions,
    };
  }
}
