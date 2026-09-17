import { describe, it, expect } from "vitest";
import {
  computeTithiTattvaPeriods,
  TITHI_ELEMENT_MAPPING,
  getCanonicalNadiAtTime,
} from "./tithiTattvaEngine";
import { PanchangaResponse } from "../types";

describe("Tithi Tattva Engine", () => {
  it("Element mapping matches the spec", () => {
    expect(TITHI_ELEMENT_MAPPING[1]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[2]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[3]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[4]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[5]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[6]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[7]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[8]).toBe("akash");
    expect(TITHI_ELEMENT_MAPPING[9]).toBe("vayu");
    expect(TITHI_ELEMENT_MAPPING[10]).toBe("vayu");
    expect(TITHI_ELEMENT_MAPPING[11]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[12]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[13]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[14]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[15]).toBe("prithvi");
  });

  it("Boundary Tests and Period Computation", () => {
    // Mock PanchangaResponse
    const mockPanchanga: any = {
      timezone: "Asia/Kolkata",
      sunrise: "06:00",
      sunset: "18:00",
      moonrise: "12:00",
      moonset: "23:00",
      tithi: [
        {
          number: 3,
          name: "Tritiya",
          startTimeMs: 1700000000000,
          endTimeMs: 1700080000000,
        },
        {
          number: 4,
          name: "Chaturthi",
          startTimeMs: 1700080000000,
          endTimeMs: 1700160000000,
        },
        {
          number: 26, // Krishna 11
          name: "Krishna Ekadasi",
          startTimeMs: 1700160000000,
          endTimeMs: 1700240000000,
        },
      ],
    };

    const periods = computeTithiTattvaPeriods(mockPanchanga);

    expect(periods.length).toBe(3);

    // Boundary Test
    expect(periods[0].endTime).toBe(periods[1].startTime);
    expect(periods[1].endTime).toBe(periods[2].startTime);

    // Start/End element tests
    expect(periods[0].startElement).toBe("prithvi");
    expect(periods[0].endElement).toBe("prithvi");
    expect(periods[0].paksha).toBe("Shukla");
    expect(periods[0].tithi).toBe(3);

    expect(periods[1].startElement).toBe("jala");
    expect(periods[1].endElement).toBe("jala");
    expect(periods[1].paksha).toBe("Shukla");
    expect(periods[1].tithi).toBe(4);

    expect(periods[2].startElement).toBe("tejas"); // 11 is tejas (Agni)
    expect(periods[2].endElement).toBe("tejas");
    expect(periods[2].paksha).toBe("Krishna");
    expect(periods[2].tithi).toBe(11); // 26 - 15 = 11

    // Nadi test to ensure it is calculated and populated
    expect(["ida", "pingala"]).toContain(periods[0].startNadi);
    expect(["ida", "pingala"]).toContain(periods[0].endNadi);

    // Test that the getCanonicalNadiAtTime doesn't throw and works
    const testNadi = getCanonicalNadiAtTime(
      1700000000000,
      3,
      "06:00",
      "18:00",
      null,
      null,
      "Asia/Kolkata",
    );
    expect(["ida", "pingala"]).toContain(testNadi);
  });
});
