export type VaraElement = "Jala" | "Agni" | "Prithvi" | "Space_than_Air";
export type VaraNadi = "Ida" | "Sushmana" | "Pingala";

export interface VaraTattvaMapping {
  weekday: number;
  weekdayName: string;
  element: VaraElement;
  nadi: VaraNadi;
}

export const VARA_TATTVA_MAPPING: Record<number, VaraTattvaMapping> = {
  1: { weekday: 1, weekdayName: "Monday", element: "Jala", nadi: "Ida" },
  2: { weekday: 2, weekdayName: "Tuesday", element: "Agni", nadi: "Ida" },
  3: { weekday: 3, weekdayName: "Wednesday", element: "Prithvi", nadi: "Ida" },
  4: { weekday: 4, weekdayName: "Thursday", element: "Space_than_Air", nadi: "Sushmana" },
  5: { weekday: 5, weekdayName: "Friday", element: "Agni", nadi: "Pingala" },
  6: { weekday: 6, weekdayName: "Saturday", element: "Jala", nadi: "Pingala" },
  0: { weekday: 0, weekdayName: "Sunday", element: "Prithvi", nadi: "Pingala" },
};

export function getVaraTattva(civilWeekday: number): VaraTattvaMapping {
  return VARA_TATTVA_MAPPING[civilWeekday];
}

export const ELEMENT_UI_DATA: Record<VaraElement, { en: string; hi: string }> = {
  Jala: { en: "Water / Jala", hi: "जल" },
  Agni: { en: "Fire / Agni", hi: "अग्नि" },
  Prithvi: { en: "Earth / Prithvi", hi: "पृथ्वी" },
  Space_than_Air: { en: "Space than Air", hi: "आकाश/वायु" },
};

export const NADI_UI_DATA: Record<VaraNadi, { en: string; hi: string }> = {
  Ida: { en: "Ida", hi: "इड़ा" },
  Pingala: { en: "Pingala", hi: "पिंगला" },
  Sushmana: { en: "Sushmana", hi: "सुषुम्ना" },
};
