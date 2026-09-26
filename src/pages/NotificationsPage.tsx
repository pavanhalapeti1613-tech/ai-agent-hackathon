import React, { useState } from 'react';
import {
  Bell,
  Mail,
  ShieldAlert,
  CheckCircle,
  XCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { NotificationItem } from '../types/security';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onConfirm: (incidentId: string, confirmedWasUser: boolean) => void;
  onOpenEmail: (notification: NotificationItem) => void;
  onSelectIncidentById: (incidentId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onConfirm,
  onOpenEmail,
  onSelectIncidentById,
}) => {
  const [filter, setFilter] = useState('All');

  const filtered = notifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Critical') return n.risk === 'CRITICAL';
    if (filter === 'High') return n.risk === 'HIGH';
    if (filter === 'Pending') return n.status === 'Pending';
    if (filter === 'Confirmed') return n.status === 'Confirmed';
    if (filter === 'Unauthorized') return n.status === 'Unauthorized';
    if (filter === 'Resolved') return n.status === 'Resolved';
    return true;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Security Notifications & Alerts
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Interactive alerts dispatched to legitimate account owners for verification
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Critical', 'High', 'Pending', 'Confirmed', 'Unauthorized', 'Resolved'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              {/* Alert Top Strip */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-bold text-xs uppercase tracking-wider text-rose-800">
                    SECURITY ALERT
                  </span>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => onSelectIncidentById(item.incidentId)}
                    className="font-mono text-xs text-blue-600 hover:underline flex items-center"
                  >
                    Incident: {item.incidentId}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <button
                    onClick={() => onOpenEmail(item)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    View Demo Email
                  </button>
                </div>
              </div>

              {/* Alert Content */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <h3 className="text-base font-bold text-slate-900">
                      Multiple login attempts detected
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our cybersecurity detection engine identified an unusual spike in repeated failed login attempts against your account.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block font-semibold">Account</span>
                        <span className="font-bold font-mono text-slate-900">{item.targetAccount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block font-semibold">Source IP</span>
                        <span className="font-bold font-mono text-slate-900">{item.sourceIp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block font-semibold">Failed Attempts</span>
                        <span className="font-bold font-mono text-rose-600">{item.failedAttempts}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block font-semibold">Assessed Risk</span>
                        <span className="font-bold font-mono text-rose-700">{item.risk}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactivity: Was this you? */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90 w-full md:w-72 shrink-0">
                    <p className="text-xs font-bold text-slate-900 text-center mb-3">
                      Was this you?
                    </p>

                    {item.status === 'Pending' ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => onConfirm(item.incidentId, true)}
                          className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-300 shadow-2xs"
                        >
                          YES, IT WAS ME
                        </button>
                        <button
                          onClick={() => onConfirm(item.incidentId, false)}
                          className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm shadow-rose-500/20"
                        >
                          NO, THIS WASN'T ME
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.status === 'Confirmed'
                            ? '✓ Confirmed as Authorized'
                            : '⚠ Reported as Unauthorized'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Response recorded in security audit logs
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No security notifications matching filter.
          </div>
        )}
      </div>
    </div>
  );
};
