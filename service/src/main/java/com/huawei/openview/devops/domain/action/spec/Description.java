package com.huawei.openview.devops.domain.action.spec;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Created by panguobin on 3/1/17.
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class Description {
    private String kind;
    private Spec spec;
    private Status status;
}
