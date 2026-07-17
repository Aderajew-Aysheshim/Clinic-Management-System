# Cost Analysis - ClinicCare on AWS

## Monthly Cost Estimate (us-east-1)

### Compute - ECS Fargate

| Resource | vCPU | Memory | Hours/Month | Cost/hour | Monthly Cost |
|----------|------|--------|-------------|-----------|-------------|
| Backend Task | 0.25 | 512 MB | 730 | $0.0000136 | $4.90 |
| Frontend Task | 0.25 | 512 MB | 730 | $0.0000136 | $4.90 |
| **Subtotal** | | | | | **$9.80** |

### Database - RDS

| Resource | Class | Storage | Hours/Month | Cost/hour | Monthly Cost |
|----------|-------|---------|-------------|-----------|-------------|
| PostgreSQL 16 | db.t3.micro | 20 GB gp2 | 730 | $0.017 | $12.41 |
| Automated Backups | - | Included | - | - | $0.00 |
| **Subtotal** | | | | | **$12.41** |

### Load Balancer - ALB

| Resource | Details | Monthly Cost |
|----------|---------|-------------|
| ALB Hourly | 730 hours | $16.20 |
| LCU Charges | Low traffic (< 1 LCU) | ~$1.00 |
| Data Processing | ~1 GB/month | ~$0.08 |
| **Subtotal** | | **$2.28** |

### Container Registry - ECR

| Resource | Details | Monthly Cost |
|----------|---------|-------------|
| Storage | ~500 MB (2 images) | $0.00 |
| Data Transfer | Within same region | $0.00 |
| **Subtotal** | | **$0.00** |

### CI/CD

| Resource | Details | Monthly Cost |
|----------|---------|-------------|
| CodePipeline | 1 active pipeline | $0.00 (free tier) |
| CodeBuild | ~20 min/month | $0.00 (free tier) |
| S3 (artifacts) | ~100 MB | $0.00 |
| **Subtotal** | | **$0.00** |

### Monitoring - CloudWatch

| Resource | Details | Monthly Cost |
|----------|---------|-------------|
| Dashboard | 1 dashboard | $0.00 (free tier) |
| Alarms | 6 alarms | $0.00 (free tier) |
| Log Groups | ~100 MB logs | $0.00 |
| **Subtotal** | | **$0.00** |

---

## Total Monthly Cost

| Category | Cost |
|----------|------|
| ECS Fargate | $9.80 |
| RDS PostgreSQL | $12.41 |
| ALB | $2.28 |
| ECR | $0.00 |
| CI/CD | $0.00 |
| CloudWatch | $0.00 |
| **TOTAL** | **$24.49/month** |

## Free Tier Utilization

| Service | Free Tier | Our Usage | Within Free Tier? |
|---------|-----------|-----------|-------------------|
| ECS Fargate | None | 0.5 vCPU total | N/A |
| RDS | 750 hrs db.t3.micro (12 months) | 730 hrs | YES |
| ALB | 750 hrs + 15 GB (12 months) | ~1 GB | YES |
| ECR | 500 MB storage | ~500 MB | YES |
| CodePipeline | 1 free active pipeline | 1 pipeline | YES |
| CodeBuild | 100 build-minutes/month | ~20 min | YES |
| CloudWatch | 10 metrics, 1 dashboard | 12 metrics, 1 dashboard | NO (slightly over) |
| S3 | 5 GB | < 1 GB | YES |

## Cost Optimization Options

| Optimization | Potential Savings |
|-------------|-------------------|
| Use Spot Instances for ECS | ~70% compute savings |
| Right-size to 0.5 vCPU / 1 GB | Better performance |
| Reserved Instance for RDS | ~30% savings (1-year) |
| Delete when not in use | 100% savings |

## Annual Projection

| Scenario | Monthly | Annual |
|----------|---------|--------|
| Always running | $24.49 | $293.88 |
| Development hours only (8h/day) | ~$8.16 | ~$97.96 |
| Demo/presentation only | ~$2.50 | ~$30.00 |
