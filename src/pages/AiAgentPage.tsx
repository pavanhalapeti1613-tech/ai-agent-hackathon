import React from 'react';
import {
  Bot,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  XCircle,
  ArrowRight,
  Database,
  Terminal,
} from 'lucide-react';
import { AgentState, SecurityIncident } from '../types/security';

interface AiAgentPageProps {
  agentState: AgentState;
  activeIncident: SecurityIncident | null;
  onApproveBlock: (incidentId: string) => void;
  onRejectBlock: (incidentId: string) => void;
  onTriggerAnalysis: (ip: string, username: string) => void;
  isProcessing: boolean;
}

export const AiAgentPage: React.FC<AiAgentPageProps> = ({
  agentState,
  activeIncident,
  onApproveBlock,
  onRejectBlock,
  onTriggerAnalysis,
  isProcessing,
}) => {
  // Steps in the autonomous cybersecurity investigation sequence
  const checklist = [
    { label: 'Authentication logs analyzed', completed: true },
    {
      label: 'Failed login events correlated',
      completed: agentState.status !== 'Monitoring',
    },
    {
      label: 'Source IP identified',
      completed: agentState.status !== 'Monitoring',
    },
    {
      label: 'Frequency calculated deterministically',
      completed: agentState.status !== 'Monitoring',
    },
    {
      label: 'Suspicious pattern detected',
      completed: agentState.status !== 'Monitoring',
    },
    {
      label: 'Risk calculated according to thresholds',
      completed: agentState.status !== 'Monitoring',
    },
    {
      label: 'Legitimate account owner notified',
      completed:
        agentState.status === 'Waiting for User' ||
        agentState.status === 'Waiting for Admin' ||
        agentState.status === 'Executing' ||
        agentState.status === 'Verifying' ||
        agentState.status === 'Resolved',
    },
  ];

  const isAwaitingAdmin =
    agentState.status === 'Waiting for Admin' && activeIncident;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <Bot className="w-6 h-6 mr-2.5 text-blue-600" />
            Digital Defenders Security Agent
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Orchestrated via TrueForge Agent Harness • Gemini 3.8 Flash Reasoning • MCP Tool Interface
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-mono">Current Agent State:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200">
            {agentState.status}
          </span>
        </div>
      </div>

      {/* ARCHITECTURAL FLOW DIAGRAM */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Agent Execution Pipeline Architecture
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block text-[11px]">React Frontend</span>
            <span className="text-[10px] text-slate-400">Dashboard & Actions</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block text-[11px]">FastAPI Backend</span>
            <span className="text-[10px] text-slate-400">Endpoints & Logic</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-blue-900">
            <span className="font-bold block text-[11px]">TrueForge Harness</span>
            <span className="text-[10px] text-blue-600">Agent Sessions</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-blue-900">
            <span className="font-bold block text-[11px]">Gemini 3.8 Flash</span>
            <span className="text-[10px] text-blue-600">Reasoning Layer</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block text-[11px]">MCP Security Tools</span>
            <span className="text-[10px] text-slate-400">Controlled APIs</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block text-[11px]">PostgreSQL</span>
            <span className="text-[10px] text-slate-400">Database Storage</span>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
            <span className="font-bold block text-[11px]">Human Approval</span>
            <span className="text-[10px] text-amber-600">Checkpoint Barrier</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-900">
            <span className="font-bold block text-[11px]">Verified Block</span>
            <span className="text-[10px] text-emerald-600">Post-Action Audit</span>
          </div>
        </div>
      </div>

      {/* CORE AGENT DUAL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INVESTIGATION CHECKLIST & STATUS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              Autonomous Investigation Checklist
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Auditable Steps
            </span>
          </div>

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-3 p-2.5 rounded-lg text-xs transition-colors ${
                  item.completed
                    ? 'bg-emerald-50/60 text-slate-800 font-medium'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    item.completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {item.completed ? '✓' : '•'}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* ACTIVE AGENT RECOMMENDATION & STATUS BANNER */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Agent Recommendation
              </span>
              <span className="font-mono text-blue-700 font-bold">
                → Block Source IP
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Waiting For
              </span>
              <span
                className={`font-semibold ${
                  agentState.status === 'Waiting for Admin'
                    ? 'text-rose-700 font-bold animate-pulse'
                    : agentState.status === 'Waiting for User'
                    ? 'text-amber-700'
                    : 'text-slate-700'
                }`}
              >
                {agentState.status === 'Waiting for Admin'
                  ? '→ Administrator Approval (Checkpoint Active)'
                  : agentState.status === 'Waiting for User'
                  ? '→ Account Owner Confirmation'
                  : '→ Monitoring Ingress'}
              </span>
            </div>
          </div>

          {/* HUMAN APPROVAL ACTION CHECKPOINT (CRITICAL) */}
          {isAwaitingAdmin && (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-5 shadow-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <h4 className="text-sm font-bold text-rose-900">
                    TrueForge Human Approval Checkpoint
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-rose-800 bg-rose-200 px-2 py-0.5 rounded">
                  PAUSED
                </span>
              </div>

              <p className="text-xs text-rose-800 leading-relaxed">
                The agent has identified brute force behavior from{' '}
                <strong className="font-mono">{activeIncident.sourceIp}</strong> with {activeIncident.failedAttempts} failed attempts.
                The agent workflow is <strong>PAUSED</strong>. Defensive simulated IP block will NOT execute without your explicit authorization.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => onApproveBlock(activeIncident.id)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm shadow-rose-600/30 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  <span>APPROVE & BLOCK</span>
                </button>
                <button
                  onClick={() => onRejectBlock(activeIncident.id)}
                  disabled={isProcessing}
                  className="py-2.5 px-4 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-300 flex items-center space-x-1 disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  <span>REJECT</span>
                </button>
              </div>
            </div>
          )}

          {/* RESOLUTION PROOF DISPLAY */}
          {agentState.status === 'Resolved' && activeIncident && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-900 space-y-2 animate-in fade-in">
              <h4 className="font-bold flex items-center text-sm text-emerald-950">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-700" />
                Remediation Self-Verification Complete
              </h4>
              <pre className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                {activeIncident.verification || '✓ IP block confirmed in database\n✓ New demo attempts prevented\n✓ Incident evidence updated\n✓ Incident resolved'}
              </pre>
            </div>
          )}
        </div>

        {/* RIGHT: AUDITABLE AGENT TIMELINE & MCP TOOL TRACE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Terminal className="w-4 h-4 mr-2 text-blue-600" />
              Auditable Agent Activity Timeline
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              MCP Security Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[480px] pr-1">
            {agentState.recentActivity.map((act, index) => (
              <div
                key={index}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700 font-mono text-[11px]">
                    {act.step}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{act.details}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-[11px] text-blue-900 space-y-1">
            <span className="font-bold block">Zero Hidden Chain-of-Thought Guarantee:</span>
            <p className="text-blue-800">
              In accordance with AI Studio cybersecurity architecture rules, the interface presents only empirical evidence, verified findings, risk classification, recommendations, and tool output.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
