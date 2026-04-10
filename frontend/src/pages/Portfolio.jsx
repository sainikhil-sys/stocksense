import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, PieChartIcon, X } from 'lucide-react';
import { portfolioAPI } from '../api';
import { Card, StatCard, Badge, Button, EmptyState, Skeleton } from '../components/ui';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const pct = (a, b) => (b > 0 ? ((a - b) / b) * 100 : 0);
const COLORS = ['#348dff','#22c55e','#f97316','#a855f7','#ec4899','#14b8a6'];
const ASSET_TYPES = ['stock','mutual_fund','fixed_deposit','gold','crypto','other'];

const DEFAULT_FORM = { symbol: '', name: '', quantity: '', avg_buy_price: '', asset_type: 'stock', purchase_date: '' };

export default function Portfolio() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const qc = useQueryClient();

  const { data: overview, isLoading } = useQuery({ queryKey: ['portfolio'], queryFn: () => portfolioAPI.overview().then(r => r.data) });
  const { data: netWorth, isLoading: nwLoading } = useQuery({ queryKey: ['net-worth'], queryFn: () => portfolioAPI.netWorth().then(r => r.data) });
  const { data: allocation } = useQuery({ queryKey: ['allocation'], queryFn: () => portfolioAPI.allocation().then(r => r.data) });

  const addHolding = useMutation({
    mutationFn: portfolioAPI.addHolding,
    onSuccess: () => { qc.invalidateQueries(['portfolio']); qc.invalidateQueries(['net-worth']); qc.invalidateQueries(['allocation']); setShowForm(false); setForm(DEFAULT_FORM); toast.success('Holding added!'); },
    onError: () => toast.error('Failed to add holding'),
  });

  const deleteHolding = useMutation({
    mutationFn: portfolioAPI.deleteHolding,
    onSuccess: () => { qc.invalidateQueries(['portfolio']); qc.invalidateQueries(['net-worth']); toast.success('Holding removed'); },
  });

  const holdings = overview?.holdings || [];
  const pieData = allocation?.allocation || [];

  const totalInvested = holdings.reduce((s, h) => s + h.avg_buy_price * h.quantity, 0);
  const currentValue = holdings.reduce((s, h) => s + (h.current_price || h.avg_buy_price) * h.quantity, 0);
  const totalGain = currentValue - totalInvested;
  const gainPct = pct(currentValue, totalInvested);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-2xl">Portfolio Manager</h2>
          <p className="section-subtitle">Your investments at a glance</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>Add Holding</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Net Worth" value={nwLoading ? '...' : fmt(netWorth?.total_net_worth)} icon={TrendingUp} color="blue" />
        <StatCard label="Total Invested" value={fmt(totalInvested)} icon={PieChartIcon} color="orange" />
        <StatCard label="Current Value" value={fmt(currentValue)} icon={TrendingUp} color="green" />
        <StatCard label="Total Gain/Loss" value={fmt(totalGain)} icon={gainPct >= 0 ? TrendingUp : TrendingDown}
          color={gainPct >= 0 ? 'green' : 'red'} change={`${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(2)}%`}
          changeType={gainPct >= 0 ? 'up' : 'down'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Allocation Pie */}
        <Card className="p-6">
          <p className="section-title mb-4">Asset Allocation</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v.toFixed(1)}%`]} contentStyle={{ background: '#151d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/60 text-sm capitalize">{item.name.replace('_', ' ')}</span>
                    </div>
                    <span className="text-white text-sm font-medium">{item.value?.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={PieChartIcon} title="No holdings yet" message="Add investments to see allocation" />
          )}
        </Card>

        {/* Holdings Table */}
        <div className="xl:col-span-2">
          <Card className="p-6">
            <p className="section-title mb-4">Holdings</p>
            {isLoading ? (
              <Skeleton count={5} className="h-14 mb-3" />
            ) : holdings.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No holdings" message="Add stocks, mutual funds, FDs or gold to track your portfolio"
                action={<Button icon={Plus} onClick={() => setShowForm(true)}>Add Holding</Button>} />
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-3 pb-2 border-b border-white/8 text-xs text-white/40 uppercase tracking-wide">
                  <span className="col-span-2">Asset</span>
                  <span className="text-right">Invested</span>
                  <span className="text-right">Value</span>
                  <span className="text-right">P&L</span>
                </div>
                {holdings.map((h, i) => {
                  const invested = h.avg_buy_price * h.quantity;
                  const current = (h.current_price || h.avg_buy_price) * h.quantity;
                  const pl = current - invested;
                  const plPct = pct(current, invested);
                  return (
                    <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-5 gap-3 items-center py-3 border-b border-white/5 hover:bg-surface-700/30 rounded-lg px-1 transition-colors">
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center text-xs font-bold text-brand-400">
                          {(h.symbol || h.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{h.symbol || h.name}</p>
                          <p className="text-white/40 text-xs capitalize">{h.asset_type.replace('_', ' ')} · {h.quantity} units</p>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm text-right">{fmt(invested)}</p>
                      <p className="text-white text-sm font-medium text-right">{fmt(current)}</p>
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-sm font-medium ${pl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                          {pl >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                        </span>
                        <button onClick={() => deleteHolding.mutate(h.id)} className="p-1 hover:text-danger-400 text-white/20 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="glass-card p-6 w-full max-w-md border border-white/15">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-white">Add Holding</h3>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Symbol / Ticker</label>
                  <input value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} className="input-field" placeholder="RELIANCE.NS" />
                </div>
                <div>
                  <label className="input-label">Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Reliance Industries" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Quantity</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input-field" placeholder="10" />
                </div>
                <div>
                  <label className="input-label">Avg. Buy Price (₹)</label>
                  <input type="number" value={form.avg_buy_price} onChange={e => setForm({...form, avg_buy_price: e.target.value})} className="input-field" placeholder="2400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Asset Type</label>
                  <select value={form.asset_type} onChange={e => setForm({...form, asset_type: e.target.value})} className="input-field">
                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Purchase Date</label>
                  <input type="date" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} className="input-field" />
                </div>
              </div>
              {form.quantity && form.avg_buy_price && (
                <div className="p-3 rounded-xl bg-surface-700 text-sm text-white/60">
                  Total invested: <span className="text-white font-semibold">{fmt(form.quantity * form.avg_buy_price)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="primary" loading={addHolding.isPending} onClick={() => addHolding.mutate(form)} className="flex-1">Add Holding</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
