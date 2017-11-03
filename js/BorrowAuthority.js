//# sourceURL=BorrowAuthority.js
/**
 * Created by lhassy on 2016/12/12.
 */
var borrowAutority = function () {
    var userLevelInfo = new Vue({
        el: '#borrowauth',
        data: {
            userlevels: {},
            currentselected: 0,
            levelinfo: {}
        },
        watch: {
            selected: function (levelId) {
                console.log("levelId = " + levelId);
                var s = this.levelinfo;
                var find = false;
                userLevelInfo.userlevels.forEach(function (o) {
                    if (o.id === levelId) {
                        console.log(levelId);
                        find = true;
                        $.extend(true, s, o);
                    }
                });
                if (!find) {
                    console.log("!find");
                    $.extend(true, s, data.content[0]);
                }
                this.currentselected = levelId;
            }
        },
        methods: {
            showInfoById1: function (levelId) {
                console.log(this.userlevels);
            },
            showInfoById: function (levelId) {
                console.log("levelIdnew = " + levelId);
                if (levelId === 0) {
                    levelId = userLevelInfo.currentselected;
                    console.log("levelIdnew1 = " + levelId);
                }
                var s = this.levelinfo;
                var find = false;
                userLevelInfo.userlevels.forEach(function (o) {
                    if (o.id === levelId) {
                        console.log(levelId);
                        find = true;
                        $.extend(true, userLevelInfo.levelinfo, o);
                    }
                });
                if (!find) {
                    console.log("!find");
                    $.extend(true, userLevelInfo.levelinfo, data.content[0]);
                }
                this.currentselected = levelId;
            },
            createnewlevel: function () {
                console.log("createnewlevel");
                CreateUserLevel(this.levelinfo);
            },
            deletelevel: function () {
                if (confirm("确定要删除当前的职别 " + $('#userlevel').find("option:selected").text() + " 吗?")) {
                    console.log("deletelevel");
                    DeleteUserLevel(this.currentselected);
                }
            },
            savelevel: function () {
                console.log("savelevel");
                var currentLevelId = this.currentselected;
                var currentlevelinfo = this.levelinfo;
                var tu = this.userlevels;
                this.userlevels.forEach(function (o, index) {
                    if (o.id === currentLevelId) {
                        $.extend(true, tu[index], currentlevelinfo);
                    }
                });
                SaveUserLevel(this.levelinfo);
            }
        }
    });

    function GetUserLevel(callback) {
        console.log("GetUserLevel");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var arglength = arguments.length;
        var newUserLevelName;
        if(arglength === 2)
            newUserLevelName = arguments[1];
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/reader/levels?offset=0&limit=-1",
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': et},
            success: function (data) {
                if(arglength === 2)
                    callback(data,newUserLevelName);
                else
                    callback(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("GetUserLevel 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function InitUserLevelList(data) {
        var tll = {};
        $.extend(true,tll, data.content[0]);
        userLevelInfo.userlevels = data.content;
        userLevelInfo.levelinfo = tll;
        $("#userlevel").empty();
        $("#userlevel").trigger("blur");
        data.content.forEach(function (o, index) {
            if(index === 0){
                $("#userlevel").append("<option value='" + o.id +"' selected>" + o.name + "</option>");
            }else{
                $("#userlevel").append("<option value='" + o.id +"'>" + o.name + "</option>");
            }
        });
    }

    function SelectUserLevelByName(data,newlevelname) {
        $("#userlevel").empty();
        data.content.forEach(function (o, index) {
            if(newlevelname === o.name){
                userLevelInfo.currentselected = o.id;
                userLevelInfo.userlevels = data.content;
                $("#userlevel").append("<option value='" + o.id +"' selected>" + o.name + "</option>");
                $("#userlevel").get(0).selectedIndex = index;
                userLevelInfo.showInfoById($("#userlevel").val());
            }else{
                $("#userlevel").append("<option value='" + o.id +"'>" + o.name + "</option>");
            }
        });
    }

    function CreateUserLevel(leveldata){
        // console.log(savedata);
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        var newlevelname = prompt("请输入职别名称(新职别的相关属性以当前的职别为模板创建)");
        if(newlevelname !== "" && newlevelname !== null){
            $("#newlevelname").val(newlevelname);
            var tlevel = {};
            $.extend(true,tlevel,leveldata);
            tlevel.name = newlevelname;

            $.ajax({
                type: "POST",
                url: backServerUrl + "api/reader/levels",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data: JSON.stringify(tlevel),
                success: function (data) {
                    GetUserLevel(SelectUserLevelByName, newlevelname);
                    alert("创建职别成功!")
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if(XMLHttpRequest.responseText.indexOf("exists")>0)
                    {
                        alert("已存在！");
                    }
                    else{
                        alert("创建失败！");
                    }
                }
            });
        }
    }

    function DeleteUserLevel(levelId){
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        $.ajax({
            type: "DELETE",
            url: backServerUrl + "api/reader/levels/" + levelId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                GetUserLevel(InitUserLevelList);
                alert("删除职别成功!")
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("该类别已有读者关联")>0)
                {
                    alert("该职别已有关联读者，无法删除！");
                }
                else{
                    alert("删除失败!");
                }
            }
        });
    }

    function SaveUserLevel(savedata){
        // console.log(savedata);
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/reader/levels/" + savedata.id,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: JSON.stringify(savedata),
            success: function (data) {
                alert("保存信息成功!")
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "SaveUserLevel";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function InitPage() {
        GetUserLevel(InitUserLevelList);
    }

    return {
        InitPage : InitPage,
        userLevelInfo : userLevelInfo
    }
}();