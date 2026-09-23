# Classical Sources & Scholarly Lineage for Shadbala

## 1. Primary Authority: Brihat Parashara Hora Shastra (BPHS)
The mathematical foundation of this implementation is directly grounded in:
- **Text**: *Brihat Parashara Hora Shastra* (बृहत्पाराशरहोराशास्त्रम्)
- **Adhyaya**: 27 — Shadbaladhyaya (षड्बलाध्यायः) & 28 — Ishtakashtaphaladhyaya (इष्टकष्टफलाध्यायः)
- **Shlokas**: 1 through 45
- **Commentaries Consulted**:
  - Pt. Ganesha Datta Pathak (Varanasi Sanskrit Sansthan)
  - Dr. Suresh Chandra Mishra (Ranjan Publications, New Delhi)
  - R. Santhanam (Standard English Translation with Critical Notes)

## 2. Secondary Canonical Texts Consulted for Comparative Validation
1. **Sarvavali (सर्वावली)** by Kalyana Varma:
   - Adhyaya 4 & 5: Graha Balas and Shadbala rules.
2. **Jataka Parijata (जातकपारिजातः)** by Vaidyanatha Dikshita:
   - Adhyaya 2: Graha and Bhava Balas.
3. **Phaladeepika (फलदीपिका)** by Mantreswara:
   - Adhyaya 4: Graha Strength and Exaltation measures.
4. **Graha and Bhava Balas** by Dr. B. V. Raman:
   - Modern computational standardization of BPHS formulas used extensively across contemporary Indian software.

## 3. Classical Attribution Matrix

| Bala Component | Primary Classical Verse | Specific Shloka Principle |
|---|---|---|
| **Uchcha Bala** | BPHS 27.2–3 | $\Delta / 3$ where $\Delta = \|\lambda - \lambda_{\text{deb}}\|$ |
| **Saptavargaja Bala** | BPHS 27.4–7 | Moolatrikona (45), Swakshetra (30), Adhi-Mitra (20), Mitra (15), Sama (10), Shatru (5), Adhi-Shatru (2.5) |
| **Ojayugmarashi Bala** | BPHS 27.8–9 | Female planets in even signs, male planets in odd signs: 15 Virupas in D1, 15 Virupas in D9 |
| **Kendradi Bala** | BPHS 27.10 | Kendra (60), Panaphara (30), Apoklima (15) |
| **Drekkana Bala** | BPHS 27.11 | 1st Drekkana: Male; 2nd Drekkana: Neutral; 3rd Drekkana: Female (15 Virupas) |
| **Dig Bala** | BPHS 27.12–14 | Lagna (Jup/Mer), 4th (Moo/Ven), 7th (Sat), 10th (Sun/Mar) max 60 Virupas |
| **Natonnata Bala** | BPHS 27.15–16 | Divarathri Bala proportional to midnight/noon arc |
| **Paksha Bala** | BPHS 27.17–18 | Waxing/Waning elongation; benefics proportional to Moon-Sun elongation |
| **Tribhaga Bala** | BPHS 27.19 | Mercury, Sun, Saturn in day thirds; Moon, Venus, Mars in night thirds; Jupiter always |
| **Varsha-Masa-Dina-Hora** | BPHS 27.20 | 15 (Year), 30 (Month), 45 (Day/Vara), 60 (Hour/Hora) |
| **Ayana Bala** | BPHS 27.21 | Declination-based strength; northern for Sun/Mar/Jup/Ven, southern for Moo/Sat |
| **Yuddha Bala** | BPHS 27.22 | Difference transferred between planets in planetary war ($\le 1^\circ$) |
| **Cheshta Bala** | BPHS 27.23–27 | 8 motional states (Vakra to Atichara); Sun = Ayana, Moon = Paksha |
| **Naisargika Bala** | BPHS 27.28–29 | Proportional to 60 * (rank / 7) from Sun down to Saturn |
| **Drik Bala** | BPHS 27.30–33 | Piecewise linear aspect angle curves with benefic (+1/4) and malefic (-1/4) multipliers |
| **Ishta / Kashta Phala** | BPHS 28.1–4 | $\sqrt{Uchcha \times Cheshta}$ and $\sqrt{(60-Uchcha) \times (60-Cheshta)}$ |
| **Bhava Bala** | BPHS 27.38–42 | Bhavadhipati + Bhava Dig + Bhava Drishti |
