"""
Pydantic schemas for the Request (blood request) collection.

MongoDB document shape:
{
    "_id":                  ObjectId,
    "hospital_id":          ObjectId (ref → hospitals),
    "required_blood_group": BloodGroup,
    "urgency":              Urgency,
    "units_needed":         int,
    "status":               RequestStatus,
    "notes":                str | None,
    "created_at":           datetime,
    "updated_at":           datetime
}
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

from ..enums import BloodGroup, Urgency, RequestStatus


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class RequestCreate(BaseModel):
    """Payload for POST /requests — create a new blood request."""
    hospital_id:          str        = Field(..., description="MongoDB ObjectId of the requesting hospital")
    required_blood_group: BloodGroup = Field(..., description="Blood group required")
    urgency:              Urgency    = Field(..., description="Urgency level")
    units_needed:         int        = Field(1, ge=1, description="Number of blood units needed (≥ 1)")
    notes:                Optional[str] = Field(None, description="Additional notes (optional)")


class RequestUpdate(BaseModel):
    """Payload for PUT /requests/{id} — partial update."""
    hospital_id:          Optional[str]           = None
    required_blood_group: Optional[BloodGroup]    = None
    urgency:              Optional[Urgency]        = None
    units_needed:         Optional[int]            = Field(None, ge=1)
    request_status:       Optional[RequestStatus]  = Field(None, alias="status")
    notes:                Optional[str]            = None

    model_config = {"populate_by_name": True}


class RequestResponse(BaseModel):
    """Shape returned by all blood-request endpoints."""
    id:                   str
    hospital_id:          str
    hospital_name:        Optional[str]   = None
    required_blood_group: BloodGroup
    urgency:              Urgency
    units_needed:         int
    status:               RequestStatus
    notes:                Optional[str]   = None
    created_at:           datetime
    updated_at:           datetime

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# MongoDB document → RequestResponse dict
# ---------------------------------------------------------------------------

def request_helper(req: dict, hospital_name: Optional[str] = None) -> dict:
    """Serialize a raw MongoDB request document to a RequestResponse-compatible dict."""
    return {
        "id":                   str(req["_id"]),
        "hospital_id":          str(req["hospital_id"]),
        "hospital_name":        hospital_name,
        "required_blood_group": req["required_blood_group"],
        "urgency":              req["urgency"],
        "units_needed":         req.get("units_needed", 1),
        "status":               req.get("status", RequestStatus.PENDING),
        "notes":                req.get("notes"),
        "created_at":           req["created_at"],
        "updated_at":           req["updated_at"],
    }
