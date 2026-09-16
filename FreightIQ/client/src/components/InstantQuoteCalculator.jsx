import { useState } from 'react'
import { 
  Calculator, 
  MapPin, 
  Package, 
  CheckCircle2, 
  Download, 
  TrendingUp, 
  RotateCcw
} from 'lucide-react'
import { downloadQuotePDF } from '../utils/exportUtils'

export const ORIGIN_PORTS = [
  { value: 'Chennai', label: 'Chennai (Chennai Port INMAA)' },
  { value: 'Mumbai', label: 'Mumbai (Nhava Sheva INNSA)' },
  { value: 'Mundra', label: 'Gujarat (Mundra Port INMUN)' },
  { value: 'Kolkata', label: 'Kolkata (Kolkata Port INCCU)' },
  { value: 'Cochin', label: 'Kerala (Cochin Port INCOK)' },
  { value: 'Delhi', label: 'Delhi (Delhi IGI Cargo INDEL)' },
  { value: 'Bengaluru', label: 'Bengaluru (Bengaluru Airport INBLR)' },
  { value: 'Hyderabad', label: 'Hyderabad (RGIA Airport INHYD)' },
  { value: 'Visakhapatnam', label: 'Visakhapatnam (Vizag Port INVTZ)' },
  { value: 'Goa', label: 'Goa (Mormugao Port INMRM)' }
]

export const DESTINATION_PORTS = [
  { value: 'Singapore', label: 'Singapore (Port of Singapore SGSIN)' },
  { value: 'Dubai', label: 'Dubai (Jebel Ali Port AEJEA)' },
  { value: 'Rotterdam', label: 'Rotterdam (Port of Rotterdam NLRTM)' },
  { value: 'Shanghai', label: 'Shanghai (Port of Shanghai CNSHA)' },
  { value: 'Hamburg', label: 'Hamburg (Port of Hamburg DEHAM)' },
  { value: 'Los Angeles', label: 'Los Angeles (Port of Los Angeles USLAX)' },
  { value: 'Frankfurt', label: 'Frankfurt (Frankfurt Cargo DEFRA)' },
  { value: 'Antwerp', label: 'Antwerp (Port of Antwerp BEANR)' },
  { value: 'Colombo', label: 'Colombo (Port of Colombo LKCMB)' },
  { value: 'Hong Kong', label: 'Hong Kong (Hong Kong Port HKHKG)' },
  { value: 'New York', label: 'New York (Port of New York USNYC)' }
]

export const CONTAINER_TYPES = [
  { value: '40HC', label: "40' High Cube (40HC)" },
  { value: '20GP', label: "20' General Purpose (20GP)" },
  { value: '40GP', label: "40' General Purpose (40GP)" },
  { value: '20RF', label: "20' Reefer (20RF)" },
  { value: '40RF', label: "40' Reefer (40RF)" }
]

export default function InstantQuoteCalculator({ onSaveToDashboard }) {
  // 1. Input Form State - initially empty parameters
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [containerType, setContainerType] = useState('40HC')
  const [containerCount, setContainerCount] = useState('')
  const [baseFreightPerContainer, setBaseFreightPerContainer] = useState('')
  const [bafPct, setBafPct] = useState(10)
  const [originThcPerContainer, setOriginThcPerContainer] = useState('')
  const [docFee, setDocFee] = useState('')
  const [marginPct, setMarginPct] = useState(15)

  // Result state
  const [calculationResult, setCalculationResult] = useState(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleCalculate = (e) => {
    if (e) e.preventDefault()
    if (!fromLocation || !toLocation) {
      alert('Please select both Origin and Destination ports.')
      return
    }

    const count = parseInt(containerCount) || 1
    const basePerUnit = parseFloat(baseFreightPerContainer) || 0
    const bafPercentage = parseFloat(bafPct) || 0
    const thcPerUnit = parseFloat(originThcPerContainer) || 0
    const doc = parseFloat(docFee) || 0
    const margin = parseFloat(marginPct) || 0

    // Step 1 — Base Freight
    const step1BaseFreight = basePerUnit * count

    // Step 2 — BAF (Fuel Surcharge % of Base Freight)
    const step2BAF = Math.round(step1BaseFreight * (bafPercentage / 100))

    // Step 3 — Origin THC
    const step3OriginTHC = thcPerUnit * count

    // Step 4 — Documentation Fee
    const step4Documentation = doc

    // 3. Total Cost
    const totalCost = step1BaseFreight + step2BAF + step3OriginTHC + step4Documentation

    // 4. Margin Calculation
    const marginAmount = Math.round(totalCost * (margin / 100))

    // 5. Final Sell Price
    const sellPrice = totalCost + marginAmount

    const result = {
      from: fromLocation,
      to: toLocation,
      containerType,
      containerCount: count,
      baseFreightPerUnit: basePerUnit,
      step1BaseFreight,
      bafPct: bafPercentage,
      step2BAF,
      thcPerUnit,
      step3OriginTHC,
      docFee: step4Documentation,
      totalCost,
      marginPct: margin,
      marginAmount,
      sellPrice,
      quoteId: `QT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }

    setCalculationResult(result)
    setSavedSuccess(false)
  }

  const handleReset = () => {
    setFromLocation('')
    setToLocation('')
    setContainerType('40HC')
    setContainerCount('')
    setBaseFreightPerContainer('')
    setBafPct(10)
    setOriginThcPerContainer('')
    setDocFee('')
    setMarginPct(15)
    setCalculationResult(null)
    setSavedSuccess(false)
  }

  const handleSaveQuote = () => {
    if (!calculationResult) return

    const shipmentId = `SH-${Math.floor(4000 + Math.random() * 9000)}`
    const loggedUserEmail = localStorage.getItem('userEmail') || 'customer@apexgl.com'
    const loggedUserName = localStorage.getItem('userName') || 'Alex Shipper'
    const loggedCompany = localStorage.getItem('userCompany') || 'ABC Electronics Pvt Ltd'

    const newQuote = {
      id: calculationResult.quoteId,
      shipmentId: shipmentId,
      customer: loggedCompany || loggedUserName,
      customerEmail: loggedUserEmail,
      ownerEmail: loggedUserEmail,
      origin: `${calculationResult.from} Port`,
      destination: `${calculationResult.to} Port`,
      mode: 'Ocean',
      service: 'Maersk Line Direct Service',
      sellPrice: `₹${calculationResult.sellPrice.toLocaleString('en-IN')}`,
      status: 'PENDING_REVIEW',
      agentApproved: false,
      customsApproved: false,
      validUntil: 'Aug 28, 2026',
      transitDays: '5 - 6 Days',
      cargo: `${calculationResult.containerCount} x ${calculationResult.containerType} Containers`,
      trackingStep: 1,
      totalCost: `₹${calculationResult.totalCost.toLocaleString('en-IN')}`,
      margin: `${calculationResult.marginPct}% (₹${calculationResult.marginAmount.toLocaleString('en-IN')})`
    }

    const newShipment = {
      id: shipmentId,
      quoteId: calculationResult.quoteId,
      customer: loggedCompany || loggedUserName,
      customerEmail: loggedUserEmail,
      ownerEmail: loggedUserEmail,
      origin: calculationResult.from,
      destination: calculationResult.to,
      mode: 'Ocean',
      status: 'Booked',
      date: calculationResult.date,
      shippingMethod: 'FCL',
      items: [
        {
          id: 1,
          packageType: 'container',
          containerType: calculationResult.containerType.toLowerCase(),
          unitCount: String(calculationResult.containerCount),
          weight: String(calculationResult.containerCount * 18400),
          commodity: 'Export Merchandise',
          hsCode: '8504.40.90'
        }
      ],
      declaredValue: String(calculationResult.sellPrice * 2),
      currency: 'INR',
      specialInstructions: 'Direct FCL sea freight container shipment.'
    }

    try {
      const storedCust = localStorage.getItem('customerQuotes')
      let list = storedCust ? JSON.parse(storedCust) : []
      list.unshift(newQuote)
      localStorage.setItem('customerQuotes', JSON.stringify(list))

      const storedShips = localStorage.getItem('allShipments')
      let shipList = storedShips ? JSON.parse(storedShips) : []
      shipList.unshift(newShipment)
      localStorage.setItem('allShipments', JSON.stringify(shipList))

      const storedAgent = localStorage.getItem('agentQuotesQueue')
      let agentList = storedAgent ? JSON.parse(storedAgent) : []
      agentList.unshift({
        ...newQuote,
        customer: 'ABC Electronics Pvt Ltd',
        customerEmail: 'customer@apexgl.com',
        finalPrice: calculationResult.sellPrice,
        recommendedPrice: calculationResult.sellPrice,
        rulePrice: calculationResult.totalCost,
        aiPrice: calculationResult.sellPrice,
        overallRisk: 'LOW',
        status: 'PENDING_REVIEW',
        auditHistory: [
          { action: 'Instant Calculation Saved', time: 'Just now', user: 'Customer', note: 'Quote computed via Deterministic Tariff Calculator' }
        ]
      })
      localStorage.setItem('agentQuotesQueue', JSON.stringify(agentList))

      const storedAdmin = localStorage.getItem('adminAllQuotes')
      let adminList = storedAdmin ? JSON.parse(storedAdmin) : []
      adminList.unshift(newQuote)
      localStorage.setItem('adminAllQuotes', JSON.stringify(adminList))

      if (onSaveToDashboard) {
        onSaveToDashboard(newQuote)
      }
      setSavedSuccess(true)
      alert(`Quotation ${newQuote.id} & Shipment ${shipmentId} saved to your dashboard!`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownloadPDF = () => {
    if (!calculationResult) return
    downloadQuotePDF({
      id: calculationResult.quoteId,
      customer: 'Sharma Textiles / Apex Logistics',
      originName: calculationResult.from,
      destName: calculationResult.to,
      lane: `${calculationResult.from} → ${calculationResult.to}`,
      mode: 'Ocean FCL',
      basis: `${calculationResult.containerCount} × ${calculationResult.containerType}`,
      transit: '5–6 d',
      cost: `₹ ${calculationResult.sellPrice.toLocaleString('en-IN')}`,
      baseCost: calculationResult.totalCost,
      brokerMargin: calculationResult.marginAmount,
      marginPct: calculationResult.marginPct,
      weight: `${calculationResult.containerCount * 18400} kg`
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Deterministic 5-Step Pricing Formula</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Freight Quote Calculation Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Input container count, base rate, surcharges, and margin to compute total buy cost and client sell price.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start md:self-auto border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* SECTION 1: INPUT FORM (7 SPAN) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
              <span>Input Parameters</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exact User Test Spec</span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            
            {/* From & To (Origin & Destination) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>From (Origin)</span>
                </label>
                <select
                  value={fromLocation}
                  onChange={e => setFromLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="">-- Select Origin Port --</option>
                  {ORIGIN_PORTS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>To (Destination)</span>
                </label>
                <select
                  value={toLocation}
                  onChange={e => setToLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="">-- Select Destination Port --</option>
                  {DESTINATION_PORTS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Container Type & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Container Type</span>
                </label>
                <select
                  value={containerType}
                  onChange={e => setContainerType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {CONTAINER_TYPES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Container Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="e.g. 2"
                  value={containerCount}
                  onChange={e => setContainerCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Base Freight / Container & BAF % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Base Freight / Container (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 50000"
                    value={baseFreightPerContainer}
                    onChange={e => setBaseFreightPerContainer(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  BAF Fuel Surcharge (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={bafPct}
                    onChange={e => setBafPct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Origin THC / Container & Documentation Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Origin THC / Container (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 8000"
                    value={originThcPerContainer}
                    onChange={e => setOriginThcPerContainer(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Documentation Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 3000"
                    value={docFee}
                    onChange={e => setDocFee(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Commercial Margin % */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Commercial Profit Margin Markup</span>
                </label>
                <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  {marginPct}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="0.5"
                value={marginPct}
                onChange={e => setMarginPct(parseFloat(e.target.value) || 0)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>Min: 5%</span>
                <span className="text-slate-600 font-semibold">Test: 15%</span>
                <span>Max: 35%</span>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!fromLocation || !toLocation || !baseFreightPerContainer}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate Quote</span>
              </button>
            </div>

          </form>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: OUTPUT RESULT CARD (5 SPAN) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {calculationResult ? (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Card Header matching exact spec */}
              <div className="border-b border-slate-800 pb-3.5 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QUOTE CALCULATION</span>
                </div>
                <h4 className="text-base font-black text-white">
                  {calculationResult.from} → {calculationResult.to}
                </h4>
                <p className="text-xs font-mono text-indigo-300 mt-0.5 font-bold">
                  {calculationResult.containerType} × {calculationResult.containerCount} Containers
                </p>
              </div>

              {/* Itemized Breakdown */}
              <div className="space-y-2.5 text-xs font-mono">
                
                <div className="flex justify-between items-center text-slate-300">
                  <span>Base Freight ({calculationResult.containerCount} × ₹{calculationResult.baseFreightPerUnit.toLocaleString('en-IN')}):</span>
                  <span className="font-bold text-white text-sm">₹{calculationResult.step1BaseFreight.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>BAF ({calculationResult.bafPct}% of Base):</span>
                  <span className="font-bold text-white text-sm">₹{calculationResult.step2BAF.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Origin THC ({calculationResult.containerCount} × ₹{calculationResult.thcPerUnit.toLocaleString('en-IN')}):</span>
                  <span className="font-bold text-white text-sm">₹{calculationResult.step3OriginTHC.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Documentation:</span>
                  <span className="font-bold text-white text-sm">₹{calculationResult.docFee.toLocaleString('en-IN')}</span>
                </div>

                {/* Subtotal Total Cost */}
                <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-slate-200 font-bold">
                  <span className="uppercase text-[11px] tracking-wider text-slate-400">Total Buy Cost:</span>
                  <span className="text-base font-black text-white">₹{calculationResult.totalCost.toLocaleString('en-IN')}</span>
                </div>

                {/* Margin */}
                <div className="flex justify-between items-center text-emerald-400 pt-1">
                  <span>Margin ({calculationResult.marginPct}%):</span>
                  <span className="font-bold text-sm">+ ₹{calculationResult.marginAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* Final Sell Price */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-blue-950/80 border-2 border-indigo-500/50 flex justify-between items-center mt-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 block">
                      FINAL SELL PRICE
                    </span>
                    <span className="text-xs text-slate-300 font-sans">Client Invoiced Total</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                    ₹{calculationResult.sellPrice.toLocaleString('en-IN')}
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveQuote}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{savedSuccess ? 'Saved to Portal' : 'Save as Quote'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Awaiting Quotation Parameters</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Select origin, destination and input freight parameters on the left to compute total buy cost and client sell price.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1 text-slate-600">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Calculation Flow:</div>
                <div className="text-[11px]">• Step 1: Base Freight (Rate × Count)</div>
                <div className="text-[11px]">• Step 2: BAF Fuel Surcharge Markup</div>
                <div className="text-[11px]">• Step 3: Origin Terminal Handling (THC)</div>
                <div className="text-[11px]">• Step 4: Documentation & Port EDI Fee</div>
                <div className="text-[11px]">• Step 5: Commercial Margin Markup</div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
