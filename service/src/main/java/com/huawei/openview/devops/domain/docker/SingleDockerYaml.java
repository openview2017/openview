package com.huawei.openview.devops.domain.docker;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SingleDockerYaml {
	
	private String key;
	private String dockerfile;
	private String command;
	private String container_name;
	private String image;
	private String build;
	private String restart;
	private String mem_limit;
	private String memswap_limit;
	private String cpu_quota;
	private String scale;
	private String volumes_from;
	private String privileged;

	private List<String> extra_hosts;
	private Map <String, String> labels;
	private List<String> links;
	private List<String> external_links;
	private List<String> ports;
	private List<String> expose;
	private List<String> volumes;
	private List<String> environment;
}
