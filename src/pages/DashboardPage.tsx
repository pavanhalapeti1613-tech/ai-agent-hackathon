import React from 'react';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  XCircle,
  Bot,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
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

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  activityData,
  onNavigateTab,
  onRunCompleteAttack,
  isSimulating,
}) => {
  const statCards = [
    {
      title: 'Total Login Attempts',
      value: stats.totalAttempts,
      sub: `${stats.successfulLogins} successful, ${stats.failedLogins} failed`,
      icon: Activity,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Failed Attempts',
      value: stats.failedLogins,
      sub: 'Ingress authentication failures',
      icon: XCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      title: 'Suspicious Velocity',
      value: stats.suspiciousAttempts,
      sub: 'Exceeding risk thresholds',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Active Incidents',
      value: stats.activeIncidents,
      sub: 'Requiring SOC action/approval',
      icon: ShieldAlert,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      action: () => onNavigateTab('incidents'),
    },
    {
      title: 'Blocked IPs',
      value: stats.blockedIps,
      sub: 'Simulated defense blacklist',
      icon: Ban,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
      action: () => onNavigateTab('blocked-ips'),
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Simulation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Security Operations Center (SOC) Overview
          </h2>
          <p className="text-xs text-slate-500">
            Autonomous protection against brute-force and credential stuffing threats with Human-in-the-Loop verification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('agent')}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Agent</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between ${
                card.action ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600">{card.title}</span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Traffic & Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
              Source IP Distribution
            </h3>
            <span className="text-xs text-slate-400">Failed attempts by origin</span>
          </div>

          <div className="space-y-2">
            {activityData.ipDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No telemetry recorded yet.</p>
            ) : (
              activityData.ipDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <span className="font-mono font-medium text-slate-700">{item.ip}</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {item.count} failures
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-600" />
              Risk Level Classification
            </h3>
            <span className="text-xs text-slate-400">Assessed by Deterministic Engine</span>
          </div>

          <div className="space-y-2">
            {activityData.riskDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                <span className="font-semibold text-slate-700">{item.name}</span>
                <span className="font-bold text-slate-900">{item.value} IPs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
