# Milestone 3 (M3) — Architecture & System Design

## 1. System Architecture Diagram

```
                                      FRONTEND APPLICATION (SPA / REACT)
                                                     │
                                                     ▼
                                      DJANGO 5.2 APPLICATION BACKEND
                                                     │
                                                     ▼
                                            QUOTE ORCHESTRATOR
                                                     │
         ┌───────────────────┬───────────────────────┼───────────────────────┬───────────────────┐
         ▼                   ▼                       ▼                       ▼                   ▼
  ROUTING SERVICE     PRICING SERVICE         WEATHER SERVICE         CUSTOMS SERVICE       RISK SERVICE
  • Multi-modal Corridors • 10-Step Deterministic • Route Sampling       • HS Code Validation  • Weighted Score
  • Chokepoint & ETA  • ML Price Predictor    • Oceanic Radar         • Regulation RAG      • Factor Explain
  • Graph Solvers     • Rule-vs-ML Comparison • Delay Probability     • Doc Checklist Check • Alert Triggers
         │                   │                       │                       │                   │
         └───────────────────┴───────────────────────┼───────────────────────┴───────────────────┘
                                                     ▼
                                            AUTONOMOUS AGENTS
                                                     │
                             ┌───────────────────────┼───────────────────────┐
                             ▼                       ▼                       ▼
                       WEATHER AGENT           CUSTOMS AGENT            RISK ENGINE
                             │                       │                       │
                             └───────────────────────┼───────────────────────┘
                                                     ▼
                                                DATA LAYER
                                                     │
                    ┌────────────────────────────────┴────────────────────────────────┐
                    ▼                                                                 ▼
           OPERATIONAL DATABASE                                             VECTOR & REGULATION STORE
           • Quotations & Line Items                                        • Tariffs & Trade Agreements
           • Compliance Cases & Sign-offs                                   • Chunked Section Embeddings
           • Audit Trails & Sync Logs                                       • MongoDB Atlas Telemetry
```

---

## 2. Component Responsibilities

### 2.1 Quote Orchestrator
- Coordinates parallel dispatch to Pricing, Weather, and Customs services upon shipment creation.
- Collects outputs and feeds them into the Risk Engine to compute the Composite Shipment Risk.
- Enforces the Quote State Machine:
  $$\text{DRAFT} \to \text{VALIDATED} \to \text{ROUTE\_SELECTED} \to \text{PRICED} \to \text{WEATHER\_ASSESSED} \to \text{CUSTOMS\_ASSESSED} \to \text{RISK\_ASSESSED} \to \text{CUSTOMS DECISION} \to \text{READY\_FOR\_ISSUANCE} \to \text{ISSUED}$$

### 2.2 Weather Agent & Radar Adapter
- Samples route coordinates at discrete lat/long waypoints.
- Evaluates storm proximity, wave heights, and monsoon cyclonic activity.
- Generates `WeatherAssessment`, individual `WeatherObservation` points, and `WeatherAlert` events.

### 2.3 Customs Agent & RAG Subsystem
- Interrogates `HSCodeReference` for prohibited or restricted cargo flags.
- Queries `RegulationDocument` and `RegulationChunk` using dense similarity and keyword filtering.
- Compiles mandatory document checklist into `CustomsComplianceCheck` and `CustomsChecklistItem`.

### 2.4 Composite Risk Engine
- Aggregates multi-source risks into an explainable 0–100 score.
- Outputs individual `RiskFactor` records detailing factor score, weight, contribution, and rationale.

### 2.5 ML Pricing Engine
- Trains and runs regression models (Gradient Boosting & LightGBM) on carrier spot contracts.
- Provides real-time inference comparing rule-based sell prices with predicted market equilibrium.
