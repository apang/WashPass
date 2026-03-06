resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "washpass-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis_sg" {
  name        = "washpass-redis-sg"
  description = "Allow inbound traffic from ECS to Redis"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
}

resource "aws_elasticache_cluster" "washpass_redis" {
  cluster_id           = "washpass-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.redis_sg.id]

  tags = {
    Environment = var.environment
  }
}
