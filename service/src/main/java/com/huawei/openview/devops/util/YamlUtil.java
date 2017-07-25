package com.huawei.openview.devops.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.yaml.snakeyaml.Yaml;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Qing Zhou
 */
@Slf4j
public class YamlUtil {
    public final static ObjectMapper objectMapper = new ObjectMapper();

    public static YamlJsonData convertYamlToJson(String yamlString) {
        YamlJsonData data = new YamlJsonData();
        data.setSuccess(false);
        data.setYaml(yamlString);

        Yaml yaml = new Yaml();
        try {
            Iterable<Object> iterable = yaml.loadAll(yamlString); // support multiple yaml data
            List<Object> myList = new ArrayList<>();
            for (Object obj : iterable) {
                Map<String, Object> map = (Map<String, Object>) obj;
                myList.add(map);
            }
            String jsonStr = objectMapper.writeValueAsString(myList);
            log.debug("converted to json = " + jsonStr);
            data.setSuccess(true);
            data.setJson(jsonStr);
            data.setErrorLine(-1); // -1 means no error line found
        } catch (Exception e) {
            log.debug("convertYamlToJson : e = \n" + e);
            data.setSuccess(false);
            data.setErrorMsg(e.getMessage());
            int line = extractErrorLineNumber(data.getErrorMsg());
            log.debug("convertYamlToJson : errorLine = " + line);
            data.setErrorLine(line);
        }
        return data;
    }

    // Sample error message : mapping values are not allowed here\n in \u0027string\u0027, line 3, column 20:\n
    private static int extractErrorLineNumber(String errorMsg) {
        int line = -1;
        Pattern p = Pattern.compile("(line )(\\d+)");
        Matcher m = p.matcher(errorMsg);
        if (m.find()) {
            line = Integer.valueOf( m.group(2));
        }
       return line;
    }
}
