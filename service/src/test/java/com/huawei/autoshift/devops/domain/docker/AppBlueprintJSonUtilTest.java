//package com.huawei.openview.devops.domain.docker;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.node.ArrayNode;
//import com.fasterxml.jackson.databind.node.ObjectNode;
//import com.huawei.openview.devops.util.DryrunConfigUtil;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.Test;
//
//import java.io.InputStream;
//import java.net.URL;
//
///**
// * @author Qing Zhou
// */
//
//@Slf4j
//public class AppBlueprintJSonUtilTest {
//
//	// removeTypeIfKindIsService
//	@Test
//	public void testRemoveTypeIfKindIsService () throws Exception {
//		System.out.println("test - removeTypeIfKindIsService");
//
//		URL resource = this.getClass().getResource("/DeleteNodePortAndHostPathInDryruns.json");
//		InputStream inputStream = resource.openStream();
//
//		ObjectMapper mapper = new ObjectMapper();
//		ArrayNode root = (ArrayNode)mapper.readTree(inputStream);
//		System.out.println("Before : Json = \n" + root.toString());
//
////		DryrunConfigUtil.removeTypeAndNodePortIfKindIsService(root);
//		System.out.println("After : Json = \n" + root.toString());
//	}
//
//	// removeNonReadOnlyVolume
//	@Test
//	public void testRemoveNonReadOnlyVolume () throws Exception {
//		System.out.println("test - removeNonReadOnlyVolume");
//		URL resource = this.getClass().getResource("/DoNotDeleteReadOnlyVolumeMounts.json");
//		InputStream inputStream = resource.openStream();
//
//		ObjectMapper mapper = new ObjectMapper();
//		ObjectNode root = (ObjectNode) mapper.readTree(inputStream);
//		System.out.println("Before : Json = \n" + root.toString());
//
//		DryrunConfigUtil.removeNonReadOnlyVolume(root);
//		System.out.println("After : Json = \n" + root.toString());
//	}
//
//	// processReplicationController
//	@Test
//	public void testProcessReplicationController() throws Exception {
//		System.out.println("test - processReplicationController");
//		URL resource = this.getClass().getResource("/ReplicationController.json");
//		InputStream inputStream = resource.openStream();
//
//		ObjectMapper mapper = new ObjectMapper();
//		ObjectNode root = (ObjectNode) mapper.readTree(inputStream);
//		System.out.println("Before : Json = \n" + root.toString());
//	}
//
//	// processReplicationControllerReplaceNodeSelector
//	@Test
//	public void testProcessReplicationControllerNodeSelector() throws Exception {
//		System.out.println("test - processReplicationControllerNodeSelector");
//		URL resource = this.getClass().getResource("/DoNotDeleteReadOnlyVolumeMounts.json");
//		InputStream inputStream = resource.openStream();
//
//		ObjectMapper mapper = new ObjectMapper();
//		ObjectNode root = (ObjectNode) mapper.readTree(inputStream);
//		System.out.println("Before : Json = \n" + root.toString());
//
//		ObjectNode nodeSelector = getMocNodeSelector();
//		System.out.println("nodeSelector (new) = " + nodeSelector.toString());
////		DryrunConfigUtil.processReplicationControllerNodeSelector(root, nodeSelector);
//		System.out.println("After : Json = \n" + root.toString());
//	}
//
//	private ObjectNode getMocNodeSelector() {
//		ObjectMapper mapper = new ObjectMapper();
//
//		ObjectNode nodeSelector = mapper.createObjectNode();
//		nodeSelector.put("name", "openview-demo-node-1-JUNIT");
//
//		return nodeSelector;
//	}
//}