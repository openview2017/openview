var openview = openview || {};
openview.UTILS = openview.UTILS || {};
var utils = openview.UTILS ;

/** getObjVal
     * @param obj Object
     * @param path Node path ex. testObj.person.first_name
     * @param defVal Default value ex. "", 0 if object node does not exist
     * @returns value of the object node
     *
     * Example usage:
     * var exercise = {name: "bicep curl", equipment: {id: 1, name: "Barbell", media: {id :501 }} };
     * getObjVal(exercise,"equipment.media.id", 0); //returns 501;
     * getObjVal(exercise,"equipment.media.test", 0); //returns 0; // node does not exist default val will be returned
     */
utils.getObjVal = function(obj, path, defVal){
    defaultVal = typeof defVal === "undefined"? "" : defVal;
    if (typeof obj !=="object" || obj === null){
        console.log("object param is not an object");
        return defaultVal;
    }

    var keys = path.split("."), value;
    for(var i = 0; i < keys.length; i++){
        if(typeof obj[keys[i]] !== "undefined"){
            value = obj = obj[keys[i]];
        }else{
            return defaultVal;
        }
    }
    return (value === null ? defaultVal: value) ;
};

utils.getUrlParams = function () {
    var params = {};
    var query;
    var url = window.location.href;
    if (url.indexOf ("?") > 0) {
        query = url.substring (url.indexOf ("?") + 1).split ('&');
        $.each (query, function (i, v) {
            var pair = v.split ('=');
            params[pair[0]] = unescape (pair[1]);
        });
    } else {
        params = {};
    }
    return params;
};

utils.replaceQueryParam = function(param, newval, search) {
    var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
    var query = search.replace(regex, "$1").replace(/&$/, '');

    return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
}
