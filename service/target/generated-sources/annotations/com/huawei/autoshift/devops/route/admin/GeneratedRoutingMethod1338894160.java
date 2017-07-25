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
@WebResource( path="/openview/api/v1/apps/{app_id}/demand-profiles/{demand_id}/capacity-plans/{id}/", method="GET" )
public class GeneratedRoutingMethod1338894160 implements HttpHandler {

	@Inject RoutingMethodResponseWriter responseWriter;
	@Inject RoutingMethodParameterReader methodDataProvider;
	@Inject RoutingMethodExceptionHandler exceptionHandler;
	
	@Inject com.huawei.openview.devops.route.admin.CapacityPlanResource instance;

	@Override
	public void handleRequest( HttpServerExchange exchange ) throws Exception {
			if ( exchange.isInIoThread() ) {
				exchange.dispatch(this);
				return;
			}
			else if ( !exchange.isInIoThread() && !exchange.isBlocking() )
				exchange.startBlocking();
		try {
			final kikaha.urouting.api.Response response = instance.getCapacityPlanById( 
			methodDataProvider.getPathParam( exchange, "app_id", java.lang.Long.class )
			,methodDataProvider.getPathParam( exchange, "demand_id", java.lang.Long.class )
			,methodDataProvider.getPathParam( exchange, "id", java.lang.Long.class )
			 );
				responseWriter.write( exchange, "application/json", response );
		} catch ( Throwable cause ) {
			responseWriter.write( exchange, exceptionHandler.handle( cause ) );
		}
	}
}