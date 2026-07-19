import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I create an account on EliteEstate?',
        a: 'Click "Get Started" on the navigation bar. Fill in your name, email, and a secure password. Once registered, you can immediately browse listings and save properties to your wishlist.',
      },
      {
        q: 'Is EliteEstate free to use?',
        a: 'Yes! Creating an account, browsing listings, and saving properties is completely free. Property owners may post their listings through our platform as well.',
      },
      {
        q: 'How do I post a property listing?',
        a: 'After signing in, go to your Dashboard and navigate to the "My Listings" tab. Click "Post Property", fill in the details, upload photos, and submit. Your listing will be live immediately.',
      },
    ],
  },
  {
    category: 'Buying & Renting',
    items: [
      {
        q: 'How do I contact a property owner?',
        a: 'Visit the property detail page and use the "Send Inquiry" form to send a direct message to the property owner. You need to be signed in to send messages.',
      },
      {
        q: 'Are all listings verified?',
        a: 'Our team reviews listings for accuracy and authenticity. However, we always recommend doing your own due diligence before making any real estate decisions or transactions.',
      },
      {
        q: 'Can I save properties I\'m interested in?',
        a: 'Yes! Click the heart icon on any property card or the "Save Property" button on a detail page to add it to your saved properties. Access them from your Dashboard > Saved Properties tab.',
      },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      {
        q: 'How do I update my profile information?',
        a: 'Go to your Dashboard and use the profile section to update your name and profile picture. Your changes are saved immediately.',
      },
      {
        q: 'Is my personal data safe?',
        a: 'We take data security seriously. All passwords are encrypted using industry-standard bcrypt hashing, and communications are protected with JWT tokens. We never share your personal data with third parties.',
      },
      {
        q: 'What should I do if I forget my password?',
        a: 'Currently, please contact our support team at hello@eliteestate.in to reset your password. We are building a self-service password reset feature that will be available soon.',
      },
    ],
  },
  {
    category: 'Property Owners',
    items: [
      {
        q: 'How do I manage my listings?',
        a: 'From your Dashboard > My Listings tab, you can view, edit, archive, or delete any of your posted properties. You can also see how many inquiries each property has received.',
      },
      {
        q: 'How do I see messages from interested buyers?',
        a: 'Go to your Dashboard and select the "Requests to Owner" tab. All inquiries from potential buyers about your properties will appear here with sender details.',
      },
      {
        q: 'Can I upload multiple photos for my listing?',
        a: 'Yes! You can upload up to 6 images per property listing. Supported formats are JPG, PNG, and WebP, with a maximum file size of 5MB per image.',
      },
    ],
  },
]

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden group">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`font-medium text-sm pr-4 transition-colors ${open ? 'text-gold-400' : 'text-white group-hover:text-gold-400'}`}>
          {item.q}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180 text-gold-400' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 animate-fade-in">
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(faqs[0].category)

  return (
    <div className="pt-24 pb-16 min-h-screen bg-hero">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">FAQ</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Everything you need to know about using EliteEstate. Can't find the answer? Contact our team.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {faqs.map(({ category }) => (
            <button
              key={category}
              id={`faq-tab-${category.replace(/\s/g, '-').toLowerCase()}`}
              onClick={() => setActiveCategory(category)}
              className={`tab-btn ${activeCategory === category ? 'tab-btn-active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        {faqs.filter(f => f.category === activeCategory).map(({ category, items }) => (
          <div key={category} className="space-y-3 animate-fade-in">
            {items.map((item, idx) => (
              <FaqItem key={idx} item={item} />
            ))}
          </div>
        ))}

        {/* Still have questions */}
        <div className="mt-12 glass-card border border-gold-500/20 p-8 text-center">
          <HelpCircle className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-white mb-2">Still Have Questions?</h3>
          <p className="text-slate-400 mb-5">Can't find what you're looking for? Reach out to our expert team.</p>
          <a href="/contact" className="btn-primary inline-flex">Contact Support</a>
        </div>
      </div>
    </div>
  )
}
