import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu,
  Navigation,
  DollarSign,
  CloudRain,
  Building2,
  ShieldCheck,
  Scale,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  FileText,
  Truck,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'

const AGENT_COUNCIL = [
  {
    id: 'agent-route',
    name: 'Route Intelligence Agent',
    role: 'Corridor & Port Congestion Specialist',
    icon: Navigation,
    color: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-400',
    desc: 'Analyzes nautical miles, optimal maritime corridors, and transshipment hubs.'
  },
  {
    id: 'agent-pricing',
    name: 'Pricing & Market Intelligence Agent',
    role: 'Carrier Spot Rates & BAF Surcharges',
    icon: DollarSign,
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    desc: 'Predicts dynamic linehaul rates and calculates fuel adjustment factors (BAF).'
  },
  {
    id: 'agent-risk',
    name: 'Risk & Weather Compliance Agent',
    role: 'Voyage Hazards & Chokepoint Alerts',
    icon: CloudRain,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    desc: 'Monitors ocean weather hazards, Red Sea/Suez bottlenecks, and port dwell times.'
  },
  {
    id: 'agent-carriers',
    name: 'Forwarder Bidding Desks',
    role: 'Autonomous Carrier Quotation Desks',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    desc: 'Autonomous quoting from OceanLink (CMP-101), GlobalSea (CMP-102), and FastRoute (CMP-103).'
  },
  {
    id: 'agent-verification',
    name: 'Company Operations Agent (AGT-204)',
    role: '9-Point Operational Verification Desk',
    icon: ShieldCheck,
    color: 'from-indigo-600 to-purple-600',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-400',
    desc: 'Validates shipment capacity, equipment availability, and commercial tariff sanity.'
  },
  {
    id: 'agent-customs',
    name: 'Customs Officer (Officer R. Verma)',
    role: 'Statutory Border & Regulatory Compliance',
    icon: Scale,
    color: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-400',
    desc: 'Audits HS codes, ICEGATE shipping bills, and authorizes statutory customs clearance.'
  },
  {
    id: 'agent-customer',
    name: 'Customer Shipper Representative',
    role: 'Shipper Budget & Final Confirmation Desk',
    icon: UserCheck,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    desc: 'Selects optimal quote option, evaluates price revisions, and executes final booking.'
  }
]

export default function MultiAgentStudio() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const [activeScenario, setActiveScenario] = useState('HAPPY_PATH') // 'HAPPY_PATH', 'PRICE_REVISION', 'CAPACITY_REJECT', 'MISSING_DOCS'
  const [isRunning, setIsRunning] = useState(false)
  const [simulationData, setSimulationData] = useState(null)
  const [activeStepIndex, setActiveStepIndex] = useState(-1)
  const [logs, setLogs] = useState([])
  const logContainerRef = useRef(null)

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, activeStepIndex])

  // Run Multi-Agent Simulation
  const handleRunSimulation = async (scenarioKey = activeScenario) => {
    setIsRunning(true)
    setActiveStepIndex(0)
    setLogs([])

    try {
      // Call backend multi-agent simulation endpoint
      const res = await fetch(`${API_BASE_URL}/api/v1/multi-agent/simulate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_key: scenarioKey })
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          playStepByStep(json.data)
          return
        }
      }
    } catch (err) {
      console.warn('Backend simulation call fallback to local cognitive runner:', err)
    }

    // High-fidelity fallback cognitive simulation matching Page 14-15
    const fallbackData = generateFallbackSimulation(scenarioKey)
    playStepByStep(fallbackData)
  }

  const playStepByStep = (data) => {
    setSimulationData(data)
    const steps = data.steps || []

    let currentIdx = 0
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        const currentStep = steps[currentIdx]
        setActiveStepIndex(currentIdx)

        if (currentStep.logs) {
          setLogs(prev => [...prev, ...currentStep.logs])
        }

        currentIdx++
      } else {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 1200)
  }

  const generateFallbackSimulation = (scenarioKey) => {
    const isRevision = scenarioKey === 'PRICE_REVISION'
    const isReject = scenarioKey === 'CAPACITY_REJECT'
    const isMissingDocs = scenarioKey === 'MISSING_DOCS'

    return {
      scenario: scenarioKey,
      final_status: isReject ? 'REJECTED' : isMissingDocs ? 'AWAITING_CUSTOMER_INFO' : 'BOOKING_CONFIRMED',
      booking_reference: (isReject || isMissingDocs) ? null : 'BK-2026-10045',
      final_price: isRevision ? 82500 : 80000,
      steps: [
        {
          step_number: 1,
          step_name: 'Step 1: Customer Enquiry & AI Multi-Agent Deliberation',
          actor: 'AI Multi-Agent Council',
          status: 'QUOTE_OPTIONS_AVAILABLE',
          description: 'Route Agent identified East-West maritime corridor (8,240 NM). Pricing Agent calculated BAF fuel index. 3 Carrier Agents formulated competitive quotes.',
          logs: [
            {
              agent_name: 'Route Intelligence Agent',
              role: 'Maritime Routing',
              stage: 'Corridor Optimization',
              thought: 'Evaluated corridor Chennai ➔ Rotterdam. Distance: 8,240 NM. Identified Colombo transshipment loop via Suez Canal.',
              confidence: 0.98,
              timestamp: '15:42:01Z'
            },
            {
              agent_name: 'Pricing & Market Intelligence Agent',
              role: 'Rate Engine',
              stage: 'Rate Baseline',
              thought: 'Applied spot container haulage tariff for 5,000 KG electronics. BAF fuel index applied at 8.5%. Baseline rate computed at ₹80,000.',
              confidence: 0.96,
              timestamp: '15:42:02Z'
            },
            {
              agent_name: 'Forwarder Bidding Desks',
              role: 'Carrier Desks',
              stage: 'Quotation Generation',
              thought: 'OceanLink (QT-5001: ₹85,000), GlobalSea (QT-5002: ₹80,000), FastRoute (QT-5003: ₹92,000) formulated bids.',
              confidence: 0.97,
              timestamp: '15:42:03Z'
            }
          ]
        },
        {
          step_number: 2,
          step_name: 'Step 2: Customer Quote Selection & Carrier Assignment',
          actor: 'Customer (ABC Electronics Pvt Ltd)',
          status: 'PENDING_COMPANY_VERIFICATION',
          description: 'Customer selected GlobalSea Freight (QT-5002 at ₹80,000). Request dispatched exclusively to GlobalSea agent AGT-204.',
          logs: [
            {
              agent_name: 'Customer Shipper Representative',
              role: 'Shipper Desk',
              stage: 'Quote Selection',
              thought: 'Selected GlobalSea Freight (QT-5002) for ₹80,000 with 28 days transit. Dispatched to AGT-204 queue.',
              confidence: 0.99,
              timestamp: '15:42:04Z'
            }
          ]
        },
        {
          step_number: 3,
          step_name: isRevision 
            ? 'Step 3: Company Agent Price Revision (Bunker Surcharge)'
            : isReject 
            ? 'Step 3: Company Agent Capacity Rejection'
            : isMissingDocs
            ? 'Step 3: Company Agent Requests Missing Information'
            : 'Step 3: Company Agent Operational Verification & Approval',
          actor: 'Company Agent (AGT-204 · GlobalSea)',
          status: isRevision ? 'REVISION_PENDING_CUSTOMER' : isReject ? 'REJECTED' : isMissingDocs ? 'AWAITING_CUSTOMER_INFO' : 'PENDING_CUSTOMS_APPROVAL',
          description: isRevision
            ? 'Agent verified capacity and route, but noted fuel surcharge surge (+₹2,500). Revised price from ₹80,000 to ₹82,500. Sent to Customer.'
            : isReject
            ? 'Agent rejected request due to vessel feeder capacity fully booked for the requested sailing week.'
            : isMissingDocs
            ? 'Agent flagged missing Certificate of Origin and signed Commercial Invoice.'
            : 'All 9 operational checklist items verified! Forwarded to Customs Officer for statutory regulatory review.',
          checklist: {
            shipment: { label: 'Shipment Origin/Destination/Cargo', passed: true, remarks: 'Valid Chennai ➔ Rotterdam corridor.' },
            cargo: { label: 'Cargo Weight & Volume Specs', passed: true, remarks: '5,000 KG Electronics confirmed.' },
            capacity: { label: 'Container/Vessel Allocation', passed: !isReject, remarks: isReject ? 'Feeder space fully booked.' : '40 FT container space confirmed.' },
            route: { label: 'Operational Corridor Feasibility', passed: true, remarks: 'Feeder via Colombo active.' },
            schedule: { label: 'Pickup & Sailing Schedule', passed: true, remarks: 'Sailing departure Sep 14 confirmed.' },
            documents: { label: 'Commercial Invoice & Packing List', passed: !isMissingDocs, remarks: isMissingDocs ? 'Missing signed invoice.' : 'Complete documentation uploaded.' },
            commercial: { label: 'Base Rate & Surcharges Check', passed: !isRevision, remarks: isRevision ? 'Bunker fuel surcharge rose +3.1%.' : 'Tariff rates verified.' },
            risk_context: { label: 'Voyage Risk Context', passed: true, remarks: 'Monsoon advisories acknowledged.' },
            quote_validity: { label: 'Quote Validity Window', passed: true, remarks: 'Quote valid for 7 days.' }
          },
          logs: [
            {
              agent_name: 'Company Operations Agent (AGT-204)',
              role: 'GlobalSea Operations',
              stage: '9-Point Operational Verification',
              thought: isRevision 
                ? 'Checklist evaluated. Adjusted price ₹80,000 ➔ ₹82,500 due to fuel surcharge increase. Sent revision to shipper.'
                : isReject
                ? 'Feeder vessel space depleted. Cannot guarantee connection. Rejected request.'
                : isMissingDocs
                ? 'Missing signed Commercial Invoice. Status updated to AWAITING_CUSTOMER_INFO.'
                : 'All 9 checklist points PASSED. Forwarding to Customs Officer desk for statutory regulatory clearance.',
              confidence: 0.98,
              timestamp: '15:42:06Z'
            }
          ]
        },
        ...(isRevision ? [
          {
            step_number: 4,
            step_name: 'Step 4: Customer Revision Review & Acceptance',
            actor: 'Customer (ABC Electronics Pvt Ltd)',
            status: 'PENDING_CUSTOMS_APPROVAL',
            description: 'Customer evaluated the +₹2,500 adjustment reason ("Fuel surcharge increase") and ACCEPTED! Forwarded to Customs Officer.',
            logs: [
              {
                agent_name: 'Customer Shipper Representative',
                role: 'Shipper Desk',
                stage: 'Revision Review',
                thought: 'Revised price ₹82,500 (+3.1%) within budget tolerance band. Revision ACCEPTED. Sent to Customs Officer.',
                confidence: 0.95,
                timestamp: '15:42:07Z'
              }
            ]
          }
        ] : []),
        ...(!isReject && !isMissingDocs ? [
          {
            step_number: isRevision ? 5 : 4,
            step_name: 'Step 4: Customs Officer Regulatory Clearance',
            actor: 'Customs Officer (Officer R. Verma)',
            status: 'VERIFIED_PENDING_CUSTOMER',
            description: 'Customs inspected ICEGATE electronic shipping bill, verified HS 8504 dual-use classification, and GRANTED regulatory clearance CUS-2026-10045! Sent to Customer for final booking confirmation.',
            clearance_id: 'CUS-2026-10045',
            logs: [
              {
                agent_name: 'Customs Officer (Officer R. Verma)',
                role: 'Statutory Regulatory Officer',
                stage: 'Customs Clearance Authorization',
                thought: 'HS 8504.40.90 verified. ICEGATE export declaration authorized. Clearance granted (CUS-2026-10045). Ready for customer sign-off.',
                confidence: 0.99,
                timestamp: '15:42:08Z'
              }
            ]
          },
          {
            step_number: isRevision ? 6 : 5,
            step_name: 'Step 5: Customer Final Review & Confirmed Booking',
            actor: 'Customer (ABC Electronics Pvt Ltd)',
            status: 'BOOKING_CONFIRMED',
            description: 'Customer inspected fully verified package (Company Agent Verified + Customs Officer Cleared) and clicked APPROVE! Confirmed Booking Reference BK-2026-10045 issued.',
            booking_reference: 'BK-2026-10045',
            logs: [
              {
                agent_name: 'Customer Shipper Representative',
                role: 'Final Booking Sign-Off',
                stage: 'Confirmed Booking',
                thought: 'Verified package accepted. Booking confirmed with GlobalSea Freight: BK-2026-10045.',
                confidence: 1.0,
                timestamp: '15:42:09Z'
              }
            ]
          }
        ] : [])
      ]
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight">
                  Autonomous Multi-Agent Freight Council
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  7 Agents Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                  Milestone 4 Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cooperative Multi-Agent Intelligence · Customer ➔ Company Agent ➔ Customs Officer ➔ Customer Final Approval
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRunSimulation(activeScenario)}
              disabled={isRunning}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                isRunning 
                  ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-500/25 active:scale-95'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
              <span>{isRunning ? 'Deliberating Council...' : 'Run Council Deliberation'}</span>
            </button>
          </div>
        </header>

        {/* Studio Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Agents Council Topology */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-black uppercase text-slate-300 tracking-wider">
                  Active Multi-Agent Council Desks
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Autonomous Cooperating Desks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {AGENT_COUNCIL.map(agent => {
                const Icon = agent.icon
                return (
                  <div
                    key={agent.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2 relative group overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <div>
                      <div className="font-bold text-xs text-white leading-tight">{agent.name}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${agent.textColor}`}>{agent.role}</div>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {agent.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preset Scenario Selector (From Page 14-15 of Specification) */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Milestone 4 Scenario Presets (Specification Page 14 & 15)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    SHP-1001 · Chennai ➔ Rotterdam · 5,000 KG Electronics
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a business condition to observe how the multi-agent council negotiates, verifies, and confirms bookings:
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: 'HAPPY_PATH', label: '1. Happy Path Approval', badge: 'Full Approval' },
                  { id: 'PRICE_REVISION', label: '2. Price Revision (Fuel Surcharge)', badge: '₹80k ➔ ₹82.5k' },
                  { id: 'CAPACITY_REJECT', label: '3. Capacity Rejection', badge: 'Vessel Full' },
                  { id: 'MISSING_DOCS', label: '4. Missing Documents', badge: 'Audit Hold' }
                ].map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScenario(sc.id)
                      handleRunSimulation(sc.id)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      activeScenario === sc.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{sc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Grid: Deliberation Timeline + 9-Point Verification Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Step-by-Step Deliberation Timeline */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-black text-white">4-Step Sequential Approval Chain</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {simulationData ? `${(simulationData.steps || []).length} Stages Executed` : 'Ready to Run'}
                  </span>
                </div>

                {simulationData ? (
                  <div className="space-y-4">
                    {(simulationData.steps || []).map((step, idx) => {
                      const isCurrent = activeStepIndex === idx
                      const isPast = activeStepIndex > idx
                      return (
                        <div
                          key={step.step_number}
                          className={`p-4 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                              : isPast
                              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                              : 'bg-slate-950/40 border-slate-900 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                                  step.status === 'BOOKING_CONFIRMED'
                                    ? 'bg-emerald-500 text-white'
                                    : step.status === 'REJECTED'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-indigo-600 text-white'
                                }`}>
                                  {step.step_number}
                                </span>
                                <h4 className="font-bold text-xs text-white">{step.step_name}</h4>
                              </div>
                              <span className="text-[10px] font-semibold text-indigo-300 block">
                                Actor: {step.actor}
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                                {step.description}
                              </p>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono shrink-0 ${
                              step.status === 'BOOKING_CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              step.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              step.status === 'REVISION_PENDING_CUSTOMER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {step.status}
                            </span>
                          </div>

                          {/* Confirmed Booking Reference Banner */}
                          {step.booking_reference && (
                            <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="font-bold text-emerald-200">
                                  Official Booking Reference: <strong className="font-mono text-emerald-300">{step.booking_reference}</strong>
                                </span>
                              </div>
                              <span className="font-mono font-black text-white">₹80,000 / ₹82,500</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">
                      Council Deliberation is Idle. Click "Run Council Deliberation" above to start.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: 9-Point Checklist & Cognitive Thoughts Stream */}
            <div className="lg:col-span-5 space-y-4">
              {/* 9-Point Verification Checklist Matrix (Page 6 of Specification) */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      9-Point Company Verification Checklist
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Agent AGT-204</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'shipment', label: '1. Shipment Origin, Destination, Cargo & Date', defaultPassed: true },
                    { id: 'cargo', label: '2. Cargo Weight, Volume & Special Handling', defaultPassed: true },
                    { id: 'capacity', label: '3. Container / Feeder Vessel Capacity', defaultPassed: activeScenario !== 'CAPACITY_REJECT' },
                    { id: 'route', label: '4. Operational Corridor Feasibility', defaultPassed: true },
                    { id: 'schedule', label: '5. Pickup Window & Sailing ETA', defaultPassed: true },
                    { id: 'documents', label: '6. Commercial Invoice & Customs Packing List', defaultPassed: activeScenario !== 'MISSING_DOCS' },
                    { id: 'commercial', label: '7. Commercial Base Rate & Fuel Surcharges', defaultPassed: activeScenario !== 'PRICE_REVISION' },
                    { id: 'risk_context', label: '8. Voyage Weather & Red Sea Risk Context', defaultPassed: true },
                    { id: 'quote_validity', label: '9. Quote Validity Window (7-Day Lock)', defaultPassed: true }
                  ].map(item => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        item.defaultPassed
                          ? 'bg-slate-950/60 border-emerald-900/40 text-slate-200'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      }`}
                    >
                      <span className="font-medium text-[11px]">{item.label}</span>
                      {item.defaultPassed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center gap-1 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span>PASSED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black flex items-center gap-1 border border-rose-500/30">
                          <X className="w-3 h-3" />
                          <span>DISCREPANCY</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cognitive Agent Thoughts Stream */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      Live Cognitive Agent Thoughts
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{logs.length} entries</span>
                </div>

                <div ref={logContainerRef} className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
                  {logs.length > 0 ? (
                    logs.map((log, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-indigo-400 font-bold text-[11px]">{log.agent_name}</strong>
                          <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block">Stage: {log.stage}</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          "{log.thought}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs text-center py-6">
                      Awaiting deliberation logs...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
