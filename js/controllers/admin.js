// 个人设置
app.controller('settingCtrl', ['$scope', 'httpService', '$http', 'FileUploader', function ($scope, httpService, $http, FileUploader) {
    $scope.myImage='';
    $scope.myCroppedImage='';
    $scope.cropType="circle";

    // 设置主题
    $scope.setTheme = function (theme_id) {
        for (var i in adminApp.themes) {
            var theme = adminApp.themes[i];
            if (theme.id == theme_id) {
                adminApp.settings.navbarHeaderColor = theme.navbarHeaderColor;
                adminApp.settings.navbarCollapseColor = theme.navbarCollapseColor;
                adminApp.settings.asideColor = theme.asideColor;
                break;
            }
        }
    };

    var handleFileSelect=function(evt) {
        var file=evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function($scope){
                $scope.myImage=evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

    $scope.save = function () {
        var uploader = new FileUploader({
            url: 'data/admin/setting.json'
        });

        uploader.onErrorItem = function (fileItem, response, status, headers) {
            view.close_loading();
            view.alert(T("tips.ERROR"));
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            view.close_loading();
            if (response.status != 0) {
                view.alert(response.msg);
            } else {
                view.alert(T("tips.SUCCESS"));
            }
        };

        var file = utils.base64ToBlob($scope.myCroppedImage.replace('data:image/png;base64,', ''), 'image/jpeg');

        uploader.addToQueue(file);

        view.loading();

        uploader.uploadAll();
    }
}]);

// 修改密码
app.controller('EditPwdCtrl', ['$scope', 'httpService', '$state', function ($scope, httpService, $state) {
    $scope.save = function () {
        if($scope.user.new_password != $scope.user.confirm_password) {
            view.alert(T("header.editPwd.PASSWORD_NOT_MATCH"));
            return;
        }
        httpService.post('data/admin/edit_pwd.json', {
            old_pwd : $scope.user.old_password,
            new_pwd : $scope.user.new_password,
            confirm_pwd : $scope.user.confirm_password
        }).then(function () {
            view.alert(T("tips.SUCCESS"), function () {
                httpService.post('data/auth/logout.json').then(function () {
                    session.init();
                    $state.go("login");
                });
            });
        })
    }
}]);