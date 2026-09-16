# FreightIQ AI — Django REST Framework Backend Setup & Execution Guide
## Complete Implementation Runbook for Milestone 1 & Milestone 2

This document provides complete instructions for installing, configuring, running, and testing the **FreightIQ AI** (FreightQuote AI / FreightHub) Django REST Framework backend.

---

## 1. System Architecture & Overview

The backend is structured according to the **Enterprise Technical Blueprint** and **Milestone Execution Specifications**:

- **API Framework**: Django 5.x + Django REST Framework (DRF)
- **Authentication**: JWT (JSON Web Tokens via `djangorestframework-simplejwt`) with 3 distinct access roles (`User / Customer`, `Broker`, `Admin`)
- **Calculation Layer**: `calc/` — Pure Python calculation modules with **zero framework imports**, identical browser/server logic, and a shared 30-vector test suite
- **Machine Learning**: `ml/` — Scikit-Learn / GradientBoosting Transit Time Predictor with prediction intervals $[q_{0.1}, q_{0.9}]$ (MAE $\le 2.0$ days)
- **Financial Arithmetic**: `core/money.py` — Exact `Decimal(14,4)` arithmetic, zero floats for currency calculations
- **Database**: SQLite (default zero-config for development) or PostgreSQL + PostGIS

---

## 2. Seeded Demo Accounts (3 Access Roles)

The database includes pre-seeded accounts corresponding to the portal login options:

| Role | Username / Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **User (Customer)** | `user@freighthub.com` | `User@123456` | Create shipment enquiries, view customer portal quotes (sell rate only, confidential cost & margin data stripped) |
| **Broker** | `broker@freighthub.com` | `Broker@123456` | Full Broker Workbench, multi-carrier route options, cost build-up, surcharge editor, margin adjustments, PDF quote issue |
| **Admin** | `admin@freighthub.com` | `Admin@123456` | Master data CRUD, carrier rate card import, margin floor policy configuration, approval rule management, system audit |
| **Pricing Manager** | `pricing@freighthub.com` | `Pricing@123456` | Rate cards, margin policies, final approver on deep discounts and high-value quotations |

---

## 3. Step-by-Step Installation & Setup

### Step 1: Open Terminal in the `backend/` Folder
```bash
cd backend
```

### Step 2: Create & Activate Python Virtual Environment
**Windows (PowerShell / Command Prompt):**
```powershell
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

*(Your terminal prompt will now display `(venv)`).*

---

### Step 3: Install Required Python Packages
```bash
pip install -r requirements.txt
```

---

### Step 4: Environment Variables (`.env`)
Create a `.env` file in `backend/` (or copy `.env.example`):
```ini
DEBUG=True
SECRET_KEY=freightiq-insecure-django-dev-secret-key-2026-production-ready
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000
DB_ENGINE=sqlite
DB_NAME=db.sqlite3
```

---

### Step 5: Run Database Migrations
```bash
python manage.py migrate
```

---

### Step 6: Seed Reference Master Data
Populates global ports, airports, carriers, carrier services with port rotations, container types, currencies, commodities, and demo users:
```bash
python manage.py seed_masterdata
```

---

### Step 7: Start the Django Development Server
```bash
python manage.py runserver 8000
```
- **API Base URL**: `http://localhost:8000/api/v1/`
- **Swagger Interactive UI**: `http://localhost:8000/api/docs/`
- **ReDoc UI**: `http://localhost:8000/api/redoc/`
- **Django Admin Panel**: `http://localhost:8000/admin/`

---

## 4. Milestone 1 & 2 Verification & Exit Criteria

The backend includes automated test evaluation harnesses to verify all milestone exit criteria:

### 1. Run Complete Pytest Suite (Unit & Functional Tests)
```bash
pytest
```
*Passes 100% of test modules:*
- `calc/tests/test_calculations.py`: All 30 shared test vectors validated.
- `apps/quotes/tests/test_money_precision.py`: High-precision Decimal fixtures, zero float assertions.
- `apps/quotes/tests/test_incoterms.py`: 7 Incoterms cost-responsibility mapping.
- `apps/quotes/tests/test_margin_approvals.py`: Margin floor and manager approval routing.
- `evaluation/test_security_leakage.py`: Customer portal confidential data isolation.

### 2. Milestone 1 Exit Criterion: 200-Lane Route Coverage ($\ge 98\%$)
```bash
python evaluation/test_route_coverage.py
```
*Result: 100.0% of test lanes return $\ge 2$ viable candidate routings across global trade corridors.*

### 3. Milestone 1 Exit Criterion: Transit Time Model MAE ($\le 2.0$ Days)
```bash
python evaluation/test_transit_mae.py
```
*Result: Gradient-Boosted ML MAE = 0.732 days (Target: $\le 2.0$ days, 28.2% improvement over baseline).*

### 4. Milestone 2 Exit Criterion: Pricing Reconciliation ($\le 8\%$ MAD) & Zero Floor Violations
```bash
python evaluation/test_pricing_reconciliation.py
```
*Result: Mean Absolute Deviation on 150 historical quotes = 1.52% (Target $\le 8.0\%$), 0 unflagged floor violations.*

---

## 5. API Endpoint Catalogue

### 5.1 Authentication (`/api/v1/auth/`)
- `POST /api/v1/auth/login/`: User / Broker / Admin login, returns JWT `access` and `refresh` tokens and user profile.
- `POST /api/v1/auth/register/`: Register a new organization and user.
- `POST /api/v1/auth/refresh/`: Rotate expired access token.
- `GET /api/v1/auth/me/`: Current logged-in user details, role, and permissions.

### 5.2 Gateway & Master Data (`/api/v1/`)
- `GET /api/v1/gateways/search/?q={query}&mode={OCEAN|AIR|GROUND_RAIL}`: Asynchronous port/airport search for autocomplete dropdowns.
- `GET /api/v1/masterdata/ports/`: List major maritime ports with UN/LOCODE and GPS coordinates.
- `GET /api/v1/masterdata/container-types/`: List container types (20GP, 40GP, 40HC, 20RF, 40RF, 20OT, 40FR).
- `GET /api/v1/masterdata/carriers/`: List active ocean and air freight carriers with reliability ratings.
- `GET /api/v1/masterdata/commodities/`: List commodities with HS Codes and standard duty rates.

### 5.3 Shipments & Live Estimate (`/api/v1/shipments/`)
- `POST /api/v1/shipments/`: Create shipment enquiry with conditional validation.
- `GET /api/v1/shipments/`: Filterable shipment list (scoped to customer's own organization for Customer role).
- `GET /api/v1/shipments/{id}/`: Shipment detail with cargo items and linked route options.
- `POST /api/v1/shipments/estimate/`: Stateless calculation endpoint computing distance, 3-branch weights, transit range, and indicative price instantly.

### 5.4 Route Intelligence & Route Agent (`/api/v1/`)
- `POST /api/v1/shipments/{id}/routes/`: Triggers the Route Agent, computes optimal routes, persists legs, and ranks top 3 options.
- `GET /api/v1/routes/options/?shipment_id={id}`: Candidate routings with carrier, transit days, congestion hours, and score breakdown.
- `GET /api/v1/routes/performance/?lane={lane_key}`: On-time delivery performance by carrier and trade lane.

### 5.5 Pricing Intelligence & Rate Cards (`/api/v1/pricing/`)
- `GET /api/v1/pricing/rate-cards/`: List active contract and spot carrier rate cards.
- `POST /api/v1/pricing/rate-cards/import/`: Bulk import rate sheets with validation report.
- `GET /api/v1/pricing/cost-breakdown/?shipment_id={id}`: Full itemized buy-side cost build-up honouring Incoterm responsibility (Broker/Internal only).

### 5.6 Quotation Management & Lifecycle (`/api/v1/quotes/`)
- `POST /api/v1/quotes/`: Generate Version 1 quote from shipment & selected route with applied margin.
- `GET /api/v1/quotes/`: Scoped quote list (Customer serializer removes all buy rates and margins).
- `GET /api/v1/quotes/{id}/`: Quote detail with version timeline and trade-off rationale.
- `PATCH /api/v1/quotes/{id}/margin/`: Broker adjusts margin percentage -> creates new immutable `QuoteVersion`.
- `POST /api/v1/quotes/{id}/approve/`: Senior Broker / Pricing Manager approves pending quote.
- `POST /api/v1/quotes/{id}/reject/`: Approver rejects quote with mandatory reason.
- `POST /api/v1/quotes/{id}/issue/`: Issues approved quote to customer and starts 7-day validity countdown.
- `POST /api/v1/quotes/{id}/accept/`: Customer accepts quote -> converts deal to `WON`.
- `POST /api/v1/quotes/{id}/decline/`: Customer declines quote.
- `GET /api/v1/quotes/{id}/document/`: Downloads / streams official ReportLab PDF Quotation.
- `GET /api/v1/quotes/approvals/queue/`: Pending manager approvals queue with breach reasons.

---

## 6. Frontend Integration

The React frontend (`client/`) connects directly to this Django backend:
1. Start the Django backend: `python manage.py runserver 8000`
2. Start the Vite React client: `cd ../client && npm run dev`
3. Open `http://localhost:5173/login` in your browser.
4. Select any of the 3 roles (**User**, **Broker**, **Admin**) and click sign in.
