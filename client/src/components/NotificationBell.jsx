import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Building2 } from 'lucide-react'
import api from '../hooks/useApi'
import { useSocket } from '../context/SocketContext'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)
  const { socket } = useSocket()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Real-time notification from Socket.io
  useEffect(() => {
    if (!socket) return
    const handler = (notif) => {
      setNotifications((prev) => [
        { ...notif, isRead: false, createdAt: new Date().toISOString(), _id: Date.now().toString() },
        ...prev,
      ])
    }
    socket.on('notification', handler)
    return () => socket.off('notification', handler)
  }, [socket])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {}
  }

  const typeIcon = (type) => {
    if (type === 'approved') return '🎉'
    if (type === 'rejected') return '❌'
    return '🔔'
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        id="notification-bell"
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="relative p-2 rounded-xl hover:bg-navy-800 text-slate-400 hover:text-white transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gold-500 text-navy-950 text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 glass-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
                <Bell className="w-8 h-8" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 transition-colors cursor-pointer ${
                    !notif.isRead ? 'bg-gold-500/5 hover:bg-gold-500/10' : 'hover:bg-navy-800/30'
                  }`}
                  onClick={() => !notif.isRead && markRead(notif._id)}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
