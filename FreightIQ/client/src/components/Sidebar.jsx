import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  PlusCircle,
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Truck,
  FileText,
  MapPin,
  Activity,
  Users,
  Database,
  MessageSquare,
  ShieldCheck,
  Percent,
  ListChecks,
  Scale,
  Cpu,
  UserCheck,
  Briefcase,
  Bell,
  User as UserIcon,
  FileSearch,
  ShieldAlert,
  FolderCheck,
  DollarSign,
  AlertTriangle,
  Building
} from 'lucide-react'

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [userName, setUserName] = useState('Alex Shipper')
  const [userRole, setUserRole] = useState('customer')

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Alex Shipper'
    setUserName(name)

    const currentRole = (
      localStorage.getItem('userRole') ||
      localStorage.getItem('selectedAccessRole') ||
      'customer'
    ).toLowerCase()
    setUserRole(currentRole)
  }, [location.pathname, location.search])

  const normalizedRole = userRole.toLowerCase()

  // Define side navigation strictly aligned with each role's active dashboard tabs and pages
  let sections = []

  if (normalizedRole === 'customer' || normalizedRole === 'user') {
    // 1. Customer Portal:
    // Side Navigation: Dashboard • My Shipments • Request Quote • My Quotes • All Bookings • Documents • Notifications • Profile
    sections = [
      {
        title: 'CUSTOMER PORTAL',
        items: [
          { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
          { name: 'My Shipments', path: '/dashboard/shipments', icon: Truck },
          { name: 'Request Quote', path: '/dashboard/new-shipment', icon: PlusCircle },
          { name: 'My Quotes', path: '/user/dashboard?tab=quotes', icon: FileText },
          { name: 'All Bookings', path: '/user/dashboard?tab=bookings', icon: FolderCheck },
          { name: 'Documents', path: '/user/dashboard?tab=documents', icon: FileSearch },
          { name: 'Notifications', path: '/user/dashboard?tab=notifications', icon: Bell },
          { name: 'Profile', path: '/user/dashboard?tab=profile', icon: UserIcon }
        ]
      }
    ]
  } else if (normalizedRole === 'company_manager' || normalizedRole === 'company') {
    // 2. Company Manager Portal:
    // Supported tabs in CompanyManagerDashboard: Dashboard • Shipment Requests • Agent List
    sections = [
      {
        title: 'COMPANY MANAGER PORTAL',
        items: [
          { name: 'Dashboard', path: '/company/manager/dashboard', icon: LayoutDashboard },
          { name: 'Shipment Requests', path: '/company/manager/dashboard?tab=shipments', icon: Truck },
          { name: 'Agent List', path: '/company/manager/dashboard?tab=agents', icon: Users }
        ]
      }
    ]
  } else if (
    normalizedRole === 'company_agent' ||
    normalizedRole === 'freight_agent' || 
    normalizedRole === 'agent' || 
    normalizedRole === 'agent_operator' || 
    normalizedRole === 'broker'
  ) {
    // 3. Freight Agent & Company Agent Portal (10 M4 Tabs in AgentOperationsDashboard):
    // Dashboard • Incoming Requests • Pending Verification • Shipment Requests • Quote Verification • Document Review • Booking Management • Approved • Rejected • Notifications
    sections = [
      {
        title: normalizedRole === 'company_agent' ? 'COMPANY AGENT PORTAL' : 'FREIGHT AGENT DESK',
        items: [
          { name: 'Dashboard', path: '/agents/dashboard', icon: LayoutDashboard },
          { name: 'Incoming Requests', path: '/agents/dashboard?tab=incoming', icon: FileText },
          { name: 'Pending Verification', path: '/agents/dashboard?tab=pending', icon: ShieldAlert },
          { name: 'Shipment Requests', path: '/agents/dashboard?tab=shipment-requests', icon: Truck },
          { name: 'Quote Verification', path: '/agents/dashboard?tab=verification', icon: ShieldCheck },
          { name: 'Document Review', path: '/agents/dashboard?tab=document-review', icon: FileSearch },
          { name: 'Booking Management', path: '/agents/dashboard?tab=bookings', icon: FolderCheck },
          { name: 'Approved Quotes', path: '/agents/dashboard?tab=approved', icon: UserCheck },
          { name: 'Rejected Quotes', path: '/agents/dashboard?tab=rejected', icon: AlertTriangle },
          { name: 'Notifications', path: '/agents/dashboard?tab=notifications', icon: Bell }
        ]
      }
    ]
  } else if (normalizedRole === 'customs_officer' || normalizedRole === 'customs') {
    // 4. Customs Officer Portal (Matching CustomsDashboard tabs):
    // Dashboard • Pending Reviews • Assigned Shipments • Document Verification • Customs Risk Flags • Completed Reviews • Notifications • Profile
    sections = [
      {
        title: 'CUSTOMS OFFICER PORTAL',
        items: [
          { name: 'Dashboard', path: '/customs/dashboard', icon: Scale },
          { name: 'Pending Reviews', path: '/customs/dashboard?tab=pending-reviews', icon: ShieldAlert },
          { name: 'Assigned Shipments', path: '/customs/dashboard?tab=assigned-shipments', icon: Truck },
          { name: 'Document Verification', path: '/customs/dashboard?tab=document-verification', icon: FileCheckIcon },
          { name: 'Customs Risk Flags', path: '/customs/dashboard?tab=customs-risk-flags', icon: AlertTriangle },
          { name: 'Completed Reviews', path: '/customs/dashboard?tab=completed-reviews', icon: FolderCheck },
          { name: 'Notifications', path: '/customs/dashboard?tab=notifications', icon: Bell },
          { name: 'Profile', path: '/customs/dashboard?tab=profile', icon: UserIcon }
        ]
      }
    ]
  } else {
    // 5. Admin Portal:
    // Core Administrative, Commercial & Governance Functions:
    sections = [
      {
        title: 'ADMIN SYSTEM CONSOLE',
        items: [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Companies & Approval', path: '/admin/dashboard?tab=companies', icon: Building },
          { name: 'Users Management', path: '/admin/dashboard?tab=users', icon: Users },
          { name: 'Customers', path: '/admin/dashboard?tab=customers', icon: UserCheck },
          { name: 'Freight Agents', path: '/admin/dashboard?tab=freight-agents', icon: Briefcase },
          { name: 'Customs Officers', path: '/admin/dashboard?tab=customs-officers', icon: Scale },
          { name: 'Roles & Permissions', path: '/admin/dashboard?tab=roles-permissions', icon: ShieldCheck },
          { name: 'All Shipments', path: '/dashboard/shipments', icon: Truck },
          { name: 'All Quotes Registry', path: '/admin/dashboard?tab=all-quotes', icon: FileText },
          { name: 'Master Data Hub', path: '/dashboard/master-data', icon: Database },
          { name: 'Route & Risk Intelligence', path: '/dashboard/routes', icon: MapPin },
          { name: 'Pricing & Margin Rules', path: '/admin/dashboard?tab=margin-policy', icon: Percent },
          { name: 'Reports', path: '/admin/dashboard?tab=reports', icon: BarChart3 },
          { name: 'Audit Logs', path: '/admin/dashboard?tab=audit-logs', icon: MessageSquare },
          { name: 'Notifications', path: '/admin/dashboard?tab=notifications', icon: Bell }
        ]
      }
    ]
  }

  function FileCheckIcon(props) {
    return <FileSearch {...props} />
  }

  const getPortalLabel = () => {
    if (normalizedRole === 'customer' || normalizedRole === 'user') return 'Customer Workspace'
    if (normalizedRole === 'company_manager' || normalizedRole === 'company') return 'Company Manager Portal'
    if (normalizedRole === 'company_agent') return 'Company Agent Portal'
    if (normalizedRole === 'freight_agent' || normalizedRole === 'agent' || normalizedRole === 'agent_operator' || normalizedRole === 'broker') return 'Freight Agent Desk'
    if (normalizedRole === 'customs_officer' || normalizedRole === 'customs') return 'Customs Officer Portal'
    if (normalizedRole === 'admin') return 'Admin System Console'
    return 'FreightIQ Workspace'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    localStorage.removeItem('selectedAccessRole')
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100">
          <Link to={sections[0]?.items[0]?.path || '/dashboard'} className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Freight<span className="text-blue-600">IQ</span>
                </span>
                <span className="text-[9.5px] font-extrabold text-blue-600 tracking-wider uppercase truncate max-w-[140px]">
                  {getPortalLabel()}
                </span>
              </motion.div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Portal Indicator - Strictly Read-Only Isolated Workspace (No RBAC Switcher) */}
        {!isCollapsed && (
          <div className="px-4 pt-3.5 pb-2">
            <div className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Current Portal
                </span>
                <span className="text-xs font-bold text-slate-800 truncate">
                  {sections[0]?.title || 'WORKSPACE'}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" title="Connected & Authorized" />
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && section.title && (
                <div className="px-3 mb-2 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item, itemIdx) => {
                const IconComponent = item.icon
                const currentUrl = location.pathname + location.search
                const isSelected = currentUrl === item.path || 
                  (item.path.includes('?') && currentUrl.includes(item.path)) ||
                  (!item.path.includes('?') && location.pathname === item.path && !location.search)

                return (
                  <Link
                    key={itemIdx}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl font-bold text-xs transition-all relative group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-extrabold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {IconComponent && (
                      <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`} />
                    )}
                    
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}

                    {isSelected && (
                      <motion.div 
                        layoutId="activePill"
                        className="absolute right-2 w-1.5 h-4 rounded-full bg-blue-600" 
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* User Info / Logout Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">{userName}</span>
                  <span className="text-[10px] text-blue-600 truncate uppercase font-extrabold">{userRole.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  )
}
