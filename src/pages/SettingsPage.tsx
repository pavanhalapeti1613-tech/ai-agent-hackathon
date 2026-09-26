import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  Sliders,
  Bell,
  Zap,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { SystemSettings } from '../types/security';

interface SettingsPageProps {
  settings: SystemSettings;
  onSaveSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormData({
      riskThresholds: {
        warning: 3,
        suspicious: 5,
        high: 10,
        critical: 15,
      },
      notificationChannels: {
        inApp: true,
        email: true,
        sms: false,
      },
      triggers: {
        notifyAtAttempts: 5,
        notifyOnCritical: true,
        notifyOnUnauthorized: true,
      },
      demoMode: true,
      ipBlockMode: 'simulation',
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Security Detection & Threshold Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Configure deterministic frequency thresholds, automated notification triggers, and defensive parameters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Risk Thresholds Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Risk Level Thresholds (Failed Attempt Count)
                </h3>
                <p className="text-xs text-slate-500">
                  Deterministic thresholds used by Python frequency engine to categorize threat tier
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-200/80">
              <label className="block text-xs font-bold text-yellow-900 mb-1">
                WARNING
              </label>
              <span className="text-[10px] text-yellow-700 block mb-2">
                Default: 3 attempts
              </span>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.riskThresholds.warning}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: {
                      ...formData.riskThresholds,
                      warning: parseInt(e.target.value, 10) || 1,
                    },
                  })
                }
                className="w-full text-sm font-mono font-bold bg-white border border-yellow-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/80">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                SUSPICIOUS
              </label>
              <span className="text-[10px] text-amber-700 block mb-2">
                Default: 5 attempts
              </span>
              <input
                type="number"
                min={1}
                max={30}
                value={formData.riskThresholds.suspicious}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: {
                      ...formData.riskThresholds,
                      suspicious: parseInt(e.target.value, 10) || 1,
                    },
                  })
                }
                className="w-full text-sm font-mono font-bold bg-white border border-amber-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-red-50/50 rounded-lg border border-red-200/80">
              <label className="block text-xs font-bold text-red-900 mb-1">
                HIGH
              </label>
              <span className="text-[10px] text-red-700 block mb-2">
                Default: 10 attempts
              </span>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.riskThresholds.high}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: {
                      ...formData.riskThresholds,
                      high: parseInt(e.target.value, 10) || 1,
                    },
                  })
                }
                className="w-full text-sm font-mono font-bold bg-white border border-red-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200/80">
              <label className="block text-xs font-bold text-rose-900 mb-1">
                CRITICAL
              </label>
              <span className="text-[10px] text-rose-700 block mb-2">
                Default: 15+ attempts
              </span>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.riskThresholds.critical}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: {
                      ...formData.riskThresholds,
                      critical: parseInt(e.target.value, 10) || 1,
                    },
                  })
                }
                className="w-full text-sm font-mono font-bold bg-white border border-rose-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Channels & Triggers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Security Alert Triggers & Channels
              </h3>
              <p className="text-xs text-slate-500">
                Conditions for dispatching verification questions to account owners
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Channels */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Delivery Channels
              </h4>
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notificationChannels.inApp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationChannels: {
                        ...formData.notificationChannels,
                        inApp: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-slate-800 font-medium">In-App Notification Center</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notificationChannels.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationChannels: {
                        ...formData.notificationChannels,
                        email: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-slate-800 font-medium">
                  Email Dispatch (Demo Email Mode / SMTP)
                </span>
              </label>

              <label className="flex items-center space-x-2.5 opacity-60 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  checked={formData.notificationChannels.sms}
                  className="w-4 h-4 text-slate-400 rounded border-slate-300"
                />
                <span className="text-slate-500">SMS Gateway (Enterprise Addon Placeholder)</span>
              </label>
            </div>

            {/* Triggers */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Automated Triggers
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Dispatch alert at failed attempts:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.triggers.notifyAtAttempts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggers: {
                        ...formData.triggers,
                        notifyAtAttempts: parseInt(e.target.value, 10) || 5,
                      },
                    })
                  }
                  className="w-16 font-mono text-center border border-slate-300 rounded px-2 py-1"
                />
              </div>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.triggers.notifyOnCritical}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggers: {
                        ...formData.triggers,
                        notifyOnCritical: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-slate-800">Trigger on Critical Risk Tier</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.triggers.notifyOnUnauthorized}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggers: {
                        ...formData.triggers,
                        notifyOnUnauthorized: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-slate-800">Escalate immediately when user confirms unauthorized</span>
              </label>
            </div>
          </div>
        </div>

        {/* IP Block Mode Warning */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-slate-600" />
            <div>
              <span className="font-bold text-slate-800 block">IP Block Engine Mode</span>
              <span className="text-slate-500">
                IP_BLOCK_MODE is locked to <strong>simulation</strong> for host environment protection.
              </span>
            </div>
          </div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
            SIMULATION ONLY
          </span>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center animate-in fade-in">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Settings updated in PostgreSQL database!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
