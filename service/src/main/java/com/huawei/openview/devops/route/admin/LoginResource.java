// /**
//  * 
//  */
// package com.huawei.openview.devops.route.admin;

// import java.io.IOException;
// import java.sql.SQLException;
// import java.util.UUID;

// import javax.inject.Inject;
// import javax.inject.Singleton;

// import com.huawei.openview.devops.domain.admin.Authorization;
// import com.huawei.openview.devops.domain.admin.CreateTable;
// import com.huawei.openview.devops.domain.admin.User;
// import com.huawei.openview.devops.service.admin.LoginService;
// import com.huawei.openview.devops.service.admin.UserService;
// import com.huawei.openview.devops.util.EncryptUtil;

// import kikaha.urouting.api.Consumes;
// import kikaha.urouting.api.DefaultResponse;
// import kikaha.urouting.api.FormParam;
// import kikaha.urouting.api.POST;
// import kikaha.urouting.api.Path;
// import kikaha.urouting.api.Produces;
// import kikaha.urouting.api.Response;
// import lombok.extern.slf4j.Slf4j;

// /**
//  * @author Sid Askary
//  *
//  */

// @Slf4j
// @Singleton
// @Path("openview/v1/login")
// public class LoginResource {

// 	private static long ONE_WEEK_MILLIS = 60 * 1000 * 60 * 24 * 7;
// 	private static long ONE_YEAR__MILLIS = ONE_WEEK_MILLIS * 52;

// 	@Inject
// 	private LoginService loginService;

// 	@Inject
// 	private UserService userService;
	
// 	@POST
// 	@Path("authenticate")
// 	@Consumes("application/x-www-form-urlencoded")
// 	@Produces("application/json")
// 	public Response authenticateUser(@FormParam("username") String userName, @FormParam("password") String password) {

// 		try {
// 			// Authenticate the user using the credentials provided
// 			if (authenticated(userName, password)) {

// 				// Issue a token for the user
// 				String token = issueToken(userName);

// 				// Return the token on the response
// 				return DefaultResponse.ok(token).header("Access-Control-Allow-Origin", "*");

// 			} else {
// 				return DefaultResponse.forbiden().header("Access-Control-Allow-Origin", "*");
// 			}
// 		} catch (Exception e) {
// 			log.error(e.getMessage());
// 			return DefaultResponse.unauthorized().header("Access-Control-Allow-Origin", "*");
// 		}
// 	}

// 	@POST
// 	@Path("authenticate/user")
// 	@Consumes("application/json")
// 	@Produces("application/json")
// 	public Response authenticateUser(User user) {
// 		log.debug("user: " + user);
// 		try {
// 			// Authenticate the user using the credentials provided
// 			if (authenticated(user.getEmail(), user.getPassword())) {

// 				// Issue a token for the user
// 				String token = issueToken(user.getEmail());

// 				// Return the token on the response
// 				return DefaultResponse.ok(token).header("Access-Control-Allow-Origin", "*");
// 			} else {
// 				return DefaultResponse.forbiden().header("Access-Control-Allow-Origin", "*");
// 			}
// 		} catch (Exception e) {
// 			log.error(e.getMessage());
// 			return DefaultResponse.unauthorized().header("Access-Control-Allow-Origin", "*");
// 		}
// 	}

// 	@POST
// 	@Path("createtable")
// 	@Consumes("application/json")
// 	@Produces("application/json")
// 	public Response createTable(CreateTable createTable) throws SQLException, IOException {
		
// 		String table_name = createTable.getTable_name();
// 		log.debug("createTable table : " + table_name);
// 		boolean created = false;
// 		if (null != table_name) {
// 			try {
// 				if(null != loginService) {
// 					created = loginService.createTable(table_name);
// 					log.debug("createTable - tableName:" + table_name);
// 				} else {
// 					log.debug("createTable - loginService is NULL");
// 				}
// 			} catch (Exception e) {
// 				log.debug("Oops! " + e.getMessage());
// 			}

// 			if (created) {
// 				return DefaultResponse.ok("created table: " + table_name + "\n").header("Access-Control-Allow-Origin", "*");

// 			} else {
// 				return DefaultResponse.serverError("Could not create table: " + table_name + "\n")
// 						.header("Access-Control-Allow-Origin", "*");
// 			}
// 		}
// 		return DefaultResponse.serverError("Could not create table: " + table_name + "\n").header("Access-Control-Allow-Origin",
// 				"*");
// 	}

// 	private boolean authenticated(String userName, String password) throws Exception {
// 		User user = userService.findUserByEmail(userName);
// 		log.debug("loginService authenticated user: " + user);

// 		return EncryptUtil.checkPassword(password, user.getPassword());
// 	}

// 	private String issueToken(String userName) throws SQLException, IOException {
// 		// Issue a token (can be a random String persisted to a database or a
// 		// JWT token)
// 		// The issued token must be associated to a user
// 		String randStr = UUID.randomUUID().toString().toUpperCase();
// 		long expiry = System.currentTimeMillis() + ONE_YEAR__MILLIS;

// 		Authorization auth = new Authorization();
// 		auth.setExpiry_epoch(expiry);
// 		auth.setHashed_token(randStr);
// 		auth.setUser_name(userName);
// 		loginService.insertAuthorization(auth);

// 		String key = randStr + "|" + userName + "|" + expiry;

// 		return EncryptUtil.jasypt.encrypt(key);
// 	}

// }
