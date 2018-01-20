'use strict';

/**
 * Config for the router
 */
angular.module('app')
    .run(['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ])
    .config(['$stateProvider', '$urlRouterProvider', 'JQ_CONFIG',
        function ($stateProvider, $urlRouterProvider, JQ_CONFIG) {
            $urlRouterProvider.otherwise('/app/home');

            $stateProvider
                .state('app', {
                    abstract: true,
                    url: '/app',
                    templateUrl: 'tpl/app.html',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load('ui.select');
                            }]
                    }
                })
                .state('app.home', {url: '/home', templateUrl: 'tpl/home.html'})
                // 登录
                .state('login', {
                    url: '/login',
                    templateUrl: 'tpl/login.html',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load('ui.select');
                            }]
                    }
                })
                // 锁屏
                .state('lock', {url: '/lock',templateUrl: 'tpl/lock.html'})
                // 用户操作
                .state('app.admin', {
                    abstract: true,
                    url: '/admin',
                    template: '<div ui-view class="fade-in"></div>',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load(['js/controllers/admin.js']);
                            }]
                    }
                })
                // 个人设置
                .state('app.admin.setting', {
                    url: '/setting',
                    templateUrl: 'tpl/admin/setting.html',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad){
                                return $ocLazyLoad.load(['ngImgCrop', 'angularFileUpload']);
                        }]
                    }
                })
                // 修改密码
                .state("app.admin.edit_pwd", {url: "/edit_pwd", templateUrl: 'tpl/admin/edit_pwd.html'})
                // 新闻管理
                .state('app.news', {
                    abstract: true,
                    url: '/news',
                    template: '<div ui-view class="fade-in"></div>',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load(['js/controllers/news.js']);
                            }]
                    }
                })
                .state('app.news.list', {url: '/list', templateUrl: 'tpl/news/list.html'})
                .state('app.news.add_news', {url: '/add_news', templateUrl: 'tpl/news/add_news.html'})
        }
    ]);