package com.huawei.openview.devops.domain.docker;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DockerComposeList implements Iterable{

	private List <SingleDockerYaml> composeMap = new ArrayList<>();

	@Override
	public Iterator iterator() {
		return composeMap.iterator();
	}

}
