# Shipment Risk Scoring Engine — Design Specification

## 1. Objective
The **Shipment Risk Engine** synthesizes multi-dimensional data across meteorology, customs compliance, corridor chokepoints, port congestion, and cargo characteristics into a single explainable 0–100 composite risk score.

---

## 2. Mathematical Scoring Formula (Section 10 Spec)

$$\text{Overall Risk Score} = 0.30 \times S_{\text{weather}} + 0.25 \times S_{\text{customs}} + 0.20 \times S_{\text{route}} + 0.15 \times S_{\text{port}} + 0.10 \times S_{\text{cargo}}$$

### Sub-Score Formulations:
1. **Weather Score ($S_{\text{weather}} \in [0, 100]$)**:
   - Wave height $> 3.5\text{m} \implies +35\text{ pts}$, Storm in trajectory $\implies +40\text{ pts}$, High wind $\implies +25\text{ pts}$.
2. **Customs Score ($S_{\text{customs}} \in [0, 100]$)**:
   - Prohibited HS Code $\implies 100\text{ pts}$, Missing mandatory document $\implies 75\text{ pts}$, Unverified COO $\implies 25\text{ pts}$, Standard compliant pass $\implies 5\text{ pts}$.
3. **Route Score ($S_{\text{route}} \in [0, 100]$)**:
   - Strategic chokepoints (e.g. Bab-el-Mandeb / Red Sea $\implies 70\text{ pts}$, Malacca Strait $\implies 15\text{ pts}$, Direct open ocean $\implies 5\text{ pts}$).
4. **Port Score ($S_{\text{port}} \in [0, 100]$)**:
   - Port berth queue $> 3.0\text{ days} \implies +45\text{ pts}$, labor dispute warning $\implies +35\text{ pts}$, standard turn $\le 1.0\text{ day} \implies 5\text{ pts}$.
5. **Cargo Score ($S_{\text{cargo}} \in [0, 100]$)**:
   - IMO Hazardous Class 3/8 $\implies 60\text{ pts}$, Temperature-sensitive reefer $\implies 30\text{ pts}$, Standard dry container $\implies 5\text{ pts}$.

---

## 3. Threshold Bands & Policy Rules

| Risk Score Range | Severity Band | Policy Action |
| :--- | :--- | :--- |
| **0 – 30** | **LOW** | Automated validation pass; quote instantly eligible for issuance. |
| **31 – 60** | **MEDIUM** | Standard issuance with advisory risk disclosures displayed on quotation. |
| **61 – 80** | **HIGH** | Requires mandatory review by Senior Freight Broker or Customs Officer. |
| **81 – 100** | **CRITICAL** | System blocks quotation issuance (`HOLD/BLOCKED`) until risks are mitigated. |

---

## 4. Factor-Level Explainability Record Structure
Every evaluation produces granular, auditable explanation items:
```json
[
  { "factor": "Weather Risk", "score": 20.0, "weight": 0.30, "contribution": 6.0, "severity": "LOW", "reason": "Low wave heights (<1.5m) along Bay of Bengal." },
  { "factor": "Customs Friction", "score": 15.0, "weight": 0.25, "contribution": 3.75, "severity": "LOW", "reason": "Standard industrial commodity with clean HS code 8504.40." },
  { "factor": "Route Geometry", "score": 25.0, "weight": 0.20, "contribution": 5.0, "severity": "LOW", "reason": "Direct sea lane with minimal transshipment risk." },
  { "factor": "Port Congestion", "score": 10.0, "weight": 0.15, "contribution": 1.5, "severity": "LOW", "reason": "Port of Singapore operating at normal 0.8-day turn." },
  { "factor": "Cargo Hazard", "score": 5.0, "weight": 0.10, "contribution": 0.5, "severity": "LOW", "reason": "General dry cargo, non-hazardous classification." }
]
```
