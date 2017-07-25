package com.huawei.openview.devops.route.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.huawei.openview.devops.domain.admin.RemediationAction;
import okhttp3.*;
import org.junit.Assert;

import java.lang.reflect.Type;
import java.util.List;

/**
 * @author Qing Zhou
 * */
public class RemediationActionResourceTest {

    // findAllRemediationActions
    // @Test
    public void testFindAllRemediationActions() throws Exception {
        String func = "findAllRemediationActions";
        String url = "http://localhost:9000/openview/v1/remediationactions";
        System.out.println(displayTestName(func,url));

        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .build();
        Response response = client.newCall(request).execute();
        System.out.println("headers = " + response.headers().toString());

        String responseStr = response.body().string();
        System.out.println("body = " + responseStr);

        ObjectMapper objectMapper = new ObjectMapper();
        RemediationAction[] fromJson = objectMapper.readValue(responseStr, RemediationAction[].class);
        for (RemediationAction item : fromJson) {
            System.out.println("item : " + item);
        }
        Assert.assertEquals(1, fromJson.length);
    }

    // findRemediationActionById
    // @Test
    public void testFindRemediationActionById() throws Exception {
        String func = "findRemediationActionById";
        String url = "http://localhost:9000/openview/v1/remediationactions/1";
        System.out.println(displayTestName(func,url));

        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .build();
        Response response = client.newCall(request).execute();
        System.out.println("headers = " + response.headers().toString());

        String responseStr = response.body().string();
        System.out.println("body = " + responseStr);

        ObjectMapper objectMapper = new ObjectMapper();
        RemediationAction fromJson = objectMapper.readValue(responseStr, RemediationAction.class);
        System.out.println("fromJson : " + fromJson);

        Assert.assertEquals((long)1, (long)fromJson.getId());
    }

    // findRemediationActionByAppId
    // @Test
    public void testFindRemediationActionByAppId() throws Exception {
        String func = "findRemediationActionByAppId";
        String url = "http://localhost:9000/openview/v1/remediationactions/appid/1";
        System.out.println(displayTestName(func,url));

        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .build();
        Response response = client.newCall(request).execute();
        System.out.println("headers = " + response.headers().toString());

        String responseStr = response.body().string();
        System.out.println("body = " + responseStr);

        ObjectMapper objectMapper = new ObjectMapper();
        RemediationAction fromJson = objectMapper.readValue(responseStr, RemediationAction.class);
        System.out.println("fromJson : " + fromJson);

        Assert.assertEquals((long)1, (long)fromJson.getApp_id());
    }

    // updateRemediationActionById
    /*
  {
    "app_id": 2,
    "action_json": "recommendation action json - NEW",
    "type": 2
  }
    */
    // @Test
    public void testUpdateRemediationActionById() throws Exception {
        String func = "updateRemediationActionById";
        String url = "http://localhost:9000/openview/v1/remediationactions/1";
        System.out.println(displayTestName(func,url));

        String jsonTxt =
                "  {\n" +
                        "    \"app_id\": 2,\n" +
                        "    \"action_json\": \"recommendation action json - NEW\",\n" +
                        "    \"type\": 2\n" +
                        "  }";

        OkHttpClient client = new OkHttpClient();
        RequestBody requestBody = RequestBody.create(MediaType.parse("application/json"), jsonTxt);
        Request request = new Request.Builder()
                .url(url)
                .method("PUT", requestBody)
                .build();
        Response response = client.newCall(request).execute();
        System.out.println("headers = " + response.headers().toString());

        String responseStr = response.body().string();
        System.out.println("body = " + responseStr);

        Assert.assertTrue(response.isSuccessful());
    }


    // createRemediationAction
/*
  {
    "app_id": 2,
    "action_json": "recommendation action json",
    "type": 2
  }
*/
    // @Test
    public void testCreateRemediationAction() throws Exception {
        String func = "createRemediationAction";
        String url = "http://localhost:9000/openview/v1/remediationactions";
        System.out.println(displayTestName(func,url));

        String jsonTxt =
                "  {\n" +
                        "    \"app_id\": 1,\n" +
                        "    \"action_json\": \"recommendation action json\",\n" +
                        "    \"type\": 2\n" +
                        "  }";
        OkHttpClient client = new OkHttpClient();
        RequestBody requestBody = RequestBody.create(MediaType.parse("application/json"), jsonTxt);
        Request request = new Request.Builder()
                .url(url)
                .method("POST", requestBody)
                .build();

        Response response = client.newCall(request).execute();
        System.out.println("headers = " + response.headers().toString());

        String responseStr = response.body().string();
        System.out.println("body = " + responseStr);
    }

    // deleteRemediationActionById
    // @Test
    public void testDeleteRemediationActionById() throws Exception {

//        testCreateRemediationAction(); // create a appSuggest to be deleted !!!

        String func = "deleteRemediationActionById";
        String url = "http://localhost:9000/openview/v1/remediationactions/1"; // !!! {id} need to be the correct number
        System.out.println(displayTestName(func,url));
        OkHttpClient client = new OkHttpClient();
        String jsonTxt = "";
        RequestBody requestBody = RequestBody.create(MediaType.parse("application/json"), jsonTxt);
        Request request = new Request.Builder()
                .url(url)
                .method("DELETE", requestBody)
                .build();
        Response response = client.newCall(request).execute();
        System.out.println("headers = " + response.headers().toString());

//        String responseStr = response.body().string();
//        System.out.println("body = " + responseStr);

    }

    public static void main(String args[]) {
        RemediationActionResourceTest test = new RemediationActionResourceTest();
        try {
            test.testCreateRemediationAction(); // passed
            test.testFindAllRemediationActions(); // passed
            test.testFindRemediationActionById(); // passed
            test.testFindRemediationActionByAppId(); // passed
            test.testUpdateRemediationActionById(); // passed
            test.testDeleteRemediationActionById(); // passed
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String displayTestName(String func, String url) {
        return ("\n *** " + func + " - " + url + " ***");
    }
}
