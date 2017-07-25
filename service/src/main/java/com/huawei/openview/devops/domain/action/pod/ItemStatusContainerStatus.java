package com.huawei.openview.devops.domain.action.pod;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Created by panguobin on 2/28/17.
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemStatusContainerStatus {
    private String name;
    private ItemStatusContainerStatusState state;
    private boolean ready;

}
