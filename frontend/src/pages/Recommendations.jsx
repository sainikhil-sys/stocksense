import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, RefreshCw, Shield, TrendingUp, Flame, CheckCircle2, Bot } from 'lucide-react';
import { aiAPI } from '../api';
import { Card, Badge, Button, StatCard, EmptyState, Skeleton } from '../components/ui';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const RISK_CONFIG = {
  conservative: { icon: Shield, color: 'text-success-400', bg: 'bg-success-500/15 border-success-500/30', label: 'Conservative' },
  moderate:     { icon: TrendingUp, color: 'text-warning-400', bg: 'bg-warning-500/15 border-warning-500/30', label: 'Moderate' },
  aggressive:   { icon: Flame, color: 'text-danger-400', bg: 'bg-danger-500/15 border-danger-500/30', label: 'Aggressive' },
};

const ALLOCATION_COLORS = ['#22c55e', '#348dff', '#f97316', '#a855f7', '#14b8a6', '#ec4899'];

export default function Recommendations() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: recs, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => aiAPI.recommendations().then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const generate = useMutation({
    mutationFn: aiAPI.generateRecs,
    onSuccess: () => { qc.invalidateQueries(['recommendations']); toast.success('Recommendations refreshed! 🎯'); },
    onError: () => toast.error('Failed to generate recommendations'),
  });

  const risk = recs?.risk_level || 'moderate';
  const riskCfg = RISK_CONFIG[risk] || RISK_CONFIG.moderate;
  const RiskIcon = riskCfg.icon;
  const allocation = recs?.allocation || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-2xl">Investment Recommendations</h2>
          <p className="section-subtitle">Personalised for your risk profile</p>
        </div>
        <Button icon={RefreshCw} variant="secondary" loading={generate.isPending} onClick={() => generate.mutate()}>
          Refresh
        </Button>
      </div>

      {/* Risk Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 border ${riskCfg.bg} flex items-center gap-5`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 ${riskCfg.color}`}>
          <RiskIcon className="w-8 h-8" />
        </div>
        <div>
          <p className="text-white/50 text-sm font-medium">Your Risk Profile</p>
          <p className={`font-display font-bold text-3xl capitalize ${riskCfg.color}`}>{riskCfg.label}</p>
          <p className="text-white/50 text-sm mt-1 max-w-md">
            {risk === 'conservative' && 'Prioritise capital safety. Best for beginners or those with short investment horizon.'}
            {risk === 'moderate' && 'Balanced approach. Mix of stable and growth assets for steady wealth building.'}
            {risk === 'aggressive' && 'Maximum growth focus. High risk tolerance — best for long-term (7+ years) investment.'}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : !recs ? (
        <Card className="p-16">
          <EmptyState
            icon={Sparkles} title="No recommendations yet"
            message="Generate your personalised investment recommendations based on your financial profile"
            action={<Button icon={Sparkles} onClick={() => generate.mutate()} loading={generate.isPending}>Generate Recommendations</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Allocation Pie */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <p className="section-title">Recommended Allocation</p>
              </div>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={allocation} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="percentage">
                      {allocation.map((_, i) => <Cell key={i} fill={ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: '#151d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {allocation.map((item, i) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
                        <span className="text-white/60 text-sm">{item.category}</span>
                      </div>
                      <span className="text-white font-semibold text-sm">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Reasoning */}
            <Card className="p-6 border border-brand-500/15">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-brand-400" />
                <p className="section-title">AI Reasoning</p>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{recs.reasoning}</p>
              <div className="mt-4 p-3 rounded-xl bg-surface-700/50 border border-white/5">
                <p className="text-white/40 text-xs italic">
                  🛡️ This is educational guidance only. Please consult a SEBI-registered advisor before making investment decisions.
                </p>
              </div>
            </Card>
          </div>

          {/* Investment Category Cards */}
          {recs.categories?.length > 0 && (
            <div>
              <p className="section-title mb-4">Where to Invest</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recs.categories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card hover className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{cat.icon || '💰'}</span>
                        <Badge variant={cat.risk === 'Low' ? 'green' : cat.risk === 'High' ? 'red' : 'orange'}>
                          {cat.risk} Risk
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-white text-lg mb-1">{cat.name}</h3>
                      <p className="text-white/50 text-sm mb-3 leading-relaxed">{cat.description}</p>
                      <div className="space-y-1.5">
                        {cat.examples?.map((ex, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-white/50">
                            <CheckCircle2 className="w-3 h-3 text-success-400 flex-shrink-0" />
                            {ex}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/8 flex justify-between text-xs text-white/40">
                        <span>Allocation: <span className="text-brand-400 font-semibold">{cat.allocation_pct}%</span></span>
                        <span>Horizon: {cat.horizon}</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
