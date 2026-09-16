import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, 
  Truck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Send, 
  Edit3, 
  X, 
  Check, 
  Eye, 
  FileSearch, 
  Bell, 
  User, 
  Filter, 
  Search, 
  Layers, 
  Percent, 
  Sparkles,
  Scale,
  Calendar,
  Download,
  Building2,
  HelpCircle,
  XCircle,
  FileCheck,
  RotateCcw,
  CheckSquare,
  Square,
  ShieldAlert
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import { downloadQuotePDF } from '../utils/exportUtils'
import { API_BASE_URL } from '../config/api'

// Initial test dataset for M4 Company Agent (Page 14 scenario SHP-1001 + company selections)
const INITIAL_AGENT_REQUESTS = [
  {
    id: 'SEL-2026-1001',
    selectionId: 'SEL-2026-1001',
    quoteId: 'QT-5002',
    shipmentId: 'SHP-1001',
    customer: 'ABC Electronics Pvt Ltd',
    customerEmail: 'customer@apexgl.com',
    companyId: 'CMP-102',
    companyName: 'GlobalSea Freight',
    origin: 'Chennai, India (INMAA)',
    destination: 'Rotterdam, Netherlands (NLRTM)',
    mode: 'Sea Freight',
    container: '40 FT',
    cargo: 'Electronics',
    weightKg: 5000,
    volumeCbm: 12.0,
    originalPrice: 80000,
    currentPrice: 80000,
    priceFormatted: '₹80,000',
    currency: 'INR',
    transitDays: '28 Days',
    riskLevel: 'Medium',
    status: 'PENDING_COMPANY_VERIFICATION', // Waiting for AGT-204 verification
    assignedAgent: 'AGT-204',
    date: 'Sep 08, 2026',
    checklist: {
      shipment: true,
      cargo: true,
      capacity: true,
      route: true,
      schedule: true,
      documents: true,
      commercial: true,
      risk_context: true,
      quote_validity: true
    },
    documents: [
      { name: 'Commercial_Invoice_SHP1001.pdf', type: 'Invoice', status: 'Verified', size: '240 KB' },
      { name: 'Packing_List_SHP1001.pdf', type: 'Packing List', status: 'Verified', size: '185 KB' },
      { name: 'Customs_EDI_Declaration.pdf', type: 'Customs', status: 'Pending Review', size: '410 KB' }
    ],
    revisions: [],
    bookingReference: null
  },
  {
    id: 'SEL-2026-1002',
    selectionId: 'SEL-2026-1002',
    quoteId: 'QT-5005',
    shipmentId: 'SHP-1002',
    customer: 'Zenith Chemical Corp',
    customerEmail: 'ops@zenithchem.com',
    companyId: 'CMP-102',
    companyName: 'GlobalSea Freight',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Jebel Ali (AEJEA)',
    mode: 'Sea Freight',
    container: '20 FT General',
    cargo: 'Industrial Solvents (Class 3 HazMat)',
    weightKg: 8500,
    volumeCbm: 15.0,
    originalPrice: 65000,
    currentPrice: 65000,
    priceFormatted: '₹65,000',
    currency: 'INR',
    transitDays: '7 Days',
    riskLevel: 'Low',
    status: 'BOOKING_CONFIRMED',
    assignedAgent: 'AGT-204',
    date: 'Sep 07, 2026',
    checklist: {
      shipment: true,
      cargo: true,
      capacity: true,
      route: true,
      schedule: true,
      documents: true,
      commercial: true,
      risk_context: true,
      quote_validity: true
    },
    documents: [
      { name: 'MSDS_Chemical_Safety_Data.pdf', type: 'HazMat Spec', status: 'Verified', size: '520 KB' }
    ],
    revisions: [],
    bookingReference: 'BK-2026-10042'
  },
  {
    id: 'SEL-2026-1003',
    selectionId: 'SEL-2026-1003',
    quoteId: 'QT-5008',
    shipmentId: 'SHP-1004',
    customer: 'Nordic Imports AB',
    customerEmail: 'contact@nordicimp.se',
    companyId: 'CMP-102',
    companyName: 'GlobalSea Freight',
    origin: 'Chennai (INMAA)',
    destination: 'Antwerp (BEANR)',
    mode: 'Sea Freight',
    container: '40 HC',
    cargo: 'Machinery Components',
    weightKg: 12000,
    volumeCbm: 24.0,
    originalPrice: 110000,
    currentPrice: 110000,
    priceFormatted: '₹1,10,000',
    currency: 'INR',
    transitDays: '26 Days',
    riskLevel: 'Low',
    status: 'UNDER_VERIFICATION',
    assignedAgent: 'AGT-204',
    date: 'Sep 08, 2026',
    checklist: {
      shipment: true,
      cargo: true,
      capacity: false,
      route: true,
      schedule: true,
      documents: true,
      commercial: true,
      risk_context: true,
      quote_validity: true
    },
    documents: [
      { name: 'Bill_Of_Lading_Draft.pdf', type: 'Draft BL', status: 'Pending Review', size: '190 KB' }
    ],
    revisions: [],
    bookingReference: null
  }
]

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'New Quote Selection Dispatched', desc: 'Customer ABC Electronics selected QT-5002. Immediate verification required.', time: '5m ago', read: false },
  { id: 2, title: 'Customer Accepted Revision', desc: 'Zenith Chemical accepted revised price ₹65,000. Booking BK-2026-10042 confirmed.', time: '1h ago', read: true },
  { id: 3, title: 'SLA Warning: Capacity Verification', desc: 'SHP-1004 Antwerp corridor vessel space confirmation due in 2 hours.', time: '3h ago', read: true }
]

export default function AgentOperationsDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const rawTab = searchParams.get('tab') || 'dashboard'

  // Tab Aliases to ensure 100% compatibility with Sidebar navigation
  const tabAliases = {
    'overview': 'dashboard',
    'incoming-requests': 'incoming',
    'pending-verification': 'pending',
    'quote-verification': 'verification',
    'booking-management': 'bookings'
  }
  const activeTab = tabAliases[rawTab] || rawTab

  // Agent Context
  const [agentCompany, setAgentCompany] = useState(() => {
    return {
      companyId: localStorage.getItem('agentCompanyId') || 'CMP-102',
      name: localStorage.getItem('agentCompanyName') || 'GlobalSea Freight',
      agentCode: localStorage.getItem('agentCode') || 'AGT-204'
    }
  })

  const [userName, setUserName] = useState('Sarah Jenkins')

  const [requests, setRequests] = useState(() => {
    let combined = [...INITIAL_AGENT_REQUESTS]
    try {
      const stored = localStorage.getItem('m4AgentVerificationQueue')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          combined = parsed
        }
      }
    } catch {}

    // Synchronize and merge shipment requests from companyShipmentRequests
    try {
      const storedComp = localStorage.getItem('companyShipmentRequests')
      if (storedComp) {
        const parsedComp = JSON.parse(storedComp)
        if (Array.isArray(parsedComp)) {
          parsedComp.forEach(cs => {
            const exists = combined.some(r => r.id === cs.id || r.shipmentId === cs.id || (cs.quoteId && r.quoteId === cs.quoteId))
            if (!exists) {
              combined.unshift({
                id: cs.id,
                selectionId: cs.id,
                quoteId: cs.quoteId || cs.id,
                shipmentId: cs.id,
                customer: cs.customer || cs.customerName || 'Shipper Customer',
                customerEmail: cs.customerEmail || cs.email || 'customer@freightiq.com',
                companyId: cs.companyId || 'CMP-102',
                companyName: cs.companyName || 'GlobalSea Freight',
                origin: cs.origin || 'Chennai (INMAA)',
                destination: cs.destination || 'Singapore (SGSIN)',
                mode: cs.mode || 'Sea Freight',
                container: cs.containerType || '40 FT',
                cargo: cs.cargo || 'General Commercial Cargo',
                weightKg: parseFloat(String(cs.weight || '').replace(/[^0-9.]/g, '')) || 36800,
                volumeCbm: 20.0,
                originalPrice: cs.offeredRate || 80000,
                currentPrice: cs.offeredRate || 80000,
                priceFormatted: `₹${(cs.offeredRate || 80000).toLocaleString('en-IN')}`,
                currency: 'INR',
                transitDays: '28 Days',
                riskLevel: 'Low',
                status: cs.status || 'PENDING_COMPANY_VERIFICATION',
                assignedAgent: cs.assignedAgent || 'AGT-204',
                date: cs.date || 'Sep 11, 2026',
                checklist: {
                  shipment: true,
                  cargo: true,
                  capacity: true,
                  route: true,
                  schedule: true,
                  documents: true,
                  commercial: true,
                  risk_context: true,
                  quote_validity: true
                },
                documents: [
                  { name: `Commercial_Invoice_${cs.id}.pdf`, type: 'Invoice', status: 'Verified', size: '240 KB' },
                  { name: `Packing_List_${cs.id}.pdf`, type: 'Packing List', status: 'Verified', size: '185 KB' }
                ],
                revisions: [],
                bookingReference: null
              })
            }
          })
        }
      }
    } catch (e) {
      console.warn('Error merging company shipment requests:', e)
    }

    return combined
  })

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [selectedReq, setSelectedReq] = useState(null)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Verification Checklist State
  const [checklistState, setChecklistState] = useState({
    shipment: true,
    cargo: true,
    capacity: true,
    route: true,
    schedule: true,
    documents: true,
    commercial: true,
    risk_context: true,
    quote_validity: true
  })

  // Modification Form State (Scenario: 80,000 -> 82,500 due to Fuel surcharge increase)
  const [modifyForm, setModifyForm] = useState({
    newPrice: 82500,
    newEtaDays: 28,
    reason: 'Fuel surcharge increase'
  })

  // Reject Form State
  const [rejectReason, setRejectReason] = useState('Vessel space fully allocated for selected departure window.')

  // Request Info Form State
  const [requestInfoNotes, setRequestInfoNotes] = useState('Clear copy of commercial invoice and HS Code 8542 declaration required.')

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'Sarah Jenkins'
    setUserName(storedName)
  }, [])

  useEffect(() => {
    localStorage.setItem('m4AgentVerificationQueue', JSON.stringify(requests))
  }, [requests])

  // Automatically inspect request when navigated with ?id= or ?shipmentId=
  useEffect(() => {
    const targetId = searchParams.get('id') || searchParams.get('shipmentId')
    if (targetId && requests.length > 0) {
      const match = requests.find(r => r.id === targetId || r.shipmentId === targetId || r.quoteId === targetId)
      if (match) {
        setSelectedReq(match)
        setIsVerifyModalOpen(true)
      }
    }
  }, [location.search, requests])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 5000)
  }

  // Flexible Company Data Matching: Match company ID or company brand name
  const isolatedRequests = requests.filter(r => {
    if (!agentCompany?.companyId) return true
    const agentCompId = agentCompany.companyId.toLowerCase().trim()
    const rCompId = (r.companyId || '').toLowerCase().trim()
    if (agentCompId === rCompId) return true
    if (r.companyName && agentCompany.name && r.companyName.toLowerCase().includes('globalsea') && agentCompany.name.toLowerCase().includes('globalsea')) return true
    if (!r.companyId) return true
    return false
  })

  // Helper to check if request is in pending verification / incoming stage
  const isIncomingStatus = (status) => {
    const s = (status || '').toUpperCase()
    return s === 'PENDING_COMPANY_VERIFICATION' || s === 'PENDING_VERIFICATION' || s === 'UNDER_VERIFICATION' || s === 'NEW' || s === 'SUBMITTED' || s === 'PENDING'
  }

  // KPI calculations
  const newRequestsCount = isolatedRequests.filter(r => isIncomingStatus(r.status)).length
  const pendingVerificationCount = isolatedRequests.filter(r => isIncomingStatus(r.status)).length
  const approvedTodayCount = isolatedRequests.filter(r => r.status === 'BOOKING_CONFIRMED' || r.status === 'APPROVED' || r.status === 'PENDING_CUSTOMS_APPROVAL' || r.status === 'VERIFIED_PENDING_CUSTOMER').length
  const rejectedCount = isolatedRequests.filter(r => r.status === 'REJECTED').length

  // Filtered requests by tab and search
  const getTabRequests = () => {
    let list = isolatedRequests
    if (activeTab === 'incoming' || activeTab === 'pending' || activeTab === 'verification') {
      list = isolatedRequests.filter(r => isIncomingStatus(r.status))
    } else if (activeTab === 'shipment-requests') {
      list = isolatedRequests
    } else if (activeTab === 'approved') {
      list = isolatedRequests.filter(r => r.status === 'PENDING_CUSTOMS_APPROVAL' || r.status === 'VERIFIED_PENDING_CUSTOMER' || r.status === 'BOOKING_CONFIRMED' || r.status === 'APPROVED')
    } else if (activeTab === 'rejected') {
      list = isolatedRequests.filter(r => r.status === 'REJECTED')
    } else if (activeTab === 'bookings') {
      list = isolatedRequests.filter(r => r.status === 'BOOKING_CONFIRMED')
    }

    if (!searchQuery) return list
    const q = searchQuery.toLowerCase()
    return list.filter(r => 
      r.shipmentId?.toLowerCase().includes(q) ||
      r.customer?.toLowerCase().includes(q) ||
      r.origin?.toLowerCase().includes(q) ||
      r.destination?.toLowerCase().includes(q) ||
      r.quoteId?.toLowerCase().includes(q)
    )
  }

  const currentList = getTabRequests()

  // ACTION: APPROVE -> Forward to Customs Officer (Workflow Step 3)
  const handleApprove = async (req) => {
    // Try backend API call
    try {
      if (req.selectionId) {
        await fetch(`${API_BASE_URL}/api/v1/quotes/m4/selections/${req.selectionId}/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'APPROVE', checklist: checklistState })
        })
      }
    } catch (err) {
      console.warn('API sync warning:', err)
    }

    const updated = requests.map(r => {
      if (r.id === req.id) {
        return {
          ...r,
          status: 'PENDING_CUSTOMS_APPROVAL',
          agentApproved: true,
          agentApprovedBy: `${userName} (${agentCompany.agentCode})`,
          agentApprovedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          checklist: { ...checklistState }
        }
      }
      return r
    })

    setRequests(updated)
    setIsVerifyModalOpen(false)
    showToast(`Shipment ${req.shipmentId} approved by ${agentCompany.name}! Forwarded to Customs Officer for regulatory clearance.`)

    // Forward to Customs Cases in localStorage
    try {
      const storedCustoms = JSON.parse(localStorage.getItem('customsCases') || '[]')
      const existingCaseIndex = storedCustoms.findIndex(c => c.shipmentId === req.shipmentId || c.quoteId === req.quoteId)
      
      const newCustomsCase = {
        id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
        quoteId: req.quoteId,
        shipmentId: req.shipmentId,
        customer: req.customer,
        origin: req.origin,
        destination: req.destination,
        commodity: req.cargo || 'Electronics & Microcontrollers',
        hsCode: '8504.40.90',
        incoterm: 'CIF',
        declaredValue: req.priceFormatted,
        status: 'PENDING_REVIEW',
        priority: 'High',
        riskScore: 0.15,
        agentApproved: true,
        forwardedBy: `${userName} (${agentCompany.name})`,
        aiFindings: `Operational verification completed by ${agentCompany.name} (${agentCompany.agentCode}). Awaiting statutory Customs Officer clearance.`,
        regulations: [
          'Indian Customs Tariff Act, Section 46 (ICEGATE Export Declaration)',
          'EU Combined Nomenclature (CN) Chapter 85 Import Compliance',
          'Preferential Rules of Origin Verification'
        ],
        documents: req.documents || [
          { name: 'Commercial Invoice (Signed)', status: 'VERIFIED', mandatory: true },
          { name: 'Packing List with Gross/Net Weights', status: 'VERIFIED', mandatory: true }
        ],
        created: 'Just now'
      }

      if (existingCaseIndex >= 0) {
        storedCustoms[existingCaseIndex] = {
          ...storedCustoms[existingCaseIndex],
          agentApproved: true,
          status: 'PENDING_REVIEW',
          forwardedBy: `${userName} (${agentCompany.name})`
        }
      } else {
        storedCustoms.unshift(newCustomsCase)
      }
      localStorage.setItem('customsCases', JSON.stringify(storedCustoms))
    } catch (e) {
      console.error('Customs sync error:', e)
    }

    // Update customer quotes in localStorage so customer dashboard reflects PENDING_CUSTOMS_APPROVAL
    try {
      const custQuotes = JSON.parse(localStorage.getItem('customerQuotes') || '[]')
      const updatedCust = custQuotes.map(cq => {
        if (cq.shipmentId === req.shipmentId || cq.id === req.quoteId) {
          return {
            ...cq,
            status: 'PENDING_CUSTOMS_APPROVAL',
            agentApproved: true,
            agentApprovedBy: `${userName} (${agentCompany.agentCode})`
          }
        }
        return cq
      })
      localStorage.setItem('customerQuotes', JSON.stringify(updatedCust))
    } catch {}

    // Update allShipments in localStorage so Cargo Ledger reflects Carrier Approved
    try {
      const storedShips = JSON.parse(localStorage.getItem('allShipments') || '[]')
      const updatedShips = storedShips.map(s => {
        if (s.id === req.shipmentId || s.quoteId === req.quoteId) {
          return {
            ...s,
            status: 'Carrier Approved',
            agentApproved: true
          }
        }
        return s
      })
      localStorage.setItem('allShipments', JSON.stringify(updatedShips))
    } catch {}
  }

  // ACTION: MODIFY (Page 14 Scenario -> ₹80,000 -> ₹82,500 due to Fuel surcharge increase)
  const handleModifySubmit = async (e) => {
    e.preventDefault()
    if (!selectedReq) return

    const newP = parseFloat(modifyForm.newPrice)
    const reason = modifyForm.reason.trim()

    if (!newP || !reason) {
      alert('Price and mandatory modification reason are required.')
      return
    }

    try {
      if (selectedReq.selectionId) {
        await fetch(`${API_BASE_URL}/api/v1/quotes/m4/selections/${selectedReq.selectionId}/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'MODIFY',
            new_price: newP,
            reason: reason,
            checklist: checklistState
          })
        })
      }
    } catch (err) {
      console.warn('API sync warning:', err)
    }

    const revisionItem = {
      originalPrice: selectedReq.originalPrice,
      revisedPrice: newP,
      reason: reason,
      date: 'Just now',
      status: 'PENDING_CUSTOMER'
    }

    const updated = requests.map(r => {
      if (r.id === selectedReq.id) {
        return {
          ...r,
          status: 'REVISION_PENDING_CUSTOMER',
          currentPrice: newP,
          priceFormatted: `₹${newP.toLocaleString('en-IN')}`,
          revisions: [revisionItem, ...(r.revisions || [])]
        }
      }
      return r
    })

    setRequests(updated)
    setIsModifyModalOpen(false)
    setIsVerifyModalOpen(false)
    showToast(`Quote modified to ₹${newP.toLocaleString('en-IN')}. Reason: "${reason}". Sent to customer for acceptance.`)

    // Notify Customer Portal storage for revision review modal
    try {
      const custQuotes = JSON.parse(localStorage.getItem('customerQuotes') || '[]')
      const updatedCust = custQuotes.map(cq => {
        if (cq.shipmentId === selectedReq.shipmentId || cq.id === selectedReq.quoteId) {
          return {
            ...cq,
            status: 'REVISION_PENDING_CUSTOMER',
            pendingRevision: revisionItem
          }
        }
        return cq
      })
      localStorage.setItem('customerQuotes', JSON.stringify(updatedCust))
    } catch {}
  }

  // ACTION: REJECT
  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!selectedReq) return

    try {
      if (selectedReq.selectionId) {
        await fetch(`${API_BASE_URL}/api/v1/quotes/m4/selections/${selectedReq.selectionId}/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'REJECT',
            reason: rejectReason,
            checklist: checklistState
          })
        })
      }
    } catch {}

    const updated = requests.map(r => {
      if (r.id === selectedReq.id) {
        return {
          ...r,
          status: 'REJECTED',
          rejectReason: rejectReason
        }
      }
      return r
    })

    setRequests(updated)
    setIsRejectModalOpen(false)
    setIsVerifyModalOpen(false)
    showToast(`Request ${selectedReq.shipmentId} REJECTED. Customer has been notified to pick another quote.`)
  }

  // ACTION: REQUEST INFO
  const handleRequestInfoSubmit = async (e) => {
    e.preventDefault()
    if (!selectedReq) return

    const updated = requests.map(r => {
      if (r.id === selectedReq.id) {
        return {
          ...r,
          status: 'AWAITING_CUSTOMER_INFO',
          infoRequested: requestInfoNotes
        }
      }
      return r
    })

    setRequests(updated)
    setIsRequestInfoModalOpen(false)
    setIsVerifyModalOpen(false)
    showToast(`Requested additional details from customer for ${selectedReq.shipmentId}.`)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 leading-tight">
                  Company Agent Operations Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black font-mono">
                  {agentCompany.name} ({agentCompany.companyId})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200">
                  Agent ID: {agentCompany.agentCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Milestone 4 Quote Verification & Booking Confirmation · Strict Company Isolation Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">
              Logged in: <strong className="text-slate-900">{userName}</strong>
            </span>
          </div>
        </header>

        {/* M4 Navigation Tabs (Strictly matching PDF Page 7 & User Prompt) */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-1 overflow-x-auto shrink-0">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'incoming', label: 'Incoming Requests', icon: Clock, count: newRequestsCount },
            { id: 'pending', label: 'Pending Verification', icon: ShieldCheck, count: pendingVerificationCount },
            { id: 'shipment-requests', label: 'Shipment Requests', icon: Truck },
            { id: 'verification', label: 'Quote Verification', icon: CheckSquare },
            { id: 'document-review', label: 'Document Review', icon: FileSearch },
            { id: 'bookings', label: 'Booking Management', icon: FileCheck, count: approvedTodayCount },
            { id: 'approved', label: 'Approved', icon: CheckCircle2 },
            { id: 'rejected', label: 'Rejected', icon: XCircle, count: rejectedCount },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter(n => !n.read).length }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/agents/dashboard?tab=${tab.id}`)}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'border-amber-500 text-amber-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Isolation Alert */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Company Isolation Active:</strong> You are authorized for <strong>{agentCompany.name} ({agentCompany.companyId})</strong>. You only receive quote selections directed specifically to your freight company.
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  Agent: {agentCompany.agentCode}
                </span>
              </div>

              {/* KPI Cards (PDF Page 8) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <DashboardCard 
                  title="New Requests" 
                  value={newRequestsCount} 
                  subtext="Customer selections" 
                  icon={Clock} 
                  trend="up" 
                  trendValue="Fresh" 
                />
                <DashboardCard 
                  title="Pending Verification" 
                  value={pendingVerificationCount} 
                  subtext="Requiring review" 
                  icon={ShieldCheck} 
                  trend="neutral" 
                  trendValue="Active Queue" 
                />
                <DashboardCard 
                  title="Approved Today" 
                  value={approvedTodayCount} 
                  subtext="Converted to bookings" 
                  icon={CheckCircle2} 
                  trend="up" 
                  trendValue="+1 today" 
                />
                <DashboardCard 
                  title="Rejected Today" 
                  value={rejectedCount} 
                  subtext="Declined requests" 
                  icon={XCircle} 
                  trend="neutral" 
                  trendValue="Within SLA" 
                />
                <DashboardCard 
                  title="Response Time" 
                  value="42 min" 
                  subtext="Average verification SLA" 
                  icon={TrendingUp} 
                  trend="up" 
                  trendValue="Target < 2h" 
                />
              </div>

              {/* Priority Verification Queue */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Priority Verification Queue</h3>
                    <p className="text-[11px] text-slate-500">Quotes selected by shippers awaiting commercial & operational validation</p>
                  </div>
                  <button
                    onClick={() => navigate('/agents/dashboard?tab=incoming')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    View All Incoming ({isolatedRequests.length}) ➔
                  </button>
                </div>

                <div className="space-y-3">
                  {isolatedRequests.slice(0, 3).map(req => (
                    <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-blue-700">{req.shipmentId}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-bold text-xs text-slate-900">{req.customer}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-600">
                            {req.quoteId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <strong>{req.origin}</strong> ➔ <strong>{req.destination}</strong> ({req.container} · {req.cargo})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Selected Price: <strong className="text-slate-900 font-mono">{req.priceFormatted}</strong> · Transit: {req.transitDays}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedReq(req)
                            setIsVerifyModalOpen(true)
                          }}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Open 9-Point Verification</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INCOMING REQUESTS / PENDING / SHIPMENT REQUESTS / APPROVED / REJECTED / BOOKINGS */}
          {activeTab !== 'dashboard' && activeTab !== 'notifications' && activeTab !== 'document-review' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 capitalize">
                    {activeTab.replace('-', ' ')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Requests scoped exclusively to {agentCompany.name} ({agentCompany.companyId})
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search shipment, client, corridor..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 w-64"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Shipment & Quote</th>
                      <th className="py-3 px-4">Shipper / Customer</th>
                      <th className="py-3 px-4">Corridor & Cargo</th>
                      <th className="py-3 px-4">Selected Price</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentList.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-all">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-black text-blue-700">{req.shipmentId}</div>
                          <div className="text-[10px] font-mono text-slate-500">{req.quoteId} · {req.date}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {req.customer}
                          <div className="text-[10px] font-normal text-slate-500">{req.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{req.origin} ➔ {req.destination}</div>
                          <div className="text-[10px] text-slate-500">{req.cargo} · {req.container} ({req.weightKg?.toLocaleString()} KG)</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-black text-slate-900">{req.priceFormatted}</div>
                          <div className="text-[10px] text-slate-500">{req.transitDays}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.riskLevel === 'Low' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.riskLevel} Risk
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === 'BOOKING_CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'REVISION_PENDING_CUSTOMER'
                              ? 'bg-purple-100 text-purple-800'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                          {req.bookingReference && (
                            <div className="text-[10px] font-mono font-bold text-emerald-700 mt-1">
                              Ref: {req.bookingReference}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedReq(req)
                              setIsVerifyModalOpen(true)
                            }}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Verify Checklist</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {currentList.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-500">
                          <div className="max-w-sm mx-auto space-y-2">
                            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                            <p className="font-bold text-sm text-slate-700">No requests currently in {activeTab.replace('-', ' ')}</p>
                            <p className="text-xs text-slate-500">
                              All {isolatedRequests.length} company requests are active. You can browse all incoming and historical requests.
                            </p>
                            <button
                              onClick={() => navigate('/agents/dashboard?tab=shipment-requests')}
                              className="mt-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <span>View All Company Shipments ({isolatedRequests.length})</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENT REVIEW */}
          {activeTab === 'document-review' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Shipper Document Verification</h3>
                <p className="text-xs text-slate-500">Inspect trade documentation, invoices, and customs packing lists</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isolatedRequests.flatMap(r => r.documents?.map(doc => ({ ...doc, shipmentId: r.shipmentId, customer: r.customer })) || []).map((doc, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 truncate max-w-[180px]">{doc.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500">{doc.shipmentId} · {doc.size}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Category: <strong>{doc.type}</strong></span>
                      <button 
                        onClick={() => showToast(`Document ${doc.name} verified and stamped.`)}
                        className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Verified</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Workflow Notifications</h3>
                <p className="text-xs text-slate-500">Real-time alerts for customer quote selections and revision responses</p>
              </div>

              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span>{n.title}</span>
                      </div>
                      <p className="text-xs text-slate-600">{n.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 9-POINT VERIFICATION MODAL (Section 5 of Specification) */}
      <AnimatePresence>
        {isVerifyModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-blue-600">{selectedReq.shipmentId}</span>
                    <span className="text-slate-300">·</span>
                    <h3 className="text-base font-black text-slate-900">9-Point Verification Checklist</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedReq.origin} ➔ {selectedReq.destination} ({selectedReq.customer})
                  </p>
                </div>
                <button
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Commercial Summary Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Selected Quote Rate</span>
                  <span className="font-mono font-black text-lg text-slate-900">{selectedReq.priceFormatted}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Cargo & Container</span>
                  <strong className="text-slate-800">{selectedReq.cargo} ({selectedReq.container})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Gross Weight</span>
                  <strong className="text-slate-800">{selectedReq.weightKg?.toLocaleString()} KG</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Transit Schedule</span>
                  <strong className="text-blue-600">{selectedReq.transitDays}</strong>
                </div>
              </div>

              {/* The 9 Checklist Items (PDF Section 5) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Operational & Commercial Verification Items:
                </h4>

                {[
                  { key: 'shipment', title: '1. Shipment Context', desc: 'Origin, destination, cargo classification, date validity' },
                  { key: 'cargo', title: '2. Cargo Specifications', desc: 'Weight, volume, hazardous/reefer handling acceptance' },
                  { key: 'capacity', title: '3. Capacity Allocation', desc: 'Container/vehicle space available on planned vessel' },
                  { key: 'route', title: '4. Route Feasibility', desc: 'Operational corridor approved, no embargo or blockade' },
                  { key: 'schedule', title: '5. Pickup & ETA Schedule', desc: 'Pickup cutoff and target arrival dates confirmed' },
                  { key: 'documents', title: '6. Required Documents', desc: 'Commercial invoice, packing list, customs readiness' },
                  { key: 'commercial', title: '7. Commercial Validation', desc: 'Base freight, bunker fuel surcharge (BAF), terminal handling' },
                  { key: 'risk_context', title: '8. AI Risk Context (M3)', desc: 'Weather storm alerts, port congestion, customs checks accepted' },
                  { key: 'quote_validity', title: '9. Quote Expiry Date', desc: 'Quote selection submitted within 7-day validity window' }
                ].map(item => {
                  const isChecked = checklistState[item.key]
                  return (
                    <div 
                      key={item.key}
                      onClick={() => setChecklistState(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500">{item.desc}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isChecked ? 'Verified' : 'Flagged'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* 4 Agent Actions (Approve, Modify, Reject, Request Info) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Agent Verification Decision:
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleApprove(selectedReq)}
                    className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Book</span>
                  </button>

                  <button
                    onClick={() => setIsModifyModalOpen(true)}
                    className="py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Modify Quote</span>
                  </button>

                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="py-3 px-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/20 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Request</span>
                  </button>

                  <button
                    onClick={() => setIsRequestInfoModalOpen(true)}
                    className="py-3 px-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-md flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Request Info</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODIFY QUOTE MODAL (Scenario 80,000 -> 82,500 Fuel surcharge increase) */}
      <AnimatePresence>
        {isModifyModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Modify Commercial Terms</h3>
                  <p className="text-[11px] text-slate-500">Every change requires customer approval & logged reason</p>
                </div>
                <button onClick={() => setIsModifyModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Selected Price:</span>
                  <strong className="font-mono text-slate-900">{selectedReq.priceFormatted}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipper:</span>
                  <strong className="text-slate-800">{selectedReq.customer}</strong>
                </div>
              </div>

              <form onSubmit={handleModifySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Revised Total Price (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={modifyForm.newPrice}
                    onChange={e => setModifyForm({ ...modifyForm, newPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Test scenario: ₹80,000 → ₹82,500</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Mandatory Operational Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Fuel surcharge increase, peak season adjustment, container shortage"
                    value={modifyForm.reason}
                    onChange={e => setModifyForm({ ...modifyForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModifyModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Dispatch Revision to Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECT REQUEST MODAL */}
      <AnimatePresence>
        {isRejectModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Reject Shipment Request</h3>
                <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customer will be notified and prompted to select an alternate company quote.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REQUEST INFO MODAL */}
      <AnimatePresence>
        {isRequestInfoModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Request Missing Information</h3>
                <button onClick={() => setIsRequestInfoModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRequestInfoSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Required Details or Documents
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={requestInfoNotes}
                    onChange={e => setRequestInfoNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Status will transition to AWAITING_CUSTOMER_INFO until documents are uploaded.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestInfoModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Send Info Request
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
