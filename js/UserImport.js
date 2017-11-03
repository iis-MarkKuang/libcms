var connectfail = 0;
var userInfo;
var groupid=new Array();

$(document).ready(function () {





})

function Dataimport() {
    var datenow= new Date();
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var strs=new Array();
    var Body=new Array();
    if($("#edittable input[type='checkbox']").is(':checked'))
    {
        var body=new Array();
        $("#edittable input[type='checkbox']:checked").not("input[name='allcheck']").each(function () {
            $(this).parents("tr").each(function () {
                //dob=$(this).find("input").eq(4).val().replaceAll("/","-");
                var index=0;
                groupid=[];
                strs=$(this).find("input").eq(3).val().split("/");
                for (index=0;index<strs.length;index++)
                {
                    groupid[index] =localStorage.getItem(strs[index]);
                    if(groupid[index]==null)
                    {
                        groupid[index]="";
                    }
                }
                var levelid_now = localStorage.getItem($(this).find("input").eq(10).val());
                if(levelid_now==null)
                {
                    levelid_now="";
                }
                body.push(
                    {
                        "barcode":$(this).find("input").eq(8).val(),//必填
                        "rfid": "",
                        "level_id":levelid_now,//必填
                        "group_ids":groupid,//必填
                        "identity":$(this).find("input").eq(9).val(),//必填
                        "full_name":$(this).find("input").eq(1).val(),//必填
                        "gender":$(this).find("input").eq(2).val(),//必填
                        "dob":"1990-09-09",//$(this).find("input").eq(4).val(),//必填
                        "email":"",
                        "mobile": $(this).find("input").eq(6).val(),
                        "address":$(this).find("input").eq(5).val(),
                        "postcode": $(this).find("input").eq(7).val(),
                        "profile_image": "",
                        "create_at":datenow//必填
                    }
                )
            });
        })
        Body={
            "data":body
        }
        //alert(JSON.stringify(body));
        $.ajax({
            type: "POST",
            url: backServerUrl + "api/reader/bulk/members",
            dataType: "json",
            contentType: 'application/json',
            data:JSON.stringify(Body),
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
               $.each(data,function (i,val) {
                   $("#edittable tbody").find("tr:eq("+i+") td:eq(1) input").attr("name",data[i].created);
                   $("#edittable tbody").find("tr:eq("+i+") td:eq(11) input").attr("name",data[i].result);
               })
                SaveErrors();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("errors")>0)
                {
                    if(XMLHttpRequest.responseText.indexOf("data.group_ids")>0)
                    {
                        alert("读者群组存在问题！");
                    }
                    else if(XMLHttpRequest.responseText.indexOf("data.level_id")>0)
                    {
                        alert("读者职别存在问题！");
                    }
                    else{
                        alert("导入失败！请检查参数!");
                    }
                }
            },
        });
    }
    else
    {
        alert("请勾选需要导入的数据！");
    }

}//读者导入

function GetUserLevel_3(){
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/levels",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            $.each(data.content,function(i,val){
                localStorage.setItem(val.id, val.name);
                localStorage.setItem(val.name, val.id);
            });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.status == 401){
                var up = window.localStorage["up"];
                connectfail++;
                if(connectfail < 3){
                    $.ajax({type:'POST',
                        url:backServerUrl + 'api/auth/token',
                        dataType: 'json',
                        data:up,
                        headers:{'Content-Type':'application/json'},
                        success:function(response) {
                            console.log("ReToken!");
                            var last=(response.token).toString();
                            window.localStorage["et"] = "Bearer " + last;
                            UpdateData();
                        },
                        error: function(response) {
                            console.log(response);
                        }
                    });
                }else{
                    connectfail = 0;
                    alert("获得设备状态失败!");
                }
//                }else if(XMLHttpRequest.status == 204){
//                    alert("设备数量为零!");
            }else{
                //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
                alert("GetLevelInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}//存储level_id

function GetClassInfo2(){
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/groups",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            $.each(data.content,function(i,val){
                localStorage.setItem(val.name, val.id);
            });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.status == 401){
                var up = window.localStorage["up"];
                connectfail++;
                if(connectfail < 3){
                    $.ajax({type:'POST',
                        url:backServerUrl + 'api/auth/token',
                        dataType: 'json',
                        data:up,
                        headers:{'Content-Type':'application/json'},
                        success:function(response) {
                            console.log("ReToken!");
                            var last=(response.token).toString();
                            window.localStorage["et"] = "Bearer " + last;
                            UpdateData();
                        },
                        error: function(response) {
                            console.log(response);
                        }
                    });
                }else{
                    connectfail = 0;
                    alert("获得设备状态失败!");
                }
//                }else if(XMLHttpRequest.status == 204){
//                    alert("设备数量为零!");
            }else{
                //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
                alert("GetLevelInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}//存储group_id

function SaveErrors(){
    $("#edittable").find("tbody tr").each(function (i) {
        var isTrue = $("#edittable").find("tbody tr:eq("+i+")").find("td:eq(1) input").attr("name");
        var ErrorResult = $("#edittable").find("tbody tr:eq("+i+")").find("td:eq(11) input").attr("name");
        if(isTrue=="true")
        {
            $("#edittable").find("tbody tr:eq("+i+")").remove();
        }
        switch(ErrorResult){
            case "reader already exists":ErrorResult="读者已存在";break;
            case "identity is empty or has the wrong number of digits":ErrorResult="身份证存在问题";break;
            case "level id is empty":ErrorResult="职别存在问题";break;
            //case "level id is empty":ErrorResult="群组存在问题";break;
        }
        console.log(ErrorResult);
        $("#edittable").find("tbody tr:eq("+i+") td:eq(11) input").val(ErrorResult);

    })
    // for(var i =0;i++;i<maxLength)
    // {
    //     console.log(i);
    //     console.log( $("#edittable").find("tbody tr:eq("+index+")").find("td:eq(1) input").attr("name"));
    //     var isTrue = $("#edittable").find("tbody tr:eq("+index+")").find("td:eq(1) input").attr("name");
    //     console.log(isTrue);
    //     var ErrorResult = $("#edittable").find("tr:eq("+index+")").find("td:eq(11) input").attr("name");
    //     console.log(ErrorResult);
    //     if(isTrue)
    //     {
    //         $("#edittable").find("tbody tr:eq("+index+")").remove();
    //     }
    //     $("#edittable").find("tbody tr:eq("+index+") td:eq(11)").val(ErrorResult);
    // }

}//显示错误列表





