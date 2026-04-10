import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Trash2, PlusCircle, CheckCircle2, Clock, Bot, X } from 'lucide-react';
import { goalsAPI } from '../api';
import { Card, ProgressBar, Badge, Button, EmptyState, Skeleton } from '../components/ui';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const GOAL_ICONS = ['🎯','📱','✈️','🚗','🏠','📚','💪','🎮','💍','🌴','🏋️','👜'];
const PRIORITY_COLORS = { low: 'gray', medium: 'orange', high: 'red' };

const DEFAULT_FORM = { title: '', target_amount: '', monthly_contribution: '', deadline: '', icon: '🎯', priority: 'medium' };

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [contributeId, setContributeId] = useState(null);
  const [contributeAmt, setContributeAmt] = useState('');
  const qc = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({ queryKey: ['goals'], queryFn: () => goalsAPI.list().then(r => r.data) });

  const createGoal = useMutation({
    mutationFn: goalsAPI.create,
    onSuccess: () => { qc.invalidateQueries(['goals']); setShowForm(false); setForm(DEFAULT_FORM); toast.success('Goal created! 🎯'); },
    onError: () => toast.error('Failed to create goal'),
  });

  const deleteGoal = useMutation({
    mutationFn: goalsAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['goals']); toast.success('Goal removed'); },
  });

  const contribute = useMutation({
    mutationFn: ({ id, amount }) => goalsAPI.contribute(id, amount),
    onSuccess: () => { qc.invalidateQueries(['goals']); setContributeId(null); setContributeAmt(''); toast.success('Savings added! 💰'); },
    onError: () => toast.error('Failed to add savings'),
  });

  const monthsToGoal = (target, saved, monthly) => {
    const remaining = target - saved;
    if (remaining <= 0) return 0;
    if (!monthly || monthly <= 0) return null;
    return Math.ceil(remaining / monthly);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-2xl">Goals & Wishlist</h2>
          <p className="section-subtitle mt-0.5">Plan, save, achieve</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>Add Goal</Button>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-6 w-full max-w-md border border-white/15"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-white">New Goal</h3>
                <button onClick={() => setShowForm(false)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>

              {/* Icon picker */}
              <div className="mb-4">
                <label className="input-label">Pick an icon</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {GOAL_ICONS.map((ico) => (
                    <button key={ico} type="button" onClick={() => setForm({ ...form, icon: ico })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${form.icon === ico ? 'border-brand-500/60 bg-brand-500/20' : 'border-white/10 bg-surface-700 hover:border-white/30'}`}>
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="input-label">Goal title</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="e.g. iPhone 15, Goa Trip" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Target amount (₹)</label>
                    <input type="number" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} className="input-field" placeholder="80000" />
                  </div>
                  <div>
                    <label className="input-label">Monthly saving (₹)</label>
                    <input type="number" value={form.monthly_contribution} onChange={e => setForm({...form, monthly_contribution: e.target.value})} className="input-field" placeholder="5000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Deadline (optional)</label>
                    <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                      {['low','medium','high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Time estimate */}
                {form.target_amount && form.monthly_contribution && (
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                    <p className="text-brand-300 text-sm">
                      📅 At ₹{Number(form.monthly_contribution).toLocaleString('en-IN')}/month, you'll reach this goal in{' '}
                      <strong>{Math.ceil(form.target_amount / form.monthly_contribution)} months</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="primary" loading={createGoal.isPending} onClick={() => createGoal.mutate(form)} className="flex-1">Create Goal</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Skeleton count={6} className="h-48" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-16">
          <EmptyState icon={Target} title="No goals yet" message="Set your first financial goal and let AI build your savings plan"
            action={<Button icon={Plus} onClick={() => setShowForm(true)}>Add First Goal</Button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map((goal, i) => {
            const pct = Math.min(((goal.current_saved || 0) / goal.target_amount) * 100, 100);
            const months = monthsToGoal(goal.target_amount, goal.current_saved, goal.monthly_contribution);
            const isComplete = pct >= 100;

            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card hover className={`p-5 ${isComplete ? 'border border-success-500/30' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.icon || '🎯'}</span>
                      <div>
                        <p className="font-semibold text-white">{goal.title}</p>
                        <Badge variant={PRIORITY_COLORS[goal.priority] || 'gray'} className="mt-1">
                          {goal.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setContributeId(goal.id); }}
                        className="btn-icon p-1.5" title="Add savings">
                        <PlusCircle className="w-3.5 h-3.5 text-success-400" />
                      </button>
                      <button onClick={() => deleteGoal.mutate(goal.id)}
                        className="btn-icon p-1.5" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-danger-400" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-success-400 font-medium">{fmt(goal.current_saved)}</span>
                      <span className="text-white/40">{fmt(goal.target_amount)}</span>
                    </div>
                    <ProgressBar value={pct} max={100} color={isComplete ? 'green' : pct >= 60 ? 'gradient' : 'blue'} />
                    <p className="text-right text-xs text-white/40 mt-1">{Math.round(pct)}% complete</p>
                  </div>

                  {isComplete ? (
                    <div className="flex items-center gap-2 text-success-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Goal reached! 🎉
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {months !== null ? `~${months} months to go` : 'Set monthly saving'}
                      </div>
                      {goal.monthly_contribution && (
                        <span>{fmt(goal.monthly_contribution)}/mo</span>
                      )}
                    </div>
                  )}

                  {/* Contribute inline form */}
                  {contributeId === goal.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/8 flex gap-2">
                      <input type="number" value={contributeAmt} onChange={e => setContributeAmt(e.target.value)}
                        className="input-field flex-1 py-2 text-sm" placeholder="Amount (₹)" />
                      <Button size="sm" variant="success" loading={contribute.isPending}
                        onClick={() => contribute.mutate({ id: goal.id, amount: contributeAmt })}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setContributeId(null)}>✕</Button>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
