"""
Pydantic schemas for the Hospital collection.

MongoDB document shape:
{
    "_id":      ObjectId,
    "name":     str,
    "location": { "address", "city", "state", "pincode" },
    "contact":  { "phone", "email?", "website?" },
    "created_at": datetime
}
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class HospitalLocation(BaseModel):
    address: str = Field(..., min_length=1, description="Street address")
    city:    str = Field(..., min_length=1, description="City")
    state:   str = Field(..., min_length=1, description="State")
    pincode: str = Field(..., pattern=r"^\d{6}$", description="6-digit Indian pincode")


class HospitalContact(BaseModel):
    phone:   str            = Field(..., description="Primary phone number")
    email:   Optional[str]  = Field(None, description="Email address (optional)")
    website: Optional[str]  = Field(None, description="Website URL (optional)")


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class HospitalCreate(BaseModel):
    """Payload for POST /hospitals — register a new hospital."""
    name:     str              = Field(..., min_length=1, description="Hospital name")
    location: HospitalLocation
    contact:  HospitalContact


class HospitalUpdate(BaseModel):
    """Payload for PUT /hospitals/{id} — partial update."""
    name:     Optional[str]              = None
    location: Optional[HospitalLocation] = None
    contact:  Optional[HospitalContact]  = None


class HospitalResponse(BaseModel):
    """Shape returned by all hospital endpoints."""
    id:         str
    name:       str
    location:   HospitalLocation
    contact:    HospitalContact
    created_at: datetime

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# MongoDB document → HospitalResponse dict
# ---------------------------------------------------------------------------

def hospital_helper(hospital: dict) -> dict:
    """Serialize a raw MongoDB hospital document to a HospitalResponse-compatible dict."""
    return {
        "id":         str(hospital["_id"]),
        "name":       hospital["name"],
        "location":   hospital["location"],
        "contact":    hospital["contact"],
        "created_at": hospital["created_at"],
    }
