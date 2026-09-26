import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { SecurityIncident } from '../types/security';

interface IncidentReportsPageProps {
  incidents: SecurityIncident[];
}

export const IncidentReportsPage: React.FC<IncidentReportsPageProps> = ({
  incidents,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id || ''
  );

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const handleExportJson = () => {
    if (!selectedIncident) return;
    const reportData = {
      reportType: 'CYBERSECURITY_INCIDENT_FORENSICS_REPORT',
      generator: 'Digital Defenders AI Incident Response Agent',
      harness: 'TrueForge Agent Harness',
      exportedAt: new Date().toISOString(),
      incident: selectedIncident,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Incident-Report-${selectedIncident.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Incident Forensics Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Auditable executive and technical security incident dossiers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportJson}
            disabled={!selectedIncident}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Export JSON
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedIncident}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Report
          </button>
        </div>
      </div>

      {incidents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Incident Selector Column */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Select Incident Dossier
            </h3>
            <div className="space-y-1.5">
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    (selectedIncident?.id === inc.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="font-bold">{inc.id}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        inc.risk === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.risk}
                    </span>
                  </div>
                  <div className="font-sans font-medium truncate">{inc.detection}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    IP: {inc.sourceIp}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dossier Document View */}
          {selectedIncident && (
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs p-8 space-y-6">
              {/* Report Header */}
              <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      OFFICIAL INCIDENT REPORT
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      {selectedIncident.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedIncident.detection}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Target: {selectedIncident.targetAccount} • Source: {selectedIncident.sourceIp}
                  </p>
                </div>

                <div className="text-right text-xs text-slate-500 font-mono">
                  <div>Date: {new Date(selectedIncident.createdAt).toLocaleDateString()}</div>
                  <div>Status: <span className="font-bold text-slate-800">{selectedIncident.status}</span></div>
                </div>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Failed Attempts</span>
                  <span className="text-base font-bold font-mono text-rose-600">{selectedIncident.failedAttempts}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Detection Window</span>
                  <span className="text-base font-bold font-mono text-slate-800">{selectedIncident.detectionWindow}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Calculated Frequency</span>
                  <span className="text-base font-bold font-mono text-slate-800">{selectedIncident.frequency} / min</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Risk Classification</span>
                  <span className="text-base font-bold font-mono text-rose-700">{selectedIncident.risk}</span>
                </div>
              </div>

              {/* Evidence Section */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                  1. Evidence & Attack Characteristics
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-sans">
                  {selectedIncident.evidence}
                </div>
              </div>

              {/* User and Admin Response Flow */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                  2. Stakeholder Response & Approvals
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 p-3.5 rounded-lg space-y-1">
                    <span className="text-slate-500 font-semibold block text-[10px]">Account Owner Confirmation</span>
                    <span className="font-bold text-slate-800">{selectedIncident.userConfirmation}</span>
                    <p className="text-[11px] text-slate-500">
                      Dispatched via in-app alert & demo email notification.
                    </p>
                  </div>
                  <div className="border border-slate-200 p-3.5 rounded-lg space-y-1">
                    <span className="text-slate-500 font-semibold block text-[10px]">Administrator Decision</span>
                    <span className="font-bold text-slate-800">{selectedIncident.adminDecision}</span>
                    <p className="text-[11px] text-slate-500">
                      Evaluated at TrueForge Human Approval Checkpoint.
                    </p>
                  </div>
                </div>
              </div>

              {/* Remediation & Verification Proof */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                  3. Defensive Action & Post-Remediation Verification
                </h4>
                <div className="border border-slate-200 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recommended Action:</span>
                    <span className="font-semibold text-slate-800">{selectedIncident.recommendedAction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Action Result:</span>
                    <span className="font-semibold text-slate-800">{selectedIncident.actionResult}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-500 block mb-1">Self-Verification Log:</span>
                    <pre className="bg-slate-900 text-emerald-400 p-3 rounded font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                      {selectedIncident.verification || 'Pending verification'}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Signoff */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span>Verified by TrueForge Security Harness</span>
                <span>Incident Status: {selectedIncident.status}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No incidents logged yet. Run the attack simulator to generate reports.
        </div>
      )}
    </div>
  );
};
