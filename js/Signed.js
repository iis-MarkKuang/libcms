//# sourceURL=Signed.js
var studentSigned = function () {
    var userid = "";
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];


    $(document).ready(function () {
        // $(document).keydown(function (evnet) {
        $("#barcode").on("keydown", function (evnet) {
            // 回车
            if (evnet.keyCode === 13) {
                // setTimeout(function(){
                //     Sign();
                // },0);
                Sign();
                // e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            }
        });

        GetClassList();
        var now = new Date().format("yyyy-MM-dd");
        $("#starttime").val(now);
        // $("#endtime").val(now);
    });

    $("#barcode").on('keypress',function () {
        var barcode=$("#barcode").val().trim();
        if(barcode.length === 40){
            $("#barcode").val(barcode.substring(2,21));
            $("#barcode").select();
        }
    });

    function Sign() {
        // $("#searchlist").find("tr:gt(0)").remove();
        var barcode = $("#barcode").val();
        if(barcode === ""){
            alert("条码号不能为空!");
            return;
        }
        if(barcode.length === 40){
            barcode = barcode.substring(2,21);
            $("#barcode").val(barcode);
            $("#barcode").select();
        }

        var find = 0;
        $("#signedlist tr").each(function(){
            var text = $(this).children("td:first").text();
            var signedtime = $(this).children("td:eq(3)").text().trim();
            if(text === barcode && signedtime != "") {
                find = 1;
            }
        });
        if(find === 1){
            alert("已经签到，不用再次签到!");
            return;
        }

        $.ajax({
            type: "POST",
            url: backServerUrl + "api/reader/check_in",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: "{\"barcode\":\"" + barcode + "\"}",
            success: function (data) {
                console.log(data);
                if(data.created){
                    GetStudentByClass();
                    alert("签到成功!");
                } else {
                    if(data.result.indexOf("reader not found") > -1){
                        alert("签到失败! - 未找到该读者");
                    }else{
                        alert("签到失败!");
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

    function PrintCountTable(tableID,title)
    {
        var op = window.open();
        op.document.writeln('<!DOCTYPE html><html><head><style type="text/css" media="print">@page { size: landscape; }</style></head><body>');
        op.document.writeln("<div style='margin: auto auto 30px; width:90%; font-size: 30px; text-align: center;'>" + title + "</div>");
        //op.document.writeln("<div style='margin: auto; width:90%;'>起始日期：" + startTime + " 结束日期：" + endTime + "</div>");
        op.document.writeln(tableID.outerHTML);
        //op.document.writeln('<script>document.getElementById(\"'+tableID.getAttribute("id")+'\").style.display = ""</script>');
        op.document.writeln('<script>document.getElementById(\"'+tableID.getAttribute("id")+'\").style.fontSize = "12pt"</script>');
        op.document.writeln('<script>window.print()</script>');
        op.document.writeln('</body></html>');
        op.document.close();
    }

    function GetSignedStudent() {
        $("#searchlist").find("tr:gt(0)").remove();
        var startTime = $("#starttime").val();
        var endTime = $("#endtime").val()
        var intSTime = Date.parse(startTime)  - 60*60*8*1000;
        var intETime = Date.parse(endTime) + 60*60*16*1000;
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/current_borrowed?query=history&start_time=" + intSTime + "&end_time=" + intETime,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.result[0].current_records_by_group.length > 0){
                    var str="";
                    var classspan = 1;
                    var namespan = 1;
                    data.result[0].current_records_by_group.forEach(function (o) {
                        classspan = 1;
                        var str1 ="<tr>" + "<td rowspan='" + classspan + "'>" + o.group_name + "</td>";
                        o.current_holders.forEach(function (holder) {
                            classspan++;
                            var str2 = "<td>" + holder.reader_name + "</td>";
                            holder.current_holdings.forEach(function (bi) {
                                classspan++;
                                str += str1 + str2 + "<td>" + bi.book_title + "</td>" + "<td>" + bi.book_count + "</td></tr>";
                            })
                        });
                    });
                    $("#searchlistbody").append(str);
                    autoRowSpan(booklist, 0, 1);
                    autoRowSpan(booklist, 0, 0);
                } else {
                    alert("没有借阅数据!");
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

    function GetStudentByClass() {
        var classname = $("#signclass").find("option:selected").text();
        var startTime = $("#starttime").val();
        var endTime = $("#starttime").val();
        var intSTime = Date.parse(startTime)  - 60*60*8*1000;
        var intETime = Date.parse(endTime) + 60*60*16*1000;
        $.ajax({
            type: "GET",
            // url: backServerUrl + "api/reader/check_in?group_name=" + classname,
            url: backServerUrl + "api/group/reader/check_in/status?group_name=" + classname + "&start_time=" + intSTime + "&end_time=" + intETime,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                $("#signedlist").empty();
                if(data.result.length > 0){
                    var tr = "";
                    var signedCount = 0;
                    data.result.forEach(function (o) {
                        // console.log(o.barcode);
                        tr += "<tr><td>" + o.barcode + "</td><td>" + o.full_name + "</td><td>" + o.group_name + "</td><td>" + o.datetime.substring(0,10) + " " + o.datetime.substring(11,19) + "</td></tr>";
                        if(o.datetime.trim().length > 0)
                            signedCount++;
                    });
                    $("#signedlist").append(tr);
                    $("#signedcount").html(startTime + "&nbsp;&nbsp;&nbsp;&nbsp;班级共 " + data.result.length + " 人 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 签到 " + signedCount + " 人");
                }else{
                    alert("该时间段没有数据");
                    $("#signedcount").html(startTime + "&nbsp;&nbsp;&nbsp;&nbsp;班级共 0 人 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 签到 0 人");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                     //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
                    alert("GetStudentByClass 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        });
    }

    function GetClassList(){
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
                $("#signclass").empty();
                // $("#supplier").append("<option text='' value='0'></option>");
                data.content.forEach(function (o) {
                    $("#signclass").append("<option text='" + o.name +"' value='" + o.id +"'>" + o.name + "</option>");
                    // booksellerToIdMap[o.name] = o.id;
                })
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

    return{
        Sign : Sign,
        GetClassList : GetClassList,
        GetStudentByClass : GetStudentByClass,
        PrintCountTable : PrintCountTable
    }

}();










