# Dataset Documentation — Historical Freight & Regulations

## 1. Overview
The datasets supporting Milestone 3 encompass historical ocean/air spot contracts, NOAA oceanic weather observations, global port coordinates, and international trade regulatory legal texts.

---

## 2. Dataset Catalogs

### 2.1 Historical Freight Spot Rate Dataset (`spot_contracts_v3.parquet`)
- **Records**: 150,000 spot contract records from 2023 to 2026.
- **Fields**:
  - `contract_id` (String): Unique transaction hash.
  - `origin_unlocode` (String): 5-letter UNLOCODE (e.g. `INMAA`, `INNSA`).
  - `destination_unlocode` (String): 5-letter UNLOCODE (e.g. `SGSIN`, `NLRTM`, `AEJEA`).
  - `transport_mode` (String): `OCEAN_FCL`, `OCEAN_LCL`, `AIR_CARGO`.
  - `container_type` (String): `20GP`, `40GP`, `40HC`, `20RF`, `40RF`.
  - `cargo_weight_kg` (Float): Physical gross cargo weight.
  - `bunker_index_usd` (Float): Platts bunker fuel index at contract booking.
  - `transit_days_actual` (Float): Realized port-to-port voyage duration.
  - `actual_freight_usd` (Decimal): Net carrier invoice buy rate.

### 2.2 Global Customs & Tariff Corpus (`regulations_corpus_v3.json`)
- **Records**: 45 statutory trade agreement and customs tariff schedules.
- **Source Authorities**: DGFT, CBIC ICEGATE, Singapore Customs, European Commission TARIC, UAE TDRA, IMO IMDG Code.
- **Coverage**:
  - Section 46 & 47 Indian Customs Act (ICEGATE EDI).
  - ASEAN-India Free Trade Agreement (AIFTA) Preferential Rules of Origin.
  - EU UCC Article 127 Entry Summary Declarations.
  - SCOMET List dual-use export control categories.

### 2.3 NOAA Oceanic Meteorology Waypoints (`oceanic_radar_grid.json`)
- **Grid Resolution**: $0.5^\circ \times 0.5^\circ$ oceanic grid.
- **Parameters**: Significant wave height ($H_s$), peak wave period ($T_p$), 10-meter wind speed ($U_{10}$), tropical depression tracking coordinates.
