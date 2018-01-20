/**
 * Created by myzhang on 2016/12/7.
 */

angular.module("app")
    .directive('laydate', function() {
        return {
            require: '?ngModel',
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            link: function(scope, element, attr, ngModel) {
                var _date = null,_config={};

                // 初始化参数
                _config = {
                    elem: '#' + attr.id,
                    format: attr.format != undefined && attr.format != '' ? attr.format : 'YYYY-MM-DD hh:mm:ss',
                    max:attr.hasOwnProperty('maxDate')?attr.maxDate:'',
                    min:attr.hasOwnProperty('minDate')?attr.minDate:'',
                    choose: function(data) {
                        scope.$apply(setViewValue);
                    },
                    clear:function(){
                        ngModel.$setViewValue(null);
                    }
                };

                _config.istime = _config.format.indexOf('s') >= 0 ? true: false;

                // 初始化
                _date= laydate(_config);


                // 模型值同步到视图上
                ngModel.$render = function() {
                    element.val(ngModel.$viewValue || '');
                };

                // 监听元素上的事件
                element.on('click', function() {
                    scope.$apply(setViewValue);
                });

                setViewValue();

                // 更新模型上的视图值
                function setViewValue() {
                    var val = element.val();
                    ngModel.$setViewValue(val);
                }
            }
        }
    });