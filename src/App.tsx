import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { LoginMonitorPage } from './pages/LoginMonitorPage';
import { AiAgentPage } from './pages/AiAgentPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { BlockedIpsPage } from './pages/BlockedIpsPage';
import { IncidentReportsPage } from './pages/IncidentReportsPage';
import { SystemLogsPage } from './pages/SystemLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { api } from './services/api';
import {
  User,
  DashboardStats,
  LoginAttempt,
  FrequencyMetric,
  SecurityIncident,
  NotificationItem,
  BlockedIpRecord,
  AuditLog,
  SystemSettings,
  AgentState,
} from './types/security';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalAttempts: 0,
    successfulLogins: 0,
    failedLogins: 0,
    suspiciousAttempts: 0,
    activeIncidents: 0,
    blockedIps: 0,
    trueforgeUrl: 'http://localhost:8790',
    hasGeminiKey: true,
  });
  const [activityData, setActivityData] = useState<{
    timeSeries: Array<{ time: string; failed: number; success: number }>;
    ipDistribution: Array<{ ip: string; count: number }>;
    riskDistribution: Array<{ name: string; value: number }>;
  }>({
    timeSeries: [],
    ipDistribution: [],
    riskDistribution: [],
  });
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [frequencyAnalysis, setFrequencyAnalysis] = useState<FrequencyMetric[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIpRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    riskThresholds: { warning: 3, suspicious: 5, high: 10, critical: 15 },
    notificationChannels: { inApp: true, email: true, sms: false },
    triggers: { notifyAtAttempts: 5, notifyOnCritical: true, notifyOnUnauthorized: true },
    demoMode: false,
    ipBlockMode: 'simulation',
  });
  const [agentState, setAgentState] = useState<AgentState>({
    harness: 'TrueForge Agent Harness',
    status: 'Monitoring',
    lastEventTime: new Date().toISOString(),
    currentIncidentId: null,
    activeCheckpoint: null,
    recentActivity: [],
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState<SecurityIncident | null>(null);

  const loadAllData = async () => {
    if (!currentUser) return;
    try {
      const [
        statsData,
        actData,
        attemptsData,
        incidentsData,
        notifsData,
        blockedData,
        logsData,
        settingsData,
        agentStatusData,
      ] = await Promise.all([
        api.getStats().catch(() => stats),
        api.getActivity().catch(() => activityData),
        api.getLoginAttempts().catch(() => ({ attempts: [], frequencyAnalysis: [] })),
        api.getIncidents().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getBlockedIps().catch(() => []),
        api.getLogs().catch(() => []),
        api.getSettings().catch(() => settings),
        api.getAgentStatus().catch(() => ({ agentState })),
      ]);

      setStats(statsData);
      setActivityData(actData);
      setAttempts(attemptsData.attempts || []);
      setFrequencyAnalysis(attemptsData.frequencyAnalysis || []);
      setIncidents(incidentsData || []);
      setNotifications(notifsData || []);
      setBlockedIps(blockedData || []);
      setAuditLogs(logsData || []);
      setSettings(settingsData);
      if (agentStatusData?.agentState) {
        setAgentState(agentStatusData.agentState);
      }
    } catch {
      // background fetch error handled gracefully
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
      const interval = setInterval(loadAllData, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const activeIncidentsCount = incidents.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Rejected'
  ).length;

  const unreadNotificationsCount = notifications.filter(
    (n) => n.status === 'Pending'
  ).length;

  const activeIncident =
    incidents.find((i) => i.status === 'Awaiting Admin Approval' || i.status === 'Investigating') ||
    incidents[0] ||
    null;

  const handleApproveBlock = async (incidentId: string) => {
    setIsProcessing(true);
    try {
      await api.approveBlock(incidentId);
      await loadAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBlock = async (incidentId: string) => {
    setIsProcessing(true);
    try {
      await api.rejectBlock(incidentId);
      await loadAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTriggerAnalysis = async (ip: string, username: string) => {
    setIsProcessing(true);
    try {
      await api.analyzeActivity(ip, username);
      await loadAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmNotification = async (incidentId: string, confirmedWasUser: boolean) => {
    try {
      await api.confirmIncident(incidentId, confirmedWasUser);
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      await api.updateSettings(newSettings);
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      await api.updateProfile(data);
      if (currentUser) {
        setCurrentUser({ ...currentUser, ...data });
      }
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnblockIp = async (record: BlockedIpRecord) => {
    try {
      await api.unblockIp(record.id);
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeIncidentsCount={activeIncidentsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={() => setCurrentUser(null)}
        currentUser={{
          name: currentUser.name || currentUser.username,
          role: currentUser.role || 'Administrator',
          email: currentUser.email || 'security@digitaldefenders.sec',
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            activityData={activityData}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onRunCompleteAttack={() => {}}
            isSimulating={false}
          />
        )}

        {currentTab === 'monitor' && (
          <LoginMonitorPage
            attempts={attempts}
            frequencyAnalysis={frequencyAnalysis}
            onTriggerAnalysis={handleTriggerAnalysis}
            isAnalyzing={isProcessing}
          />
        )}

        {currentTab === 'agent' && (
          <AiAgentPage
            agentState={agentState}
            activeIncident={activeIncident}
            onApproveBlock={handleApproveBlock}
            onRejectBlock={handleRejectBlock}
            onTriggerAnalysis={handleTriggerAnalysis}
            isProcessing={isProcessing}
          />
        )}

        {currentTab === 'incidents' && (
          <IncidentsPage
            incidents={incidents}
            onSelectIncident={(inc) => {
              setSelectedIncidentForDetail(inc);
              setCurrentTab('agent');
            }}
            onApproveBlock={handleApproveBlock}
            onRejectBlock={handleRejectBlock}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsPage
            notifications={notifications}
            onConfirm={handleConfirmNotification}
            onOpenEmail={() => {}}
            onSelectIncidentById={() => setCurrentTab('incidents')}
          />
        )}

        {currentTab === 'blocked-ips' && (
          <BlockedIpsPage
            blockedIps={blockedIps}
            onOpenUnblockModal={handleUnblockIp}
            onSelectIncidentById={() => setCurrentTab('incidents')}
          />
        )}

        {currentTab === 'reports' && (
          <IncidentReportsPage incidents={incidents} />
        )}

        {currentTab === 'logs' && (
          <SystemLogsPage
            logs={auditLogs}
            onSelectIncidentById={() => setCurrentTab('incidents')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            user={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>
    </div>
  );
}
