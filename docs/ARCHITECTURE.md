# Architecture

## AWS Cloud Architecture (Option 3 - DevOps Pipeline with Containers)

```
                    ┌─────────────────────────────────┐
                    │          USERS (Browser)         │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   Application Load Balancer      │
                    │   (cliniccare-alb)               │
                    │   Internet-facing | HTTP:80      │
                    └───────┬─────────────────┬───────┘
                            │                 │
              Path: /api/*  │                 │ Default
                            ▼                 ▼
          ┌──────────────────────┐  ┌──────────────────────┐
          │  Backend Target Grp  │  │  Frontend Target Grp  │
          │  (cliniccare-tg)     │  │  (cliniccare-tg)      │
          └──────────┬───────────┘  └──────────┬───────────┘
                     │                         │
                     ▼                         ▼
          ┌──────────────────────┐  ┌──────────────────────┐
          │  ECS Fargate         │  │  ECS Fargate          │
          │  Backend Service     │  │  Frontend Service      │
          │                      │  │                        │
          │  ┌────────────────┐  │  │  ┌────────────────┐   │
          │  │ Node.js 20     │  │  │  │ Nginx:Alpine    │   │
          │  │ Express 5      │  │  │  │ React SPA       │   │
          │  │ Port: 5000     │  │  │  │ Port: 80        │   │
          │  └───────┬────────┘  │  │  └────────────────┘   │
          │          │           │  │                        │
          └──────────┼───────────┘  └────────────────────────┘
                     │
                     │ SSL (required by RDS)
                     ▼
          ┌──────────────────────┐
          │  Amazon RDS           │
          │  PostgreSQL 16.4      │
          │  db.t3.micro | 20GB   │
          │  us-east-1            │
          └──────────────────────┘


    ┌──────────────────────────────────────────────────────────────┐
    │                   CI/CD PIPELINE                             │
    │                                                              │
    │  GitHub ──> CodePipeline ──> CodeBuild ──> ECR ──> ECS       │
    │  (Source)    (Orchestrate)   (Docker)    (Images)  (Deploy)  │
    │                                                              │
    │  Auto-triggers on push to main branch                        │
    └──────────────────────────────────────────────────────────────┘


    ┌──────────────────────────────────────────────────────────────┐
    │                   MONITORING                                  │
    │                                                              │
    │  CloudWatch Dashboard ──> 12 Widgets                         │
    │  CloudWatch Alarms ──> 6 Alarms                              │
    │  CloudWatch Logs ──> /ecs/cliniccare-backend                 │
    │                      /ecs/cliniccare-frontend                 │
    └──────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
    Internet
        │
        ▼
    ┌──────────────────────────────┐
    │ ALB Security Group           │
    │ Inbound: 80 (HTTP)           │
    │ Inbound: 443 (HTTPS)         │
    │ Outbound: All                │
    └──────────────┬───────────────┘
                   │
        ▼                         ▼
    ┌──────────────┐    ┌──────────────────────────────┐
    │ Backend SG   │    │ RDS SG                       │
    │ Inbound:     │    │ Inbound:                     │
    │  5000 from   │    │  5432 from Backend SG only   │
    │  ALB SG only │    │ Outbound: All                │
    │ Outbound: All│    └──────────────────────────────┘
    └──────────────┘
```

## CI/CD Pipeline Flow

```
    Developer pushes code to GitHub main branch
                         │
                         ▼
    ┌─────────────────────────────────────────────┐
    │ CodePipeline: cliniccare-pipeline            │
    │                                             │
    │  Stage 1: SOURCE                            │
    │    Action: GitHub_Source (CodeStar)          │
    │    Config: Aderajew-Aysheshim/              │
    │            Clinic-Management-System          │
    │    Branch: main                             │
    │    Auto-detect: true                        │
    │                                             │
    │  Stage 2: BUILD                             │
    │    Action: CodeBuild (cliniccare-build)      │
    │    Steps:                                   │
    │      1. Login to ECR                        │
    │      2. Build backend Docker image          │
    │      3. Build frontend Docker image         │
    │      4. Push both to ECR (tagged + latest)  │
    │      5. Force ECS service redeployment      │
    └─────────────────────────────────────────────┘
```

## Local Development Architecture

```
    ┌──────────────────────────────────────────────┐
    │           Docker Compose                      │
    │                                              │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
    │  │ Frontend │  │ Backend  │  │ PostgreSQL│   │
    │  │ :3000    │──│ :5000    │──│ :5432    │   │
    │  │ React    │  │ Express  │  │ Database  │   │
    │  │ Vite     │  │ Node.js  │  │           │   │
    │  └──────────┘  └──────────┘  └──────────┘   │
    └──────────────────────────────────────────────┘
```

## Project Structure

```
cliniccare/
├── frontend/                # React 19 + Vite 8 + Tailwind CSS
│   ├── src/
│   │   ├── pages/          # Login, Dashboard, Patients, Appointments
│   │   ├── context/        # Auth context (JWT)
│   │   └── services/       # API service (axios + interceptor)
│   ├── Dockerfile          # Multi-stage build (node → nginx)
│   └── nginx.conf          # Production static file serving
├── backend/                 # Node.js 20 + Express 5
│   ├── controllers/        # Route handlers (auth, patients, appointments)
│   ├── routes/             # API routes (/api/auth, /api/patients, /api/appointments)
│   ├── middleware/          # JWT auth middleware
│   ├── database/           # PostgreSQL pool, migrations, seeds
│   ├── config/             # Environment configuration
│   └── Dockerfile          # node:20-alpine production build
├── scripts/                 # AWS deployment scripts and task definitions
├── docs/                    # API docs, architecture, deployment guide, DR runbook
├── buildspec.yml            # CodeBuild specification
├── docker-compose.yml       # Local development stack
└── README.md
```

## AWS Resources Summary

| Resource | Name | Region |
|----------|------|--------|
| VPC | vpc-07ac174890802425d (default) | us-east-1 |
| ECS Cluster | cliniccare-cluster | us-east-1 |
| ECS Backend Service | cliniccare-backend-service | us-east-1 |
| ECS Frontend Service | cliniccare-frontend-service | us-east-1 |
| ALB | cliniccare-alb | us-east-1 |
| RDS | cliniccare-db (PostgreSQL 16.4) | us-east-1 |
| ECR Backend | cliniccare-backend | us-east-1 |
| ECR Frontend | cliniccare-frontend | us-east-1 |
| CodePipeline | cliniccare-pipeline | us-east-1 |
| CodeBuild | cliniccare-build | us-east-1 |
| CloudWatch Dashboard | ClinicCare-Infrastructure | us-east-1 |
| Security Groups | ALB, Backend, RDS | us-east-1 |
| IAM Roles | ecsTaskExecutionRole, CodeBuild, CodePipeline | - |
