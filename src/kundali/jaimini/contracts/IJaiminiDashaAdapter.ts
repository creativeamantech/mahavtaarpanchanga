import { CharaDashaReport, JaiminiDashaPeriod } from "../JaiminiTypes";

export interface IJaiminiDashaAdapter {
  readonly systemName: string;
  readonly tradition: string;

  calculateDashaTimeline(
    birthTimeMs: number,
    lagnaSignIndex: number,
    planetPositions: Array<{
      id: string;
      signIndex: number;
      longitude: number;
      degreeInSign: number;
      dignity?: string;
    }>,
    targetDateMs?: number,
  ): CharaDashaReport;

  getCurrentPeriod(
    timeline: CharaDashaReport,
    targetDateMs: number,
  ): JaiminiDashaPeriod | undefined;
}
