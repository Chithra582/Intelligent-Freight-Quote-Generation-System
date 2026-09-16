import os
from pathlib import Path
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable


def generate_quote_pdf(quote_version) -> str:
    """
    Generates a professional branded PDF quotation document for the customer using ReportLab.
    Returns the generated PDF file path.
    """
    media_dir = Path(settings.MEDIA_ROOT) / 'quotes'
    media_dir.mkdir(parents=True, exist_ok=True)

    file_name = f"{quote_version.quote.quote_number}_v{quote_version.version}.pdf"
    file_path = media_dir / file_name

    doc = SimpleDocTemplate(
        str(file_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_title_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold'
    )
    quote_ref_style = ParagraphStyle(
        'QuoteRef',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2563EB'),
        fontName='Helvetica-Bold'
    )
    section_head_style = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica-Bold'
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    body_bold_style = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold'
    )
    legal_style = ParagraphStyle(
        'LegalText',
        parent=styles['Normal'],
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748B')
    )

    elements = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>FREIGHTIQ LOGISTICS</b><br/><font size=8 color='#64748B'>Autonomous Freight Brokerage & Route Intelligence</font>", brand_title_style),
            Paragraph(f"<b>COMMERCIAL QUOTATION</b><br/>Quote No: <b>{quote_version.quote.quote_number}</b> (v{quote_version.version})<br/>Date: {quote_version.created_at.strftime('%d %b %Y')}<br/>Valid Until: <b>{quote_version.valid_until.strftime('%d %b %Y %H:%M UTC')}</b>", quote_ref_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[280, 260])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 14))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceBefore=0, spaceAfter=14))

    # 2. Shipper & Shipment Key Facts
    shipment = quote_version.quote.shipment
    cust_name = quote_version.quote.customer.company_name if quote_version.quote.customer else shipment.contact_company_name or 'Commercial Shipper'

    info_data = [
        [
            Paragraph("<b>Customer / Shipper:</b>", body_bold_style),
            Paragraph(f"{cust_name}<br/>{shipment.contact_full_name} ({shipment.contact_email})", body_style),
            Paragraph("<b>Origin Gateway:</b>", body_bold_style),
            Paragraph(f"{shipment.origin_name} ({shipment.origin_code})", body_style)
        ],
        [
            Paragraph("<b>Transport Mode:</b>", body_bold_style),
            Paragraph(f"{shipment.mode} ({shipment.load_type})", body_style),
            Paragraph("<b>Destination Gateway:</b>", body_bold_style),
            Paragraph(f"{shipment.destination_name} ({shipment.destination_code})", body_style)
        ],
        [
            Paragraph("<b>Incoterm:</b>", body_bold_style),
            Paragraph(f"<b>{shipment.incoterm}</b>", body_bold_style),
            Paragraph("<b>Cargo Specification:</b>", body_bold_style),
            Paragraph(f"{shipment.container_count} × {shipment.container_type} | {shipment.gross_weight_kg:,.1f} kg", body_style)
        ],
        [
            Paragraph("<b>Estimated Transit:</b>", body_bold_style),
            Paragraph(f"<b>{quote_version.transit_days} Days</b> (Door-to-Gateway)", body_style),
            Paragraph("<b>Carrier Corridor:</b>", body_bold_style),
            Paragraph(f"{quote_version.carrier.name if quote_version.carrier else 'Premier Alliance'}", body_style)
        ]
    ]

    info_table = Table(info_data, colWidths=[110, 160, 110, 160])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 14))

    # 3. Financial Summary / Price Table
    elements.append(Paragraph("<b>Price Build-Up & Rate Inclusions</b>", section_head_style))
    elements.append(Spacer(1, 6))

    line_items = quote_version.line_items.filter(is_included_in_sell_rate=True)
    table_rows = [
        [
            Paragraph("<b>Description</b>", body_bold_style),
            Paragraph("<b>Cost Head</b>", body_bold_style),
            Paragraph("<b>Currency</b>", body_bold_style),
            Paragraph("<b>Amount</b>", body_bold_style)
        ]
    ]

    if line_items.exists():
        for li in line_items:
            table_rows.append([
                Paragraph(li.description, body_style),
                Paragraph(li.component_code, body_style),
                Paragraph(li.currency, body_style),
                Paragraph(f"{li.amount:,.2f}", body_style)
            ])
    else:
        table_rows.append([
            Paragraph(f"All-In Freight & Port Terminal Handling ({shipment.incoterm})", body_style),
            Paragraph("ALL_IN_FREIGHT", body_style),
            Paragraph(quote_version.currency, body_style),
            Paragraph(f"{quote_version.final_quote:,.2f}", body_style)
        ])

    # Total row
    table_rows.append([
        Paragraph("<b>TOTAL COMMERCIAL SELL PRICE</b>", body_bold_style),
        Paragraph("-", body_style),
        Paragraph(f"<b>{quote_version.currency}</b>", body_bold_style),
        Paragraph(f"<b>${quote_version.final_quote:,.2f}</b>", ParagraphStyle('TotalText', parent=body_bold_style, textColor=colors.HexColor('#2563EB'), fontSize=11))
    ])

    price_table = Table(table_rows, colWidths=[240, 110, 70, 120])
    price_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#EFF6FF')),
    ]))
    elements.append(price_table)
    elements.append(Spacer(1, 14))

    # 4. Legal Assumptions & Disclaimers
    elements.append(Paragraph("<b>Contractual Assumptions & Operational Disclaimers</b>", section_head_style))
    elements.append(Spacer(1, 4))
    disclaimer_text = (
        "1. <b>Validity:</b> Rates are valid until the stated expiration timestamp and subject to equipment and vessel space availability at booking time.<br/>"
        "2. <b>Surcharges:</b> Subject to bunker price fluctuations, war risk, security, and statutory governmental levies in force at shipment departure.<br/>"
        "3. <b>Customs & Clearance:</b> Customs duties, inspections, and regulatory compliance fees are billed as per actual receipts unless specified under Incoterm DDP.<br/>"
        "4. <b>Demurrage & Detention:</b> Standard container free time: 7 calendar days at origin and destination terminal."
    )
    elements.append(Paragraph(disclaimer_text, legal_style))
    elements.append(Spacer(1, 14))

    # Build document
    doc.build(elements)

    return str(file_path)
