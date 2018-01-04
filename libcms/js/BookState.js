
var BookState = function () {
    var et = window.localStorage['et'];
    var backServerUrl = window.localStorage['backServerUrl'];
    var keyudnav= 0;

    $("#searchlistbody").on('click','tr',function () {
        $(this).css("background","lightblue").siblings().css("background","");
    })

    $("#bookbarcode").on('change',function () {
        var barcode = $("#bookbarcode").val();
        var surl = backServerUrl + "api/book/items/search?barcode_string="+barcode;
        GetBookInfo(barcode,surl);
    })//通过条码号查询图书信息

    var Bookstate = new Vue({
        el:"#getbookstate",
        data:{
            ftpurl:"",
            ftpadmin:"",
            ftppsw:"",
        },
        methods:{
            init:function () {
                var barcode = $("#bookbarcode").val().trim();
                var shelf =$("#shelfnum").val().trim();
                if(barcode.length>0&&shelf.length>0)
                {
                    InitBook(barcode,shelf);
                }
                else if(barcode.length<=0){
                    alert("请输入文献条码号！");
                }
                else if(shelf.length<=0)
                {
                    alert("请输入书架号！");
                }
            },//定位初始化

            SearchState:function () {
                var barcode = $("#bookbarcode").val().trim();
                if(barcode.length>0)
                {
                    var surl = backServerUrl + "api/book/get_book_business_shelf_state?bar_code="+barcode;
                    SearchBookState(surl);
                }
                else {
                    alert("请输入文献条码号！");
                }
            },//查询在架状态

            GetState:function () {
                // var surl=backServerUrl + "api/book/shelf_status?directory=192.168.0.186/kuang/qiuxin_packed/upload" +
                //     "&username=ubuntu&password=ubuntu&offset=&limit=15";
                var surl =backServerUrl + "api/book/shelf_status?directory="+Bookstate.ftpurl+
                    "&username="+Bookstate.ftpadmin+"&password="+Bookstate.ftppsw+"&offset=&limit=15";
                GetBookState(surl);
            },//盘点
            
            ClearTable:function () {
                $("#searchlist").find("tr:gt(0)").remove();
            }//清空列表
        }
    })

    function InitBook(barcode, shelf) {
        var body ={
            "barcode":barcode,
            "shelf":shelf
        }
        $.ajax({
            type:'PATCH',
            url: backServerUrl + "api/book/initbookshelf",
            dataType:'json',
            data:JSON.stringify(body),
            headers:{'Content-Type':'application/json','Authorization':et},
            success: function (data) {
                if(data.hasOwnProperty("error"))
                {
                    alert("初始化失败！");
                }
                else {
                    alert(data.result);
                    var surl = backServerUrl + "api/book/items/search?barcode_string="+barcode;
                    GetBookInfo(barcode,surl);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
                alert("CollectionsCount 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        })
    }//定位初始化

    function SearchBookState(surl) {
        $.ajax({
            type:'GET',
            url: surl,
            dataType:'json',
            headers:{'Content-Type':'application/json','Authorization':et},
            success: function (data) {
                if(data.hasOwnProperty("error"))
                {
                    alert(data.error);
                }
                else {
                    alert(data.result);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("There is no record")>0)
                {
                    alert("文献条码号错误！");
                }
                else{
                    alert("查询失败！");
                }
            }
        })
    }//查询在架状态

    function GetBookState(surl) {
        Bookstate.ClearTable();
        if(Bookstate.ftpurl.length<=0)
        {
            alert("FTP绝对路径不能为空！");
            return;
        }
        else if(Bookstate.ftpadmin.length<=0)
        {
            alert("FTP账号不能为空！");
            return;
        }
        else if(Bookstate.ftppsw.length<=0)
        {
            alert("FTP密码不能为空！");
            return;
        }
        $.ajax({
            type:'GET',
            url: surl,
            dataType:'json',
            headers:{'Content-Type':'application/json','Authorization':et},
            success: function (data) {
                if(data.hasOwnProperty("error"))
                {
                    if(data.error=="ftp directory does not exist")
                    {
                        alert("FTP路径错误！");
                    }
                }
                else{
                    if(data.count === 0){
                        //QueryDouban(issn);
                        alert("未找到相关数据！");
                        //ResetCatalogueData();
                        return;
                    }
                    // else if(data.count === 1){
                    //     SetBookInfo(data.content[0]);
                    // }
                    else{
                        // alert("记录大于一条，仅显示第一条！");
                        var purl = parseURL(surl);
                        var body = "";
                        if (purl.params.offset === "")
                            purl.params.offset = 0;
                        data.result.forEach(function (o, index) {
                            if(o.hasOwnProperty("book_info"))
                            {
                                body += "<tr id='bi" + index + "'><td>"
                                    + (index + 1 + parseInt(purl.params.offset)) + "</td><td>"
                                    + o.file_or_folder_name + "</td><td>"
                                    + o.business_status.result + "</td><td>"
                                    + o.business_status.barcode + "</td><td>"
                                    + o.book_info.title + "</td><td>"
                                    // + (o.book_info.is_available?"在馆可借":"") +  "</td><td>"
                                    + o.business_status.result + "</td><td>"
                                    + o.book_info.act_shelf + "</td><td>"
                                    + o.book_info.shelf + "</td><td>"
                                    + new Date(o.book_info.last_check_time).format('yyyy-MM-dd hh:mm:ss')
                                    +"</td></tr>";
                            }
                            else {
                                if(o.result=="Skipping since it's not a .json file")
                                {
                                    body += "<tr id='bi" + index + "'><td>"
                                        + (index + 1 + parseInt(purl.params.offset)) + "</td><td>"
                                        + o.file_or_folder_name + "</td><td>"
                                        + (o.file_or_folder_name+"不是 json文件") + "</td><td>"
                                        + (o.barcode?o.barcode:"") + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        +"</td></tr>";
                                }
                                else if(o.result=="Skipping since it's a folder")
                                {
                                    body += "<tr id='bi" + index + "'><td>"
                                        + (index + 1 + parseInt(purl.params.offset)) + "</td><td>"
                                        + o.file_or_folder_name + "</td><td>"
                                        + (o.file_or_folder_name+"是一个文件夹") + "</td><td>"
                                        + (o.barcode?o.barcode:"") + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        +"</td></tr>";
                                }
                                else{
                                    body += "<tr id='bi" + index + "'><td>"
                                        + (index + 1 + parseInt(purl.params.offset)) + "</td><td>"
                                        + o.file_or_folder_name + "</td><td>"
                                        + o.result + "</td><td>"
                                        + (o.barcode?o.barcode:"") + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        + "</td><td>"
                                        +"</td></tr>";
                                }
                            }
                        });
                        if (data.prev === "" && data.next === "") {
                            body += "<tr><td colspan='9'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='BookState.GetBookState(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='BookState.GetBookState(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                        } else if (data.prev === "" && data.next !== "") {
                            body += "<tr><td colspan='9'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='BookState.GetBookState(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='BookState.GetBookState(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                        } else if (data.prev !== "" && data.next === "") {
                            body += "<tr><td colspan='9'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='BookState.GetBookState(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='BookState.GetBookState(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                        } else {
                            body += "<tr><td colspan='9'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='BookState.GetBookState(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='BookState.GetBookState(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                        }
                        $("#searchlistbody").html(body);
                        // if($("#searchlist").is(":hidden")){
                        //     $("#searchlist").show();
                        // }
                        $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                    }
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("查询盘点失败！");
            }
        })
    }//盘点

    function GetBookInfo(barcode,surl) {
        $.ajax({
            type:'GET',
            url: surl,
            dataType:'json',
            headers:{'Content-Type':'application/json','Authorization':et},
            success: function (data) {
                var body = "";
                body += "<tr><td>"
                    + "</td><td>"
                    + "</td><td>"
                    + "</td><td>"
                    +barcode+"</td><td>"
                    + data.result[0].item_info.title + "</td><td>"
                    // + (data.result[0].item_info.is_available?"在馆可借":"外借中") + "</td><td>"
                    + date.result[0].business_status.result + "</td><td>"
                    + data.result[0].item_info.act_shelf + "</td><td>"
                    + data.result[0].item_info.shelf + "</td><td>"
                    + new Date(data.result[0].item_info.last_check_time).format('yyyy-MM-dd hh:mm:ss')
                    +"</td></tr>";
                $("#searchlistbody").html(body);

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("There is no record")>0)
                {
                    alert("文献条码号错误！");
                }
                else{
                    alert("查询失败！");
                }
            }
        })
    }

    // function SearchBook(param,flag) {
    //     var Url="";
    //     $("#edittable tr:gt(0)").remove();
    //     var limit=$("#bookrows option:selected").text();//每页多少行
    //     var bookname=$("#bookname").val().trim();       //书名
    //     var clc=$("#clc").val().trim();                  //书类号
    //     var author=$("#author").val().trim();           //作者
    //     var topic=$("#topic").val().trim();             //主题词
    //     var ISBN=$("#ISBN").val().trim();               //ISBN
    //     var rangedate=$("#publisherdate").val().trim();//出版日期
    //     var publisherdate="";
    //     Url= backServerUrl + "api/book/reference?keyword=&author=&title=&isbn=&publisher=&clc=" +
    //         "&publish_year=&topic=&offset=0&limit=10&hold=false";
    //     $.ajax({
    //         type: "GET",
    //         url: Url,
    //         dataType: "json",
    //         headers: {'Content-Type': 'application/json','Authorization':et},
    //         success: function (data) {
    //             nexturl=backServerUrl+data.next.substr(1);
    //             prevurl=backServerUrl+data.prev.substr(1);
    //             if(data.count<=0)
    //             {
    //                 alert("无法找到符合条件的文献，请核查检索条件！");
    //             }
    //             else {
    //                 var str="";
    //                 for(var index in data.content)
    //                 {
    //                     str+="<tr><td value='"+data.content[index].id+"'>"+data.content[index].ISBN.ISBN+"</td>"+
    //                         "<td>"+data.content[index].题名与责任者.正题名+"</td>"+
    //                         "<td>"+data.content[index].责任者.主标目+"</td>"+
    //                         "<td>"+data.content[index].出版发行.出版发行者名称+"</td></tr>";
    //                 }
    //             }
    //             $("#pg41_tb2").append(str);
    //         },
    //         error: function (XMLHttpRequest, textStatus, errorThrown) {
    //             alert(XMLHttpRequest.responseText);
    //         },
    //     });
    // }//查询图书

    return {
        //SearchBook:SearchBook
        GetBookState:GetBookState,
    }
}();













