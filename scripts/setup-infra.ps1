$ErrorActionPreference = "Continue"
$REGION = "us-east-1"
$VPC_ID = "vpc-07ac174890802425d"
$SUBNET_A = "subnet-0f0bf00f71185151a"
$SUBNET_C = "subnet-0699e48891f11ccb8"
$ACCOUNT_ID = "085777795083"

Write-Host "=== Step 1: Creating Security Groups ==="

# ALB Security Group
$ALB_SG = aws ec2 create-security-group --group-name cliniccare-alb-sg --description "ALB Security Group" --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION
Write-Host "ALB Security Group: $ALB_SG"
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $REGION

# Backend Security Group (ECS tasks)
$BE_SG = aws ec2 create-security-group --group-name cliniccare-backend-sg --description "Backend ECS Security Group" --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION
Write-Host "Backend Security Group: $BE_SG"
aws ec2 authorize-security-group-ingress --group-id $BE_SG --protocol tcp --port 5000 --source-group $ALB_SG --region $REGION

# RDS Security Group
$RDS_SG = aws ec2 create-security-group --group-name cliniccare-rds-sg --description "RDS Security Group" --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION
Write-Host "RDS Security Group: $RDS_SG"
aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 5432 --source-group $BE_SG --region $REGION

Write-Host "`n=== Step 2: Creating DB Subnet Group ==="
aws rds create-db-subnet-group --db-subnet-group-name cliniccare-db-subnet --db-subnet-group-description "ClinicCare DB subnet group" --subnet-ids $SUBNET_A $SUBNET_C --region $REGION

Write-Host "`n=== Step 3: Creating RDS PostgreSQL ==="
aws rds create-db-instance --db-instance-identifier cliniccare-db --db-instance-class db.t3.micro --engine postgres --engine-version 16.4 --master-username postgres --master-user-password ClinicCare2026 --allocated-storage 20 --storage-type gp3 --db-subnet-group-name cliniccare-db-subnet --vpc-security-group-ids $RDS_SG --multi-az --backup-retention-period 7 --preferred-backup-window "03:00-04:00" --no-publicly-accessible --region $REGION

Write-Host "`n=== Step 4: Creating ECS Cluster ==="
aws ecs create-cluster --cluster-name cliniccare-cluster --region $REGION

Write-Host "`n=== Step 5: Creating CloudWatch Log Group ==="
aws logs create-log-group --log-group-name /ecs/cliniccare-backend --region $REGION

Write-Host "`n=== Step 6: Creating IAM Roles ==="

# ECS Task Execution Role
$TRUST_POLICY = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document $TRUST_POLICY 2>&1
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>&1

# CodeBuild Service Role
$CODEBUILD_TRUST = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"codebuild.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam create-role --role-name CodeBuildServiceRole --assume-role-policy-document $CODEBUILD_TRUST 2>&1
$CODEBUILD_POLICY = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["ecr:*","ecs:*","logs:*","s3:*","iam:PassRole"],"Resource":"*"}]}'
aws iam put-role-policy --role-name CodeBuildServiceRole --policy-name CodeBuildPolicy --policy-document $CODEBUILD_POLICY 2>&1

# CodePipeline Service Role
$CODEPIPELINE_TRUST = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"codepipeline.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam create-role --role-name CodePipelineServiceRole --assume-role-policy-document $CODEPIPELINE_TRUST 2>&1
$CODEPIPELINE_POLICY = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:*","codebuild:*","ecr:*","ecs:*","iam:PassRole"],"Resource":"*"}]}'
aws iam put-role-policy --role-name CodePipelineServiceRole --policy-name CodePipelinePolicy --policy-document $CODEPIPELINE_POLICY 2>&1

Write-Host "`n=== Step 7: Creating ALB ==="
$ALB_ARN = aws elbv2 create-load-balancer --name cliniccare-alb --subnets $SUBNET_A $SUBNET_C --security-groups $ALB_SG --scheme internet-facing --type application --region $REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text
Write-Host "ALB ARN: $ALB_ARN"

# Wait for ALB to be active
Write-Host "Waiting for ALB to be active..."
Start-Sleep -Seconds 30

# Get ALB DNS name
$ALB_DNS = aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text --region $REGION
Write-Host "ALB DNS: $ALB_DNS"

# Create Target Group
$TG_ARN = aws elbv2 create-target-group --name cliniccare-tg --protocol HTTP --port 5000 --vpc-id $VPC_ID --target-type ip --health-check-path /api/health --health-check-interval-seconds 30 --healthy-threshold-count 2 --unhealthy-threshold-count 3 --region $REGION --query 'TargetGroups[0].TargetGroupArn' --output text
Write-Host "Target Group ARN: $TG_ARN"

# Create Listener
aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$TG_ARN --region $REGION

Write-Host "`n=== Infrastructure Created Successfully ==="
Write-Host "ALB DNS: $ALB_DNS"
Write-Host "Backend SG: $BE_SG"
Write-Host "RDS SG: $RDS_SG"
Write-Host "TG ARN: $TG_ARN"

# Save outputs to file
@"
VPC_ID=$VPC_ID
SUBNET_A=$SUBNET_A
SUBNET_C=$SUBNET_C
ALB_SG=$ALB_SG
BE_SG=$BE_SG
RDS_SG=$RDS_SG
ALB_ARN=$ALB_ARN
ALB_DNS=$ALB_DNS
TG_ARN=$TG_ARN
"@ | Out-File -FilePath C:\Users\Ad\cliniccare\aws-output.txt -Encoding utf8
