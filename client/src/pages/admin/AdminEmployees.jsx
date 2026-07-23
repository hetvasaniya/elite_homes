import { useEffect, useState } from 'react'
import { UserCog, Plus, Mail, ToggleLeft, ToggleRight, Search, Briefcase, CheckCircle, XCircle } from 'lucide-react'
import api from '../../hooks/useApi'
import toast from 'react-hot-toast'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/employees')
      setEmployees(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchEmployees() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password)
      return toast.error('All fields are required.')
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters.')

    try {
      setCreating(true)
      const res = await api.post('/admin/create-employee', form)
      toast.success('Employee created successfully!')
      setForm({ name: '', email: '', password: '' })
      setShowForm(false)
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee.')
    } finally { setCreating(false) }
  }

  const handleToggleStatus = async (id) => {
    try {
      setToggling(id)
      const res = await api.put(`/admin/users/${id}/status`)
      setEmployees(prev =>
        prev.map(e => e._id === id ? { ...e, isActive: res.data.isActive } : e)
      )
      toast.success(`Employee ${res.data.isActive ? 'activated' : 'deactivated'}.`)
    } catch { toast.error('Failed to update status.') } finally { setToggling(null) }
  }

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-1">Team</p>
          <h1 className="font-display text-2xl font-bold text-white">Employee Management</h1>
          <p className="text-slate-400 mt-1">{employees.length} employee{employees.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          id="create-employee-btn"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {/* Create Employee Form */}
      {showForm && (
        <div className="glass-card p-6 border border-gold-500/20 animate-scale-in">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-gold-400" /> Create New Employee
          </h3>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Full Name</label>
              <input
                id="emp-name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                className="input-field mt-1"
                required
              />
            </div>
            <div>
              <label className="label-text">Email Address</label>
              <input
                id="emp-email"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="john@company.com"
                className="input-field mt-1"
                required
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input
                id="emp-password"
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters"
                className="input-field mt-1"
                required
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                    Creating…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Employee
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search employees…"
          className="input-field pl-9"
        />
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-20 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold">{search ? 'No employees found' : 'No Employees Yet'}</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'Try a different search term.' : 'Click "Add Employee" to create the first one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(emp => (
            <div key={emp._id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:border-white/15 transition-all">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold text-white text-sm">{emp.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    Employee
                  </span>
                  {!emp.isActive && (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                      Deactivated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Mail className="w-3 h-3" /> {emp.email}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Joined {new Date(emp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggleStatus(emp._id)}
                disabled={toggling === emp._id}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  emp.isActive
                    ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                } disabled:opacity-50`}
                title={emp.isActive ? 'Click to deactivate' : 'Click to activate'}
              >
                {toggling === emp._id ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : emp.isActive ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {emp.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
