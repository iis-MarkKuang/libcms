var connectfail = 0;
var userInfo;
var userid;


$(document).ready(function () {
    $("#pg43_tb3 input:gt(0)").prop("readOnly",true);

    $("#userbook_barcode").on('keypress',function () {
        var barcode=$("#userbook_barcode").val().trim();
        if(barcode.length === 40){
            $("#userbook_barcode").val(barcode.substring(2,21));
        }
    });

    $("#userbook_barcode").on('change',function () {
        $("#pg43_tb2 tr:gt(0)").remove();
        var barcode=$("#userbook_barcode").val().trim();
        // if(barcode.length==9)//书的条码号
        // {
        //     if($("#readerbarcode").val().length<=0)//未输入读者条码号，默认为还书
        //     {
        //         CheckBook(barcode);
        //         //ReturnBook(barcode);
        //     }
        //     else//借书
        //     {
        //         BorrowBook(barcode);
        //     }
        // }
        // else//读者条码号
        // {
        //     GetSingleUser_1(barcode);
        // }
        if(barcode.length === readerIdLength)//读者条码号
        {
            GetSingleUser_1(barcode);
        }
        else//书的条码号
        {
            if($("#readerbarcode").val().length<=0)//未输入读者条码号，默认为还书
            {
                CheckBook(barcode);
                //ReturnBook(barcode);
            }
            else//借书
            {
                BorrowBook(barcode);
            }
        }
        $("#userbook_barcode").val("");
    });

    $("#update").click(function () {
        $("#pg43_tb3").find("input").val("");
        $("#pg43_tb2").find("tr:gt(0)").remove();
    });

    $("#VerifyUser").on('click',function () {
        var barcode=$("#resbarcode").val().trim();
        var author=$("#resauthor").val().trim();
        var bookname=$("#resbookname").val().trim();
        if(barcode.length<=0)
        {
            alert("请输入读者编号!");
        }
        else{
            var et = window.localStorage["et"];
            var backServerUrl = window.localStorage["backServerUrl"];
            $.ajax({
                type: "GET",
                url: backServerUrl + "api/reader/members/"+barcode+"?by=barcode",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    if(data.hasOwnProperty("errors"))
                    {
                        $("#pg43_tb3 input").val("");
                        alert("借书证号不存在！");
                    }
                    else if(!data.is_active)
                    {
                        $("#pg43_tb3 input").val("");
                        alert("该借书证已注销！");
                    }
                    else if(data.is_suspend)
                    {
                        $("#pg43_tb3 input").val("");
                        alert("该借书证已停借！");
                    }
                    else
                    {
                        if(author.length<=0&&bookname.length<=0)
                        {
                            alert("请输入文献名或者作者进行查询！");
                        }
                        else {
                          ResSearchbook(author,bookname);
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
                },
            });
        }
    });

    // $("#pg43_tb2").find("button").on('click',function () {
    //     alert("ky");
    // })
    //
    // $(":button[name='reborrow']").on('click',function () {
    //     alert("ky");
    // })

    $("#pg43_tb2").on('click','.reborrow',function () {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var bookbarcode=new Array();
        bookbarcode[0]=$(".reborrow").val();
        var Body={"book_barcodes":bookbarcode,
            "location":""};
        $.ajax({
            type:"POST",
            url:backServerUrl+"api/reader/members/"+userid+"/renew",
            datatype:"json",
            headers:{'Content-Type':'application/json','Authorization':et},
            data:JSON.stringify(Body),
            success(data){
                for(var i in data)
                {
                    if(data[i].result.indexOf("已续借过次图书或已归还"))
                    {
                        alert("已续借过此图书！");
                    }
                    else{
                        alert(data[i].result);
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
            },
        })
    })
});

function GetSingleUser_1(barcode) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var groups_name="";
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/members?barcode="+barcode,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            if(data.count==0||data.content[0].hasOwnProperty("errors"))
            {
                $("#pg43_tb3 input").val("");
                alert("借书证号不存在！");
            }
            else if(!data.content[0].is_active)
            {
                $("#pg43_tb3 input").val("");
                alert("该借书证已注销！");
            }
            else if(data.content[0].is_suspend)
            {
                $("#pg43_tb3 input").val("");
                alert("该借书证已停借！");
            }
            else
            {
                userid=data.content[0].id;
                var level_name=localStorage.getItem(data.content[0].level);
                $("#pg43_tb3").find("input:eq(0)").val(data.content[0].full_name);
                $("#pg43_tb3").find("input:eq(1)").val(data.content[0].gender);
                $("#pg43_tb3").find("input:eq(2)").val(data.content[0].dob);
                $("#pg43_tb3").find("input:eq(3)").val(level_name);
                $("#userimage").prop("src",data.content[0].profile_image);
                for(var index in data.content[0].groups)
                {
                    groups_name += (","+localStorage.getItem(data.content[0].groups[index]));
                    $("#pg43_tb3").find("input:eq(4)").val(groups_name.substring(1));
                }
                $("#pg43_tb3").find("input:eq(7)").val(data.content[0].barcode);
                GetUserBorrowed(level_name);
                GetBorrowedBook();
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
}//获取读者详情

function GetUserBorrowed(levelname) {
    var datenow = new Date();
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var quantity=localStorage.getItem(levelname);
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/members/"+userid+"/holdings",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            for(var index in data.content)
            {
                if(new Date(data.content[index].due_at)<=datenow)
                {
                    alert("该借书证存在超期图书，不能再借书！");
                    $("#pg43_tb3").find("input").val("");
                    $("#pg43_tb2").find("tr:gt(0)").remove();
                    return;
                }
            }
            $("#pg43_tb3").find("input:eq(5)").val(quantity-data.count);
            $("#pg43_tb3").find("input:eq(6)").val(data.count);
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
}//获取读者在借图书详情

function GetBorrowedBook() {
    $("#pg43_tb2").find("tr:gt(0)").remove();
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var datenow=new Date();
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/members/"+userid+"/holdings",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var str="";
            for(var index in data.content)
            {
                var brw_date= new Date(data.content[index].datetime);
                var due_date= new Date(data.content[index].due_at);
                str+="<tr>" +
                    "<td>"+brw_date.format("yyyy-MM-dd hh:mm:ss")+"</td>"+
                    "<td>"+due_date.format("yyyy-MM-dd hh:mm:ss")+"</td>"+
                    "<td>"+data.content[index].book.barcode+"</td>"+
                    "<td>"+data.content[index].book.title+"</td>"+
                    "<td class='overdue' value='"+(due_date<=datenow)+"' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td>"+
                    "<td><button class='reborrow' value='"+data.content[index].book.barcode+"'>续借</button></td>"+
                    "</tr>";
            }
            $("#pg43_tb2").append(str);
            $(".overdue").each(function () {
                if($(this).attr("value")=="true")
                {
                    $(this).children().attr("checked",true);
                }
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
        },
    });
}//获取读者所借图书详情

function BorrowBook(barcode) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var readerbarcode=$("#readerbarcode").val().trim();
    var bookbarcode=new Array();
    bookbarcode[0]=barcode;
    var Body={"book_barcodes":bookbarcode,
    "location":""};
    $.ajax({
        type: "POST",
        // url: backServerUrl + "api/reader/members/"+userid+"/borrow",
        url: backServerUrl + "api/reader/members/"+userid+"/borrow_new",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        data:JSON.stringify(Body),
        success: function (data) {
            if(!data[0].borrowed)
            {
                alert(data[0].result);
            }
            else{
                alert((data[0].result).substring(0,(data[0].result).length-10));
            }
            GetBorrowedBook(readerbarcode);
            GetClassInfo1();
            GetSingleUser_1(readerbarcode);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.responseText.indexOf("普通图书超过可借上限"))
            {
                alert("普通图书超过可借上限!");
            }
            else{
                alert("借书失败!");
            }
            GetBorrowedBook(readerbarcode);
            GetClassInfo1();
            GetSingleUser_1(readerbarcode);
        },
    });
}//借书

function ReturnBook(barcode,fine) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var bookbarcode=new Array();
    bookbarcode[0]=barcode;
    var Body={"book_barcodes":bookbarcode,
    "location":"管理员"};
    $.ajax({
        type: "POST",
        url: backServerUrl + "api/book/return",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        data:JSON.stringify(Body),
        success: function (data) {
            if(data[0].returned)
            {
                if(fine.length>0)
                {
                    alert((data[0].result).substring(0,(data[0].result).length-10)+
                        ",超期图书逾期罚款为："+fine+"元！");
                }
                else{
                    alert((data[0].result).substring(0,(data[0].result).length-10));
                }
            }
            else{
                alert(data[0].result);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.responseText);
        },
    });
}//还书

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
                localStorage.setItem(val.name, val.borrow_rule.quantity);
            });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.statusText == "Forbidden")
            {
                alert("缺少获取职别信息的权限！无法操作文献流通界面！");
            }
            else{
                alert("获取职别信息失败！");
            }
        }
    });
}//存储level_id

function GetClassInfo1(){
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/reader/groups",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var gradeinfo="";
            for(var index in data.content)
            {
                localStorage.setItem(data.content[index].id, data.content[index].name);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.statusText =="Forbidden")
            {
                alert("缺少获取群组信息的权限！无法操作文献流通界面！");
            }
            else{
                alert("获取群组信息失败！");
            }
        }
    });
}//存储group_id

function CheckBook(barcode) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/book/fine?barcode="+barcode,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            if(data.hasOwnProperty("fine"))
            {
                ReturnBook(barcode,data.fine);
            }
            // else if(data.hasOwnProperty("message"))
            // {
            //     if(data.message=="reader has no borrow record with the book that should be fined")
            //     {
            //
            //     }
            // }
            else{
                ReturnBook(barcode,"");
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
}//检测图书是否超期









