var count = 0;
var connectfail = 0;
var libraryName = "";
var oldLibraryName = "";
var surl = "";
var sinlib = "";
var setIntervalID = 0;
var deviceListLeft = 20;
var deviceListTop = 72;
var deviceDivWidth= 360;
var oldDeviceDisplayCount = 0;
var globalDeviceFilter;
var globalDeviceFilterHight = 0;
var updateInterval = 10000;
var menuWidth = 300;
var commandCount = 0;
var OCBefore = new Array();
var OCAfter = new Array();
var isAdmin = false;
var logPage = 1;
var listMode = "list";
var startTime = "";
var endTime = "";
var mouseX;
var mouseY;
var adjustAction;
var devColumns;
var leftPanelSelectAction = 0;
var locationMap = {};
var deviceAliasToLocationMap = {};
var cardTypeMap = {};
var deviceNameToIdMap = {};
var globalCountData;
var deviceCountInfo = {};
var cardtypeToNameMap = {};
var cardtypeReflectOn = false;

function mouseMove(ev)
{
    Ev= ev || window.event;
    var mousePos = mouseCoords(ev);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
    if(adjustAction === 1) {
        menuWidth = mouseX;
        $("#content").css("left",(parseInt(menuWidth) + 1) + "px");
        $("#content").css("width",(width - (parseInt(menuWidth) + 1)) +"px");
        $("#leftpanel").show();
        $("#leftpanel").css("width",menuWidth + "px");
        $("#leftpanelctrl").css("left",menuWidth + "px");
        $("#adjustline").css("left", menuWidth + "px");
        if(mouseX <= 0) {
            $("#leftpanelctrl").css("background-image", "url(\"/images/toright.png\")");
            $("#leftpanel").hide();
            adjustAction = 0;
            menuWidth = 300;
        }
        else
            $("#leftpanelctrl").css("background-image","url(\"/images/toleft.png\")");
    }
}
function mouseCoords(ev)
{
    if(ev.pageX || ev.pageY){
        return {x:ev.pageX, y:ev.pageY};
    }
    return{
        x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y:ev.clientY + document.body.scrollTop - document.body.clientTop
    };
}

function ProcessResize()
{
    height = document.documentElement.clientHeight||document.body.clientHeight;
    width = document.documentElement.clientWidth||document.body.clientWidth;
    console.log("height = " + height + "   width = " + width);
    var menuHeight = height - 42 -30 - 26 + 12;  //浏览器宽度变小时，高度值有时会差12个像素
    var reg = /\d+/;
    var w = $("#leftpanel").css("width").match(reg)[0];
    $("#leftpanel").css("height",menuHeight + "px");
    $("#content").css("height", menuHeight + "px");
    $("#adjustline").css("height", menuHeight + "px");
    if(w > 0) {
        $("#content").css("width", (width - (parseInt(menuWidth) + 1)) + "px");
        $("#content").css("left", (parseInt(menuWidth) + 1) + "px");
        //$("#adjustline").css("left", menuWidth + "px");
    }else{
        $("#content").css("width", width + "px");
        $("#content").css("left", "0px");
        //$("#adjustline").css("left", "0px");
    }

    $("#leftpanelctrl").css("top", (menuHeight/2 + 42 + 30 - 8) + "px");
    var leftPanelHeight = height - mainHeaderHeight - GetElementHW("footer","height");
    $("#leftpanel").css("height", leftPanelHeight + "px");
    $("#content").css("height", (leftPanelHeight - 5) + "px");
    //var adjustLineHeight = GetElementHW("devicefilter","height");
    //if(adjustLineHeight < leftPanelHeight)
    //    adjustLineHeight = leftPanelHeight;

    //globalDeviceFilterHight = ($("#devicefilter").outerHeight());
    deviceListTop = 72 + globalDeviceFilterHight;

    devColumns = Math.floor((width - 100 - menuWidth) / (deviceDivWidth));
    if(devColumns === 0) devColumns = 1;
    var maxDivHeight = 0;
    var tempHeight = 0;
    var groupLabel = "";
    var groupIntraI = 0;
    var groupCount = 0;
    var titleHeight = 50;
    var titleCount = 0;
    var groupTop = 0;
    $("div[id^='lt-']").remove();
    $("#content div[id^=dev-]").each(function(index){
        var title = $(this).children("table").children("tbody").children("tr").children("td").attr("id").substring(8);
        console.log(title);
        if(index == 0){
            groupLabel = title;
            var top1 = 22 + globalDeviceFilterHight;
            groupTop = top1;
            var locationTitle = "<div id='lt-" + title + "' style='position:absolute;font-size: 26px; height:30px; width:80%; left:" + deviceListLeft + "px; top:" + top1 + "px; border-top: 1px solid #98BCB9;'>" + title + "</div>";
            $("#content").append(locationTitle);
            groupTop += parseInt(titleHeight);
        }
        if(groupLabel !== title)
        {
            maxDivHeight = tempHeight;
            groupLabel = title;
            groupCount += Math.ceil(groupIntraI/devColumns);
            groupIntraI = 0;
            //var top1 = deviceListTop + titleHeight*titleCount + (parseInt(maxDivHeight) + 20)*(Math.floor(groupIntraI/devColumns) + groupCount);
            groupTop += parseInt(maxDivHeight) + 20;
            var locationTitle = "<div id='lt-" + title + "' style='position:absolute;font-size: 26px; height:30px; width:80%; left:" + deviceListLeft + "px; top:" + groupTop + "px; border-top: 1px solid #98BCB9;'>" + title + "</div>";
            $("#content").append(locationTitle);
            groupTop += parseInt(titleHeight);
            titleCount++;
        }
        var left = deviceListLeft + 400*(groupIntraI%devColumns);
        $(this).css("left",left + "px");
        //var top = deviceListTop + titleHeight*titleCount + (parseInt(maxDivHeight) + 20)*(Math.floor(groupIntraI/devColumns) + groupCount);
        if(Math.floor(groupIntraI/devColumns) > 0 && left === deviceListLeft)
        {
            groupTop += (parseInt(maxDivHeight) + 20);  //*Math.floor(groupIntraI/devColumns)
            maxDivHeight = 0;
            tempHeight = 0;
        }
        $(this).css("top", groupTop + "px");
        var w = $(this).css("height").match(reg)[0];
        if(tempHeight <= w)
            tempHeight = w;
        if(maxDivHeight == 0 || (maxDivHeight < tempHeight && groupIntraI%devColumns == (devColumns - 1))) {
            maxDivHeight = tempHeight;
        }
        groupIntraI++;

    });

    $("#logdetails").css("width",width - menuWidth);
    $("#logdetails").css("height",height - 105);
    $("#logpages").css("width",width - menuWidth - 20);
    $("#logpages").css("height",height - 165);
}
window.onresize = function(){
    ProcessResize();
};

function UpdateData()
{
    if(surl === ""){
        var backServerUrl = window.localStorage["backServerUrl"];
        var url = backServerUrl + "api/devices/status";
        GetDeviceList(url,"");
    }else{
        GetDeviceList(surl, sinlib);
    }
}

function SetUpdateInterval()
{
    updateInterval = parseInt($("#intervaltext").val()) * 1000;
//        alert(updateInterval);
    alert("设置完成!");
}

function DisplayDeviceStatus()
{
    $("table[id^='bookshelf']").remove();
    $("table[id*='count']").remove();
    $("div[id^='count_chart']").remove();
    $("input[id^='buttoncount']").remove();
    $("label[name^='devicecountlabel']").remove();
    $("input[name='devicecountradio']").remove();

    $("#systemmanage").remove();
    //if(globalDeviceFilter != null)
    //{
    //    $("#content").prepend(globalDeviceFilter);
    //}
    //console.log("$(\"input[name='devicegroupid']:checked\").length = " + $("input[name='devicegroupid']:checked").length);
    if($("input[name='devicetypeid']:checked").length == 0 || $("input[name='devicegroupid']:checked").length == 0)
    {
        if(setIntervalID != 0)
        {
            window.clearInterval(setIntervalID);
            setIntervalID = 0;
        }
        $("#content").html("");
        console.log("设备数量为0，函数返回");
        return;
    }
    UpdateData();
    if(setIntervalID == 0)
        setIntervalID = setInterval("UpdateData()",updateInterval);
//        CheckSelect();
}


function BeforCount()
{
    if(setIntervalID != 0)
    {
        window.clearInterval(setIntervalID);
        setIntervalID = 0;
//            $("#content div[id^=dev]").remove();
    }
    if($("#devicefilter").length > 0)
    {
        globalDeviceFilter = $("#devicefilter");
    }
}


function ChangeCountDevice(interval)
{
    //console.log(JSON.stringify(globalCountData));
    var deviceName = $("input[name=devicecountradio]:checked").val();
    console.log(deviceName);
    var data = globalCountData;
    var deviceInfo = data.aggregations.device.buckets;
    var tableHead = "";
    var index = 0;
    for(var i in deviceInfo){
        if(deviceInfo[i].key === deviceName){
            tableHead += "<th style='text-align: right;'>" + deviceInfo[i].key + "</th>";
            index = i;
            break;
        }
    }
    console.log("index = " + index);
    var tableCount = "<thead><tr style='background-color: cadetblue; color: white;'><th>日期</th>" + tableHead + "</tr></thead><tbody>";
    //tableCount += "<thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th style='text-align: right;'>办证数量</th></tr></thead><tbody>";
    var bu = data.aggregations.device.buckets[index].datetime.buckets;
    var ddata = "";
    for(var i in bu) {
        ddata = "";
        //for(var j in deviceInfo){
        //    ddata += "<td style='text-align: right;'>" + deviceInfo[index].datetime.buckets[i].doc_count + "</td>";
        //}
        tableCount += "<tr><th>"+bu[i].key_as_string.substring(0,10) +"</th><td style='text-align: right;'>" + bu[i].doc_count + "</td></tr>";
        //tableCount += "<tr><th>"+bu[i].key_as_string.substring(0,10) +"</th><td style='text-align: right;'>" + bu[i].doc_count + "</td></tr>";
    }
    tableCount += "</tbody>";

    $("#tablecountdate").html(tableCount);

    //按日期显示
    $('#count_chart_date').highcharts({
        data: {
            table: 'tablecountdate'
        },
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 2,
                beta: 2,
                viewDistance: 25,
                depth: 20
            },
            backgroundColor: 'rgba(0,0,0,0)'
        },
        credits:{
            enabled: false
        },
        title: {
            text: deviceAliasToLocationMap[deviceName] + '设备' + deviceName + '办证统计(按日期)      共办理 '+ data.aggregations.device.buckets[index].doc_count + " 张读者证"
        },
        xAxis: {
            type: 'datetime',
            labels: {
                step: 1,
                formatter: function () {
//                                    return Highcharts.dateFormat('%Y-%m-%d', this.value);
                    if(interval === "1d")
                        return Highcharts.dateFormat('%m月%d日', this.value);
                    else if(interval === "1m")
                        return Highcharts.dateFormat('%B', this.value);
                    else if(interval === "1y")
                        return Highcharts.dateFormat('%Y年', this.value);
                }
            }
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: '办证数量'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            formatter: function () {
//                                return '<b>' + this.series.name + '</b><br/>' +
//                                        this.point.y + ' ' + this.point.name.toLowerCase();
                if(interval === "1d")
                    return '<b>' + Highcharts.dateFormat('%Y年%m月%d日', this.point.x) + '</b><br/>办证数量：' + this.point.y;
                else if(interval === "1m")
                    return '<b>' + Highcharts.dateFormat('%B', this.point.x) + '</b><br/>办证数量：' + this.point.y;
                else if(interval === "1y")
                    return '<b>' + Highcharts.dateFormat('%Y年', this.point.x) + '</b><br/>办证数量：' + this.point.y;
            }
        }
    });

    //移除最后一列　
    //$("#tab1 tr :last-child").remove();
    //移除第一列　
    //$("#tab1 tr :first-child").remove();　
    //移除指定的列, 注:这种索引从1开始　
    //$("#tablecountdate tr :nth-child(2)").remove();　
    //移除第一列之外的列　
    //$("#tab1 tr :not(:nth-child(1))").remove();
}

function ChangeCountDeviceBR(interval)
{
    //console.log(JSON.stringify(globalCountData));
    var deviceName = $("input[name=devicecountradio]:checked").val();
    //console.log(deviceName);
    var data = globalCountData;
    var deviceInfo = data.aggregations.device.buckets;
    var tableHead = "";
    var index = 0;
    for(var i in deviceInfo){
        if(deviceInfo[i].key === deviceName){

            //tableHead += "<th style='text-align: right;'>" + deviceInfo[i].key + "</th>";
            index = i;
            break;
        }
    }
    console.log("index = " + index);
    tableHead += "<th style='text-align: right;'>还书数量</th>";
    tableHead += "<th style='text-align: right;'>借书数量</th>";
    tableHead += "<th style='text-align: right;'>续借数量</th>";
    var tableCount = "<thead><tr style='background-color: cadetblue; color: white;'><th>日期</th>" + tableHead + "</tr></thead><tbody>";
    //tableCount += "<thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th style='text-align: right;'>办证数量</th></tr></thead><tbody>";
    var bu = data.aggregations.device.buckets[index].datetime.buckets;
    var ddata = "";
    var brBorrow = 0;
    var brReturn = 0;
    var brRenew = 0;
    for(var i in bu) {
        brBorrow = 0;
        brReturn = 0;
        brRenew = 0;
        var brcount = bu[i].operation.buckets;
        if(brcount.length > 0) {
            for (var j in brcount) {
                if(brcount[j].key === "borrow"){
                    brBorrow = brcount[j].doc_count;
                }else if(brcount[j].key === "renew"){
                    brRenew = brcount[j].doc_count;
                }else if(brcount[j].key === "return"){
                    brReturn = brcount[j].doc_count;
                }
            }
        }
        tableCount += "<tr><th>"+bu[i].key_as_string.substring(0,10) +"</th><td style='text-align: right;'>" + brReturn + "</td><td style='text-align: right;'>" + brBorrow + "</td><td style='text-align: right;'>" + brRenew + "</td></tr>";
        //tableCount += "<tr><th>"+bu[i].key_as_string.substring(0,10) +"</th><td style='text-align: right;'>" + bu[i].doc_count + "</td></tr>";
    }
    tableCount += "</tbody>";

    $("#tablecountdate").html(tableCount);

    //按日期显示
    $('#count_chart_date').highcharts({
        data: {
            table: 'tablecountdate'
        },
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 2,
                beta: 2,
                viewDistance: 25,
                depth: 20
            },
            backgroundColor: 'rgba(0,0,0,0)'
        },
        credits:{
            enabled: false
        },
        title: {
            text: deviceAliasToLocationMap[deviceName] + '设备 ' + deviceName + '流通统计(按日期)'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                step: 1,
                formatter: function () {
//                                    return Highcharts.dateFormat('%Y-%m-%d', this.value);
                    if(interval === "1d")
                        return Highcharts.dateFormat('%m月%d日', this.value);
                    else if(interval === "1m")
                        return Highcharts.dateFormat('%B', this.value);
                    else if(interval === "1y")
                        return Highcharts.dateFormat('%Y年', this.value);
                }
            }
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: '借还数量'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            formatter: function () {
//                                return '<b>' + this.series.name + '</b><br/>' +
//                                        this.point.y + ' ' + this.point.name.toLowerCase();
                if(interval === "1d")
                    return '<b>' + Highcharts.dateFormat('%Y年%m月%d日', this.point.x) + '</b><br/>' + this.series.name + ":" + this.point.y;
                else if(interval === "1m")
                    return '<b>' + Highcharts.dateFormat('%B', this.point.x) + '</b><br/>' + this.series.name + ":" + this.point.y;
                else if(interval === "1y")
                    return '<b>' + Highcharts.dateFormat('%Y年', this.point.x) + '</b><br/>' + this.series.name + ":" + this.point.y;
            }
        }
    });
}

function DisplayLog(data)
{
//        console.log("内容"+ logPage + ":" + data.content);
//        alert("内容"+ logPage + ":" + data.content);
    if($("#logdetails").length == 0)
    {
        var logDetailsHeight = height - 105;
        //console.log("logDetailsHeight = " + logDetailsHeight);
        var logHeight = logDetailsHeight - 60;
        var csDiv = "<div id='logdetails' style='z-index:16; position:absolute; background-color:rgb(245, 252, 238); border: 1px solid rgb(252, 252, 227); width: " + width + "px; height:" + logDetailsHeight + "px; box-shadow: 1px 1px 1px #535353;'><div><input type='button' value='关闭日志窗口' onclick='CloseLogWindow();'></div>";
        csDiv += "<div id='logpages' style='width:" + (width - menuWidth - 20) + "px; height:" + logHeight + "px;overflow-x:auto;overflow-y:auto; border:0px solid bule;'></div>";
        csDiv += "<div><input id='prev' type='button' value='上一页' onclick='logPage--;ViewLog(\""+data.prev+"\");'><p id='page' style='display: inline;'>" + logPage + "</p>/" + data.count + "<input id='next' type='button' value='下一页' onclick='logPage++;ViewLog(\""+data.next+"\");'>" + "</div>";
        csDiv += "</div>";
        $("#content").append(csDiv);
        //console.log("offsetTop = " + $("#logdetails").offset);
        $("#logdetails").css("left",0);
        var contentScrollTop = $("#content")[0].scrollTop;
        $("#logdetails").css("top",contentScrollTop + "px");
        if(data.next == "")
            $("#next").prop("disabled",true);
        $("#prev").prop("disabled",true);
        $("#logpages").html(utf8to16(base64decode(data.content)));
    }
    else
    {
        $("#logdetails").css("left",0);
        var contentScrollTop = $("#content")[0].scrollTop;
        $("#logdetails").css("top",contentScrollTop + "px");
        $("#page").html(logPage);
        if(data.prev === "")
            $("#prev").prop("disabled",true);
        else
            $("#prev").prop("disabled",false);
        if(data.next === "")
            $("#next").prop("disabled",true);
        else
            $("#next").prop("disabled",false);
        $("#prev").attr("onclick","logPage--;ViewLog(\""+data.prev+"\");");
        $("#next").attr("onclick","logPage++;ViewLog(\""+data.next+"\");");
        $("#logpages").html(utf8to16(base64decode(data.content)));
        $("#logdetails").show();
    }
//        $("#logdetails").mouseleave(function(){
//            $(this).hide();
//        });
}

function ShowCountTable(tableID)
{
    $("#"+tableID).toggle();
    var buttonID = "button" + tableID.substring(5);
    if($("#"+tableID).is(":hidden"))
    {
        $("#"+buttonID).attr("value","显示表格");
    }
    else
    {
        $("#"+buttonID).attr("value","隐藏表格");
    }
}


function PrintCountTable(tableID,title)
{
    var op = window.open();
    op.document.writeln('<!DOCTYPE html><html><head><style type="text/css" media="print">@page { size: landscape; }</style></head><body>');
    op.document.writeln("<div style='margin: auto auto 30px; width:90%; font-size: 30px; text-align: center;'>" + title + "</div>");
    op.document.writeln("<div style='margin: auto; width:90%;'>起始日期：" + new Date(startTime).format('yyyy-MM-dd hh:mm:ss') + " 结束日期：" + new Date(endTime).format('yyyy-MM-dd hh:mm:ss') + "</div>");
    op.document.writeln(tableID.outerHTML);
    op.document.writeln('<script>document.getElementById(\"'+tableID.getAttribute("id")+'\").style.display = ""</script>');
    if(title === "办证统计(按办证结果)")
        op.document.writeln('<script>document.getElementById(\"'+tableID.getAttribute("id")+'\").style.fontSize = "9pt"</script>');
    else
        op.document.writeln('<script>document.getElementById(\"'+tableID.getAttribute("id")+'\").style.fontSize = "12pt"</script>');
    op.document.writeln('<script>window.print()</script>');
    op.document.writeln('</body></html>');
    op.document.close();
}

function CloseLogWindow()
{
    $("#logdetails").remove();
    logPage = 1;
}

function MenuToggle()
{
    var reg = /\d+/;
    var w = $("#leftpanel").css("width").match(reg)[0];
    if(w > 0)
    {
        $("#leftpanel").toggle("fast", function () {
            $(this).css("width", "0px");
        });
        $("#content").animate({left:"0px"},"fast");
        $("#content").css("width",width +"px");
        $("#leftpanelctrl").animate({left:"0px"},"fast");
        $("#leftpanelctrl").css("background-image","url(\"/images/toright.png\")");
        $("#adjustline").css("left", "0px");
    }
    else
    {
        $("#leftpanel").toggle("fast", function () {
            $(this).css("width", menuWidth + "px");
        });
        $("#content").animate({left:(parseInt(menuWidth) + 1) + "px"},"fast");
        $("#content").css("width",(width - (parseInt(menuWidth) + 1)) +"px");
        $("#leftpanelctrl").animate({left:menuWidth + "px"},"fast");
        $("#leftpanelctrl").css("background-image",'url("/images/toleft.png")');
        $("#adjustline").css("left", menuWidth + "px");
    }
}

function LocalToggle()
{
    $("#grouptype").toggle();
}

function SubLibToggle(libId)
{
    $("#" + libId + "sub").toggle();
    if($("#" + libId + "sub").is(":hidden"))
    {
        $("#" + libId + " img").attr("src","/images/add.png");
    }
    else
    {
        $("#" + libId + " img").attr("src","/images/minus.png");
    }
}

function DeviceTypeToggle()
{
    $("#devicetypegroup").toggle();
}

function GetDeviceList(inurl, inlib)
{
    surl = inurl;
    sinlib = inlib;
    libraryName = inlib;
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var deviceList = "";
    var deviceFilter = "?category_id=";
    var sortByLocalAlias = function (filed, rev, primer) {
        rev = (rev) ? -1 : 1;
        return function (a, b) {
            //alert(a.location.alias + " a,b " + b.location.alias);
            //a = a[filed];
            //b = b[filed];
            a = a.location.alias;
            b = b.location.alias;
            if (typeof (primer) != 'undefined') {
                a = primer(a);
                b = primer(b);
            }
            if (a < b) { return rev * -1; }
            if (a > b) { return rev * 1; }
            return 1;
        }
    };

    $("input[name='devicetypeid']:checked").each(function (i){
        if(i === 0)
            deviceFilter += this.value;
        else
            deviceFilter += "," + this.value;
    });
    deviceFilter += "&location_id=";
    $("input[name='devicegroupid']:checked").each(function (i){
        if(i === 0)
            deviceFilter += this.value;
        else
            deviceFilter += "," + this.value;
    });
//        alert(deviceFilter);
//        test.innerHTML=new Date().toLocaleString()+' 星期'+'日一二三四五六'.charAt(new Date().getDay());
    $.ajax({
        type: "GET",
        url: inurl + deviceFilter,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        beforeSend: function(){
            $("#waiticon").show();
        },
        complete: function(data){
            $("#waiticon").hide();
        },
        success: function (data,textStatus) {
//                alert(JSON.stringify(data));
//                var devicestatus = eval(data);
            if(textStatus == "nocontent") {
                console.log("设备数量为零!");
                $("#content").text("设备数量为零!");
                return;
            }
            var devicestatus = data;
//                alert(devicestatus.length);
//                alert("devicestatus.length=" + devicestatus.length);
//            alert(devicestatus instanceof Array);
            if(devicestatus.length > 0)
            {
                devicestatus.sort(sortByLocalAlias("alias",false,String));
                //console.log("length = " + devicestatus.length);
                if(oldLibraryName == "")
                {
                    oldLibraryName = libraryName;
                }
                else
                {
                    if(oldLibraryName == libraryName)
                    {
//                            alert("oldLibraryName == libraryName");
                    }
                    else
                    {
                        $("#content div").remove();
//                            $("div[id^='" + oldLibraryName + "']").fadeOut(500, function (){
//                                $("div[id^='" + oldLibraryName + "']").remove();
//                            });
                        oldLibraryName = libraryName;
                    }
                }
            }
            else
            {
                if(setIntervalID != 0)
                {
//                        window.clearInterval(setIntervalID);
                    $("#content div[id^=dev-]").remove();
                    $("#content div[id^=lt-]").remove();
                    return;
                }
            }

            if(oldDeviceDisplayCount != devicestatus.length || leftPanelSelectAction === 1)
            {
                $("#content div[id^=dev-]").remove();
                oldDeviceDisplayCount = devicestatus.length;
                leftPanelSelectAction = 0;
            }
            var maxDivHeight = 0;
            var tempHeight = 0;
            var groupLabel = devicestatus[0].location.name;
            var groupIntraI = 0;
            var groupCount = 0;
            var titleHeight = 50;
            var titleCount = 0;
            var groupTop = 0;
            $("div[id^='lt-']").remove();

            //console.log(JSON.stringify(devicestatus));
            deviceList = "<tr style=''><td style='width: 260px;'>" + groupLabel + "</td><td>";
            for(var i=0; i<devicestatus.length; i++)
            {
                //console.log("id = " +devicestatus[i].id + " alias = " + devicestatus[i].location.alias + " i=" + i);
                if($("#dev-" + devicestatus[i].alias).length == 0)
                {
                    var boarddiv = "<div id='dev-" +devicestatus[i].alias+"'  style='width:" + deviceDivWidth + "px;height:auto;z-index:1;position:absolute;left:10px;top:10px;'>加载中...</div>";
                    $("#content").append(boarddiv);
                }
                var checkedDev = $("input[name='cb_dev']");
                var checkedString = "";
                var disabledString = "";
                checkedDev.each(function(){
                    if($(this).val() == devicestatus[i].alias)
                    {
                        if(true == $(this).prop("checked"))
                            checkedString = "checked";
                        if(true == $(this).prop("disabled"))
                            disabledString = "disabled='disabled'";
                    }
                });
                //var br = "";
                //if(i%2 == 1)
                //    br = "<br>";
                //deviceList += '<input type="checkbox" name="cb_dev" ' + checkedString + ' ' + disabledString + ' value="' + devicestatus[i].alias + '"><code>' + deviceAliasToLocationMap[devicestatus[i].alias] + "</code>" + br;
                var ipsubindex = devicestatus[i].ip_address.indexOf(":");
                if(ipsubindex == -1) ipsubindex = 100;
                var memoName = "未编写备注名";
                if(devicestatus[i].description !== "")
                    memoName = devicestatus[i].description;
                var p1 = "<table width='100%' border='1' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='border-collapse:collapse;background-color: transparent'>" +
                        //"<tr><td colspan='2' id='location' align='center' title='" + devicestatus[i].location.name + "' style='color:white; background-color: cadetblue'>" + devicestatus[i].category.name +" - " + devicestatus[i].alias + " " + devicestatus[i].ip_address.substring(0,ipsubindex) + "</td></tr>";
                    "<tr><td colspan='2' id='location" + devicestatus[i].location.name + "' align='center' title='" + devicestatus[i].alias + " " + devicestatus[i].ip_address.substring(0,ipsubindex) + "' style='color:white; background-color: cadetblue'>" + devicestatus[i].category.name +" - "+ memoName + "</td></tr>";
                if(devicestatus[i].parts.length > 0)
                {
                    var parts = devicestatus[i].parts;
                    for(var j=0; j<parts.length; j++)
                    {
                        var style = "";
                        switch(parts[j].status){
                            case 0:
                                style = "background-color:green; border: 1px solid green;";
                                break;
                            case 1:
                                style = "background-color:green; border: 1px solid blue;";
                                break;
                            case 2:
                            case 3:
                                style = "background-color:yellow; border: 1px solid yellow;";
                                break;
                            case 4:
                                style = "background-color:red; border: 1px solid orange;";
                                break;
                            case 5:
                                style = "background-color:red; border: 1px solid red;";
                                break;
                        }
                        if(parts[j].name == "空架数")
                        {
                            var kjs = parseInt(parts[j].description);
                            if(kjs > 105)
                                style = "background-color:red; border: 1px solid red;";
                        }
                        if(j == 0)
                        {
                            var partname = parts[j].name.split(",");
                            var pic = "wt.png";
                            if(devicestatus[i].alias.substring(0,2) === "BZ")
                                pic = "ds-bz.png";
                            else if(devicestatus[i].alias.substring(0,2) === "KM")
                                pic = "card.png";
                            else if(devicestatus[i].alias.substring(0,2) === "JH")
                                pic = "ds-jh.png";
                            else if(devicestatus[i].alias.substring(0,2) === "MJ")
                                pic = "ds-mj.png";

                            p1 += "<tr><td rowspan=" + parts.length + " width='100px'><img id='img-device' title='软件信息："+devicestatus[i].software_version+"&#10;硬件信息："+devicestatus[i].hardware_version+"' src='/images/" + pic + "' width='160px' height='100px' style='background-color:transparent;'/></td><td style='' title='品牌：" + partname[1] + "&#10;型号：" + partname[2] + "'>&nbsp;<input type='button' width='20px' height='20px' style='border-radius: 10px; " + style + "' class='breath_light'/>&nbsp;" + partname[0] + ":" + parts[j].description + "</td></tr>"
                        }
                        else
                        {
                            var partname = parts[j].name.split(",");
                            p1 += "<tr><td style='' title='品牌：" + partname[1] + "&#10;型号：" + partname[2] + "'> &nbsp;<input type='button' width='20px' height='20px' style='border-radius: 10px; " + style + "' class='breath_light'/>&nbsp;" + partname[0] + ":" + parts[j].description + "</td></tr>";
                        }
                    }
                    p1 += "<tr><td colspan='2' align='center' height='26px'>";
                    for(var b=0; b<commandCount; b++)
                    {
                        var ts = OCBefore[b].replace("bc-","bc-" + devicestatus[i].alias + "-");
//                            alert(OCBefore[b]);
                        p1 += ts + devicestatus[i].alias + OCAfter[b];
                    }
                    p1 += ' <img id="waiticon-' + devicestatus[i].alias + '" style="background-color: transparent; height: 20px; width: 20px;" src="/images/waitting.gif">';
                    p1 += "<input type='button' value='查看日志' title='上传日志成功后,等10秒左右再查看日志,这是因为日志文件有时候会比较大' onclick='ViewLog(\"" + devicestatus[i].alias + "\");' /></td>";
//                        p1 += "<td>" + devicestatus[i].location.name + "</td>"
                    p1 += "</tr></table>"
                }
                devColumns = Math.floor((width - 100 - menuWidth) / (deviceDivWidth));
                if(devColumns === 0) devColumns = 1;
                var showicon = true;
                if($("#waiticon-" + devicestatus[i].alias).length > 0){
                    if($("#waiticon-" + devicestatus[i].alias).is(":hidden")){
                        showicon = false;
                    }
                }
                else{
                    var showicon = false;
                }
                var buttondisabled = $("#bc-" + devicestatus[i].alias + "-outofservice").prop("disabled");
                $("#dev-" + devicestatus[i].alias).html(p1);
                if(buttondisabled)
                {
                    $("#dev-" + devicestatus[i].alias + " input").prop("disabled",true);
                }
                else
                {
                }

                if(i == 0)
                {
                    var top1 = 22 + globalDeviceFilterHight;
                    groupTop = top1;
                    var locationTitle = "<div id='lt-" + devicestatus[i].location.name + "' style='position:absolute; /*background:linear-gradient(to right,#98BCB9,rgba(255,255,255,0));*/ font-size: 26px; height:30px; width:80%; left:" + deviceListLeft + "px; top:" + top1 + "px; border-top: 1px solid #98BCB9;'>" + devicestatus[i].location.name + "</div>";
                    $("#content").append(locationTitle);
                    groupTop += parseInt(titleHeight);
                    //console.log("i = " + i + " top1 = " + top1);
                }
                if(groupLabel === devicestatus[i].location.name)
                    deviceList += '<label title="'+ devicestatus[i].alias + '"><input type="checkbox" name="cb_dev" ' + checkedString + ' ' + disabledString + ' value="' + devicestatus[i].alias + '">' + memoName + "</label>";
                if(groupLabel !== devicestatus[i].location.name)
                {
                    //设备名称分组显示
                    deviceList += "</td></tr>";
                    if(i < devicestatus.length - 1){
                        deviceList += "<tr><td>" + devicestatus[i].location.name + "</td><td>" + "<label title='" + devicestatus[i].alias + "'><input type='checkbox' name='cb_dev' value='" + devicestatus[i].alias + "'>" + memoName + "</label>";
                    }else{
                        deviceList += "<tr><td>" + devicestatus[i].location.name + "</td><td>" + "<label title='" + devicestatus[i].alias + "'><input type='checkbox' name='cb_dev' value='" + devicestatus[i].alias + "'>" + memoName + "</label>" + "</td><tr>"
                    }

                    //设备状态分组显示
                    maxDivHeight = tempHeight;
                    //console.log("新行 maxDivHeight = " + maxDivHeight + " i = " + i);
                    groupLabel = devicestatus[i].location.name;
                    groupCount += Math.ceil(groupIntraI/devColumns);
                    groupIntraI = 0;
                    //var top1 = deviceListTop + titleHeight*titleCount + (parseInt(maxDivHeight) + 20)*(Math.floor(groupIntraI/devColumns) + groupCount);
                    groupTop += parseInt(maxDivHeight) + 20;
                    //top1 = groupTop;
                    var locationTitle = "<div id='lt-" + devicestatus[i].location.name + "' style='position:absolute;font-size: 26px; height:30px; width:80%; left:" + deviceListLeft + "px; top:" + groupTop + "px; border-top: 1px solid #98BCB9;'>" + devicestatus[i].location.name + "</div>";
                    $("#content").append(locationTitle);
                    groupTop += parseInt(titleHeight);
                    titleCount++;
                    //console.log("i = " + i + " groupTop = " + groupTop);
                }
                var left = deviceListLeft + 400*(groupIntraI%devColumns);
                $("#dev-" + devicestatus[i].alias).css("left", left + "px");
                var reg = /\d+/;
                //var top = deviceListTop + titleHeight*titleCount + (parseInt(maxDivHeight) + 20)*(Math.floor(groupIntraI/devColumns) + groupCount); //titleCount++
                //top = groupTop;
                if(Math.floor(groupIntraI/devColumns) > 0 && left === deviceListLeft)
                {
                    groupTop += (parseInt(maxDivHeight) + 20);
                    maxDivHeight = 0;
                    tempHeight = 0;
                }
                $("#dev-" + devicestatus[i].alias).css("top", groupTop + "px");
                var w = $("#dev-" + devicestatus[i].alias).css("height").match(reg)[0];
                if(tempHeight <= w){
                    tempHeight = w;
                }
                if(maxDivHeight == 0 || (maxDivHeight < tempHeight && groupIntraI%devColumns == (devColumns - 1))){
                    maxDivHeight = tempHeight;
                }
                //console.log("maxDivHeight = " + maxDivHeight + "    tempHeight = " + tempHeight + "    w = " + w + "    devColumns = " + devColumns);
                groupIntraI++;

//                    $("#dev-" + devicestatus[i].alias + " table").html("maxDivHeight=" + maxDivHeight  + "  tempHeight=" + tempHeight + "  w=" + w + " i=" + i + " i%devColumns=" + i%devColumns);
                showicon ? $("#waiticon-" + devicestatus[i].alias).show() : $("#waiticon-" + devicestatus[i].alias).hide();
            }
            //$("#dev-" + devicestatus[devicestatus.length - 1].alias + " table").css("margin", "auto auto 50px");
            $("#checkbox_device_list").html(deviceList+"<br>"); //菜单加入设备列表
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
                alert("GetDeviceList 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}

function GetLibraryList(serverFlage)
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    if(serverFlage == 1)
    {
        var url = backServerUrl + "api/devices/status";
        GetDeviceList(url,"");
        setIntervalID = setInterval(UpdateData,updateInterval);
    }
    else
    {
        $.ajax({
            type: "get",
            url: backServerUrl + "devices?limit=1000&offset=0",
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                //                var js= JSON.stringify(data);
                //                alert(data.result.length);
                if(data.result.length == 1)
                {
                    var url = backServerUrl + "api/devices/status/"+data.result[0].group.alias;
                    //                    alert(url);
                    GetDeviceList(url,data.result[0].group.alias);
                    setIntervalID = setInterval(UpdateData,updateInterval);
                }
                else
                {
                    for(var i=0; i<data.result.length; i++)
                    {
                        if($("#" + data.result[i].group.id).length == 0)
                        {
                            var style = "'  style='border-bottom:1px solid cadetblue;background:transparent;text-align:center;height:50px;line-height:50px; z-index:1;'>";
                            var url = backServerUrl + "api/devices/status/"+data.result[i].group.alias;
                            var boarddiv = "<div id='" +data.result[i].group.id + style + "<input id='" + data.result[i].group.alias + "' type='button' value='" + data.result[i].group.name +"' onclick='GetDeviceList(\""+url+"\",\""+data.result[i].group.alias+"\");DisplayDeviceStatus();'/></div>";
                            $("#leftpanel").append(boarddiv);
                        }
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if(XMLHttpRequest.status == 401){
                    alert("GetLibraryList 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                }else{
                    //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
                    alert("GetLibraryList 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                }
            }
        });
    }
}

function GetUserInfo()
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "get",
        url: backServerUrl + "api/auth/info",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            //alert(JSON.stringify(data));
//            if(data.group.alias.indexOf("shrfid") > 0 || data.group.alias.indexOf("admin") > 0)
//            {
//                isAdmin = true;
////                    alert("isAdmin");
//            }
//            else
//            {
////                $("#userinfo").html("用户名称:" + data.username + "&nbsp&nbsp单位:" + data.group.name + "&nbsp&nbsp权限:" + data.group.alias);
//                if(isMobileDevice())
//                {
//                    $("#title").html("阿法迪设备中心管理平台");
//                }
//                else
//                    $("#userinfo").html("用户名称:" + data.username + "&nbsp&nbsp单位:" + "温州图书馆" + "&nbsp&nbsp权限:" + data.group.name);
            $("#userinfo").html("用户名称:" + data.username + "&nbsp&nbsp组别:" + data.group.name);
            //isAdmin = false;
            //$("#leftpanelctrl").hide();
            //$("#leftpanel").hide();
            //menuWidth = 0;
            //$("#leftpanel").css("width","0px");
            //$("#content").css("left","0px");
            //$("#content").css("width","100%");

            var leftPanelHeight = height - mainHeaderHeight - GetElementHW("footer","height") - 5;
            $("#leftpanel").css("width", menuWidth + "px");
            $("#leftpanel").css("height", leftPanelHeight + "px");
            $("#leftpanelctrl").css("left", menuWidth + "px");

            $("#content").css("width",(width - (parseInt(menuWidth) + 1)) + "px");
            $("#content").css("height",(leftPanelHeight - 5) + "px");
            var adjustLineHeight = GetElementHW("devicefilter","height");
            //console.log("leftPanelHeight = " + leftPanelHeight + "      adjustLineHeight = " + adjustLineHeight);
            if(adjustLineHeight < leftPanelHeight)
                adjustLineHeight = leftPanelHeight;
            $("#adjustline").css("top", mainHeaderHeight + "px");
            $("#adjustline").css("height", leftPanelHeight + "px");
            $("#adjustline").css("left", menuWidth + "px");
            //$("#adjustline").css("height", adjustLineHeight + "px");
            $("#searchdiv").hide();
            //}
            commandCount = data.group.operators.length;
            var commandToDevice = "";
            for(var i=0; i<commandCount; i++)
            {
                OCBefore.push("<input id='bc-"+data.group.operators[i].alias+"' type='button' value='" + data.group.operators[i].name + "' onclick='SendCommand(\"");
                OCAfter.push("\",\"" +  data.group.operators[i].alias + "\")'>");
                commandToDevice += '<li><a href="javascript:void(0);" onclick="SendMenuCommand(\''+data.group.operators[i].alias+'\');">' + data.group.operators[i].name + '</a></li>';
            }
            $("#commandtodevice").html(commandToDevice);
            GetDeviceType();
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
                alert("GetUserInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}

function GetDeviceType()
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "get",
        url: backServerUrl + "api/devices/categories?limit=100&offset=0",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
//                alert(JSON.stringify(data));
//            var deviceFilter = "<input type='button' value='查询状态' onclick='DisplayDeviceStatus()'><br><br>设备列表";
//            var deviceFilter = "<p id='devicetypelisttitle' title='单击收起或显示列表(设备类型数量:设备数量)' style='background-color: rgba(95, 157, 159, 0.3); text-align:center; margin:auto; border-bottom: solid 1px cadetblue;' onclick='DeviceTypeToggle();'>设备类型列表</p>";
            var deviceFilter = "<div style='background-color: rgba(95, 157, 159, 0.3); text-align:center; margin:auto; border-bottom: solid 1px cadetblue;'><table style='width: 100%;'><tr><td id='devicetypelisttitle' title='单击收起或显示列表(设备类型数量:设备数量)' style='width:auto;' onclick='DeviceTypeToggle();'>设备类型列表</td><td style='text-align: right; width:60px;'><img style='width:18px; height:18px;' title='类型改为单选模式' src='/images/singleselect.png' onclick='ChangeSelectMode(\"devicetypeid\")'>&nbsp;<img style='width:18px; height:18px;' title='选择全部' src='/images/checked.png' onclick='SelectTypeAll(1)'><img style='width:18px; height:18px;' title='取消全部' src='/images/uncheck.png' onclick='SelectTypeAll(0)'></td></tr></table></div>";
            deviceFilter += "<div id='devicetypegroup'>";
            for(var i in data.content) {
                deviceNameToIdMap[data.content[i].name] = data.content[i].id;
                deviceFilter += "<label id='" + data.content[i].alias + "' style='display: block;'><input type='checkbox' name='devicetypeid' checked onclick='CheckSelect()' value='" + data.content[i].id +"'>" + data.content[i].name + "</label>";
            }
            deviceFilter += "</div>";
            if($("#devicefilter").length == 0){
                var df = '<div id="devicefilter" style="text-align: center; font-size: 20px; top: 0px;"></div>';
                $("#content").prepend(df);
            }
            $("#devicefilter").html(deviceFilter);
            $("#devicetypelisttitle").html($("#devicetypelisttitle").html() + " " + data.content.length + "");
            GetGroupType();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
            alert("GetDeviceType 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        }
    });
}

function GetGroupType()
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "get",
        //url: backServerUrl + "api/devices/locations?limit=100&offset=0",
        url: backServerUrl + "api/branches?limit=-1&offset=0",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
//                alert(JSON.stringify(data));
//            console.log("组别:"+JSON.stringify(data));
            var deviceFilter = $("#devicefilter").html() + "<div style='background-color: rgba(95, 157, 159, 0.3); text-align:center; margin:auto; border-bottom: solid 1px cadetblue;'><table style='width: 100%;'><tr><td id='devicegrouplisttitle' title='单击收起或显示列表(主馆数量:分馆数量:设备数量)' style='width:auto;' onclick='LocalToggle();'>位置列表</td><td style='text-align: right; width:60px;'><img style='width:18px; height:18px;' title='地点改为单选模式' src='/images/singleselect.png' onclick='ChangeSelectMode(\"devicegroupid\")'>&nbsp;<img style='width:18px; height:18px;' title='选择全部' src='/images/checked.png' onclick='SelectDeviceAll(1)'><img style='width:18px; height:18px;' title='取消全部' src='/images/uncheck.png' onclick='SelectDeviceAll(0)'></td></tr></table></div>";
            deviceFilter += "<div id='grouptype'>";
            var groupNames = data.content;
            var sublibcount = 0;
            for(var i in groupNames) {
                var nodePic = "minus.png";//groupNames[i].locations.length > 0?"add.png":"minus.png";
                deviceFilter += "<div id='groupname" + groupNames[i].id + "'>" + "<div><img style='width:20px; height:20px; vertical-align:-2px;' onclick='SubLibToggle(\"groupname" + groupNames[i].id + "\");' src='/images/" + nodePic + "'/><label style='font-weight: 600;'><input id='groupname" + groupNames[i].id + "name' type='checkbox' checked onclick='GroupSelect(\"groupname" + groupNames[i].id + "\")' value='" + groupNames[i].id + "'>" + groupNames[i].name + "</label></div>";
                sublibcount += groupNames[i].locations.length;
                if(groupNames[i].locations.length > 0){
                    deviceFilter += "<div id='groupname" + groupNames[i].id + "sub'>";
                    var locationNames = groupNames[i].locations;
                    for(var j in locationNames) {
                        locationMap[locationNames[j].alias] = locationNames[j].name;
                        deviceFilter += "<div style='margin-left: 40px;'><label id='" + locationNames[j].alias + "' style='display: inline;'><input type='checkbox' style='background-color: blue;' name='devicegroupid' checked onclick='CheckSelect()' value='" + locationNames[j].id + "'>" + locationNames[j].name + "</label></div>";
                    }
                    deviceFilter += "</div>";
                }
                deviceFilter += "</div>";
            }
            deviceFilter += "</div>";
            //deviceFilter += "<br><input type='button' value='查询状态' onclick='DisplayDeviceStatus()'>";
            $("#devicefilter").html(deviceFilter);
            $("#devicegrouplisttitle").html($("#devicegrouplisttitle").html() + " " + groupNames.length + ":" + sublibcount);
            //globalDeviceFilterHight = ($("#devicefilter").outerHeight());
            deviceListTop += globalDeviceFilterHight;

            GetDeviceInfo();
            GetCardTypeInfo();
//                alert(deviceListTop);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
            alert("GetGroupType 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        }
    });
}

function GetDeviceInfo()
{
    var sortByLocalAlias1 = function (filed, rev, primer) {
        rev = (rev) ? -1 : 1;
        return function (a, b) {
            //alert(a.location.alias + " a,b " + b.location.alias);
            //a = a[filed];
            //b = b[filed];
            a = a.location.alias;
            b = b.location.alias;
            if (typeof (primer) != 'undefined') {
                a = primer(a);
                b = primer(b);
            }
            if (a < b) { return rev * -1; }
            if (a > b) { return rev * 1; }
            return 1;
        }
    };

    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "get",
        //url: backServerUrl + "api/devices?limit=-1&offset=-1&category_id=&location_id=",
        url: backServerUrl + "api/devices/status?limit=-1&offset=-1&category_id=&location_id=",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            if(data.length === 0){
                console.log("GetDeviceInfo 设备数量为0");
                return;
            }
            data.sort(sortByLocalAlias1("alias",false,String));
            //console.log("sort length = " + data.length);
            var km = 0;
            var bz = 0;
            var jh = 0;
            var locationDeviceCount = 0;
            var locationAlias = data[0].location.alias;
            for(var i in data){
                var des = data[i].description===""?"未写备注名":data[i].description;
                //deviceAliasToLocationMap[data[i].alias] = data[i].location.name +":"+ data[i].category.name + ":" + des;
                deviceAliasToLocationMap[data[i].alias] = data[i].location.name + ":" + des;
                //console.log("location.name = " + data[i].location.name + "devicealias = " + data[i].alias);
                //console.log("deviceAliasToLocationMap[data[i].alias] = " + deviceAliasToLocationMap[data[i].alias]);
                if(data[i].category.alias === "km"){
                    km++;
                }
                else if(data[i].category.alias === "bz"){
                    bz++;
                }
                else if(data[i].category.alias === "jh"){
                    jh++;
                }
                if(locationAlias === data[i].location.alias){
                    locationDeviceCount++;
                    deviceCountInfo[data[i].location.alias] = locationDeviceCount;
                    if(parseInt(i) === data.length - 1)
                        $("#" + data[i].location.alias).html($("#" + data[i].location.alias).html() + "(" + locationDeviceCount +")");
                }
                else{
                    $("#" + locationAlias).html($("#" + locationAlias).html() + "(" + locationDeviceCount +")");
                    locationAlias = data[i].location.alias;
                    locationDeviceCount = 1;
                    deviceCountInfo[data[i].location.alias] = locationDeviceCount;
                    if(parseInt(i) === data.length - 1)
                        $("#" + data[i].location.alias).html($("#" + data[i].location.alias).html() + "(" + locationDeviceCount +")");
                }
                //console.log("data[i].location.alias = " + data[i].location.alias + "      locationDeviceCount = " + locationDeviceCount);
            }
            deviceCountInfo["allcount"] = data.length;
            $("#km").html($("#km").html() + "(" + km +")");
            $("#bz").html($("#bz").html() + "(" + bz +")");
            $("#jh").html($("#jh").html() + "(" + jh +")");
            $("#devicetypelisttitle").html($("#devicetypelisttitle").html() + ":" + data.length);
            $("#devicegrouplisttitle").html($("#devicegrouplisttitle").html() + ":" + data.length);
            //console.log(JSON.stringify(data));
//                alert(deviceListTop);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
            alert("GetDeviceInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        }
    });
}

function GetCardTypeInfo()
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "get",
        url: backServerUrl + "api/readers/categories?limit=1000&offset=0",
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        success: function (data) {
            console.log("GetCardTypeInfo Success!");
            if(data.content.length > 0){
                for(var i in data.content){
                    //cardtypeToNameMap[data.content[i].name] = data.content[i].id;
                    cardtypeToNameMap[data.content[i].id] = data.content[i].name;
                }
            }else{
                //cardtypeToNameMap = {"008":"100块证","011":"成人市民卡","012":"少儿100块证","033":"少儿市民卡","YQ036":"乐清成人市民卡","YQ037":"乐清少儿市民卡","YQ002":"乐清200元押金卡"};
            }
//            console.log(JSON.stringify(data));
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
            alert("GetCardTypeInfo 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        }
    });
}

function CheckSelect()
{
    leftPanelSelectAction = 1;
    if($("input[name='devicetypeid']:checked").length == 0 || $("input[name='devicegroupid']:checked").length == 0)
    {
        if(setIntervalID != 0)
        {
            window.clearInterval(setIntervalID);
            setIntervalID = 0;
        }
        $("#content div[id^=dev-]").remove();
        $("#content div[id^=lt-]").remove();
        //alert("设备列表或位置列表全部未选择!");
    }
    else
    {
        DisplayDeviceStatus();
    }
}

function GroupSelect(groupname)
{
    console.log("groupname = " + groupname);
    if(!($("#"+ groupname + "name").is(":hidden"))){
        if($("#"+ groupname + " input").prop("checked"))
        {
            $("#"+ groupname + " input[name='devicegroupid']").prop("checked",true);
        }
        else
        {
            $("#"+ groupname + " input[name='devicegroupid']").prop("checked",false);
        }
        DisplayDeviceStatus();
    }
}

function SelectTypeAll(flag)
{
    $("input[name='devicetypeid']").attr("type","checkbox");
    if(flag === 1)
    {
        $("input[name='devicetypeid']").prop("checked",true);
        //$("input[id^='groupname']").prop("checked",true);
        CheckSelect();
    }
    else
    {
        $("input[name='devicetypeid']").prop("checked",false);
        //$("input[id^='groupname']").prop("checked",false);
        CheckSelect();
    }
}
function SelectDeviceAll(flag)
{
    $("input[id^='groupname']").show();
    $("input[name='devicegroupid']").attr("type","checkbox");
    if(flag === 1)
    {
        $("input[name='devicegroupid']").prop("checked",true);
        $("input[id^='groupname']").prop("checked",true);
        CheckSelect();
    }
    else
    {
        $("input[name='devicegroupid']").prop("checked",false);
        $("input[id^='groupname']").prop("checked",false);
        CheckSelect();
    }
}

function SystemManage()
{
    if(setIntervalID != 0)
    {
        window.clearInterval(setIntervalID);
        setIntervalID = 0;
    }
    if($("#devicefilter").length > 0)
    {
        globalDeviceFilter = $("#devicefilter");
    }
    var p1 = "<table id='systemmanage' style='font-size: 26px; margin: auto;'><caption>系统管理</caption><tr><td>设备状态刷新时间(最小值5秒 最大值60秒):&nbsp;<input id='intervaltext' type='number' min='5' max='60' title='最小值5秒 最大值60秒' style='width:60px; text-align: right; font-size: 26px;' value='" + updateInterval/1000 + "'>&nbsp;秒 <input type='button' value='确定' style='font-size:26px;' onclick='SetUpdateInterval()'></td><td></td></tr></table>";
    $("#content").html(p1);
}

function UserManage()
{
    var userManageUrl = window.localStorage["userManageUrl"];
    window.open(userManageUrl);
}

function UserExit()
{
    var rootPath = getRootPath();
    window.localStorage["et"] = "";
    window.location.href = rootPath;
}

function SendCommand(deviceAlias, command)
{
//        alert(deviceAlias + " " + command);
    var now = new Date().format("yyyy-MM-dd");
    var commandName = $("#bc-"+deviceAlias + "-" + command).val();
    console.log(commandName);
    if(command === "uploadfile")
    {
        var d = dialog({
            title: '选择日志日期',
            content: "<p style='font-size: 20px; display: inline;'>请选择日期:</p><input id='logdate' type='text' value='" + now + "' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />",
            okValue: '确定',
            ok: function () {
                var value = $('#logdate').val();
                this.close(value);
                this.remove();
            },
            cancelValue: '取消',
            cancel: function () {this.close("cancel");}
        });
        d.addEventListener('close', function () {
            if(this.returnValue !== "cancel")
                AjaxSendCommand(deviceAlias, command,"," + this.returnValue);
        });
        d.showModal();
    }
    else
    {
        var c = dialog({
            title: commandName,
            content: "<h3>确定要对设备&nbsp;<p style='color:blue; display: inline;'>" + deviceAlias + "</p>&nbsp;执行&nbsp;&nbsp;\"" + commandName + "\"&nbsp;&nbsp;命令吗?<h3>",
            okValue: '确定',
            ok: function () {
                this.close("execute");
                this.remove();
            },
            cancelValue: '取消',
            cancel: function () {this.close("cancel");}
        });
        c.addEventListener('close', function () {
            if(this.returnValue !== "cancel")
                AjaxSendCommand(deviceAlias, command,"");
        });
        c.showModal();
    }
}

function AjaxSendCommand(deviceAlias, command,date)
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    $.ajax({
        type: "get",
        url: backServerUrl + "api/devices/" + deviceAlias + "/"+command + date,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        beforeSend: function(){
            $("#waiticon-"+deviceAlias).show();
            $("#dev-" + deviceAlias + " input").prop("disabled",true);
            $("input:checkbox[value='" + deviceAlias + "']").prop("disabled",true);   //菜单的设备列表
        },
        complete: function(){
            $("#dev-" + deviceAlias + " input").prop("disabled",false);
            $("input:checkbox[value='" + deviceAlias + "']").prop("disabled",false);
            $("#waiticon-"+deviceAlias).hide();
        },
        success: function (data) {
            var js= JSON.stringify(data);
            console.log(js);
            var result = "成功!";
            if(data.result === "failed")
                result = "失败!";
            alert("设备标识：" + data.device + "\n上传操作：" + data.operator + "\n操作结果：" + result);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.status == 401){
                alert("SendCommand 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }else{
                alert("SendCommand 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}

function ViewLog(deviceAlias)
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var ajaxURL = "";
    if(deviceAlias.length < 16)
        ajaxURL = backServerUrl + "api/logs/debug/" + deviceAlias + "?offset=";
    else
        ajaxURL = backServerUrl + "api" + deviceAlias;
//        alert(ajaxURL);
    $.ajax({
        type: "get",
        url: ajaxURL,
        dataType: "json",
        headers: {'Content-Type': 'application/json','Authorization':et},
        beforeSend: function(){
        },
        complete: function(XMLHttpRequest, textStatus){
//                alert("SendCommand:complete 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        },
        success: function (data, textStatus) {
//                console.log(data.next+" ====== " + data.content);
//                var js= JSON.stringify(data);
//                DisplayLog(atob(data.content));
            if(textStatus == "nocontent")
                alert("没有日志文件！\n\n上传日志成功后,等10秒左右再查看日志,这是因为日志文件有时候会比较大,上传需要时间");
            else
                DisplayLog(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.status == 401){
                alert("error 401");
            }else{
                alert("SendCommand 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}

function SendMenuCommand(command)
{
    var checkedDev = $("input[name='cb_dev']:checked");
    if(checkedDev.length == 0)
    {
        alert("请在 设备命令|设备列表 下选择设备!");
        return;
    }
    checkedDev.each(function(){SendCommand(this.value, command);});
}

function ChangeListMode(mode)
{
    alert(mode);
}

function About()
{
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var ajaxURL = getRootPath() + "/test.html";
    console.log(ajaxURL);
    $.ajax({
        type: "get",
        url: ajaxURL,
        dataType: "html",
        headers: {'Content-Type': 'html'},
        beforeSend: function(){
        },
        complete: function(XMLHttpRequest, textStatus){
//                alert("SendCommand:complete 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
        },
        success: function (data, textStatus) {
//                console.log(data.next+" ====== " + data.content);
//                var js= JSON.stringify(data);
            $("#content").html(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.status == 401){
                alert("error 401");
            }else{
                alert("About 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        }
    });
}

function adjustLeftPanel()
{
    console.log("mouseX = " + mouseX + "     mouseY = " + mouseY);
}

function GetElementHW(elementId,hw)
{
    var reg = /\d+/;
    var result = $("#" + elementId).css(hw).match(reg)[0];
    return result;
}

function ChangeSelectMode(elementId)
{
    console.log("ChangeSelectMode:" + elementId);
    if(elementId === "devicegroupid")
        $("input[id^='groupname']").hide();
    $("input[name='" + elementId + "']").attr("type","radio");
    $("input[name='" + elementId + "']").prop("checked",false);
    //CheckSelect();
}

function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
}

function adjustPanelWidth(actionFlag)
{
    switch (actionFlag){
        case 0:
            adjustAction = 0;
            //console.log(adjustAction);
            break;
        case 1:
            adjustAction = 1;
            //console.log(adjustAction);
            break;
        case 2:
            if(adjustAction == 1){
                menuWidth = mouseX;
                console.log(menuWidth);
                ProcessResize();
            }
            break;
    }
}