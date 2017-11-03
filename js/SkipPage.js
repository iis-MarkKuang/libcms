//# sourceURL=SkipPage.js
var connectfail = 0;
var mouseX;
var mouseY;
var userInfo;

var startTime = new Date();
var endTime = new Date();

var pagepath = new Array();

var setIntervalID = 0;
var globalDeviceFilter;


$(document).ready(function () {
    var vuetest = new Vue({
        el:"#vuetry",
        data:{
            message:"wan nai zi"
        }
    })
    })

function mouseMove(ev){
    Ev= ev || window.event;
    var mousePos = mouseCoords(ev);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
}

function mouseCoords(ev){
    if(ev.pageX || ev.pageY){
        return {x:ev.pageX, y:ev.pageY};
    }
    return{
        x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y:ev.clientY + document.body.scrollTop - document.body.clientTop
    };
}

function UserExit(){
    var rootPath = getRootPath();
    window.localStorage["et"] = "";
    window.location.href = rootPath;
}

function BeforCount()
{
    if(setIntervalID != 0)
    {
        window.clearInterval(setIntervalID);
        setIntervalID = 0;
//            $("#content div[id^=dev]").remove();
    }
    if($("#devicefilter").length > 0)
    {
        globalDeviceFilter = $("#devicefilter");
    }
}

function SkipPage(PageIndex,Pagename){
   // if($("#pubutton").val()!=undefined)
   // {
   //    console.log($("#xlf"));
   // }
   if(pagepath.indexOf(PageIndex)<0)
   {
       alert("没有权限！");
       return;
   }
   // var waitdiv = "<div id='loadwaitpic' style='z-index:999; position:relative; top 100px; width: 500px; height: 140px; margin: 200px auto; background: rgba(95, 157, 159, 0.7); border: 0px solid red; text-align: center; vertical-align: top; color:#fefefe; font-size: 50px;' ><table><tr><td style='width: 80px;'><img style='margin: 0px auto;' src='/images/waitting.gif'></td><td>&nbsp;&nbsp;页面载入中...</td></tr></table></div>";
   var waitdiv = "<div id='loadwaitpic' style='z-index:999; position:relative; top 100px; width: 500px; height: 140px; margin: 200px auto; background: linear-gradient(transparent,rgba(95, 157, 159, 0.6),transparent); border: 0px solid red; text-align: center; vertical-align: top; color:#1619e9; font-size: 50px;' ><table><tr><td style='width: 80px;'><img style='margin: 0px auto;' src='/images/waitting.gif'></td><td>&nbsp;&nbsp;页面载入中...</td></tr></table></div>";
   // var waitdiv = "<div id='loadwaitpic' style='z-index:999; position:relative; top 100px; width: 500px; height: 140px; margin: 200px auto; border: 0px solid red; text-align: center; vertical-align: top; color:#1619e9; font-size: 50px;' ><table style='background-image: url('/images/waitting_bk.jpg');'><tr><td style='width: 80px;'><img style='margin: 0px auto;' src='/images/waitting.gif'></td><td>&nbsp;&nbsp;页面载入中...</td></tr></table></div>";
   $("body").append(waitdiv);

    var rootPath = getRootPath();
    var myDate = new Date();
    var se = myDate.getTime();
    var Pagehtml = rootPath + "/allpages/" + PageIndex+".html?ver=" + se;
    //var Pagehtml = rootPath +  "/allpages/" + PageIndex+".html";
    $("#menucss3>li>div").css("display","none");
    $.ajax({
        type: "GET",
        url: Pagehtml,
        dataType: "html",
        success: function (data) {
            $("#content").html(data);
            $("#pagename").html("当前页面:"+Pagename);
            $("#menucss3>li>div").css("display","");
            $("#loadwaitpic").remove();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#loadwaitpic").remove();
            $("#menucss3>li>div").css("display","");
            // if(XMLHttpRequest.status == 401){
            // }else{
            //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
            alert("GetUserInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            // }
        }
    });
}//跳转界面

function GetUserInfo(){
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var lll=new Array();
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/auth/info",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
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
                    str+='<li><a class="Pageparam" href="javascript:void(0);" onclick="SkipPage(\''+lll[index1].permissions[index2].path+'\',\''+lll[index1].permissions[index2].name+'\');">'
                        +lll[index1].permissions[index2].name+'</a></li>';
                    pagepath.push(lll[index1].permissions[index2].path);
                }
                str+='</ul></div></div></li>';
            }
            $("#menucss3").append(str);
            $(".Pageparam").each(function () {
                if($(this).text()=="退出系统")
                {
                    $(this).removeAttr("onclick");
                    $(this).attr("onclick","UserExit()");
                }
            })
            userInfo=data;
            //$("#userinfo").html("&nbsp&nbsp用户名称:" + data.username + "&nbsp&nbsp单位:" + data.full_name );
            $("#userinfo").html("&nbsp&nbsp用户名称:" + data.username);
            $("#userinfo").attr("value",data.full_name);
            // $("#title").html("阿法迪图书馆文献管理平台2.0");
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
}//获取（当前登录）账户的信息和操作权限





