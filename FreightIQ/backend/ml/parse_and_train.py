import fitz
import re
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def parse_full_pdf():
    pdf_path = r"C:\Users\Admin\.gemini\antigravity\brain\03754fc9-4e14-4052-8b78-e994f4637a55\.user_uploaded\media_1787844160787.pdf"
    doc = fitz.open(pdf_path)
    print(f"Loaded PDF with {len(doc)} pages.")

    left_records = []
    right_records = []

    ORIGINS = ['Bengaluru', 'Mumbai', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Delhi']
    DESTS = ['Los Angeles', 'Los Angele', 'New York', 'Rotterdam', 'Singapore', 'Colombo', 'Shanghai', 'Hamburg', 'London', 'Dubai', 'Jebel Ali']
    MODES = ['Sea', 'Road', 'Air']
    CARGO_TYPES = ['Textiles', 'Furniture', 'Pharmaceuticals', 'Pharmace', 'Chemicals', 'Machinery', 'Machiner', 'Food Products', 'Food Proc', 'Automotive Parts', 'Automotiv', 'Electronics', 'Electronic']
    CONTAINERS = ['40FT_HC', '40FT', '20FT', 'AIR_CARGO', 'AIR_CARG', 'LCL']

    # 1. Parse Odd Pages (Left Side: Shipment info)
    for p_idx in range(0, 218, 2):
        text = doc[p_idx].get_text("text")
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        
        # We group tokens starting at SHP
        i = 0
        while i < len(lines):
            line = lines[i]
            m = re.search(r"(SHP\d+[A-Z]?)", line)
            if m:
                shp_id = m.group(1)
                
                # Next collect lines until next SHP or end
                chunk = [line]
                i += 1
                while i < len(lines) and not re.search(r"SHP\d+", lines[i]):
                    chunk.append(lines[i])
                    i += 1
                
                # Combine chunk into single string for parsing
                full_str = " ".join(chunk)
                
                # Extract Origin
                orig = 'Mumbai'
                for o in ORIGINS:
                    if o in full_str:
                        orig = o
                        break
                
                # Extract Dest
                dest = 'Singapore'
                for d in DESTS:
                    if d in full_str:
                        dest = 'Los Angeles' if 'Los' in d else ('Jebel Ali' if 'Jebel' in d else ('New York' if 'New' in d else d))
                        break
                
                # Extract Mode
                mode = 'Sea'
                for mo in MODES:
                    if re.search(rf"\b{mo}\b", full_str):
                        mode = mo
                        break
                
                # Extract Cargo
                cargo = 'General Merchandise'
                for c in CARGO_TYPES:
                    if c in full_str:
                        if 'Pharm' in c: cargo = 'Pharmaceuticals'
                        elif 'Food' in c: cargo = 'Food Products'
                        elif 'Auto' in c: cargo = 'Automotive Parts'
                        elif 'Elect' in c: cargo = 'Electronics'
                        elif 'Mach' in c: cargo = 'Machinery'
                        else: cargo = c
                        break
                
                # Extract Container
                container = '40FT_HC'
                for co in CONTAINERS:
                    if co in full_str:
                        container = 'AIR_CARGO' if 'AIR' in co else co
                        break
                
                # Extract numbers from chunk: Weight, Volume, Distance, Fuel
                # Look at individual lines in chunk for numerical floats
                nums = []
                for cl in chunk:
                    found = re.findall(r"(\d+(?:\.\d+)?)", cl)
                    for f in found:
                        if f != shp_id.replace("SHP", ""):
                            try:
                                nums.append(float(f))
                            except ValueError:
                                pass
                
                # Heuristic mapping of numbers:
                # Typically: Weight (~500 - 25000), Volume (~0.5 - 50.0), Distance (~500 - 15000), Fuel (~75.0 - 115.0)
                weight = 5000.0
                volume = 12.0
                dist = 5000.0
                fuel = 95.0
                
                for n in nums:
                    if 70.0 <= n <= 120.0 and (fuel == 95.0 or n != fuel):
                        fuel = n
                    elif 500.0 <= n <= 25000.0 and n > 1500 and weight == 5000.0:
                        weight = n
                    elif 0.3 <= n <= 60.0 and volume == 12.0:
                        volume = n
                    elif 500.0 <= n <= 14000.0:
                        dist = n

                left_records.append({
                    'Shipment_ID': shp_id,
                    'Origin': orig,
                    'Destination': dest,
                    'Transport_Mode': mode,
                    'Cargo_Type': cargo,
                    'Weight_KG': weight,
                    'Volume_CBM': volume,
                    'Distance_KM': dist,
                    'Container_Type': container,
                    'Fuel_Price': fuel
                })
            else:
                i += 1

    # 2. Parse Even Pages (Right Side: Season, Carrier, Transit_Days, Actual_Freight_Price_INR)
    for p_idx in range(1, 219, 2):
        text = doc[p_idx].get_text("text")
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        
        i = 0
        while i < len(lines):
            line = lines[i]
            # Check if starts with a Season
            season_m = re.match(r"^(Normal|Peak|Off_Peak)", line)
            if season_m:
                season = season_m.group(1)
                rem = line[len(season):].strip()
                
                # Check Carrier
                carrier = 'Carrier_A'
                c_match = re.search(r"(Carrier_[A-E])", rem)
                if c_match:
                    carrier = c_match.group(1)
                    rem = rem.replace(carrier, "").strip()
                else:
                    # check next line for carrier
                    if i + 1 < len(lines) and re.search(r"Carrier_[A-E]", lines[i+1]):
                        i += 1
                        carrier = re.search(r"Carrier_[A-E]", lines[i]).group(0)
                
                # Extract transit days and price
                # Remaining tokens or next lines
                tokens = rem.split()
                transit = None
                price = None
                
                if len(tokens) >= 2:
                    try:
                        transit = float(tokens[0])
                        price = float(tokens[1])
                    except ValueError:
                        pass
                
                if transit is None:
                    # Look ahead 1 or 2 lines
                    while i + 1 < len(lines) and price is None:
                        i += 1
                        nums = re.findall(r"(\d+)", lines[i])
                        for n in nums:
                            val = float(n)
                            if val < 50 and transit is None:
                                transit = val
                            elif val >= 10000 and price is None:
                                price = val
                        if transit is not None and price is not None:
                            break
                
                if transit is not None and price is not None:
                    right_records.append({
                        'Season': season,
                        'Carrier': carrier,
                        'Transit_Days': transit,
                        'Actual_Freight_Price_INR': price
                    })
            i += 1

    print(f"Extracted: {len(left_records)} Left Records, {len(right_records)} Right Records")
    
    # Merge datasets
    total_n = min(len(left_records), len(right_records))
    merged = []
    for k in range(total_n):
        row = {**left_records[k], **right_records[k]}
        merged.append(row)
        
    df = pd.DataFrame(merged)
    print(f"\nFinal Merged DataFrame: {df.shape[0]} rows × {df.shape[1]} columns")
    print(df.head(3))

    # Save to CSV
    os.makedirs(r"backend\ml\data", exist_ok=True)
    os.makedirs(r"backend\ml\models", exist_ok=True)
    csv_path = r"backend\ml\data\shipments_5000.csv"
    df.to_csv(csv_path, index=False)
    print(f"Saved dataset to {csv_path}")

    # Train Regression Models
    categorical_features = ['Origin', 'Destination', 'Transport_Mode', 'Cargo_Type', 'Container_Type', 'Season', 'Carrier']
    numerical_features = ['Weight_KG', 'Volume_CBM', 'Distance_KM', 'Fuel_Price', 'Transit_Days']
    
    X = df[categorical_features + numerical_features]
    y = df['Actual_Freight_Price_INR']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', 'passthrough', numerical_features)
        ]
    )

    models = {
        'Linear Regression (Baseline)': LinearRegression(),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, max_depth=6, random_state=42)
    }

    best_pipeline = None
    best_r2 = -1.0

    print("\n=======================================================")
    print("           REGRESSION MODEL EVALUATION (M3)            ")
    print("=======================================================")
    for name, model in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)

        print(f"[{name}]")
        print(f"   MAE:  INR {mae:,.2f}")
        print(f"   RMSE: INR {rmse:,.2f}")
        print(f"   R2:   {r2:.4f}\n")

        if r2 > best_r2:
            best_r2 = r2
            best_pipeline = pipeline

    # Save best pipeline
    model_path = r"backend\ml\models\freight_pricing_pipeline.joblib"
    joblib.dump(best_pipeline, model_path)
    print(f"Best Regression Pipeline (R2 = {best_r2:.4f}) saved to: {model_path}")

if __name__ == '__main__':
    parse_full_pdf()
