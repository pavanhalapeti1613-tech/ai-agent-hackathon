import React from 'react';
import { Mail, X, ShieldAlert, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../types/security';

interface EmailModalProps {
  notification: NotificationItem | null;
  onClose: () => void;
  onConfirm: (confirmedWasUser: boolean) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  notification,
  onClose,
  onConfirm,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Email Client Header Preview */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
                DEMO EMAIL MODE
              </span>
              <h3 className="text-sm font-semibold text-white">
                Simulated User Inbox
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-2 text-xs text-slate-600 font-mono">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-800">From:</span>
            <span>security-alerts@digitaldefenders.sec</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-800">To:</span>
            <span>{notification.targetAccount}@digitaldefenders.sec</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-800">Date:</span>
            <span>{new Date(notification.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="font-semibold text-slate-800">Subject:</span>
            <span className="text-blue-700 font-bold font-sans text-sm">
              {notification.emailSubject || 'Security Alert – Multiple Login Attempts Detected'}
            </span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Multiple login attempts detected
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Our AI Incident Response Agent detected repeated authentication anomalies on your account.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Target Account:</span>
              <span className="font-bold text-slate-800 text-sm font-mono">
                {notification.targetAccount}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Failed Attempts:</span>
              <span className="font-bold text-rose-600 text-sm font-mono">
                {notification.failedAttempts}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Suspicious Source IP:</span>
              <span className="font-bold text-slate-800 text-sm font-mono">
                {notification.sourceIp}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Assessed Risk:</span>
              <span className="font-bold text-rose-700 text-sm">
                {notification.risk}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-slate-800">Security Recommendation:</p>
            <p>
              If this was not you, our agent recommends initiating an immediate simulated firewall IP block to halt automated credential guessing.
            </p>
            <p className="text-[11px] text-slate-400 italic">
              Note: For your protection, passwords are never stored or transmitted in email dispatches.
            </p>
          </div>

          {/* Interactive User Confirmation Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-800 text-center mb-3">
              Was this you?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onConfirm(true);
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
              >
                YES, IT WAS ME
              </button>
              <button
                onClick={() => {
                  onConfirm(false);
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm shadow-rose-500/30"
              >
                NO, THIS WASN'T ME
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-center">
          <span className="text-[11px] text-slate-500">
            Digital Defenders Automated Response System • Safe Simulation Environment
          </span>
        </div>
      </div>
    </div>
  );
};
