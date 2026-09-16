from django.db import models

class ShipmentRiskAssessment(models.Model):
    shipment_id = models.CharField(max_length=64, db_index=True)
    quote_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    weather_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    customs_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    route_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    port_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cargo_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2) # 0.00 - 100.00
    risk_level = models.CharField(max_length=20) # LOW, MEDIUM, HIGH, CRITICAL
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.95)
    explanation = models.TextField()
    assessed_at = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=30, default='v3.0-composite')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    created_at = models.DateTimeField(auto_now_add=True)

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
    created_at = models.DateTimeField(auto_now_add=True)
