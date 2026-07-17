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

# Frontend Security Group (ECS tasks)
$FE_SG = aws ec2 create-security-group --group-name cliniccare-frontend-sg --description "Frontend ECS Security Group" --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION
Write-Host "Frontend Security Group: $FE_SG"
aws ec2 authorize-security-group-ingress --group-id $FE_SG --protocol tcp --port 80 --source-group $ALB_SG --region $REGION

# RDS Security Group
$RDS_SG = aws ec2 create-security-group --group-name cliniccare-rds-sg --description "RDS Security Group" --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION
Write-Host "RDS Security Group: $RDS_SG"
aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 5432 --source-group $BE_SG --region $REGION

Write-Host "`n=== Step 2: Creating DB Subnet Group ==="
aws rds create-db-subnet-group --db-subnet-group-name cliniccare-db-subnet --db-subnet-group-description "ClinicCare DB subnet group" --subnet-ids $SUBNET_A $SUBNET_C --region $REGION

Write-Host "`n=== Step 3: Creating RDS PostgreSQL ==="
aws rds create-db-instance --db-instance-identifier cliniccare-db --db-instance-class db.t3.micro --engine postgres --engine-version 16.4 --master-username postgres --master-user-password ClinicCare2026 --allocated-storage 20 --storage-type gp3 --db-name cliniccare --db-subnet-group-name cliniccare-db-subnet --vpc-security-group-ids $RDS_SG --no-publicly-accessible --region $REGION

Write-Host "`n=== Step 4: Creating ECS Cluster ==="
aws ecs create-cluster --cluster-name cliniccare-cluster --region $REGION

Write-Host "`n=== Step 5: Creating CloudWatch Log Groups ==="
aws logs create-log-group --log-group-name /ecs/cliniccare-backend --region $REGION
aws logs create-log-group --log-group-name /ecs/cliniccare-frontend --region $REGION

Write-Host "`n=== Step 6: Creating IAM Roles ==="

# ECS Task Execution Role
$TRUST_POLICY = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document $TRUST_POLICY 2>&1
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>&1

# CodeBuild Service Role
$CODEBUILD_TRUST = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"codebuild.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam create-role --role-name CodeBuildServiceRole --assume-role-policy-document $CODEBUILD_TRUST 2>&1
$CODEBUILD_POLICY = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["ecr:*","ecs:*","logs:*","s3:*","iam:PassRole","codestar-connections:UseConnection"],"Resource":"*"}]}'
aws iam put-role-policy --role-name CodeBuildServiceRole --policy-name CodeBuildPolicy --policy-document $CODEBUILD_POLICY 2>&1

# CodePipeline Service Role
$CODEPIPELINE_TRUST = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"codepipeline.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam create-role --role-name CodePipelineServiceRole --assume-role-policy-document $CODEPIPELINE_TRUST 2>&1
$CODEPIPELINE_POLICY = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:*","codebuild:*","ecr:*","ecs:*","iam:PassRole","codestar-connections:UseConnection"],"Resource":"*"}]}'
aws iam put-role-policy --role-name CodePipelineServiceRole --policy-name CodePipelinePolicy --policy-document $CODEPIPELINE_POLICY 2>&1

Write-Host "`n=== Step 7: Creating S3 Bucket for Pipeline Artifacts ==="
aws s3 mb s3://cliniccare-pipeline-artifacts-$ACCOUNT_ID --region $REGION 2>&1

# Set bucket policy to allow CodePipeline access
$BUCKET_POLICY = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codepipeline.amazonaws.com"
      },
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::cliniccare-pipeline-artifacts-$ACCOUNT_ID",
        "arn:aws:s3:::cliniccare-pipeline-artifacts-$ACCOUNT_ID/*"
      ]
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::cliniccare-pipeline-artifacts-$ACCOUNT_ID",
        "arn:aws:s3:::cliniccare-pipeline-artifacts-$ACCOUNT_ID/*"
      ]
    }
  ]
}
"@
$BUCKET_POLICY | Out-File -FilePath "$env:TEMP\bucket-policy.json" -Encoding utf8
aws s3api put-bucket-policy --bucket cliniccare-pipeline-artifacts-$ACCOUNT_ID --policy file://"$env:TEMP\bucket-policy.json" --region $REGION 2>&1

Write-Host "`n=== Step 8: Creating ALB ==="
$ALB_ARN = aws elbv2 create-load-balancer --name cliniccare-alb --subnets $SUBNET_A $SUBNET_C --security-groups $ALB_SG --scheme internet-facing --type application --region $REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text
Write-Host "ALB ARN: $ALB_ARN"

# Wait for ALB to be active
Write-Host "Waiting for ALB to be active..."
Start-Sleep -Seconds 30

# Get ALB DNS name
$ALB_DNS = aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text --region $REGION
Write-Host "ALB DNS: $ALB_DNS"

# Create Backend Target Group
$BE_TG_ARN = aws elbv2 create-target-group --name cliniccare-backend-tg --protocol HTTP --port 5000 --vpc-id $VPC_ID --target-type ip --health-check-path /api/health --health-check-interval-seconds 30 --healthy-threshold-count 2 --unhealthy-threshold-count 3 --region $REGION --query 'TargetGroups[0].TargetGroupArn' --output text
Write-Host "Backend Target Group ARN: $BE_TG_ARN"

# Create Frontend Target Group
$FE_TG_ARN = aws elbv2 create-target-group --name cliniccare-frontend-tg --protocol HTTP --port 80 --vpc-id $VPC_ID --target-type ip --health-check-path / --health-check-interval-seconds 30 --healthy-threshold-count 2 --unhealthy-threshold-count 3 --region $REGION --query 'TargetGroups[0].TargetGroupArn' --output text
Write-Host "Frontend Target Group ARN: $FE_TG_ARN"

# Create Listener
$LISTENER_ARN = aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$FE_TG_ARN --region $REGION --query 'Listeners[0].ListenerArn' --output text
Write-Host "Listener ARN: $LISTENER_ARN"

# Create Rule: /api/* -> Backend Target Group
aws elbv2 create-rule --listener-arn $LISTENER_ARN --priority 2 --conditions Field=path-pattern,Values='/api/*' --actions Type=forward,TargetGroupArn=$BE_TG_ARN --region $REGION

Write-Host "`n=== Step 9: Waiting for RDS to be available ==="
Write-Host "This may take 5-10 minutes..."
aws rds wait db-instance-available --db-instance-identifier cliniccare-db --region $REGION
Write-Host "RDS is available!"

# Get RDS endpoint
$RDS_ENDPOINT = aws rds describe-db-instances --db-instance-identifier cliniccare-db --query 'DBInstances[0].Endpoint.Address' --output text --region $REGION
Write-Host "RDS Endpoint: $RDS_ENDPOINT"

Write-Host "`n=== Step 10: Creating ECS Backend Service ==="
$BE_TASK_DEF = aws ecs register-task-definition --cli-input-json file://"$PSScriptRoot\task-def-backend.json" --region $REGION --query 'taskDefinition.taskDefinitionArn' --output text
Write-Host "Backend Task Definition: $BE_TASK_DEF"

aws ecs create-service --cluster cliniccare-cluster --service-name cliniccare-backend-service --task-definition $BE_TASK_DEF --desired-count 1 --launch-type FARGATE --platform-version LATEST --network-configuration ("`"awsvpcConfiguration={subnets=[" + $SUBNET_A + "],securityGroups=[" + $BE_SG + "],assignPublicIp=ENABLED}`"") --load-balancers ("`"targetGroupArn=" + $BE_TG_ARN + ",containerName=cliniccare-backend,containerPort=5000`"") --region $REGION

Write-Host "`n=== Step 11: Creating ECS Frontend Service ==="
$FE_TASK_DEF = aws ecs register-task-definition --cli-input-json file://"$PSScriptRoot\task-def-frontend.json" --region $REGION --query 'taskDefinition.taskDefinitionArn' --output text
Write-Host "Frontend Task Definition: $FE_TASK_DEF"

aws ecs create-service --cluster cliniccare-cluster --service-name cliniccare-frontend-service --task-definition $FE_TASK_DEF --desired-count 1 --launch-type FARGATE --platform-version LATEST --network-configuration ("`"awsvpcConfiguration={subnets=[" + $SUBNET_A + "],securityGroups=[" + $FE_SG + "],assignPublicIp=ENABLED}`"") --load-balancers ("`"targetGroupArn=" + $FE_TG_ARN + ",containerName=cliniccare-frontend,containerPort=80`"") --region $REGION

Write-Host "`n=== Step 12: Creating CloudWatch Dashboard ==="
aws cloudwatch put-dashboard --dashboard-name ClinicCare-Infrastructure --dashboard-body file://"$PSScriptRoot\dashboard.json" --region $REGION

Write-Host "`n=== Step 13: Creating CloudWatch Alarms ==="

# ECS Backend High CPU
aws cloudwatch put-metric-alarm --alarm-name "ClinicCare-ECS-Backend-HighCPU" --metric-name CPUUtilization --namespace AWS/ECS --statistic Average --period 300 --threshold 80 --comparison-operator GreaterThanThreshold --evaluation-periods 2 --dimensions Name=ClusterName,Value=cliniccare-cluster Name=ServiceName,Value=cliniccare-backend-service --region $REGION 2>&1

# ECS Frontend High CPU
aws cloudwatch put-metric-alarm --alarm-name "ClinicCare-ECS-Frontend-HighCPU" --metric-name CPUUtilization --namespace AWS/ECS --statistic Average --period 300 --threshold 80 --comparison-operator GreaterThanThreshold --evaluation-periods 2 --dimensions Name=ClusterName,Value=cliniccare-cluster Name=ServiceName,Value=cliniccare-frontend-service --region $REGION 2>&1

# ALB 5XX Errors
aws cloudwatch put-metric-alarm --alarm-name "ClinicCare-ALB-5XX-Errors" --metric-name HTTPCode_Target_5XX_Count --namespace AWS/ApplicationELB --statistic Sum --period 300 --threshold 10 --comparison-operator GreaterThanThreshold --evaluation-periods 1 --dimensions Name=LoadBalancer,Value=$($ALB_ARN -replace '.*loadbalancer/') --region $REGION 2>&1

# RDS High CPU
aws cloudwatch put-metric-alarm --alarm-name "ClinicCare-RDS-HighCPU" --metric-name CPUUtilization --namespace AWS/RDS --statistic Average --period 300 --threshold 80 --comparison-operator GreaterThanThreshold --evaluation-periods 2 --dimensions Name=DBInstanceIdentifier,Value=cliniccare-db --region $REGION 2>&1

# RDS Low Memory
aws cloudwatch put-metric-alarm --alarm-name "ClinicCare-RDS-LowMemory" --metric-name FreeableMemory --namespace AWS/RDS --statistic Average --period 300 --threshold 100000000 --comparison-operator LessThanThreshold --evaluation-periods 2 --dimensions Name=DBInstanceIdentifier,Value=cliniccare-db --region $REGION 2>&1

# RDS High Connections
aws cloudwatch put-metric-alarm --alarm-name "ClinicCare-RDS-HighConnections" --metric-name DatabaseConnections --namespace AWS/RDS --statistic Average --period 300 --threshold 50 --comparison-operator GreaterThanThreshold --evaluation-periods 2 --dimensions Name=DBInstanceIdentifier,Value=cliniccare-db --region $REGION 2>&1

Write-Host "`n=========================================="
Write-Host "  INFRASTRUCTURE CREATED SUCCESSFULLY"
Write-Host "=========================================="
Write-Host "ALB DNS:    http://$ALB_DNS"
Write-Host "API Health: http://$ALB_DNS/api/health"
Write-Host "RDS:        $RDS_ENDPOINT"
Write-Host "Backend SG: $BE_SG"
Write-Host "Frontend SG: $FE_SG"
Write-Host "RDS SG:     $RDS_SG"
Write-Host "Backend TG: $BE_TG_ARN"
Write-Host "Frontend TG: $FE_TG_ARN"
Write-Host "Backend Task Def:  $BE_TASK_DEF"
Write-Host "Frontend Task Def: $FE_TASK_DEF"
Write-Host "=========================================="

# Save outputs to file
@"
VPC_ID=$VPC_ID
SUBNET_A=$SUBNET_A
SUBNET_C=$SUBNET_C
ALB_SG=$ALB_SG
BE_SG=$BE_SG
FE_SG=$FE_SG
RDS_SG=$RDS_SG
ALB_ARN=$ALB_ARN
ALB_DNS=$ALB_DNS
BE_TG_ARN=$BE_TG_ARN
FE_TG_ARN=$FE_TG_ARN
LISTENER_ARN=$LISTENER_ARN
RDS_ENDPOINT=$RDS_ENDPOINT
BE_TASK_DEF=$BE_TASK_DEF
FE_TASK_DEF=$FE_TASK_DEF
"@ | Out-File -FilePath "$PSScriptRoot\..\aws-output.txt" -Encoding utf8

Write-Host "`nOutputs saved to aws-output.txt"
