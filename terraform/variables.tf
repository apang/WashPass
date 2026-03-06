variable "aws_region" {
  description = "AWS Region where resources will be created"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
  default     = "production"
}

variable "db_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "washpass_admin"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}
