angular.module('ui.tree', []).
    service('uiTree', ['$document', '$q', '$timeout', function ($document, $q, $timeout) {
        this.config = function (el, data, options) {
            this.el = el;
            this.$el = $(el);
            this.data = data;
            this.map = [];
            this.options = options;
            this._html = $('<ul class="list-group"></ul>');

            // 渲染
            this.render = function () {
                var that = this;

                this.$el.addClass("ui-tree");

                this.tree = this._buildTree(this._html, this.data, 0, -1);

                this.$el.html(this._html)
                    .off("click", ".expand-icon")
                    .on("click", ".expand-icon", $.proxy(that.toggleNodeExpanded, that))
                    .off("click", ".check-icon")
                    .on("click", ".check-icon", $.proxy(that.toggleNodeChecked, that));
            };

            // 获取选中的Tags
            this.getCheckTags = function() {
                var tags = [];
                for(var i in this.map) {
                    var node = this.map[i];
                    if(node.state.checked > 0) {
                        tags.push(i);
                    }
                }

                return tags;
            };

            // 创建树
            this._buildTree = function (_html, data, level, parent) {
                for (var i in data) {
                    var node = data[i];

                    node.parent = parent;
                    node.level = level;
                    node.html = this._buildNodeHtml(node, level);

                    _html.append(node.html);

                    this._refreshNodeState(node);

                    this.map[node.tags] = node;

                    if (node['nodes'] != undefined) {
                        this._buildTree(_html, node['nodes'], level + 1, node.tags);
                    } else {
                        this._removeNodeExpanded(node);
                        this._cascadeUpChecked(node);
                    }
                }
            };

            // 创建节点
            this._buildNodeHtml = function (item, level) {
                var node_html = '<li class="list-group-item ui-tree-node node-checked" node-id="' + item.tags + '">';

                for (var i = 0; i < level; i++) {
                    node_html += '<span class="indent"></span>';
                }

                node_html += '<span class="icon expand-icon fa fa-plus-square"></span>';
                node_html += '<span class="icon check-icon fa fa-square-o"></span>';

                node_html += item['text'];

                node_html += '</li>';

                var node = $(node_html);

                if (level != 0) {
                    node.hide();
                }

                return node;
            };

            // 获取节点
            this.getNode = function (node_id) {
                return this.map[node_id];
            };

            // 展开关闭操作
            this.toggleNodeExpanded = function (event) {
                event.preventDefault();

                var target = $(event.target);

                var node = this._findTargetNode(target);

                if (node == undefined) {
                    return;
                }

                node.state.expanded = !node.state.expanded;

                this._nodeExpanded(node);

                this._cascadeDownExpanded(node)
            };

            // 选中取消操作
            this.toggleNodeChecked = function (event) {
                event.preventDefault();

                var target = $(event.target);

                var node = this._findTargetNode(target);

                if (node == undefined) {
                    return;
                }

                if (node.state.checked == 1) {
                    node.state.checked = 0;
                } else {
                    node.state.checked = 1
                }

                this._nodeChecked(node);

                this._cascadeUpChecked(node);

                this._cascadeDownChecked(node);
            };

            // 向上的级联选中
            this._cascadeUpChecked = function (node) {
                if (node.parent == -1) {
                    return;
                }

                var parent = this.getNode(node.parent);

                this._parentChecked(parent);

                this._cascadeUpChecked(parent);
            };

            // 设置父级的选取状态
            this._parentChecked = function (parent) {
                var check_count = 0;
                var check_half_count = 0;
                for (var i in parent.nodes) {
                    var child = parent.nodes[i];
                    if (child.state == undefined) {
                        continue;
                    }

                    if (child.state.checked == 1) {
                        check_count++;
                    }
                    if (child.state.checked == 2) {
                        check_half_count++;
                    }
                }

                if (check_half_count > 0) {
                    parent.state.checked = 2;
                } else if (check_count == parent.nodes.length) {
                    parent.state.checked = 1;
                } else if (check_count == 0) {
                    parent.state.checked = 0;
                } else {
                    parent.state.checked = 2;
                }

                this._nodeChecked(parent);
            };

            // 向下的级联选取
            this._cascadeDownChecked = function (node) {
                if (node.nodes == undefined || node.nodes.length == 0) {
                    return;
                }

                for (var i in node.nodes) {
                    var child = node.nodes[i];

                    child.state.checked = node.state.checked;

                    this._nodeChecked(child);

                    this._cascadeDownChecked(child);
                }
            };

            // 向下的级联展开
            this._cascadeDownExpanded = function (node) {
                if (node.nodes == undefined || node.nodes.length == 0) {
                    return;
                }

                for (var i in node.nodes) {
                    var child = node.nodes[i];
                    if (node.state.expanded == true) {
                        child.html.show();
                        child.state.expanded = false;
                    } else {
                        child.html.hide();
                        child.state.expanded = false;
                    }

                    this._nodeExpanded(child);

                    if(node.state.expanded == false) {
                        this._cascadeDownExpanded(child);
                    }
                }
            };

            // 根据操作对象寻找Node
            this._findTargetNode = function (target) {
                var node_html = target.parents(".ui-tree-node");

                if (node_html == undefined) {
                    return undefined;
                }

                var node_id = node_html.attr("node-id");
                return this.getNode(node_id);
            };

            // 设置节点状态
            this._refreshNodeState = function (node) {
                if (node.state == undefined) {
                    node.state = {
                        "checked": false,
                        "expanded": false
                    }
                }

                node.state.expanded = node.state.expanded == undefined ? false : node.state.expanded;

                if (node.state.checked == true) {
                    node.state.checked = 1;
                } else {
                    node.state.checked = 0;
                }

                this._nodeChecked(node);
                this._nodeExpanded(node);
            };

            // 设置节点选中状态
            this._nodeChecked = function (node) {
                var check_icon = node.html.find(".check-icon");
                if (check_icon == undefined) {
                    return;
                }

                check_icon.removeClass("fa-check-square-o");
                check_icon.removeClass("fa-square-o");
                check_icon.removeClass("fa-check-square");

                var addClass = "fa-check-square-o";
                switch (node.state.checked) {
                    case 0:
                        addClass = "fa-square-o";
                        break;
                    case 2:
                        addClass = "fa-check-square"
                }

                check_icon.addClass(addClass);
            };

            // 设置节点展开状态
            this._nodeExpanded = function (node) {
                var expand_icon = node.html.find(".expand-icon");
                if (expand_icon == undefined) {
                    return;
                }

                expand_icon.removeClass("fa-plus-square");
                expand_icon.removeClass("fa-minus-square");

                var addClass = node.state.expanded == true ? "fa-minus-square" : "fa-plus-square";
                expand_icon.addClass(addClass);
            };

            // 移除节点展开状态
            this._removeNodeExpanded = function (node) {
                var expand_icon = node.html.find(".expand-icon");
                if (expand_icon == undefined) {
                    return;
                }

                expand_icon.remove();
            };

            this.render();

            return this;
        }
    }]);