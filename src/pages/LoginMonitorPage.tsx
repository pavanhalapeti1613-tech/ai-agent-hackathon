import React, { useState } from 'react';
import {
  Activity,
  ShieldAlert,
  Search,
  Bot,
  Filter,
  ArrowUpDown,
  Clock,
  Server,
  User,
  Zap,
} from 'lucide-react';
import { LoginAttempt, FrequencyMetric } from '../types/security';

interface LoginMonitorPageProps {
  attempts: LoginAttempt[];
  frequencyAnalysis: FrequencyMetric[];
  onTriggerAnalysis: (ip: string, username: string) => void;
  isAnalyzing: boolean;
}

export const LoginMonitorPage: React.FC<LoginMonitorPageProps> = ({
  attempts,
  frequencyAnalysis,
  onTriggerAnalysis,
  isAnalyzing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Failed' | 'Success'>('All');

  const filteredAttempts = attempts.filter((a) => {
    const matchesSearch =
      a.sourceIp.includes(searchTerm) ||
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || a.loginStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
            HIGH
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            SUSPICIOUS
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
            WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Authentication & Frequency Monitor
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Deterministic sliding window calculation & live authentication event stream
        </p>
      </div>

      {/* SECTION 1: FREQUENCY ANALYSIS TABLE (Deterministic Backend Output) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Source IP Frequency & Risk Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic calculations over 1m, 5m, and 15m windows
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md">
            {frequencyAnalysis.length} Source IPs Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Failed Attempts</th>
                <th className="px-4 py-3">Last 1m</th>
                <th className="px-4 py-3">Last 5m</th>
                <th className="px-4 py-3">Last 15m</th>
                <th className="px-4 py-3">Avg Frequency</th>
                <th className="px-4 py-3">Calculated Risk</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {frequencyAnalysis.length > 0 ? (
                frequencyAnalysis.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 flex items-center">
                      <Server className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {item.sourceIp}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {item.targetAccount}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">
                      {item.failedAttempts}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {item.last1m}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {item.last5m}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {item.last15m}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {item.averageFrequency} / min
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(item.riskLevel)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onTriggerAnalysis(item.sourceIp, item.targetAccount)}
                        disabled={isAnalyzing}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50"
                      >
                        <Bot className="w-3 h-3 mr-1" />
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-400">
                    No authentication events logged. Start a simulation to analyze traffic.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: INDIVIDUAL LOGIN ATTEMPTS STREAM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Authentication Event Stream
            </h3>
            <p className="text-xs text-slate-500">
              Granular audit log of each inbound authentication attempt
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search IP or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Failed">Failed Only</option>
              <option value="Success">Success Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Attempt ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">User Agent</th>
                <th className="px-4 py-3">Source Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredAttempts.length > 0 ? (
                filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 font-medium text-[11px]">
                      {attempt.id}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-800 font-sans">
                      {attempt.username}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                      {new Date(attempt.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800 font-bold">
                      {attempt.sourceIp}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          attempt.loginStatus === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {attempt.loginStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px] truncate max-w-xs font-sans">
                      {attempt.userAgent}
                    </td>
                    <td className="px-4 py-2.5">
                      {attempt.isSynthetic ? (
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-sans font-semibold">
                          DEMO DATA
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-sans">
                          Live Ingress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400 font-sans">
                    No matching authentication attempts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
