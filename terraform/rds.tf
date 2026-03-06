resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "washpass-rds-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "rds_sg" {
  name        = "washpass-rds-sg"
  description = "Allow inbound traffic from ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
}

resource "aws_db_instance" "washpass_db" {
  identifier           = "washpass-db-${var.environment}"
  storage_type         = "gp3"
  allocated_storage    = 50
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t4g.small"
  db_name              = "washpass"
  username             = var.db_username
  password             = var.db_password
  multi_az             = true
  publicly_accessible  = false
  db_subnet_group_name = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot  = false

  tags = {
    Environment = var.environment
  }
}
