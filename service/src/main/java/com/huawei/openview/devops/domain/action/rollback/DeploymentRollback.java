package com.huawei.openview.devops.domain.action.rollback;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Created by panguobin on 3/9/17.
 */
@Getter
@Setter
@ToString
public class DeploymentRollback {
    private String apiVersion;
    private String kind;
    private String name;
    private RollbackConfig rollbackTo;
}