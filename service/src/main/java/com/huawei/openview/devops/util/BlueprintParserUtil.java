package com.huawei.openview.devops.util;

import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;


@Slf4j
public class BlueprintParserUtil {
    static public Long parseCpuResource(String resource) throws IllegalArgumentException {
		if (resource == null || resource.equals("")) return null;
		Pattern p = Pattern.compile("^\\s*([\\d.]+(?:e\\d+)?)([m]?)\\s*$");
		Matcher m = p.matcher(resource.toLowerCase());
		if (!m.matches()) {
			throw new IllegalArgumentException(String.format("Invalid resource value: %s", resource));
		}
		BigDecimal value = new BigDecimal(m.group(1)).multiply(BigDecimal.valueOf(1000));
		if (m.group(2).equals("")) {
			value = value.multiply(BigDecimal.valueOf(1000));
		}
		log.debug("parseCpuResource: {} => {} => {}", resource, value, value.longValue());
		return value.longValue();
	}

	static public Long parseMemoryResource(String resource) throws IllegalArgumentException {
		if (resource == null || resource.equals("")) return null;
		Pattern p = Pattern.compile("^\\s*([\\d.]+(?:e\\d+)?)([eptgmk]?)(i?)\\s*$");
		Matcher m = p.matcher(resource.toLowerCase());
		if (!m.matches()) {
			throw new IllegalArgumentException(String.format("Invalid resource value: %s", resource));
		}

		BigDecimal value = new BigDecimal(m.group(1));

		final String unit = "_kmgtpe";
		final long[] times10 = {1L, 1000L, 1000_000L, 1000_000_000L, 1000_000_000_000L, 1000_000_000_000_000L, 1000_000_000_000_000L};
		final long[] times2 = {1L, 1L << 10, 1L << 20, 1L << 30, 1L << 40, 1L << 50, 1L << 60};
		int pow = unit.indexOf(m.group(2));
		if (pow == -1) {
			throw new IllegalArgumentException(String.format("Invalid resource value: %s", resource));
		}
		if (m.group(3).equals("")) {
			value = value.multiply(BigDecimal.valueOf(times10[pow]));
		} else {
			value = value.multiply(BigDecimal.valueOf(times2[pow]));
		}
		log.debug("parseMemoryResource: {} => {} => {}", resource, value, value.longValue());
		return value.longValue();
	}
}