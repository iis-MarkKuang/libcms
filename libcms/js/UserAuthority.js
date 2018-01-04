//@ sourceURL=UserAuthority.js
/**
 * Created by lhassy on 2016/12/13.
 */
var userAuthority = function () {

    var currentGroupIds = [];
    var currentFunctionIds = [];
    var insertGroupIds = [];
    var insertFunctionIds = [];
    var deleteGroupIds = [];
    var deleteFunctionIds = [];

    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var sysusers = new Vue({
        el:'#usermanage',
        data:{
            users:{}
        },
        ready: function(){
            this.getuserlist();
        },
        methods:{
            createuser:function () {
                var userName = prompt("请输入新的用户名称:");
                if(userName != "" && userName != null){
                    $.ajax({
                        type: "PUT",
                        url: backServerUrl + "api/auth/users",
                        dataType: "json",
                        headers: {'Content-Type': 'application/json','Authorization':et},
                        data:JSON.stringify({"username": userName}),
                        success: function (data) {
                            sysusers.getusers(userName);
                            alert("用户创建成功!(默认密码：a12345678)");
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            var functionName =  "CreateUser";
                            alert("用户创建失败！请检查是否已存在！");
                            // }
                        }
                    });
                }
            },
            getuserlist:function () {
                GetUserList();
            },
            getusers:function (un) {
                $.ajax({
                    type: "GET",
                    url: backServerUrl + "api/auth/users?offset=0&limit=-1&username=&identity=&full_name&gender=&is_superuser&is_active=",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    success: function (data) {
                        data.content.forEach(function (o) {
                            userNametoIdMap[o.username] = o.id;
                        });
                        sysusers.users = data.content;
                        //因userlist更新滞后，所以下面代码查不到用户名
                        if(un !== undefined){
                            $("#usernamelist").val(un);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        var functionName =  "CreateUser";
                        alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                        // }
                    }
                });
            }
        }
    });

    function GetUserList()
    {
        console.log("GetUserList");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        $.ajax({
            type: "GET",
            url: backServerUrl + "api/auth/users?offset=0&limit=-1&username=&identity=&full_name&gender=&is_superuser&is_active=",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                data.content.forEach(function (o) {
                    userNametoIdMap[o.username] = o.id;
                });
                sysusers.users = data.content;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "GetUserList";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function GetUserById()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var userId = userNametoIdMap[$("#usernamelist").val()];
        if(userId == undefined) {
            console.log("不匹配");
            return;
        }
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/auth/users/" + userId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                console.log("GetUserById");
                $("input[id^='usergroup']").prop("checked",false);
                $("input[id^='authoritycheckbox']").prop("checked",false);
                $("input[id^='authoritycheckbox']").off("click");
                $("input[id^='authoritycheckbox']").parent().css("color", "black");

                insertFunctionIds = [];
                deleteFunctionIds = [];
                insertGroupIds = [];
                deleteGroupIds = [];
                currentGroupIds = [];
                currentFunctionIds = [];

                //填充用户信息
                $("#full_name").val(data.username);
                $("#gender").val(data.gender);
                $("#identity").val(data.identity);
                $("#mobile").val(data.mobile);
                $("#address").val(data.address);
                $("#email").val(data.email);
                $("#is_active").prop("checked",data.is_active);
                $("#is_staff").prop("checked",data.is_staff);


                var groupids = data.permission.groups;
                if(groupids.length > 0){
                    groupids.forEach(function (o) {
                        currentGroupIds.push(o.id);
                        $("#usergroup" + o.id).click();
                        $("#usergroup" + o.id).prop("checked",true);
                    });
                }else{
                    console.log("长度为0");
                }
                var functionids = data.permission.user.permission_ids;
                currentFunctionIds = functionids;
                // console.log("ids = " + ids);
                if(functionids.length > 0){
                    functionids.forEach(function (o) {
                        $("#authoritycheckbox" + o).prop("checked",true);
                    });
                }else{
                    console.log("长度为0");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  arguments.callee.name;
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function ToggleUserInfo() {
        $("#setuserinfo").toggle();
        if($("#setuserinfo").is(":hidden")){
            $("#toggleuserinfo").val("显示用户管理");
        }else{
            $("#toggleuserinfo").val("隐藏用户管理");
        }
    }

    function CreateUser()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        var userName = prompt("请输入新的用户名称:");
        if(userName != "" && userName != null){
            $.ajax({
                type: "PUT",
                url: backServerUrl + "api/auth/users",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify({"username": userName}),
                success: function (data) {
                    GetUserList();
                    alert("用户创建成功!(默认密码：a12345678)");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var functionName =  "CreateUser";
                    alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                    // }
                }
            });
        }
    }

    function SaveUserInfo()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var userId = userNametoIdMap[$("#usernamelist").val()];
        if(userId === undefined){
            alert("未找到当前用户!");
            return;
        }

        var full_name = $("#full_name").val();
        var gender = $("#gender").val();
        var identity = $("#identity").val();
        var mobile = $("#mobile").val();
        var address = $("#address").val();
        var email = $("#email").val();
        var is_active = $("#is_active").prop("checked");
        var is_staff = $("#is_staff").prop("checked");

        var userinfo = {
            "identity":identity,
            "email":email,
            "full_name":full_name,
            "gender": gender,
            "dob": "1900-01-01",
            "mobile": mobile,
            "address": address,
            "postcode":"",
            "profile_url": "",
            "is_active": is_active,
            "is_staff": is_staff
        };

        $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/auth/users/" + userId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data:JSON.stringify(userinfo),
            success: function (data) {
                alert("保存用户信息成功!");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "CreateUser";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function SetUserPass()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var userId = userNametoIdMap[$("#usernamelist").val()];
        if(userId == undefined) {
            alert("没有当前用户!");
            return;
        }
        var pass = prompt("请输入重置密码");
        if(pass !== null){
            if(pass ===""){
                alert("密码不能为空!");
                return;
            }
            $.ajax({
                type: "PATCH",
                url: backServerUrl + "api/auth/users/" + userId + "/password/force",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify({"password": pass}),
                success: function (data) {
                    alert("密码重置成功!");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var functionName =  "SetUerPass";
                    alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                }
            });
        }
    }

    function ChangeUerPass()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var oldpass = $("#oldpass").val();
        var pass = $("#newpass").val();
        var repeatpass = $("#newpassrepeat").val();
        if(pass !== repeatpass){
            alert("两次输入的新密码不匹配!");
            return;
        }
        if(pass ===""){
            alert("密码不能为空!");
            return;
        }
        $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/auth/password" ,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data:JSON.stringify({"old_password": oldpass, "new_password":pass}),
            success: function (data) {
                alert("密码修改成功!");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "SetUerPass";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        });
    }

    function SetFunctionCheckbox(groupId) {
        console.log("SetFunctionCheckbox");
        var index;
        var ug = $("#usergroup" + groupId);
        if(ug.prop("checked")){
            if(currentGroupIds.indexOf(groupId) < 0){
                if(insertGroupIds.indexOf(groupId) < 0) {
                    insertGroupIds.push(groupId);
                }
            }else{
                index = deleteGroupIds.indexOf(groupId);
                if(index > 0){
                    deleteGroupIds.splice(index,1);
                }
            }
        }else{
            if(currentGroupIds.indexOf(groupId) > -1){
                if(deleteGroupIds.indexOf(groupId) < 0) {
                    deleteGroupIds.push(groupId);
                }
            }else{
                index = insertGroupIds.indexOf(groupId);
                if(index > -1){
                    insertGroupIds.splice(index,1);
                }
            }
        }
        // console.log("ug.length = " + ug.length);
        SetCheckbox(groupId, false);
        $("input[id^='usergroup']:checked").each(function (i) {
            console.log("this.value = " + this.value);
            SetCheckbox(this.value, true);
        })
    }

    function SetFunctionAR(functionId) {
        console.log("SetFunctionAR");
        var index;
        var ug = $("#authoritycheckbox" + functionId);
        if(ug.prop("checked")){
            if(currentFunctionIds.indexOf(functionId) < 0){
                if(insertFunctionIds.indexOf(functionId) < 0) {
                    insertFunctionIds.push(functionId);
                }
            }else{
                index = deleteFunctionIds.indexOf(functionId);
                if(index > -1){
                    deleteFunctionIds.splice(index,1);
                }
            }
        }else{
            if(currentFunctionIds.indexOf(functionId) > -1){
                if(deleteFunctionIds.indexOf(functionId) < 0) {
                    deleteFunctionIds.push(functionId);
                }
            }else{
                index = insertFunctionIds.indexOf(functionId);
                if(index > -1){
                    insertFunctionIds.splice(index,1);
                }
            }
        }
    }

    function SaveUserAuthority() {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        var userId = userNametoIdMap[$("#usernamelist").val()];
        if(userId == undefined) {
            alert("没有选择用户!");
            return;
        }

        if(insertGroupIds.length === 0 && insertFunctionIds.length === 0 && deleteGroupIds.length === 0 && deleteFunctionIds.length === 0){
            alert("权限没有变化!");
            return;
        }
        if(confirm("确定要修改用户 " + $("#usernamelist").val() + " 的权限吗?")) {
            $.ajax({
                type: "PATCH",
                url: backServerUrl + "api/auth/users/" + userId + "/permissions",
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': et},
                data: JSON.stringify({
                    "permission_ids": {"delete": deleteFunctionIds, "insert": insertFunctionIds},
                    "group_ids": {"delete": deleteGroupIds, "insert": insertGroupIds}
                }),
                success: function (data) {
                    alert("权限修改成功!");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    GetUserById();
                    var functionName = "SetUerPass";
                    alert(functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                }
            });
        }
    }

    function SetCheckbox(checkedId, status){
        console.log("SetCheckbox:" + status);
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

    function GetSystemFunctionList()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var sortByMinId = function (filed, rev, primer) {
            rev = (rev) ? -1 : 1;
            return function (a, b) {
                a = a.permissions[0].id;
                b = b.permissions[0].id;
                if (typeof (primer) != 'undefined') {
                    a = primer(a);
                    b = primer(b);
                }
                if (a < b) { return rev * -1; }
                if (a > b) { return rev * 1; }
                return 1;
            }
        };

        $.ajax({
            type: "GET",
            url: backServerUrl + "api/auth/permissions",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (fl) {
                console.log("GetSystemFunctionList");
                fl.sort(sortByMinId("a",false,parseInt));
                var fillfunctionlist = new Vue({
                    el:'#functionlist',
                    data:{
                        flist:fl
                    }
                })
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("GetSystemFunctionList 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        });
    }

    function InitPage() {
        // GetUserList();
        GetSystemFunctionList();
        $("#usernamelist").on("input",userAuthority.GetUserById) ;
    }

    return {
        InitPage : InitPage,
        GetUserById : GetUserById,
        SetFunctionCheckbox : SetFunctionCheckbox,
        SetFunctionAR : SetFunctionAR,
        SaveUserAuthority : SaveUserAuthority,
        ToggleUserInfo : ToggleUserInfo,
        SaveUserInfo : SaveUserInfo,
        SetUserPass : SetUserPass
    }
}();