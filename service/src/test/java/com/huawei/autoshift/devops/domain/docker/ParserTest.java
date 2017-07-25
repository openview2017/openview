package com.huawei.openview.devops.domain.docker;

import static org.junit.Assert.assertEquals;

import java.io.InputStream;
import java.net.URL;
import java.util.Map;

import org.junit.Test;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * 
 * @author Sid Askary
 *
 */

@Slf4j
public class ParserTest {

	@Test
	public void testParse() throws Exception {
		URL resource = this.getClass().getResource("/test.yml");
		InputStream inputStream = resource.openStream();
		
		Constructor constructor = new Constructor(Map.class);
		Yaml yamlParser = new Yaml(constructor);
		Map<String, SingleDockerYaml>  composeMap = ( Map<String, SingleDockerYaml>) yamlParser.load(inputStream);

		for (Map.Entry<String, SingleDockerYaml> entry : composeMap.entrySet()) {
	
			String key = entry.getKey();
			System.out.println("\t\t -----------");
			System.out.println(entry);
			System.out.println("*************\n");
			
			// jackson's objectmapper
			ObjectMapper mapper = new ObjectMapper(); 
			SingleDockerYaml pojo = mapper.convertValue(entry.getValue(), SingleDockerYaml.class);
			pojo.setKey(key);
			System.out.println(pojo);

			assertEquals("on-failure:3", pojo.getRestart());
		}

	}

}