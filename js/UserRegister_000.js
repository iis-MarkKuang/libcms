var UserRegister = function () {

    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var Datenow = new Date();
    var datenow=Datenow.format("yyyy-MM-dd");
    var groupid=[];
    var levelid="";

    var Userregister = new Vue({
        el:"#ReaderRegister",
        data:{
            UserBarcode:"",
            UserIdentity:"",
            Name:"",
            Group:"",
            Level:"请选择 ",
            //Birth:"",
            Gender:"请选择",
            Phonenumber:"",
            Postcode:"",
            Address:"",
            BookNo:"",
            BookAuth:"",
            PeriodicalNo:"",
            PeriodicalAuth:"",
            AncientNo:"",
            AncientAuth:"",
            OthersNo:"",
            OthersAuth:"",
            ReserveAuth:"",
            ReborrowAuth:"",
            Barcode:"",
            Identity:"",
        },
        methods:{
            UserSearch:function () {

            },//查找读者

            Save:function () {
                if(Userregister.Name.length<=0)
                {
                    alert("读者姓名不能为空！");
                }
                else if(Userregister.Group.length<=0)
                {
                    alert("年级组别班级不能为空！");
                }
                else if(Userregister.Level.trim()==="请选择")
                {
                    alert("读者职别不能为空！");
                }
                else if ($("#borndate").datebox('getValue')==datenow
                    ||$("#borndate").datebox('getValue')>datenow)
                {
                    alert("出生年月不能大于等于当前日期！");
                }
                else if(Userregister.Gender!=="男"&&Userregister.Gender!=="女")
                {
                    alert("性别不能为空！");
                }
                else if(Userregister.Barcode.length<=0)
                {
                    alert("条码号不能为空！");
                }
                else if(Userregister.Identity.length!=18)
                {
                    alert("二代身份证号应为18位！");
                }
                else {
                    Checkduplicate();
                }
            },//保存读者

            NewAndClear:function () {
                NewAndClearFunc();
            },//新建or清除

            GetLevelAuth:function () {
                $(".levelauth").attr("readOnly",true);
                $(".levelauth").val("");
                $.ajax({
                    type: "GET",
                    url: backServerUrl + "api/reader/levels",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    success: function (data) {
                        $.each(data.content,function (i,o) {
                            if(o.name===Userregister.Level)
                            {
                                levelid=o.id;
                                Userregister.BookNo=o.borrow_rule.quantity;
                                Userregister.BookAuth=o.borrow_rule.day;
                                // $("#journalno").val(data.content[index].journal_rule.quantity);
                                // $("#journaldeadline").val(data.content[index].general_book_rule.day);
                                // $("#ancientno").val(data.content[index].ancient_book_rule.quantity);
                                // $("#ancientdeadline").val(data.content[index].ancient_book_rule.day);
                                // $("#otherbookno").val(data.content[index].other_media_rule.quantity);
                                // $("#otherbookdeadline").val(data.content[index].other_media_rule.day);
                                Userregister.ReserveAuth=o.borrow_rule.can_book;
                                Userregister.ReborrowAuth=o.borrow_rule.can_renew;
                            }
                        })
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log("GetLevelAuth_error");
                    }
                });
            }//获取职别权限
        }
    });

    $(document).ready(function () {
        var connectfail = 0;
        var userInfo;
        var getgroupid=new Array();
        var readerdob="";
        var modify_id="";

        $("#pg21_tb1,#pg21_tb2").on('change','input,select',function () {
            User_monitor();
        })

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
                $("#Group").val("");
                var selAreachosen="";
                selAreainput.each(function () {
                    selAreachosen += ("," + this.value);
                });
                $("#Group").val(selAreachosen.substring(1))
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

        function User_monitor() {
            var index=0;
            var datenow=new Date();
            var readerbarcode=$("#readerbarcode").val().trim();
            var readeridentityno=$("#identityno").val().trim();
            var readerfull_name=$("#readername").val().trim();
            var readerlevel="";
            var readergender="";
            ($("#readersex option:selected").val()==="请选择")?readergender="":readergender=$("#readersex option:selected").val();
            ($("#readerjob option:selected").val()==="请选择")?readerlevel="":readerlevel=$("#readerjob option:selected").val();
            groupid=[];
            if($("input[type='checkbox']").is(':checked')) {
                var index = 0;
                $("#classcheckbox input:checked").each(function () {
                    groupid[index] = this.name;
                    index++;
                });
            }
            if(readerbarcode!=""&&readeridentityno!=""&&readerfull_name!=""&&readergender!=""&&
                readerlevel!=""&&groupid!=""&&readerdob!="")
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

        function Modify_cancel() {
            //$("#dialog-modify").modal("close");
            $("#pg21_tb1 caption").html("新增读者");
            $("#modifyornew").html("修改读者");
            //$("#dialog-modify").dialog("close");
        }//修改读者取消

        function Modify_confirm(UserID) {
            $(":checkbox").prop("checked",false);
            $("option").removeAttr("selected");
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
                            $("#PostCode").val(data.postcode);
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
                            var groupstr="";
                            for(var index in data.groups)
                            {
                                groupstr += (","+localStorage.getItem(data.groups[index]));
                                $("#classcheckbox input[type='checkbox'][value='"+localStorage.getItem(data.groups[index])+"']").prop("checked",true);
                                getgroupid[index]=data.groups[index];
                            }
                            $("#selarea").append($("#classcheckbox").find(":checked").parent().clone().css({"width":"","background":"","border":""}));
                            $("#Group").val(groupstr.substring(1));
                            $("#borndate").datebox("setValue",data.dob);
                            $("#registerdate").datebox("setValue",data.create_at.substring(0,10));
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
            var datenow= new Date();
            if(readeridentityno.length!=18)
            {
                alert("二代身份证号应为18位！");
                $("#Saveuser").prop("disabled",true);
                $("#Saveuser").css("background-image","url('../images/Save_no-op.png')");
            }
            else if ($("#borndate").datebox('getValue')==datenow.format("yyyy-MM-dd")
                ||$("#borndate").datebox('getValue')>datenow.format("yyyy-MM-dd"))
            {
                alert("出生年月不能大于等于当前日期！");
            }
            else {
                var index=0;
                var newgroupid=[];
                ($("#readersex option:selected").val()==="请选择")?readergender="":readergender=$("#readersex option:selected").text();
                $("#classcheckbox input:checked").each(function () {
                    //newgroupid[index]=parseInt(this.name);
                    newgroupid[index]=this.name;
                    index++;
                });
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
                    "dob":$("#borndate").datebox('getValue'),
                    "email":"", //选填
                    "mobile": $("#contactno").val().trim(), //选填
                    "address": $("#address").val().trim(), //选填
                    "postcode": $("#PostCode").val().trim(), //选填
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

        function GetUserID() {
            $(":checkbox").prop("checked",false);
            $("option").removeAttr("selected");
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
                            Continue_User();
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
    });

    function SaveFunc() {
        var surl = backServerUrl + "api/reader/members";
        groupid=[];
        var index = 0;
        (Userregister.Gender==="请选择")?Userregister.Gender="":Userregister.Gender=Userregister.Gender;
        $("#classcheckbox input:checked").each(function () {
            //group +=this.value;
            groupid[index]=this.name;
            index++;

        });

        var body={
            "barcode":Userregister.Barcode,
            "rfid":"",//选填 $("#rfidno").val().trim(),
            "level_id":levelid,
            // "new_level_id":"",
            "group_ids":groupid,
            "identity":Userregister.Identity,
            "full_name":Userregister.Name,
            "gender":Userregister.Gender,
            "dob":$("#borndate").datebox('getValue'),
            "email":"", //选填
            "mobile": Userregister.Phonenumber, //选填
            "address": Userregister.Address, //选填
            "postcode": Userregister.Postcode, //选填
            "profile_image": $("#userimage").prop("src"), //选填
            "create_at":Datenow
        }
        $.ajax({
            type: "POST",
            url: surl,
            dataType: "json",
            contentType: 'application/json',
            data:JSON.stringify(body),
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                alert("注册成功！");
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
            complete:NewAndClearFunc(),
        });
    }

    function NewAndClearFunc() {
        UserBarcode="";
        UserIdentity="";
        Name="";
        Group="";
        Level="请选择";
        //Birth:"",
        Gender="请选择";
        Phonenumber="";
        Postcode="";
        Address="";
        BookNo="";
        BookAuth="";
        PeriodicalNo="";
        PeriodicalAuth="";
        AncientNo="";
        AncientAuth="";
        OthersNo="";
        OthersAuth="";
        ReserveAuth="";
        ReborrowAuth="";
        Barcode="";
        Identity="";
        // $("#selarea,#delselarea").find("label").remove();
        // $("#userimagefile").prop("src","");
        // $("#userimage").prop("src","");
        $(".easyui-datebox").datebox();
        // $(":checkbox").prop("checked",false);
    }

    function GetClassInfo(){
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/reader/groups",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                var gradeinfo="";
                $.each(data.content,function (i) {
                    gradeinfo+="<label style='font-size: 18px;margin-right: 10px;'><input type='checkbox' name='"+data.content[i].id+"' value='"+data.content[i].name+"' style='height: 20px; width: 30px;'>"+data.content[i].name+"</label>";
                    localStorage.setItem(data.content[i].id, data.content[i].name);
                })
                $("#classcheckbox").append(gradeinfo);
                // for(var index in data.content)
                // {
                //     gradeinfo+="<label style='font-size: 18px;margin-right: 10px;'><input type='checkbox' name='"+data.content[index].id+"' value='"+data.content[index].name+"' style='height: 20px; width: 30px;'>"+data.content[index].name+"</label>";
                //     localStorage.setItem(data.content[index].id, data.content[index].name);
                // }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("getclass_error");
            }
        });
    }//获取读者群组（XX届XX班）+存储group_id

    function GetUserLevel_1(param){
        if(param=="register")
        {
            $(".levelauth").attr("readOnly",true);
            $(".levelauth").val("");
        }
        else if(param=="manage")
        {
            $("#readerjob").empty();
        }
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/reader/levels",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                var levelinfo="<option>请选择</option>";
                $.each(data.content,function (i) {
                    levelinfo+="<option name='"+data.content[i].id+"' value='"+data.content[i].name+"'>"+data.content[i].name+"</option>";
                    localStorage.setItem(data.content[i].id, data.content[i].name);
                })
                // for(var index in data.content)
                // {
                //     levelinfo+="<option name='"+data.content[index].id+"' value='"+data.content[index].name+"'>"+data.content[index].name+"</option>";
                //     localStorage.setItem(data.content[index].id, data.content[index].name);
                // }
                $("#Level").append(levelinfo);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("level_error");
            }
        });
    }//获取读者级别+存储level_id

    function Checkduplicate(){
        var duplicate_barcode=Userregister.Barcode;
        var duplicate_identity=Userregister.Identity;
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
                    SaveFunc();
                }
                else
                {
                    alert("该读者证或身份证号已存在！");
                    //NewAndClearFunc();
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

    function onSelect(date){
        readerdob=date.format("yyyy-MM-dd");
        //User_monitor();
    }

    return{
        Userregister:Userregister,
        onSelect:onSelect,
        GetClassInfo:GetClassInfo,
        GetUserLevel_1:GetUserLevel_1,
    }
}();