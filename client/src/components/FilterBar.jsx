import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function FilterBar({ filters, onChange, onSearch }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const handleClear = () => {
    onChange({ location: '', type: '', minPrice: '', maxPrice: '' })
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="glass-card p-4 md:p-6">
      {/* Main Search Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Location Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="filter-location"
            type="text"
            placeholder="Search by location, city…"
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
            className="input-field pl-9"
          />
        </div>

        {/* Type Filter */}
        <select
          id="filter-type"
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="select-field sm:w-44"
        >
          <option value="">All Types</option>
          <option value="Sell">For Sale</option>
          <option value="Rent">For Rent</option>
        </select>

        {/* Advanced Toggle */}
        <button
          id="filter-advanced-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all duration-200 ${
            showAdvanced ? 'border-gold-500 text-gold-400 bg-gold-500/10' : 'border-white/10 text-slate-300 hover:border-gold-500/40'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>

        {/* Search Button */}
        <button
          id="filter-search-btn"
          onClick={onSearch}
          className="btn-primary px-6"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <label className="label-text">Min Price (₹)</label>
            <input
              id="filter-min-price"
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="input-field"
              min={0}
            />
          </div>
          <div>
            <label className="label-text">Max Price (₹)</label>
            <input
              id="filter-max-price"
              type="number"
              placeholder="No limit"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input-field"
              min={0}
            />
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
