import { useEffect, useState, useCallback } from 'react'
import { Building2, Search } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import FilterBar from '../components/FilterBar'
import api from '../hooks/useApi'

export default function Listings() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ location: '', type: '', minPrice: '', maxPrice: '' })

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.location) params.location = filters.location
      if (filters.type) params.type = filters.type
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice

      const res = await api.get('/properties', { params })
      setProperties(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchProperties() }, [])

  return (
    <div className="pt-24 pb-16 bg-hero min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-1">Browse</p>
          <h1 className="section-title">All Property Listings</h1>
          <p className="text-slate-400 mt-2">
            {loading ? 'Searching…' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar filters={filters} onChange={setFilters} onSearch={fetchProperties} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="skeleton h-52" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-9 h-9 text-slate-600" />
            </div>
            <h3 className="font-display text-xl font-semibold text-white mb-2">No Properties Found</h3>
            <p className="text-slate-400">Try adjusting your filters or search for a different location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {properties.map(p => (
              <PropertyCard key={p._id} property={p} onSaveToggle={fetchProperties} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
