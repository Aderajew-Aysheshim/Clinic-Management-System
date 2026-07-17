# ClinicCare AWS Deployment Guide

## Architecture Overview

```
Internet → ALB (Port 80) → ECS Fargate (Frontend: Nginx:80)
                        → ECS Fargate (Backend: Node.js:5000) → RDS PostgreSQL
GitHub → CodePipeline → CodeBuild → ECR → ECS Fargate (auto-deploy)
```

## AWS Resources Created

| Service | Resource | Details |
|---------|----------|---------|
| VPC | Default VPC | us-east-1 |
| ECS | Cluster | cliniccare-cluster (Fargate) |
| ECS | Backend Service | 1 task, 256 CPU / 512 MB |
| ECS | Frontend Service | 1 task, 256 CPU / 512 MB |
| ALB | Load Balancer | cliniccare-alb (HTTP:80) |
| RDS | PostgreSQL 16 | db.t3.micro, 20GB gp2 |
| ECR | Backend Image | cliniccare-backend |
| ECR | Frontend Image | cliniccare-frontend |
| CodeBuild | Build Project | cliniccare-build |
| CodePipeline | CI/CD Pipeline | GitHub → Build → ECS |
| CloudWatch | Dashboard | ClinicCare-Infrastructure |
| CloudWatch | Alarms | 6 (CPU, Memory, 5XX, Connections) |
| IAM | Roles | ecsTaskExecutionRole, CodeBuild, CodePipeline |

## Access Points

- **Frontend URL**: http://cliniccare-alb-740903641.us-east-1.elb.amazonaws.com
- **API Health**: http://cliniccare-alb-740903641.us-east-1.elb.amazonaws.com/api/health
- **Default Login**: admin / admin123

## CI/CD Pipeline

1. Push code to GitHub main branch
2. CodePipeline detects changes
3. CodeBuild builds Docker images (backend + frontend)
4. Images pushed to ECR with commit hash tag
5. ECS services auto-deploy new images

## Required: Authorize GitHub Connection

1. Go to AWS Console → Developer Tools → Connections
2. Find "cliniccare-github" connection (status: PENDING)
3. Click "Update pending connection"
4. Authorize AWS to access your GitHub repo

## CloudWatch Monitoring

- Dashboard: ClinicCare-Infrastructure (12 widgets)
- Alarms: ECS High CPU, Frontend High CPU, ALB 5XX, RDS High CPU, RDS Low Memory, RDS High Connections

## Cost Estimate (Monthly)

| Service | Cost |
|---------|------|
| ECS Fargate (2 tasks × 0.25 vCPU × 512 MB) | ~$7.30 |
| RDS (db.t3.micro, 20GB) | ~$12.40 |
| ALB | ~$2.25 + data transfer |
| ECR | Free (within limits) |
| CloudWatch | Free tier |
| CodePipeline | Free (1 active pipeline) |
| CodeBuild | Free tier (100 min/month) |
| **Total** | **~$22-25/month** |

## Cleanup

To avoid charges, delete resources in order:
1. Delete CodePipeline and CodeBuild
2. Delete ECS services and cluster
3. Delete RDS instance
4. Delete ALB and Target Groups
5. Delete ECR repositories
6. Delete CloudWatch dashboard and alarms
7. Delete IAM roles and policies
