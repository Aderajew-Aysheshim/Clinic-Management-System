# ClinicCare — Clinic Management System

A full-stack, cloud-native clinic management system built to digitize patient records and appointment scheduling for small clinics. Deployed on AWS ECS Fargate with CI/CD pipeline.

## The Problem

Many small clinics still rely on paper records, leading to:
- Lost patient records
- Long waiting times
- Double-booked appointments
- Difficult reporting

**ClinicCare** solves this with a simple, secure web application.

## Features

- **Admin Authentication** — Secure JWT login with bcrypt password hashing
- **Dashboard** — Total patients count and today's appointments overview
- **Patient Management** — Full CRUD: add, view, edit, delete patients
- **Appointment Management** — Book, view, complete, cancel appointments
- **Rate Limiting** — Protection against abuse (100 req/15min, 10 login attempts/15min)
- **Security Headers** — Helmet.js for HTTP security headers

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 19, Vite 8, Tailwind CSS      |
| Backend     | Node.js 20, Express 5               |
| Database    | PostgreSQL 16                       |
| Auth        | JWT (jsonwebtoken + bcryptjs)       |
| Security    | Helmet.js, express-rate-limit        |
| Containers  | Docker, Docker Compose              |
| Cloud       | AWS ECS Fargate, S3, ALB, RDS, ECR  |
| CI/CD       | AWS CodePipeline, CodeBuild         |
| Monitoring  | Amazon CloudWatch                   |

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

### Option 2: Manual Setup

**Database:**
```bash
createdb cliniccare
psql -d cliniccare -f backend/database/migrations/001_init.sql
cd backend && node seed_admin.js
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Default Login

| Username | Password |
|----------|----------|
| admin    | admin123 |

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system architecture diagrams.

## Project Structure

```
cliniccare/
├── frontend/            # React + Vite + Tailwind CSS
│   ├── src/pages/      # Login, Dashboard, Patients, Appointments
│   ├── Dockerfile      # Multi-stage production build
│   └── nginx.conf      # Reverse proxy config
├── backend/             # Express.js REST API
│   ├── controllers/    # Route handlers
│   ├── routes/         # API routes
│   ├── middleware/      # JWT authentication
│   ├── database/       # Connection, migrations, seeds
│   └── Dockerfile      # Production build
├── docker-compose.yml  # Full local stack
└── README.md
```

## Screenshots

### Login Page
Clean, professional login interface with form validation.

### Dashboard
Overview cards showing total patients and today's appointments.

### Patients
Full patient management table with search, add, edit, and delete.

### Appointments
Appointment booking with date picker, status tracking, and completion.

## AWS Deployment

```bash
# 1. Configure AWS CLI
aws configure

# 2. Deploy infrastructure (once we add Terraform)
cd terraform && terraform apply

# 3. Push to GitHub triggers CI/CD
git push origin main
```

## License

MIT License — see [LICENSE](LICENSE)
