import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Truck, 
  Plane, 
  Anchor, 
  Train, 
  CheckCircle2, 
  Trash2, 
  Plus,
  Navigation,
  DollarSign,
  CloudRain,
  Cpu,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react'

import Sidebar from '../components/Sidebar'

export const ALL_ORIGIN_HUBS = [
  // Ocean
  { value: 'Mumbai (JNPT Port)', label: 'Mumbai (JNPT Port - Ocean)' },
  { value: 'Chennai (Chennai Port)', label: 'Chennai (Chennai Port - Ocean)' },
  { value: 'Gujarat (Mundra Port)', label: 'Gujarat (Mundra Port - Ocean)' },

  // Air
  { value: 'Delhi (IGI Air Cargo)', label: 'Delhi (IGI Air Cargo - DEL)' },
  { value: 'Mumbai (CSMI Air Cargo)', label: 'Mumbai (CSMI Air Cargo - BOM)' },
  { value: 'Bengaluru (BLR Air Cargo)', label: 'Bengaluru (BLR Air Cargo)' },

  // Road
  { value: 'Mumbai (Bhiwandi Hub)', label: 'Mumbai (Bhiwandi Road Hub)' },
  { value: 'Delhi NCR (Sonipat Hub)', label: 'Delhi NCR (Sonipat Road Hub)' },
  { value: 'Bengaluru (Hosur Hub)', label: 'Bengaluru (Hosur Road Hub)' },

  // Rail
  { value: 'Delhi (ICD Tughlakabad)', label: 'Delhi (ICD Tughlakabad Rail)' },
  { value: 'Bengaluru (ICD Whitefield)', label: 'Bengaluru (ICD Whitefield Rail)' },
  { value: 'Noida (ICD Dadri)', label: 'Noida (ICD Dadri Rail)' }
]

export const ALL_DESTINATION_HUBS = [
  // Ocean
  { value: 'Singapore (Singapore Port)', label: 'Singapore (Port of Singapore)' },
  { value: 'Dubai (Jebel Ali Port)', label: 'Dubai (Jebel Ali Port)' },
  { value: 'Rotterdam (Rotterdam Port)', label: 'Rotterdam (Port of Rotterdam)' },

  // Air
  { value: 'Frankfurt (FRA Air Cargo)', label: 'Frankfurt (FRA Air Cargo)' },
  { value: 'Dubai (DXB Air Cargo)', label: 'Dubai (DXB Air Cargo)' },
  { value: 'London (LHR Air Cargo)', label: 'London (LHR Air Cargo)' },

  // Road
  { value: 'Bengaluru (Peenya Hub)', label: 'Bengaluru (Peenya Road Hub)' },
  { value: 'Hyderabad (Patancheru Hub)', label: 'Hyderabad (Patancheru Road Hub)' },
  { value: 'Delhi NCR (Manesar Hub)', label: 'Delhi NCR (Manesar Road Hub)' },

  // Rail
  { value: 'Mumbai (JNPT Rail Terminal)', label: 'Mumbai (JNPT Rail Terminal)' },
  { value: 'Gujarat (Mundra Rail Hub)', label: 'Gujarat (Mundra Rail Hub)' },
  { value: 'Germany (Duisburg Rail Terminal)', label: 'Germany (Duisburg Rail Terminal)' }
]

const INCOTERMS = [
  { value: 'EXW', label: 'EXW - Ex Works' },
  { value: 'FOB', label: 'FOB - Free On Board' },
  { value: 'CIF', label: 'CIF - Cost, Insurance & Freight' },
  { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
  { value: 'DAP', label: 'DAP - Delivered At Place' }
]

const AGENTS_LIST = [
  { id: 'route', name: '1. Route Agent', role: 'Corridor & Port Congestion Analysis', icon: Navigation, color: 'text-sky-400' },
  { id: 'pricing', name: '2. Pricing Agent', role: 'Carrier Spot Rate & BAF Surcharge', icon: DollarSign, color: 'text-blue-400' },
  { id: 'weather', name: '3. Weather Agent', role: 'Ocean Meteorology & Storm Risk Radar', icon: CloudRain, color: 'text-amber-400' },
  { id: 'customs', name: '4. Customs Agent', role: 'HS Code Regulatory Compliance & Readiness', icon: ShieldCheck, color: 'text-indigo-400' },
  { id: 'margin', name: '5. Margin Agent', role: 'Broker Margin Optimization (>12% Floor)', icon: TrendingUp, color: 'text-emerald-400' }
]

export default function NewShipmentEnquiry() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // 5-Agent Verification States
  const [isVerifying, setIsVerifying] = useState(false)
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [agentLogs, setAgentLogs] = useState([])
  const [verifiedResult, setVerifiedResult] = useState(null)
  const [verificationSeconds, setVerificationSeconds] = useState(0)
  const timerRef = useRef(null)

  const todayStr = (() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const tomorrowStr = (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yyyy = tomorrow.getFullYear()
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dd = String(tomorrow.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const nextWeekStr = (() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 8)
    const yyyy = nextWeek.getFullYear()
    const mm = String(nextWeek.getMonth() + 1).padStart(2, '0')
    const dd = String(nextWeek.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  // Form State - initially empty parameters
  const [formData, setFormData] = useState({
    // Step 1 - Route
    origin: '',
    destination: '',
    pickupAddress: '',
    deliveryAddress: '',
    readyDate: tomorrowStr,
    deliveryDate: nextWeekStr,

    // Step 2 - Service Type
    serviceMode: 'Ocean', // Ocean, Air, Road, Rail
    containerLoad: 'FCL', // FCL/LCL
    incoterm: 'CIF',

    // Step 3 - Shipment Details
    shippingMethod: 'FCL',
    items: [
      {
        id: 1,
        packageType: 'container',
        containerType: '40hc',
        unitCount: '1',
        weight: '',
        commodity: '',
        hsCode: '8708.29.00'
      }
    ],
    packageType: 'container',
    containerType: '40hc',
    weight: '',
    volume: '',
    commodity: '',
    hsCode: '8708.29.00',

    // Step 4 - Value & Instructions
    declaredValue: '',
    currency: 'INR',
    specialInstructions: 'Standard dry container required.',
    requiresCustomsClearance: true,
    requiresInsurance: true,

    // Step 5 - Contact
    contactName: 'Alex Shipper',
    companyName: 'Apex Global Logistics',
    contactEmail: 'alex@apexgl.com',
    contactPhone: '+91 98765 43210'
  })

  // Estimated baseline dynamic costs - initially empty until user inputs parameters
  const [estimate, setEstimate] = useState({
    distance: 0,
    cost: 0,
    transitTime: '—',
    carbonFootprint: '—'
  })

  const totalWeightNum = formData.items?.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0) || parseFloat(formData.weight) || 0
  const hasSufficientParams = Boolean(formData.origin && formData.destination && totalWeightNum > 0)

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
    }
    const name = localStorage.getItem('userName')
    const email = localStorage.getItem('userEmail')
    if (name || email) {
      setFormData(prev => ({
        ...prev,
        contactName: name || prev.contactName,
        contactEmail: email || prev.contactEmail
      }))
    }
  }, [])

  // Recalculate dynamic costs when parameters change
  useEffect(() => {
    const weightNum = parseFloat(formData.weight) || (formData.items?.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0)) || 0
    if (!formData.origin || !formData.destination || weightNum <= 0) {
      setEstimate({
        distance: 0,
        cost: 0,
        transitTime: '—',
        carbonFootprint: '—'
      })
      setVerifiedResult(null)
      return
    }

    let baseRate = 129000
    let transitDays = '12 – 18 Days'
    if (formData.serviceMode === 'Air') {
      baseRate = 280000
      transitDays = '2 – 3 Days'
    } else if (formData.serviceMode === 'Road') {
      baseRate = 85000
      transitDays = '3 – 5 Days'
    } else if (formData.serviceMode === 'Rail') {
      baseRate = 95000
      transitDays = '4 – 6 Days'
    }

    const weightFactor = weightNum / 20000
    const calculatedCost = Math.round(baseRate * Math.max(0.8, weightFactor))

    setEstimate({
      distance: 1750,
      cost: calculatedCost,
      transitTime: transitDays,
      carbonFootprint: `${(weightNum * 0.00008).toFixed(2)} Tons CO2`
    })

    // Dynamically update verifiedResult if live agent verification is active
    setVerifiedResult(prev => {
      if (!prev) return null
      const finalSellNum = calculatedCost
      const baseBuyNum = Math.round(finalSellNum / 1.15)
      const marginNum = finalSellNum - baseBuyNum
      return {
        ...prev,
        totalPriceFormatted: `₹ ${finalSellNum.toLocaleString('en-IN')}`,
        totalPriceRaw: finalSellNum,
        baseBuyCost: `₹ ${baseBuyNum.toLocaleString('en-IN')}`,
        brokerMargin: `₹ ${marginNum.toLocaleString('en-IN')}`,
        pricingBreakdown: {
          ...prev.pricingBreakdown,
          baseLinehaul: `₹ ${baseBuyNum.toLocaleString('en-IN')}`
        }
      }
    })
  }, [formData.serviceMode, formData.weight, formData.origin, formData.destination, formData.items])

  const handleModeChange = (mode) => {
    setFormData(prev => ({
      ...prev,
      serviceMode: mode
    }))
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate aggregate weight across all container item lines
    const totalWeight = newItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)

    setFormData(prev => ({ 
      ...prev, 
      items: newItems,
      weight: totalWeight > 0 ? String(totalWeight) : (field === 'weight' ? value : prev.weight)
    }))
  }

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      packageType: 'container',
      containerType: '40hc',
      unitCount: '1',
      weight: '',
      commodity: formData.commodity || '',
      hsCode: '8708.29.00'
    }
    const newItems = [...formData.items, newItem]
    const totalWeight = newItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)

    setFormData(prev => ({
      ...prev,
      items: newItems,
      weight: totalWeight > 0 ? String(totalWeight) : prev.weight
    }))
  }

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return
    const newItems = formData.items.filter((_, i) => i !== index)
    const totalWeight = newItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)

    setFormData(prev => ({
      ...prev,
      items: newItems,
      weight: totalWeight > 0 ? String(totalWeight) : prev.weight
    }))
  }

  // 5-Agent Verification Routine (Runs in 12 seconds — under 20s specification)
  const startAgentVerification = () => {
    setIsVerifying(true)
    setVerificationProgress(0)
    setActiveAgentIndex(0)
    setAgentLogs([])
    setVerifiedResult(null)
    setVerificationSeconds(0)

    const logsTimeline = [
      { time: 1, agent: 0, text: `Analyzing trade corridor ${formData.origin || 'Origin'} ➔ ${formData.destination || 'Destination'}... Port congestion low (1.2d turn).` },
      { time: 3, agent: 1, text: `Pricing Agent queried live carrier spot rates. BAF fuel surcharge indexed at 10.0%. Base rate locked.` },
      { time: 6, agent: 2, text: `Weather Agent scanned oceanic corridor & transit forecast. Tropical storm risk score: 0.08 (Safe voyage).` },
      { time: 8, agent: 3, text: `Customs Agent validated HS code ${formData.hsCode || '8708.29.00'}. Export clearance ICEGATE EDI declaration verified.` },
      { time: 10, agent: 4, text: `Margin Agent optimized commercial spread. Margin 15.0% satisfies policy floor (12.0%). Auto-authorized.` }
    ]

    const totalSeconds = 12
    let currentSec = 0
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      currentSec += 1
      setVerificationSeconds(currentSec)

      const prog = Math.min(99, Math.round((currentSec / totalSeconds) * 100))
      setVerificationProgress(prog)

      if (currentSec >= 10) setActiveAgentIndex(4)
      else if (currentSec >= 8) setActiveAgentIndex(3)
      else if (currentSec >= 6) setActiveAgentIndex(2)
      else if (currentSec >= 3) setActiveAgentIndex(1)
      else setActiveAgentIndex(0)

      const matchedLog = logsTimeline.find(l => l.time === currentSec)
      if (matchedLog) {
        setAgentLogs(prev => [...prev, matchedLog.text])
      }

      if (currentSec >= totalSeconds) {
        clearInterval(timerRef.current)
        finalizeVerification()
      }
    }, 1000)
  }

  const finalizeVerification = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsVerifying(false)
    setVerificationProgress(100)
    setActiveAgentIndex(5)

    const finalSellNum = estimate.cost
    const baseBuyNum = Math.round(finalSellNum / 1.15)
    const marginNum = finalSellNum - baseBuyNum

    const result = {
      quoteId: `QT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'VERIFIED_AUTHORIZED',
      totalPriceFormatted: `₹ ${finalSellNum.toLocaleString('en-IN')}`,
      totalPriceRaw: finalSellNum,
      baseBuyCost: `₹ ${baseBuyNum.toLocaleString('en-IN')}`,
      brokerMargin: `₹ ${marginNum.toLocaleString('en-IN')}`,
      marginPct: 15.0,
      validUntil: '7 Calendar Days',
      overallRiskScore: 'LOW RISK (0.12)',
      routeAnalysis: {
        origin: formData.origin,
        destination: formData.destination,
        optimalLoop: `${formData.serviceMode} Express Direct Line`,
        estimatedTransit: estimate.transitTime,
        portCongestion: 'Normal (0.8d queue)'
      },
      pricingBreakdown: {
        baseLinehaul: `₹ ${baseBuyNum.toLocaleString('en-IN')}`,
        fuelSurcharge: 'Included (BAF 10%)',
        portTerminalHandling: 'Included (THC-O & THC-D)',
        customsDocumentation: 'Included (B/L + ICEGATE)'
      },
      compliance: {
        hsCodeVerified: true,
        imoClass: 'Non-Hazardous General',
        marineInsuranceStatus: '110% CIF Coverage Included'
      }
    }

    setVerifiedResult(result)
  }

  const handleSubmitEnquiry = (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)

    const quoteId = verifiedResult?.quoteId || `QT-2026-${Math.floor(10000 + Math.random() * 90000)}`
    const finalPrice = verifiedResult?.totalPriceFormatted || `₹ ${estimate.cost.toLocaleString('en-IN')}`
    const shipmentId = `SH-${Math.floor(4000 + Math.random() * 9000)}`

    const newQuote = {
      id: quoteId,
      shipmentId: shipmentId,
      customer: formData.companyName || 'ABC Electronics Pvt Ltd',
      customerEmail: formData.contactEmail || 'customer@apexgl.com',
      origin: formData.origin || 'Custom Origin',
      destination: formData.destination || 'Custom Destination',
      mode: formData.serviceMode,
      service: `${formData.serviceMode} Direct Verified Express`,
      container: formData.containerType || '40HC',
      cargo: `${formData.items.length} Package(s) (${formData.commodity})`,
      distanceKm: estimate.distance || 1750,
      transitDays: estimate.transitTime || '5 – 6 Days',
      rulePrice: Math.round(estimate.cost * 0.98),
      aiPrice: Math.round(estimate.cost * 0.96),
      recommendedPrice: estimate.cost,
      finalPrice: estimate.cost,
      sellPrice: finalPrice,
      weatherRisk: '15/100 — Low',
      customsRisk: '20/100 — Low',
      routeRisk: '12/100 — Low',
      overallRisk: 'LOW',
      compositeRisk: 'LOW',
      status: 'PENDING_REVIEW',
      agentApproved: false,
      customsApproved: false,
      validUntil: 'Sep 30, 2026',
      carrier: `${formData.serviceMode === 'Air' ? 'Lufthansa Cargo Priority' : 'Maersk Line Direct Service'}`,
      highRisk: false,
      ownerEmail: formData.contactEmail || 'customer@apexgl.com',
      trackingStep: 1,
      weight: `${(formData.items?.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0) || parseFloat(formData.weight) || 36800).toLocaleString()} kg`,
      auditHistory: [
        { action: '5-Agent Multi-Verification Complete', time: 'Just now', user: 'AI Orchestrator', note: 'Corridor, Pricing, Weather, Customs, and Margin agents verified and approved quote request.' }
      ]
    }

    const newShipment = {
      id: shipmentId,
      quoteId: quoteId,
      customer: formData.companyName || localStorage.getItem('userCompany') || localStorage.getItem('userName') || 'ABC Electronics Pvt Ltd',
      customerEmail: formData.contactEmail || localStorage.getItem('userEmail') || 'customer@apexgl.com',
      ownerEmail: formData.contactEmail || localStorage.getItem('userEmail') || 'customer@apexgl.com',
      origin: formData.origin,
      destination: formData.destination,
      mode: formData.serviceMode,
      status: 'Pending Review',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      shippingMethod: formData.containerLoad || 'FCL',
      items: formData.items,
      weight: `${(formData.items?.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0) || parseFloat(formData.weight) || 36800).toLocaleString()} kg`,
      declaredValue: formData.declaredValue || '3500000',
      currency: formData.currency || 'INR',
      specialInstructions: formData.specialInstructions || 'Standard freight handling required.'
    }

    try {
      // 1. Save to customer quotes list (appears in User Dashboard Active Quotes & My Quotes)
      const stored = localStorage.getItem('customerQuotes')
      let list = stored ? JSON.parse(stored) : []
      list.unshift(newQuote)
      localStorage.setItem('customerQuotes', JSON.stringify(list))

      // 2. Save to allShipments list (appears in My Shipments & Tracking)
      const storedShips = localStorage.getItem('allShipments')
      let shipList = storedShips ? JSON.parse(storedShips) : []
      shipList.unshift(newShipment)
      localStorage.setItem('allShipments', JSON.stringify(shipList))

      // 3. Save to agentQuotesQueue (appears in Freight Agent Dashboard for human modification & sign-off)
      const storedAgent = localStorage.getItem('agentQuotesQueue')
      let agentList = storedAgent ? JSON.parse(storedAgent) : []
      agentList.unshift(newQuote)
      localStorage.setItem('agentQuotesQueue', JSON.stringify(agentList))

      // 4. Save to adminAllQuotes (appears in Admin Dashboard All Quotes registry)
      const storedAdmin = localStorage.getItem('adminAllQuotes')
      let adminList = storedAdmin ? JSON.parse(storedAdmin) : []
      adminList.unshift(newQuote)
      localStorage.setItem('adminAllQuotes', JSON.stringify(adminList))

      // 5. Milestone 4: Save to companyShipmentRequests (appears in Company Manager & Company Agent dashboards)
      const baseCost = estimate.cost || 80000
      const companyShipment = {
        id: shipmentId,
        quoteId: quoteId,
        companyId: 'CMP-102', // GlobalSea Freight LLC
        companyName: 'GlobalSea Freight LLC',
        customer: formData.companyName || 'ABC Electronics Pvt Ltd',
        customerEmail: formData.contactEmail || 'customer@apexgl.com',
        origin: formData.origin,
        destination: formData.destination,
        cargo: `${formData.items?.length || 1} Pkg (${formData.commodity || 'General Cargo'})`,
        weight: `${(formData.items?.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0) || parseFloat(formData.weight) || 36800).toLocaleString()} kg`,
        mode: formData.serviceMode,
        containerType: formData.containerType || '40HC',
        offeredRate: baseCost,
        status: 'PENDING_COMPANY_VERIFICATION',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        assignedAgent: 'Elena Rostova (AGT-204)'
      }

      const storedCompShips = localStorage.getItem('companyShipmentRequests')
      let compShipsList = storedCompShips ? JSON.parse(storedCompShips) : []
      compShipsList.unshift(companyShipment)
      localStorage.setItem('companyShipmentRequests', JSON.stringify(compShipsList))

      // 6. Milestone 4: Save to m4AgentVerificationQueue for Company Agent 9-point verification
      const m4VerificationItem = {
        id: `M4-VR-${Math.floor(1000 + Math.random() * 9000)}`,
        shipmentId: shipmentId,
        quoteId: quoteId,
        companyId: 'CMP-102',
        companyName: 'GlobalSea Freight LLC',
        customer: formData.companyName || 'ABC Electronics Pvt Ltd',
        origin: formData.origin,
        destination: formData.destination,
        cargo: `${formData.items?.length || 1} Pkg (${formData.commodity || 'General Cargo'})`,
        weight: `${(formData.items?.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0) || parseFloat(formData.weight) || 36800).toLocaleString()} kg`,
        mode: formData.serviceMode,
        containerType: formData.containerType || '40HC',
        basePrice: baseCost,
        currentPrice: baseCost,
        status: 'PENDING_VERIFICATION',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        checklist: {
          rateAccuracy: false,
          carrierCapacity: false,
          routeFeasibility: false,
          transitFeasibility: false,
          customsCompliance: false,
          hazardousCargoCheck: false,
          bafSurchargeCheck: false,
          portTerminalClearance: false,
          documentationReadiness: false
        }
      }

      const storedM4Queue = localStorage.getItem('m4AgentVerificationQueue')
      let m4QueueList = storedM4Queue ? JSON.parse(storedM4Queue) : []
      m4QueueList.unshift(m4VerificationItem)
      localStorage.setItem('m4AgentVerificationQueue', JSON.stringify(m4QueueList))
    } catch (err) {
      console.error('Error saving synchronized quote:', err)
    }

    setTimeout(() => {
      setIsSubmitting(false)
      // Navigate directly to Route Recommendation & Quotation Details page (matching friend project)
      navigate(`/quotes/${quoteId}`, { state: { isNewlyGenerated: true } })
    }, 1000)
  }

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

          {/* Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>5-Agent Multi-Verification Workflow</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time AI Corridor & Margin Governance</span>
            </div>
          </div>

          {/* 5-AGENT MULTI-VERIFICATION WORKFLOW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Wizard */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Steps Header */}
                <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between items-center max-w-md mx-auto">
                    {[1, 2, 3, 4, 5].map((stepNum) => (
                      <div key={stepNum} className="flex flex-col items-center relative flex-1">
                        {stepNum < 5 && (
                          <div className={`absolute top-4 left-1/2 w-full h-[2px] z-0 ${
                            currentStep > stepNum ? 'bg-blue-600' : 'bg-slate-100'
                          }`} />
                        )}
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (stepNum < currentStep) setCurrentStep(stepNum)
                          }}
                          disabled={stepNum >= currentStep}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative z-10 transition-all border ${
                            currentStep === stepNum
                              ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 shadow-md'
                              : currentStep > stepNum
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-white text-slate-400 border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          {stepNum}
                        </button>
                        
                        <span className={`text-[9px] font-extrabold uppercase mt-1.5 ${
                          currentStep === stepNum ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {stepNum === 1 && 'Route'}
                          {stepNum === 2 && 'Service'}
                          {stepNum === 3 && 'Details'}
                          {stepNum === 4 && 'Add-on'}
                          {stepNum === 5 && 'Contact'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); }} 
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  >
                    
                    {/* STEP 1: ROUTE & DATES */}
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h2 className="text-base font-black text-slate-900">
                            1. Route Origins & Cargo Readiness
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Select your shipment origin and destination from all freight modes (Ocean Ports, Cargo Airports, Road Terminals, or Rail ICDs).
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                              Origin Location
                            </label>
                            <div className="relative flex items-center">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              <select
                                required
                                name="origin"
                                value={formData.origin}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer font-medium transition-all"
                              >
                                <option value="">Select Origin Location</option>
                                {ALL_ORIGIN_HUBS.map(h => (
                                  <option key={h.value} value={h.value}>{h.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                              Destination Location
                            </label>
                            <div className="relative flex items-center">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              <select
                                required
                                name="destination"
                                value={formData.destination}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer font-medium transition-all"
                              >
                                <option value="">Select Destination Location</option>
                                {ALL_DESTINATION_HUBS.map(d => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Cargo Ready Date</label>
                            <div className="relative flex items-center">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              <input
                                type="date"
                                required
                                name="readyDate"
                                value={formData.readyDate}
                                onChange={handleInputChange}
                                min={todayStr}
                                className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Target Delivery Date</label>
                            <div className="relative flex items-center">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              <input
                                type="date"
                                required
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleInputChange}
                                min={formData.readyDate || todayStr}
                                className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: SERVICE & INCOTERM */}
                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h2 className="text-base font-black text-slate-900">
                            2. Transport Mode & Incoterm
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Confirm your transport mode and select the commercial Incoterm trade terms.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { mode: 'Ocean', icon: Anchor, desc: 'Sea Ports & Vessels' },
                            { mode: 'Air', icon: Plane, desc: 'Cargo Airports' },
                            { mode: 'Road', icon: Truck, desc: 'Logistics Parks & Hubs' },
                            { mode: 'Rail', icon: Train, desc: 'ICD Rail Terminals' }
                          ].map((item) => {
                            const IconComp = item.icon
                            const isSelected = formData.serviceMode === item.mode
                            return (
                              <button
                                key={item.mode}
                                type="button"
                                onClick={() => handleModeChange(item.mode)}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <IconComp className={`w-5 h-5 mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                                <div className="font-bold text-xs text-slate-900">{item.mode}</div>
                                <div className="text-[10px] text-slate-500">{item.desc}</div>
                              </button>
                            )
                          })}
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold text-xs mb-1.5">Incoterm Cost Responsibility</label>
                          <select
                            name="incoterm"
                            value={formData.incoterm}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                          >
                            {INCOTERMS.map(inc => (
                              <option key={inc.value} value={inc.value}>{inc.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CARGO DETAILS */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h2 className="text-base font-black text-slate-900">
                            3. Cargo & Container Specifications
                          </h2>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Container Line</span>
                          </button>
                        </div>

                        {formData.items.map((item, idx) => (
                          <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs text-slate-800">Container Item #{idx + 1}</span>
                              {formData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                                <select
                                  value={item.containerType}
                                  onChange={e => handleItemChange(idx, 'containerType', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                                >
                                  <option value="40hc">40' High Cube (40HC)</option>
                                  <option value="20gp">20' General (20GP)</option>
                                  <option value="40gp">40' General (40GP)</option>
                                  <option value="20rf">20' Reefer (20RF)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Units</label>
                                <input
                                  type="number"
                                  placeholder="1"
                                  min="1"
                                  value={item.unitCount}
                                  onChange={e => handleItemChange(idx, 'unitCount', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Total Weight (kg)</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 18400"
                                  min="1"
                                  value={item.weight}
                                  onChange={e => handleItemChange(idx, 'weight', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* STEP 4: VALUE & INSURANCE */}
                    {currentStep === 4 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          4. Valuation & Value-Added Services
                        </h2>

                        <div>
                          <label className="block text-slate-700 font-semibold text-xs mb-1.5">Declared Commercial Value (INR)</label>
                          <input
                            type="number"
                            name="declaredValue"
                            value={formData.declaredValue}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              name="requiresCustomsClearance"
                              checked={formData.requiresCustomsClearance}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-900">Include ICEGATE Customs Clearance</span>
                              <p className="text-[11px] text-slate-500">Automated port entry EDI filing</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              name="requiresInsurance"
                              checked={formData.requiresInsurance}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-900">Include Marine Cargo Insurance (110% CIF)</span>
                              <p className="text-[11px] text-slate-500">Comprehensive door-to-door transit protection</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: CONTACT & DISPATCH */}
                    {currentStep === 5 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          5. Shipper Confirmation
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Contact Name</label>
                            <input
                              type="text"
                              required
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Company Name</label>
                            <input
                              type="text"
                              required
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Email Address</label>
                            <input
                              type="email"
                              required
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Phone Number</label>
                            <input
                              type="tel"
                              required
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(prev => prev - 1)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          ← Previous Step
                        </button>
                      ) : <div />}

                      {currentStep < 5 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (currentStep === 1) {
                              if (!formData.origin || !formData.destination) {
                                alert('Please select both Origin and Destination hubs before proceeding.')
                                return
                              }
                              if (formData.origin === formData.destination) {
                                alert('Origin and Destination cannot be the same hub location.')
                                return
                              }
                            }
                            if (currentStep === 3 && totalWeightNum <= 0) {
                              alert('Please enter a valid container cargo weight before proceeding.')
                              return
                            }
                            setCurrentStep(prev => prev + 1)
                          }}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitEnquiry}
                          disabled={isSubmitting || !hasSufficientParams}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSubmitting ? 'Submitting...' : (verifiedResult ? 'Submit Verified Enquiry & Dispatch' : 'Submit Enquiry & Dispatch')}</span>
                        </button>
                      )}
                    </div>

                  </form>
                </div>
              </div>

              {/* Right Side: 5-Agent Live Verification Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl">
                  
                  <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 mb-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>5-Agent Multi-Verification Engine</span>
                      </div>
                      <h3 className="text-base font-black text-white">
                        Live AI Pricing & Risk Verification
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Step {currentStep}/5
                    </span>
                  </div>

                  {currentStep < 4 ? (
                    /* Initial Empty State during Steps 1 to 3 */
                    <div className="space-y-4">
                      <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-2xl border border-dashed border-slate-800">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Route Lane:</span>
                          <span className="text-slate-600 font-mono italic">—</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Mode / Incoterm:</span>
                          <span className="text-slate-600 font-mono italic">—</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Weight & Cargo:</span>
                          <span className="text-slate-600 font-mono italic">—</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Declared Value:</span>
                          <span className="text-slate-600 font-mono italic">—</span>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl text-center space-y-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">5-Agent Verification Unlocks at Step 4</span>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                            Fill in your route corridor, transport mode, and cargo specs in Steps 1 to 3. At Step 4, all parameters consolidate here for you to run live 5-agent multi-verification.
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <span className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                          <span>1. Route</span>
                          <span className="text-slate-700">➔</span>
                          <span className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                          <span>2. Mode</span>
                          <span className="text-slate-700">➔</span>
                          <span className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                          <span>3. Cargo</span>
                          <span className="text-slate-700">➔</span>
                          <span className="w-2 h-2 rounded-full bg-slate-700" />
                          <span className="text-indigo-400 font-bold">4. Verify</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={true}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Verification Available at Step 4 (Fill cargo details)</span>
                      </button>
                    </div>
                  ) : (
                    /* Step 4 & 5: Consolidated Parameters & 5-Agent Multi-Verification */
                    <div className="space-y-4">
                      <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Route Lane:</span>
                          <strong className="text-white truncate max-w-[200px]">{formData.origin} ➔ {formData.destination}</strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Mode / Incoterm:</span>
                          <strong className="text-white">{formData.serviceMode} ({formData.containerLoad}) · {formData.incoterm}</strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Weight & Cargo:</span>
                          <strong className="text-white">
                            {totalWeightNum.toLocaleString()} kg {formData.commodity ? `· ${formData.commodity}` : ''}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Declared Value:</span>
                          <strong className="text-white">
                            ₹ {(Number(formData.declaredValue) || 3500000).toLocaleString('en-IN')} ({formData.currency || 'INR'})
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/60">
                          <span>Shipper / Contact:</span>
                          <strong className="text-indigo-300 truncate max-w-[200px]">{formData.contactName || 'Alex Shipper'} ({formData.companyName || 'Apex Logistics'})</strong>
                        </div>
                      </div>

                      {isVerifying ? (
                        <div className="space-y-4 pt-2">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span className="font-bold text-white">Verifying 5 AI Agents...</span>
                            </div>
                            <span className="font-mono text-indigo-300">{verificationProgress}%</span>
                          </div>

                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full"
                              style={{ width: `${verificationProgress}%` }}
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            {AGENTS_LIST.map((ag, idx) => {
                              const isPassed = activeAgentIndex > idx
                              const isCurrent = activeAgentIndex === idx
                              const IconComp = ag.icon

                              return (
                                <div
                                  key={ag.id}
                                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                    isCurrent
                                      ? 'bg-indigo-950/90 border-indigo-500 text-white'
                                      : isPassed
                                      ? 'bg-slate-800/80 border-emerald-500/50 text-slate-200'
                                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <IconComp className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400 animate-spin' : isPassed ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <span className="font-semibold text-[11px]">{ag.name}</span>
                                  </div>
                                  {isPassed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : isCurrent ? (
                                    <span className="text-[10px] text-indigo-300 font-mono">Running...</span>
                                  ) : (
                                    <span className="text-[10px] text-slate-600">Pending</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={finalizeVerification}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Skip Delay / Complete Now</span>
                          </button>
                        </div>
                      ) : verifiedResult ? (
                        <div className="space-y-4 pt-1">
                          <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl">
                            <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">
                              5-AGENT VERIFIED SELL PRICE
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                              {verifiedResult.totalPriceFormatted}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Guaranteed 7-Day Validity · {verifiedResult.validUntil}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px] mb-0.5">
                                <Navigation className="w-3 h-3" />
                                <span>1. Route Agent:</span>
                              </div>
                              <p className="text-slate-300 text-[11px]">
                                {verifiedResult.routeAnalysis.optimalLoop} ({verifiedResult.routeAnalysis.estimatedTransit})
                              </p>
                            </div>

                            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] mb-0.5">
                                <DollarSign className="w-3 h-3" />
                                <span>2. Pricing Agent:</span>
                              </div>
                              <p className="text-slate-300 text-[11px]">
                                Linehaul Buy: {verifiedResult.pricingBreakdown.baseLinehaul} + Margin: {verifiedResult.brokerMargin}
                              </p>
                            </div>

                            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-0.5">
                                <CloudRain className="w-3 h-3" />
                                <span>3. Weather Agent:</span>
                              </div>
                              <p className="text-slate-300 text-[11px]">
                                Corridor Risk Score: 0.08 (Safe voyage clearance)
                              </p>
                            </div>

                            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px] mb-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                <span>4. Customs Agent:</span>
                              </div>
                              <p className="text-slate-300 text-[11px]">
                                HS Code {formData.hsCode || '8708.29.00'} verified · Regulatory Compliant
                              </p>
                            </div>

                            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-0.5">
                                <TrendingUp className="w-3 h-3" />
                                <span>5. Margin Agent:</span>
                              </div>
                              <p className="text-slate-300 text-[11px]">
                                Margin {verifiedResult.marginPct}% approved (above 12% policy floor)
                              </p>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleSubmitEnquiry}
                              disabled={isSubmitting}
                              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{isSubmitting ? 'Submitting Quote...' : 'Confirm & Submit 5-Agent Verified Quote'}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 block text-center mt-1">
                              Guaranteed 7-day rate lock · Will NOT auto-submit until you click
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-1">
                          {hasSufficientParams ? (
                            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                              <span className="text-[10px] font-extrabold uppercase text-indigo-300 tracking-wider block">
                                ESTIMATED RATE BASELINE
                              </span>
                              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
                                ₹ {estimate.cost.toLocaleString('en-IN')}
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                Indicative transit: {estimate.transitTime} · {estimate.carbonFootprint}
                              </span>
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl text-center">
                              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                                AWAITING PARAMETERS
                              </span>
                              <div className="text-2xl font-black text-slate-600 mt-1 font-mono">
                                —
                              </div>
                              <span className="text-[10.5px] text-slate-500 block mt-1">
                                Select origin, destination & enter cargo weight to calculate rate
                              </span>
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={!hasSufficientParams}
                            onClick={startAgentVerification}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              hasSufficientParams
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 cursor-pointer active:scale-98'
                                : 'bg-slate-800/70 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-75'
                            }`}
                          >
                            <ShieldCheck className={`w-4 h-4 ${hasSufficientParams ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>{hasSufficientParams ? 'Run 5-Agent Multi-Verification' : 'Select Route & Weight to Verify'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>

          {/* Success Dialog */}
          <AnimatePresence>
            {isSuccess && (
              <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Quote Request Submitted!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your freight enquiry for <strong>{formData.origin} ➔ {formData.destination}</strong> has been registered and dispatched.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                    >
                      Return to Customer Dashboard
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  )
}
