import dispatcher from "../libs/dispatcher"

/**
* updateStep
**/
export function updateStep(step){
    dispatcher.dispatch({
        type: "UPDATE_STEP",
        step
    });
}

/**
* updateServiceMenu
**/
export function updateServiceMenu(menuId){
    dispatcher.dispatch({
        type: "UPDATE_SERVICE_MENU",
        menuId
    });
}

/**
* updateDeploymentData
**/
export function updateDeploymentData(deploymentData){
    dispatcher.dispatch({
        type: "UPDATE_DEPLOYMENT_DATA",
        deploymentData
    });
}

/**
* updateSLAData
**/
export function updateSlaData(slaData){
    dispatcher.dispatch({
        type: "UPDATE_SLA_DATA",
        slaData
    });
}
