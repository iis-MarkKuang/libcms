var Bookfine = function () {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $("#pg27_tb2").on('click','.reborrow',function () {
        var bookid =$(".bookbarcode").html();
        var surl=backServerUrl+"api/reader/members/"+userid+"/lostfine?book_barcode="+bookid;
        Pay(surl,"lost");
    })

    var Paytime = new Vue({
        el:"#PayTime",
        data:{},
        methods:{
            search:function () {
                var readerbarcode =$("#readerbarcode").val();
                if(readerbarcode.length<=0)
                {
                    alert("借书证号为空！");
                    return;
                }
                else{
                    GetSingleUser(readerbarcode);
                }
            },
            deal:function () {
                Deal();
            }
        }
    });

    function GetSingleUser(barcode) {
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/reader/members?barcode="+barcode,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.count==0)
                {
                    alert("借书证号不存在！");
                }
                else if(!data.content[0].is_active)
                {
                    alert("该借书证已注销！");
                }
                // else if(data.content[0].is_suspend)
                // {
                //     $("#pg43_tb3 input").val("");
                //     alert("该借书证已停借！");
                // }
                else
                {
                    userid = data.content[0].id;
                    GetBorrowedBook(userid);
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

    function GetBorrowedBook(userid) {
        var datenow=new Date();
        $("#pg27_tb2").find('tr:gt(0)').remove();
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
                        "<td class='bookbarcode'>"+data.content[index].book.barcode+"</td>"+
                        "<td>"+data.content[index].book.title+"</td>"+
                        "<td class='overdue' value='"+(due_date<=datenow)+"' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td>"+
                        "<td><button class='reborrow'>查询</button></td>"+
                        "</tr>";
                }
                $("#pg27_tb2").append(str);
                $(".overdue").each(function () {
                    if($(this).attr("value")=="true")
                    {
                        $(this).children().attr("checked",true);
                    }
                });
                var surl=backServerUrl+"api/reader/members/"+userid+"/fine";

                Pay(surl,"delayed");
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

    function Pay(surl,flag) {
        $.ajax({
            type:"GET",
            url:surl,
            datatype:"json",
            headers:{'Content-Type':'application/json','Authorization':et},
            success(data){
                if(flag=="delayed")
                {
                    $("#finenum").val(data.delayed_fine);
                }
                else if(flag=="lost")
                {
                    $("#finenum").val(data.lost_fine);
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
    }//两种赔罚查询接口

    function Deal() {
        console.log(userid);
        var paynow = $("#finenum").val();
        $.ajax({
            type:'PUT',
            url:backServerUrl+"api/reader/members/"+userid+"/credit/deduct?amount="+paynow,
            datatype:'json',
            headers:{'Content-Type':'application/json','Authorization':et},
            success(data){
                if(data.result)
                {
                    alert("扣款成功，余额为："+data.credit_left+"元");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.status == 400){
                   alert("该读者未欠款！");
                }
                else if(XMLHttpRequest.status == 412)
                {
                    alert("欠款太多，余额不足！");
                }
            },
        })
    }//处理罚款接口

}();