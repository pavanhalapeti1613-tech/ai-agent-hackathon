import {
  DashboardStats,
  LoginAttempt,
  FrequencyMetric,
  SecurityIncident,
  NotificationItem,
  BlockedIpRecord,
  AuditLog,
  SystemSettings,
  AgentState,
} from '../types/security';

const API_BASE = '/api';

export const api = {
  // Auth
  login: async (username: string, password: string, sourceIp?: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, sourceIp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    return data;
  },

  logout: async () => {
    const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    return res.json();
  },

  // Dashboard
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  getActivity: async () => {
    const res = await fetch(`${API_BASE}/dashboard/activity`);
    if (!res.ok) throw new Error('Failed to fetch activity');
    return res.json();
  },

  // Login Attempts
  getLoginAttempts: async (): Promise<{
    attempts: LoginAttempt[];
    frequencyAnalysis: FrequencyMetric[];
  }> => {
    const res = await fetch(`${API_BASE}/login-attempts`);
    if (!res.ok) throw new Error('Failed to fetch login attempts');
    return res.json();
  },

  // AI Security Analysis
  analyzeActivity: async (sourceIp?: string, targetAccount?: string) => {
    const res = await fetch(`${API_BASE}/security/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceIp, targetAccount }),
    });
    if (!res.ok) throw new Error('Failed to run AI security analysis');
    return res.json();
  },

  // Incidents
  getIncidents: async (): Promise<SecurityIncident[]> => {
    const res = await fetch(`${API_BASE}/security/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  getIncident: async (id: string): Promise<SecurityIncident> => {
    const res = await fetch(`${API_BASE}/security/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  },

  notifyIncident: async (id: string) => {
    const res = await fetch(`${API_BASE}/security/incidents/${id}/notify`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to dispatch notification');
    return res.json();
  },

  confirmIncident: async (id: string, confirmedWasUser: boolean) => {
    const res = await fetch(`${API_BASE}/security/incidents/${id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedWasUser }),
    });
    if (!res.ok) throw new Error('Failed to submit user confirmation');
    return res.json();
  },

  approveBlock: async (id: string) => {
    const res = await fetch(`${API_BASE}/security/incidents/${id}/approve-block`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to approve block');
    return res.json();
  },

  rejectBlock: async (id: string) => {
    const res = await fetch(`${API_BASE}/security/incidents/${id}/reject`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reject incident action');
    return res.json();
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  // Blocked IPs
  getBlockedIps: async (): Promise<BlockedIpRecord[]> => {
    const res = await fetch(`${API_BASE}/blocked-ips`);
    if (!res.ok) throw new Error('Failed to fetch blocked IPs');
    return res.json();
  },

  unblockIp: async (ip: string) => {
    const res = await fetch(`${API_BASE}/blocked-ips/${encodeURIComponent(ip)}/unblock`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to unblock IP');
    return res.json();
  },

  // Logs
  getLogs: async (): Promise<AuditLog[]> => {
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Settings
  getSettings: async (): Promise<SystemSettings> => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  updateSettings: async (settings: Partial<SystemSettings>) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Profile
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  updateProfile: async (data: any) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Demo Simulation Actions
  simulateLoginAttempts: async (count: number = 1, sourceIp = '192.168.1.45', username = 'admin') => {
    const res = await fetch(`${API_BASE}/demo/simulate-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, sourceIp, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to simulate login attempt');
    return data;
  },

  startAttackScenario: async () => {
    const res = await fetch(`${API_BASE}/demo/start-attack`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start complete attack scenario');
    return res.json();
  },

  resetDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo');
    return res.json();
  },

  // Agent Status
  getAgentStatus: async (): Promise<{
    agentState: AgentState;
    trueforgeUrl: string;
    hasGeminiKey: boolean;
    deterministicEngineActive: boolean;
    mcpToolsLoaded: string[];
  }> => {
    const res = await fetch(`${API_BASE}/agent/status`);
    if (!res.ok) throw new Error('Failed to fetch agent status');
    return res.json();
  },

  // Developer Alert Emails
  getDeveloperEmails: async () => {
    const res = await fetch(`${API_BASE}/developer/emails`);
    if (!res.ok) throw new Error('Failed to fetch developer emails');
    return res.json();
  },
};
