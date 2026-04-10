import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../../store';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':       { title: 'Dashboard',       subtitle: 'Your financial overview' },
  '/budget':          { title: 'Budget Planner',   subtitle: 'Track income vs expenses' },
  '/goals':           { title: 'Goals & Wishlist', subtitle: 'Plan for what matters' },
  '/portfolio':       { title: 'Portfolio',        subtitle: 'Your investments at a glance' },
  '/stocks':          { title: 'Stock Analysis',   subtitle: 'Research and monitor stocks' },
  '/simulator':       { title: 'Simulator',        subtitle: 'Project your financial future' },
  '/recommendations': { title: 'Recommendations',  subtitle: 'Personalised for your profile' },
  '/ai-chat':         { title: 'AI Assistant',     subtitle: 'Ask anything financial' },
  '/settings':        { title: 'Settings',         subtitle: 'Manage your account' },
};

export default function Topbar() {
  const { user } = useAuthStore();
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] || { title: 'StockSense AI', subtitle: '' };

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' :
    now.getHours() < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/8 bg-surface-800/60 backdrop-blur-lg flex-shrink-0">
      <div>
        <h1 className="font-display font-bold text-white text-xl leading-tight">{page.title}</h1>
        <p className="text-white/40 text-xs">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-white/50 text-sm hidden md:block">
          {greeting}, <span className="text-white font-medium">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </p>
        <button className="btn-icon" aria-label="Search">
          <Search className="w-4 h-4" />
        </button>
        <button className="btn-icon relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
