import os
import re
import fitz # PyMuPDF
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def extract_and_train():
    pdf_path = r"C:\Users\Admin\.gemini\antigravity\brain\03754fc9-4e14-4052-8b78-e994f4637a55\.user_uploaded\media_1787844160787.pdf"
    doc = fitz.open(pdf_path)
    print(f"Opening PDF: {len(doc)} pages")

    records = []

    # Valid categoricals for alignment
    VALID_ORIGINS = ['Bengaluru', 'Mumbai', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Delhi']
    VALID_DESTS = ['Los Angeles', 'Dubai', 'Hamburg', 'London', 'Singapore', 'Colombo', 'New York', 'Rotterdam', 'Shanghai']
    VALID_MODES = ['Sea', 'Road', 'Air']
    VALID_CONTAINERS = ['LCL', '40FT_HC', 'AIR_CARGO', '40FT', '20FT']
    VALID_SEASONS = ['Off_Peak', 'Normal', 'Peak']
    VALID_CARRIERS = ['Carrier_A', 'Carrier_B', 'Carrier_C', 'Carrier_D', 'Carrier_E']

    # Process pairs of pages: (1,2), (3,4), ..., (217,218)
    for p in range(0, 218, 2):
        left_text = doc[p].get_text("text")
        right_text = doc[p+1].get_text("text")

        left_lines = [l.strip() for l in left_text.splitlines() if l.strip().startswith("SHP")]
        right_lines = [l.strip() for l in right_text.splitlines() if l.strip() and (l.startswith("Normal") or l.startswith("Peak") or l.startswith("Off_Peak"))]

        for i in range(min(len(left_lines), len(right_lines))):
            l_str = left_lines[i]
            r_str = right_lines[i]

            # Right line structure: Season Carrier Transit_Days Actual_Price
            r_parts = r_str.split()
            if len(r_parts) < 4:
                continue
            season = r_parts[0]
            carrier = r_parts[1]
            try:
                transit_days = float(r_parts[2])
                actual_price = float(r_parts[3])
            except ValueError:
                continue

            # Left line parse: SHPxxxxx Origin Destination Mode Cargo Weight Vol Dist Container Fuel
            # Regex extraction for reliable parsing
            shp_match = re.match(r"^(SHP\w+)", l_str)
            if not shp_match:
                continue
            shp_id = shp_match.group(1)
            rem = l_str[len(shp_id):].strip()

            # Extract origin
            orig = None
            for o in VALID_ORIGINS:
                if rem.startswith(o):
                    orig = o
                    rem = rem[len(o):].strip()
                    break
            if not orig:
                orig = 'Mumbai'

            # Extract dest
            dest = None
            for d in ['Los Angeles', 'New York', 'Rotterdam', 'Singapore', 'Colombo', 'Shanghai', 'Hamburg', 'London', 'Dubai']:
                if rem.startswith(d):
                    dest = d
                    rem = rem[len(d):].strip()
                    break
            if not dest:
                dest = 'Singapore'

            # Extract mode
            mode = None
            for m in ['Sea', 'Road', 'Air']:
                if rem.startswith(m):
                    mode = m
                    rem = rem[len(m):].strip()
                    break
            if not mode:
                mode = 'Sea'

            # Remainder contains: Cargo_Type Weight Volume Dist Container Fuel
            # Extract container from end or known token
            # Extract numbers from tail
            tokens = rem.split()
            if len(tokens) < 5:
                continue

            try:
                fuel_price = float(tokens[-1])
                container_type = tokens[-2]
                distance_km = float(tokens[-3])
                volume_cbm = float(tokens[-4])
                weight_kg = float(tokens[-5])
                cargo_type = " ".join(tokens[:-5])
                if not cargo_type:
                    cargo_type = "General Merchandise"
            except (ValueError, IndexError):
                continue

            records.append({
                'Shipment_ID': shp_id,
                'Origin': orig,
                'Destination': dest,
                'Transport_Mode': mode,
                'Cargo_Type': cargo_type,
                'Weight_KG': weight_kg,
                'Volume_CBM': volume_cbm,
                'Distance_KM': distance_km,
                'Container_Type': container_type,
                'Fuel_Price': fuel_price,
                'Season': season,
                'Carrier': carrier,
                'Transit_Days': transit_days,
                'Actual_Freight_Price_INR': actual_price
            })

    df = pd.DataFrame(records)
    print(f"\n=======================================================")
    print(f"Successfully Parsed Dataset: {df.shape[0]} Records, {df.shape[1]} Columns")
    print(f"=======================================================")

    # Ensure output directory exists
    os.makedirs(r"backend\ml\data", exist_ok=True)
    os.makedirs(r"backend\ml\models", exist_ok=True)

    csv_path = r"backend\ml\data\shipments_5000.csv"
    df.to_csv(csv_path, index=False)
    print(f"Saved cleaned dataset to: {csv_path}")

    # Feature matrix X and target y (Section 219 & 220 Spec)
    categorical_features = ['Origin', 'Destination', 'Transport_Mode', 'Cargo_Type', 'Container_Type', 'Season', 'Carrier']
    numerical_features = ['Weight_KG', 'Volume_CBM', 'Distance_KM', 'Fuel_Price', 'Transit_Days']
    target_column = 'Actual_Freight_Price_INR'

    X = df[categorical_features + numerical_features]
    y = df[target_column]

    # Step 4: 80/20 train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    print(f"Training Partition: {X_train.shape[0]} samples | Testing Partition: {X_test.shape[0]} samples")

    # Step 3 & 5: Preprocessing & Pipeline Construction
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', 'passthrough', numerical_features)
        ]
    )

    models = {
        'Linear Regression (Baseline)': LinearRegression(),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=6, random_state=42)
    }

    results = {}
    best_model_name = None
    best_r2 = -1.0
    best_pipeline = None

    print("\n--- Training & Evaluation (MAE, RMSE, R²) ---")
    for name, model in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        results[name] = {'MAE': mae, 'RMSE': rmse, 'R2': r2}
        print(f"[{name}]")
        print(f"   MAE:  ₹ {mae:,.2f}")
        print(f"   RMSE: ₹ {rmse:,.2f}")
        print(f"   R²:   {r2:.4f}\n")

        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name
            best_pipeline = pipeline

    # Save best model artifact
    model_save_path = r"backend\ml\models\freight_pricing_pipeline.joblib"
    joblib.dump(best_pipeline, model_save_path)
    print(f"✓ Best Model '{best_model_name}' (R²={best_r2:.4f}) successfully serialized to: {model_save_path}")

    return df, results

if __name__ == '__main__':
    extract_and_train()
