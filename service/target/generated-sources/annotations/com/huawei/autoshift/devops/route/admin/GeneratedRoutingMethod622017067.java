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
@WebResource( path="/openview/api/v1/apps/{id}/metrics/", method="DELETE" )
public class GeneratedRoutingMethod622017067 implements HttpHandler {

	@Inject RoutingMethodResponseWriter responseWriter;
	@Inject RoutingMethodParameterReader methodDataProvider;
	@Inject RoutingMethodExceptionHandler exceptionHandler;
	
	@Inject com.huawei.openview.devops.route.admin.AppMetricsResource instance;

	@Override
	public void handleRequest( HttpServerExchange exchange ) throws Exception {
			if ( exchange.isInIoThread() ) {
				exchange.dispatch(this);
				return;
			}
			else if ( !exchange.isInIoThread() && !exchange.isBlocking() )
				exchange.startBlocking();
		try {
			final kikaha.urouting.api.Response response = instance.deleteAppMetricesByAppId( 
			methodDataProvider.getPathParam( exchange, "id", java.lang.Long.class )
			,methodDataProvider.getQueryParam( exchange, "index", java.lang.String.class )
			 );
				responseWriter.write( exchange, "application/json", response );
		} catch ( Throwable cause ) {
			responseWriter.write( exchange, exceptionHandler.handle( cause ) );
		}
	}
}