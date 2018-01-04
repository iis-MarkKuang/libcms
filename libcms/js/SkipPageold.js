var count = 0;
var connectfail = 0;
var surl = "";
var sinlib = "";
var setIntervalID = 0;
var globalDeviceFilter;
var startTime = "";
var endTime = "";
var mouseX;
var mouseY;
var lines = 10;



function mouseMove(ev)
{
    Ev= ev || window.event;
    var mousePos = mouseCoords(ev);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
}

function mouseCoords(ev)
{
    if(ev.pageX || ev.pageY){
        return {x:ev.pageX, y:ev.pageY};
    }
    return{
        x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y:ev.clientY + document.body.scrollTop - document.body.clientTop
    };
}

function ProcessResize()
{
    height = document.documentElement.clientHeight||document.body.clientHeight;
    width = document.documentElement.clientWidth||document.body.clientWidth;
}

window.onresize = function(){
    ProcessResize();
};

function UpdateData()
{
    if(surl === ""){
        var backServerUrl = window.localStorage["backServerUrl"];
        var url = backServerUrl + "api/devices/status";
        GetDeviceList(url,"");
    }else{
        GetDeviceList(surl, sinlib);
    }
}

function BeforCount()
{
    if(setIntervalID != 0)
    {
        //取消timeout
        window.clearInterval(setIntervalID);
        setIntervalID = 0;
//            $("#content div[id^=dev]").remove();
    }
    if($("#devicefilter").length > 0)
    {
        globalDeviceFilter = $("#devicefilter");
    }
}

function UserExit()
{
    var rootPath = getRootPath();
    window.localStorage["et"] = "";
    window.location.href = rootPath;
}

function SkipPage(PageIndex)
{
    var rootPath = getRootPath();
    var myDate = new Date();
    var se = myDate.getTime();
    var Pagehtml = rootPath + "/allpages/" + PageIndex+".html?ver=" + se;
    console.log("pagehtml = " + Pagehtml);
    $.ajax({
        type: "GET",
        url: Pagehtml,
        dataType: "html",
        success: function (data) {
            // console.log("OK" + data);
            $("#content").html(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
            alert("GetUserInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            // }
        }
    });
}

$("#datebox").datebox({
    required: true
});
var gmdata;
function GetUserInfo()
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var lll=new Array();
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/auth/info",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            gmdata = data;
            var str="";
            for(var index1 in data.apps)
            {
                switch (data.apps[index1].app_label)
                {
                    case "系统设置":lll[0]=data.apps[index1];break;
                    case "读者管理":lll[1]=data.apps[index1];break;
                    case "文献管理":lll[2]=data.apps[index1];break;
                    case "流通管理":lll[3]=data.apps[index1];break;
                    case "统计分析":lll[4]=data.apps[index1];break;
                    default:lll[5]=data.apps[index1];break;
                }
            }
            for(var index1 in lll)
            {
                str+='<li class="menu_left"><a href="#" class="drop">'+lll[index1].app_label+'</a><div class="dropdown_1column align_left"><div class="col_1"><ul class="simple">';
                for(var index2 in lll[index1].permissions)
                {
                    str+='<li><a class="Pageparam" href="javascript:void(0);" onclick="SkipPage(\''+lll[index1].permissions[index2].path+'\');">'
                        +lll[index1].permissions[index2].name+'</a></li>';
                }
                str+='</ul></div></div></li>';
            }
            $("#menucss3").append(str);
            $("#userinfo").html("用户名称:" + data.username + "&nbsp&nbsp单位:" + data.full_name );
            $("#title").html("阿法迪中小型图书馆文献信息管理平台");
            //$("#userinfo").html("用户名称:" + data.username + "&nbsp&nbsp单位:" + "无锡" + "&nbsp&nbsp权限:" + data.group.name);
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
                alert("GetUserInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}

function GetUserLevel()
{
    $("#pg21_tb1 input").attr("readOnly",true);
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/levels?offset=0&limit=1",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var str="";
            for(var index in data.content)
            {
                $("#ancientno").val(data.content[index].ancient_book_rule.quantity);
                $("#ancientdeadline").val(data.content[index].ancient_book_rule.day);
                $("#generalbookno").val(data.content[index].general_book_rule.quantity);
                $("#generalbookdeadline").val(data.content[index].general_book_rule.day);
                $("#journalno").val(data.content[index].journal_rule.quantity);
                $("#journaldeadline").val(data.content[index].general_book_rule.day);
                $("#otherbookno").val(data.content[index].other_media_rule.quantity);
                $("#otherbookdeadline").val(data.content[index].other_media_rule.day);
                $("#renewright").val(data.content[index].can_renew);
                $("#bookright").val(data.content[index].can_book);
            }
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
}

