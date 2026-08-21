# 🩸 BloodLink — Blood Donation Management System

A full-stack MVP for managing blood donors, hospitals, and blood requests.

**Stack**: React + Vite · FastAPI · MongoDB

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API runs at → http://localhost:8000  
Swagger UI  → http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at → http://localhost:5173

---

## 📁 Project Structure

```
blood-donation-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings (MongoDB URL)
│   │   ├── database.py      # Motor async client
│   │   ├── models/          # Pydantic schemas
│   │   └── routers/         # CRUD routes
│   ├── requirements.txt
│   └── .env                 # MongoDB connection string
└── frontend/
    ├── src/
    │   ├── api/client.js    # Axios API functions
    │   ├── components/      # Reusable cards, Navbar
    │   └── pages/           # Dashboard, Donors, Hospitals, Requests
    ├── package.json
    └── vite.config.js       # Proxy to FastAPI
```

---

## 🗄️ MongoDB Collections

| Collection  | Key Fields                                        |
|-------------|---------------------------------------------------|
| `donors`    | name, blood_group, location, contact, is_available |
| `hospitals` | name, location, contact                           |
| `requests`  | hospital_id, required_blood_group, urgency, status |

---

## 🔌 API Endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/donors`             | List donors (filter: blood_group, city) |
| POST   | `/donors`             | Add donor                      |
| PUT    | `/donors/{id}`        | Update donor                   |
| DELETE | `/donors/{id}`        | Delete donor                   |
| GET    | `/hospitals`          | List hospitals                 |
| POST   | `/hospitals`          | Add hospital                   |
| PUT    | `/hospitals/{id}`     | Update hospital                |
| DELETE | `/hospitals/{id}`     | Delete hospital                |
| GET    | `/requests`           | List requests (filter: blood_group, urgency, status) |
| POST   | `/requests`           | Create request                 |
| PUT    | `/requests/{id}`      | Update request / fulfill       |
| DELETE | `/requests/{id}`      | Delete request                 |

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=blood_donation_db
```
