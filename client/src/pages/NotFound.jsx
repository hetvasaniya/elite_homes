import { useNavigate } from 'react-router-dom'
import { Building2, Home, ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4 py-20 relative overflow-hidden">

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/4 rounded-full blur-3xl" />
      </div>

      {/* Floating dots decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gold-500/20"
            style={{
              width: `${6 + i * 4}px`,
              height: `${6 + i * 4}px`,
              top: `${15 + i * 12}%`,
              left: `${5 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <div
            key={`r-${i}`}
            className="absolute rounded-full bg-blue-400/15"
            style={{
              width: `${8 + i * 3}px`,
              height: `${8 + i * 3}px`,
              top: `${20 + i * 18}%`,
              right: `${8 + i * 12}%`,
              animation: `float ${2.5 + i * 0.7}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl w-full">

        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-12">
          <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-gold">
            <Building2 className="w-5 h-5 text-navy-950" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold">
            <span className="text-white">Elite</span>
            <span className="text-gradient-gold">Estate</span>
          </span>
        </div>

        {/* Giant 404 */}
        <div className="relative mb-6 select-none">
          <p
            className="font-display font-black text-[10rem] md:text-[14rem] leading-none text-gradient-gold opacity-20"
            aria-hidden="true"
          >
            404
          </p>
          {/* Compass icon layered over the number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center backdrop-blur-sm">
              <Compass className="w-12 h-12 md:w-16 md:h-16 text-gold-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-base md:text-lg mb-2 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <p className="text-slate-500 text-sm mb-10">
          Error code: <span className="font-mono text-gold-500">404</span>
        </p>

        {/* Divider */}
        <div className="gold-divider max-w-xs mx-auto" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <a
            id="not-found-home-btn"
            href="/"
            className="btn-primary justify-center py-3.5 px-8 text-base"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </a>
          <button
            id="not-found-back-btn"
            onClick={() => navigate(-1)}
            className="btn-secondary justify-center py-3.5 px-8 text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          <span className="text-slate-600">Try these instead:</span>
          <a href="/listings" className="text-gold-500 hover:text-gold-400 transition-colors">Browse Listings</a>
          <a href="/about"    className="text-gold-500 hover:text-gold-400 transition-colors">About Us</a>
          <a href="/contact"  className="text-gold-500 hover:text-gold-400 transition-colors">Contact</a>
        </div>
      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-18px) rotate(8deg); }
        }
      `}</style>
    </div>
  )
}
