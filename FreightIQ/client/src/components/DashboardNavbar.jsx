import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Rocket, 
  Briefcase, 
  Shield, 
  LogOut,
  Menu
} from 'lucide-react'

export default function DashboardNavbar({ setIsMobileOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [userName, setUserName] = useState('User')
  const [userRole, setUserRole] = useState('user')

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'user@freighthub.com'
    const name = localStorage.getItem('userName')
    if (name) {
      setUserName(name)
    } else {
      const localPart = email.split('@')[0]
      const cleanName = localPart
        .split(/[\._\-+]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
      setUserName(cleanName || 'Freight User')
    }

    const currentRole = (
      localStorage.getItem('selectedAccessRole') ||
      localStorage.getItem('userRole') ||
      'user'
    ).toLowerCase()
    setUserRole(currentRole)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('selectedAccessRole')
    navigate('/login')
  }

  let brandTitle = 'FREIGHTHUB'
  let brandSubtitle = 'FREIGHT QUOTE SYSTEM'
  let BrandIcon = Rocket
  let roleBadgeText = 'USER'
  let roleBadgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30'

  if (userRole === 'admin') {
    brandSubtitle = 'ADMIN CONSOLE'
    BrandIcon = Shield
    roleBadgeText = 'ADMIN'
    roleBadgeColor = 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  } else if (userRole === 'broker') {
    brandSubtitle = 'BROKERAGE PORTAL'
    BrandIcon = Briefcase
    roleBadgeText = 'BROKER'
    roleBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  } else {
    brandSubtitle = 'FREIGHT QUOTE SYSTEM'
    BrandIcon = Rocket
    roleBadgeText = 'USER'
    roleBadgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  return (
    <header className="sticky top-0 z-40 bg-[#07101e] border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Subtitle */}
          <div className="flex items-center gap-3">
            {setIsMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#ea580c] flex items-center justify-center text-white shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
                <BrandIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-wider text-white uppercase leading-none">
                  {brandTitle}
                </h1>
                <p className="text-[9.5px] font-extrabold tracking-widest text-slate-400 uppercase mt-1">
                  {brandSubtitle}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: User Profile Badge & Logout Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* User Pill */}
            <div className="flex items-center gap-2 bg-[#0e1a30] border border-slate-800 py-1.5 px-3 rounded-2xl shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 max-w-[120px] truncate">
                  {userName}
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {roleBadgeText}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
