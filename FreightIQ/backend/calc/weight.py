from typing import List, Dict, Any

DIVISOR = {
    'AIR': 6000.0,
    'EXPRESS_AIR': 5000.0,
    'GROUND_RAIL': 4500.0,
    'OCEAN_LCL': 1000.0,
}


def actual_weight(items: List[Dict[str, Any]]) -> float:
    """Computes total physical gross weight in kg across all shipment line items."""
    total_kg = 0.0
    for item in items:
        qty = float(item.get('quantity', 1))
        weight_per_unit = float(item.get('weight_per_unit_kg', item.get('weight_kg', 0)))
        total_kg += qty * weight_per_unit
    return round(total_kg, 2)


def volumetric_weight(items: List[Dict[str, Any]], mode: str) -> float:
    """
    Computes dimensional weight in kg or volume metric depending on transport mode.
    """
    mode_key = mode.upper()
    divisor = DIVISOR.get(mode_key, 6000.0)

    total_dim_weight = 0.0
    for item in items:
        qty = float(item.get('quantity', 1))
        length = float(item.get('length_cm', 0))
        width = float(item.get('width_cm', 0))
        height = float(item.get('height_cm', 0))
        vol_cm3 = length * width * height * qty
        total_dim_weight += vol_cm3 / divisor

    return round(total_dim_weight, 2)


def total_volume_cbm(items: List[Dict[str, Any]]) -> float:
    """Computes total volume in Cubic Meters (CBM)."""
    total_cm3 = 0.0
    for item in items:
        qty = float(item.get('quantity', 1))
        length = float(item.get('length_cm', 0))
        width = float(item.get('width_cm', 0))
        height = float(item.get('height_cm', 0))
        total_cm3 += length * width * height * qty
    return round(total_cm3 / 1_000_000.0, 3)


def chargeable_weight(
    items: List[Dict[str, Any]],
    mode: str,
    load_type: str = 'FCL',
    package_type: str = 'CARTON',
    container_count: int = 1,
    container_type: str = '40HC'
) -> Dict[str, Any]:
    """
    Calculates the chargeable basis according to the 3 distinct logistics branches:
    1. FCL / CONTAINER -> PER_CONTAINER basis (weight is a payload limit check, not a charge multiplier).
    2. Ocean LCL -> REVENUE_TON basis (max of CBM vs Metric Tonnes).
    3. Air / Express / Ground -> CHARGEABLE_KG basis (max of Actual Weight vs Volumetric Weight).
    """
    mode_u = mode.upper()
    load_u = load_type.upper() if load_type else 'FCL'
    pkg_u = package_type.upper() if package_type else 'CARTON'

    # Branch 1: Ocean FCL or Container package type
    if pkg_u == 'CONTAINER' or (mode_u == 'OCEAN' and load_u == 'FCL'):
        return {
            'basis': 'PER_CONTAINER',
            'units': int(container_count),
            'container_type': container_type,
            'container_count': int(container_count),
            'chargeable_units': int(container_count),
            'label': f"Containers: {container_count} \u00d7 {container_type}"
        }

    # Branch 2: Ocean LCL
    if mode_u == 'OCEAN' and load_u == 'LCL':
        act_kg = actual_weight(items)
        tonnes = act_kg / 1000.0
        cbm = total_volume_cbm(items)
        revenue_tons = round(max(cbm, tonnes), 3)
        return {
            'basis': 'REVENUE_TON',
            'units': revenue_tons,
            'actual_tonnes': round(tonnes, 3),
            'volume_cbm': cbm,
            'chargeable_units': revenue_tons,
            'label': f"Revenue tons: {revenue_tons} R/T"
        }

    # Branch 3: Air Freight, Express Air, Ground & Rail
    act_kg = actual_weight(items)
    vol_kg = volumetric_weight(items, mode_u)
    chargeable_kg = round(max(act_kg, vol_kg), 2)

    return {
        'basis': 'CHARGEABLE_KG',
        'units': chargeable_kg,
        'actual_weight_kg': act_kg,
        'volumetric_weight_kg': vol_kg,
        'chargeable_units': chargeable_kg,
        'label': f"Chargeable: {chargeable_kg} kg"
    }
