import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Building2, Inbox, Heart, Plus, Edit2, Trash2, Eye, MessageSquare, MapPin, DollarSign, User, Bell, AlertCircle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../hooks/useApi'
import PropertyCard from '../components/PropertyCard'
import PostPropertyModal from '../components/PostPropertyModal'
import PropertyStatusBadge from '../components/PropertyStatusBadge'
import toast from 'react-hot-toast'

const API_BASE = 'https://elite-homes-1-iqft.onrender.com'
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop'

const resolveImage = (src) => {
  if (!src) return FALLBACK_IMG
  if (src.startsWith('http')) return src
  return `${API_BASE}${src}`
}

const TABS = [
  { id: 'listings', label: 'My Listings', icon: Building2 },
  { id: 'requests', label: 'Requests to Owner', icon: Inbox },
  { id: 'saved', label: 'Saved Properties', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

// ─── My Listings Tab ──────────────────────────────────────────
function MyListings({ user }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProperty, setEditProperty] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await api.get('/properties/my')
      setProperties(res.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchProperties() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return
    try {
      setDeleting(id)
      await api.delete(`/properties/${id}`)
      toast.success('Property deleted.')
      fetchProperties()
    } catch { toast.error('Failed to delete.') } finally { setDeleting(null) }
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`
    return `₹${price?.toLocaleString()}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">My Listings</h2>
          <p className="text-slate-400 text-sm mt-0.5">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} posted</p>
        </div>
        <button id="post-property-btn" onClick={() => { setEditProperty(null); setShowModal(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Post Property
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-52 skeleton" />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">No Properties Yet</h3>
          <p className="text-slate-400 text-sm mb-5">Post your first property to start receiving inquiries.</p>
          <button onClick={() => { setEditProperty(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Post Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map(prop => (
            <div key={prop._id} className="glass-card overflow-hidden group flex flex-col">
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={resolveImage(prop.images?.[0])}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.src = FALLBACK_IMG }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                  <span className={prop.type === 'Sell' ? 'badge-sell' : 'badge-rent'}>{prop.type === 'Sell' ? 'Sale' : 'Rent'}</span>
                  <PropertyStatusBadge status={prop.status} />
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="text-gold-400 font-bold text-sm">{formatPrice(prop.price)}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">{prop.title}</h3>
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                  <MapPin className="w-3 h-3" /> {prop.location}
                </div>

                {/* Rejection remark */}
                {prop.status === 'rejected' && prop.rejectionRemark && (
                  <div className="flex items-start gap-2 mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300 leading-relaxed">{prop.rejectionRemark}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  {prop.status === 'rejected' && (
                    <button
                      onClick={() => { setEditProperty(prop); setShowModal(true) }}
                      className="flex-1 text-xs py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Edit & Resubmit
                    </button>
                  )}
                  {prop.status !== 'rejected' && (
                    <button
                      onClick={() => { setEditProperty(prop); setShowModal(true) }}
                      className="flex-1 text-xs py-2 rounded-lg border border-white/10 text-slate-400 hover:border-gold-500/40 hover:text-gold-400 transition-all"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    id={`delete-prop-${prop._id}`}
                    onClick={() => handleDelete(prop._id)}
                    disabled={deleting === prop._id}
                    className="p-2 rounded-lg border border-white/10 text-slate-400 hover:border-red-500/40 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PostPropertyModal
          onClose={() => { setShowModal(false); setEditProperty(null) }}
          onSuccess={fetchProperties}
          editProperty={editProperty}
        />
      )}
    </div>
  )
}

// ─── Requests Tab ─────────────────────────────────────────────
function RequestsTab() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/messages/owner')
      .then(res => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`)
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m))
    } catch {}
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card h-24 skeleton" />)}</div>

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white">Requests to Owner</h2>
        <p className="text-slate-400 text-sm mt-0.5">{messages.length} inquir{messages.length !== 1 ? 'ies' : 'y'} received</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">No Inquiries Yet</h3>
          <p className="text-slate-400 text-sm">When buyers send messages about your properties, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg._id}
              id={`inquiry-${msg._id}`}
              className={`glass-card p-5 border ${!msg.isRead ? 'border-gold-500/30 bg-gold-500/5' : 'border-white/10'}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold flex-shrink-0">
                  {msg.sender?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{msg.sender?.name}</span>
                    <span className="text-slate-500 text-xs">{msg.sender?.email}</span>
                    {!msg.isRead && <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">New</span>}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Re: <span className="text-slate-300">{msg.property?.title}</span> • {msg.property?.location}
                  </p>
                  <p className="text-slate-300 text-sm bg-navy-800/50 rounded-lg p-3">{msg.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {!msg.isRead && (
                      <button onClick={() => markRead(msg._id)} className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Saved Tab ────────────────────────────────────────────────
function SavedTab() {
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = async () => {
    try {
      setLoading(true)
      const res = await api.get('/user/saved')
      setSaved(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchSaved() }, [])

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(3)].map((_, i) => <div key={i} className="glass-card h-52 skeleton" />)}</div>

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white">Saved Properties</h2>
        <p className="text-slate-400 text-sm mt-0.5">{saved.length} saved propert{saved.length !== 1 ? 'ies' : 'y'}</p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">No Saved Properties</h3>
          <p className="text-slate-400 text-sm">Click the heart icon on any listing to save it for later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map(p => <PropertyCard key={p._id} property={p} onSaveToggle={fetchSaved} />)}
        </div>
      )}
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────
function NotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchNotifications() }, [])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const typeConfig = {
    approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    general: { icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass-card h-20 skeleton" />)}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Notifications</h2>
          <p className="text-slate-400 text-sm mt-0.5">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">No Notifications</h3>
          <p className="text-slate-400 text-sm">You'll be notified when your property submissions are reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const cfg = typeConfig[notif.type] || typeConfig.general
            const Icon = cfg.icon
            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markRead(notif._id)}
                className={`glass-card p-4 border cursor-pointer transition-all ${
                  !notif.isRead ? 'border-gold-500/20 bg-gold-500/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.bg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-slate-600 text-xs mt-2">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('listings')
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', profilePicture: user?.profilePicture || '' })
  const [saving, setSaving] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await api.put('/user/profile', profileForm)
      updateUser(res.data)
      toast.success('Profile updated!')
      setEditProfile(false)
    } catch { toast.error('Failed to update profile.') } finally { setSaving(false) }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="pt-24 pb-16 min-h-screen bg-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="glass-card p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 text-2xl font-bold shadow-gold">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : initials}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">{user?.name}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 text-xs font-medium rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                {user?.role === 'admin' ? '⚡ Admin' : user?.role === 'employee' ? '💼 Employee' : '👤 Member'}
              </span>
            </div>
          </div>
          <button onClick={() => setEditProfile(!editProfile)} className="btn-ghost text-sm">
            <Edit2 className="w-4 h-4" /> {editProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Profile Form */}
        {editProfile && (
          <div className="glass-card p-6 mb-6 animate-slide-up">
            <h3 className="font-semibold text-white mb-4">Edit Profile</h3>
            <form onSubmit={handleProfileSave} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="edit-profile-name"
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field pl-9"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Profile Picture URL</label>
                <input
                  id="edit-profile-pic"
                  value={profileForm.profilePicture}
                  onChange={e => setProfileForm(p => ({ ...p, profilePicture: e.target.value }))}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditProfile(false)} className="btn-ghost">Cancel</button>
                <button id="save-profile-btn" type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`dashboard-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`tab-btn flex items-center gap-2 flex-shrink-0 ${activeTab === id ? 'tab-btn-active' : ''}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'listings' && <MyListings user={user} />}
          {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'saved' && <SavedTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  )
}
