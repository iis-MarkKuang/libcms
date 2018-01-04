//# sourceURL=SystemPara.js
/**
 * Created by lhassy on 2016/12/19.
 */
var systemPara = function () {
    var currentStackId = "";

    function GetBranchList()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/branches?offset=0&limit=-1&ordering=name&nested=true",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.content.length > 0){
                    $("#branchlist").empty();
                    $("#branchdetaillist").text("");
                    data.content.forEach(function (o) {
                        // $("#branchlist").append("<option value='" + o.id +"' selected>" + o.name + "</option>");
                        $("#branchlist").append("<option value='" + o.id +"'>" + o.name + "</option>");
                        $("#branchdetaillist").append("<tr><td style='width: 380px;'><input id='branchname" + o.id +"' value='" + o.name + "' style='width: 360px;'></td><td style='width: 60px;'><input id='branchactive" + o.id + "' type='checkbox' ></td><td style='width: 60px;'><input id='branchroot" + o.id + "' type='checkbox'></td><td style='width: auto;'><input type='button' value='保存修改' onclick='systemPara.SaveBranch(\"" + o.id + "\")'>&nbsp;<input type='button' value='删除' onclick='systemPara.DeleteBranch(\"" + o.id + "\")'></td></tr>");
                        $("#branchactive" + o.id).prop("checked", o.is_active);
                        $("#branchroot" + o.id).prop("checked", o.is_root);
                    });
                    GetStacks(StackOps);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "GetBranchList";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function CreateBranch()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("CreateBranch");

        var branchname = $("#branchname").val();
        if(branchname === ""){
            alert('图书馆名称不能为空!');
            return;
        }
        var isactive = $("#branchisactive").prop("checked");
        var isroot = $("#branchisroot").prop("checked");

        $.ajax({
            type: "POST",
            url: backServerUrl + "api/book/branches",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: JSON.stringify({
                "name":branchname,
                "is_active": isactive,
                "is_root": isroot,
                "description":"图书馆名称"
            }),
            success: function (data) {
                if(data.created === true){
                    alert("创建场馆 " + branchname + " 成功!");
                    GetBranchList();
                }else{
                    alert("创建场馆 " + branchname + " 失败!");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //var response = JSON.stringify(XMLHttpRequest.responseText);
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

    function SaveBranch(branchId)
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("SaveBranch");

        var branchname = $("#branchname" + branchId).val();
        if(branchname === ""){
            alert('图书馆名称不能为空!');
            return;
        }
        var isactive = $("#branchactive" + branchId).prop("checked");
        var isroot = $("#branchroot" + branchId).prop("checked");

        $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/book/branches/" + branchId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: JSON.stringify({
                "name":branchname,
                "is_active": isactive,
                "is_root": isroot,
                "description":"图书馆名称"
            }),
            success: function (data) {
                if(data.updated === true){
                    alert("保存场馆 " + branchname + " 成功!");
                    GetBranchList();
                }else{
                    alert("保存场馆 " + branchname + " 失败!");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "SaveBranch";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function DeleteBranch(branchId)
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("DeleteBranch");

        var branchname = $("#branchname" + branchId).val();
        if(branchname === ""){
            alert('图书馆名称不能为空!');
            return;
        }

        if(confirm("确定要删除图书馆 " + branchname + " 吗?")){
            $.ajax({
                type: "DELETE",
                url: backServerUrl + "api/book/branches/" + branchId,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    if(data.deleted === true){
                        alert("删除场馆 " + branchname + " 成功!");
                        GetBranchList();
                    }else{
                        alert("删除场馆 " + branchname + " 失败!");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if(XMLHttpRequest.responseText.indexOf("has stacks")>0)
                    {
                        alert("该图书馆存在关联书库，请先删除关联书库再操作！")
                    }
                    else{
                        alert("删除失败！");
                    }
                }
            });
        }
    }

    function CreateStack() {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("CreateStack");

        var stackname = $("#stackname").val();
        if(stackname === ""){
            alert('书库名称不能为空');
            return;
        }

        var branchname = $("#branchlist").find("option:selected").text();

        var checksame = false;
        $("#stacklist").children("tr").each(function(){
            if($(this).children().eq(0).text() === branchname &&  $(this).children().eq(1).find("input").val() === stackname){
                checksame = true;
                return false;
            }
        });

        if(checksame){
            alert("图书馆 '" + branchname + "' 下面的书库名称 '" + stackname +"' 已经存在!");
            return;
        }



        var branchId = $("#branchlist").val();
        var isactive = $("#isactive").prop("checked");
        $.ajax({
            type: "POST",
            url: backServerUrl + "api/book/bookstacks",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: JSON.stringify({
                "name":stackname,
                "is_active": isactive,
                "branch_id": branchId,
                "description":"程序建立"
            }),
            success: function (data) {
                GetStacks(StackOps);
                alert("创建书库成功!");
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

    function SaveStack(stackId) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("CreateStack");

        var stackname = $("#stackname" + stackId).val();
        if(stackname === ""){
            alert('书库名称不能为空');
            return;
        }
        var barlen = $("#barlen" + stackId).val();
        if(barlen === ""){
            alert('条码长度不能为空');
            return;
        }
        var isactive = $("#active" + stackId).prop("checked");
        $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/book/bookstacks/" + stackId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: JSON.stringify({
                "name":stackname,
                "book_barcode_length":barlen,
                "is_active": isactive,
                "description":""
            }),
            success: function (data) {
                GetStacks(StackOps);
                alert("保存书库成功!");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "CreateStack";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function DeleteStack(stackId) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("DeleteStack");

        var stackName = $("#stackname" + stackId).val();
        if(confirm("确定要删除书库 " + stackName + " 吗?")){
            $.ajax({
                type: "DELETE",
                url: backServerUrl + "api/book/bookstacks/" + stackId,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    GetStacks(StackOps);
                    if(data.hasOwnProperty("error"))
                    {
                        if(data.error==="Stack has books under it, cannot be deleted")
                        {
                            alert("该书库存在关联采编图书，无法删除!");
                        }
                    }
                    else{
                        alert("删除书库成功!");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if(XMLHttpRequest.responseText.indexOf("has books")>0)
                    {
                        alert("该书库存在关联采编图书，无法删除!");
                    }
                    else{
                        alert("删除失败！");
                    }
                }
            });
        }
    }

    function StackOps(data) {
        $("#stacks").empty();
        $("#stacklist").text("");
        data.content.forEach(function (o) {
            $("#stacks").append("<option value='" + o.id +"'>" + o.name + "</option>");
            var branchname = $("#branchlist").find("option:selected").text();
            if(branchname === o.branch.name){
                // $("#stacklist").append("<tr><td style='font-size: 12px;'>" + o.branch.name + "</td><td><input id='stackname" + o.id +"' value='" + o.name + "'></td><td><input id='active" + o.id + "' type='checkbox'></td><td><input type='button' value='保存修改' onclick='systemPara.SaveStack(\"" + o.id + "\")'>&nbsp;<input type='button' value='删除' onclick='systemPara.DeleteStack(\"" + o.id + "\")'></td></tr>");
                $("#stacklist").append("<tr><td style='font-size: 12px; width: 120px;'>" + o.branch.name + "</td><td><input id='stackname" + o.id +"' value='" + o.name + "'></td><td><input id='barlen" + o.id +"' value='" + o.book_barcode_length + "'  style='width: 50px; text-align: right;'></td><td style='width: 80px;'><input id='active" + o.id + "' type='checkbox'></td><td style='width: auto;'><input type='button' value='保存修改' onclick='systemPara.SaveStack(\"" + o.id + "\")'>&nbsp;<input type='button' value='删除' onclick='systemPara.DeleteStack(\"" + o.id + "\")'>&nbsp;<input type='button' value='书架设置' onclick='systemPara.ManageShelf(\"" + o.id + "\",\"" + o.name + "\")'></td></tr>");
                $("#active" + o.id).prop("checked", o.is_active);
            }
        });
        $("#stacks").val(systemDefaultStack);
    }

    function StackChange() {
        GetStacks(StackOps);
    }

    function ManageShelf(stackId, stackName) {
        // alert("管理书架");
        currentStackId = stackId;
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        $.ajax({
            type: "GET",
            url: backServerUrl + "api/shelf?stack_id=" + stackId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(stackName !== "")
                    $("#shelfcaption").html(stackName + "&nbsp;-&nbsp;书架设置");
                if(data.content.length > 0){
                    $("#shelflist").empty();
                    data.content.forEach(function (o) {
                        $("#shelflist").append("<tr><td style='width: 200px;'><input id='shelfname" + o.id +"' value='" + o.name + "' ></td><td><input id='shelfnumber" + o.id +"' value='" + o.number + "' style='width: 100px;'></td><td style='width: 60px;'><input id='shelfisactive" + o.id + "' type='checkbox' ></td><td><input id='startindex" + o.id +"' value='" + o.start_call_number + "' style='width: 100px;'></td><td><input id='endindex" + o.id +"' value='" + o.end_call_number + "' style='width: 100px;'></td><td><input id='shelfwidth" + o.id +"' type='text' onkeyup=\"check('shelfwidth" + o.id +"');\" value='" + o.width_millimeter + "' style='width: 100px; text-align: right'></td><td><input id='positionx" + o.id +"' type='text' onkeyup=\"check('positionx" + o.id +"');\" value='" + o.north_south_number + "' style='width: 100px; text-align: right'></td><td><input id='positiony" + o.id +"' type='text' onkeyup=\"check('positionx" + o.id +"');\" value='" + o.east_west_number + "' style='width: 100px; text-align: right'></td><td style='width: auto;'><input type='button' value='保存修改' onclick='systemPara.SaveShelf(\"" + o.id + "\")'>&nbsp;<input type='button' value='删除' onclick='systemPara.DeleteShelf(\"" + o.id + "\")'></td></tr>");
                        $("#shelfisactive" + o.id).prop("checked", o.is_active);
                    });
                } else {
                    $("#shelflist").empty();
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "ManageShelf";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function CreateShelf()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("CreateShelf");

        if(currentStackId === ""){
            alert("未选择书库！");
            return;
        }

        var shelfname = $("#shelfname").val();
        if(shelfname === ""){
            alert('书架名称不能为空!');
            return;
        }
        var shelfnumber = $("#shelfnumber").val();
        if(shelfnumber === ""){
            alert('书架编号不能为空!');
            return;
        }

        var isactive = $("#shelfisactive").prop("checked");

        var startindex = $("#startindex").val();
        if(startindex === ""){
            alert('起始索书号不能为空!');
            return;
        }
        var endindex = $("#endindex").val();
        if(endindex === ""){
            alert('结束索书号不能为空!');
            return;
        }
        var shelfwidth = $("#shelfwidth").val();
        if(shelfwidth === ""){
            alert('书架宽度不能为空!');
            return;
        }
        var positionx = $("#positionx").val();
        if(positionx === ""){
            alert('相对坐标(北->南)不能为空!');
            return;
        }
        var positiony = $("#positiony").val();
        if(positiony === ""){
            alert('相对坐标(东->西)不能为空!');
            return;
        }

        $.ajax({
            type: "POST",
            url: backServerUrl + "api/shelf",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: JSON.stringify({
                "name":shelfname,
                "number": shelfnumber,
                "is_active": isactive,
                "start_call_number": startindex,
                "end_call_number": endindex,
                "stack_id": currentStackId,
                "width_millimeter": shelfwidth,
                "north_south_number": positionx,
                "east_west_number": positiony
            }),
            success: function (data) {
                if(data.created === true){
                    alert("创建书架 " + shelfname + " 成功!");
                    ManageShelf(currentStackId, "");
                }else{
                    alert("创建书架 " + shelfname + " 失败!");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //var response = JSON.stringify(XMLHttpRequest.responseText);
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

    function SaveShelf(shelfId)
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("SaveShelf");

        if(currentStackId === ""){
            alert("未选择书库！");
            return;
        }

        var shelfname = $("#shelfname" + shelfId).val();
        if(shelfname === ""){
            alert('书架名称不能为空!');
            return;
        }
        var shelfnumber = $("#shelfnumber" + shelfId).val();
        if(shelfnumber === ""){
            alert('书架编号不能为空!');
            return;
        }

        var isactive = $("#shelfisactive" + shelfId).prop("checked");

        var startindex = $("#startindex" + shelfId).val();
        if(startindex === ""){
            alert('起始索书号不能为空!');
            return;
        }
        var endindex = $("#endindex" + shelfId).val();
        if(endindex === ""){
            alert('结束索书号不能为空!');
            return;
        }
        var shelfwidth = $("#shelfwidth" + shelfId).val();
        if(shelfwidth === ""){
            alert('书架宽度不能为空!');
            return;
        }
        var positionx = $("#positionx" + shelfId).val();
        if(positionx === ""){
            alert('相对坐标(北->南)不能为空!');
            return;
        }
        var positiony = $("#positiony" + shelfId).val();
        if(positiony === ""){
            alert('相对坐标(东->西)不能为空!');
            return;
        }

        $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/shelf/" + shelfId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: JSON.stringify({
                "name":shelfname,
                "number": shelfnumber,
                "is_active": isactive,
                "start_call_number": startindex,
                "end_call_number": endindex,
                "stack_id": currentStackId,
                "width_millimeter": shelfwidth,
                "north_south_number": positionx,
                "east_west_number": positiony
            }),
            success: function (data) {
                if(data.updated === true){
                    alert("修改书架 " + shelfname + " 成功!");
                    // GetBranchList();
                }else{
                    alert("修改书架 " + shelfname + " 失败!");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //var response = JSON.stringify(XMLHttpRequest.responseText);
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

    function DeleteShelf(shelfId) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("DeleteShelf");

        var shelfName = $("#shelfname" + shelfId).val();
        if(confirm("确定要删除书架 " + shelfName + " 吗?")) {
            $.ajax({
                type: "DELETE",
                url: backServerUrl + "api/shelf/" + shelfId,
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': et},
                success: function (data) {
                    if (data.deleted === true) {
                        alert("删除书架 " + shelfName + " 成功!");
                        ManageShelf(currentStackId, "");
                    } else {
                        alert("删除书架 " + shelfName + " 失败! 原因:" + data.result);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //var response = JSON.stringify(XMLHttpRequest.responseText);
                    if (XMLHttpRequest.responseText.indexOf("exists") > 0) {
                        alert("已存在！");
                    }
                    else {
                        alert("创建失败！");
                    }
                }
            });
        }
    }

    function InitPage() {
        GetBranchList();
        // GetStacks(StackOps);
        GetSystemDefaultSetting();
        $("#createbranchbutton").click(CreateBranch);
        $("#createshelfbutton").click(CreateShelf);
    }

    return {
        InitPage : InitPage,
        GetBranchList : GetBranchList,
        // CreateBranch : CreateBranch,
        SaveBranch : SaveBranch,
        DeleteBranch : DeleteBranch,
        ManageShelf : ManageShelf,
        CreateStack : CreateStack,
        SaveStack : SaveStack,
        DeleteStack : DeleteStack,
        StackChange : StackChange,
        SaveShelf : SaveShelf,
        DeleteShelf : DeleteShelf
    }
}();