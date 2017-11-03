//@ sourceURL=SystemSetting.js
// var fillusergroup;
var userNametoIdMap = [];
var systemDefaultStack;
var systemDefaultScanInterval;
var readerIdLength;

function GetStacks(callback)
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    $.ajax({
        type: "GET",
        url: backServerUrl + "api/book/bookstacks?offset=0&limit=-1&ordering=name",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            if(data.content.length > 0){
                callback(data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var functionName =  "GetStacks";
            alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            // }
        }
    });
}

function StacksDisplay(data) {
    data.content.forEach(function (o) {
        $("#stacks").append("<option value='" + o.id +"' selected>" + o.name + "</option>");
    });
    $("#stacks").val(systemDefaultStack);
}

function GenBarcode() {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    var category_id =  $("#booktype").val();
    var stack_id =  $("#stacks").val();
    var quantity =  $("#barcodecount").val();
    if(quantity === "" || quantity === "0"){
        alert("数量不正确!");
        return;
    }
    if(stack_id==null)
    {
        alert("初始典藏不能为空！");
        return;
    }
    if(parseInt(quantity) > 100){
        alert("数量不能大于100!");
        return;
    }
    $.ajax({
        type: "POST",
        url: backServerUrl + "api/book/pregen",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        data: JSON.stringify({
            "category_id":category_id, // 1为普通图书, 2为期刊, 3为古籍, 4为⾮非书资料料
            "quantity":parseInt(quantity),    // quantity > 0
            "stack_id":stack_id       //书库id
        }),
        success: function (data) {
            $("#startnumber").text(data.start);
            $("#endnumber").text(data.end);
            alert("条码生成!")
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
           alert("生成失败！");
        }
    });
}

function ChangeUserPass() {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    var oldpassword =  $("#oldpass").val();
    var newpassword =  $("#newpass").val();
    var repeatpsw = $("#newpassrepeat").val();
    if(newpassword===oldpassword)
    {
        alert("新密码不能与旧密码一样！");
        return;
    }
    if(repeatpsw!==newpassword)
    {
        alert("两次输入新密码不一致！");
        return;
    }

    $.ajax({
        type: "PATCH",
        url: backServerUrl + "api/auth/password",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        data: JSON.stringify({
            "old_password":oldpassword,
            "new_password":newpassword
        }),
        success: function (data) {
            if(data.updated)
            {
                alert("修改成功，新密码为:"+newpassword);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.responseText.indexOf("not match")>0)
            {
                alert("旧密码输入错误，请再次输入！");
            }
            else{
                alert("修改失败！");
            }
        }
    });
}

function GetSystemDefaultSetting() {
    systemDefaultStack = window.localStorage["systemDefaultStack"];
    systemDefaultScanInterval = window.localStorage["systemDefaultScanInterval"];
    readerIdLength = window.localStorage["readerIdLength"];
    if(systemDefaultStack === undefined){
        systemDefaultStack = 1;
    }
    if(systemDefaultScanInterval === undefined){
        systemDefaultScanInterval = 6;
    }
    if(readerIdLength === undefined){
        readerIdLength = 19;
    }
    $("#stacks").val(systemDefaultStack);
    $("#scaninterval").val(systemDefaultScanInterval);
    $("#readeridlength").val(readerIdLength);
}

function SetSystemDefaultSetting() {
    systemDefaultStack = $("#stacks").val();
    window.localStorage["systemDefaultStack"] = systemDefaultStack;
    if(!$.isNumeric($("#scaninterval").val())){
        alert("流通限定时间只能是数字!");
        return;
    }
    else if($("#scaninterval").val()<3)
    {
        alert("流通限定时间不能小于3秒！");
        return;
    }
    systemDefaultScanInterval = $("#scaninterval").val();
    window.localStorage["systemDefaultScanInterval"] = systemDefaultScanInterval;
    window.localStorage["readerIdLength"] = readerIdLength;
    alert("保存完成!");
}

function check(obj){
    if (isNaN($("#" +obj).val()))
    {alert("请输入数字！");
        obj.value="";}
}