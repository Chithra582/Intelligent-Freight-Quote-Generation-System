# Weather Agent — Design & Implementation Specification

## 1. Objective
The **Weather Agent** performs autonomous meteorological surveillance along candidate ocean and air corridors. It samples discrete coordinates along the voyage line, queries oceanic wave radars, detects cyclones/tropical storms, and calculates voyage delay probability.

---

## 2. Execution Flow (Section 8 Spec)

```
 Shipment Route ──► Route Geometry ──► Sample Waypoints ──► Weather Radar Provider (NOAA GFS)
                                                                      │
                                                                      ▼
  Return Result ◄── Persist Assessment + Observations ◄── Calculate Risk & Delay Prob %
```

---

## 3. Mathematical Delay & Risk Model
The Weather Risk Score ($W$) and Delay Probability ($P_d$) are modeled as:

$$W = \min\left(100, \; 0.35 \times H_{\text{wave}} \times 10 + 0.30 \times V_{\text{wind}} \times 1.5 + 0.25 \times S_{\text{storm}} + 0.10 \times (10 - \text{Vis})\right)$$

Where:
- $H_{\text{wave}}$ = Significant wave height in meters ($0 - 10\text{m}$)
- $V_{\text{wind}}$ = Wind velocity in knots ($0 - 60\text{ kts}$)
- $S_{\text{storm}}$ = Storm severity indicator ($0\text{ for clear}, 40\text{ for depression}, 80\text{ for gale}, 100\text{ for cyclone}$)
- $\text{Vis}$ = Visibility in kilometers ($0 - 10\text{km}$)

$$P_d = \begin{cases}
5.0\% & \text{if } W \le 20 \\
5.0 + 1.2 \times (W - 20) & \text{if } 20 < W \le 60 \\
53.0 + 1.15 \times (W - 60) & \text{if } W > 60
\end{cases}$$

---

## 4. Fallback & Degraded State Strategy (Section 14)
If the primary NOAA oceanic API encounters a timeout:
1. Retry with exponential backoff ($250\text{ ms} \to 500\text{ ms}$).
2. If retry fails, retrieve the most recent cached observation for the grid cell ($\le 6\text{ hours old}$).
3. Tag the assessment as `assessment_status = 'FALLBACK_CACHED'` and emit a monitoring event to the AI Agent Operations Center.
4. Never silently fabricate low risk or generate false confidence.
