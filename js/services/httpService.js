angular.module('httpService', []).
    service('httpService', ['$document', '$q', '$timeout', '$http', '$state', function ($document, $q, $timeout, $http, $state) {
        this.post = function (url, params, opt) {
            var deferred = $q.defer();

            url = "/angularAdmin/data" + url + ".json";

            console.log(url);

            opt = opt || {};

            var loading = opt['loading'] == undefined ? true : opt['loading'];
            if (loading == true) {
                view.loading();
            }

            var alertError = opt['alertError'] == undefined ? true : opt['alertError'];

            $http.post(url, params).then(function (res) {
                if (loading == true) {
                    view.close_loading();
                }

                var result = res.data;

                if (result.status == 0) {
                    deferred.resolve(result);
                } else {
                    switch (result.status) {
                        case 1:
                            // 普通错误
                            if (alertError == true) {
                                view.alert(result.msg);
                            }
                            deferred.reject(result);
                            break;
                        case 2:
                            // 未登录
                            if (alertError == true) {
                                view.alert(result.msg);
                            }
                            session.init();
                            $state.go("login");
                            break;
                        case 4:
                            // 权限不足
                            if (alertError == true) {
                                view.alert(result.msg);
                            }
                            deferred.reject(result);
                            break;
                        default:
                            // 其他错误
                            if (alertError == true) {
                                view.alert(result.msg);
                            }
                            deferred.reject(result);
                    }
                }

            }, function (x) {
                if (loading == true) {
                    view.close_loading();
                }

                if (alertError == true) {
                    view.alert(T("tips.SYSTEM_ERROR"));
                }

                deferred.reject(T("tips.SYSTEM_ERROR"));
            });

            return deferred.promise;
        };
    }]);