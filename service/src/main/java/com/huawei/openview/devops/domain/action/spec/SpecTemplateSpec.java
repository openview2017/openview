package com.huawei.openview.devops.domain.action.spec;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Created by panguobin on 2/17/17.
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class SpecTemplateSpec {
    private ArrayList<SpecTemplateSpecContainer> containers;
}
