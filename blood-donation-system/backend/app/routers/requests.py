"""
Blood Request routes
====================

Endpoints
---------
POST   /requests/               Create a blood request
GET    /requests/               List requests  (filter: blood_group, urgency, status)
GET    /requests/{request_id}   Get a single request by ID
PUT    /requests/{request_id}   Update a request (including status change)
DELETE /requests/{request_id}   Delete a request
"""
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status

from ..database import get_db
from ..enums import BloodGroup, RequestStatus, Urgency
from ..models.request import RequestCreate, RequestResponse, RequestUpdate, request_helper

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _validate_object_id(oid: str, label: str = "ID") -> ObjectId:
    if not ObjectId.is_valid(oid):
        raise HTTPException(status_code=400, detail=f"Invalid {label}: '{oid}'")
    return ObjectId(oid)


async def _resolve_hospital(db, hospital_id: ObjectId) -> dict:
    """Fetch hospital document or raise 404."""
    hospital = await db.hospitals.find_one({"_id": hospital_id})
    if not hospital:
        raise HTTPException(
            status_code=404,
            detail=f"Hospital '{str(hospital_id)}' not found. Register the hospital first.",
        )
    return hospital


async def _get_hospital_name(db, hospital_id_str: str) -> Optional[str]:
    """Return hospital name for response enrichment (no exception if missing)."""
    if not ObjectId.is_valid(hospital_id_str):
        return None
    hospital = await db.hospitals.find_one({"_id": ObjectId(hospital_id_str)})
    return hospital["name"] if hospital else None


# ---------------------------------------------------------------------------
# POST /requests/  — Create a blood request
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=RequestResponse,
    status_code=http_status.HTTP_201_CREATED,
    summary="Create a blood request for a hospital",
)
async def create_blood_request(request: RequestCreate, db=Depends(get_db)):
    """
    Create a new blood request linked to a registered hospital.

    - **hospital_id**: ObjectId of an existing hospital (must exist)
    - **required_blood_group**: one of A+, A-, B+, B-, AB+, AB-, O+, O-
    - **urgency**: low | medium | high | critical
    - **units_needed**: positive integer (default 1)
    - **notes**: optional free-text notes

    New requests start with `status = pending`.
    """
    hosp_oid = _validate_object_id(request.hospital_id, "hospital ID")
    hospital = await _resolve_hospital(db, hosp_oid)

    now = datetime.now(timezone.utc)
    req_dict = request.model_dump()
    req_dict["hospital_id"] = hosp_oid        # store as ObjectId in MongoDB
    req_dict["status"]       = RequestStatus.PENDING.value
    req_dict["created_at"]   = now
    req_dict["updated_at"]   = now

    result  = await db.requests.insert_one(req_dict)
    created = await db.requests.find_one({"_id": result.inserted_id})
    return request_helper(created, hospital["name"])


# ---------------------------------------------------------------------------
# GET /requests/  — List / filter requests
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=List[RequestResponse],
    summary="List blood requests with optional filters",
)
async def list_requests(
    blood_group: Optional[BloodGroup]    = Query(None, description="Filter by required blood group"),
    urgency:     Optional[Urgency]       = Query(None, description="Filter by urgency level"),
    req_status:  Optional[RequestStatus] = Query(None, alias="status", description="Filter by request status"),
    db=Depends(get_db),
):
    """
    Returns blood requests sorted by creation date (newest first).

    Combine filters freely:
    - `blood_group=O+&status=pending` — pending O+ requests
    - `urgency=critical` — all critical requests regardless of blood group
    """
    query: dict = {}
    if blood_group:
        query["required_blood_group"] = blood_group.value
    if urgency:
        query["urgency"] = urgency.value
    if req_status:
        query["status"] = req_status.value

    results = []
    async for req in db.requests.find(query).sort("created_at", -1):
        hospital_name = await _get_hospital_name(db, str(req["hospital_id"]))
        results.append(request_helper(req, hospital_name))
    return results


# ---------------------------------------------------------------------------
# GET /requests/{request_id}  — Single request
# ---------------------------------------------------------------------------

@router.get(
    "/{request_id}",
    response_model=RequestResponse,
    summary="Get a blood request by ID",
)
async def get_request(request_id: str, db=Depends(get_db)):
    oid = _validate_object_id(request_id, "request ID")
    req = await db.requests.find_one({"_id": oid})
    if not req:
        raise HTTPException(status_code=404, detail=f"Request '{request_id}' not found.")
    hospital_name = await _get_hospital_name(db, str(req["hospital_id"]))
    return request_helper(req, hospital_name)


# ---------------------------------------------------------------------------
# PUT /requests/{request_id}  — Update / fulfil a request
# ---------------------------------------------------------------------------

@router.put(
    "/{request_id}",
    response_model=RequestResponse,
    summary="Update a blood request (including marking it fulfilled/cancelled)",
)
async def update_request(request_id: str, request: RequestUpdate, db=Depends(get_db)):
    """
    Partially update any field on a request.  To fulfil a request send:

    ```json
    { "status": "fulfilled" }
    ```
    """
    oid = _validate_object_id(request_id, "request ID")

    # Build update payload — only include fields that were sent
    update_data = request.model_dump(exclude_unset=True, by_alias=False)

    # Rename request_status → status for MongoDB
    if "request_status" in update_data:
        update_data["status"] = update_data.pop("request_status")
        if hasattr(update_data["status"], "value"):
            update_data["status"] = update_data["status"].value

    # Re-validate hospital if it's being changed
    if "hospital_id" in update_data:
        hosp_oid = _validate_object_id(update_data["hospital_id"], "hospital ID")
        await _resolve_hospital(db, hosp_oid)
        update_data["hospital_id"] = hosp_oid

    if not update_data:
        raise HTTPException(status_code=422, detail="No fields provided for update.")

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.requests.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Request '{request_id}' not found.")

    updated       = await db.requests.find_one({"_id": oid})
    hospital_name = await _get_hospital_name(db, str(updated["hospital_id"]))
    return request_helper(updated, hospital_name)


# ---------------------------------------------------------------------------
# DELETE /requests/{request_id}  — Delete a request
# ---------------------------------------------------------------------------

@router.delete(
    "/{request_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
    summary="Delete a blood request",
)
async def delete_request(request_id: str, db=Depends(get_db)):
    oid = _validate_object_id(request_id, "request ID")
    result = await db.requests.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Request '{request_id}' not found.")
