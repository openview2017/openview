package com.huawei.openview.devops.util;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Created by panguobin on 3/2/17.
 */
@Getter
@Setter
@ToString
public class UpdatedStatus {
    private boolean compete;
    private boolean success;
    private String message;
}