import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Search, Star, StarOff, TrendingUp, TrendingDown, AlertTriangle, Bot, RefreshCw } from 'lucide-react';
import { stocksAPI } from '../api';
import { Card, Badge, Button, EmptyState, Skeleton } from '../components/ui';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const PERIODS = ['1D','1W','1M','3M','1Y'];
const POPULAR = ['RELIANCE.NS','INFY.NS','TCS.NS','HDFCBANK.NS','WIPRO.NS','AAPL','TSLA','GOOGL'];

const RISK_COLORS = { Low: 'green', Medium: 'orange', High: 'red' };

export default function Stocks() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [period, setPeriod] = useState('1M');
  const qc = useQueryClient();

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['stock-search', query],
    queryFn: () => stocksAPI.search(query).then(r => r.data),
    enabled: query.length >= 1,
    staleTime: 30000,
  });

  const { data: stockDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['stock-detail', selected],
    queryFn: () => stocksAPI.detail(selected).then(r => r.data),
    enabled: !!selected,
    staleTime: 60000,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['stock-history', selected, period],
    queryFn: () => stocksAPI.history(selected, period).then(r => r.data),
    enabled: !!selected,
    staleTime: 60000,
  });

  const { data: analysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['stock-analysis', selected],
    queryFn: () => stocksAPI.analysis(selected).then(r => r.data),
    enabled: !!selected,
    staleTime: 300000,
  });

  const { data: watchlist = [] } = useQuery({ queryKey: ['watchlist'], queryFn: () => stocksAPI.watchlist().then(r => r.data) });

  const addWatch = useMutation({
    mutationFn: stocksAPI.addWatchlist,
    onSuccess: () => { qc.invalidateQueries(['watchlist']); toast.success('Added to watchlist ⭐'); },
  });
  const removeWatch = useMutation({
    mutationFn: stocksAPI.removeWatchlist,
    onSuccess: () => { qc.invalidateQueries(['watchlist']); toast.success('Removed from watchlist'); },
  });

  const isWatching = watchlist.some(w => w.symbol === selected);
  const change = stockDetail?.change || 0;
  const changePct = stockDetail?.change_pct || 0;
  const isUp = changePct >= 0;

  const historyData = history?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <Card className="p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-12 py-4 text-base"
            placeholder="Search stocks... (e.g. RELIANCE, AAPL, TCS)"
          />
        </div>

        {/* Search results dropdown */}
        {query && searchResults?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-xl border border-white/10 overflow-hidden bg-surface-700">
            {searchResults.slice(0, 5).map((s) => (
              <button key={s.symbol} onClick={() => { setSelected(s.symbol); setQuery(''); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-left transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{s.symbol}</p>
                  <p className="text-white/40 text-xs">{s.name}</p>
                </div>
                <p className="text-white/60 text-sm">{s.exchange}</p>
              </button>
            ))}
          </motion.div>
        )}

        {/* Popular */}
        {!query && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-white/30 text-xs my-auto">Popular:</span>
            {POPULAR.map((sym) => (
              <button key={sym} onClick={() => setSelected(sym)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected === sym ? 'badge-blue border-brand-500/40' : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white'}`}>
                {sym}
              </button>
            ))}
          </div>
        )}
      </Card>

      {selected ? (
        <>
          {/* Stock Header */}
          <Card className="p-6">
            {detailLoading ? (
              <Skeleton count={3} className="h-8 mb-3" />
            ) : (
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display font-bold text-3xl text-white">{stockDetail?.symbol}</h2>
                    <Badge variant={RISK_COLORS[stockDetail?.risk_level] || 'gray'}>
                      {stockDetail?.risk_level || 'Unknown'} Risk
                    </Badge>
                  </div>
                  <p className="text-white/50 text-sm mt-1">{stockDetail?.name} · {stockDetail?.exchange}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-display font-bold text-4xl text-white">{fmt(stockDetail?.price)}</span>
                    <div className={`flex items-center gap-1 ${isUp ? 'text-success-400' : 'text-danger-400'}`}>
                      {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span className="font-semibold">{isUp ? '+' : ''}{changePct?.toFixed(2)}%</span>
                      <span className="text-sm">({isUp ? '+' : ''}{fmt(change)} today)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => isWatching ? removeWatch.mutate(selected) : addWatch.mutate(selected)}
                    className={`btn-icon flex items-center gap-2 px-4 py-2 ${isWatching ? 'text-warning-400 border-warning-400/40' : ''}`}
                  >
                    {isWatching ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    <span className="text-sm">{isWatching ? 'Watching' : 'Watchlist'}</span>
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="section-title">Price History</p>
              <div className="flex gap-1">
                {PERIODS.map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-brand-600 text-white' : 'text-white/40 hover:text-white hover:bg-white/8'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} width={70} />
                <Tooltip contentStyle={{ background: '#151d36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  formatter={(v) => [fmt(v), 'Price']} />
                <Area type="monotone" dataKey="close" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth={2.5} fill="url(#priceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Metrics + AI Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card className="p-6">
              <p className="section-title mb-4">Key Metrics</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '52W High',    value: stockDetail?.week52_high ? fmt(stockDetail.week52_high) : '—' },
                  { label: '52W Low',     value: stockDetail?.week52_low  ? fmt(stockDetail.week52_low)  : '—' },
                  { label: 'P/E Ratio',   value: stockDetail?.pe_ratio?.toFixed(2) ?? '—' },
                  { label: 'Market Cap',  value: stockDetail?.market_cap ? `₹${(stockDetail.market_cap/1e7).toFixed(0)} Cr` : '—' },
                  { label: 'Volume',      value: stockDetail?.volume ? stockDetail.volume.toLocaleString('en-IN') : '—' },
                  { label: '1Y Return',   value: stockDetail?.return_1y ? `${stockDetail.return_1y > 0 ? '+' : ''}${stockDetail.return_1y.toFixed(1)}%` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-surface-700/50">
                    <p className="text-white/40 text-xs mb-1">{label}</p>
                    <p className="text-white font-semibold text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Analysis */}
            <Card className="p-6 border border-brand-500/15">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-brand-400" />
                  <p className="section-title">AI Analysis</p>
                </div>
                <button onClick={refetchAnalysis} className="btn-icon p-1.5" title="Refresh analysis">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {analysisLoading ? (
                <Skeleton count={5} className="h-4 mb-2" />
              ) : analysis ? (
                <div className="space-y-3">
                  <p className="text-white/70 text-sm leading-relaxed">{analysis.summary}</p>
                  {analysis.key_points?.length > 0 && (
                    <ul className="space-y-1.5">
                      {analysis.key_points.map((pt, i) => (
                        <li key={i} className="flex gap-2 text-sm text-white/60">
                          <span className="text-brand-400 flex-shrink-0">•</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 flex-wrap mt-2">
                    {analysis.risk_level && <Badge variant={RISK_COLORS[analysis.risk_level] || 'gray'}>Risk: {analysis.risk_level}</Badge>}
                    {analysis.suitable_for && <Badge variant="blue">For: {analysis.suitable_for}</Badge>}
                  </div>
                  <p className="text-white/20 text-xs italic">Educational only. Not SEBI-registered advice.</p>
                </div>
              ) : (
                <EmptyState icon={Bot} title="No analysis yet" message="Click refresh to generate AI analysis" />
              )}
            </Card>
          </div>
        </>
      ) : (
        /* Watchlist */
        <Card className="p-6">
          <p className="section-title mb-4">Your Watchlist</p>
          {watchlist.length === 0 ? (
            <EmptyState icon={Star} title="Watchlist empty" message="Search for a stock and add it to your watchlist" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {watchlist.map((w) => (
                <button key={w.symbol} onClick={() => setSelected(w.symbol)}
                  className="p-4 rounded-xl bg-surface-700/50 border border-white/8 hover:border-brand-500/30 text-left transition-all hover:bg-surface-700">
                  <p className="text-white font-semibold">{w.symbol}</p>
                  <p className="text-white/40 text-xs mt-0.5">{w.name}</p>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
