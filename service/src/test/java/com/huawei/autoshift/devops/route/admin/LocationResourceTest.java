package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.Location;
import guru.nidi.ramltester.RamlDefinition;
import guru.nidi.ramltester.RamlLoaders;
import guru.nidi.ramltester.restassured3.RestAssuredClient;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import kikaha.urouting.serializers.jackson.Jackson;

import java.io.File;
import java.util.ArrayList;

/**
 * Created by j80049956 on 2/25/2017.
 */
public class LocationResourceTest {

	public static void main(String args[]) throws Exception {
		LocationResourceTest test = new LocationResourceTest();
		try {
			test.testLocation();
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	// @Test
	public void testLocation() throws Exception {
		RestAssured.baseURI = "http://localhost:9000/openview/api/v1/locations";
		RestAssured.requestSpecification = new RequestSpecBuilder().build().contentType(ContentType.JSON);
		RestAssured.responseSpecification = new ResponseSpecBuilder().build().contentType(ContentType.JSON);

		RamlDefinition appRaml = RamlLoaders.fromFile("api/").load("location.raml");
		// TODO: pass this validation
		//Assert.assertThat(app.validate(), validates());

		Jackson jackson = new Jackson();
		Location location = jackson.objectMapper().readValue(new File("api/examples/location-new.json"), Location.class);

		RestAssuredClient restAssured = appRaml.createRestAssured3();

		restAssured.given().body("").get("/").andReturn().as(ArrayList.class);
		Location newLocation = restAssured.given().body(location).post("/").andReturn().as(Location.class);
		newLocation = restAssured.given().body("").get(String.format("/%d", newLocation.getId())).andReturn().as(Location.class);
		restAssured.given().body(newLocation).put(String.format("/%d", newLocation.getId())).andReturn().as(Location.class);
		restAssured.given().body("").delete(String.format("/%d", newLocation.getId())).andReturn();
	}
}
