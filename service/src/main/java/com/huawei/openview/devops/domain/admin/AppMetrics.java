package com.huawei.openview.devops.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;
import lombok.NonNull;

/**
 * @author Mengqing Qian
 */

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@DatabaseTable(tableName = "app_metrics")

public class AppMetrics {
    public static final String APP_ID = "app_id";

    public static final String INDEX = "index";

    @JsonIgnore
    @DatabaseField(generatedId = true)
    private Long id;

    @JsonIgnore
    @DatabaseField(canBeNull = false)
    private Long app_id;

    @DatabaseField(canBeNull = false)
    public Long index;

    @DatabaseField(canBeNull = false)
    private String container_name;

    @DatabaseField(canBeNull = false)
    private String pod_name;

    @DatabaseField
    private String controller_name;

    @DatabaseField
    private String controller_kind;

    @DatabaseField(canBeNull = false)
    private String metric;

    @DatabaseField
    private String statistic;
}
