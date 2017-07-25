CREATE DATABASE  IF NOT EXISTS `autoshift` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `autoshift`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS app;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE app (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  logo_url text,
  app_status_id bigint(20) NOT NULL DEFAULT '1',
  user_id bigint(20) NOT NULL,
  capacity_plan_result_id bigint(20) DEFAULT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY fk_app_1_idx (user_id),
  KEY fk_app_2_idx (app_status_id),
  KEY fk_app_4_idx (capacity_plan_result_id),
  CONSTRAINT fk_app_1 FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_app_2 FOREIGN KEY (app_status_id) REFERENCES app_status (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_app_4 FOREIGN KEY (capacity_plan_result_id) REFERENCES capacity_plan_result (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS app_blueprint;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE app_blueprint (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  app_id bigint(20) NOT NULL,
  original_type varchar(64) NOT NULL DEFAULT 'YAML',
  original_content text NOT NULL,
  edited_content text,
  entry_point varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY fk_app_blueprint_1 (app_id),
  CONSTRAINT cnst_app_blueprint_1 FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS app_metrics;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE app_metrics (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `index` bigint(20) NOT NULL,
  container_name varchar(1024) NOT NULL,
  pod_name varchar(1024) NOT NULL,
  controller_name varchar(1024) DEFAULT NULL,
  controller_kind varchar(1024) DEFAULT NULL,
  metric varchar(1024) NOT NULL,
  app_id bigint(20) NOT NULL,
  statistic varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY fk_app_metrics (app_id),
  CONSTRAINT csnt_app_metrics FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS app_sla;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE app_sla (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  app_id bigint(20) NOT NULL,
  error_rate double NOT NULL DEFAULT '20',
  latency int(11) NOT NULL DEFAULT '200',
  cost double NOT NULL DEFAULT '200',
  currency_type varchar(128) NOT NULL DEFAULT 'Dollar',
  PRIMARY KEY (`id`),
  KEY fk_app_sla_1 (app_id),
  CONSTRAINT csnt_app_sla_1 FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS app_status;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE app_status (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `phase` varchar(128) NOT NULL DEFAULT 'creating',
  service_count bigint(20) DEFAULT NULL,
  pod_count bigint(20) DEFAULT NULL,
  container_count bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS autoshift_application_mode;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE autoshift_application_mode (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  app_id bigint(20) NOT NULL,
  automation_level bigint(20) NOT NULL DEFAULT '75',
  PRIMARY KEY (`id`),
  UNIQUE KEY fk_application_mode_1 (app_id),
  CONSTRAINT cnst__application_mode_1 FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS capacity_plan;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE capacity_plan (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  app_id bigint(20) NOT NULL,
  demand_profile_id bigint(20) NOT NULL,
  is_auto tinyint(1) DEFAULT '0',
  k8s_endpoint_id bigint(20) DEFAULT NULL,
  config text,
  `status` varchar(128) NOT NULL DEFAULT 'CREATED',
  message varchar(4096) DEFAULT NULL,
  start_time timestamp NULL DEFAULT NULL,
  finishing_time timestamp NULL DEFAULT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY is_auto (is_auto),
  KEY fk_plan_app (app_id),
  KEY fk_plan_demand (demand_profile_id),
  KEY fk_plan_location (k8s_endpoint_id),
  CONSTRAINT fk_k8s_endpoint_id FOREIGN KEY (k8s_endpoint_id) REFERENCES k8s_endpoint (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_plan_app FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_plan_demand FOREIGN KEY (demand_profile_id) REFERENCES demand_profile (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS capacity_plan_result;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE capacity_plan_result (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  app_id bigint(20) NOT NULL,
  demand_profile_id bigint(20) NOT NULL,
  plan_id bigint(20) NOT NULL,
  k8s_endpoint_id bigint(20) DEFAULT NULL,
  load_duration int(11) DEFAULT NULL,
  config text,
  sla_result varchar(1024) DEFAULT NULL,
  sla_status varchar(128) NOT NULL DEFAULT 'CREATED',
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY fk_plan_result_app (app_id),
  KEY fk_plan_result_demand (demand_profile_id),
  KEY fk_plan_result_plan (plan_id),
  KEY fk_plan_result_k8s_endpoint_idx (k8s_endpoint_id),
  CONSTRAINT fk_plan_result_app FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_plan_result_demand FOREIGN KEY (demand_profile_id) REFERENCES demand_profile (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_plan_result_k8s_endpoint FOREIGN KEY (k8s_endpoint_id) REFERENCES k8s_endpoint (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_plan_result_plan FOREIGN KEY (plan_id) REFERENCES capacity_plan (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS demand_profile;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE demand_profile (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) DEFAULT NULL,
  description text,
  config text,
  config_json text,
  config_filename varchar(1024) DEFAULT NULL,
  load_duration int(11) DEFAULT NULL,
  location_id bigint(20) DEFAULT NULL,
  app_id bigint(20) NOT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY fk_demand_profile_app1 (app_id),
  KEY fk_demand_profile_location1 (location_id),
  CONSTRAINT fk_demand_profile_app1 FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_demand_profile_location1 FOREIGN KEY (location_id) REFERENCES location (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS deployment_plan;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE deployment_plan (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  resources_setting_json text,
  autoplanning tinyint(1) NOT NULL,
  app_id bigint(20) NOT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY fk_deployment_app1 (app_id),
  CONSTRAINT fk_deployment_app1 FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS image_repos;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE image_repos (
  idimage_repos int(11) NOT NULL,
  user_id bigint(20) NOT NULL,
  endpoint varchar(128) NOT NULL,
  `.dockercfg` varchar(1024) DEFAULT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idimage_repos)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS k8s_endpoint;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE k8s_endpoint (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  endpoint varchar(128) NOT NULL,
  server_certificate varchar(2048) NOT NULL,
  `key` varchar(2048) NOT NULL,
  client_certificate varchar(2048) NOT NULL,
  `name` varchar(256) NOT NULL,
  location_id bigint(20) DEFAULT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY idk8s_endpoint_UNIQUE (`id`),
  KEY fk_k8s_endpoint_1_idx (location_id),
  CONSTRAINT fk_k8s_endpoint_1 FOREIGN KEY (location_id) REFERENCES location (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS location;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE location (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  latitude double NOT NULL,
  longitude double NOT NULL,
  selector varchar(256) NOT NULL,
  size_limit varchar(64) NOT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY name_UNIQUE_1 (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS remediation_action;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE remediation_action (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  app_id bigint(20) NOT NULL,
  action_name varchar(45) NOT NULL,
  action_change_amount varchar(45) NOT NULL,
  set_config_before_action text,
  `type` varchar(64) NOT NULL DEFAULT '"recommend"',
  confidence_score double NOT NULL DEFAULT '1',
  cost_change double NOT NULL,
  set_config_after_action text,
  expiration_time timestamp NULL DEFAULT NULL,
  finishing_time timestamp NULL DEFAULT NULL,
  root_causes text,
  `status` varchar(128) NOT NULL DEFAULT 'in-progress',
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY fk_remediation_action_app1 (app_id),
  KEY fk_remediation_action_type1 (`type`),
  CONSTRAINT fk_remediation_action_app1 FOREIGN KEY (app_id) REFERENCES app (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS services_config;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE services_config (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  category varchar(64) NOT NULL,
  def_mem_limit bigint(20) DEFAULT NULL,
  def_cpu_limit int(11) DEFAULT NULL,
  def_scale smallint(6) NOT NULL DEFAULT '1',
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY name_UNIQUE_2 (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS user;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  email varchar(256) NOT NULL,
  `password` varchar(64) NOT NULL,
  first_name varchar(128) NOT NULL,
  last_name varchar(128) NOT NULL,
  profile_url text,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY email_UNIQUE_4 (email)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
