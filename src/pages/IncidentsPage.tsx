import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  CheckCircle,
  Clock,
  Eye,
  Lock,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { SecurityIncident } from '../types/security';

interface IncidentsPageProps {
  incidents: SecurityIncident[];
  onSelectIncident: (incident: SecurityIncident) => void;
  onApproveBlock: (incidentId: string) => void;
  onRejectBlock: (incidentId: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onSelectIncident,
  onApproveBlock,
  onRejectBlock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.sourceIp.includes(searchTerm) ||
      inc.targetAccount.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Awaiting Admin Approval':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            Awaiting Admin Approval
          </span>
        );
      case 'Awaiting User Confirmation':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Awaiting User
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Rejected
          </span>
        );
      case 'Blocked':
      case 'Verified':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {status}
          </span>
        );
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">HIGH</span>;
      case 'SUSPICIOUS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">SUSPICIOUS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{risk}</span>;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Security Incident Management
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Correlated brute force and authentication anomalies awaiting response or resolution
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Active & Historic Incidents ({filteredIncidents.length})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, IP, or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Awaiting Admin Approval">Awaiting Admin Approval</option>
              <option value="Awaiting User Confirmation">Awaiting User Confirmation</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Incident ID</th>
                <th className="px-4 py-3">Detection</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Attempts / Freq</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">User Conf.</th>
                <th className="px-4 py-3">Admin Dec.</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-blue-700 font-bold">
                      {inc.id}
                    </td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-800">
                      {inc.detection}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {inc.sourceIp}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-700">
                      {inc.targetAccount}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inc.failedAttempts} ({inc.frequency}/min)
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(inc.risk)}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`text-[10px] font-semibold ${
                          inc.userConfirmation === 'Unauthorized'
                            ? 'text-rose-600'
                            : inc.userConfirmation === 'Authorized'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {inc.userConfirmation}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`text-[10px] font-semibold ${
                          inc.adminDecision === 'Approved'
                            ? 'text-emerald-600'
                            : inc.adminDecision === 'Rejected'
                            ? 'text-slate-500'
                            : 'text-amber-600'
                        }`}
                      >
                        {inc.adminDecision}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {getStatusBadge(inc.status)}
                    </td>
                    <td className="px-4 py-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        {inc.status === 'Awaiting Admin Approval' ? (
                          <>
                            <button
                              onClick={() => onApproveBlock(inc.id)}
                              className="px-2 py-1 bg-rose-600 text-white font-semibold text-[10px] rounded hover:bg-rose-700 transition-colors"
                            >
                              Approve Block
                            </button>
                            <button
                              onClick={() => onRejectBlock(inc.id)}
                              className="px-2 py-1 bg-white border border-slate-300 text-slate-700 font-semibold text-[10px] rounded hover:bg-slate-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onSelectIncident(inc)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Inspect Incident"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-xs text-slate-400 font-sans">
                    No security incidents recorded. Run a simulation to generate incidents.
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
