/**
 * Created by liqf on 2016/12/14.
 */

angular.module('ui.ms2select',[]).
    service('uiMs2select',['$document','$q','$timeout','httpService',function($document,$q,$timeout,httpService){
        this.config = function (el, params) {
            this.el = el;
            this.$el = $(el);
            this.params = params;
            // 渲染
            this.render = function () {
                var that = this;
                var　ms2select = that._createMs2select();
                that.$el.html(ms2select)
                    .on("click", ".move", $.proxy(that.move, that))
                    .on("click",".opt",$.proxy(that.opt,that));

                this.leftSelect();
                this.rightSelect();
                return that;
            }

            this.opt = function (event) {
                event.preventDefault();
                var target = $(event.target);
                if(target.hasClass("addOne") || target.parent().hasClass("addOne")) {
                    this.addOne(params.$scope);
                }

                if(target.hasClass("removeOne") || target.parent().hasClass("removeOne")) {
                    this.removeOne(params.$scope);
                }
            }

            this.move = function(event) {
                event.preventDefault();

                var target = $(event.target);
                if(target.hasClass("moveTop") || target.parent().hasClass("moveTop")) {
                    this.moveTop();
                }

                if(target.hasClass("moveUp") || target.parent().hasClass("moveUp")) {
                    this.moveUp();
                }

                if(target.hasClass("moveDown") || target.parent().hasClass("moveDown")) {
                    this.moveDown();
                }

                if(target.hasClass("moveBottom") || target.parent().hasClass("moveBottom")) {
                    this.moveBottom();
                }
            };

            
            this._createMs2select = function () {
                var leftSelect = this._createSelect(this.params.leftHead,this.params.leftData,'leftSel');
                var rightSelect = this._createSelect(this.params.rightHead,this.params.rightData,'rightSel');
                // 中间按钮
                var leftBtn = '<div class="left options" style="padding-top:180px;">\
                    <p title="添加"><button  class="btn btn-default opt addOne" disabled="disabled"><i class="fa fa-chevron-right"></i></button></p>\
                    <p title="移除"><button  class="btn btn-default opt removeOne" disabled="disabled"><i class="fa fa-chevron-left"></i></button></p>\
                    </div>';
                // 右边按钮
                var rightBtn = '<div class="left options" style="padding-top: 125px;">\
                    <p title="移至顶部"><button class="btn btn-default move moveTop" disabled="disabled"><i class="fa fa-caret-square-o-up"></i></button></p>\
                    <p title="上移"><button class="btn btn-default move moveUp" disabled="disabled"><i class="fa  fa-chevron-up"></i></button></p>\
                    <p title="下移"><button  class="btn btn-default move moveDown" disabled="disabled"><i class="fa fa-chevron-down"></i></button></p>\
                    <p title="移至底部"><button  class="btn btn-default move moveBottom" disabled="disabled"><i class="fa fa-caret-square-o-down"></i></button></p>\
                    </div>';
                return leftSelect+leftBtn+rightSelect+rightBtn;
            }

            // 创建select选择框
            this._createSelect = function (head,data,id) {
                var select = '<div class="ms2select"><h4>'+head+'</h4><select id="'+id+'" multiple="multiple" class="form-control">';
                for(var i in data){
                    select += '<option value="'+data[i].id+'">'+data[i].text+'</option>';
                }
                select += '</select></div>';
                return select;
            }

            // 左select选中事件绑定
            this.leftSelect = function () {
                $("#leftSel").on('change',function (e) {
                    if($(this).val() != null && $(this).val() != ""){
                        $(".addOne").prop("disabled",false);
                    }
                    else{
                        $(".addOne").prop("disabled",true);
                    }
                })
            }

            // 右select选中事件绑定
            this.rightSelect = function () {
                $("#rightSel").on('change',function (e) {
                    if($(this).val() != null && $(this).val() != ""){
                        $(".removeOne").prop("disabled",false);
                        var index_arr = [];
                        var length = $(this).children().length;
                        $("#rightSel option:selected").each(function () {
                            index_arr.push($(this).index());
                        });
                        if(index_arr){
                            // 上移和置顶
                            if(index_arr.indexOf(0) <0 ){
                                $(".moveUp").prop("disabled",false);
                                $(".moveTop").prop("disabled",false);
                            }else{
                                $(".moveUp").prop("disabled",true);
                                $(".moveTop").prop("disabled",true);
                            }

                            // 下移和置底
                            if(index_arr.indexOf(length-1) < 0){
                                $(".moveDown").prop("disabled",false);
                                $(".moveBottom").prop("disabled",false);
                            }else{
                                $(".moveDown").prop("disabled",true);
                                $(".moveBottom").prop("disabled",true);
                            }
                        }
                    }
                    else{
                        $(".removeOne").prop("disabled",true);
                        $(".move").prop("disabled",true);
                    }

                })
            }

            // 绑定按钮事件
            this.addOne = function () {
                var val = this.getValue();
                var leftNode = $("#leftSel option:selected");
                if(val.length >= params.maxLength || val.length+leftNode.length >params.maxLength){
                    view.alert("右侧选项不能超过"+params.maxLength);
                    return false;
                }
                var list = $("#rightSel");
                list.append(leftNode);
                $("#leftSel").trigger('change');
                $("#rightSel").trigger('change');
            }

            this.removeOne = function () {
                var leftNode = $("#rightSel option:selected");
                var list = $("#leftSel");
                list.append(leftNode);
                $("#leftSel").trigger('change');
                $("#rightSel").trigger('change');
            }
            
            this.moveUp = function () {
                $("#rightSel option:selected").each(function () {
                    $(this).insertBefore($(this).prev('option'));
                })
                $("#rightSel").trigger('change');
            }

            this.moveTop = function () {
                var node = $("#rightSel option:selected");
                console.log(node.index());
                node.insertBefore($("#rightSel option:first"));
                $("#rightSel").trigger('change');
            }

            this.moveDown = function () {

                var nodes = $("#rightSel option:selected");
                for(var i = nodes.length-1;i>=0;i--){
                    var node = $(nodes[i]);
                    node.insertAfter(node.next("option"));
                }
                $("#rightSel").trigger('change');
            }

            this.moveBottom = function () {
                var node = $("#rightSel option:selected");
                node.insertAfter($("#rightSel option:last"));
                $("#rightSel").trigger('change');
            }
            
            // 获取右边select所有值
            this.getValue = function () {
                var val = [];
                $("#rightSel option").each(function () {
                    val.push($(this).val());
                })
                return val;
            }

            this.render();
            return this;
        }
}])