import React from 'react';
import { FileText, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { SecurityIncident } from '../types/security';

interface IncidentReportsPageProps {
  incidents: SecurityIncident[];
}

export const IncidentReportsPage: React.FC<IncidentReportsPageProps> = ({ incidents }) => {
  const downloadReport = (inc: SecurityIncident) => {
    const reportText = `=====================================================
DIGITAL DEFENDERS - SECURITY INCIDENT AUDIT REPORT
=====================================================
Incident ID:        ${inc.id}
Detection Date:     ${new Date(inc.createdAt).toLocaleString()}
Target Account:     ${inc.targetAccount}
Source IP Address:  ${inc.sourceIp}
Failed Attempts:    ${inc.failedAttempts} in ${inc.detectionWindow}
Calculated Velocity:${inc.frequency} attempts/minute
Risk Classification:${inc.risk}
Owner Confirmation: ${inc.userConfirmation}
SOC Admin Decision: ${inc.adminDecision}
Incident Status:    ${inc.status}

EMPIRICAL EVIDENCE:
${inc.evidence}

RECOMMENDED ACTION:
${inc.recommendedAction}

ACTION EXECUTION & VERIFICATION:
${inc.verification}

AUDIT LOGS RECORD:
Autonomous investigation orchestrated via TrueForge Agent Harness & Gemini 3.8 Flash.
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incident-Report-${inc.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <FileText className="w-6 h-6 mr-2.5 text-blue-600" />
          SOC Incident Reports & Compliance Export
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Exportable evidence files and compliance audits for cybersecurity incidents.
        </p>
      </div>

      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No incident reports generated yet.
          </div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-blue-600">{inc.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-800">{inc.detection}</span>
                  <span className="text-xs font-mono text-slate-500">({inc.targetAccount})</span>
                </div>
                <button
                  onClick={() => downloadReport(inc)}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">SOURCE IP</span>
                  <span className="font-mono font-medium text-slate-800">{inc.sourceIp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">RISK RATING</span>
                  <span className="font-bold text-rose-600">{inc.risk}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STATUS</span>
                  <span className="font-medium text-slate-700">{inc.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ADMIN DECISION</span>
                  <span className="font-medium text-slate-700">{inc.adminDecision}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 font-mono">
                {inc.evidence}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
