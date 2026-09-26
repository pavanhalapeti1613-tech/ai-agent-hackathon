import React from 'react';
import { Bell, ShieldAlert, CheckCircle2, XCircle, Mail, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../types/security';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onConfirm: (incidentId: string, confirmedWasUser: boolean) => void;
  onOpenEmail: (item: NotificationItem) => void;
  onSelectIncidentById: (incidentId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onConfirm,
  onOpenEmail,
  onSelectIncidentById,
}) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <Bell className="w-6 h-6 mr-2.5 text-amber-500" />
          Security Notifications & Owner Confirmations
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Automated alerts dispatched to account owners to verify suspicious login velocity.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No notifications dispatched.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {notif.incidentId}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      notif.status === 'Pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                        : notif.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {notif.status}
                  </span>
                </div>

                {notif.status === 'Pending' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Was this you?</span>
                    <button
                      onClick={() => onConfirm(notif.incidentId, true)}
                      className="py-1 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      Yes, it was me
                    </button>
                    <button
                      onClick={() => onConfirm(notif.incidentId, false)}
                      className="py-1 px-3 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      No, not me (Unauthorized)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
