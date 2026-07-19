import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import api from '../hooks/useApi'
import toast from 'react-hot-toast'

const contactInfo = [
  { icon: MapPin, label: 'Address', value: '123 Elite Avenue, Bandra West, Mumbai 400050' },
  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
  { icon: Mail, label: 'Email', value: 'hello@eliteestate.in' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required.'
    if (!form.message.trim()) errs.message = 'Message is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await api.post('/contact', form)
      setSent(true)
      toast.success('Message sent successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-hero">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">Get In Touch</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Contact <span className="text-gradient-gold">Us</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Have a question or need expert advice? Our team is here to help you navigate the world of real estate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass-card p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-slate-300 text-sm">{value}</p>
                </div>
              </div>
            ))}

            {/* Hours */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monday – Friday</span>
                  <span className="text-white">9:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Saturday</span>
                  <span className="text-white">10:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sunday</span>
                  <span className="text-slate-500">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="glass-card p-7">
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="btn-secondary">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-display text-xl font-semibold text-white mb-5">Send a Message</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">Name *</label>
                      <input id="contact-name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name"
                        className={`input-field ${errors.name ? 'border-red-500' : ''}`} />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="label-text">Email *</label>
                      <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com"
                        className={`input-field ${errors.email ? 'border-red-500' : ''}`} />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label-text">Subject</label>
                    <input id="contact-subject" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?"
                      className="input-field" />
                  </div>

                  <div>
                    <label className="label-text">Message *</label>
                    <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} rows={5} resize="none"
                      placeholder="Tell us how we can help you…"
                      className={`input-field resize-none ${errors.message ? 'border-red-500' : ''}`} />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                  </div>

                  <button id="contact-submit-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-navy-950/50 border-t-navy-950 rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Message
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
