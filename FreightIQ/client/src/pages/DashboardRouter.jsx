import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerDashboard from './CustomerDashboard'
import AgentOperationsDashboard from './AgentOperationsDashboard'
import CompanyManagerDashboard from './CompanyManagerDashboard'
import AdminDashboard from './AdminDashboard'
import CustomsDashboard from './CustomsDashboard'

export default function DashboardRouter() {
  const [role, setRole] = useState(() => {
    return (
      localStorage.getItem('userRole') ||
      localStorage.getItem('selectedAccessRole') ||
      'customer'
    ).toLowerCase()
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const storedRole = (
      localStorage.getItem('userRole') ||
      localStorage.getItem('selectedAccessRole') ||
      'customer'
    ).toLowerCase()

    setRole(storedRole)
  }, [navigate])

  if (role === 'user' || role === 'customer') {
    return <CustomerDashboard />
  }

  if (role === 'company_manager' || role === 'company') {
    return <CompanyManagerDashboard />
  }

  if (role === 'company_agent' || role === 'freight_agent' || role === 'agent' || role === 'agent_operator' || role === 'broker') {
    return <AgentOperationsDashboard />
  }

  if (role === 'customs' || role === 'customs_officer') {
    return <CustomsDashboard />
  }

  if (role === 'admin') {
    return <AdminDashboard />
  }

  // Fallback to Customer
  return <CustomerDashboard />
}
