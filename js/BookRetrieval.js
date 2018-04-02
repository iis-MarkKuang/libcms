//# sourceURL=BookRetrieval.js
var connectfail = 0;
var userInfo;
var nexturl="";
var prevurl="";
var Pageall="";//总共多少页

$(document).ready(function () {
    $("#bookrows").on('change',function () {
        var limit=$("#bookrows option:selected").text();//每页多少行
        SearchBook(limit,"1");
    });

    $("#bookpageno span[name='pagenow']").html("1/");
    $("#Prev").attr("disabled",true);
    $("#Next").attr("disabled",true);

    $("#pg41_tb2").delegate('tr:gt(0)','dblclick',function () {
        var reference = $(this).find("td:eq(0)").attr("value");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];
        $("#pg41_tb4").find("tr").remove();
        $.ajax({
            type: "GET",
            url: backServerUrl + "api/book/reference/"+reference,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                var str="";
                console.log(data.hasOwnProperty("barcode"));
                if(data.hasOwnProperty("barcode"))
                {
                    str+="<tr><td>条码号："+data.barcode+"</td></tr>" +
                        "<tr><td>关键字："+data.keywords+"</td></tr>" +
                        "<tr><td>ISBN号："+data.ISBN.ISBN+"</td></tr>" +
                        "<tr><td>书刊名："+data.题名与责任者.正题名+"/"+data.题名与责任者.正题名汉语拼音+"</td></tr>" +
                        // "<tr><td>作者："+data.题名与责任者.第一责任者+"</td></tr>" +
                        "<tr><td>作者："+data.责任者.主标目+"</td></tr>" +
                        "<tr><td>尺寸或开本："+data.载体形态.尺寸或开本+"</td></tr>" +
                        "<tr><td>页数或卷册数："+data.载体形态.页数或卷册数+"</td></tr>" +
                        "<tr><td>出版社："+data.出版发行.出版发行者名称+"</td></tr>" +
                        "<tr><td>出版发行地："+data.出版发行.出版发行地+"</td></tr>" +
                        "<tr><td>出版发行日期："+data.出版发行.出版发行日期+"</td></tr>" +
                        "<tr><td>分类号："+data.中国图书馆图书分类法分类号+"</td></tr>" +
                        "<tr><td>作品语种："+data.作品语种.作品语种+"</td></tr>" +
                        "<tr><td>定价："+data.ISBN.获得方式和或定价+"</td></tr>" ;
                }
               else{
                    str+="<tr><td>关键字："+data.keywords+"</td></tr>" +
                        "<tr><td>ISBN号："+data.ISBN.ISBN+"</td></tr>" +
                        "<tr><td>书刊名："+data.题名与责任者.正题名+"/"+data.题名与责任者.正题名汉语拼音+"</td></tr>" +
                        // "<tr><td>作者："+data.题名与责任者.第一责任者+"</td></tr>" +
                        "<tr><td>作者："+data.责任者.主标目+"</td></tr>" +
                        "<tr><td>尺寸或开本："+data.载体形态.尺寸或开本+"</td></tr>" +
                        "<tr><td>页数或卷册数："+data.载体形态.页数或卷册数+"</td></tr>" +
                        "<tr><td>出版社："+data.出版发行.出版发行者名称+"</td></tr>" +
                        "<tr><td>出版发行地："+data.出版发行.出版发行地+"</td></tr>" +
                        "<tr><td>出版发行日期："+data.出版发行.出版发行日期+"</td></tr>" +
                        "<tr><td>分类号："+data.中国图书馆图书分类法分类号+"</td></tr>" +
                        "<tr><td>作品语种："+data.作品语种.作品语种+"</td></tr>" +
                        "<tr><td>定价："+data.ISBN.获得方式和或定价+"</td></tr>" ;
                }
                $("#pg41_tb4").append(str);

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //alert(XMLHttpRequest.responseText);
            },
        });
    })

    $("#BookPrint").on('click',function () {
        $("#pg41_tb4").printArea();
    })
})

function bookPrev() {
    $(":input[name='pageturn']").val("");
    SearchBook(prevurl,"2");
    var pagenow=$("#bookpageno span[name='pagenow']").text();
    var newpageno=Number(pagenow.substring(0,pagenow.length-1))-1+"/" ;
    $("#bookpageno span[name='pagenow']").html(newpageno);
    Disabledlast(Pageall);
    Disabledfirst();
}

function bookNext() {
    $(":input[name='pageturn']").val("");
    SearchBook(nexturl,"2");
    var pagenow=$("#bookpageno span[name='pagenow']").text();
    var newpageno=Number(pagenow.substring(0,pagenow.length-1))+1+"/" ;
    $("#bookpageno span[name='pagenow']").html(newpageno);
    Disabledlast(Pageall);
    Disabledfirst();
}

function bookTurnto() {
    var pageturn=$(":input[name='pageturn']").val();
    var no=Number(pageturn);
    if((/^(\+|-)?\d+$/.test( no )) && no > 0)
    {
        if(no>Pageall)
        {
            alert("超过最大页数！")
        }
        else
        {
            SearchBook(no,"3");
            var newpageno=no+"/" ;
            $("#bookpageno span[name='pagenow']").html(newpageno);
            $(":input[name='pageturn']").val("");
        }
    }
    else
    {
        alert("请输入正整数！");
    }

}

function Disabledfirst() {
    var pagenow=$("#bookpageno span[name='pagenow']").text();
    var newpageno=pagenow.substring(0,pagenow.length-1);
    if(newpageno=="1")
    {
        $("#Prev").attr("disabled",true);
    }
    else
    {
        $("#Prev").attr("disabled",false);
    }
}

function Disabledlast(Pageall) {
    var pagenow=$("#bookpageno span[name='pagenow']").text();
    var newpageno=pagenow.substring(0,pagenow.length-1);
    if(newpageno==Pageall)
    {
        $("#Next").attr("disabled",true);
    }
    else
    {
        $("#Next").attr("disabled",false);
    }
}

function DeleteBookByBarcode(barcode, stackId) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    if(confirm("确定删除条码为 " + barcode + " 的书目数据数据?")) {
        $.ajax({
            type: "DELETE",
            url: backServerUrl + "api/book/items/" + barcode + "?stack_id=" + stackId,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': et},
            success: function (data) {
                if (data.deleted) {
                    alert("删除成功！");
                    $("#BookSearch").click();
                } else {
                    alert("删除失败！");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.responseText);
            },
        });
    }
}

function SearchBook(param,flag) {
    var Url="";
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $("#pg41_tb2 tr:gt(0)").remove();
    var limit=$("#bookrows option:selected").text();//每页多少行
    var bookname=$("#bookname").val().trim();       //书名
    var clc=$("#clc").val().trim();                  //书类号
    var author=$("#author").val().trim();           //作者
    var barcode=$("#topic").val().trim();             //主题词
    var ISBN=$("#ISBN").val().trim();               //ISBN
    var rangedate=$("#publisherdate").val().trim();//出版日期
    var publisherdate="";
    if(rangedate.length>0)
    {
        switch ($("#daterange").val())
        {
            case "小于":publisherdate=","+(parseInt(rangedate)-1);break;
            case "等于":publisherdate=rangedate;break;
            case "大于":publisherdate=(parseInt(rangedate)+1)+",";break;
        }
    }
    switch(flag){
        case "0":
            $("#bookpageno span[name='pagenow']").html("1/");
            // Url= backServerUrl + "api/book/reference?keyword=&author=&title=&isbn=&publisher=&clc=" + "&publish_year=&topic=&offset=0&limit=10&hold=false";
            Url= backServerUrl + "api/book/items_with_ref?offset=0&limit="+limit+"&is_active=true&ordering=isbn,barcode";
            break;
        case "1":$("#bookpageno span[name='pagenow']").html("1/");
            // Url= backServerUrl + "api/book/reference?keyword=&author=" + author+"&title=" +bookname+"&isbn="+ISBN+"&publisher=&clc="+ clc+"&publish_year="+publisherdate+"&topic="+topic+ "&offset=&limit="+limit+"&hold=false"; break;//加载时
            Url= backServerUrl + "api/book/items_with_ref?keyword=&author=" + author+"&title=" +bookname+"&isbn="+ISBN+"&publisher=&clc="+ clc+"&publish_year="+publisherdate+"&barcode="+barcode+ "&is_active=true&offset=&limit="+limit+"&hold=false&ordering=barcode";
            break;//加载时
        case "2":
            Url= param;
            break;
        case "3":
            // Url= backServerUrl + "api/book/reference?keyword=&author="+ author+"&title=" +bookname+"&isbn="+ISBN+"&publisher=&clc="+ clc+"&publish_year="+publisherdate+"&topic="+topic+    "&offset="+ param+"&limit="+limit+"&hold=false";
            Url= backServerUrl + "api/book/items_with_ref?keyword=&author="+ author+"&title=" +bookname+"&isbn="+ISBN+"&publisher=&clc="+ clc+"&publish_year="+publisherdate+"&barcode="+barcode+    "&is_active=true&offset="+ (param - 1) * limit +"&limit="+limit+"&hold=false";
            break;
        case "4":   //和参数为1相同, 只是结果导出到Excel
            $("#bookpageno span[name='pagenow']").html("1/");
            // Url= backServerUrl + "api/book/reference?keyword=&author=" + author+"&title=" +bookname+"&isbn="+ISBN+"&publisher=&clc="+ clc+"&publish_year="+publisherdate+"&topic="+topic+ "&offset=&limit="+limit+"&hold=false"; break;//加载时
            Url= backServerUrl + "api/book/items_with_ref?keyword=&author=" + author+"&title=" +bookname+"&isbn="+ISBN+"&publisher=&clc="+ clc+"&publish_year="+publisherdate+"&barcode="+barcode+ "&is_active=true&offset=&limit=-1&hold=false&ordering=barcode";
            break;//加载时
    }
    $.ajax({
        type: "GET",
        url: Url,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            nexturl=backServerUrl+data.next.substr(1);
            prevurl=backServerUrl+data.prev.substr(1);
            if(data.count<=0)
            {
                alert("无法找到符合条件的文献，请核查检索条件！");
                SearchBook("","0");
            }
            else {
                // if(Url.length<=0)
                // {
                //     alert("共检索到相关文献"+data.count+"册！");
                // }

                if(userInfo.username === "shrfid"){
                    // if($("#pg41_tb2 thead tr th").length === 6 ){
                    //     $("#pg41_tb2 thead tr").append("<th>操作</th>");
                    // }
                }


                var str="";
                for(var index in data.content)
                {
                    // str+="<tr><td value='"+data.content[index].id+"'>"+data.content[index].ISBN.ISBN+"</td>"+
                    // if(userInfo.username === "shrfid"){
                    //     str+="<tr><td value='"+data.content[index].reference+"'>"+data.content[index].ISBN.ISBN+"</td>"+
                    //         "<td>"+data.content[index].barcode+"</td>"+
                    //         "<td title='"+data.content[index].stack+"'>"+data.content[index].stack_name+"</td>"+
                    //         "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;' title='"+data.content[index].题名与责任者.正题名+"'>"+data.content[index].题名与责任者.正题名+"</td>"+   //table-layout:fixed;
                    //         "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'>"+data.content[index].责任者.主标目+"</td>"+
                    //         "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'>"+data.content[index].出版发行.出版发行者名称+"</td>" +
                    //         "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'>"+data.content[index].shelf_info_nested.row + "排" + data.content[index].shelf_info_nested.column + "列"+"</td>" +
                    //         "<td style=''overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'> <input type='button' style='width: 60px;' value='删除' onclick='DeleteBookByBarcode(\""+data.content[index].barcode+"\",\""+data.content[index].stack+"\")'></td></tr>";
                    // } else {
                    var color = "red";
                    if(data.content[index].is_available)
                        color = "black";
                    str+="<tr><td value='"+data.content[index].reference+"'>"+data.content[index].ISBN.ISBN+"</td>"+
                        "<td>"+data.content[index].barcode+"</td>"+
                        "<td title='"+data.content[index].stack+"'>"+data.content[index].stack_name+"</td>"+
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;' title='"+data.content[index].题名与责任者.正题名+"'>"+data.content[index].题名与责任者.正题名+"</td>"+
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;' title='"+data.content[index].责任者.主标目+"'>"+data.content[index].责任者.主标目+"</td>"+
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;' title='"+data.content[index].出版发行.出版发行者名称+"'>"+data.content[index].出版发行.出版发行者名称+"</td>" +
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'>"+data.content[index].出版发行.出版发行日期+"</td>" +
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'' title='"+data.content[index].clc+"'>"+data.content[index].clc+"</td>" +
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'>"+data.content[index].载体形态.页数或卷册数+"</td>" +
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'>"+data.content[index].ISBN.获得方式和或定价+"</td>" +
                        "<td style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis; color:" + color + "'>"+data.content[index].shelf_info_nested.row + "排" + data.content[index].shelf_info_nested.column + "列"+"</td>" +
                        "<td style=''overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'> <input type='button' style='width: 60px;' value='书评' onclick='DisplayBookViews(\""+data.content[index].reference+"\",\""+data.content[index].题名与责任者.正题名+"\")'>&nbsp;&nbsp;<input type='button' style='width: 60px;' value='删除' onclick='DeleteBookByBarcode(\""+data.content[index].barcode+"\",\""+data.content[index].stack+"\")'></td></tr>";
                    // }
                }
            }
            Pageall=Math.ceil(data.count/limit);
            $("#bookpageno span[name='pageall']").html(Pageall+"页");
            Disabledfirst();
            Disabledlast(Pageall);
            $("#pg41_tb2").append(str);
            if(flag === "4"){
                ReportGeneralXLS("图书检索结果", "pg41_tb2");
                Pageall = 1;
                $("#bookpageno span[name='pageall']").html("1页");
                Disabledfirst();
                Disabledlast(1);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.responseText);
        },
    });
}//查询图书

function DisplayBookViews(reference, title) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "GET",
        // url: backServerUrl + "api/book/reviews?reader=444444444444444444&reference=-793549184"+reference,
        // url: backServerUrl + "api/book/reviews?reader=&reference=2010370287",
        url: backServerUrl + "api/book/reviews?reader=&reference=" + reference,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            var bookviewdiv = "<div id='bookviewdiv' style='z-index:999; position:relative; top 100px; width: 800px; height: 600px; margin: 100px auto; background: #fff9b8; border: 1px solid blue; text-align: center; vertical-align: top; color:#1619e9; font-size: 20px;' >";
            if(data.content.length > 0){
                bookviewdiv +="<table style='width: 100%; font-size: 16px;'><thead><tr><td colspan='3'>《" + title + "》&nbsp;&nbsp;书评</td><td style='vertical-align: top; width:30px;'><input type='button' value='关闭' onclick='$(\"#bookviewdiv\").remove();'></td></tr></thead><tbody id='viewbody'>";
                for(var i in data.content){
                    if(data.content[i].reader === userInfo.username){
                        bookviewdiv += "<tr id='" + data.content[i].id+ "'><td style='width: 120px;'>" + data.content[i].datetime.substring(0,10) + "</td><td style='width: 100px;'>" + data.content[i].reader + "</td><td colspan='1'>" + data.content[i].content + "</td><td><input type='button' value='删除评论' onclick='DeleteBookView(\"" + data.content[i].id+ "\");'></td></tr>";
                    }else{
                        bookviewdiv += "<tr><td style='width: 120px;'>" + data.content[i].datetime.substring(0,10) + "</td><td style='width: 100px;'>" + data.content[i].reader + "</td><td colspan='2'>" + data.content[i].content + "</td></tr>";
                    }
                }
            }else{
                bookviewdiv +="<table style='width: 100%;'><thead><tr><td colspan='3'>《" + title + "》&nbsp;&nbsp;书评</td><td  style='vertical-align: top; width:30px;'><input type='button' value='关闭' onclick='$(\"#bookviewdiv\").remove();'></td></tr></thead><tbody id='viewbody'>";
            }
            bookviewdiv +="<tr><td colspan='3'><input id='editview' type='text' placeholder='添加书评' style='width: 98%;'></td><td><input type='button' value='提交书评' onclick='AddBookView(\"" + reference+ "\");'></td></tr>";
            bookviewdiv +="</tbody></table></div>";
            $("body").append(bookviewdiv);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //alert(XMLHttpRequest.responseText);
        },
    });
}

function AddBookView(reference) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var bookview = $("#editview").val();
    var urlbody = '{"reference":"' + reference + '","reader":"' + userInfo.username + '","content":"' + bookview + '"}';
    var now = new Date().format("yyyy-MM-dd");
    $.ajax({
        type: "POST",
        url: backServerUrl + "api/book/reviews",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        data: urlbody,
        success: function (data) {
            if(data.created){
                alert("添加书评成功!");
                var viewbody = "<tr id='" + data.id+ "'><td style='width: 120px;'>" + now + "</td><td style='width: 100px;'>" + userInfo.username + "</td><td colspan='1'>" + bookview + "</td><td><input type='button' value='删除评论' onclick='DeleteBookView(\"" + data.id+ "\");'></td></tr>";
                $("#viewbody tr:first").before(viewbody);
            }else{
                alert("添加书评失败!");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //alert(XMLHttpRequest.responseText);
        },
    });
}

function DeleteBookView(reference) {
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var bookview = $("#editview").val();
    $.ajax({
        type: "DELETE",
        url: backServerUrl + "api/book/reviews/" + reference,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            if(data.deleted){
                alert("删除书评成功!");
                $("#" + reference).remove();
            }else{
                alert("删除书评失败!");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //alert(XMLHttpRequest.responseText);
        },
    });
}


