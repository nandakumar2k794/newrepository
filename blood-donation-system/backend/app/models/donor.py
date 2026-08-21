"""
Pydantic schemas for the Donor collection.

MongoDB document shape:
{
    "_id":          ObjectId,
    "name":         str,
    "blood_group":  BloodGroup (e.g. "O+"),
    "location":     { "city", "state", "pincode" },
    "contact":      { "phone", "email?" },
    "is_available": bool,
    "last_donated": datetime | None,
    "created_at":   datetime
}
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

from ..enums import BloodGroup


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class DonorLocation(BaseModel):
    city:    str = Field(..., min_length=1, description="City of the donor")
    state:   str = Field(..., min_length=1, description="State of the donor")
    pincode: str = Field(..., pattern=r"^\d{6}$", description="6-digit Indian pincode")


class DonorContact(BaseModel):
    phone: str   = Field(..., description="Phone number")
    email: Optional[str] = Field(None, description="Email address (optional)")

    @field_validator("phone")
    @classmethod
    def phone_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Phone number cannot be empty.")
        return v.strip()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class DonorCreate(BaseModel):
    """Payload for POST /donors — register a new donor."""
    name:         str          = Field(..., min_length=1, description="Full name of the donor")
    blood_group:  BloodGroup   = Field(..., description="ABO/Rh blood group")
    location:     DonorLocation
    contact:      DonorContact
    is_available: bool         = Field(True,  description="Whether the donor is currently available")
    last_donated: Optional[datetime] = Field(None, description="Date of last donation (ISO-8601)")


class DonorUpdate(BaseModel):
    """Payload for PUT /donors/{id} — partial update (all fields optional)."""
    name:         Optional[str]          = None
    blood_group:  Optional[BloodGroup]   = None
    location:     Optional[DonorLocation] = None
    contact:      Optional[DonorContact]  = None
    is_available: Optional[bool]         = None
    last_donated: Optional[datetime]     = None


class DonorResponse(BaseModel):
    """Shape returned by all donor endpoints."""
    id:           str
    name:         str
    blood_group:  BloodGroup
    location:     DonorLocation
    contact:      DonorContact
    is_available: bool
    last_donated: Optional[datetime] = None
    created_at:   datetime

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# MongoDB document → DonorResponse dict
# ---------------------------------------------------------------------------

def donor_helper(donor: dict) -> dict:
    """Serialize a raw MongoDB donor document to a DonorResponse-compatible dict."""
    return {
        "id":           str(donor["_id"]),
        "name":         donor["name"],
        "blood_group":  donor["blood_group"],
        "location":     donor["location"],
        "contact":      donor["contact"],
        "is_available": donor.get("is_available", True),
        "last_donated": donor.get("last_donated"),
        "created_at":   donor["created_at"],
    }
