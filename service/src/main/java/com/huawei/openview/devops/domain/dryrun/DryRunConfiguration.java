package com.huawei.openview.devops.domain.dryrun;

import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * 
 * @author Sid Askary, Bowen Zhang
 *
 */

@Getter
@Setter
@ToString
public class DryRunConfiguration {
	public Long k8s_endpoint_id;
	public List<SetConfig> SetConfigs;
}
