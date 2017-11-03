//# sourceURL=DocumentManagement.js
// var gusergroup;   //SetCheckbox要用的变量
var booksellerToIdMap = {};
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

function PrintCountTableByRaw(tableID,title,start,end)
{
    var op = window.open();
    op.document.writeln('<!DOCTYPE html><html><head><style type="text/css" media="print">@page { size: landscape; }</style></head><body>');
    op.document.writeln("<div style='margin: auto auto 30px; width:90%; font-size: 30px; text-align: center;'>" + title + "</div>");
    //op.document.writeln("<div style='margin: auto; width:90%;'>起始日期：" + startTime + " 结束日期：" + endTime + "</div>");
    op.document.writeln(tableID.outerHTML);
    //op.document.writeln('<script>document.getElementById(\"'+tableID.getAttribute("id")+'\").style.display = ""</script>');
    op.document.writeln('<script>document.getElementById(\"'+tableID.getAttribute("id")+'\").style.fontSize = "12pt"</script>');
    op.document.writeln('<script>var rows = edittable.querySelectorAll("tbody tr").length;' +
        'for(var i=0; i<rows; i++){var txt = edittable.querySelectorAll("tbody tr")[i].querySelector("td").innerText;' +
        'if(txt < ' + start.value + ' || txt > ' + end.value + ')edittable.querySelectorAll("tbody tr")[i].style.display = "none";}</script>');
    op.document.writeln('<script>window.print()</script>');
    op.document.writeln('</body></html>');
    op.document.close();
}

function PrintDynamicTable(tableID,title,ec)
{
    // GetDynamicTableHtml(tableID);
    var op = window.open();
    op.document.writeln('<!DOCTYPE html><html><head><style type="text/css" media="print">@page { size: landscape; }</style></head><body>');
    op.document.writeln("<div style='margin: auto auto 30px; width:90%; font-size: 30px; text-align: center;'>" + title + "</div>");
    op.document.writeln(GetDynamicTableHtml(tableID,ec));
    op.document.writeln('<script>document.getElementById(\"'+tableID.id+'\").style.fontSize = "12pt"</script>');
    op.document.writeln('<script>window.print()</script>');
    op.document.writeln('</body></html>');
    op.document.close();
}

function GetDynamicTableHtml(tableID, ec) {
    var table = "<table cellspacing='0' border='1px;' style='border-collapse:collapse;'>";
    var trobj = "";
    var tdobj = "";

    if($("#dispcount").text() !== "")
        table +="<caption style='text-align: left;'>" + $("#dispcount").text() + "</caption>";
    if($("#dispscount").text() !== "")
        table +="<caption style='text-align: left;'>" + $("#dispscount").text() + "</caption>";
    table +="<thead>";
    $("#"+ tableID.id + " thead tr").each(function (index, o) {
        tdobj = "";
        $(o).children('th').each(function (i, ob) {
            if(i !== ec)
                tdobj += "<th>" + $(ob).text() + "</th>";
        });
        trobj += "<tr>" + tdobj + "</tr>";
    });
    table += trobj + "</thead><tbody>";

    trobj = "";
    $("#"+ tableID.id + " tr").each(function (index, o) {
        tdobj = "";
        $(o).children('td').each(function (i, ob) {
            if(i !== ec){
                if($(ob).children('input').val() === undefined) {
                    tdobj += "<td>" + $(ob).text() + "</td>";
                }else{
                    tdobj += "<td>" + $(ob).children('input').val() + "</td>";
                }
            }
        });
        trobj += "<tr>" + tdobj + "</tr>";
    });
    table += trobj + "</tbody></table>";
    return table;
}

function GetBookSeller() {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    $.ajax({
        type: "GET",
        url: backServerUrl + "api/vendor/members?limit=-1&offset=",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            $("#supplier").empty();
            // $("#supplier").append("<option text='' value='0'></option>");
            data.content.forEach(function (o) {
                $("#supplier").append("<option text='" + o.name +"' value='" + o.id +"'>" + o.name + "</option>");
                booksellerToIdMap[o.name] = o.id;
            })
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var functionName = "GetBookSeller";
            alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        }
    });
}

function SearchPreorderAll() {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    // var startdate = $("#startdate").datebox("getValue");
    // var enddate = $("#enddate").datebox("getValue");
    var startdate = $("#startdate").val();
    var enddate = $("#enddate").val();
    var vendor_id = $("#supplier").val();
    var ordertype = $("#ordertype").val();

    $.ajax({
        type: "GET",
        url: backServerUrl + "api/vendor/orders?limit=-1&offset=&start=2000-01-01T00:00:00.001%2B08:00&end=2030-12-31T23:59:59.999%2B08:00&is_arrived=" + ordertype + "&vendor_id=" + vendor_id + "&order_date=" + startdate + "," + enddate,
        dataType: "json",
        headers: {'Content-Type': 'application/json', 'Authorization': et},
        beforeSend:function () {
            $("#searchbutton").addClass("breath_light");
        },
        success: function (data) {
            var body = "";
            if(data.count==0)
            {
                $("#edittable tbody").html(body);
                alert("该时间内无数据！");
            }
            else{
                var obcount = 0;
                var opcount = 0;
                var rbcount = 0;
                var rpcount = 0;
                data.content.forEach(function(o){
                    obcount += o.quantity;
                    opcount += o.price * o.quantity;
                    rbcount += o.actual_quantity;
                    rpcount += o.actual_total;
                    body += "<tr style='height: 30px; background-color: white;'><td>" + o.id + "</td><td>" + o.title + "</td><td>" + o.author + "</td><td>" + o.publisher + "</td><td>" + o.isbn + "</td><td style='text-align: right'>" + o.price + "</td><td style='text-align: right'>" + o.quantity + "</td><td style='text-align: right'>" + o.total + "</td><td>" + o.vendor.name + "</td><td>" + o.order_date.substring(0, 10) + "</td><td>" + o.arrive_at.substring(0, 10) + "</td><td style='text-align: right'>" + o.actual_price + "</td><td style='text-align: right'>" + o.actual_quantity + "</td><td style='text-align: right'>" + o.actual_total + "</td><td>" + o.description + "</td><td>" + o.user + "</td><td><input type='button' value='删除' onclick='DeleteBookOrder(\""+ o.id+ "\",this)'></td></tr>" ;
                    // if(o.actual_quantity === 0){
                    //     body += "<tr style='height: 30px; background-color: white;'><td>" + o.id + "</td><td>" + o.title + "</td><td>" + o.author + "</td><td>" + o.publisher + "</td><td>" + o.isbn + "</td><td style='text-align: right'>" + o.price + "</td><td style='text-align: right'>" + o.quantity + "</td><td style='text-align: right'>" + o.total + "</td><td>" + o.vendor.name + "</td><td>" + o.order_date.substring(0, 10) + "</td><td>" + o.arrive_at.substring(0, 10) + "</td><td style='text-align: right'>" + o.actual_price + "</td><td style='text-align: right'>" + o.actual_quantity + "</td><td style='text-align: right'>" + o.actual_total + "</td><td>" + o.description + "</td><td>" + o.user + "</td><td><input type='button' value='删除' onclick='DeleteBookOrder(\""+ o.id+ "\",this)'></td></tr>" ;
                    // } else {
                    //     body += "<tr style='height: 30px; background-color: white;'><td>" + o.id + "</td><td>" + o.title + "</td><td>" + o.author + "</td><td>" + o.publisher + "</td><td>" + o.isbn + "</td><td style='text-align: right'>" + o.price + "</td><td style='text-align: right'>" + o.quantity + "</td><td style='text-align: right'>" + o.total + "</td><td>" + o.vendor.name + "</td><td>" + o.order_date.substring(0, 10) + "</td><td>" + o.arrive_at.substring(0, 10) + "</td><td style='text-align: right'>" + o.actual_price + "</td><td style='text-align: right'>" + o.actual_quantity + "</td><td style='text-align: right'>" + o.actual_total + "</td><td>" + o.description + "</td><td>" + o.user + "</td><td></td></tr>" ;
                    // }
                });
                $("#edittable tbody").html(body);
                $("#dispscount").html("预订总册数: " + obcount + "  &nbsp;&nbsp;&nbsp;&nbsp;预订总金额: " + opcount.toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp; 实到总册数: " + rbcount + "&nbsp;&nbsp;&nbsp;&nbsp;实际总金额: " + rpcount.toFixed(2));
            }
        },
        complete:function () {
            $("#searchbutton").removeClass("breath_light");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#searchbutton").removeClass("breath_light");
            var functionName = "SearchPreorderAll";
            alert(functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        }
    });
}

function DeleteBookOrder(orderid, rowobj) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    if(confirm("确定删除订单号为 " + orderid + " 订单吗?")){
        $.ajax({
            type: "DELETE",
            url: backServerUrl + "api/vendor/orders/" + orderid,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                $(rowobj).parent().parent().remove();
                CountOrderPrice1();
                alert("订单删除成功!");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName = "DeleteBookOrder";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }
}

function CountOrderPrice1() {
    var obcount = 0;
    var opcount = 0;
    var rbcount = 0;
    var rpcount = 0;
    $("#edittable").children("tbody").children("tr").each(function(){
        obcount += Number.parseFloat($(this).children("td").eq(6).text());
        opcount += Number.parseFloat($(this).children("td").eq(7).text());
        rbcount += Number.parseFloat($(this).children("td").eq(12).text());
        rpcount += Number.parseFloat($(this).children("td").eq(13).text());
    });
    $("#dispscount").html("预订总册数: " + obcount + "  &nbsp;&nbsp;&nbsp;&nbsp;预订总金额: " + opcount.toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp; 实到总册数: " + rbcount + "&nbsp;&nbsp;&nbsp;&nbsp;实际总金额: " + rpcount.toFixed(2));
}


function testnumber(obj)
{
    if(!(/^((?!0)\d+(\.\d{1,2})?)$/g.test(obj.value))){
        alert("请输入正确的数据格式！(整数或小数)");
        //先把非数字的都替换掉，除了数字和.
        obj.value = obj.value.replace(/[^.\d]/g,'');
    }
    var price = $(obj).parent().parent().children('td').eq(4).children('input').val();
    var count = $(obj).parent().parent().children('td').eq(5).children('input').val();
    $(obj).parent().parent().children('td').eq(6).children('input').val((price * count).toFixed(2));
    CountOrderPrice();
}

function CountOrderPrice() {
    var bcount = 0;
    var pcount = 0;
    $("#edittable").children("table").children("tbody").children("tr").each(function(){
        bcount += Number.parseFloat($(this).children("td").eq(5).children("input").val());
        pcount +=Number.parseFloat($(this).children("td").eq(6).children("input").val());
    });
    $("#dispcount").text("总册数: " + bcount + "       总价格: " + pcount);
}

function MoveBookFromLibrary() {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var barcode = $("#recordnumber").val();
    var date = new Date().format("yyyy-MM-dd");
    $.ajax({
        type: "GET",
        url: backServerUrl + "api/book/items?barcode=" + barcode,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            if(data.content.length > 0){
                var stackId = data.content[0].stack_id;
                var instackID = $("#stacks").val();
                var description = "移库";
                var jsondata = JSON.stringify({"book_barcodes":[barcode],"stack_id":instackID,"description":description});

                // var index = $("#movelibbody").find("tr").length + 1;
                // var olib =  $('#stacks').find('option[value=' + data.content[0].stack_id + ']').text();
                // var movlibbody = "<tr><td style='text-align: right;'>" + index + "</td><td>" + date + "</td><td>" + barcode + "</td><td>" + data.content[0].title + "</td><td>" + data.content[0].clc + "</td><td>" + olib + "</td><td>" + $('#stacks').find('option:selected').text() + "</td><td>" + "user" + "</td></tr>";
                // $("#movelibbody").append(movlibbody);
                // $("#tablecontainer").scrollTop($("#tablecontainer")[0].scrollHeight);
                $.ajax({
                    type: "POST",
                    url: backServerUrl + "api/book/transfer",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    data:jsondata,
                    success: function (movedata) {
                        var index = $("#movelibbody").find("tr").length + 1;
                        var olib =  $('#stacks').find('option[value=' + data.content[0].stack_id + ']').text();
                        var movlibbody = "<tr><td style='text-align: right;'>" + index + "</td><td>" + date + "</td><td>" + barcode + "</td><td>" + data.content[0].title + "</td><td>" + data.content[0].clc + "</td><td>" + olib + "</td><td>" + $('#stacks').find('option:selected').text() + "</td><td>" + userInfo.username + "</td></tr>";
                        $("#movelibbody").append(movlibbody);
                        $("#tablecontainer").scrollTop($("#tablecontainer")[0].scrollHeight);
                        $("#recordnumber").select();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        var functionName =  "MoveBookFromLibrary2";
                        alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                        // }
                    }
                });
            }else{
                alert("未找到条码为 " + barcode + " 的图书!");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var functionName =  "MoveBookFromLibrary";
            alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            // }
        }
    });
}

function GetStacks(callback)
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    $.ajax({
        type: "GET",
        url: backServerUrl + "api/book/bookstacks?offset=0&limit=-1&nested=true",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            callback(data);
            //var GetStackname =
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var functionName =  "GetStacks";
            alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            // }
        }
    });
}

function FillStacks(data) {
    if(data.content.length > 0){
        data.content.forEach(function (o) {
            $("#stacks").append("<option value='" + o.id +"' title='" + o.book_barcode_length +"'>" + o.name + "</option>");
        });
        $("#stacks").val(systemDefaultStack);
        catalogueRW.currentBookBarcodeLength = parseInt($("#stacks").find("option:selected").attr("title"));

        $("#stacks").change(function () {
            // alert($(this).children('option:selected').attr("title"));
            catalogueRW.currentBookBarcodeLength = parseInt($(this).children('option:selected').attr("title"));
        });

        // $("#stacks").get(0).selectedIndex = 0;
    }
}

var CancelBook = function () {

    var keyudnav= 0;

    var catalogue = new Vue({
        el: '#catalogue',
        data: {
            alldata:{},
            bookbarcode:'',
            bookname:'',
            publisherdate:'',
            ISBN:'',
            author:'',
            clc:''
        },
        methods:{
            searchbook:function () {
                var bookbarcode = $("#bookbarcode").val().trim();
                InitInput();
                if(bookbarcode.length>0)
                {
                    SearchBook_Barcode(bookbarcode)
                }
                else{
                    SearchBook_Param();
                }
            },

            InactiveBook:function () {
                var et = window.localStorage["et"];
                var backServerUrl = window.localStorage["backServerUrl"];
                var barcode = [$("#bookbarcode").val()];
                //var stackId = 0;  //$("#stacks").val();
                var description = $("#reason").val();
                //var jsondata = JSON.stringify({"book_barcodes":barcode,"stack_id":stackId,"description":description});
                var jsondata = JSON.stringify({"ids":barcode,"description":description});
                //var jsondata = {"ids":barcode,"description":description};
                $.ajax({
                    type: "PATCH",
                    url: backServerUrl + "api/book/items/deactivate",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    data: jsondata,
                    success: function (data) {
                        console.log(data[0].updated)
                        if(data[0].updated)
                        {
                            $("#inactivenumber").val("注销成功！");
                        }
                        else if(data.indexOf("Duplicate action"))
                        {
                            $("#inactivenumber").val("文献已注销，不能重复注销!");
                        }
                        else{
                            $("#inactivenumber").val("注销失败！");
                        }

                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        var functionName =  "InactiveBook";
                        alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                        // }
                    }
                });
            }
        }
    });

    function SearchBook_Barcode(bookbarcode) {
        $("#searchlistbody").find("tr").remove();
        $("#searchlist").hide();
        var Url="";
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        Url=backServerUrl+"api/book/items/search?barcode_string="+bookbarcode;
        $.ajax({
            type: "GET",
            url: Url,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(!data.result[0].item_info.is_available)
                {
                    alert("外借图书，不能注销！");
                    return;
                }
                else if(data.result[0].reference_info.hasOwnProperty("value"))
                {
                   if(data.result[0].reference_info.value=="empty")
                   {
                       alert("未采编图书，无图书信息");
                       $("#bookbarcode").val("");
                       return;
                   }
                }
                else{
                    catalogue.alldata = data.result[0].reference_info;
                    //CancelBook.SetBook(data.reference_info);
                    var purl = parseURL(Url);
                    var body = "";
                    if (purl.params.offset === "")
                        purl.params.offset = 0;
                    // data.content.forEach(function (o, index) {
                    //     body += "<tr id='bi" + index + "'><td>" + (index + 1 + parseInt(purl.params.offset)) + "</td><td>" + o.ISBN.ISBN + "</td><td>" + o.题名与责任者.正题名 + "</td><td>" + o.责任者.主标目 + "</td><td>" + o.出版发行.出版发行者名称 + "</td><td>" + o.出版发行.出版发行日期 + "</td><td><input type='button' value='选择' onclick='CancelBook.SetBook(CancelBook.catalogue.alldata.content[" + index + "])'></td></tr>";
                    //     //body += "<tr id='bi" + index + "'><td>" + (index + 1 + parseInt(purl.params.offset)) + "</td><td>" + o.ISBN.ISBN + "</td><td>" + o.题名与责任者.正题名 + "</td><td>" + o.责任者.主标目 + "</td><td>" + o.出版发行.出版发行者名称 + "</td><td>" + o.出版发行.出版发行日期 + "</td><td><input type='button' value='选择'></td></tr>";
                    // });
                    // if (data.prev === "" && data.next === "") {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // } else if (data.prev === "" && data.next !== "") {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // } else if (data.prev !== "" && data.next === "") {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // } else {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // }
                    body += "<tr><td>" + 1 + "</td><td>" + data.result[0].reference_info.ISBN.ISBN + "</td><td>" + data.result[0].reference_info.题名与责任者.正题名 + "</td><td>" + data.result[0].reference_info.责任者.主标目 + "</td><td>" + data.result[0].reference_info.出版发行.出版发行者名称 + "</td><td>" + data.result[0].reference_info.出版发行.出版发行日期 + "</td><td><input type='button' value='选择' onclick='CancelBook.SetBook(CancelBook.catalogue.alldata)'></td></tr>";
                    $("#searchlistbody").html(body);
                    if($("#searchlist").is(":hidden")){
                        $("#searchlist").show();
                    }
                    $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                }
                $("#bookbarcode").focus();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("no record can be found")>0)
                {
                    alert("未找到该图书条码！");
                }
                else{
                    alert("查找失败!");
                }
            },
        });
    }//查询图书by_barcode

    function SearchBook_Param() {
        var isbn = $("#ISBN").val().trim();
        var bookname = $("#bookname").val();
        var author = $("#author").val();
        var clc=$("#clc").val().trim();                  //分类号
        var rangedate=$("#publisherdate").val().trim();//出版日期
        var publisherdate="";
        if(rangedate.length>0)
        {
            switch ($("#daterange").val())
            {
                case "小于":publisherdate=","+(parseInt(rangedate)-1);break;
                case "等于":publisherdate=rangedate+","+rangedate;break;
                case "大于":publisherdate=(parseInt(rangedate)+1)+",";break;
            }
        }
        //var authorpy = $("#authorpyfs").val();

        if(isbn === "" && bookname === "" && author === ""){
            alert("搜索条件为空!");
            return;
        }

        else {
            var et = window.localStorage["et"];
            var backServerUrl = window.localStorage["backServerUrl"];
            var surl = backServerUrl + "api/book/reference?keyword=" + "&author=" + encodeURI(author) +
                "&title=" + encodeURI(bookname) + "&isbn=" + isbn + "&publisher=&clc="+clc+
                "&publish_year"+publisherdate+"&offset=&limit=15";
            ShowPage(surl);
        }
    }//查询图书by_param

    function InitPage() {
        $("#searchlist").hide();
        //GetLanguageList();
        $(document).ready(function () {
            $(document).keydown(function (evnet) {
                // console.log("evnet.keyCode = " + evnet.keyCode);
                if (evnet.keyCode === 13) {
                    if($("#searchlist").is(":hidden") && ($("#popupAddr").length === 0 || ($("#popupAddr").length === 1 && $("#popupAddr").is(":hidden")))) {
                        $("#searchbutton").click();
                    }
                    // else if(!$("#searchlist").is(":hidden"))
                    // {
                    //     CancelBook.SetBook(CancelBook.catalogue.alldata);
                    // }
                    else{
                        $("#bi" + keyudnav).find("input").click();
                        return false;
                    }
                }
                if($("#popupAddr").length === 1 && !$("#popupAddr").is(":hidden")){
                    console.log("B");
                    if (evnet.keyCode === 27) {
                        $("#_cancel").click();
                    }
                }
                if(!$("#searchlist").is(":hidden")) {
                    if (evnet.keyCode === 27) {
                        $("#searchlist").hide();
                    } else if (evnet.keyCode === 38) {     //up
                        if (keyudnav > 0) {
                            $("#bi" + keyudnav).css("backgroundColor", "white");
                            keyudnav--;
                            $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                        } else {
                            if (!$("#prev").is(":disabled")) {
                                $("#prev").click();
                                keyudnav = 0;
                            }
                        }
                    } else if (evnet.keyCode === 40) {     //down
                        if (keyudnav < 14 && keyudnav < ($("#searchlistbody").children("tr").length - 2)) {
                            $("#bi" + keyudnav).css("backgroundColor", "white");
                            keyudnav++;
                            $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                        } else {
                            if (!$("#next").is(":disabled")) {
                                $("#next").click();
                                keyudnav = 0;
                            }
                        }
                    } else if (evnet.keyCode === 37) {     //left
                        if (!$("#prev").is(":disabled")) {
                            $("#prev").click();
                            keyudnav = 0;
                        }
                    } else if (evnet.keyCode === 39) {     //right
                        if (!$("#next").is(":disabled")) {
                            $("#next").click();
                            keyudnav = 0;
                        }
                    }
                }
            });
        });

        var reg = /\d+/;
        var w = $("#searchlist").css("width").match(reg)[0];
        //$("#searchlist").css("left",(width - w)/2);
        GetStacks(FillStacks);
        $('#booklist').mousedown(
            function (event) {
                var isMove = true;
                //var abs_x = event.pageX - $('div #searchlist').offset().left;
                var abs_y = event.pageY - $('div #searchlist').offset().top;
                $(document).mousemove(function (event) {
                        if (isMove) {
                            var obj = $('div #searchlist');
                            //obj.css({'left':event.pageX - abs_x, 'top':event.pageY - abs_y});
                        }
                    }
                ).mouseup(
                    function () {
                        isMove = false;
                    }
                );
            }
        );

        $("#bookbarcode").focus();
        $("#recordnumber").on("keyup",function (event) {
            if(event.keyCode !== 13) {
                if ($(this).val().length === 11 && event.keyCode !== 13) {
                    CheckBookInfo();
                }
            }
        });

        $("#writemode1").focus(function(){
            $.openLayer({
                maxItems : 12,
                pid : "0",
                title: "选择著作方式",
                returnText : "writemode1",
                // returnValue : "resvals",
                span_width : {d1:120,d2:150,d3:150},
                index : 1,
                dragEnable : true,
                showLevel : 1,					//显示级别
                cacheEnable: false,
                url:"api/book/writing_method",
                pText: $("#writemode1").val()
            });
        });

    }

    function ReLoadPage() {
        $("#searchlist").hide();
        $(document).ready(function () {
            $(document).keydown(function (evnet) {
                // console.log("evnet.keyCode = " + evnet.keyCode);
                if (evnet.keyCode === 13) {
                    if($("#searchlist").is(":hidden") && !$('#recordnumber').is(":focus") && ($("#popupAddr").length === 0 || ($("#popupAddr").length === 1 && $("#popupAddr").is(":hidden")))) {
                        $("#searchbutton").click();
                    }else{
                        $("#bi" + keyudnav).find("input").click();
                        return false;
                    }
                }
                if($("#popupAddr").length === 1 && !$("#popupAddr").is(":hidden")){
                    if (evnet.keyCode === 27) {
                        $("#_cancel").click();
                    }
                }
                if(!$("#searchlist").is(":hidden")) {
                    if (evnet.keyCode === 27) {
                        $("#searchlist").hide();
                    } else if (evnet.keyCode === 38) {     //up
                        if (keyudnav > 0) {
                            $("#bi" + keyudnav).css("backgroundColor", "white");
                            keyudnav--;
                            $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                        } else {
                            if (!$("#prev").is(":disabled")) {
                                $("#prev").click();
                                keyudnav = 0;
                            }
                        }
                    } else if (evnet.keyCode === 40) {     //down
                        if (keyudnav < 14 && keyudnav < ($("#searchlistbody").children("tr").length - 2)) {
                            $("#bi" + keyudnav).css("backgroundColor", "white");
                            keyudnav++;
                            $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                        } else {
                            if (!$("#next").is(":disabled")) {
                                $("#next").click();
                                keyudnav = 0;
                            }
                        }
                    } else if (evnet.keyCode === 37) {     //left
                        if (!$("#prev").is(":disabled")) {
                            $("#prev").click();
                            keyudnav = 0;
                        }
                    } else if (evnet.keyCode === 39) {     //right
                        if (!$("#next").is(":disabled")) {
                            $("#next").click();
                            keyudnav = 0;
                        }
                    }
                }
            });
        });

        var reg = /\d+/;
        var w = $("#searchlist").css("width").match(reg)[0];
        //$("#searchlist").css("left",(width - w)/2);
        $('#booklist').mousedown(
            function (event) {
                var isMove = true;
                //var abs_x = event.pageX - $('div #searchlist').offset().left;
                var abs_y = event.pageY - $('div #searchlist').offset().top;
                $(document).mousemove(function (event) {
                        if (isMove) {
                            var obj = $('div #searchlist');
                            //obj.css({'left':event.pageX - abs_x, 'top':event.pageY - abs_y});
                        }
                    }
                ).mouseup(
                    function () {
                        isMove = false;
                    }
                );
            }
        );

        $("#recordnumber").focus();
        $("#recordnumber").on("keyup",function (event) {
            if(event.keyCode !== 13) {
                if ($(this).val().length === 11 && event.keyCode !== 13) {
                    CheckBookInfo();
                }
            }
        });

        $("#writemode1").focus(function(){
            $.openLayer({
                maxItems : 12,
                pid : "0",
                title: "选择著作方式",
                returnText : "writemode1",
                // returnValue : "resvals",
                span_width : {d1:120,d2:150,d3:150},
                index : 1,
                dragEnable : true,
                showLevel : 1,					//显示级别
                cacheEnable: false,
                url:"api/book/writing_method",
                pText: $("#writemode1").val()
            });
        });

    }

    function ShowPage(surl) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        $.ajax({
            type: "GET",
            url: surl,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                catalogue.alldata = data;
                if(data.content.length === 0){
                    alert("未找到图书！");
                }else if(data.content.length === 1){
                    CancelBook.SetBook(data.content[0]);
                }else if(data.content.length > 1) {
                    // alert("记录大于一条，仅显示第一条！");
                    var purl = parseURL(surl);
                    var body = "";
                    if (purl.params.offset === "")
                        purl.params.offset = 0;
                    data.content.forEach(function (o, index) {
                        body += "<tr id='bi" + index + "'><td>" + (index + 1 + parseInt(purl.params.offset)) + "</td><td>" + o.ISBN.ISBN + "</td><td>" + o.题名与责任者.正题名 + "</td><td>" + o.责任者.主标目 + "</td><td>" + o.出版发行.出版发行者名称 + "</td><td>" + o.出版发行.出版发行日期 + "</td><td><input type='button' value='选择' onclick='CancelBook.SetBook(CancelBook.catalogue.alldata.content[" + index + "])'></td></tr>";
                        //body += "<tr id='bi" + index + "'><td>" + (index + 1 + parseInt(purl.params.offset)) + "</td><td>" + o.ISBN.ISBN + "</td><td>" + o.题名与责任者.正题名 + "</td><td>" + o.责任者.主标目 + "</td><td>" + o.出版发行.出版发行者名称 + "</td><td>" + o.出版发行.出版发行日期 + "</td><td><input type='button' value='选择'></td></tr>";
                    });
                    if (data.prev === "" && data.next === "") {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    } else if (data.prev === "" && data.next !== "") {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    } else if (data.prev !== "" && data.next === "") {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    } else {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='CancelBook.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    }
                    $("#searchlistbody").html(body);
                    if($("#searchlist").is(":hidden")){
                        $("#searchlist").show();
                    }
                    $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            }
        });
    }

    function SetBook(recorder) {
        //catalogue.bookbarcode = recorder.barcode;
        catalogue.bookname = recorder.题名与责任者.正题名;
        catalogue.author = recorder.责任者.主标目;
        catalogue.ISBN = recorder.ISBN.ISBN;
        catalogue.publisherdate = recorder.出版发行.出版发行日期;
        catalogue.clc = recorder.中国图书馆图书分类法分类号;
        $("#searchlist").hide();
    }

    function InitInput() {
        $("#bookname,#ISBN,#clc,#author,#publisherdate,#reason,#inactivenumber").val("");
    }

    return{
        catalogue : catalogue,
        InitPage : InitPage,
        ReLoadPage:ReLoadPage,
        ShowPage : ShowPage,
        SetBook:SetBook,
    }
}();

