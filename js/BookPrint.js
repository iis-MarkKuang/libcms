
var BookPrintAll = function () {

    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var svgdist="";
    const x = 72/25.4;

    var BookPrint = new Vue({
        el:"#bookbarcodeprint",
        data:{
            // codestart:'',
            // codeend:''
        },
        methods:{
            preview:function () {
                var codestart = $("#codestart").val();
                var codeend = $("#codeend").val();
                if(codestart.length<=0&&codeend.length<=0)
                {
                    alert("请输入条码号!");
                }
                else {
                    ShowQRcode(codestart,codeend);
                }
            },
            bookprint:function () {
                $("#QRcodeTB").printArea();
            }
        }
    });

    var BookCodeManage = new Vue({
        el:"#BookcodeManage",
        data:{
            schoolname:"",
            topdist:"",
            leftdist:"",
            bookwidth:"5",
            bookheight:"20",
            bookclos:"4",
            isShowcode:"true",
            vertical:"",
            horizontal:"",
            lines:"",
            rows:"",
            codestart:"",
            codeend:"",
            schoolnamefont:"15",
            bookindexfont:"15",
            barcodefont:"15"
        },
        methods: {
            changename:function () {
                $(".schoolname").text(BookCodeManage.schoolname);
                $(".schoolname").css('display','block');
            },

            changelent:function () {
                var tdwidth =  x * BookCodeManage.bookwidth +'pt';
                var tdheight =  x * BookCodeManage.bookheight +'pt';
                $("#previewbody").find("tr td").css('width', tdwidth);
                $("#previewbody").find("tr td").css('height', tdheight);
            },

            changecols:function () {
                BookCodeManage.searchbycode();
            },

            changeisshow:function () {
                BookCodeManage.searchbycode();
            },

            changefont:function () {
                $('.schoolname').css('font-size',BookCodeManage.schoolnamefont+'px');
                $('.bookindex').css('font-size',BookCodeManage.bookindexfont+'px');
                $('.barcodefont').css('font-size',BookCodeManage.barcodefont+'px');
            },

            searchbycode:function () {
                var tablerowNow = $(".tablerow").val();
                $("#previewbody, #printlistbody").find("tr").remove();
                var _start = BookCodeManage.codestart.trim();
                var _end = BookCodeManage.codeend.trim();
                var Url;

                if(_start.length<=0&&_end.length<=0)
                {
                    alert("请输入起始书码和终止书码");
                    return;
                }
                else  if(!tablerowNow&&tablerowNow!==0){
                    var Url = backServerUrl + "api/book/items/within?barcode_upper="+_end+"&barcode_lower="+_start+"&offset=0&limit=10";
                }
                else
                {
                    tablerowNow=tablerowNow.trim()
                    Url = backServerUrl + "api/book/items/within?barcode_upper="+_end+"&barcode_lower="+_start+"&offset=0&limit="+tablerowNow;
                }
                GetCodelist(Url);
            },

            bookcodeprint:function () {
                $("#viewlist").printArea();
            }
        }
    });

    var Barcodemanage = new Vue({
        el: '#BarcodeManage',
        data: {
            prefix:"",
            codestandard:"CODE39",
            svgdist:"",
            codestart:"",
            codeend:"",
            codewidth:"",
            codeheight:"",
        },
        methods:{
            codepreview:function () {
                var _start = Barcodemanage.codestart.trim();
                var _end = Barcodemanage.codeend.trim();
                var codewidth = Barcodemanage.codewidth.trim();
                var codeheight = Barcodemanage.codeheight.trim();
                if(_start.length<=0 && _end.length<=0)
                {
                    alert("请输入条码号");
                    return;
                }
                else if (codewidth.length<=0)
                {
                    alert("请输入条码宽度");
                    $("#codewidth").focus();
                    return;
                }
                else if(codeheight.length<=0)
                {
                    alert("请输入条码高度");
                    $("#codeheight").focus();
                    return;
                }
                else{
                    ShowQRcode(_start,_end);
                }
            },

            changedist:function () {
                // svgdist =  x * Barcodemanage.svgdist +'pt';
                // $(".svgdist").css('margin-left', svgdist);
            },

            codeprint:function () {
                $("#barcodelist").printArea();
            }
        }
    });

    function ShowQRcode(start,end) {
        $("#QRcodeTB").find("svg, span, br").remove();
        var codehtml ="";
        var codeid = [];
        var startlength = start.length;
        var endlength = end.length;
        var s = "";
        var j = 1;
        if(startlength!=endlength)
        {
            alert("起始条码与终止条码长度应该相等！");
            return;
        }
        else if (parseInt(end)-parseInt(start)>100)
        {
            alert("一次最多打印100个条码！");
            return;
        }
        else if (parseInt(start) > parseInt(end))
        {
            alert("终止条码不能小于起始条码！");
            return;
        }
        else {
            for(var k = 0;k<endlength;k++)
            {
                s+='0';
            }
            for(var i=start;i<=end;i++)
            {
                i=(s+i).slice(-endlength);
                codehtml ="<span style='margin-left: "+(x * Barcodemanage.svgdist + 'pt')+" '>"
                    + "<svg style='width:"+(x * Barcodemanage.codewidth + 'pt')
                    + " ;height: "+(x * Barcodemanage.codeheight + 'pt')+";' id='QRcode"+Barcodemanage.prefix + i+"'></svg></span>";
                // if(j%2==0)
                // {
                //     codehtml += "<br>";
                // }
                $("#QRcodeTB").append(codehtml);
                JSBarcode(Barcodemanage.prefix + i);
                j++;
            }
        }
    }

    function JSBarcode(codeid) {
        JsBarcode("#QRcode"+codeid, codeid, {
            format:Barcodemanage.codestandard,
            // width:parseInt(Barcodemanage.codewidth),
            // height:parseInt(Barcodemanage.codeheight),
            // margin:parseInt(Barcodemanage.svgdist),
            // textMargin:5,
            fontSize:60,
            background:"transparent",
            displayValue: true
        });
    }//条形码插件

    function GetCodelist(Url) {
        var listhtml = "";
        var previewhtml = "<tr style='height: 80px;'>";
        var j = 0;
        $.ajax({
            type: "GET",
            url: Url,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                var isbn,author,publisher  = [];
                var purl = parseURL(Url);
                if (purl.params.offset === "")
                    purl.params.offset = 0;
                var count = data.count/10;
                var z = 0;
                $.each(data.content, function (i) {
                    isbn = (data.content[i].reference_info.hasOwnProperty("value"))?"":data.content[i].reference_info.ISBN.ISBN;
                    author = (data.content[i].reference_info.hasOwnProperty("value"))?"":data.content[i].reference_info.责任者.主标目
                    publisher = (data.content[i].reference_info.hasOwnProperty("value"))?"":data.content[i].reference_info.出版发行.出版发行者名称
                    listhtml += "<tr><td>" + data.content[i].item_info.barcode
                        +"</td><td>" + isbn
                        +"</td><td>" + data.content[i].item_info.clc
                        +"</td><td>" + data.content[i].item_info.title
                        +"</td><td>" + author
                        +"</td><td>" + publisher
                        +"</td></tr>";

                    if(!BookCodeManage.isShowcode){
                        previewhtml += "<td style='vertical-align: middle'><span class='schoolname'>"
                            + BookCodeManage.schoolname + "</span><span class='bookindex' style='display: block'>"
                            + data.content[i].item_info.clc+"/"+data.content[i].item_info.book_index
                            +"</span></td>";
                        z++;
                    }
                    else if(data.content[i].item_info.clc.length>0&&
                        data.content[i].item_info.book_index.toString().length>0)
                    {
                        previewhtml += "<td style='vertical-align: middle'><span class='schoolname'>"
                            + BookCodeManage.schoolname + "</span><span class='bookindex' style='display: block'>"
                            + data.content[i].item_info.clc+"/"+data.content[i].item_info.book_index
                            +"</span><span class='barcodefont' style='display: block;'>" + '('+data.content[i].item_info.barcode+')'
                            +"</td>";
                        z++;
                    }
                    if( z % (BookCodeManage.bookclos) == 0 && z!= 0 )
                    {
                        previewhtml += "</tr><tr style='height: 80px'>";
                    }

                })

                previewhtml += "</tr>";

                if (data.prev === "" && data.next === "") {
                    listhtml += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.next.substring(1) + "\")'>"
                        +" <input type = 'text' class='tablerow' placeholder='输入表格行数,回车结束' / >"+"</td></tr>";
                } else if (data.prev === "" && data.next !== "") {
                    listhtml += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.next.substring(1) + "\")'>"
                        +" <input type = 'text' class='tablerow' v-model='tablerow' placeholder='输入表格行数,回车结束' / >"+"</td></tr>";
                } else if (data.prev !== "" && data.next === "") {
                    listhtml += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.next.substring(1) + "\")'>"
                        +" <input type = 'text' class='tablerow' placeholder='输入表格行数,回车结束' / >"+"</td></tr>";
                } else {
                    listhtml += "<tr><td colspan='6'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='BookPrintAll.GetCodelist(\"" + backServerUrl + data.next.substring(1) + "\")'>"
                        +" <input type = 'text' class='tablerow' placeholder='输入表格行数,回车结束' / >"+"</td></tr>";
                }

                $("#printlistbody").append(listhtml);
                $("#previewbody").append(previewhtml);
                if(z%parseInt(BookCodeManage.bookclos)===0){
                    console.log($("#previewbody"))
                    $("#previewbody tr:last").remove()
                }
                $('.schoolname').css('font-size',BookCodeManage.schoolnamefont+'px');
                $('.bookindex').css('font-size',BookCodeManage.bookindexfont+'px');
                $('.barcodefont').css('font-size',BookCodeManage.barcodefont+'px');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.responseText.indexOf("no record can be found") > 0)
                {
                    alert("未找到该条码图书");
                    return;
                };
            },
        });
    }

    function InitPage(pages) {
        $(document).off('keydown');
        $(document).ready(function () {
            $(document).keydown(function (event) {
                if(event.keyCode === 13)
                {
                    //BookCodeManage.searchbycode;
                    switch (pages) {
                        case "book_print": $("#searchbycode").click();
                            break;
                        case "reader_print": $("#codepreview").click();
                            break;
                    }
                }
            })
        })
        $("#codestart").focus();
        // $("#barcodelist").css('width', x * 210 + 'pt');
        // $("#barcodelist").css('height', x * 297 + 'pt');
        // $("#barcodelist").css('margin', 'auto');
    }

    return {
        InitPage:InitPage,
        GetCodelist:GetCodelist,
    }
}();













