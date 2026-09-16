import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Rocket,
  User,
  Briefcase,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Calculator,
  AlertCircle,
  Scale,
  Cpu,
  CheckCircle2,
  Building2
} from 'lucide-react'
import { API_BASE_URL } from '../config/api'

// Initial seed accounts if systemUsers has not been populated yet
const DEFAULT_SYSTEM_USERS = [
  { id: 'USR-101', fullName: 'Alex Shipper', email: 'customer@apexgl.com', role: 'CUSTOMER', password: 'password123', companyName: 'ABC Electronics Pvt Ltd', phone: '+91 98765 43210', status: 'Active', created: 'Aug 10, 2026' },
  { id: 'USR-102', fullName: 'Sarah Jenkins', email: 'agent@freightiq.com', role: 'FREIGHT_AGENT', password: 'password123', companyName: 'FreightIQ Global Forwarding', phone: '+91 98111 22334', status: 'Active', created: 'Aug 01, 2026' },
  { id: 'USR-103', fullName: 'Officer R. Verma', email: 'customs@icegate.gov.in', role: 'CUSTOMS_OFFICER', password: 'password123', companyName: 'Customs & Border Compliance', phone: '+91 98222 33445', status: 'Active', created: 'Aug 05, 2026' },
  { id: 'USR-104', fullName: 'System Administrator', email: 'admin@freightiq.com', role: 'ADMIN', password: 'password123', companyName: 'FreightIQ Platform Core', phone: '+91 99999 00000', status: 'Active', created: 'Jul 15, 2026' },
  // Milestone 4 Seed Accounts
  { id: 'USR-201', fullName: 'GlobalSea Manager', email: 'manager@globalsea.com', role: 'COMPANY_MANAGER', password: 'password123', companyName: 'GlobalSea Freight', companyId: 'CMP-102', phone: '+91 98401 23456', status: 'Active', created: 'Aug 15, 2026' },
  { id: 'USR-204', fullName: 'Sarah Jenkins (Agent AGT-204)', email: 'agent204@globalsea.com', role: 'COMPANY_AGENT', password: 'password123', companyName: 'GlobalSea Freight', companyId: 'CMP-102', agentCode: 'AGT-204', phone: '+91 98111 22334', status: 'Active', created: 'Sep 01, 2026' },
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('customer') // 'customer', 'company_manager', 'company_agent', 'freight_agent', 'customs_officer', 'admin'

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Ensure systemUsers exists in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('systemUsers')
      if (!stored) {
        localStorage.setItem('systemUsers', JSON.stringify(DEFAULT_SYSTEM_USERS))
      }
    } catch {}

    // Check if navigated from Register page with registered email/role
    if (location.state?.registeredEmail) {
      setFormData(prev => ({
        ...prev,
        usernameOrEmail: location.state.registeredEmail,
        password: ''
      }))
      if (location.state.registeredRole) {
        setSelectedRole(location.state.registeredRole)
      }
      setInfoMessage(`Account created successfully! Please enter your password to sign in.`)
    }
  }, [location.state])

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey)
    setErrorMessage('')
    setInfoMessage('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errorMessage) setErrorMessage('')
    if (infoMessage) setInfoMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.usernameOrEmail.trim() || !formData.password) {
      setErrorMessage('Please enter both your registered email/username and password.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setInfoMessage('')

    const inputId = formData.usernameOrEmail.trim().toLowerCase()
    const inputPassword = formData.password
    const inputRole = selectedRole.toLowerCase()

    // 1. Authenticate strictly against registered accounts in systemUsers
    let sysUsers = DEFAULT_SYSTEM_USERS
    try {
      const stored = localStorage.getItem('systemUsers')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          sysUsers = parsed
        }
      }
    } catch {}

    // Find all users matching this email or name
    const emailMatches = sysUsers.filter(u =>
      u.email?.toLowerCase() === inputId || u.fullName?.toLowerCase() === inputId
    )

    if (emailMatches.length === 0) {
      // Also try calling Django backend login if available
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: inputId,
            password: inputPassword,
            role: selectedRole
          })
        })
        const data = await response.json()
        if (response.ok && data.access) {
          const userRole = (data.user?.role || selectedRole).toLowerCase()
          localStorage.setItem('token', data.access)
          localStorage.setItem('refreshToken', data.refresh)
          localStorage.setItem('userRole', userRole)
          localStorage.setItem('selectedAccessRole', userRole)
          localStorage.setItem('userEmail', data.user?.email || inputId)
          localStorage.setItem('userName', data.user?.full_name || 'Authorized User')
          if (data.user?.company_name) localStorage.setItem('userCompany', data.user.company_name)

          let dest = '/user/dashboard'
          if (userRole === 'admin') dest = '/admin/dashboard'
          else if (userRole === 'customs_officer' || userRole === 'customs') dest = '/customs/dashboard'
          else if (userRole === 'freight_agent' || userRole === 'agent' || userRole === 'broker') dest = '/agents/dashboard'

          navigate(dest)
          return
        }
      } catch {}

      setErrorMessage('No registered account found with this email. Please register first.')
      setIsLoading(false)
      return
    }

    // Check if role matches
    const matchedAccount = emailMatches.find(u => {
      const uRole = (u.role || '').toLowerCase()
      if (inputRole === 'customer') return uRole === 'customer' || uRole === 'user'
      if (inputRole === 'company_manager') return uRole === 'company_manager'
      if (inputRole === 'company_agent') return uRole === 'company_agent' || uRole === 'agent' || uRole === 'freight_agent'
      if (inputRole === 'freight_agent') return uRole === 'freight_agent' || uRole === 'agent' || uRole === 'broker' || uRole === 'operations' || uRole === 'company_agent'
      if (inputRole === 'customs_officer') return uRole === 'customs_officer' || uRole === 'customs' || uRole === 'compliance_officer'
      if (inputRole === 'admin') return uRole === 'admin'
      return uRole === inputRole
    })

    if (!matchedAccount) {
      const existingRoles = emailMatches.map(u => u.role).join(', ')
      setErrorMessage(
        `This email is registered under the "${existingRoles}" role, not "${selectedRole.replace('_', ' ').toUpperCase()}". Please select the correct role tab.`
      )
      setIsLoading(false)
      return
    }

    if (matchedAccount.status === 'Suspended') {
      setErrorMessage('This user account has been suspended by the administrator.')
      setIsLoading(false)
      return
    }

    // Verify Password
    if (matchedAccount.password && matchedAccount.password !== inputPassword) {
      setErrorMessage('Incorrect password. Please verify your credentials and try again.')
      setIsLoading(false)
      return
    }

    // Authentication Success! Issue session token and navigate to authorized portal
    const userRole = (matchedAccount.role || selectedRole).toLowerCase()
    const token = 'jwt-user-' + (matchedAccount.id || Date.now())
    localStorage.setItem('token', token)
    localStorage.setItem('userRole', userRole)
    localStorage.setItem('selectedAccessRole', userRole)
    localStorage.setItem('userEmail', matchedAccount.email)
    localStorage.setItem('userName', matchedAccount.fullName)
    if (matchedAccount.companyName) localStorage.setItem('userCompany', matchedAccount.companyName)
    if (matchedAccount.companyId) {
      localStorage.setItem('agentCompanyId', matchedAccount.companyId)
      localStorage.setItem('agentCompanyName', matchedAccount.companyName)
    }
    if (matchedAccount.agentCode) localStorage.setItem('agentCode', matchedAccount.agentCode)

    let dest = '/user/dashboard'
    if (userRole === 'admin') dest = '/admin/dashboard'
    else if (userRole === 'company_manager') dest = '/company/manager/dashboard'
    else if (userRole === 'company_agent' || userRole === 'freight_agent' || userRole === 'agent' || userRole === 'broker') dest = '/agents/dashboard'
    else if (userRole === 'customs_officer' || userRole === 'customs') dest = '/customs/dashboard'

    navigate(dest)
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
                  M1–M3 Intelligent Logistics Platform
                </p>
              </div>
            </div>

            {/* Architecture Scope Card */}
            <div className="bg-[#162340] border border-blue-500/20 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>Isolated Multi-Role Architecture</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Users must register an account first. Once registered, log in to access your designated workspace portal.
              </p>
            </div>

            {/* Role List */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Customer Portal</h4>
                  <p className="text-[11px] text-slate-400">Request quotes, inspect pricing breakdowns & accept quotes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Freight Agent Portal</h4>
                  <p className="text-[11px] text-slate-400">Review AI pricing, modify prices with audit log & dispatch quotes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Customs Officer Portal</h4>
                  <p className="text-[11px] text-slate-400">Verify documents, assign risk flags & approve compliance cases</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Admin System Portal</h4>
                  <p className="text-[11px] text-slate-400">Govern users, tariff rules & monitor backend AI agents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-700/50 mt-8 text-[11px] text-slate-400">
            <span>© FreightIQ 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              Verified Credentials Only
            </span>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="w-full lg:w-7/12 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              Select your role and enter your registered email and password.
            </p>

            {/* 4 Standardized Roles Tabs */}
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                SELECT YOUR ROLE:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {[
                  { id: 'customer', label: '1. Customer', icon: User, color: 'text-blue-600' },
                  { id: 'company_manager', label: '2. Company Manager', icon: Building2, color: 'text-blue-700' },
                  { id: 'company_agent', label: '3. Company Agent', icon: Briefcase, color: 'text-amber-600' },
                  { id: 'customs_officer', label: '4. Customs Officer', icon: Scale, color: 'text-emerald-600' },
                  { id: 'admin', label: '5. System Admin', icon: Shield, color: 'text-indigo-600' }
                ].map(r => {
                  const IconComp = r.icon
                  const isSelected = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-white shadow-sm border border-slate-200/80 ' + r.color
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="truncate">{r.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Success Info Message */}
            {infoMessage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-700 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Error message alert */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  REGISTERED EMAIL OR USERNAME
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="usernameOrEmail"
                    required
                    placeholder="Enter registered email"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Account...' : `Sign In to ${selectedRole.replace('_', ' ').toUpperCase()} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Register link */}
            <div className="text-center mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-600">Don't have an account yet? </span>
              <Link
                to="/register"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1"
              >
                Register Company or Agent →
              </Link>
            </div>

            {/* Quick Demo Access Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider text-center">
                QUICK ACCESS DEMO LOGINS:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('customer')
                    setFormData({ usernameOrEmail: 'customer@apexgl.com', password: 'password123' })
                  }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-bold text-slate-700 transition-all text-center cursor-pointer"
                >
                  Customer (Alex)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('company_manager')
                    setFormData({ usernameOrEmail: 'manager@globalsea.com', password: 'password123' })
                  }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-bold text-slate-700 transition-all text-center cursor-pointer"
                >
                  Manager (GlobalSea)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('company_agent')
                    setFormData({ usernameOrEmail: 'agent204@globalsea.com', password: 'password123' })
                  }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg font-bold text-slate-700 transition-all text-center cursor-pointer"
                >
                  Agent (AGT-204)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin')
                    setFormData({ usernameOrEmail: 'admin@freightiq.com', password: 'password123' })
                  }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-bold text-slate-700 transition-all text-center cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('customs_officer')
                    setFormData({ usernameOrEmail: 'customs@icegate.gov.in', password: 'password123' })
                  }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-bold text-slate-700 transition-all text-center cursor-pointer"
                >
                  Customs Officer
                </button>
              </div>
            </div>


          </div>
        </div>

      </div>
    </div>
  )
}
