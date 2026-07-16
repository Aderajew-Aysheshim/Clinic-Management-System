# Architecture

## AWS Cloud Architecture

```
                    Users (Browser)
                         │
                         ▼
              ┌─────────────────────┐
              │   Amazon S3         │
              │   (React Frontend)  │
              └─────────┬───────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   CloudFront CDN    │
              │   (HTTPS/SSL)       │
              └─────────┬───────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Application Load   │
              │  Balancer (ALB)     │
              └─────────┬───────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   Amazon ECS        │
              │   Fargate Cluster   │
              │                     │
              │  ┌───────────────┐  │
              │  │ Backend Task  │  │
              │  │ (Express API) │  │
              │  └───────┬───────┘  │
              │          │          │
              └──────────┼──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Amazon RDS        │
              │   PostgreSQL        │
              └─────────────────────┘


  ┌──────────────────────────────────────────────────┐
  │               CI/CD Pipeline                     │
  │                                                  │
  │  GitHub → CodePipeline → CodeBuild → ECR → ECS  │
  └──────────────────────────────────────────────────┘
```

## Local Development Architecture

```
  ┌──────────────────────────────────────────────────┐
  │              Docker Compose                       │
  │                                                  │
  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
  │  │ Frontend │  │ Backend  │  │  PostgreSQL   │   │
  │  │ :3000    │──│ :5000    │──│  :5432       │   │
  │  │ React    │  │ Express  │  │  Database    │   │
  │  └──────────┘  └──────────┘  └──────────────┘   │
  └──────────────────────────────────────────────────┘
```

## Project Structure

```
cliniccare/
├── frontend/                # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/          # Login, Dashboard, Patients, Appointments
│   │   ├── context/        # Auth context
│   │   └── services/       # API service (axios)
│   ├── Dockerfile          # Multi-stage Docker build
│   └── nginx.conf          # Production nginx config
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Route handlers
│   ├── routes/             # API routes
│   ├── middleware/          # JWT auth middleware
│   ├── database/           # DB connection, migrations, seeds
│   ├── config/             # App configuration
│   └── Dockerfile          # Docker build
├── database/               # SQL schemas
├── docker-compose.yml      # Local development stack
└── README.md
```
