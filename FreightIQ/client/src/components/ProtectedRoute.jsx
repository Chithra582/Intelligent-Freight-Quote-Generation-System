import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'

export function getAuthorizedDashboardPath(role) {
  const normalized = (role || '').toLowerCase()
  if (normalized === 'customer' || normalized === 'user') return '/user/dashboard'
  if (normalized === 'company_manager' || normalized === 'company') return '/company/manager/dashboard'
  if (normalized === 'company_agent' || normalized === 'freight_agent' || normalized === 'agent' || normalized === 'agent_operator' || normalized === 'broker') return '/agents/dashboard'
  if (normalized === 'customs_officer' || normalized === 'customs') return '/customs/dashboard'
  if (normalized === 'admin') return '/admin/dashboard'
  return '/dashboard'
}

export function getRoleDisplayName(role) {
  const normalized = (role || '').toLowerCase()
  if (normalized === 'customer' || normalized === 'user') return 'Customer'
  if (normalized === 'company_manager' || normalized === 'company') return 'Company Manager'
  if (normalized === 'company_agent') return 'Company Agent'
  if (normalized === 'freight_agent' || normalized === 'agent' || normalized === 'agent_operator' || normalized === 'broker') return 'Freight Agent'
  if (normalized === 'customs_officer' || normalized === 'customs') return 'Customs Officer'
  if (normalized === 'admin') return 'System Administrator'
  return role || 'User'
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('token')
  const userRole = (localStorage.getItem('userRole') || localStorage.getItem('selectedAccessRole') || '').toLowerCase()
  const userName = localStorage.getItem('userName') || 'User'

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Normalize allowed roles
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase())
  const hasAccess = normalizedAllowed.includes(userRole)

  if (!hasAccess) {
    const userDashboard = getAuthorizedDashboardPath(userRole)
    const userRoleDisplay = getRoleDisplayName(userRole)
    const requiredRolesDisplay = allowedRoles.map(getRoleDisplayName).join(' or ')

    const handleLogout = () => {
      localStorage.clear()
      window.location.href = '/login'
    }

    return (
      <div className="min-h-screen bg-[#0b1329] flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full bg-[#111c38] border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider inline-block mb-3">
            HTTP 403 Forbidden · Access Denied
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Unauthorized Dashboard Access
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            You are logged in as <strong className="text-amber-400">{userName}</strong> with role <strong className="text-sky-300">[{userRoleDisplay}]</strong>.
            This portal requires <strong className="text-rose-400">[{requiredRolesDisplay}]</strong> privileges.
            Users are restricted to their assigned dashboard.
          </p>

          <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-2xl mb-6 text-left text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center justify-between">
              <span>Your Current Role:</span>
              <span className="font-bold text-sky-400">{userRoleDisplay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Required Portal Role:</span>
              <span className="font-bold text-rose-400">{requiredRolesDisplay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Security Policy:</span>
              <span className="font-mono text-[11px] text-emerald-400">Strict Workspace Isolation (M1-M3)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={userDashboard}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to {userRoleDisplay} Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children
}
