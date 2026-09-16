import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check, 
  FileSearch, 
  BookOpen, 
  Scale, 
  Eye, 
  Download, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ArrowRight,
  Building,
  MapPin,
  Tag,
  HelpCircle,
  FolderLock,
  UploadCloud,
  FileCheck
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'

const INITIAL_COMPLIANCE_CASES = [
  {
    id: 'CASE-2026-082',
    quoteId: 'QT-2026-1001',
    shipmentId: 'SHP-1001',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Chennai (INMAA)',
    destination: 'Rotterdam (NLRTM)',
    commodity: 'Electronics & Microcontrollers',
    hsCode: '8504.40.90',
    incoterm: 'CIF',
    declaredValue: '₹86,000',
    status: 'PENDING_REVIEW',
    priority: 'High',
    riskScore: 0.15,
    agentApproved: false,
    aiFindings: 'Dual-use export classification prescreened. Awaiting Freight Agent sign-off, followed by statutory Customs Officer regulatory authorization.',
    regulations: [
      'Indian Customs Tariff Act, Section 46 (ICEGATE Export Declaration)',
      'EU Combined Nomenclature (CN) Chapter 85 Import Compliance',
      'Preferential Rules of Origin Verification'
    ],
    documents: [
      { name: 'Commercial Invoice (Signed)', status: 'VERIFIED', mandatory: true },
      { name: 'Packing List with Gross/Net Weights', status: 'VERIFIED', mandatory: true },
      { name: 'Certificate of Origin', status: 'VERIFIED', mandatory: true }
    ],
    created: 'Just now'
  },
  {
    id: 'CASE-2026-081',
    quoteId: 'QT-2026-00934',
    customer: 'Sharma Textiles',
    origin: 'Chennai (INMAA)',
    destination: 'Singapore (SGSIN)',
    commodity: 'Woven Cotton Textile Fabrics',
    hsCode: '5208.11.00',
    incoterm: 'CIF',
    declaredValue: '₹35,00,000',
    status: 'PENDING_REVIEW',
    priority: 'High',
    riskScore: 0.14,
    aiFindings: 'HS code matches commodity description. Zero trade sanctions identified. Preferential ASEAN-India FTA duty rate applicable (0%).',
    regulations: [
      'Indian Customs Tariff Act, Section 46 (ICEGATE Export Declaration)',
      'Singapore Customs Regulation 24(1) - Import of Dutiable & Non-Dutiable Goods',
      'ASEAN-India Free Trade Agreement (AIFTA) Rules of Origin Certificate'
    ],
    documents: [
      { name: 'Commercial Invoice (Signed)', status: 'VERIFIED', mandatory: true },
      { name: 'Packing List with Gross/Net Weights', status: 'VERIFIED', mandatory: true },
      { name: 'Certificate of Origin (Form AIFTA)', status: 'PENDING_UPLOAD', mandatory: true },
      { name: 'Export Shipping Bill (ICEGATE EDI)', status: 'VERIFIED', mandatory: false }
    ],
    created: '15 mins ago'
  },
  {
    id: 'CASE-2026-080',
    quoteId: 'QT-2026-00933',
    customer: 'Nordic Imports AB',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Rotterdam (NLRTM)',
    commodity: 'Industrial Solvent Compounds (IMO Class 3)',
    hsCode: '2905.11.00',
    incoterm: 'DDP',
    declaredValue: '₹58,40,000',
    status: 'NEEDS_DOCUMENTS',
    priority: 'Critical',
    riskScore: 0.78,
    aiFindings: 'Hazardous cargo alert: Flammable Liquid (UN 1993). Missing Safety Data Sheet (SDS) 16-section format. Quote locked on HOLD.',
    regulations: [
      'IMO International Maritime Dangerous Goods (IMDG) Code Class 3',
      'EU REACH Regulation (EC) No 1907/2006 Chemical Import Compliance',
      'Rotterdam Port Authority Hazardous Cargo Entry Permit (HazMat Port Bye-laws)'
    ],
    documents: [
      { name: 'Dangerous Goods Declaration (DGD)', status: 'VERIFIED', mandatory: true },
      { name: 'Material Safety Data Sheet (16-Section SDS)', status: 'MISSING', mandatory: true },
      { name: 'UN Certified Packaging Certificate', status: 'VERIFIED', mandatory: true },
      { name: 'EU Importer REACH Authorization Letter', status: 'MISSING', mandatory: true }
    ],
    created: '1 hour ago'
  },
  {
    id: 'CASE-2026-079',
    quoteId: 'QT-2026-00932',
    customer: 'Gulf Machinery LLC',
    origin: 'Bengaluru (INBLR)',
    destination: 'Dubai (DXB)',
    commodity: 'Telecom Microwave Transceivers',
    hsCode: '8517.62.90',
    incoterm: 'FOB',
    declaredValue: '₹22,00,000',
    status: 'APPROVED',
    priority: 'Normal',
    riskScore: 0.08,
    aiFindings: 'Dual-use export review cleared. Dual-use strategic goods authorization not required for commercial standard transceivers.',
    regulations: [
      'DGFT SCOMET List Category 8 (Special Chemicals, Organisms, Materials, Equipment)',
      'UAE Telecommunications and Digital Government Regulatory Authority (TDRA) Type Approval'
    ],
    documents: [
      { name: 'Commercial Invoice & Serial Number List', status: 'VERIFIED', mandatory: true },
      { name: 'TDRA Equipment Registration Certificate', status: 'VERIFIED', mandatory: true },
      { name: 'Air Waybill (AWB) Draft', status: 'VERIFIED', mandatory: true }
    ],
    created: '3 hours ago'
  }
]

export default function CustomsDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [cases, setCases] = useState(INITIAL_COMPLIANCE_CASES)
  const [selectedCase, setSelectedCase] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [decisionNotes, setDecisionNotes] = useState('')
  const [userName, setUserName] = useState('Officer R. Verma')

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const currentTab = searchParams.get('tab') || 'reviews'

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Customs Compliance Officer'
    setUserName(name)

    let currentCases = INITIAL_COMPLIANCE_CASES
    const storedCases = localStorage.getItem('customsCases')
    if (storedCases) {
      try {
        const parsed = JSON.parse(storedCases)
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentCases = parsed
        }
      } catch (err) {
        console.error(err)
      }
    }

    // Check if any quote was approved & forwarded by Freight Agent in agentQuotesQueue or customerQuotes
    try {
      const storedAgent = localStorage.getItem('agentQuotesQueue')
      const agentList = storedAgent ? JSON.parse(storedAgent) : []
      const storedCust = localStorage.getItem('customerQuotes')
      const custList = storedCust ? JSON.parse(storedCust) : []
      const allSourceQuotes = [...agentList, ...custList]

      currentCases = currentCases.map(c => {
        const matching = allSourceQuotes.find(q => q.id === c.quoteId || (c.shipmentId && q.shipmentId === c.shipmentId))
        if (matching && matching.agentApproved) {
          return {
            ...c,
            agentApproved: true,
            forwardedBy: matching.auditHistory?.[0]?.user || 'Freight Agent',
            status: c.status === 'APPROVED' ? 'APPROVED' : c.status
          }
        }
        return c
      })
    } catch {}

    setCases(currentCases)
    localStorage.setItem('customsCases', JSON.stringify(currentCases))
  }, [])

  const handleOpenCase = (c) => {
    setSelectedCase(c)
    setDecisionNotes('')
  }

  const handleDecision = (actionType) => {
    if (!selectedCase) return

    let nextStatus = 'APPROVED'
    let stateMessage = ''

    if (actionType === 'APPROVE') {
      nextStatus = 'APPROVED'
      stateMessage = `Compliance Case ${selectedCase.id} APPROVED. Quote ${selectedCase.quoteId} is fully unlocked and issued to Customer.`
    } else if (actionType === 'REQUEST_DOCUMENTS') {
      nextStatus = 'NEEDS_DOCUMENTS'
      stateMessage = `Compliance Case ${selectedCase.id} marked as HOLD/NEEDS_DOCUMENTS. Shipper notified of missing mandatory items.`
    } else if (actionType === 'CONDITIONAL') {
      nextStatus = 'CONDITIONAL_APPROVAL'
      stateMessage = `Compliance Case ${selectedCase.id} marked as CONDITIONAL APPROVAL (Subject to Port Health / Physical Inspection).`
    } else if (actionType === 'REJECT') {
      if (!decisionNotes.trim()) {
        alert('A mandatory rejection reason is required for audit compliance.')
        return
      }
      nextStatus = 'REJECTED'
      stateMessage = `Compliance Case ${selectedCase.id} REJECTED. Quote ${selectedCase.quoteId} is permanently BLOCKED.`
    }

    const updated = cases.map(c => {
      if (c.id === selectedCase.id) {
        return {
          ...c,
          status: nextStatus,
          customsApproved: actionType === 'APPROVE',
          decisionNotes: decisionNotes.trim() || (actionType === 'APPROVE' ? 'Approved as compliant with customs regulations.' : ''),
          reviewedBy: userName,
          reviewedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      }
      return c
    })

    setCases(updated)
    localStorage.setItem('customsCases', JSON.stringify(updated))

    if (actionType === 'APPROVE') {
      // Synchronize to Customer Quotes: Quote is now approved by BOTH Agent and Customs Officer!
      const clearanceId = `CUS-2026-${Math.floor(10000 + Math.random() * 90000)}`
      try {
        const storedCustomer = localStorage.getItem('customerQuotes')
        if (storedCustomer) {
          const parsedCust = JSON.parse(storedCustomer)
          const updatedCust = parsedCust.map(cq => {
            if (cq.id === selectedCase.quoteId || (selectedCase.shipmentId && cq.shipmentId === selectedCase.shipmentId)) {
              const auditEntry = {
                action: 'Customs Officer Approved',
                user: `${userName} (Customs Compliance Officer)`,
                time: 'Just now',
                note: decisionNotes.trim() || `Regulatory compliance verified (${clearanceId}). Sent to Customer for final confirmation.`
              }
              return {
                ...cq,
                agentApproved: true,
                customsApproved: true,
                customsClearanceId: clearanceId,
                status: 'VERIFIED_PENDING_CUSTOMER', // Both approved -> Sent to customer for final sign-off!
                auditHistory: [auditEntry, ...(cq.auditHistory || [])]
              }
            }
            return cq
          })
          localStorage.setItem('customerQuotes', JSON.stringify(updatedCust))
        }
      } catch (err) {
        console.error('Customer quotes sync error:', err)
      }

      // Synchronize to M4 Agent Verification Queue
      try {
        const storedM4 = localStorage.getItem('m4AgentVerificationQueue')
        if (storedM4) {
          const parsedM4 = JSON.parse(storedM4)
          const updatedM4 = parsedM4.map(mq => {
            if (mq.quoteId === selectedCase.quoteId || (selectedCase.shipmentId && mq.shipmentId === selectedCase.shipmentId)) {
              return {
                ...mq,
                status: 'VERIFIED_PENDING_CUSTOMER',
                customsApproved: true,
                customsClearanceId: clearanceId
              }
            }
            return mq
          })
          localStorage.setItem('m4AgentVerificationQueue', JSON.stringify(updatedM4))
        }
      } catch {}

      // Synchronize to Agent Quotes Queue
      try {
        const storedAgent = localStorage.getItem('agentQuotesQueue')
        if (storedAgent) {
          const parsedAgent = JSON.parse(storedAgent)
          const updatedAgent = parsedAgent.map(aq => {
            if (aq.id === selectedCase.quoteId || (selectedCase.shipmentId && aq.shipmentId === selectedCase.shipmentId)) {
              return {
                ...aq,
                agentApproved: true,
                customsApproved: true,
                status: 'SENT'
              }
            }
            return aq
          })
          localStorage.setItem('agentQuotesQueue', JSON.stringify(updatedAgent))
        }
      } catch {}

      // Synchronize to Broker Quotes
      try {
        const storedBroker = localStorage.getItem('brokerQuotes')
        if (storedBroker) {
          const parsedBroker = JSON.parse(storedBroker)
          const updatedBroker = parsedBroker.map(bq => {
            if (bq.id === selectedCase.quoteId || (selectedCase.shipmentId && bq.shipmentId === selectedCase.shipmentId)) {
              return {
                ...bq,
                customsApproved: true,
                status: 'Dispatched to Client'
              }
            }
            return bq
          })
          localStorage.setItem('brokerQuotes', JSON.stringify(updatedBroker))
        }
      } catch {}

      // Synchronize to allShipments
      try {
        const storedShips = localStorage.getItem('allShipments')
        if (storedShips) {
          const parsedShips = JSON.parse(storedShips)
          const updatedShips = parsedShips.map(s => {
            if (s.id === selectedCase.shipmentId || s.quoteId === selectedCase.quoteId) {
              return {
                ...s,
                status: 'Customs Cleared',
                customsApproved: true,
                customsClearanceId: clearanceId
              }
            }
            return s
          })
          localStorage.setItem('allShipments', JSON.stringify(updatedShips))
        }
      } catch {}
    } else if (actionType === 'REJECT') {
      try {
        const storedCustomer = localStorage.getItem('customerQuotes')
        if (storedCustomer) {
          const parsedCust = JSON.parse(storedCustomer)
          const updatedCust = parsedCust.map(cq => {
            if (cq.id === selectedCase.quoteId || (selectedCase.shipmentId && cq.shipmentId === selectedCase.shipmentId)) {
              return {
                ...cq,
                customsApproved: false,
                status: 'REJECTED'
              }
            }
            return cq
          })
          localStorage.setItem('customerQuotes', JSON.stringify(updatedCust))
        }
      } catch {}
    }

    setSelectedCase(null)
    alert(stateMessage)
  }

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.quoteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hsCode.includes(searchQuery)
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = cases.filter(c => c.status === 'PENDING_REVIEW' || c.status === 'NEEDS_DOCUMENTS').length

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
          
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customs Compliance & Regulatory Sign-Off Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Customs Officer Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Review HS code classifications, verify required international trade documentation, inspect regulation citations, and authorize quote issuance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PENDING REVIEWS</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</span>
              </div>
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">POLICY LOCK</span>
                <span className="text-xs font-black text-emerald-400 font-mono">ACTIVE (HOLD/BLOCK)</span>
              </div>
            </div>
          </div>

          {/* Metric KPIs */}
          {/* Page 7 Required KPI Cards: Pending Reviews, Missing Documents, High Risk Cargo, Completed Today */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              title="PENDING REVIEWS"
              value={pendingCount.toString()}
              change="Requiring officer review"
              isPositive={false}
              icon={FileSearch}
              color="amber"
            />
            <DashboardCard
              title="MISSING DOCUMENTS"
              value={cases.filter(c => c.status === 'NEEDS_DOCUMENTS' || c.documents?.some(d => d.mandatory && d.status !== 'VERIFIED')).length.toString()}
              change="Scenario 7 Customs Action Req."
              isPositive={false}
              icon={AlertCircle}
              color="rose"
            />
            <DashboardCard
              title="HIGH RISK CARGO"
              value={cases.filter(c => c.priority === 'Critical' || c.riskScore > 0.4).length.toString()}
              change="HazMat / Dual-Use / Sanctions"
              isPositive={false}
              icon={AlertTriangle}
              color="indigo"
            />
            <DashboardCard
              title="COMPLETED TODAY"
              value={cases.filter(c => c.status === 'APPROVED').length.toString()}
              change="Unlocked for quotation"
              isPositive={true}
              icon={ShieldCheck}
              color="emerald"
            />
          </div>

          {/* Tab 1: Pending Reviews / Default Cases Desk */}
          {(currentTab === 'reviews' || currentTab === 'pending-reviews' || !['assigned-shipments', 'document-verification', 'customs-risk-flags', 'completed-reviews', 'notifications', 'profile'].includes(currentTab)) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    <span>Pending Customs & Regulatory Cases</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Section 5 & 10: If mandatory customs approval is not completed, quote remains in HOLD/BLOCKED state.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Case ID, HS code, commodity..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="NEEDS_DOCUMENTS">Needs Documents</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Case / Quote</th>
                      <th className="px-4 py-3">Shipper & Corridor</th>
                      <th className="px-4 py-3">HS Code & Cargo</th>
                      <th className="px-4 py-3">Valuation</th>
                      <th className="px-4 py-3">Compliance Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 font-mono">
                          <div className="font-black text-indigo-700">{c.id}</div>
                          <div className="text-[10.5px] text-slate-400">{c.quoteId}</div>
                          {c.agentApproved && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                              Agent Approved ✓
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{c.customer}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{c.origin} ➔ {c.destination}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-indigo-500" />
                            <span>{c.hsCode}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.commodity}</div>
                        </td>

                        <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                          {c.declaredValue}
                          <span className="text-[10px] text-slate-400 block font-sans">{c.incoterm}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            c.status === 'NEEDS_DOCUMENTS' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            c.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse'
                          }`}>
                            {c.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            <span>{c.status.replace('_', ' ')}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenCase(c)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Open Review Case</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Assigned Shipments Manifest */}
          {currentTab === 'assigned-shipments' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Assigned Cargo Manifest & Inbound Vessels</h3>
                  <p className="text-xs text-slate-500">Commercial container manifests under your regulatory jurisdiction.</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
                  Gate Jurisdiction: All Indian Ports
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { ref: 'SHP-1001', vessel: 'MSC Gülsün · Voy 26A', origin: 'Chennai (INMAA)', dest: 'Rotterdam (NLRTM)', cargo: '5,000 KG Electronics', status: 'Inbound EDI Filed' },
                  { ref: 'SHP-1002', vessel: 'Maersk Mc-Kinney Møller', origin: 'Nhava Sheva (INNSA)', dest: 'Jebel Ali (AEJEA)', cargo: '18,400 KG Telecom Gears', status: 'Customs Cleared' },
                  { ref: 'SHP-1005', vessel: 'CMA CGM Palais Royal', origin: 'Nhava Sheva (INNSA)', dest: 'Antwerp (BEANR)', cargo: '14,000 KG Class 3 Flammable', status: 'Secondary Physical Inspection' }
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-indigo-700 text-xs">{s.ref}</span>
                        <span className="text-xs font-bold text-slate-900">{s.vessel}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{s.origin} ➔ {s.dest} · {s.cargo}</div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] self-start sm:self-auto">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Document Verification (Scenario 7) */}
          {currentTab === 'document-verification' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Customs Document Verification & Audit Desk</h3>
                  <p className="text-xs text-slate-500">Cross-reference commercial invoices, packing lists, and mandatory certificates.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Commercial Invoice (Signed)', caseId: 'CASE-2026-081', status: 'VERIFIED', type: 'Mandatory' },
                  { name: 'Packing List with Gross Weights', caseId: 'CASE-2026-081', status: 'VERIFIED', type: 'Mandatory' },
                  { name: 'Certificate of Origin (Form AIFTA)', caseId: 'CASE-2026-081', status: 'VERIFIED', type: 'Preferential Tariff' },
                  { name: 'Dangerous Goods Material Safety Data Sheet', caseId: 'CASE-2026-082', status: 'MISSING (ACTION REQ)', type: 'Mandatory HazMat' },
                  { name: 'TDRA Equipment Registration Certificate', caseId: 'CASE-2026-083', status: 'VERIFIED', type: 'Type Approval' }
                ].map((doc, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{doc.name}</span>
                      <span className="text-[11px] text-slate-500">Case: {doc.caseId} · Category: {doc.type}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      doc.status.includes('MISSING') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Customs Risk Flags (HazMat, Dual-Use, SCOMET) */}
          {currentTab === 'customs-risk-flags' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Customs Risk Intelligence & Alerts</h3>
                  <p className="text-xs text-slate-500">Automated screening against DGFT SCOMET lists, dual-use items, and sanctions.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { tag: 'CRITICAL ALERT · HAZMAT CLASS 3', desc: 'Case CASE-2026-082: Flammable liquids declared without IMO segregation certificate.', level: 'bg-rose-50 text-rose-800 border-rose-200' },
                  { tag: 'DUAL-USE REVIEW CLEARED', desc: 'Case CASE-2026-083: Telecommunications transceivers verified non-SCOMET Category 8 standard goods.', level: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                  { tag: 'VALUATION SCRUTINY NOTICE', desc: 'Declared unit price for lithium cells is 35% below international baseline index.', level: 'bg-amber-50 text-amber-800 border-amber-200' }
                ].map((alert, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${alert.level} space-y-1`}>
                    <span className="text-[10px] font-black tracking-wider uppercase block">{alert.tag}</span>
                    <p className="text-xs">{alert.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Completed Reviews */}
          {currentTab === 'completed-reviews' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Completed Customs Regulatory Clearances</h3>
                  <p className="text-xs text-slate-500">Immutable ledger of stamped clearance sign-offs.</p>
                </div>
              </div>
              <div className="space-y-3">
                {cases.filter(c => c.status === 'APPROVED').map((c, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{c.id} · {c.quoteId}</span>
                      <span className="text-[11px] text-slate-500">{c.customer} · {c.commodity} ({c.hsCode})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-600 block">CLEARED & UNLOCKED</span>
                      <span className="text-[9px] text-slate-400 font-mono">Reviewed by {userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Customs Notifications */}
          {currentTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Customs Gateway Broadcasts</h3>
                  <p className="text-xs text-slate-500">ICEGATE EDI gateway alerts and regulatory bulletins.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'ICEGATE EDI Gateway Operational', time: '10m ago', note: 'National customs EDI server operating at 99.9% uptime. Average turnaround: 42 seconds.' },
                  { title: 'DGFT Tariff Notification #48/2026', time: '2h ago', note: 'Updated preferential duty schedules for ASEAN-India Comprehensive Economic Cooperation Agreement.' }
                ].map((n, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{n.title}</span>
                      <span className="text-[11px] text-slate-600 mt-0.5">{n.note}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 7: Customs Officer Profile */}
          {currentTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Customs Officer Credential Profile</h3>
                  <p className="text-xs text-slate-500">Government customs authority authorization & digital signature stamp.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                  Active Customs Inspector
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Officer Name</span>
                  <div className="text-sm font-black text-slate-900">{userName}</div>
                  <span className="text-xs text-slate-500">Appraiser / Customs Regulatory Inspector</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Customs Jurisdiction</span>
                  <div className="text-sm font-black text-slate-900">JNPT, Chennai Port, Delhi IGI Airport</div>
                  <span className="text-xs text-slate-500">Central Board of Indirect Taxes & Customs (CBIC)</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Digital Signature Token</span>
                  <div className="text-sm font-black font-mono text-slate-900">DSC-CLASS-3-GOV-91024</div>
                  <span className="text-xs text-emerald-600 font-semibold">Valid & Online (ICEGATE Verified)</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Regulatory Powers</span>
                  <div className="text-sm font-black text-slate-900">Customs Tariff Act (1975) Section 17 & 18</div>
                  <span className="text-xs text-slate-500">Assessment, Examination & Hold Authority</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: COMPLIANCE CASE REVIEW & SIGN-OFF */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    <span className="font-mono font-black text-xs text-indigo-600">COMPLIANCE DOSSIER</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Case {selectedCase.id} · {selectedCase.quoteId}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCase.customer} · {selectedCase.origin} ➔ {selectedCase.destination}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AI Risk & Classification Findings */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
                  <span>AI Automated Customs Pre-Screen:</span>
                  <span className="font-mono text-emerald-400">Risk Score: {selectedCase.riskScore}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {selectedCase.aiFindings}
                </p>
              </div>

              {/* Statutory Regulation Citations */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Applicable Statutory Regulations & Legal Evidence:
                </span>
                <div className="space-y-1.5">
                  {selectedCase.regulations.map((reg, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{reg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Verification Checklist */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Required International Trade Documentation Checklist:
                </span>
                <div className="space-y-1.5">
                  {selectedCase.documents.map((doc, idx) => {
                    const isVerified = doc.status === 'VERIFIED'
                    const isMissing = doc.status === 'MISSING' || doc.status === 'PENDING_UPLOAD'

                    return (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-3.5 h-3.5 ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span className="font-semibold text-slate-900">{doc.name}</span>
                          {doc.mandatory && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Officer Notes & Decision Input */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-bold text-slate-800 uppercase text-[11px]">
                  Customs Officer Findings & Sign-Off Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter statutory inspection remarks or document requirement instructions..."
                  value={decisionNotes}
                  onChange={e => setDecisionNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons (Section 5 Spec) */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDecision('REJECT')}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reject & Block Quote
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('REQUEST_DOCUMENTS')}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Request Documents (HOLD)
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('CONDITIONAL')}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Conditional Approval
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('APPROVE')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Authorize Issuance</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
