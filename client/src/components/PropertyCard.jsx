import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, DollarSign, BedDouble, Bath, Square, Heart, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../hooks/useApi'
import toast from 'react-hot-toast'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60'

export default function PropertyCard({ property, onSaveToggle }) {
  const { isAuthenticated, user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(
    user?.savedProperties?.includes(property._id) ?? false
  )

  const imgSrc = property.images?.[0]
    ? (property.images[0].startsWith('http') ? property.images[0] : property.images[0])
    : FALLBACK_IMG

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in to save properties.')
      return
    }
    try {
      setSaving(true)
      const res = await api.post(`/user/save/${property._id}`)
      setIsSaved(res.data.saved)
      toast.success(res.data.saved ? 'Property saved!' : 'Removed from saved.')
      onSaveToggle?.()
    } catch (err) {
      toast.error('Failed to update saved properties.')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`
    return `₹${price.toLocaleString()}`
  }

  return (
    <Link to={`/listings/${property._id}`} id={`property-card-${property._id}`}>
      <article className="group glass-card-hover overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={imgSrc}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.src = FALLBACK_IMG }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={property.type === 'Sell' ? 'badge-sell' : 'badge-rent'}>
              For {property.type === 'Sell' ? 'Sale' : 'Rent'}
            </span>
            {property.status === 'Archived' && (
              <span className="badge-archived">Archived</span>
            )}
          </div>

          {/* Save Button */}
          <button
            id={`save-btn-${property._id}`}
            onClick={handleSave}
            disabled={saving}
            className={`absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
              isSaved
                ? 'bg-gold-500 text-navy-950'
                : 'bg-navy-900/70 text-white hover:bg-gold-500 hover:text-navy-950'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy-950/90 backdrop-blur-sm rounded-lg text-gold-400 font-bold text-sm">
              <DollarSign className="w-3.5 h-3.5" />
              {formatPrice(property.price)}
              {property.type === 'Rent' && <span className="text-slate-400 font-normal">/mo</span>}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display text-base font-semibold text-white mb-1.5 line-clamp-1 group-hover:text-gold-400 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Stats */}
          {(property.bedrooms || property.bathrooms || property.area) > 0 && (
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 pt-3 border-t border-white/5">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5" /> {property.bedrooms} Beds
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" /> {property.bathrooms} Baths
                </span>
              )}
              {property.area > 0 && (
                <span className="flex items-center gap-1">
                  <Square className="w-3.5 h-3.5" /> {property.area} sqft
                </span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 text-xs font-bold">
                {property.owner?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs text-slate-400 truncate max-w-24">{property.owner?.name || 'Owner'}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-gold-400 font-medium group-hover:gap-2 transition-all">
              <Eye className="w-3.5 h-3.5" /> View Details
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
