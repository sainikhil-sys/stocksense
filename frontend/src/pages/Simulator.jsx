import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Calculator, TrendingUp, IndianRupee } from 'lucide-react';
import { Card, StatCard } from '../components/ui';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtCr = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n/100000).toFixed(2)} L` : fmt(n);

const PRESETS = [
  { label: 'Conservative SIP',  monthly: 5000,  years: 15, rate: 10, desc: 'Aligned with large-cap MFs' },
  { label: 'Moderate Growth',   monthly: 10000, years: 10, rate: 12, desc: 'Balanced index fund strategy' },
  { label: 'Aggressive SIP',    monthly: 20000, years: 7,  rate: 15, desc: 'High-growth equity focused'  },
  { label: 'FD Comparison',     monthly: 10000, years: 5,  rate: 7,  desc: 'Bank fixed deposit rates'    },
];

export default function Simulator() {
  const [monthly, setMonthly] = useState(10000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  const chartData = useMemo(() => {
    const data = [];
    let invested = 0;
    let value = 0;
    const monthlyRate = rate / 100 / 12;

    for (let y = 0; y <= years; y++) {
      data.push({
        year: `Yr ${y}`,
        invested: Math.round(invested),
        value: Math.round(value),
        profit: Math.round(Math.max(value - invested, 0)),
      });
      for (let m = 0; m < 12; m++) {
        value = (value + monthly) * (1 + monthlyRate);
        invested += monthly;
      }
    }
    return data;
  }, [monthly, years, rate]);

  const final = chartData[chartData.length - 1] || {};
  const totalInvested = monthly * years * 12;
  const futureValue = final.value || 0;
  const profit = futureValue - totalInvested;
  const xirr = rate;

  const applyPreset = (p) => { setMonthly(p.monthly); setYears(p.years); setRate(p.rate); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title text-2xl">Scenario Simulator</h2>
        <p className="section-subtitle">Project your financial future with compound interest</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Invested" value={fmtCr(totalInvested)} icon={IndianRupee} color="blue" />
        <StatCard label="Future Value" value={fmtCr(futureValue)} icon={TrendingUp} color="green" change={`${xirr}% annual return`} changeType="up" />
        <StatCard label="Estimated Profit" value={fmtCr(profit)} icon={Calculator} color="orange"
          change={`${totalInvested > 0 ? ((profit/totalInvested)*100).toFixed(0) : 0}% wealth created`} changeType="up" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="p-6">
          <p className="section-title mb-5">Adjust Parameters</p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="input-label mb-0">Monthly Investment</label>
                <span className="text-brand-400 font-semibold text-sm">{fmt(monthly)}</span>
              </div>
              <input type="range" min="1000" max="200000" step="1000" value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="w-full h-2 bg-surface-600 rounded-full appearance-none cursor-pointer accent-brand-500" />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>₹1K</span><span>₹2L</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="input-label mb-0">Duration</label>
                <span className="text-brand-400 font-semibold text-sm">{years} years</span>
              </div>
              <input type="range" min="1" max="40" step="1" value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-surface-600 rounded-full appearance-none cursor-pointer accent-brand-500" />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>1 yr</span><span>40 yrs</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="input-label mb-0">Expected Annual Return</label>
                <span className="text-brand-400 font-semibold text-sm">{rate}%</span>
              </div>
              <input type="range" min="4" max="25" step="0.5" value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-surface-600 rounded-full appearance-none cursor-pointer accent-brand-500" />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>4% (FD)</span><span>25% (Growth)</span>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-6">
            <p className="section-subtitle mb-3">Quick Presets</p>
            <div className="space-y-2">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => applyPreset(p)}
                  className="w-full p-3 rounded-xl border border-white/10 hover:border-brand-500/40 bg-white/3 hover:bg-brand-500/10 text-left transition-all">
                  <p className="text-white text-sm font-medium">{p.label}</p>
                  <p className="text-white/40 text-xs">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card className="xl:col-span-2 p-6">
          <p className="section-title mb-6">Growth Projection</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#348dff" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#348dff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1e7 ? `${(v/1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v/1e5).toFixed(0)}L` : `${(v/1000).toFixed(0)}K`} width={60} />
              <Tooltip contentStyle={{ background: '#151d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                formatter={(v, n) => [fmtCr(v), n === 'value' ? 'Future Value' : n === 'invested' ? 'Total Invested' : 'Profit']} />
              <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} fill="url(#valueGrad)" name="value" />
              <Area type="monotone" dataKey="invested" stroke="#348dff" strokeWidth={2} fill="url(#investedGrad)" name="invested" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Summary table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/8">
            {[
              { label: 'Monthly SIP',      value: fmt(monthly)         },
              { label: 'Duration',          value: `${years} years`     },
              { label: 'Return Rate',       value: `${rate}% p.a.`      },
              { label: 'Wealth Multiplier', value: `${(futureValue / (totalInvested || 1)).toFixed(1)}x` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-surface-700/50">
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
