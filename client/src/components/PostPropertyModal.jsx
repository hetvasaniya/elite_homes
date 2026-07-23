import { useState, useRef, useCallback } from 'react'
import { X, Upload, MapPin, DollarSign, Home, FileText, BedDouble, Bath, Square, ImageIcon, FileCheck, AlertCircle, FilePlus } from 'lucide-react'
import api from '../hooks/useApi'
import toast from 'react-hot-toast'

const DOC_TYPES = [
  { value: 'sale_deed', label: 'Sale Deed' },
  { value: 'ownership_cert', label: 'Ownership Certificate' },
  { value: 'govt_id', label: 'Government ID' },
  { value: 'other', label: 'Other Proof' },
]

export default function PostPropertyModal({ onClose, onSuccess, editProperty = null }) {
  const isEdit = !!editProperty

  const [form, setForm] = useState({
    title: editProperty?.title || '',
    location: editProperty?.location || '',
    type: editProperty?.type || 'Sell',
    price: editProperty?.price || '',
    description: editProperty?.description || '',
    bedrooms: editProperty?.bedrooms || '',
    bathrooms: editProperty?.bathrooms || '',
    area: editProperty?.area || '',
    latitude: editProperty?.latitude || '',
    longitude: editProperty?.longitude || '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [documents, setDocuments] = useState([]) // { file, type }
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const fileRef = useRef()
  const docRef = useRef()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 6)
    setImages(files)
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  const handleDocuments = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    const newDocs = files.map(file => ({ file, type: 'other' }))
    setDocuments(prev => [...prev, ...newDocs].slice(0, 5))
  }

  const removeDocument = (idx) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx))
  }

  const setDocType = (idx, type) => {
    setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, type } : d))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.location.trim()) errs.location = 'Location is required.'
    if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)

      // Step 1: Create/update property with images
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v !== '' && v !== null && fd.append(k, v))
      images.forEach(img => fd.append('images', img))

      let property
      if (isEdit) {
        const res = await api.put(`/properties/${editProperty._id}`, form)
        property = res.data
      } else {
        const res = await api.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        property = res.data
      }

      // Step 2: Upload ownership documents if any
      if (documents.length > 0) {
        const docFd = new FormData()
        documents.forEach(d => docFd.append('documents', d.file))
        docFd.append('documentTypes', JSON.stringify(documents.map(d => d.type)))

        await api.post(`/properties/${property._id}/documents`, docFd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      toast.success(isEdit ? 'Property updated and resubmitted for review!' : 'Property submitted for approval!')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit property.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl glass-card border border-white/10 rounded-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-white">
            {isEdit ? 'Edit & Resubmit Property' : 'Post New Property'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Approval notice */}
        <div className="mx-6 mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            Your property will be reviewed by our team before going live. Upload ownership documents to speed up approval.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="label-text">Property Title *</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="post-prop-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Luxury 3BHK Apartment in Bandra"
                className={`input-field pl-9 ${errors.title ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="label-text">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="post-prop-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bandra West, Mumbai"
                className={`input-field pl-9 ${errors.location ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
          </div>

          {/* Lat / Lng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Latitude (optional)</label>
              <input
                id="post-prop-lat"
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 19.0596"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Longitude (optional)</label>
              <input
                id="post-prop-lng"
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 72.8295"
                className="input-field"
              />
            </div>
          </div>

          {/* Type + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Type *</label>
              <select id="post-prop-type" name="type" value={form.type} onChange={handleChange} className="select-field">
                <option value="Sell">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="label-text">Price (₹) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="post-prop-price"
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  className={`input-field pl-9 ${errors.price ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* Beds / Baths / Area */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-text">Bedrooms</label>
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="post-prop-beds" name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} placeholder="0" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="label-text">Bathrooms</label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="post-prop-baths" name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} placeholder="0" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="label-text">Area (sqft)</label>
              <div className="relative">
                <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="post-prop-area" name="area" type="number" min="0" value={form.area} onChange={handleChange} placeholder="0" className="input-field pl-9" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label-text">Description *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <textarea
                id="post-prop-desc"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the property features, amenities, nearby landmarks…"
                className={`input-field pl-9 resize-none ${errors.description ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Images */}
          <div>
            <label className="label-text">Photos (up to 6)</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/10 hover:border-gold-500/40 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-400 hover:text-gold-400 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-navy-800 group-hover:bg-gold-500/10 flex items-center justify-center transition-colors">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Click to upload images</span>
              <span className="text-xs text-slate-500">JPG, PNG, WebP up to 5MB each</span>
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden h-20">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ownership Documents */}
          <div>
            <label className="label-text">Ownership Documents (optional, up to 5)</label>
            <p className="text-slate-500 text-xs mb-2">Upload Sale Deed, Ownership Certificate, Government ID or other proof. PDF, JPG, PNG accepted.</p>
            <button
              type="button"
              onClick={() => docRef.current?.click()}
              className="w-full border-2 border-dashed border-white/10 hover:border-gold-500/40 rounded-xl p-5 flex flex-col items-center gap-2 text-slate-400 hover:text-gold-400 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-navy-800 group-hover:bg-gold-500/10 flex items-center justify-center transition-colors">
                <FilePlus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Click to upload documents</span>
              <span className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB each</span>
            </button>
            <input ref={docRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocuments} />

            {documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 bg-navy-800/50 border border-white/10 rounded-xl px-3 py-2">
                    <FileCheck className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300 truncate flex-1">{doc.file.name}</span>
                    <select
                      value={doc.type}
                      onChange={(e) => setDocType(i, e.target.value)}
                      className="text-xs bg-navy-700 border border-white/10 rounded-lg px-2 py-1 text-slate-300 flex-shrink-0"
                    >
                      {DOC_TYPES.map(dt => (
                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removeDocument(i)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            id="post-prop-submit"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                Submitting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {isEdit ? 'Update & Resubmit' : 'Submit for Approval'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
