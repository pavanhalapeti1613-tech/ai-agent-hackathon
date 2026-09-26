import React from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle,
  AlertOctagon,
  Clock,
  Server,
  User,
  Activity,
  Lock,
  XCircle,
} from 'lucide-react';
import { SecurityIncident } from '../types/security';

interface IncidentDetailModalProps {
  incident: SecurityIncident | null;
  onClose: () => void;
  onApproveBlock: (incidentId: string) => void;
  onRejectBlock: (incidentId: string) => void;
  isProcessing?: boolean;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onApproveBlock,
  onRejectBlock,
  isProcessing = false,
}) => {
  if (!incident) return null;

  const isAwaitingApproval = incident.status === 'Awaiting Admin Approval';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {incident.id}
            </span>
            <h3 className="text-base font-semibold text-white">
              {incident.detection}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Target Account</span>
              <span className="text-sm font-bold font-mono text-slate-800 flex items-center mt-1">
                <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {incident.targetAccount}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Source IP</span>
              <span className="text-sm font-bold font-mono text-slate-800 flex items-center mt-1">
                <Server className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {incident.sourceIp}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Failed Attempts</span>
              <span className="text-sm font-bold font-mono text-rose-600 flex items-center mt-1">
                <Activity className="w-3.5 h-3.5 mr-1 text-rose-500" />
                {incident.failedAttempts} ({incident.frequency}/min)
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Risk Level</span>
              <span className="text-sm font-bold font-mono text-rose-700 flex items-center mt-1">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
                {incident.risk}
              </span>
            </div>
          </div>

          {/* Evidence Card */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <AlertOctagon className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Investigation Findings & Evidence
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {incident.evidence}
            </p>
            {incident.agentNotes && (
              <p className="text-[11px] text-slate-500 mt-2 italic font-mono">
                Source: {incident.agentNotes}
              </p>
            )}
          </div>

          {/* Incident State Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">User Confirmation</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-xs ${
                    incident.userConfirmation === 'Authorized'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : incident.userConfirmation === 'Unauthorized'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {incident.userConfirmation}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {incident.userConfirmation === 'Unauthorized'
                  ? 'Account owner reported they did not attempt these logins. Attack confirmed.'
                  : incident.userConfirmation === 'Authorized'
                  ? 'Account owner verified legitimate activity.'
                  : 'Awaiting response from account owner via in-app/email alert.'}
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Administrator Decision</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-xs ${
                    incident.adminDecision === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : incident.adminDecision === 'Rejected'
                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                  }`}
                >
                  {incident.adminDecision}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {incident.adminDecision === 'Approved'
                  ? 'Administrator authorized the defensive simulated IP block.'
                  : incident.adminDecision === 'Rejected'
                  ? 'Administrator rejected the defensive action.'
                  : 'Pending review by authorized SOC Administrator.'}
              </p>
            </div>
          </div>

          {/* Remediation & Verification Proof */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Remediation & Self-Verification Status
            </h4>
            <div className="text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Recommended Action:</span>
                <span className="font-semibold text-slate-800">{incident.recommendedAction}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Action Result:</span>
                <span className="font-semibold text-slate-800">{incident.actionResult}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Verification Proof:</span>
                <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                  {incident.verification || 'Verification checks will execute immediately upon administrator approval.'}
                </pre>
              </div>
            </div>
          </div>

          {/* HUMAN APPROVAL CHECKPOINT ACTION BAR */}
          {isAwaitingApproval && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 shadow-sm animate-in fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <h4 className="text-sm font-bold text-rose-900">
                    TrueForge Human Approval Checkpoint
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-semibold bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded">
                  APPROVAL REQUIRED
                </span>
              </div>

              <p className="text-xs text-rose-800 mb-4 leading-relaxed">
                The AI security agent has recommended applying a simulated firewall block to IP{' '}
                <strong className="font-mono">{incident.sourceIp}</strong>. In accordance with safety policies,
                the agent is paused and will not execute any mitigation without explicit administrator approval.
              </p>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onApproveBlock(incident.id)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm shadow-rose-600/30 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  <span>APPROVE & BLOCK</span>
                </button>
                <button
                  onClick={() => onRejectBlock(incident.id)}
                  disabled={isProcessing}
                  className="py-2.5 px-4 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-300 flex items-center space-x-1 disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  <span>REJECT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
