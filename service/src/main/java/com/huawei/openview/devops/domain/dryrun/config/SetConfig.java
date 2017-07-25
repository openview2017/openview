package com.huawei.openview.devops.domain.dryrun.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * @author Qing Zhou
 */
@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SetConfig {
    private Long id;
    private String kind;
    private String name;
    private Long replicas;
    private List<Long> replicas_candidates;
    private PodConfig podConfig;
}

