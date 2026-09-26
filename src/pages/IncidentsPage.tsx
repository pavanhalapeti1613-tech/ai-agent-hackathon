import React from 'react';
import { AlertTriangle, ShieldCheck, Lock, XCircle, ChevronRight, Clock, Bot } from 'lucide-react';
import { SecurityIncident } from '../types/security';

interface IncidentsPageProps {
  incidents: SecurityIncident[];
  onSelectIncident: (inc: SecurityIncident) => void;
  onApproveBlock: (incidentId: string) => void;
  onRejectBlock: (incidentId: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onSelectIncident,
  onApproveBlock,
  onRejectBlock,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Awaiting Admin Approval':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-bold';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2.5 text-rose-600" />
          Security Incidents Registry
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Correlated authentication anomalies and human approval records.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Target Account</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Failures</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Owner Confirmation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No security incidents recorded.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{inc.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">{inc.targetAccount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{inc.sourceIp}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{inc.failedAttempts} in {inc.detectionWindow}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(inc.risk)}`}>
                        {inc.risk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 font-medium">{inc.userConfirmation}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {inc.status === 'Awaiting Admin Approval' && inc.adminDecision === 'Pending' && (
                          <>
                            <button
                              onClick={() => onApproveBlock(inc.id)}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onRejectBlock(inc.id)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-300 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                          title="View in AI Agent Console"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
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
