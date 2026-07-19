import { useEffect, useState } from 'react'
import { Mail, Calendar, Eye, EyeOff, Inbox } from 'lucide-react'
import api from '../../hooks/useApi'
import toast from 'react-hot-toast'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/messages')
      setMessages(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/admin/messages/${id}/read`)
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m))
    } catch { toast.error('Failed.') }
  }

  const unread = messages.filter(m => !m.isRead).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-white">Messages</h1>
          {unread > 0 && (
            <span className="px-2.5 py-1 bg-gold-500 text-navy-950 text-xs font-bold rounded-full">{unread} new</span>
          )}
        </div>
        <p className="text-slate-400 text-sm mt-0.5">All support messages submitted via Contact Us</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-28 skeleton" />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">No Messages Yet</h3>
          <p className="text-slate-400 text-sm">Support messages submitted on the Contact page will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg._id}
              id={`admin-msg-${msg._id}`}
              className={`glass-card border ${!msg.isRead ? 'border-gold-500/30 bg-gold-500/5' : 'border-white/10'} overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold flex-shrink-0">
                      {msg.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold text-white text-sm">{msg.name}</span>
                        {!msg.isRead && <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full font-medium">New</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                        <Mail className="w-3 h-3" /> {msg.email}
                      </div>
                      {msg.subject && (
                        <p className="text-sm text-slate-300 font-medium mb-1">Re: {msg.subject}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-500 hidden sm:block">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <button
                      onClick={() => setExpanded(expanded === msg._id ? null : msg._id)}
                      className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-white transition-colors"
                    >
                      {expanded === msg._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expanded === msg._id && (
                  <div className="mt-3 pt-3 border-t border-white/10 animate-fade-in">
                    <p className="text-slate-300 text-sm leading-relaxed bg-navy-800/50 rounded-xl p-4">{msg.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(msg.createdAt).toLocaleString('en-IN')}
                      </span>
                      {!msg.isRead && (
                        <button onClick={() => markRead(msg._id)} className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
