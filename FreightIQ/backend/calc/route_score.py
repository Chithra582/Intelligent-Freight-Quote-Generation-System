from datetime import datetime, date
from typing import List, Dict, Any, Optional


def score_routes(
    routes: List[Dict[str, Any]],
    required_delivery_date: Optional[Any] = None
) -> List[Dict[str, Any]]:
    """
    Computes min-max normalized multi-factor composite route score (0 to 1) for candidate routings:
    Weights:
      - Transit speed (faster is better): 0.35
      - Cost competitiveness (cheaper is better): 0.30
      - Carrier reliability (higher is better): 0.20
      - Port congestion (lower waiting time is better): 0.15
    """
    if not routes:
        return []

    if len(routes) == 1:
        r = dict(routes[0])
        r['composite_score'] = 0.95
        r['sub_scores'] = {
            'transit_score': 1.0,
            'cost_score': 1.0,
            'reliability_score': float(r.get('carrier_reliability', 0.9)),
            'congestion_score': 1.0
        }
        r['is_recommended'] = True
        r['rank'] = 1
        return [r]

    # Extract ranges for min-max normalization
    transits = [float(r.get('transit_days', 10)) for r in routes]
    costs = [float(r.get('estimated_cost', 1000)) for r in routes]
    reliabilities = [float(r.get('carrier_reliability', 85)) for r in routes]
    congestions = [float(r.get('congestion_hours', 12)) for r in routes]

    min_t, max_t = min(transits), max(transits)
    min_c, max_c = min(costs), max(costs)
    min_r, max_r = min(reliabilities), max(reliabilities)
    min_cg, max_cg = min(congestions), max(congestions)

    scored_routes = []
    for r in routes:
        item = dict(r)
        t_val = float(item.get('transit_days', 10))
        c_val = float(item.get('estimated_cost', 1000))
        r_val = float(item.get('carrier_reliability', 85))
        cg_val = float(item.get('congestion_hours', 12))

        # Normalize (1.0 = best, 0.0 = worst)
        t_score = 1.0 if max_t == min_t else 1.0 - ((t_val - min_t) / (max_t - min_t))
        cost_score = 1.0 if max_c == min_c else 1.0 - ((c_val - min_c) / (max_c - min_c))
        rel_score = 1.0 if max_r == min_r else ((r_val - min_r) / (max_r - min_r))
        cong_score = 1.0 if max_cg == min_cg else 1.0 - ((cg_val - min_cg) / (max_cg - min_cg))

        composite = (0.35 * t_score) + (0.30 * cost_score) + (0.20 * rel_score) + (0.15 * cong_score)

        # Check required delivery date penalty
        delivery_date_str = item.get('arrival_date')
        date_missed = False
        if required_delivery_date and delivery_date_str:
            try:
                arr_dt = datetime.strptime(str(delivery_date_str)[:10], '%Y-%m-%d').date()
                req_dt = required_delivery_date if isinstance(required_delivery_date, date) else datetime.strptime(str(required_delivery_date)[:10], '%Y-%m-%d').date()
                if arr_dt > req_dt:
                    composite *= 0.40  # 60% penalty for missing hard deadline
                    date_missed = True
            except Exception:
                pass

        item['composite_score'] = round(composite, 4)
        item['date_deadline_missed'] = date_missed
        item['sub_scores'] = {
            'transit_score': round(t_score, 4),
            'cost_score': round(cost_score, 4),
            'reliability_score': round(rel_score, 4),
            'congestion_score': round(cong_score, 4)
        }
        scored_routes.append(item)

    # Sort descending by composite score
    scored_routes.sort(key=lambda x: x['composite_score'], reverse=True)

    for i, r in enumerate(scored_routes):
        r['rank'] = i + 1
        r['is_recommended'] = (i == 0)

    return scored_routes
