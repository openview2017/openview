package com.huawei.openview.devops.domain.action;
import com.huawei.openview.devops.domain.admin.RemediationAction;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.HashMap;
import java.util.List;

/**
 *
 * @author Bowen Zhang
 *
 */

@Getter
@Setter
@ToString
public class Actions {
    private HashMap<RemediationAction.ActionType, Long> actions_summary;
    private List<RemediationAction> actions_detail;
}
