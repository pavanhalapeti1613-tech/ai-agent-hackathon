import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Ban,
  TrendingUp,
  Cpu,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DashboardStats } from '../types/security';

interface DashboardPageProps {
  stats: DashboardStats;
  activityData: {
    timeSeries: Array<{ time: string; failed: number; success: number }>;
    ipDistribution: Array<{ ip: string; count: number }>;
    riskDistribution: Array<{ name: string; value: number }>;
  };
  onNavigateTab: (tab: string) => void;
  onRunCompleteAttack: () => void;
  isSimulating: boolean;
}

const RISK_COLORS: { [key: string]: string } = {
  NORMAL: '#10b981',
  WARNING: '#f59e0b',
  SUSPICIOUS: '#f97316',
  HIGH: '#ef4444',
  CRITICAL: '#b91c1c',
};

const PIE_COLORS = ['#3b82f6', '#ef4444'];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  activityData,
  onNavigateTab,
  onRunCompleteAttack,
  isSimulating,
}) => {
  const cards = [
    {
      title: 'Total Login Attempts',
      value: stats.totalAttempts,
      change: 'Real-time ingress',
      icon: Activity,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      title: 'Successful Logins',
      value: stats.successfulLogins,
      change: 'Authorized sessions',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Failed Logins',
      value: stats.failedLogins,
      change: 'Authentication rejections',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      title: 'Suspicious Attempts',
      value: stats.suspiciousAttempts,
      change: 'Threshold flagged',
      icon: ShieldAlert,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Active Incidents',
      value: stats.activeIncidents,
      change: 'Requires investigation',
      icon: AlertTriangle,
      color: 'text-rose-700 bg-rose-100',
      action: () => onNavigateTab('incidents'),
    },
    {
      title: 'Blocked IPs (Simulated)',
      value: stats.blockedIps,
      change: 'PostgreSQL defense',
      icon: Ban,
      color: 'text-purple-600 bg-purple-50',
      action: () => onNavigateTab('blocked-ips'),
    },
  ];

  const pieData = [
    { name: 'Successful', value: stats.successfulLogins || 0 },
    { name: 'Failed', value: stats.failedLogins || 0 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Hero Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Security Operations Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Autonomous Detection Engine • TrueForge Agent Harness • Real-time Monitoring
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRunCompleteAttack}
            disabled={isSimulating}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 mr-1.5 text-amber-300" />
            {isSimulating ? 'Running Attack Scenario...' : 'Run Attack Scenario'}
          </button>
          <button
            onClick={() => onNavigateTab('agent')}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Cpu className="w-4 h-4 mr-1.5 text-blue-600" />
            AI Agent Console
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={card.action}
              className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs transition-all ${
                card.action ? 'cursor-pointer hover:border-blue-400 hover:shadow-xs' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {card.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {card.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Failed Login Attempts Over Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Failed Login Attempts Over Time
              </h3>
              <p className="text-xs text-slate-500">
                Temporal distribution of authentication anomalies
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            {activityData.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData.timeSeries}>
                  <defs>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorFailed)"
                    name="Failed Attempts"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                <Activity className="w-8 h-8 text-slate-300 mb-2" />
                <span>No login events recorded yet. Run a simulation to generate activity.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Failed Attempts by Source IP */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Failed Attempts by Source IP
              </h3>
              <p className="text-xs text-slate-500">
                Attacker IP concentration & frequency
              </p>
            </div>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>

          <div className="h-64 w-full">
            {activityData.ipDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData.ipDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="ip" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Failed Logins" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                <Ban className="w-8 h-8 text-slate-300 mb-2" />
                <span>No failed attempts by IP yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Successful vs Failed Logins */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Successful vs Failed Logins
              </h3>
              <p className="text-xs text-slate-500">
                Proportion of valid vs rejected authentication attempts
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {stats.totalAttempts > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No attempts logged yet.</div>
            )}
          </div>
        </div>

        {/* Chart 4: Risk Distribution Across Sources */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Risk Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Classification of active IPs across risk tiers
              </p>
            </div>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>

          <div className="h-60 w-full">
            {activityData.riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData.riskDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" width={80} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {activityData.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No risk data calculated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
