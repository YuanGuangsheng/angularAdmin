angular.module('ui.table', []).
    service('uiTable', ['$document', '$q', '$timeout', 'httpService', function ($document, $q, $timeout, httpService) {
        this.config = function (el, options) {
            this.el = el;
            this.$el = $(el);
            this.options = options;
            this.params = {};
            this.conf = {
                page: 1,
                size: 10,
                sort: {}
            };
            this.listening = false;
            this.button_fn = [];

            // 渲染
            this.render = function () {
                var that = this;

                function doing() {
                    var table = that._createTable();

                    if (that.listening == true) {
                        that.$el.html(table);
                        return;
                    }

                    that.listening = true;

                    that.$el.html(table)
                        .off('click', 'tr .table_action')
                        .on('click', 'tr .table_action', function (e) {
                            var index = $(this).index()
                                , tr = $(this).parents('tr')
                                , i = tr.index()
                                , obj = that.getRecord(i);

                            that.button_fn[index] && that.button_fn[index](obj, tr, that);
                        })
                        .off('click', '#Pagination li a')
                        .on('click', '#Pagination li a', function (e) {
                            e.preventDefault();
                            var i = $(this).attr('page');
                            that.changePage(i);
                        })
                        .on('change', '#sizeSelect', function (e) {
                            e.preventDefault();
                            var size = $(this).children("option:selected").val();
                            that.changeSize(size);
                        })
                        .off('click', 'th')
                        .on('click', 'th', function (e) {
                            if ($(this).attr('data') == undefined) {
                                return;
                            }

                            e.preventDefault();

                            var field = $(this).attr('data');

                            if ($.inArray(field, that.sorts) == -1) {
                                return;
                            }

                            if ($(this).hasClass("sorting")) {
                                $(this).removeClass("sorting");
                                $(this).addClass('sorting_asc');
                                that.changeSort(field, "asc");
                            } else if ($(this).hasClass("sorting_asc")) {
                                $(this).removeClass("sorting_asc");
                                $(this).addClass('sorting_desc');
                                that.changeSort(field, "desc");
                            } else {
                                $(this).removeClass("sorting_desc");
                                $(this).addClass('sorting');
                                that.changeSort(field, "none");
                            }
                        })
                        .on('change', '.table_check_all', function (e) {
                            var checked = $(this).is(":checked");
                            $(".table_check").each(function (i) {
                                this.checked = checked;
                            })
                        })
                        .off('click', 'tbody tr')
                        .on('click', 'tbody tr', function () {
                            var check = $(this).find(".table_check");
                            var checked = check.is(":checked");
                            $(this).find(".table_check").each(function () {
                                this.checked = !checked;
                            });
                        });
                }

                var promise = this._getData();

                promise.then(function (result) {
                    that.data = result;

                    doing();
                });

                return that;
            };

            // 设置请求参数
            this.setParams = function (params) {
                this.params = params;
                return this;
            };

            // 设置配置
            this.setConf = function (name, value) {
                this.conf[name] = value;
                return this;
            };

            // 获取数据
            this.getData = function () {
                return this.data;
            };

            // 获取记录
            this.getRecord = function (i) {
                return this.data.list[i];
            };

            // 改变页数并刷新
            this.changePage = function (page) {
                this.setConf('page', parseInt(page));
                this.render();
            };

            // 改变大小并刷新
            this.changeSize = function (size) {
                this.setConf('page', 1);
                this.setConf('size', parseInt(size));
                this.render();
            };

            // 改变排序
            this.changeSort = function (field, sort) {
                this.data = null;
                if (sort == "none" && this.conf.sort[field] != undefined) {
                    delete this.conf.sort[field];
                } else {
                    this.conf.sort[field] = sort;
                }
                this.render();
            };

            // 多选操作
            this.multi = function (callback) {
                var ids = [];
                $('.table_check').each(function (i) {
                    if (this.checked) {
                        ids.push(this.value);
                    }
                });
                if (ids.length == 0) {
                    view.alert(T('tips.NOT_SELECT_RECORD'));
                    return;
                }
                callback(ids);
            };

            // 初始化
            this._init = function (options) {
                this.conf = $.extend(this.conf, options['conf'] || []); // 配置
                this.data = options['data'] || null; // 数据
                this.buttons = options['buttons'] || []; // 按钮
                this.fields = options['fields'] || []; // 字段
                this.sorts = options['sorts'] || []; // 排序字段
                this.hide_id = options['hide_id'] || false; // 隐藏ID字段
                this.hide_check = options['hide_check'] || false; // 隐藏复选框
                this.format = options['format'] || null; // 预处理回调
            };

            // 获取数据
            this._getData = function () {
                var deferred = $q.defer();

                httpService.post(this.conf.url, $.extend({}, this.params, this.conf))
                    .then(function (result) {
                        deferred.resolve(result.data);
                    }, function (x) {
                        deferred.reject(x);
                    });

                return deferred.promise;
            };

            // 创建表格头部
            this._createTable = function () {
                var table = '<div class="table-responsive"><table class="table table-bordered table-hover table-striped">';

                table += this._createHead();
                table += this._createBody();

                table += "</table></div>";

                table += this._createPageList();

                return table;
            };

            // 创建表格头部
            this._createHead = function () {
                var head = '<thead><tr>';

                if (this.fields.id != undefined && this.hide_check != true) {
                    head += '<th style="width:20px;">' +
                        '<label class="i-checks m-b-none">' +
                        '<input type="checkbox" class="table_check_all">' +
                        '<i></i></label></th>'
                }

                if (this.buttons.length > 0) {
                    head += '<th>' + T("page.OPERATION") + '</th>';
                }

                for (var i in this.fields) {
                    if(i == "id" && this.hide_id == true) {
                        continue;
                    }

                    var field = this.fields[i];

                    if ($.inArray(i, this.sorts) == -1) {
                        head += '<th data="' + i + '">' + T(field) + '</th>';
                    } else {
                        if (this.conf.sort[i] == undefined) {
                            head += '<th data="' + i + '" class="sorting">' + T(field) + '</th>';
                        } else if (this.conf.sort[i] == 'asc') {
                            head += '<th data="' + i + '" class="sorting_asc">' + T(field) + '</th>';
                        } else {
                            head += '<th data="' + i + '" class="sorting_desc">' + T(field) + '</th>';
                        }
                    }
                }

                head += '</tr></thead>';

                return head;
            };

            // 创建表格实体
            this._createBody = function () {
                var body = '<tbody>';

                var tpl = '<tr>';

                if (this.fields.id != undefined && this.hide_check != true) {
                    tpl += '<td><label class="i-checks m-b-none"><input class="table_check" name="ids[]" value="%{id}%" type="checkbox"><i></i></label>'
                }

                if (this.buttons.length > 0) {
                    tpl += '<td>';

                    for (var i in this.buttons) {
                        var button = this.buttons[i];

                        if (session.checkAuth(button.action) == false) {
                            continue;
                        }

                        if (button.icon == undefined) {
                            button.icon = "glyphicon glyphicon-edit";
                        }

                        tpl += '<i class="table_action ' + button.icon + '" style="margin-right:2px;" title="' + T(button.text) + '"></i> ';

                        this.button_fn.push(button['fn']);
                    }

                    tpl += '</td>';
                }

                for (var i in this.fields) {
                    if(i == "id" && this.hide_id == true) {
                        continue;
                    }

                    tpl += '<td>%{' + i + '}%</td>'
                }

                tpl += '</tr>';

                for (var i in this.data.list) {
                    var obj = this.data.list[i];
                    if (this.format) {
                        this.format(obj, this, i);
                    }

                    if(i+1 < this.buttons.length || this.data.list.length - i > this.buttons.length) {
                        body += this._setValue(tpl.replace("dropup", ""), obj);
                    } else {
                        body += this._setValue(tpl, obj);
                    }
                }

                body += '</tbody>';

                return body;
            };

            // 创建表格分页
            this._createPageList = function () {
                // 没有数据，不显示分页
                if (this.data.list == undefined || this.data.list.length == 0) {
                    return "";
                }

                this.conf.page = this.conf.page > 0 ? this.conf.page : 1;
                this.conf.size = this.conf.size > 0 ? this.conf.size : 10;
                this.data.total = this.data.total >= 0 ? this.data.total : 0;

                var pageData = {
                    page: this.conf.page || 1, // 当前页
                    size: this.conf.size || 10, // 每页显示数量
                    total: this.data.total || 0, // 总共记录
                    count: 0, // 当前页记录
                    start: (this.conf.page - 1) * this.conf.size + 1, // 开始编号
                    end: this.conf.page * this.conf.size, // 结束编号,
                    page_total: Math.ceil(this.data.total / this.conf.size) // 总页数
                };

                pageData.count = this.data.list != undefined ? this.data.list.length : 0;
                pageData.end = pageData.end >= pageData.start + pageData.count ? pageData.start + pageData.count - 1 : pageData.end;
                pageData.total = pageData.total >= pageData.count ? pageData.total : pageData.count;
                pageData.page_total = pageData.page_total > 0 ? pageData.page_total : 1;

                // 底部分页条
                var page_size_list = [10, 25, 50, 100];
                var pageList = '<div class="row">' +
                    '<div class="col-sm-3 hidden-xs">' +
                    '<select class="input-xs form-control w-xs inline v-middle" id="sizeSelect">';

                for (var i in page_size_list) {
                    var size = page_size_list[i];
                    if (size == this.conf.size) {
                        pageList += '<option value="' + size + '" selected>' + size + '</option>';
                    } else {
                        pageList += '<option value="' + size + '">' + size + '</option>';
                    }
                }

                pageList += '</select></div>';


                // 分页条
                var step = 3; // 分页步伐大小

                var pageStr = '<div class="col-sm-6 text-center text-center-xs">' +
                    '<ul class="pagination pagination-md m-t-none m-b-none" id="Pagination">';

                // 显示上一页和首页
                if (pageData.page > step + 1) {
                    pageStr += '<li><a href="javascript:void(0);" page="1">' + T("page.FIRST") + '</a></li>';

                    var prevPage = pageData.page - 1 > 0 ? pageData.page - 1 : 1;
                    pageStr += '<li><a href="javascript:void(0);" page="' + prevPage + '"><i class="fa fa-chevron-left"></i></a></li>';
                }


                // 显示中间页码
                var step_start = pageData.page - step > 0 ? pageData.page - step : 1;
                var step_end = pageData.page + step <= pageData.page_total ? pageData.page + step : pageData.page_total;

                for (i = step_start; i <= step_end; i++) {
                    if (i == pageData.page) {
                        pageStr += '<li class="active"><a href="javascript:void(0);" page="' + i + '">' + i + '</a></li>'
                    } else {
                        pageStr += '<li><a href="javascript:void(0);" page="' + i + '">' + i + '</a></li>'
                    }
                }

                // 显示下一页和尾页
                if (pageData.page_total > pageData.page + step) {
                    var nextPage = pageData.page + 1 <= pageData.page_total ? pageData.page + 1 : pageData.page_total;
                    pageStr += '<li><a href="javascript:void(0);" page="' + nextPage + '"><i class="fa fa-chevron-right"></i></a></li>';
                    pageStr += '<li><a href="javascript:void(0);" page="' + pageData.page_total + '">' + T("page.LAST") + '</a></li>';
                }

                pageStr += '</ul></div>';

                pageList += pageStr;

                pageList += this._setValue('<div class="col-sm-3 text-right text-center-xs">' +
                    '<small class="text-muted inline m-t-sm m-b-sm">' + T("page.STR") + '</small>' +
                    '</div>', pageData);

                pageList += '</div>';

                return pageList;
            };

            // 模板设值
            this._setValue = function () {
                var args = arguments;
                return args[0].replace(/%\{(.*?)}%/g, function (match, prop) {
                    return function (obj, props) {
                        // /\d+/ 会过滤掉带有数字对象属性
                        var prop = /\W+/.test(props[0]) ? parseInt(props[0]) : props[0];
                        if (props.length > 1) {
                            return arguments.callee((obj[prop] || {}), props.slice(1));
                        } else {
                            if (obj != null) {
                                return (obj[prop] != undefined || obj[prop] != null) ? obj[prop] : '';
                            }

                        }
                    }(typeof args[1] === 'object' ? args[1] : args, prop.split(/\.|\[|\]\[|\]\./));
                });
            };

            // 初始化
            this._init(options);

            return this;
        };
    }]);