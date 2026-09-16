import math
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple, Any

MODE_CONSTANTS = {
    'OCEAN_FCL': {
        'speed_unit_per_day': 400.0,  # 400 nm/day
        'origin_dwell': 3.0,
        'dest_dwell': 3.0,
        'buffer': 4.0,
        'handling_days': 0.0,
    },
    'OCEAN_LCL': {
        'speed_unit_per_day': 400.0,  # 400 nm/day
        'origin_dwell': 5.0,  # Longer dwell for consolidation
        'dest_dwell': 5.0,    # Longer dwell for deconsolidation
        'buffer': 5.0,
        'handling_days': 0.0,
    },
    'AIR': {
        'speed_unit_per_day': 19200.0,  # 800 km/h * 24h
        'origin_dwell': 2.0,
        'dest_dwell': 1.5,
        'buffer': 2.0,
        'handling_days': 1.0,
    },
    'EXPRESS_AIR': {
        'speed_unit_per_day': 19200.0,
        'origin_dwell': 0.5,
        'dest_dwell': 0.5,
        'buffer': 1.0,
        'handling_days': 0.25,
    },
    'GROUND_RAIL': {
        'speed_unit_per_day': 450.0,  # 450 km/day road
        'origin_dwell': 0.5,
        'dest_dwell': 0.5,
        'buffer': 2.0,
        'handling_days': 0.0,
    }
}


def add_business_days(
    start_date: date,
    days: int,
    holidays: Optional[Set[date]] = None,
    weekend_days: Tuple[int, ...] = (5, 6)  # Saturday=5, Sunday=6
) -> date:
    """
    Steps forward day by day, skipping weekend days and country-specific holidays.
    """
    if isinstance(start_date, datetime):
        curr = start_date.date()
    elif isinstance(start_date, str):
        curr = datetime.strptime(start_date, '%Y-%m-%d').date()
    else:
        curr = start_date

    holiday_set = holidays or set()
    added = 0
    target_days = max(1, int(days))

    while added < target_days:
        curr += timedelta(days=1)
        if curr.weekday() not in weekend_days and curr not in holiday_set:
            added += 1

    return curr


def estimate_transit(
    main_leg_dist: float,
    mode: str,
    load_type: str = 'FCL',
    pickup_road_km: float = 0.0,
    delivery_road_km: float = 0.0,
    sailings_per_week: float = 2.0,
    has_door_pickup: bool = False,
    has_door_delivery: bool = False,
    ready_date: Optional[Any] = None,
    holidays: Optional[Set[date]] = None
) -> Dict[str, Any]:
    """
    Computes exact transit time breakdown and calendar-aware arrival date.
    """
    mode_u = mode.upper()
    load_u = load_type.upper() if load_type else 'FCL'

    if mode_u == 'OCEAN':
        cfg_key = 'OCEAN_LCL' if load_u == 'LCL' else 'OCEAN_FCL'
    elif mode_u in MODE_CONSTANTS:
        cfg_key = mode_u
    else:
        cfg_key = 'OCEAN_FCL'

    constants = MODE_CONSTANTS[cfg_key]

    # Pre-carriage pickup dwell
    if has_door_pickup and pickup_road_km > 0:
        t_pickup = max(1.0, math.ceil(pickup_road_km / 450.0))
    else:
        t_pickup = 0.0

    t_origin_dwell = constants['origin_dwell']

    # Main leg line-haul
    speed = constants['speed_unit_per_day']
    t_linehaul = round((main_leg_dist / speed) + constants['handling_days'], 2)

    # Ocean schedule wait time
    if mode_u == 'OCEAN':
        freq = max(1.0, float(sailings_per_week))
        t_schedule = round((7.0 / freq) / 2.0, 2)
    else:
        t_schedule = 0.0

    t_dest_dwell = constants['dest_dwell']

    # On-carriage delivery dwell
    if has_door_delivery and delivery_road_km > 0:
        t_delivery = max(1.0, math.ceil(delivery_road_km / 450.0))
    else:
        t_delivery = 0.0

    t_total = t_pickup + t_origin_dwell + t_linehaul + t_schedule + t_dest_dwell + t_delivery
    min_days = round(t_total, 1)
    max_days = round(t_total + constants['buffer'], 1)

    start_dt = ready_date or date.today()
    if isinstance(start_dt, str):
        start_dt = datetime.strptime(start_dt, '%Y-%m-%d').date()

    arrival_date_min = add_business_days(start_dt, int(math.ceil(min_days)), holidays)
    arrival_date_max = add_business_days(start_dt, int(math.ceil(max_days)), holidays)

    return {
        'min_days': min_days,
        'max_days': max_days,
        'transit_range': [min_days, max_days],
        'estimated_days': min_days,
        'arrival_date': arrival_date_min.strftime('%Y-%m-%d'),
        'arrival_date_max': arrival_date_max.strftime('%Y-%m-%d'),
        'breakdown': {
            'pickup_days': t_pickup,
            'origin_dwell_days': t_origin_dwell,
            'linehaul_days': t_linehaul,
            'schedule_wait_days': t_schedule,
            'dest_dwell_days': t_dest_dwell,
            'delivery_days': t_delivery,
            'buffer_days': constants['buffer']
        }
    }
