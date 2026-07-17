# Disaster Recovery Runbook - ClinicCare

## 1. Overview

| Item | Details |
|------|---------|
| Application | ClinicCare - Clinic Management System |
| RTO (Recovery Time Objective) | 30 minutes |
| RPO (Recovery Point Objective) | 1 hour (RDS automated backups) |
| AWS Region | us-east-1 |
| Account | 085777795083 |

## 2. Architecture Components

| Component | Resource | Failure Impact |
|-----------|----------|---------------|
| Compute | ECS Fargate (backend + frontend) | App unreachable |
| Database | RDS PostgreSQL 16 | Data unavailable |
| Load Balancer | ALB | No traffic routing |
| Container Registry | ECR | Cannot deploy new images |
| CI/CD | CodePipeline + CodeBuild | No automated deployments |
| Monitoring | CloudWatch | No visibility |

## 3. Scenario 1: ECS Task Failure

**Symptoms**: One or both tasks stop, health checks fail
**Impact**: Partial or complete service outage

### Steps:
```bash
# 1. Check ECS service status
aws ecs describe-services --cluster cliniccare-cluster --services cliniccare-backend-service cliniccare-frontend-service --region us-east-1

# 2. Check task health
aws ecs list-tasks --cluster cliniccare-cluster --region us-east-1

# 3. Check CloudWatch logs
aws logs describe-log-streams --log-group-name /ecs/cliniccare-backend --order-by LastEventTime --descending --limit 3 --region us-east-1

# 4. Force new deployment if stuck
aws ecs update-service --cluster cliniccare-cluster --service cliniccare-backend-service --force-new-deployment --region us-east-1
aws ecs update-service --cluster cliniccare-cluster --service cliniccare-frontend-service --force-new-deployment --region us-east-1
```

### Resolution: Force redeployment resolves 90% of task failures.

## 4. Scenario 2: RDS Database Failure

**Symptoms**: Backend logs show "Database connection failed", API returns 500
**Impact**: All write operations fail, read operations may serve stale data

### Steps:
```bash
# 1. Check RDS status
aws rds describe-db-instances --db-instance-identifier cliniccare-db --query "DBInstances[0].[DBInstanceStatus,BackupRetentionPeriod]" --output text --region us-east-1

# 2. Check RDS events for failure details
aws rds describe-events --source-identifier cliniccare-db --source-type db-instance --duration 60 --region us-east-1

# 3. If instance is failed, restore from automated backup
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier cliniccare-db \
  --target-db-instance-identifier cliniccare-db-restored \
  --restore-time "2026-07-16T10:00:00Z" \
  --region us-east-1

# 4. After restore completes, update DNS/endpoint
# Update backend task definition DB_HOST to new endpoint
# Register new task definition
aws ecs register-task-definition --cli-input-json file://scripts/task-def-backend.json --region us-east-1

# 5. Update ECS service
aws ecs update-service --cluster cliniccare-cluster --service cliniccare-backend-service --task-definition cliniccare-backend:4 --force-new-deployment --region us-east-1
```

### Resolution: RDS automated backups retain 1 day. Point-in-time recovery available.

## 5. Scenario 3: ALB Failure

**Symptoms**: Application unreachable via DNS, health checks fail
**Impact**: Complete service outage (both frontend and backend)

### Steps:
```bash
# 1. Check ALB status
aws elbv2 describe-load-balancers --names cliniccare-alb --query "LoadBalancers[0].State" --output text --region us-east-1

# 2. Check target health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:085777795083:targetgroup/cliniccare-tg/9ed46381a5b72576 --region us-east-1

# 3. Check ALB metrics for errors
aws cloudwatch get-metric-statistics --namespace AWS/ApplicationELB --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=app/cliniccare-alb/4ba0a10786312d7c \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 300 --statistics Sum --region us-east-1

# 4. If ALB is down, check security groups
aws ec2 describe-security-groups --group-ids sg-09d00950cbe3dc064 --query "SecurityGroups[0].IpPermissions" --output json --region us-east-1
```

## 6. Scenario 4: Full Redeployment

**When**: Major code changes, infrastructure updates, or complete rebuild needed

### Steps:
```bash
# 1. Push code to GitHub (triggers CodePipeline)
git push origin main

# 2. Monitor pipeline
aws codepipeline get-pipeline-state --name cliniccare-pipeline --region us-east-1

# 3. Verify after pipeline completes
aws ecs list-tasks --cluster cliniccare-cluster --region us-east-1
Invoke-RestMethod -Uri "http://cliniccare-alb-740903641.us-east-1.elb.amazonaws.com/api/health"
```

## 7. Scenario 5: Secret/Credential Rotation

### Steps:
```bash
# 1. Update RDS password
aws rds modify-db-instance --db-instance-identifier cliniccare-db --master-user-password NewSecurePass123 --apply-immediately --region us-east-1

# 2. Update ECS task definition with new password
# Edit scripts/task-def-backend.json -> DB_PASSWORD value

# 3. Register new task definition and deploy
aws ecs register-task-definition --cli-input-json file://scripts/task-def-backend.json --region us-east-1
aws ecs update-service --cluster cliniccare-cluster --service cliniccare-backend-service --task-definition cliniccare-backend:NEW_REV --force-new-deployment --region us-east-1
```

## 8. Emergency Contacts & Resources

| Resource | Location |
|----------|----------|
| AWS Console | https://console.aws.amazon.com |
| ECS Console | https://console.aws.amazon.com/ecs |
| RDS Console | https://console.aws.amazon.com/rds |
| CloudWatch | https://console.aws.amazon.com/cloudwatch |
| GitHub Repo | https://github.com/Aderajew-Aysheshim/Clinic-Management-System |

## 9. Backup Strategy

| Component | Backup Method | Retention | RPO |
|-----------|--------------|-----------|-----|
| RDS Data | Automated snapshots | 1 day | 1 hour |
| Container Images | ECR (all versions retained) | Indefinite | N/A |
| Application Code | GitHub | Indefinite | N/A |
| Infrastructure Config | scripts/*.json | In Git | N/A |
