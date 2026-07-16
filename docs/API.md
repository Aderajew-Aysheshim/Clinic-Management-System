# ClinicCare API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** Bearer Token (JWT) in `Authorization` header

---

## Authentication

### POST /api/auth/login

Authenticate admin user and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "admin"
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

## Dashboard

### GET /api/patients/dashboard

Get total patients and today's appointment count.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "totalPatients": 15,
  "todayAppointments": 3
}
```

---

## Patients

### GET /api/patients

List all patients.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "fullname": "John Doe",
    "gender": "Male",
    "age": 30,
    "phone": "+251911223344",
    "address": "Addis Ababa",
    "created_at": "2026-07-16T10:00:00.000Z"
  }
]
```

### GET /api/patients/:id

Get a single patient by ID.

**Response (200):**
```json
{
  "id": 1,
  "fullname": "John Doe",
  "gender": "Male",
  "age": 30,
  "phone": "+251911223344",
  "address": "Addis Ababa"
}
```

### POST /api/patients

Create a new patient.

**Request:**
```json
{
  "fullname": "Jane Smith",
  "gender": "Female",
  "age": 25,
  "phone": "+251922334455",
  "address": "Bole, Addis Ababa"
}
```

**Response (201):**
```json
{
  "id": 2,
  "fullname": "Jane Smith",
  "gender": "Female",
  "age": 25,
  "phone": "+251922334455",
  "address": "Bole, Addis Ababa",
  "created_at": "2026-07-16T11:00:00.000Z"
}
```

### PUT /api/patients/:id

Update an existing patient.

**Request:**
```json
{
  "fullname": "Jane Smith Updated",
  "gender": "Female",
  "age": 26,
  "phone": "+251922334455",
  "address": "Kazanchis, Addis Ababa"
}
```

**Response (200):** Updated patient object.

### DELETE /api/patients/:id

Delete a patient.

**Response (200):**
```json
{
  "message": "Patient deleted"
}
```

---

## Appointments

### GET /api/appointments

List all appointments with patient names.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "appointment_date": "2026-07-20T00:00:00.000Z",
    "reason": "Annual checkup",
    "status": "Pending",
    "patient_name": "John Doe",
    "created_at": "2026-07-16T10:00:00.000Z"
  }
]
```

### POST /api/appointments

Book a new appointment.

**Request:**
```json
{
  "patient_id": 1,
  "appointment_date": "2026-07-20",
  "reason": "Follow-up consultation"
}
```

**Response (201):** Created appointment object.

### PUT /api/appointments/:id

Update appointment status.

**Request:**
```json
{
  "status": "Completed"
}
```

**Response (200):** Updated appointment object.

### DELETE /api/appointments/:id

Cancel/delete an appointment.

**Response (200):**
```json
{
  "message": "Appointment deleted"
}
```

---

## Health Check

### GET /api/health

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-07-16T12:00:00.000Z"
}
```

---

## Rate Limits

| Endpoint              | Limit                 |
|-----------------------|-----------------------|
| All /api/*            | 100 requests / 15 min |
| POST /api/auth/login  | 10 requests / 15 min  |

## Error Codes

| Code | Meaning              |
|------|----------------------|
| 400  | Bad request          |
| 401  | Unauthorized         |
| 404  | Not found            |
| 429  | Too many requests    |
| 500  | Internal server error|
