# IAM + WAF Security Baseline (Terraform)

This Terraform stack hardens Student B's AWS infrastructure against fraud and abuse risks identified in the PRD.

## What this deploys

1. **AWS WAFv2 Web ACL for Student B API**
   - IP-based rate limiting (`rate_based_statement`)
   - AWS managed exploit protections:
     - `AWSManagedRulesCommonRuleSet`
     - `AWSManagedRulesKnownBadInputsRuleSet`
     - `AWSManagedRulesAmazonIpReputationList`
   - Associates the Web ACL to your API resource ARN.

2. **Least-Privilege IAM**
   - Dedicated role for Student B API (`student-b-api-role` by default)
   - Role is limited to:
     - reading only the DB secret in Secrets Manager
     - writing logs only to the API log group
     - connecting only to explicitly provided RDS/Redis IAM-auth resources
   - Optional `additional_service_roles` map lets you define strict per-service roles.

3. **AWS Secrets Manager for DB credentials**
   - Creates a secret for database credentials
   - Auto-generates a strong DB password unless you provide `db_password_override`
   - Secret payload includes host/port/dbname/username/password.

4. **VPC Flow Logs**
   - Enables flow logs for the target VPC (`traffic_type = "ALL"`)
   - Sends logs to CloudWatch Logs with configurable retention
   - Uses a dedicated IAM role for log delivery.

## Files

- `versions.tf` - Terraform and provider constraints
- `main.tf` - Resource definitions
- `variables.tf` - Inputs and validations
- `outputs.tf` - Useful output values
- `terraform.tfvars.example` - Example configuration

## Usage

1. Copy example variables:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` and set real values:
   - `waf_association_resource_arn`
   - `vpc_id`
   - `db_host`, `db_name`
   - `rds_db_user_arns`
   - `redis_iam_resource_arns` (if Redis IAM auth is enabled)

3. Initialize and review plan:

```bash
terraform init
terraform plan
```

4. Apply:

```bash
terraform apply
```

## Notes

- For API Gateway, use the **stage ARN** for WAF association.
- `rds_db_user_arns` should use `rds-db` ARNs for IAM DB auth:
  - `arn:aws:rds-db:<region>:<account-id>:dbuser:<db-resource-id>/<db-username>`
- If using a customer-managed KMS key for secrets/logs, set:
  - `secrets_kms_key_arn`
  - `logs_kms_key_arn`
