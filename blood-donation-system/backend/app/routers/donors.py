"""
Donor routes
============

Endpoints
---------
POST   /donors/               Register a new donor
GET    /donors/               List all donors  (optional filter: blood_group, city)
GET    /donors/search         Advanced donor search  ← primary search endpoint
GET    /donors/{donor_id}     Get a single donor by ID
PUT    /donors/{donor_id}     Update a donor
DELETE /donors/{donor_id}     Delete a donor
"""
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..database import get_db
from ..enums import BloodGroup
from ..models.donor import DonorCreate, DonorResponse, DonorUpdate, donor_helper

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _validate_object_id(oid: str, label: str = "ID") -> ObjectId:
    if not ObjectId.is_valid(oid):
        raise HTTPException(status_code=400, detail=f"Invalid {label}: '{oid}'")
    return ObjectId(oid)


# ---------------------------------------------------------------------------
# POST /donors/  — Register a donor
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=DonorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new blood donor",
)
async def register_donor(donor: DonorCreate, db=Depends(get_db)):
    """
    Register a new blood donor with name, blood group, location, and contact info.

    - **blood_group**: one of A+, A-, B+, B-, AB+, AB-, O+, O-
    - **is_available**: defaults to `true`
    """
    donor_dict = donor.model_dump()
    donor_dict["created_at"] = datetime.now(timezone.utc)
    result = await db.donors.insert_one(donor_dict)
    created = await db.donors.find_one({"_id": result.inserted_id})
    return donor_helper(created)


# ---------------------------------------------------------------------------
# GET /donors/search  — Advanced donor search (MUST come before /{donor_id})
# ---------------------------------------------------------------------------

@router.get(
    "/search",
    response_model=List[DonorResponse],
    summary="Search donors by blood group, city, state, and/or availability",
)
async def search_donors(
    blood_group:  Optional[BloodGroup] = Query(None,  description="Filter by blood group (e.g. O+)"),
    city:         Optional[str]        = Query(None,  description="Case-insensitive city filter"),
    state:        Optional[str]        = Query(None,  description="Case-insensitive state filter"),
    is_available: Optional[bool]       = Query(None,  description="Filter by donation availability"),
    pincode:      Optional[str]        = Query(None,  description="Filter by exact pincode"),
    limit:        int                  = Query(50,   ge=1, le=200, description="Max results to return"),
    skip:         int                  = Query(0,    ge=0,         description="Results to skip (pagination)"),
    db=Depends(get_db),
):
    """
    **Primary donor search endpoint.**

    Supports combining multiple filters:
    - `blood_group=O+` — only donors with O+ blood
    - `is_available=true` — only available donors
    - `city=Chennai` — case-insensitive city match
    - `state=Tamil+Nadu` — case-insensitive state match
    - `pincode=600001` — exact pincode match
    - `limit` / `skip` — pagination

    All filter parameters are optional and can be combined freely.
    Results are sorted by name ascending.
    """
    query: dict = {}

    if blood_group is not None:
        query["blood_group"] = blood_group.value

    if is_available is not None:
        query["is_available"] = is_available

    if city:
        query["location.city"] = {"$regex": city.strip(), "$options": "i"}

    if state:
        query["location.state"] = {"$regex": state.strip(), "$options": "i"}

    if pincode:
        query["location.pincode"] = pincode.strip()

    cursor = db.donors.find(query).sort("name", 1).skip(skip).limit(limit)
    return [donor_helper(d) async for d in cursor]


# ---------------------------------------------------------------------------
# GET /donors/  — List all donors (simple filter shorthand)
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=List[DonorResponse],
    summary="List all donors with optional blood-group / city filter",
)
async def list_donors(
    blood_group: Optional[BloodGroup] = Query(None, description="Filter by blood group"),
    city:        Optional[str]        = Query(None, description="Case-insensitive city filter"),
    db=Depends(get_db),
):
    """
    Returns all donors.  For richer filtering (availability, state, pagination)
    use **GET /donors/search** instead.
    """
    query: dict = {}
    if blood_group:
        query["blood_group"] = blood_group.value
    if city:
        query["location.city"] = {"$regex": city.strip(), "$options": "i"}

    return [donor_helper(d) async for d in db.donors.find(query).sort("name", 1)]


# ---------------------------------------------------------------------------
# GET /donors/{donor_id}  — Single donor
# ---------------------------------------------------------------------------

@router.get(
    "/{donor_id}",
    response_model=DonorResponse,
    summary="Get a donor by ID",
)
async def get_donor(donor_id: str, db=Depends(get_db)):
    oid = _validate_object_id(donor_id, "donor ID")
    donor = await db.donors.find_one({"_id": oid})
    if not donor:
        raise HTTPException(status_code=404, detail=f"Donor '{donor_id}' not found.")
    return donor_helper(donor)


# ---------------------------------------------------------------------------
# PUT /donors/{donor_id}  — Update a donor
# ---------------------------------------------------------------------------

@router.put(
    "/{donor_id}",
    response_model=DonorResponse,
    summary="Update donor details",
)
async def update_donor(donor_id: str, donor: DonorUpdate, db=Depends(get_db)):
    oid = _validate_object_id(donor_id, "donor ID")

    # Only include fields that were explicitly set
    update_data = donor.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=422, detail="No fields provided for update.")

    result = await db.donors.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Donor '{donor_id}' not found.")

    updated = await db.donors.find_one({"_id": oid})
    return donor_helper(updated)


# ---------------------------------------------------------------------------
# DELETE /donors/{donor_id}  — Delete a donor
# ---------------------------------------------------------------------------

@router.delete(
    "/{donor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a donor",
)
async def delete_donor(donor_id: str, db=Depends(get_db)):
    oid = _validate_object_id(donor_id, "donor ID")
    result = await db.donors.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Donor '{donor_id}' not found.")
