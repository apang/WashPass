output "vpc_id" {
  value = module.vpc.vpc_id
}

output "rds_endpoint" {
  value = aws_db_instance.washpass_db.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.washpass_redis.cache_nodes[0].address
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}
