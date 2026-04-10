import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Wallet, Target, ChevronRight, ChevronLeft,
  TrendingUp, CheckCircle2, Flame, Shield, Zap
} from 'lucide-react';
import { profileAPI } from '@/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative',  desc: 'I prefer safety over high returns',    icon: Shield, color: 'text-success-400',  bg: 'bg-success-500/10 border-success-500/30' },
  { value: 'moderate',     label: 'Moderate',       desc: 'Balanced mix of risk and stability',   icon: TrendingUp, color: 'text-warning-400', bg: 'bg-warning-500/10 border-warning-500/30' },
  { value: 'aggressive',   label: 'Aggressive',     desc: 'I can handle high risk for big gains', icon: Flame, color: 'text-danger-400', bg: 'bg-danger-500/10 border-danger-500/30' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'none',         label: 'No experience',   desc: 'I\'ve never invested before' },
  { value: 'beginner',     label: 'Beginner',        desc: 'I know the basics' },
  { value: 'intermediate', label: 'Intermediate',    desc: 'I\'ve invested in stocks/MFs' },
];

const STEPS = [
  { id: 1, title: 'Personal Info',        icon: User,      desc: 'Tell us about yourself' },
  { id: 2, title: 'Financial Snapshot',   icon: Wallet,    desc: 'Your income & expenses' },
  { id: 3, title: 'Goals & Risk',         icon: Target,    desc: 'What matters to you?' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    age: '', name: '',
    monthly_income: '', monthly_expenses: '', current_savings: '',
    risk_level: 'moderate', investment_experience: 'beginner',
    primary_goal: '',
  });
  const [loading, setLoading] = useState(false);
  const { setProfileCompleted, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const update = (field, value) => setData((d) => ({ ...d, [field]: value }));

  const canProgress = () => {
    if (step === 1) return data.age && Number(data.age) >= 18;
    if (step === 2) return data.monthly_income && data.monthly_expenses && data.current_savings;
    if (step === 3) return data.risk_level;
    return false;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await profileAPI.setup(data);
      setProfileCompleted();
      updateUser({ profile_completed: true });
      toast.success('Profile set up! Welcome to StockSense AI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savings = Number(data.monthly_income) - Number(data.monthly_expenses);
  const savingsRate = data.monthly_income > 0 ? ((savings / Number(data.monthly_income)) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl">
        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                s.id === step ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40' :
                s.id < step  ? 'text-success-400' : 'text-white/30'
              }`}>
                {s.id < step ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${step > s.id ? 'bg-success-500/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8"
          >
            {/* Step 1: Personal */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
                    <User className="w-7 h-7 text-brand-400" />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white">Tell us about yourself</h2>
                  <p className="text-white/50 text-sm mt-1">This helps us personalise your experience</p>
                </div>
                <div>
                  <label className="input-label">Your age</label>
                  <input
                    type="number" min="18" max="80"
                    value={data.age} onChange={(e) => update('age', e.target.value)}
                    className="input-field" placeholder="e.g. 24"
                  />
                  {data.age && Number(data.age) < 18 && (
                    <p className="text-danger-400 text-xs mt-1">You must be 18+ to use StockSense AI</p>
                  )}
                </div>
                <div>
                  <label className="input-label">Investment experience</label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update('investment_experience', opt.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          data.investment_experience === opt.value
                            ? 'border-brand-500/50 bg-brand-500/10 text-white'
                            : 'border-white/10 bg-white/3 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Financial Snapshot */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-success-500/20 border border-success-500/30 flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-7 h-7 text-success-400" />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white">Your financial snapshot</h2>
                  <p className="text-white/50 text-sm mt-1">Approximate figures are fine — you can update anytime</p>
                </div>
                {[
                  { field: 'monthly_income',   label: 'Monthly Income (₹)',   placeholder: 'e.g. 50000' },
                  { field: 'monthly_expenses',  label: 'Monthly Expenses (₹)', placeholder: 'e.g. 30000' },
                  { field: 'current_savings',   label: 'Current Savings (₹)',  placeholder: 'e.g. 75000' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="input-label">{label}</label>
                    <input
                      type="number" min="0"
                      value={data[field]} onChange={(e) => update(field, e.target.value)}
                      className="input-field" placeholder={placeholder}
                    />
                  </div>
                ))}
                {/* Live savings estimate */}
                {data.monthly_income && data.monthly_expenses && (
                  <div className={`p-4 rounded-xl border ${savings >= 0 ? 'bg-success-500/10 border-success-500/30' : 'bg-danger-500/10 border-danger-500/30'}`}>
                    <p className="text-sm font-medium text-white">
                      Monthly surplus: {' '}
                      <span className={savings >= 0 ? 'text-success-400' : 'text-danger-400'}>
                        ₹{savings.toLocaleString('en-IN')} ({savingsRate}% savings rate)
                      </span>
                    </p>
                    {savings < 0 && <p className="text-danger-400 text-xs mt-1">⚠️ You're spending more than you earn. We'll help fix this!</p>}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Risk & Goals */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-warning-500/20 border border-warning-500/30 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-7 h-7 text-warning-400" />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white">Your risk & goals</h2>
                  <p className="text-white/50 text-sm mt-1">This shapes your personalised investment plan</p>
                </div>

                <div>
                  <label className="input-label">Risk appetite</label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {RISK_OPTIONS.map((opt) => (
                      <button
                        key={opt.value} type="button"
                        onClick={() => update('risk_level', opt.value)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                          data.risk_level === opt.value ? `${opt.bg} border-opacity-60` : 'border-white/10 bg-white/3 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${opt.color}`}>
                          <opt.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${data.risk_level === opt.value ? 'text-white' : 'text-white/60'}`}>{opt.label}</p>
                          <p className="text-xs text-white/40">{opt.desc}</p>
                        </div>
                        {data.risk_level === opt.value && (
                          <CheckCircle2 className={`w-5 h-5 ml-auto ${opt.color}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Primary financial goal (optional)</label>
                  <input
                    type="text"
                    value={data.primary_goal} onChange={(e) => update('primary_goal', e.target.value)}
                    className="input-field" placeholder="e.g. Buy a car, Travel to Europe, Emergency fund"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="btn-secondary py-2.5 px-5 flex items-center gap-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <span className="text-white/30 text-sm">{step} / {STEPS.length}</span>
              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProgress()}
                  className="btn-primary py-2.5 px-5 flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={loading || !canProgress()}
                  className="btn-primary py-2.5 px-5 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Finish Setup 🚀'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
