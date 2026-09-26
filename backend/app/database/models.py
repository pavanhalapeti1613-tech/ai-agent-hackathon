"""
SQLAlchemy Database Models for Digital Defenders PostgreSQL Database.
Includes tables and indexes for users, login attempts, incidents, notifications,
blocked IPs, audit logs, user confirmations, and system settings.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    Index
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    salt = Column(String, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, default="")
    role = Column(String, default="SOC Analyst")
    mfa_enabled = Column(Boolean, default=True)
    in_app_notif = Column(Boolean, default=True)
    email_notif = Column(Boolean, default=True)
    sms_notif = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    source_ip = Column(String, index=True, nullable=False)
    login_status = Column(String, nullable=False)  # "Success" or "Failed"
    user_agent = Column(String, default="")
    is_synthetic = Column(Boolean, default=False)

    __table_args__ = (
        Index("idx_ip_status_time", "source_ip", "login_status", "timestamp"),
    )

class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    id = Column(String, primary_key=True, index=True)
    detection = Column(String, nullable=False)
    source_ip = Column(String, index=True, nullable=False)
    target_account = Column(String, index=True, nullable=False)
    failed_attempts = Column(Integer, default=0)
    detection_window = Column(String, default="8 minutes")
    frequency = Column(Float, default=0.0)
    risk = Column(String, default="NORMAL")
    evidence = Column(Text, default="")
    user_confirmation = Column(String, default="Pending")
    recommended_action = Column(String, default="Block Source IP")
    admin_decision = Column(String, default="Pending")
    action_result = Column(String, default="None")
    verification = Column(Text, default="")
    status = Column(String, index=True, default="Detected")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    checkpoint_id = Column(String, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    target_account = Column(String, index=True, nullable=False)
    source_ip = Column(String, nullable=False)
    failed_attempts = Column(Integer, default=0)
    risk = Column(String, default="NORMAL")
    status = Column(String, index=True, default="Pending")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    email_subject = Column(String, default="")
    email_body = Column(Text, default="")

class BlockedIP(Base):
    __tablename__ = "blocked_ips"

    id = Column(String, primary_key=True, index=True)
    ip = Column(String, unique=True, index=True, nullable=False)
    reason = Column(String, nullable=False)
    failed_attempts = Column(Integer, default=0)
    risk = Column(String, default="CRITICAL")
    blocked_at = Column(String, nullable=False)
    status = Column(String, index=True, default="Blocked")
    incident_id = Column(String, index=True, default="")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    event_type = Column(String, index=True, nullable=False)
    account = Column(String, index=True, nullable=False)
    ip = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False)
    status = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    incident_id = Column(String, index=True, nullable=True)
    details = Column(Text, nullable=True)

class UserConfirmation(Base):
    __tablename__ = "user_confirmations"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, index=True, nullable=False)
    account = Column(String, index=True, nullable=False)
    decision = Column(String, nullable=False)  # "Authorized" or "Unauthorized"
    timestamp = Column(DateTime, default=datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True)
    value_json = Column(Text, nullable=False)
