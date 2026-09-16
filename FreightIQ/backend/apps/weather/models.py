from django.db import models

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
    expires_at = models.DateTimeField(null=True, blank=True)
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.95)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"WeatherAssessment({self.shipment_id}, {self.risk_level}, Score: {self.risk_score})"

class WeatherObservation(models.Model):
    route_id = models.CharField(max_length=64, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    observation_time = models.DateTimeField(auto_now_add=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, default=28.0)
    wind_speed = models.DecimalField(max_digits=6, decimal_places=2, default=12.0)
    wind_direction = models.CharField(max_length=10, default='NE')
    rainfall = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    wave_height = models.DecimalField(max_digits=5, decimal_places=2, default=1.2)
    visibility = models.DecimalField(max_digits=6, decimal_places=2, default=10.0)
    pressure = models.DecimalField(max_digits=7, decimal_places=2, default=1013.25)
    weather_condition = models.CharField(max_length=50, default='Clear')
    storm_detected = models.BooleanField(default=False)
    storm_type = models.CharField(max_length=50, blank=True, null=True)
    storm_severity = models.CharField(max_length=20, default='NONE')
    provider = models.CharField(max_length=64, default='NOAA_GFS')
    raw_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class WeatherAlert(models.Model):
    shipment_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    route_id = models.CharField(max_length=64, db_index=True)
    alert_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=20) # INFO, WARNING, SEVERE, CRITICAL
    title = models.CharField(max_length=255)
    message = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    starts_at = models.DateTimeField(auto_now_add=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='ACTIVE')
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
