package com.huawei.openview.devops.domain.dryrun;

import com.huawei.openview.devops.domain.admin.AppSla;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import lombok.Data;

import java.util.List;

/**
 * Created by zhang on 3/23/17.
 */

@Data
public class ApplicationTopology {
    Long app_id;
    Long demand_profile_id;
    Long capacity_plan_id;
    Long load_duration;
    Boolean is_auto;
    List<Long> k8s_endpoint_id_candidates;
    AppSla app_sla;
    List<SetConfig> setconfigs;
}
