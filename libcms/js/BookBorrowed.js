//# sourceURL=BookBorrowed.js

var BookBorrowed = function () {
    var userid = "";
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    var Bookborrowed = new Vue({
        el:"#GetuserBorrowed",
        methods:{
            GetUser:function () {
                var barcode = $("#bookbarcode").val().trim();
                GetSingleUser_1(barcode, 0);
            },
            GetUserBorrowHistory:function () {
                var barcode = $("#bookbarcode").val().trim();
                GetSingleUser_1(barcode, 1);
            }
        }
    });

    $(document).ready(function () {

        $("#bookbarcode").on("keydown", function (evnet) {
            // 回车
            if (evnet.keyCode === 13) {
                var barcode=$("#bookbarcode").val().trim();
                if(barcode.length === 40){
                    barcode = barcode.substring(2,21);
                    // $("#userbook_barcode").val(barcode.substring(2,21));
                }
                $("#bookbarcode").val(barcode).select();
                $("#currentborrwobutton").click();
            }
        });

        $("#searchlist").on('click','.reborrow',function () {
            var bookbarcode=new Array();
            bookbarcode[0]=$(".reborrow").val();
            var Body={"book_barcodes":bookbarcode, "location":""};
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

    function GetSingleUser_1(barcode, borrowFlag) {
        if(barcode.length === 0){
            alert("借书证号不能为空!");
            return;
        }
        var url = "";
        if(borrowFlag === 0)
            url = backServerUrl + "api/reader/members/holdings?record=current&barcode="+barcode + "&ordering=status";
        else
            url = backServerUrl + "api/reader/members/holdings?record=all&barcode="+barcode + "&ordering=status";
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                // if(data.count==0||data.content[0].hasOwnProperty("errors"))
                // {
                //     $("#bookbarcode").val("");
                //     alert("借书证号不存在！");
                // }
                // else if(!data.content[0].is_active)
                // {
                //     $("#bookbarcode").val("");
                //     alert("该借书证已注销！");
                // }
                // else if(data.content[0].is_suspend)
                // {
                //     $("#bookbarcode").val("");
                //     alert("该借书证已停借！");
                // }
                $("#searchlistbody").empty();
                if(data.count === 0){
                    alert("没有借阅数据！");
                }else{
                    userid=data.content[0].id;

                    var datenow=new Date();
                    var str="";
                    for(var index in data.content)
                    {
                        var brw_date= new Date(data.content[index].datetime);
                        var due_date= new Date(data.content[index].due_at);
                        var status = "";
                        if(data.content[index].status === "borrow"){
                            status = "在借";
                            str+="<tr>" +
                                "<td>" + data.content[index].book.barcode + "</td>"+
                                "<td title='" + brw_date.format("yyyy-MM-dd hh:mm:ss") + "'>" + brw_date.format("yyyy-MM-dd") + "</td>"+
                                "<td></td>"+
                                "<td>" + due_date.format("yyyy-MM-dd") + "</td>"+
                                "<td>" + data.content[index].book.title + "</td>"+
                                "<td>" + status + "</td>"+
                                "<td class='overdue' value='" + (due_date<=datenow) + "' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td>"+
                                // "<td><button class='reborrow' value='"+data.content[index].book.barcode+"'>续借</button></td>"+
                                "</tr>";
                        }else  if(data.content[index].status === "renew"){
                            status = "续借";
                            str+="<tr>" +
                                "<td>" + data.content[index].book.barcode + "</td>"+
                                "<td title='" + brw_date.format("yyyy-MM-dd hh:mm:ss") + "'>" + brw_date.format("yyyy-MM-dd") + "</td>"+
                                "<td></td>"+
                                "<td>" + due_date.format("yyyy-MM-dd") + "</td>"+
                                "<td>" + data.content[index].book.title + "</td>"+
                                "<td>" + status + "</td>"+
                                "<td class='overdue' value='" + (due_date<=datenow) + "' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td>"+
                                "</tr>";
                        }else{
                            status = "已还";
                            str+="<tr>" +
                                "<td>" + data.content[index].book.barcode + "</td>"+
                                // "<td title='" + brw_date.format("yyyy-MM-dd hh:mm:ss") + "'>" + brw_date.format("yyyy-MM-dd") + "</td>"+
                                "<td title='" + data.content[index]._borrow.datetime.substring(0,10) + " " + data.content[index]._borrow.datetime.substring(11,19) + "'>" + data.content[index]._borrow.datetime.substring(0,10) + "</td>"+
                                "<td>" + data.content[index]._return.datetime.substring(0,10) + "</td>"+
                                "<td></td>"+
                                "<td>" + data.content[index].book.title + "</td>"+
                                "<td>" + status + "</td>"+
                                "<td class='overdue' value='" + (due_date<=datenow) + "' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td>"+
                                // "<td><button class='reborrow' value='"+data.content[index].book.barcode+"'>续借</button></td>"+
                                "</tr>";
                        }
                    }
                    $("#searchlistbody").append(str);
                    $(".overdue").each(function () {
                        if($(this).attr("value")=="true")
                        {
                            $(this).children().attr("checked",true);
                        }
                    });
                    // GetBorrowedBook();
                }
                $("#bookbarcode").focus();
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

    function GetBorrowedBook() {
        $("#searchlist").find("tr:gt(0)").remove();
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
                        "<td>"+data.content[index].book.barcode+"</td>"+
                        "<td>"+brw_date.format("yyyy-MM-dd hh:mm:ss")+"</td>"+
                        "<td>"+due_date.format("yyyy-MM-dd hh:mm:ss")+"</td>"+
                        "<td>"+data.content[index].book.title+"</td>"+
                        "<td class='overdue' value='"+(due_date<=datenow)+"' ><input type='checkbox' style='width: 40px;'disabled='disabled'></td>"+
                        "<td><button class='reborrow' value='"+data.content[index].book.barcode+"'>续借</button></td>"+
                        "</tr>";
                }
                $("#searchlistbody").append(str);
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

    return{

    }

}();










