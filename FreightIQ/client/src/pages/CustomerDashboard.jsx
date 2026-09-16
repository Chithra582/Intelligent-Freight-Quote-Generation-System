import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Plane, 
  Anchor, 
  Train, 
  FileText, 
  Download, 
  ArrowRight, 
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  Shield,
  ExternalLink,
  Calculator,
  Sparkles,
  Check,
  X,
  ShieldAlert,
  Bell,
  FileCheck,
  User as UserIcon,
  Search,
  Eye,
  UploadCloud,
  Building,
  FolderLock,
  ShieldCheck,
  Scale
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import { downloadQuotePDF } from '../utils/exportUtils'

// Page 9 Test Shipment Data seeded directly into customer quotes
const DEFAULT_CUSTOMER_QUOTES = [
  {
    id: 'QT-2026-1001',
    shipmentId: 'SHP-1001',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Chennai, India (INMAA)',
    destination: 'Rotterdam, Netherlands (NLRTM)',
    mode: 'Sea',
    container: '40FT',
    cargo: 'Electronics (5,000 KG · 12 CBM)',
    distanceKm: 8950,
    transitDays: '24 Days',
    rulePrice: 87000,
    aiPrice: 85500,
    recommendedPrice: 86000,
    sellPrice: '₹86,000',
    weatherRisk: '30/100 (Moderate)',
    customsRisk: '40/100 (Medium)',
    routeRisk: '20/100 (Low)',
    compositeRisk: 'MEDIUM',
    status: 'PENDING_REVIEW', // Sequential approval: Waiting for Freight Agent then Customs Officer
    agentApproved: false,
    customsApproved: false,
    validUntil: 'Sep 18, 2026',
    carrier: 'Maersk Line Direct Service',
    ownerEmail: 'customer@apexgl.com'
  },
  {
    id: 'QT-5002',
    quoteId: 'QT-5002',
    shipmentId: 'SHP-1001',
    customer: 'ABC Electronics Pvt Ltd',
    companyId: 'CMP-102',
    companyName: 'GlobalSea Freight',
    origin: 'Chennai, India (INMAA)',
    destination: 'Rotterdam, Netherlands (NLRTM)',
    mode: 'Sea Freight',
    container: '40 FT',
    cargo: 'Electronics (5,000 KG · 12 CBM)',
    distanceKm: 8950,
    transitDays: '28 Days',
    price: 80000,
    sellPrice: '₹80,000',
    weatherRisk: '25/100 (Low)',
    customsRisk: '30/100 (Low)',
    routeRisk: '20/100 (Low)',
    compositeRisk: 'MEDIUM',
    riskLevel: 'Medium',
    status: 'PENDING_COMPANY_VERIFICATION', // Milestone 4 active selection
    agentApproved: false,
    customsApproved: false,
    validUntil: 'Sep 28, 2026',
    carrier: 'GlobalSea Freight Line',
    ownerEmail: 'customer@apexgl.com',
    pendingRevision: {
      originalPrice: 80000,
      revisedPrice: 82500,
      reason: 'Fuel surcharge increase',
      date: 'Today'
    }
  },
  {
    id: 'QT-2026-00930',
    shipmentId: 'SHP-1002',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Jebel Ali (AEJEA)',
    mode: 'Sea',
    container: '40HC',
    cargo: 'Telecom Switchgear (18,400 KG)',
    distanceKm: 2400,
    transitDays: '7 Days',
    rulePrice: 395000,
    aiPrice: 382000,
    recommendedPrice: 384500,
    sellPrice: '₹3,84,500',
    weatherRisk: '15/100 (Low)',
    customsRisk: '10/100 (Low)',
    routeRisk: '12/100 (Low)',
    compositeRisk: 'LOW',
    status: 'ACCEPTED',
    agentApproved: true,
    customsApproved: true,
    validUntil: 'Aug 22, 2026',
    carrier: 'MSC Mediterranean Shipping',
    ownerEmail: 'customer@apexgl.com'
  },
  {
    id: 'QT-2026-00812',
    shipmentId: 'SHP-1003',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Bengaluru (INBLR)',
    destination: 'Frankfurt (DEFRA)',
    mode: 'Air',
    container: 'Air Pallet',
    cargo: 'Microcontrollers (450 KG)',
    distanceKm: 7600,
    transitDays: '2 Days',
    rulePrice: 220000,
    aiPrice: 212000,
    recommendedPrice: 215000,
    sellPrice: '₹2,15,000',
    weatherRisk: '20/100 (Low)',
    customsRisk: '25/100 (Low)',
    routeRisk: '18/100 (Low)',
    compositeRisk: 'LOW',
    status: 'ACCEPTED',
    agentApproved: true,
    customsApproved: true,
    validUntil: 'Aug 18, 2026',
    carrier: 'Lufthansa Cargo Priority',
    ownerEmail: 'customer@apexgl.com'
  },
  {
    id: 'QT-2026-00744',
    shipmentId: 'SHP-1004',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Chennai (INMAA)',
    destination: 'Singapore (SGSIN)',
    mode: 'Sea',
    container: '20GP',
    cargo: 'Semiconductor Wafers (3,200 KG)',
    distanceKm: 3100,
    transitDays: '5 Days',
    rulePrice: 152000,
    aiPrice: 146000,
    recommendedPrice: 148350,
    sellPrice: '₹1,48,350',
    weatherRisk: '35/100 (Moderate)',
    customsRisk: '20/100 (Low)',
    routeRisk: '22/100 (Low)',
    compositeRisk: 'LOW',
    status: 'PENDING_REVIEW',
    agentApproved: false,
    customsApproved: false,
    validUntil: 'Aug 28, 2026',
    carrier: 'ONE Ocean Network Express',
    ownerEmail: 'customer@apexgl.com'
  }
]

export default function CustomerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [allQuotes, setAllQuotes] = useState(() => {
    const stored = localStorage.getItem('customerQuotes')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(q => {
            // Preserve explicit boolean flags if present
            const isAcc = q.status === 'ACCEPTED'
            const isSnt = q.status === 'SENT'
            return {
              ...q,
              agentApproved: q.agentApproved !== undefined ? q.agentApproved : (isAcc || isSnt),
              customsApproved: q.customsApproved !== undefined ? q.customsApproved : (isAcc || isSnt)
            }
          })
        }
      } catch {}
    }
    return DEFAULT_CUSTOMER_QUOTES
  })

  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Alex Shipper')
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || 'customer@apexgl.com')
  const [searchQuery, setSearchQuery] = useState('')
  const [unauthorizedAttempt, setUnauthorizedAttempt] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Multi-Customer Isolation: Filter quotes to only those belonging to this customer
  const quotes = useMemo(() => {
    const emailLower = (userEmail || '').toLowerCase().trim()
    const isDemo = !userEmail || emailLower === 'customer@apexgl.com' || emailLower === 'alex@apexgl.com'
    return allQuotes.filter(q => {
      const owner = (q.ownerEmail || '').toLowerCase().trim()
      const cust = (q.customerEmail || '').toLowerCase().trim()
      if (isDemo) {
        return !owner || owner === 'customer@apexgl.com' || cust === 'customer@apexgl.com' || owner === 'alex@apexgl.com'
      }
      return owner === emailLower || cust === emailLower
    })
  }, [allQuotes, userEmail])

  // Custom setQuotes that merges updates into allQuotes preserving other customers' quotes
  const setQuotes = (updaterOrList) => {
    if (typeof updaterOrList === 'function') {
      setAllQuotes(prev => {
        const updated = updaterOrList(prev)
        localStorage.setItem('customerQuotes', JSON.stringify(updated))
        return updated
      })
    } else if (Array.isArray(updaterOrList)) {
      setAllQuotes(prev => {
        const updatedMap = new Map(updaterOrList.map(item => [item.id, item]))
        const merged = prev.map(item => updatedMap.get(item.id) || item)
        updaterOrList.forEach(item => {
          if (!prev.some(p => p.id === item.id)) {
            merged.unshift(item)
          }
        })
        localStorage.setItem('customerQuotes', JSON.stringify(merged))
        return merged
      })
    }
  }

  // Document Management & Upload State
  const [documents, setDocuments] = useState(() => {
    const stored = localStorage.getItem('customerDocuments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
    return [
      { id: 'DOC-101', name: 'Commercial Invoice (Signed)', type: 'Commercial Invoice', format: 'PDF · 1.4 MB', date: 'Aug 14, 2026', shipmentId: 'SHP-1001', verified: true },
      { id: 'DOC-102', name: 'Packing List (Gross 5,000 KG)', type: 'Packing List', format: 'PDF · 820 KB', date: 'Aug 14, 2026', shipmentId: 'SHP-1001', verified: true },
      { id: 'DOC-103', name: 'Certificate of Origin (Form AIFTA)', type: 'Certificate of Origin', format: 'PDF · 2.1 MB', date: 'Aug 15, 2026', shipmentId: 'SHP-1001', verified: true },
      { id: 'DOC-104', name: 'Sea Waybill / Bill of Lading Draft', type: 'Bill of Lading', format: 'PDF · 1.8 MB', date: 'Aug 16, 2026', shipmentId: 'SHP-1002', verified: false }
    ]
  })
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    docType: 'Commercial Invoice',
    shipmentRef: 'SHP-1001',
    fileName: '',
    fileSize: ''
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // Read active tab from URL query params (Section 6 Side Navigation)
  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Alex Shipper'
    const email = localStorage.getItem('userEmail') || 'customer@apexgl.com'
    setUserName(name)
    setUserEmail(email)
  }, [])

  const showNotification = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Scenario 12: Customer accepts quote -> status updated to ACCEPTED
  const handleAcceptQuote = (quoteId) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: 'ACCEPTED' }
      }
      return q
    }))
    showNotification(`Quotation ${quoteId} has been ACCEPTED! Booking reference confirmed.`)
  }

  const handleRejectQuote = (quoteId) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: 'REJECTED' }
      }
      return q
    }))
    showNotification(`Quotation ${quoteId} has been REJECTED.`)
  }

  // Milestone 4: Customer Accepts Agent's Price Revision (Page 14: 80,000 -> 82,500 Fuel surcharge increase -> BK-2026-10045)
  const handleAcceptRevision = (quoteId) => {
    const bookingRef = 'BK-2026-10045'
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId || q.quoteId === quoteId) {
        const revPrice = q.pendingRevision ? q.pendingRevision.revisedPrice : 82500
        return {
          ...q,
          price: revPrice,
          sellPrice: `₹${revPrice.toLocaleString('en-IN')}`,
          status: 'BOOKING_CONFIRMED',
          bookingReference: bookingRef,
          pendingRevision: null
        }
      }
      return q
    }))

    // Sync to agent queue in localStorage so GlobalSea agent sees confirmed booking
    try {
      const agentQueue = JSON.parse(localStorage.getItem('m4AgentVerificationQueue') || '[]')
      const updatedAgentQueue = agentQueue.map(item => {
        if (item.quoteId === quoteId || item.shipmentId === 'SHP-1001') {
          return {
            ...item,
            currentPrice: 82500,
            priceFormatted: '₹82,500',
            status: 'BOOKING_CONFIRMED',
            bookingReference: bookingRef
          }
        }
        return item
      })
      localStorage.setItem('m4AgentVerificationQueue', JSON.stringify(updatedAgentQueue))
    } catch {}

    // Sync to allShipments so Cargo Ledger immediately updates to Booking Confirmed
    try {
      const storedShips = JSON.parse(localStorage.getItem('allShipments') || '[]')
      const updatedShips = storedShips.map(s => {
        if (s.quoteId === quoteId || s.id === quoteId || s.id === 'SHP-1001') {
          return {
            ...s,
            status: 'Booking Confirmed',
            bookingReference: bookingRef,
            customerApproved: true
          }
        }
        return s
      })
      localStorage.setItem('allShipments', JSON.stringify(updatedShips))
    } catch {}

    showNotification(`Commercial revision accepted! Booking reference ${bookingRef} has been confirmed.`)
  }

  const handleRejectRevision = (quoteId) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId || q.quoteId === quoteId) {
        return {
          ...q,
          status: 'RESELECT_QUOTE',
          pendingRevision: null
        }
      }
      return q
    }))
    showNotification(`Revision declined. You may now compare and select an alternate freight company.`)
  }

  // Milestone 4: Customer selects quote from multi-company comparison
  const handleSelectMultiCompanyQuote = (companyQuote) => {
    const updated = quotes.map(q => {
      if (q.shipmentId === companyQuote.shipmentId || q.id === companyQuote.id || q.shipmentId === 'SHP-1001') {
        return {
          ...q,
          status: 'PENDING_COMPANY_VERIFICATION',
          companyId: companyQuote.companyId,
          companyName: companyQuote.companyName,
          selectedQuoteNumber: companyQuote.quoteId,
          price: companyQuote.price,
          sellPrice: `₹${companyQuote.price.toLocaleString('en-IN')}`
        }
      }
      return q
    })
    setQuotes(updated)
    localStorage.setItem('customerQuotes', JSON.stringify(updated))

    // Strict Company Isolation: Dispatch request exclusively to selected company's agent queue
    try {
      const storedQueue = JSON.parse(localStorage.getItem('m4AgentVerificationQueue') || '[]')
      const newAgentReq = {
        id: `SEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        selectionId: `SEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        quoteId: companyQuote.quoteId,
        shipmentId: companyQuote.shipmentId || 'SHP-1001',
        customer: 'ABC Electronics Pvt Ltd',
        customerEmail: 'customer@apexgl.com',
        companyId: companyQuote.companyId,
        companyName: companyQuote.companyName,
        origin: 'Chennai, India (INMAA)',
        destination: 'Rotterdam, Netherlands (NLRTM)',
        mode: 'Sea Freight',
        container: '40 FT',
        cargo: 'Electronics',
        weightKg: 5000,
        volumeCbm: 12.0,
        originalPrice: companyQuote.price,
        currentPrice: companyQuote.price,
        priceFormatted: `₹${companyQuote.price.toLocaleString('en-IN')}`,
        currency: 'INR',
        transitDays: '28 Days',
        riskLevel: 'Medium',
        status: 'PENDING_COMPANY_VERIFICATION',
        assignedAgent: 'AGT-204',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      }
      storedQueue.unshift(newAgentReq)
      localStorage.setItem('m4AgentVerificationQueue', JSON.stringify(storedQueue))
    } catch {}

    showNotification(`Quote ${companyQuote.quoteId} (${companyQuote.companyName}) selected! Dispatched to ${companyQuote.companyName} agent desk for operational verification.`)
    navigate('/user/dashboard?tab=selected-quote')
  }

  // Workflow Step 4: Customer gives final approval after Company Agent and Customs Officer have both approved
  const handleConfirmBookingFromVerification = (quoteId) => {
    const bookingRef = 'BK-2026-10045'
    const updated = quotes.map(q => {
      if (q.id === quoteId || q.quoteId === quoteId || q.shipmentId === 'SHP-1001') {
        return {
          ...q,
          status: 'BOOKING_CONFIRMED',
          bookingReference: bookingRef,
          confirmedAt: 'Just now'
        }
      }
      return q
    })
    setQuotes(updated)
    localStorage.setItem('customerQuotes', JSON.stringify(updated))

    // Sync to M4 Agent Queue
    try {
      const agentQueue = JSON.parse(localStorage.getItem('m4AgentVerificationQueue') || '[]')
      const updatedAgentQueue = agentQueue.map(item => {
        if (item.quoteId === quoteId || item.shipmentId === 'SHP-1001') {
          return {
            ...item,
            status: 'BOOKING_CONFIRMED',
            bookingReference: bookingRef
          }
        }
        return item
      })
      localStorage.setItem('m4AgentVerificationQueue', JSON.stringify(updatedAgentQueue))
    } catch {}

    // Sync to allShipments so Cargo Ledger immediately updates to Booking Confirmed
    try {
      const storedShips = JSON.parse(localStorage.getItem('allShipments') || '[]')
      const updatedShips = storedShips.map(s => {
        if (s.quoteId === quoteId || s.id === quoteId || s.id === 'SHP-1001') {
          return {
            ...s,
            status: 'Booking Confirmed',
            bookingReference: bookingRef,
            customerApproved: true
          }
        }
        return s
      })
      localStorage.setItem('allShipments', JSON.stringify(updatedShips))
    } catch {}

    showNotification(`Booking CONFIRMED! Official Booking Reference: ${bookingRef}`)
  }

  const handleRejectFromVerification = (quoteId) => {
    const updated = quotes.map(q => {
      if (q.id === quoteId || q.quoteId === quoteId || q.shipmentId === 'SHP-1001') {
        return {
          ...q,
          status: 'CUSTOMER_REJECTED'
        }
      }
      return q
    })
    setQuotes(updated)
    localStorage.setItem('customerQuotes', JSON.stringify(updated))
    showNotification(`Quotation package declined. You can now re-select an alternate company quote.`)
  }


  // Scenario 11: Customer accesses another quote -> Access Denied
  const handleSimulateCrossQuoteAccess = () => {
    setUnauthorizedAttempt({
      quoteId: 'QT-EXT-99882',
      owner: 'Pacific Worldwide Logistics Ltd',
      reason: 'Cross-Tenant Access Policy: Shippers may only inspect quotes belonging to their registered corporate account.'
    })
  }

  // Dashboard KPI Cards matching Page 7: Total Shipments, Active Requests, Pending Quotes, Accepted Quotes, Recent Activity
  const totalShipments = quotes.length
  const activeRequests = quotes.filter(q => q.status === 'SUBMITTED' || q.status === 'PROCESSING' || q.status === 'PENDING_REVIEW' || q.status === 'SENT').length
  const pendingQuotes = quotes.filter(q => q.status === 'PENDING_REVIEW' || q.status === 'SENT').length
  const acceptedQuotesCount = quotes.filter(q => q.status === 'ACCEPTED').length
  const recentActivityText = `Quote ${quotes[0]?.id || 'SHP-1001'} status: ${quotes[0]?.status || 'SENT'}`

  const filteredQuotes = quotes.filter(q => {
    if (!searchQuery) return true
    const qStr = searchQuery.toLowerCase()
    return (
      q.id.toLowerCase().includes(qStr) ||
      (q.shipmentId && q.shipmentId.toLowerCase().includes(qStr)) ||
      q.origin.toLowerCase().includes(qStr) ||
      q.destination.toLowerCase().includes(qStr) ||
      q.cargo.toLowerCase().includes(qStr)
    )
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

          {/* Toast Alert */}
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Scenario 11 Access Denied Modal */}
          {unauthorizedAttempt && (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-mono font-bold uppercase inline-block mb-2">
                  Test Scenario 11 · Access Denied
                </span>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Access Restricted
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Attempted to access external quotation <strong className="text-rose-600">{unauthorizedAttempt.quoteId}</strong> belonging to <strong>{unauthorizedAttempt.owner}</strong>.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 mb-5">
                  <span className="font-bold block text-slate-800 mb-1">Enforced Security Check:</span>
                  {unauthorizedAttempt.reason}
                </div>
                <button
                  onClick={() => setUnauthorizedAttempt(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Close & Return to My Quotes
                </button>
              </div>
            </div>
          )}

          {/* Customer Portal Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 mb-3">
                <Shield className="w-3.5 h-3.5 text-blue-300" />
                <span>Customer Portal · ABC Electronics Pvt Ltd</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {userName}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
                Submit shipment requests, track AI/ML price calculations, inspect risk flags, and accept finalized freight quotations.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2.5">
              <Link
                to="/dashboard/new-shipment"
                className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Request Quote (5-Agent AI)</span>
              </Link>
              <Link
                to="/dashboard/shipments"
                className="px-4 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-all"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>My Shipments</span>
              </Link>
              <button
                onClick={handleSimulateCrossQuoteAccess}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Verify Scenario 11 security isolation"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Scenario 11</span>
              </button>
            </div>

            <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          </div>

          {/* Section 6 (Page 7) Required KPI Cards: Total Shipments, Active Requests, Pending Quotes, Accepted Quotes, Recent Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <DashboardCard
              title="TOTAL SHIPMENTS"
              value={totalShipments.toString()}
              change="All booked & quoting"
              isPositive={true}
              icon={Truck}
              color="blue"
            />
            <DashboardCard
              title="ACTIVE REQUESTS"
              value={activeRequests.toString()}
              change="In AI & Ops pipeline"
              isPositive={true}
              icon={Clock}
              color="indigo"
            />
            <DashboardCard
              title="PENDING QUOTES"
              value={pendingQuotes.toString()}
              change="Awaiting final decision"
              isPositive={true}
              icon={FileText}
              color="amber"
            />
            <DashboardCard
              title="ACCEPTED QUOTES"
              value={acceptedQuotesCount.toString()}
              change="Confirmed bookings"
              isPositive={true}
              icon={CheckCircle2}
              color="emerald"
            />
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                RECENT ACTIVITY
              </span>
              <div className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">
                {recentActivityText}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold mt-1">Updated 2m ago</span>
            </div>
          </div>

          {/* Tab Navigation / Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1.5 sm:pb-0 max-w-full shrink-0">
              <Link
                to="/user/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Dashboard Overview
              </Link>
              <Link
                to="/user/dashboard?tab=quotes"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'quotes' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                My Quotes ({quotes.length})
              </Link>
              <Link
                to="/user/dashboard?tab=compare-quotes"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'compare-quotes' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Compare Quotes
              </Link>
              <Link
                to="/user/dashboard?tab=selected-quote"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'selected-quote' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Selected Quote
              </Link>
              <Link
                to="/user/dashboard?tab=revision-review"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'revision-review' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                }`}
              >
                Revision Review
              </Link>
              <Link
                to="/user/dashboard?tab=bookings"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'bookings' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                Bookings
              </Link>
              <Link
                to="/user/dashboard?tab=documents"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'documents' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Documents
              </Link>
              <Link
                to="/user/dashboard?tab=notifications"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Notifications
              </Link>
              <Link
                to="/user/dashboard?tab=profile"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Profile
              </Link>
            </div>

            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quote ID, route..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Milestone 4 Alert Banner: Active Revision Review */}
          {quotes.some(q => q.status === 'REVISION_PENDING_CUSTOMER' && q.pendingRevision) && (
            <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-black uppercase tracking-wider">
                      Commercial Revision Pending
                    </span>
                    <span className="font-mono text-xs text-purple-300">SHP-1001 · GlobalSea Freight</span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1">
                    Company Agent Modified Commercial Terms: ₹80,000 ➔ ₹82,500
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Reason: <strong>"Fuel surcharge increase"</strong>. Your explicit approval is required to confirm booking.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => navigate('/user/dashboard?tab=revision-review')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Review & Respond</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Milestone 4 Alert Banner: Active Selection Under Agent Verification */}
          {quotes.some(q => q.status === 'PENDING_COMPANY_VERIFICATION') && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs">Quote Selection Dispatched to Company:</span>
                  <span className="text-xs text-slate-600 ml-1.5">
                    GlobalSea Freight authorized agent (AGT-204) is reviewing operational capacity and commercial checklist.
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/user/dashboard?tab=selected-quote')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer self-end sm:self-auto"
              >
                Track Live Status ➔
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: COMPARE QUOTES (MILESTONE 4) */}
          {/* ========================================================================= */}
          {activeTab === 'compare-quotes' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Compare Company Quotes (Milestone 4)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-provider AI quotes for <strong>SHP-1001 (Chennai ➔ Rotterdam · 5,000 KG Electronics)</strong>. Generated strictly from <strong>Eligible</strong> providers approved by Admin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(() => {
                  let rawCompanies = []
                  try {
                    const stored = localStorage.getItem('freightCompaniesList')
                    if (stored) rawCompanies = JSON.parse(stored)
                  } catch {}
                  
                  if (!rawCompanies || rawCompanies.length === 0) {
                    rawCompanies = [
                      { id: 'CMP-101', companyId: 'CMP-101', name: 'OceanLink Logistics', status: 'APPROVED', isEligible: true, rating: 4.9, quoteId: 'QT-5001', price: 85000, transit: '24 Days', risk: 'Low Risk', riskColor: 'bg-emerald-100 text-emerald-800', features: ['Direct Port Call', 'Terminal Handling Included', '7-Day Price Lock'] },
                      { id: 'CMP-102', companyId: 'CMP-102', name: 'GlobalSea Freight', status: 'APPROVED', isEligible: true, rating: 4.7, quoteId: 'QT-5002', price: 80000, transit: '28 Days', risk: 'Medium Risk', riskColor: 'bg-amber-100 text-amber-800', badge: 'Lowest Price', features: ['Economical Sea Loop', 'Free 14 Days Demurrage', 'Dedicated Agent AGT-204'] },
                      { id: 'CMP-103', companyId: 'CMP-103', name: 'FastRoute Cargo', status: 'APPROVED', isEligible: true, rating: 4.8, quoteId: 'QT-5003', price: 92000, transit: '20 Days', risk: 'Low Risk', riskColor: 'bg-emerald-100 text-emerald-800', badge: 'Fastest ETA', features: ['Express Priority Loop', 'GPS Cargo Tracking', 'Zero Port Transshipment'] }
                    ]
                  }

                  // Rule: Only Approved & Eligible companies appear in customer recommendations!
                  const eligibleList = rawCompanies
                    .filter(c => c.isEligible && (c.status === 'APPROVED' || c.status === 'Approved'))
                    .map((c, idx) => ({
                      quoteId: c.quoteId || `QT-500${idx + 1}`,
                      companyId: c.companyId || c.id || `CMP-10${idx + 1}`,
                      companyName: c.name,
                      price: c.price || (80000 + idx * 5000),
                      priceFormatted: `₹${(c.price || (80000 + idx * 5000)).toLocaleString('en-IN')}`,
                      transit: c.transit || `${24 + idx * 4} Days`,
                      risk: c.risk || (idx === 1 ? 'Medium Risk' : 'Low Risk'),
                      riskColor: c.riskColor || (idx === 1 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'),
                      rating: c.rating || 4.8,
                      badge: c.badge || (c.companyId === 'CMP-102' ? 'Lowest Price' : c.companyId === 'CMP-103' ? 'Fastest ETA' : undefined),
                      features: c.features || ['Verified Forwarder', 'Capacity Confirmed', 'SLA Guaranteed']
                    }))

                  if (eligibleList.length === 0) {
                    return (
                      <div className="col-span-3 p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-sm font-bold text-slate-600">No forwarders are currently marked as Eligible by Platform Admin.</p>
                        <p className="text-xs text-slate-400 mt-1">Please have Platform Admin verify & approve companies in the Admin Portal.</p>
                      </div>
                    )
                  }

                  return eligibleList.map(opt => (
                    <div key={opt.quoteId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:border-blue-300 transition-all space-y-4 relative">
                      {opt.badge && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                          {opt.badge}
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500">{opt.quoteId}</span>
                          <span className="text-[11px] font-bold text-amber-500">★ {opt.rating}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900">{opt.companyName}</h4>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold block">ID: {opt.companyId}</span>
                        
                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Commercial Price</span>
                          <span className="text-2xl font-black text-slate-900 font-mono">{opt.priceFormatted}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500">Estimated Transit:</span>
                          <strong className="text-slate-800">{opt.transit}</strong>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">AI Risk Context:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${opt.riskColor}`}>
                            {opt.risk}
                          </span>
                        </div>

                        <ul className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
                          {opt.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleSelectMultiCompanyQuote({
                          id: 'QT-5002',
                          quoteId: opt.quoteId,
                          shipmentId: 'SHP-1001',
                          companyId: opt.companyId,
                          companyName: opt.companyName,
                          price: opt.price
                        })}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Select {opt.companyName}</span>
                      </button>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SELECTED QUOTE & VERIFICATION TRACKER (MILESTONE 4) */}
          {/* ========================================================================= */}
          {activeTab === 'selected-quote' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Selected Quote Verification Tracker
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black font-mono">
                    GlobalSea Freight · QT-5002
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tracks end-to-end lifecycle from customer quote selection to authorized agent verification and final booking.
                </p>
              </div>

              {/* 5-Stage Visual Workflow Stepper (PDF Section 11) */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  M4 Verification Stepper:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  {[
                    { step: 1, title: 'Quote Options', status: 'Completed', detail: 'AI generated 3 options' },
                    { step: 2, title: 'Quote Selected', status: 'Completed', detail: 'Selected QT-5002 (₹80,000)' },
                    { step: 3, title: 'Company Verification', status: 'In Progress', detail: 'Agent AGT-204 reviewing checklist' },
                    { step: 4, title: 'Revision / Approval', status: 'Next', detail: 'Commercial terms confirmation' },
                    { step: 5, title: 'Confirmed Booking', status: 'Pending', detail: 'Final BK-2026-XXXXX generation' }
                  ].map(s => (
                    <div key={s.step} className={`p-3 rounded-xl border ${
                      s.status === 'Completed' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                      s.status === 'In Progress' ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-500/20' :
                      'bg-white border-slate-200 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-black text-[10px]">STAGE {s.step}</span>
                        <span className={`text-[10px] font-bold ${s.status === 'Completed' ? 'text-emerald-700' : s.status === 'In Progress' ? 'text-blue-700' : 'text-slate-400'}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="font-bold text-xs">{s.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{s.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Snapshot Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">Preserved Quote Snapshot</h5>
                  <div className="flex justify-between text-slate-600">
                    <span>Selected Quote Number:</span>
                    <strong className="font-mono text-slate-900">QT-5002</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Freight Provider:</span>
                    <strong className="text-slate-900">GlobalSea Freight (CMP-102)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Origin / Destination:</span>
                    <strong className="text-slate-900">Chennai (INMAA) ➔ Rotterdam (NLRTM)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cargo & Container:</span>
                    <strong className="text-slate-900">5,000 KG Electronics · 40 FT</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Locked Customer Price:</span>
                    <strong className="font-mono text-blue-700 font-black">₹80,000</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">Company Assignment</h5>
                  <div className="flex justify-between text-slate-600">
                    <span>Assigned Agent:</span>
                    <strong className="text-slate-900">AGT-204 (Sarah Jenkins)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Current Workflow Status:</span>
                    {(() => {
                      const cur = quotes.find(q => q.shipmentId === 'SHP-1001' || q.id === 'QT-5002') || {}
                      const st = cur.status || 'PENDING_COMPANY_VERIFICATION'
                      const color = 
                        st === 'BOOKING_CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        st === 'VERIFIED_PENDING_CUSTOMER' ? 'bg-indigo-100 text-indigo-800' :
                        st === 'PENDING_CUSTOMS_APPROVAL' ? 'bg-purple-100 text-purple-800' :
                        st === 'REJECTED' || st === 'CUSTOMER_REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      return (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${color}`}>
                          {st}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Isolation Policy:</span>
                    <strong className="text-emerald-700">Restricted to GlobalSea Desk</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Response Time:</span>
                    <strong className="text-slate-900">Within 2 Hours (SLA Active)</strong>
                  </div>
                </div>
              </div>

              {/* Customer Final Confirmation Action Card (When Company Agent & Customs Officer have both approved) */}
              {(() => {
                const cur = quotes.find(q => q.shipmentId === 'SHP-1001' || q.id === 'QT-5002') || {}
                const st = cur.status || 'PENDING_COMPANY_VERIFICATION'

                if (st === 'VERIFIED_PENDING_CUSTOMER') {
                  return (
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-emerald-50 to-blue-50 border-2 border-indigo-300 space-y-4 shadow-sm animate-fadeIn">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                            ACTION REQUIRED BY SHIPPER
                          </span>
                          <h4 className="text-base font-black text-slate-900">
                            Shipment Fully Verified & Cleared — Confirm Final Booking
                          </h4>
                          <p className="text-xs text-slate-600">
                            Both the selected carrier agent and statutory customs officer have reviewed and approved your shipment parameters.
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Confirmed Amount</span>
                          <span className="text-2xl font-black text-slate-900 font-mono">₹80,000</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                        <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">1. Company Agent Operational Check</div>
                            <div className="text-[11px] text-slate-500">Approved by Sarah Jenkins (AGT-204 · GlobalSea)</div>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">2. Statutory Customs Clearance</div>
                            <div className="text-[11px] text-slate-500">Regulatory Clearance Granted ({cur.customsClearanceId || 'CUS-2026-89412'})</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-indigo-200/60">
                        <button
                          onClick={() => handleRejectFromVerification('QT-5002')}
                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Reject / Reselect Another Quote
                        </button>
                        <button
                          onClick={() => handleConfirmBookingFromVerification('QT-5002')}
                          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Confirm Final Booking</span>
                        </button>
                      </div>
                    </div>
                  )
                }

                if (st === 'BOOKING_CONFIRMED') {
                  return (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <h4 className="text-base font-black text-emerald-950">
                          Booking Confirmed — Reference: {cur.bookingReference || 'BK-2026-10045'}
                        </h4>
                      </div>
                      <p className="text-xs text-emerald-800">
                        Your container allocation has been locked with <strong>GlobalSea Freight (CMP-102)</strong>. Commercial invoice and customs clearance documentation have been linked to this booking reference.
                      </p>
                    </div>
                  )
                }

                if (st === 'PENDING_CUSTOMS_APPROVAL') {
                  return (
                    <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-purple-600" />
                        <h5 className="font-bold text-xs text-purple-950">Step 3 of 4: In Review by Statutory Customs Officer</h5>
                      </div>
                      <p className="text-xs text-purple-800">
                        GlobalSea agent has completed operational verification. Customs Officer (Officer R. Verma) is currently validating ICEGATE electronic shipping bill and HS 8504 documentation.
                      </p>
                    </div>
                  )
                }

                return null
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: REVISION REVIEW MODAL / DESK (MILESTONE 4) */}
          {/* ========================================================================= */}
          {activeTab === 'revision-review' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Review Commercial Terms Revision
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  The authorized company agent has updated terms for your selected quotation. Review the modifications and confirm or re-select.
                </p>
              </div>

              {/* Price Delta Card */}
              <div className="p-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 border border-purple-200 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ORIGINAL SELECTION</span>
                    <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">₹80,000</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">28 Days Transit</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-purple-200 ring-2 ring-purple-500/20">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">REVISED PRICE</span>
                    <span className="text-2xl font-black text-purple-700 font-mono mt-1 block">₹82,500</span>
                    <span className="text-[10px] text-purple-600 font-bold mt-0.5 block">+₹2,500 Adjustment</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AUTHORIZED AGENT</span>
                    <span className="text-base font-black text-slate-900 mt-2 block">Sarah Jenkins</span>
                    <span className="text-[10px] font-mono text-slate-500 block">AGT-204 · GlobalSea</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-purple-100 text-xs text-slate-700 space-y-1">
                  <strong className="text-purple-900 text-xs">Agent Stated Reason for Revision:</strong>
                  <p className="text-slate-800 font-medium">
                    "Fuel surcharge increase due to BAF adjustment for Rotterdam corridor departures during peak season."
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleRejectRevision('QT-5002')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Decline Revision & Re-Select Quote
                </button>
                <button
                  onClick={() => handleAcceptRevision('QT-5002')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Revised Quote (₹82,500) & Confirm Booking</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: BOOKINGS MANAGEMENT (MILESTONE 4) */}
          {/* ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Confirmed Bookings & Operational Manifests
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-world bookings confirmed by authorized freight company agents.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    bookingRef: 'BK-2026-10045',
                    shipmentId: 'SHP-1001',
                    quoteId: 'QT-5002',
                    company: 'GlobalSea Freight',
                    route: 'Chennai, India (INMAA) ➔ Rotterdam, Netherlands (NLRTM)',
                    cargo: 'Electronics (5,000 KG · 40 FT Container)',
                    price: '₹82,500',
                    confirmedDate: 'Today',
                    status: 'BOOKING_CONFIRMED',
                    agent: 'AGT-204 (Sarah Jenkins)'
                  },
                  {
                    bookingRef: 'BK-2026-00930',
                    shipmentId: 'SHP-1002',
                    quoteId: 'QT-2026-00930',
                    company: 'MSC Mediterranean Shipping',
                    route: 'Nhava Sheva (INNSA) ➔ Jebel Ali (AEJEA)',
                    cargo: 'Telecom Switchgear (18,400 KG · 40HC)',
                    price: '₹3,84,500',
                    confirmedDate: 'Aug 22, 2026',
                    status: 'BOOKING_CONFIRMED',
                    agent: 'AGT-108 (Mark Foster)'
                  }
                ].map(bk => (
                  <div key={bk.bookingRef} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                          {bk.bookingRef}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-xs text-slate-600 font-bold">{bk.shipmentId}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-bold text-xs text-slate-900">{bk.company}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">{bk.route}</div>
                      <div className="text-[11px] text-slate-500">
                        {bk.cargo} · Confirmed on {bk.confirmedDate} by {bk.agent}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Locked Price</span>
                        <span className="font-mono font-black text-base text-slate-900">{bk.price}</span>
                      </div>

                      <button
                        onClick={() => downloadQuotePDF({
                          id: bk.bookingRef,
                          shipmentId: bk.shipmentId,
                          customer: 'ABC Electronics Pvt Ltd',
                          origin: bk.route.split('➔')[0].trim(),
                          destination: bk.route.split('➔')[1]?.trim() || 'Rotterdam',
                          mode: 'Sea Freight',
                          sellPrice: bk.price,
                          transitDays: '28 Days',
                          status: 'BOOKING_CONFIRMED'
                        })}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Download Voucher</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Documents Tab (Upload & Verification Desk) */}
          {activeTab === 'documents' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Corporate Shipping & Trade Documents</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Upload mandatory compliance documents for customs verification & port clearance.</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL DOCUMENTS</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{documents.length} Files</span>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">CUSTOMS VERIFIED</span>
                  <span className="text-xl font-black text-emerald-700 mt-1 block">
                    {documents.filter(d => d.verified).length} Approved
                  </span>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">PENDING REVIEW</span>
                  <span className="text-xl font-black text-amber-700 mt-1 block">
                    {documents.filter(d => !d.verified).length} In Queue
                  </span>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">ICEGATE SYNC</span>
                  <span className="text-xl font-black text-blue-700 mt-1 block">ACTIVE</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Document Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Shipment Ref</th>
                      <th className="px-4 py-3">Format / Size</th>
                      <th className="px-4 py-3">Date Added</th>
                      <th className="px-4 py-3">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {documents.map((doc, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">{doc.type}</td>
                        <td className="px-4 py-3.5 font-mono text-indigo-600 font-bold">{doc.shipmentId || 'SHP-1001'}</td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono">{doc.format}</td>
                        <td className="px-4 py-3.5 text-slate-500">{doc.date}</td>
                        <td className="px-4 py-3.5">
                          {doc.verified ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Under Review
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Commercial Shipper Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Corporate business entity registration, GSTIN, and international trade identifier.</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
                  Verified Corporate Shipper
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Company Entity</span>
                  <div className="text-sm font-black text-slate-900">ABC Electronics Pvt Ltd</div>
                  <span className="text-xs text-slate-500">Authorized Exporter · Tech Hardware</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Contact</span>
                  <div className="text-sm font-black text-slate-900">{userName}</div>
                  <span className="text-xs text-slate-500">{userEmail}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Import-Export Code (IEC)</span>
                  <div className="text-sm font-black font-mono text-slate-900">0392019481</div>
                  <span className="text-xs text-emerald-600 font-semibold">DGFT Active Clearance</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Port of Origin</span>
                  <div className="text-sm font-black text-slate-900">Chennai Port (INMAA) & Nhava Sheva (INNSA)</div>
                  <span className="text-xs text-slate-500">Container Gate Pass Registered</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-1">Intelligence & Review Feed</h3>
              <p className="text-xs text-slate-500 mb-5">Live audit trail from AI Orchestrator and Freight Agent operations.</p>
              <div className="space-y-3">
                {[
                  { title: 'Freight Agent Approved Quote QT-2026-1001', desc: 'Commercial discount applied. Final quote dispatched to client desk.', time: '10m ago', type: 'quote' },
                  { title: 'Risk Intelligence M3 Passed', desc: 'Weather: 30/100 (Moderate), Customs: 40/100 (Medium), Route: 20/100 (Low).', time: '25m ago', type: 'risk' },
                  { title: 'AI Pricing Engine M2 Predicted ₹85,500', desc: 'Historical regression against 28,490 spot records. Recommended: ₹86,000.', time: '32m ago', type: 'pricing' }
                ].map((n, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{n.title}</span>
                      <span className="text-[11px] text-slate-500">{n.desc}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Quotations List (Page 9 Test Shipment SHP-1001 Featured) */}
          {(activeTab === 'overview' || activeTab === 'quotes') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Active Freight Quotations & Decision Desk
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inspect AI pricing breakdowns, composite risk scores, and accept or reject quotes (Page 4 Step 12).
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {filteredQuotes.length} Quotes Loaded
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredQuotes.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">No Quotations Found</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        No quotations registered under <strong>{userEmail}</strong> yet. You can calculate instant market rates or submit a detailed 5-agent shipment request.
                      </p>
                    </div>
                    <Link
                      to="/dashboard/new-shipment"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Request Quote (5-Agent AI)</span>
                    </Link>
                  </div>
                ) : (
                  filteredQuotes.map((q) => {
                  const isAccepted = q.status === 'ACCEPTED'
                  const isRejected = q.status === 'REJECTED'
                  const isAgentApproved = Boolean(q.agentApproved)
                  const isCustomsApproved = Boolean(q.customsApproved)
                  const isFullyApproved = (isAgentApproved && isCustomsApproved) || q.status === 'SENT'
                  const isCustomsPending = q.status === 'PENDING_CUSTOMS_APPROVAL' || (isAgentApproved && !isCustomsApproved && !isAccepted && !isRejected)
                  const isPendingAgent = (!isAgentApproved && !isAccepted && !isRejected) || q.status === 'PENDING_REVIEW'

                  return (
                    <div
                      key={q.id}
                      className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition-all ${
                        q.shipmentId === 'SHP-1001' ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200'
                      }`}
                    >
                      {/* Quote Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs border border-blue-100">
                            {q.mode === 'Air' ? <Plane className="w-5 h-5" /> : <Anchor className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900">{q.id}</span>
                              {q.shipmentId && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-black font-mono">
                                  {q.shipmentId}
                                </span>
                              )}
                              {q.shipmentId === 'SHP-1001' && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold">
                                  Page 9 Test Shipment
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {q.customer} · {q.carrier}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                            isAccepted 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isFullyApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                              : isCustomsPending
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isAccepted ? 'ACCEPTED' : isRejected ? 'DECLINED' : isFullyApproved ? 'APPROVED & READY' : isCustomsPending ? 'IN CUSTOMS REVIEW' : 'PENDING AGENT REVIEW'}
                          </span>
                        </div>
                      </div>

                      {/* Route & Cargo Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROUTE CORRIDOR</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.origin}</span>
                          <span className="text-slate-500 text-[11px]">→ {q.destination}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CARGO SPECIFICATION</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.cargo}</span>
                          <span className="text-slate-500 text-[11px]">{q.container} · {q.mode} Freight</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DISTANCE & TRANSIT</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.distanceKm ? `${q.distanceKm.toLocaleString()} KM` : '8,950 KM'}</span>
                          <span className="text-slate-500 text-[11px]">{q.transitDays}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FINAL PRICE</span>
                          <span className="text-lg font-black text-slate-900 block mt-0.5">{q.sellPrice}</span>
                          <span className="text-slate-400 text-[10px]">Valid until: {q.validUntil}</span>
                        </div>
                      </div>

                      {/* AI Intelligence Layer (Page 9 Results) */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Rule-Based Price (M1)</span>
                          <span className="font-mono font-bold text-slate-700">₹{q.rulePrice ? q.rulePrice.toLocaleString() : '87,000'}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">AI ML Predicted (M2)</span>
                          <span className="font-mono font-bold text-indigo-600">₹{q.aiPrice ? q.aiPrice.toLocaleString() : '85,500'}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Recommended Rate</span>
                          <span className="font-mono font-bold text-emerald-600">₹{q.recommendedPrice ? q.recommendedPrice.toLocaleString() : '86,000'}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Composite Risk (M3)</span>
                          <span className={`font-bold font-mono ${
                            q.compositeRisk === 'HIGH' ? 'text-rose-600' : q.compositeRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {q.compositeRisk} · {q.weatherRisk}
                          </span>
                        </div>
                      </div>

                      {/* Two-Stage Approval Progress Tracker */}
                      <div className="my-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          <span>Approval Workflow:</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Stage 1: Freight Agent */}
                          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            isAgentApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            {isAgentApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                            <span>1. Freight Agent: {isAgentApproved ? 'Approved' : 'Pending'}</span>
                          </div>

                          <span className="text-slate-300 font-bold">➔</span>

                          {/* Stage 2: Customs Officer */}
                          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            isCustomsApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                              : isAgentApproved
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 animate-pulse'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {isCustomsApproved ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : isAgentApproved ? (
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>2. Customs Officer: {isCustomsApproved ? 'Approved' : isAgentApproved ? 'In Review' : 'Awaiting Agent'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Actions (Accept / Decline & PDF Download Gated by Dual Approvals) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          {isAccepted && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Quote accepted by client. Commercial booking confirmed.
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <X className="w-3.5 h-3.5" /> Quote declined by client. Lifecycle marked closed.
                            </span>
                          )}
                          {isFullyApproved && !isAccepted && !isRejected && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fully approved by Freight Agent and Customs Officer. Ready for client acceptance.
                            </span>
                          )}
                          {isCustomsPending && (
                            <span className="text-indigo-700 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Freight Agent approved. Awaiting Customs Officer regulatory clearance before quote acceptance and PDF are visible.
                            </span>
                          )}
                          {isPendingAgent && (
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> Awaiting Freight Agent review. Quote and PDF will unlock after Freight Agent and Customs Officer approval.
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* VIEW ROUTE & RECOMMENDATION DETAILS */}
                          <Link
                            to={`/quotes/${q.id}`}
                            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                            title="View Route Recommendations & Corridor Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                            <span>View Route Details</span>
                          </Link>

                          {/* ACCEPT & DECLINE: ONLY VISIBLE AFTER BOTH AGENT AND CUSTOMS OFFICER APPROVE */}
                          {isFullyApproved && !isAccepted && !isRejected && (
                            <>
                              <button
                                onClick={() => handleAcceptQuote(q.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept Quote</span>
                              </button>
                              <button
                                onClick={() => handleRejectQuote(q.id)}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                              >
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {/* PDF BUTTON: ONLY VISIBLE AFTER BOTH AGENT AND CUSTOMS OFFICER APPROVE (OR ACCEPTED) */}
                          {(isFullyApproved || isAccepted) && (
                            <button
                              onClick={() => downloadQuotePDF(q)}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          )}

                          {/* IF NOT APPROVED BY BOTH, SHOW LOCKED PLACEHOLDER */}
                          {!isFullyApproved && !isAccepted && !isRejected && (
                            <div
                              className="px-3 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 select-none"
                              title="Accept Quote and Quotation PDF will be available once Freight Agent and Customs Officer approve"
                            >
                              <FolderLock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Actions & PDF Locked (Pending Approvals)</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )
                }))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD SHIPPING DOCUMENT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">Upload Shipping Document</h3>
                </div>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!uploadForm.fileName) {
                    alert('Please select a file to upload.')
                    return
                  }
                  setIsUploading(true)
                  setUploadProgress(25)
                  setTimeout(() => setUploadProgress(65), 400)
                  setTimeout(() => setUploadProgress(100), 800)
                  setTimeout(() => {
                    const newDoc = {
                      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
                      name: uploadForm.fileName,
                      type: uploadForm.docType,
                      format: uploadForm.fileSize || 'PDF · 1.2 MB',
                      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                      shipmentId: uploadForm.shipmentRef,
                      verified: false
                    }
                    const updated = [newDoc, ...documents]
                    setDocuments(updated)
                    localStorage.setItem('customerDocuments', JSON.stringify(updated))
                    setIsUploading(false)
                    setIsUploadModalOpen(false)
                    setUploadProgress(0)
                    showNotification(`Document "${newDoc.name}" uploaded successfully! Forwarded to Customs Officer Desk.`)
                  }, 1100)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Category</label>
                  <select
                    value={uploadForm.docType}
                    onChange={e => setUploadForm({ ...uploadForm, docType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Commercial Invoice">Commercial Invoice (Signed & Stamped)</option>
                    <option value="Packing List">Packing List (Gross Weight Breakdown)</option>
                    <option value="Certificate of Origin">Certificate of Origin (Form AIFTA/Preferential)</option>
                    <option value="Bill of Lading">Sea Waybill / Master Bill of Lading (MBL)</option>
                    <option value="Dangerous Goods MSDS">HazMat Material Safety Data Sheet (MSDS)</option>
                    <option value="Fumigation Certificate">Fumigation / Phytosanitary Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Associated Shipment / Quote</label>
                  <select
                    value={uploadForm.shipmentRef}
                    onChange={e => setUploadForm({ ...uploadForm, shipmentRef: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {quotes.map(q => (
                      <option key={q.id} value={q.shipmentId || q.id}>
                        {q.shipmentId || q.id} — {q.origin} ➔ {q.destination}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select File (PDF, PNG, JPG)</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50">
                    <input
                      type="file"
                      id="docFileInput"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                          const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF'
                          setUploadForm(prev => ({
                            ...prev,
                            fileName: file.name,
                            fileSize: `${ext} · ${sizeStr}`
                          }))
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="docFileInput" className="cursor-pointer">
                      <FileCheck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-700 block">
                        {uploadForm.fileName ? uploadForm.fileName : 'Click to choose document file'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {uploadForm.fileSize ? uploadForm.fileSize : 'Maximum file size: 15 MB (PDF, JPG, PNG)'}
                      </span>
                    </label>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-blue-600">
                      <span>Uploading to ICEGATE Compliance Gateway...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={isUploading}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadForm.fileName}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow"
                  >
                    {isUploading ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
