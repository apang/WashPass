variable "tags" {
  description = "Tags to apply to all supported resources."
  type        = map(string)
  default     = {}
}

variable "waf_name" {
  description = "Name of the WAFv2 Web ACL."
  type        = string
  default     = "student-b-api-waf"
}

variable "waf_rate_limit" {
  description = "Maximum requests per 5-minute period per source IP before block."
  type        = number
  default     = 2000
}

variable "waf_association_resource_arn" {
  description = "ARN of the API resource to protect (for example API Gateway stage ARN or ALB ARN)."
  type        = string
}

variable "student_b_api_role_name" {
  description = "Name of the least-privilege IAM role used by Student B API."
  type        = string
  default     = "student-b-api-role"
}

variable "api_compute_principal" {
  description = "AWS service principal that assumes Student B API role (ecs-tasks.amazonaws.com, lambda.amazonaws.com, etc.)."
  type        = string
  default     = "ecs-tasks.amazonaws.com"
}

variable "api_log_group_name" {
  description = "CloudWatch log group name used by Student B API."
  type        = string
  default     = "/aws/ecs/student-b-api"
}

variable "api_log_retention_days" {
  description = "Retention period in days for API CloudWatch logs."
  type        = number
  default     = 30
}

variable "db_secret_name" {
  description = "Name of the AWS Secrets Manager secret holding database credentials."
  type        = string
  default     = "student-b/api/db-credentials"
}

variable "secret_recovery_window_days" {
  description = "Recovery window in days for secret deletion."
  type        = number
  default     = 7

  validation {
    condition     = var.secret_recovery_window_days >= 7 && var.secret_recovery_window_days <= 30
    error_message = "secret_recovery_window_days must be between 7 and 30."
  }
}

variable "db_username" {
  description = "Database username for Student B API."
  type        = string
  default     = "student_b_api"
}

variable "db_password_override" {
  description = "Optional static password override. Leave null to auto-generate using random_password."
  type        = string
  default     = null
  sensitive   = true
}

variable "db_host" {
  description = "Database host endpoint."
  type        = string
}

variable "db_port" {
  description = "Database port."
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "Database name."
  type        = string
}

variable "rds_db_user_arns" {
  description = "List of rds-db:connect resource ARNs the API role may connect to."
  type        = list(string)
  default     = []
}

variable "redis_iam_resource_arns" {
  description = "List of ElastiCache IAM auth resource ARNs the API role may connect to."
  type        = list(string)
  default     = []
}

variable "additional_service_roles" {
  description = "Additional least-privilege service roles to create, keyed by role name."
  type = map(object({
    principal_service = string
    policy_statements = list(object({
      sid       = string
      actions   = list(string)
      resources = list(string)
    }))
  }))
  default = {}
}

variable "vpc_id" {
  description = "VPC ID where flow logs should be enabled."
  type        = string
}

variable "vpc_flow_logs_role_name" {
  description = "IAM role name used by VPC Flow Logs."
  type        = string
  default     = "student-b-vpc-flow-logs-role"
}

variable "vpc_flow_logs_log_group_name" {
  description = "CloudWatch log group name for VPC Flow Logs."
  type        = string
  default     = "/aws/vpc/student-b-flow-logs"
}

variable "vpc_flow_logs_retention_days" {
  description = "Retention period in days for VPC flow logs."
  type        = number
  default     = 90
}

variable "vpc_flow_logs_max_aggregation_interval" {
  description = "Maximum interval in seconds during which a flow of packets is captured and aggregated."
  type        = number
  default     = 60

  validation {
    condition     = contains([60, 600], var.vpc_flow_logs_max_aggregation_interval)
    error_message = "vpc_flow_logs_max_aggregation_interval must be 60 or 600."
  }
}

variable "logs_kms_key_arn" {
  description = "Optional KMS key ARN used to encrypt CloudWatch log groups."
  type        = string
  default     = null
}

variable "secrets_kms_key_arn" {
  description = "Optional KMS key ARN used to encrypt Secrets Manager secret."
  type        = string
  default     = null
}
