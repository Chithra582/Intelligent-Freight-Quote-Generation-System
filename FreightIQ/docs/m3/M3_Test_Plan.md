# Milestone 3 (M3) — Test Plan & Quality Assurance Strategy

## 1. Test Objectives & Scope
The M3 Test Suite validates that the parallel intelligence pipeline (Weather, Customs, Risk, ML Pricing) correctly executes, enforces quote state blocking, persists audit records, and ensures zero floating-point drift.

---

## 2. Test Categories & Verification Matrices

### 2.1 Weather Intelligence Functional Tests
- `TC-W-01`: Weather assessment generates for 100% of active maritime routes.
- `TC-W-02`: Route waypoint sampling correctly identifies high wave zones ($>3.5\text{m}$) in monsoon corridors.
- `TC-W-03`: Severe weather alert triggers when delay probability exceeds $60\%$.
- `TC-W-04`: Provider timeout triggers cached fallback without raising unhandled 500 exceptions.

### 2.2 Customs & Document Compliance Tests
- `TC-C-01`: Valid HS Code (e.g. 5208.11, 8504.40) returns correct commodity description and statutory citations.
- `TC-C-02`: Missing mandatory document (e.g. Certificate of Origin or SDS) flags status as `NEEDS_DOCUMENTS`.
- `TC-C-03`: Customs state machine locks quote on `HOLD` / `BLOCKED` when mandatory documents are missing.
- `TC-C-04`: Customs Officer sign-off (`APPROVE`) transitions quote state to `READY_FOR_ISSUANCE`.
- `TC-C-05`: Unauthorized role (e.g. `USER`) attempting to call customs sign-off endpoint receives `403 Forbidden`.

### 2.3 Composite Risk Engine Tests
- `TC-R-01`: Formula $0.30\times W + 0.25\times C + 0.20\times R + 0.15\times P + 0.10\times Cargo$ evaluates with exact mathematical precision.
- `TC-R-02`: Score thresholds accurately map to `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.
- `TC-R-03`: Granular factor-level explainability table is generated with non-empty reasons and source attribution.

### 2.4 ML vs Rule Pricing Tests
- `TC-M-01`: ML regression model delivers $R^2 \ge 0.95$ and $\text{RMSE} \le ₹3,500$ across test partitions.
- `TC-M-02`: Side-by-side comparison endpoint returns deterministic rule sell price and ML predicted market price with spread variance %.
