import qs from 'qs';

function getRandom() {
    return Math.floor(Math.random() * Math.pow(10, 12)) + 1;
}

// var cid = getRandom();

function buildParams(params) {
    // var result = [];
    //
    //
    //
    // for (var i in params) {
    //     result.push(encodeURIComponent(i) + '=' + encodeURIComponent(params[i]));
    // }

    const newParams = qs.stringify(params, { arrayFormat: 'repeat' });
    return newParams;
}

export default function jsonpAdapter(config) {
    return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        var src = config.url;

        if (config.params) {
            var params = buildParams(config.params);

            if (params) {
                src += (src.indexOf('?') >= 0 ? '&' : '?') + params;
            }
        }

        script.async = true;

        function remove() {
            if (script) {
                script.onload =
                    script.onreadystatechange =
                    script.onerror =
                        null;

                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }

                script = null;
            }
        }

        var jsonp = 'axiosJsonpCallback_' + getRandom();
        var old = window[jsonp];
        var isAbort = false;

        window[jsonp] = function (responseData) {
            window[jsonp] = old;

            if (isAbort) {
                return;
            }

            var response = {
                data: responseData,
                status: 200,
            };

            resolve(response);
        };

        var additionalParams = {
            _: new Date().getTime(),
        };

        additionalParams[config.callbackParamName || 'callback'] = jsonp;

        src +=
            (src.indexOf('?') >= 0 ? '&' : '?') + buildParams(additionalParams);

        script.onload = script.onreadystatechange = function () {
            if (
                !script.readyState ||
                /loaded|complete/.test(script.readyState)
            ) {
                remove();
            }
        };

        script.onerror = function (e) {
            remove();
            console.log('Network error in jsonP', e);
            reject(new Error('Network Error'));
        };

        if (config.cancelToken) {
            config.cancelToken.promise.then(function (cancel) {
                if (!script) {
                    return;
                }

                isAbort = true;

                reject(cancel);
            });
        }

        script.src = src;

        document.head.appendChild(script);
    });
}
