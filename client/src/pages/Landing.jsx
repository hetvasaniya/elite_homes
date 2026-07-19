import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Users, TrendingUp, Star, ChevronRight, MapPin, Shield, Zap } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import api from '../hooks/useApi'

const stats = [
  { label: 'Properties Listed', value: '2,400+', icon: Building2 },
  { label: 'Happy Clients', value: '18,000+', icon: Users },
  { label: 'Cities Covered', value: '120+', icon: MapPin },
  { label: 'Deals Closed', value: '9,500+', icon: TrendingUp },
]

const features = [
  {
    icon: Shield,
    title: 'Verified Listings',
    desc: 'Every property is thoroughly verified by our expert team to ensure authenticity and accuracy.',
  },
  {
    icon: Zap,
    title: 'Instant Inquiries',
    desc: 'Connect directly with property owners via our secure real-time messaging system.',
  },
  {
    icon: Star,
    title: 'Premium Quality',
    desc: 'Curated selection of premium properties matching your lifestyle and investment goals.',
  },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Homeowner',
    text: 'EliteEstate helped me find my dream apartment in just 2 weeks. The process was seamless and the team was incredibly supportive.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Real Estate Investor',
    text: 'As an investor, I need reliable data and quality listings. EliteEstate delivers on both fronts consistently.',
    rating: 5,
  },
  {
    name: 'Ananya Krishnan',
    role: 'Property Seller',
    text: 'I listed my property and got genuine inquiries within days. The platform is intuitive and the reach is phenomenal.',
    rating: 5,
  },
]

function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const num = parseInt(target.replace(/\D/g, ''))
        const duration = 1500
        const step = num / (duration / 16)
        let current = 0
        const timer = setInterval(() => {
          current = Math.min(current + step, num)
          setCount(Math.floor(current))
          if (current >= num) clearInterval(timer)
        }, 16)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function Landing() {
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    api.get('/properties?status=Active')
      .then(res => setFeatured(res.data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false))
  }, [])

  return (
    <div className="pt-16">
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-hero overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/3 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-400 text-sm font-medium mb-8 animate-fade-in">
              <Star className="w-4 h-4 fill-gold-400" />
              India's #1 Premium Property Marketplace
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              Find Your{' '}
              <span className="text-gradient-gold">Dream</span>
              <br />
              Property Today
            </h1>

            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Discover thousands of verified properties across India. Whether you're buying, renting, or investing — EliteEstate connects you to the finest real estate opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/listings" id="hero-explore-btn" className="btn-primary text-base px-8 py-4">
                Explore Listings <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" id="hero-list-btn" className="btn-secondary text-base px-8 py-4">
                List Your Property
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-14 flex flex-wrap gap-8">
              {stats.slice(0, 3).map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg leading-none">{value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ───────────────────────────────── */}
      <section className="py-20 bg-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-2">Featured</p>
              <h2 className="section-title">Latest Properties</h2>
            </div>
            <Link to="/listings" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium transition-colors group">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card overflow-hidden">
                  <div className="skeleton h-52" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No properties yet. Be the first to list!</p>
              <Link to="/register" className="btn-primary mt-4">List a Property</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── STATS COUNTER ───────────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-14 h-14 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-gold-400" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                  <CountUp target={value} />+
                </div>
                <p className="text-slate-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────────────── */}
      <section className="py-20 bg-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-2">Why EliteEstate</p>
            <h2 className="section-title">Built for Discerning Buyers</h2>
            <p className="section-subtitle mx-auto text-center">We raise the bar on what a property platform should be.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card-hover p-8 text-center group">
                <div className="w-14 h-14 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-gold-500/20 group-hover:border-gold-500/40 transition-all duration-300">
                  <Icon className="w-7 h-7 text-gold-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-20 bg-navy-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="glass-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 text-sm font-bold">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <p className="text-slate-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden glass-card border border-gold-500/20 rounded-3xl p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-navy-600/10" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to Find Your <span className="text-gradient-gold">Perfect Home?</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                Join thousands of happy homeowners who found their dream property on EliteEstate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/listings" id="cta-explore-btn" className="btn-primary text-base px-8 py-4">
                  Explore Properties <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" id="cta-contact-btn" className="btn-secondary text-base px-8 py-4">
                  Talk to an Expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
