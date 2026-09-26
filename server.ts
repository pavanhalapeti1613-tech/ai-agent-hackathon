import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL || 'pavanhalapeti75@gmail.com';

// Configure mail transporter (reads environment variables, falling back to configured settings)
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: (process.env.SMTP_SECURE === 'true') || (process.env.SMTP_PORT === '465') || true,
  auth: {
    user: process.env.SMTP_USERNAME || 'pavanhalapeti75@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'pavan12345',
  },
};

let mailTransporter: any = null;
const effectiveSmtpUser = process.env.SMTP_USERNAME || 'pavanhalapeti75@gmail.com';
const effectiveSmtpPass = process.env.SMTP_PASSWORD || 'pavan12345';

if (effectiveSmtpUser && effectiveSmtpPass) {
  try {
    mailTransporter = nodemailer.createTransport(smtpConfig);
  } catch (err) {
    console.warn('Mail transporter initialization warning:', err);
  }
}

// Memory record of developer security alert emails sent
interface DeveloperEmailRecord {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
  incidentId: string;
  sourceIp: string;
  username: string;
  failedAttempts: number;
  risk: string;
  frequency: number;
  body: string;
  htmlBody: string;
  deliveryStatus: string;
}

const sentDeveloperEmails: DeveloperEmailRecord[] = [];

async function sendDeveloperSecurityAlert(emailData: {
  incidentId: string;
  sourceIp: string;
  username: string;
  failedAttempts: number;
  risk: string;
  frequency: number;
  evidence: string;
  detectionWindow: string;
}) {
  const subject = `[CRITICAL SECURITY ALERT] Wrong Password & Brute-Force Detected: ${emailData.username} (${emailData.failedAttempts} attempts)`;
  
  const textBody = `DIGITAL DEFENDERS - AI SECURITY INCIDENT ALERT
Recipient: Developer / SOC Team (${DEVELOPER_EMAIL})
Timestamp: ${new Date().toISOString()}

--------------------------------------------------
INCIDENT SUMMARY
--------------------------------------------------
Incident ID: ${emailData.incidentId}
Target Account: ${emailData.username}
Suspicious Source IP: ${emailData.sourceIp}
Failed Password Attempts: ${emailData.failedAttempts}
Attack Frequency: ${emailData.frequency} attempts/minute
Detection Window: ${emailData.detectionWindow}
Calculated Risk Level: ${emailData.risk}

--------------------------------------------------
AI AGENT INVESTIGATION & FINDINGS
--------------------------------------------------
${emailData.evidence}

--------------------------------------------------
RECOMMENDED ACTION & MITIGATION
--------------------------------------------------
The AI Agent identified repeated incorrect password entries.
Status: Paused at TrueForge Human Approval Checkpoint / Awaiting Admin Mitigation.
Simulated IP Block for ${emailData.sourceIp} is recommended.

Notice: This security incident has been processed silently in the backend to prevent attacker reconnaissance.
`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #334155;">
      <div style="display: flex; align-items: center; border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #ef4444; font-size: 20px;">🚨 Digital Defenders Security Alert</h2>
      </div>
      <p style="font-size: 14px; color: #94a3b8;">
        An automated security alert was dispatched by the <strong>Digital Defenders AI Incident Response Agent</strong>.
      </p>
      <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Incident ID:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #38bdf8;">${emailData.incidentId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Target Account:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${emailData.username}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Source IP:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #f87171;">${emailData.sourceIp}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Failed Passwords:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ef4444;">${emailData.failedAttempts} attempts</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Calculated Risk:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #f43f5e;">${emailData.risk}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Frequency:</td>
            <td style="padding: 6px 0; color: #ffffff;">${emailData.frequency} attempts/minute</td>
          </tr>
        </table>
      </div>
      <div style="background: #111827; padding: 14px; border-left: 4px solid #38bdf8; border-radius: 4px; margin: 16px 0; font-size: 13px;">
        <strong style="color: #38bdf8; display: block; margin-bottom: 6px;">AI Agent Findings:</strong>
        <p style="margin: 0; color: #cbd5e1; line-height: 1.5;">${emailData.evidence}</p>
      </div>
      <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
        Dispatched automatically to developer at <strong>${DEVELOPER_EMAIL}</strong>.
      </p>
    </div>
  `;

  let deliveryStatus = mailTransporter
    ? `Delivered via configured SMTP to ${DEVELOPER_EMAIL}`
    : `Logged in Developer Alerts Inbox (SMTP credentials not configured in environment)`;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: '"Digital Defenders AI Agent" <security@digitaldefenders.sec>',
        to: DEVELOPER_EMAIL,
        subject,
        text: textBody,
        html: htmlBody,
      });
      deliveryStatus = `Successfully sent via SMTP to ${DEVELOPER_EMAIL}`;
    } catch (mailErr: any) {
      console.warn('SMTP delivery attempt error:', mailErr?.message);
      deliveryStatus = `Captured in Developer Inbox (SMTP failed: ${mailErr?.message})`;
    }
  }

  const emailRecord: DeveloperEmailRecord = {
    id: `MAIL-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    to: DEVELOPER_EMAIL,
    subject,
    timestamp: new Date().toISOString(),
    incidentId: emailData.incidentId,
    sourceIp: emailData.sourceIp,
    username: emailData.username,
    failedAttempts: emailData.failedAttempts,
    risk: emailData.risk,
    frequency: emailData.frequency,
    body: textBody,
    htmlBody,
    deliveryStatus,
  };

  sentDeveloperEmails.unshift(emailRecord);
  console.log(`\n======================================================`);
  console.log(`[AI AGENT EMAIL DISPATCHED TO DEVELOPER: ${DEVELOPER_EMAIL}]`);
  console.log(`Subject: ${subject}`);
  console.log(`Target: ${emailData.username} | IP: ${emailData.sourceIp} | Attempts: ${emailData.failedAttempts}`);
  console.log(`======================================================\n`);

  return emailRecord;
}

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const TRUEFORGE_URL = process.env.TRUEFORGE_URL || 'http://localhost:8790';

// ----------------------------------------------------
// DATABASE & MODELS (Deterministic PostgreSQL-equivalent Schema)
// ----------------------------------------------------
interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  mfaEnabled: boolean;
  notificationPreferences: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
}

interface LoginAttempt {
  id: string;
  username: string;
  timestamp: string; // ISO string
  sourceIp: string;
  loginStatus: 'Success' | 'Failed';
  userAgent: string;
  isSynthetic?: boolean;
}

interface SecurityIncident {
  id: string;
  detection: string;
  sourceIp: string;
  targetAccount: string;
  failedAttempts: number;
  detectionWindow: string; // e.g. "8 minutes"
  frequency: number; // attempts / min
  risk: 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';
  evidence: string;
  userConfirmation: 'Pending' | 'Authorized' | 'Unauthorized';
  recommendedAction: string;
  adminDecision: 'Pending' | 'Approved' | 'Rejected';
  actionResult: string;
  verification: string;
  status:
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
  createdAt: string;
  updatedAt: string;
  checkpointId?: string;
  agentNotes?: string;
}

interface NotificationItem {
  id: string;
  incidentId: string;
  title: string;
  message: string;
  targetAccount: string;
  sourceIp: string;
  failedAttempts: number;
  risk: 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';
  status: 'Pending' | 'Confirmed' | 'Unauthorized' | 'Resolved';
  timestamp: string;
  emailSubject?: string;
  emailBody?: string;
}

interface BlockedIpRecord {
  id: string;
  ip: string;
  reason: string;
  failedAttempts: number;
  risk: string;
  blockedAt: string;
  status: 'Blocked' | 'Unblocked';
  incidentId: string;
}

interface AuditLog {
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

interface SystemSettings {
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

// Password hashing utilities using standard node:crypto
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.scryptSync(password, salt, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(hash, 'hex'));
}

// In-Memory Database store with pre-seeded demo records
const adminSalt = crypto.randomBytes(16).toString('hex');
const users: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    passwordHash: hashPassword('admin123', adminSalt),
    salt: adminSalt,
    name: 'Alex Rivera',
    email: 'alex.rivera@digitaldefenders.sec',
    phone: '+1 (555) 234-5678',
    role: 'Lead SOC Security Analyst',
    mfaEnabled: true,
    notificationPreferences: {
      inApp: true,
      email: true,
      sms: false,
    },
  },
];

let settings: SystemSettings = {
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
};

let loginAttempts: LoginAttempt[] = [];
let incidents: SecurityIncident[] = [];
let notifications: NotificationItem[] = [];
let blockedIps: BlockedIpRecord[] = [];
let auditLogs: AuditLog[] = [];

// Track Active Agent Harness State
let agentState = {
  harness: 'TrueForge Agent Harness',
  status: 'Monitoring' as
    | 'Monitoring'
    | 'Investigating'
    | 'Waiting for User'
    | 'Waiting for Admin'
    | 'Executing'
    | 'Verifying'
    | 'Resolved',
  lastEventTime: new Date().toISOString(),
  currentIncidentId: null as string | null,
  activeCheckpoint: null as {
    checkpointId: string;
    action: string;
    targetIp: string;
    requestedAt: string;
    details: string;
  } | null,
  recentActivity: [
    {
      step: 'Service Initialization',
      details: 'Deterministic Detection Engine & TrueForge MCP Security Tools active',
      timestamp: new Date().toISOString(),
    },
  ],
};

function logAudit(
  eventType: AuditLog['eventType'],
  account: string,
  ip: string,
  action: string,
  status: AuditLog['status'],
  actor: AuditLog['actor'],
  incidentId?: string,
  details?: string
) {
  const item: AuditLog = {
    id: `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    eventType,
    account,
    ip,
    action,
    status,
    actor,
    incidentId,
    details,
  };
  auditLogs.unshift(item);
  return item;
}

// Seed baseline logs
logAudit(
  'SYSTEM_INIT' as any,
  'system',
  '127.0.0.1',
  'Security Subsystem Initialized',
  'INFO',
  'System',
  undefined,
  'Digital Defenders Core Security Agent is now monitoring authentication events'
);

// ----------------------------------------------------
// DETERMINISTIC DETECTION & FREQUENCY ENGINE
// ----------------------------------------------------
export function calculateIpMetrics(sourceIp: string) {
  const now = Date.now();
  const oneMinAgo = now - 60 * 1000;
  const fiveMinAgo = now - 5 * 60 * 1000;
  const fifteenMinAgo = now - 15 * 60 * 1000;

  const ipAttempts = loginAttempts.filter(
    (a) => a.sourceIp === sourceIp && a.loginStatus === 'Failed'
  );

  const failedCount = ipAttempts.length;
  const last1m = ipAttempts.filter((a) => new Date(a.timestamp).getTime() >= oneMinAgo).length;
  const last5m = ipAttempts.filter((a) => new Date(a.timestamp).getTime() >= fiveMinAgo).length;
  const last15m = ipAttempts.filter((a) => new Date(a.timestamp).getTime() >= fifteenMinAgo).length;

  // Time window in minutes
  let timeSpanMinutes = 1;
  let firstDetected = new Date().toISOString();
  let lastDetected = new Date().toISOString();
  let targetAccount = 'admin';

  if (ipAttempts.length > 0) {
    const timestamps = ipAttempts.map((a) => new Date(a.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    firstDetected = new Date(minTime).toISOString();
    lastDetected = new Date(maxTime).toISOString();
    timeSpanMinutes = Math.max(1, Math.round((maxTime - minTime) / (60 * 1000)) || 1);
    targetAccount = ipAttempts[ipAttempts.length - 1].username;
  }

  // Frequency: attempts per minute over window
  const avgFrequency = Number((failedCount / Math.max(1, timeSpanMinutes)).toFixed(1));

  // Determine Risk level deterministically based on thresholds
  let riskLevel: 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL' = 'NORMAL';
  if (failedCount >= settings.riskThresholds.critical) {
    riskLevel = 'CRITICAL';
  } else if (failedCount >= settings.riskThresholds.high) {
    riskLevel = 'HIGH';
  } else if (failedCount >= settings.riskThresholds.suspicious) {
    riskLevel = 'SUSPICIOUS';
  } else if (failedCount >= settings.riskThresholds.warning) {
    riskLevel = 'WARNING';
  }

  return {
    sourceIp,
    failedAttempts: failedCount,
    last1m,
    last5m,
    last15m,
    averageFrequency: avgFrequency,
    timeSpanMinutes,
    targetAccount,
    firstDetected,
    lastDetected,
    riskLevel,
  };
}

// ----------------------------------------------------
// MCP SECURITY TOOLS IMPLEMENTATION
// ----------------------------------------------------
export const mcpSecurityTools = {
  get_recent_login_attempts: async (limit: number = 20) => {
    return loginAttempts.slice(-limit).reverse();
  },
  get_login_attempts_by_ip: async (ip: string) => {
    return loginAttempts.filter((a) => a.sourceIp === ip);
  },
  get_account_login_history: async (username: string) => {
    return loginAttempts.filter((a) => a.username.toLowerCase() === username.toLowerCase());
  },
  calculate_login_frequency: async (ip: string) => {
    return calculateIpMetrics(ip);
  },
  analyze_login_pattern: async (ip: string) => {
    const metrics = calculateIpMetrics(ip);
    const isBlocked = blockedIps.some((b) => b.ip === ip && b.status === 'Blocked');
    return {
      ...metrics,
      isBlocked,
      pattern: metrics.averageFrequency > 2 ? 'Automated High-Frequency Brute-Force' : 'Intermittent dictionary attack',
    };
  },
  get_security_settings: async () => {
    return settings;
  },
  create_incident: async (data: Partial<SecurityIncident>) => {
    const incId = `INC-${String(incidents.length + 1).padStart(4, '0')}`;
    const newIncident: SecurityIncident = {
      id: incId,
      detection: data.detection || 'Possible Brute-Force Attack',
      sourceIp: data.sourceIp || '192.168.1.45',
      targetAccount: data.targetAccount || 'admin',
      failedAttempts: data.failedAttempts || 0,
      detectionWindow: data.detectionWindow || '8 minutes',
      frequency: data.frequency || 0,
      risk: data.risk || 'CRITICAL',
      evidence: data.evidence || `${data.failedAttempts} failed login attempts recorded from ${data.sourceIp}.`,
      userConfirmation: 'Pending',
      recommendedAction: 'Block Source IP',
      adminDecision: 'Pending',
      actionResult: 'None yet',
      verification: 'Pending verification',
      status: 'Awaiting User Confirmation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agentNotes: data.agentNotes || 'Investigated by Digital Defenders Security Agent via TrueForge Harness',
    };
    incidents.unshift(newIncident);
    logAudit(
      'INCIDENT_CREATED',
      newIncident.targetAccount,
      newIncident.sourceIp,
      `Incident ${newIncident.id} created`,
      'WARNING',
      'AI Agent',
      newIncident.id,
      `Risk: ${newIncident.risk}, Frequency: ${newIncident.frequency} attempts/min`
    );
    return newIncident;
  },
  get_incident: async (id: string) => {
    return incidents.find((i) => i.id === id);
  },
  send_security_notification: async (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error('Incident not found');

    const notificationId = `NOTIF-${Date.now().toString(36)}`;
    const subject = 'Security Alert – Multiple Login Attempts Detected';
    const emailBody = `SECURITY ALERT\n\nMultiple login attempts detected on your account.\n\nAccount: ${incident.targetAccount}\nFailed Attempts: ${incident.failedAttempts}\nSource IP: ${incident.sourceIp}\nRisk: ${incident.risk}\nDetection Window: ${incident.detectionWindow}\nFrequency: ${incident.frequency} attempts/minute\n\nSecurity Recommendation:\nIf this was not you, our AI agent recommends immediate defensive blocking of this source IP.\n\nWas this you? Please confirm in the Digital Defenders Security Portal.`;

    const item: NotificationItem = {
      id: notificationId,
      incidentId: incident.id,
      title: 'Security Alert: Multiple Failed Logins',
      message: `Multiple failed login attempts (${incident.failedAttempts}) detected for ${incident.targetAccount} from IP ${incident.sourceIp}.`,
      targetAccount: incident.targetAccount,
      sourceIp: incident.sourceIp,
      failedAttempts: incident.failedAttempts,
      risk: incident.risk,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      emailSubject: subject,
      emailBody: emailBody,
    };
    notifications.unshift(item);
    logAudit(
      'USER_NOTIFIED',
      incident.targetAccount,
      incident.sourceIp,
      `Security notification dispatched for ${incident.id}`,
      'INFO',
      'AI Agent',
      incident.id,
      'Delivered to in-app notification center and demo email dispatch'
    );
    return item;
  },
  record_user_confirmation: async (incidentId: string, confirmedWasUser: boolean) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error('Incident not found');

    if (confirmedWasUser) {
      incident.userConfirmation = 'Authorized';
      incident.status = 'User Confirmed';
      incident.recommendedAction = 'Continue Monitoring';
      incident.updatedAt = new Date().toISOString();
      logAudit(
        'USER_CONFIRMED',
        incident.targetAccount,
        incident.sourceIp,
        'User confirmed activity was legitimate',
        'SUCCESS',
        'Account Owner',
        incident.id
      );
    } else {
      incident.userConfirmation = 'Unauthorized';
      incident.status = 'Awaiting Admin Approval';
      incident.recommendedAction = 'Temporarily block suspicious IP (Simulated)';
      incident.updatedAt = new Date().toISOString();
      logAudit(
        'USER_REPORTED_UNAUTHORIZED',
        incident.targetAccount,
        incident.sourceIp,
        'User confirmed activity was UNAUTHORIZED. Incident escalated.',
        'WARNING',
        'Account Owner',
        incident.id,
        'AI Agent recommends immediate source IP mitigation awaiting Admin approval checkpoint'
      );
    }
    return incident;
  },
  recommend_response: async (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error('Incident not found');
    return {
      incidentId: incident.id,
      risk: incident.risk,
      recommendedAction: 'Temporarily block suspicious IP',
      additionalRecommendations: [
        'Rate limit login attempts for account',
        'Require password reset',
        'Require Multi-Factor Authentication (MFA)',
        'Review recent account activity audit logs',
      ],
      requiresAdminApproval: true,
    };
  },
  request_admin_approval: async (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error('Incident not found');

    const checkpointId = `CHK-${Date.now().toString(36)}`;
    incident.checkpointId = checkpointId;
    incident.status = 'Awaiting Admin Approval';
    incident.updatedAt = new Date().toISOString();

    agentState.status = 'Waiting for Admin';
    agentState.activeCheckpoint = {
      checkpointId,
      action: 'Simulated IP Block',
      targetIp: incident.sourceIp,
      requestedAt: new Date().toISOString(),
      details: `Block IP ${incident.sourceIp} due to ${incident.failedAttempts} repeated failed logins targeting account ${incident.targetAccount}`,
    };

    return agentState.activeCheckpoint;
  },
  simulate_block_ip: async (ip: string, incidentId: string, reason: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    const existing = blockedIps.find((b) => b.ip === ip && b.status === 'Blocked');
    if (existing) {
      return existing;
    }

    const blockedRecord: BlockedIpRecord = {
      id: `BLK-${Date.now().toString(36)}`,
      ip,
      reason: reason || 'Repeated login failures (Simulated firewall block)',
      failedAttempts: incident ? incident.failedAttempts : 17,
      risk: incident ? incident.risk : 'CRITICAL',
      blockedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Blocked',
      incidentId,
    };
    blockedIps.unshift(blockedRecord);

    logAudit(
      'IP_BLOCKED_SIMULATION',
      incident ? incident.targetAccount : 'admin',
      ip,
      `Simulated IP Block applied for ${ip}`,
      'SUCCESS',
      'AI Agent',
      incidentId,
      'IP added to simulated defense blacklist. Real firewall untouched.'
    );
    return blockedRecord;
  },
  verify_ip_block: async (ip: string, incidentId: string) => {
    const isRecordInDb = blockedIps.some((b) => b.ip === ip && b.status === 'Blocked');
    const incident = incidents.find((i) => i.id === incidentId);

    const verificationChecks = {
      ipBlockConfirmedInDatabase: isRecordInDb,
      newDemoAttemptsPrevented: isRecordInDb,
      incidentEvidenceUpdated: true,
      timestamp: new Date().toISOString(),
    };

    if (isRecordInDb && incident) {
      incident.verification = '✓ IP block confirmed in database\n✓ New demo attempts prevented\n✓ Incident evidence updated\n✓ Incident resolved';
      incident.status = 'Resolved';
      incident.actionResult = `IP ${ip} successfully blocked in simulation database`;
      incident.updatedAt = new Date().toISOString();

      logAudit(
        'VERIFICATION_SUCCESS',
        incident.targetAccount,
        ip,
        `Verification succeeded for ${ip}`,
        'SUCCESS',
        'AI Agent',
        incident.id,
        'Database verified: simulated IP block active, zero new unauthorized ingress permitted'
      );
      logAudit(
        'INCIDENT_RESOLVED',
        incident.targetAccount,
        ip,
        `Incident ${incident.id} marked RESOLVED`,
        'SUCCESS',
        'AI Agent',
        incident.id
      );

      agentState.status = 'Resolved';
      agentState.activeCheckpoint = null;
    }

    return verificationChecks;
  },
  get_blocked_ips: async () => {
    return blockedIps.filter((b) => b.status === 'Blocked');
  },
  write_audit_log: async (
    eventType: AuditLog['eventType'],
    account: string,
    ip: string,
    action: string,
    status: AuditLog['status'],
    actor: AuditLog['actor'],
    incidentId?: string,
    details?: string
  ) => {
    return logAudit(eventType, account, ip, action, status, actor, incidentId, details);
  },
};

// Rate-limiting and caching state for Gemini API calls to prevent 429 Quota Exceeded errors
let lastGeminiCallTime = 0;
let geminiCooldownUntil = 0;
const geminiAnalysisCache = new Map<string, { findings: string; timestamp: number }>();

// ----------------------------------------------------
// TRUEFORGE AGENT HARNESS CLIENT & GEMINI REASONING
// ----------------------------------------------------
async function runTrueForgeInvestigation(sourceIp: string, targetAccount: string) {
  agentState.status = 'Investigating';
  const metrics = calculateIpMetrics(sourceIp);

  let reasoningFindings = '';
  let trueForgeConnected = false;

  // 1. Attempt TrueForge Agent Harness dispatch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const tfRes = await fetch(`${TRUEFORGE_URL}/api/v1/agents/digital-defenders/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceIp,
        targetAccount,
        metrics,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (tfRes.ok) {
      const data = await tfRes.json();
      trueForgeConnected = true;
      reasoningFindings = data.findings || 'TrueForge agent analyzed correlated brute-force authentication sequence.';
    }
  } catch (err) {
    // TrueForge server not listening on TRUEFORGE_URL
    trueForgeConnected = false;
  }

  // 2. Check in-memory cache for recent analysis (valid for 60 seconds for same IP and attempt range)
  const cacheKey = `${sourceIp}-${targetAccount}-${metrics.riskLevel}`;
  const cached = geminiAnalysisCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < 60000) {
    reasoningFindings = cached.findings;
  }

  // 3. If Gemini is available and not in cooldown, use it for reasoning synthesis
  if (!trueForgeConnected && !reasoningFindings && ai && now > geminiCooldownUntil) {
    // Enforce at least 3 seconds between successive Gemini calls to respect free tier RPM limits
    if (now - lastGeminiCallTime < 3000) {
      // Use deterministic reasoning to prevent hitting rate limits
      reasoningFindings = `${metrics.failedAttempts} failed login attempts recorded from ${sourceIp} targeting account '${targetAccount}' within ${metrics.timeSpanMinutes} minute(s) (${metrics.averageFrequency} attempts/min). Velocity pattern indicates active credential testing.`;
    } else {
      try {
        lastGeminiCallTime = Date.now();
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are the Digital Defenders Security Agent. Analyze the following authentication incident:
Source IP: ${sourceIp}
Target Account: ${targetAccount}
Failed Attempts: ${metrics.failedAttempts}
Detection Window: ${metrics.timeSpanMinutes} minutes
Frequency: ${metrics.averageFrequency} attempts/minute
Calculated Risk: ${metrics.riskLevel}

Provide concise, auditable findings without chain of thought or internal deliberation. State the evidence, attack pattern, and security impact in 2-3 brief sentences.`,
        });
        reasoningFindings = response.text || '';
        if (reasoningFindings) {
          geminiAnalysisCache.set(cacheKey, { findings: reasoningFindings, timestamp: Date.now() });
        }
      } catch (e: any) {
        // Handle 429 Quota Exceeded gracefully: back off without logging noisy stack traces
        const isQuota = e?.status === 'RESOURCE_EXHAUSTED' || e?.toString().includes('429') || e?.message?.includes('quota');
        if (isQuota) {
          geminiCooldownUntil = Date.now() + 15000; // 15-second cooldown
        }
        reasoningFindings = `${metrics.failedAttempts} failed login attempts recorded from ${sourceIp} targeting account '${targetAccount}' within ${metrics.timeSpanMinutes} minute(s) (${metrics.averageFrequency} attempts/min). Deterministic engine flagged risk level as ${metrics.riskLevel}.`;
      }
    }
  }

  // Fallback findings if model or harness offline or rate-limited
  if (!reasoningFindings) {
    reasoningFindings = `${metrics.failedAttempts} failed login attempts were recorded from source IP ${sourceIp} within ${metrics.timeSpanMinutes} minute(s) (Frequency: ${metrics.averageFrequency} attempts/min). The pattern indicates automated credential guessing.`;
  }

  // Create Incident
  const incident = await mcpSecurityTools.create_incident({
    sourceIp,
    targetAccount,
    failedAttempts: metrics.failedAttempts,
    detectionWindow: `${metrics.timeSpanMinutes} minutes`,
    frequency: metrics.averageFrequency,
    risk: metrics.riskLevel,
    evidence: reasoningFindings,
    agentNotes: trueForgeConnected
      ? 'Investigated via TrueForge Agent Harness (active session)'
      : ai
      ? 'Investigated via Digital Defenders Agent (Gemini 3.8 Flash Reasoning Layer)'
      : 'Investigated via Deterministic Security Detection Engine (TrueForge harness mode ready)',
  });

  // Automatically dispatch security alert email to developer when wrong password / suspicious attempts detected
  // Fired on every failed login attempt (>= 1 failed attempt)
  if (metrics.failedAttempts >= 1) {
    await mcpSecurityTools.send_security_notification(incident.id);
    agentState.status = 'Waiting for User';
    agentState.currentIncidentId = incident.id;

    // Send critical security alert directly to developer email
    sendDeveloperSecurityAlert({
      incidentId: incident.id,
      sourceIp,
      username: targetAccount,
      failedAttempts: metrics.failedAttempts,
      risk: incident.risk,
      frequency: metrics.averageFrequency,
      evidence: reasoningFindings,
      detectionWindow: `${metrics.timeSpanMinutes} minutes`,
    }).catch((e) => console.error('Error dispatching developer email:', e));
  }

  agentState.recentActivity.unshift({
    step: 'Incident Analysis',
    details: `Created incident ${incident.id} for IP ${sourceIp} (Risk: ${incident.risk})`,
    timestamp: new Date().toISOString(),
  });

  return incident;
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password, sourceIp, rememberMe } = req.body;
  const ip = sourceIp || '127.0.0.1';

  // Check if IP is currently blocked
  const isBlocked = blockedIps.some((b) => b.ip === ip && b.status === 'Blocked');
  if (isBlocked) {
    logAudit(
      'LOGIN_FAILED',
      username || 'unknown',
      ip,
      'Login rejected: Source IP is BLOCKED by Digital Defenders',
      'FAILURE',
      'System',
      undefined,
      'Connection blocked by simulated IP defense'
    );
    return res.status(403).json({
      error: `Access Denied: Source IP ${ip} is blocked due to active security incident mitigation.`,
      isBlocked: true,
    });
  }

  const user = users.find((u) => u.username.toLowerCase() === (username || '').toLowerCase());
  const isValid = user && verifyPassword(password || '', user.passwordHash, user.salt);

  if (isValid) {
    const attempt: LoginAttempt = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      username: user.username,
      timestamp: new Date().toISOString(),
      sourceIp: ip,
      loginStatus: 'Success',
      userAgent: req.headers['user-agent'] || 'Digital-Defenders-Client/1.0',
    };
    loginAttempts.unshift(attempt);
    logAudit(
      'LOGIN_SUCCESS',
      user.username,
      ip,
      'User authenticated successfully',
      'SUCCESS',
      'System',
      undefined,
      'Valid credentials provided for admin account'
    );

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
      },
      token: `token-${Date.now().toString(36)}`,
    });
  } else {
    // Record Failed Login
    const attempt: LoginAttempt = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      username: username || 'unknown',
      timestamp: new Date().toISOString(),
      sourceIp: ip,
      loginStatus: 'Failed',
      userAgent: req.headers['user-agent'] || 'Digital-Defenders-Client/1.0',
    };
    loginAttempts.unshift(attempt);
    logAudit(
      'LOGIN_FAILED',
      username || 'unknown',
      ip,
      'Authentication failed: Invalid credentials',
      'FAILURE',
      'System'
    );

    // Run deterministic analysis check and invoke AI agent on wrong password attempts
    const metrics = calculateIpMetrics(ip);
    // If wrong password detected (even single or multiple), backend AI Agent evaluates and alerts developer
    runTrueForgeInvestigation(ip, username || 'admin').catch(console.error);

    return res.status(401).json({
      error: 'Invalid username or password. Demo credentials: admin / admin123',
      metrics,
    });
  }
});

// GET /api/developer/emails (Allows checking sent developer alert emails)
app.get('/api/developer/emails', (req: Request, res: Response) => {
  res.json({
    developerEmail: DEVELOPER_EMAIL,
    totalDispatched: sentDeveloperEmails.length,
    emails: sentDeveloperEmails,
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const total = loginAttempts.length;
  const successful = loginAttempts.filter((a) => a.loginStatus === 'Success').length;
  const failed = loginAttempts.filter((a) => a.loginStatus === 'Failed').length;

  const suspiciousAttempts = loginAttempts.filter((a) => {
    if (a.loginStatus !== 'Failed') return false;
    const m = calculateIpMetrics(a.sourceIp);
    return m.riskLevel === 'HIGH' || m.riskLevel === 'CRITICAL' || m.riskLevel === 'SUSPICIOUS';
  }).length;

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Rejected'
  ).length;
  const blockedCount = blockedIps.filter((b) => b.status === 'Blocked').length;

  res.json({
    totalAttempts: total,
    successfulLogins: successful,
    failedLogins: failed,
    suspiciousAttempts,
    activeIncidents,
    blockedIps: blockedCount,
    trueforgeUrl: TRUEFORGE_URL,
    hasGeminiKey: Boolean(apiKey),
  });
});

// GET /api/dashboard/activity
app.get('/api/dashboard/activity', (req: Request, res: Response) => {
  // Aggregate attempts by timestamp intervals for chart
  const timeBuckets: { [key: string]: { time: string; failed: number; success: number } } = {};
  const recent = loginAttempts.slice(-30);

  recent.forEach((a) => {
    const timeStr = new Date(a.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    if (!timeBuckets[timeStr]) {
      timeBuckets[timeStr] = { time: timeStr, failed: 0, success: 0 };
    }
    if (a.loginStatus === 'Failed') timeBuckets[timeStr].failed++;
    else timeBuckets[timeStr].success++;
  });

  const timeSeries = Object.values(timeBuckets);

  // Group by IP
  const ipCounts: { [ip: string]: number } = {};
  loginAttempts.forEach((a) => {
    if (a.loginStatus === 'Failed') {
      ipCounts[a.sourceIp] = (ipCounts[a.sourceIp] || 0) + 1;
    }
  });

  const ipDistribution = Object.entries(ipCounts).map(([ip, count]) => ({
    ip,
    count,
  }));

  // Risk Distribution
  const riskCounts = {
    NORMAL: 0,
    WARNING: 0,
    SUSPICIOUS: 0,
    HIGH: 0,
    CRITICAL: 0,
  };
  const uniqueIps = Array.from(new Set(loginAttempts.map((a) => a.sourceIp)));
  uniqueIps.forEach((ip) => {
    const m = calculateIpMetrics(ip);
    riskCounts[m.riskLevel] = (riskCounts[m.riskLevel] || 0) + 1;
  });

  res.json({
    timeSeries,
    ipDistribution,
    riskDistribution: Object.entries(riskCounts).map(([name, value]) => ({ name, value })),
  });
});

// GET /api/login-attempts
app.get('/api/login-attempts', (req: Request, res: Response) => {
  const ipList = Array.from(new Set(loginAttempts.map((a) => a.sourceIp)));
  const frequencyAnalysis = ipList.map((ip) => calculateIpMetrics(ip));

  res.json({
    attempts: loginAttempts.slice(0, 100),
    frequencyAnalysis,
  });
});

// POST /api/security/analyze
app.post('/api/security/analyze', async (req: Request, res: Response) => {
  const { sourceIp, targetAccount } = req.body;
  const ip = sourceIp || '192.168.1.45';
  const account = targetAccount || 'admin';

  try {
    const incident = await runTrueForgeInvestigation(ip, account);
    res.json({ success: true, incident });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/security/incidents
app.get('/api/security/incidents', (req: Request, res: Response) => {
  res.json(incidents);
});

// GET /api/security/incidents/{id}
app.get('/api/security/incidents/:id', (req: Request, res: Response) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// POST /api/security/incidents/{id}/notify
app.post('/api/security/incidents/:id/notify', async (req: Request, res: Response) => {
  try {
    const item = await mcpSecurityTools.send_security_notification(req.params.id);
    res.json({ success: true, notification: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/security/incidents/{id}/confirm
app.post('/api/security/incidents/:id/confirm', async (req: Request, res: Response) => {
  const { confirmedWasUser } = req.body;
  try {
    const updated = await mcpSecurityTools.record_user_confirmation(
      req.params.id,
      Boolean(confirmedWasUser)
    );

    // Update corresponding notification status
    const notif = notifications.find((n) => n.incidentId === req.params.id);
    if (notif) {
      notif.status = confirmedWasUser ? 'Confirmed' : 'Unauthorized';
    }

    if (!confirmedWasUser) {
      // Pause agent at TrueForge Human Approval Checkpoint
      await mcpSecurityTools.request_admin_approval(req.params.id);
    } else {
      agentState.status = 'Monitoring';
    }

    res.json({ success: true, incident: updated, agentState });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/security/incidents/{id}/approve-block (CRITICAL HUMAN APPROVAL)
app.post('/api/security/incidents/:id/approve-block', async (req: Request, res: Response) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  agentState.status = 'Executing';
  incident.adminDecision = 'Approved';
  incident.status = 'Blocked';
  incident.updatedAt = new Date().toISOString();

  logAudit(
    'ADMIN_APPROVAL',
    incident.targetAccount,
    incident.sourceIp,
    `Admin APPROVED simulated block for IP ${incident.sourceIp}`,
    'SUCCESS',
    'Administrator',
    incident.id,
    'Checkpoint satisfied by authorized SOC administrator. Executing simulate_block_ip.'
  );

  // 1. Execute Simulated IP block
  const blockResult = await mcpSecurityTools.simulate_block_ip(
    incident.sourceIp,
    incident.id,
    `Admin-approved response for incident ${incident.id} (${incident.failedAttempts} failed logins)`
  );

  // 2. Perform Self-Verification
  agentState.status = 'Verifying';
  const verification = await mcpSecurityTools.verify_ip_block(incident.sourceIp, incident.id);

  agentState.recentActivity.unshift({
    step: 'Remediation Verified',
    details: `Simulated block verified for IP ${incident.sourceIp}. Incident resolved.`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    incident,
    blockResult,
    verification,
    agentState,
  });
});

// POST /api/security/incidents/{id}/reject
app.post('/api/security/incidents/:id/reject', async (req: Request, res: Response) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  incident.adminDecision = 'Rejected';
  incident.status = 'Rejected';
  incident.actionResult = 'Administrator rejected simulated IP block';
  incident.verification = 'No defensive actions taken per administrator instruction';
  incident.updatedAt = new Date().toISOString();

  logAudit(
    'ADMIN_REJECTED',
    incident.targetAccount,
    incident.sourceIp,
    `Admin REJECTED blocking action for incident ${incident.id}`,
    'WARNING',
    'Administrator',
    incident.id,
    'Action rejected. No simulated firewall block performed.'
  );

  agentState.status = 'Monitoring';
  agentState.activeCheckpoint = null;

  res.json({
    success: true,
    incident,
    agentState,
  });
});

// GET /api/notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(notifications);
});

// GET /api/blocked-ips
app.get('/api/blocked-ips', (req: Request, res: Response) => {
  res.json(blockedIps);
});

// POST /api/blocked-ips/{ip}/unblock
app.post('/api/blocked-ips/:ip/unblock', (req: Request, res: Response) => {
  const targetIp = req.params.ip;
  const record = blockedIps.find((b) => b.ip === targetIp && b.status === 'Blocked');
  if (!record) return res.status(404).json({ error: 'Blocked IP record not found' });

  record.status = 'Unblocked';
  logAudit(
    'IP_UNBLOCKED',
    'admin',
    targetIp,
    `Simulated IP block removed for ${targetIp}`,
    'INFO',
    'Administrator',
    record.incidentId
  );

  res.json({ success: true, record });
});

// GET /api/logs
app.get('/api/logs', (req: Request, res: Response) => {
  res.json(auditLogs);
});

// GET /api/settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(settings);
});

// PUT /api/settings
app.put('/api/settings', (req: Request, res: Response) => {
  settings = { ...settings, ...req.body };
  logAudit(
    'SYSTEM_INIT' as any,
    'admin',
    '127.0.0.1',
    'System risk thresholds and configuration updated',
    'INFO',
    'Administrator'
  );
  res.json({ success: true, settings });
});

// GET /api/profile
app.get('/api/profile', (req: Request, res: Response) => {
  const user = users[0];
  res.json({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    mfaStatus: user.mfaEnabled ? 'Enabled' : 'Disabled',
    notificationPreferences: user.notificationPreferences,
  });
});

// PUT /api/profile
app.put('/api/profile', (req: Request, res: Response) => {
  const user = users[0];
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.notificationPreferences) {
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body.notificationPreferences,
    };
  }
  res.json({ success: true, profile: user });
});

// DEMO ATTACK SIMULATOR ENDPOINTS
// POST /api/demo/simulate-login
app.post('/api/demo/simulate-login', (req: Request, res: Response) => {
  const { count = 1, sourceIp = '192.168.1.45', username = 'admin' } = req.body;

  // If IP is blocked, fail with blocked notice
  const isBlocked = blockedIps.some((b) => b.ip === sourceIp && b.status === 'Blocked');
  if (isBlocked) {
    return res.status(403).json({
      error: `Simulation blocked: IP ${sourceIp} is already blocked in simulation mode.`,
      isBlocked: true,
    });
  }

  const newAttempts: LoginAttempt[] = [];
  const baseTime = Date.now();
  for (let i = 0; i < count; i++) {
    const attempt: LoginAttempt = {
      id: `ATT-DEMO-${baseTime}-${i}`,
      username,
      timestamp: new Date(baseTime - (count - 1 - i) * 12000).toISOString(),
      sourceIp,
      loginStatus: 'Failed',
      userAgent: 'Mozilla/5.0 (Hydra-BruteForce-Sim/4.2; Linux x86_64)',
      isSynthetic: true,
    };
    loginAttempts.unshift(attempt);
    newAttempts.push(attempt);

    logAudit(
      'LOGIN_FAILED',
      username,
      sourceIp,
      `Simulated failed login #${loginAttempts.filter((a) => a.sourceIp === sourceIp).length}`,
      'FAILURE',
      'System',
      undefined,
      'Synthetic attack event generated by demo harness'
    );
  }

  const metrics = calculateIpMetrics(sourceIp);
  res.json({
    success: true,
    added: count,
    metrics,
    totalAttemptsForIp: metrics.failedAttempts,
  });
});

// POST /api/demo/start-attack
app.post('/api/demo/start-attack', async (req: Request, res: Response) => {
  const sourceIp = '192.168.1.45';
  const targetAccount = 'admin';

  // Generate 17 failed attempts within 8 minutes window
  const baseTime = Date.now();
  for (let i = 0; i < 17; i++) {
    const attempt: LoginAttempt = {
      id: `ATT-SYNTH-${baseTime}-${i}`,
      username: targetAccount,
      // Distribute across 8 minutes
      timestamp: new Date(baseTime - (16 - i) * 28000).toISOString(),
      sourceIp,
      loginStatus: 'Failed',
      userAgent: 'Hydra/9.5 (Credential-Stuffing-Bot; Linux x86_64)',
      isSynthetic: true,
    };
    loginAttempts.unshift(attempt);
  }

  const metrics = calculateIpMetrics(sourceIp);

  // Run AI investigation
  const incident = await runTrueForgeInvestigation(sourceIp, targetAccount);

  res.json({
    success: true,
    metrics,
    incident,
    agentState,
  });
});

// POST /api/demo/reset
app.post('/api/demo/reset', (req: Request, res: Response) => {
  loginAttempts = [];
  incidents = [];
  notifications = [];
  blockedIps = [];
  auditLogs = [];

  agentState = {
    harness: 'TrueForge Agent Harness',
    status: 'Monitoring',
    lastEventTime: new Date().toISOString(),
    currentIncidentId: null,
    activeCheckpoint: null,
    recentActivity: [
      {
        step: 'System Reset',
        details: 'All simulated data cleared. Monitoring re-armed.',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  logAudit(
    'SYSTEM_INIT' as any,
    'system',
    '127.0.0.1',
    'Demo environment reset to baseline',
    'INFO',
    'Administrator'
  );

  res.json({ success: true, message: 'All demo data reset successfully' });
});

// GET /api/agent/status
app.get('/api/agent/status', (req: Request, res: Response) => {
  res.json({
    agentState,
    trueforgeUrl: TRUEFORGE_URL,
    hasGeminiKey: Boolean(apiKey),
    deterministicEngineActive: true,
    mcpToolsLoaded: Object.keys(mcpSecurityTools),
  });
});

// GET /api/agent/activity
app.get('/api/agent/activity', (req: Request, res: Response) => {
  res.json({
    status: agentState.status,
    recentActivity: agentState.recentActivity,
    auditLogs: auditLogs.slice(0, 50),
  });
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite dev middleware or Static build)
// ----------------------------------------------------
async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Defenders backend & frontend running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the standalone listener if not running in a serverless environment (e.g., Vercel)
if (process.env.VERCEL !== '1') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;

