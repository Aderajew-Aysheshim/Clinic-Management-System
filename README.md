# ClinicCare - Simple Clinic Management System

A full-stack clinic management system built with React, Express, and PostgreSQL. Deployed on AWS ECS Fargate with CI/CD pipeline.

## Features

- **Admin Login** - Secure JWT authentication
- **Dashboard** - Total patients and today's appointments
- **Patient Management** - Add, view, edit, delete patients
- **Appointment Management** - Book, view, complete, cancel appointments

## Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | React, Vite, Tailwind CSS |
| Backend   | Node.js, Express   |
| Database  | PostgreSQL         |
| Container | Docker, Docker Compose |
| Cloud     | AWS ECS Fargate, S3, ALB, RDS |

## Project Structure

```
cliniccare/
├── frontend/          # React application
├── backend/           # Express API
├── database/          # SQL migrations
├── docker-compose.yml
└── README.md
```

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

### Option 2: Manual Setup

**Database:**
```bash
createdb cliniccare
psql -d cliniccare -f backend/database/migrations/001_init.sql
```

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint                | Description        | Auth |
|--------|-------------------------|--------------------|------|
| POST   | /api/auth/login         | Login              | No   |
| GET    | /api/patients/dashboard | Dashboard stats    | Yes  |
| GET    | /api/patients           | List patients      | Yes  |
| GET    | /api/patients/:id       | Get patient        | Yes  |
| POST   | /api/patients           | Create patient     | Yes  |
| PUT    | /api/patients/:id       | Update patient     | Yes  |
| DELETE | /api/patients/:id       | Delete patient     | Yes  |
| GET    | /api/appointments       | List appointments  | Yes  |
| POST   | /api/appointments       | Book appointment   | Yes  |
| PUT    | /api/appointments/:id   | Update status      | Yes  |
| DELETE | /api/appointments/:id   | Cancel appointment | Yes  |

## Default Login

- **Username:** admin
- **Password:** admin123
