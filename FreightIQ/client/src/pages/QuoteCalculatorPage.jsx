import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, ArrowLeft, ShieldCheck } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import InstantQuoteCalculator from '../components/InstantQuoteCalculator'

export default function QuoteCalculatorPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const navigate = useNavigate()

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
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Calculator className="w-3.5 h-3.5" />
              <span>Instant Commercial Freight Calculator</span>
            </div>
          </div>

          <InstantQuoteCalculator onSaveToDashboard={() => navigate('/dashboard')} />

        </main>
      </div>
    </div>
  )
}
