# Customs Agent & RAG Compliance — Design Specification

## 1. Objective
The **Customs Agent** eliminates regulatory friction and border delays by autonomously classifying commodity HS codes, retrieving applicable trade regulations and statutory citations, generating mandatory document checklists, and gating quote issuance behind officer authorization.

---

## 2. Hybrid RAG Pipeline (Section 9 Spec)

```
 Shipment (Origin, Dest, HS Code, Incoterm, Commodity)
                       │
                       ▼
            HS Code Verification & Prohibitions
                       │
                       ▼
          Hybrid Retrieval (Keyword + Vector)
                       │
                       ▼
       Regulation Re-ranking & Evidence Extraction
                       │
                       ▼
     Mandatory Document Checklist & Readiness Score
                       │
                       ▼
     Customs Officer Sign-Off (Approve / Hold / Block)
```

---

## 3. Statutory Regulatory Corpus Seed Data

| Country Corridor | Authority | Regulation Title | Legal Citation |
| :--- | :--- | :--- | :--- |
| **India $\to$ Global** | DGFT / CBIC | Customs Tariff Act 1975, Section 46 | *ICEGATE EDI Shipping Bill & Valuation Rules* |
| **India $\to$ Singapore** | Singapore Customs | Strategic Goods (Control) Act & AIFTA | *Regulation 24(1) - Form AIFTA Rules of Origin* |
| **India $\to$ EU (Rotterdam/Hamburg)** | European Commission | EU Customs Code & REACH Regulation (EC) 1907/2006 | *Article 127 UCC - Entry Summary Declaration (ENS)* |
| **India $\to$ UAE (Dubai)** | UAE Federal Customs | TDRA Equipment Type Approval Regulations | *Cabinet Resolution No. 57/2020 on Customs Tariffs* |
| **Global Hazardous** | IMO | IMDG Code Class 3 / 8 / 9 | *SOLAS Chapter VII - Dangerous Goods Declaration (DGD)* |

---

## 4. Readiness Score Calculation
The Customs Readiness Score ($R_c$) is computed dynamically based on the verification status of all required documents:

$$R_c = \frac{\sum_{i=1}^{N} w_i \times V_i}{\sum_{i=1}^{N} w_i} \times 100\%$$

Where:
- $V_i = 1.0$ if document is `VERIFIED`, $0.5$ if `PENDING_UPLOAD`, and $0.0$ if `MISSING`.
- $w_i = 3.0$ for mandatory statutory documents (Commercial Invoice, Packing List, Form COO, SDS) and $1.0$ for optional documents.
- If any mandatory document is `MISSING`, the compliance status is set to `NEEDS_DOCUMENTS` and the quote is locked on **`HOLD`**.
