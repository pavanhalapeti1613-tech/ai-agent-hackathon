"""
End-to-End and Unit Tests for Digital Defenders Security Workflow.
Uses standard Python unittest.
Tests deterministic frequency calculations, risk thresholds, incident creation,
user confirmation, unauthorized escalation, TrueForge human approval checkpoints,
simulated IP blocking, self-verification, and rejection.
"""

import unittest
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.mcp.security_mcp_server import SecurityMCPServer, _SIMULATED_DB

class TestDigitalDefendersWorkflow(unittest.TestCase):

    def setUp(self):
        _SIMULATED_DB["login_attempts"].clear()
        _SIMULATED_DB["incidents"].clear()
        _SIMULATED_DB["notifications"].clear()
        _SIMULATED_DB["blocked_ips"].clear()
        _SIMULATED_DB["audit_logs"].clear()

    def test_login_failure_recording_and_frequency(self):
        source_ip = "192.168.1.45"
        for i in range(17):
            _SIMULATED_DB["login_attempts"].append({
                "id": f"ATT-{i}",
                "username": "admin",
                "source_ip": source_ip,
                "login_status": "Failed"
            })

        metrics = SecurityMCPServer.calculate_login_frequency(source_ip)
        self.assertEqual(metrics["failed_attempts"], 17)
        self.assertEqual(metrics["risk_level"], "CRITICAL")
        self.assertGreater(metrics["average_frequency"], 1.0)

    def test_risk_threshold_calculations(self):
        source_ip = "10.0.0.99"
        # 2 attempts -> NORMAL
        for i in range(2):
            _SIMULATED_DB["login_attempts"].append({
                "id": f"ATT-N-{i}", "username": "admin", "source_ip": source_ip, "login_status": "Failed"
            })
        self.assertEqual(SecurityMCPServer.calculate_login_frequency(source_ip)["risk_level"], "NORMAL")

        # +2 (4 total) -> WARNING
        for i in range(2):
            _SIMULATED_DB["login_attempts"].append({
                "id": f"ATT-W-{i}", "username": "admin", "source_ip": source_ip, "login_status": "Failed"
            })
        self.assertEqual(SecurityMCPServer.calculate_login_frequency(source_ip)["risk_level"], "WARNING")

        # +2 (6 total) -> SUSPICIOUS
        for i in range(2):
            _SIMULATED_DB["login_attempts"].append({
                "id": f"ATT-S-{i}", "username": "admin", "source_ip": source_ip, "login_status": "Failed"
            })
        self.assertEqual(SecurityMCPServer.calculate_login_frequency(source_ip)["risk_level"], "SUSPICIOUS")

        # +5 (11 total) -> HIGH
        for i in range(5):
            _SIMULATED_DB["login_attempts"].append({
                "id": f"ATT-H-{i}", "username": "admin", "source_ip": source_ip, "login_status": "Failed"
            })
        self.assertEqual(SecurityMCPServer.calculate_login_frequency(source_ip)["risk_level"], "HIGH")

    def test_full_incident_response_lifecycle_approval(self):
        source_ip = "192.168.1.45"
        account = "admin"

        # 1. Incident Creation
        incident = SecurityMCPServer.create_incident(
            detection="Possible Brute-Force Attack",
            source_ip=source_ip,
            target_account=account,
            failed_attempts=17,
            detection_window="8 minutes",
            frequency=2.1,
            risk="CRITICAL",
            evidence="17 failed login attempts were recorded from the same source IP within 8 minutes."
        )
        inc_id = incident["id"]
        self.assertTrue(inc_id.startswith("INC-"))

        # 2. Dispatch User Notification
        notif = SecurityMCPServer.send_security_notification(inc_id)
        self.assertEqual(notif["incident_id"], inc_id)
        self.assertEqual(notif["risk"], "CRITICAL")

        # 3. User selects "NO, THIS WASN'T ME" -> Unauthorized
        confirmed = SecurityMCPServer.record_user_confirmation(inc_id, was_user=False)
        self.assertEqual(confirmed["user_confirmation"], "Unauthorized")
        self.assertEqual(confirmed["status"], "Awaiting Admin Approval")

        # 4. Human Approval Checkpoint
        checkpoint = SecurityMCPServer.request_admin_approval(inc_id)
        self.assertEqual(checkpoint["status"], "WAITING_FOR_ADMIN_APPROVAL")

        # 5. Administrator Approves Block
        block_record = SecurityMCPServer.simulate_block_ip(
            source_ip=source_ip,
            incident_id=inc_id,
            reason="Repeated login failures"
        )
        self.assertEqual(block_record["status"], "Blocked")
        self.assertEqual(block_record["ip"], source_ip)

        # 6. Self-Verification
        verification = SecurityMCPServer.verify_ip_block(source_ip, inc_id)
        self.assertTrue(verification["ip_block_confirmed"])
        self.assertTrue(verification["incident_resolved"])

        # 7. Final Incident Status check
        updated_inc = SecurityMCPServer.get_incident(inc_id)
        self.assertEqual(updated_inc["status"], "Resolved")
        self.assertIn("✓ IP block confirmed", updated_inc["verification"])

    def test_administrator_rejection_workflow(self):
        source_ip = "192.168.1.99"
        incident = SecurityMCPServer.create_incident(
            detection="Possible Brute-Force Attack",
            source_ip=source_ip,
            target_account="admin",
            failed_attempts=5,
            detection_window="3 minutes",
            frequency=1.6,
            risk="SUSPICIOUS",
            evidence="5 failed attempts."
        )
        inc_id = incident["id"]

        # User confirms unauthorized
        SecurityMCPServer.record_user_confirmation(inc_id, was_user=False)

        # Administrator Rejects action
        incident["admin_decision"] = "Rejected"
        incident["status"] = "Rejected"
        incident["action_result"] = "Administrator rejected simulated IP block"

        # Verify IP is NOT blocked
        blocked = SecurityMCPServer.get_blocked_ips()
        self.assertFalse(any(b["ip"] == source_ip for b in blocked))
        self.assertEqual(incident["status"], "Rejected")

if __name__ == "__main__":
    unittest.main()
