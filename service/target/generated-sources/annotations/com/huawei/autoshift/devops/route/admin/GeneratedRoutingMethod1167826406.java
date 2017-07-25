package com.huawei.openview.devops.route.admin;

import io.undertow.server.HttpHandler;
import io.undertow.server.HttpServerExchange;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.enterprise.inject.Typed;
import kikaha.core.modules.http.WebResource;
import kikaha.urouting.RoutingMethodResponseWriter;
import kikaha.urouting.RoutingMethodParameterReader;
import kikaha.urouting.RoutingMethodExceptionHandler;

@Singleton
@Typed( HttpHandler.class )
@WebResource( path="/openview/api/v1/apps/{app_id}/demand-profiles/{demand_id}/capacity-plans/{plan_id}/dryrun/{dryrun_id}/", method="POST" )
public class GeneratedRoutingMethod1167826406 implements HttpHandler {

	@Inject RoutingMethodResponseWriter responseWriter;
	@Inject RoutingMethodParameterReader methodDataProvider;
	@Inject RoutingMethodExceptionHandler exceptionHandler;
	
	@Inject com.huawei.openview.devops.route.admin.DryRunKubeResource instance;

	@Override
	public void handleRequest( HttpServerExchange exchange ) throws Exception {
			if ( exchange.isInIoThread() ) {
				exchange.dispatch(this);
				return;
			}
			else if ( !exchange.isInIoThread() && !exchange.isBlocking() )
				exchange.startBlocking();
		try {
			final kikaha.urouting.api.Response response = instance.createDryrun( 
			methodDataProvider.getPathParam( exchange, "app_id", java.lang.Long.class )
			,methodDataProvider.getPathParam( exchange, "plan_id", java.lang.Long.class )
			,methodDataProvider.getPathParam( exchange, "dryrun_id", java.lang.Long.class )
			,methodDataProvider.getQueryParam( exchange, "k8s_endpoint_id", java.lang.Long.class )
			,methodDataProvider.getBody( exchange, com.huawei.openview.devops.domain.dryrun.DryRunConfiguration.class, "application/json" )
			 );
				responseWriter.write( exchange, response );
		} catch ( Throwable cause ) {
			responseWriter.write( exchange, exceptionHandler.handle( cause ) );
		}
	}
}