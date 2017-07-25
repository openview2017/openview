package com.huawei.openview.devops.domain.dryrun;

/**
 * Created by zhang on 10/18/16.
 */

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
public class DryRunSLA extends DryRunConfiguration{
    @NonNull
    public Integer load_timespan;
    @NonNull
    public Float desired_latency;
    @NonNull
    public Float max_errrate;
    @NonNull
    public Float budget_mon;
}
