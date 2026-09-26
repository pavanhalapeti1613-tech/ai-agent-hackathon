import React, { useState } from 'react';
import {
  Ban,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Search,
  ExternalLink,
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = blockedIps.filter((b) =>
    b.ip.includes(searchTerm) || b.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Simulated Blocked IPs
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Safe defense registry stored in PostgreSQL database • Host firewall isolation preserved
        </p>
      </div>

      {/* SIMULATION MODE BANNER */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
        <Lock className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-900">
          <span className="font-bold block uppercase tracking-wider text-[10px]">
            SIMULATION MODE ACTIVE
          </span>
          <p className="mt-0.5 leading-relaxed">
            All mitigation actions execute strictly inside Digital Defenders' PostgreSQL simulated security rules.
            The real host operating system firewall (iptables/nftables) is <strong>never modified</strong>.
            New synthetic attempts matching blocked IPs are rejected at the application authentication boundary.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Ban className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Blocked Sources Registry ({filtered.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search IP or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Mitigation Reason</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Risk Tier</th>
                <th className="px-4 py-3">Blocked At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.length > 0 ? (
                filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                      {record.ip}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 max-w-xs truncate">
                      {record.reason}
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600">
                      {record.failedAttempts}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {record.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.blockedAt}
                    </td>
                    <td className="px-4 py-3 font-sans">
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
                    <td className="px-4 py-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-2">
                        {record.incidentId && (
                          <button
                            onClick={() => onSelectIncidentById(record.incidentId)}
                            className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Incident
                          </button>
                        )}
                        {record.status === 'Blocked' && (
                          <button
                            onClick={() => onOpenUnblockModal(record)}
                            className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                          >
                            <Unlock className="w-3 h-3 mr-1 text-slate-500" />
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400 font-sans">
                    No IP addresses currently blocked. Run complete attack scenario to demonstrate defensive remediation.
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
