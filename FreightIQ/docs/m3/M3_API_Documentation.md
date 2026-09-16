# Milestone 3 (M3) — API Contracts & Documentation

## Overview of M3 Endpoints

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/api/v1/weather/assess/` | Samples oceanic waypoints and computes storm risk & delay probability. | Authenticated |
| **`POST`** | `/api/v1/customs/validate/` | Validates HS code, retrieves statutory requirements, and builds checklist. | Authenticated |
| **`POST`** | `/api/v1/regulations/search/` | Hybrid semantic vector + keyword search over international customs legal corpus. | Authenticated |
| **`GET`** | `/api/v1/risk/<shipment_id>/` | Retrieves composite risk assessment and factor-level breakdown for a shipment. | Authenticated |
| **`POST`** | `/api/v1/risk/assess/` | Computes composite risk score ($0-100$) and factor explanations. | Authenticated |
| **`POST`** | `/api/v1/customs/<check_id>/sign-off/` | Customs Officer decision sign-off (`APPROVE`, `REQUEST_DOCUMENTS`, `REJECT`). | Customs Officer / Admin |
| **`GET`** | `/api/v1/pricing/ml-compare/` | Compares Rule-Based 10-step sell rate vs ML Predicted Market Rate. | Authenticated |
| **`GET`** | `/api/v1/alerts/` | Lists active Weather, Customs, and Policy alerts. | Authenticated |
| **`POST`** | `/api/v1/alerts/<id>/acknowledge/` | Acknowledges an active operational alert. | Authenticated |

---

## Endpoint Details

### 1. `POST /api/v1/weather/assess/`
**Request Payload:**
```json
{
  "shipment_id": "SH-2026-08102",
  "route_id": "RT-MAA-SIN-01",
  "origin_port": "INMAA",
  "destination_port": "SGSIN",
  "departure_date": "2026-08-30",
  "waypoints": [
    { "name": "Chennai Port Departure", "lat": 13.08, "lng": 80.27 },
    { "name": "Bay of Bengal Central", "lat": 10.45, "lng": 85.30 },
    { "name": "North Malacca Strait Entry", "lat": 5.80, "lng": 95.20 },
    { "name": "Singapore Port Road", "lat": 1.29, "lng": 103.85 }
  ]
}
```

**Response Payload (200 OK):**
```json
{
  "status": "SUCCESS",
  "assessment": {
    "id": "WA-9281",
    "risk_score": 18.5,
    "risk_level": "LOW",
    "storm_risk": 5.0,
    "wave_risk": 12.0,
    "wind_risk": 15.0,
    "delay_probability": 8.4,
    "summary": "Favorable oceanic conditions along Bay of Bengal & Malacca Strait. Average wave height 1.4m.",
    "observations": [
      { "point": "Bay of Bengal Central", "wave_height_m": 1.6, "wind_knots": 14.2, "storm_detected": false },
      { "point": "Malacca Strait", "wave_height_m": 1.1, "wind_knots": 8.5, "storm_detected": false }
    ],
    "alternative_advice": "Proceed with primary direct loop.",
    "confidence_score": 0.96
  }
}
```

---

### 2. `POST /api/v1/customs/validate/`
**Request Payload:**
```json
{
  "shipment_id": "SH-2026-08102",
  "origin_country": "IN",
  "destination_country": "SG",
  "hs_code": "5208.11.00",
  "commodity": "Woven Cotton Fabrics",
  "incoterm": "CIF",
  "declared_value": 3500000.00
}
```

**Response Payload (200 OK):**
```json
{
  "status": "SUCCESS",
  "compliance": {
    "check_id": "CHK-2026-104",
    "hs_code_valid": true,
    "prohibited": false,
    "restricted": false,
    "readiness_score": 85.0,
    "risk_level": "LOW",
    "recommendation": "PASS",
    "mandatory_documents": [
      { "name": "Commercial Invoice", "status": "VERIFIED", "mandatory": true },
      { "name": "Packing List", "status": "VERIFIED", "mandatory": true },
      { "name": "Certificate of Origin (Form AIFTA)", "status": "PENDING", "mandatory": true }
    ],
    "citations": [
      "Indian Customs Act 1962, Sec 46 (ICEGATE Export Clearance)",
      "Singapore Customs Circular No. 04/2026 (Zero Duty ASEAN-India FTA)"
    ]
  }
}
```

---

### 3. `POST /api/v1/customs/<check_id>/sign-off/`
**Request Payload:**
```json
{
  "action": "APPROVE",
  "reviewer_notes": "All mandatory statutory documents verified. Preferential AIFTA certificate confirmed.",
  "officer_name": "Officer R. Verma"
}
```

**Response Payload (200 OK):**
```json
{
  "status": "SUCCESS",
  "check_id": "CHK-2026-104",
  "new_compliance_status": "APPROVED",
  "quote_state": "READY_FOR_ISSUANCE",
  "message": "Customs clearance authorized. Quote state unlocked."
}
```

---

### 4. `POST /api/v1/risk/assess/`
**Request Payload:**
```json
{
  "shipment_id": "SH-2026-08102",
  "weather_score": 18.5,
  "customs_score": 15.0,
  "route_score": 22.0,
  "port_score": 14.0,
  "cargo_score": 10.0
}
```

**Response Payload (200 OK):**
```json
{
  "status": "SUCCESS",
  "risk_assessment": {
    "overall_score": 16.55,
    "risk_level": "LOW",
    "formula": "0.30*Weather + 0.25*Customs + 0.20*Route + 0.15*Port + 0.10*Cargo",
    "factors": [
      { "factor": "Weather Risk", "score": 18.5, "weight": 0.30, "contribution": 5.55, "severity": "LOW" },
      { "factor": "Customs Friction", "score": 15.0, "weight": 0.25, "contribution": 3.75, "severity": "LOW" },
      { "factor": "Route Geometry", "score": 22.0, "weight": 0.20, "contribution": 4.40, "severity": "LOW" },
      { "factor": "Port Congestion", "score": 14.0, "weight": 0.15, "contribution": 2.10, "severity": "LOW" },
      { "factor": "Cargo Hazard", "score": 10.0, "weight": 0.10, "contribution": 1.00, "severity": "LOW" }
    ],
    "explanation": "Corridor exhibits low risk profile across all meteorological and customs dimensions."
  }
}
```

---

### 5. `GET /api/v1/pricing/ml-compare/?origin=INMAA&destination=SGSIN&container_type=40HC&units=2&weight=36800`
**Response Payload (200 OK):**
```json
{
  "status": "SUCCESS",
  "corridor": "Chennai (INMAA) ➔ Singapore (SGSIN)",
  "rule_pricing": {
    "base_buy_cost": 129000.00,
    "margin_pct": 15.0,
    "margin_amount": 19350.00,
    "final_sell_price": 148350.00,
    "methodology": "10-Step Deterministic Cost Engine"
  },
  "ml_pricing": {
    "predicted_market_rate": 146200.00,
    "prediction_interval": [141000.00, 151400.00],
    "confidence_r2": 0.9832,
    "model_algorithm": "Gradient Boosting Regressor v3.2",
    "feature_importances": {
      "distance_km": 0.38,
      "bunker_fuel_index": 0.26,
      "container_type_weight": 0.21,
      "seasonal_surge": 0.15
    }
  },
  "variance": {
    "amount_diff": 2150.00,
    "percent_diff": "+1.47%",
    "recommendation": "Rule sell price aligns within 1.5% of ML predicted equilibrium. Highly competitive."
  }
}
```
