import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Cpu,
  Mail,
  CheckCircle,
  Inbox,
} from 'lucide-react';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [sourceIp, setSourceIp] = useState('127.0.0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Developer mail viewer modal state (allows inspecting developer inbox without exposing alert overlays)
  const [showDeveloperMailModal, setShowDeveloperMailModal] = useState(false);
  const [developerEmails, setDeveloperEmails] = useState<any[]>([]);
  const [developerEmailAddress, setDeveloperEmailAddress] = useState('pavanhalapeti75@gmail.com');

  const fetchDeveloperEmails = async () => {
    try {
      const data = await api.getDeveloperEmails();
      setDeveloperEmails(data.emails || []);
      if (data.developerEmail) {
        setDeveloperEmailAddress(data.developerEmail);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDeveloperEmails();
    const interval = setInterval(fetchDeveloperEmails, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      // Validate credentials on backend
      const res = await api.login(username, password, sourceIp);
      onLoginSuccess(res.user);
    } catch (err: any) {
      // Standard authentication failure message - no internal alert exposed on screen
      setErrorMessage(err.message || 'Invalid username or password.');
      // Refresh developer email dispatch state
      fetchDeveloperEmails();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(15,23,42,1))] pointer-events-none" />

      {/* Main Login Card - Clean enterprise authentication portal */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="bg-slate-950 p-6 text-white text-center border-b border-slate-800">
          <div className="w-14 h-14 mx-auto rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-600/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Digital Defenders
          </h1>
          <p className="text-xs text-blue-400 font-mono tracking-wider mt-0.5">
            AI Incident Response Agent
          </p>
        </div>

        {/* DEMO MODE Box */}
        <div className="bg-blue-50/70 border-b border-blue-100 p-4">
          <div className="flex items-start space-x-2.5">
            <Cpu className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-blue-900 block uppercase tracking-wide text-[10px]">
                DEMO MODE
              </span>
              <p className="text-blue-800 mt-0.5">
                Demo credentials (for local demonstration only):
              </p>
              <div className="mt-1.5 flex items-center space-x-3 font-mono text-[11px] bg-white/80 px-2.5 py-1 rounded border border-blue-200/60 text-slate-800">
                <span>Username: <strong className="text-blue-900">admin</strong></span>
                <span className="text-slate-300">|</span>
                <span>Password: <strong className="text-blue-900">admin123</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Access Denied</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2 text-xs text-emerald-700 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Security Status</span>
                <span>{successNotice}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        {/* Footer info: silent backend AI protection */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Protected by AI Incident Agent (Backend)</span>
          <button
            onClick={() => setShowDeveloperMailModal(true)}
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
            title="Inspect developer email inbox"
          >
            <Mail className="w-3 h-3" />
            <span>Developer Alerts {developerEmails.length > 0 && `(${developerEmails.length})`}</span>
          </button>
        </div>
      </div>

      {/* DEVELOPER MAIL INBOX INSPECTOR MODAL */}
      {showDeveloperMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Developer Alert Inbox</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Target: <span className="text-blue-400">{developerEmailAddress}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeveloperMailModal(false)}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-200">
                <p className="font-semibold text-blue-300">
                  Backend AI Security Agent Notification Flow:
                </p>
                <p className="text-[11px] text-blue-200/80 mt-1">
                  Information regarding wrong password entries does not display on the user login screen. Instead, the backend AI agent detects failures, analyzes risk, and dispatches detailed incident reports directly to the developer mail: <strong>{developerEmailAddress}</strong>.
                </p>
              </div>

              {developerEmails.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Mail className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p>No wrong password alerts dispatched yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Try entering a wrong password on the login form or use the Attack Simulator.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {developerEmails.map((email) => (
                    <div
                      key={email.id}
                      className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {email.risk} RISK
                            </span>
                            <h4 className="font-bold text-xs text-white">
                              {email.subject}
                            </h4>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-1 space-x-2">
                            <span>To: <strong>{email.to}</strong></span>
                            <span>•</span>
                            <span>Target: <strong className="text-slate-200">{email.username}</strong></span>
                            <span>•</span>
                            <span>Source IP: <strong className="text-rose-400">{email.sourceIp}</strong></span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap ml-2">
                          {new Date(email.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-slate-300 whitespace-pre-wrap text-[11px] leading-relaxed">
                        {email.body}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Incident: {email.incidentId}</span>
                        <span className="text-emerald-400 font-mono">
                          ✓ {email.deliveryStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Forgot Password</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In this cybersecurity demonstration sandbox, account passwords are validated on the backend. Use the provided demo credentials:
            </p>
            <div className="bg-slate-50 p-2.5 rounded font-mono text-xs text-slate-800 border border-slate-200">
              admin / admin123
            </div>
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
