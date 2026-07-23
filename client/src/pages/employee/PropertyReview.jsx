import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, FileText, MapPin, DollarSign, BedDouble, Bath, Square, User, Building2, Download, ExternalLink } from 'lucide-react'
import api from '../../hooks/useApi'
import PropertyStatusBadge from '../../components/PropertyStatusBadge'
import toast from 'react-hot-toast'

const API_BASE = 'https://elite-homes-1-iqft.onrender.com'
const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop'

const DOC_TYPE_LABELS = {
  sale_deed: 'Sale Deed',
  ownership_cert: 'Ownership Certificate',
  govt_id: 'Government ID',
  other: 'Other',
}

export default function PropertyReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(null) // 'approve' | 'reject' | null
  const [selectedImg, setSelectedImg] = useState(0)

  useEffect(() => {
    api.get(`/employee/properties/${id}`)
      .then(res => setProperty(res.data))
      .catch(() => toast.error('Failed to load property.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApprove = async () => {
    if (!window.confirm('Approve this property? It will become publicly visible.')) return
    try {
      setSubmitting('approve')
      await api.put(`/employee/properties/${id}/approve`)
      toast.success('Property approved! Owner has been notified.')
      navigate('/employee/pending')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve.')
    } finally { setSubmitting(null) }
  }

  const handleReject = async () => {
    if (!remark.trim()) {
      toast.error('Please enter a rejection reason.')
      return
    }
    if (!window.confirm('Reject this property? The owner will be notified with your remarks.')) return
    try {
      setSubmitting('reject')
      await api.put(`/employee/properties/${id}/reject`, { remark })
      toast.success('Property rejected. Owner has been notified.')
      navigate('/employee/pending')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject.')
    } finally { setSubmitting(null) }
  }

  const resolveUrl = (url) => {
    if (!url) return FALLBACK
    return url.startsWith('http') ? url : `${API_BASE}${url}`
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`
    return `₹${price?.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-72 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="glass-card text-center py-16">
        <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-white font-semibold">Property not found</p>
        <Link to="/employee/pending" className="btn-ghost mt-4 inline-flex">Go Back</Link>
      </div>
    )
  }

  const isAlreadyReviewed = property.status !== 'pending'

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Back */}
      <Link to="/employee/pending" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-white">{property.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <PropertyStatusBadge status={property.status} />
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />{property.location}
            </span>
            <span className="text-gold-400 font-semibold text-sm">{formatPrice(property.price)}</span>
          </div>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>Submitted by</p>
          <p className="text-white font-medium">{property.owner?.name}</p>
          <p className="text-slate-500 text-xs">{property.owner?.email}</p>
        </div>
      </div>

      {/* Images */}
      {property.images?.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden h-64 sm:h-80">
            <img
              src={resolveUrl(property.images[selectedImg])}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { e.target.src = FALLBACK }}
            />
          </div>
          {property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {property.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImg === i ? 'border-amber-500' : 'border-white/10'
                  }`}
                >
                  <img src={resolveUrl(img)} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms || '—' },
          { icon: Bath, label: 'Bathrooms', value: property.bathrooms || '—' },
          { icon: Square, label: 'Area', value: property.area ? `${property.area} sqft` : '—' },
          { icon: Building2, label: 'Type', value: property.type },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-card p-4 text-center">
            <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-white font-semibold">{value}</p>
            <p className="text-slate-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-3">Description</h3>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{property.description}</p>
      </div>

      {/* Location coordinates */}
      {(property.latitude || property.longitude) && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-3">Location Coordinates</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-slate-400">Lat: <span className="text-white">{property.latitude}</span></span>
            <span className="text-slate-400">Lng: <span className="text-white">{property.longitude}</span></span>
            <a
              href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> View on Maps
            </a>
          </div>
        </div>
      )}

      {/* Ownership Documents */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          Ownership Documents ({property.documents?.length || 0})
        </h3>
        {!property.documents?.length ? (
          <p className="text-slate-400 text-sm">No documents uploaded by owner.</p>
        ) : (
          <div className="space-y-3">
            {property.documents.map((doc, i) => {
              const url = resolveUrl(doc.fileUrl)
              const isPdf = doc.mimeType === 'application/pdf' || doc.fileUrl?.endsWith('.pdf')
              return (
                <div key={doc._id || i} className="flex items-center gap-3 bg-navy-800/50 border border-white/10 rounded-xl px-4 py-3">
                  <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{doc.originalName}</p>
                    <p className="text-xs text-slate-400">{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</p>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                  >
                    {isPdf ? 'View PDF' : 'View'} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Already Reviewed Notice */}
      {isAlreadyReviewed && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          property.status === 'approved'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-red-500/10 border-red-500/20 text-red-300'
        }`}>
          {property.status === 'approved' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium capitalize">{property.status}</p>
            {property.rejectionRemark && (
              <p className="text-sm mt-1 opacity-80">Reason: {property.rejectionRemark}</p>
            )}
            {property.reviewedBy && (
              <p className="text-xs mt-1 opacity-60">Reviewed by: {property.reviewedBy?.name}</p>
            )}
          </div>
        </div>
      )}

      {/* Action Section */}
      {!isAlreadyReviewed && (
        <div className="glass-card p-6 space-y-5 border border-white/10">
          <h3 className="font-semibold text-white">Review Decision</h3>

          {/* Rejection Remark */}
          <div>
            <label className="label-text">Rejection Remarks (required if rejecting)</label>
            <textarea
              id="rejection-remark"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              rows={3}
              placeholder="Explain why this property is being rejected. This will be shown to the owner."
              className="input-field resize-none mt-1"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="approve-property-btn"
              onClick={handleApprove}
              disabled={!!submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {submitting === 'approve' ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <CheckCircle className="w-5 h-5" />}
              Approve Property
            </button>
            <button
              id="reject-property-btn"
              onClick={handleReject}
              disabled={!!submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 font-semibold rounded-xl border border-red-500/30 transition-colors"
            >
              {submitting === 'reject' ? (
                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : <XCircle className="w-5 h-5" />}
              Reject Property
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
