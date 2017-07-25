package com.huawei.openview.devops.route;

import okhttp3.*;

/**
 * @author Qing Zhou
 */
public class KubernetesResourceTest {

    // updateKubernetes
/*
{
 "SetConfigs": [
  {
   "id": 0,
   "kind": "StatefulSet",
   "name": "mysql"
  }
 ],
 "action_change_amount": "-1",
 "action_name": "scale",
 "action_type": "automatic",
 "app_id": 1,
 "finished_time": "1485912745"
}

*/
    // @Test
    public void testUpdateKubernette() throws Exception { // Guobin
        String func = "updateKubernetes";
        String url = "http://localhost:9000/openview/api/v1/apps/1/actions";
        System.out.println(displayTestName(func,url));

        String jsonTxt =
                        "{\n" +
                        " \"SetConfigs\": [\n" +
                        "  {\n" +
                        "   \"id\": 0,\n" +
                        "   \"kind\": \"StatefulSet\",\n" +
                        "   \"name\": \"mysql\"\n" +
                        "  }\n" +
                        " ],\n" +
                        " \"action_change_amount\": \"-1\",\n" +
                        " \"action_name\": \"scale\",\n" +
                        " \"action_type\": \"automatic\",\n" +
                        " \"app_id\": 1,\n" +
                        " \"finished_time\": \"1485912745\"\n" +
                        "}\n";

        OkHttpClient client = new OkHttpClient();
        RequestBody requestBody = RequestBody.create(MediaType.parse("application/json"), jsonTxt);
        Request request = new Request.Builder()
                .url(url)
                .method("PATCH", requestBody)
                .build();
        Response response = client.newCall(request).execute();
        System.out.println("headers = " + response.headers().toString());

        String responseStr = response.body().string();
        System.out.println("body = " + responseStr);
    }

    public static void main(String args[]) {
        KubernetesResourceTest test = new KubernetesResourceTest();
        try {
            test.testUpdateKubernette(); // passed
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String displayTestName(String func, String url) {
        return ("\n *** " + func + " - " + url + " ***");
    }
}
