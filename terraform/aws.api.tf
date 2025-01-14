resource "local_sensitive_file" "ssh" {
  filename = "${path.module}/mf-main.key"
  content = var.ssh_key_private
}

resource "random_string" "jwt_secret" {
  length  = 30
  special = false
  upper   = true
}

resource "random_string" "encrypt_secret" {
  length  = 30
  special = false
  upper   = true
}

resource "aws_key_pair" "mf_main" {
  key_name   = "mf_main"
  public_key = var.ssh_key
}

resource "aws_security_group" "mf-api-sg" {
  name        = "mf-api"
  description = "Mythos Forge API Security Group"
  vpc_id      = data.aws_vpc.default.id

  // To Allow SSH Transport
  ingress {
    from_port   = 22
    protocol    = "tcp"
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }

  // To Allow Port 80 Transport
  ingress {
    from_port   = 80
    protocol    = "tcp"
    to_port     = 80
    cidr_blocks      = ["${data.aws_vpc.default.cidr_block}"]
  }

  // To Allow Port 443 Transport
  ingress {
    from_port   = 443
    protocol    = "tcp"
    to_port     = 443
    cidr_blocks      = ["${data.aws_vpc.default.cidr_block}"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_instance" "mf-api-instance" {
  ami                    = var.resource_settings.api.ami_id
  instance_type          = var.resource_settings.api.instance_type
  subnet_id              = var.subnet_id_1
  vpc_security_group_ids = [aws_security_group.mf-api-sg.id]
  depends_on             = [aws_security_group.mf-api-sg, aws_db_instance.mf_database]
  key_name               = aws_key_pair.mf_main.key_name
  lifecycle {
    create_before_destroy = true
  }

  connection {
    type        = "ssh"
    host        = aws_instance.mf-api-instance.public_ip
    user        = "ubuntu"
    private_key = file("${path.module}/mf-main.key")
  }

  provisioner "remote-exec" {
    inline = [
      #!/bin/bash
      "sudo chown -R ubuntu:ubuntu /home/ubuntu/mythosforge/",
      "sudo apt-get update -y",
      "sudo npm install pm2@latest -g"
    ]
  }

  provisioner "file" {
    source      = "../api/lib/"
    destination = "/home/ubuntu/mythosforge/"
  }

  provisioner "remote-exec" {
    inline = [
      "cd /home/ubuntu/mythosforge",
      "echo \"NODE_ENV=production\" >> .env",
      "echo \"PORT=4001\" >> .env",
      "echo \"UIPORT=5173\" >> .env",
      "echo \"APP_UI=https://mythosforge.app\" >> .env",
      "echo \"JWT_SEC=${random_string.jwt_secret.result}\" >> .env",
      "echo \"ENCRYPT_SECRET=${random_string.encrypt_secret.result}\" >> .env",
      "echo \"GOOGLE_CLIENT_ID=${var.GOOGLE_CLIENT_ID}\" >> .env",
      "echo \"GOOGLE_CLIENT_SK=${var.GOOGLE_CLIENT_SK}\" >> .env",
      "echo \"OPENAI_KEY=${var.OPENAI_KEY}\" >> .env", 
      "echo \"DB_URL=postgres://${var.db_username}:${var.db_password}@${aws_db_instance.mf_database.address}\" >> .env",
      "sudo npm install",
      "sudo npm run prisma-sync",
      "sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 4001",
      "sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 4001",
      "sudo ufw allow 4001",
      "sudo ufw allow 443",
      "sudo ufw allow ssh",
      "sudo yes | sudo ufw enable",
      "sudo pm2 start /home/ubuntu/mythosforge/server.js --name mythosforge-api"
    ]
  }

  

  tags = {
    Name = "mf-api-instance"
    version = var.app_version
  }
}

