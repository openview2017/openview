package com.huawei.openview.devops.domain.docker;

import static org.junit.Assert.assertNotNull;

import javax.inject.Inject;
import javax.sql.DataSource;

import org.junit.Test;
import org.junit.runner.RunWith;

import kikaha.core.test.KikahaRunner;
import lombok.extern.slf4j.Slf4j;

/**
 * 
 * @author Sid Askary
 *
 */

@Slf4j
@RunWith(KikahaRunner.class)
public class DBTest {

	//@Inject
	//DataSource defaultDatasource;

	@Test
	public void testDB() throws Exception {
		//assertNotNull(defaultDatasource);
		//log.info("defaultDatasource name= " + defaultDatasource.toString());

	}

}