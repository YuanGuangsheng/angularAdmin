app.controller('NewsListCtrl', ['$scope', 'httpService', '$state', 'uiTable', function ($scope, httpService, $state, uiTable) {
    var table = uiTable.config("#table", {
        "conf": {
            url: "data/news/list.json",
            sort: {
                created_at: "desc"
            }
        },
        "fields": {
            id: "ID",
            created_at: 'model.news.CREATED_AT',
            title: 'model.news.TITLE',
            content: 'model.news.CONTENT',
            author: 'model.news.AUTHOR'
        },
        "sorts": ["id", "created_at", "name", "content", "author"],
        "buttons": [
            {
                text: "button.VIEW", icon: 'glyphicon glyphicon-zoom-in', fn: function (obj) {
                view.alert(obj.content);
            }
            }
        ]
    }).render();
}]);

// 添加新闻
app.controller('NewsAddCtrl', ['$scope', 'httpService', '$state', '$stateParams', function ($scope, httpService, $state, $stateParams) {
    $scope.news = {};

    $scope.save = function () {
        httpService.post("data/news/add.json", {
            id: $scope.news.id,
            title: $scope.news.title,
            content: $scope.news.content,
            author: $scope.news.author,
            created_at: $scope.news.created_at,
        }).then(function () {
            view.alert(T('tips.SUCCESS'), function () {
                $state.go("app.news.list");
            });
        })
    }
}]);
