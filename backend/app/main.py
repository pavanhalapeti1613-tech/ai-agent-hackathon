"""
FastAPI Application Backend for Digital Defenders – AI Incident Response Agent.
Coordinates TrueForge Agent Harness, MCP Security Tools, PostgreSQL persistence,
deterministic frequency engine, and human approval checkpoints.
"""

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

from backend.mcp.security_mcp_server import SecurityMCPServer, _SIMULATED_DB
from backend.app.agent.trueforge_client import TrueForgeClient

app = FastAPI(
    title="Digital Defenders – AI Incident Response Agent Backend",
    version="1.0.0",
    description="Enterprise Cybersecurity Incident Response Agent powered by TrueForge & Gemini"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

trueforge = TrueForgeClient()

# Schemas
class LoginRequest(BaseModel):
    username: str
    password: str
    sourceIp: Optional[str] = "127.0.0.1"

class SimulateLoginRequest(BaseModel):
    count: int = 1
    sourceIp: str = "192.168.1.45"
    username: str = "admin"

class ConfirmRequest(BaseModel):
    confirmedWasUser: bool

class AnalyzeRequest(BaseModel):
    sourceIp: str = "192.168.1.45"
    targetAccount: str = "admin"

# Endpoints
@app.post("/api/auth/login")
async def login(req: LoginRequest):
    # Check IP block status
    for b in _SIMULATED_DB["blocked_ips"]:
        if b.get("ip") == req.sourceIp and b.get("status") == "Blocked":
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Source IP {req.sourceIp} is blocked."
            )

    if req.username.lower() == "admin" and req.password == "admin123":
        return {
            "success": True,
            "user": {
                "id": "user-001",
                "username": "admin",
                "name": "Alex Rivera",
                "role": "Lead SOC Security Analyst"
            },
            "token": "token-fastapi-admin"
        }
    
    # Record failed attempt
    _SIMULATED_DB["login_attempts"].append({
        "id": f"ATT-{len(_SIMULATED_DB['login_attempts']) + 1}",
        "username": req.username,
        "timestamp": datetime.utcnow().isoformat(),
        "source_ip": req.sourceIp,
        "login_status": "Failed"
    })
    raise HTTPException(status_code=401, detail="Invalid username or password. Demo credentials: admin / admin123")

@app.post("/api/auth/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully"}

@app.get("/api/dashboard/stats")
async def get_stats():
    attempts = _SIMULATED_DB["login_attempts"]
    successful = len([a for a in attempts if a.get("login_status") == "Success"])
    failed = len([a for a in attempts if a.get("login_status") == "Failed"])
    active_incidents = len([i for i in _SIMULATED_DB["incidents"] if i.get("status") not in ["Resolved", "Rejected"]])
    blocked_count = len([b for b in _SIMULATED_DB["blocked_ips"] if b.get("status") == "Blocked"])
    return {
        "totalAttempts": len(attempts),
        "successfulLogins": successful,
        "failedLogins": failed,
        "suspiciousAttempts": failed,
        "activeIncidents": active_incidents,
        "blockedIps": blocked_count,
        "trueforgeUrl": os.getenv("TRUEFORGE_URL", "http://localhost:8790"),
        "hasGeminiKey": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.get("/api/login-attempts")
async def get_login_attempts():
    ips = set(a.get("source_ip") for a in _SIMULATED_DB["login_attempts"])
    frequency = [SecurityMCPServer.calculate_login_frequency(ip) for ip in ips]
    return {
        "attempts": _SIMULATED_DB["login_attempts"],
        "frequencyAnalysis": frequency
    }

@app.post("/api/security/analyze")
async def analyze_activity(req: AnalyzeRequest):
    metrics = SecurityMCPServer.calculate_login_frequency(req.sourceIp)
    tf_res = await trueforge.start_investigation_session(req.sourceIp, req.targetAccount, metrics)
    incident = SecurityMCPServer.create_incident(
        detection="Possible Brute-Force Attack",
        source_ip=req.sourceIp,
        target_account=req.targetAccount,
        failed_attempts=metrics["failed_attempts"],
        detection_window=f"{metrics['window_minutes']} minutes",
        frequency=metrics["average_frequency"],
        risk=metrics["risk_level"],
        evidence=f"{metrics['failed_attempts']} failed login attempts recorded within {metrics['window_minutes']} minutes."
    )
    SecurityMCPServer.send_security_notification(incident["id"])
    return {"success": True, "incident": incident, "trueforge": tf_res}

@app.get("/api/security/incidents")
async def list_incidents():
    return _SIMULATED_DB["incidents"]

@app.get("/api/security/incidents/{incident_id}")
async def get_incident(incident_id: str):
    inc = SecurityMCPServer.get_incident(incident_id)
    if "error" in inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@app.post("/api/security/incidents/{incident_id}/confirm")
async def confirm_incident(incident_id: str, req: ConfirmRequest):
    updated = SecurityMCPServer.record_user_confirmation(incident_id, req.confirmedWasUser)
    if not req.confirmedWasUser:
        checkpoint = await trueforge.create_human_approval_checkpoint(
            incident_id=incident_id,
            target_ip=updated["source_ip"],
            recommendation="Block Source IP"
        )
        return {"success": True, "incident": updated, "checkpoint": checkpoint}
    return {"success": True, "incident": updated}

@app.post("/api/security/incidents/{incident_id}/approve-block")
async def approve_block(incident_id: str):
    inc = SecurityMCPServer.get_incident(incident_id)
    if "error" in inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # 1. Resume TrueForge checkpoint
    await trueforge.submit_admin_decision(f"CHK-{incident_id}", approved=True, admin_user="admin")
    
    # 2. Execute simulated IP block
    block_record = SecurityMCPServer.simulate_block_ip(inc["source_ip"], incident_id, "Admin Approved Block")
    
    # 3. Post-action verification
    verification = SecurityMCPServer.verify_ip_block(inc["source_ip"], incident_id)
    
    return {
        "success": True,
        "incident": inc,
        "blockResult": block_record,
        "verification": verification
    }

@app.post("/api/security/incidents/{incident_id}/reject")
async def reject_block(incident_id: str):
    inc = SecurityMCPServer.get_incident(incident_id)
    if "error" in inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    inc["status"] = "Rejected"
    inc["admin_decision"] = "Rejected"
    await trueforge.submit_admin_decision(f"CHK-{incident_id}", approved=False, admin_user="admin")
    return {"success": True, "incident": inc}

@app.get("/api/notifications")
async def get_notifications():
    return _SIMULATED_DB["notifications"]

@app.get("/api/blocked-ips")
async def get_blocked_ips():
    return SecurityMCPServer.get_blocked_ips()

@app.post("/api/blocked-ips/{ip}/unblock")
async def unblock_ip(ip: str):
    for b in _SIMULATED_DB["blocked_ips"]:
        if b.get("ip") == ip and b.get("status") == "Blocked":
            b["status"] = "Unblocked"
            return {"success": True, "ip": ip}
    raise HTTPException(status_code=404, detail="Blocked IP not found")

@app.get("/api/logs")
async def get_logs():
    return _SIMULATED_DB["audit_logs"]

@app.get("/api/settings")
async def get_settings():
    return _SIMULATED_DB["settings"]

@app.put("/api/settings")
async def update_settings(new_settings: Dict[str, Any]):
    _SIMULATED_DB["settings"].update(new_settings)
    return {"success": True, "settings": _SIMULATED_DB["settings"]}

@app.get("/api/profile")
async def get_profile():
    return {
        "name": "Alex Rivera",
        "username": "admin",
        "email": "alex.rivera@digitaldefenders.sec",
        "role": "Lead SOC Security Analyst",
        "mfaStatus": "Enabled"
    }

@app.post("/api/demo/simulate-login")
async def simulate_login(req: SimulateLoginRequest):
    for i in range(req.count):
        _SIMULATED_DB["login_attempts"].append({
            "id": f"ATT-SIM-{len(_SIMULATED_DB['login_attempts']) + 1}",
            "username": req.username,
            "timestamp": datetime.utcnow().isoformat(),
            "source_ip": req.sourceIp,
            "login_status": "Failed",
            "is_synthetic": True
        })
    metrics = SecurityMCPServer.calculate_login_frequency(req.sourceIp)
    return {"success": True, "metrics": metrics, "added": req.count}

@app.post("/api/demo/reset")
async def reset_demo():
    _SIMULATED_DB["login_attempts"] = []
    _SIMULATED_DB["incidents"] = []
    _SIMULATED_DB["notifications"] = []
    _SIMULATED_DB["blocked_ips"] = []
    _SIMULATED_DB["audit_logs"] = []
    return {"success": True, "message": "Demo data reset successfully"}

@app.get("/api/agent/status")
async def agent_status():
    return {
        "harness": "TrueForge Agent Harness",
        "trueforgeUrl": os.getenv("TRUEFORGE_URL", "http://localhost:8790"),
        "mcpServerActive": True,
        "toolsAvailable": len(SecurityMCPServer.__dict__)
    }
