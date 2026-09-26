import React from 'react';
import { Ban, ShieldCheck, Unlock, AlertTriangle } from 'lucide-react';
import { BlockedIpRecord } from '../types/security';

interface BlockedIpsPageProps {
  blockedIps: BlockedIpRecord[];
  onOpenUnblockModal: (record: BlockedIpRecord) => void;
  onSelectIncidentById: (incidentId: string) => void;
}

export const BlockedIpsPage: React.FC<BlockedIpsPageProps> = ({
  blockedIps,
  onOpenUnblockModal,
  onSelectIncidentById,
}) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <Ban className="w-6 h-6 mr-2.5 text-rose-600" />
          Blocked IP Addresses
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Active simulated firewall restrictions enforced by the AI incident response pipeline.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Blocked IP</th>
                <th className="py-3 px-4">Triggering Incident</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Blocked At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blockedIps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No IP addresses currently blocked.
                  </td>
                </tr>
              ) : (
                blockedIps.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{record.ip}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onSelectIncidentById(record.incidentId)}
                        className="font-mono text-blue-600 hover:underline"
                      >
                        {record.incidentId}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{record.reason}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{record.blockedAt}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.status === 'Blocked'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {record.status === 'Blocked' && (
                        <button
                          onClick={() => onOpenUnblockModal(record)}
                          className="py-1 px-2.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-medium transition-colors shadow-2xs"
                        >
                          Unblock
                        </button>
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
