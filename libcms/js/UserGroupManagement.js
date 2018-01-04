//# sourceURL=UserGroupManagement.js
/**
 * Created by lhassy on 2016/12/13.
 */
var userGroupManagement = function () {

    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    var fillusergroup = new Vue({
        el:'#usergrouplist',
        data:{
            usergroups:[]
        },
        mounted: function () {
            console.log("mounted");
            this.$nextTick(function () {
                // this.usergroups = [{"id":2,"name":"shrfid2"}];
                this.showusergroup();
            })
        },
        ready: function(){
            this.showusergroup();
        },
        methods:{
            createusergroup: function(){
                CreateUserGroup(UpdateUserGroupList);
            },
            showusergroup: function(){
                console.log("showusergroup");
                UpdateUserGroupList();
            },
            deleteusergroup: function(){
                var fc = $("input[id^='usergroup']:checked");
                if(fc.length === 0){
                    alert("权限组没有选择项!");
                    return;
                }else if(fc.length > 1){
                    alert("一次只能删除一个权限组!");
                    return;
                }
                var groupId = fc[0].id.substring(9);
                if(confirm("确定要删除当前的权限组 " + fc.parent().text() + " 吗?")) {
                    DeleteUserGroup(groupId,UpdateUserGroupList);
                }
            },
        }
    });

    function CreateUserGroup() {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        var fc = $("input[id^='authoritycheckbox']:checked");
        if(fc.length === 0){
            alert("功能列表（系统设置、读者管理...）没有选择项!");
            return;
        }

        var groupName = prompt("请输入新的权限组名称:");
        if(groupName != "" && groupName != null){
            var permission_ids = [];

            fc.each(function (index,o) {
                permission_ids.push(o.id.substring(17));
            });

            var callback;
            if(arguments.length ===1)
                callback = arguments[0];

            var groupJson = {name : groupName, "permission_ids":permission_ids};
            $.ajax({
                type: "PUT",
                url: backServerUrl + "api/auth/groups",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(groupJson),
                success: function (data) {
                    alert("用户权限组添加成功!");
                    if(callback !== null)
                        callback();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var functionName =  arguments.callee.name;
                    alert("创建权限组失败！前检查该权限组是否已存在!")
                }
            });
        }
    }

    function DeleteUserGroup(groupId) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var callback;
        if(arguments.length ===2)
            callback = arguments[1];

        $.ajax({
            type: "DELETE",
            url: backServerUrl + "api/auth/groups/" + groupId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                SetCheckbox(groupId, false);
                alert("用户权限组删除成功!");
                if(callback !== null)
                    callback();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("is bound to auth users")>0)
                {
                    alert("该权限已有用户关联，无法删除！");
                }
                else{
                    alert("删除失败！");
                }
            }
        });
    }

    function UpdateUserGroupList() {
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/auth/groups?offset=0&limit=-1&nested=true",
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': et},
            success: function (newdata) {
                // console.log("newdata" + JSON.stringify(newdata));
                // gusergroup = newdata;
                $("#usermanage").data("usergroup",newdata);
                fillusergroup.usergroups = newdata.content;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert( "更新用户组 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    //这个函数UserAuthority.js里也有
    function SetCheckbox(checkedId, status){
        console.log("SetFunctionCheckbox:" + status);
        var gusergroup = $("#usermanage").data("usergroup");
        var ug = gusergroup.content.filter(function (obj){
            return obj.id === parseInt(checkedId)
        });
        if(ug.length > 0) {
            var ids = ug[0].permissions.map(function (o) {
                return o.id;
            });
            if(ids.length > 0){
                ids.forEach(function (oo) {
                    $("#authoritycheckbox" + oo).prop("checked", status);
                    if(status) {
                        $("#authoritycheckbox" + oo).on("click", function () {
                            return false;
                        });
                        $("#authoritycheckbox" + oo).parent().css("color", "blue");
                    }
                    else {
                        $("#authoritycheckbox" + oo).off("click");
                        $("#authoritycheckbox" + oo).parent().css("color", "black");
                    }
                });
            }
        }else{
            console.log("全部未选择!");
        }
    }

    function InitPage() {
    }

    return {
        InitPage : InitPage
    }
}();