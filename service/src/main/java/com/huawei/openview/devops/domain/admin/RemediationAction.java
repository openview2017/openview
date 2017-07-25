package com.huawei.openview.devops.domain.admin;

import java.sql.Timestamp;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huawei.openview.devops.domain.AbstractBaseEntity;
import com.huawei.openview.devops.domain.dryrun.config.Resources;
import com.huawei.openview.devops.domain.dryrun.config.SetConfig;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
@DatabaseTable(tableName = "remediation_action")
public class RemediationAction extends AbstractBaseEntity {

    public static final String date_format_string = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    public static final SimpleDateFormat date_format = new SimpleDateFormat(date_format_string);
    public static final ObjectMapper objectMapper = new ObjectMapper();
    public static final String FINISHING_TIME = "finishing_time";
    
    static {
        date_format.setTimeZone(TimeZone.getTimeZone("UTC"));
    }

    @DatabaseField
    private ActionName action_name;
    public enum ActionName {
        scale("scale"),
        mem_limit("memory limit"),
        cpu_quota("cpu limit");

        private final String displayname;
        private ActionName(String displayname) { this.displayname = displayname; }
        public String getDisplayname() { return this.displayname; }
    }

    @DatabaseField
    private String action_change_amount;

    @DatabaseField
    private Long app_id;

    @DatabaseField(canBeNull = false, defaultValue = "RECOMMENDED")
    private ActionType type;
    public enum ActionType {
        RECOMMENDED, CUSTOMIZED, USER_APPROVED, AUTO_APPLIED
    }

    @DatabaseField(canBeNull = false, defaultValue = "RECOMMENDED")
    private ActionStatus status = ActionStatus.RECOMMENDED;
    public enum ActionStatus {
        RECOMMENDED, K8SCOMMUNICATIONERROR, APPLYING, APPLIED, TIMEOUT, ROLLINGBACK, ROLLEDBACK, ROLLBACKFAILED, NOTACCEPTABLE
    }

    @JsonIgnore
    @DatabaseField(canBeNull = false)
    private String set_config_before_action;

    @JsonIgnore
    private SetConfig parsed_set_config_before_action;

    @JsonIgnore
    @DatabaseField
    private String set_config_after_action;

    @JsonIgnore
    private SetConfig parsed_set_config_after_action;

    @DatabaseField
    private Float confidence_score;

    @DatabaseField
    private Float cost_change;

    @JsonIgnore
    @DatabaseField
    private String root_causes;

    @JsonIgnore
    private ArrayList<HashMap<String, Object> > parsed_root_causes;

    private Long issues = new Long(0);

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = date_format_string, timezone = "UTC")
    @DatabaseField
    private Timestamp expiration_time;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = date_format_string, timezone = "UTC")
    @DatabaseField
    private Timestamp finishing_time;

    @JsonIgnore
    public Float getConfidence_score() {
        return this.confidence_score;
    }

    @JsonProperty("confidence_score")
    public void setConfidence_score(Float confidence_score) {
        this.confidence_score = confidence_score;
    }

    @JsonIgnore
    public Float getCost_change() {
        return this.cost_change;
    }

    @JsonProperty("cost_change")
    public void setCost_change(Float cost_change) {
        this.cost_change = cost_change;
    }

    @JsonProperty("percentage")
    public Float getPercentage() {
        return this.confidence_score * 100;
    }

    @JsonProperty("percentage")
    public void setPercentage(Float percentage) {
        this.confidence_score = percentage / 100;
    }

    @JsonProperty("cost")
    public Float getCost() {
        return this.cost_change;
    }

    @JsonProperty("cost")
    public void setCost(Float cost) {
        this.cost_change = cost;
    }

    @JsonProperty("suggestion")
    public String getSuggestion() {
        String kind = null;
        String name = null;
        SetConfig config = this.getConfig_before_action();
        if (config != null) {
            kind = "("+config.getKind()+")";
            name = config.getName();
            if (config.getPodConfig() != null && this.getAction_name() != ActionName.scale) {
                Map<String, Resources> containersConfig = config.getPodConfig().getContainersConfig();
                if (containersConfig != null) {
                    kind += " / " + containersConfig.keySet().iterator().next();
                }
            }
        }
        return MessageFormat.format(
                "{4} {1} {0} {2} by {3}",
                kind,
                name,
                this.action_name.getDisplayname(),
                this.action_change_amount.substring(1),
                this.action_change_amount.charAt(0)=='+'?"Increase":"Decrease"
        );
    }

    public static Timestamp parseTimestamp(Object timestamp) {
        if (timestamp instanceof Number) {
            Number timestamp_as_number = (Number)timestamp;
            return new Timestamp((long)(timestamp_as_number.doubleValue() * 1000));
        } else if (timestamp instanceof Timestamp) {
            return (Timestamp)timestamp;
        } else if (timestamp instanceof String) {
            try {
                Date date = date_format.parse((String)timestamp);
                return new Timestamp(date.getTime());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    public static SetConfig parseSetConfig(Object config) {
        if (config == null) {
            return null;
        }
        if (config instanceof SetConfig) {
            return (SetConfig)config;
        } else if (config instanceof String) {
            try {
                return objectMapper.readValue((String)config, SetConfig.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            try {
                return objectMapper.convertValue(config, SetConfig.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    public static ArrayList<HashMap<String, Object> > parseRootCauses(Object root_causes) {
        if (root_causes == null) {
            return null;
        }
        if (root_causes instanceof String) {
            try {
                return objectMapper.readValue((String)root_causes, new TypeReference<ArrayList<HashMap<String, Object> > >(){});
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            return (ArrayList<HashMap<String, Object> >)root_causes;
        }
        return null;
    }

    public static String formatSetConfig(SetConfig config) {
        if (config == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(config);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String formatRootCauses(ArrayList<HashMap<String, Object> > root_causes) {
        if (root_causes == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(root_causes);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public void setExpiration_time(Object expiration_time) {
        this.expiration_time = this.parseTimestamp(expiration_time);
    }

    public void setFinishing_time(Object finishing_time) {
        this.finishing_time = this.parseTimestamp(finishing_time);
    }

    @JsonProperty("set_config_before_action")
    public void setConfig_before_action(Object set_config_before_action) {
        log.debug("set set_config_before_action: {}", set_config_before_action);
        this.parsed_set_config_before_action = this.parseSetConfig(set_config_before_action);
        this.set_config_before_action = this.formatSetConfig(this.parsed_set_config_before_action);
    }

    @JsonProperty("set_config_after_action")
    public void setConfig_after_action(Object set_config_after_action) {
        log.debug("set set_config_after_action: {}", set_config_after_action);
        this.parsed_set_config_after_action = this.parseSetConfig(set_config_after_action);
        this.set_config_after_action = this.formatSetConfig(this.parsed_set_config_after_action);
    }

    @JsonProperty("set_config_before_action")
    public SetConfig getConfig_before_action() {
        if (this.parsed_set_config_before_action == null) {
            this.parsed_set_config_before_action = this.parseSetConfig(this.set_config_before_action);
        }
        return this.parsed_set_config_before_action;
    }

    @JsonProperty("set_config_after_action")
    public SetConfig getConfig_after_action() {
        if (this.parsed_set_config_after_action == null) {
            this.parsed_set_config_after_action = this.parseSetConfig(this.set_config_after_action);
        }
        return this.parsed_set_config_after_action;
    }

    @JsonProperty("root_causes")
    public void setRootCauses(Object root_causes) {
        log.debug("set root_causes: {}", root_causes);
        this.parsed_root_causes = this.parseRootCauses(root_causes);
        log.debug("parsed root causes: {}", this.parsed_root_causes);
        this.root_causes = this.formatRootCauses(this.parsed_root_causes);
    }

    @JsonProperty("root_causes")
    public ArrayList<HashMap<String, Object> > getRootCauses() {
        if (this.parsed_root_causes == null) {
            this.parsed_root_causes = this.parseRootCauses(this.root_causes);
        }
        return this.parsed_root_causes;
    }

    public void merge(RemediationAction remediation_action) {
        if (remediation_action.action_name != null) {
            this.action_name = remediation_action.action_name;
        }
        if (remediation_action.action_change_amount != null) {
            this.action_change_amount = remediation_action.action_change_amount;
        }
        if (remediation_action.set_config_before_action != null) {
            this.set_config_before_action = remediation_action.set_config_before_action;
            this.parsed_set_config_before_action = remediation_action.parsed_set_config_before_action;
        }
        if (remediation_action.type != null) {
            this.type = remediation_action.type;
        }
        if (remediation_action.cost_change != null) {
            this.cost_change = remediation_action.cost_change;
        }
        if (remediation_action.set_config_after_action != null) {
            this.set_config_after_action = remediation_action.set_config_after_action;
            this.parsed_set_config_after_action = remediation_action.parsed_set_config_after_action;
        }
        if (remediation_action.root_causes != null) {
            this.root_causes = remediation_action.root_causes;
            this.parsed_root_causes = remediation_action.parsed_root_causes;
        }
    }

    public String message;

    // store the current Kubernetes status
    private String response_body;
}