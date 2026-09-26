import React from 'react';
import { AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { BlockedIpRecord } from '../types/security';

interface UnblockModalProps {
  record: BlockedIpRecord | null;
  onClose: () => void;
  onConfirmUnblock: (ip: string) => void;
  isProcessing?: boolean;
}

export const UnblockModal: React.FC<UnblockModalProps> = ({
  record,
  onClose,
  onConfirmUnblock,
  isProcessing = false,
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-2">
            Confirm IP Unblock
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Are you sure you want to remove the simulated block for IP{' '}
            <strong className="font-mono text-slate-800">{record.ip}</strong>?
            This will allow new incoming authentication attempts from this source to reach the login endpoint.
          </p>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono mb-5 space-y-1 text-slate-600">
            <div>Original Incident: {record.incidentId || 'Manual block'}</div>
            <div>Reason: {record.reason}</div>
            <div>Failed Attempts: {record.failedAttempts}</div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirmUnblock(record.ip)}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm shadow-amber-600/30 flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Confirm Unblock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
