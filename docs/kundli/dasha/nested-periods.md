# Nested Periods & Sub-Dasha Mechanics (अन्तर्दशा, प्रत्यन्तर्दशा, सूक्ष्म, प्राण)

## 1. Mathematical Proportionality in BPHS

Classical Vedic astrology employs recursive fractional proportionality to subdivide planetary influence into five operational tiers:

Let $Y_{\text{cycle}} = 120$ years.

### Level 2: Antardasha / Bhukti (अन्तर्दशा / भुक्ति)
Every Mahadasha is partitioned into 9 sub-periods, beginning with the ruler of the Mahadasha itself (स्वदशा) and progressing in cyclic order.
If the parent Mahadasha has duration $D_1$ (in years or ms), the duration of sub-period $j$ governed by Graha with cycle duration $y_j$ is:
$$D_2(j) = D_1 \times \frac{y_j}{Y_{\text{cycle}}} = D_1 \times \frac{y_j}{120}$$

*Example*: In Jupiter Mahadasha ($y_{\text{Jup}} = 16\text{ yrs}$), the first Antardasha is Jupiter-Jupiter:
$$D_2(\text{Jup}) = 16 \times \frac{16}{120} = 2.1333\text{ years} = 2\text{ yrs } 1\text{ mo } 18\text{ days}$$

### Level 3: Pratyantardasha (प्रत्यन्तर्दशा)
Every Antardasha is partitioned into 9 third-tier periods, starting with the ruler of the Antardasha itself:
$$D_3(k) = D_2 \times \frac{y_k}{120}$$

### Level 4: Sookshma Dasha (सूक्ष्मदशा)
Every Pratyantardasha is subdivided into 9 micro-periods, starting with the ruler of the Pratyantardasha:
$$D_4(l) = D_3 \times \frac{y_l}{120}$$

### Level 5: Prana Dasha (प्राणदशा)
Every Sookshma Dasha is subdivided into 9 atomic periods, starting with the ruler of the Sookshma Dasha:
$$D_5(m) = D_4 \times \frac{y_m}{120}$$

---

## 2. Integer-Millisecond Allocation Algorithm (Zero Floating-Point Drift)

When floating-point arithmetic is applied recursively across 5 nested tiers, tiny fractional inaccuracies accumulate, causing span bounds to diverge by minutes or hours over a lifetime.

To enforce exact mathematical conservation:
$$\sum_{i=1}^9 \Delta t_i \equiv \Delta t_{\text{parent}}$$

The Mahavtaar Engine implements integer-remainder absorption:

```typescript
function allocateNestedSpans(
  parentStartMs: number,
  parentEndMs: number,
  startLordIndex: number,
): Array<{ startMs: number; endMs: number; lord: Graha }> {
  const totalParentDurationMs = parentEndMs - parentStartMs;
  let runningPointerMs = parentStartMs;
  const result = [];

  for (let i = 0; i < 9; i++) {
    const lordObj = VIMSHOTTARI_LORDS[(startLordIndex + i) % 9];
    const subStartMs = runningPointerMs;
    let subEndMs: number;

    if (i === 8) {
      // 9th child absorbs all rounding remainder to guarantee exact parent boundary
      subEndMs = parentEndMs;
    } else {
      const fractionalDuration = (totalParentDurationMs * lordObj.years) / 120;
      subEndMs = subStartMs + Math.round(fractionalDuration);
    }

    result.push({
      lord: lordObj.planet,
      startMs: subStartMs,
      endMs: subEndMs,
    });

    runningPointerMs = subEndMs;
  }

  return result;
}
```

### Properties of this Guarantee:
1. Every child's end timestamp matches the next sibling's start timestamp identically.
2. The initial child's start timestamp equals the parent's start timestamp.
3. The final (9th) child's end timestamp equals the parent's end timestamp.
4. Total duration is conserved to the exact millisecond across all 5 tiers.
