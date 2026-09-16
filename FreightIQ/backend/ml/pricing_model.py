import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from decimal import Decimal
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pricing_model.joblib')

CARGO_MULTIPLIERS = {
    'STANDARD': 1.0,
    'FRAGILE': 1.25,
    'HAZARDOUS': 1.50,
    'PERISHABLE': 1.35
}

MODE_MULTIPLIERS = {
    'ROAD': 1.0,
    'RAIL': 0.75,
    'SEA': 0.50,
    'AIR': 2.80
}

CARGO_MAP = {'STANDARD': 0, 'FRAGILE': 1, 'HAZARDOUS': 2, 'PERISHABLE': 3}
MODE_MAP = {'ROAD': 0, 'RAIL': 1, 'SEA': 2, 'AIR': 3}


def generate_synthetic_pricing_dataset(n_samples: int = 1200) -> pd.DataFrame:
    """
    Generates synthetic freight pricing dataset incorporating:
    - Haversine distance (km)
    - Weight (kg) & Volume (m3)
    - Cargo type & Transport mode
    - Seasonal demand surge
    - Fuel price fluctuations
    """
    np.random.seed(42)

    distances = np.random.uniform(50, 8500, n_samples)
    weights = np.random.uniform(100, 32000, n_samples)
    volumes = np.random.uniform(0.5, 90.0, n_samples)

    cargo_types = np.random.choice(['STANDARD', 'FRAGILE', 'HAZARDOUS', 'PERISHABLE'], n_samples, p=[0.5, 0.2, 0.15, 0.15])
    modes = np.random.choice(['ROAD', 'RAIL', 'SEA', 'AIR'], n_samples, p=[0.35, 0.20, 0.35, 0.10])
    seasons = np.random.choice([1, 2, 3, 4], n_samples)  # 1: Q1, 2: Q2, 3: Q3, 4: Peak Q4

    base_rate_per_km = 2.45
    prices = []

    for i in range(n_samples):
        dist = distances[i]
        w = weights[i]
        v = volumes[i]
        c_type = cargo_types[i]
        m = modes[i]
        s = seasons[i]

        c_mult = CARGO_MULTIPLIERS.get(c_type, 1.0)
        m_mult = MODE_MULTIPLIERS.get(m, 1.0)

        # Weight/volume volumetric factor
        chargeable_weight = max(w, v * 167.0 if m == 'AIR' else v * 333.0)
        weight_factor = 1.0 + (chargeable_weight / 25000.0) * 0.45

        # Fuel surcharge (approx 8.5% of base)
        fuel_surcharge = (base_rate_per_km * dist * 0.085)

        # Seasonal multiplier (Q4 peak season has 15% increase)
        seasonal_mult = 1.15 if s == 4 else (1.05 if s == 3 else 1.0)

        # Non-linear market dynamics noise
        market_noise = np.random.normal(1.0, 0.04)

        price = (base_rate_per_km * dist * c_mult * m_mult * weight_factor * seasonal_mult + fuel_surcharge) * market_noise
        prices.append(max(500.0, round(price, 2)))

    df = pd.DataFrame({
        'distance_km': distances,
        'weight_kg': weights,
        'volume_cbm': volumes,
        'cargo_type': cargo_types,
        'transport_mode': modes,
        'season': seasons,
        'price': prices
    })
    return df


class FreightPricingMLModel:
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )
        self.is_trained = False
        self.metrics: Dict[str, float] = {}

    def extract_features(self, df: pd.DataFrame) -> np.ndarray:
        feats = []
        for _, r in df.iterrows():
            d = float(r['distance_km'])
            w = float(r['weight_kg'])
            v = float(r['volume_cbm'])
            c_idx = CARGO_MAP.get(str(r['cargo_type']).upper(), 0)
            m_idx = MODE_MAP.get(str(r['transport_mode']).upper(), 0)
            s = int(r.get('season', 3))
            feats.append([d, w, v, c_idx, m_idx, s])
        return np.array(feats)

    def train_and_save(self) -> Dict[str, Any]:
        df = generate_synthetic_pricing_dataset(n_samples=1500)
        split_idx = int(len(df) * 0.8)

        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]

        X_train = self.extract_features(train_df)
        y_train = train_df['price'].values

        X_test = self.extract_features(test_df)
        y_test = test_df['price'].values

        self.model.fit(X_train, y_train)
        self.is_trained = True

        preds = self.model.predict(X_test)
        r2 = float(r2_score(y_test, preds))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        mae = float(mean_absolute_error(y_test, preds))

        self.metrics = {
            'r2_score': round(r2, 4),
            'rmse': round(rmse, 2),
            'mae': round(mae, 2),
            'samples_trained': len(train_df),
            'samples_tested': len(test_df)
        }

        # Save to joblib
        joblib.dump({'model': self.model, 'metrics': self.metrics}, MODEL_PATH)
        return self.metrics

    def predict_price(
        self,
        distance_km: float,
        weight_kg: float,
        volume_cbm: float,
        cargo_type: str,
        transport_mode: str,
        season: int = 3
    ) -> float:
        if not self.is_trained:
            if os.path.exists(MODEL_PATH):
                data = joblib.load(MODEL_PATH)
                self.model = data['model']
                self.metrics = data.get('metrics', {})
                self.is_trained = True
            else:
                self.train_and_save()

        c_idx = CARGO_MAP.get(cargo_type.upper(), 0)
        m_idx = MODE_MAP.get(transport_mode.upper(), 0)
        feat = np.array([[float(distance_km), float(weight_kg), float(volume_cbm), c_idx, m_idx, season]])
        pred = self.model.predict(feat)[0]
        return max(500.0, round(float(pred), 2))


pricing_ml_engine = FreightPricingMLModel()
