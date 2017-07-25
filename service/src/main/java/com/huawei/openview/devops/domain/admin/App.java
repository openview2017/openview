package com.huawei.openview.devops.domain.admin;

import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Data
@DatabaseTable(tableName = "app")
public class App extends AbstractBaseEntity {

	@DatabaseField(canBeNull = false)
	private String name;

	@DatabaseField
	private String logo_url;

	@DatabaseField(columnName = "app_status_id",
			foreign = true, foreignAutoRefresh = true, foreignAutoCreate = true)
	private AppStatus status;

	private AppBlueprint blueprint;
	private AppSla sla;
	private AppMode mode;
	private List<String> entrypoint_candidates;
    private List<Timestamp> actions_timestamp;
    private List<RemediationAction> actions_detail;

    public List<Double> getActions_timestamp() {
        if (actions_timestamp == null) {
            return null;
        }
        ArrayList<Double> timestamps = new ArrayList<>();
        for (Timestamp timestamp : actions_timestamp) {
            if (timestamp != null) {
                timestamps.add((double)timestamp.getTime() / 1000);
            }
        }
        return timestamps;
    }

	@DatabaseField
	private Long capacity_plan_result_id;

	@DatabaseField(canBeNull = false)
	private Long user_id;
}
