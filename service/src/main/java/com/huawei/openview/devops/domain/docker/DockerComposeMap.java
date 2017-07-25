package com.huawei.openview.devops.domain.docker;

import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DockerComposeMap {

	private Map <String, SingleDockerYaml> composeMap = new HashMap<>();

}
