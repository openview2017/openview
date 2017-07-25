package com.huawei.openview.devops.domain.action.spec;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Created by panguobin on 2/22/17.
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class SpecTemplateSpecContainerResourcesLimits {
    private String cpu;
    private String memory;
}
