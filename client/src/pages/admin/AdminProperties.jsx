import { useEffect, useState } from 'react'
import { Building2, Trash2, Eye, Filter, Search, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../hooks/useApi'
import PropertyStatusBadge from '../../components/PropertyStatusBadge'
import toast from 'react-hot-toast'

const API_BASE = 'https://elite-homes-1-iqft.onrender.com'
const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Archived', value: 'archived' },
]

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const res = await api.get(`/admin/properties${params}`)
      setProperties(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchProperties() }, [statusFilter])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      setDeleting(id)
      await api.delete(`/admin/properties/${id}`)
      toast.success('Property deleted.')
      setProperties(prev => prev.filter(p => p._id !== id))
    } catch { toast.error('Failed to delete.') } finally { setDeleting(null) }
  }

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase()) ||
    p.owner?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`
    return `₹${price?.toLocaleString()}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-1">Management</p>
        <h1 className="font-display text-2xl font-bold text-white">All Properties</h1>
        <p className="text-slate-400 mt-1">{filtered.length} propert{filtered.length !== 1 ? 'ies' : 'y'} found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, location, owner…"
            className="input-field pl-9 w-56"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                statusFilter === f.value
                  ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
                  : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="glass-card h-20 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card text-center py-16">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold">No Properties Found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(prop => (
            <div key={prop._id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:border-white/15 transition-all">
              {/* Thumbnail */}
              <div className="w-full sm:w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-navy-800">
                <img
                  src={prop.images?.[0] ? (prop.images[0].startsWith('http') ? prop.images[0] : `${API_BASE}${prop.images[0]}`) : FALLBACK}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = FALLBACK }}
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm truncate">{prop.title}</span>
                  <PropertyStatusBadge status={prop.status} />
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{prop.location}</span>
                  <span>Owner: <span className="text-slate-300">{prop.owner?.name}</span></span>
                  <span className="text-gold-400 font-semibold">{formatPrice(prop.price)}</span>
                </div>
                {prop.status === 'rejected' && prop.rejectionRemark && (
                  <p className="text-xs text-red-400 mt-1">Rejected: {prop.rejectionRemark}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/listings/${prop._id}`}
                  className="p-2 rounded-lg border border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-blue-400 transition-all"
                  title="View listing"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  id={`admin-delete-prop-${prop._id}`}
                  onClick={() => handleDelete(prop._id, prop.title)}
                  disabled={deleting === prop._id}
                  className="p-2 rounded-lg border border-white/10 text-slate-400 hover:border-red-500/40 hover:text-red-400 transition-all disabled:opacity-50"
                  title="Delete property"
                >
                  {deleting === prop._id ? (
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
