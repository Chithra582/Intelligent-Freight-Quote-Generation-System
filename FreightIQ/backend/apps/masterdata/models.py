import uuid
from django.db import models


class Country(models.Model):
    code = models.CharField(max_length=2, primary_key=True)  # ISO 3166-1 alpha-2
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=50, default='APAC')  # APAC, MEASA, EMEA, AMER
    currency_code = models.CharField(max_length=3, default='USD')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Port(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    un_locode = models.CharField(max_length=5, unique=True, db_index=True)  # e.g., INNSA, AEJEA
    name = models.CharField(max_length=150)
    city = models.CharField(max_length=100, db_index=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='ports')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timezone = models.CharField(max_length=50, default='UTC')
    is_transhipment_hub = models.BooleanField(default=False)
    supported_modes = models.JSONField(default=list)  # ['OCEAN', 'GROUND_RAIL']
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['un_locode']),
            models.Index(fields=['city']),
        ]

    def __str__(self):
        return f"{self.name} [{self.un_locode}] - {self.city}, {self.country_id}"


class Airport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    iata_code = models.CharField(max_length=3, unique=True, db_index=True)  # e.g. BOM, DXB
    icao_code = models.CharField(max_length=4, blank=True, default='')
    name = models.CharField(max_length=150)
    city = models.CharField(max_length=100, db_index=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='airports')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timezone = models.CharField(max_length=50, default='UTC')
    has_cargo_terminal = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} [{self.iata_code}] - {self.city}, {self.country_id}"


class PortDistance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='distances_out')
    to_port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='distances_in')
    nautical_miles = models.FloatField()
    corridor_via = models.CharField(max_length=50, default='Direct')  # Suez, Panama, Malacca, Cape

    class Meta:
        unique_together = ('from_port', 'to_port')
        indexes = [
            models.Index(fields=['from_port', 'to_port']),
        ]

    def __str__(self):
        return f"{self.from_port.un_locode} -> {self.to_port.un_locode}: {self.nautical_miles} NM ({self.corridor_via})"


class Carrier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True)  # SCAC or IATA code e.g. MSK, CMA, FDX
    name = models.CharField(max_length=150)
    service_type = models.CharField(max_length=50, default='Ocean')  # Ocean, Air, Rail, Express
    reliability_score = models.FloatField(default=90.0)
    on_time_pct = models.FloatField(default=88.0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class CarrierService(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    carrier = models.ForeignKey(Carrier, on_delete=models.CASCADE, related_name='services')
    service_name = models.CharField(max_length=150)
    port_rotation = models.JSONField(default=list)  # list of UNLOCODEs in sequence: ['CNSHA', 'SGSIN', 'AEJEA', 'NLRTM']
    frequency_days = models.IntegerField(default=7)
    sailings_per_week = models.FloatField(default=1.0)
    transit_days = models.IntegerField(default=14)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.carrier.code} - {self.service_name}"


class ContainerType(models.Model):
    code = models.CharField(max_length=10, primary_key=True)  # 20GP, 40GP, 40HC, 20RF, 40RF
    name = models.CharField(max_length=100)
    length_ft = models.FloatField(default=20.0)
    width_ft = models.FloatField(default=8.0)
    height_ft = models.FloatField(default=8.5)
    max_payload_kg = models.IntegerField(default=28000)
    tare_weight_kg = models.IntegerField(default=2300)
    internal_cbm = models.FloatField(default=33.2)
    is_reefer = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Commodity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hs_code = models.CharField(max_length=12, db_index=True)
    name = models.CharField(max_length=200)
    cargo_type = models.CharField(max_length=30, default='GEN')
    duty_rate_pct = models.DecimalField(max_digits=5, decimal_places=2, default=7.50)
    is_restricted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} [HS {self.hs_code}]"


class Currency(models.Model):
    code = models.CharField(max_length=3, primary_key=True)
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=5, default='$')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.symbol})"


class FxRate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='rates_from')
    to_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='rates_to')
    rate = models.DecimalField(max_digits=12, decimal_places=6)
    effective_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('from_currency', 'to_currency', 'effective_date')

    def __str__(self):
        return f"1 {self.from_currency_id} = {self.rate} {self.to_currency_id}"


class BusinessCalendar(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='holidays')
    date = models.DateField(db_index=True)
    holiday_name = models.CharField(max_length=150)
    is_holiday = models.BooleanField(default=True)

    class Meta:
        unique_together = ('country', 'date')

    def __str__(self):
        return f"{self.country_id} - {self.date}: {self.holiday_name}"
