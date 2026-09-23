# Invariants & Validation Framework

## 1. Mathematical Invariants

Located in `src/kundali/dasha/vimshottari/VimshottariValidation.ts`:

### Invariant 1: Nakshatra Arc & Pada Range
- $\theta_{\text{passed}} \in [0^\circ, 13^\circ 20']$
- $\theta_{\text{remaining}} \in [0^\circ, 13^\circ 20']$
- $\theta_{\text{passed}} + \theta_{\text{remaining}} = 13^\circ 20'$
- $\text{Pada} \in \{1, 2, 3, 4\}$
- $F_{\text{elapsed}} + F_{\text{remaining}} = 1.0 \pm 10^{-12}$

### Invariant 2: Birth Balance Bounds
- $Y_{\text{balance}} \in (0, Y_{\text{lord}}]$
- $M_{\text{balance}} \in [0, 11]$
- $D_{\text{balance}} \in [0, 30]$

### Invariant 3: Sequence Contiguity
- $\forall i \in [0, N-2]: \text{EndTimestampMs}(P_i) \equiv \text{StartTimestampMs}(P_{i+1})$
- $\text{StartTimestampMs}(P_0) \equiv \text{BirthTimestampMs}$

### Invariant 4: Duration Conservation (Zero Drift)
- For every parent node $P$ with children $C_1 \dots C_k$:
  $$\sum_{j=1}^k (C_j.\text{endTimestampMs} - C_j.\text{startTimestampMs}) \equiv P.\text{endTimestampMs} - P.\text{startTimestampMs}$$
- $C_1.\text{startTimestampMs} \equiv P.\text{startTimestampMs}$
- $C_k.\text{endTimestampMs} \equiv P.\text{endTimestampMs}$

### Invariant 5: Cyclic Lord Succession
- Sequence follows the fixed cyclic permutation:
  $$\text{Ketu} \rightarrow \text{Venus} \rightarrow \text{Sun} \rightarrow \text{Moon} \rightarrow \text{Mars} \rightarrow \text{Rahu} \rightarrow \text{Jupiter} \rightarrow \text{Saturn} \rightarrow \text{Mercury}$$
- The first child period of any parent $P$ is ruled by $P.\text{lord}$.

---

## 2. Validation Functions

- `validateBirthBalance(balance)`: Ensures Nakshatra indices, Pada numbers, and remaining years adhere strictly to theoretical bounds.
- `validateNestedPeriods(parent, children)`: Verifies zero gap, zero overlap, and exact duration conservation between parent and child periods.
- `validateTimeline(timeline)`: Performs holistic audit across all 9 Mahadashas and their sub-periods.
