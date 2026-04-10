import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Wallet, Target, TrendingUp, PieChart, ArrowUpRight,
  ArrowDownRight, Bot, Plus, Sparkles, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { portfolioAPI, goalsAPI, budgetAPI } from '../api';
import { Card, StatCard, ProgressBar, Badge, EmptyState, Skeleton } from '../components/ui';
import { useAuthStore } from '../store';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const MOCK_CHART = [
  { m: 'Oct', v: 380000 }, { m: 'Nov', v: 395000 }, { m: 'Dec', v: 410000 },
  { m: 'Jan', v: 405000 }, { m: 'Feb', v: 430000 }, { m: 'Mar', v: 450000 },
  { m: 'Apr', v: 482500 },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: netWorth, isLoading: nwLoading } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => portfolioAPI.netWorth().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsAPI.list().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-current'],
    queryFn: () => budgetAPI.current().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    {
      label: 'Net Worth',
      value: nwLoading ? '—' : fmt(netWorth?.total_net_worth),
      icon: TrendingUp,
      change: '+8.4% this month',
      changeType: 'up',
      color: 'blue',
    },
    {
      label: 'Monthly Savings',
      value: budget ? fmt((budget.actual_income || 0) - (budget.actual_expenses || 0)) : '—',
      icon: Wallet,
      change: budgetLoading ? '' : 'vs ₹12,000 target',
      changeType: 'up',
      color: 'green',
    },
    {
      label: 'Active Goals',
      value: goals ? `${goals.filter((g) => g.status === 'active').length} / ${goals.length}` : '—',
      icon: Target,
      change: 'On track',
      changeType: 'up',
      color: 'orange',
    },
    {
      label: 'Budget Health',
      value: budget?.health_score ? `${budget.health_score}/100` : '—',
      icon: PieChart,
      change: budget?.health_score >= 70 ? 'Healthy' : 'Needs attention',
      changeType: budget?.health_score >= 70 ? 'up' : 'down',
      color: 'blue',
    },
  ];

  const activeGoals = goals?.filter((g) => g.status === 'active')?.slice(0, 3) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 flex items-center justify-between border border-brand-500/20"
      >
        <div>
          <h2 className="font-display font-bold text-xl text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Here's your financial overview for today.
          </p>
        </div>
        <Link to="/ai-chat">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center gap-2"
          >
            <Bot className="w-4 h-4" /> Ask AI
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Net Worth Chart + Goals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="section-title">Net Worth Growth</p>
              <p className="section-subtitle">Last 7 months</p>
            </div>
            <Badge variant="green" className="text-xs">
              <ArrowUpRight className="w-3 h-3" /> +8.4%
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_CHART}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#348dff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#348dff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#151d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Net Worth']}
              />
              <Area type="monotone" dataKey="v" stroke="#348dff" strokeWidth={2.5} fill="url(#netWorthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <p className="section-title mb-4">Quick Actions</p>
          <div className="space-y-3">
            {[
              { to: '/goals',     icon: Plus,      label: 'Add New Goal',         color: 'text-brand-400'   },
              { to: '/budget',    icon: Wallet,     label: 'Log an Expense',       color: 'text-success-400' },
              { to: '/stocks',    icon: TrendingUp, label: 'Analyse a Stock',      color: 'text-warning-400' },
              { to: '/simulator', icon: Sparkles,   label: 'Run a Simulation',     color: 'text-brand-400'   },
              { to: '/ai-chat',   icon: Bot,        label: 'Chat with AI Advisor', color: 'text-success-400' },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className={`w-9 h-9 rounded-xl bg-surface-700 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-white/70 group-hover:text-white text-sm font-medium transition-colors">{label}</span>
                  <ArrowUpRight className="w-4 h-4 ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
                </motion.div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-title">Active Goals</p>
              <p className="section-subtitle">Progress towards your targets</p>
            </div>
            <Link to="/goals" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
          </div>
          {goalsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" count={3} />
            </div>
          ) : activeGoals.length === 0 ? (
            <EmptyState icon={Target} title="No active goals" message="Start planning your first financial goal" action={
              <Link to="/goals"><button className="btn-primary text-sm py-2 px-4">Add Goal</button></Link>
            } />
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const pct = Math.min((goal.current_saved / goal.target_amount) * 100, 100);
                return (
                  <div key={goal.id} className="p-4 rounded-xl bg-surface-700/50 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{goal.icon || '🎯'}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{goal.title}</p>
                          <p className="text-white/40 text-xs">{fmt(goal.target_amount)} target</p>
                        </div>
                      </div>
                      <Badge variant={pct >= 100 ? 'green' : pct >= 50 ? 'orange' : 'blue'}>
                        {Math.round(pct)}%
                      </Badge>
                    </div>
                    <ProgressBar value={pct} max={100} color={pct >= 75 ? 'green' : 'gradient'} />
                    <div className="flex justify-between mt-1.5">
                      <span className="text-success-400 text-xs">{fmt(goal.current_saved)} saved</span>
                      <span className="text-white/30 text-xs">{fmt(goal.target_amount - goal.current_saved)} to go</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* AI Suggestions */}
        <Card className="p-6 border border-brand-500/15">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <p className="section-title">AI Suggestions</p>
              <p className="section-subtitle">Personalised for you</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: '💡', text: 'You\'re spending 38% on wants. Trim by ₹2,000 to hit your savings goal faster.', priority: 'high' },
              { icon: '📈', text: 'Your savings rate is 24% — above average! Consider starting an index fund SIP.', priority: 'medium' },
              { icon: '🎯', text: 'iPhone 15 goal is 68% complete. ₹3,500/month more gets you there in 2 months.', priority: 'low' },
            ].map(({ icon, text, priority }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex gap-3 p-3.5 rounded-xl bg-surface-700/40 border border-white/5 hover:border-brand-500/20 transition-colors"
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                <p className="text-white/70 text-sm leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
          <Link to="/ai-chat">
            <button className="btn-secondary w-full mt-4 text-sm py-2.5">
              <Bot className="w-4 h-4 inline mr-2" /> Ask AI anything
            </button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
