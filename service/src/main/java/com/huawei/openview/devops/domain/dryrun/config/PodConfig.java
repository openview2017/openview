package com.huawei.openview.devops.domain.dryrun.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Map;
import java.util.List;

/**
 * Created by panguobin on 2/22/17.
 */
@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PodConfig {
        private Map<String, Resources> containersConfig;
	private Long node_location_id;
        private List<Long> node_location_id_candidates; // uncomment by huazhang 3/20/17
}
