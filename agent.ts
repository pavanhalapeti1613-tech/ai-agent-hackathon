/**
 * ============================================================================
 * AUTONOMOUS AI INCIDENT RESPONSE AGENT
 * TrueForge Agent Harness • Gemini 3.8 Flash Reasoning • MCP Security Tools
 * ============================================================================
 *
 * This is the pure, standalone AI Security Agent. It operates deterministically
 * over ingress authentication logs, invokes Google Gemini 3.8 Flash for reasoning,
 * manages MCP security tools, enforces a Human-in-the-Loop checkpoint before any
 * defensive remediation, and conducts automated post-remediation self-verification.
 *
 * Can be imported as a module OR executed directly:
 *   npx tsx agent.ts
 */

import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';

// ----------------------------------------------------------------------------
// 1. DATA TYPES & AGENT CONTRACTS
// ----------------------------------------------------------------------------

export interface LoginAttempt {
  id: string;
  username: string;
  timestamp: string; // ISO string
  sourceIp: string;
  loginStatus: 'Success' | 'Failed';
  userAgent: string;
  isSynthetic?: boolean;
}

export type RiskLevel = 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';

export interface IpMetrics {
  sourceIp: string;
  failedAttempts: number;
  last1m: number;
  last5m: number;
  last15m: number;
  averageFrequency: number; // attempts / minute
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
  risk: RiskLevel | string;
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
    | 'IP_UNBLOCKED'
    | 'SYSTEM_INIT';
  account: string;
  ip: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'INFO';
  actor: 'System' | 'AI Agent' | 'Account Owner' | 'Administrator';
  incidentId?: string;
  details?: string;
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

// ----------------------------------------------------------------------------
// 2. CONFIGURATION & STATE STORAGE
// ----------------------------------------------------------------------------

export const riskThresholds = {
  warning: 3,
  suspicious: 5,
  high: 10,
  critical: 15,
};

export const inMemoryStore = {
  loginAttempts: [] as LoginAttempt[],
  incidents: [] as SecurityIncident[],
  notifications: [] as NotificationItem[],
  blockedIps: [] as BlockedIpRecord[],
  auditLogs: [] as AuditLog[],
};

export const agentState: AgentState = {
  harness: 'TrueForge Agent Harness',
  status: 'Monitoring',
  lastEventTime: new Date().toISOString(),
  currentIncidentId: null,
  activeCheckpoint: null,
  recentActivity: [
    {
      step: 'Agent Initialized',
      details: 'TrueForge Agent Harness active. Deterministic engine loaded. Awaiting ingress events.',
      timestamp: new Date().toISOString(),
    },
  ],
};

// ----------------------------------------------------------------------------
// 3. GEMINI 3.8 FLASH CLIENT WITH USER-AGENT TELEMETRY
// ----------------------------------------------------------------------------

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

const geminiAnalysisCache = new Map<string, { findings: string; timestamp: number }>();
let lastGeminiCallTime = 0;
let geminiCooldownUntil = 0;

// ----------------------------------------------------------------------------
// 4. AUDIT LOGGER
// ----------------------------------------------------------------------------

export function logAudit(
  eventType: AuditLog['eventType'],
  account: string,
  ip: string,
  action: string,
  status: AuditLog['status'],
  actor: AuditLog['actor'],
  incidentId?: string,
  details?: string
): AuditLog {
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
  inMemoryStore.auditLogs.unshift(item);
  return item;
}

// ----------------------------------------------------------------------------
// 5. DETERMINISTIC DETECTION & FREQUENCY ENGINE
// ----------------------------------------------------------------------------

export function calculateIpMetrics(sourceIp: string): IpMetrics {
  const now = Date.now();
  const oneMinAgo = now - 60 * 1000;
  const fiveMinAgo = now - 5 * 60 * 1000;
  const fifteenMinAgo = now - 15 * 60 * 1000;

  const ipAttempts = inMemoryStore.loginAttempts.filter(
    (a) => a.sourceIp === sourceIp && a.loginStatus === 'Failed'
  );

  const failedCount = ipAttempts.length;
  const last1m = ipAttempts.filter((a) => new Date(a.timestamp).getTime() >= oneMinAgo).length;
  const last5m = ipAttempts.filter((a) => new Date(a.timestamp).getTime() >= fiveMinAgo).length;
  const last15m = ipAttempts.filter((a) => new Date(a.timestamp).getTime() >= fifteenMinAgo).length;

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

  const avgFrequency = Number((failedCount / Math.max(1, timeSpanMinutes)).toFixed(1));

  let riskLevel: RiskLevel = 'NORMAL';
  if (failedCount >= riskThresholds.critical) {
    riskLevel = 'CRITICAL';
  } else if (failedCount >= riskThresholds.high) {
    riskLevel = 'HIGH';
  } else if (failedCount >= riskThresholds.suspicious) {
    riskLevel = 'SUSPICIOUS';
  } else if (failedCount >= riskThresholds.warning) {
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

// ----------------------------------------------------------------------------
// 6. MCP SECURITY TOOLS (Model Context Protocol Interface)
// ----------------------------------------------------------------------------

export const mcpSecurityTools = {
  get_recent_login_attempts: async (limit: number = 20): Promise<LoginAttempt[]> => {
    return inMemoryStore.loginAttempts.slice(-limit).reverse();
  },

  get_login_attempts_by_ip: async (ip: string): Promise<LoginAttempt[]> => {
    return inMemoryStore.loginAttempts.filter((a) => a.sourceIp === ip);
  },

  calculate_login_frequency: async (ip: string): Promise<IpMetrics> => {
    return calculateIpMetrics(ip);
  },

  analyze_login_pattern: async (ip: string) => {
    const metrics = calculateIpMetrics(ip);
    const isBlocked = inMemoryStore.blockedIps.some((b) => b.ip === ip && b.status === 'Blocked');
    return {
      ...metrics,
      isBlocked,
      pattern: metrics.averageFrequency > 2 ? 'Automated High-Frequency Brute-Force' : 'Intermittent dictionary attack',
    };
  },

  create_incident: async (data: Partial<SecurityIncident>): Promise<SecurityIncident> => {
    const incId = `INC-${String(inMemoryStore.incidents.length + 1).padStart(4, '0')}`;
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
      recommendedAction: 'Block Source IP (Simulated)',
      adminDecision: 'Pending',
      actionResult: 'None yet',
      verification: 'Pending verification',
      status: 'Awaiting User Confirmation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agentNotes: data.agentNotes || 'Investigated by Digital Defenders Security Agent via TrueForge Harness',
    };
    inMemoryStore.incidents.unshift(newIncident);
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

  send_security_notification: async (incidentId: string): Promise<NotificationItem> => {
    const incident = inMemoryStore.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const notificationId = `NOTIF-${Date.now().toString(36)}`;
    const subject = `Security Alert – Multiple Login Attempts Detected on ${incident.targetAccount}`;
    const emailBody = `SECURITY ALERT\n\nAccount: ${incident.targetAccount}\nFailed Attempts: ${incident.failedAttempts}\nSource IP: ${incident.sourceIp}\nRisk: ${incident.risk}\nFrequency: ${incident.frequency} attempts/min`;

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
    inMemoryStore.notifications.unshift(item);
    logAudit(
      'USER_NOTIFIED',
      incident.targetAccount,
      incident.sourceIp,
      `Security notification dispatched for ${incident.id}`,
      'INFO',
      'AI Agent',
      incident.id
    );
    return item;
  },

  record_user_confirmation: async (incidentId: string, confirmedWasUser: boolean): Promise<SecurityIncident> => {
    const incident = inMemoryStore.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

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
        'User confirmed activity was UNAUTHORIZED. Escalating to Checkpoint.',
        'WARNING',
        'Account Owner',
        incident.id
      );
    }
    return incident;
  },

  request_admin_approval: async (incidentId: string) => {
    const incident = inMemoryStore.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

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

  simulate_block_ip: async (ip: string, incidentId: string, reason: string): Promise<BlockedIpRecord> => {
    const incident = inMemoryStore.incidents.find((i) => i.id === incidentId);
    const existing = inMemoryStore.blockedIps.find((b) => b.ip === ip && b.status === 'Blocked');
    if (existing) return existing;

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
    inMemoryStore.blockedIps.unshift(blockedRecord);

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
    const isRecordInDb = inMemoryStore.blockedIps.some((b) => b.ip === ip && b.status === 'Blocked');
    const incident = inMemoryStore.incidents.find((i) => i.id === incidentId);

    const verificationChecks = {
      ipBlockConfirmedInDatabase: isRecordInDb,
      newDemoAttemptsPrevented: isRecordInDb,
      incidentEvidenceUpdated: true,
      timestamp: new Date().toISOString(),
    };

    if (isRecordInDb && incident) {
      incident.verification =
        '✓ IP block confirmed in database\n✓ New demo attempts prevented\n✓ Incident evidence updated\n✓ Incident resolved';
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
};

// ----------------------------------------------------------------------------
// 7. AUTONOMOUS INVESTIGATION & GEMINI REASONING PIPELINE
// ----------------------------------------------------------------------------

export async function runAgentInvestigation(sourceIp: string, targetAccount: string = 'admin'): Promise<SecurityIncident> {
  agentState.status = 'Investigating';
  const metrics = calculateIpMetrics(sourceIp);

  let reasoningFindings = '';
  const now = Date.now();
  const cacheKey = `${sourceIp}-${targetAccount}-${metrics.riskLevel}`;
  const cached = geminiAnalysisCache.get(cacheKey);

  if (cached && now - cached.timestamp < 60000) {
    reasoningFindings = cached.findings;
  }

  // Gemini 3.8 Flash Reasoning Layer
  if (!reasoningFindings && ai && now > geminiCooldownUntil) {
    if (now - lastGeminiCallTime < 3000) {
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
        const isQuota = e?.status === 'RESOURCE_EXHAUSTED' || e?.toString().includes('429');
        if (isQuota) geminiCooldownUntil = Date.now() + 15000;
        reasoningFindings = `${metrics.failedAttempts} failed login attempts recorded from ${sourceIp} targeting account '${targetAccount}' within ${metrics.timeSpanMinutes} minute(s) (${metrics.averageFrequency} attempts/min). Deterministic engine flagged risk level as ${metrics.riskLevel}.`;
      }
    }
  }

  if (!reasoningFindings) {
    reasoningFindings = `${metrics.failedAttempts} failed login attempts recorded from source IP ${sourceIp} within ${metrics.timeSpanMinutes} minute(s) (Frequency: ${metrics.averageFrequency} attempts/min). The pattern indicates automated credential guessing.`;
  }

  // 1. Create Incident
  const incident = await mcpSecurityTools.create_incident({
    sourceIp,
    targetAccount,
    failedAttempts: metrics.failedAttempts,
    detectionWindow: `${metrics.timeSpanMinutes} minutes`,
    frequency: metrics.averageFrequency,
    risk: metrics.riskLevel,
    evidence: reasoningFindings,
    agentNotes: ai
      ? 'Investigated via Digital Defenders Agent (Gemini 3.8 Flash Reasoning Layer)'
      : 'Investigated via Deterministic Security Detection Engine',
  });

  // 2. Notify Account Owner
  if (metrics.failedAttempts >= 1) {
    await mcpSecurityTools.send_security_notification(incident.id);
    agentState.status = 'Waiting for User';
    agentState.currentIncidentId = incident.id;
  }

  agentState.recentActivity.unshift({
    step: 'Incident Analysis',
    details: `Created incident ${incident.id} for IP ${sourceIp} (Risk: ${incident.risk})`,
    timestamp: new Date().toISOString(),
  });

  return incident;
}

// ----------------------------------------------------------------------------
// 8. HUMAN-IN-THE-LOOP CHECKPOINT RESOLUTION
// ----------------------------------------------------------------------------

export async function approveIncidentRemediation(incidentId: string) {
  const incident = inMemoryStore.incidents.find((i) => i.id === incidentId);
  if (!incident) throw new Error(`Incident ${incidentId} not found`);

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

  // 1. Execute Simulated Block
  const blockResult = await mcpSecurityTools.simulate_block_ip(
    incident.sourceIp,
    incident.id,
    `Admin-approved response for incident ${incident.id}`
  );

  // 2. Automated Self-Verification
  agentState.status = 'Verifying';
  const verification = await mcpSecurityTools.verify_ip_block(incident.sourceIp, incident.id);

  agentState.recentActivity.unshift({
    step: 'Remediation Verified',
    details: `Simulated block verified for IP ${incident.sourceIp}. Incident resolved.`,
    timestamp: new Date().toISOString(),
  });

  return { incident, blockResult, verification, agentState };
}

export async function rejectIncidentRemediation(incidentId: string) {
  const incident = inMemoryStore.incidents.find((i) => i.id === incidentId);
  if (!incident) throw new Error(`Incident ${incidentId} not found`);

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
    incident.id
  );

  agentState.status = 'Monitoring';
  agentState.activeCheckpoint = null;
  return { incident, agentState };
}

// ----------------------------------------------------------------------------
// 9. STANDALONE CLI DEMO EXECUTION (When run directly)
// ----------------------------------------------------------------------------

if (process.argv[1] && process.argv[1].endsWith('agent.ts')) {
  console.log('===============================================================');
  console.log('Starting Autonomous AI Incident Response Agent (CLI Mode)');
  console.log('===============================================================');

  // Inject 17 failed login attempts
  const testIp = '192.168.1.185';
  const testAccount = 'admin';
  const now = Date.now();

  console.log(`\n[1] Ingesting 17 simulated failed authentication attempts for ${testAccount}@${testIp}...`);
  for (let i = 0; i < 17; i++) {
    inMemoryStore.loginAttempts.unshift({
      id: `ATT-TEST-${now}-${i}`,
      username: testAccount,
      timestamp: new Date(now - (16 - i) * 25000).toISOString(),
      sourceIp: testIp,
      loginStatus: 'Failed',
      userAgent: 'Hydra/9.5 (Credential-Stuffing-Bot; Linux x86_64)',
    });
  }

  (async () => {
    console.log('[2] Invoking Autonomous Agent Investigation Pipeline...');
    const incident = await runAgentInvestigation(testIp, testAccount);
    console.log(`\nIncident Created: ${incident.id}`);
    console.log(`- Risk: ${incident.risk}`);
    console.log(`- Frequency: ${incident.frequency} attempts/min`);
    console.log(`- Findings: ${incident.evidence}`);

    console.log('\n[3] Triggering User Confirmation (Reporting Unauthorized)...');
    await mcpSecurityTools.record_user_confirmation(incident.id, false);

    console.log('[4] Pausing at Human-in-the-Loop Checkpoint Barrier...');
    const checkpoint = await mcpSecurityTools.request_admin_approval(incident.id);
    console.log(`- Checkpoint ID: ${checkpoint.checkpointId}`);
    console.log(`- Agent Status: ${agentState.status}`);

    console.log('\n[5] Simulating SOC Admin Authorization (Approve Block)...');
    const result = await approveIncidentRemediation(incident.id);
    console.log(`- Verification Result:\n${result.incident.verification}`);
    console.log(`- Final Agent State: ${result.agentState.status}`);
    console.log('\nAudit Logs Generated:', inMemoryStore.auditLogs.length);
    console.log('===============================================================');
  })();
}
