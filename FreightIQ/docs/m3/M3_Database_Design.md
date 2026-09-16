# Milestone 3 (M3) — Database Design & Schema Specification

## 1. Schema Overview

Milestone 3 introduces 17 relational models across weather, customs, risk, ML pricing, audit, and integrations.

```
 [Customer] ──► [Shipment] ──► [Route] ──► [WeatherAssessment] ──► [WeatherObservation]
      │              │                               │
      │              ▼                               ▼
      │          [Quote]                        [WeatherAlert]
      │              │
      │              ├──► [CustomsComplianceCheck] ──► [CustomsChecklistItem]
      │              │                                          ▲
      │              │                                          │
      │              │    [CustomsRequirement] ──► [RegulationDocument] ──► [RegulationChunk]
      │              │
      │              └──► [ShipmentRiskAssessment] ──► [RiskFactor]
      │                                   │
      │                                   └──► [RiskAlert]
      │
      └──► [ShipmentDocument] ──► [DataFreshness] ──► [IntegrationSyncLog]
```

---

## 2. Model Definitions

### 2.1 Weather Intelligence Models
```python
# 1. WeatherAssessment
class WeatherAssessment(models.Model):
    shipment_id = models.CharField(max_length=64, db_index=True)
    quote_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    route_id = models.CharField(max_length=64, db_index=True)
    risk_score = models.DecimalField(max_digits=5, decimal_places=2) # 0.00 - 100.00
    risk_level = models.CharField(max_length=20) # LOW, MEDIUM, HIGH, CRITICAL
    storm_risk = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    rainfall_risk = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    wind_risk = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    wave_risk = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    temperature_risk = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    delay_probability = models.DecimalField(max_digits=5, decimal_places=2) # 0.00 - 100.00%
    assessment_status = models.CharField(max_length=30, default='COMPLETED') # COMPLETED, DEGRADED, FALLBACK
    provider = models.CharField(max_length=64, default='NOAA_GFS_RADAR')
    provider_timestamp = models.DateTimeField(auto_now_add=True)
    assessed_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.95)

# 2. WeatherObservation
class WeatherObservation(models.Model):
    route_id = models.CharField(max_length=64, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    observation_time = models.DateTimeField(auto_now_add=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=2) # Celsius
    wind_speed = models.DecimalField(max_digits=6, decimal_places=2) # Knots
    wind_direction = models.CharField(max_length=10) # N, NE, E, SE, etc.
    rainfall = models.DecimalField(max_digits=6, decimal_places=2, default=0) # mm/hr
    wave_height = models.DecimalField(max_digits=5, decimal_places=2, default=0) # meters
    visibility = models.DecimalField(max_digits=6, decimal_places=2, default=10) # km
    pressure = models.DecimalField(max_digits=7, decimal_places=2, default=1013.25) # hPa
    weather_condition = models.CharField(max_length=50) # Clear, High Swell, Tropical Storm
    storm_detected = models.BooleanField(default=False)
    storm_type = models.CharField(max_length=50, blank=True, null=True)
    storm_severity = models.CharField(max_length=20, default='NONE')
    provider = models.CharField(max_length=64, default='NOAA_GFS')
    raw_payload = models.JSONField(default=dict, blank=True)

# 3. WeatherAlert
class WeatherAlert(models.Model):
    shipment_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    route_id = models.CharField(max_length=64, db_index=True)
    alert_type = models.CharField(max_length=50) # HIGH_WAVES, CYCLONE_WARNING, GALE
    severity = models.CharField(max_length=20) # INFO, WARNING, SEVERE, CRITICAL
    title = models.CharField(max_length=255)
    message = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(max_length=20, default='ACTIVE')
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
```

---

### 2.2 Customs Intelligence & RAG Models
```python
# 4. CustomsRequirement
class CustomsRequirement(models.Model):
    origin_country = models.CharField(max_length=2, db_index=True) # ISO Alpha-2 (e.g. IN)
    destination_country = models.CharField(max_length=2, db_index=True) # ISO Alpha-2 (e.g. SG, NL)
    hs_code = models.CharField(max_length=12, db_index=True) # e.g. 8504.40
    commodity = models.CharField(max_length=255)
    incoterm = models.CharField(max_length=3) # CIF, FOB, DDP, etc.
    requirement_type = models.CharField(max_length=50) # TARIFF, DOCUMENT, RESTRICTION
    description = models.TextField()
    mandatory = models.BooleanField(default=True)
    risk_level = models.CharField(max_length=20, default='LOW')
    regulation_id = models.CharField(max_length=64, blank=True, null=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True)

# 5. CustomsDocumentRequirement
class CustomsDocumentRequirement(models.Model):
    customs_requirement = models.ForeignKey(CustomsRequirement, on_delete=models.CASCADE, related_name='doc_requirements')
    document_type = models.CharField(max_length=50) # INVOICE, PACKING_LIST, COO, SDS
    document_name = models.CharField(max_length=255)
    mandatory = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    accepted_formats = models.CharField(max_length=100, default='PDF,PNG,JPEG')

# 6. CustomsComplianceCheck
class CustomsComplianceCheck(models.Model):
    shipment_id = models.CharField(max_length=64, db_index=True)
    quote_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    origin_country = models.CharField(max_length=2)
    destination_country = models.CharField(max_length=2)
    hs_code = models.CharField(max_length=12)
    commodity = models.CharField(max_length=255)
    incoterm = models.CharField(max_length=3)
    readiness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0) # 0-100%
    risk_level = models.CharField(max_length=20, default='LOW')
    status = models.CharField(max_length=30, default='PENDING_REVIEW') # PASS, NEEDS_DOCUMENTS, PENDING_REVIEW, APPROVED, REJECTED
    checked_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    created_by = models.CharField(max_length=100)
    reviewed_by = models.CharField(max_length=100, blank=True, null=True)

# 7. CustomsChecklistItem
class CustomsChecklistItem(models.Model):
    compliance_check = models.ForeignKey(CustomsComplianceCheck, on_delete=models.CASCADE, related_name='checklist_items')
    requirement_id = models.CharField(max_length=64, blank=True, null=True)
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    mandatory = models.BooleanField(default=True)
    status = models.CharField(max_length=30, default='PENDING') # VERIFIED, MISSING, PENDING
    document_required = models.BooleanField(default=True)
    document_uploaded = models.BooleanField(default=False)
    evidence = models.TextField(blank=True)
    citation = models.CharField(max_length=255, blank=True)
    reviewer_comment = models.TextField(blank=True)

# 8. RegulationDocument & RegulationChunk
class RegulationDocument(models.Model):
    title = models.CharField(max_length=255)
    country = models.CharField(max_length=2, db_index=True)
    authority = models.CharField(max_length=100) # e.g. DGFT, ICEGATE, Singapore Customs
    document_type = models.CharField(max_length=50) # TARIFF_ACT, CIRCULAR, FTA_AGREEMENT
    source_url = models.URLField(blank=True)
    source_name = models.CharField(max_length=100)
    version = models.CharField(max_length=20, default='2026.1')
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    published_at = models.DateField()
    content = models.TextField()
    status = models.CharField(max_length=20, default='ACTIVE')
    last_synced_at = models.DateTimeField(auto_now=True)

class RegulationChunk(models.Model):
    regulation_document = models.ForeignKey(RegulationDocument, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.PositiveIntegerField()
    content = models.TextField()
    embedding = models.JSONField(default=list, blank=True) # 1536-dim vector representation
    metadata = models.JSONField(default=dict, blank=True)
    page_number = models.PositiveIntegerField(default=1)
    section_name = models.CharField(max_length=255, blank=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)

# 9. HSCodeReference
class HSCodeReference(models.Model):
    hs_code = models.CharField(max_length=12, primary_key=True)
    description = models.TextField()
    chapter = models.CharField(max_length=4)
    heading = models.CharField(max_length=6)
    subheading = models.CharField(max_length=8)
    commodity_type = models.CharField(max_length=100)
    restricted = models.BooleanField(default=False)
    prohibited = models.BooleanField(default=False)
    country = models.CharField(max_length=2, default='GLOBAL')
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    source = models.CharField(max_length=100, default='WCO_HS_2026')
```

---

### 2.3 Shipment Risk Scoring Models
```python
# 10. ShipmentRiskAssessment
class ShipmentRiskAssessment(models.Model):
    shipment_id = models.CharField(max_length=64, db_index=True)
    quote_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    weather_score = models.DecimalField(max_digits=5, decimal_places=2)
    customs_score = models.DecimalField(max_digits=5, decimal_places=2)
    route_score = models.DecimalField(max_digits=5, decimal_places=2)
    port_score = models.DecimalField(max_digits=5, decimal_places=2)
    cargo_score = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2) # 0-100
    risk_level = models.CharField(max_length=20) # LOW, MEDIUM, HIGH, CRITICAL
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.92)
    explanation = models.TextField()
    assessed_at = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=30, default='v3.0-composite')

# 11. RiskFactor
class RiskFactor(models.Model):
    risk_assessment = models.ForeignKey(ShipmentRiskAssessment, on_delete=models.CASCADE, related_name='factors')
    factor_type = models.CharField(max_length=50) # WEATHER, CUSTOMS, ROUTE, PORT, CARGO
    factor_name = models.CharField(max_length=100)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    weight = models.DecimalField(max_digits=4, decimal_places=2) # e.g. 0.30
    contribution = models.DecimalField(max_digits=5, decimal_places=2) # score * weight
    severity = models.CharField(max_length=20) # LOW, MEDIUM, HIGH, CRITICAL
    reason = models.TextField()
    source = models.CharField(max_length=100)

# 12. RiskAlert
class RiskAlert(models.Model):
    shipment_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    quote_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    risk_assessment = models.ForeignKey(ShipmentRiskAssessment, on_delete=models.SET_NULL, null=True, blank=True)
    alert_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=20)
    title = models.CharField(max_length=255)
    message = models.TextField()
    source = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='ACTIVE')
    acknowledged_by = models.CharField(max_length=100, blank=True, null=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.CharField(max_length=100, blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
```

---

### 2.4 Document, Audit & Integration Models
```python
# 13. ShipmentDocument
class ShipmentDocument(models.Model):
    shipment_id = models.CharField(max_length=64, db_index=True)
    customs_check_id = models.CharField(max_length=64, blank=True, null=True)
    document_type = models.CharField(max_length=50)
    file_name = models.CharField(max_length=255)
    file_url = models.URLField()
    mime_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField()
    uploaded_by = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verification_status = models.CharField(max_length=30, default='PENDING') # VERIFIED, REJECTED, PENDING
    verified_by = models.CharField(max_length=100, blank=True, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

# 14. DataFreshness
class DataFreshness(models.Model):
    provider = models.CharField(max_length=100, db_index=True)
    data_type = models.CharField(max_length=100) # WEATHER, TARIFF, AIS, SANCTIONS
    last_success_at = models.DateTimeField()
    last_attempt_at = models.DateTimeField()
    record_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=30, default='FRESH') # FRESH, STALE, DEGRADED
    freshness_seconds = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)

# 15. IntegrationSyncLog
class IntegrationSyncLog(models.Model):
    provider = models.CharField(max_length=100)
    integration_type = models.CharField(max_length=100)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField()
    status = models.CharField(max_length=30) # SUCCESS, PARTIAL, FAILED
    records_processed = models.PositiveIntegerField(default=0)
    records_failed = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)
    request_id = models.CharField(max_length=64, blank=True)

# 16. AlertSubscription
class AlertSubscription(models.Model):
    user_id = models.CharField(max_length=100, db_index=True)
    alert_type = models.CharField(max_length=50) # WEATHER, CUSTOMS, MARGIN_FLOOR
    severity = models.CharField(max_length=20, default='HIGH')
    email_enabled = models.BooleanField(default=True)
    teams_enabled = models.BooleanField(default=False)
    slack_enabled = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
```
