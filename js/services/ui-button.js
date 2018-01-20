angular.module('ui.button', []).
    service('uiButton', ['$document', '$q', '$timeout', '$translate', function ($document, $q, $timeout, $translate) {
        var config = {
            "add": ["btn-info", "fa fa-plus", "button.ADD"],
            "edit": ["btn-info", "fa fa-edit", "button.EDIT"],
            "delete": ["btn-warning", "fa fa-trash", "button.DELETE"],
            "view": ["btn-info", "fa fa-list", "button.VIEW"],
            "sync": ["btn-info", "fa fa-repeat", "button.SYNC"],
            "query": ["btn-info", "fa fa-search", "button.QUERY"],
            "search": ["btn-info", "fa fa-search", "button.SEARCH"],
            "reply": ["btn-info", "fa fa-search", "button.REPLY"],
            "edit_icon": ["btn-info", "fa fa-edit", "menu.action.EDIT_ICON"]
        };

        this.sm = function (type) {
            var btn_args = config[type];

            if (btn_args == undefined) {
                btn_args = ["btn-info", "fa fa-info", "button.OPERATOR"]
            }

            return '<button class="btn btn-sm ' + btn_args[0] + '"><i class="' +
                btn_args[1] + '"></i> ' + $translate.instant(btn_args[2]) + '</button>';
        };

        return this;
    }]);