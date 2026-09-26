import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { User } from './types/security';
import { ShieldCheck, LogOut, UserCheck, Lock, Activity } from 'lucide-react';

export default function App() {
  // Frontend displays ONLY the login page by default
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // When logged in, display the authenticated user portal
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white">
              Digital Defenders
            </h1>
            <p className="text-[11px] text-blue-400 font-mono">
              Enterprise Secure Portal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{currentUser.name}</span>
            <span className="text-slate-400">({currentUser.role})</span>
          </div>

          <button
            onClick={() => setCurrentUser(null)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Authenticated Dashboard */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Welcome back, {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Authenticated Account: {currentUser.username} • Role: {currentUser.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Session Status</span>
              <p className="font-bold text-emerald-700 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Active Secure Session
              </p>
              <p className="text-[11px] text-slate-500">
                Your account is continuously monitored and protected by the backend AI incident response agent.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Security Defense Engine</span>
              <p className="font-bold text-blue-700 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                TrueForge Harness & Gemini Reasoning (Backend)
              </p>
              <p className="text-[11px] text-slate-500">
                Brute-force detection, frequency correlation, and simulated IP block defenses are active.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setCurrentUser(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-300 flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Return to Login Page</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
