package com.huawei.openview.devops.domain.action.pod;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Created by panguobin on 2/26/17.
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class Item {
    private ItemMetadata metadata;
    private ItemSpec spec;
    private ItemStatus status;
}
