"""
Hospital routes
===============

Endpoints
---------
POST   /hospitals/              Register a new hospital
GET    /hospitals/              List all hospitals
GET    /hospitals/{hospital_id} Get a single hospital by ID
PUT    /hospitals/{hospital_id} Update a hospital
DELETE /hospitals/{hospital_id} Delete a hospital
"""
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..database import get_db
from ..models.hospital import HospitalCreate, HospitalResponse, HospitalUpdate, hospital_helper

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _validate_object_id(oid: str, label: str = "ID") -> ObjectId:
    if not ObjectId.is_valid(oid):
        raise HTTPException(status_code=400, detail=f"Invalid {label}: '{oid}'")
    return ObjectId(oid)


# ---------------------------------------------------------------------------
# POST /hospitals/  — Register a hospital
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=HospitalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new hospital",
)
async def register_hospital(hospital: HospitalCreate, db=Depends(get_db)):
    """
    Register a new hospital that can later create blood requests.

    Required fields: **name**, **location** (address, city, state, pincode),
    **contact** (phone). Email and website are optional.
    """
    hospital_dict = hospital.model_dump()
    hospital_dict["created_at"] = datetime.now(timezone.utc)
    result = await db.hospitals.insert_one(hospital_dict)
    created = await db.hospitals.find_one({"_id": result.inserted_id})
    return hospital_helper(created)


# ---------------------------------------------------------------------------
# GET /hospitals/  — List all hospitals
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=List[HospitalResponse],
    summary="List all registered hospitals",
)
async def list_hospitals(
    city: Optional[str] = Query(None, description="Case-insensitive city filter"),
    db=Depends(get_db),
):
    query: dict = {}
    if city:
        query["location.city"] = {"$regex": city.strip(), "$options": "i"}
    return [hospital_helper(h) async for h in db.hospitals.find(query).sort("name", 1)]


# ---------------------------------------------------------------------------
# GET /hospitals/{hospital_id}  — Single hospital
# ---------------------------------------------------------------------------

@router.get(
    "/{hospital_id}",
    response_model=HospitalResponse,
    summary="Get a hospital by ID",
)
async def get_hospital(hospital_id: str, db=Depends(get_db)):
    oid = _validate_object_id(hospital_id, "hospital ID")
    hospital = await db.hospitals.find_one({"_id": oid})
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found.")
    return hospital_helper(hospital)


# ---------------------------------------------------------------------------
# PUT /hospitals/{hospital_id}  — Update a hospital
# ---------------------------------------------------------------------------

@router.put(
    "/{hospital_id}",
    response_model=HospitalResponse,
    summary="Update hospital details",
)
async def update_hospital(hospital_id: str, hospital: HospitalUpdate, db=Depends(get_db)):
    oid = _validate_object_id(hospital_id, "hospital ID")
    update_data = hospital.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=422, detail="No fields provided for update.")

    result = await db.hospitals.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found.")

    updated = await db.hospitals.find_one({"_id": oid})
    return hospital_helper(updated)


# ---------------------------------------------------------------------------
# DELETE /hospitals/{hospital_id}  — Delete a hospital
# ---------------------------------------------------------------------------

@router.delete(
    "/{hospital_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a hospital",
)
async def delete_hospital(hospital_id: str, db=Depends(get_db)):
    oid = _validate_object_id(hospital_id, "hospital ID")
    result = await db.hospitals.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found.")
