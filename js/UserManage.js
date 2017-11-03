//# sourceURL=UserManage.js
var connectfail = 0;
var userInfo;
var deaddate="";
var Manageid="";
var nexturl="";
var prevurl="";
var Pageall="";//总共多少页

var UserManage = function () {

    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    var userManage = new Vue({
        data:"",
        methods:{
            getuserlist: function(){

            var limit=$("#rows option:selected").text();//每页多少行
            var name=$("#name").val();
            var barcode=$("#barcode").val();
            $("#pg23_tb5 tr:gt(0)").remove();
            $.ajax({
                type: "GET",
                url: backServerUrl + "api/reader/members?offset=0&limit="+limit+
                "&barcode="+barcode+"&username=&identity=&full_name="+name+"&gender=&dob=&level_id=" +
                "&group_id=&create_at=&is_active=&is_suspend=&logic_op=and",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    var usercount=data.count;
                    if(usercount<=0)
                    {
                        alert("未找到匹配读者！");
                        userManage.manage_recover();
                        userManage.getuserlist();
                    }
                    else{
                        var str="";
                        var Pagestr="";
                        nexturl=backServerUrl+data.next.substr(1);
                        prevurl=backServerUrl+data.prev.substr(1);
                        data.content.forEach(function (v) {
                            str+="<tr><td class='barcode'value='"+v.id+"' name='readerbarcode'>"+v.barcode+"</td>"+
                                "<td class='username'>"+v.full_name+"</td>"+
                                "<td class='gender'>"+v.gender+"</td>"+
                                "<td class='level'>"+jQuery.parseJSON(localStorage.getItem(v.level))+"</td>"+
                                "<td class='dob'>"+v.dob+"</td>"+
                                "<td class='create_at'>"+v.create_at.substring(0,10)+"</td>"+
                                "<td class='suspend' value='"+v.is_suspend+"' name='"+v.restore_at+"' ><input type='checkbox' style='width: 40px;' disabled></td>"+
                                "<td class='is_active' value='"+v.is_active+"' ><input type='checkbox' style='width: 40px;' disabled></td></tr>"
                        });

                        Pageall=Math.ceil(usercount/limit);
                        Disabledbtnfirst();
                        Disabledbtnlast(Pageall);
                        $("#pageno span[name='pageall']").html(Pageall+"页");
                        $("#pg23_tb5").append(str);
                        $(".suspend").each(function () {
                            if($(this).attr("value")=="true")
                            {
                                $(this).children().attr("checked",true);
                            }
                        });
                        $(".is_active").each(function () {
                            if($(this).attr("value")=="false")
                            {
                                $(this).children().attr("checked",true);

                            }
                        })
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
                },
            });
        },//获取读者列表

            manage_recover: function() {
                //$("#pageno").html("1/"+Pageall+"页");
                $("#pg23_tb3").find("option").remove();
                $("#pg23_tb3").find("select").append(" <option value='请选择'>请选择</option>"
                +"<option value='补证'>补证</option>"
                    +"<option value='停借'>停借</option>"
                    +"<option value='注销'>注销</option>")
                $("#pageno span[name='pagenow']").text("1/");
                $("#pageno span[name='pageall']").text(Pageall+"页");
                $("#pg23_tb3").find("select").val("请选择");
                $("#pg23_tb3 select").prop("disabled",true);
                $("#pg23_tb3").find("tr td:eq(1)").hide();
                $("#pg23_tb3").find("tr td:eq(2)").show();
                $("#pg23_tb3").find("tr td:eq(3)").show();
                $("#pg23_tb1 input,#pg23_tb2 input,#pg23_tb3 input").val("");
                $("#Manage_print").attr("disabled",true);
                $("#Manage_print").css("background-image","url('../images/Print_no-op.jpg')");
                $("#Manage_confirm").attr("disabled",true);
                $("#Manage_confirm").css("background-image","url('../images/Comfirm_no-op.jpg')");
                $("#classcheckbox input:checkbox").prop("checked",false);
                $("input[name='deadline']").prop("readOnly",true);
                $("input[name='deadline']").parent().css("color","darkgray");
                $("input[name='days']").prop("readOnly",true);
                $("input[name='days']").parent().css("color","darkgray");
                $("#pg23_tb5 tr").css("background","");
            },//借书证管理界面恢复原状

        }
    });

    return{
        userManage: userManage,
    }
}();
$(document).ready(function () {
    $("#pg23_tb3").on('change','input',function () {
        var days=$("input[name='days']").val();
        if(days.trim()!="")
        {
            var datenow= new Date();//这里日期是传递过来的，可以自己改
            deaddate=addDate(datenow.format("yyyy-MM-dd"),parseInt(days));
            $("input[name='deadline']").prop("readOnly",false);
            $("input[name='deadline']").prop("value",deaddate);
            $("input[name='deadline']").parent().css("color","black");
        }
        else
        {
            $("input[name='deadline']").prop("readOnly",true);
            $("input[name='deadline']").parent().css("color","darkgray");
        }
    })

    $("#pg23_tb3").on('change','select',function () {
        $("#pg23_tb3 input").parent().css("color","darkgray");
        $("#pg23_tb3 input").val("");
        $("#pg23_tb3 input").prop("readOnly",true);
        $("#pg23_tb3 input").parent().hide();
        var optselected=$("#pg23_tb3 select option:selected").val();
        switch (optselected)
        {
            case "补证": $("input[name='newbarcode']").parent().show();
                $("input[name='newbarcode']").parent().css("color","black");
                $("input[name='newbarcode']").prop("readOnly",false);
                break;
            case "停借":$("input[name='days']").parent().show();
                $("input[name='deadline']").parent().show();
                $("input[name='days']").prop("readOnly",false);
                $("input[name='days']").parent().css("color","black");
                break;
            case "注销":break;
            case "请选择":$("input[name='days']").parent().show();
                $("input[name='deadline']").parent().show();break;
        }
    })

    $("#pg23_tb5").on("dblclick","tr:gt(0)",function () {
        Manageid=$(this).children("td:eq(0)").attr("value");
        $("#pg23_tb3 input").val("");
        $("#pg23_tb3 input").parent().css("color","darkgray");
        $("#pg23_tb3 select").prop("disabled",false);
        $("#pg23_tb3 select option").prop("disabled",false);
        //借书证打印内容
        GetSingleUser();
        $("#cardname").text($(this).children("td:eq(1)").text());
        $("#cardjob").text($(this).children("td:eq(3)").text());
        $("#cardbarcode").text($(this).children("td:eq(0)").text());
        $("#carddob").text($(this).children("td:eq(5)").text());
        JsBarcode("#qrcode", $(this).children("td:eq(0)").text(), {
            format: "code39",
            width:1,
            height:40,
            displayValue: false
        });
        $("#Manage_print").prop("disabled",false);
        $("#Manage_print").css("background-image","url('../images/Print.jpg')");

        $("#barcode").val("");
        $("#name").val("");
        $("#barcode").val($(this).children("td:first").text());
        $("#name").val($(this).children("td:eq(1)").text())
        if($("#barcode").val().trim()!="")
        {
            if($(this).children("td:eq(6)").attr("value")=="true")
            {
                var getdate=$(this).children("td:eq(6)").attr("name");
                var datetime=addDate(getdate,1)
                alert("停借到期时间为："+datetime);
                $("#pg23_tb3").find("option[value='停借']").remove();
                $("#pg23_tb3 select").append("<option value='取消停借'>取消停借</option>");
            }
            if($(this).children("td:eq(7)").attr("value")=="false")
            {
                $("#pg23_tb3").find("option[value='注销'],option[value='停借']").remove();
                $("#pg23_tb3 select").append("<option value='取消注销'>取消注销</option>");
            }
            $("#Manage_confirm").prop("disabled",false);
            $("#Manage_confirm").css("background-image","url('../images/Comfirm.png')");
        }
        else
        {
            alert("读者编号为空！");
        }
    })

    $("#rows").on('change',function () {
        Dialog_confirm("");
    })

    $("#pg23_tb5,#pg41_tb2").on("click","tr:gt(0)",function () {
        $(this).css("background","lightblue").siblings().css("background","");
    });

    $("#userImageFile").on("change",function(){
        if($(this).context.files.length==1){
            var file=$(this).context.files[0];
            var fileName=$(this).context.files[0].name;
            var fileSize=$(this).context.files[0].size;
            var maxSize=500*1024;
            if(!/\.(JPEG|JPG|PNG)$/.test(fileName.toUpperCase())){
                $(this).val("");
                $("#userimage").prop("src","");
                alert("只能上传图片");
                return;
            }
            if(fileSize>maxSize){
                $(this).val("");
                $("#userimage").prop("src","");
                alert("图片最大为500KB");
                return;
            }
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e){
                $("#userimage").prop("src",this.result);
            }
        }else{
            alert("只能上传一张");
            $(this).val("");
        }
    });

})

function Manage_confirm() {
    var et = window.localStorage["et"];
    var readernewbarcode=$("input[name='newbarcode']").val().trim();
    var backServerUrl = window.localStorage["backServerUrl"];
    var radiopot=$("#pg23_tb3 select option:selected").val();
    switch(radiopot){
        case "补证":
            if(readernewbarcode.length<=0)
            {
                alert("读者借书证号为空！")
            }
            else {
                Checkduplicate(readernewbarcode);
            }
            break;
        case "停借":
            var days=$("input[name='days']").val();
            if(days.trim()!="")
            {
                var body={"days":days};
                $.ajax({
                    type: "PATCH",
                    url: backServerUrl + "api/reader/members/"+Manageid+"?action=suspend",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    data:JSON.stringify(body),
                    success: function (data) {
                        if(data.updated)
                        {
                            alert("停借操作成功!到期时间为："+deaddate);
                        }
                        UserManage.userManage.manage_recover();
                        UserManage.userManage.getuserlist();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert("停借失败！");
                        UserManage.userManage.manage_recover();
                    }
                });
            }
            else
            {
                alert("请输入停借天数！");
            }
            break;
        case "注销":GetBorrowedBook();
            break;
        case "取消停借":
            var body = {"days":0}
            $.ajax({
                type: "PATCH",
                url: backServerUrl + "api/reader/members/"+Manageid+"?action=suspend",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(body),
                success: function (data) {
                    if(data.updated)
                    {
                        alert("取消停借操作成功!");
                    }
                    UserManage.userManage.manage_recover();
                    UserManage.userManage.getuserlist();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("停借失败！");
                    UserManage.userManage.manage_recover();
                }
            });

            break;
        case "取消注销":
            var body = {"is_active":"true"}
            $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/reader/members/"+Manageid+"?action=inactivate",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data:JSON.stringify(body),
            success: function (data) {
                if(data.updated)
                {
                    alert("取消注销成功");
                }
                UserManage.userManage.manage_recover();
                UserManage.userManage.getuserlist();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("取消注销失败！");
                UserManage.userManage.manage_recover();
            }
        });
    }
}//借书证管理界面确认

function addDate(date,days){
    var nd = new Date(date);
    nd = nd.valueOf();
    nd = nd + days * 24 * 60 * 60 * 1000;
    nd = new Date(nd);
    //alert(nd.getFullYear() + "年" + (nd.getMonth() + 1) + "月" + nd.getDate() + "日");
    var y = nd.getFullYear();
    var m = nd.getMonth()+1;
    var d = nd.getDate();
    if(m <= 9) m = "0"+m;
    if(d <= 9) d = "0"+d;
    var cdate = y+"-"+m+"-"+d;
    return cdate;
}

function Prev() {
    $(":input[name='pageturn']").val("");
    Dialog_confirm(prevurl);
    var pagenow=$("#pageno span[name='pagenow']").text();
    var newpageno=Number(pagenow.substring(0,pagenow.length-1))-1+"/" ;
    $("#pageno span[name='pagenow']").html(newpageno);
    Disabledbtnlast(Pageall);
    Disabledbtnfirst();
}

function Next() {
    $(":input[name='pageturn']").val("");
    Dialog_confirm(nexturl);
    var pagenow=$("#pageno span[name='pagenow']").text();
    var newpageno=Number(pagenow.substring(0,pagenow.length-1))+1+"/" ;
    $("#pageno span[name='pagenow']").html(newpageno);
    Disabledbtnlast(Pageall);
    Disabledbtnfirst();
}

function Turnto() {
    var pageturn=$(":input[name='pageturn']").val();
    var no=Number(pageturn);
    if((/^(\+|-)?\d+$/.test( no )) && no > 0)
    {
        if(no>Pageall)
        {
            alert("超过最大页数！")
        }
        else
        {
            Dialog_confirm(no);
            var newpageno=no+"/" ;
            $("#pageno span[name='pagenow']").html(newpageno);
            $(":input[name='pageturn']").val("");
        }
    }
    else
    {
        alert("请输入正整数！");
    }

}

function Disabledbtnfirst() {
    var pagenow=$("#pageno span[name='pagenow']").text();
    var newpageno=pagenow.substring(0,pagenow.length-1);
    if(newpageno=="1")
    {
        $("#Prev").attr("disabled",true);
    }
    else
    {
        $("#Prev").attr("disabled",false);
    }
}

function Disabledbtnlast(Pageall) {
    var pagenow=$("#pageno span[name='pagenow']").text();
    var newpageno=pagenow.substring(0,pagenow.length-1);
    if(newpageno==Pageall)
    {
        $("#Next").attr("disabled",true);
    }
    else
    {
        $("#Next").attr("disabled",false);
    }
}

function Manage_print() {
    $("#printexm").printArea();
}//借书证打印

function ShowReader() {
    // $( "#dialog-form" ).dialog({
    //     autoOpen: false,
    //     modal: true,
    // });
    GetUserLevel_1("manage");
    $("#readerbarcode").val("");
    $("#readername").val("");
    $("#readersex").val("请选择");
    $("#readerjob").val("请选择");
    $("#readersuspend").val("请选择");
    $("#readeractive").val("请选择");
    $("#dialog_dobstart").val("");
    $("#dialog_dobend").val("");
    $("#dialog_createstart").val("");
    $("#dialog_createend").val("");
}//显示dialog

function Dialog_cancel() {
   // $("#dialog-form").dialog("close");
}//dialog取消

function GetUserLevel_1(param){
    if(param=="register")
    {
        $("#pg21_tb3 input").attr("readOnly",true);
        $("#pg21_tb3 input").val("");
    }
    else if(param=="manage")
    {
        $("#readerjob").empty();
    }
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/levels",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var levelinfo="<option>请选择</option>";
            for(var index in data.content)
            {
                levelinfo+="<option name='"+data.content[index].id+"' value='"+data.content[index].name+"'>"+data.content[index].name+"</option>";
            }
            $("#readerjob").append(levelinfo);

            $.each(data.content,function(i,val){
                localStorage.setItem(val.id, JSON.stringify(val.name));
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
}//获取读者级别

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
                localStorage.setItem(val.id, JSON.stringify(val.name));
                localStorage.setItem(val.name, JSON.stringify(val.id));
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

function GetClassInfo1(){
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $("#classcheckbox").find("label").remove();
    $("#delclasscheckbox").find("label").remove();
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/groups",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var gradeinfo="";
            for(var index in data.content)
            {
                gradeinfo+="<label style='font-size: 18px;margin-right: 10px;'><input type='checkbox' name='"+data.content[index].id+"' value='"+data.content[index].name+"' style='height: 20px; width: 30px;'>"+data.content[index].name+"</label>";
                localStorage.setItem(data.content[index].id, data.content[index].name);
            }
            $("#classcheckbox").append(gradeinfo);
            $("#delclasscheckbox").append(gradeinfo);
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
}//获取读者群组（XX届XX班）

function Dialog_confirm(Url) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var datenow=new Date();
    var limit=$("#rows option:selected").text();//每页多少行
    var readername="";
    var readerbarcode=$("#readerbarcode").val();
    var readeridentity="";
    var readerfull_name=$("#readername").val();
    var readerbirthstart="";
    ($("#dialog_dobstart").val()==="")?readerbirthstart="1900-01-01":readerbirthstart=$("#dialog_dobstart").val();
    var readerbirthend="";
    ($("#dialog_dobend").val()==="")?readerbirthend=datenow.format("yyyy-MM-dd"):readerbirthend=$("#dialog_dobend").val();
    var readergender="";
    var readerlevel="";
    var readergroup="";
    var create_atstart="";
    ($("#dialog_createstart").val()==="")?create_atstart="1900-01-01":create_atstart=$("#dialog_createstart").val();
    var create_atend="";
    ($("#dialog_createend").val()==="")?create_atend=addDate(datenow.format("yyyy-MM-dd"),1):create_atend=addDate($("#dialog_createend").val(),1);
    var is_suspend="";
    var is_active="";
    ($("#readersex option:selected").text()==="请选择")?readergender="":readergender=$("#readersex option:selected").text();
    ($("#readerjob option:selected").text()==="请选择")?readerlevel="":readerlevel=$("#readerjob option:selected").attr("name");
    if(typeof(readerlevel)=="undefined")
    {
        readerlevel="";
    }
    ($("#readeractive option:selected").text()==="请选择")?is_active="":is_active=$("#readeractive option:selected").val();
    ($("#readersuspend option:selected").text()==="请选择")?is_suspend="":is_suspend=$("#readersuspend option:selected").val();
    $("#pg23_tb5 tr:gt(0)").remove();
    if(Url=="")//rows 高级查询
    {
        $("#pageno span[name='pagenow']").html("1/");
        Url=backServerUrl + "api/reader/members?offset=0&limit="+limit+"&barcode="+readerbarcode+
            "&username="+readername+"&identity="+readeridentity+"&full_name="+readerfull_name+
            "&gender="+readergender+"&dob="+readerbirthstart+","+readerbirthend+"&level_id="+readerlevel+"&group_id="
            +readergroup+"&create_at="+create_atstart+","+create_atend+"&is_active="+is_active+"&is_suspend="+is_suspend+"&logic_op=and"
        //$("#levelid").attr("name",readerlevel);
    }
    else if((/^(\+|-)?\d+$/.test( Url )) && Url > 0)//跳转
    {
        var offset=Number((Url-1)*limit);
        Url=backServerUrl + "api/reader/members?offset="+offset+"&limit="+limit+"&barcode="+readerbarcode+
            "&username="+readername+"&identity="+readeridentity+"&full_name="+readerfull_name+
            "&gender="+readergender+"&dob="+readerbirthstart+","+readerbirthend+"&level_id="+readerlevel+"&group_id="
            +readergroup+"&create_at="+create_atstart+","+create_atend+"&is_active="+is_active+"&is_suspend="+is_suspend+"&logic_op=and"
    }
    $.ajax({
        type: "GET",
        url: Url,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var str="";
            var Pagestr="";
            var usercount=data.count;
            nexturl=backServerUrl+data.next.substr(1);
            prevurl=backServerUrl+data.prev.substr(1);
            for(var index in data.content)
            {
                str+="<tr><td class='barcode'value='"+data.content[index].id+"' name='readerbarcode'>"+data.content[index].barcode+"</td>"+
                    "<td class='username'>"+data.content[index].full_name+"</td>"+
                    "<td class='gender'>"+data.content[index].gender+"</td>"+
                    "<td class='level'>"+jQuery.parseJSON(localStorage.getItem(data.content[index].level))+"</td>"+
                    "<td class='dob'>"+data.content[index].dob+"</td>"+
                    "<td class='create_at'>"+data.content[index].create_at.substring(0,10)+"</td>"+
                    "<td class='suspend' value='"+data.content[index].is_suspend+"' name='"+data.content[index].restore_at+"' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td>"+
                    "<td class='is_active' value='"+data.content[index].is_active+"' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td></tr>"
            }
            Pageall=Math.ceil(usercount/limit);
            if(Pageall<=0)
            {
                alert("未搜到匹配读者！")
                UserManage.userManage.getuserlist();
            }
            else {
                $("#pageno span[name='pageall']").html(Pageall+"页");
                Disabledbtnfirst();
                Disabledbtnlast(Pageall);
                $("#pg23_tb5").append(str);
                $(".suspend").each(function () {
                    if($(this).attr("value")=="true")
                    {
                        $(this).children().attr("checked",true);
                    }
                });
                $(".is_active").each(function () {
                    if($(this).attr("value")=="false")
                    {
                        $(this).children().attr("checked",true);
                    }
                })
            }
            //$("#dialog-form").dialog("close");

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
            //$("#dialog-form").dialog("close");
        },
    });
}//带参获取读者列表

function GetSingleUser() {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/members/"+Manageid+"?by=id",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var groupstr="";
            for(var index in data.groups)
            {
                groupstr+=(","+localStorage.getItem(data.groups[index]));
            }
            $("#cardgroup").text(groupstr.substring(1));
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
        },
    });
}//获取读者详情

function Checkduplicate(newbarcode){
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    //var duplicate_barcode=$("#readerbarcode").val().trim();
    //var duplicate_identity=$("#identityno").val().trim();
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/members?barcode="+newbarcode,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            if(data.count<=0)
            {
                var body={"barcode":newbarcode,"rfid":""};
                $.ajax({
                    type: "PATCH",
                    url: backServerUrl + "api/reader/members/"+Manageid+"?action=card",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    data:JSON.stringify(body),
                    success: function (data) {
                        if(data.updated)
                        {
                            alert("补证成功");
                            $("#cardbarcode").text(newbarcode);
                            JsBarcode("#qrcode",  $("#cardbarcode").text(), {
                                format: "code39",
                                width:1,
                                height:40,
                                displayValue: false
                            });
                        }
                        UserManage.userManage.manage_recover();
                        UserManage.userManage.getuserlist();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert("补证失败！");
                        UserManage.userManage.manage_recover();
                    }
                });

                // else if(readernewbarcode.length!=12)
                // {
                //     alert("读者借书证号为12位长度！")
                // }
            }
            else
            {
                alert("该读者证或身份证号已存在！");
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
                alert("该借书证或身份证号已存在！");            }
        },
    });
}//借书证录入查重

function GetBorrowedBook() {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/members/"+Manageid+"/holdings",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
        if(data.count>0)
        {
            alert("该读者存在未归还图书，无法注销!");
        }
        else
        {
            $.ajax({
                type: "PATCH",
                url: backServerUrl + "api/reader/members/"+Manageid+"?action=inactivate",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    if(data.updated)
                    {
                        alert("注销成功");
                    }
                    UserManage.userManage.manage_recover();
                    UserManage.userManage.getuserlist();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("注销失败！");
                    UserManage.userManage.manage_recover();
                }
            });
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
        },
    });
}//获取读者所借图书详情






