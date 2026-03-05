AWS Web Application Firewall (WAF) Configuration
Objective: Protect the public API endpoints from rate-based attacks and common web exploits.
•	Deploy AWS WAF in front of CloudFront / API Gateway.
•	Enable AWS Managed Rule Groups (OWASP Top 10 protections).
•	Configure rate-based rules to limit excessive requests (e.g., 100 req/min per IP for public endpoints).
•	Add stricter rate limits on sensitive endpoints (e.g., redemption validation and code generation).
•	Enable automatic IP blocking for anomaly detection.
•	Integrate WAF logs with CloudWatch and SIEM for monitoring and alerting.
3. Least Privilege IAM Roles (Terraform Managed)
Objective: Minimize blast radius by enforcing strict service-to-service access controls.
•	Define IAM roles per microservice (e.g., API service, ML service, worker service).
•	Grant API service access only to specific RDS and Redis resources.
•	Deny wildcard permissions (no iam:*, no s3:*).
•	Separate production, staging, and development IAM roles.
•	Enable IAM role rotation and quarterly access review.
•	Store IAM configuration as code using Terraform for auditability and reproducibility.
4. AWS Secrets Manager Implementation
Objective: Eliminate hard-coded credentials and protect sensitive configuration values.
•	Store database credentials in AWS Secrets Manager.
•	Rotate secrets automatically (e.g., every 90 days).
•	Grant access via IAM role policies only to required services.
•	Remove all credentials from environment variables and source code.
•	Enable audit logging for secret access events.
5. VPC Flow Logs & Network Monitoring
Objective: Detect unauthorized or anomalous network activity inside the VPC.
•	Enable VPC Flow Logs for all subnets (public and private).
•	Stream logs to CloudWatch and S3 for retention and analysis.
•	Monitor for unusual east-west traffic between services.
•	Alert on denied traffic attempts or unexpected port usage.
•	Review logs during incident response investigations.
6. Expected Security Outcomes
•	Reduced API abuse and bot-based fraud.
•	Strict service isolation to prevent privilege escalation.
•	Elimination of hard-coded credential risks.
•	Improved visibility into network-level threats.
•	Lower residual risk across Spoofing, Tampering, and DoS categories.

