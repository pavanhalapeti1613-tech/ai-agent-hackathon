import React, { useState } from 'react';
import { UserCheck, Mail, Phone, Shield, Save, CheckCircle2 } from 'lucide-react';
import { User } from '../types/security';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (data: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile }) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <UserCheck className="w-6 h-6 mr-2.5 text-blue-600" />
          SOC Administrator Profile
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, emergency notification channels, and security settings.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Username</label>
            <input
              type="text"
              disabled
              value={user.username}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Role / Permissions</label>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 font-semibold rounded border border-blue-200">
              {user.role || 'Lead Security Administrator'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saved && (
              <span className="text-xs text-emerald-600 flex items-center font-medium">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                Profile updated successfully!
              </span>
            )}
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm ml-auto flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
