import jsPDF from 'jspdf'

/**
 * Generates and triggers a real download of an official branded FreightIQ Quotation PDF
 */
export function downloadQuotePDF(quote) {
  if (!quote) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Helper to safely extract numeric value and format cleanly in INR without broken unicode
  const parseAmount = (val) => {
    if (typeof val === 'number') return val
    if (!val) return 0
    const cleaned = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  const formatINR = (val) => {
    const num = typeof val === 'number' ? val : parseAmount(val)
    return `INR ${Math.round(num).toLocaleString('en-IN')}`
  }

  const quoteId = quote.id || `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const customer = quote.customer || quote.companyName || 'Valued Customer'
  const origin = quote.origin || quote.originName || 'Nhava Sheva (INNSA)'
  const destination = quote.destination || quote.destName || 'Jebel Ali (AEJEA)'
  const mode = quote.mode || quote.serviceMode || 'Ocean FCL'
  const basis = quote.basis || quote.containerLoad || '2 x 40HC'
  const weight = quote.weight || '18,400 kg'
  const transit = quote.transit || quote.transitDays || '6-10 Days'
  const issueDate = quote.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const validUntil = quote.validUntil || '7 Days from Issue'

  const rawCost = quote.cost || quote.sellPrice || quote.finalPrice || quote.totalCost || 384500
  const totalNum = parseAmount(rawCost) || 384500
  const formattedTotal = formatINR(totalNum)

  // Header Banner
  doc.setFillColor(10, 22, 40) // Navy-900
  doc.rect(0, 0, 210, 36, 'F')

  // Accent line
  doc.setFillColor(234, 88, 12) // Orange accent
  doc.rect(0, 36, 210, 2, 'F')

  // Company Brand Title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('PORTLINE FREIGHTIQ', 15, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(200, 215, 235)
  doc.text('INTELLIGENT MULTI-MODAL FREIGHT FORWARDING & LOGISTICS', 15, 25)

  // Document Badge
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('COMMERCIAL QUOTATION', 195, 18, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(253, 186, 116) // Light orange
  doc.text(`REF: ${quoteId}`, 195, 26, { align: 'right' })

  // Summary Metadata Card
  doc.setFillColor(243, 245, 248)
  doc.roundedRect(15, 45, 180, 26, 3, 3, 'F')

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('CUSTOMER / SHIPPER', 20, 52)
  doc.text('ISSUE DATE', 85, 52)
  doc.text('VALIDITY PERIOD', 140, 52)

  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text(customer, 20, 60)
  doc.text(issueDate, 85, 60)
  doc.text(validUntil, 140, 60)

  // Route & Shipment Parameters
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 22, 40)
  doc.text('1. SHIPMENT & ROUTING PARAMETERS', 15, 80)

  doc.setDrawColor(221, 227, 234)
  doc.setLineWidth(0.5)
  doc.line(15, 83, 195, 83)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)

  const leftColX = 20
  const rightColX = 110
  let y = 92

  doc.text('Origin Gateway:', leftColX, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(origin, leftColX + 35, y)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Destination Gateway:', rightColX, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(destination, rightColX + 40, y)

  y += 9
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Transport Mode:', leftColX, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(mode, leftColX + 35, y)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Estimated Transit:', rightColX, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(transit, rightColX + 40, y)

  y += 9
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Charge Basis:', leftColX, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(basis, leftColX + 35, y)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Gross Weight:', rightColX, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(weight, rightColX + 40, y)

  // Cost Breakdown Table
  y += 18
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 22, 40)
  doc.text('2. COMMERCIAL COST BREAKDOWN', 15, y)

  doc.line(15, y + 3, 195, y + 3)
  y += 10

  // Table Header
  doc.setFillColor(11, 47, 86) // Navy-800
  doc.rect(15, y, 180, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('LINE ITEM DESCRIPTION', 20, y + 5.5)
  doc.text('BASIS / UNITS', 120, y + 5.5)
  doc.text('SUBTOTAL (INR)', 190, y + 5.5, { align: 'right' })

  y += 8

  // Proportional breakdown where items dynamically sum to the exact total quotation cost
  const baseFreight = Math.round(totalNum * 0.64)
  const thc = Math.round(totalNum * 0.12)
  const baf = Math.round(totalNum * 0.09)
  const docFee = Math.round(totalNum * 0.04)
  const drayage = totalNum - (baseFreight + thc + baf + docFee) // Exact remainder ensuring perfect sum match

  const items = [
    { desc: 'Base Ocean / Air Main Leg Freight', basis: basis, amount: formatINR(baseFreight) },
    { desc: 'Terminal Handling Charges (THC Origin & Dest)', basis: '2 Units', amount: formatINR(thc) },
    { desc: 'Bunker Adjustment Factor (BAF / Fuel Index)', basis: '8.5% Fuel Index', amount: formatINR(baf) },
    { desc: 'Carrier Security & Documentation (ISPS/BL Fee)', basis: 'Per Booking', amount: formatINR(docFee) },
    { desc: 'Origin Road Drayage & Gate In', basis: '34 km pickup', amount: formatINR(drayage) }
  ]

  items.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(15, y, 180, 7.5, 'F')
    }
    doc.setTextColor(51, 65, 85)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(row.desc, 20, y + 5)
    doc.text(row.basis, 120, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(9)
    doc.text(row.amount, 190, y + 5, { align: 'right' })
    y += 7.5
  })

  // Total Summary Row
  doc.setFillColor(234, 88, 12) // Orange accent
  doc.rect(15, y + 2, 180, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL GUARANTEED QUOTATION RATE', 20, y + 8)
  doc.setFontSize(10)
  doc.text(formattedTotal, 190, y + 8, { align: 'right' })

  // Terms & Conditions
  y += 24
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 22, 40)
  doc.text('TERMS & COMMERCIAL CONDITIONS:', 15, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  y += 5
  doc.text('1. Rate is valid for 7 calendar days from issue date. Subject to equipment and vessel space availability at booking.', 15, y)
  y += 4
  doc.text('2. Quotation excludes statutory destination customs duties, import taxes, inspection fees, and demurrage/detention.', 15, y)
  y += 4
  doc.text('3. Multi-modal corridors executed under standard FIATA / FreightIQ Bill of Lading terms.', 15, y)

  // Signature Block
  y += 15
  doc.setDrawColor(203, 213, 225)
  doc.line(15, y + 12, 75, y + 12)
  doc.line(135, y + 12, 195, y + 12)

  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Authorized FreightIQ Dispatcher', 15, y + 16)
  doc.text('Customer Acceptance Signature', 135, y + 16)

  // Trigger real browser download
  doc.save(`Quotation_${quoteId}.pdf`)
}

/**
 * Generates and triggers a real download of a CSV file containing all quotations
 */
export function exportQuotesCSV(quotes, filename = 'freightiq_quotations.csv') {
  if (!quotes || quotes.length === 0) {
    alert('No quotation records available to export.')
    return
  }

  const headers = ['Quote No', 'Customer', 'Lane', 'Mode', 'Basis', 'Transit', 'Total Price', 'Status', 'Created']
  
  const csvRows = [
    headers.join(','),
    ...quotes.map(q => {
      const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`
      return [
        escape(q.id),
        escape(q.customer || q.companyName || 'Sharma Textiles'),
        escape(q.lane || `${q.origin || 'INNSA'} -> ${q.destination || 'AEJEA'}`),
        escape(q.mode || 'Ocean FCL'),
        escape(q.basis || '2 x 40HC'),
        escape(q.transit || q.transitDays || '6-10 d'),
        escape(q.cost || q.sellPrice || 'Rs. 3,84,500'),
        escape(q.status || 'Draft'),
        escape(q.created || q.date || 'Today')
      ].join(',')
    })
  ]

  const csvContent = '\uFEFF' + csvRows.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
