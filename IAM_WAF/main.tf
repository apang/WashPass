locals {
  db_password = var.db_password_override != null && var.db_password_override != "" ? var.db_password_override : random_password.db_password.result
}

resource "aws_cloudwatch_log_group" "student_b_api" {
  name              = var.api_log_group_name
  retention_in_days = var.api_log_retention_days
  kms_key_id        = var.logs_kms_key_arn

  tags = var.tags
}

resource "random_password" "db_password" {
  length           = 24
  special          = true
  override_special = "!@#%^*-_=+"
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = var.db_secret_name
  description             = "Database credentials for Student B API"
  recovery_window_in_days = var.secret_recovery_window_days
  kms_key_id              = var.secrets_kms_key_arn

  tags = merge(var.tags, {
    Service = "student-b-api"
  })
}

resource "aws_secretsmanager_secret_version" "db_credentials_current" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    engine   = "postgres"
    host     = var.db_host
    port     = var.db_port
    dbname   = var.db_name
    username = var.db_username
    password = local.db_password
  })
}

resource "aws_wafv2_web_acl" "student_b_api" {
  name        = var.waf_name
  description = "WAF protection for Student B API"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.waf_name}-metrics"
    sampled_requests_enabled   = true
  }

  rule {
    name     = "rate-limit-by-ip"
    priority = 10
    action {
      block {}
    }
    statement {
      rate_based_statement {
        aggregate_key_type = "IP"
        limit              = var.waf_rate_limit
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "rate-limit-by-ip"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "aws-managed-common-rules"
    priority = 20
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "aws-managed-common-rules"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "aws-managed-known-bad-inputs"
    priority = 30
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "aws-managed-known-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "aws-managed-ip-reputation"
    priority = 40
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "aws-managed-ip-reputation"
      sampled_requests_enabled   = true
    }
  }

  tags = var.tags
}

resource "aws_wafv2_web_acl_association" "student_b_api" {
  resource_arn = var.waf_association_resource_arn
  web_acl_arn  = aws_wafv2_web_acl.student_b_api.arn
}

data "aws_iam_policy_document" "student_b_api_assume" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = [var.api_compute_principal]
    }
  }
}

resource "aws_iam_role" "student_b_api" {
  name               = var.student_b_api_role_name
  assume_role_policy = data.aws_iam_policy_document.student_b_api_assume.json
  description        = "Least-privilege role for Student B API workloads"
  tags               = var.tags
}

data "aws_iam_policy_document" "student_b_api_least_privilege" {
  statement {
    sid    = "ReadDatabaseSecret"
    effect = "Allow"
    actions = [
      "secretsmanager:DescribeSecret",
      "secretsmanager:GetSecretValue",
    ]
    resources = [aws_secretsmanager_secret.db_credentials.arn]
  }

  statement {
    sid    = "WriteApiLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
    ]
    resources = ["${aws_cloudwatch_log_group.student_b_api.arn}:*"]
  }

  dynamic "statement" {
    for_each = var.secrets_kms_key_arn != null ? [var.secrets_kms_key_arn] : []
    content {
      sid    = "DecryptSecretKey"
      effect = "Allow"
      actions = [
        "kms:Decrypt",
      ]
      resources = [statement.value]
    }
  }

  dynamic "statement" {
    for_each = length(var.rds_db_user_arns) > 0 ? [1] : []
    content {
      sid    = "ConnectToAllowedRdsUsers"
      effect = "Allow"
      actions = [
        "rds-db:connect",
      ]
      resources = var.rds_db_user_arns
    }
  }

  dynamic "statement" {
    for_each = length(var.redis_iam_resource_arns) > 0 ? [1] : []
    content {
      sid    = "ConnectToAllowedRedis"
      effect = "Allow"
      actions = [
        "elasticache:Connect",
      ]
      resources = var.redis_iam_resource_arns
    }
  }
}

resource "aws_iam_policy" "student_b_api_least_privilege" {
  name        = "${var.student_b_api_role_name}-least-privilege"
  description = "Least privilege policy for Student B API role"
  policy      = data.aws_iam_policy_document.student_b_api_least_privilege.json
}

resource "aws_iam_role_policy_attachment" "student_b_api_least_privilege" {
  role       = aws_iam_role.student_b_api.name
  policy_arn = aws_iam_policy.student_b_api_least_privilege.arn
}

data "aws_iam_policy_document" "additional_service_assume" {
  for_each = var.additional_service_roles

  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = [each.value.principal_service]
    }
  }
}

resource "aws_iam_role" "additional_service" {
  for_each = var.additional_service_roles

  name               = each.key
  assume_role_policy = data.aws_iam_policy_document.additional_service_assume[each.key].json
  description        = "Least-privilege role for ${each.key}"
  tags               = var.tags
}

data "aws_iam_policy_document" "additional_service_least_privilege" {
  for_each = var.additional_service_roles

  dynamic "statement" {
    for_each = each.value.policy_statements
    content {
      sid     = statement.value.sid
      effect  = "Allow"
      actions = statement.value.actions
      resources = statement.value.resources
    }
  }
}

resource "aws_iam_policy" "additional_service_least_privilege" {
  for_each = var.additional_service_roles

  name        = "${each.key}-least-privilege"
  description = "Least-privilege policy for ${each.key}"
  policy      = data.aws_iam_policy_document.additional_service_least_privilege[each.key].json
}

resource "aws_iam_role_policy_attachment" "additional_service_least_privilege" {
  for_each = var.additional_service_roles

  role       = aws_iam_role.additional_service[each.key].name
  policy_arn = aws_iam_policy.additional_service_least_privilege[each.key].arn
}

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = var.vpc_flow_logs_log_group_name
  retention_in_days = var.vpc_flow_logs_retention_days
  kms_key_id        = var.logs_kms_key_arn

  tags = var.tags
}

data "aws_iam_policy_document" "vpc_flow_logs_assume" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["vpc-flow-logs.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "vpc_flow_logs" {
  name               = var.vpc_flow_logs_role_name
  assume_role_policy = data.aws_iam_policy_document.vpc_flow_logs_assume.json
  description        = "IAM role for VPC Flow Logs delivery to CloudWatch"
  tags               = var.tags
}

data "aws_iam_policy_document" "vpc_flow_logs_write" {
  statement {
    sid    = "AllowFlowLogsDelivery"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
    ]
    resources = [
      aws_cloudwatch_log_group.vpc_flow_logs.arn,
      "${aws_cloudwatch_log_group.vpc_flow_logs.arn}:*",
    ]
  }
}

resource "aws_iam_role_policy" "vpc_flow_logs_write" {
  name   = "${var.vpc_flow_logs_role_name}-write"
  role   = aws_iam_role.vpc_flow_logs.id
  policy = data.aws_iam_policy_document.vpc_flow_logs_write.json
}

resource "aws_flow_log" "student_b_vpc" {
  iam_role_arn             = aws_iam_role.vpc_flow_logs.arn
  log_destination          = aws_cloudwatch_log_group.vpc_flow_logs.arn
  log_destination_type     = "cloud-watch-logs"
  max_aggregation_interval = var.vpc_flow_logs_max_aggregation_interval
  traffic_type             = "ALL"
  vpc_id                   = var.vpc_id

  tags = merge(var.tags, {
    Name = "student-b-vpc-flow-log"
  })
}
