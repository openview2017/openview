# ConfigDB using Mariadb image

## created a docker container for mysql configdb with the command
docker run --name mariadb -e MYSQL_ROOT_PASSWORD=root -d -p 3306:3306 mariadb
To access the container via Bash, we will run this command:
  docker exec -it mariadb bash
  root@7ae21470ffda:/# mysql -uroot -proot -P3306
  
## Create Database using schema.sql  

## Import demo data using data.sql

## SQL Commands
  MariaDB [opeview]> use opeview
  MariaDB [opeview]> show tables;
  MariaDB [opeview]> select count(*) from app;
