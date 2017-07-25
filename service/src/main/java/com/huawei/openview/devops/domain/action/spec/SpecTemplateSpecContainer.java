package com.huawei.openview.devops.domain.action.spec;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Created by panguobin on 2/17/17.
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class SpecTemplateSpecContainer {
    String name;
    String image;
    SpecTemplateSpecContainerResources resources;
    List<SpecTemplateSpecContainerEnv> env;
}
