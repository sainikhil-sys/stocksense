import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wallet, Target, PieChart, TrendingUp,
  Calculator, Bot, LogOut, ChevronLeft, ChevronRight,
  Sparkles, Bell, Settings
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';

const NAV_ITEMS = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/budget',           icon: Wallet,           label: 'Budget'        },
  { to: '/goals',            icon: Target,           label: 'Goals'         },
  { to: '/portfolio',        icon: PieChart,         label: 'Portfolio'     },
  { to: '/stocks',           icon: TrendingUp,       label: 'Stocks'        },
  { to: '/simulator',        icon: Calculator,       label: 'Simulator'     },
  { to: '/recommendations',  icon: Sparkles,         label: 'Recommendations'},
  { to: '/ai-chat',          icon: Bot,              label: 'AI Assistant'  },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen sticky top-0 flex flex-col bg-surface-800 border-r border-white/8 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-glow-blue">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-display font-bold text-white text-lg leading-none">StockSense</span>
              <span className="block text-xs text-brand-400 font-medium">AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? `nav-link-active ${!sidebarOpen ? 'justify-center px-0' : ''}`
                : `nav-link ${!sidebarOpen ? 'justify-center px-0' : ''}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + collapse */}
      <div className="border-t border-white/8 px-3 py-4 space-y-2">
        <NavLink
          to="/settings"
          className={`nav-link ${!sidebarOpen ? 'justify-center px-0' : ''}`}
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Settings</motion.span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`nav-link w-full text-danger-400 hover:bg-danger-500/10 ${!sidebarOpen ? 'justify-center px-0' : ''}`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Logout</motion.span>}
        </button>

        {/* User badge */}
        {sidebarOpen && user && (
          <div className="mt-3 p-3 rounded-xl bg-surface-700 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-white/40 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="btn-icon w-full flex items-center justify-center mt-1"
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
