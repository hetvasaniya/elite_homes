import { useState } from 'react'
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import api from '../../hooks/useApi'
import toast from 'react-hot-toast'

export default function CreateAdmin() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required.'
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      const { name, email, password } = form
      const res = await api.post('/admin/create-admin', { name, email, password })
      setCreated(res.data.admin)
      toast.success('Admin account created successfully!')
      setForm({ name: '', email: '', password: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Create Administrator</h1>
        <p className="text-slate-400 text-sm mt-0.5">Provision a new system administrator account with full access</p>
      </div>

      {/* Warning */}
      <div className="flex gap-3 p-4 bg-gold-500/10 border border-gold-500/30 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-gold-400 font-medium text-sm">Admin Privileges</p>
          <p className="text-slate-400 text-xs mt-0.5">This account will have full access to all admin features including user management, document uploads, and system settings.</p>
        </div>
      </div>

      {/* Success Banner */}
      {created && (
        <div className="flex gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-scale-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-400 font-medium text-sm">Admin Created</p>
            <p className="text-slate-300 text-xs mt-0.5">
              <strong>{created.name}</strong> ({created.email}) has been granted admin access.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input id="create-admin-name" name="name" value={form.name} onChange={handleChange}
                placeholder="Admin's full name" className={`input-field pl-9 ${errors.name ? 'border-red-500' : ''}`} />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="label-text">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input id="create-admin-email" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="admin@eliteestate.in" className={`input-field pl-9 ${errors.email ? 'border-red-500' : ''}`} />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input id="create-admin-pass" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-500' : ''}`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="label-text">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input id="create-admin-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter password" className={`input-field pl-9 ${errors.confirmPassword ? 'border-red-500' : ''}`} />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button id="create-admin-submit-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-navy-950/50 border-t-navy-950 rounded-full animate-spin" />
                Creating Admin…
              </span>
            ) : (
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Create Administrator</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
