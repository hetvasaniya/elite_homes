import { useEffect, useState } from 'react'
import { Search, Shield, UserCheck, UserX, Mail, Calendar } from 'lucide-react'
import api from '../../hooks/useApi'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleToggle = async (id, name, isActive) => {
    try {
      setToggling(id)
      const res = await api.put(`/admin/users/${id}/status`)
      toast.success(res.data.message)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally { setToggling(null) }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">User Directory</h1>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="admin-user-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="input-field pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-5 py-4"><div className="skeleton h-8 w-48 rounded" /></td>
                    <td className="px-5 py-4 hidden sm:table-cell"><div className="skeleton h-5 w-16 rounded" /></td>
                    <td className="px-5 py-4 hidden md:table-cell"><div className="skeleton h-5 w-24 rounded" /></td>
                    <td className="px-5 py-4"><div className="skeleton h-5 w-16 rounded" /></td>
                    <td className="px-5 py-4 text-right"><div className="skeleton h-8 w-20 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">No users found.</td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/2 transition-colors" id={`admin-user-row-${user._id}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{user.name}</p>
                          <p className="text-slate-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1.5 text-gold-400 text-xs font-medium">
                          <Shield className="w-3.5 h-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">User</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        id={`toggle-user-${user._id}`}
                        onClick={() => handleToggle(user._id, user.name, user.isActive)}
                        disabled={toggling === user._id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ml-auto transition-all ${
                          user.isActive
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                        } disabled:opacity-50`}
                      >
                        {toggling === user._id ? '…' : user.isActive ? <><UserX className="w-3.5 h-3.5" /> Deactivate</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
