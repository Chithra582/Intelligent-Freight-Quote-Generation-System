import { motion } from 'framer-motion'

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType,
  change,
  isPositive,
  subtitle,
  color = 'blue'
}) {
  // Map color schemes for borders and indicators
  const colorMap = {
    blue: {
      border: 'border-blue-100',
      iconBg: 'bg-blue-500/10 text-blue-600',
      trendBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
    },
    indigo: {
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      trendBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    },
    green: {
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      trendBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    },
    emerald: {
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      trendBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    },
    purple: {
      border: 'border-purple-100',
      iconBg: 'bg-purple-500/10 text-purple-600',
      trendBg: 'bg-purple-50 text-purple-700 border-purple-200/60',
    },
    amber: {
      border: 'border-amber-100',
      iconBg: 'bg-amber-500/10 text-amber-600',
      trendBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
    },
    rose: {
      border: 'border-rose-100',
      iconBg: 'bg-rose-500/10 text-rose-600',
      trendBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
    },
    sky: {
      border: 'border-sky-100',
      iconBg: 'bg-sky-500/10 text-sky-600',
      trendBg: 'bg-sky-50 text-sky-700 border-sky-200/60',
    },
  }

  const activeColor = colorMap[color] || colorMap.blue
  const badgeText = trend || change
  const positive = trendType === 'positive' || isPositive === true

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full min-w-0"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <span 
            className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block truncate" 
            title={title}
          >
            {title}
          </span>
          <h3 
            className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-tight tracking-tight truncate" 
            title={value}
          >
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${activeColor.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badgeText && (
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border truncate ${
            positive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
              : 'bg-amber-50 text-amber-700 border-amber-200/70'
          }`}>
            {badgeText}
          </span>
          {subtitle ? (
            <span className="text-[10px] text-slate-400 font-medium truncate">{subtitle}</span>
          ) : (
            (trend && !change) ? (
              <span className="text-[10px] text-slate-400 font-medium shrink-0">vs prior cycle</span>
            ) : null
          )}
        </div>
      )}
    </motion.div>
  )
}
