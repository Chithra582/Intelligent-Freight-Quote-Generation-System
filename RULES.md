# Intelligent Freight Quote Generation System Operational Rules

1. **Dimensional Invariants**: Reject any shipment request where weight $\le 0$ or any dimension $(L, W, H) \le 0$.
2. **Quote Accuracy Threshold**: Require quote validation confidence score $S_{\text{quote}} \ge 0.70$ before finalizing customer-facing quotations.
3. **Deterministic Refusals**: Immediately halt processing and return standardized error codes (`ERR_INVALID_CARGO_DIMENSIONS`, `ERR_UNSUPPORTED_HAZMAT_CLASS`, `ERR_ORIGIN_DESTINATION_IDENTICAL`) upon rule failure.
4. **Fuel Surcharge Indexing**: Synchronize fuel surcharges with current weekly diesel fuel indexes (EIA/DOE index).
5. **Multi-Tier Fallbacks**: Implement a 3-tier fallback architecture (Tier 1 static zip-to-zip rate lookup, Tier 2 historical lane average baseline, Tier 3 human broker manual quote review).
6. **Commercial Privacy**: Keep client freight contracts, negotiated carrier margins, and volume discount tiers confidential and isolated.
