
/**
* mapbox
*/
export const mapbox = {
	accessToken: "pk.eyJ1IjoiY2hlcnNoODciLCJhIjoiY2lndndqNnNmMHJ2ZXc3bTU3YTMxZmIxMiJ9.TGBGfYTwYWiD-HRqLSm_rA",
	userKey: "chersh87.c6f33883",
	owner: "chersh87",
	style: "c6f33883"
}

export const persistenceData = {
	data: {"applications":[{"name":"acme-air-1","status":"complete","logo":"themes/openview/images/logos/acme-air.png","config_opts":1,"services":[{"name":"MySQL","containers":1},{"name":"Nginx","containers":1},{"name":"acmeair","containers":1}],"metrics":{"aggregated":["ContainerCntFiltered","DockerBlkioReadRateFiltered","DockerBlkioWriteRateFiltered","DockerCpuThrottlingFiltered","DockerCpuTotalFiltered","DockerMemTotalFiltered","DockerPageFaultFiltered","DockerRxRateFiltered","DockerTxRateFiltered","NginxLatencyFiltered","NginxReqPerSecFiltered","PriceFiltered"],"featured":[{"where":"host=acme-air-1_telegraf_1","select":"bytes_received","from":"mysql","id":"bytes_received","label":"bytes received"},{"where":"cont_name=r-acme-air-1_nginx_1","select":"rx_bytes","from":"docker_net","id":"rx_bytes","label":"rx bytes"},{"where":"host=acme-air-1_telegraf_1","select":"bytes_sent","from":"mysql","id":"bytes_sent","label":"bytes sent"},{"where":"cont_name=r-acme-air-1_nginx_1","select":"tx_bytes","from":"docker_net","id":"tx_bytes","label":"tx bytes"},{"where":"cont_name=r-acme-air-1_nginx_1","select":"io_service_bytes_recursive_total","from":"docker_blkio","id":"io_service_bytes_recursive_total","label":"io service bytes recursive total"}]}},{"name":"flightbox","status":"incomplete", "logo":"themes/openview/images/logos/flightbox.png","config_opts":1,"services":[{"name":"MySQL","containers":1},{"name":"Nginx","containers":1},{"name":"acmeair","containers":1}],"metrics":{"aggregated":["PriceFiltered","NginxLatencyFiltered","NginxReqPerSecFiltered","NginxErrorRateFiltered","ContainerCntFiltered","DockerCpuTotalFiltered","DockerCpuThrottlingFiltered","DockerMemTotalFiltered","DockerPageFaultFiltered","DockerRxRateFiltered","DockerTxRateFiltered","DockerBlkioReadRateFiltered","DockerBlkioWriteRateFiltered"],"featured":[{"select":"writeback","where":"cont_name=r-flightbox_db_1","from":"docker_mem","id":"writeback","label":"writeback"},{"select":"inactive_file","where":"cont_name=r-flightbox_nginx_1","from":"docker_mem","id":"inactive_file","label":"inactive file"},{"select":"usage_percent","where":"cont_name=r-flightbox_nginx_1","from":"docker_cpu","id":"usage_percent","label":"usage percent"},{"select":"writeback","where":"cont_name=r-flightbox_nginx_1","from":"docker_mem","id":"writeback","label":"writeback"},{"select":"usage_percent","where":"cont_name=r-flightbox_acmeair_1","from":"docker_cpu","id":"usage_percent","label":"usage percent"},{"select":"usage","where":"cont_name=r-flightbox_acmeair_1","from":"docker_mem","id":"usage","label":"usage"},{"select":"usage_total","where":"cont_name=r-flightbox_acmeair_1","from":"docker_cpu","id":"usage_total","label":"usage total"},{"select":"usage","where":"cont_name=r-flightbox_nginx_1","from":"docker_mem","id":"usage","label":"usage"},{"select":"usage_in_usermode","where":"cont_name=r-flightbox_nginx_1","from":"docker_cpu","id":"usage_in_usermode","label":"usage in usermode"},{"select":"pgfault","where":"cont_name=r-flightbox_db_1","from":"docker_mem","id":"pgfault","label":"pgfault"},{"select":"total_inactive_file","where":"cont_name=r-flightbox_nginx_1","from":"docker_mem","id":"total_inactive_file","label":"total inactive file"},{"select":"pgpgin","where":"cont_name=r-flightbox_db_1","from":"docker_mem","id":"pgpgin","label":"pgpgin"}]}}]}
}


let pre = '/api';
export const urlUtil = {
    format:function(str){
        var args = Array.prototype.slice.call(arguments,1);
        return str.replace(/{(\d+)}/g,function(match, number){
            return typeof args[number] != undefined
                ? args[number] : match;
        });
    },
    url:{
        capacityPlan: pre + '/openview/api/v1/apps/{0}/demand-profiles/{1}/capacity-plans/{2}',
		location:pre + '/openview/api/v1/locations'
    }
}