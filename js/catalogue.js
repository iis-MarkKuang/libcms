//# sourceURL=catalogue.js
/**
 * Created by Administrator on 2016/11/12.
 */
var catalogueRW = function () {

    var currentBookBarcodeLength = 0;

    var keyudnav= 0;
    var editflag = 0;
    var currentId = "";
    var defaultOrder= "";

    var catalogue = new Vue({
        el: '#catalogue',
        data: {
            alldata:{},
            bookname: '',
            booknamepy: '',
            author1:"",
            writemode1: '',
            authorpy1:"",
            bookisbn:"",
            publisher:"",
            publishdate:"",
            vercount:"",
            booksize:"",
            pages:"",
            bookbind:"",
            price:"",
            language:"",
            getmethod:"",
            bookissn:"",
            seriesname:"",
            seriesauthor:"",
            seriesmode:"",
            seriesnumber:"",
            volumenumber:"",
            picture:"",
            attachment:"",
            maintarget:"",
            maintargetsplit:"",
            note:"",
            classnumber:"",
            booknumber:"",
            recordnumber:"",
            reference:""
        },
        // create:{
        //
        // },
        methods:{
            searchbook:function () {
                var isbn = $("#isbnfs").val().trim();
                var bookname = $("#booknamefs").val();
                var author = $("#authorfs").val();
                var authorpy = $("#authorpyfs").val();

                if(isbn === "" && bookname === "" && author === "" && authorpy === ""){
                    alert("搜索条件为空!");
                    return;
                } else {
                    var et = window.localStorage["et"];
                    var backServerUrl = window.localStorage["backServerUrl"];
                    var surl = backServerUrl + "api/book/reference?keyword=" + encodeURI(authorpy) + "&author=" + encodeURI(author) + "&title=" + encodeURI(bookname) + "&isbn=" + isbn + "&publisher=&clc=&publish_year&offset=&limit=15";
                    ShowPage(surl,isbn);
                }
            },
            GetPublish:function () {
                $("#publisher").val("");
                $("#publishdate").val("");
                var isbn=$("#bookisbn").val().trim();
                var et = window.localStorage["et"];
                var backServerUrl = window.localStorage["backServerUrl"];
                var surl = backServerUrl + "api/book/reference?keyword=&author=&title=&isbn=" + isbn + "&publisher=&clc=&publish_year&offset=&limit=15";
                $.ajax({
                    type: "GET",
                    url: surl,
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    success: function (data) {
                        if(data.count>0)
                        {
                            catalogue.publisher=data.content[0].出版发行.出版发行者名称;
                            //catalogue.publisherdate=data.content[0].出版发行.出版发行日期;
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                    }
                });
            }
        }
    });

    function InitPage() {
        $("#searchlist").hide();
        GetLanguageList();
        $(document).ready(function () {
            $("#invoiceitime").val(new Date().format("yyyy-MM-dd"));
            $(document).keydown(function (evnet) {
                // 回车
                if (evnet.keyCode === 13) {

                    if($("#searchlist").is(":hidden") &&!$("#bookisbn").is(":focus") &&!$('#recordnumber').is(":focus") && ($("#popupAddr").length === 0 || ($("#popupAddr").length === 1 && $("#popupAddr").is(":hidden")))) {
                        $("#searchbutton").click();
                        return false;
                    }
                    else if($("#bookisbn").is(":focus"))
                    {
                        catalogue.GetPublish;
                    }
                    else{
                        $("#bi" + keyudnav).find("input").click();
                        return false;
                    }
                } // end if KeyCode === 13

                if (evnet.keyCode === 8) {   //Backspce
                    if(document.activeElement.id === "")
                        return false;
                    else
                        return true;
                }
                if($("#popupAddr").length === 1 && !$("#popupAddr").is(":hidden")){
                    //ESC
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
        $("#searchlist").css("left",(width - w)/2);
        GetStacks(FillStacks);

        $('#booklisttitle').mousedown(
            function (event) {
                var isMove = true;
                var abs_x = event.pageX - $('div #searchlist').offset().left;
                var abs_y = event.pageY - $('div #searchlist').offset().top;
                $(document).mousemove(function (event) {
                        if (isMove) {
                            var obj = $('div #searchlist');
                            obj.css({'left':event.pageX - abs_x, 'top':event.pageY - abs_y});
                        }
                    }
                ).mouseup(
                    function () {
                        isMove = false;
                    }
                );
            }
        );

        // $('#ordermanage').mousedown(
        //     function (event) {
        //         var isMove = true;
        //         var abs_x = event.pageX - $('div #ordermanage').offset().left;
        //         var abs_y = event.pageY - $('div #ordermanage').offset().top + 70;
        //         $(document).mousemove(function (event) {
        //                 if (isMove) {
        //                     var obj = $('div #ordermanage');
        //                     obj.css({'left':event.pageX - abs_x, 'top':event.pageY - abs_y});
        //                 }
        //             }
        //         ).mouseup(
        //             function () {
        //                 isMove = false;
        //             }
        //         );
        //     }
        // );


        // $("#isbnfs").on("keyup",function (event){
        //     if($(this).val().length === 13){
        //         console.log("s");
        //         $("#searchbutton").click();
        //     }
        // });

        $("#recordnumber").focus();
        $("#recordnumber").on("keydown",function (event){
            if(event.keyCode === 9){
                $("#isbnfs").focus();
                return false;
            }
        });

        $("#recordnumber").on("keyup",function (event) {
            if(event.keyCode !== 13) {
                // if (($(this).val().length === 11 || $(this).val().length === 8) && event.keyCode !== 13) {
                // if (($(this).val().length === 10)) {
                if (($(this).val().length === catalogueRW.currentBookBarcodeLength) && event.keyCode !== 13 && event.keyCode !== 37 && event.keyCode !== 38 && event.keyCode !== 39 && event.keyCode !== 40) {
                    // CheckBookInfo();
                }
            }else if(event.keyCode === 13){
                CheckBookInfo();
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

    function SetDefaultOrder(orderName) {
        defaultOrder = $("input[name='defaultorder']:checked").val();
        $("#defaultorderno").val(defaultOrder);
        $("#defaultordername").html(orderName);
    }

    function OrderManage() {
        if($("#ordermanage").is(":hidden")){
            var reg = /\d+/;
            var w = $("#ordermanage").css("width").match(reg)[0];
            $("#ordermanage").css("left", parseInt(width/2) - parseInt(w/2) + "px");
            $("#ordermanage").show();

        }
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book_order?ordering=order_no",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                console.log(data);
                if(data.count === 0){
                    $("#orderlistbody").empty();
                    alert("没有订单数据!")
                }else{
                    $("#orderlistbody").empty();
                    var orderlist = "";
                    var isCheck = "";
                    data.content.forEach(function (o) {
                        if(o.order_no === defaultOrder) {
                            isCheck = "checked";
                        }else{
                            isCheck = "";
                        }
                        // orderlist += "<tr id='" + o.order_no + "'><td>" + o.order_no + "</td><td>" + o.vendor_name + "</td><td>" + o.order_datetime + "</td><td>" + o.invoice_no + "</td><td>" + o.total_amount + "</td><td>" + o.book_count + "</td><td>" + o.barcode_bounds + "</td><td><input type='radio' name='defaultorder' value='" + o.order_no + "' " + isCheck +" onchange='catalogueRW.SetDefaultOrder(\"" + o.vendor_name + "\");'></td><td style='width: 180px;'><input type='button' value='图书列表' onclick='catalogueRW.GetBookByOrder(\"" +o.order_no + "\");'><input type='button' value='修改' onclick='catalogueRW.EditOrder(\"" +o.order_no + "\");'><input type='button' value='删除' onclick='catalogueRW.DeleteOrder(\"" +o.order_no + "\");'></td></tr>";
                        orderlist += "<tr id='" + o.order_no + "'><td>" + o.order_no + "</td><td>" + o.vendor_name + "</td><td>" + o.order_datetime + "</td><td>" + o.invoice_no + "</td><td>" + o.total_amount + "</td><td>" + o.book_count + "</td><td>" + o.barcode_bounds + "</td><td><input type='radio' name='defaultorder' value='" + o.order_no + "' " + isCheck +" onchange='catalogueRW.SetDefaultOrder(\"" + o.vendor_name + "\");'></td><td style='width: 120px;'><input type='button' value='修改' onclick='catalogueRW.EditOrder(\"" +o.order_no + "\");'><input type='button' value='删除' onclick='catalogueRW.DeleteOrder(\"" +o.order_no + "\");'></td></tr>";
                    });
                    $("#orderlistbody").append(orderlist);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            }
        });

    }

    function AOUOrder() {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var orderno = $("#orderno").val();
        if(orderno.length === 0){
            alert("订单号必须填写(格式:年月日+序号 如:2017060501)");
            return;
        }
        var bookseller = $("#bookseller").val();
        if(bookseller.length === 0){
            alert("书商名称必须填写");
            return;
        }
        var invoiceitime = $("#invoiceitime").val();
        var invoiceno = $("#invoiceno").val();
        if(orderno.length === 0){
            alert("发票号必须填写");
            return;
        }
        var amount = $("#amount").val();
        if(orderno.length === 0){
            alert("发票金额必须填写");
            return;
        }

        var body = '{"order_no":"' + orderno + '","vendor_name":"' + bookseller + '","order_datetime":"' + invoiceitime + '","invoice_no":"' + invoiceno + '","total_amount":"' + amount + '"}' ;
        // var body = '{"order_no":"' + orderno + '","vendor_name":"' + encodeURI(bookseller) + '","order_datetime":' + invoiceitime + '","invoice_no":' + invoiceno + '","total_amount":' + amount + "'}" ;

        var method = "POST";
        var url = backServerUrl + "api/book_order";
        if(editflag === 1){
            method = "PATCH";
            url = url + "/" + currentId;
        }
        $.ajax({
            type: method,
            url: url,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            data: body,
            success: function (data) {
                if(editflag === 0){
                    if(data.created){
                        OrderManage();
                        alert("订单添加成功!");
                        $('#addinvoice').hide();
                    }else{
                        alert("订单添加失败!");
                    }
                }else{
                    if(data.updated){
                        OrderManage();
                        alert("订单更新成功!");
                        $('#addinvoice').hide();
                    }else{
                        alert("订单更新失败!");
                    }
                }
             },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            }
        });
    }

    function AddOrder() {
        editflag = 0;
        $("#orderno").val("");
        $("#bookseller").val("");
        $("#invoiceitime").val(new Date().format("yyyy-MM-dd"));
        $("#invoiceno").val("");
        $("#amount").val("");
        $('#addinvoice').show();
    }

    function EditOrder(orderId) {
        editflag = 1;
        currentId = orderId;
        $('#addinvoice').show();
        $("#orderno").val($("#" + orderId).children("td:eq(0)").html());
        $("#bookseller").val($("#" + orderId).children("td:eq(1)").html());
        $("#invoiceitime").val($("#" + orderId).children("td:eq(2)").html());
        $("#invoiceno").val($("#" + orderId).children("td:eq(3)").html());
        $("#amount").val($("#" + orderId).children("td:eq(4)").html());
    }

    function DeleteOrder(orderId) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var orderno = $("#" + orderId).children("td:eq(0)").html();

        if(confirm("确定要删除订单号为 " + orderno + " 的记录?")){
            $.ajax({
                type: "DELETE",
                url: backServerUrl + "api/book_order/" + orderId,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    if(data.deleted){
                        alert("订单删除成功!");
                        OrderManage();

                    }else{
                        alert("订单删除失败!");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                }
            });
        }
    }

    function ListBookByOrder() {
        var orderno = $("#defaultorderno").val();
        if(orderno.length > 0){
            GetBookByOrder(orderno);
        }else{
            alert("订单号不能为空!");
        }
    }

    function GetBookByOrder(orderId) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var orderno = $("#" + orderId).children("td:eq(0)").html();

        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var surl = backServerUrl + "api/book/items_with_ref?order_no=" + orderId + "&offset=&limit=15";
        ShowPageByOrder(surl);
        // $.ajax({
        //     type: "GET",
        //     // url: backServerUrl + "api/book/reference?order_no=" + orderId,
        //     url: backServerUrl + "api/book/items_with_ref?order_no=" + orderId,
        //     dataType: "json",
        //     headers: {'Content-Type': 'application/json','Authorization':et},
        //     success: function (data) {
        //     },
        //     error: function (XMLHttpRequest, textStatus, errorThrown) {
        //     }
        // });
    }

    function ShowPageByOrder(surl) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        // var surl = backServerUrl + "api/book/search?keyword=" + encodeURI(authorpy) + "&author=" + encodeURI(author) + "&title=" + encodeURI(bookname) + "&isbn=" + isbn + "&publisher=&clc=&publish_year&offset=&limit=15";
        $.ajax({
            type: "GET",
            url: surl,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                catalogue.alldata = data;
                if(data.content.length === 0){
                    // if($("#isonline").prop("checked")){
                    //     QueryDouban(isbn);
                    //     return;
                    // }else{
                        alert("未找到记录!");
                    // }
                // }else if(data.content.length === 1){
                //     SetBookInfo(data.content[0]);
                }else if(data.content.length > 0) {
                    // alert("记录大于一条，仅显示第一条！");
                    var purl = parseURL(surl);
                    var body = "";
                    if (purl.params.offset === "")
                        purl.params.offset = 0;
                    data.content.forEach(function (o, index) {
                        body += "<tr id='bi" + index + "'><td>" + (index + 1 + parseInt(purl.params.offset)) + "</td><td>" + o.ISBN.ISBN + "</td><td>" + o.题名与责任者.正题名 + "</td><td>" + o.责任者.主标目 + "</td><td>" + o.出版发行.出版发行者名称 + "</td><td>" + o.出版发行.出版发行日期 + "</td><td><input type='button' value='选择' onclick='catalogueRW.SetBookInfo(catalogueRW.catalogue.alldata.content[" + index + "])'></td></tr>";
                    });
                    if (data.prev === "" && data.next === "") {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else if (data.prev === "" && data.next !== "") {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else if (data.prev !== "" && data.next === "") {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
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

    function ShowPage(surl,isbn) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        // var surl = backServerUrl + "api/book/search?keyword=" + encodeURI(authorpy) + "&author=" + encodeURI(author) + "&title=" + encodeURI(bookname) + "&isbn=" + isbn + "&publisher=&clc=&publish_year&offset=&limit=15";
        $.ajax({
            type: "GET",
            url: surl,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                catalogue.alldata = data;
                if(data.content.length === 0){
                    if($("#isonline").prop("checked")){
                        QueryDouban(isbn);
                        return;
                    }else{
                        alert("未找到记录!");
                    }
                }else if(data.content.length === 1){
                    SetBookInfo(data.content[0]);
                }else if(data.content.length > 1) {
                    // alert("记录大于一条，仅显示第一条！");
                    var purl = parseURL(surl);
                    var body = "";
                    if (purl.params.offset === "")
                        purl.params.offset = 0;
                    data.content.forEach(function (o, index) {
                        body += "<tr id='bi" + index + "'><td>" + (index + 1 + parseInt(purl.params.offset)) + "</td><td>" + o.ISBN.ISBN + "</td><td>" + o.题名与责任者.正题名 + "</td><td>" + o.责任者.主标目 + "</td><td>" + o.出版发行.出版发行者名称 + "</td><td>" + o.出版发行.出版发行日期 + "</td><td><input type='button' value='选择' onclick='catalogueRW.SetBookInfo(catalogueRW.catalogue.alldata.content[" + index + "])'></td></tr>";
                    });
                    if (data.prev === "" && data.next === "") {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else if (data.prev === "" && data.next !== "") {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else if (data.prev !== "" && data.next === "") {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else {
                        body += "<tr><td colspan='7'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    }
                    // if (data.prev === "" && data.next === "") {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // } else if (data.prev === "" && data.next !== "") {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // } else if (data.prev !== "" && data.next === "") {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // } else {
                    //     body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='catalogueRW.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    // }
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

    function QueryDouban(isbn) {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        // var surl =  backServerUrl + "api/interlib/"+isbn;   //图创提供的接口
        var surl =  backServerUrl + "api/z3991/"+isbn;     //公司购买的接口
        $.ajax({
            type: "GET",
            url: surl,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.hasOwnProperty("msg"))
                {
                    alert("未找到记录！");
                    //$("#edittable").find(":text").val("");
                    ResetCatalogueData(0);
                }
                else {
                    catalogue.alldata = data;
                    SetBookInfo(data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest.status);
                if(XMLHttpRequest.status=="404")
                {
                    alert("未查到该图书！");
                }
                else{
                    alert("查找失败！");
                }
            }
        });
    }

    function SetBookInfo(recorder) {
        // var recorder = catalogue.alldata.content[index];
        catalogue.bookname = recorder.题名与责任者.正题名;
        catalogue.booknamepy = recorder.题名与责任者.正题名汉语拼音;
        catalogue.author1 = recorder.责任者.主标目;
        catalogue.writemode1 = recorder.责任者.著作责任;
        catalogue.authorpy1 = recorder.责任者.主标目汉语拼音;
        catalogue.bookisbn = recorder.ISBN.ISBN;
        catalogue.publisher = recorder.出版发行.出版发行者名称;
        catalogue.publishdate = recorder.出版发行.出版发行日期;
        catalogue.vercount = "无";
        catalogue.booksize = recorder.载体形态.尺寸或开本;
        catalogue.pages = recorder.载体形态.页数或卷册数;
        catalogue.bookbind = recorder.ISBN.装订方式;
        catalogue.price = recorder.ISBN.获得方式和或定价;
        catalogue.language = recorder.作品语种.作品语种;
        catalogue.seriesname = recorder.丛编.正丛编题名;
        catalogue.seriesauthor = recorder.丛编.丛编责任者;
        catalogue.seriesmode = "无";
        catalogue.bookissn = recorder.丛编.ISSN;
        catalogue.seriesnumber = recorder.丛编.分册号;
        catalogue.volumenumber = recorder.丛编.卷标识;
        catalogue.picture = recorder.载体形态.图及其它细节;
        catalogue.attachment = recorder.载体形态.附件;
        if(recorder.普通主题 === undefined){
            catalogue.maintarget = "无";
        }else {
            catalogue.maintarget = recorder.普通主题.主标目;
            catalogue.maintargetsplit = recorder.普通主题.主题复分;
        }
        catalogue.note = recorder.附注.附注内容;
        catalogue.classnumber = recorder.中国图书馆图书分类法分类号;
        catalogue.reference = recorder.reference;
        catalogue.recordnumber = recorder.barcode;
        $("#searchlist").hide();
    }

    function ResetCatalogueData(clearFlag) {
        // $("#bookname").focus();
        $("#isbnfs").focus();
        $("#isbnfs").val("");
        catalogue.bookname = "";
        catalogue.booknamepy = "";
        catalogue.author1 = "";
        catalogue.writemode1 = "";
        catalogue.authorpy1 = "";
        catalogue.bookisbn = "";
        catalogue.publisher = "";
        catalogue.publishdate = "";
        catalogue.vercount = "";
        catalogue.booksize = "";
        catalogue.pages = "";
        catalogue.bookbind = "";
        catalogue.price = "";
        catalogue.language = "汉语";
        catalogue.seriesname = "";
        catalogue.seriesauthor = "";
        catalogue.seriesmode = "";
        catalogue.bookissn = "";
        catalogue.seriesnumber = "";
        catalogue.volumenumber = "";
        catalogue.picture = "";
        catalogue.attachment = "";
        catalogue.maintarget = "";
        catalogue.maintargetsplit = "";
        catalogue.note = "";
        catalogue.classnumber = "";
        catalogue.reference = "";
        catalogue.booknumber = "";
        if(clearFlag === 0)
            catalogue.recordnumber = "";
        $("#publishdate,#publisher").val("");
        $("#copycount").val("1");
    }

    function CheckBookInfo() {
        console.log("CheckBookInfo");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var barcode = $("#recordnumber").val();
        // var stackId = $("#stacks").val();
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/items?barcode=" + barcode,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                console.log(data);
                if(data.content.length > 0){
                    // $("#stacks").val(data.content[0].stack_id);
                    catalogue.booknumber = data.content[0].book_index;
                    var reference = data.content[0].reference;
                    if(reference === "") {
                        $("#isbnfs").focus();
                    }else {
                        $.ajax({
                            type: "GET",
                            url: backServerUrl + "api/book/reference/" + reference,
                            dataType: "json",
                            headers: {'Content-Type': 'application/json','Authorization':et},
                            success: function (bookinfo) {
                                console.log(bookinfo);
                                SetBookInfo(bookinfo);
                                $("#recordnumber").select();
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                var functionName =  "CheckBookInfo2";
                                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                                // }
                            }
                        });
                    }
                }else{
                    ResetCatalogueData(1);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "CheckBookInfo";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function GetLanguageList()
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        console.log("GetLanguageList");

        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/languages",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                // console.log(data);
                data.forEach(function (o) {
                    $("#languagelist").append("<option>" + o + "</option>");
                    catalogue.language="汉语";
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName =  "GetLanguageList";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                // }
            }
        });
    }

    function UpdateBookInfo() {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var copycount = $("#copycount").val();

        if(catalogue.reference === ""){
            alert("没有图书编目数据!");
            return;
        }

        // if(!(/(^[1-9]\d*$)/.test(copycount))){
        //     alert("副本数不是正整数!");
        //     return;
        // }
        //
        // var barcodes = "";
        // if(copycount === "1"){
        //     barcodes = catalogue.recordnumber;
        // }else{
        //     barcodes = catalogue.recordnumber;
        //     var tempInt;
        //     for(var i = 1; i < parseInt(copycount); i++){
        //         tempInt = parseInt(catalogue.recordnumber) + i;
        //         barcodes += "," +tempInt;
        //     }
        // }

        if(confirm("确定保存图书数据?")){
            var stringJson = {
                // "order_no" : defaultOrder,
                // "barcode_string" : barcodes,
                "stack_id" : $("#stacks").val(),
                "reference" : catalogue.reference,
                "info" : {
                    "题名与责任者" : {"正题名" : catalogue.bookname, "正题名汉语拼音" : catalogue.booknamepy},
                    "责任者" : {"主标目" : catalogue.author1, "主标目汉语拼音": catalogue.authorpy1, "著作责任" : catalogue.writemode1},
                    // "isbn" : {"isbn": catalogue.bookisbn, "装订方式":catalogue.bookbind, "获得方式和或定价": catalogue.price+$("#currency").val()},
                    "isbn" : {"isbn": catalogue.bookisbn, "装订方式":catalogue.bookbind, "获得方式和或定价": catalogue.price},
                    "载体形态" : {"页数或卷册数": catalogue.pages, "图及其他细节": catalogue.picture, "尺寸或开本": catalogue.booksize, "附件": catalogue.attachment},
                    "丛编": {"正丛编题名": catalogue.seriesname, "并列丛编题名": "", "丛编责任者": catalogue.seriesauthor, "分册号": catalogue.seriesnumber, "issn": catalogue.bookissn, "并列丛编题名⽂种": ""},
                    "中国图书馆图书分类法分类号" : catalogue.classnumber,
                    "作品语种": {"翻译指示符":"", "作品语种":catalogue.language},
                    "出版发行": {"出版发行者名称":catalogue.publisher, "出版发行日期": catalogue.publishdate},
                    "附注": {"附注内容":catalogue.note},
                    "普通主题":{"主目标":catalogue.maintarget, "主题复分":catalogue.maintargetsplit}
                }
            };
            $.ajax({
                type: "PATCH",
                url: backServerUrl + "api/book/reference/" + catalogue.reference,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(stringJson),
                success: function (data) {
                    if(data.updated){
                        alert("保存图书数据成功!");
                    }else{
                        alert("保存图书数据失败! - " + data.result);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("保存图书数据请求失败！");
                }
            });
        }
    }//保存编目

    function SaveCatalogueData() {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var copycount = $("#copycount").val();

        if(catalogue.reference === ""){
            alert("没有图书编目数据!");
            return;
        }

        if(!(/(^[1-9]\d*$)/.test(copycount))){
            alert("副本数不是正整数!");
            return;
        }

        var barcodes = "";
        if(copycount === "1"){
            barcodes = catalogue.recordnumber;
        }else{
            barcodes = catalogue.recordnumber;
            var tempInt;
            for(var i = 1; i < parseInt(copycount); i++){
                tempInt = parseInt(catalogue.recordnumber) + i;
                barcodes += "," +tempInt;
            }
        }

        if(confirm("确定保存编目数据?")){
            var stringJson = {
                "order_no" : defaultOrder,
                "barcode_string" : barcodes,
                "stack_id" : $("#stacks").val(),
                "reference" : catalogue.reference,
                "info" : {
                    "题名与责任者" : {"正题名" : catalogue.bookname, "正题名汉语拼音" : catalogue.booknamepy},
                    "责任者" : {"主标目" : catalogue.author1, "主标目汉语拼音": catalogue.authorpy1, "著作责任" : catalogue.writemode1},
                    // "isbn" : {"isbn": catalogue.bookisbn, "装订方式":catalogue.bookbind, "获得方式和或定价": catalogue.price+$("#currency").val()},
                    "isbn" : {"isbn": catalogue.bookisbn, "装订方式":catalogue.bookbind, "获得方式和或定价": catalogue.price},
                    "载体形态" : {"页数或卷册数": catalogue.pages, "图及其他细节": catalogue.picture, "尺寸或开本": catalogue.booksize, "附件": catalogue.attachment},
                    "丛编": {"正丛编题名": catalogue.seriesname, "并列丛编题名": "", "丛编责任者": catalogue.seriesauthor, "分册号": catalogue.seriesnumber, "issn": catalogue.bookissn, "并列丛编题名⽂种": ""},
                    "中国图书馆图书分类法分类号" : catalogue.classnumber,
                    "作品语种": {"翻译指示符":"", "作品语种":catalogue.language},
                    "出版发行": {"出版发行者名称":catalogue.publisher, "出版发行日期": catalogue.publishdate},
                    "附注": {"附注内容":catalogue.note},
                    "普通主题":{"主目标":catalogue.maintarget, "主题复分":catalogue.maintargetsplit}
                }
            };
            $.ajax({
                type: "POST",
                url: backServerUrl + "api/book/items",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(stringJson),
                success: function (data) {
                    // catalogue.booknumber = data.book_index;
                    var datainfo = "";
                    if(data.succeed.length > 0){
                        data.succeed.forEach(function(o){
                            datainfo += "条码号：" + o.id + "    结果： " + "保存成功"+ "\n";
                        });
                    }
                    if(data.failed.length > 0){
                        data.failed.forEach(function(o){
                            datainfo += "条码号：" + o.id + "    结果： " + o.result + "\n";
                        });
                    }

                    alert(datainfo);
                    if(data.failed.length === 0)
                        ResetCatalogueData(0);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("保存编目数据失败！");
                }
            });
        }
    }//保存图书信息

    function GetMaxFlow() {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        var stackId = $("#stacks").val();
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/items/max_barcode?stack_id=" + stackId,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                alert("当前书库最大条码号: " + data.max_barcode);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("获取当前书库最大条码号失败！");
            }
        });
    }

    return{
        catalogue : catalogue,
        currentBookBarcodeLength : currentBookBarcodeLength,
        InitPage : InitPage,
        SaveCatalogueData : SaveCatalogueData,
        ResetCatalogueData : ResetCatalogueData,
        SetBookInfo : SetBookInfo,
        ShowPage : ShowPage,
        GetMaxFlow : GetMaxFlow,
        OrderManage : OrderManage,
        AddOrder : AddOrder,
        AOUOrder : AOUOrder,
        DeleteOrder : DeleteOrder,
        EditOrder : EditOrder,
        SetDefaultOrder : SetDefaultOrder,
        GetBookByOrder : GetBookByOrder,
        ListBookByOrder : ListBookByOrder,
        UpdateBookInfo : UpdateBookInfo
    }
}();

