export type RiskLevel = 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'Detected'
  | 'Investigating'
  | 'Awaiting User Confirmation'
  | 'User Confirmed'
  | 'Unauthorized'
  | 'Awaiting Admin Approval'
  | 'Blocked'
  | 'Verified'
  | 'Resolved'
  | 'Rejected';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  mfaStatus?: string;
  mfaEnabled?: boolean;
}

export interface LoginAttempt {
  id: string;
  username: string;
  timestamp: string;
  sourceIp: string;
  loginStatus: 'Success' | 'Failed';
  userAgent: string;
  isSynthetic?: boolean;
}

export interface FrequencyMetric {
  sourceIp: string;
  failedAttempts: number;
  last1m: number;
  last5m: number;
  last15m: number;
  averageFrequency: number;
  timeSpanMinutes: number;
  targetAccount: string;
  firstDetected: string;
  lastDetected: string;
  riskLevel: RiskLevel;
}

export interface SecurityIncident {
  id: string;
  detection: string;
  sourceIp: string;
  targetAccount: string;
  failedAttempts: number;
  detectionWindow: string;
  frequency: number;
  risk: RiskLevel;
  evidence: string;
  userConfirmation: 'Pending' | 'Authorized' | 'Unauthorized';
  recommendedAction: string;
  adminDecision: 'Pending' | 'Approved' | 'Rejected';
  actionResult: string;
  verification: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  checkpointId?: string;
  agentNotes?: string;
}

export interface NotificationItem {
  id: string;
  incidentId: string;
  title: string;
  message: string;
  targetAccount: string;
  sourceIp: string;
  failedAttempts: number;
  risk: RiskLevel;
  status: 'Pending' | 'Confirmed' | 'Unauthorized' | 'Resolved';
  timestamp: string;
  emailSubject?: string;
  emailBody?: string;
}

export interface BlockedIpRecord {
  id: string;
  ip: string;
  reason: string;
  failedAttempts: number;
  risk: string;
  blockedAt: string;
  status: 'Blocked' | 'Unblocked';
  incidentId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'AI_DETECTION'
    | 'INCIDENT_CREATED'
    | 'USER_NOTIFIED'
    | 'USER_CONFIRMED'
    | 'USER_REPORTED_UNAUTHORIZED'
    | 'ADMIN_APPROVAL'
    | 'ADMIN_REJECTED'
    | 'IP_BLOCKED_SIMULATION'
    | 'VERIFICATION_SUCCESS'
    | 'INCIDENT_RESOLVED'
    | 'IP_UNBLOCKED';
  account: string;
  ip: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'INFO';
  actor: 'System' | 'AI Agent' | 'Account Owner' | 'Administrator';
  incidentId?: string;
  details?: string;
}

export interface SystemSettings {
  riskThresholds: {
    warning: number;
    suspicious: number;
    high: number;
    critical: number;
  };
  notificationChannels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  triggers: {
    notifyAtAttempts: number;
    notifyOnCritical: boolean;
    notifyOnUnauthorized: boolean;
  };
  demoMode: boolean;
  ipBlockMode: 'simulation' | 'active';
}

export interface DashboardStats {
  totalAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  suspiciousAttempts: number;
  activeIncidents: number;
  blockedIps: number;
  trueforgeUrl: string;
  hasGeminiKey: boolean;
}

export interface AgentState {
  harness: string;
  status:
    | 'Monitoring'
    | 'Investigating'
    | 'Waiting for User'
    | 'Waiting for Admin'
    | 'Executing'
    | 'Verifying'
    | 'Resolved';
  lastEventTime: string;
  currentIncidentId: string | null;
  activeCheckpoint: {
    checkpointId: string;
    action: string;
    targetIp: string;
    requestedAt: string;
    details: string;
  } | null;
  recentActivity: Array<{
    step: string;
    details: string;
    timestamp: string;
  }>;
}
