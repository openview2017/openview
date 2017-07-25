package com.huawei.openview.devops.util;

import com.huawei.openview.devops.util.YamlJsonData;
import com.huawei.openview.devops.util.YamlUtil;

/**
 * @author Qing Zhou
 */
public class YamlTest {

    public static void main(String args[]) {

        test1(singleYamlStr);

        test1(multipleYamlStr);
    }

    public static  void test1(String yamlStr) {

        YamlJsonData data = YamlUtil.convertYamlToJson(yamlStr);

        System.out.println("\n\ndata = " + data);
        System.out.println("\nErrorMessage = " + data.getErrorMsg());
    }

    static String singleYamlStr = "apiVersion: v1\n" +
            "kind: Service\n" +
            "metadata:\n" +
            "  name: db \n" +
            "  labels:\n" +
            "    unit: pxc-cluster\n" +
            "spec:\n" +
            "  ports:\n" +
            "    - port: 3306\n" +
            "      name: mysql\n" +
            "  selector:\n" +
            "    unit: pxc-cluster";

    static String multipleYamlStr = "apiVersion: v1\n" +
            "kind: Secret\n" +
            "metadata:\n" +
            "  name: dockerhub.registry\n" +
            "data:\n" +
            "  .dockerconfigjson: eyAiYXV0aHMiOiB7ICJodHRwczovL2luZGV4LmRvY2tlci5pby92MS8iOiB7ICJhdXRoIjogIlltbHNiSGw2YUdGdVp6SXdNVEE2U0ZkNmFEZ3lPREl4UUE9PSIgfSB9IH0K\n" +
            "type: kubernetes.io/dockerconfigjson\n" +
            "---\n" +
            "# A headless service to create DNS records\n" +
            "apiVersion: v1\n" +
            "kind: Service\n" +
            "metadata:\n" +
            "  annotations:\n" +
            "    service.alpha.kubernetes.io/tolerate-unready-endpoints: \"true\"\n" +
            "  name: db\n" +
            "  namespace: \"acmeair\"\n" +
            "  labels:\n" +
            "    app: mysql\n" +
            "spec:\n" +
            "  ports:\n" +
            "  - port: 3306\n" +
            "    name: mysql\n" +
            "  # *.galear.default.svc.cluster.local\n" +
            "  clusterIP: None\n" +
            "  selector:\n" +
            "    app: mysql";
}
