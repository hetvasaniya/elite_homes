import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, Building2, ArrowRight } from 'lucide-react'
import api from '../../hooks/useApi'

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/employee/stats'),
          api.get('/employee/pending'),
        ])
        setStats(statsRes.data)
        setRecent(pendingRes.data.slice(0, 5))
      } catch {} finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const cards = [
    {
      label: 'Pending Review',
      value: stats?.pending ?? '—',
      icon: Clock,
      color: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
      link: '/employee/pending',
    },
    {
      label: 'Approved',
      value: stats?.approved ?? '—',
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Rejected',
      value: stats?.rejected ?? '—',
      icon: XCircle,
      color: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/20',
      iconColor: 'text-red-400',
    },
    {
      label: 'Total Properties',
      value: stats?.total ?? '—',
      icon: Building2,
      color: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">Overview</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Employee Dashboard</h1>
        <p className="text-slate-400 mt-1">Review and manage property submissions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, color, border, iconColor, link }) => {
          const inner = (
            <div className={`glass-card p-5 border ${border} bg-gradient-to-br ${color} ${link ? 'hover:scale-[1.02] cursor-pointer transition-transform' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-navy-800/50 flex items-center justify-center ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {link && <ArrowRight className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                {loading ? (
                  <div className="skeleton h-8 w-16 rounded mb-1" />
                ) : (
                  <p className="font-display text-3xl font-bold text-white mb-0.5">{value}</p>
                )}
                <p className="text-slate-400 text-sm">{label}</p>
              </div>
            </div>
          )
          return link ? <Link key={label} to={link}>{inner}</Link> : <div key={label}>{inner}</div>
        })}
      </div>

      {/* Recent Pending */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Properties Awaiting Review</h2>
          <Link to="/employee/pending" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-16 skeleton" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="glass-card text-center py-10">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-semibold">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No properties pending review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(prop => (
              <Link
                key={prop._id}
                to={`/employee/pending/${prop._id}`}
                className="glass-card flex items-center gap-4 p-4 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-navy-800">
                  {prop.images?.[0] ? (
                    <img src={prop.images[0].startsWith('http') ? prop.images[0] : `https://elite-homes-1-iqft.onrender.com${prop.images[0]}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate group-hover:text-blue-400 transition-colors">{prop.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">{prop.location} • {prop.owner?.name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                    {prop.documents?.length || 0} docs
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
