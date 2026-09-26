import React from 'react';
import { ScrollText, ShieldCheck, Filter } from 'lucide-react';
import { AuditLog } from '../types/security';

interface SystemLogsPageProps {
  logs: AuditLog[];
  onSelectIncidentById: (incidentId: string) => void;
}

export const SystemLogsPage: React.FC<SystemLogsPageProps> = ({ logs, onSelectIncidentById }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILURE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <ScrollText className="w-6 h-6 mr-2.5 text-blue-600" />
          Immutable Security Audit Logs
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Detailed cryptographic event registry tracking authentication, AI detections, and administrator actions.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action & Details</th>
                <th className="py-2.5 px-3">Incident</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No audit logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.eventType}</td>
                    <td className="py-2.5 px-3 text-slate-700">{log.account}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.ip}</td>
                    <td className="py-2.5 px-3 text-slate-700">{log.actor}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-sm truncate font-sans text-xs">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.incidentId ? (
                        <button
                          onClick={() => onSelectIncidentById(log.incidentId!)}
                          className="text-blue-600 hover:underline"
                        >
                          {log.incidentId}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
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
