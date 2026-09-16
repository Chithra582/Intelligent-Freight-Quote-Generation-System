import uuid
from django.db import models
from apps.masterdata.models import Port, Carrier
from apps.shipments.models import Shipment


class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='routes')
    route_name = models.CharField(max_length=200)
    origin_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='routes_origin')
    destination_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='routes_dest')
    carrier = models.ForeignKey(Carrier, on_delete=models.SET_NULL, null=True, related_name='carrier_routes')

    transit_days = models.IntegerField(default=10)
    distance_nm = models.FloatField(default=1000.0)
    route_risk_score = models.FloatField(default=0.15)
    congestion_score = models.FloatField(default=0.20)
    composite_score = models.FloatField(default=0.85)

    is_recommended = models.BooleanField(default=False)
    rank = models.IntegerField(default=1)
    agent_confidence = models.FloatField(default=0.92)

    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=1500.00)
    sub_scores = models.JSONField(default=dict)
    rationale = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['rank', '-composite_score']

    def __str__(self):
        return f"Route {self.rank}: {self.route_name} ({self.carrier.code if self.carrier else 'Carrier'}) - Score {self.composite_score}"


class RouteLeg(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='legs')
    leg_index = models.IntegerField(default=1)
    from_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='legs_from')
    to_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='legs_to')
    carrier = models.ForeignKey(Carrier, on_delete=models.SET_NULL, null=True, related_name='legs_carrier')
    vessel_name = models.CharField(max_length=150, blank=True, default='CMA CGM CHENNAI')
    transit_days = models.IntegerField(default=5)
    is_transhipment = models.BooleanField(default=False)

    class Meta:
        ordering = ['leg_index']

    def __str__(self):
        return f"Leg {self.leg_index}: {self.from_port.un_locode if self.from_port else 'Port'} -> {self.to_port.un_locode if self.to_port else 'Port'}"


class PortCongestionSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='congestion_snapshots')
    avg_waiting_hours = models.FloatField(default=12.0)
    vessels_waiting = models.IntegerField(default=5)
    vessels_berthing = models.IntegerField(default=3)
    congestion_index = models.FloatField(default=0.25)  # 0.0 to 1.0
    snapshot_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.port.un_locode} Congestion: {self.avg_waiting_hours} hrs ({self.congestion_index})"


class RoutePerformance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lane_key = models.CharField(max_length=50, db_index=True)  # e.g. INNSA-AEJEA
    carrier = models.ForeignKey(Carrier, on_delete=models.CASCADE, related_name='performances')
    on_time_pct = models.FloatField(default=90.0)
    avg_transit_days = models.FloatField(default=7.0)
    sample_count = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.lane_key} - {self.carrier.code} ({self.on_time_pct}% on-time)"
