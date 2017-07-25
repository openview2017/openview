package com.huawei.openview.devops.domain.admin;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;

/**
 * @author Xicheng Chang
 *
 */

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@DatabaseTable(tableName = "openview_application_mode")
public class AppMode {
        public static final String APP_ID = "app_id";

        @JsonIgnore
        @DatabaseField(generatedId = true)
        private Long id;

        @JsonIgnore
        @DatabaseField
        private Long app_id;

        @DatabaseField(defaultValue="75", canBeNull=true)
        private Integer automation_level;
}
