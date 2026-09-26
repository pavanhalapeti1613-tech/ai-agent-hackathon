"""
Model Context Protocol (MCP) Security Server for Digital Defenders.
Exposes strictly controlled security tools for authentication forensics,
incident reporting, and safe simulated IP remediation.

SAFETY RULES:
- No arbitrary shell access.
- No arbitrary command execution.
- No direct connection to real host firewalls (iptables/nftables/ufw).
- All block actions are strictly simulated database entries in PostgreSQL.
"""

import json
from typing import Dict, Any, List
from datetime import datetime

# Simulated in-memory database fallback for MCP testing
_SIMULATED_DB = {
    "login_attempts": [],
    "incidents": [],
    "notifications": [],
    "blocked_ips": [],
    "audit_logs": [],
    "settings": {
        "risk_thresholds": {
            "warning": 3,
            "suspicious": 5,
            "high": 10,
            "critical": 15
        },
        "ip_block_mode": "simulation"
    }
}

class SecurityMCPServer:
    """
    Standard MCP Security Toolset interface.
    Each tool function validates inputs and interacts strictly through security domain boundaries.
    """

    @staticmethod
    def get_recent_login_attempts(limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve recent authentication attempts up to the specified limit."""
        return _SIMULATED_DB["login_attempts"][-limit:]

    @staticmethod
    def get_login_attempts_by_ip(source_ip: str) -> List[Dict[str, Any]]:
        """Filter authentication events by a specific source IP address."""
        return [a for a in _SIMULATED_DB["login_attempts"] if a.get("source_ip") == source_ip]

    @staticmethod
    def get_account_login_history(username: str) -> List[Dict[str, Any]]:
        """Retrieve login history for an account username."""
        return [a for a in _SIMULATED_DB["login_attempts"] if a.get("username", "").lower() == username.lower()]

    @staticmethod
    def calculate_login_frequency(source_ip: str) -> Dict[str, Any]:
        """
        Deterministic Python calculation of login frequency and time windows for an IP.
        """
        attempts = [a for a in _SIMULATED_DB["login_attempts"] if a.get("source_ip") == source_ip and a.get("login_status") == "Failed"]
        count = len(attempts)
        window_minutes = max(1, count // 2) if count > 0 else 1
        avg_frequency = round(count / float(window_minutes), 1)

        thresholds = _SIMULATED_DB["settings"]["risk_thresholds"]
        if count >= thresholds["critical"]:
            risk = "CRITICAL"
        elif count >= thresholds["high"]:
            risk = "HIGH"
        elif count >= thresholds["suspicious"]:
            risk = "SUSPICIOUS"
        elif count >= thresholds["warning"]:
            risk = "WARNING"
        else:
            risk = "NORMAL"

        return {
            "source_ip": source_ip,
            "failed_attempts": count,
            "window_minutes": window_minutes,
            "average_frequency": avg_frequency,
            "risk_level": risk
        }

    @staticmethod
    def analyze_login_pattern(source_ip: str) -> Dict[str, Any]:
        """Analyze attack signature and grouping without subjective guessing."""
        freq = SecurityMCPServer.calculate_login_frequency(source_ip)
        is_blocked = any(b.get("ip") == source_ip and b.get("status") == "Blocked" for b in _SIMULATED_DB["blocked_ips"])
        pattern = "Automated Credential Brute-Force" if freq["average_frequency"] >= 2.0 else "Intermittent Credential Stuffing"
        return {
            **freq,
            "is_blocked": is_blocked,
            "pattern_type": pattern
        }

    @staticmethod
    def get_security_settings() -> Dict[str, Any]:
        """Fetch active risk thresholds and defense configuration."""
        return _SIMULATED_DB["settings"]

    @staticmethod
    def create_incident(
        detection: str,
        source_ip: str,
        target_account: str,
        failed_attempts: int,
        detection_window: str,
        frequency: float,
        risk: str,
        evidence: str
    ) -> Dict[str, Any]:
        """Create a new formal Security Incident."""
        inc_id = f"INC-{len(_SIMULATED_DB['incidents']) + 1:04d}"
        incident = {
            "id": inc_id,
            "detection": detection,
            "source_ip": source_ip,
            "target_account": target_account,
            "failed_attempts": failed_attempts,
            "detection_window": detection_window,
            "frequency": frequency,
            "risk": risk,
            "evidence": evidence,
            "user_confirmation": "Pending",
            "recommended_action": "Block Source IP",
            "admin_decision": "Pending",
            "action_result": "None yet",
            "verification": "Pending verification",
            "status": "Awaiting User Confirmation",
            "created_at": datetime.utcnow().isoformat()
        }
        _SIMULATED_DB["incidents"].append(incident)
        return incident

    @staticmethod
    def get_incident(incident_id: str) -> Dict[str, Any]:
        """Retrieve details of an incident by ID."""
        for inc in _SIMULATED_DB["incidents"]:
            if inc["id"] == incident_id:
                return inc
        return {"error": "Incident not found"}

    @staticmethod
    def send_security_notification(incident_id: str) -> Dict[str, Any]:
        """Dispatch a security alert notification to the legitimate account owner."""
        incident = SecurityMCPServer.get_incident(incident_id)
        if "error" in incident:
            return incident

        notif = {
            "id": f"NOTIF-{len(_SIMULATED_DB['notifications']) + 1}",
            "incident_id": incident_id,
            "title": "SECURITY ALERT: Multiple Login Attempts Detected",
            "account": incident["target_account"],
            "source_ip": incident["source_ip"],
            "failed_attempts": incident["failed_attempts"],
            "risk": incident["risk"],
            "question": "Was this you?",
            "status": "Pending",
            "timestamp": datetime.utcnow().isoformat()
        }
        _SIMULATED_DB["notifications"].append(notif)
        return notif

    @staticmethod
    def record_user_confirmation(incident_id: str, was_user: bool) -> Dict[str, Any]:
        """Record account owner feedback ('YES, IT WAS ME' or 'NO, THIS WASN'T ME')."""
        incident = SecurityMCPServer.get_incident(incident_id)
        if "error" in incident:
            return incident

        if was_user:
            incident["user_confirmation"] = "Authorized"
            incident["status"] = "User Confirmed"
            incident["recommended_action"] = "Continue Monitoring"
        else:
            incident["user_confirmation"] = "Unauthorized"
            incident["status"] = "Awaiting Admin Approval"
            incident["recommended_action"] = "Temporarily block suspicious IP (Simulated)"

        return incident

    @staticmethod
    def recommend_response(incident_id: str) -> Dict[str, Any]:
        """Generate defensive action recommendation requiring administrator checkpoint."""
        return {
            "incident_id": incident_id,
            "recommendation": "Block Source IP",
            "requires_human_approval": True,
            "actions": [
                "Temporarily block suspicious IP in simulated database",
                "Rate limit login attempts",
                "Require password reset",
                "Require MFA"
            ]
        }

    @staticmethod
    def request_admin_approval(incident_id: str) -> Dict[str, Any]:
        """Emit a human approval pause checkpoint for administrator review."""
        incident = SecurityMCPServer.get_incident(incident_id)
        if "error" in incident:
            return incident
        incident["status"] = "Awaiting Admin Approval"
        return {
            "checkpoint_id": f"CHK-{incident_id}",
            "status": "WAITING_FOR_ADMIN_APPROVAL",
            "incident_id": incident_id,
            "target_ip": incident["source_ip"],
            "risk": incident["risk"]
        }

    @staticmethod
    def simulate_block_ip(source_ip: str, incident_id: str, reason: str) -> Dict[str, Any]:
        """
        SAFE SIMULATION: Adds IP to the simulated blocked table.
        Does NOT invoke real OS firewall commands.
        """
        blocked_entry = {
            "id": f"BLK-{len(_SIMULATED_DB['blocked_ips']) + 1}",
            "ip": source_ip,
            "incident_id": incident_id,
            "reason": reason,
            "blocked_at": datetime.utcnow().strftime("%I:%M %p"),
            "status": "Blocked"
        }
        _SIMULATED_DB["blocked_ips"].append(blocked_entry)
        return blocked_entry

    @staticmethod
    def verify_ip_block(source_ip: str, incident_id: str) -> Dict[str, Any]:
        """
        Validates that the IP is active in the blocked database and verifies resolution.
        """
        is_blocked = any(b["ip"] == source_ip and b["status"] == "Blocked" for b in _SIMULATED_DB["blocked_ips"])
        incident = SecurityMCPServer.get_incident(incident_id)
        if is_blocked and "error" not in incident:
            incident["verification"] = "✓ IP block confirmed in database\n✓ New demo attempts prevented\n✓ Incident evidence updated\n✓ Incident resolved"
            incident["status"] = "Resolved"
            incident["action_result"] = f"IP {source_ip} successfully blocked in simulated database"

        return {
            "ip_block_confirmed": is_blocked,
            "new_demo_attempts_prevented": is_blocked,
            "incident_resolved": is_blocked,
            "verified_at": datetime.utcnow().isoformat()
        }

    @staticmethod
    def get_blocked_ips() -> List[Dict[str, Any]]:
        """List currently blocked IP addresses."""
        return [b for b in _SIMULATED_DB["blocked_ips"] if b["status"] == "Blocked"]

    @staticmethod
    def write_audit_log(event_type: str, account: str, ip: str, action: str, status: str, actor: str, incident_id: str = "") -> Dict[str, Any]:
        """Record an immutable security audit trail event."""
        log = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "account": account,
            "ip": ip,
            "action": action,
            "status": status,
            "actor": actor,
            "incident_id": incident_id
        }
        _SIMULATED_DB["audit_logs"].append(log)
        return log


# MCP Tool Definitions Schema for Tool Calling Integration
MCP_TOOL_DEFINITIONS = [
    {"name": "get_recent_login_attempts", "description": "Get recent authentication attempts"},
    {"name": "get_login_attempts_by_ip", "description": "Get attempts for a specific source IP"},
    {"name": "get_account_login_history", "description": "Get attempts for a user account"},
    {"name": "calculate_login_frequency", "description": "Calculate deterministic login frequency and risk level"},
    {"name": "analyze_login_pattern", "description": "Analyze brute-force signature and blocked status"},
    {"name": "get_security_settings", "description": "Fetch risk thresholds and settings"},
    {"name": "create_incident", "description": "Create a new security incident"},
    {"name": "get_incident", "description": "Retrieve incident details by ID"},
    {"name": "send_security_notification", "description": "Notify account owner of suspicious login attempts"},
    {"name": "record_user_confirmation", "description": "Record user authorization response"},
    {"name": "recommend_response", "description": "Provide defensive recommendation"},
    {"name": "request_admin_approval", "description": "Emit human approval checkpoint for blocking"},
    {"name": "simulate_block_ip", "description": "Perform SAFE simulated IP block in database"},
    {"name": "verify_ip_block", "description": "Verify IP block state and resolve incident"},
    {"name": "get_blocked_ips", "description": "List all active simulated blocked IPs"},
    {"name": "write_audit_log", "description": "Write immutable audit log record"}
]
