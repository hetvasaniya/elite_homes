import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, BedDouble, Bath, Square, Heart, MessageSquare,
  User, Calendar, DollarSign, ChevronLeft, ChevronRight, Send
} from 'lucide-react'
import api from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60'
const API_BASE = 'https://elite-homes-1-iqft.onrender.com'

const resolveImage = (src) => {
  if (!src) return FALLBACK_IMG
  if (src.startsWith('http')) return src
  return `${API_BASE}${src}`
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [inquiry, setInquiry] = useState('')
  const [sending, setSending] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(res => {
        setProperty(res.data)
        setIsSaved(user?.savedProperties?.includes(res.data._id))
      })
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to save.'); return }
    try {
      setSaving(true)
      const res = await api.post(`/user/save/${property._id}`)
      setIsSaved(res.data.saved)
      toast.success(res.data.saved ? 'Saved!' : 'Removed from saved.')
    } catch { toast.error('Failed.') } finally { setSaving(false) }
  }

  const handleInquiry = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please sign in to send an inquiry.'); return }
    if (!inquiry.trim()) { toast.error('Please write a message.'); return }
    try {
      setSending(true)
      await api.post('/messages', { propertyId: property._id, content: inquiry })
      toast.success('Inquiry sent to the owner!')
      setInquiry('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry.')
    } finally { setSending(false) }
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price?.toLocaleString()}`
  }

  const images = property?.images?.length
    ? property.images.map(resolveImage)
    : [FALLBACK_IMG]

  if (loading) return (
    <div className="min-h-screen bg-hero pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!property) return null

  return (
    <div className="min-h-screen bg-hero pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-gold-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden h-72 md:h-[400px] group">
              <img
                src={images[imgIdx]}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = FALLBACK_IMG }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-navy-950/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gold-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-navy-950/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gold-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all duration-200 ${i === imgIdx ? 'w-6 bg-gold-400' : 'w-1.5 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-gold-500' : 'border-white/10 hover:border-gold-500/40'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK_IMG }} />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Meta */}
            <div className="glass-card p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={property.type === 'Sell' ? 'badge-sell' : 'badge-rent'}>
                  For {property.type === 'Sell' ? 'Sale' : 'Rent'}
                </span>
                <span className={property.status === 'Active' ? 'badge-active' : 'badge-archived'}>
                  {property.status}
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">{property.title}</h1>
              <div className="flex items-center gap-2 text-slate-400 mb-5">
                <MapPin className="w-4 h-4 text-gold-500" />
                <span>{property.location}</span>
              </div>

              {/* Stats */}
              {(property.bedrooms || property.bathrooms || property.area) > 0 && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-navy-800/50 rounded-xl mb-5">
                  {property.bedrooms > 0 && (
                    <div className="text-center">
                      <BedDouble className="w-5 h-5 text-gold-400 mx-auto mb-1" />
                      <p className="text-white font-semibold">{property.bedrooms}</p>
                      <p className="text-xs text-slate-400">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="text-center">
                      <Bath className="w-5 h-5 text-gold-400 mx-auto mb-1" />
                      <p className="text-white font-semibold">{property.bathrooms}</p>
                      <p className="text-xs text-slate-400">Bathrooms</p>
                    </div>
                  )}
                  {property.area > 0 && (
                    <div className="text-center">
                      <Square className="w-5 h-5 text-gold-400 mx-auto mb-1" />
                      <p className="text-white font-semibold">{property.area}</p>
                      <p className="text-xs text-slate-400">sqft</p>
                    </div>
                  )}
                </div>
              )}

              <h2 className="font-semibold text-white mb-2">Description</h2>
              <p className="text-slate-400 leading-relaxed">{property.description}</p>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Listed {new Date(property.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Price Card */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-gold-400" />
                <span className="text-slate-400 text-sm">Price</span>
              </div>
              <p className="font-display text-3xl font-bold text-white mb-1">
                {formatPrice(property.price)}
                {property.type === 'Rent' && <span className="text-slate-400 text-base font-normal">/mo</span>}
              </p>
              <button
                id="detail-save-btn"
                onClick={handleSave}
                disabled={saving}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isSaved ? 'bg-gold-500 text-navy-950' : 'border border-gold-500/40 text-gold-400 hover:bg-gold-500/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Property'}
              </button>
            </div>

            {/* Owner Card */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-gold-400" /> Property Owner
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-lg">
                  {property.owner?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{property.owner?.name}</p>
                  <p className="text-xs text-slate-400">{property.owner?.email}</p>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gold-400" /> Send Inquiry
              </h3>
              {isAuthenticated ? (
                property.owner?._id === user?._id ? (
                  <p className="text-slate-400 text-sm text-center py-4">This is your property.</p>
                ) : (
                  <form onSubmit={handleInquiry} className="space-y-3">
                    <textarea
                      id="inquiry-input"
                      value={inquiry}
                      onChange={(e) => setInquiry(e.target.value)}
                      rows={4}
                      placeholder="I'm interested in this property. Please share more details…"
                      className="input-field resize-none text-sm"
                    />
                    <button id="inquiry-submit-btn" type="submit" disabled={sending} className="btn-primary w-full justify-center">
                      {sending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-navy-950/50 border-t-navy-950 rounded-full animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Message</span>
                      )}
                    </button>
                  </form>
                )
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-3">Sign in to send an inquiry</p>
                  <Link to="/login" className="btn-primary justify-center w-full">Sign In</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
