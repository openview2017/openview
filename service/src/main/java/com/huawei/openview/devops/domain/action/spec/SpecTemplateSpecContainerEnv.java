package com.huawei.openview.devops.domain.action.spec;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Created by j80049956 on 4/17/2017.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SpecTemplateSpecContainerEnv {
    String name;
    String value;
    Object valueFrom;
}
