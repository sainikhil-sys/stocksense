import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Bot, BarChart3, Shield, Zap,
  ArrowRight, Star, CheckCircle2, ChevronDown
} from 'lucide-react';

const FEATURES = [
  { icon: BarChart3,  title: 'Smart Budget Planner',      desc: 'Auto-split income using the 50/30/20 rule. Spot overspending instantly.',           color: 'text-brand-400'   },
  { icon: Target,     title: 'Goal & Wishlist Tracker',   desc: 'Set goals like "iPhone" or "Goa trip" and get a personalised savings roadmap.',    color: 'text-success-400' },
  { icon: TrendingUp, title: 'Portfolio Manager',         desc: 'Track all investments in one place. See net worth, gains & allocation charts.',     color: 'text-warning-400' },
  { icon: Bot,        title: 'AI Financial Assistant',    desc: 'Chat with your personal AI advisor. Ask anything — no jargon, just clarity.',      color: 'text-brand-400'   },
  { icon: Shield,     title: 'Risk-Aware Recommendations',desc: 'Get personalised investment picks based on your age, income & risk appetite.',      color: 'text-success-400' },
  { icon: Zap,        title: 'Scenario Simulator',        desc: 'See how ₹5K/month grows over 10 years. Powered by compound interest math.',        color: 'text-warning-400' },
];

const STATS = [
  { value: '50K+',  label: 'Users Trust Us'     },
  { value: '₹2Cr+', label: 'Assets Tracked'     },
  { value: '98%',   label: 'Accuracy Rate'       },
  { value: '4.9★',  label: 'User Rating'         },
];

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Software Engineer', text: 'Finally understood where my money was going! The AI suggestions saved me ₹8,000/month.' },
  { name: 'Arjun M.', role: 'Freelancer',         text: 'The goal planner is a game changer. I hit my travel fund target 2 months early!' },
  { name: 'Neha R.', role: 'Student',             text: 'As a beginner, the simple explanations are exactly what I needed. No confusing jargon.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-900 mesh-bg text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-surface-900/70 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-blue">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg">StockSense <span className="text-brand-400">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#stats" className="hover:text-white transition-colors">Stats</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center relative">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-brand-400/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="inline-flex items-center gap-2 badge-blue mb-6 px-4 py-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-sm">Powered by Google Gemini AI</span>
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
            Your Money,{' '}
            <span className="text-gradient">Simplified</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            StockSense AI helps you budget smarter, invest better, and hit financial goals faster —
            with personalised AI guidance designed for beginners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary text-base px-8 py-4 w-full sm:w-auto"
              >
                Start for Free <ArrowRight className="w-5 h-5 inline ml-1" />
              </motion.button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
                Sign in to your account
              </button>
            </Link>
          </div>
          <p className="mt-4 text-white/30 text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success-400" />
            No credit card required · Free forever for basics
          </p>
        </motion.div>

        {/* Hero dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="glass-card p-6 border border-white/12 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-danger-500" />
              <div className="w-3 h-3 rounded-full bg-warning-500" />
              <div className="w-3 h-3 rounded-full bg-success-500" />
              <span className="ml-2 text-white/30 text-sm font-mono">stocksense.ai/dashboard</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Net Worth', value: '₹4,82,500', color: 'text-brand-400' },
                { label: 'Monthly Savings', value: '₹12,000', color: 'text-success-400' },
                { label: 'Budget Health', value: '87/100', color: 'text-warning-400' },
                { label: 'Portfolio Return', value: '+18.4%', color: 'text-success-400' },
              ].map((s) => (
                <div key={s.label} className="bg-surface-700/60 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">{s.label}</p>
                  <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4 h-24 items-end">
              {[40, 65, 45, 80, 60, 90, 72, 85, 95, 70, 88, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                  className="flex-1 bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg opacity-70"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 border-y border-white/8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-display font-bold text-3xl text-gradient">{value}</p>
              <p className="text-white/50 text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4">
              Everything you need,{' '}
              <span className="text-gradient">nothing you don't</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Powerful tools made simple. No MBA required — just open the app and start.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-surface-700 flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-surface-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl mb-4">Get started in <span className="text-gradient">3 simple steps</span></h2>
          <p className="text-white/50 mb-16">Takes under 5 minutes. No documents required.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your profile', desc: 'Enter your income, expenses and financial goals.' },
              { step: '02', title: 'Get your financial plan', desc: 'AI builds your budget, savings plan and investment map.' },
              { step: '03', title: 'Track & achieve goals', desc: 'Watch your net worth grow and hit goals on schedule.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="font-display font-bold text-6xl text-brand-500/20 mb-4">{step}</div>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-4xl text-center mb-16">
            Loved by <span className="text-gradient">real users</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-warning-400 fill-warning-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="font-semibold text-white text-sm">{name}</p>
                  <p className="text-white/40 text-xs">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card p-12 border border-brand-500/20"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-6 shadow-glow-blue animate-float">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-white/50 mb-8">Join thousands of smart savers. Free to start, powerful to grow.</p>
          <Link to="/register">
            <button className="btn-primary text-base px-10 py-4">
              Create Free Account <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6 text-center text-white/30 text-sm">
        <p>© 2025 StockSense AI. Educational use only. Not SEBI registered.</p>
      </footer>
    </div>
  );
}
