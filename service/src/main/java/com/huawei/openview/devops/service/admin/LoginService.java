package com.huawei.openview.devops.service.admin;

import com.huawei.openview.devops.domain.admin.Authorization;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.sql.DataSource;
import java.io.IOException;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Sid Askary
 *
 */

@Slf4j
@Singleton
public class LoginService {

	private static String DB_NAME = "h2";
	private static String DB_CREATE_USER = "";
	private static String DB_CREATE_AUTHORIZATION = "";
	private static Map<String, String> tableMap = new HashMap<>();
	private static boolean IS_CREATED = false;
	
	@Inject
	private DataSource db;

	static {
		if (DB_NAME.equals("h2") || DB_NAME.equals("default")) {
			DB_CREATE_USER = "CREATE TABLE IF NOT EXISTS user ("
					+ "id  BIGINT IDENTITY, "
					+ "user_name VARCHAR(80)  NOT NULL, "
					+ "encrypted_password VARCHAR(256) NOT NULL, "
					+ "first_name VARCHAR(80), "
					+ "last_name VARCHAR(80), "
					+ "updated_by VARCHAR(80), "
					+ "first_created TIMESTAMP AS CURRENT_TIMESTAMP NOT NULL, "
					+ "last_update TIMESTAMP AS CURRENT_TIMESTAMP NOT NULL, "
					+ ")";
			
			DB_CREATE_AUTHORIZATION = "CREATE TABLE IF NOT EXISTS autorization ( id INTEGER not null auto_increment, user_name VARCHAR(80), hashed_token VARCHAR(512),  expiry_epoch LONG)";
		} 
		tableMap.put("user", DB_CREATE_USER);
		tableMap.put("authorization", DB_CREATE_AUTHORIZATION);
	}

	public boolean createTable(String tableName) throws SQLException {
		log.debug("createTable - tableName: " + tableName);
		if(IS_CREATED) {
			return true;
		}
		String name = tableMap.get(tableName);

		try (Connection con = db.getConnection()) {
			Statement stmt = con.createStatement();
			stmt.executeUpdate(name);
			log.debug("createTable -  CREATED TABLE :" + name);
		}
		IS_CREATED = true;
		return true;
	}



	public boolean createAuthorizationTBL() throws SQLException {
		log.debug("defaultDatasource name= " + db.toString());
		try (Connection con = db.getConnection()) {
			Statement stmt = con.createStatement();
			int rs = stmt.executeUpdate(DB_CREATE_AUTHORIZATION);
			log.debug("\t CREATED TABLE authorization rs= " + rs + "\n\n");
			con.close();
		}
		return true;
	}

	public void insertAuthorization(Authorization auth) throws SQLException, IOException {
		if (createTable("authorization")) {
			try (Connection con = db.getConnection()) {
				String sql = "INSERT INTO authorization VALUES(?, ?, ?, ?)";
				PreparedStatement stmt = con.prepareStatement(sql);
				stmt.setString(1, auth.getUser_name());
				stmt.setString(2, auth.getHashed_token());
				stmt.setLong(3, auth.getExpiry_epoch());
				int rs = stmt.executeUpdate();
				con.close();

				log.debug("\t INSERT INTO auth rs= " + rs + "\n\n");
				if (rs < 1) {
					log.error("Could not INSERT INTO auth.");
					throw new SQLException("Could not INSERT INTO auth.");
				}
			}
		}
	}

	public Authorization findAuthorizationByuserName(String userName) throws SQLException, IOException {

		Authorization auth = new Authorization();
		if (createTable("authorization")) {
			try (Connection con = db.getConnection()) {
				Statement stmt = con.createStatement();
				ResultSet rs = stmt.executeQuery("SELECT * FROM  auth WHERE username=" + userName + ")");
				log.debug("SELECT * FROM  auth WHERE username=" + userName);
				con.close();

				if (!rs.next()) {
					log.error("Authorization is null.");
					return auth;
				}

				auth.setId(rs.getLong("id"));
				auth.setUser_name(rs.getString("username"));
				auth.setHashed_token(rs.getString("hashed_token"));
				auth.setExpiry_epoch(rs.getLong("expiry_epoch"));
			}
		}
		return auth;
	}
}
