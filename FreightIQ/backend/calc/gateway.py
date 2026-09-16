from typing import List, Dict, Any, Optional
from calc.distance import haversine_distance


def resolve_gateway(
    lat: float,
    lon: float,
    mode: str,
    candidates: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Finds the nearest active gateway (port, airport, or rail terminal) for the given coordinate and mode.
    """
    mode_u = mode.upper()
    valid_candidates = []

    for c in candidates:
        if not c.get('is_active', True):
            continue
        c_type = c.get('type', '').upper()
        modes = [m.upper() for m in c.get('supported_modes', [c_type])]

        if mode_u == 'OCEAN' and (c_type == 'PORT' or 'OCEAN' in modes):
            valid_candidates.append(c)
        elif mode_u in ('AIR', 'EXPRESS_AIR') and (c_type == 'AIRPORT' or 'AIR' in modes):
            valid_candidates.append(c)
        elif mode_u == 'GROUND_RAIL' and (c_type in ('HUB', 'PORT', 'AIRPORT') or 'GROUND_RAIL' in modes):
            valid_candidates.append(c)

    if not valid_candidates:
        return candidates[0] if candidates else None

    # Find candidate with minimum haversine distance
    best = min(
        valid_candidates,
        key=lambda c: haversine_distance(lat, lon, float(c['latitude']), float(c['longitude']))
    )

    dist_km = haversine_distance(lat, lon, float(best['latitude']), float(best['longitude']))
    res = dict(best)
    res['distance_to_point_km'] = dist_km
    return res
