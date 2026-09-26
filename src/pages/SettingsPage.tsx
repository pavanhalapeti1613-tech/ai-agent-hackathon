import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, CheckCircle2 } from 'lucide-react';
import { SystemSettings } from '../types/security';

interface SettingsPageProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <Settings className="w-6 h-6 mr-2.5 text-blue-600" />
          System Security & AI Agent Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure risk calculation thresholds, notification triggers, and defense modes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Risk Thresholds */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Deterministic Risk Thresholds (Failed Logins)</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Warning</label>
              <input
                type="number"
                value={formData.riskThresholds.warning}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: { ...formData.riskThresholds, warning: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Suspicious</label>
              <input
                type="number"
                value={formData.riskThresholds.suspicious}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: { ...formData.riskThresholds, suspicious: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">High</label>
              <input
                type="number"
                value={formData.riskThresholds.high}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: { ...formData.riskThresholds, high: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Critical</label>
              <input
                type="number"
                value={formData.riskThresholds.critical}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskThresholds: { ...formData.riskThresholds, critical: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Notification Channels</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notificationChannels.inApp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: { ...formData.notificationChannels, inApp: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-slate-700 font-medium">In-App Notification Center</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notificationChannels.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: { ...formData.notificationChannels, email: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-slate-700 font-medium">Email Dispatch (Account Owner & Developer)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-600 flex items-center font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
              Settings updated successfully!
            </span>
          )}
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm ml-auto flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
