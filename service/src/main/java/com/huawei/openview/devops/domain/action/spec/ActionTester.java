package com.huawei.openview.devops.domain.action.spec;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

/**
 * Created by panguobin on 2/17/17.
 */
public class ActionTester {


    public static void main(String[] args) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            SpecTemplateSpecContainer container = objectMapper.readValue(
                str_spec_template_spec_container, SpecTemplateSpecContainer.class
            ); 
            System.out.println(container);
            Spec spec = objectMapper.readValue(str_spec, Spec.class);
            System.out.println(spec);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return;
    }

    private static  String str_spec_template_spec_container =
                            "          {\n" +
                            "            \"name\": \"nginx\",\n" +
                            "            \"image\": \"nginx:1.10\",\n" +
                            "            \"resources\": {\n" +
                            "              \"requests\": {\n" +
                            "                \"cpu\": \"300m\",\n" +
                            "                \"memory\": \"512Mi\"\n" +
                            "              }\n" +
                            "            },\n" +
                            "            \"terminationMessagePath\": \"/dev/termination-log\",\n" +
                            "            \"imagePullPolicy\": \"IfNotPresent\"\n" +
                            "          }";


    private static String str_spec =
                    "{\n" +
                    "    \"replicas\": 7,\n" +
                    "    \"selector\": {\n" +
                    "      \"matchLabels\": {\n" +
                    "        \"app\": \"nginx\"\n" +
                    "      }\n" +
                    "    },\n" +
                    "    \"template\": {\n" +
                    "      \"metadata\": {\n" +
                    "        \"creationTimestamp\": null,\n" +
                    "        \"labels\": {\n" +
                    "          \"app\": \"nginx\"\n" +
                    "        }\n" +
                    "      },\n" +
                    "      \"spec\": {\n" +
                    "        \"containers\": [\n" +
                    "          {\n" +
                    "            \"name\": \"nginx\",\n" +
                    "            \"image\": \"nginx:1.10\",\n" +
                    "            \"resources\": {\n" +
                    "              \"requests\": {\n" +
                    "                \"cpu\": \"300m\",\n" +
                    "                \"memory\": \"512Mi\"\n" +
                    "              }\n" +
                    "            },\n" +
                    "            \"terminationMessagePath\": \"/dev/termination-log\",\n" +
                    "            \"imagePullPolicy\": \"IfNotPresent\"\n" +
                    "          }\n" +
                    "        ],\n" +
                    "        \"restartPolicy\": \"Always\",\n" +
                    "        \"terminationGracePeriodSeconds\": 30,\n" +
                    "        \"dnsPolicy\": \"ClusterFirst\",\n" +
                    "        \"securityContext\": {}\n" +
                    "      }\n" +
                    "    },\n" +
                    "    \"strategy\": {\n" +
                    "      \"type\": \"RollingUpdate\",\n" +
                    "      \"rollingUpdate\": {\n" +
                    "        \"maxUnavailable\": 1,\n" +
                    "        \"maxSurge\": 1\n" +
                    "      }\n" +
                    "    },\n" +
                    "    \"revisionHistoryLimit\": 2\n" +
                    "  }";
}
