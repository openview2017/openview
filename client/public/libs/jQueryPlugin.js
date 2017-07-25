(function(sImoPlugin) {
        "use strict";

        sImoPlugin(window.jQuery, window, document);

    }(function($, window, document) {
        "use strict";

        $(function() {
            $.safeGetCookieObject = function(cookie){
                var _return = null;
                try {
                    _return = cookie !== "" ? $.parseJSON(cookie) : _return;
                } catch(ex){
                    trace(ex);
                }
                return _return;
            };
            $.toJSON = $.toJSON || function(obj){
                    if($.isPlainObject(obj) || $.isArray){
                        return JSON.stringify(obj);
                    } else {
                        debug("Invalid Object type >>> " + $.type(obj) + " !  It should be either a plainObject or an array");
                        return "";
                    }
                };
            $.redirectTo = function(html_page){
                window.location.href = window.location.href.replace(/(?!\/)[^.html]*(\.html)/g, function(match, g1){
                    return html_page + ($.inString(html_page, ".htm") ? "" : g1);
                });
            };
            $.trimArray = function(arg, return_as_string){
                return_as_string = $.isBoolean(return_as_string) ? return_as_string : true;

                if(!($.isString(arg) && $.inString(arg, ",")) && $.isArray(arg)){
                    return arg;
                }

                var arr = arg;
                if($.isString(arg)){
                    arr = arg.split(",");
                }

                var ret = $.map(arr, $.trim);
                if(return_as_string){
                    ret = arr.toString().replace(/\,/g,", ");
                }
                return ret;
            };
            $.isInArray = function(string, array){
                array = $.isArray(array) ? array : null;
                string = $.isString(string) || string === "" ? string : null;
                if (array === null || string === null){
                    return -1;
                }
                return $.inArray(string, array) >= 0;
            };
            $.inString = function(str, obj){
                return String(str).indexOf(obj) >= 0;
            };
            $.isString = function(obj){
                return typeof(obj) === "string" && obj.trim() !== "";
            };
            $.isVisible = function(obj){
                return (obj instanceof jQuery) && obj.is(":visible");
            };
            $.isBoolean = function(obj){
                return typeof(obj) === "boolean";
            };
            $.toProperCase = function(strToProperCase){
                return String(strToProperCase).replace(/(\b[^ ])(?:\B[\w]+.)/ig, function(a, b, c){
                    return b.toUpperCase() + a.substr(1);
                });
            };
            $.toCamelCase = function(strToCamelCase){
                // remove all characters that should not be in a variable name
                // as well underscores an numbers from the beginning of the string
                var s = String(strToCamelCase).replace(/(^[_]|[^a-z_]*[^a-z_-]|[^a-z]{1,}.$)/ig, " ").trim();
                // uppercase letters following a space, underscore or hyphen
                s = s.replace(/([^a-z]+)(.)/ig, function(a, b, c){
                    return c.toUpperCase();
                });
                // lowercase letters followed by 2 or more uppercase letters
                s = s.replace(/([a-z])(\B[A-Z]{2,})/g, function(a, b, c){
                    return c.replace(/(\b[A-Z])(\B[A-Z].*)/g, function(d, e, f){
                        return b + e + f.toLowerCase();
                    });
                });
                return s;
            };
            $.getNumericValue = function(str, valueIfNone){
                valueIfNone = parseFloat(valueIfNone) || 0;
                str = String(str);

                return str.match(/\d+/) ? parseFloat(str.trim().replace(/,/g,"").match(/([\d\.\,]+)/g).join()) : valueIfNone;
            };
            $.getRandom = function(options, length, minRange, maxRange, isfloatOrSpecialCharacter, decimal, base, spike){
                //----------------------------------------------------------------------------------------------------------
                //  $.getRandom(options);
                //
                //  options     <string|object>
                //
                //  string      <acceptableValue>
                //  object      option                  type        default                 acceptableValue(s)
                //              ----------------------  ----------  ----------------------  -----------------------
                //              type                    string      "mix"                   "number | string | mix"
                //              length                  numeric     8
                //              minRange    <           number      0
                //              maxRange    <           number      999
                //              isFloat     <           boolean     false
                //              decimal     <           boolean     2
                //              base        <           number
                //              specialCharacter <<     boolean     true
                //
                //              < ignored if type is NOT "number"
                //              << ignored if type is "number"
                //----------------------------------------------------------------------------------------------------------

                var charSet = '0a1b2c3d4e5f6g7h8i9j1A2k3B4l5C6m7D8n9E1o2F3p4G5q6H7r8I9s1J2t3K4u5L6v7M8w9N0x1O2y3P4z5Q6R7S8T9!U!1_V_2+W+3!X!4+Y+5!Z!6!7+8+9',
                    alphaCharSet = "AaBbCcDdEeFfGgHhIiGjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";

                //----------------------------------------------------------------------------------------------------------
                //  DEFAULTS
                //----------------------------------------------------------------------------------------------------------
                length = parseFloat(length) || 8;
                minRange = parseFloat(minRange) || "";
                maxRange = parseFloat(maxRange) || "";
                base = parseFloat(base) || "";
                decimal = parseFloat(decimal) || 2;
                spike = $.isPlainObject(spike) ? spike : null;
                var spikeTo = $.isPlainObject(spike) && $.isNumeric(spike.to) ? spike.to : "",
                    spikeStartAt = $.isPlainObject(spike) && $.isNumeric(spike.startAt) ? spike.startAt : "",
                    spikeStopAt = $.isPlainObject(spike) && $.isNumeric(spike.stopAt) ? spike.stopAt : "";

                var type = "mix",
                    maxSteps = "",
                    isFloat = false,
                    includeSpecialChars = true;

                function _get_random_characters(_charSet, _length){
                    var _chars__ = "";
                    while(_length--){
                        _chars__ += _charSet[Math.round(Math.random() * (_charSet._length / 2))];
                    }
                    return _chars__;
                }

                function _get_random_numbers(_minRange, _maxRange, _maxSteps, _isFloat, _decimal, _previous){
                    _isFloat = _isFloat === true;

                    if ($.isNumeric(_minRange) || $.isNumeric(_maxRange)){
                        _minRange = $.isNumeric(_minRange) ? _minRange : 0;
                        _maxRange = $.isNumeric(_maxRange) ? _maxRange : 999;

                        if (_minRange > _maxRange){
                            _minRange = _maxRange - 2;
                        }
                    }

                    var _random,
                        _max_steps = $.isNumeric(_maxSteps) ? Math.random() * _maxSteps : "";
                    _max_steps = $.isNumeric(_max_steps) && isFloat ? parseFloat(_max_steps.toFixed(_decimal || 2)) : Math.round(_max_steps);

                    if ($.isNumeric(_minRange)) {
                        _random = Math.random() * (_maxRange - _minRange + 1) + _minRange;
                        _random = $.isNumeric(_random) && isFloat ? parseFloat(_random.toFixed(_decimal || 2)) : Math.round(_random);
                        if ($.isNumeric(_maxSteps) && $.isNumeric(_previous)){
                            if (_random > _previous && _random > (_previous + _max_steps)){
                                _random = (_previous + _max_steps);
                            } else if (_random < _previous && _random < (_previous - _max_steps)){
                                _random = (_previous - _max_steps);
                            }
                        }
                    } else if ($.isNumeric(_maxSteps)){
                        _random = _max_steps;
                    } else {
                        _random = Math.random();
                        _random = isFloat ? parseFloat(_random.toFixed(_decimal || 2)) : Math.round(_random);
                    }

                    return _random;
                }

                //----------------------------------------------------------------------------------------------------------
                //  OPTIONS
                //----------------------------------------------------------------------------------------------------------
                if($.isPlainObject(options)){
                    type = options.type && (options.type === "number" || options.type === "string") ? options.type : type;
                    length = $.isNumeric(options.length) ? parseInt(options.length) : length;
                    minRange = $.isNumeric(options.minRange) ? parseInt(options.minRange) : minRange;
                    maxRange = $.isNumeric(options.maxRange) ? parseInt(options.maxRange) : maxRange;
                    maxSteps = $.isNumeric(options.maxSteps) ? parseInt(options.maxSteps) : maxSteps;
                    base = $.isNumeric(options.base) ? parseInt(options.base) : base;
                    isFloat = $.isBoolean(options.isFloat) ? options.isFloat : isFloat;
                    decimal = $.isNumeric(options.decimal) ? options.decimal : decimal;
                    includeSpecialChars = $.isBoolean(options.specialCharacter) ? options.specialCharacters : includeSpecialChars;
                    spike = !$.isPlainObject(spike) && $.isPlainObject(options.spike) ? options.spike : spike;
                    spikeTo = $.isPlainObject(spike) && $.isNumeric(options.spike.to) ? options.spike.to : "";
                    spikeStartAt = $.isPlainObject(spike) && $.isNumeric(options.spike.startAt) ? options.spike.startAt : "";
                    spikeStopAt = $.isPlainObject(spike) && $.isNumeric(options.spike.stopAt) ? options.spike.stopAt : "";
                } else {
                    type = $.isString(options) && (options === "number" || options === "string") ? options : type;
                    length = $.isNumeric(options) ? options : length;
                    includeSpecialChars = (type === "string") ? ($.isBoolean(options) ? options : ($.isBoolean(isfloatOrSpecialCharacter) ? isfloatOrSpecialCharacter : includeSpecialChars)) : includeSpecialChars;
                    isFloat = (type === "number") ? ($.isBoolean(options) ? options : ($.isBoolean(isfloatOrSpecialCharacter) ? isfloatOrSpecialCharacter : isFloat)) : isFloat;
                }

                charSet = (type ===  "string") ?  alphaCharSet : (!includeSpecialChars && type === "mix" ? charSet.split(/[\_\+\!]/g).join("") : charSet);

                var result, i;
                if(type === "number"){
                    result = [];
                    if (length === 1){
                        result = _get_random_numbers(minRange, maxRange, maxSteps, isFloat, decimal, base);
                    } else {
                        var random = base,
                            valueBeforeSpike = "",
                            spikeSteps = 1;

                        if ($.isPlainObject(spike)) {
                            spikeStartAt = $.isNumeric(spikeStartAt) ? spikeStartAt : Math.floor(length / length);
                            spikeStopAt = $.isNumeric(spikeStopAt) ? spikeStopAt : (length + 1);
                            spikeTo = $.isNumeric(spikeTo) ? spikeTo : Math.ceil(maxRange / .70);
                            spikeSteps = $.isNumeric(spike.spikeSteps) ? spike.spikeSteps : spikeSteps;
                        }

                        for (i = 0; i < length; i++){
                            if ($.isPlainObject(spike) && i >= spikeStartAt && i <= spikeStopAt){
                                valueBeforeSpike = !$.isNumeric(valueBeforeSpike) ? random : valueBeforeSpike;
                                random = (random >= spikeTo) ? spikeTo : random + Math.ceil((spikeTo - random) / spikeSteps);
                            } else {
                                if ($.isNumeric(valueBeforeSpike)){
                                    random -= Math.ceil(valueBeforeSpike / spikeSteps);
                                    if (valueBeforeSpike >= random){
                                        random = valueBeforeSpike;
                                        valueBeforeSpike = "";
                                    }
                                } else {
                                    base = random;
                                    random = _get_random_numbers(minRange, maxRange, maxSteps, isFloat, decimal, base);
                                }
                            }

                            result.push(random);
                        }
                    }
                }else{
                    result = _get_random_characters(charSet, length);
                }
                return result;
            }
        });

        window.whichAnimationEvent = function(){
            var t,
                el = document.createElement("fakeelement");

            var animations = {
                "animation"      : "animationend",
                "OAnimation"     : "oAnimationEnd",
                "MozAnimation"   : "animationend",
                "WebkitAnimation": "webkitAnimationEnd"
            };

            for (t in animations){
                if (el.style[t] !== undefined){
                    return animations[t];
                }
            }
        };
        window.randomSpark = function(data, _chart_value_, range) {
            data.splice(0, 1);

            if (!$.isNumeric(_chart_value_)) {
                range = $.isArray(range) ? range : ($.isArray(_chart_value_) ? _chart_value_ :[0, 100]);
                var _idx_val_ = data[data.length - 1],
                    _random = $.getRandom({
                        type: "number",
                        length: 1,
                        maxSteps: 30
                    });
                if (_random % 2){
                    _chart_value_= (_idx_val_ + _random) > 500 ? _idx_val_ - _random : _idx_val_ + _random;
                } else {
                    _chart_value_= (_idx_val_ - _random) < 100 ? _idx_val_ + _random : _idx_val_ - _random;
                }
            }

            data.push(_chart_value_);

            return data;
        };
        window.flagClicked = function(cssSelector){
            var clickFixes = $.safeGetCookieObject(cookie.get("clickFixes"));
            clickFixes = $.isArray(clickFixes) ? clickFixes : [];
            var selectorClass = String(cssSelector).replace(/\ *hidden\ */, "").trim();
            if (!$.isInArray(selectorClass, clickFixes)){
                clickFixes.push(selectorClass);
                cookie.set("clickFixes", $.toJSON(clickFixes));
            }
        };
      window.updateNotification = function(count){
            var $notification = $("div.notification");
            var $notification_banner = $notification.find("div.message");
            var $notification_bubble = $notification.find("span.notif-count");

            count = $.isNumeric(count ) ? count : ((parseInt($notification_bubble.html()) || 1) - 1);

            if (count === 0){
                setTimeout(function(){
                    $notification_banner.removeClass("animated shake").fadeOut("slow");
                    $notification_bubble.html("").fadeOut("slow");

                    if ($.isString(cookie.get("newapp"))){
                        var addedApp = $.safeGetCookieObject(cookie.get("addedApp"));
                        addedApp = !$.isArray(addedApp) ? [] : addedApp;
                        addedApp.push(cookie.get("newapp"));
                        cookie.set("addedApp", $.toJSON(addedApp));
                    }

                    cookie.remove("newapp");
                    cookie.remove("notificationCount");
                }, 2000);
            } else {
                setTimeout(function(){
                    $notification_banner.addClass("animated shake").fadeIn();
                    $notification_bubble.html(count).fadeIn();
                    cookie.set("notificationCount", count);
                    cookie.remove("notificationDelay");
                }, parseInt(cookie.get("notificationDelay")) || 0);
            }
        };
        window.checkNewApp = function(options, on_changed){
            var _hide_app_ = $.isString(options) ? options : ($.isPlainObject(options) && $.isString(options.cssSelector) ? options.cssSelector : "");
            var _is_reload_ = $.isBoolean(on_changed) || ($.isPlainObject(options) && $.isBoolean(options.reload) && options.reload === true);
            on_changed = $.isFunction(on_changed) ? on_changed : ($.isPlainObject(options) && $.isFunction(options.onChanged) ? options.onChanged : null);

            if (!$.isString(_hide_app_)){
                trace("Invalid css class selector >>> " + _hide_app_);
                return
            }

            var $el = $(_hide_app_);
            if ($el.length < 1){
                trace("Element with css class >>> \"" + _hide_app_ + "\" was not found!");
                return
            }

            var addedApp = $.safeGetCookieObject(cookie.get("addedApp"));
            addedApp = !$.isArray(addedApp) ? [] : addedApp;

            var newApp = cookie.get("newapp").trim() || "";

            if (!$.isString(newApp) && $.isString(_hide_app_)){
                if (!$.isInArray(_hide_app_, addedApp)){
                    $el.hide();
                }
                cookie.set("notificationCount", 0);
            } else {
                $el.fadeIn();
                cookie.set("notificationCount", parseInt(cookie.get("notificationCount")) || 3);
            }

            updateNotification(parseInt(cookie.get("notificationCount")));

            if (_is_reload_) {
                debug("checkNewApp re-loading for element with css class selector \"" + _hide_app_ + "\"");
            } else {
                $("input[type=file].input-file").on("change", function(e){
                    if (on_changed){
                        on_changed(e, _hide_app_);
                    } else {
                        trace("checkNewApp change event triggered but there is nothing to execute!  Callback method was NOT provided.");
                        debug(e);
                    }
                });
            }
        };
        window.trace = function (arg){
            if (!$.isString(arg)){
                console.log("-----------------------------------------------------------------------------------");
            }
            console.trace($.isString(arg) ? " >> " + arg : arg);
            if (!$.isString(arg)){
                console.log("-----------------------------------------------------------------------------------");
            }
        };
        window.debug = function (arg, is_error){
            is_error = is_error === true ? "error" : "log";
            if (!$.isString(arg)){
                console[is_error]("-----------------------------------------------------------------------------------");
            }
            console.trace($.isString(arg) ? " >> " + arg : arg);
            if (!$.isString(arg)){
                console[is_error]("-----------------------------------------------------------------------------------");
            }
        };
        window.cookie = {
            set: function(cookie_name, cookie_value, expiration_days, callback){
                if(cookie_name && cookie_value){
                    callback = $.isFunction(callback) ? callback : ($.isFunction(expiration_days) ? expiration_days : null);
                    expiration_days = $.isNumeric(expiration_days) ? expiration_days : 7;

                    var d = new Date();
                    d.setTime(d.getTime() + (expiration_days * 24 * 60 * 60 * 1000));
                    var expires = "expires=" + d.toUTCString();
                    document.cookie = encodeURIComponent(cookie_name) + "=" + encodeURIComponent(cookie_value) + "; " + expires;

                    if (callback){
                        callback(cookie.get(cookie_name));
                    } else {
                        return cookie.get(cookie_name);
                    }
                }
            },
            get: function(cookie_name){
                var _cookie_name_ = $.isString(cookie_name) ? (encodeURIComponent(cookie_name) + "=") : "";
                var _cookies__ = (document.cookie ? document.cookie.split(';') : []),
                    _cookies_array_ = [];

                for(var _cookie__ in _cookies__){
                    if (_cookies__.hasOwnProperty(_cookie__)){
                        var _this_cookie_ = String(_cookies__[_cookie__]).trim();
                        if (_cookie_name_ === ""){
                            var _array_split_ = _this_cookie_.split("=");
                            _cookies_array_.push({
                                key: decodeURIComponent(_array_split_[0]),
                                value: decodeURIComponent(_array_split_[1])
                            });
                        } else if (_this_cookie_.indexOf(_cookie_name_) == 0) {
                            return decodeURIComponent(_this_cookie_.substring(_cookie_name_.length, _this_cookie_.length));
                        }
                    }
                }
                return _cookies_array_.length > 0 ? _cookies_array_ : "";
            },
            remove: function(cookie_name){
                if($.isString(cookie_name)){
                    document.cookie = encodeURIComponent(cookie_name) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    return cookie.get(cookie_name)
                }
            },
            removeAll: function(callback){
                callback = $.isFunction(callback) ? callback : null;

                var _cookies__ = cookie.get();

                for (var _c__ in _cookies__){
                    if (_cookies__.hasOwnProperty(_c__)){
                        //noinspection ValidateRequireStatements
                        cookie.remove(decodeURIComponent(_cookies__[_c__].key));
                    }
                }
                if (callback){
                    callback(cookie.get());
                } else {
                    cookie.get();
                }
            }
        };
    }
));