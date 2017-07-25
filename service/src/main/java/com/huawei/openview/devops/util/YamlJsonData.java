package com.huawei.openview.devops.util;

import lombok.Data;

/**
 * @author Qing Zhou
 */
@Data
public class YamlJsonData {
    boolean success;
    String yaml;
    String json;
    String errorMsg;
    Integer errorLine;
}