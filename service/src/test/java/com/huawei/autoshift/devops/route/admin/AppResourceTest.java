package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.AppBlueprint;
import com.huawei.openview.devops.domain.admin.AppSla;
import com.huawei.openview.devops.domain.admin.AppStatus;
import guru.nidi.ramltester.RamlDefinition;
import guru.nidi.ramltester.RamlLoaders;
import guru.nidi.ramltester.restassured3.RestAssuredClient;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.mapper.ObjectMapperType;
import kikaha.urouting.serializers.jackson.Jackson;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.junit.Assert;

import java.io.File;
import java.util.ArrayList;

/**
 * @author Qing Zhou
 */
public class AppResourceTest {

	// launchAppById
	// @Test
	public void testLaunchAppById() throws Exception {
		String func = "launchAppById";
		String url = "http://localhost:9000/openview/v1/apps/launch/1";
		System.out.println(displayTestName(func, url));

		OkHttpClient client = new OkHttpClient();
		Request request = new Request.Builder()
				.url(url)
				.build();
		Response response = client.newCall(request).execute();
		System.out.println("headers = " + response.headers().toString());

		String responseStr = response.body().string();
		System.out.println("body = " + responseStr);
	}

	// getAppStatus
	// @Test
	public void testGetAppStatus() throws Exception {
		String func = "getAppStatus";
		String url = "http://localhost:9000/openview/v1/apps/count/1";
		System.out.println(displayTestName(func, url));

		OkHttpClient client = new OkHttpClient();
		Request request = new Request.Builder()
				.url(url)
				.build();
		Response response = client.newCall(request).execute();
		System.out.println("headers = " + response.headers().toString());

		String responseStr = response.body().string();
		System.out.println("body = " + responseStr);
	}

	public static void main(String args[]) throws Exception {
		AppResourceTest test = new AppResourceTest();
		try {
//            test.testCreateApp(); // passed
//            test.testDeleteAppById(); // Not pass, timeout
			test.testApp();
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private String displayTestName(String func, String url) {
		return ("\n *** " + func + " - " + url + " ***");
	}

	// @Test
	public void testApp() throws Exception {
		RestAssured.baseURI = "http://localhost:9000/openview/api/v1";
		RestAssured.requestSpecification = new RequestSpecBuilder().build().contentType(ContentType.JSON);
		RestAssured.responseSpecification = new ResponseSpecBuilder().build().contentType(ContentType.JSON);

		RamlDefinition appRaml = RamlLoaders.fromFile("api/").load("app.raml");
		// TODO: pass this validation
		//Assert.assertThat(app.validate(), validates());

		Jackson jackson = new Jackson();
		App app = jackson.objectMapper().readValue(new File("api/examples/app-new.json"), App.class);
		AppSla sla = jackson.objectMapper().readValue(new File("api/examples/appsla.json"), AppSla.class);
		AppBlueprint blueprint = jackson.objectMapper().readValue(new File("api/examples/blueprint.json"), AppBlueprint.class);
		String blueprintEntrypoint = jackson.objectMapper().readValue(new File("api/examples/blueprint-entrypoint.json"), String.class);
		AppStatus status = jackson.objectMapper().readValue(new File("api/examples/appstatus.json"), AppStatus.class);
		File blueprintFile = new File("api/examples/blueprint.yaml");

		RestAssuredClient restAssured = appRaml.createRestAssured3();

		restAssured.given().body("").get("/apps").andReturn().as(ArrayList.class);
		App newApp = restAssured.given().body(app).post("/apps").andReturn().as(App.class);
		restAssured.given().body("").get("/apps").andReturn().as(ArrayList.class);
		restAssured.given().body("").get(String.format("/apps/%d", newApp.getId())).andReturn().as(App.class);
		restAssured.given().body("").get(String.format("/apps/%d", 4040404)).then().statusCode(404);
		restAssured.given().body(app).put(String.format("/apps/%d", newApp.getId())).andReturn().as(App.class);
		restAssured.given().body(app).put(String.format("/apps/%d", 4040404)).then().statusCode(404);

		restAssured.given().body(sla).put(String.format("/apps/%d/sla", newApp.getId())).andReturn().as(AppSla.class);
		restAssured.given().body("").get(String.format("/apps/%d/sla", newApp.getId())).andReturn().as(AppSla.class);
		restAssured.given().body(sla).put(String.format("/apps/%d/sla", 4040404)).then().statusCode(404);
		restAssured.given().body("").get(String.format("/apps/%d/sla", 4040404)).then().statusCode(404);

		restAssured.given().body(blueprint).put(String.format("/apps/%d/blueprint", newApp.getId())).andReturn().as(AppBlueprint.class);
		restAssured.given().body("").get(String.format("/apps/%d/blueprint", newApp.getId())).andReturn().as(AppBlueprint.class);
		String blueprintYaml = appRaml.createRestAssured3().given().multiPart("file", blueprintFile).contentType("multipart/form-data")
				.post(String.format("/apps/%d/blueprint/original_content", newApp.getId())).andReturn().as(String.class);
		restAssured.given().body(blueprintEntrypoint, ObjectMapperType.JACKSON_2)
				.put(String.format("/apps/%d/blueprint/entry_point", newApp.getId())).andReturn().as(String.class);
		restAssured.given().body("").get(String.format("/apps/%d/blueprint/entry_point", newApp.getId())).andReturn().as(String.class);

		restAssured.given().body(blueprintYaml, ObjectMapperType.JACKSON_2)
				.put(String.format("/apps/%d/blueprint/original_content", newApp.getId())).andReturn().as(String.class);
		AppBlueprint newBlueprint = restAssured.given().body(blueprint)
				.put(String.format("/apps/%d/blueprint", newApp.getId())).andReturn().as(AppBlueprint.class);
		restAssured.given().body(newBlueprint.getEdited_content(), ObjectMapperType.JACKSON_2)
				.put(String.format("/apps/%d/blueprint/edited_content", newApp.getId())).andReturn().as(String.class);

		restAssured.given().body("").get(String.format("/apps/%d/status", newApp.getId())).andReturn().as(AppStatus.class);
		restAssured.given().body(status).put(String.format("/apps/%d/status", newApp.getId())).andReturn().as(AppStatus.class);
		restAssured.given().body("").get(String.format("/apps/%d/status", 4040404)).then().statusCode(404);

		appRaml.createRestAssured3().given().body("")
				.get(String.format("/apps/%d?detail=true", newApp.getId())).andReturn().as(App.class);
		restAssured.given().body("").delete(String.format("/apps/%d", newApp.getId())).andReturn();
		restAssured.given().body("").delete(String.format("/apps/%d", 4040404)).then().statusCode(404);
		System.out.print(restAssured.getLastReport().toString());
		Assert.assertTrue(restAssured.getLastReport().isEmpty());
	}
}