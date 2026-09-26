import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { AuditLog } from '../types/security';

interface SystemLogsPageProps {
  logs: AuditLog[];
  onSelectIncidentById: (incidentId: string) => void;
}

export const SystemLogsPage: React.FC<SystemLogsPageProps> = ({
  logs,
  onSelectIncidentById,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActor = actorFilter === 'All' || log.actor === actorFilter;
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesActor && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            WARNING
          </span>
        );
      case 'FAILURE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            FAILURE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Security System Audit Logs
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Immutable forensic event stream tracking every authentication, detection, and remediation step
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ScrollText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Audit Records ({filtered.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search action, IP, account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
              />
            </div>

            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Actors</option>
              <option value="AI Agent">AI Agent</option>
              <option value="Administrator">Administrator</option>
              <option value="Account Owner">Account Owner</option>
              <option value="System">System</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="FAILURE">FAILURE</option>
              <option value="INFO">INFO</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Action Description</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Incident</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-800 text-[11px]">
                      {log.eventType}
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-700 max-w-sm truncate">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-800 font-medium">
                      {log.account}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800 font-bold">
                      {log.ip}
                    </td>
                    <td className="px-4 py-2.5 font-sans">
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {log.actor}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-4 py-2.5">
                      {log.incidentId ? (
                        <button
                          onClick={() => onSelectIncidentById(log.incidentId!)}
                          className="text-blue-600 hover:underline flex items-center font-bold text-[11px]"
                        >
                          {log.incidentId}
                          <ExternalLink className="w-2.5 h-2.5 ml-1" />
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-400 font-sans">
                    No matching audit log records.
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
