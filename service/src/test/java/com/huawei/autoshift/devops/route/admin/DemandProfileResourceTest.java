package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.App;
import com.huawei.openview.devops.domain.admin.DemandProfile;
import guru.nidi.ramltester.RamlDefinition;
import guru.nidi.ramltester.RamlLoaders;
import guru.nidi.ramltester.restassured3.RestAssuredClient;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.mapper.ObjectMapperType;
import kikaha.urouting.serializers.jackson.Jackson;
import org.junit.Assert;

import java.io.File;
import java.util.ArrayList;

/**
 * @author Qing Zhou
 * */
public class DemandProfileResourceTest {

	public static void main(String args[]) throws Exception {
		DemandProfileResourceTest test = new DemandProfileResourceTest();
        try {
			test.testDemandProfile();
		} catch (Exception e) {
            e.printStackTrace();
			throw e;
		}
    }

	// @Test
	public void testDemandProfile() throws Exception {
		RestAssured.baseURI = "http://localhost:9000/openview/api/v1";
		RestAssured.requestSpecification = new RequestSpecBuilder().build().contentType(ContentType.JSON);
		RestAssured.responseSpecification = new ResponseSpecBuilder().build().contentType(ContentType.JSON);

		RamlDefinition appRaml = RamlLoaders.fromFile("api/").load("app.raml");
		// TODO: pass this validation
		//Assert.assertThat(app.validate(), validates());

		Jackson jackson = new Jackson();
		App app = jackson.objectMapper().readValue(new File("api/examples/app-new.json"), App.class);
		DemandProfile demandProfile = jackson.objectMapper().readValue(new File("api/examples/demand-profile-new.json"), DemandProfile.class);
		File demandProfileConfigFile = new File("api/examples/demand-profile-config.yaml");


		RestAssuredClient restAssured = appRaml.createRestAssured3();
		app = restAssured.given().body(app).post("/apps").andReturn().as(App.class);

		Assert.assertEquals(1, restAssured.given().body("").get(String.format("/apps/%d/demand-profiles", app.getId())).andReturn().as(ArrayList.class).size());
		DemandProfile newDemandProfile = restAssured.given().body(demandProfile).post(String.format("/apps/%d/demand-profiles", app.getId())).andReturn().as(DemandProfile.class);
		Assert.assertEquals(2, restAssured.given().body("").get(String.format("/apps/%d/demand-profiles", app.getId())).andReturn().as(ArrayList.class).size());
		restAssured.given().body("").get(String.format("/apps/%d/demand-profiles/%d", app.getId(), newDemandProfile.getId())).andReturn().as(DemandProfile.class);
		String demandProfileConfig = appRaml.createRestAssured3().given().multiPart("file", demandProfileConfigFile).contentType("multipart/form-data")
				.post(String.format("/apps/%d/demand-profiles/%d/config", app.getId(), newDemandProfile.getId())).andReturn().as(String.class);
		restAssured.given().body(demandProfileConfig, ObjectMapperType.JACKSON_2)
				.put(String.format("/apps/%d/demand-profiles/%d/config", app.getId(), newDemandProfile.getId())).andReturn().as(String.class);
		restAssured.given().body("").get(String.format("/apps/%d/demand-profiles/%d/config", app.getId(), newDemandProfile.getId())).andReturn().as(String.class);
		restAssured.given().body("").delete(String.format("/apps/%d/demand-profiles/%d", app.getId(), newDemandProfile.getId())).then().statusCode(200);
		Assert.assertEquals(1, restAssured.given().body("").get(String.format("/apps/%d/demand-profiles", app.getId())).andReturn().as(ArrayList.class).size());

		restAssured.given().body("").delete(String.format("/apps/%d", app.getId())).then().statusCode(200);
		System.out.print(restAssured.getLastReport().toString());
		Assert.assertTrue(restAssured.getLastReport().isEmpty());
	}
}
