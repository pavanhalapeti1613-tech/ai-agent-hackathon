import React from 'react';
import { Activity, ShieldAlert, Bot, Search, Clock, CheckCircle2, XCircle } from 'lucide-react';
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
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'SUSPICIOUS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blue-600" />
            Login Velocity & Frequency Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time deterministic frequency analysis over sliding windows.
          </p>
        </div>
      </div>

      {/* Frequency Analysis Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <h3 className="text-sm font-bold text-slate-900">Per-IP Velocity Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Target Account</th>
                <th className="py-2.5 px-3">Total Failures</th>
                <th className="py-2.5 px-3">Last 1m</th>
                <th className="py-2.5 px-3">Last 5m</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {frequencyAnalysis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No active login metrics recorded.
                  </td>
                </tr>
              ) : (
                frequencyAnalysis.map((metric, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">{metric.sourceIp}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{metric.targetAccount}</td>
                    <td className="py-3 px-3 font-bold text-rose-600">{metric.failedAttempts}</td>
                    <td className="py-3 px-3 text-slate-600">{metric.last1m}</td>
                    <td className="py-3 px-3 text-slate-600">{metric.last5m}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{metric.averageFrequency} /min</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(metric.riskLevel)}`}>
                        {metric.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onTriggerAnalysis(metric.sourceIp, metric.targetAccount)}
                        disabled={isAnalyzing}
                        className="py-1 px-2.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-medium transition-colors"
                      >
                        Analyze with AI
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Login Attempts Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <h3 className="text-sm font-bold text-slate-900">Recent Ingress Attempts Log</h3>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No login attempts recorded yet.
                  </td>
                </tr>
              ) : (
                attempts.slice(0, 50).map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-500">{new Date(att.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-semibold">{att.username}</td>
                    <td className="py-2.5 px-3 text-slate-600">{att.sourceIp}</td>
                    <td className="py-2.5 px-3">
                      {att.loginStatus === 'Success' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{att.userAgent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
