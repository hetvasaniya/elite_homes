import { useEffect, useState } from 'react'
import { Users, Shield, Building2, MessageSquare, TrendingUp, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../hooks/useApi'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      label: 'Total Users',
      value: stats?.users ?? '—',
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      link: '/admin/users',
    },
    {
      label: 'Total Admins',
      value: stats?.admins ?? '—',
      icon: Shield,
      color: 'from-gold-500/20 to-gold-600/10',
      border: 'border-gold-500/20',
      iconColor: 'text-gold-400',
      link: '/admin/create-admin',
    },
    {
      label: 'Total Properties',
      value: stats?.properties ?? '—',
      icon: Building2,
      color: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      link: '/listings',
    },
    {
      label: 'Contact Messages',
      value: stats?.messages ?? '—',
      icon: MessageSquare,
      color: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400',
      link: '/admin/messages',
      badge: stats?.unreadMessages > 0 ? stats.unreadMessages : null,
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-1">Overview</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">System Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time metrics and system health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, color, border, iconColor, link, badge }) => (
          <Link key={label} to={link}>
            <div className={`glass-card-hover p-5 border ${border} bg-gradient-to-br ${color} cursor-pointer`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-navy-800/50 flex items-center justify-center ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  {badge && (
                    <span className="px-2 py-0.5 bg-gold-500 text-navy-950 text-xs font-bold rounded-full animate-pulse">
                      {badge}
                    </span>
                  )}
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div>
                {loading ? (
                  <div className="skeleton h-8 w-16 rounded mb-1" />
                ) : (
                  <p className="font-display text-3xl font-bold text-white mb-0.5">{value.toLocaleString?.() ?? value}</p>
                )}
                <p className="text-slate-400 text-sm">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/admin/users">
            <div className="glass-card p-5 hover:border-gold-500/30 transition-all cursor-pointer group">
              <Users className="w-5 h-5 text-gold-400 mb-3" />
              <h3 className="font-medium text-white mb-1 group-hover:text-gold-400 transition-colors">Manage Users</h3>
              <p className="text-slate-400 text-xs">View, activate, or deactivate user accounts</p>
            </div>
          </Link>
          <Link to="/admin/create-admin">
            <div className="glass-card p-5 hover:border-gold-500/30 transition-all cursor-pointer group">
              <Shield className="w-5 h-5 text-gold-400 mb-3" />
              <h3 className="font-medium text-white mb-1 group-hover:text-gold-400 transition-colors">Create Admin</h3>
              <p className="text-slate-400 text-xs">Provision a new system administrator account</p>
            </div>
          </Link>
          <Link to="/admin/documents">
            <div className="glass-card p-5 hover:border-gold-500/30 transition-all cursor-pointer group">
              <TrendingUp className="w-5 h-5 text-gold-400 mb-3" />
              <h3 className="font-medium text-white mb-1 group-hover:text-gold-400 transition-colors">Upload Documents</h3>
              <p className="text-slate-400 text-xs">Publish legal documents and compliance files</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
