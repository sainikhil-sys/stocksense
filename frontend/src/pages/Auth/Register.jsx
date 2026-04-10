import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,    label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),  label: 'One uppercase letter'  },
  { test: (p) => /[0-9]/.test(p),  label: 'One number'            },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordStrength < 3) {
      toast.error('Password is too weak');
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Account created! Let\'s set up your profile 🚀');
      navigate('/onboarding');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const strengthColors = ['bg-danger-500', 'bg-warning-500', 'bg-warning-400', 'bg-success-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-10">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-blue">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <p className="font-display font-bold text-2xl text-white">Join StockSense <span className="text-brand-400">AI</span></p>
          </Link>
        </div>

        <div className="glass-card p-8">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-1">Create your account</h2>
          <p className="text-white/50 text-sm text-center mb-8">Free forever · No credit card needed</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="input-label">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="name" type="text" required autoComplete="name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-10" placeholder="Arjun Mehta"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="input-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-email" type="email" required autoComplete="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10" placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-password" type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" tabIndex={-1}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-surface-600'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength >= 3 ? 'text-success-400' : 'text-white/40'}`}>
                    {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="confirm" className="input-label">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="confirm" type="password" required
                  value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className={`input-field pl-10 ${form.confirm && form.confirm !== form.password ? 'border-danger-500/50' : ''}`}
                  placeholder="••••••••"
                />
                {form.confirm && form.confirm === form.password && form.password.length > 0 && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-success-400" />
                )}
              </div>
            </div>

            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={isLoading}
              className="btn-primary w-full py-3.5 mt-2">
              {isLoading ? 'Creating account...' : 'Create Account 🚀'}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-xs text-white/30">
            By registering, you agree to our Terms & Privacy Policy.
          </p>

          <div className="mt-4 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
