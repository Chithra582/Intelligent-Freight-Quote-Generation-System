# Milestone 3 (M3) — Requirements Specification

## 1. Executive Purpose & Scope
Milestone 3 delivers the **Intelligence and Compliance Layer** that sits between routing/pricing and final quote issuance. It unifies four core pillars:
1. **Weather Intelligence**: Oceanic route geometry sampling, severe weather & storm detection, delay probability, and alternative route advice.
2. **Customs & RAG Compliance**: Origin/destination validation, HS code / commodity classification, regulation retrieval with legal citations, mandatory document checklists, readiness scoring, and human officer sign-off.
3. **Composite Shipment Risk Scoring**: Explainable weighted formula ($0.30\times\text{Weather} + 0.25\times\text{Customs} + 0.20\times\text{Route} + 0.15\times\text{Port} + 0.10\times\text{Cargo}$) with factor-level attribution.
4. **Machine Learning Pricing & Rule Comparison**: Gradient Boosting & LightGBM regression model evaluated against MAE, RMSE, and $R^2$, benchmarked side-by-side with the deterministic 10-step rule price.

---

## 2. Functional Requirements (FR)

### FR-1: Weather Intelligence & Oceanic Radar
- **FR-1.1**: Sample candidate route geometries at minimum 5-10 oceanic waypoints (e.g. Bay of Bengal, Malacca Strait, Arabian Sea, Suez Canal, North Sea).
- **FR-1.2**: Collect wave height (m), wind speed (knots), atmospheric pressure (hPa), visibility (km), and precipitation.
- **FR-1.3**: Detect tropical depressions, monsoons, and high-wave conditions ($>4\text{m}$).
- **FR-1.4**: Calculate weather risk score ($0-100$) and estimated voyage delay probability ($0-100\%$).
- **FR-1.5**: Gracefully fallback to cached weather telemetry if external NOAA radar times out without silent failure.

### FR-2: Customs Intelligence, RAG & Document Verification
- **FR-2.1**: Validate HS Code (6-digit / 8-digit) against WCO Harmonized System and national customs tariff tables (ICEGATE, TARIC, ASEAN FTA).
- **FR-2.2**: Perform hybrid retrieval (keyword + dense vector embeddings) over statutory trade regulations and produce exact legal citations.
- **FR-2.3**: Automatically generate mandatory document checklists (Commercial Invoice, Packing List, Certificate of Origin, SDS/MSDS for hazardous).
- **FR-2.4**: Calculate customs readiness score ($0-100\%$). If mandatory documents are missing, flag as `NEEDS_DOCUMENTS`.
- **FR-2.5**: Support Customs Officer workflow with decision actions: `APPROVE`, `REQUEST_DOCUMENTS`, `CONDITIONAL`, `REJECT`.
- **FR-2.6**: Strictly enforce quote state locking: quotes requiring customs approval remain `HOLD` or `BLOCKED` until officer authorization.

### FR-3: Composite Shipment Risk Engine
- **FR-3.1**: Compute overall composite risk score ($0-100$) using configurable weights:
  $$\text{Overall Score} = 0.30\times\text{Weather} + 0.25\times\text{Customs} + 0.20\times\text{Route} + 0.15\times\text{Port} + 0.10\times\text{Cargo}$$
- **FR-3.2**: Classify risk level into four bands:
  - `0 – 30`: **LOW** (Standard automated pass)
  - `31 – 60`: **MEDIUM** (Advisory warnings displayed on quote)
  - `61 – 80`: **HIGH** (Requires Senior Broker or Officer review)
  - `81 – 100`: **CRITICAL** (Quote blocked by policy)
- **FR-3.3**: Provide itemized factor-level explainability: Factor Name, Score, Weight %, Absolute Contribution, Severity, and Reason.

### FR-4: Machine Learning Pricing & Rule Comparison
- **FR-4.1**: Train regression models (Gradient Boosting / LightGBM) on historical lane contracts.
- **FR-4.2**: Evaluate model on held-out test split achieving $R^2 \ge 0.95$, $\text{RMSE} \le ₹3,500$, and $\text{MAE} \le 1.0\text{ day}$.
- **FR-4.3**: Expose side-by-side comparison API returning Rule-Based Buy Cost, Margin %, Rule Sell Price, ML Predicted Market Rate, and Spread Variance.

---

## 3. Non-Functional Requirements (NFR)
- **NFR-1 (Latency)**: End-to-end parallel intelligence execution (Pricing + Weather + Customs + Risk) under $1,200\text{ ms}$.
- **NFR-2 (Financial Precision)**: Decimal(14,4) precision with zero floating-point drift across all rates and surcharges.
- **NFR-3 (Auditability)**: Every state change, officer sign-off, and provider fallback is recorded with timestamp and user ID in the audit log.
- **NFR-4 (Security)**: Role-based access control (RBAC) separating `USER`, `ADMIN`, `CUSTOMS_OFFICER`, `AGENT_OPERATOR`, and `MANAGER`.
