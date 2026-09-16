import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  Database, 
  Layers, 
  Sliders, 
  Users, 
  Activity, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Globe,
  Anchor,
  Plane,
  UploadCloud,
  FileCode,
  MessageSquare,
  Mail,
  User,
  Clock,
  Trash2,
  CheckCircle,
  Filter,
  Star,
  UserPlus,
  Edit3,
  Search,
  Lock,
  Building,
  Phone,
  Shield,
  X,
  Key,
  UserCheck,
  UserX,
  Briefcase,
  Percent,
  ShieldAlert,
  ListChecks,
  Check,
  Plus,
  Cpu,
  Terminal,
  BarChart3,
  Bell,
  Settings,
  DollarSign,
  Truck,
  FileText,
  Download,
  Scale
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import { API_BASE_URL } from '../config/api'

const ADMIN_AUDIT_LOGS = [
  { id: 1, action: 'Master Data Seeding', detail: 'Seeded 16 Sea Ports & 11 Cargo Airports', time: '10 mins ago', status: 'Success' },
  { id: 2, action: 'Margin Floor Rule Checked', detail: 'Global Floor enforced at 12.0% (Zero breaches)', time: '25 mins ago', status: 'Success' },
  { id: 3, action: 'Transit ML Model Evaluated', detail: 'LightGBM Predictor MAE: 0.732 days (Passed <= 2.0d)', time: '1 hr ago', status: 'Success' },
  { id: 4, action: 'Carrier Rate Sync', detail: 'Maersk Line & MSC Spot Matrix updated', time: '3 hrs ago', status: 'Success' }
]

const SAMPLE_FEEDBACKS = [
  {
    id: 'FB-9021',
    name: 'Rajesh Textiles Exports',
    email: 'rajesh@texport.in',
    rating: 5,
    message: 'Instant quote breakdown for multi-modal Nhava Sheva to Jebel Ali was extremely accurate and matched carrier spot rate. Fast 42-second turnaround!',
    date: 'Aug 16, 2026, 10:45 AM',
    status: 'New'
  },
  {
    id: 'FB-9020',
    name: 'Apex Global Logistics',
    email: 'operations@apexgl.com',
    rating: 5,
    message: 'The route intelligence multi-hop map and congestion indicators saved our dispatch team 3 days on transshipment routing via Colombo.',
    date: 'Aug 15, 2026, 04:30 PM',
    status: 'Reviewed'
  },
  {
    id: 'FB-9019',
    name: 'Gulf Machinery Corp',
    email: 'logistics@gulfmach.ae',
    rating: 4,
    message: 'High-cube reefer cargo tariff estimates were spot on. Requesting automated EDI invoice sync for recurring monthly shipments.',
    date: 'Aug 14, 2026, 11:20 AM',
    status: 'Resolved'
  }
]

const INITIAL_USERS = [
  { id: 'USR-101', fullName: 'Alex Shipper', email: 'customer@apexgl.com', role: 'CUSTOMER', password: 'password123', companyName: 'ABC Electronics Pvt Ltd', phone: '+91 98765 43210', status: 'Active', created: 'Aug 10, 2026' },
  { id: 'USR-102', fullName: 'Sarah Jenkins', email: 'agent@freightiq.com', role: 'FREIGHT_AGENT', password: 'password123', companyName: 'FreightIQ Global Forwarding', phone: '+91 98111 22334', status: 'Active', created: 'Aug 01, 2026' },
  { id: 'USR-103', fullName: 'Officer R. Verma', email: 'customs@icegate.gov.in', role: 'CUSTOMS_OFFICER', password: 'password123', companyName: 'Customs & Border Compliance', phone: '+91 98222 33445', status: 'Active', created: 'Aug 05, 2026' },
  { id: 'USR-104', fullName: 'John Administrator', email: 'admin@freightiq.com', role: 'ADMIN', password: 'password123', companyName: 'FreightIQ Platform Core', phone: '+91 99999 00000', status: 'Active', created: 'Jul 15, 2026' },
]

const INITIAL_COMPANIES = [
  {
    id: 'CMP-101',
    companyId: 'CMP-101',
    name: 'OceanLink Logistics',
    legalName: 'OceanLink Maritime Ltd',
    licenseNo: 'LIC-2026-1102',
    modes: ['Ocean Freight', 'Air Freight', 'Road Transport'],
    contactEmail: 'ops@oceanlink.com',
    phone: '+91 98200 11223',
    status: 'APPROVED',
    isEligible: true,
    rating: 4.9,
    agentsCount: 4,
    registeredDate: 'Aug 10, 2026'
  },
  {
    id: 'CMP-102',
    companyId: 'CMP-102',
    name: 'GlobalSea Freight',
    legalName: 'GlobalSea Forwarding LLC',
    licenseNo: 'LIC-2026-8941',
    modes: ['Ocean Freight', 'Air Freight'],
    contactEmail: 'manager@globalsea.com',
    phone: '+91 98401 23456',
    status: 'APPROVED',
    isEligible: true,
    rating: 4.7,
    agentsCount: 2,
    registeredDate: 'Aug 15, 2026'
  },
  {
    id: 'CMP-103',
    companyId: 'CMP-103',
    name: 'FastRoute Cargo',
    legalName: 'FastRoute Express Intermodal',
    licenseNo: 'LIC-2026-4409',
    modes: ['Ocean Freight', 'Road Transport', 'Rail Freight'],
    contactEmail: 'support@fastroute.com',
    phone: '+91 98999 55667',
    status: 'APPROVED',
    isEligible: true,
    rating: 4.8,
    agentsCount: 3,
    registeredDate: 'Aug 18, 2026'
  },
  {
    id: 'CMP-104',
    companyId: 'CMP-104',
    name: 'Pacific Horizon Lines',
    legalName: 'Pacific Horizon Shipping Co.',
    licenseNo: 'LIC-2026-7712',
    modes: ['Ocean Freight'],
    contactEmail: 'contact@pacifichorizon.com',
    phone: '+91 98777 88990',
    status: 'PENDING_VERIFICATION',
    isEligible: false,
    rating: 4.5,
    agentsCount: 1,
    registeredDate: 'Sep 08, 2026'
  }
]


const INITIAL_MARGIN_POLICIES = [
  { id: 'pol-1', scope: 'CUSTOMER_LANE', scopeKey: 'Sharma Textiles | INNSA-AEJEA', floorPct: 9.0, targetPct: 12.0, stretchPct: 16.0, priority: 1, active: true },
  { id: 'pol-2', scope: 'CUSTOMER_TIER', scopeKey: 'STRATEGIC Clients', floorPct: 10.0, targetPct: 13.0, stretchPct: 17.0, priority: 2, active: true },
  { id: 'pol-3', scope: 'LANE', scopeKey: 'INNSA-AEJEA (Mumbai → Dubai)', floorPct: 12.0, targetPct: 15.0, stretchPct: 19.0, priority: 3, active: true },
  { id: 'pol-4', scope: 'CARGO_TYPE', scopeKey: 'HAZARDOUS Cargo (IMO Class)', floorPct: 18.0, targetPct: 22.0, stretchPct: 26.0, priority: 4, active: true },
  { id: 'pol-5', scope: 'GLOBAL', scopeKey: 'Global System Fallback', floorPct: 13.0, targetPct: 16.0, stretchPct: 20.0, priority: 5, active: true },
]

const INITIAL_APPROVAL_RULES = [
  { index: 1, name: 'Deep discount — below floor by > 5 percentage points', approverRole: 'PRICING_MANAGER', isBlocking: true, description: 'Triggers when margin deficit exceeds 5.0% below policy floor.' },
  { index: 2, name: 'Margin below floor by up to 5 percentage points', approverRole: 'SENIOR_BROKER', isBlocking: true, description: 'Triggers when margin is between 0.1% and 5.0% below policy floor.' },
  { index: 3, name: 'Quote value above high-value threshold (> ₹40,00,000 / $50k)', approverRole: 'PRICING_MANAGER', isBlocking: true, description: 'Large commercial transactions exceeding standard broker discretion.' },
  { index: 4, name: 'Any component sourced as PREDICTED (Uncontracted rate)', approverRole: 'SENIOR_BROKER', isBlocking: true, description: 'Quotes built on machine learning market baseline without carrier contract.' },
  { index: 5, name: 'New customer with no credit profile (NONE / PENDING)', approverRole: 'SENIOR_BROKER', isBlocking: true, description: 'Shippers lacking pre-established payment terms or credit limits.' },
  { index: 6, name: 'Rate card expires before quote validity ends', approverRole: 'SENIOR_BROKER', isBlocking: true, description: 'Underlying carrier contract expires within the 7-day quotation validity window.' },
]

export default function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userName, setUserName] = useState('Admin')
  const [rateConfig, setRateConfig] = useState({
    base_rate_per_km: 2.45,
    fuel_surcharge_pct: 8.5,
    cargo_multipliers: { STANDARD: 1.0, FRAGILE: 1.25, HAZARDOUS: 1.5, PERISHABLE: 1.35 },
    mode_multipliers: { ROAD: 1.0, RAIL: 0.75, SEA: 0.5, AIR: 2.8 }
  })
  const [mlMetrics, setMlMetrics] = useState({ r2_score: 0.9832, rmse: 2104.6, mae: 1200.19 })
  const [isRetraining, setIsRetraining] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [feedbacks, setFeedbacks] = useState(SAMPLE_FEEDBACKS)
  const [feedbackFilter, setFeedbackFilter] = useState('all')

  // User Management State
  const [users, setUsers] = useState(INITIAL_USERS)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    role: 'CUSTOMER',
    companyName: '',
    phone: '',
    password: '',
    status: 'Active'
  })

  // Margin Policies State
  const [marginPolicies, setMarginPolicies] = useState(INITIAL_MARGIN_POLICIES)
  const [editingPolicy, setEditingPolicy] = useState(null)

  // Approval Rules State
  const [approvalRules, setApprovalRules] = useState(INITIAL_APPROVAL_RULES)

  // Milestone 4: Freight Companies Verification & Eligibility State
  const [companies, setCompanies] = useState(() => {
    try {
      const stored = localStorage.getItem('freightCompaniesList')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return INITIAL_COMPANIES
  })
  const [companySearch, setCompanySearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('ALL')
  const [adminToast, setAdminToast] = useState('')

  // Milestone 4: End-to-End Workflow Observability State
  const [workflowQueue, setWorkflowQueue] = useState(() => {
    try {
      const stored = localStorage.getItem('m4AgentVerificationQueue')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [
      {
        id: 'REQ-2026-881',
        shipmentId: 'SHP-2026-904',
        quoteId: 'QT-2026-1002',
        customerName: 'Apex Global Logistics',
        origin: 'INMAA (Chennai)',
        destination: 'NLRTM (Rotterdam)',
        mode: 'Ocean Freight',
        companyId: 'CMP-102',
        companyName: 'GlobalSea Freight',
        assignedAgentEmail: 'agent@globalsea.com',
        price: '₹1,18,000',
        status: 'PENDING_COMPANY_VERIFICATION',
        date: '2026-09-11',
        checklistScore: '7/9 Checks Complete'
      },
      {
        id: 'REQ-2026-882',
        shipmentId: 'SHP-2026-905',
        quoteId: 'QT-2026-1001',
        customerName: 'ABC Electronics Pvt Ltd',
        origin: 'INNSA (Mumbai)',
        destination: 'AEJEA (Jebel Ali)',
        mode: 'Ocean Freight',
        companyId: 'CMP-102',
        companyName: 'GlobalSea Freight',
        assignedAgentEmail: 'agent@globalsea.com',
        price: '₹86,000',
        status: 'PENDING_CUSTOMS_APPROVAL',
        date: '2026-09-11',
        operationalApproval: { verifiedAt: '2026-09-11 14:30', verifiedBy: 'agent@globalsea.com' }
      },
      {
        id: 'REQ-2026-883',
        shipmentId: 'SHP-2026-906',
        quoteId: 'QT-2026-1003',
        customerName: 'Zenith Pharma Exports',
        origin: 'DEL (Delhi)',
        destination: 'LHR (London Heathrow)',
        mode: 'Air Freight',
        companyId: 'CMP-103',
        companyName: 'FastRoute Cargo',
        assignedAgentEmail: 'support@fastroute.com',
        price: '₹2,55,000',
        status: 'VERIFIED_PENDING_CUSTOMER',
        date: '2026-09-11',
        operationalApproval: { verifiedAt: '2026-09-11 11:20', verifiedBy: 'support@fastroute.com' },
        customsApproval: { clearedAt: '2026-09-11 13:45', customsOfficer: 'officer@icegate.gov.in', clearanceId: 'CUS-2026-9901' }
      },
      {
        id: 'REQ-2026-884',
        shipmentId: 'SHP-2026-907',
        quoteId: 'QT-2026-1004',
        customerName: 'Reliance Chem International',
        origin: 'INMUN (Mundra)',
        destination: 'SGSIN (Singapore)',
        mode: 'Ocean Freight',
        companyId: 'CMP-101',
        companyName: 'OceanLink Logistics',
        assignedAgentEmail: 'operations@oceanlink.com',
        price: '₹98,500',
        status: 'BOOKING_CONFIRMED',
        date: '2026-09-11',
        operationalApproval: { verifiedAt: '2026-09-10 16:00', verifiedBy: 'operations@oceanlink.com' },
        customsApproval: { clearedAt: '2026-09-10 18:30', customsOfficer: 'officer@icegate.gov.in', clearanceId: 'CUS-2026-8812' },
        bookingId: 'BK-2026-99214'
      }
    ]
  })
  const [workflowFilter, setWorkflowFilter] = useState('ALL')
  const [workflowCompanyFilter, setWorkflowCompanyFilter] = useState('ALL')
  const [workflowSearch, setWorkflowSearch] = useState('')
  const [selectedWorkflowItem, setSelectedWorkflowItem] = useState(null)


  // System Quotes State
  const [allQuotes, setAllQuotes] = useState(() => {
    const stored = localStorage.getItem('adminAllQuotes')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seeds = [
            { id: 'QT-2026-1001', shp: 'SHP-1001', lane: 'INNSA (Mumbai) → AEJEA (Jebel Ali)', customer: 'ABC Electronics Pvt Ltd', base: '₹82,400', final: '₹86,000', margin: '14.2%', status: 'SENT_TO_CUSTOMER', badge: 'bg-indigo-100 text-indigo-800' },
            { id: 'QT-2026-1002', shp: 'SHP-1002', lane: 'INMAA (Chennai) → NLRTM (Rotterdam)', customer: 'Apex Global Logistics', base: '₹1,24,000', final: '₹1,18,000', margin: '11.5%', status: 'APPROVED', badge: 'bg-emerald-100 text-emerald-800' },
            { id: 'QT-2026-1003', shp: 'SHP-1003', lane: 'DEL (Delhi) → LHR (London Heathrow)', customer: 'Zenith Pharma Exports', base: '₹2,45,000', final: '₹2,55,000', margin: '16.8%', status: 'BOOKED', badge: 'bg-sky-100 text-sky-800' },
            { id: 'QT-2026-1004', shp: 'SHP-1004', lane: 'INMUN (Mundra) → SGSIN (Singapore)', customer: 'Reliance Chem International', base: '₹95,000', final: '₹98,500', margin: '15.0%', status: 'DRAFT', badge: 'bg-amber-100 text-amber-800' },
            { id: 'QT-2026-1005', shp: 'SHP-1005', lane: 'INCOK (Cochin) → USNYC (New York)', customer: 'Malabar Spices Traders', base: '₹3,10,000', final: '₹3,25,000', margin: '18.4%', status: 'PENDING_APPROVAL', badge: 'bg-purple-100 text-purple-800' }
          ]
          const existingIds = new Set(parsed.map(q => q.id))
          const remainingSeeds = seeds.filter(s => !existingIds.has(s.id))
          return [...parsed, ...remainingSeeds]
        }
      } catch {}
    }
    return [
      { id: 'QT-2026-1001', shp: 'SHP-1001', lane: 'INNSA (Mumbai) → AEJEA (Jebel Ali)', customer: 'ABC Electronics Pvt Ltd', base: '₹82,400', final: '₹86,000', margin: '14.2%', status: 'SENT_TO_CUSTOMER', badge: 'bg-indigo-100 text-indigo-800' },
      { id: 'QT-2026-1002', shp: 'SHP-1002', lane: 'INMAA (Chennai) → NLRTM (Rotterdam)', customer: 'Apex Global Logistics', base: '₹1,24,000', final: '₹1,18,000', margin: '11.5%', status: 'APPROVED', badge: 'bg-emerald-100 text-emerald-800' },
      { id: 'QT-2026-1003', shp: 'SHP-1003', lane: 'DEL (Delhi) → LHR (London Heathrow)', customer: 'Zenith Pharma Exports', base: '₹2,45,000', final: '₹2,55,000', margin: '16.8%', status: 'BOOKED', badge: 'bg-sky-100 text-sky-800' },
      { id: 'QT-2026-1004', shp: 'SHP-1004', lane: 'INMUN (Mundra) → SGSIN (Singapore)', customer: 'Reliance Chem International', base: '₹95,000', final: '₹98,500', margin: '15.0%', status: 'DRAFT', badge: 'bg-amber-100 text-amber-800' },
      { id: 'QT-2026-1005', shp: 'SHP-1005', lane: 'INCOK (Cochin) → USNYC (New York)', customer: 'Malabar Spices Traders', base: '₹3,10,000', final: '₹3,25,000', margin: '18.4%', status: 'PENDING_APPROVAL', badge: 'bg-purple-100 text-purple-800' }
    ]
  })

  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const currentTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
      token = 'demo-jwt-token'
    }
    const name = localStorage.getItem('userName') || 'System Administrator'
    setUserName(name)

    // Load customer feedback
    try {
      const stored = localStorage.getItem('customerFeedbackList')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map(f => f.id))
          const remaining = SAMPLE_FEEDBACKS.filter(f => !ids.has(f.id))
          setFeedbacks([...parsed, ...remaining])
        }
      }
    } catch (err) {
      console.error(err)
    }

    // Load user management accounts
    try {
      const storedUsers = localStorage.getItem('systemUsers')
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          const uIds = new Set(parsedUsers.map(u => u.id))
          const remaining = INITIAL_USERS.filter(u => !uIds.has(u.id))
          setUsers([...parsedUsers, ...remaining])
        }
      } else {
        localStorage.setItem('systemUsers', JSON.stringify(INITIAL_USERS))
      }
    } catch (err) {
      console.error(err)
    }

    // Load margin policies
    try {
      const storedPolicies = localStorage.getItem('adminMarginPolicies')
      if (storedPolicies) {
        const parsed = JSON.parse(storedPolicies)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMarginPolicies(parsed)
        }
      }
    } catch {}

    // Load Milestone 4 Workflow Queue
    try {
      const storedM4 = localStorage.getItem('m4AgentVerificationQueue')
      if (storedM4) {
        const parsed = JSON.parse(storedM4)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkflowQueue(prev => {
            const parsedIds = new Set(parsed.map(item => item.id))
            const remaining = prev.filter(item => !parsedIds.has(item.id))
            return [...parsed, ...remaining]
          })
        }
      }
    } catch {}

    // Fetch live rate config
    fetch(`${API_BASE_URL}/api/v1/pricing/rate-config/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRateConfig(data.data)
          if (data.model_accuracy) setMlMetrics(data.model_accuracy)
        }
      })
      .catch(() => {})
  }, [navigate])

  useEffect(() => {
    localStorage.setItem('freightCompaniesList', JSON.stringify(companies))
  }, [companies])

  const showAdminToast = (msg) => {
    setAdminToast(msg)
    setTimeout(() => setAdminToast(''), 4000)
  }

  // Milestone 4: Admin - Verify - Approve Company
  const handleApproveCompany = async (companyId) => {
    const target = companies.find(c => c.companyId === companyId)
    if (!target) return

    // Call backend API if company has a uuid id
    try {
      if (target.id && target.id.length > 20) {
        await fetch(`${API_BASE_URL}/api/v1/quotes/m4/companies/${target.id}/approval/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'APPROVE' })
        })
      }
    } catch {}

    const updated = companies.map(c => {
      if (c.companyId === companyId) {
        return {
          ...c,
          status: 'APPROVED',
          isEligible: true,
          verifiedAt: 'Just now'
        }
      }
      return c
    })
    setCompanies(updated)
    showAdminToast(`Company ${target.name} (${companyId}) VERIFIED & APPROVED! It is now ELIGIBLE and will be recommended in customer quote generation.`)
  }

  const handleRejectCompany = async (companyId) => {
    const target = companies.find(c => c.companyId === companyId)
    if (!target) return

    try {
      if (target.id && target.id.length > 20) {
        await fetch(`${API_BASE_URL}/api/v1/quotes/m4/companies/${target.id}/approval/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'REJECT' })
        })
      }
    } catch {}

    const updated = companies.map(c => {
      if (c.companyId === companyId) {
        return { ...c, status: 'REJECTED', isEligible: false }
      }
      return c
    })
    setCompanies(updated)
    showAdminToast(`Company ${target.name} (${companyId}) registration REJECTED.`)
  }

  const handleToggleEligibility = (companyId) => {
    const updated = companies.map(c => {
      if (c.companyId === companyId) {
        const next = !c.isEligible
        return { ...c, isEligible: next }
      }
      return c
    })
    setCompanies(updated)
    const comp = updated.find(c => c.companyId === companyId)
    showAdminToast(`Company ${companyId} eligibility updated: ${comp.isEligible ? 'ELIGIBLE (Active in recommendations)' : 'INELIGIBLE (Hidden from customers)'}`)
  }


  const handleSaveRateConfig = async (e) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/pricing/rate-config/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rateConfig)
      })
      const data = await res.json()
      if (data.success) {
        alert('Pricing rate configuration updated successfully!')
      }
    } catch {
      alert('Updated rate configuration in local session.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetrainML = async () => {
    setIsRetraining(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/pricing/retrain-ml/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setMlMetrics(data.metrics)
        alert(`ML Pricing Model Retrained Successfully!\nAlgorithm: GradientBoostingRegressor\nR² Score: ${data.metrics.r2_score}\nRMSE: ₹${data.metrics.rmse}\nMAE: ₹${data.metrics.mae}`)
      }
    } catch {
      alert('Simulated Gradient Boosting retraining complete. Model accuracy: R² = 0.9832')
    } finally {
      setIsRetraining(false)
    }
  }

  // === USER MANAGEMENT HANDLERS ===
  const handleOpenCreateUser = () => {
    setUserForm({
      fullName: '',
      email: '',
      role: 'CUSTOMER',
      companyName: '',
      phone: '',
      password: '',
      status: 'Active'
    })
    setIsCreateModalOpen(true)
  }

  const handleCreateUserSubmit = (e) => {
    e.preventDefault()
    if (!userForm.fullName || !userForm.email || !userForm.password) {
      alert('Please provide Name, Email, and Password.')
      return
    }

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      fullName: userForm.fullName.trim(),
      email: userForm.email.trim().toLowerCase(),
      password: userForm.password,
      role: userForm.role,
      companyName: userForm.companyName.trim() || 'Global Freight Client',
      phone: userForm.phone.trim() || '+91 98000 00000',
      status: userForm.status || 'Active',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }

    const updated = [newUser, ...users]
    setUsers(updated)
    localStorage.setItem('systemUsers', JSON.stringify(updated))
    setIsCreateModalOpen(false)

    // Backend sync in background
    try {
      fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          password: userForm.password,
          confirm_password: userForm.password,
          full_name: newUser.fullName,
          phone: newUser.phone,
          company_name: newUser.companyName,
          role: newUser.role.toUpperCase()
        })
      }).catch(() => {})
    } catch {}

    alert(`Account for ${newUser.fullName} (${newUser.role}) created successfully! They can now log in using ${newUser.email} and the password you assigned.`)
  }

  const handleOpenEditUser = (u) => {
    setSelectedUser(u)
    setUserForm({
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      companyName: u.companyName,
      phone: u.phone,
      password: '',
      status: u.status
    })
    setIsEditModalOpen(true)
  }

  const handleEditUserSubmit = (e) => {
    e.preventDefault()
    if (!selectedUser) return

    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          fullName: userForm.fullName,
          role: userForm.role,
          companyName: userForm.companyName,
          phone: userForm.phone,
          status: userForm.status
        }
      }
      return u
    })

    setUsers(updated)
    localStorage.setItem('systemUsers', JSON.stringify(updated))
    setIsEditModalOpen(false)
    setSelectedUser(null)
    alert('User account updated successfully!')
  }

  const handleToggleUserStatus = (userId) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active'
        return { ...u, status: nextStatus }
      }
      return u
    })
    setUsers(updated)
    localStorage.setItem('systemUsers', JSON.stringify(updated))
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the system?')) {
      const filtered = users.filter(u => u.id !== userId)
      setUsers(filtered)
      localStorage.setItem('systemUsers', JSON.stringify(filtered))
    }
  }

  // === MARGIN POLICY HANDLERS ===
  const handleSavePolicy = (e) => {
    e.preventDefault()
    if (!editingPolicy) return
    const updated = marginPolicies.map(p => p.id === editingPolicy.id ? editingPolicy : p)
    setMarginPolicies(updated)
    localStorage.setItem('adminMarginPolicies', JSON.stringify(updated))
    setEditingPolicy(null)
    alert(`Margin policy for ${editingPolicy.scope} updated successfully! Floor is enforced at ${editingPolicy.floorPct}%.`)
  }

  // Filtered lists
  const filteredUsers = (users || []).filter(u => {
    if (!u) return false
    const matchesSearch = (u.fullName || '').toLowerCase().includes((userSearch || '').toLowerCase()) ||
                          (u.email || '').toLowerCase().includes((userSearch || '').toLowerCase()) ||
                          (u.companyName || '').toLowerCase().includes((userSearch || '').toLowerCase())
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter
    return matchesSearch && matchesRole
  })

  const filteredFeedbacks = feedbacks.filter(f => {
    if (feedbackFilter === 'all') return true
    return f.status?.toLowerCase() === feedbackFilter.toLowerCase()
  })

  const renderStarRating = (count = 5) => {
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < count ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-100'}`}
          />
        ))}
        <span className="text-xs font-bold text-slate-700 ml-1">{count}.0</span>
      </div>
    )
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

          {/* Admin Hero Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>System Administration & Commercial Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Admin Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Configure tariff rate parameters, govern hierarchical margin policies across 5 scopes, oversee multi-tier approval rules, and provision user credentials.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2">
              <Link
                to="/admin/dashboard"
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'overview' ? 'bg-indigo-600 text-white shadow-indigo-500/25' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Overview</span>
              </Link>
              <Link
                to="/admin/dashboard?tab=users"
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'users' ? 'bg-indigo-600 text-white shadow-indigo-500/25' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users ({users.length})</span>
              </Link>
              <Link
                to="/admin/dashboard?tab=companies"
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'companies' ? 'bg-indigo-600 text-white shadow-indigo-500/25' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Companies ({companies.length})</span>
              </Link>
              <Link
                to="/admin/dashboard?tab=margin-policy"
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'margin-policy' ? 'bg-indigo-600 text-white shadow-indigo-500/25' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Pricing Rules</span>
              </Link>
              <Link
                to="/admin/dashboard?tab=audit-logs"
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer ${
                  currentTab === 'audit-logs' ? 'bg-indigo-600 text-white shadow-indigo-500/25' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </Link>
              <Link
                to="/dashboard/master-data"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Master Data</span>
              </Link>
            </div>

            <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          </div>

          {/* Section 6 (Page 7) Required KPI Cards: Total Users, Shipments, Quotes, Pending Reviews, High Risk Alerts, AI Predictions, Analytics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
            <DashboardCard
              title="TOTAL USERS"
              value={`${users.length}`}
              change="Customers & Agents"
              isPositive={true}
              icon={Users}
              color="indigo"
            />
            <DashboardCard
              title="SHIPMENTS"
              value="32 Total"
              change="Sea & Air Loops"
              isPositive={true}
              icon={Truck}
              color="blue"
            />
            <DashboardCard
              title="QUOTES"
              value="24 Active"
              change="Draft to Booked"
              isPositive={true}
              icon={Layers}
              color="purple"
            />
            <DashboardCard
              title="PENDING REVIEWS"
              value="4 Pending"
              change="Agent validation"
              isPositive={false}
              icon={Clock}
              color="amber"
            />
            <DashboardCard
              title="HIGH RISK ALERTS"
              value="2 Alerts"
              change="Weather & HazMat"
              isPositive={false}
              icon={ShieldAlert}
              color="rose"
            />
            <DashboardCard
              title="AI PREDICTIONS"
              value="28,490"
              change="LightGBM ML"
              isPositive={true}
              icon={Cpu}
              color="emerald"
            />
            <DashboardCard
              title="ANALYTICS"
              value="99.2%"
              change="SLA On-Time"
              isPositive={true}
              icon={TrendingUp}
              color="sky"
            />
          </div>

          {/* Milestone 4 Toast Alert */}
          {adminToast && (
            <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{adminToast}</span>
              </div>
              <button onClick={() => setAdminToast('')} className="p-1 hover:bg-emerald-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: FREIGHT COMPANIES MANAGEMENT & ELIGIBILITY VERIFICATION (MILESTONE 4) */}
          {/* ========================================================================= */}
          {currentTab === 'companies' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        Freight Company Governance & Eligibility Desk
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {companies.length} Registered Companies
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Admin Verification Workflow: Review registered company details and approve eligibility. Only <strong>Approved & Eligible</strong> companies appear in customer quote recommendations.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search company or ID..."
                        value={companySearch}
                        onChange={e => setCompanySearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 w-48 sm:w-60"
                      />
                    </div>

                    <select
                      value={companyFilter}
                      onChange={e => setCompanyFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="ALL">All Companies</option>
                      <option value="PENDING_VERIFICATION">Pending Approval</option>
                      <option value="APPROVED">Approved / Eligible</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Companies Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-y border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Company & ID</th>
                        <th className="py-3 px-4">Contact & License</th>
                        <th className="py-3 px-4">Transport Modes</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Customer Recommendation</th>
                        <th className="py-3 px-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companies
                        .filter(c => {
                          const matchesSearch = 
                            c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
                            c.companyId.toLowerCase().includes(companySearch.toLowerCase()) ||
                            c.contactEmail.toLowerCase().includes(companySearch.toLowerCase())
                          if (companyFilter === 'ALL') return matchesSearch
                          return matchesSearch && c.status === companyFilter
                        })
                        .map(comp => (
                          <tr key={comp.companyId} className="hover:bg-slate-50/60 transition-all">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                                  <Building className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">{comp.name}</div>
                                  <div className="text-[10px] font-mono text-indigo-600 font-extrabold">
                                    ID: {comp.companyId} · Rating: {comp.rating}★
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">{comp.contactEmail}</div>
                              <div className="text-[10px] font-mono text-slate-400">{comp.licenseNo || 'LIC-2026-REG'}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(comp.modes) ? comp.modes : ['Ocean', 'Air']).map((m, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                comp.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : comp.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {comp.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {comp.isEligible ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black inline-flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Eligible · Shown in Customer Quotes</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black inline-flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Ineligible · Hidden from Shippers</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {comp.status === 'PENDING_VERIFICATION' ? (
                                  <>
                                    <button
                                      onClick={() => handleApproveCompany(comp.companyId)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Verify & Approve</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectCompany(comp.companyId)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleToggleEligibility(comp.companyId)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                      comp.isEligible 
                                        ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {comp.isEligible ? 'Revoke Eligibility' : 'Enable Eligibility'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* M4 Platform Monitoring Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500">Selected Quotes Monitor</span>
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">14 Active</div>
                  <p className="text-xs text-slate-500">
                    Customer quote selections actively locked in PENDING_COMPANY_VERIFICATION across forwarders.
                  </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500">Booking Requests Tracker</span>
                    <Truck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">94.2% Confirmed</div>
                  <p className="text-xs text-slate-500">
                    High conversion rate from agent approval directly into confirmed booking references (BK-2026-XXXXX).
                  </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500">Company SLA Response</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">42 mins avg</div>
                  <p className="text-xs text-slate-500">
                    Fast operational turn-around time across GlobalSea, OceanLink, and FastRoute Cargo verification desks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: USER MANAGEMENT CONSOLE */}
          {/* ========================================================================= */}
          {currentTab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      System User Accounts & Role Governance
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {filteredUsers.length} Users Found
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Administrator exclusive access: Provision and manage credentials for Customers, Freight Brokers, and System Administrators.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateUser}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add User</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, email, company..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-500">Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="CUSTOMER">Customers (Shippers)</option>
                    <option value="BROKER">Freight Brokers</option>
                    <option value="ADMIN">System Admins</option>
                    <option value="CUSTOMS_OFFICER">Customs Officers</option>
                    <option value="AGENT_OPERATOR">Agent Operators</option>
                    <option value="MANAGER">Managers</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">User Details</th>
                      <th className="px-4 py-3.5">System Role</th>
                      <th className="px-4 py-3.5">Company & Contact</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Created Date</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredUsers.map((u) => {
                      const isCustomer = u.role === 'CUSTOMER'
                      const isBroker = u.role === 'BROKER'
                      const isAdmin = u.role === 'ADMIN'

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                isCustomer ? 'bg-blue-100 text-blue-700' :
                                isBroker ? 'bg-purple-100 text-purple-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {u.fullName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{u.fullName}</div>
                                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isCustomer ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              isBroker ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isCustomer && <User className="w-3 h-3" />}
                              {isBroker && <Briefcase className="w-3 h-3" />}
                              {isAdmin && <Shield className="w-3 h-3" />}
                              <span>{u.role}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.companyName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phone}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all ${
                                u.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                              title="Click to toggle status"
                            >
                              {u.status === 'Active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                              <span>{u.status}</span>
                            </button>
                          </td>

                          <td className="px-4 py-3.5 text-slate-500 text-[11px] font-mono">
                            {u.created}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MARGIN POLICY GOVERNANCE (MILSTONE 2 SPEC §5.1 & §5.2) */}
          {/* ========================================================================= */}
          {currentTab === 'margin-policy' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      Hierarchical Margin Policy Engine (5 Scopes)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Most-Specific-Wins Resolution
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Defines hard margin floors, default targets, and AI stretch upper anchors evaluated in strict priority order.
                  </p>
                </div>
              </div>

              {/* Scope Hierarchy Explanation Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
                    Evaluation Resolution Order (Section 5.2):
                  </span>
                  <div className="font-mono text-slate-300 mt-1">
                    1. CUSTOMER_LANE → 2. CUSTOMER_TIER → 3. LANE → 4. CARGO_TYPE → 5. GLOBAL FALLBACK
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60">
                  Zero Floor Violations Enforced
                </div>
              </div>

              {/* Policies Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Scope Level</th>
                      <th className="px-4 py-3">Scope Key / Target Match</th>
                      <th className="px-4 py-3 text-center">Floor % (Min)</th>
                      <th className="px-4 py-3 text-center">Target % (Default)</th>
                      <th className="px-4 py-3 text-center">Stretch % (AI Anchor)</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {marginPolicies.map((pol) => (
                      <tr key={pol.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">
                          #{pol.priority}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {pol.scope}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {pol.scopeKey}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-black text-rose-600">
                          {pol.floorPct}%
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-black text-slate-800">
                          {pol.targetPct}%
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-black text-emerald-600">
                          {pol.stretchPct}%
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setEditingPolicy(pol)}
                            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Edit Policy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CUSTOMER FEEDBACK PANEL */}
          {/* ========================================================================= */}
          {currentTab === 'feedback' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      Customer Feedback & Direct Inquiries
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct inquiries, API integration requests, and reviews received from the landing page support desk.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Customer / Shipper</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Feedback Message</th>
                      <th className="px-4 py-3">Received</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFeedbacks.map((fb) => (
                      <tr key={fb.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{fb.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{fb.email}</div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {renderStarRating(fb.rating || 5)}
                        </td>
                        <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                          <p className="text-slate-700 leading-relaxed font-medium">"{fb.message}"</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                          {fb.date}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {fb.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: AUDIT LOGS CONSOLE */}
          {/* ========================================================================= */}
          {currentTab === 'audit-logs' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    System Audit Trail & Security Logs
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable activity records including Scenario 9 agent price modifications, sign-offs, and auth events.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { action: 'Price Modification (Scenario 9)', detail: 'Quote QT-2026-1001 modified by Sarah Jenkins. Reason: Volume discount on Chennai-Rotterdam lane.', time: '12m ago', user: 'Freight Agent', status: 'Audited' },
                  { action: 'Customs Officer Case Approved', detail: 'Case CASE-2026-081 signed off by Officer Verma. Document verification confirmed.', time: '35m ago', user: 'Customs Officer', status: 'Success' },
                  { action: 'Quote Generated (M1-M3)', detail: 'AI Orchestrator synthesized Quote Engine outputs for SHP-1001 (₹86,000).', time: '45m ago', user: 'AI Orchestrator', status: 'Success' },
                  { action: 'Master Data Sync', detail: 'Synchronized 16 Sea Ports & 11 Cargo Gateways with tariff base rates.', time: '2h ago', user: 'Admin John', status: 'Success' }
                ].map((log, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">{log.action}</span>
                        <span className="px-2 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9.5px] font-bold">
                          {log.user}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{log.detail}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">{log.time}</span>
                      <span className="text-[10px] font-bold text-emerald-600">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: CUSTOMERS DIRECTORY */}
          {/* ========================================================================= */}
          {currentTab === 'customers' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Registered Customer Accounts</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Directory of shippers and commercial corporate customers.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                  {users.filter(u => (u.role || '').toUpperCase() === 'CUSTOMER' || (u.role || '').toUpperCase() === 'USER').length} Customers
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Customer / Contact</th>
                      <th className="px-4 py-3">Company Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.filter(u => (u.role || '').toUpperCase() === 'CUSTOMER' || (u.role || '').toUpperCase() === 'USER').map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{u.fullName}</td>
                        <td className="px-4 py-3 font-medium">{u.companyName || 'N/A'}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{u.email}</td>
                        <td className="px-4 py-3 text-slate-500">{u.phone || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            {u.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: FREIGHT AGENTS DIRECTORY */}
          {/* ========================================================================= */}
          {currentTab === 'freight-agents' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Freight Agent & Operations Desk</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Licensed commercial agents responsible for quote review and margin adjustments.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs">
                  {users.filter(u => ['FREIGHT_AGENT', 'BROKER', 'AGENT', 'OPERATIONS'].includes((u.role || '').toUpperCase())).length} Agents
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Agent Name</th>
                      <th className="px-4 py-3">Organization</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Desk Role</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.filter(u => ['FREIGHT_AGENT', 'BROKER', 'AGENT', 'OPERATIONS'].includes((u.role || '').toUpperCase())).map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{u.fullName}</td>
                        <td className="px-4 py-3 font-medium">{u.companyName || 'FreightIQ Operations'}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{u.email}</td>
                        <td className="px-4 py-3 text-slate-600 font-bold">Commercial Quote Reviewer</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            {u.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: CUSTOMS OFFICERS DIRECTORY */}
          {/* ========================================================================= */}
          {currentTab === 'customs-officers' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Customs Compliance Officers</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Regulatory officers verifying HS classification, dangerous goods, and tariff documents.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                  {users.filter(u => ['CUSTOMS_OFFICER', 'COMPLIANCE_OFFICER', 'CUSTOMS'].includes((u.role || '').toUpperCase())).length} Officers
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Officer Name</th>
                      <th className="px-4 py-3">Agency / Authority</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Clearance Jurisdiction</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.filter(u => ['CUSTOMS_OFFICER', 'COMPLIANCE_OFFICER', 'CUSTOMS'].includes((u.role || '').toUpperCase())).map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{u.fullName}</td>
                        <td className="px-4 py-3 font-medium">{u.companyName || 'Border & Tariff Authority'}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{u.email}</td>
                        <td className="px-4 py-3 text-slate-600">All Gateways (Sea/Air)</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            {u.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: ROLES & PERMISSIONS GOVERNANCE */}
          {/* ========================================================================= */}
          {currentTab === 'roles-permissions' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Role-Based Access Control (RBAC) Governance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Strict access boundaries established for the 4 platform user roles.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { role: 'Customer', desc: 'Can submit quote requests, track shipments, view issued quotes, accept/reject final proposals.', perms: ['Create Shipment', 'View Own Quotes', 'Accept/Decline Quote', 'Upload Documents'] },
                  { role: 'Freight Agent', desc: 'Reviews AI analysis, modifies prices with required audit logging, and approves quotes for dispatch.', perms: ['Review AI Rates', 'Modify Pricing', 'Audit Logging', 'Send Quotes to Client'] },
                  { role: 'Customs Officer', desc: 'Reviews HS classification, verifies required trade documentation, and flags customs risk.', perms: ['Inspect Documents', 'Add Customs Flags', 'Assign Risk Rating', 'Compliance Sign-Off'] },
                  { role: 'Admin', desc: 'Full authority over users, pricing rules, carrier rate cards, system configuration & AI agents.', perms: ['Manage Users', 'Configure Tariffs', 'Monitor AI Pipeline', 'Access Audit Logs'] }
                ].map((r, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="font-black text-sm text-slate-900 mb-1">{r.role}</div>
                      <p className="text-xs text-slate-600 mb-3">{r.desc}</p>
                      <div className="space-y-1">
                        {r.perms.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: ALL QUOTES */}
          {/* ========================================================================= */}
          {currentTab === 'all-quotes' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">All System Quotations</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Platform-wide quote registry across Sea, Air, Road, and Rail corridors.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                    {allQuotes.length} Quotes in System
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Quote ID</th>
                      <th className="px-4 py-3">Shipment Ref</th>
                      <th className="px-4 py-3">Lane Corridor</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Final / Price</th>
                      <th className="px-4 py-3">Margin %</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allQuotes.map((q, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">{q.id}</td>
                        <td className="px-4 py-3 font-mono text-slate-800">{q.shp || q.shipmentId || 'SHP-AUTO'}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{q.lane || `${q.origin} → ${q.destination}`}</td>
                        <td className="px-4 py-3 text-slate-600">{q.customer || 'ABC Electronics Pvt Ltd'}</td>
                        <td className="px-4 py-3 font-mono">
                          {q.base && <span className="text-slate-400 line-through mr-1.5">{q.base}</span>}
                          <span className="font-bold text-slate-900">{q.final || q.sellPrice || (q.finalPrice ? `₹${q.finalPrice.toLocaleString()}` : '₹86,000')}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">{q.margin || (q.marginPct ? `${q.marginPct}%` : '15.0%')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            q.status === 'APPROVED' || q.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                            q.status === 'SENT_TO_CUSTOMER' || q.status === 'SENT' ? 'bg-indigo-100 text-indigo-800' :
                            q.status === 'BOOKED' ? 'bg-sky-100 text-sky-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: REPORTS & ANALYTICS */}
          {/* ========================================================================= */}
          {currentTab === 'reports' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Platform Analytics & SLA Reports</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Performance tracking, quote conversion yields, and operational SLAs.</p>
                </div>
                <button
                  onClick={() => alert('Exporting platform SLA report PDF...')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SLA Audit (PDF)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">Quote Conversion Rate</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">74.6%</div>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ 4.2% from previous month</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">Average Turnaround Time</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">1.8 mins</div>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">98.5% automated generation</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">Agent Discretion Audit Ratio</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">100%</div>
                  <span className="text-[10px] text-slate-500 font-bold mt-1 block">Zero unaudited modifications</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">Lane Volume & Profitability Yield</h3>
                <div className="space-y-3">
                  {[
                    { lane: 'INNSA (Nhava Sheva) → AEJEA (Jebel Ali)', volume: '42%', revenue: '₹48,20,000', margin: '14.8%' },
                    { lane: 'INMAA (Chennai) → NLRTM (Rotterdam)', volume: '28%', revenue: '₹34,10,000', margin: '12.4%' },
                    { lane: 'DEL (Delhi) → LHR (London Heathrow Air)', volume: '18%', revenue: '₹22,90,000', margin: '17.1%' },
                    { lane: 'INMUN (Mundra) → SGSIN (Singapore)', volume: '12%', revenue: '₹14,50,000', margin: '15.6%' }
                  ].map((row, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-xl border border-slate-200 gap-2">
                      <span className="text-xs font-bold text-slate-900">{row.lane}</span>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-500">Share: {row.volume}</span>
                        <span className="text-slate-800 font-bold">{row.revenue}</span>
                        <span className="text-emerald-600 font-bold">{row.margin} margin</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SYSTEM NOTIFICATIONS CENTER */}
          {/* ========================================================================= */}
          {currentTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">System Broadcasts & Alerts</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Platform alerts, gateway notifications, and automated compliance triggers.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                  4 Unread Broadcasts
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Carrier Fuel Surcharge Adjustment Notice', desc: 'Bunker fuel prices updated +1.2% across Indian Ocean shipping lanes.', time: '10m ago', type: 'info', icon: Bell },
                  { title: 'Customs ICEGATE System Maintenance', desc: 'Planned maintenance on national customs filing gateway scheduled Sunday 02:00-04:00 IST.', time: '1h ago', type: 'warning', icon: AlertTriangle },
                  { title: 'LightGBM Nightly Pipeline Re-training Complete', desc: 'Evaluated 4,200 new rate records. Overall model accuracy reached 98.32% R².', time: '4h ago', type: 'success', icon: CheckCircle2 },
                  { title: 'High Risk Cargo Alert: SHP-1005 HazMat', desc: 'Flammable solids shipment flagged for secondary customs inspection at JNPT.', time: 'Yesterday', type: 'danger', icon: ShieldAlert }
                ].map((n, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shrink-0">
                      <n.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900">{n.title}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: OVERVIEW (TARIFF RULES & ML PERFORMANCE) */}
          {/* ========================================================================= */}
          {(currentTab === 'overview' || !['users', 'customers', 'freight-agents', 'customs-officers', 'roles-permissions', 'all-quotes', 'margin-policy', 'reports', 'notifications', 'audit-logs', 'feedback', 'companies'].includes(currentTab)) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      Multi-Modal Tariff Rate Parameters
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Adjust base haulage distance rates, bunker fuel surcharge index, and mode multipliers.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    Live Engine
                  </span>
                </div>

                <form onSubmit={handleSaveRateConfig} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Base Rate (₹/km)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={rateConfig.base_rate_per_km}
                        onChange={e => setRateConfig({ ...rateConfig, base_rate_per_km: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Bunker Fuel Surcharge (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={rateConfig.fuel_surcharge_pct}
                        onChange={e => setRateConfig({ ...rateConfig, fuel_surcharge_pct: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isSaving ? 'Updating Tariff Parameters...' : 'Save & Publish Tariff Rules'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      AI Dynamic Pricing Telemetry
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Stage 2 Gradient Boosting regression & LightGBM performance.
                    </p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">R² Fit</span>
                    <div className="text-lg font-black text-emerald-400 mt-1">{mlMetrics.r2_score}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">RMSE</span>
                    <div className="text-lg font-black text-white mt-1">₹{mlMetrics.rmse?.toFixed(0)}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">MAE</span>
                    <div className="text-lg font-black text-white mt-1">₹{mlMetrics.mae?.toFixed(0)}</div>
                  </div>
                </div>

                <button
                  onClick={handleRetrainML}
                  disabled={isRetraining}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRetraining ? 'Retraining ML Models...' : 'Retrain Gradient Boosting Regressor'}
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT MARGIN POLICY */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingPolicy && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Edit Margin Policy: {editingPolicy.scope}</h3>
                <button onClick={() => setEditingPolicy(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePolicy} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target / Scope Key</label>
                  <input
                    type="text"
                    disabled
                    value={editingPolicy.scopeKey}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-rose-600 uppercase mb-1">Floor %</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={editingPolicy.floorPct}
                      onChange={e => setEditingPolicy({ ...editingPolicy, floorPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-rose-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Target %</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={editingPolicy.targetPct}
                      onChange={e => setEditingPolicy({ ...editingPolicy, targetPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-emerald-600 uppercase mb-1">Stretch %</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={editingPolicy.stretchPct}
                      onChange={e => setEditingPolicy({ ...editingPolicy, stretchPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPolicy(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Save Policy Rules
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: CREATE USER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900">Create New System User</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={userForm.fullName}
                    onChange={e => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">System Role</label>
                    <select
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="CUSTOMER">CUSTOMER (Shipper)</option>
                      <option value="BROKER">BROKER (Rate Adjuster)</option>
                      <option value="ADMIN">ADMIN (System Owner)</option>
                      <option value="CUSTOMS_OFFICER">CUSTOMS_OFFICER (Customs Officer)</option>
                      <option value="AGENT_OPERATOR">AGENT_OPERATOR (AI Agent Operator)</option>
                      <option value="MANAGER">MANAGER (Analytics Manager)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Global Freight Ltd"
                      value={userForm.companyName}
                      onChange={e => setUserForm({ ...userForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={userForm.phone}
                      onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Create User Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900">Edit User: {selectedUser.fullName}</h3>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUserSubmit} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.fullName}
                    onChange={e => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">System Role</label>
                    <select
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="CUSTOMER">CUSTOMER (Shipper)</option>
                      <option value="BROKER">BROKER (Rate Adjuster)</option>
                      <option value="ADMIN">ADMIN (System Owner)</option>
                      <option value="CUSTOMS_OFFICER">CUSTOMS_OFFICER (Customs Officer)</option>
                      <option value="AGENT_OPERATOR">AGENT_OPERATOR (AI Agent Operator)</option>
                      <option value="MANAGER">MANAGER (Analytics Manager)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Status</label>
                    <select
                      value={userForm.status}
                      onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: WORKFLOW AUDIT TRAIL & OBSERVABILITY */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedWorkflowItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-black text-slate-900">
                      Audit Trail: {selectedWorkflowItem.id || selectedWorkflowItem.quoteId}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    End-to-End Lifecycle Verification & Clearance Record
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWorkflowItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lane & Shipment Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Shipper / Customer</span>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedWorkflowItem.customerName || 'Shipper Client'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Corridor Route</span>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedWorkflowItem.origin} → {selectedWorkflowItem.destination}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Forwarder</span>
                  <div className="text-xs font-bold text-indigo-600 mt-0.5">{selectedWorkflowItem.companyName || 'GlobalSea Freight'} ({selectedWorkflowItem.companyId || 'CMP-102'})</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Agent</span>
                  <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{selectedWorkflowItem.assignedAgentEmail || 'agent@globalsea.com'}</div>
                </div>
              </div>

              {/* 4-Stage Stepper Status */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">4-Stage Progression Audit</h4>

                {/* Stage 1: Customer Selection */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Stage 1: Customer Inquiry & Forwarder Quote Selection</span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">Completed</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Customer filled shipment requirements and selected carrier quote. Dispatched directly to {selectedWorkflowItem.companyName || 'GlobalSea Freight'}.
                    </p>
                  </div>
                </div>

                {/* Stage 2: Company Agent Operational Review */}
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  ['PENDING_CUSTOMS_APPROVAL', 'VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status)
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : selectedWorkflowItem.status === 'PENDING_COMPANY_VERIFICATION'
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  {['PENDING_CUSTOMS_APPROVAL', 'VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Stage 2: Particular Forwarder Agent 9-Point Verification</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ['PENDING_CUSTOMS_APPROVAL', 'VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status)
                          ? 'text-emerald-700 bg-emerald-100'
                          : 'text-amber-700 bg-amber-100'
                      }`}>
                        {['PENDING_CUSTOMS_APPROVAL', 'VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status) ? 'Approved' : 'In Review'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      9-point operational checklist verified by {selectedWorkflowItem.assignedAgentEmail || 'forwarder agent'}. Container capacity, IMO clearance, and tariff margins validated.
                    </p>
                  </div>
                </div>

                {/* Stage 3: Customs Compliance Clearance */}
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  ['VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status)
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : selectedWorkflowItem.status === 'PENDING_CUSTOMS_APPROVAL'
                    ? 'border-sky-200 bg-sky-50/50'
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  {['VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Stage 3: Regulatory Customs Compliance Clearance</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ['VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status)
                          ? 'text-emerald-700 bg-emerald-100'
                          : selectedWorkflowItem.status === 'PENDING_CUSTOMS_APPROVAL'
                          ? 'text-sky-700 bg-sky-100'
                          : 'text-slate-500 bg-slate-200'
                      }`}>
                        {['VERIFIED_PENDING_CUSTOMER', 'BOOKING_CONFIRMED'].includes(selectedWorkflowItem.status) ? 'Cleared' :
                         selectedWorkflowItem.status === 'PENDING_CUSTOMS_APPROVAL' ? 'Awaiting Customs' : 'Queued'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Audited by Customs Officer via ICEGATE. HS Code tariff verification, restricted cargo check, and regulatory compliance certificate granted.
                    </p>
                  </div>
                </div>

                {/* Stage 4: Customer Final Decision */}
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  selectedWorkflowItem.status === 'BOOKING_CONFIRMED'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : selectedWorkflowItem.status === 'CUSTOMER_REJECTED'
                    ? 'border-rose-200 bg-rose-50/50'
                    : selectedWorkflowItem.status === 'VERIFIED_PENDING_CUSTOMER'
                    ? 'border-indigo-200 bg-indigo-50/50'
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  {selectedWorkflowItem.status === 'BOOKING_CONFIRMED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : selectedWorkflowItem.status === 'CUSTOMER_REJECTED' ? (
                    <X className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Stage 4: Customer Final Sign-off & Booking Generation</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        selectedWorkflowItem.status === 'BOOKING_CONFIRMED' ? 'text-emerald-700 bg-emerald-100' :
                        selectedWorkflowItem.status === 'CUSTOMER_REJECTED' ? 'text-rose-700 bg-rose-100' :
                        selectedWorkflowItem.status === 'VERIFIED_PENDING_CUSTOMER' ? 'text-indigo-700 bg-indigo-100' :
                        'text-slate-500 bg-slate-200'
                      }`}>
                        {selectedWorkflowItem.status === 'BOOKING_CONFIRMED' ? 'Booking Confirmed' :
                         selectedWorkflowItem.status === 'CUSTOMER_REJECTED' ? 'Rejected' :
                         selectedWorkflowItem.status === 'VERIFIED_PENDING_CUSTOMER' ? 'Sent to Customer' : 'Pending Previous Stages'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {selectedWorkflowItem.bookingId ? `Official booking confirmed: ID ${selectedWorkflowItem.bookingId}` : 'Customer can review operational and customs clearances to approve or reject.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedWorkflowItem(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow"
                >
                  Close Audit Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
