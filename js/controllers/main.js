'use strict';

// 首页
app.controller('IndexCtrl', ['$scope', '$translate', '$window', "httpService",
    function ($scope, $translate, $window, httpService) {
        app.value("session", session);
        $scope.session = session;

        app.value("app", adminApp);
        $scope.app = adminApp;

        // 保存设置到localStorage
        if (angular.isDefined(S.settings)) {
            $scope.app.settings = S.settings;
        } else {
            S.settings = $scope.app.settings;
        }

        // 监听设置改变
        $scope.$watch('app.settings', function () {
            if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
                // aside dock and fixed must set the header fixed.
                $scope.app.settings.headerFixed = true;
            }
            // save to local storage
            S.settings = $scope.app.settings;
        }, true);

        // 保存用户信息到localStorage
        if (angular.isDefined(S.admin)) {
            $scope.session.admin = S.admin;
        } else {
            S.admin = $scope.session.admin;
        }

        // 监听用户信息改变
        $scope.$watch('session.admin', function () {
            S.admin = $scope.session.admin;
        }, true);

        // 设置默认语言
        adminApp.setLang($translate.proposedLanguage() || "zh_cn");

        // 设置语言
        $scope.setLang = function (langKey) {
            httpService.post("data/admin/lang.json", {language: langKey})
                .then(function () {
                    window.location.reload();
                });
        };

        // add 'ie' classes to html
        var isIE = !!navigator.userAgent.match(/MSIE/i);
        isIE && angular.element($window.document.body).addClass('ie');
        isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

        function isSmartDevice($window) {
            // Adapted from http://www.detectmobilebrowsers.com
            var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }

    }]);

// 框架
app.controller('AppCtrl', ['$scope', 'httpService', '$state', '$translate',
    function ($scope, httpService, $state, $translate) {
    var render = function (data) {
        session.login = true;

        session.setData(data);

        // 设置语言
        $translate.use(adminApp.langs.selected.key);

        // 判断是否锁屏
        if(data.lock == true) {
            return $state.go("lock");
        }
    };

    // 注销登录
    $scope.logout = function () {
        view.confirm(T("tips.EXIT"), function () {
            httpService.post('data/auth/logout.json').then(function () {
                session.init();
                $state.go("login");
            });
        });
    };

    // 锁屏
    $scope.lock = function () {
        httpService.post('data/auth/lock.json').then(function () {
            $state.go("lock");
        });
    };

    // 进入
    httpService.post('data/admin/enter.json', {}, {
        alertError: false
    }).then(function (result) {
        render(result.data);
    });
}]);

// 主页
app.controller('HomeCtrl', ['$scope', 'httpService', '$state', function ($scope, httpService, $state) {
    $scope.d0_1 = [];
    $scope.d0_2 = [];
    $scope.d4 = [];

    $scope.d0_1 = [[0, 7], [1, 6.5], [2, 12.5], [3, 7], [4, 9], [5, 6], [6, 11], [7, 6.5], [8, 8], [9, 7]];

    $scope.d0_2 = [[0, 4], [1, 4.5], [2, 7], [3, 4.5], [4, 3], [5, 3.5], [6, 6], [7, 3], [8, 4], [9, 3]];

    $scope.getRandomData = function () {
        var data = [],
            totalPoints = 150;
        if (data.length > 0)
            data = data.slice(1);
        while (data.length < totalPoints) {
            var prev = data.length > 0 ? data[data.length - 1] : 50,
                y = prev + Math.random() * 10 - 5;
            if (y < 0) {
                y = 0;
            } else if (y > 100) {
                y = 100;
            }
            data.push(y);
        }
        // Zip the generated y values with the x values
        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]])
        }
        return res;
    };

    $scope.d4 = $scope.getRandomData();


    httpService.post('data/admin/recent_log.json', {}, {
        loading: false,
        alertError: false
    })
        .then(function (result) {
            $scope.recent_log = result.data;
        }
    );

}]);

// 登录
app.controller('LoginCtrl', ['$scope', 'httpService', '$state', '$translate',
    function ($scope, httpService, $state, $translate) {
        $(".app").css("height", "100%");

        if (session.login == true) {
            $state.go('app.home');
        }

        $scope.user = {
            is_oa: true
        };

        // 保存设置到localStorage
        if (angular.isDefined(S.is_oa)) {
            $scope.user.is_oa = S.is_oa;
        } else {
            S.is_oa = $scope.user.is_oa;
        }

        $scope.show_vcode = false;
        $scope.authError = null;
        $scope.login = function () {
            $scope.authError = null;
            httpService.post('data/auth/login.json', {
                email: $scope.user.email,
                password: $scope.user.password,
                language: adminApp.langs.selected.key,
                remember: $scope.user.remember,
                vcode: $scope.user.vcode
            }, {
                alertError: false
            }).then(function () {
                S.is_oa = $scope.user.is_oa;
                session.login = true;
                $translate.use(adminApp.langs.selected.key);
                $state.go('app.home');
            }, function (result) {
                var error = result;
                if (result.msg != undefined) {
                    error = result.msg;
                }
                $scope.authError = error;

                // 显示验证码
                if (result.status == 5) {
                    $scope.refresh_captcha();
                    $scope.show_vcode = true;
                }
            });
        };

        $scope.$watch("app.langs.selected", function() {
            $translate.use(adminApp.langs.selected.key);
        });

        $scope.refresh_captcha = function () {
            var url = "captcha/" + Math.random();
            $("#captcha").attr("src", url);
        }

    }]);

// 锁屏
app.controller('LockCtrl', ['$scope', 'httpService', '$state',
    function ($scope, httpService, $state) {
        $scope.Unlock = function() {
            httpService.post('data/auth/unlock.json', {
                "password" : $scope.admin.password
            }).then(function () {
                $state.go("app.home");
            });
        }
    }]);