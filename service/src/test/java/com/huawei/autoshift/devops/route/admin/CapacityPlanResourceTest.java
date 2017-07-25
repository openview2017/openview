package com.huawei.openview.devops.route.admin;

import com.huawei.openview.devops.domain.admin.*;
import guru.nidi.ramltester.RamlDefinition;
import guru.nidi.ramltester.RamlLoaders;
import guru.nidi.ramltester.restassured3.RestAssuredClient;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import kikaha.urouting.serializers.jackson.Jackson;
import org.junit.Assert;

import java.io.File;

/**
 * Created by j80049956 on 3/3/2017.
 */
public class CapacityPlanResourceTest {
	public static void main(String args[]) throws Exception {
		CapacityPlanResourceTest test = new CapacityPlanResourceTest();
		try {
			test.testCapacityPlan();
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	// @Test
	public void testCapacityPlan() throws Exception {
		RestAssured.baseURI = "http://localhost:9000/openview/api/v1";
		RestAssured.requestSpecification = new RequestSpecBuilder().build().contentType(ContentType.JSON);
		RestAssured.responseSpecification = new ResponseSpecBuilder().build().contentType(ContentType.JSON);

		RamlDefinition appRaml = RamlLoaders.fromFile("api/").load("app.raml");
		// TODO: pass this validation
		//Assert.assertThat(app.validate(), validates());

		Jackson jackson = new Jackson();
		App app = jackson.objectMapper().readValue(new File("api/examples/app-new.json"), App.class);
		File blueprintFile = new File("api/examples/blueprint.yaml");
		CapacityPlan plan = jackson.objectMapper().readValue(new File("api/examples/capacity-plan-new.json"), CapacityPlan.class);
		CapacityPlanResultsWithStatus planResults = jackson.objectMapper()
				.readValue(new File("api/examples/capacity-plan-results.json"), CapacityPlanResultsWithStatus.class);

		RestAssuredClient restAssured = appRaml.createRestAssured3();
		app = restAssured.given().body(app).post("/apps").andReturn().as(App.class);
		appRaml.createRestAssured3().given().multiPart("file", blueprintFile).contentType("multipart/form-data")
				.post(String.format("/apps/%d/blueprint/original_content", app.getId())).andReturn().as(String.class);
		DemandProfile[] demandProfile = restAssured.given().body("")
				.get(String.format("/apps/%d/demand-profiles", app.getId())).andReturn().as(DemandProfile[].class);
		plan.setDemand_profile_id(demandProfile[0].getId());
		plan = restAssured.given().body(plan)
				.post(String.format("/apps/%d/demand-profiles/%d/capacity-plans", app.getId(), demandProfile[0].getId())).andReturn().as(CapacityPlan.class);
		restAssured.given().body(planResults)
				.post(String.format("/apps/%d/demand-profiles/%d/capacity-plans/%d/results", app.getId(), demandProfile[0].getId(), plan.getId())).andReturn();
		CapacityPlanResultsWithStatus optmizedResults = restAssured.given().body("")
				.get(String.format("/apps/%d/demand-profiles/%d/capacity-plans/%d/results", app.getId(), demandProfile[0].getId(), plan.getId()))
				.andReturn().as(CapacityPlanResultsWithStatus.class);
		Assert.assertEquals(CapacityPlan.PlanStatus.COMPLETED, optmizedResults.getStatus());
		Assert.assertEquals(CapacityPlanResult.SlaResultStatus.SLA_OPTIMIZED, optmizedResults.getResults().get(0).getSla_status());
		CapacityPlan[] plans = restAssured.given().body("")
				.get(String.format("/apps/%d/demand-profiles/%d/capacity-plans", app.getId(), demandProfile[0].getId())).andReturn().as(CapacityPlan[].class);
		Assert.assertEquals(3, plans.length);

		restAssured.given().body("").delete(String.format("/apps/%d", app.getId())).then().statusCode(200);
		System.out.print(restAssured.getLastReport().toString());
		Assert.assertTrue(restAssured.getLastReport().isEmpty());
	}
}
