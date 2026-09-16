import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Globe, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Anchor, 
  Clock, 
  MapPin, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Server
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import DashboardNavbar from '../components/DashboardNavbar'
import DashboardCard from '../components/DashboardCard'

const LANE_PERFORMANCE_DATA = [
  { lane: 'INNSA → AEJEA', sub: 'Asia–Middle East', transit: '6–10 d', onTime: '96%', vol: 412, status: 'ok' },
  { lane: 'INNSA → NLRTM', sub: 'Asia–Europe', transit: '24–28 d', onTime: '93%', vol: 318, status: 'ok' },
  { lane: 'INNSA → SGSIN', sub: 'Intra-Asia', transit: '11–16 d', onTime: '98%', vol: 276, status: 'ok' },
  { lane: 'INNSA → DEHAM', sub: 'Asia–Europe', transit: '26–31 d', onTime: '91%', vol: 184, status: 'warn' },
  { lane: 'BOM → DXB', sub: 'Air · Middle East', transit: '5–7 d', onTime: '97%', vol: 142, status: 'ok' },
  { lane: 'INNSA → PECLL', sub: 'Asia–South America', transit: '—', onTime: 'No data', vol: 6, status: 'danger' }
]

export default function RouteIntelligence() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [timeRange, setTimeRange] = useState('Last 90 days')
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-[#f3f5f8] text-slate-800 font-sans antialiased overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">

          <div>
            <div className="text-[11px] text-slate-400 font-medium mb-0.5">Intelligence</div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Route intelligence</h1>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={timeRange} 
              onChange={e => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700 focus:outline-none"
            >
              <option>Last 90 days</option>
              <option>Last 30 days</option>
              <option>Year to Date</option>
            </select>
          </div>
        </div>

        <main className="flex-1 p-5 md:p-6 overflow-y-auto space-y-5 max-w-7xl w-full mx-auto">
          {/* Top KPIs matching Screen 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10.5px] text-slate-400 font-semibold tracking-wide">Routes analysed</div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">12,450</div>
              <div className="text-[10.5px] font-bold text-emerald-600">↑ 18% MoM</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10.5px] text-slate-400 font-semibold tracking-wide">Lane coverage</div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">98.5%</div>
              <div className="text-[10.5px] font-bold text-emerald-600">✓ target ≥ 98%</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10.5px] text-slate-400 font-semibold tracking-wide">Transit MAE</div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">1.7 d</div>
              <div className="text-[10.5px] font-bold text-emerald-600">✓ target ≤ 2.0 d</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10.5px] text-slate-400 font-semibold tracking-wide">Avg options per lane</div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">3.2</div>
              <div className="text-[10.5px] font-semibold text-slate-500">min 2 required</div>
            </div>
          </div>

          {/* Map and Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left: Global Lane Map (span 7) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs tracking-tight">Global lane map</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff4fa] text-[#0b2f56]">Top 40 lanes</span>
              </div>
              <div className="p-4">
                <div className="h-[280px] bg-gradient-to-br from-[#0a1628] to-[#12294a] rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-900">
                  <svg viewBox="0 0 800 300" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M180 190 Q 340 100 640 140" stroke="#38bdf8" strokeWidth="1.8" fill="none" opacity=".8" />
                    <path d="M180 190 Q 300 250 520 230" stroke="#38bdf8" strokeWidth="1.4" fill="none" opacity=".6" />
                    <path d="M180 190 Q 420 40 700 90" stroke="#fb923c" strokeWidth="1.8" fill="none" opacity=".85" />
                    <path d="M180 190 Q 100 120 60 60" stroke="#38bdf8" strokeWidth="1.2" fill="none" opacity=".5" />
                    <path d="M640 140 Q 700 200 740 250" stroke="#38bdf8" strokeWidth="1.2" fill="none" opacity=".5" />
                    <circle cx="180" cy="190" r="8" fill="#fb923c" />
                    <circle cx="180" cy="190" r="15" fill="#fb923c" opacity=".2" />
                    <circle cx="640" cy="140" r="6" fill="#38bdf8" />
                    <circle cx="700" cy="90" r="6" fill="#38bdf8" />
                    <circle cx="520" cy="230" r="5" fill="#38bdf8" />
                    <circle cx="60" cy="60" r="5" fill="#38bdf8" />
                    <circle cx="740" cy="250" r="5" fill="#38bdf8" />
                    <text x="180" y="216" fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle">INNSA</text>
                    <text x="640" y="128" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">NLRTM</text>
                    <text x="700" y="78" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">DEHAM</text>
                    <text x="520" y="252" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">SGSIN</text>
                  </svg>

                  <div className="absolute bottom-3 left-3 bg-[#0a1628]/90 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white/80 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#fb923c] block rounded" />
                      <span>Highest volume lane</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#38bdf8] block rounded" />
                      <span>Active lane</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Lane Performance Table (span 5) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-xs tracking-tight">Lane performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-2.5">Lane</th>
                      <th className="text-left px-3 py-2.5">Transit</th>
                      <th className="text-left px-3 py-2.5">On-time</th>
                      <th className="text-right px-4 py-2.5">Vol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {LANE_PERFORMANCE_DATA.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="font-mono font-bold text-slate-800">{row.lane}</div>
                          <div className="text-[10px] text-slate-400">{row.sub}</div>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-700">{row.transit}</td>
                        <td className="px-3 py-2.5">
                          {row.status === 'ok' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700">
                              {row.onTime}
                            </span>
                          )}
                          {row.status === 'warn' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700">
                              {row.onTime}
                            </span>
                          )}
                          {row.status === 'danger' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700">
                              {row.onTime}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">{row.vol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Milestone 1 Bottom Note */}
          <div className="bg-[#eff4fa] border-l-4 border-[#12518f] p-3.5 rounded-r-lg text-xs leading-relaxed text-slate-800">
            <b className="block font-bold text-slate-900 mb-0.5">What Milestone 1 measures here</b>
            Lane coverage (98.5%) and transit MAE (1.7 d) are the two exit criteria. Both are visible on this page so the team sees the number move daily rather than discovering it at the review.
          </div>
        </main>
      </div>
    </div>
  )
}
