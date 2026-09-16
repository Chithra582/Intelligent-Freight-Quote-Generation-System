import fitz # PyMuPDF
import pandas as pd
import numpy as np
import os
import re
import joblib

pdf_path = r"C:\Users\Admin\.gemini\antigravity\brain\03754fc9-4e14-4052-8b78-e994f4637a55\.user_uploaded\media_1787844160787.pdf"
doc = fitz.open(pdf_path)
print(f"Total Pages in PDF: {len(doc)}")

# The PDF contains odd pages with left table columns (Shipment_ID, Origin, Destination, Transport_Mode, Cargo_Type, Weight_KG, Volume_CBM, Distance_KM, Container_Type, Fuel_Price)
# and even pages with right table columns (Season, Carrier, Transit_Days, Actual_Freight_Price_INR).

left_rows = []
right_rows = []

for page_idx in range(len(doc)):
    page_num = page_idx + 1
    if page_num > 218: # pages 219 and 220 are column definitions and steps
        break
    
    text = doc[page_idx].get_text("text")
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    
    if page_num % 2 == 1: # Odd page: Left table
        # Extract rows starting with SHP
        for l in lines:
            if l.startswith("SHP"):
                parts = l.split()
                # Parse shipment row
                left_rows.append(parts)
    else: # Even page: Right table
        for l in lines:
            parts = l.split()
            # Must be a data line like: Normal Carrier_B 12 146740 or Off_Peak Carrier_A 14 71088
            if parts and (parts[0] in ['Normal', 'Peak', 'Off_Peak'] or parts[0].startswith('Carrier')):
                right_rows.append(parts)

print(f"Extracted {len(left_rows)} left rows and {len(right_rows)} right rows.")
