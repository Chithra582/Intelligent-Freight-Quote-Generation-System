import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Truck, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Plane, 
  Anchor, 
  Train, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Calendar,
  Layers,
  CircleDot,
  Calculator,
  User,
  Building,
  Mail,
  Phone,
  Info,
  RotateCcw,
  ArrowRight,
  Search,
  Eye,
  Download,
  Edit3,
  Sliders,
  DollarSign,
  CheckCircle2,
  FileText,
  X,
  Check,
  AlertTriangle,
  Tag,
  ShieldAlert,
  Percent,
  Plus,
  Shield
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { downloadQuotePDF, exportQuotesCSV } from '../utils/exportUtils'

const INITIAL_QUOTES = [
  {
    id: 'QT-2026-00934',
    customer: 'Sharma Textiles',
    customerCity: 'Mumbai',
    carrier: 'Maersk Line Direct Service',
    originCode: 'INNSA',
    destCode: 'AEJEA',
    originName: 'Mumbai',
    destName: 'Dubai',
    lane: 'INNSA → AEJEA',
    laneDesc: 'Mumbai → Dubai',
    mode: 'Ocean FCL',
    basis: '2 × 40HC',
    transit: '6–10 d',
    cost: '₹ 4,21,897',
    baseCost: 361992,
    brokerMargin: 59905,
    marginPct: 14.2,
    floorPct: 12.0,
    status: 'Dispatched to Client',
    created: '2 min ago',
    weight: '18,400 kg'
  },
  {
    id: 'QT-2026-00933',
    customer: 'Nordic Imports AB',
    customerCity: 'Gothenburg',
    carrier: 'MSC Mediterranean Shipping',
    originCode: 'INNSA',
    destCode: 'NLRTM',
    originName: 'Mumbai',
    destName: 'Rotterdam',
    lane: 'INNSA → NLRTM',
    laneDesc: 'Mumbai → Rotterdam',
    mode: 'Ocean FCL',
    basis: '1 × 20GP',
    transit: '24–28 d',
    cost: '₹ 2,15,800',
    baseCost: 194414,
    brokerMargin: 21386,
    marginPct: 11.0,
    floorPct: 12.0,
    status: 'Pending Approval',
    created: '1 hour ago',
    weight: '12,500 kg'
  },
  {
    id: 'QT-2026-00932',
    customer: 'Gulf Machinery LLC',
    customerCity: 'Dubai',
    carrier: 'Emirates SkyCargo Priority',
    originCode: 'BOM',
    destCode: 'DXB',
    originName: 'Mumbai',
    destName: 'Dubai',
    lane: 'BOM → DXB',
    laneDesc: 'Mumbai → Dubai',
    mode: 'Air Freight',
    basis: '250 kg ch.',
    transit: '5–7 d',
    cost: '₹ 64,300',
    baseCost: 56890,
    brokerMargin: 7410,
    marginPct: 13.0,
    floorPct: 12.0,
    status: 'Issued',
    created: '3 hours ago',
    weight: '250 kg'
  },
  {
    id: 'QT-2026-00931',
    customer: 'Apex Global Logistics',
    customerCity: 'Singapore',
    carrier: 'ONE Ocean Network Express',
    originCode: 'INNSA',
    destCode: 'SGSIN',
    originName: 'Mumbai',
    destName: 'Singapore',
    lane: 'INNSA → SGSIN',
    laneDesc: 'Mumbai → Singapore',
    mode: 'Ocean LCL',
    basis: '4.2 R/T',
    transit: '11–16 d',
    cost: '₹ 88,400',
    baseCost: 79200,
    brokerMargin: 9200,
    marginPct: 11.6,
    floorPct: 12.0,
    status: 'Draft',
    created: 'Yesterday',
    weight: '3,200 kg'
  }
]

const INITIAL_APPROVALS = [
  {
    id: 'APV-801',
    quoteId: 'QT-2026-00933',
    customer: 'Nordic Imports AB',
    lane: 'INNSA → NLRTM',
    mode: 'Ocean FCL (1 × 20GP)',
    quoteValue: '₹ 2,15,800',
    appliedMarginPct: 11.0,
    floorPct: 12.0,
    gapPoints: 1.0,
    breachReason: 'Margin 11.0% is 1.0 percentage points below policy floor (12.0%).',
    approverRole: 'SENIOR_BROKER',
    requestedBy: 'Ravi S. (Broker)',
    requestedAt: '1 hour ago',
    status: 'PENDING'
  }
]

export default function BrokerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [quotes, setQuotes] = useState(INITIAL_QUOTES)
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS)
  const [currentTab, setCurrentTab] = useState('quotes') // 'quotes' | 'approvals'
  const [searchQuery, setSearchQuery] = useState('')
  const [laneFilter, setLaneFilter] = useState('All lanes')
  const [modeFilter, setModeFilter] = useState('All modes')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [userName, setUserName] = useState('Freight Broker')

  // Commercial Margin Workbench Modal State
  const [adjustingQuote, setAdjustingQuote] = useState(null)
  const [costComponents, setCostComponents] = useState([])
  const [adjMarginPct, setAdjMarginPct] = useState(14.2)
  const [policyFloorPct, setPolicyFloorPct] = useState(12.0)
  const [newFeeName, setNewFeeName] = useState('')
  const [newFeeAmount, setNewFeeAmount] = useState('')

  // Reject Modal State
  const [rejectingApproval, setRejectingApproval] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const selectedQuoteId = queryParams.get('quoteId')

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
    }
    const name = localStorage.getItem('userName') || 'Freight Broker'
    setUserName(name)

    // Load tab from URL if specified
    const tabParam = queryParams.get('tab')
    if (tabParam === 'approvals') {
      setCurrentTab('approvals')
    }

    const storedQuotes = localStorage.getItem('brokerQuotes')
    if (storedQuotes) {
      try {
        const parsed = JSON.parse(storedQuotes)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map(q => q.id))
          const remaining = INITIAL_QUOTES.filter(q => !ids.has(q.id))
          setQuotes([...parsed, ...remaining])
        }
      } catch (err) {
        console.error(err)
      }
    }

    const storedApprovals = localStorage.getItem('quoteApprovals')
    if (storedApprovals) {
      try {
        const parsed = JSON.parse(storedApprovals)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApprovals(parsed)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }, [location.search])

  const handleOpenAdjustModal = (q) => {
    setAdjustingQuote(q)
    setAdjMarginPct(q.marginPct || 14.2)
    setPolicyFloorPct(q.floorPct || 12.0)

    // Initialize 10-step itemized cost breakdown (Milestone 2 Specification)
    const baseFreight = q.baseCost ? Math.round(q.baseCost * 0.78) : 284814
    const baf = Math.round(baseFreight * 0.12)
    const thco = 18500
    const thcd = 16800
    const isps = 4200
    const doc = 3500
    const cco = 4800
    const ins = 9378

    const defaultComponents = [
      { order: 10, code: 'OFR', name: `Ocean Freight Linehaul (${q.basis || '2 × 40HC'})`, amount: baseFreight, source: 'RATE_CARD', basis: '2 × 40HC @ Contract Rate' },
      { order: 20, code: 'BAF', name: 'Bunker Adjustment Factor (Fuel 12%)', amount: baf, source: 'SURCHARGE_TABLE', basis: '12.0% of Ocean Base' },
      { order: 30, code: 'THCO', name: 'Terminal Handling Charge — Origin (THC-O)', amount: thco, source: 'SURCHARGE_TABLE', basis: '2 × ₹9,250 per container' },
      { order: 32, code: 'ISPS', name: 'Port Facility Security Surcharge (ISPS)', amount: isps, source: 'SURCHARGE_TABLE', basis: '2 × ₹2,100 per container' },
      { order: 34, code: 'DOC', name: 'Export B/L Documentation Fee', amount: doc, source: 'SURCHARGE_TABLE', basis: 'Per shipment flat' },
      { order: 36, code: 'CCO', name: 'Origin Customs Clearance (ICEGATE)', amount: cco, source: 'SURCHARGE_TABLE', basis: 'Per shipment export EDI' },
      { order: 40, code: 'THCD', name: 'Terminal Handling Charge — Destination (THC-D)', amount: thcd, source: 'SURCHARGE_TABLE', basis: '2 × ₹8,400 per container' },
      { order: 70, code: 'INS', name: 'Marine Cargo Insurance Policy (110% CIF)', amount: ins, source: 'RATE_CARD', basis: '0.35% of ₹26.79L valuation' },
    ]

    setCostComponents(defaultComponents)
  }

  const handleAddCustomSurcharge = () => {
    if (!newFeeName || !newFeeAmount) return
    const amt = parseFloat(newFeeAmount) || 0
    if (amt <= 0) return

    const newComp = {
      order: 65,
      code: 'MANUAL_FEE',
      name: newFeeName.trim(),
      amount: amt,
      source: 'MANUAL',
      basis: 'Broker manual adjustment'
    }

    setCostComponents([...costComponents, newComp])
    setNewFeeName('')
    setNewFeeAmount('')
  }

  const handleRemoveComponent = (idx) => {
    setCostComponents(costComponents.filter((_, i) => i !== idx))
  }

  const totalBuyCost = costComponents.reduce((sum, c) => sum + (c.amount || 0), 0)
  const marginAmount = Math.round(totalBuyCost * (adjMarginPct / 100))
  const finalSellPrice = totalBuyCost + marginAmount
  const isBelowFloor = adjMarginPct < policyFloorPct
  const floorDeficit = isBelowFloor ? (policyFloorPct - adjMarginPct).toFixed(1) : 0

  const handleSaveAdjustment = () => {
    if (!adjustingQuote) return

    if (isBelowFloor) {
      // 409 Below Floor Behavior -> Submit for Approval
      const newApproval = {
        id: `APV-${Math.floor(100 + Math.random() * 900)}`,
        quoteId: adjustingQuote.id,
        customer: adjustingQuote.customer,
        lane: adjustingQuote.lane,
        mode: adjustingQuote.mode,
        quoteValue: `₹ ${finalSellPrice.toLocaleString('en-IN')}`,
        appliedMarginPct: adjMarginPct,
        floorPct: policyFloorPct,
        gapPoints: parseFloat(floorDeficit),
        breachReason: `Margin ${adjMarginPct}% is ${floorDeficit} points below policy floor (${policyFloorPct}%).`,
        approverRole: parseFloat(floorDeficit) > 5.0 ? 'PRICING_MANAGER' : 'SENIOR_BROKER',
        requestedBy: `${userName} (Broker)`,
        requestedAt: 'Just now',
        status: 'PENDING'
      }

      const updatedApprovals = [newApproval, ...approvals]
      setApprovals(updatedApprovals)
      localStorage.setItem('quoteApprovals', JSON.stringify(updatedApprovals))

      // Update quote status to Pending Approval
      const updatedQuotes = quotes.map(q => {
        if (q.id === adjustingQuote.id) {
          return {
            ...q,
            cost: `₹ ${finalSellPrice.toLocaleString('en-IN')}`,
            baseCost: totalBuyCost,
            brokerMargin: marginAmount,
            marginPct: adjMarginPct,
            status: 'Pending Approval'
          }
        }
        return q
      })

      setQuotes(updatedQuotes)
      localStorage.setItem('brokerQuotes', JSON.stringify(updatedQuotes))
      setAdjustingQuote(null)
      alert(`⚠️ Margin floor breach recorded! Quotation ${adjustingQuote.id} submitted for approval to ${newApproval.approverRole}.`)
      return
    }

    // Standard Approved Save & Dispatch
    const updated = quotes.map(q => {
      if (q.id === adjustingQuote.id) {
        return {
          ...q,
          cost: `₹ ${finalSellPrice.toLocaleString('en-IN')}`,
          baseCost: totalBuyCost,
          brokerMargin: marginAmount,
          marginPct: adjMarginPct,
          status: 'Dispatched to Client'
        }
      }
      return q
    })

    setQuotes(updated)
    localStorage.setItem('brokerQuotes', JSON.stringify(updated))

    // Sync to customer quotes
    try {
      const storedCust = localStorage.getItem('customerQuotes')
      let custList = storedCust ? JSON.parse(storedCust) : []
      let foundInCust = false
      custList = custList.map(cq => {
        if (cq.id === adjustingQuote.id || cq.customer === adjustingQuote.customer) {
          foundInCust = true
          return {
            ...cq,
            sellPrice: `₹ ${finalSellPrice.toLocaleString('en-IN')}`,
            status: 'Issued',
            dispatchedStatus: 'Dispatched to Client',
            service: adjustingQuote.carrier || cq.service || 'Maersk Line Direct Service',
            trackingStep: 2
          }
        }
        return cq
      })
      if (!foundInCust) {
        custList.unshift({
          id: adjustingQuote.id,
          origin: adjustingQuote.originName || 'Nhava Sheva (INNSA)',
          destination: adjustingQuote.destName || 'Jebel Ali (AEJEA)',
          mode: adjustingQuote.mode?.includes('Air') ? 'Air' : 'Ocean',
          service: adjustingQuote.carrier || 'Maersk Line Direct Express',
          sellPrice: `₹ ${finalSellPrice.toLocaleString('en-IN')}`,
          status: 'Issued',
          dispatchedStatus: 'Dispatched to Client',
          validUntil: 'Aug 24, 2026',
          transitDays: adjustingQuote.transit || '6 - 8 Days',
          cargo: `${adjustingQuote.basis || '1 x 40HC'} (${adjustingQuote.weight || '18,400 kg'})`,
          trackingStep: 2
        })
      }
      localStorage.setItem('customerQuotes', JSON.stringify(custList))
    } catch (err) {
      console.error('Customer quotes sync error:', err)
    }

    setAdjustingQuote(null)
    alert(`Quotation ${adjustingQuote.id} compliant with policy floor and dispatched to client!`)
  }

  const handleApproveFromQueue = (apv) => {
    // 1. Update approval status
    const updatedApvs = approvals.filter(a => a.id !== apv.id)
    setApprovals(updatedApvs)
    localStorage.setItem('quoteApprovals', JSON.stringify(updatedApvs))

    // 2. Update quote status to Dispatched
    const updatedQuotes = quotes.map(q => {
      if (q.id === apv.quoteId) {
        return { ...q, status: 'Dispatched to Client' }
      }
      return q
    })
    setQuotes(updatedQuotes)
    localStorage.setItem('brokerQuotes', JSON.stringify(updatedQuotes))

    // 3. Update customer quote
    try {
      const storedCust = localStorage.getItem('customerQuotes')
      let custList = storedCust ? JSON.parse(storedCust) : []
      custList = custList.map(cq => cq.id === apv.quoteId ? { ...cq, status: 'Issued', dispatchedStatus: 'Dispatched to Client' } : cq)
      localStorage.setItem('customerQuotes', JSON.stringify(custList))
    } catch {}

    alert(`Approval ${apv.id} for Quote ${apv.quoteId} AUTHORIZED! Dispatched to customer.`)
  }

  const handleOpenRejectModal = (apv) => {
    setRejectingApproval(apv)
    setRejectReason('')
  }

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('A mandatory rejection reason is required.')
      return
    }

    const apv = rejectingApproval
    const updatedApvs = approvals.filter(a => a.id !== apv.id)
    setApprovals(updatedApvs)
    localStorage.setItem('quoteApprovals', JSON.stringify(updatedApvs))

    const updatedQuotes = quotes.map(q => {
      if (q.id === apv.quoteId) {
        return { ...q, status: 'Declined' }
      }
      return q
    })
    setQuotes(updatedQuotes)
    localStorage.setItem('brokerQuotes', JSON.stringify(updatedQuotes))

    setRejectingApproval(null)
    alert(`Approval ${apv.id} REJECTED with reason: "${rejectReason}". Quote marked as Declined.`)
  }

  const getSourceBadge = (src) => {
    switch (src) {
      case 'RATE_CARD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">RATE_CARD</span>
      case 'SURCHARGE_TABLE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">SURCHARGE_TABLE</span>
      case 'PREDICTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PREDICTED</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">MANUAL</span>
    }
  }

  const getModeTag = (mode) => {
    const isAir = mode?.toLowerCase().includes('air')
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
        isAir ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}>
        {isAir ? <Plane className="w-3 h-3" /> : <Anchor className="w-3 h-3" />}
        <span>{mode}</span>
      </span>
    )
  }

  const getStatusBadge = (status) => {
    if (status === 'Dispatched to Client') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Dispatched</span>
        </span>
      )
    }
    if (status === 'Pending Approval') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          <span>Pending Approval</span>
        </span>
      )
    }
    if (status === 'Issued') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Issued
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        Draft
      </span>
    )
  }

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.lane && q.lane.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (modeFilter !== 'All modes' && !q.mode.toLowerCase().includes(modeFilter.toLowerCase().replace('ocean ', ''))) return false
    if (statusFilter !== 'All statuses' && q.status.toLowerCase() !== statusFilter.toLowerCase()) return false
    return matchesSearch
  })

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden">
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Broker Top Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Milestone 2 Pricing Intelligence & Commercial Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Freight Broker Control Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                10-step itemized cost build-up, Incoterm responsibilities, margin floor policy enforcement, and multi-tier approval queue.
              </p>
            </div>

            {/* Tab Switches */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setCurrentTab('quotes')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'quotes' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Quotations Workbench ({quotes.length})</span>
              </button>

              <button
                onClick={() => setCurrentTab('approvals')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer relative ${
                  currentTab === 'approvals' ? 'bg-amber-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Approvals Queue ({approvals.length})</span>
                {approvals.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 absolute -top-0.5 -right-0.5 animate-ping" />
                )}
              </button>

              <Link
                to="/dashboard/new-shipment"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Quote Enquiry</span>
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: QUOTATIONS WORKBENCH */}
          {/* ========================================================================= */}
          {currentTab === 'quotes' && (
            <>
              {/* KPIs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">QUOTES THIS MONTH</div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">{quotes.length} Active</div>
                  <div className="text-[11px] font-bold text-emerald-600">Zero margin-floor violations</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">AVG MARGIN SPREAD</div>
                  <div className="text-2xl font-extrabold text-indigo-600 tracking-tight my-1">14.2%</div>
                  <div className="text-[11px] font-bold text-slate-500">Floor: 12.0% (LANE Policy)</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">COST DEVIATION</div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">≤ 5.8%</div>
                  <div className="text-[11px] font-bold text-emerald-600">Passed M2 target (≤ 8%)</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">PENDING APPROVALS</div>
                  <div className="text-2xl font-extrabold text-amber-600 tracking-tight my-1">{approvals.length}</div>
                  <div className="text-[11px] font-bold text-amber-600">Requires Senior review</div>
                </div>
              </div>

              {/* Quotations Table */}
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
                
                <div className="flex flex-wrap gap-2.5 items-center justify-between">
                  <div className="relative flex-1 min-w-[200px] max-w-[280px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Quote no, customer, lane…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={laneFilter}
                      onChange={e => setLaneFilter(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-medium cursor-pointer"
                    >
                      <option>All lanes</option>
                      <option>INNSA → AEJEA</option>
                      <option>INNSA → NLRTM</option>
                      <option>BOM → DXB</option>
                    </select>

                    <button 
                      onClick={() => { setSearchQuery(''); setLaneFilter('All lanes'); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10.5px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="text-left px-4 py-3">Quote ID</th>
                        <th className="text-left px-4 py-3">Customer</th>
                        <th className="text-left px-4 py-3">Lane & Basis</th>
                        <th className="text-left px-3 py-3">Mode</th>
                        <th className="text-left px-4 py-3">Cost & Margin</th>
                        <th className="text-left px-4 py-3">Invoiced Total</th>
                        <th className="text-left px-3 py-3">Status</th>
                        <th className="text-right px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredQuotes.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">
                            {q.id}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900">{q.customer}</div>
                            <div className="text-[10.5px] text-slate-400">{q.customerCity || 'Mumbai'}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-mono text-slate-800 font-semibold">{q.lane}</div>
                            <div className="text-[10.5px] text-slate-400">{q.basis || '2 × 40HC'}</div>
                          </td>

                          <td className="px-3 py-3.5">
                            {getModeTag(q.mode)}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-slate-500 text-[11px]">Buy: ₹ {(q.baseCost || 361992).toLocaleString('en-IN')}</div>
                            <div className="text-[10.5px] font-bold text-emerald-600">Margin: {q.marginPct || 14.2}% (+ ₹ {(q.brokerMargin || 59905).toLocaleString('en-IN')})</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-mono font-black text-slate-900 text-sm">{q.cost}</div>
                          </td>

                          <td className="px-3 py-3.5">
                            {getStatusBadge(q.status)}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenAdjustModal(q)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Adjust linehaul rates and margin"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-600" />
                                <span>Adjust Cost / Margin</span>
                              </button>

                              <button
                                onClick={() => downloadQuotePDF(q)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Download PDF Quote"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: APPROVALS QUEUE (MILSTONE 2 SPEC §5.4) */}
          {/* ========================================================================= */}
          {currentTab === 'approvals' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      Commercial Rate & Margin Approval Queue
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      {approvals.length} Pending Review
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Multi-tier approval workflow for margin floor breaches, high-value contracts, and uncontracted market rate quotes.
                  </p>
                </div>
              </div>

              {approvals.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm">Approval Queue Clear</h3>
                  <p className="text-xs text-slate-400 mt-1">All quotations are currently compliant with commercial policy floors.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvals.map(apv => (
                    <div key={apv.id} className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-indigo-700">{apv.quoteId}</span>
                          <span className="text-xs font-bold text-slate-900">· {apv.customer}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            {apv.approverRole} APPROVAL REQUIRED
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{apv.breachReason}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-4 font-mono pt-1">
                          <span>Lane: {apv.lane}</span>
                          <span>Quote Value: {apv.quoteValue}</span>
                          <span>Requested by: {apv.requestedBy}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveFromQueue(apv)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Issue</span>
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(apv)}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: COMMERCIAL MARGIN WORKBENCH (10-STEP COST BUILD-UP) */}
      {/* ========================================================================= */}
      {adjustingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block mb-0.5">
                  COMMERCIAL PRICING INTELLIGENCE & MARGIN WORKBENCH
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Cost Build-Up & Policy Floor Control: {adjustingQuote.id}
                </h3>
                <p className="text-xs text-slate-400">{adjustingQuote.customer} · {adjustingQuote.lane} · {adjustingQuote.basis}</p>
              </div>
              <button
                onClick={() => setAdjustingQuote(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 10-Step Cost Breakdown Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Named Buy-Side Cost Components ({costComponents.length} Lines)
                </h4>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  Net Buy Cost: ₹ {totalBuyCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 shadow-inner">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2">Line</th>
                      <th className="text-left px-3 py-2">Component Name</th>
                      <th className="text-left px-2 py-2">Source</th>
                      <th className="text-right px-3 py-2">Amount (INR)</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {costComponents.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 font-mono font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="font-bold text-slate-800">{comp.name}</div>
                          <div className="text-[10px] text-slate-400">{comp.basis}</div>
                        </td>
                        <td className="px-2 py-2">{getSourceBadge(comp.source)}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                          ₹ {comp.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {comp.source === 'MANUAL' && (
                            <button
                              onClick={() => handleRemoveComponent(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Remove manual line"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Custom Surcharge Input */}
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <input
                  type="text"
                  placeholder="Custom fee (e.g. Cold storage, Quarantine)"
                  value={newFeeName}
                  onChange={e => setNewFeeName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Amount ₹"
                  value={newFeeAmount}
                  onChange={e => setNewFeeAmount(e.target.value)}
                  className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSurcharge}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>

            {/* Margin Slider & Floor Enforcement */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Commercial Margin Spread
                </span>
                <span className={`font-mono font-black text-sm ${isBelowFloor ? 'text-rose-600' : 'text-indigo-600'}`}>
                  {adjMarginPct}% ({isBelowFloor ? 'FLOOR BREACH' : 'COMPLIANT'})
                </span>
              </div>

              <input
                type="range"
                min="4"
                max="30"
                step="0.5"
                value={adjMarginPct}
                onChange={e => setAdjMarginPct(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Min: 4%</span>
                <span className="text-amber-700 font-bold">Policy Floor: {policyFloorPct}%</span>
                <span>Target: 15%</span>
                <span>Max: 30%</span>
              </div>

              {/* Policy Warning or Compliance Notice */}
              {isBelowFloor ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">⚠️ Margin Floor Violation (409 Control):</span>
                    <p className="mt-0.5 text-[11px]">
                      Applied margin ({adjMarginPct}%) is {floorDeficit} points below policy floor ({policyFloorPct}%). Direct client dispatch is blocked; quote will be routed to {parseFloat(floorDeficit) > 5.0 ? 'Pricing Manager' : 'Senior Broker'} for authorization.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">✓ Policy Compliant: Margin meets the {policyFloorPct}% floor requirement.</span>
                </div>
              )}

              {/* Summary Calculation */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Net Buy-Side Cost:</span>
                  <span>₹ {totalBuyCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Broker Margin Spread ({adjMarginPct}%):</span>
                  <span>+ ₹ {marginAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-indigo-700 font-black text-sm pt-1 border-t border-slate-300">
                  <span>Final Client Invoiced Price:</span>
                  <span className="text-base">₹ {finalSellPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAdjustingQuote(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustment}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                  isBelowFloor ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isBelowFloor ? <ShieldAlert className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>{isBelowFloor ? 'Submit for Commercial Approval' : 'Authorize & Dispatch to Client'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT APPROVAL (WITH MANDATORY REASON) */}
      {/* ========================================================================= */}
      {rejectingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <X className="w-5 h-5 text-rose-600" />
                <span>Reject Approval: {rejectingApproval.quoteId}</span>
              </h3>
              <button onClick={() => setRejectingApproval(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 uppercase">
                Mandatory Rejection Reason:
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Margin is below acceptable floor given high carrier congestion risk on this corridor..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectingApproval(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
