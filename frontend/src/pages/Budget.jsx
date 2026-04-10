import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Plus, AlertTriangle, CheckCircle2, TrendingDown, Wallet, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { budgetAPI } from '../api';
import { Card, StatCard, Badge, Button, EmptyState, Skeleton } from '../components/ui';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const COLORS = { needs: '#348dff', wants: '#f97316', savings: '#22c55e' };
const PIE_COLORS = ['#348dff', '#f97316', '#22c55e'];

export default function Budget() {
  const [showAddTx, setShowAddTx] = useState(false);
  const [tx, setTx] = useState({ description: '', amount: '', type: 'expense', category_type: 'want', date: new Date().toISOString().split('T')[0] });
  const qc = useQueryClient();

  const { data: budget, isLoading } = useQuery({ queryKey: ['budget-current'], queryFn: () => budgetAPI.current().then(r => r.data) });
  const { data: transactions, isLoading: txLoading } = useQuery({ queryKey: ['transactions'], queryFn: () => budgetAPI.getTransactions().then(r => r.data) });
  const { data: suggestions } = useQuery({ queryKey: ['budget-suggestions'], queryFn: () => budgetAPI.suggestions().then(r => r.data) });

  const addTxMutation = useMutation({
    mutationFn: (data) => budgetAPI.addTransaction(data),
    onSuccess: () => { qc.invalidateQueries(['transactions']); qc.invalidateQueries(['budget-current']); setShowAddTx(false); toast.success('Transaction added!'); },
    onError: () => toast.error('Failed to add transaction'),
  });

  const income = budget?.actual_income || 0;
  const expenses = budget?.actual_expenses || 0;
  const savings = income - expenses;

  const budgetRuleData = [
    { name: 'Needs (50%)',   target: income * 0.5, actual: budget?.actual_needs  || 0, key: 'needs'   },
    { name: 'Wants (30%)',   target: income * 0.3, actual: budget?.actual_wants  || 0, key: 'wants'   },
    { name: 'Savings (20%)', target: income * 0.2, actual: savings,                    key: 'savings' },
  ];

  const pieData = [
    { name: 'Needs',   value: budget?.actual_needs  || 0 },
    { name: 'Wants',   value: budget?.actual_wants  || 0 },
    { name: 'Savings', value: Math.max(savings, 0)       },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Monthly Income" value={isLoading ? '...' : fmt(income)} icon={Wallet} color="green" />
        <StatCard label="Total Expenses" value={isLoading ? '...' : fmt(expenses)} icon={TrendingDown} color="orange" change={`${((expenses/income)*100||0).toFixed(0)}% of income`} changeType={expenses > income * 0.8 ? 'down' : 'up'} />
        <StatCard label="Net Savings" value={isLoading ? '...' : fmt(savings)} icon={CheckCircle2} color={savings >= 0 ? 'green' : 'red'} change={`${((savings/income)*100||0).toFixed(0)}% savings rate`} changeType={savings >= 0 ? 'up' : 'down'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Budget Breakdown</p>
            <Badge variant="blue">50/30/20 Rule</Badge>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [fmt(v)]} contentStyle={{ background: '#151d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {['Needs', 'Wants', 'Savings'].map((label, i) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-white/60">{label}</span>
                    </div>
                    <span className="text-white font-medium">{fmt(pieData[i].value)}</span>
                  </div>
                  <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${income > 0 ? (pieData[i].value / income) * 100 : 0}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ background: PIE_COLORS[i] }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 50/30/20 Analysis */}
        <Card className="p-6">
          <p className="section-title mb-4">50/30/20 Rule Analysis</p>
          <div className="space-y-4">
            {budgetRuleData.map(({ name, target, actual, key }) => {
              const over = actual > target;
              const pct = target > 0 ? Math.min((actual / target) * 100, 130) : 0;
              return (
                <div key={key} className={`p-4 rounded-xl border ${over ? 'bg-danger-500/5 border-danger-500/20' : 'bg-success-500/5 border-success-500/20'}`}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">{name}</span>
                    <div className="flex items-center gap-2">
                      {over ? <AlertTriangle className="w-3.5 h-3.5 text-warning-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-success-400" />}
                      <span className={over ? 'text-warning-400' : 'text-success-400'}>{fmt(actual)} / {fmt(target)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${over ? 'bg-warning-500' : COLORS[key] ? `bg-[${COLORS[key]}]` : 'bg-brand-500'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* AI Suggestions */}
      {suggestions?.suggestions?.length > 0 && (
        <Card className="p-6 border border-brand-500/15">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-brand-400" />
            <p className="section-title">AI Budget Suggestions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.suggestions.map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-700/50 border border-white/5 flex gap-3">
                <span className="text-base">💡</span>
                <p className="text-white/70 text-sm">{s}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="section-title">Recent Transactions</p>
            <p className="section-subtitle">This month</p>
          </div>
          <Button icon={Plus} variant="primary" size="sm" onClick={() => setShowAddTx(true)}>Add</Button>
        </div>

        {/* Add Transaction Form */}
        {showAddTx && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-xl bg-surface-700 border border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Description</label>
                <input value={tx.description} onChange={e => setTx({...tx, description: e.target.value})} className="input-field" placeholder="e.g. Groceries" />
              </div>
              <div>
                <label className="input-label">Amount (₹)</label>
                <input type="number" value={tx.amount} onChange={e => setTx({...tx, amount: e.target.value})} className="input-field" placeholder="500" />
              </div>
              <div>
                <label className="input-label">Category</label>
                <select value={tx.category_type} onChange={e => setTx({...tx, category_type: e.target.value})} className="input-field">
                  <option value="need">Need</option>
                  <option value="want">Want</option>
                </select>
              </div>
              <div>
                <label className="input-label">Date</label>
                <input type="date" value={tx.date} onChange={e => setTx({...tx, date: e.target.value})} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" size="sm" loading={addTxMutation.isPending} onClick={() => addTxMutation.mutate(tx)}>Save</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowAddTx(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        {txLoading ? (
          <Skeleton count={5} className="h-12 mb-3" />
        ) : !transactions?.length ? (
          <EmptyState icon={Wallet} title="No transactions yet" message="Add your first expense to start tracking" action={<Button icon={Plus} onClick={() => setShowAddTx(true)}>Add Transaction</Button>} />
        ) : (
          <div className="space-y-2">
            {(transactions || []).slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${t.category_type === 'need' ? 'bg-brand-500/20' : 'bg-warning-500/20'}`}>
                    {t.category_type === 'need' ? '🏠' : '🎯'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.description}</p>
                    <p className="text-white/40 text-xs">{new Date(t.date).toLocaleDateString('en-IN')} · {t.category_type}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-success-400' : 'text-danger-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
