import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ArrowRight, FileText, Clock, Search } from 'lucide-react'
import api from '../../hooks/useApi'
import PropertyStatusBadge from '../../components/PropertyStatusBadge'

const API_BASE = 'https://elite-homes-1-iqft.onrender.com'

export default function PendingProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/employee/pending')
      .then(res => setProperties(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
        <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Review Queue</p>
        <h1 className="font-display text-2xl font-bold text-white">Pending Properties</h1>
        <p className="text-slate-400 mt-1">
          {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} awaiting review
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, location or owner…"
          className="input-field pl-9 w-full max-w-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-28 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card text-center py-16">
          {search ? (
            <>
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold">No results found</p>
              <p className="text-slate-400 text-sm mt-1">Try a different search term.</p>
            </>
          ) : (
            <>
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold">No Pending Properties</p>
              <p className="text-slate-400 text-sm mt-1">All submissions have been reviewed!</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(prop => (
            <Link
              key={prop._id}
              to={`/employee/pending/${prop._id}`}
              className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:border-amber-500/30 transition-all group"
            >
              {/* Image */}
              <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-navy-800">
                {prop.images?.[0] ? (
                  <img
                    src={prop.images[0].startsWith('http') ? prop.images[0] : `${API_BASE}${prop.images[0]}`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                    {prop.title}
                  </h3>
                  <PropertyStatusBadge status={prop.status} />
                </div>
                <p className="text-slate-400 text-sm mb-2">{prop.location}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Owner: <span className="text-slate-300">{prop.owner?.name}</span></span>
                  <span>Type: <span className="text-slate-300">{prop.type}</span></span>
                  <span>Price: <span className="text-gold-400 font-semibold">{formatPrice(prop.price)}</span></span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span className="text-slate-300">{prop.documents?.length || 0} document{prop.documents?.length !== 1 ? 's' : ''}</span>
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex items-center">
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
