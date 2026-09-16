import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  CloudRain, 
  Scale, 
  MapPin, 
  Cpu, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Layers,
  FileSpreadsheet,
  Download
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'

export default function AnalyticsManagementDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [timeRange, setTimeRange] = useState('30D')

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
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-xs font-semibold text-blue-300 mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Executive Management & Yield Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Commercial Analytics Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Section 7: Multi-dimensional telemetry covering quote conversion velocity, margin spread yield, weather voyage risks, and ML model performance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['7D', '30D', '90D', 'YTD'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeRange === r ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              title="GROSS BOOKED VALUE"
              value="₹ 4.28 Cr"
              change="+14.2% vs last month"
              isPositive={true}
              icon={DollarSign}
              color="emerald"
            />
            <DashboardCard
              title="AVG MARGIN SPREAD"
              value="14.8%"
              change="Floor: 12.0% (Zero breaches)"
              isPositive={true}
              icon={TrendingUp}
              color="indigo"
            />
            <DashboardCard
              title="QUOTE CONVERSION"
              value="42.6%"
              change="Turnaround: 42 seconds"
              isPositive={true}
              icon={Activity}
              color="blue"
            />
            <DashboardCard
              title="ML REGRESSION R²"
              value="0.9832"
              change="MAE: 0.73d transit fit"
              isPositive={true}
              icon={Cpu}
              color="purple"
            />
          </div>

          {/* Analytics Modules Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Margin & Pricing Yield by Corridor */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Commercial Margin Yield by Trade Corridor</span>
                </h3>
                <span className="text-[10.5px] font-mono text-slate-400">Target vs Floor</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { lane: 'INNSA → AEJEA (Mumbai ➔ Dubai)', avgMargin: '14.2%', floor: '12.0%', target: '15.0%', volume: '₹1.84 Cr', share: 45 },
                  { lane: 'INMAA → SGSIN (Chennai ➔ Singapore)', avgMargin: '15.0%', floor: '12.0%', target: '15.0%', volume: '₹1.12 Cr', share: 28 },
                  { lane: 'INNSA → NLRTM (Mumbai ➔ Rotterdam)', avgMargin: '13.6%', floor: '12.0%', target: '16.0%', volume: '₹84.5 L', share: 18 },
                  { lane: 'INBLR → DEFRA (Bangalore ➔ Frankfurt Air)', avgMargin: '16.8%', floor: '14.0%', target: '18.0%', volume: '₹47.5 L', share: 9 }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 font-mono">
                    <div className="flex justify-between items-center font-sans">
                      <span className="font-bold text-slate-900">{item.lane}</span>
                      <span className="font-black text-indigo-700">{item.avgMargin} Margin</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.share * 2}%` }} />
                    </div>
                    <div className="flex justify-between text-[10.5px] text-slate-400 pt-0.5">
                      <span>Volume: {item.volume}</span>
                      <span>Policy Floor: {item.floor} · Target: {item.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. AI Model Performance & Telemetry */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Machine Learning & Pricing Model Metrics</span>
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">R² Score</span>
                  <span className="text-xl font-black text-emerald-400 mt-1 block">0.9832</span>
                  <span className="text-[9px] text-slate-400">Target: ≥ 0.95</span>
                </div>
                <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Price RMSE</span>
                  <span className="text-xl font-black text-white mt-1 block">₹2,104</span>
                  <span className="text-[9px] text-emerald-400">Low Variance</span>
                </div>
                <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Transit MAE</span>
                  <span className="text-xl font-black text-sky-400 mt-1 block">0.73 d</span>
                  <span className="text-[9px] text-slate-400">Target: ≤ 2.0d</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] block">
                  Active Algorithm Ensemble:
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  • <strong>Transit Time Model</strong>: LightGBM regressor with historical AIS turn time parameters.<br />
                  • <strong>Spot Rate Predictor</strong>: Gradient Boosting regressor trained on 150,000 carrier spot contracts.<br />
                  • <strong>Composite Risk Score</strong>: Multi-criteria weighted matrix with zero silent failure fallback.
                </p>
              </div>
            </div>

          </div>

          {/* Customs & Weather Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Customs Compliance & Document Friction</span>
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">Auto-Passed</span>
                  <div className="text-lg font-black text-emerald-800 mt-0.5">88.4%</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-700 font-bold uppercase">Officer Review</span>
                  <div className="text-lg font-black text-amber-800 mt-0.5">9.8%</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-700 font-bold uppercase">Doc Hold</span>
                  <div className="text-lg font-black text-rose-800 mt-0.5">1.8%</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-amber-500" />
                <span>Voyage Weather Delay Telemetry</span>
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Low Wave (&lt;2m)</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">91.2%</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-700 font-bold uppercase">Moderate Swell</span>
                  <div className="text-lg font-black text-amber-800 mt-0.5">7.4%</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-700 font-bold uppercase">Storm Reroute</span>
                  <div className="text-lg font-black text-rose-800 mt-0.5">1.4%</div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  )
}
