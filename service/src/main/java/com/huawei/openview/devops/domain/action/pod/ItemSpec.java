package com.huawei.openview.devops.domain.action.pod;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Created by panguobin on 2/26/17.
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemSpec {
    private List<ItemSpecContainer> containers;
}
