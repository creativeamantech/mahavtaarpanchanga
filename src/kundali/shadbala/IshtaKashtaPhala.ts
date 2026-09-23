import { IshtaKashtaResult } from "./ShadbalaTypes";

/**
 * Calculates Ishta Phala and Kashta Phala
 * BPHS Adhyaya 28, Shlokas 1-4
 *
 * Ishta Phala = sqrt(UchchaBala * CheshtaBala)
 * Kashta Phala = sqrt((60 - UchchaBala) * (60 - CheshtaBala))
 *
 * @param uchchaBalaVirupas Uchcha Bala in Virupas (0 to 60)
 * @param cheshtaBalaVirupas Cheshta Bala in Virupas (0 to 60)
 */
export function calculateIshtaKashtaPhala(
  uchchaBalaVirupas: number,
  cheshtaBalaVirupas: number,
): IshtaKashtaResult {
  const clampedUchcha = Math.max(0, Math.min(60.0, uchchaBalaVirupas));
  const clampedCheshta = Math.max(0, Math.min(60.0, cheshtaBalaVirupas));

  const ishtaPhala = Math.sqrt(clampedUchcha * clampedCheshta);
  const kashtaPhala = Math.sqrt((60.0 - clampedUchcha) * (60.0 - clampedCheshta));

  return {
    ishtaPhala,
    kashtaPhala,
    uchchaFactor: clampedUchcha / 60.0,
    cheshtaFactor: clampedCheshta / 60.0,
    source: "Brihat Parashara Hora Shastra, Ch. 28, v. 1-4",
  };
}
