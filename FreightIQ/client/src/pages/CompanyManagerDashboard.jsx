import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Users, 
  UserPlus, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Shield, 
  FileText, 
  Truck, 
  DollarSign, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Key, 
  LogOut, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  TrendingUp, 
  Activity, 
  Layers, 
  Calendar,
  Sparkles,
  Plus,
  ExternalLink
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import { API_BASE_URL } from '../config/api'

// Initial Seed Data for Company Manager Portal
const INITIAL_COMPANY = {
  id: 'CMP-102',
  companyId: 'CMP-102',
  name: 'GlobalSea Freight',
  legalName: 'GlobalSea Freight & Forwarding LLC',
  licenseNo: 'LIC-2026-8941',
  modes: ['Ocean Freight', 'Air Freight'],
  contactEmail: 'manager@globalsea.com',
  phone: '+91 98401 23456',
  status: 'APPROVED',
  isEligible: true,
  rating: 4.7
}

const INITIAL_SHIPMENT_REQUESTS = [
  {
    id: 'SEL-2026-1001',
    quoteNumber: 'QT-5002',
    shipmentId: 'SHP-1001',
    customerName: 'ABC Electronics Pvt Ltd',
    customerEmail: 'customer@apexgl.com',
    origin: 'Chennai, India (INMAA)',
    destination: 'Rotterdam, Netherlands (NLRTM)',
    mode: 'Sea Freight',
    container: '40 FT',
    cargo: 'Electronics (5,000 KG · 12 CBM)',
    price: 80000,
    priceFormatted: '₹80,000',
    transitDays: '28 Days',
    riskLevel: 'Medium',
    status: 'PENDING_COMPANY_VERIFICATION',
    assignedAgent: 'AGT-204 (Sarah Jenkins)',
    assignedAgentEmail: 'agent204@globalsea.com',
    date: 'Sep 08, 2026'
  },
  {
    id: 'SEL-2026-1002',
    quoteNumber: 'QT-5005',
    shipmentId: 'SHP-1002',
    customerName: 'Zenith Chemical Corp',
    customerEmail: 'ops@zenithchem.com',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Jebel Ali (AEJEA)',
    mode: 'Sea Freight',
    container: '20 FT General',
    cargo: 'Industrial Solvents (8,500 KG)',
    price: 65000,
    priceFormatted: '₹65,000',
    transitDays: '7 Days',
    riskLevel: 'Low',
    status: 'BOOKING_CONFIRMED',
    bookingRef: 'BK-2026-10042',
    assignedAgent: 'AGT-204 (Sarah Jenkins)',
    assignedAgentEmail: 'agent204@globalsea.com',
    date: 'Sep 07, 2026'
  },
  {
    id: 'SEL-2026-1003',
    quoteNumber: 'QT-5008',
    shipmentId: 'SHP-1004',
    customerName: 'Nordic Imports AB',
    customerEmail: 'contact@nordicimp.se',
    origin: 'Chennai (INMAA)',
    destination: 'Antwerp (BEANR)',
    mode: 'Sea Freight',
    container: '40 HC',
    cargo: 'Machinery Components (12,000 KG)',
    price: 110000,
    priceFormatted: '₹1,10,000',
    transitDays: '26 Days',
    riskLevel: 'Low',
    status: 'UNDER_VERIFICATION',
    assignedAgent: 'AGT-205 (David Ross)',
    assignedAgentEmail: 'agent205@globalsea.com',
    date: 'Sep 08, 2026'
  }
]

const INITIAL_AGENTS = [
  {
    id: 'USR-204',
    agentCode: 'AGT-204',
    fullName: 'Sarah Jenkins',
    email: 'agent204@globalsea.com',
    role: 'COMPANY_AGENT',
    companyId: 'CMP-102',
    companyName: 'GlobalSea Freight',
    status: 'Active',
    assignedRequests: 8,
    approvedCount: 6,
    lastActive: '10 mins ago'
  },
  {
    id: 'USR-205',
    agentCode: 'AGT-205',
    fullName: 'David Ross',
    email: 'agent205@globalsea.com',
    role: 'COMPANY_AGENT',
    companyId: 'CMP-102',
    companyName: 'GlobalSea Freight',
    status: 'Active',
    assignedRequests: 5,
    approvedCount: 4,
    lastActive: '1 hr ago'
  }
]

export default function CompanyManagerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab') || 'dashboard'

  const [company, setCompany] = useState(() => {
    try {
      const stored = localStorage.getItem('companyProfile')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object' && parsed.companyId) return parsed
      }
    } catch {}
    return INITIAL_COMPANY
  })

  const [shipments, setShipments] = useState(() => {
    try {
      const stored = localStorage.getItem('companyShipmentRequests')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return INITIAL_SHIPMENT_REQUESTS
  })

  const [agents, setAgents] = useState(() => {
    try {
      const stored = localStorage.getItem('companyAgentsList')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return INITIAL_AGENTS
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [inspectingShipment, setInspectingShipment] = useState(null)
  const [newAgentData, setNewAgentData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'COMPANY_AGENT',
    phone: ''
  })
  const [agentFormSuccess, setAgentFormSuccess] = useState('')
  const [agentFormError, setAgentFormError] = useState('')
  const [isSubmittingAgent, setIsSubmittingAgent] = useState(false)

  // Manager Approval Handler directly from Inspection Modal
  const handleManagerApproveRequest = (shipment) => {
    const updated = shipments.map(s => {
      if (s.id === shipment.id) {
        return {
          ...s,
          status: 'PENDING_CUSTOMS_APPROVAL',
          agentApproved: true
        }
      }
      return s
    })
    setShipments(updated)
    localStorage.setItem('companyShipmentRequests', JSON.stringify(updated))

    // Forward to customsCases in localStorage
    try {
      const storedCustoms = JSON.parse(localStorage.getItem('customsCases') || '[]')
      const exists = storedCustoms.some(c => c.shipmentId === shipment.id || c.quoteId === shipment.quoteId)
      if (!exists) {
        storedCustoms.unshift({
          id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
          quoteId: shipment.quoteId,
          shipmentId: shipment.id,
          customer: shipment.customer || shipment.customerName || 'Shipper Customer',
          origin: shipment.origin,
          destination: shipment.destination,
          commodity: shipment.cargo || 'Electronics & Commercial Cargo',
          hsCode: '8504.40.90',
          incoterm: 'CIF',
          declaredValue: shipment.priceFormatted || `₹${(shipment.offeredRate || 80000).toLocaleString('en-IN')}`,
          status: 'PENDING_REVIEW',
          priority: 'High',
          riskScore: 0.15,
          agentApproved: true,
          forwardedBy: `${company.name} Management Desk`,
          aiFindings: `Operational verification completed and approved by ${company.name} management. Awaiting statutory Customs clearance.`
        })
        localStorage.setItem('customsCases', JSON.stringify(storedCustoms))
      }
    } catch {}

    // Update allShipments
    try {
      const storedShips = JSON.parse(localStorage.getItem('allShipments') || '[]')
      const updatedShips = storedShips.map(s => {
        if (s.id === shipment.id || s.quoteId === shipment.quoteId) {
          return { ...s, status: 'Carrier Approved', agentApproved: true }
        }
        return s
      })
      localStorage.setItem('allShipments', JSON.stringify(updatedShips))
    } catch {}

    // Update customerQuotes
    try {
      const storedCust = JSON.parse(localStorage.getItem('customerQuotes') || '[]')
      const updatedCust = storedCust.map(q => {
        if (q.shipmentId === shipment.id || q.id === shipment.quoteId) {
          return { ...q, status: 'PENDING_CUSTOMS_APPROVAL', agentApproved: true }
        }
        return q
      })
      localStorage.setItem('customerQuotes', JSON.stringify(updatedCust))
    } catch {}

    setInspectingShipment(null)
    alert(`Shipment ${shipment.id} successfully verified and approved by Company Manager! Forwarded to Customs Compliance Officer.`)
  }

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('companyProfile', JSON.stringify(company))
  }, [company])

  useEffect(() => {
    localStorage.setItem('companyShipmentRequests', JSON.stringify(shipments))
  }, [shipments])

  useEffect(() => {
    localStorage.setItem('companyAgentsList', JSON.stringify(agents))
  }, [agents])

  // KPI Calculations
  const totalShipments = shipments.length
  const pendingCount = shipments.filter(s => s.status === 'PENDING_COMPANY_VERIFICATION' || s.status === 'UNDER_VERIFICATION').length
  const confirmedCount = shipments.filter(s => s.status === 'BOOKING_CONFIRMED' || s.status === 'APPROVED').length
  const totalAgents = agents.length

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    if (!s) return false
    const q = (searchQuery || '').toLowerCase()
    const matchesSearch = 
      (s.shipmentId || '').toLowerCase().includes(q) ||
      (s.customerName || '').toLowerCase().includes(q) ||
      (s.cargo || '').toLowerCase().includes(q) ||
      (s.origin || '').toLowerCase().includes(q) ||
      (s.destination || '').toLowerCase().includes(q)
    
    if (statusFilter === 'ALL') return matchesSearch
    return matchesSearch && s.status === statusFilter
  })

  // Handle Add Agent ("add the agent - email and password")
  const handleAddAgent = async (e) => {
    e.preventDefault()
    setAgentFormError('')
    setAgentFormSuccess('')

    if (!newAgentData.fullName.trim() || !newAgentData.email.trim() || !newAgentData.password) {
      setAgentFormError('Full name, email, and password are required.')
      return
    }

    if (newAgentData.password.length < 6) {
      setAgentFormError('Password must be at least 6 characters long.')
      return
    }

    setIsSubmittingAgent(true)

    try {
      // 1. Send to Django backend
      const res = await fetch(`${API_BASE_URL}/api/v1/quotes/m4/companies/${company.companyId}/agents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newAgentData.fullName.trim(),
          email: newAgentData.email.trim(),
          password: newAgentData.password,
          role: 'AGENT'
        })
      })
      const apiRes = await res.json()
      console.log('Django create agent response:', apiRes)
    } catch (err) {
      console.warn('API sync failed, continuing local update:', err)
    }

    // 2. Create agent object locally
    const newCode = `AGT-${Math.floor(100 + Math.random() * 900)}`
    const newAgent = {
      id: `USR-${Date.now()}`,
      agentCode: newCode,
      fullName: newAgentData.fullName.trim(),
      email: newAgentData.email.trim().toLowerCase(),
      password: newAgentData.password,
      role: 'COMPANY_AGENT',
      companyId: company.companyId,
      companyName: company.name,
      status: 'Active',
      assignedRequests: 0,
      approvedCount: 0,
      lastActive: 'Just now'
    }

    // Save in company agents list
    const updatedAgents = [newAgent, ...agents]
    setAgents(updatedAgents)

    // Also update global systemUsers so this agent can log in directly!
    try {
      const storedUsers = localStorage.getItem('systemUsers')
      let sysUsers = storedUsers ? JSON.parse(storedUsers) : []
      sysUsers.push({
        id: newAgent.id,
        fullName: newAgent.fullName,
        email: newAgent.email,
        password: newAgent.password,
        role: 'COMPANY_AGENT',
        companyName: company.name,
        companyId: company.companyId,
        phone: newAgentData.phone || '+91 98000 00000',
        status: 'Active',
        created: 'Today'
      })
      localStorage.setItem('systemUsers', JSON.stringify(sysUsers))
    } catch {}

    setIsSubmittingAgent(false)
    setAgentFormSuccess(`Agent ${newAgent.fullName} (${newCode}) created successfully! Email: ${newAgent.email}`)
    setNewAgentData({ fullName: '', email: '', password: '', role: 'COMPANY_AGENT', phone: '' })

    setTimeout(() => {
      setIsAddAgentModalOpen(false)
      setAgentFormSuccess('')
    }, 1800)
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
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 leading-tight">
                  {company.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-extrabold border border-slate-200">
                  ID: {company.companyId}
                </span>
                {company.isEligible ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified & Eligible
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Pending Admin Approval
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Company Manager Control Center · Milestone 4 Operational Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddAgentModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Agent</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'shipments', label: 'Shipment Requests list', icon: Package, count: shipments.length },
            { id: 'agents', label: 'Agent list', icon: Users, count: agents.length }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/company/manager/dashboard?tab=${tab.id}`)}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Eligibility Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                company.isEligible 
                  ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    company.isEligible ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {company.isEligible ? 'Customer Recommendation Status: ELIGIBLE' : 'Status: Under Admin Review'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {company.isEligible 
                        ? 'Your company quotes are live and recommended to shippers generating quote options.'
                        : 'Your company registration has been submitted and is awaiting Admin Verification & Approval.'}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  Company ID: {company.companyId}
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard 
                  title="Shipment Requests" 
                  value={totalShipments} 
                  subtext="Direct customer selections" 
                  icon={Package} 
                  trend="up" 
                  trendValue="+14%" 
                />
                <DashboardCard 
                  title="Pending Verification" 
                  value={pendingCount} 
                  subtext="Awaiting agent review" 
                  icon={Clock} 
                  trend="neutral" 
                  trendValue="Active Queue" 
                />
                <DashboardCard 
                  title="Confirmed Bookings" 
                  value={confirmedCount} 
                  subtext="Verified & locked deals" 
                  icon={CheckCircle2} 
                  trend="up" 
                  trendValue="94.2% Confirmed" 
                />
                <DashboardCard 
                  title="Active Company Agents" 
                  value={totalAgents} 
                  subtext="Handling verification workflow" 
                  icon={Users} 
                  trend="up" 
                  trendValue="Fully Staffed" 
                />
              </div>

              {/* Quick Actions & Recent Incoming Requests */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Recent Shipment Selections */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Recent Customer Selections</h3>
                      <p className="text-[11px] text-slate-500">Quotes selected by shippers for {company.name}</p>
                    </div>
                    <button
                      onClick={() => navigate('/company/manager/dashboard?tab=shipments')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {shipments.slice(0, 3).map(req => (
                      <div key={req.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-blue-700">{req.shipmentId}</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-bold text-xs text-slate-900">{req.customerName}</span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                              {req.quoteNumber}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 flex items-center gap-2">
                            <span>{req.origin}</span>
                            <span className="text-blue-600">➔</span>
                            <span>{req.destination}</span>
                            <span className="text-slate-400">({req.container})</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <div className="font-mono font-black text-sm text-slate-900">{req.priceFormatted}</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                            req.status === 'BOOKING_CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'UNDER_VERIFICATION'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Col: Agents Directory Quick Overview */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Verification Team</h3>
                      <p className="text-[11px] text-slate-500">Authorized agents for {company.name}</p>
                    </div>
                    <button
                      onClick={() => setIsAddAgentModalOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {agents.map(ag => (
                      <div key={ag.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {(ag.fullName || 'AG').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{ag.fullName || 'Agent'}</div>
                            <div className="text-[10px] font-mono text-slate-500">{ag.email} · {ag.agentCode || 'AGT'}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {ag.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                    <strong>Process Rule:</strong> Only agents registered to <strong>{company.companyId}</strong> can review customer quote selections directed to this company.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPMENT REQUESTS LIST */}
          {activeTab === 'shipments' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Shipment Requests List</h3>
                  <p className="text-xs text-slate-500">
                    Incoming quote selections from shippers directed exclusively to {company.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 w-48 sm:w-64"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING_COMPANY_VERIFICATION">Pending Verification</option>
                    <option value="UNDER_VERIFICATION">Under Verification</option>
                    <option value="BOOKING_CONFIRMED">Booking Confirmed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Shipments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Shipment & Quote</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Corridor & Cargo</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Assigned Agent</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredShipments.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-all">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-black text-blue-700">{req.shipmentId}</div>
                          <div className="text-[10px] font-mono text-slate-500">{req.quoteNumber} · {req.date}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {req.customerName}
                          <div className="text-[10px] font-normal text-slate-500">{req.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{req.origin} ➔ {req.destination}</div>
                          <div className="text-[10px] text-slate-500">{req.cargo} · {req.container}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-black text-slate-900">{req.priceFormatted}</div>
                          <div className="text-[10px] text-slate-500">{req.transitDays}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{req.assignedAgent}</div>
                          <div className="text-[10px] font-mono text-slate-400">{req.assignedAgentEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === 'BOOKING_CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'UNDER_VERIFICATION'
                              ? 'bg-indigo-100 text-indigo-800'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                          {req.bookingRef && (
                            <div className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">
                              Ref: {req.bookingRef}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setInspectingShipment(req)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AGENT LIST & MANAGEMENT */}
          {activeTab === 'agents' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Agent List · Team Management</h3>
                  <p className="text-xs text-slate-500">
                    Create and manage authorized verification agents for {company.name} ({company.companyId})
                  </p>
                </div>

                <button
                  onClick={() => setIsAddAgentModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Agent</span>
                </button>
              </div>

              {/* Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(ag => (
                  <div key={ag.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                          {(ag.fullName || 'AG').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{ag.fullName || 'Agent'}</h4>
                          <span className="font-mono text-[10px] text-blue-600 font-extrabold">{ag.agentCode || 'AGT'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {ag.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200/60 pt-2">
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <strong className="text-slate-800 font-mono">{ag.email}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Company Scope:</span>
                        <strong className="text-slate-800">{company.name} ({company.companyId})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Verifications Handled:</span>
                        <strong className="text-blue-600">{ag.assignedRequests} requests</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Approvals Completed:</span>
                        <strong className="text-emerald-600">{ag.approvedCount} bookings</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Last active: {ag.lastActive}</span>
                      <button
                        onClick={() => navigate('/agents/dashboard')}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Switch to Desk ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD AGENT MODAL ("add the agent - email and password") */}
      <AnimatePresence>
        {isAddAgentModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Add Company Agent</h3>
                    <p className="text-[11px] text-slate-500">Assign to {company.name} ({company.companyId})</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddAgentModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {agentFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{agentFormError}</span>
                </div>
              )}

              {agentFormSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{agentFormSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddAgent} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1.5">Agent Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={newAgentData.fullName}
                      onChange={e => setNewAgentData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1.5">Agent Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. agent204@globalsea.com"
                      value={newAgentData.email}
                      onChange={e => setNewAgentData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1.5">Agent Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="Password (minimum 6 characters)"
                      value={newAgentData.password}
                      onChange={e => setNewAgentData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1.5">Contact Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+91 98111 22334"
                      value={newAgentData.phone}
                      onChange={e => setNewAgentData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <span>Assigned Company: </span>
                  <strong className="text-slate-900">{company.name}</strong>
                  <span className="text-blue-600 font-mono ml-1 font-bold">({company.companyId})</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAgentModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAgent}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmittingAgent ? 'Creating Agent...' : 'Create Agent Account'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* INSPECT SHIPMENT MODAL */}
        {inspectingShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {inspectingShipment.id || inspectingShipment.shipmentId}
                    </span>
                    {inspectingShipment.quoteId && (
                      <span className="text-xs font-mono text-slate-500">
                        ({inspectingShipment.quoteId})
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Shipment Operations & Agent Inspection
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verification dossier managed under {company.name} ({company.companyId})
                  </p>
                </div>

                <button
                  onClick={() => setInspectingShipment(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">Current Milestone Status:</span>
                  <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {inspectingShipment.status}
                  </span>
                </div>

                {inspectingShipment.bookingRef && (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {inspectingShipment.bookingRef}
                  </span>
                )}
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Shipper Info */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer / Shipper</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {inspectingShipment.customer || inspectingShipment.customerName || 'Shipper Client'}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Email: {inspectingShipment.customerEmail || inspectingShipment.email || 'customer@apexgl.com'}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Created: {inspectingShipment.date || 'Sep 11, 2026'}
                  </div>
                </div>

                {/* Corridor Info */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-slate-700 uppercase tracking-wider text-[10px]">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trade Route & Mode</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {inspectingShipment.origin} ➔ {inspectingShipment.destination}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Mode: {inspectingShipment.mode || 'Sea Freight'} · {inspectingShipment.container || inspectingShipment.containerType || '40 FT'}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Cargo: {inspectingShipment.cargo || 'General Commercial Cargo'}
                  </div>
                </div>
              </div>

              {/* Pricing and Assigned Agent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">Commercial Freight Tariff</span>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {inspectingShipment.priceFormatted || `₹${(inspectingShipment.offeredRate || 80000).toLocaleString('en-IN')}`}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Includes bunker adjustment & origin port terminal handling</span>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                  <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">Assigned Operational Agent</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{inspectingShipment.assignedAgent || 'Elena Rostova (AGT-204)'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Licensed operational verifier</span>
                </div>
              </div>

              {/* 9-Point Verification Checklist Summary */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Carrier 9-Point Verification Checklist
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Ready for Approval
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    'Corridor Feasibility',
                    'Vessel Space Allocated',
                    'Transit Time Aligned',
                    'Rate Accuracy Verified',
                    'Trade Docs Complete',
                    'Regulatory Compliance'
                  ].map((chk, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-bold text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{chk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const targetId = inspectingShipment.id || inspectingShipment.shipmentId
                    navigate(`/agents/dashboard?tab=incoming&id=${targetId}`)
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Agent Desk</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setInspectingShipment(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  {inspectingShipment.status !== 'BOOKING_CONFIRMED' && inspectingShipment.status !== 'PENDING_CUSTOMS_APPROVAL' && (
                    <button
                      onClick={() => handleManagerApproveRequest(inspectingShipment)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Dispatch to Customs</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
