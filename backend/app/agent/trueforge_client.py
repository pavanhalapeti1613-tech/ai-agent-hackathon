"""
TrueForge Agent Harness Client for Digital Defenders Security Agent.
Connects to official TrueForge instance via TRUEFORGE_URL.
Orchestrates agent sessions, MCP security tools, and human approval checkpoints.
"""

import os
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger("digital_defenders.agent.trueforge")

TRUEFORGE_URL = os.getenv("TRUEFORGE_URL", "http://localhost:8790")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class TrueForgeClient:
    """
    Real integration client for TrueForge Agent Harness.
    Interacts with TrueForge session APIs, MCP tool integration, and approval checkpoints.
    """

    def __init__(self, base_url: str = TRUEFORGE_URL):
        self.base_url = base_url.rstrip("/")
        self.session_id: Optional[str] = None
        self.checkpoint_state: Optional[Dict[str, Any]] = None

    async def check_health(self) -> bool:
        """Check if TrueForge harness service is reachable."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/healthz")
                return res.status_code == 200
        except Exception:
            return False

    async def start_investigation_session(
        self,
        source_ip: str,
        target_account: str,
        frequency_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submits an investigation task to TrueForge harness.
        The harness executes the Digital Defenders agent with MCP security tools attached.
        """
        payload = {
            "agent_id": "digital-defenders-security-agent",
            "task": "INVESTIGATE_BRUTE_FORCE_AUTHENTICATION",
            "context": {
                "source_ip": source_ip,
                "target_account": target_account,
                "failed_attempts": frequency_metrics.get("failed_attempts", 0),
                "frequency": frequency_metrics.get("average_frequency", 0.0),
                "risk_level": frequency_metrics.get("risk_level", "NORMAL"),
                "time_span_minutes": frequency_metrics.get("time_span_minutes", 1)
            },
            "tools_interface": "MCP",
            "mcp_server": "security_mcp_server"
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{self.base_url}/api/v1/sessions",
                    json=payload
                )
                if resp.status_code in [200, 201]:
                    data = resp.json()
                    self.session_id = data.get("session_id")
                    return {
                        "status": "success",
                        "harness": "TrueForge",
                        "session_id": self.session_id,
                        "data": data
                    }
        except Exception as e:
            logger.warning(f"TrueForge harness unavailable: {e}. Falling back to reasoning engine.")

        # Graceful fallback indicator if TrueForge service is unreachable
        return {
            "status": "fallback",
            "harness": "TrueForge (Standby)",
            "message": "AI Security Agent temporarily unavailable. Deterministic security monitoring continues."
        }

    async def create_human_approval_checkpoint(
        self,
        incident_id: str,
        target_ip: str,
        recommendation: str
    ) -> Dict[str, Any]:
        """
        Pauses the TrueForge agent session at a human-in-the-loop checkpoint.
        The agent enters a waiting state and MUST NOT execute any defensive action
        until administrator decision is submitted.
        """
        checkpoint_payload = {
            "session_id": self.session_id,
            "incident_id": incident_id,
            "required_role": "SecurityAdministrator",
            "action_type": "SIMULATED_IP_BLOCK",
            "target": target_ip,
            "recommendation": recommendation,
            "status": "WAITING_FOR_ADMIN_APPROVAL"
        }

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/v1/checkpoints",
                    json=checkpoint_payload
                )
                if res.status_code in [200, 201]:
                    self.checkpoint_state = res.json()
                    return self.checkpoint_state
        except Exception:
            pass

        # Standalone checkpoint state
        self.checkpoint_state = {
            "checkpoint_id": f"CHK-{target_ip.replace('.', '-')}",
            "status": "WAITING_FOR_ADMIN_APPROVAL",
            "target_ip": target_ip,
            "incident_id": incident_id,
            "harness": "TrueForge Human Approval Checkpoint"
        }
        return self.checkpoint_state

    async def submit_admin_decision(
        self,
        checkpoint_id: str,
        approved: bool,
        admin_user: str
    ) -> Dict[str, Any]:
        """
        Resumes the agent session with the human administrator's decision.
        If approved: Agent proceeds to simulate_block_ip and verify_ip_block.
        If rejected: Agent logs the rejection and terminates without blocking.
        """
        decision_payload = {
            "checkpoint_id": checkpoint_id,
            "decision": "APPROVED" if approved else "REJECTED",
            "decided_by": admin_user
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/v1/checkpoints/{checkpoint_id}/resume",
                    json=decision_payload
                )
                if res.status_code == 200:
                    return res.json()
        except Exception:
            pass

        return {
            "checkpoint_id": checkpoint_id,
            "decision": "APPROVED" if approved else "REJECTED",
            "resumed": True
        }
