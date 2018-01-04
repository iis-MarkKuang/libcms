var PeriodicalSingle = function () {

    var keyudnav= 0;
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    var catalogue = new Vue({
        el: '#catalogue',
        data: {
            alldata:{},

            bookissn:"",
            batch:"",
            is_subscribed:"",
            is_active:"",
            curr_serial:"",
            period:"",
            price:"",
            publisher:"",
            //solicited_date:"",
            bookcn: "",
            bookname: "",
            clc: "",
            barcodechecked:"",
            booknamepy: '',
            author1:"",
            writemode1: '',
            authorpy1:"",
            publishdate:"",
            vercount:"",
            booksize:"",
            pages:"",
            bookbind:"",
            language:"",
            getmethod:"",
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
            BarcodeBind:"",
            reference:"",
            stacks:""
        },
        // create:{
        //
        // },
        methods:{
            SearchPeriodical:function () {
                var issn = $("#issnfs").val().trim();
                var bookname = $("#booknamefs").val();
                var publisher = $("#publisherfs").val();
                var cn = $("#cnfs").val();

                if(issn === "" && bookname === "" && publisher === "" && cn === ""){
                    alert("搜索条件为空!");
                    return;
                }
                else {
                    var surl = backServerUrl + "api/solicited?publisher="+publisher+"&title="+bookname+"&issn="+issn+"&cn="+cn+"&offset=&limit=15";
                    ShowPage(surl);
                }
            },

            GetPublish:function () {
                $("#publisher").val("");
                $("#publishdate").val("");
                var issn=$("#bookissn").val().trim();
                var cn=$("#bookcn").val().trim();
                var surl = backServerUrl + "api/book/reference?keyword=&author=&title=&issn=" + issn + "&cn=" + cn + "&publisher=&clc=&publish_year&offset=&limit=15";
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
            },

            SingleCatalogue:function () {
                if(confirm("确定保存编目数据?")){
                    var stringJson = {
                        "barcode_string" : catalogue.BarcodeBind,
                        "stack_id" : $("#stacks").val(),
                        "categoryId":2,
                        "reference" : catalogue.reference,
                        "info" : {
                            "题名与责任者" : {"正题名" : catalogue.bookname, "正题名汉语拼音" : catalogue.booknamepy},
                            "责任者" : {"主标目" : catalogue.author1, "主标目汉语拼音": catalogue.authorpy1, "著作责任" : catalogue.writemode1},
                            "issn" : {"issn": catalogue.bookisbn, "装订方式":catalogue.bookbind, "获得方式和或定价": catalogue.price+$("#currency").val()},
                            "载体形态" : {"页数或卷册数": catalogue.pages, "图及其他细节": catalogue.picture, "尺⼨或开本": catalogue.booksize, "附件": catalogue.attachment},
                            "丛编": {"正丛编题名": catalogue.seriesname, "并列丛编题名": "", "丛编责任者": catalogue.seriesauthor, "分册号": catalogue.seriesnumber, "issn": catalogue.bookissn},
                            "中国图书馆图书分类法分类号" : catalogue.classnumber,
                            "作品语种": {"翻译指示符":"", "作品语种":catalogue.language},
                            "出版发行": {"出版发行者名称":catalogue.publisher, "出版发行日期": Date.parse(catalogue.publishdate)},
                            "附注": {"附注内容":catalogue.note},
                            "普通主题":{"主目标":catalogue.maintarget, "主题复分":catalogue.maintargetsplit}
                        },
                        "clc": catalogue.clc,
                        "book_index": catalogue.curr_serial
                    };
                    $.ajax({
                        type: "POST",
                        url: backServerUrl + "api/book/items",
                        dataType: "json",
                        headers: {'Content-Type': 'application/json','Authorization':et},
                        data:JSON.stringify(stringJson),
                        success: function (data) {
                            if(data[0].result=="updated")
                            {
                                if(data[0].updated)
                                {
                                    alert("更新成功！");
                                }
                                else{
                                    alert("更新失败！");
                                }
                            }
                            if(data[0].result=="created")
                            {
                                alert("保存编目数据成功！");

                            }
                            catalogue.batch = data.book_index;
                            ResetCatalogueData();
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            alert("编目失败！");
                        }
                    });
                }
            },//单册编目
                    }
    });

    function InitPage() {
        $("#searchlist").hide();
        GetLanguageList();
        $(document).ready(function () {
            $(document).keydown(function (evnet) {
                // 回车
                if (evnet.keyCode === 13) {

                    if($("#searchlist").is(":hidden") &&!$("#bookissn").is(":focus") &&!$('#BarcodeBind').is(":focus") && ($("#popupAddr").length === 0 || ($("#popupAddr").length === 1 && $("#popupAddr").is(":hidden")))) {
                        $("#searchbutton").click();
                        console.log("0");
                    }
                    else if($("#bookissn").is(":focus"))
                    {
                        catalogue.GetPublish;
                        console.log("1");
                    }
                    else{
                        console.log("2");
                        $("#bi" + keyudnav).find("input").click();
                        return false;
                    }
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
        $('#booklist').mousedown(
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

        $("#issnfs").focus();
        $("#BarcodeBind").on("keyup",function (event) {
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
        $.ajax({
            type: "GET",
            url: surl,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                catalogue.alldata = data;
                if(data.count === 0){
                    //QueryDouban(issn);
                    alert("未找到该期刊！");
                    ResetCatalogueData();
                    return;
                }else if(data.count === 1){
                    SetBookInfo(data.content[0]);
                }else if(data.count > 1) {
                    // alert("记录大于一条，仅显示第一条！");
                    var purl = parseURL(surl);
                    var body = "";
                    if (purl.params.offset === "")
                        purl.params.offset = 0;
                    data.content.forEach(function (o, index) {
                        var last_serial = typeof(o.last_serial) === "undefined" ?  1 : o.last_serial
                        body += "<tr id='bi" + index + "'><td>" + (index + 1 + parseInt(purl.params.offset)) + "</td><td>" + o.title.issn + "</td><td>" + o.title.title + "</td><td>" + o.publish.publisher + "</td><td>" + o.book_index + "</td><td>" + last_serial + "</td><td><input type='button' value='选择' onclick='PeriodicalSingle.SetBookInfo(PeriodicalSingle.catalogue.alldata.content[" + index + "])'></td></tr>";
                    });
                    if (data.prev === "" && data.next === "") {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='确定' @click='catalogue.ComfirmBarcode'><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    } else if (data.prev === "" && data.next !== "") {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='确定' @click='catalogue.ComfirmBarcode'><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    } else if (data.prev !== "" && data.next === "") {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='确定' @click='catalogue.ComfirmBarcode'><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
                    } else {
                        body += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='PeriodicalSingle.ShowPage(\"" + backServerUrl + data.next.substring(1) + "\")'></td><td><input type='button' value='确定' @click='catalogue.ComfirmBarcode'><input type='button' value='关闭窗口' onclick='$(\"#searchlist\").hide();'></td></tr>";
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

    function QueryDouban(issn) {
        var surl =  backServerUrl + "api/douban/"+issn;
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
                    ResetCatalogueData();
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
        catalogue.bookissn = recorder.title.issn;
        catalogue.bookcn = recorder.title.cn;
        catalogue.bookname = recorder.title.title;
        catalogue.clc = recorder.title.clc;
        // catalogue.batch=recorder.batch;
        //catalogue.datetime=recorder.batch;
        //catalogue.description=recorder.batch;
        //catalogue.id=recorder.id;
        // catalogue.is_active=recorder.flow.is_active;
        // catalogue.is_subscribed=recorder.flow.is_subscribed;
        if (typeof(recorder.last_serial) === "undefined" || recorder.last_serial < 0) {
            catalogue.curr_serial = 1;
        } else {
            catalogue.curr_serial = recorder.last_serial + 1;
        }

        // catalogue.period=recorder.bookInfo.period;
        // catalogue.price=recorder.bookInfo.price;
        // catalogue.publisher=recorder.publish.publisher;
        //catalogue.solicited_date=recorder.solicited_date;
        //catalogue.stacks=recorder.stack;
        // catalogue.bookname = recorder.title.title;
        //catalogue.year=recorder.year;
        $("#issnfs").prop("name",recorder.id);
        $("#searchlist").hide();
    }

    function AssembleBody() {
        var dateNow = new Date();
        if(catalogue.is_active == "") {
            catalogue.is_active = false;
        }
        if(catalogue.is_subscribed == "") {
            catalogue.is_subscribed = false;
        }

        var stringJson = {
            "barcode_string": catalogue.BarcodeBind,
            // "rfid": catalogue.rfid,
            // "reference": catalogue.reference,
            "clc": catalogue.clc,
            "stack_id": catalogue.stacks,
            "issn": catalogue.bookissn,
            "series_number": catalogue.seriesnumber,
            "datetime": dateNow,
            "info" : {
                "题名与责任者" : {"正题名" : catalogue.bookname, "正题名汉语拼音" : catalogue.booknamepy},
                "责任者" : {"主标目" : catalogue.author1, "主标目汉语拼音": catalogue.authorpy1, "著作责任" : catalogue.writemode1},
                "issn" : {"issn": catalogue.bookisbn, "装订方式":catalogue.bookbind, "获得方式和或定价": catalogue.price+$("#currency").val()},
                "载体形态" : {"页数或卷册数": catalogue.pages, "图及其他细节": catalogue.picture, "尺寸或开本": catalogue.booksize, "附件": catalogue.attachment},
                "丛编": {"正丛编题名": catalogue.seriesname, "并列丛编题名": "", "丛编责任者": catalogue.seriesauthor, "分册号": catalogue.seriesnumber, "issn": catalogue.bookissn, "并列丛编题名⽂种": ""},
                "中国图书馆图书分类法分类号" : catalogue.classnumber,
                "作品语种": {"翻译指示符":"", "作品语种":catalogue.language},
                "出版发行": {"出版发行者名称":catalogue.publisher},
                "附注": {"附注内容":catalogue.note},
                "普通主题":{"主目标":catalogue.maintarget, "主题复分":catalogue.maintargetsplit}
            }
        };
        return stringJson
    }

    function SaveCatalogueData() {
        var periodicalId = $("#issnfs").prop("name")
        var stringJson = AssembleBody();

        // if(periodicalId.length<=0)
        // {
        if(confirm("确定保存期刊数据?")){
            $.ajax({
                type: "POST",
                url: backServerUrl + "api/book/items",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(stringJson),
                success: function (data) {
                    if(data.succeed.length>0)
                    {
                        alert("增订成功！");
                    }
                    else{
                        alert("增订失败！");
                    }
                    //catalogue.batch = data.book_index;
                    ResetCatalogueData();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("保存失败！");
                    $("#issnfs").prop("name","");
                }
            });
        }
        // }
        // else {
            // if(confirm("确定保存修改?")){
                // var stringJson = {
                //     "title": catalogue.bookname,
                //     "period": catalogue.period,
                //     "issn": catalogue.bookissn,
                //     "publisher": catalogue.publisher,
                //     "price": catalogue.price,
                //     "is_active": catalogue.is_active,
                //     "is_subscribed": catalogue.is_subscribed,
                //     "batch": catalogue.batch,
                //     "solicited_date": datenow,
                //     "stack": $("#stacks").val(),
                //     "last_serial": catalogue.last_serial
                // };
                // $.ajax({
                //     type: "PATCH",
                //     url: backServerUrl + "api/book/items/"+PeriodicalId,
                //     dataType: "json",
                //     headers: {'Content-Type': 'application/json','Authorization':et},
                //     data:JSON.stringify(stringJson),
                //     success: function (data) {
                //         if(data.result=="updated"&&data.updated)
                //         {
                //             alert("修改成功！");
                //         }
                //         //catalogue.batch = data.book_index;
                //         ResetCatalogueData();
                //     },
                //     error: function (XMLHttpRequest, textStatus, errorThrown) {
                //         alert("修改失败！");
                //         $("#issnfs").prop("name","");
                //     }
                // });
            // }
        // }
    }

    function ResetCatalogueData() {
        $("#batch").focus();
        catalogue.bookissn = "";
        catalogue.batch="";
        //catalogue.datetime=recorder.batch;
        //catalogue.description=recorder.batch;
        //catalogue.id=recorder.id;
        catalogue.is_active="";
        catalogue.is_subscribed="";
        catalogue.curr_serial="";
        catalogue.period="";
        catalogue.price="";
        catalogue.publisher="";
        catalogue.clc="";
        //catalogue.solicited_date=recorder.solicited_date;
        //catalogue.stacks=recorder.stack;
        catalogue.bookname ="";
        //catalogue.year=recorder.year;
        $("#publishdate,#publisher").val("");
    }

    function CheckBookInfo() {
        console.log("CheckBookInfo");
        var barcode = $("#BarcodeBind").val();
        // var stackId = $("#stacks").val();
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/items?barcode=" + barcode,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                console.log(data);
                if(data.content.length > 0){
                    $("#stacks").val(data.content[0].stack_id);
                    catalogue.batch = data.content[0].book_index;
                    var reference = data.content[0].reference;
                    if(reference === "") {
                        // ResetCatalogueData();
                        $("#issnfs").focus();
                    }else {
                        $.ajax({
                            type: "GET",
                            url: backServerUrl + "api/book/reference/" + reference,
                            dataType: "json",
                            headers: {'Content-Type': 'application/json','Authorization':et},
                            success: function (bookinfo) {
                                console.log(bookinfo);
                                SetBookInfo(bookinfo);
                                $("#BarcodeBind").select();
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                var functionName =  "CheckBookInfo2";
                                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                                // }
                            }
                        });
                    }
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

    return{
        catalogue : catalogue,
        InitPage : InitPage,
        SaveCatalogueData: SaveCatalogueData,
        ResetCatalogueData : ResetCatalogueData,
        SetBookInfo : SetBookInfo,
        ShowPage : ShowPage
    }
}();

