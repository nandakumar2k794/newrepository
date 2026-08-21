"""
Shared enumerations used across multiple models.
Centralised here to avoid duplication between donor and request modules.
"""
from enum import Enum


class BloodGroup(str, Enum):
    A_POS  = "A+"
    A_NEG  = "A-"
    B_POS  = "B+"
    B_NEG  = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS  = "O+"
    O_NEG  = "O-"


class Urgency(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


class RequestStatus(str, Enum):
    PENDING   = "pending"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"
