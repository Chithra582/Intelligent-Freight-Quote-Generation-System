import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  User, 
  Briefcase, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building, 
  Phone, 
  AlertCircle, 
  CheckCircle2,
  Zap,
  Calculator,
  Scale,
  Cpu
} from 'lucide-react'
import { API_BASE_URL } from '../config/api'

// Initial seed accounts if systemUsers has not been populated yet
const DEFAULT_SYSTEM_USERS = [
  { id: 'USR-101', fullName: 'Alex Shipper', email: 'customer@apexgl.com', role: 'CUSTOMER', password: 'password123', companyName: 'ABC Electronics Pvt Ltd', phone: '+91 98765 43210', status: 'Active', created: 'Aug 10, 2026' },
  { id: 'USR-102', fullName: 'Sarah Jenkins', email: 'agent@freightiq.com', role: 'FREIGHT_AGENT', password: 'password123', companyName: 'FreightIQ Global Forwarding', phone: '+91 98111 22334', status: 'Active', created: 'Aug 01, 2026' },
  { id: 'USR-103', fullName: 'Officer R. Verma', email: 'customs@icegate.gov.in', role: 'CUSTOMS_OFFICER', password: 'password123', companyName: 'Customs & Border Compliance', phone: '+91 98222 33445', status: 'Active', created: 'Aug 05, 2026' },
  { id: 'USR-104', fullName: 'System Administrator', email: 'admin@freightiq.com', role: 'ADMIN', password: 'password123', companyName: 'FreightIQ Platform Core', phone: '+91 99999 00000', status: 'Active', created: 'Jul 15, 2026' },
  { id: 'USR-105', fullName: 'David Zhang', email: 'manager@globalsea.com', role: 'COMPANY_MANAGER', password: 'password123', companyName: 'GlobalSea Freight LLC', companyId: 'CMP-102', phone: '+91 98333 44556', status: 'Active', created: 'Aug 12, 2026' },
  { id: 'USR-106', fullName: 'Elena Rostova', email: 'agent204@globalsea.com', role: 'COMPANY_AGENT', password: 'password123', companyName: 'GlobalSea Freight LLC', companyId: 'CMP-102', phone: '+91 98444 55667', status: 'Active', created: 'Aug 12, 2026' },
]

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState('CUSTOMER') // 'CUSTOMER', 'COMPANY_MANAGER', 'COMPANY_AGENT', 'FREIGHT_AGENT', 'CUSTOMS_OFFICER', 'ADMIN'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    companyId: 'CMP-102', // Default for agent
    password: '',
    confirmPassword: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [successInfo, setSuccessInfo] = useState(null)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    // 1. Basic frontend validations
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.companyName.trim() || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill out all mandatory registration fields.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your typing.')
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)

    const inputEmail = formData.email.trim().toLowerCase()
    const inputRole = (selectedRole || 'CUSTOMER').toUpperCase()

    // 2. Load existing systemUsers or seed default users
    let currentUsers = DEFAULT_SYSTEM_USERS
    try {
      const storedUsers = localStorage.getItem('systemUsers')
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers)
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentUsers = parsed
        }
      }
    } catch {}

    // Check if email is already registered for this role
    const alreadyExists = currentUsers.find(
      u => u.email?.toLowerCase() === inputEmail && (
        u.role?.toUpperCase() === inputRole ||
        (inputRole === 'CUSTOMER' && u.role?.toUpperCase() === 'USER') ||
        (inputRole === 'FREIGHT_AGENT' && (u.role?.toUpperCase() === 'AGENT' || u.role?.toUpperCase() === 'BROKER'))
      )
    )

    if (alreadyExists) {
      setErrorMessage(
        `An account with email "${inputEmail}" is already registered under the ${inputRole} role. Please sign in instead, or use a different email.`
      )
      setIsLoading(false)
      return
    }

    // Determine Company ID
    let assignedCompanyId = formData.companyId
    if (inputRole === 'COMPANY_MANAGER') {
      assignedCompanyId = `CMP-${Math.floor(100 + Math.random() * 900)}`
      
      // Create company entry pending verification
      const newCompany = {
        id: assignedCompanyId,
        name: formData.companyName.trim(),
        code: formData.companyName.trim().substring(0, 4).toUpperCase(),
        contactEmail: inputEmail,
        contactPhone: formData.phone.trim(),
        licenseNo: `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'PENDING_VERIFICATION',
        isEligible: false,
        rating: 4.5,
        completedShipments: 0,
        registeredDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        verificationNotes: 'Self-registered company awaiting Admin review & approval for customer recommendation eligibility.'
      }

      try {
        const storedCompanies = localStorage.getItem('freightCompaniesList')
        const companiesList = storedCompanies ? JSON.parse(storedCompanies) : []
        companiesList.unshift(newCompany)
        localStorage.setItem('freightCompaniesList', JSON.stringify(companiesList))
      } catch (e) {
        console.error('Error saving company:', e)
      }

      // Backend sync
      try {
        fetch(`${API_BASE_URL}/api/v1/quotes/m4/companies/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCompany.name,
            code: newCompany.code,
            contact_email: newCompany.contactEmail,
            contact_phone: newCompany.contactPhone,
            license_no: newCompany.licenseNo
          })
        }).catch(() => {})
      } catch {}
    } else if (inputRole === 'COMPANY_AGENT') {
      assignedCompanyId = formData.companyId || 'CMP-102'
      const newAgentObj = {
        id: `AGT-${Math.floor(200 + Math.random() * 800)}`,
        name: formData.fullName.trim(),
        email: inputEmail,
        companyId: assignedCompanyId,
        companyName: formData.companyName.trim(),
        role: 'COMPANY_AGENT',
        status: 'Active',
        assignedRequests: 0,
        completedVerifications: 0
      }
      try {
        const storedAgents = localStorage.getItem('companyAgentsList')
        const agentsList = storedAgents ? JSON.parse(storedAgents) : []
        agentsList.unshift(newAgentObj)
        localStorage.setItem('companyAgentsList', JSON.stringify(agentsList))
      } catch {}
    }

    // 3. Create the new user record
    const newRegisteredUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: formData.fullName.trim(),
      email: inputEmail,
      password: formData.password,
      role: inputRole,
      companyName: formData.companyName.trim(),
      companyId: assignedCompanyId,
      phone: formData.phone.trim(),
      status: 'Active',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }

    // 4. Save immediately to localStorage
    try {
      const updatedUsers = [newRegisteredUser, ...currentUsers.filter(u => u.id !== newRegisteredUser.id)]
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers))
    } catch (err) {
      console.error('Failed to store systemUsers:', err)
    }

    // 5. Fire non-blocking backend registration call if reachable
    try {
      fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inputEmail,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          company_name: formData.companyName.trim(),
          role: inputRole
        })
      }).catch(() => {})
    } catch {}

    setIsLoading(false)
    setIsSuccess(true)
    setSuccessInfo({
      email: inputEmail,
      role: selectedRole.toLowerCase(),
      name: formData.fullName.trim(),
      companyId: assignedCompanyId
    })

    // 6. After brief delay, redirect to login page so they can sign in
    setTimeout(() => {
      navigate('/login', {
        state: {
          registeredEmail: inputEmail,
          registeredRole: selectedRole.toLowerCase()
        }
      })
    }, 1800)
  }

  return (
    <div className="min-h-screen bg-[#0d1424] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-[#111c33] border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Dark Branding Panel */}
        <div className="w-full lg:w-5/12 bg-[#0e182e] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/60">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  FREIGHT IQ
                </h2>
                <p className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">
                  M1–M3 Logistics Platform
                </p>
              </div>
            </div>

            {/* Smart Freight Engine Feature Card */}
            <div className="bg-[#162340] border border-blue-500/20 rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>Account Provisioning & Security</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register as a Customer, Freight Agent, Customs Officer, or Admin. Each account is strictly assigned to its authorized workspace portal.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">1. Customer Workspace</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Submit quotes, track active shipments & accept quotes</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">2. Freight Agent Desk</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Review AI rates, modify prices with audit logs & send quotes</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">3. Customs Officer Desk</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Verify shipping documents & flag customs risk</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">4. System Administration</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Govern pricing rules, master data & AI intelligence agents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-700/50 mt-8 text-[11px] text-slate-400">
            <span>© FreightIQ 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              Strict RBAC Portal
            </span>
          </div>
        </div>

        {/* Right Side: Clean White Registration Form Panel */}
        <div className="w-full lg:w-7/12 bg-white p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create New Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              Register your account. After registration, you will log in with your credentials to access your portal.
            </p>

            {/* Role Switcher Tabs (6 Roles including M4 Company Roles) */}
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                SELECT ACCOUNT ROLE:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('CUSTOMER'); setErrorMessage('') }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'CUSTOMER'
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>1. Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRole('COMPANY_MANAGER'); setErrorMessage('') }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'COMPANY_MANAGER'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>2. Freight Company</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRole('COMPANY_AGENT'); setErrorMessage('') }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'COMPANY_AGENT'
                      ? 'bg-white text-teal-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>3. Company Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRole('FREIGHT_AGENT'); setErrorMessage('') }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'FREIGHT_AGENT'
                      ? 'bg-white text-amber-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>4. Freight Broker</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRole('CUSTOMS_OFFICER'); setErrorMessage('') }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'CUSTOMS_OFFICER'
                      ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>5. Customs</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRole('ADMIN'); setErrorMessage('') }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'ADMIN'
                      ? 'bg-white text-purple-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>6. System Admin</span>
                </button>
              </div>

              {selectedRole === 'COMPANY_MANAGER' && (
                <div className="mt-2.5 p-2.5 bg-indigo-50 border border-indigo-200/70 rounded-xl text-[11px] text-indigo-700 flex items-start gap-2">
                  <Building className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                  <span>
                    <strong>Milestone 4 Company Workflow:</strong> Registering as Freight Company will submit your company to the Admin queue for license review & approval. Once verified and set to <strong>Eligible</strong>, your company quotes will be recommended to customers.
                  </span>
                </div>
              )}

              {selectedRole === 'COMPANY_AGENT' && (
                <div className="mt-2.5 p-2.5 bg-teal-50 border border-teal-200/70 rounded-xl text-[11px] text-teal-800 flex items-start gap-2">
                  <User className="w-4 h-4 shrink-0 mt-0.5 text-teal-600" />
                  <span>
                    <strong>Company Isolation:</strong> As a Company Agent, your operations are strictly bounded to your assigned Company ID. You will only review quotes and bookings assigned to your enterprise.
                  </span>
                </div>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {isSuccess && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col gap-1.5 text-emerald-800 text-xs">
                <div className="flex items-center gap-2 font-black text-sm text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Account Registered Successfully!</span>
                </div>
                <p className="text-emerald-700">
                  Account created for <strong>{successInfo?.name}</strong> under role <strong>[{successInfo?.role.toUpperCase()}]</strong>. Redirecting to Sign In...
                </p>
                <Link
                  to="/login"
                  state={{ registeredEmail: successInfo?.email, registeredRole: successInfo?.role }}
                  className="mt-1 text-xs font-bold underline text-emerald-900"
                >
                  Click here if not redirected automatically →
                </Link>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {selectedRole === 'COMPANY_AGENT' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ASSIGNED COMPANY
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <select
                        name="companyId"
                        value={formData.companyId}
                        onChange={(e) => {
                          const val = e.target.value
                          const companyNames = {
                            'CMP-102': 'GlobalSea Freight LLC',
                            'CMP-101': 'OceanLink Logistics',
                            'CMP-103': 'FastRoute Global Cargo',
                            'CMP-104': 'Pacific Horizon Lines'
                          }
                          setFormData(prev => ({
                            ...prev,
                            companyId: val,
                            companyName: companyNames[val] || prev.companyName
                          }))
                        }}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="CMP-102">CMP-102: GlobalSea Freight LLC</option>
                        <option value="CMP-101">CMP-101: OceanLink Logistics</option>
                        <option value="CMP-103">CMP-103: FastRoute Global Cargo</option>
                        <option value="CMP-104">CMP-104: Pacific Horizon Lines</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      COMPANY / ORG NAME
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        required
                        placeholder="e.g. ABC Logistics"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PHONE NUMBER
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Register as {selectedRole.replace('_', ' ')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login link */}
            <div className="text-center mt-5">
              <span className="text-xs text-slate-500">Already registered? </span>
              <Link
                to="/login"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Sign in to your account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
