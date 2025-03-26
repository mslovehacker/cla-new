#!/bin/bash

# 시스템 업데이트
sudo apt update

# MySQL 설치에 필요한 의존성 패키지 설치
sudo apt install -y libaio-dev mecab-ipadic-utf8 wget

# MySQL 8.0.40 설치
sudo apt install -y mysql-server

# MySQL 서비스 시작 및 활성화
sudo systemctl start mysql
sudo systemctl enable mysql

# MySQL 보안 설정 (루트 비밀번호 설정)
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'rootpassword';"

# MySQL 바인딩 주소 변경 (모든 IP에서 접근 허용)
sudo sed -i 's/^bind-address\s*=.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# 만약 bind-address 설정이 없거나 주석 처리되어 있다면 추가
if ! grep -q "^bind-address" /etc/mysql/mysql.conf.d/mysqld.cnf; then
    echo "bind-address = 0.0.0.0" | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
fi

# MySQL 재시작
sudo systemctl restart mysql

# lab_db 데이터베이스 생성 및 nhncloud 사용자 설정
sudo mysql -u root -prootpassword <<EOF
CREATE DATABASE lab_db;
CREATE USER 'nhncloud'@'localhost' IDENTIFIED BY 'nHn1234~';
CREATE USER 'nhncloud'@'%' IDENTIFIED BY 'nHn1234~';
GRANT ALL PRIVILEGES ON lab_db.* TO 'nhncloud'@'localhost';
GRANT ALL PRIVILEGES ON lab_db.* TO 'nhncloud'@'%';
FLUSH PRIVILEGES;
EOF

# 스키마 파일 적용
sudo mysql -u nhncloud -p'nHn1234~' lab_db < db.sql

echo "MySQL 8.0.40 설치 및 lab_db 데이터베이스 설정이 완료되었습니다."
echo "사용자: nhncloud"
echo "비밀번호: nHn1234~"
echo "데이터베이스: lab_db"
echo "바인딩 주소: 0.0.0.0 (모든 IP에서 접근 가능)"
