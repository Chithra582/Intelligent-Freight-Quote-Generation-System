import json
import pytest
from pathlib import Path
from calc.distance import haversine_distance, road_distance, sea_distance, main_leg_distance
from calc.weight import actual_weight, volumetric_weight, chargeable_weight, total_volume_cbm
from calc.transit import estimate_transit, add_business_days
from calc.route_score import score_routes
from calc.pricing_stub import compute_indicative_total
from calc.gateway import resolve_gateway

TEST_VECTORS_PATH = Path(__file__).resolve().parent.parent / 'test_vectors.json'


@pytest.fixture
def test_vectors():
    with open(TEST_VECTORS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def test_all_30_shared_test_vectors(test_vectors):
    assert len(test_vectors) == 30, f"Expected 30 test vectors, found {len(test_vectors)}"

    for tv in test_vectors:
        cat = tv['category']
        inp = tv['input']
        exp = tv['expected']

        if cat == 'distance_haversine':
            res = haversine_distance(inp['lat1'], inp['lon1'], inp['lat2'], inp['lon2'])
            assert abs(res - exp['distance_km']) < 1.0

        elif cat == 'distance_road':
            res = road_distance(inp['lat1'], inp['lon1'], inp['lat2'], inp['lon2'], inp.get('country', 'DEFAULT'))
            assert abs(res - exp['road_km']) < 1.0

        elif cat == 'distance_sea' or cat.startswith('distance_sea_'):
            res = sea_distance(inp['origin_code'], inp['dest_code'])
            assert res == exp['sea_nm']

        elif cat == 'distance_airway_overhead':
            gc = haversine_distance(inp['lat1'], inp['lon1'], inp['lat2'], inp['lon2'])
            air_km = round(gc * 1.06, 2)
            assert abs(air_km - exp['airway_km']) < 1.0

        elif cat == 'distance_rail_factor':
            gc = haversine_distance(inp['lat1'], inp['lon1'], inp['lat2'], inp['lon2'])
            rail_km = round(gc * 1.30, 2)
            assert abs(rail_km - exp['corridor_km']) < 1.0

        elif cat == 'weight_actual':
            res = actual_weight(inp['items'])
            assert res == exp['actual_weight_kg']

        elif 'weight_volumetric' in cat:
            res = volumetric_weight(inp['items'], inp['mode'])
            assert res == exp['volumetric_weight_kg']

        elif 'chargeable_weight' in cat:
            res = chargeable_weight(
                items=inp.get('items', []),
                mode=inp.get('mode', 'OCEAN'),
                load_type=inp.get('load_type', 'FCL'),
                package_type=inp.get('package_type', 'CARTON'),
                container_count=inp.get('container_count', 1),
                container_type=inp.get('container_type', '40HC')
            )
            assert res['basis'] == exp['basis']
            assert res['units'] == exp['units']
            assert res['label'] == exp['label']

        elif cat == 'cbm_volume_calculation':
            res = total_volume_cbm(inp['items'])
            assert res == exp['total_cbm']

        elif 'transit_' in cat:
            res = estimate_transit(
                main_leg_dist=inp['main_leg_dist'],
                mode=inp['mode'],
                load_type=inp.get('load_type', 'FCL'),
                has_door_pickup=inp.get('has_door_pickup', False),
                pickup_road_km=inp.get('pickup_road_km', 0),
                has_door_delivery=inp.get('has_door_delivery', False),
                delivery_road_km=inp.get('delivery_road_km', 0),
                sailings_per_week=inp.get('sailings_per_week', 2.0)
            )
            assert abs(res['min_days'] - exp['min_days']) < 0.5

        elif 'business_days_' in cat:
            res = add_business_days(inp['start_date'], inp['days'])
            assert res.strftime('%Y-%m-%d') == exp['arrival_date']

        elif cat == 'route_scoring_weights':
            res = score_routes(inp['routes'])
            assert res[0]['id'] == exp['recommended_id']

        elif 'indicative_total_' in cat:
            res = compute_indicative_total(
                origin_region=inp['origin_region'],
                dest_region=inp['dest_region'],
                mode=inp['mode'],
                load_type=inp.get('load_type', 'FCL'),
                chargeable_info=inp['chargeable_info'],
                container_type=inp.get('container_type', '40HC')
            )
            assert abs(res['amount'] - exp['amount']) < 0.5
            assert res['currency'] == exp['currency']

        elif cat == 'gateway_resolution_nearest':
            candidates = [
                {'un_locode': 'INNSA', 'latitude': 18.95, 'longitude': 72.95, 'type': 'PORT', 'is_active': True},
                {'un_locode': 'INMAA', 'latitude': 13.08, 'longitude': 80.27, 'type': 'PORT', 'is_active': True}
            ]
            res = resolve_gateway(inp['lat'], inp['lon'], inp['mode'], candidates)
            assert res['un_locode'] == exp['resolved_code']
