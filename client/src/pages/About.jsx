import { Link } from 'react-router-dom'
import { Users, Award, Globe, Heart, Target, Lightbulb } from 'lucide-react'

const team = [
  { name: 'Arjun Kapoor', role: 'CEO & Founder', initial: 'A', bio: '15+ years in real estate investment and property development across India.' },
  { name: 'Priya Nair', role: 'Head of Operations', initial: 'P', bio: 'Expert in property management and client relations with a passion for excellence.' },
  { name: 'Rohan Desai', role: 'Chief Technology Officer', initial: 'R', bio: 'Architect of EliteEstate\'s digital platform and innovation strategy.' },
  { name: 'Sneha Patel', role: 'Lead Property Advisor', initial: 'S', bio: 'Certified property consultant specializing in luxury residential and commercial properties.' },
]

const values = [
  { icon: Heart, title: 'Client First', desc: 'Every decision we make starts with our client\'s best interests at heart.' },
  { icon: Target, title: 'Precision', desc: 'We curate and verify every listing to ensure the highest quality standards.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Leveraging technology to make property transactions seamless and transparent.' },
  { icon: Globe, title: 'Nationwide Reach', desc: 'Connecting buyers and sellers across 120+ cities throughout India.' },
]

export default function About() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">Our Story</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            About <span className="text-gradient-gold">EliteEstate</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Founded with a vision to transform the Indian real estate landscape, EliteEstate brings together technology, expertise, and a passion for helping people find their perfect space.
          </p>
        </div>

        {/* Mission */}
        <div className="glass-card p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-2xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 text-gold-400 text-xs font-semibold rounded-full mb-4">
                <Award className="w-3.5 h-3.5" /> Our Mission
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Making Premium Real Estate Accessible to Everyone
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                We believe everyone deserves access to quality real estate information and opportunities. EliteEstate democratizes the property market by providing transparent listings, verified data, and direct connections between buyers and sellers.
              </p>
              <p className="text-slate-400 leading-relaxed">
                From first-time homebuyers to seasoned investors, we provide the tools, data, and expertise to help you make confident real estate decisions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Properties Listed', value: '2,400+' },
                { label: 'Cities Covered', value: '120+' },
                { label: 'Happy Clients', value: '18,000+' },
                { label: 'Years of Trust', value: '8+' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-navy-800/50 rounded-xl p-4 text-center border border-white/5">
                  <p className="font-display text-2xl font-bold text-gold-400">{value}</p>
                  <p className="text-slate-400 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card-hover p-6 text-center group">
                <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle mx-auto text-center">Experts dedicated to your real estate success.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map(({ name, role, initial, bio }) => (
              <div key={name} className="glass-card-hover p-6 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 text-2xl font-bold mx-auto mb-4 group-hover:shadow-gold transition-shadow">
                  {initial}
                </div>
                <h3 className="font-semibold text-white mb-0.5">{name}</h3>
                <p className="text-gold-400 text-xs font-medium mb-3">{role}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card border border-gold-500/20 p-10 text-center">
          <Users className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-3">Join Our Growing Community</h2>
          <p className="text-slate-400 mb-6">Start your property journey with EliteEstate today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary">Create Account</Link>
            <Link to="/contact" className="btn-secondary">Get in Touch</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
