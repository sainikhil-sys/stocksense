import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    ghost: 'text-white/60 hover:text-white hover:bg-white/8 px-4 py-2 rounded-xl transition-all',
  };

  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: '',
    lg: 'text-base px-8 py-4',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {iconRight && !loading && <iconRight className="w-4 h-4" />}
    </motion.button>
  );
}

export function Card({ children, className = '', hover = false, glow = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${hover ? 'glass-card-hover' : 'glass-card'} ${glow ? 'glow-border' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, variant = 'blue', className = '' }) {
  const variants = {
    blue: 'badge-blue',
    green: 'badge-green',
    orange: 'badge-orange',
    red: 'badge-red',
    gray: 'badge bg-white/10 text-white/50 border border-white/10',
  };
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, change, changeType = 'up', color = 'blue', className = '' }) {
  const colors = {
    blue: 'text-brand-400',
    green: 'text-success-400',
    orange: 'text-warning-400',
    red: 'text-danger-400',
  };
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{label}</p>
          <p className={`stat-value mt-1 ${colors[color]}`}>{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeType === 'up' ? 'text-success-400' : 'text-danger-400'}`}>
              {changeType === 'up' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-surface-700 ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function ProgressBar({ value, max = 100, color = 'blue', showLabel = false, label = '', className = '' }) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = {
    blue: 'bg-brand-500',
    green: 'bg-success-500',
    orange: 'bg-warning-500',
    red: 'bg-danger-500',
    gradient: 'bg-gradient-to-r from-brand-600 to-brand-400',
  };
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-white/50 mb-1.5">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`progress-fill ${colors[color]}`}
        />
      </div>
    </div>
  );
}

export function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton h-4 ${className}`} />
      ))}
    </>
  );
}

export function Divider({ className = '' }) {
  return <div className={`h-px bg-white/8 ${className}`} />;
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="p-5 rounded-2xl bg-surface-700 mb-4">
          <Icon className="w-8 h-8 text-white/30" />
        </div>
      )}
      <h3 className="font-semibold text-white/70 text-lg mb-1">{title}</h3>
      <p className="text-white/40 text-sm max-w-xs">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
