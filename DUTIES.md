# Intelligent Freight Quote Generation System Duties and Responsibilities

- **Shipment Ingestion**: Capture origin, destination, cargo classification, packaging type, and declared weight and dimensions.
- **Distance Calculation**: Query geospatial routing APIs to compute accurate driving distance, toll milestones, and transit time.
- **Volumetric Weighting**: Compute dimensional weight using industry divisor constants (e.g., $139\,\text{in}^3/\text{lb}$ for domestic, $5000\,\text{cm}^3/\text{kg}$ for international).
- **Dynamic Pricing**: Synthesize carrier lane rates, equipment availability factors, and seasonal demand surcharges into final quotes.
- **Quote Dossier Issuance**: Format and store formal PDF/JSON freight quote summaries for broker approval and customer checkout.
