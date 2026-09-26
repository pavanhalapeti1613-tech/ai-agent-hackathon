import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Activity,
  Bot,
  AlertTriangle,
  Bell,
  Ban,
  FileText,
  ScrollText,
  Settings,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeIncidentsCount: number;
  unreadNotificationsCount: number;
  onLogout: () => void;
  currentUser: { name: string; role: string; email: string };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeIncidentsCount,
  unreadNotificationsCount,
  onLogout,
  currentUser,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitor', label: 'Login Monitor', icon: Activity },
    { id: 'agent', label: 'AI Security Agent', icon: Bot, highlight: true },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'blocked-ips', label: 'Blocked IPs', icon: Ban },
    { id: 'reports', label: 'Incident Reports', icon: FileText },
    { id: 'logs', label: 'System Logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
          <ShieldAlert className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white tracking-tight">Digital Defenders</h1>
          <p className="text-[11px] text-slate-400 font-mono">SOC Portal</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={() => setCurrentTab('profile')}
          className={`w-full text-left p-2 rounded-lg transition-colors flex items-center space-x-3 mb-2 ${
            currentTab === 'profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 truncate">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div>
          </div>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
