package com.huawei.openview.devops.domain.docker;

import java.util.LinkedHashMap;

import org.yaml.snakeyaml.constructor.Constructor;
import org.yaml.snakeyaml.nodes.Node;
import org.yaml.snakeyaml.nodes.Tag;

/**
 * 
 * @author Sid Askary
 *
 */

public class YamlConstructor extends Constructor {
	@Override
	protected Object constructObject(Node node) {

		if (node.getTag() == Tag.MAP) {
			LinkedHashMap<String, Object> map = (LinkedHashMap<String, Object>) super.constructObject(node);
			// If the map has the typeId and limit attributes
			// return a new Item object using the values from the map

		}
		// In all other cases, use the default constructObject.
		return super.constructObject(node);
	}
}
