import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Lock,
} from 'lucide-react';
import { AgentState } from '../types/security';

interface TopBarProps {
  agentState: AgentState;
  onSimulateSingle: () => void;
  onSimulateFive: () => void;
  onRunCompleteAttack: () => void;
  onResetDemo: () => void;
  isSimulating: boolean;
  simulationStepText?: string;
  hasGeminiKey: boolean;
  trueforgeUrl: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  agentState,
  onSimulateSingle,
  onSimulateFive,
  onRunCompleteAttack,
  onResetDemo,
  isSimulating,
  simulationStepText,
  hasGeminiKey,
  trueforgeUrl,
}) => {
  const getStatusBadge = () => {
    switch (agentState.status) {
      case 'Monitoring':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent: Monitoring
          </span>
        );
      case 'Investigating':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500 animate-ping"></span>
            Agent: Investigating
          </span>
        );
      case 'Waiting for User':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            Agent: Awaiting User Confirmation
          </span>
        );
      case 'Waiting for Admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm animate-pulse">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-600"></span>
            Checkpoint: Waiting for Admin Approval
          </span>
        );
      case 'Executing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-500 animate-spin"></span>
            Executing Simulated IP Block
          </span>
        );
      case 'Verifying':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-indigo-500"></span>
            Verifying Remediation
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Incident Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Left: Environment & Harness indicators */}
      <div className="flex items-center space-x-3">
        {getStatusBadge()}

        {/* TrueForge Agent Harness Badge */}
        <div
          title={`TrueForge Agent Harness: ${trueforgeUrl}`}
          className="hidden md:flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
        >
          <Cpu className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          <span className="font-mono">TrueForge Harness</span>
        </div>

        {/* Gemini Reasoning Engine Badge */}
        <div
          title="Google Gemini 3.8 Flash Reasoning Layer"
          className="hidden lg:flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          <span>Gemini 3.8 Flash</span>
        </div>

        {/* Simulated IP Block Badge */}
        <div
          title="Simulated Mode: Modifications restricted to simulated PostgreSQL tables"
          className="hidden xl:flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200"
        >
          <Lock className="w-3 h-3 mr-1 text-amber-600" />
          IP_BLOCK_MODE=simulation
        </div>
      </div>

      {/* Right: Attack Simulator Quick Action Controls */}
      <div className="flex items-center space-x-2">
        {/* Step Indicator if running complete scenario */}
        {isSimulating && simulationStepText && (
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 animate-pulse">
            {simulationStepText}
          </span>
        )}

        {/* Progressive Attack Generation Buttons */}
        <button
          onClick={onSimulateSingle}
          disabled={isSimulating}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Inject 1 failed login attempt from 192.168.1.45"
        >
          +1 Failed Attempt
        </button>

        <button
          onClick={onSimulateFive}
          disabled={isSimulating}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Inject 5 failed login attempts from 192.168.1.45"
        >
          +5 Failed Attempts
        </button>

        {/* Complete Scenario Launcher */}
        <button
          onClick={onRunCompleteAttack}
          disabled={isSimulating}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs shadow-blue-500/20 disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" />
          RUN COMPLETE ATTACK SCENARIO
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          disabled={isSimulating}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          title="Reset all demo data and state"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset Demo
        </button>
      </div>
    </header>
  );
};
