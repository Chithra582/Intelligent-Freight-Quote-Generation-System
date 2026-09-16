import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  BarChart3, 
  Map, 
  Globe2, 
  Leaf, 
  ArrowRight, 
  CheckCircle,
  MessageSquare,
  Mail,
  Send,
  Building,
  User,
  Phone,
  ExternalLink
} from 'lucide-react'


import Navbar from '../components/Navbar'
import Footer from '../components/Footer'


const features = [
  {
    icon: Map,
    title: 'AI Route Optimization',
    description: 'Neural networks compute multi-modal corridors, routing past congestion and weather in real-time.',
    glow: 'from-blue-500/10 to-indigo-500/10',
  },
  {
    icon: Zap,
    title: 'Instant Rate Engine',
    description: 'Algorithmic calculations compare ocean, air, rail, and road pricing variables in under two seconds.',
    glow: 'from-accent-500/10 to-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Dynamic Spot Pricing',
    description: 'Integrates real-time freight capacity data and diesel price trackers to offer optimal quotes.',
    glow: 'from-purple-500/10 to-pink-500/10',
  },
  {
    icon: Globe2,
    title: 'Multi-modal Dispatch',
    description: 'Easily bundle ocean shipping, domestic trucking, rail freight, and express air delivery into one lane.',
    glow: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    icon: Leaf,
    title: 'Carbon-Aware Planning',
    description: 'Recommends alternative low-carbon routes and fuel blends to meet company corporate ESG standards.',
    glow: 'from-green-500/10 to-emerald-500/10',
  },
  {
    icon: Shield,
    title: 'Smart Escrow & Security',
    description: 'Logistics cargo contracts are verified dynamically, providing maximum reliability for high-value freight.',
    glow: 'from-orange-500/10 to-amber-500/10',
  },
]

const steps = [
  {
    step: '01',
    title: 'Input Parameters',
    description: 'Specify freight origin, destination ports, exact weight, and cargo classification type.',
  },
  {
    step: '02',
    title: 'AI Neural Matching',
    description: 'FreightIQ algorithms scour thousands of multi-modal routes to optimize cost and time grids.',
  },
  {
    step: '03',
    title: 'Select Quote Option',
    description: 'Compare shipping durations, carbon emission scores, and calculated cost breakdowns side-by-side.',
  },
  {
    step: '04',
    title: 'Instant Dispatch Booking',
    description: 'Confirm and secure your optimized booking, instantly generating digital cargo manifests and tracking IDs.',
  },
]


export default function LandingPage() {
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleContactSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const nameInput = form.querySelector('input[type="text"]')
    const emailInput = form.querySelector('input[type="email"]')
    const msgInput = form.querySelector('textarea')

    const newFeedback = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      name: nameInput?.value || 'Corporate Shipper',
      email: emailInput?.value || 'shipper@example.com',
      message: msgInput?.value || 'General logistics inquiry',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'New'
    }

    try {
      const stored = localStorage.getItem('customerFeedbackList')
      const list = stored ? JSON.parse(stored) : []
      localStorage.setItem('customerFeedbackList', JSON.stringify([newFeedback, ...list]))
    } catch (err) {
      console.error('Feedback storage error:', err)
    }

    setContactSubmitted(true)
    setTimeout(() => {
      setContactSubmitted(false)
      form.reset()
    }, 3000)
  }


  const scrollToQuote = (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard/new-shipment')
    } else {
      navigate('/login')
    }
  }

  const scrollToFeatures = (e) => {
    e.preventDefault()
    const el = document.querySelector('#features')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 relative">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
        {/* Colorful Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 gradient-primary opacity-10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-accent-550/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> FREIGHTIQ V2.0 - AI ENGINE ACTIVE
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900"
              >
                Intelligent Freight <br />
                Quote Generation
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-655 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                Get accurate freight rates instantly across roads, rails, skies, and oceans. Optimized routes, dynamic billing simulations, and carbon footprint reduction powered by AI.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <a
                  href="#quote-generator"
                  onClick={scrollToQuote}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl gradient-primary text-white font-bold hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  Request Quote <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#features"
                  onClick={scrollToFeatures}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-slate-200 hover:border-slate-350 bg-white text-slate-750 hover:text-slate-900 font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
                >
                  Explore Features
                </a>
              </motion.div>

              {/* Stats Counters Grid (Horizontal Row) */}
              <div className="pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-8 md:gap-12">
                <div className="flex flex-col">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5 justify-center lg:justify-start">
                    <span className="text-blue-500 text-lg">⚡</span> 99.4%
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">On-Time Dispatch</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5 justify-center lg:justify-start">
                    <span className="text-blue-500 text-lg">🕒</span> &lt; 5s
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Instant Quote SLA</span>
                </div>

                <div className="flex flex-col">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5 justify-center lg:justify-start">
                    <span className="text-blue-500 text-lg">🛡️</span> ₹3,500Cr+
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Freight Managed</span>
                </div>
              </div>
            </div>

            {/* Right Side: Professional Logistics Image */}
            <div className="lg:col-span-5 relative w-full max-w-lg mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-3xl rounded-full" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-10 p-3 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src="/logistics_hero.png"
                  alt="Professional Global Logistics Routing"
                  className="w-full h-auto rounded-[24px] object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative border-t border-slate-200/60 bg-white">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-600/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-600/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-200 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              AI-Optimized Logistics Platform
            </h2>
            <p className="text-slate-650 mt-3 text-sm sm:text-base leading-relaxed">
              We leverage cloud telemetry, weather data, and predictive algorithms to give your logistics team unfair efficiency advantages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-card rounded-2xl p-6 relative group overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Backdrop Glow effect */}
                  <div className={`absolute -right-16 -bottom-16 w-32 h-32 bg-gradient-to-tr ${feature.glow} opacity-0 group-hover:opacity-100 blur-2xl rounded-full transition-all duration-500`} />

                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-6 text-white shadow-md shadow-accent-500/10 group-hover:shadow-accent-500/25 transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-555 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-24 bg-slate-50 border-t border-slate-200/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 text-xs font-semibold text-blue-650 bg-blue-50 rounded-full border border-blue-200 uppercase tracking-widest">
              Operation Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              How FreightIQ Streamlines Shipping
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Achieve digital freight optimization in four animated system steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative group p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow transition-all duration-300"
              >
                {/* Visual line between steps */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 left-[90%] w-[35%] h-[1px] bg-gradient-to-r from-blue-500/20 to-transparent z-0 pointer-events-none" />
                )}

                <div className="relative z-10">
                  <span className="text-4xl font-extrabold gradient-text opacity-40 group-hover:opacity-100 transition-opacity duration-300 block mb-4">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-555 text-xs sm:text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Contact Section matching Reference Image */}
      <section id="contact" className="py-20 bg-[#091222] border-t border-slate-800 relative overflow-hidden text-white">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Contact info & details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Mail className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Contact FreightHub Support
                </h2>
                <p className="text-sm text-slate-300 max-w-lg leading-relaxed mt-3">
                  Have custom enterprise shipping inquiries, API integration questions, or contract freight forwarder requests? Get in touch with our commercial operations team.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e1a30] border border-slate-700/60 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 block">
                      FreightHub Center, Bandra-Kurla Complex (BKC), Mumbai, 400051
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e1a30] border border-slate-700/60 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 block">
                      +91 (022) 8800-4492 / Commercial Support Desk
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e1a30] border border-slate-700/60 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 block">
                      support@freighthub.in / rates@freighthub.in
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Send Us a Direct Inquiry Form */}
            <div className="lg:col-span-6">
              <div className="bg-[#0b1528] border border-slate-700/70 rounded-3xl p-7 sm:p-9 shadow-2xl relative">
                <h3 className="text-xl font-bold text-white mb-6">
                  Send Us a Direct Inquiry
                </h3>

                {contactSubmitted ? (
                  <div className="p-6 rounded-2xl bg-blue-950/50 border border-blue-500/40 text-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-base font-bold text-white">Inquiry Received</h4>
                    <p className="text-xs text-slate-300">Our logistics operations desk will respond to your registered email shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        YOUR NAME
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-[#070e1b] border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 bg-[#070e1b] border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        MESSAGE
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Describe your freight inquiry..."
                        className="w-full px-4 py-3 bg-[#070e1b] border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>SUBMIT SUPPORT INQUIRY</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

