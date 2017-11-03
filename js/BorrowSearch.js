//# sourceURL=BorrowSearch.js
var borrowSearch = function () {
    var userid = "";
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];


    $(document).ready(function () {
        var now = new Date().format("yyyy-MM-dd");
        $("#starttime").val(now);
        $("#endtime").val(now);
    });

    function GetBookByClass() {
        $("#searchlist").find("tr:gt(0)").remove();
        var datenow=new Date();
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/current_borrowed?query=current",
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

    function autoRowSpan(tb,row,col)
    {
        var lastValue="";
        var value="";
        var pos=1;
        for(var i=row;i<tb.rows.length;i++){
            value = tb.rows[i].cells[col].innerText;
            if(lastValue == value){
                tb.rows[i].deleteCell(col);
                tb.rows[i-pos].cells[col].rowSpan = tb.rows[i-pos].cells[col].rowSpan+1;
                pos++;
            }else{
                lastValue = value;
                pos=1;
            }
        }
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

    function GetAllBookByClass() {
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

    return{
        GetBookByClass : GetBookByClass,
        autoRowSpan : autoRowSpan,
        PrintCountTable : PrintCountTable,
        GetAllBookByClass : GetAllBookByClass
    }

}();










