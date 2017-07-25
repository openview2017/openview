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
@WebResource( path="/openview/api/v1/apps/{app_id}/actions/", method="GET" )
public class GeneratedRoutingMethod992522339 implements HttpHandler {

	@Inject RoutingMethodResponseWriter responseWriter;
	@Inject RoutingMethodParameterReader methodDataProvider;
	@Inject RoutingMethodExceptionHandler exceptionHandler;
	
	@Inject com.huawei.openview.devops.route.admin.RemediationActionResource instance;

	@Override
	public void handleRequest( HttpServerExchange exchange ) throws Exception {
			if ( exchange.isInIoThread() ) {
				exchange.dispatch(this);
				return;
			}
			else if ( !exchange.isInIoThread() && !exchange.isBlocking() )
				exchange.startBlocking();
		try {
			final kikaha.urouting.api.Response response = instance.findRemediationActionsByAppId( 
			methodDataProvider.getPathParam( exchange, "app_id", java.lang.Long.class )
			,methodDataProvider.getQueryParam( exchange, "starttime", java.lang.String.class )
			,methodDataProvider.getQueryParam( exchange, "endtime", java.lang.String.class )
			,methodDataProvider.getQueryParam( exchange, "statuses_in", java.lang.String.class )
			,methodDataProvider.getQueryParam( exchange, "statuses_notin", java.lang.String.class )
			,methodDataProvider.getQueryParam( exchange, "isexpired", java.lang.Boolean.class )
			,methodDataProvider.getQueryParam( exchange, "action_ids", java.lang.String.class )
			 );
				responseWriter.write( exchange, "application/json", response );
		} catch ( Throwable cause ) {
			responseWriter.write( exchange, exceptionHandler.handle( cause ) );
		}
	}
}