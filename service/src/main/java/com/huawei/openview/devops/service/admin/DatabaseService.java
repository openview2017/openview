package com.huawei.openview.devops.service.admin;

import com.huawei.openview.devops.domain.admin.*;
import com.j256.ormlite.dao.Dao;
import com.j256.ormlite.dao.DaoManager;
import com.j256.ormlite.jdbc.DataSourceConnectionSource;
import com.j256.ormlite.stmt.*;
import com.j256.ormlite.support.ConnectionSource;
import kikaha.config.Config;
import kikaha.db.DataSourceConfiguration;
import kikaha.urouting.serializers.jackson.Jackson;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.sql.DataSource;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by jianhui on 2/1/2017.
 */

@Slf4j
@Data
@Singleton
public class DatabaseService {

	@Inject
	private DataSource dataSource;
	@Inject
	Config config;
	@Inject
	private Jackson jackson;

	private ConnectionSource connectionSource;
	private Dao<App, Long> appDao;
	private Dao<AppBlueprint, Long> appBlueprintDao;
	private Dao<AppSla, Long> appSlaDao;
	private Dao<AppMetrics, Long> appMetricsDao;
        private Dao<AppMode, Long> appModeDao;
	private Dao<AppStatus, Long> appStatusDao;
	private Dao<DemandProfile, Long> demandProfileDao;
	private Dao<CapacityPlan, Long> capacityPlanDao;
	private Dao<CapacityPlanResult, Long> capacityPlanResultDao;
	private Dao<K8sEndpoint, Long> K8sEndpointDao;
	private Dao<Location, Long> locationDao;
	private Dao<RemediationAction, Long> remediationActionDao;
	private Dao<ServiceConfig, Long> ServiceConfigDao;
	private Dao<User, Long> UserDao;

	@PostConstruct
	public void initDaos() {
		if (connectionSource != null) return;
		try {

//			connectionSource = new JdbcPooledConnectionSource(dbConfig.jdbcUrl(), dbConfig.username(), dbConfig.password());
			DataSourceConfiguration dataSourceConf = DataSourceConfiguration.from("default", config.getConfig("server.datasources.default"));
			connectionSource = new DataSourceConnectionSource(dataSource, dataSourceConf.jdbcUrl());
			appDao = DaoManager.createDao(connectionSource, App.class);
			appBlueprintDao = DaoManager.createDao(connectionSource, AppBlueprint.class);
			appSlaDao = DaoManager.createDao(connectionSource, AppSla.class);
			appMetricsDao = DaoManager.createDao(connectionSource, AppMetrics.class);
                        appModeDao = DaoManager.createDao(connectionSource, AppMode.class);
			appStatusDao = DaoManager.createDao(connectionSource, AppStatus.class);
			demandProfileDao = DaoManager.createDao(connectionSource, DemandProfile.class);
			capacityPlanDao = DaoManager.createDao(connectionSource, CapacityPlan.class);
			capacityPlanResultDao = DaoManager.createDao(connectionSource, CapacityPlanResult.class);
			K8sEndpointDao = DaoManager.createDao(connectionSource, K8sEndpoint.class);
			locationDao = DaoManager.createDao(connectionSource, Location.class);
			remediationActionDao = DaoManager.createDao(connectionSource, RemediationAction.class);
			ServiceConfigDao = DaoManager.createDao(connectionSource, ServiceConfig.class);
			UserDao = DaoManager.createDao(connectionSource, User.class);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public AppBlueprint queryBlueprintForApp(Long appId) throws SQLException {
		List<AppBlueprint> blueprints = getAppBlueprintDao().queryForEq(AppBlueprint.APP_ID, appId);
		return blueprints.isEmpty() ? null : blueprints.get(0);
	}

	public AppSla querySlaForApp(Long appId) throws SQLException {
		List<AppSla> slas = getAppSlaDao().queryForEq(AppBlueprint.APP_ID, appId);
		return slas.isEmpty() ? null : slas.get(0);
	}

	public AppMode queryModeForApp(Long appId) throws SQLException {
			List<AppMode> app_modes = getAppModeDao().queryForEq(AppBlueprint.APP_ID, appId);
			return app_modes.isEmpty() ? null : app_modes.get(0);
	}

	public List<RemediationAction> queryRemediationActionsForApp(Long appId) throws SQLException {
			return getRemediationActionDao().queryForEq(RemediationAction.APP_ID, appId);
	}

	public List<RemediationAction> queryRemediationActions(
		Long app_id, String startTime, String endTime, Boolean isExpired,
		List<Long> action_ids, List<RemediationAction.ActionStatus> statuses_in,
        List<RemediationAction.ActionStatus> statuses_notin
	) throws SQLException {
            Timestamp start_time = RemediationAction.parseTimestamp(startTime);
            Timestamp end_time = RemediationAction.parseTimestamp(endTime);
            log.debug("find action between {} and {}", start_time, end_time);
            QueryBuilder<RemediationAction, Long> query_builder = (
                getRemediationActionDao().queryBuilder().orderBy("finishing_time", false)
            );
            List<RemediationAction> remediationActions = null;
            ArrayList<Where<RemediationAction, Long> > wheres = new ArrayList<>();
            Where<RemediationAction, Long> where = query_builder.where();
            if (app_id != null) {
                log.debug("actions app_id == {}", app_id);
                where = where.eq("app_id", app_id);
                wheres.add(where);
            }
            if (start_time != null || end_time != null) {
                if (start_time != null && end_time != null) {
                    log.debug("actions between {} and {}", start_time, end_time);
                    where = where.between("finishing_time", start_time, end_time);
                    wheres.add(where);
                } else {
                    if (start_time != null) {
                        log.debug("actions greater or equal than {}", start_time);
                        where = where.ge("finishing_time", start_time);
                        wheres.add(where);
                    } else if (end_time != null) {
                        log.debug("actions less than {}", start_time);
                        where = where.lt("finishing_time", end_time);
                        wheres.add(where);
                    } else {
                        log.debug("actions with no conditions");
                    }
                }
            }
            if (isExpired != null) {
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                if (isExpired.booleanValue()) {
                    log.debug("action expiration time is less than {}", timestamp);
                    where = where.lt("expiration_time", timestamp);
                } else {
                    log.debug("action expiration time is greater than {}", timestamp);
                    where = where.gt("expiration_time", timestamp);
                }
                wheres.add(where);
            }
            if (action_ids != null && !action_ids.isEmpty()) {
                log.debug("action id in {}", action_ids);
                where = where.in("id", action_ids);
                wheres.add(where);
            }
            if (statuses_in != null && ! statuses_in.isEmpty()) {
                wheres.add(where.in("status", statuses_in));
            }
            if (statuses_notin != null && ! statuses_notin.isEmpty()) {
                wheres.add(where.notIn("status", statuses_notin));
            }
            if (!wheres.isEmpty()) {
                where = where.and(wheres.size());
            }
	    return query_builder.query();
        }
}
