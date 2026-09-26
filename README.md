# Digital Defenders – AI Incident Response Agent

> An enterprise-grade, autonomous cybersecurity incident response agent that detects repeated failed login attempts, conducts deterministic frequency analysis, notifies the legitimate account owner, escalates unauthorized activity, recommends defensive mitigation, halts at a **TrueForge Human Approval Checkpoint**, performs safe simulated IP blocking, verifies post-remediation database state, and resolves security incidents.

---

## 🛡️ Architecture Overview

```
                      React Frontend
                            ↓
                     FastAPI Backend
                            ↓
                 TrueForge Agent Harness
                            ↓
                    Gemini 3.8 Flash
                            ↓
                    MCP Security Tools
                            ↓
                   PostgreSQL Database
                            ↓
                Human Approval Checkpoint
                            ↓
                     Simulated IP Block
                            ↓
                    Self-Verification
                            ↓
                    Incident Resolution
```

### Architectural Responsibilities

| Component | Role | Details |
|---|---|---|
| **TrueForge** | **Agent Harness** | Manages agent execution lifecycle, session context, tool invocation boundaries, and stateful human approval checkpoints. |
| **Gemini 3.8 Flash** | **Reasoning Layer** | Synthesizes threat evidence, attacks signatures, and incident justification without subjective numerical hallucination. |
| **MCP** | **Tool Interface** | Model Context Protocol exposing 16 controlled security tools (`simulate_block_ip`, `calculate_login_frequency`, etc.). |
| **FastAPI** | **Application Backend** | Serves REST endpoints for authentication, telemetry, incident management, and orchestrates the agent workflow. |
| **PostgreSQL** | **Persistent Database** | Stores `users`, `login_attempts`, `security_incidents`, `notifications`, `blocked_ips`, and `audit_logs` with B-Tree indexes. |
| **Human Approval** | **Governance Barrier** | TrueForge checkpoint that blocks automated IP remediation until a SOC Administrator explicitly authorizes it. |
| **Simulated IP Block** | **Safe Remediation** | Modifies the database blacklist only (`IP_BLOCK_MODE=simulation`); host firewall remains untouched. |
| **Verification** | **Integrity Audit** | Verifies database state and prevents subsequent authentication ingress from the blocked source. |

---

## 🔒 The Core Security Agent Workflow

```
LOGIN ATTEMPT
     ↓
AUTHENTICATION EVENT
     ↓
AI INVESTIGATION
     ↓
FREQUENCY ANALYSIS (Deterministic)
     ↓
SUSPICIOUS IP DETECTED
     ↓
RISK ASSESSMENT (NORMAL → CRITICAL)
     ↓
INCIDENT CREATED
     ↓
USER SECURITY NOTIFICATION
     ↓
USER CONFIRMATION ("NO, THIS WASN'T ME")
     ↓
AI RECOMMENDATION ("Block Source IP")
     ↓
TRUEFORGE HUMAN APPROVAL CHECKPOINT (PAUSED)
     ↓
ADMINISTRATOR APPROVES
     ↓
SIMULATED IP BLOCK
     ↓
POST-ACTION VERIFICATION
     ↓
INCIDENT RESOLVED
```

---

## 🚀 Quick Start Guide

### 1. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration:

```env
# AI Studio injects GEMINI_API_KEY automatically at runtime
GEMINI_API_KEY="your-gemini-api-key"

# TrueForge Agent Harness URL
TRUEFORGE_URL="http://localhost:8790"

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_defenders"

# Security and Demo Settings
DEMO_MODE=true
IP_BLOCK_MODE=simulation
DEVELOPER_EMAIL="pavanhalapeti75@gmail.com"

# Email service (Dispatches wrong password security incident alerts to developer email)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USERNAME=""
SMTP_PASSWORD=""
```

### 2. Running with Docker Compose

Run the entire stack (PostgreSQL, TrueForge Harness, FastAPI backend, and React frontend):

```bash
docker-compose up --build
```

Access points:
- **Web Console**: `http://localhost:3000`
- **FastAPI Backend Docs**: `http://localhost:8000/docs`
- **TrueForge Harness**: `http://localhost:8790`
- **PostgreSQL**: `localhost:5432`

### 3. Local Development Mode

#### Frontend & Express Bridge (Port 3000)
```bash
npm install
npm run dev
```

#### Python FastAPI Backend (Port 8000)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🧪 Testing the Security Engine

Run the automated test suite verifying deterministic calculations, risk escalation, checkpoints, simulated blocking, and administrative rejection:

```bash
python3 -m unittest backend/tests/test_agent_workflow.py
```

Expected output:
```
....
----------------------------------------------------------------------
Ran 4 tests in 0.001s

OK
```

---

## 🔑 Demo Credentials

- **Username**: `admin`
- **Password**: `admin123`
*(Clearly marked as DEMO ONLY in the portal interface)*

---

## 🛡️ Model Context Protocol (MCP) Security Server

File: `backend/mcp/security_mcp_server.py`

Exposes 16 safe, controlled tools:
1. `get_recent_login_attempts`
2. `get_login_attempts_by_ip`
3. `get_account_login_history`
4. `calculate_login_frequency`
5. `analyze_login_pattern`
6. `get_security_settings`
7. `create_incident`
8. `get_incident`
9. `send_security_notification`
10. `record_user_confirmation`
11. `recommend_response`
12. `request_admin_approval`
13. `simulate_block_ip`
14. `verify_ip_block`
15. `get_blocked_ips`
16. `write_audit_log`

### Safety Guarantees:
- **No arbitrary shell execution**: The model cannot execute terminal or OS commands.
- **No arbitrary network calls**: Tools only interact with the defined application state.
- **No live firewall changes**: All mitigations are strictly isolated database entries.

---

## 📋 Security Limitations & Production Readiness

1. **Synthetic IP Addresses**: In production, trust only reverse-proxy validated headers (`X-Forwarded-For` with trusted upstream proxies) or TLS connection socket addresses.
2. **Simulation Mode**: IP blocking is simulated inside the application database to prevent accidental lockouts during demonstrations and evaluations.
3. **Fail-Safe Fallback**: If the TrueForge harness or Gemini model is temporarily unreachable, deterministic frequency monitoring and risk calculation continue uninterrupted with an explicit UI notice:
   `"AI Security Agent temporarily unavailable. Deterministic security monitoring continues."`
