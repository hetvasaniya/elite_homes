import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageSquare, ChevronLeft } from 'lucide-react'
import api from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

const API_BASE = import.meta.env.VITE_API_URL || 'https://elite-homes-1-iqft.onrender.com'

const FALLBACK_AVATAR = (name = '?') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=030820&bold=true`

export default function ChatWidget({ property, seller, onClose }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Initialise conversation
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        // Get or create conversation
        const convRes = await api.post('/chat/conversation', {
          propertyId: property._id,
          sellerId: seller._id,
        })
        setConversation(convRes.data)

        // Load messages
        const msgRes = await api.get(`/chat/${convRes.data._id}/messages`)
        setMessages(msgRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [property._id, seller._id])

  // Join socket room
  useEffect(() => {
    if (!conversation || !socket) return
    socket.emit('join_conversation', conversation._id)

    const handler = (msg) => {
      setMessages((prev) => [...prev, msg])
    }
    socket.on('new_message', handler)

    return () => {
      socket.emit('leave_conversation', conversation._id)
      socket.off('new_message', handler)
    }
  }, [conversation, socket])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !conversation) return

    try {
      setSending(true)
      const res = await api.post(`/chat/${conversation._id}/messages`, { content: input.trim() })
      setMessages((prev) => [...prev, res.data])
      setInput('')
      inputRef.current?.focus()
    } catch {} finally { setSending(false) }
  }

  const isMe = (senderId) => senderId === user?._id || senderId?._id === user?._id

  const resolveAvatar = (sender) => {
    if (sender?.profilePicture) {
      return sender.profilePicture.startsWith('http')
        ? sender.profilePicture
        : `${API_BASE}${sender.profilePicture}`
    }
    return FALLBACK_AVATAR(sender?.name)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-in"
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-navy-900/80 flex-shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={resolveAvatar(seller)}
            alt={seller.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{seller.name}</p>
          <p className="text-slate-400 text-xs truncate">{property.title}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-navy-950/40" style={{ minHeight: 280 }}>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                <div className={`skeleton h-10 rounded-2xl ${i % 2 === 0 ? 'w-40' : 'w-32'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
            <MessageSquare className="w-8 h-8" />
            <p className="text-sm text-center">Start the conversation!<br />Ask about this property.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = isMe(msg.sender)
            return (
              <div key={msg._id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {!mine && (
                  <img
                    src={resolveAvatar(msg.sender)}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    mine
                      ? 'bg-gold-500 text-navy-950 font-medium rounded-br-sm'
                      : 'bg-navy-700 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-navy-800' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-white/10 bg-navy-900/80 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-colors"
          disabled={sending || loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending || loading}
          className="w-9 h-9 flex items-center justify-center bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-navy-950 transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  )
}
