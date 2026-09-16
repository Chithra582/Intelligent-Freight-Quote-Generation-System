import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Ship, 
  Check, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Download, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  Box,
  LogOut,
  AlertCircle,
  FolderLock
} from 'lucide-react'
import { downloadQuotePDF } from '../utils/exportUtils'

export default function QuotationDetailsPage() {
  const { quoteId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNewlyGenerated = location.state?.isNewlyGenerated || false

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(isNewlyGenerated)
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [currency, setCurrency] = useState('INR')

  useEffect(() => {
    // 1. Fetch quote from customer quotes or agent quotes queue
    const targetId = quoteId || 'QT-2026-14157'
    let foundQuote = null

    try {
      const storedCustomer = localStorage.getItem('customerQuotes')
      if (storedCustomer) {
        const parsed = JSON.parse(storedCustomer)
        foundQuote = parsed.find(q => q.id === targetId || q.quoteId === targetId)
      }
      if (!foundQuote) {
        const storedAgent = localStorage.getItem('agentQuotesQueue')
        if (storedAgent) {
          const parsed = JSON.parse(storedAgent)
          foundQuote = parsed.find(q => q.id === targetId || q.quoteId === targetId)
        }
      }
    } catch (err) {
      console.error('Error fetching quote:', err)
    }

    // If not found in storage (direct URL entry), provide standard default quote matching user account
    if (!foundQuote) {
      const loggedName = localStorage.getItem('userName') || 'Chithu'
      const loggedEmail = localStorage.getItem('userEmail') || 'chithu67@gmail.com'
      const loggedCompany = localStorage.getItem('userCompany') || 'Apex Global Logistics'

      foundQuote = {
        id: targetId,
        shipmentId: 'SHP-1001',
        customer: loggedCompany || loggedName,
        customerEmail: loggedEmail,
        phone: '+91 98765 43210',
        origin: 'Chennai (INMAA)',
        originCode: 'INMAA',
        originName: 'Chennai',
        destination: 'Mundra (INMUN)',
        destinationCode: 'INMUN',
        destinationName: 'Mundra',
        mode: 'Ocean FCL',
        basis: '1 x 40HC',
        container: '40HC',
        commodity: 'General Merchandise',
        weight: '19,969 kg',
        declaredValue: '35,00,000',
        sellPrice: '₹ 60,893',
        priceNumeric: 60893,
        transitDays: '8-13 d',
        status: 'PENDING_REVIEW',
        agentApproved: false,
        customsApproved: false,
        validUntil: 'Sep 23, 2026',
        carrier: 'Maersk',
        service: 'MECL Service · weekly sailing'
      }
    }

    // Standardize base price (preserve initial anchor price if available)
    const storedBase = foundQuote.basePrice || (foundQuote.routes ? foundQuote.routes[0]?.price : null)
    const rawPrice = storedBase || (typeof foundQuote.sellPrice === 'number' ? foundQuote.sellPrice : parseInt(String(foundQuote.sellPrice || '60893').replace(/[^0-9]/g, '')) || 60893)

    // Build or ensure 3 carrier route options matching Image 5
    const basePrice = rawPrice
    const defaultRoutes = [
      {
        carrier: 'Maersk',
        service: 'MECL Service · weekly sailing',
        price: basePrice,
        transitDays: foundQuote.transitDays || '8-13 d',
        isRecommended: true,
        scores: {
          transit: 0.92,
          cost: 0.78,
          reliability: 0.94,
          congestion: 0.71
        }
      },
      {
        carrier: 'CMA CGM',
        service: 'via Salalah · biweekly',
        price: Math.round(basePrice * 0.88),
        transitDays: '14-18 d',
        isRecommended: false,
        scores: {
          transit: 0.64,
          cost: 0.95,
          reliability: 0.88,
          congestion: 0.66
        }
      },
      {
        carrier: 'Hapag-Lloyd',
        service: 'IMEX Service · fortnightly',
        price: Math.round(basePrice * 1.05),
        transitDays: '10-14 d',
        isRecommended: false,
        scores: {
          transit: 0.82,
          cost: 0.72,
          reliability: 0.91,
          congestion: 0.75
        }
      }
    ]

    const activeRoutes = foundQuote.routes && foundQuote.routes.length > 0 ? foundQuote.routes : defaultRoutes

    // Restore saved route index based on saved index or carrier name
    let activeIndex = 0
    if (foundQuote.selectedRouteIndex !== undefined && foundQuote.selectedRouteIndex >= 0 && foundQuote.selectedRouteIndex < activeRoutes.length) {
      activeIndex = foundQuote.selectedRouteIndex
    } else if (foundQuote.carrier) {
      const matchedIdx = activeRoutes.findIndex(r => 
        r.carrier?.toLowerCase().includes(foundQuote.carrier?.toLowerCase()) || 
        foundQuote.carrier?.toLowerCase().includes(r.carrier?.toLowerCase())
      )
      if (matchedIdx !== -1) {
        activeIndex = matchedIdx
      }
    }
    setSelectedRouteIndex(activeIndex)

    const chosenRouteOnLoad = activeRoutes[activeIndex] || activeRoutes[0]
    const currentPrice = chosenRouteOnLoad ? chosenRouteOnLoad.price : basePrice

    const fullQuoteData = {
      ...foundQuote,
      basePrice: basePrice,
      priceNumeric: currentPrice,
      routes: activeRoutes
    }

    setQuote(fullQuoteData)
    
    // Simulate initial loading transition as shown in screenshot 3
    const timer = setTimeout(() => {
      setLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [quoteId])

  // Handle route switching
  const handleSelectRoute = (idx) => {
    if (!quote) return
    setSelectedRouteIndex(idx)
    const chosenRoute = quote.routes[idx]
    const updatedPrice = chosenRoute.price
    const formattedPrice = `₹ ${updatedPrice.toLocaleString('en-IN')}`

    const updatedQuote = {
      ...quote,
      carrier: chosenRoute.carrier,
      service: chosenRoute.service,
      transitDays: chosenRoute.transitDays,
      sellPrice: formattedPrice,
      priceNumeric: updatedPrice,
      finalPrice: updatedPrice,
      selectedRouteIndex: idx,
      routes: quote.routes
    }

    setQuote(updatedQuote)

    // Synchronize to localStorage customerQuotes, agentQuotesQueue, and adminAllQuotes
    try {
      const storedCustomer = localStorage.getItem('customerQuotes')
      if (storedCustomer) {
        const parsed = JSON.parse(storedCustomer)
        const updatedList = parsed.map(q => q.id === quote.id ? { ...q, ...updatedQuote } : q)
        localStorage.setItem('customerQuotes', JSON.stringify(updatedList))
      }
      const storedAgent = localStorage.getItem('agentQuotesQueue')
      if (storedAgent) {
        const parsed = JSON.parse(storedAgent)
        const updatedList = parsed.map(q => q.id === quote.id ? { ...q, ...updatedQuote } : q)
        localStorage.setItem('agentQuotesQueue', JSON.stringify(updatedList))
      }
      const storedAdmin = localStorage.getItem('adminAllQuotes')
      if (storedAdmin) {
        const parsed = JSON.parse(storedAdmin)
        const updatedList = parsed.map(q => q.id === quote.id ? { ...q, ...updatedQuote } : q)
        localStorage.setItem('adminAllQuotes', JSON.stringify(updatedList))
      }
    } catch (err) {
      console.error('Error syncing selected route:', err)
    }
  }

  // Derive origin & destination display
  const getPortCode = (text, fallback) => {
    if (!text) return fallback
    const match = text.match(/\(([A-Z]{5})\)/)
    if (match) return match[1]
    if (text.toLowerCase().includes('chennai')) return 'INMAA'
    if (text.toLowerCase().includes('mundra')) return 'INMUN'
    if (text.toLowerCase().includes('nhava') || text.toLowerCase().includes('mumbai')) return 'INNSA'
    if (text.toLowerCase().includes('rotterdam')) return 'NLRTM'
    if (text.toLowerCase().includes('singapore')) return 'SGSIN'
    if (text.toLowerCase().includes('jebel')) return 'AEJEA'
    return fallback
  }

  const getCityName = (text, fallback) => {
    if (!text) return fallback
    return text.split('(')[0].replace('Port', '').trim() || fallback
  }

  const originCode = quote?.originCode || getPortCode(quote?.origin, 'INMAA')
  const destinationCode = quote?.destinationCode || getPortCode(quote?.destination, 'INMUN')
  const originName = quote?.originName || getCityName(quote?.origin, 'Chennai')
  const destinationName = quote?.destinationName || getCityName(quote?.destination, 'Mundra')

  // Itemized breakdown calculations
  const totalAmount = quote?.priceNumeric || 60893
  const baseFreight = Math.round(totalAmount * 0.626)
  const baf = Math.round(baseFreight * 0.10)
  const originThc = 8000
  const destThc = 7500
  const docFee = 2500
  const isps = totalAmount - (baseFreight + baf + originThc + destThc + docFee)

  const isAgentApproved = Boolean(quote?.agentApproved)
  const isCustomsApproved = Boolean(quote?.customsApproved)
  const isFullyApproved = (isAgentApproved && isCustomsApproved) || quote?.status === 'SENT' || quote?.status === 'ACCEPTED'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071322] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-300 font-medium text-sm tracking-wide">Loading quotation details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-slate-800 font-sans antialiased flex flex-col">

      {/* ========================================================================= */}
      {/* 2. TOAST NOTIFICATION (Screenshot 3) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#08182b] text-white border border-emerald-500/40 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold">Quotation {quote?.id} generated successfully!</span>
              <p className="text-[10.5px] text-slate-400">Review route options & commercial tariffs below.</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-2 text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Back Button & Actions Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <button
            onClick={() => navigate('/user/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Quotes Dashboard
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Quote Ref: <strong>{quote?.id}</strong>
            </span>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-black uppercase tracking-wider">
              {quote?.status?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Top Grid: Route Corridor Visual Arc (Left) & Quotation Details (Right) (Image 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Route Corridor Visual Graphic (span 7) */}
          <div className="lg:col-span-7 bg-[#0b1e36] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md relative overflow-hidden border border-slate-800">
            {/* Header with Ship icon, Ports & Transit */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    {originCode} ➔ {destinationCode}
                  </h2>
                  <p className="text-xs text-slate-400">{originName} to {destinationName} Trade Corridor</p>
                </div>
              </div>

              <div className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-200">
                {quote?.transitDays}
              </div>
            </div>

            {/* Visual Corridor Arc (Matching Screenshot 4) */}
            <div className="py-12 px-4 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-lg relative h-28 flex items-center justify-between">
                
                {/* SVG Connecting Arc */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Dashed upper arc */}
                  <path 
                    d="M 40 60 Q 200 10 360 60" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="2" 
                    strokeDasharray="5,5" 
                    opacity="0.85"
                  />
                  {/* Solid curved line below */}
                  <path 
                    d="M 40 60 Q 200 110 360 60" 
                    fill="none" 
                    stroke="#ea580c" 
                    strokeWidth="2.5" 
                  />
                </svg>

                {/* Origin Dot (Orange) */}
                <div className="relative z-10 flex flex-col items-center -ml-2">
                  <div className="w-5 h-5 rounded-full bg-orange-500 border-3 border-white shadow-lg shadow-orange-500/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span className="text-xs font-black text-white mt-2 tracking-wide font-sans">{originName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{originCode}</span>
                </div>

                {/* Destination Dot (Green) */}
                <div className="relative z-10 flex flex-col items-center -mr-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-3 border-white shadow-lg shadow-emerald-500/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span className="text-xs font-black text-white mt-2 tracking-wide font-sans">{destinationName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{destinationCode}</span>
                </div>

              </div>
            </div>

            {/* Bottom mini status */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>Direct Verified Port-to-Port Rotation</span>
              </div>
              <span className="font-mono text-slate-300">Carrier: {quote?.carrier}</span>
            </div>

          </div>

          {/* Right: Quotation Details Card (span 5) (Image 4) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Quotation Details</h3>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Key Values List */}
              <div className="divide-y divide-slate-100 text-xs py-2">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Customer</span>
                  <span className="font-bold text-slate-900">{quote?.customer}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Commodity</span>
                  <span className="font-bold text-slate-800">{quote?.commodity || 'General Cargo'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Gross weight</span>
                  <span className="font-bold text-slate-800 font-mono">{quote?.weight || '19,969 kg'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Mode</span>
                  <span className="font-bold text-slate-800">{quote?.mode || 'Ocean FCL'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Basis</span>
                  <span className="font-bold text-slate-800">{quote?.basis || '1 x 40HC'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Mobile / Phone</span>
                  <span className="font-mono font-bold text-slate-800">{quote?.phone || '+91 6769897899'}</span>
                </div>
              </div>
            </div>

            {/* Indicative Total Bottom Section */}
            <div className="pt-4 border-t border-slate-100 mt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                INDICATIVE TOTAL
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {quote?.sellPrice}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                All statutory charges and commercial handling fees included.
              </span>
            </div>

          </div>

        </div>

        {/* Second Row: Itemized Tariff & Charge Breakdown (Left) & Approval Sequence (Right) (Image 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Itemized Tariff Breakdown (span 8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Itemized Tariff & Charge Breakdown</h3>
                  <p className="text-[11px] text-slate-500">Statutory tariff schedule and linehaul build-up for this consignment.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                  Currency: INR (₹)
                </div>
                <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                  All-Inclusive Tariff
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Charge Description</th>
                    <th className="px-4 py-3">Basis / Rating</th>
                    <th className="px-4 py-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Base Ocean Linehaul Freight</td>
                    <td className="px-4 py-3 text-slate-500">Fixed rate per 40HC container</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹ {baseFreight.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Bunker Adjustment Factor (BAF)</td>
                    <td className="px-4 py-3 text-slate-500">10.0% standard bunker fuel indexing</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹ {baf.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Origin Terminal Handling Charge (THC-O)</td>
                    <td className="px-4 py-3 text-slate-500">Port container crane & yard movement</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹ {originThc.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Destination Terminal Handling (THC-D)</td>
                    <td className="px-4 py-3 text-slate-500">Discharge port container handling fee</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹ {destThc.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Documentation & Bill of Lading Fee</td>
                    <td className="px-4 py-3 text-slate-500">Electronic EDI filing & issuance</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹ {docFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Port Security (ISPS) & Statutory Taxes</td>
                    <td className="px-4 py-3 text-slate-500">Mandatory statutory maritime port fee</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹ {Math.max(1000, isps).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50/80 font-black">
                    <td className="px-4 py-3 text-slate-900 text-xs uppercase tracking-wider" colSpan={2}>Grand Total Quotation</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-slate-900">
                      ₹ {totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Right: Approval Sequence (span 4) (Image 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Approval Sequence</h3>
              <p className="text-sm font-bold text-slate-900 mt-0.5">2-Stage Sequential Verification</p>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Step 1: Freight Agent */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                isAgentApproved 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isAgentApproved ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isAgentApproved ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>1. Freight Agent Sign-Off</span>
                    {isAgentApproved && <span className="text-[10px] text-emerald-700 font-mono">(Approved)</span>}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isAgentApproved 
                      ? 'Freight Agent Sarah Jenkins approved commercial margins and dispatched to Customs.' 
                      : 'Pending Freight Agent review in Operations Desk.'}
                  </p>
                </div>
              </div>

              {/* Step 2: Customs Officer */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                isCustomsApproved 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                  : isAgentApproved
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isCustomsApproved ? 'bg-emerald-600 text-white' : isAgentApproved ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {isCustomsApproved ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>2. Customs Officer Clearance</span>
                    {isCustomsApproved && <span className="text-[10px] text-emerald-700 font-mono">(Approved)</span>}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isCustomsApproved 
                      ? 'Customs Compliance Officer authorized regulatory dossier and issued quote.' 
                      : isAgentApproved
                      ? 'Forwarded to Customs Compliance Desk for statutory document verification.'
                      : 'Awaiting Freight Agent completion before customs review.'}
                  </p>
                </div>
              </div>

              {/* Step 3: Customer Acceptance */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                quote?.status === 'ACCEPTED'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : isFullyApproved 
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  quote?.status === 'ACCEPTED' ? 'bg-emerald-600 text-white' : isFullyApproved ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">
                    3. Customer Final Acceptance
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {quote?.status === 'ACCEPTED' 
                      ? 'Accepted by customer. Booking reference confirmed.' 
                      : isFullyApproved 
                      ? 'Quote & PDF unlocked! Ready for customer acceptance.' 
                      : 'Locked until Freight Agent and Customs Officer complete approval.'}
                  </p>
                </div>
              </div>

            </div>

            {/* PDF Button */}
            <div className="pt-2">
              {isFullyApproved ? (
                <button
                  onClick={() => downloadQuotePDF(quote)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Quotation PDF</span>
                </button>
              ) : (
                <div className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200">
                  <FolderLock className="w-3.5 h-3.5 text-slate-400" />
                  <span>PDF Locked (Pending Approvals)</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. RECOMMENDED ROUTE OPTIONS (3) SECTION (Matching Image 5) */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Recommended Route Options ({quote?.routes?.length || 3})
              </h2>
              <p className="text-xs text-slate-500">
                Choose your preferred carrier route. Click to select and request approval.
              </p>
            </div>
            
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>ML market rate benchmarked</span>
            </span>
          </div>

          {/* 3 Interactive Route Cards (Matching Image 5) */}
          <div className="grid grid-cols-1 gap-4">
            {quote?.routes?.map((route, idx) => {
              const isSelected = selectedRouteIndex === idx

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectRoute(idx)}
                  className={`rounded-3xl p-5 sm:p-6 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/15 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    
                    {/* Carrier & Service */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                          {route.carrier}
                        </span>
                        {route.isRecommended && (
                          <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-black rounded-md uppercase tracking-wider">
                            RECOMMENDED
                          </span>
                        )}
                        {isSelected && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>SELECTED ROUTE</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium block mt-1">
                        {route.service}
                      </span>
                    </div>

                    {/* Price & Chosen / Select Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          ₹ {route.price.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          DAYS TRANSIT: {route.transitDays}
                        </span>
                      </div>

                      {isSelected ? (
                        <div className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20">
                          <Check className="w-4 h-4" />
                          <span>Chosen</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectRoute(idx)
                          }}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Select Route
                        </button>
                      )}
                    </div>

                  </div>

                  {/* 4 Score Progress Metrics (Matching Image 5) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                    
                    {/* Transit score */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500 font-medium">Transit score</span>
                        <span className="font-mono font-black text-slate-800">
                          {route.scores.transit}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${route.scores.transit * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Cost score */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500 font-medium">Cost score</span>
                        <span className="font-mono font-black text-slate-800">
                          {route.scores.cost}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${route.scores.cost * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Reliability */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500 font-medium">Reliability</span>
                        <span className="font-mono font-black text-slate-800">
                          {route.scores.reliability}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${route.scores.reliability * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Congestion */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500 font-medium">Congestion</span>
                        <span className="font-mono font-black text-slate-800">
                          {route.scores.congestion}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${route.scores.congestion * 100}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>

                </div>
              )
            })}
          </div>

          {/* Bottom Actions Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Selected carrier: <strong className="text-slate-900">{quote?.routes?.[selectedRouteIndex]?.carrier}</strong> ({quote?.routes?.[selectedRouteIndex]?.service})
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/user/dashboard')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Track in Customer Dashboard →
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0b1b2d] text-slate-400 text-xs py-6 border-t border-slate-800/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Portline FreightIQ. Autonomous Multi-Agent Maritime Freight Pricing.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/user/dashboard" className="hover:text-white">Customer Portal</Link>
            <Link to="/customs/dashboard" className="hover:text-white">Customs Desk</Link>
            <Link to="/agents/dashboard" className="hover:text-white">Agent Operations</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
