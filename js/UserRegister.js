//# sourceURL=UserRegister.js
var connectfail = 0;
var userInfo;
var levelid="";
var groupid=new Array();
var getgroupid=new Array();
var readerdob="";
var modify_id="";


$(document).ready(function () {

    var cardregister = new Vue({
        el:'#groupact',
        data:{

        },
        methods:{
            AddReadergroup:function () {
                var newlevel = $("#newlevel").val().trim();
                if (newlevel.length <= 0) {
                    alert("新群组名不能为空！");
                }
                else {
                    var et = window.localStorage["et"];
                    var backServerUrl = window.localStorage["backServerUrl"];
                    var body = {
                        "name": newlevel,
                        "is_active": true,
                        "description": "description"
                    };
                    $.ajax({
                        type: "POST",
                        url: backServerUrl + "api/reader/groups",
                        dataType: "json",
                        data: JSON.stringify(body),
                        headers: {'Content-Type': 'application/json', 'Authorization': et},
                        success: function (data) {
                            if (data.created) {
                                alert("添加成功！");
                            }
                            else {
                                alert("添加失败！请检查该群组是否已存在！");
                            }
                            Continue_User();
                            GetClassInfo1();
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            alert("添加失败！");
                            Continue_User();
                        }
                    });
                }
            },//添加群组
            DelReadergroup:function () {
                var group = $("#delclainput").val();
                if(group.length<=0)
                {
                    alert("请选择要删除的群组！");
                }
                else {
                    groupid = [];
                    $("#delclasscheckbox input:checked").each(function (index) {
                        groupid[index]=this.name;
                        index++;
                    });
                    var et = window.localStorage["et"];
                    var backServerUrl = window.localStorage["backServerUrl"];
                    var body = {"group_ids": groupid}
                    $.ajax({
                        type: "PATCH",
                        url: backServerUrl + "api/reader/bulk/members?action=inactivate_by_group_id",
                        dataType: "json",
                        headers: {'Content-Type': 'application/json', 'Authorization': et},
                        data: JSON.stringify(body),
                        success: function (data) {
                            if(data.length<=0)
                            {
                                alert("注销失败！请检查该群组是否存在有效读者！");
                            }
                            else
                            {
                                alert("注销成功");
                            }
                            Continue_User();
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            alert("注销失败！请检查该群组是否为空");
                        }
                    });
                }
            }//集体注销
        }
    });

    var groupmanagement = new Vue({
        el:"#registertable",
        data:{},
        methods:{

        }
    });

    $("#pg21_tb1,#pg21_tb2").on('change','input,select',function () {
        User_monitor();
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

    $("#clamodal").on('click',':checkbox',function () {
        var selArea = $("#selarea");
        var checkboxArea=$("#classcheckbox");
        if(this.checked){
            selArea.append($(this).parent().clone().css({"width":"","background":"","border":""}));
        }else{
            selArea.find(":input[name='"+this.name+"']").parent().remove();
            checkboxArea.find(":input[name='"+this.name+"']").prop("checked",false);
        }
    })

    $("#delclamodal").on('click',':checkbox',function () {
        var selArea = $("#delselarea");
        var checkboxArea=$("#delclasscheckbox");
        if(this.checked){
            selArea.append($(this).parent().clone().css({"width":"","background":"","border":""}));
        }else{
            selArea.find(":input[name='"+this.name+"']").parent().remove();
            checkboxArea.find(":input[name='"+this.name+"']").prop("checked",false);
        }
    })

    $("#level_confirm").on('click',function () {
        var selAreainput=$("#selarea").find("input");
        if(selAreainput.length<0)
        {

        }
        else{
            $("#clainput").val("");
            var selAreachosen="";
            selAreainput.each(function () {
                selAreachosen += ("," + this.value);
            })
            $("#clainput").val(selAreachosen.substring(1))
        }
    })

    $("#dellevel_confirm").on('click',function () {
        var selAreainput=$("#delselarea").find("input");
        if(selAreainput.length<0)
        {

        }
        else{
            $("#delclainput").val("");
            var selAreachosen="";
            selAreainput.each(function () {
                selAreachosen += ("," + this.value);
            })
            $("#delclainput").val(selAreachosen.substring(1))
        }
    })
    
    $("#checkedclear").on('click',function () {
        $("#selarea").find("label").remove();
        $("#classcheckbox").find(":checked").prop("checked",false);
    })

    $("#delcheckedclear").on('click',function () {
        $("#delselarea").find("label").remove();
        $("#delclasscheckbox").find(":checked").prop("checked",false);
    })
})

// function onSelect(date){
function onSelect(){
    // readerdob=date.format("yyyy-MM-dd");
    readerdob=$("#borndate").val();
    User_monitor();
}

function User_monitor() {
    var index=0;
    var datenow=new Date();
    var readerbarcode=$("#readerbarcode").val().trim();
    // var readeridentityno=$("#identityno").val().trim();
    var readerfull_name=$("#readername").val().trim();
    var readerlevel="";
    var readergender="";
    ($("#readersex option:selected").val()==="请选择")?readergender="":readergender=$("#readersex option:selected").val();
    ($("#readerjob option:selected").val()==="请选择")?readerlevel="":readerlevel=$("#readerjob option:selected").val();
    groupid=[];
    // if($("input[type='checkbox']").is(':checked')) {
    //     var index = 0;
    //     $("#classcheckbox input:checked").each(function () {
    //         groupid[index] = this.name;
    //         index++;
    //     });
    // }
    groupid[0] = $("#clainput").val();
    // if(readerbarcode!=""&&readeridentityno!=""&&readerfull_name!=""&&readergender!=""&&  readerlevel!=""&&groupid!=""&&readerdob!="")
    if(readerbarcode!=""&&readerfull_name!=""&&readergender!=""&&  readerlevel!=""&&groupid!="")
    {
        $("#Saveuser").attr("disabled",false);
        $("#Saveuser").css("background-image","url('../images/Save.png')");
    }
    else
    {
        $("#Saveuser").attr("disabled",true);
        $("#Saveuser").css("background-image","url('../images/Save_no-op.png')");
    }

}//监控借书证录入界面读者信息

function Checkduplicate(){
    // if ($("#borndate").datebox('getValue')>=$("#registerdate").datebox('getValue'))
    if ($("#borndate").val() >= $("#registerdate").val())
    {
        alert("办证日期不能小于出生年月！");
    }
    else
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var duplicate_barcode=$("#readerbarcode").val().trim();
        // var duplicate_identity=$("#identityno").val().trim();
        var duplicate_identity="";
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/reader/members?offset=0&limit=&barcode=" +duplicate_barcode+
            "&username=&identity="+duplicate_identity+"&full_name=&gender=&dob=&reader_level=" +
            "&reader_group=&create_at=&is_active=&logic_op=or",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.count<=0)
                {
                    Save_User();
                }
                else
                {
                    if(data.count === 1){
                        if(data.errors[0].indexOf("identity") > -1){
                            Save_User();
                        }
                    }else{
                        alert("该读者证号已存在！");
                    }
                    // Continue_User();
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
    }
}//借书证录入查重

function ModifyorNew() {
    $("#modify_barcode").val("");
    if($("#pg21_tb1 caption").html()=="新增读者")
    {
        Continue_User();
    }
    else
    {
        $("#pg21_tb1 caption").html("新增读者");
        $("#modifyornew").html("查找读者");
    }
}//button切换

function Modify_cancel() {
    //$("#dialog-modify").modal("close");
    $("#pg21_tb1 caption").html("新增读者");
    $("#modifyornew").html("查找读者");
    //$("#dialog-modify").dialog("close");
}//修改读者取消

function Modify_confirm(UserID) {
    $(":checkbox").prop("checked",false);
    $("option").removeAttr("selected");
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var modify_barcode=$("#modify_barcode").val().trim();
    var index=0;
    if(modify_barcode.length<=0)
    {
        alert("请输入借书证号！")
    }
    else {
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/reader/members/"+UserID,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.count=="0")
                {
                    alert("借书证号不存在！");
                    Continue_User();
                }
                else {
                    if(data.dob.indexOf("-")<=0)
                    {
                        data.dob=data.dob.substring(0,4)+"-"+
                            data.dob.substring(4,6)+"-"+
                            data.dob.substring(6,8);
                    }
                    $("#identityno").prop("name",data.identity);
                    $("#readerbarcode").prop("name",modify_barcode);
                    $("#readername").prop("name",data.full_name);
                    modify_id=data.id
                    $("#readername").val(data.full_name);
                    $("#contactno").val(data.mobile);
                    $("#address").val(data.address);
                    // $("#PostCode").val(data.postcode);
                    $("#readerbarcode").val(modify_barcode);
                    $("#identityno").val(data.identity);
                    $("#readersex").val(data.gender);
                    $("#readerjob").val(localStorage.getItem(data.level));
                    $("#userimage").prop("src",data.profile_image);
                    // for(var index in data.groups)
                    // {
                    //     $("#classcheckbox input[type='checkbox'][value='"+data.groups[index].name+"']").prop("checked",true);
                    //     getgroupid[index]=data.groups[index].id;
                    // }

                    // var groupstr="";
                    // for(var index in data.groups)
                    // {
                    //     groupstr += (","+localStorage.getItem(data.groups[index]));
                    //     $("#classcheckbox input[type='checkbox'][value='"+localStorage.getItem(data.groups[index])+"']").prop("checked",true);
                    //     getgroupid[index]=data.groups[index];
                    // }
                    // $("#selarea").append($("#classcheckbox").find(":checked").parent().clone().css({"width":"","background":"","border":""}));
                    // $("#clainput").val(groupstr.substring(1));
                    $("#clainput").val(data.groups[0]);

                    // $("#borndate").datebox("setValue",data.dob);
                    $("#borndate").val(data.dob);
                    // $("#registerdate").datebox("setValue",data.create_at.substring(0,10));
                    $("#registerdate").val(data.create_at.substring(0,10));
                    $("#Saveuser").attr("disabled",false);
                    $("#Saveuser").css("background-image","url('../images/Save.png')");
                    $("#ModifyUser").show();
                    $("#Saveuser").hide();
                }
                GetUserLevel_2();
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
                //$("#dialog-modify").dialog("close");
            },
        });
    }
}//修改读者确认

function ModifyorUser() {
    var oldbarcode = $("#readerbarcode").prop("name");
    var oldname = $("#readername").prop("name");
    //var oldid= $("#identityno").prop("name");
    var readeridentityno=$("#identityno").val().trim();
    if($("#readerbarcode").val().trim()!==oldbarcode)
    {
        alert("借书证号不能修改！");
        return;
    }
    if($("#readername").val().trim()!==oldname)
    {
        alert("读者姓名不能修改！");
        return;
    }
    // if(readeridentityno!==oldid)
    // {
    //     alert("身份证号不能修改！");
    //     return;
    // }
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var datenow= new Date();
    if(readeridentityno.length>19)  //身份证可以不填
    {
        alert("二代身份证号应为18位！");
        $("#Saveuser").prop("disabled",true);
        $("#Saveuser").css("background-image","url('../images/Save_no-op.png')");
    }
    // else if ($("#borndate").datebox('getValue')==datenow.format("yyyy-MM-dd") || $("#borndate").datebox('getValue')>datenow.format("yyyy-MM-dd"))
    else if ($("#borndate").val() == datenow.format("yyyy-MM-dd") || $("#borndate").val() > datenow.format("yyyy-MM-dd"))
    {
        alert("出生年月不能大于等于当前日期！");
    }
    else {
        var index=0;
        var newgroupid=[];
        ($("#readersex option:selected").val()==="请选择")?readergender="":readergender=$("#readersex option:selected").text();
        // $("#classcheckbox input:checked").each(function () {
        //     //newgroupid[index]=parseInt(this.name);
        //     newgroupid[index]=this.name;
        //     index++;
        // });
        newgroupid[0] = $("#clainput").val();


        // var Detele= $.grep(getgroupid,function(n,i){
        //     return newgroupid.indexOf(n)<0;
        // });
        // console.log(newgroupid);
        // var Insert= $.grep(newgroupid,function(n,i){
        //     return getgroupid.indexOf(n)<0;
        // })
        //var Insert=newgroupid;
        var body={
            "barcode":$("#readerbarcode").val().trim(),
            "rfid":"", //选填$("#rfidno").val().trim()
            "identity":readeridentityno,
            "full_name":$("#readername").val().trim(),
            "gender":readergender,
            // "dob":$("#borndate").datebox('getValue'),
            "dob":$("#borndate").val(),
            "email":"", //选填
            "mobile": $("#contactno").val().trim(), //选填
            "address": $("#address").val().trim(), //选填
            // "postcode": $("#PostCode").val().trim(), //选填
            "postcode": "", //选填
            "profile_image":$("#userimage").prop("src"), //选填
            "restore_at":"",
            "is_active":true,
            "level_id":levelid,
            "group_ids":newgroupid
        }
        $.ajax({
            type: "PATCH",
            url: backServerUrl + "api/reader/members/"+modify_id+"?action=info",
            dataType: "json",
            contentType: 'application/json',
            data:JSON.stringify(body),
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.updated)
                {
                    alert("修改成功！");
                }
                Continue_User();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("修改失败！");
            },
            complete:Continue_User(),
        });
    }
}//读者修改接口

function Continue_User() {
    $("#selarea,#delselarea").find("label").remove();
    $("#userimagefile").prop("src","");
    $("#userimage").prop("src","");
    $("#pg21_tb1 caption").html("新增读者");
    $("#modifyornew").html("查找读者");
    $("#Saveuser").show();
    $("#ModifyUser").hide();
    $("#pg21_tb1 input").not(":checkbox").val("");
    $("#pg21_tb2 input").val("");
    // $("#pg21_tb3 input").val("");
    $("#pg21_tb4 input").val("");
    // $(".easyui-datebox").datebox();
    $("#classmanage").val("班级管理");

    var now = new Date();
    now.setYear(now.getYear() - 7 + 1900);
    var snow = now.format("yyyy-MM-dd");
    $("#borndate").val(snow);
    $("#registerdate").val(new Date().format("yyyy-MM-dd"));

    $(":checkbox").prop("checked",false);
    $("#readersex").val("请选择");
    $("#readerjob").val("请选择");
    $("#Saveuser").attr("disabled",true);
    $("#Saveuser").css("background-image","url('../images/Save_no-op.png')");
}//继续

function Save_User() {
    var readeridentityno=$("#identityno").val().trim();
    var datenow= new Date();
    if(readeridentityno.length > 19)  //身份证可以不填
    {
        alert("二代身份证号应为18位！");
        $("#Saveuser").prop("disabled",true);
        $("#Saveuser").css("background-image","url('../images/Save_no-op.png')");
    }
    // else if ($("#borndate").datebox('getValue')==datenow.format("yyyy-MM-dd") || $("#borndate").datebox('getValue')>datenow.format("yyyy-MM-dd"))
    else if ($("#borndate").val() == datenow.format("yyyy-MM-dd") || $("#borndate").val() > datenow.format("yyyy-MM-dd"))
    {
        alert("出生年月不能大于等于当前日期！");
    }
    else {
        var readerbarcode=$("#readerbarcode").val().trim();
        var readergender="";
        var index=0;
        groupid=[];
        ($("#readersex option:selected").val()==="请选择")?readergender="":readergender=$("#readersex option:selected").text();
        // $("#classcheckbox input:checked").each(function () {
        //     //group +=this.value;
        //     groupid[index]=this.name;
        //     index++;
        // });
        groupid[0] = $("#clainput").val();

        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var body={
            "barcode":readerbarcode,
            "rfid":"",//选填 $("#rfidno").val().trim(),
            "level_id":levelid, 
            // "new_level_id":"",
            "group_ids":groupid,
            "identity":readeridentityno,
            "full_name":$("#readername").val().trim(),
            "gender":readergender,
            // "dob":$("#borndate").datebox('getValue'),
            "dob":$("#borndate").val(),
            "email":"", //选填
            "mobile": $("#contactno").val().trim(), //选填
            "address": $("#address").val().trim(), //选填
            // "postcode": $("#PostCode").val().trim(), //选填
            "postcode": "", //选填
            "profile_image": $("#userimage").prop("src"), //选填
            "create_at":datenow
        };
        $.ajax({
            type: "POST",
            url: backServerUrl + "api/reader/members",
            dataType: "json",
            contentType: 'application/json',
            data:JSON.stringify(body),
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                alert("注册成功！");
                Continue_User();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("exists"))
                {
                    if(XMLHttpRequest.responseText.indexOf("barcode")>0)
                    {
                        alert("条码号已存在！");
                    }
                    else if(XMLHttpRequest.responseText.indexOf("identity")>0)
                    {
                        alert("身份证号已存在！");
                    }
                }
                else{
                    alert("注册失败！");
                }
            },
            // complete:Continue_User(),
        });
    }

}//保存读者

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
                localStorage.setItem(data.content[index].id, data.content[index].name);
            }
            $("#readerjob").append(levelinfo);
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
}//获取读者级别+存储level_id

function GetUserLevel_2(){
    $("#pg21_tb3 input").attr("readOnly",true);
    $("#pg21_tb3 input").val("");
    var optslc = $("#readerjob option:selected").text();
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/levels",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            for(var index in data.content)
            {
                if(data.content[index].name===optslc)
                {
                    levelid=data.content[index].id;
                    $("#generalbookno").val(data.content[index].borrow_rule.quantity);
                    $("#generalbookdeadline").val(data.content[index].borrow_rule.day);
                    // $("#journalno").val(data.content[index].journal_rule.quantity);
                    // $("#journaldeadline").val(data.content[index].general_book_rule.day);
                    // $("#ancientno").val(data.content[index].ancient_book_rule.quantity);
                    // $("#ancientdeadline").val(data.content[index].ancient_book_rule.day);
                    // $("#otherbookno").val(data.content[index].other_media_rule.quantity);
                    // $("#otherbookdeadline").val(data.content[index].other_media_rule.day);
                    $("#renewright").prop("checked",data.content[index].borrow_rule.can_renew);
                    $("#bookright").prop("checked",data.content[index].borrow_rule.can_book);
                }
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
}//获取不同级别对应权限

function GetClassInfo1(){
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $("#classcheckbox").find("label").remove();
    $("#delclasscheckbox").find("label").remove();
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/groups?limit=-1",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var gradeinfo="<ol>";
            var selectOption = "<option value='0'>非年组班级成员</option>";
            for(var index in data.content)
            {
                selectOption += "<option value='" + data.content[index].id + "'>" + data.content[index].name + "</option>";
                gradeinfo+="<li><label style='font-size: 18px;margin-right: 10px;'><input type='checkbox' name='"+data.content[index].id+"' value='"+data.content[index].name+"' style='height: 20px; width: 30px;'>"+data.content[index].name+"</label></li>";
                localStorage.setItem(data.content[index].id, data.content[index].name);
            }
            $("#clainput").append(selectOption);
            // $("#classcheckbox").append(gradeinfo);
            gradeinfo += "</ol>";
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

function GetUserID() {
    $(":checkbox").prop("checked",false);
    $("option").removeAttr("selected");
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var modify_barcode=$("#modify_barcode").val().trim();
    if(modify_barcode.length<=0)
    {
        alert("请输入借书证号！")
    }
    else {
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/reader/members?&barcode="+modify_barcode,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.count=="0")
                {
                    alert("借书证号不存在！");
                    // Continue_User();
                }
                else{
                    Modify_confirm(data.content[0].id);
                }
                //GetUserLevel_2();
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
                //$("#dialog-modify").dialog("close");
            },
        });
    }
}//获取读者id




