output "student_b_api_role_arn" {
  description = "ARN of least-privilege role for Student B API."
  value       = aws_iam_role.student_b_api.arn
}

output "additional_service_role_arns" {
  description = "ARNs for additional least-privilege service roles."
  value       = { for role_name, role in aws_iam_role.additional_service : role_name => role.arn }
}

output "db_secret_arn" {
  description = "ARN of the secret storing Student B API DB credentials."
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL protecting the API."
  value       = aws_wafv2_web_acl.student_b_api.arn
}

output "waf_web_acl_id" {
  description = "ID of the WAF Web ACL."
  value       = aws_wafv2_web_acl.student_b_api.id
}

output "vpc_flow_log_id" {
  description = "ID of the VPC Flow Log resource."
  value       = aws_flow_log.student_b_vpc.id
}

output "vpc_flow_logs_log_group_arn" {
  description = "CloudWatch log group ARN for VPC flow logs."
  value       = aws_cloudwatch_log_group.vpc_flow_logs.arn
}
