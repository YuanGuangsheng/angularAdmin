'use strict';


var app = angular.module('app', [
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngTouch',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'ui.jq',
    'oc.lazyLoad',
    'pascalprecht.translate',
    "httpService",
    'ui.load',
    'ui.button',
    'ui.table',
    'ui.tree',
    'ui.ms2select'
]);

// config
app.config(
        [        '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
            function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide) {

                // lazy controller, directive and service
                app.controller = $controllerProvider.register;
                app.directive  = $compileProvider.directive;
                app.filter     = $filterProvider.register;
                app.factory    = $provide.factory;
                app.service    = $provide.service;
                app.constant   = $provide.constant;
                app.value      = $provide.value;
            }
        ])
        .config(['$translateProvider', function($translateProvider){
            // Register a loader for the static files
            // So, the module will search missing translation tables under the specified urls.
            // Those urls are [prefix][langKey][suffix].
            $translateProvider.useStaticFilesLoader({
                prefix: 'l10n/',
                suffix: '.json'
            });

            // Tell the module what language to use by default
            $translateProvider.preferredLanguage('zh_cn');
            // Tell the module to store the language in the local storage
            $translateProvider.useLocalStorage();


    }]);

// 翻译快捷方式
var T = {};
// 本地存储快捷方式
var S = {};
angular.module('app')
    .run(['$translate', '$localStorage',
        function ($translate, $localStorage) {
            // 定义翻译快捷方式
            T = function (key) {
                return $translate.instant(key);
            };

            S = $localStorage;
        }
    ]);

// APP数据
var adminApp = {};
// 初始化
adminApp.init = function () {
    this.name = '后台管理系统';
    this.company = 'COMPANY';
    this.version = 'v1.0.0';
    this.copyright = "2017 Copyright";
    this.langs = [
        {key: "zh_cn", name: "中文"},
        {key: "en_us", name: "English"}
    ];
    this.langs.selected = this.langs[0];
    this.color = {
        primary: '#7266ba',
        info: '#23b7e5',
        success: '#27c24c',
        warning: '#fad733',
        danger: '#f05050',
        light: '#e8eff0',
        dark: '#3a3f51',
        black: '#1c2b36'
    };
    this.settings = {
        themeID: 1,
        navbarHeaderColor: 'bg-black',
        navbarCollapseColor: 'bg-white-only',
        asideColor: 'bg-black',
        headerFixed: true,
        asideFixed: true,
        asideFolded: false,
        asideDock: false,
        container: false
    };
    this.themes = [
        {"id": 1, 'navbarHeaderColor': 'bg-black', "navbarCollapseColor": 'bg-white-only', "asideColor": 'bg-black'},
        {"id": 2, 'navbarHeaderColor': 'bg-dark', "navbarCollapseColor": 'bg-white-only', "asideColor": 'bg-dark'},
        {
            "id": 3,
            'navbarHeaderColor': 'bg-white-only',
            "navbarCollapseColor": 'bg-white-only',
            "asideColor": 'bg-black'
        },
        {"id": 4, 'navbarHeaderColor': 'bg-primary', "navbarCollapseColor": 'bg-white', "asideColor": 'bg-dark'},
        {"id": 5, 'navbarHeaderColor': 'bg-info', "navbarCollapseColor": 'bg-white', "asideColor": 'bg-black'},
        {"id": 6, 'navbarHeaderColor': 'bg-success', "navbarCollapseColor": 'bg-white', "asideColor": 'bg-dark'},
        {"id": 7, 'navbarHeaderColor': 'bg-danger', "navbarCollapseColor": 'bg-white', "asideColor": 'bg-dark'},
        {"id": 8, 'navbarHeaderColor': 'bg-black', "navbarCollapseColor": 'bg-black', "asideColor": 'bg-white'},
        {"id": 9, 'navbarHeaderColor': 'bg-dark', "navbarCollapseColor": 'bg-dark', "asideColor": 'bg-light'},
        {"id": 10, 'navbarHeaderColor': 'bg-info', "navbarCollapseColor": 'bg-info', "asideColor": 'bg-light'},
        {"id": 11, 'navbarHeaderColor': 'bg-primary', "navbarCollapseColor": 'bg-primary', "asideColor": 'bg-dark'},
        {"id": 12, 'navbarHeaderColor': 'bg-info', "navbarCollapseColor": 'bg-info', "asideColor": 'bg-black'},
        {"id": 13, 'navbarHeaderColor': 'bg-success', "navbarCollapseColor": 'bg-success', "asideColor": 'bg-dark'},
        {"id": 14, 'navbarHeaderColor': 'bg-danger', "navbarCollapseColor": 'bg-danger', "asideColor": 'bg-dark'}

    ];
};
// 设置语言
adminApp.setLang = function (langKey) {
    for (var i in adminApp.langs) {
        var lang = adminApp.langs[i];
        if (lang.key == langKey) {
            adminApp.langs.selected = lang;
            break;
        }
    }
};
adminApp.init();

// Session数据
var session = {};
// 初始化
session.init = function () {
    this.login = false;
    this.admin = {
        "id": 0,
        "name": "未登录",
        "icon": "img/default_icon.png",
        "avatar": "img/default_admin_avatar.jpg",
        "is_admin": false
    };
    this.menus = [];
    this.shortcut = [];
};
// 设置数据
session.setData = function (data) {
    if (data.language != null) {
        adminApp.setLang(data.language);
    }
    if (data.admin != undefined) {
        this.admin = data.admin;
    }
    if (data.shortcut != undefined) {
        this.shortcut = data.shortcut;
    }
    if (data.menus != undefined) {
        this.menus = data.menus;
    }
};
// 校验是否有权限
session.checkAuth = function (auth) {
    if (auth == "" || auth == null || auth == undefined) {
        return true;
    }
    if (this.admin.is_admin == 1) {
        return true;
    }
    return false;
};

session.init();