package com.huawei.openview.devops.domain.dryrun.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Created by zhang on 2/23/17.
 */
@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Resources {
    private Long cpu_quota;
    private List<Long> cpu_quota_candidates;
    private Long mem_limit;
    private List<Long> mem_limit_candidates;
    // We may or may not need cpu_request and mem_request because request cpu or mem should be handled by orchestrator not us.
    private Long cpu_request;
    private Long mem_request;
}
