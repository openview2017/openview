CREATE DATABASE  IF NOT EXISTS `openview` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `openview`;

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

LOCK TABLES app WRITE;
/*!40000 ALTER TABLE app DISABLE KEYS */;
INSERT INTO app VALUES (1,'Demo1','http://kubernetes.io/images/flower.png',1,1,NULL,'2016-10-22 07:12:34'),(2,'Demo2','http://res.vmallres.com/images/echannel/newLogo.png',2,1,NULL,'2016-10-22 07:44:15');
/*!40000 ALTER TABLE app ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES app_blueprint WRITE;
/*!40000 ALTER TABLE app_blueprint DISABLE KEYS */;
/*!40000 ALTER TABLE app_blueprint ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES app_metrics WRITE;
/*!40000 ALTER TABLE app_metrics DISABLE KEYS */;
/*!40000 ALTER TABLE app_metrics ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES app_sla WRITE;
/*!40000 ALTER TABLE app_sla DISABLE KEYS */;
INSERT INTO app_sla VALUES (1,1,20,200,1500,'Dollar'),(2,2,10,200,1500,'Dollar');
/*!40000 ALTER TABLE app_sla ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES app_status WRITE;
/*!40000 ALTER TABLE app_status DISABLE KEYS */;
INSERT INTO app_status VALUES (1,'creating',NULL,NULL,NULL),(2,'planning',2,2,4),(5,'creating',3,5,5),(6,'creating',1,0,0),(7,'creating',7,8,8),(8,'creating',3,5,5),(9,'creating',3,5,5),(10,'creating',0,0,0),(11,'creating',3,5,5),(12,'creating',4,5,5),(13,'creating',4,5,5),(14,'creating',3,4,4),(15,'creating',0,1,1),(16,'creating',0,1,1),(17,'creating',3,5,5),(18,'creating',3,5,5);
/*!40000 ALTER TABLE app_status ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES openview_application_mode WRITE;
/*!40000 ALTER TABLE openview_application_mode DISABLE KEYS */;
INSERT INTO openview_application_mode VALUES (1,1,75),(2,2,75);
/*!40000 ALTER TABLE openview_application_mode ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES capacity_plan WRITE;
/*!40000 ALTER TABLE capacity_plan DISABLE KEYS */;
INSERT INTO capacity_plan VALUES (1,'acmeair test',1,1,1,1,NULL,'CREATED',NULL,NULL,NULL,'2017-04-06 05:22:19'),(2,'vmall test',2,2,1,2,NULL,'CREATED',NULL,NULL,NULL,'2017-04-06 05:22:52');
/*!40000 ALTER TABLE capacity_plan ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES capacity_plan_result WRITE;
/*!40000 ALTER TABLE capacity_plan_result DISABLE KEYS */;
INSERT INTO capacity_plan_result VALUES (1,1,1,1,1,300,NULL,NULL,'CREATED','2017-04-06 05:23:34'),(2,2,2,2,2,300,NULL,NULL,'CREATED','2017-04-06 05:23:34');
/*!40000 ALTER TABLE capacity_plan_result ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES demand_profile WRITE;
/*!40000 ALTER TABLE demand_profile DISABLE KEYS */;
INSERT INTO demand_profile VALUES (1,'summer','summer demand',NULL,NULL,NULL,300,1,1,'0000-00-00 00:00:00'),(2,'winter','winter demand (vmall)',NULL,NULL,NULL,300,2,2,'2017-04-06 05:21:42');
/*!40000 ALTER TABLE demand_profile ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES deployment_plan WRITE;
/*!40000 ALTER TABLE deployment_plan DISABLE KEYS */;
/*!40000 ALTER TABLE deployment_plan ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES image_repos WRITE;
/*!40000 ALTER TABLE image_repos DISABLE KEYS */;
INSERT INTO image_repos VALUES (0,1,'117.78.33.214','ew0KCSJhdXRocyI6IHsNCgkJIjExNy43OC4zMy4yMTQiOiB7DQoJCQkiYXV0aCI6ICJYMkYxZEdoZmRHOXJaVzQ2WXpJek9HWmlNelF3T0dFNU5EQTNOamcxWWpBMk9XWXpPRGN5WXpBeE9XWXRRMDFHVHpoUlNrcE9VMWswVnpGRVFsbEtXVkV0TWpBeE56RXdNakV3TWpNeU5EWXRZemhqTkRWbU16RmlaVGN4TTJFMU1XSTFOR1UzWkRObFpqY3laRGhoTVdKa016UmlZMk0xTkRJMU5ERTRaR1U0WVRNMVpqZ3dOMkV3TURVd1lqUmhOUT09Ig0KCQl9DQoJfQ0KfQ==','2016-10-25 00:39:45');
/*!40000 ALTER TABLE image_repos ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `k8s_endpoint` WRITE;
/*!40000 ALTER TABLE `k8s_endpoint` DISABLE KEYS */;
INSERT INTO `k8s_endpoint` VALUES (1,'https://35.164.135.254:6443/','-----BEGIN CERTIFICATE-----\nMIICyDCCAbCgAwIBAgIBADANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwprdWJl\ncm5ldGVzMB4XDTE3MDMzMDE4MzkwNVoXDTI3MDMyODE4MzkwNVowFTETMBEGA1UE\nAxMKa3ViZXJuZXRlczCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALvL\nrCpZD8vIr77s2SD+APDzA6Zuhe7AZWWljSE73FJ7aH2sksdF4hh2bCc8apw6nS/H\nsC78++ytbHvwYoBM7SE7wYpTJEse+V3OfJenByMAyzGj/u+HdQxBtJ3fv+BuPTpa\nixmNaZJc+UdY9KZwYwS6n250PbuotIGQ6eDO5CIbnyqn+0rZXsYAQGkfU84H1DJx\nNHmiEvUCgsCF1Vlg6Cgm+GBlFIn+bRWoMdR2KQwDYtHQhPGhGI6/0I27aaF9rU+r\nNFTu6SGFDkopMG2PaIjkIy353pK9mbjgDh/HAjPXWrkWR94rRjbNyd6bjbHWd/Bu\neZ6vPmfLD+cfV1vqdOECAwEAAaMjMCEwDgYDVR0PAQH/BAQDAgKkMA8GA1UdEwEB\n/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAAMUop928FYgT9RbP1yx+eMC6DSt\nckIgbTxG7eaF4NmO0sSaJPBzQiyUhA5to5nH2QwlzoyfPtCUTjI84x0ND0YcJby2\nGOG9RU8XQUob1cSdUy3dV+G6h+a2IMznfP/k6qLBsAd/qLY8PbO2s/Q5U16mpiAN\n+cxNDQqotxfTQakN7DvzhyW1bsWssi5EAE2V+nx758BbpbyyVmbAGtVPa1FfB7v9\nQ/iSZqiGQNRXpLHnT4NMd0Kt/Sja7ABXov2ujvs9Ra1Whk15NAJ3t1ZxPV9bo3Zt\nzVMZ4UWqCn+nRzu2gm3Vl0+HnI3qYBSIJrmYTkUIAn8sOWFB+qT2qCtQwlA=\n-----END CERTIFICATE-----','-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAxO0OUnsXbX8jeOGe0vcKjpjoOL++70xVtgs1wcUn+8K0PHKU\nCP11wLKFlpFk1pye/ZFoShmqOHf0zf6QaN+8nkvqKmCe/pj6fnGBfohYL3s+RDFP\nh3j6CoADUKJxQGRY4RKt4pwbBCHjjF8lo1L8eE/dUE06aM4edeVACH6q96oGIcQU\nLs4h+paoUZc4TBPuHDSHHvRilnOeW0+gunuUnFCO2E27kbyN+3T3tWWph9Z1pD2N\nR9hTIyZrKnLX8zOIMYoSXvKsOheqzwWthJd95tzCXmZclGTktP6lCtvcbyYl+080\nCj3NNYy+8IJL+AUUwkAbZOEVifb943cw19cy6QIDAQABAoIBAGXJrnR9wX9MjzZF\nUMX1AZTxfl8O5Y9lYoxFQRUWZnNgka8I/nGjKUFgRWKtZnTz4c5pYYGjwHONtZDg\nex5qP2GHFdOvu58Xzaqb2vZfXU21o1q2Lkh1BLF2t7/vJyDEfZhhAlY2oFRDfA2r\nhJXmKC+8AEYolP9lQyNnSvDZIGAArv0NP4J5736XIN/2PBa+zKgjOSBDR9S+YWfZ\njGXHMaouFiQZBwlipR9C77Ln3dkJXJv/U3T5QmtWn8tzNzxB9GVlpX+tN9q7h0hm\nuI5nTX02Lz5+gGM3Am5rHmE84HLVoQAGVbrpQjMCX68Dk2W+MYWrWMcz9hzU6jgI\nMQRzRA0CgYEA6Ze9upTaeGn+isbbFY4JT4IltpYAVMfOQ6EsfMt910LsEd/cGJ5Z\nEHwKe78kuxrVphJB/Blaka8g4ynjl1JxBW/kRhcg/tzB1yxDAQWNaE2T8cL5J6Xq\nKdFx+jU90mtJLiy94PwucHw7ZljA20qp00B/SdtmDnKw/NQYVu3Pp1MCgYEA19Dm\n5ng2jxKoCO7Kla4NIg9HR6ulNYFGFGfY6WaOgH7uVifECgcbllTUqcJ9eVH6IBjV\ncffW+RPD6T9j2KcJ1KS/pPVAU13HOthNmwnGhCv42UcVKKVM0p9urKFfXLNXNPZc\ngGGRLcqsHDz0Nr3GFwdlSElh5cukDZUs1Gw84VMCgYEA4H48kPxNmjwDrUu/cc+3\nkvn5VKiEWPZNfSGAp87Jef+O8P67f81uuzD6wkLJAiif+6LAV4/mQuyUJr0zRVKt\n3BPUxqejxkxS3oBjRLAZXoxwCoDfAwOpL9diOpzAdWE2S3IkafzyhJhgXdQeRKJU\n4/mwW0LHqkr/XXxYh/K1BpECgYEAtUkCnHhAhEBMrGxB+iehWonw+1BAz8gOoRd2\niuCeNWvqMq7mqvG7h7UsiokYMy/cZtfVfA2PI90phSW9boEp7diSLzPgW+b7cv+9\neM1mVyJEv+dI68Km3IoWQqavX0Q6rf+ARksu04NavcGp9s3EtxV8S5Nwy8IaxVoY\ntTtSjIcCgYAoZ//HzZ7AdyUo31epMzpQua5bWIa4psQnb5BOWm19YQpQwe01oVdr\nO40LZaG14+HSPl9/WtAUZ04JfTyYrekvRf6B/Ze9xh8sr7Cr8uwFhQwxfr/SxYI9\nAKuxo04uxh/SR6zFU5hE34sqF+UifPJOx1Zz+vdl4qo0rb+p2pXquQ==\n-----END RSA PRIVATE KEY-----','-----BEGIN CERTIFICATE-----\nMIIC8jCCAdqgAwIBAgIICPl4aeKE3NAwDQYJKoZIhvcNAQELBQAwFTETMBEGA1UE\nAxMKa3ViZXJuZXRlczAeFw0xNzAzMzAxODM5MDVaFw0xODAzMzAxODM5MDZaMDQx\nFzAVBgNVBAoTDnN5c3RlbTptYXN0ZXJzMRkwFwYDVQQDExBrdWJlcm5ldGVzLWFk\nbWluMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxO0OUnsXbX8jeOGe\n0vcKjpjoOL++70xVtgs1wcUn+8K0PHKUCP11wLKFlpFk1pye/ZFoShmqOHf0zf6Q\naN+8nkvqKmCe/pj6fnGBfohYL3s+RDFPh3j6CoADUKJxQGRY4RKt4pwbBCHjjF8l\no1L8eE/dUE06aM4edeVACH6q96oGIcQULs4h+paoUZc4TBPuHDSHHvRilnOeW0+g\nunuUnFCO2E27kbyN+3T3tWWph9Z1pD2NR9hTIyZrKnLX8zOIMYoSXvKsOheqzwWt\nhJd95tzCXmZclGTktP6lCtvcbyYl+080Cj3NNYy+8IJL+AUUwkAbZOEVifb943cw\n19cy6QIDAQABoycwJTAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYBBQUH\nAwIwDQYJKoZIhvcNAQELBQADggEBAIvXAtWCEBRE3BA0Nzjlg7oPtX2zaBqYIFjQ\nZMY+EBK4jNsA5sgvs403JeusN8kFlDvouAraJdqnr3AMn7v3fzSNydC9R+NhPvBy\n96aRnt4/Oq9+7+DPcJrFduVbjYJNGN9y5aNjbh9EkxHFj6og/VSuVL9K4b/TzmL5\np94XCVvzRiVf/oxJ0YtlkCwXaeazLjqC5euQUT3LMIiKXFH7UREEdi+rEdMBH6Je\nCq9PXVw5iOVGcWyOdEEafTSvfD4tBLFCuas1qHiihNfnNbao/IJ1cVW/hfEYX17G\n635Gv5w3hlcORxmdRYFf/LpOXlGc3QdXKNhmyhUJzkk05EhBaPU=\n-----END CERTIFICATE-----','AWS Oregon k8s 1',4,'2017-02-12 23:39:45'),(2,'https://k8s2.openview.us:6443','-----BEGIN CERTIFICATE-----\nMIICyDCCAbCgAwIBAgIBADANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwprdWJl\ncm5ldGVzMB4XDTE3MDMwMTAwNTczM1oXDTI3MDIyNzAwNTczM1owFTETMBEGA1UE\nAxMKa3ViZXJuZXRlczCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL3D\nvZiyp2r5eG8vekG4uOrTzIAJz/GNaPRsItzylTz9wg40k5wdjTksGBhLQhtNIO6h\nkrfCrMEpuHWAY8CLpP/YCdedLE4bHNDs38u13/Oc9WvvSuBcMpoym+s5/h7iJ33V\nvCDj59Pl6jO6xrG34FhwTo8tSHMW1BIKQZ+fs+57tKM4Knie1RxPWIJbMkZTrlWe\n02WBmhVqARsiePgTxoXLgbtzHxQlD4Xncb9hNYjn9W99hhNoPXeDG0qR4u2dURhd\nmYI4cEBvJnpLlVuunaezeiCnLSBDfyNct8nuz84FJupZpXGQVOOeTN9f29eHhQ5K\nZYrFB3mU4W+zXhaf1G0CAwEAAaMjMCEwDgYDVR0PAQH/BAQDAgKkMA8GA1UdEwEB\n/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAGWGvVyOLwgYdgzT6Ro32Pq399lp\naaQxCMEdxh6nyb8ZuUYlbZW3TQ9fx1MvI7ugy98Uya1mWjyKmkgO0c8t2qtZrShz\nLwbTkY/hs0ovqJONdZXWT0bMOjP4TFu4mFApAtG1UeHX2VaqikMn/08vC8KG19P9\nFktoVMJCCAbQHGSpYj11Wv5m3LoS6AhOQYK+9S/WbICsoGzRwakW4JMOW6k7D2g3\n5bjDFCU8WTTtHOclkC0gaAjP+e3s3bFbr0HX3hE/20hsuxVOChVQipZln2IcFEbd\nJHBes4LOpi8PzsFiOzwoRNKoIHAvxFpy6I1ImcbIQMSWFnoajYyI/rICVuU=\n-----END CERTIFICATE-----','-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAstx2pYYzhGfieWPhDjhONMD6B3LojFZeIcB/yVmFRBwKW/8Z\nv7z8huvlBYCGvXxBGN6QpCa5i8SaQ7ntLgujjyaSfUyr9d4A7EQCegRIR8EjZIDA\nDzFLfExxYfTZq9kjSGaRpFqq/xGJqA8NAoCHCpY0vZrJLRE8R21nIyGBn5ALTEs6\nMaX+xw+IBlKeN5EkSGH31GaghhapGB7PdcYSr2TitQji4h71LdcfwZYU7YrTVTmU\ns9y/co/mSuoICgWHUkUbEUPJ1zaZ+wnpfqO9UmgsINqH5jwE+4cETXIHSwFnh//e\nguk86xlO8s+XnuBHb6pFkRoC0L2Wr8PtOXYR4wIDAQABAoIBAGj/xWMMcmfTOH98\no9zeLwMHGoCO83eXKDF2OU4xkGtYbrhs/Ge0AScPimX9epv4Oprn5U+IMDqd0tXZ\nayQxzvW1dh+6h+SRTEdm8XFB3FDLUASrFJSWorK4iYMw4yvgD7dsBynN1D5ixEX1\nd/S1ERGk9hcsq9caHCHuVrKn89mAEMHnr38z7uPN4iMKudREx0rHqQzFGFMxA0wZ\nlbHa9C7kYUrwj793FD9FzzzBXYxCBURuKdwpCJJQP+PQ2WzaUCcEz+hZIm3bRuGg\nAyFr0edz/wpa7pcHPeo+M/lbsZKpZR2FS9epsXSH6OEHxPCD3/5k+3O1JLlhF/ug\ngXoIjvkCgYEA6/GSzmQjqhFFmg+JTspACZiFX+ZaLXylvsZXdkdfVbRRD5fZMrwG\nr5HsvmJ16rn5Zh5haQRmefLVmgxT+MZnUo90haii+6ftKcW7mxU077HCqs2d/71P\nLXRL8qbmTP1730ltT+DM7P3zbx09mR4QVZ+oOGToZQn+JfEakh4BadUCgYEAwhC0\nbsO5jwH43gxQIoMvPPwVck/VyTYN07wmji8phxPd1uJ8SoxmxyWo9GUd7VU/NnZE\nhB15O/s778sKeFVCcMV4T9prD/kZN+jD83EgDP+iHXB5cW/I7+zgcJYbH01BcyUl\nDmW1YWREBxLKImE2reE/rOJo/PjOpHYuyBOVcNcCgYEAutg8dNtSbuxsnPsutklt\n+utgu7gUs67hJrm1K4KL2bgI9Xs/0nCaLtE1lPMuBCsweJEYfOyyJmKKiwq2OO0N\nh5D5KpuILhgmtQzUa5SYrjSsP0zDkXGeURWmy0smV9PpE8L3IOmZ/xeAfv69+BKZ\nxuS/d6FZdCI8tFlBvHKsld0CgYEAn64pGP7ZXw9rXCHbihpRMyfk6bNBIJfmlrM5\nMkMiM3AoWBjx1lFifDjDpZzSHCfJpKF5zQ+HYtBdR/jUe6ED01DYpzP8Zh88HeHb\n4iLSEYACP6D9fFZTiv9oyZrpZD8oPHty2z7bGPDsfLl8Mv+0gyxVPYbqhkSfm3lX\nEu/yRe8CgYBue2aCobiRWciC2X5pvkgRLVnMtWWO/pSh9a6BXuIwZnojtSLGQ44H\nc4nDuA5KsalJZaZE5TLw+3Hef9H3HExOOpLzgLfKSlxhAeLc7FfUwZAWeJhRkexC\nbql7asTRq667r8l9wL7v1eKQoLnxgYMwm7axhMc7e8SZa2oXEbd0gA==\n-----END RSA PRIVATE KEY-----','-----BEGIN CERTIFICATE-----\nMIIC4zCCAcugAwIBAgIIe60VQSDoy7UwDQYJKoZIhvcNAQELBQAwFTETMBEGA1UE\nAxMKa3ViZXJuZXRlczAeFw0xNzAzMDEwMDU3MzNaFw0xODAzMDEwMDU3MzVaMBsx\nGTAXBgNVBAMTEGt1YmVybmV0ZXMtYWRtaW4wggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQCy3HalhjOEZ+J5Y+EOOE40wPoHcuiMVl4hwH/JWYVEHApb/xm/\nvPyG6+UFgIa9fEEY3pCkJrmLxJpDue0uC6OPJpJ9TKv13gDsRAJ6BEhHwSNkgMAP\nMUt8THFh9Nmr2SNIZpGkWqr/EYmoDw0CgIcKljS9msktETxHbWcjIYGfkAtMSzox\npf7HD4gGUp43kSRIYffUZqCGFqkYHs91xhKvZOK1COLiHvUt1x/BlhTtitNVOZSz\n3L9yj+ZK6ggKBYdSRRsRQ8nXNpn7Cel+o71SaCwg2ofmPAT7hwRNcgdLAWeH/96C\n6TzrGU7yz5ee4EdvqkWRGgLQvZavw+05dhHjAgMBAAGjMTAvMA4GA1UdDwEB/wQE\nAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwDQYJKoZIhvcNAQEL\nBQADggEBAHQ8p6NNcoBx9M+Orn2qcBqctiG5NRXq/3r3cjFF6qFPJih2jTzE+Nq6\njYQ5/fklaDJMu0JCZk5D2bhH1G53c/3dMGKQv1n0f/lq83//jDFUe4BJFAyTmviD\nyS7qMBYT5gonjl1UXBCFdK8nJU0xolrrWTrooAJxS1DjthSSSjFKdux7NGDBRwyV\nOeFN3dTVVem99NSekQXb3vXxJcdI2cfS+hiMoRN32i2FVJXHlPQ4cd1aQUxkP4wH\nZxldD7TweCvxLcj7wJtMoljUvZ/oPa65aCgHqQwsO1JTiJwXrCTdwEReMu/W0S8z\nR18bXsWOgg++jnzY7nsOl375iSlWuqU=\n-----END CERTIFICATE-----','Huabei-2 k8s2m',1,'2017-03-23 23:39:45'),(3,'https://k8s3.openview.us:6443','-----BEGIN CERTIFICATE-----\nMIICyDCCAbCgAwIBAgIBADANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwprdWJl\ncm5ldGVzMB4XDTE2MTIyMjA3NDMzMloXDTI2MTIyMDA3NDMzMlowFTETMBEGA1UE\nAxMKa3ViZXJuZXRlczCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJvp\nmZqVx23hwwcd9Qo0ROzykdJHrn13xANnmUrJ+SUCR8TGfO68WTJFFSFrqpooHOQ+\nC5tsgKinhmQQitUvg4yM72z61pUqKF9tWWt5zYWwrQ7HQGT4n9R3x94ACFCV/H4C\nmaW/W5foG3uDABHftg1JP/z4YdQzU2K1lYZ0InPiHjQrp/Q/uXqFmX6BpDMtNV0p\nyXdpMDD7M3WsM9aEKr4VxsxXmzOINmAigh+eBzNdldZRDNy0+EAXm4Cpas3jgpM8\nzzI+9M7gKn7pBEfJY6Zfi5wEAcZhkhjw54FtoQpCEYf0BOh0JPEVQZl4Fnmjta9o\naXW0rU72nCfwdGdgKOcCAwEAAaMjMCEwDgYDVR0PAQH/BAQDAgKkMA8GA1UdEwEB\n/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBACL/tklA/p1bF1dU3AFQtC/yET6C\nZUp3fHhq6hWhPEC6lkKcmTicDalGpor4d6SmsAp9IyyOa5IVOyVX/SiBwWv7zH7H\npwAx3nwnphmHS7QgcYETvFV73uaimHp1M/wenJQjWQmwmZbtNR0PEEgZa7vdob/U\nsPP4HOF9udMSd2uq//JMnjYArAhZtCc/YptifvukIBenEW5A6ZFa27wlyEyxJd/R\n6SdPdmd+8h2IFwkPwjyHyygHfuyIhEkBJ+TJBvepubvwzLV9dVgnOKDxSxZWaspL\ndZ2bpTPXRaO4d+CGO4wQVR+iVgOkjoaTRks7dWZ8Lyik0FdPzTndOQ9dZ4w=\n-----END CERTIFICATE-----','-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAw6Rq2EHgdbtecAMxmYj+lVwcX9kpSwt7ihc0g5/ppx6z4pBE\nAQuV5KJZn7Oa9kYgBFZpyZdRxAKpfefI23dkwPGM3mEiWInqAISrFItsGPM6hEkY\nJnhEy7LhLkHsohujpBj59IR7IMi/Z8sZydCdhxDIogfRxqhNoki8l0Z3bSs+o6x3\nNYa5PaQWpviGLgfsBGB0buIsG/XV4lR69uZZE9hP2iUHBi6TQHKf808weaSDja06\n4OeKR8XTM1YL7qru48ix243rLAJTDsKREgOma2uwCjU7Zt8y5EGq6XlvgkHWkEh+\ndZyjKRA0+ycxKTYnqms5fT+FSPsKampsnwEr6wIDAQABAoIBAD62pclM1LboqQ0e\n+PdOgs0+CZpv8lysAZ3yclL/H9cCcIdf12y+Wf5ATJp06Gepcvnw+Vg1uXArqklB\n05EGZLW0uINQf8IB85DW9kBPsQcOcOOWyrcKNoNVg/lgCIqucXZYy0cmcJHByBlt\ncYbP6K8zIh1OhGA58yjiSBH19LJ5aaxPJzg5K3PV783bsQ2FvY60AhG+/opeeLBY\nEkQHgGnTG1QSDnGRwpzgbzv2Xmbbr3oWdDCrqKNUcbGbRY7ZtWbPWMKPBfTyg071\nq6e4p/IBk9C3dpZr5S2jd/BB6Vt+HfR+oca2I2egc5OivO7TPq0M7os4WRCjuNzO\n9SEAcYECgYEAxUqdLwTD6V9LF6tdCrLiKwVKR1LmomehG1woafrhKffwiJFNvxb1\nIIUkBkob70TOyzD5HzU6ibRybXjQ1XRTdkSCz7kzaQFwXs0jizK4i92sTURnN7u6\n2jqQ2lZ0SBksBo5DItnARBeYh8z2kgDCOAGjH9isLiaui33fF44ZmDUCgYEA/dwr\nUK3t2zanVLmQ95EYwCmSXWR/69tcr2zQ+2PSb9LxRPRzCLgLYizwebqt9izpuagW\nAXUVyNNQBYhy/jPFMHnHvaalRkLWrdpe8TyiEN69j2TD+095aIjUbUmXEmKPXFtc\nPVKmPY9fjujlvrmCyNsjZsDDQGhVWUmlb2NPd58CgYAMIcB0qbhaW2/Ertbz13gs\n6RBePmzMQ88WXZ5mlfTOnd5+p2C+hWzhaQ6EDH6XQgXtXL+U+bL10NDQhoNg/Nw9\nA41/tIXCyUHdsoOjBaVvhFwaDEDEnpio3r0VkAdqf5HDfXAHbphyF3lbsHDhHYbT\n5tXfGXXNCLfnAAB99FECmQKBgQCqT8u/lPC+4Svh650WeoHgagOIJKSt172W86pA\n/fdwjlTPrjB+6Pq6Iuwyvst3HSqxI9Ofpq22zg4hqCl94b2piAo5clPvj2f3u0l3\nDvar2sPSMAhL0kXhm+roZzazXuxPSfvYKFrfchDqD9YS3uKfXmWhyjE0RMr93Crh\nT/9AgQKBgQCAfKakUo0CHeVCYLswKA/GrCSIMkCFy+Vp/wOFW359rikKbMGeEonj\nUvlbrbw2yQljC99NgiRpHYmNI5o+DFOQT4tt3tHtF07ovjW0gwg9Nvk5oPr/d3bu\n45kiHxlyksI/INTk+H1b3ncsI022f9sn52zW1d0VgEESJFNLQuLCFw==\n-----END RSA PRIVATE KEY-----','-----BEGIN CERTIFICATE-----\nMIIC4zCCAcugAwIBAgIIWLLwskeaFtkwDQYJKoZIhvcNAQELBQAwFTETMBEGA1UE\nAxMKa3ViZXJuZXRlczAeFw0xNjEyMjIwNzQzMzJaFw0xNzEyMjgyMzE4MDdaMBsx\nGTAXBgNVBAMTEGt1YmVybmV0ZXMtYWRtaW4wggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQDDpGrYQeB1u15wAzGZiP6VXBxf2SlLC3uKFzSDn+mnHrPikEQB\nC5Xkolmfs5r2RiAEVmnJl1HEAql958jbd2TA8YzeYSJYieoAhKsUi2wY8zqESRgm\neETLsuEuQeyiG6OkGPn0hHsgyL9nyxnJ0J2HEMiiB9HGqE2iSLyXRndtKz6jrHc1\nhrk9pBam+IYuB+wEYHRu4iwb9dXiVHr25lkT2E/aJQcGLpNAcp/zTzB5pIONrTrg\n54pHxdMzVgvuqu7jyLHbjessAlMOwpESA6Zra7AKNTtm3zLkQarpeW+CQdaQSH51\nnKMpEDT7JzEpNieqazl9P4VI+wpqamyfASvrAgMBAAGjMTAvMA4GA1UdDwEB/wQE\nAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwDQYJKoZIhvcNAQEL\nBQADggEBAAF60ReJlOSi9ACDWrjm8qrwviIa6uWCf6JBfYRzf33Eduiqv+l/vo18\n09+1eJTpxyJjP/2bjKtdeGbQZodHomPaB0fLipJmhyjjs+92tbzLXKHoZXyOW4OC\nogSREtchRBXE9X5EyQc9NeRpoaASQ9iEYjF2ZHaF29P1HKeapgHuhtf5O7MFfp9G\nizRXEz9tdyIL0O2sCuWhh6XKuzQNjL+pppFd0iPzpc+DbRt3XB9lfn5yqBXIQKp0\nzX4ldm8Ng7TjAuQpGZf4NETqUbr9cSJKMZQb5y6caVluTDnFWCxbJzQVs2am6VqU\nLPKyGXrnUoKiql9/6tLIoM1uE+k4yiI=\n-----END CERTIFICATE-----','Huabei-2 k8s3m',1,'2017-04-06 17:17:45');
/*!40000 ALTER TABLE `k8s_endpoint` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES location WRITE;
/*!40000 ALTER TABLE location DISABLE KEYS */;
INSERT INTO location VALUES (1,'Huabei-2 HwCloud',39.54,116.68,'region=cn-north-2,provider=hwcloud','2','2016-10-22 07:49:35'),(2,'Huabei-1 HwCloud',39.54,116.68,'region=cn-north-1,provider=hwcloud','2','2016-10-22 07:49:35'),(3,'Huabei-1 Aliyun',36.06,120.38,'region=cn-north-1,provider=aliyun','2','2016-10-22 07:49:35'),(4,'US WEST AWS',43.8041,120.5542,'region=us-west,provider=aws','2','2016-10-22 06:44:27'),(5,'EU Frankfurt AWS',50.1109,8.6821,'region=eu-central-frankfurt,provider=aws','2','2016-10-22 06:44:27'),(6,'Sydney AWS',-33.883056,151.2166667,'region=ap-southeast-sydney,provider=aws','2','2016-10-22 06:44:27'),(7,'SINGAPORE AWS',1.29027,103.851959,'region=ap-southeast-singapore,provider=aws','2','2016-10-22 06:44:27'),(8,'ShenZhen Aliyun',22.54,114.05,'region=cn-north-1,provider=aliyun','2','2016-10-22 07:49:35');
/*!40000 ALTER TABLE location ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES remediation_action WRITE;
/*!40000 ALTER TABLE remediation_action DISABLE KEYS */;
INSERT INTO remediation_action VALUES (1, 2, "CPU", "+20%", NULL, "RECOMMENDED", 1, 0.05, NULL, NULL, "2017-04-07 04:00:00", NULL, "RECOMMENDED", NULL),(2, 2, "MEMORY", "-20%", NULL, "CUSTOMIZED", 1, 0.05, NULL, NULL, "2017-04-07 08:00:00", NULL, "RECOMMENDED", NULL),(3, 2, "SCALE", "+2", NULL, "USER_APPROVED", 1, 0.05, NULL, NULL, "2017-04-07 16:00:00", NULL, "RECOMMENDED", NULL),(4, 2, "SCALE", "-1", NULL, "AUTO_APPLIED", 1, 0.05, NULL, NULL, "2017-04-07 20:00:00", NULL, "RECOMMENDED", NULL);
/*!40000 ALTER TABLE remediation_action ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES services_config WRITE;
/*!40000 ALTER TABLE services_config DISABLE KEYS */;
INSERT INTO services_config VALUES (1,'mysql','db',2048000000,200000,1,'2016-10-22 06:44:27'),(2,'_default','_default',1024000000,100000,1,'2016-10-22 06:44:27'),(3,'nginx','loadbalancer',1024000000,100000,1,'2016-10-22 06:44:27'),(4,'redis','db',1024000000,100000,1,'2016-10-22 06:44:27');
/*!40000 ALTER TABLE services_config ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES user WRITE;
/*!40000 ALTER TABLE user DISABLE KEYS */;
INSERT INTO user VALUES (1,'Xiaoyun.Zhu@huawei.com','openview16@hw','xiaoyun','zhu',NULL,'2016-10-22 06:44:27');
/*!40000 ALTER TABLE user ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
