//# sourceURL=countchart.js
/**
 * Created by Daddy on 2017/4/5.
 */

var Statistics = function () {

    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];
    var navurl = "";
    var inventoryPages;

    var StatisSort = new Vue({
        el:"#CollectionSort",
        data:{},
        methods:{
            CollectionSearch:function () {
                $.ajax({
                    type: "get",
                    url: backServerUrl + "api/data/stock",
                    //url: backServerUrl + "api/data/ranking_book?start_time=1480000000000&end_time=1488297600000",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json', 'Authorization': et},
                    success: function (data) {
                        for(var i in data.category_stock)
                        {
                            $("#bookcategory").val(data.category_stock[i].name);
                            $("#booknum").val(data.category_stock[i].stock);
                        }
                    }
                });
            }
        }
    });

    function BorrowCount(countflag)//借阅排行榜
    {
        BeforCount();
        if(countflag === 0)
        {
            var p1 = "<br><table id='papercountsearch' border='0px' cellpadding='0' cellspacing='0' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'>";
            p1 += "<tr><td rowspan='2' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>借阅排行榜</td><td style='width: auto;'>&nbsp;起始日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;结束日期：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
            p1 += "</select> 显示前:<input id='countrows' type='text' value='50' onkeyup='if(! /^\\d{0,2}$/.test(this.value)){alert(\"请输入两位以内正整数\"); this.value=\"50\"}' style='width: 30px;'/>条";
            p1 += "&nbsp;&nbsp;<input id='countreportbutton' type='button' value='统计' onclick='Statistics.BorrowCount(1);' style='font-size: 22px;'></td></tr>";
            p1 += "<tr id='displaycounttypeselect' style=''><td colspan='1' style='text-align: left;'>&nbsp;统计结果:<label><input id='' name='counttypedisplay' type='radio' checked value='date' onclick='' style='margin-left: 20px;'/>按时间</label>";
            p1 += "<tr id='count-devicelist' style='border: 1px;'><td colspan='2'><table id='tb-devicelist' style='display:none; width:100%; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='border-bottom:solid 1px #5F9EA0;'><th style='text-align: left;'>自助借还设备列表</th>";
            p1 += "<th style='text-align: right'><input type='button' value='删除当前组' onclick='AjaxDeleteDeviceGroup(\"jh\")'><select id='devicegrouplist' onchange='GroupChange()'><option value='' selected='selected'></option></select><input type='button' value='创建组' onclick='AjaxCreateDeviceGroup(\"jh\")'>&nbsp;<input id='devicegroupnameinput' type='text' placeholder='填写新建组名称' value='' style='background-color: transparent; border: solid 1px cadetblue;' onclick='AjaxLoadDeviceGroup(\"jh\")'> </th></tr></thead><tbody id='tb-devicelistbody'></tbody></table></td></tr>";
            p1 += "</table><br>";
            $("#content").html(p1);
            var now = new Date().format("yyyy-MM-dd");
            if(startTime == "")
            {
                $("#starttime").val(now);
                $("#endtime").val(now);
            }
            else
            {
                $("#starttime").val(startTime.format("yyyy-MM-dd"));
                $("#endtime").val(endTime.format("yyyy-MM-dd"));
            }
        }
        else
        {
            startTime = $("#starttime").val();
            startTime = addSeconds(startTime,-60*60*8);
            endTime = $("#endtime").val();
	        endTime = addSeconds(endTime,60*60*16-1);
            limitParam = $("#countrows").val();
	        if(startTime > endTime){
                alert("起始日期大于结束日期!");
                return;
            }
            var limit = $("#countrows").val();

            $.ajax({
                type: "get",
                url: backServerUrl + "api/data/ranking_book?start_time=" + Date.parse(startTime) + "&end_time=" + Date.parse(endTime) + "&limit_param=" + limitParam,
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': et},
                beforeSend: function(){
                    $("#countreportbutton").addClass("breath_light");
                },
                complete: function(){
                    $("#countreportbutton").removeClass("breath_light");
                },
                success: function (data) {
                    var bu = null;
                    var tableCount = "";
                    //按时间
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        bu=data;
                        if (bu.borrowed_ranking.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"借阅排行榜\");' style='margin-left: 30px;'/>";
                        tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:50%; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>图书名称</th><th style='text-align: right;'>借阅次数</th></tr></thead><tbody>";
                        var xCategories = [];
                        for (var i in bu.borrowed_ranking) {
                            xCategories.push(bu.borrowed_ranking[i].booktitle);
                            tableCount += "<tr><th>" + bu.borrowed_ranking[i].booktitle + "</th><td style='text-align: right;'>" + bu.borrowed_ranking[i].borrowed_times + "</td></tr>";
                        }
                        tableCount += "</tbody></table>";
                    }

                    $('#count_chart_location').remove();
                    $("#tablecountlocation").remove();
                    $("input[id^='buttoncount']").remove();
                    $("#content").append(tableCount);

                    //按时间
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        $('#count_chart_location').highcharts({
                            data: {
                                table: 'tablecountlocation'
                            },
                            colors: ['#B1CFD9', '#50B432', '#DDDF00'],
                            chart: {
                                type: 'column',
                                //options3d: {
                                //    enabled: true,
                                //    alpha: 2,
                                //    beta: 2,
                                //    viewDistance: 25,
                                //    depth: 20
                                //},
                                backgroundColor: 'rgba(0,0,0,0)'
                            },
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '借阅排行榜'
                            },
                            xAxis: {
                                categories: xCategories
                            },
                            yAxis: {
                                allowDecimals: false,
                                title: {
                                    text: '借阅次数'
                                }
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    colorByPoint: true,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y}'
                                    }
                                }
                            },
                            tooltip: {
                                formatter: function () {
                                    return '<b>' + this.series.name + '</b><br/>' + this.point.y + ' ' + this.point.name.toLowerCase();
                                }
                            }
                        });
                    }
                       }
            });
        }
    }

    function ReaderCount(countflag)//读者排行榜
    {
        BeforCount();
        if(countflag === 0)
        {
            var p1 = "<br><table id='papercountsearch' border='0px' cellpadding='0' cellspacing='0' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'>";
            p1 += "<tr><td rowspan='2' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>读者排行榜</td><td style='width: auto;'>&nbsp;起始日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;结束日期：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
            p1 += "</select> 显示前:<input id='countrows' type='text' value='50' onkeyup='if(! /^\\d{0,2}$/.test(this.value)){alert(\"请输入两位以内正整数\"); this.value=\"50\"}' style='width: 30px;'/>条";
            p1 += "&nbsp;&nbsp;<input id='countreportbutton' type='button' value='统计' onclick='Statistics.ReaderCount(1);' style='font-size: 22px;'></td></tr>";
            p1 += "<tr id='displaycounttypeselect' style=''><td colspan='1' style='text-align: left;'>&nbsp;统计结果:<label><input id='' name='counttypedisplay' type='radio' checked value='date' onclick='' style='margin-left: 20px;'/>按时间</label>";
            p1 += "<tr id='count-devicelist' style='border: 1px;'><td colspan='2'><table id='tb-devicelist' style='display:none; width:100%; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='border-bottom:solid 1px #5F9EA0;'><th style='text-align: left;'>自助借还设备列表</th>";
            p1 += "<th style='text-align: right'><input type='button' value='删除当前组' onclick='AjaxDeleteDeviceGroup(\"jh\")'><select id='devicegrouplist' onchange='GroupChange()'><option value='' selected='selected'></option></select><input type='button' value='创建组' onclick='AjaxCreateDeviceGroup(\"jh\")'>&nbsp;<input id='devicegroupnameinput' type='text' placeholder='填写新建组名称' value='' style='background-color: transparent; border: solid 1px cadetblue;' onclick='AjaxLoadDeviceGroup(\"jh\")'> </th></tr></thead><tbody id='tb-devicelistbody'></tbody></table></td></tr>";
            p1 += "</table><br>";
            $("#content").html(p1);
            var now = new Date().format("yyyy-MM-dd");
            if(startTime == "")
            {
                $("#starttime").val(now);
                $("#endtime").val(now);
            }
            else
            {
                $("#starttime").val(startTime.format("yyyy-MM-dd"));
                $("#endtime").val(endTime.format("yyyy-MM-dd"));
            }
        }
        else
        {
            startTime = $("#starttime").val();
            startTime = addSeconds(startTime,-60*60*8);
	        endTime = $("#endtime").val();
	        endTime = addSeconds(endTime,60*60*16-1);
            limitParam = $("#countrows").val();

            if(startTime > endTime){
                alert("起始日期大于结束日期!");
                return;
            }
            var limit = $("#countrows").val();

            $.ajax({
                type: "get",
                //url: backServerUrl + "api/statistics/jh?start=" + startTime + "T00:00:01.001&end=" + endTime + "T23:59:59.001&interval=1m&top=" + limit + "&device_alias=" + selectedDevice +  "&source=false" + aggr,
                url: backServerUrl + "api/data/ranking_reader?start_time=" + Date.parse(startTime) + "&end_time=" + Date.parse(endTime) + "&limit_param=" + limitParam,
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': et},
                beforeSend: function(){
                    $("#countreportbutton").addClass("breath_light");
                },
                complete: function(){
                    $("#countreportbutton").removeClass("breath_light");
                },
                success: function (data) {
                    var tableCount = "";
                    var bu = null;

                    //按时间
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        // for (var i in data.aggregations.operation.buckets) {
                        //     if (data.aggregations.operation.buckets[i].key === "borrow")
                        //         bu = data.aggregations.operation.buckets[i].reader_id.buckets;
                        // }
                        // if (bu == null) {
                        //     alert("该段时间内没有数据!");
                        //     return;
                        // }
                        bu=data;
                        if (bu.borrow_ranking.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"读者排行榜\");' style='margin-left: 30px;'/>";
                        tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:500px; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>读者姓名</th><th style='text-align: right;'>借阅次数</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowData = [];
                        for (var i in bu.borrow_ranking) {
                            xCategories.push(bu.borrow_ranking[i].full_name);
                            borrowData.push(bu.borrow_ranking[i].borrow_times);
                            tableCount += "</td><td>" + bu.borrow_ranking[i].full_name + "</td><td style='text-align: center;'>" + bu.borrow_ranking[i].borrow_times + "</td></tr>";
                        }
                        tableCount += "</tbody></table>";
                    }

                    $('#count_chart_location').remove();
                    $("#tablecountlocation").remove();
                    $("input[id^='buttoncount']").remove();
                    $("#content").append(tableCount);

                    //按时间
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        $('#count_chart_location').highcharts({
                            data: {
                                table: 'tablecountlocation'
                            },
                            colors: ['#B1CFD9', '#50B432', '#DDDF00'],
                            chart: {
                                type: 'column',
                                backgroundColor: 'rgba(0,0,0,0)'
                            },
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '读者排行榜'
                            },
                            xAxis: {
                                categories: xCategories
                            },
                            yAxis: {
                                allowDecimals: false,
                                title: {
                                    text: '借阅次数'
                                }
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    colorByPoint: true,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y}'
                                    }
                                }
                            },
                            series: [{
                                name: '借阅次数',
                                data: borrowData
                            }]
                        });
                    }
                }
            });
        }
    }

    function BibliographyCount(countflag)//图书流通书目统计
    {
        BeforCount();
        if(countflag === 0)
        {
            var p1 = "<br><table id='papercountsearch' border='0px' cellpadding='0' cellspacing='0' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'>";
            p1 += "<tr><td rowspan='2' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>书目流通统计</td><td style='width: auto;'>&nbsp;日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;至：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
            p1 += "&nbsp;统计类型：<label><input name='counttype' type='radio' checked value='day'/>按日期</label><label><input name='counttype' type='radio' value='month'/>按月份</label><label><input name='counttype' type='radio' value='year'/>按年</label>";
            p1 += "<input id='countreportbutton' type='button' value='统计' onclick='Statistics.BibliographyCount(1);' style='font-size: 22px;'></td></tr>";
            p1 += "<tr id='displaycounttypeselect' style=''><td colspan='1' style='text-align: left;'>&nbsp;统计结果:<label><input id='' name='counttypedisplay' type='radio' checked value='borrow' onclick='' style='margin-left: 20px;'/>按借书</label>";
            p1 += "<label><input id='' name='counttypedisplay' type='radio' value='return' onclick='' style='margin-left: 30px;'/>按还书</label>";
            p1 += "<label><input id='' name='counttypedisplay' type='radio' value='renew' onclick='' style='margin-left: 30px;'/>按续借</label></td></tr>";
            p1 += "</table><br>";
            $("#content").html(p1);
            var now = new Date().format("yyyy-MM-dd");
            if(startTime == "")
            {
                $("#starttime").val(now);
                $("#endtime").val(now);
            }
            else
            {
                $("#starttime").val(startTime.format("yyyy-MM-dd"));
                $("#endtime").val(endTime.format("yyyy-MM-dd"));
            }
        }
        else
        {
            startTime = $("#starttime").val();
            startTime = addSeconds(startTime, -60*60*8);
	    endTime = $("#endtime").val();
	    endTime = addSeconds(endTime, 60*60*16-1);
            if(startTime > endTime){
                alert("起始日期大于结束日期!");
                return;
            }
            var interval = $("input[name='counttype']:checked").val();
            var limit = $("#countrows").val();

            $.ajax({
                type: "get",
                url: backServerUrl + "api/data/flow_book?start_time="+Date.parse(startTime)+"&end_time="+Date.parse(endTime)+"&interval="+interval,
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': et},
                beforeSend: function(){
                    $("#countreportbutton").addClass("breath_light");
                },
                complete: function(){
                    $("#countreportbutton").removeClass("breath_light");
                },
                success: function (data) {
                    var tableCount = "";
                    var bu = null;

                    //按借书
                    if ($("input[name='counttypedisplay']:checked").val() === "borrow") {
                        bu=data.daily_flow_data[0].flow_data_borrow;
                        if (bu.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        // tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"读者排行榜\");' style='margin-left: 30px;'/>";
                        // tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th>书名</th><th style='text-align: right;'>借阅数量</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowTitle = [];
                        var borrowData = [];
                        for (var i in bu) {
                            xCategories.push(bu[i].date);
                            for(var j in bu[i].borrows_per_day)
                            {
                                borrowTitle.push(bu[i].borrows_per_day[j].book_title);
                                borrowData.push(bu[i].borrows_per_day[j].count);
                                tableCount += "</td><td>" + bu[i].date.toString().substring(0,10)+ "</td><td>" + bu[i].borrows_per_day[j].book_title + "</td><td>" + bu[i].borrows_per_day[j].count + "</td></tr>";
                            }
                        }
                        tableCount += "</tbody></table>";
                    }
                    //按还书
                    else if ($("input[name='counttypedisplay']:checked").val() === "return") {
                        bu=data.daily_flow_data[1].flow_data_return;
                        if (bu.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        // tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"读者排行榜\");' style='margin-left: 30px;'/>";
                        // tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th>书名</th><th style='text-align: right;'>借阅数量</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowTitle = [];
                        var borrowData = [];
                        for (var i in bu) {
                            xCategories.push(bu[i].date);
                            for(var j in bu[i].returns_per_day)
                            {
                                borrowTitle.push(bu[i].returns_per_day[j].book_title);
                                borrowData.push(bu[i].returns_per_day[j].count);
                                tableCount += "</td><td>" + bu[i].date.toString().substring(0,10)+ "</td><td>" + bu[i].returns_per_day[j].book_title + "</td><td>" + bu[i].returns_per_day[j].count + "</td></tr>";
                            }
                        }
                        tableCount += "</tbody></table>";
                    }
                    //按续借
                    else if ($("input[name='counttypedisplay']:checked").val() === "renew") {
                        bu=data.daily_flow_data[2].flow_data_renew;
                        if (bu.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        // tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"读者排行榜\");' style='margin-left: 30px;'/>";
                        // tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th>书名</th><th style='text-align: right;'>借阅数量</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowTitle = [];
                        var borrowData = [];
                        for (var i in bu) {
                            xCategories.push(bu[i].date);
                            for(var j in bu[i].renews_per_day)
                            {
                                borrowTitle.push(bu[i].renews_per_day[j].book_title);
                                borrowData.push(bu[i].renews_per_day[j].count);
                                tableCount += "</td><td>" + bu[i].date.toString().substring(0,10)+ "</td><td>" + bu[i].renews_per_day[j].book_title + "</td><td>" + bu[i].renews_per_day[j].count + "</td></tr>";
                            }
                        }
                        tableCount += "</tbody></table>";
                    }
                    $('#count_chart_location').remove();
                    $("#tablecountlocation").remove();
                    $("input[id^='buttoncount']").remove();
                    $("#content").append(tableCount);

                }
            });
        }
    }

    function CategoryCount(countflag)//图书流通分类统计
    {
        BeforCount();
        if(countflag === 0)
        {
            var p1 = "<br><table id='papercountsearch' border='0px' cellpadding='0' cellspacing='0' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'>";
            p1 += "<tr><td rowspan='2' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>分类流通统计</td><td style='width: auto;'>&nbsp;日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;至：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
            p1 += "&nbsp;统计类型：<label><input name='counttype' type='radio' checked value='day'/>按日期</label><label><input name='counttype' type='radio' value='month'/>按月份</label><label><input name='counttype' type='radio' value='year'/>按年</label>";
            p1 += "<input id='countreportbutton' type='button' value='统计' onclick='Statistics.CategoryCount(1);' style='font-size: 22px;'></td></tr>";
            p1 += "<tr id='displaycounttypeselect' style=''><td colspan='1' style='text-align: left;'>&nbsp;统计结果:<label><input id='' name='counttypedisplay' type='radio' checked value='borrow' onclick='' style='margin-left: 20px;'/>按借书</label>";
            p1 += "<label><input id='' name='counttypedisplay' type='radio' value='return' onclick='' style='margin-left: 30px;'/>按还书</label>";
            p1 += "<label><input id='' name='counttypedisplay' type='radio' value='renew' onclick='' style='margin-left: 30px;'/>按续借</label></td></tr>";
            p1 += "</table><br>";
            $("#content").html(p1);
            var now = new Date().format("yyyy-MM-dd");
            if(startTime == "")
            {
                $("#starttime").val(now);
                $("#endtime").val(now);
            }
            else
            {
                $("#starttime").val(startTime.format("yyyy-MM-dd"));
                $("#endtime").val(endTime.format("yyyy-MM-dd"));
            }
        }
        else
        {
            startTime = $("#starttime").val();
            startTime = addSeconds(startTime, -60*60*8);
	    endTime = $("#endtime").val();
	    endTime = addSeconds(endTime, 16*60*60-1);
            if(startTime > endTime){
                alert("起始日期大于结束日期!");
                return;
            }
            var interval = $("input[name='counttype']:checked").val();
            var limit = $("#countrows").val();

            $.ajax({
                type: "get",
                url: backServerUrl + "api/data/flow_category?start_time="+Date.parse(startTime)+"&end_time="+Date.parse(endTime)+"&interval="+interval,
                //url: backServerUrl + "api/data/flow_category?start_time=1480000000000&end_time=1488297600000",
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': et},
                beforeSend: function(){
                    $("#countreportbutton").addClass("breath_light");
                },
                complete: function(){
                    $("#countreportbutton").removeClass("breath_light");
                },
                success: function (data) {
                    var tableCount = "";
                    var bu = null;

                    //按借书
                    if ($("input[name='counttypedisplay']:checked").val() === "borrow") {
                        bu=data.daily_flow_data[0].flow_data_category_borrow;
                        if (bu.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        // tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"图书流通分类统计\");' style='margin-left: 30px;'/>";
                        // tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:500px; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th>书类</th><th style='text-align: right;'>借阅数量</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowData = [];
                        var yCategories = [];
                        for (var i in bu) {
                            xCategories.push(bu[i].date);
                            for(var j in bu[i].borrows_per_day)
                            {
                                borrowData.push(parseInt(bu[i].borrows_per_day[j].count));
                                yCategories.push(bu[i].borrows_per_day[j].category);
                                tableCount += "</td><td>" + bu[i].date.toString().substring(0,10)+ "</td><td>" + bu[i].borrows_per_day[j].category + "</td><td>" + bu[i].borrows_per_day[j].count + "</td></tr>";
                            }
                        }
                        tableCount += "</tbody></table>";
                    }
                    //按还书
                    else if ($("input[name='counttypedisplay']:checked").val() === "return") {
                        bu=data.daily_flow_data[1].flow_data_category_return;
                        if (bu.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        // tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"图书流通分类统计\");' style='margin-left: 30px;'/>";
                        // tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:500px; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th>书类</th><th style='text-align: right;'>借阅数量</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowData = [];
                        var yCategories = [];
                        for (var i in bu) {
                            xCategories.push(bu[i].date);
                            for(var j in bu[i].returns_per_day)
                            {
                                borrowData.push(parseInt(bu[i].returns_per_day[j].count));
                                yCategories.push(bu[i].returns_per_day[j].category);
                                tableCount += "</td><td>" + bu[i].date.toString().substring(0,10)+ "</td><td>" + bu[i].returns_per_day[j].category + "</td><td>" + bu[i].returns_per_day[j].count + "</td></tr>";
                            }
                        }
                        tableCount += "</tbody></table>";
                    }

                    //按续借
                    else if ($("input[name='counttypedisplay']:checked").val() === "renew") {
                        bu=data.daily_flow_data[2].flow_data_category_renew;
                        if (bu.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        // tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"图书流通分类统计\");' style='margin-left: 30px;'/>";
                        // tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:500px; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th>书类</th><th style='text-align: right;'>借阅数量</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowData = [];
                        var yCategories = [];
                        for (var i in bu) {
                            xCategories.push(bu[i].date);
                            for(var j in bu[i].renews_per_day)
                            {
                                borrowData.push(parseInt(bu[i].renews_per_day[j].count));
                                yCategories.push(bu[i].renews_per_day[j].category);
                                tableCount += "</td><td>" + bu[i].date.toString().substring(0,10)+ "</td><td>" + bu[i].renews_per_day[j].category + "</td><td>" + bu[i].renews_per_day[j].count + "</td></tr>";
                            }
                        }
                        tableCount += "</tbody></table>";
                    }
                    $('#count_chart_location').remove();
                    $("#tablecountlocation").remove();
                    $("input[id^='buttoncount']").remove();
                    $("#content").append(tableCount);

                }
            });
        }
    }

    function CollectionsCount(countflag)//藏书量统计
    {
        BeforCount();
        if(countflag === 0)
        {
            var p1 = "<br><table id='papercountsearch' border='0px' cellpadding='0' cellspacing='0' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'>";
            p1 += "<tr><td rowspan='2' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>自助办证</td><td style='width: auto;'>&nbsp;日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;至：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
            p1 += "&nbsp;统计类型：<label><input name='counttype' type='radio' checked value='1d'/>按日期</label><label><input name='counttype' type='radio' value='1m'/>按月份</label><label><input name='counttype' type='radio' value='1y'/>按年</label>";
            p1 += "&nbsp;<label><input id='selectdevicebutton' type='checkbox' value='选择设备' onclick='ShowDeviceList(\"自助办证\")' style='font-size: 20px;'>选择设备</label>";
//        p1 += "<tr><td rowspan='5' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>办证统计</td><td style='width: auto;'>&nbsp;起始日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;结束日期：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
//            p1 += "<tr><td>&nbsp;证件类型：<input name='cardtype' type='checkbox' checked value='普通卡'/>普通卡<input name='cardtype' type='checkbox' checked value='50元押金卡'/>50元押金卡<input name='cardtype' type='checkbox' checked value='100元押金卡'/>100元押金卡</td></tr>";
//            p1 += "<tr><td>&nbsp;设备名称：<input name='devicename' type='text' value=''/></td></tr>";
//        p1 += "&nbsp;统计类型：<label><input name='counttype' type='radio' checked value='1d'/>按日期统计</label><label><input name='counttype' type='radio' value='1m'/>按月份统计</label><label><input name='counttype' type='radio' value='1y'/>按年统计</label>";
            p1 += "<input id='countreportbutton' type='button' value='统计' onclick='Statistics.CollectionsCount(1);' style='font-size: 22px;'></td></tr>";
            p1 += "<tr id='displaycounttypeselect' style=''><td colspan='1' style='text-align: left;'>&nbsp;统计结果:<label><input id='' name='counttypedisplay' type='radio' checked value='date' onclick='' style='margin-left: 20px;'/>按时间</label>";
            p1 += "<label><input id='' name='counttypedisplay' type='radio' value='location' onclick='' style='margin-left: 30px;'/>按地点</label>";
            p1 += "<label><input id='' name='counttypedisplay' type='radio' value='cardtype' onclick='' style='margin-left: 30px;'/>按卡类型</label>";
            p1 += "<label><input id='' name='counttypedisplay' type='radio' value='device' onclick='' style='margin-left: 30px;'/>按设备</label>";
            //p1 += "<label><input id='' name='counttypedisplay' type='radio' value='success' onclick='' style='margin-left: 30px;'/>按办证结果</label>";
            p1 += "</td></tr>";
            p1 += "<tr id='count-devicelist' style='border: 1px;'><td colspan='2'><table id='tb-devicelist' style='display:none; width:100%; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='border-bottom:solid 1px #5F9EA0;'><th style='text-align: left;'>办证设备列表</th>";
            p1 += "<th style='text-align: right'><input type='button' value='删除当前组' onclick='AjaxDeleteDeviceGroup(\"bz\")'><select id='devicegrouplist' onchange='GroupChange()'><option value='' selected='selected'></option></select><input type='button' value='创建组' onclick='AjaxCreateDeviceGroup(\"bz\")'>&nbsp;<input id='devicegroupnameinput' type='text' placeholder='填写新建组名称' value='' style='background-color: transparent; border: solid 1px cadetblue;' onclick='AjaxLoadDeviceGroup(\"bz\")'> </th></tr></thead><tbody id='tb-devicelistbody'></tbody></table></td></tr>";
            p1 += "</table><br>";
            $("#content").html(p1);
            AjaxLoadDeviceGroup("bz");
            var now = new Date().format("yyyy-MM-dd");
            if(startTime == "")
            {
                $("#starttime").val(now);
                $("#endtime").val(now);
            }
            else
            {
                $("#starttime").val(startTime.format("yyyy-MM-dd"));
                $("#endtime").val(endTime.format("yyyy-MM-dd"));
            }
        }
        else
        {
            startTime = $("#starttime").val();
	    startTime = addSeconds(startTime, -60*60*8);
            endTime = $("#endtime").val();
	    endTime = addSeconds(endTime, 60*60*16 - 1);
            if(startTime > endTime){
                alert("起始日期大于结束日期!");
                return;
            }
            var interval = $("input[name='counttype']:checked").val();

            var sortByDeviceName = function (filed, rev, primer) {
                rev = (rev) ? -1 : 1;
                return function (a, b) {
                    //alert(a.location.alias + " a,b " + b.location.alias);
                    //a = a[filed];
                    //b = b[filed];
                    a = deviceAliasToLocationMap[a.key];
                    b = deviceAliasToLocationMap[b.key];
                    if (typeof (primer) != 'undefined') {
                        a = primer(a);
                        b = primer(b);
                    }
                    if (a < b) { return rev * -1; }
                    if (a > b) { return rev * 1; }
                    return 1;
                }
            };

            var selectedDevice = "";
            if($("#selectdevicebutton").prop("checked")){
                if($("input[name='countdeviceinput']:checked").length == 0){
                    alert("未选择设备！");
                    return;
                }
                $("input[name='countdeviceinput']:checked").each(function (i){
                    if(i === 0){
                        selectedDevice += this.value;
                    }else{
                        selectedDevice += "," + this.value;
                    }
                });
            }

            var aggr = "&aggregation=";
            if($("input[name='counttypedisplay']:checked").val() === "date"){
                aggr += "datetime";
            }else if($("input[name='counttypedisplay']:checked").val() === "location"){
                aggr += "location";
            }else if($("input[name='counttypedisplay']:checked").val() === "cardtype"){
                aggr += "card_type";
            }else if($("input[name='counttypedisplay']:checked").val() === "device"){
                aggr += "device";
            }

            $.ajax({
                type: "get",
                url: backServerUrl + "api/statistics/bz?start=" + startTime + "T00:00:01.001&end=" + endTime + "T23:59:59.001&interval=" + interval + "&device_alias=" + selectedDevice + "&source=false" + aggr,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                beforeSend: function(){
                    $("#countreportbutton").addClass("breath_light");
                },
                complete: function(){
                    $("#countreportbutton").removeClass("breath_light");
                },
                success: function (data) {
//                    alert(JSON.stringify(data));
//                globalCountData = data;
                    ////增加设备名称
                    //var deviceInfo = data.aggregations.device.buckets;
                    //var tableHead = "";
                    //var deviceRadio = "";
                    //for(var i in deviceInfo){
                    //    tableHead += "<th style='text-align: right;'>" + deviceInfo[i].key + "</th>";
                    //    deviceRadio += "<label name='devicecountlabel" + deviceInfo[i].key + "' title='" + deviceAliasToLocationMap[deviceInfo[i].key] + "'><input type='radio' name='devicecountradio' onclick='ChangeCountDevice(\"" + interval + "\")' value='" + deviceInfo[i].key + "'/>" + deviceInfo[i].key + "</label>";
                    //}
                    //console.log(deviceRadio);

                    var tableCount = "";
                    var sfdata = null;
                    var dhdata = "";
                    var chart = null;
                    var je = null;
                    var sc = "0";
                    var sd = "0";
                    var fc = "0";
                    var fd = "0";
                    var xCategories = [];
                    var successData = [];
                    var failData = [];
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        var countDeviceHeader = "";
                        if ($("#selectdevicebutton").prop("checked")) {
                            var dh = data.aggregations.device.buckets;
                            for (var i in dh) {
                                countDeviceHeader += "<th style='text-align: right;'>" + deviceAliasToLocationMap[dh[i].key] + "</th>";
                            }
                        }
                        //按日期
                        //tableCount = "<input id='buttoncountdate' type='button' value='显示表格' onclick='ShowCountTable(\"tablecountdate\");' style='margin-left: 100px;'/>";
                        tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountdate,\"办证统计(按日期)\");' style='margin-left: 100px;'/>";
                        tableCount += "<div id='count_chart_date' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountdate' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'>";
                        //console.log(tableHead);
                        //tableCount += "<thead><tr style='background-color: cadetblue; color: white;'><th>日期</th><th style='text-align: right;'>办证数量</th>" + tableHead + "</tr></thead><tbody>";
                        //tableCount += "<thead><tr style='background-color: cadetblue; color: white;'><th>日期</th>" + countDeviceHeader + "<th style='text-align: right;'>合计</th></tr></thead><tbody>";
                        tableCount += "<thead><tr style='background-color: cadetblue; color: white;'><th>办证日期</th><th style='text-align: right;'>成功数量</th><th style='text-align: right;'>成功押金</th><th style='text-align: right;'>失败数量</th><th style='text-align: right;'>失败押金</th></tr></thead><tbody>";
                        var bu = data.aggregations.datetime.buckets;
                        for (var i in bu) {
                            dhdata = "";
                            sc = "0";
                            sd = "0";
                            fc = "0";
                            fd = "0";
                            sfdata = bu[i].success.buckets;
                            //if (countDeviceHeader !== "") {
                            //    for (var j in dh) {
                            //        dhdata += "<td style='text-align: right;'>" + dh[j].datetime.buckets[i].doc_count + "</td>";
                            //    }
                            //}
                            //tableCount += "<tr><th>"+bu[i].key_as_string.substring(0,10) +"</th><td style='text-align: right;'>" + bu[i].doc_count + "</td>"+ ddata + "</tr>";
                            //tableCount += "<tr><th>" + bu[i].key_as_string.substring(0, 10) + "</th>" + dhdata + "<td style='text-align: right;'>" + bu[i].doc_count + "</td></tr>";
                            for (var j in sfdata) {
                                if(sfdata[j].key_as_string==="true"){
                                    sc = sfdata[j].doc_count;
                                    sd = sfdata[j].deposit.value;
                                }else{
                                    fc = sfdata[j].doc_count;
                                    fd = sfdata[j].deposit.value;
                                }
                            }
                            successData.push(parseInt(sc));
                            failData.push(parseInt(fc));
                            if (interval === "1d"){
                                dhdata += "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + bu[i].key_as_string.substring(0, 10) + "\",\"" + bu[i].key_as_string.substring(0, 10) + "\",\"" + selectedDevice + "\",\"\",\"\",1,\"\");'>" + sc + "</a></td>" + "<td style='text-align: right;'>" + sd + "</td>" + "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + bu[i].key_as_string.substring(0, 10) + "\",\"" + bu[i].key_as_string.substring(0, 10) + "\",\"\",\"\",\"\",0,\"\");'>" + fc + "</a></td>" +"<td style='text-align: right;'>" + fd + "</td>";
                                tableCount += "<tr><th>" + bu[i].key_as_string.substring(0, 10) + "</th>" + dhdata + "</tr>";
                                xCategories.push(bu[i].key_as_string.substring(0, 10));
                            }
                            else if (interval === "1m") {
                                var nlastday = getLastDay(bu[i].key_as_string.substring(0, 4),bu[i].key_as_string.substring(5, 7));
                                var slastday = "";
                                if(nlastday < 10)
                                    slastday = "0" + nlastday;
                                else
                                    slastday = nlastday.toString();
                                var lastday = bu[i].key_as_string.substring(0, 8) + slastday;
                                dhdata += "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + bu[i].key_as_string.substring(0, 10) + "\",\"" + lastday + "\",\"" + selectedDevice + "\",\"\",\"\",1,\"\");'>" + sc + "</a></td>" + "<td style='text-align: right;'>" + sd + "</td>" + "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + bu[i].key_as_string.substring(0, 10) + "\",\"" + lastday + "\",\"\",\"\",\"\",0,\"\");'>" + fc + "</a></td>" +"<td style='text-align: right;'>" + fd + "</td>";
                                tableCount += "<tr><th>" + bu[i].key_as_string.substring(0, 7) + "</th>" + dhdata + "</tr>";
                                xCategories.push(bu[i].key_as_string.substring(0, 7));
                            }
                            else if (interval === "1y") {
                                dhdata += "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\"" + selectedDevice + "\",\"\",\"\",1,\"\");'>" + sc + "</a></td>" + "<td style='text-align: right;'>" + sd + "</td>" + "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\"\",\"\",\"\",0,\"\");'>" + fc + "</a></td>" +"<td style='text-align: right;'>" + fd + "</td>";
                                tableCount += "<tr><th>" + bu[i].key_as_string.substring(0, 4) + "年</th>" + dhdata + "</tr>";
                                xCategories.push(bu[i].key_as_string.substring(0, 4));
                            }
                        }
                        tableCount += "</tbody></table>";
                        tableCount += "<table id='tablecountdetails' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='display:none;border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><thead><th>设备名称</th><th>读者证类型</th><th>读者条码号</th><th>读者姓名</th><th>读者证件号码</th><th>读者性别</th><th>手机号码</th><th>押金金额</th><th>办证时间</th><th>办证状态</th><th>状态描述</th></thead><tbody id='tablecountdetailsbody'></tbody></table>";
                    }
                    //按地点
                    else if ($("input[name='counttypedisplay']:checked").val() === "location") {
                        //tableCount += "<input id='buttoncountlocation' type='button' value='显示表格' onclick='ShowCountTable(\"tablecountlocation\");' style='margin-left: 100px;'/>";
                        tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"办证统计(按地点)\");' style='margin-left: 100px;'/>";
                        tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><thead><tr style='background-color: cadetblue; color: white;'><th>地点</th><th style='text-align: right;'>成功数量</th><th style='text-align: right;'>成功押金</th><th style='text-align: right;'>失败数量</th><th style='text-align: right;'>失败押金</th></tr></thead><tbody>";
                        bu = data.aggregations.location.buckets;
                        for (var i in bu) {
                            sfdata = bu[i].success.buckets;
                            dhdata = "";
                            sc = "0";
                            sd = "0";
                            fc = "0";
                            fd = "0";
                            for (var j in sfdata) {
                                if(sfdata[j].key_as_string==="true"){
                                    sc = sfdata[j].doc_count;
                                    sd = sfdata[j].deposit.value;
                                }else{
                                    fc = sfdata[j].doc_count;
                                    fd = sfdata[j].deposit.value;
                                }
                            }
                            successData.push(parseInt(sc));
                            failData.push(parseInt(fc));
                            xCategories.push(locationMap[bu[i].key]);
                            dhdata += "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\"" + selectedDevice + "\",\"" + bu[i].key + "\",\"\",1,\"\");'>" + sc + "</a></td>" + "<td style='text-align: right;'>" + sd + "</td>" + "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\"\",\"" + bu[i].key + "\",\"\",0,\"\");'>" + fc + "</a></td>" +"<td style='text-align: right;'>" + fd + "</td>";
                            //dhdata += "<td style='text-align: right;'>" + sc + "</td>" + "<td style='text-align: right;'>" + sd + "</td>" + "<td style='text-align: right;'>" + fc + "</td>" +"<td style='text-align: right;'>" + fd + "</td>";
                            tableCount += "<tr><th>" + locationMap[bu[i].key] + "</th>" + dhdata + "</tr>";
                        }
                        tableCount += "</tbody></table>";
                        tableCount += "<table id='tablecountdetails' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='display:none;border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><thead><th>设备名称</th><th>读者证类型</th><th>读者条码号</th><th>读者姓名</th><th>读者证件号码</th><th>读者性别</th><th>手机号码</th><th>押金金额</th><th>办证时间</th><th>办证状态</th><th>状态描述</th></thead><tbody id='tablecountdetailsbody'></tbody></table>";
                    }
                    //按卡类型
                    else if ($("input[name='counttypedisplay']:checked").val() === "cardtype") {
                        //tableCount += "<input id='buttoncountcardtype' type='button' value='显示表格' onclick='ShowCountTable(\"tablecountcardtype\");' style='margin-left: 100px;'/>";
                        tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountcardtype,\"办证统计(按卡类型)\");' style='margin-left: 100px;'/>";
                        tableCount += "<div id='count_chart_cardtype' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountcardtype' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><thead><tr style='background-color: cadetblue; color: white;'><th>卡类型</th><th style='text-align: right;'>成功数量</th><th style='text-align: right;'>成功押金</th><th style='text-align: right;'>失败数量</th><th style='text-align: right;'>失败押金</th></tr></thead><tbody>";
                        bu = data.aggregations.card_type.buckets;
                        for (var i in bu) {
                            //var libCardType = "卡类型:" + bu[i].key;
                            //if (bu[i].key === "008")
                            //    libCardType = "100块证";
                            //else if (bu[i].key === "011")
                            //    libCardType = "成人市民卡";
                            //else if (bu[i].key === "012")
                            //    libCardType = "少儿100块证";
                            //else if (bu[i].key === "033")
                            //    libCardType = "少儿市民卡";
                            //else if (bu[i].key === "YQ036")
                            //    libCardType = "乐清成人市民卡";
                            //else if (bu[i].key === "YQ037")
                            //    libCardType = "乐清少儿市民卡";
                            //else if (bu[i].key === "YQ002")
                            //    libCardType = "乐清200元押金卡";
                            sfdata = bu[i].success.buckets;
                            dhdata = "";
                            sc = "0";
                            sd = "0";
                            fc = "0";
                            fd = "0";
                            for (var j in sfdata) {
                                if(sfdata[j].key_as_string==="true"){
                                    sc = sfdata[j].doc_count;
                                    sd = sfdata[j].deposit.value;
                                }else{
                                    fc = sfdata[j].doc_count;
                                    fd = sfdata[j].deposit.value;
                                }
                            }
                            successData.push(parseInt(sc));
                            failData.push(parseInt(fc));
                            if(cardtypeToNameMap[bu[i].key] === undefined){
                                if(bu[i].key === ""){
                                    cardtypeToNameMap[""] = "无卡类型";
                                }else {
                                    cardtypeToNameMap[bu[i].key] = bu[i].key;
                                }
                            }
                            xCategories.push(cardtypeToNameMap[bu[i].key]);
                            dhdata += "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\"" + selectedDevice + "\",\"\",\"" + bu[i].key + "\",1,\"\");'>" + sc + "</a></td>" + "<td style='text-align: right;'>" + sd + "</td>" + "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\"\",\"\",\"" + bu[i].key + "\",0,\"\");'>" + fc + "</a></td>" +"<td style='text-align: right;'>" + fd + "</td>";
                            tableCount += "<tr><th>" + cardtypeToNameMap[bu[i].key] + "</th>" + dhdata + "</tr>";
                            //tableCount += "<tr><th>" + libCardType + "</th>" + dhdata + "</tr>";
                            //tableCount += "<tr><th>" + libCardType + "</th><td style='text-align: right;'>" + bu[i].doc_count + "</td></tr>";
                        }
                        tableCount += "</tbody></table>";
                        tableCount += "<table id='tablecountdetails' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='display:none;border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><thead><th>设备名称</th><th>读者证类型</th><th>读者条码号</th><th>读者姓名</th><th>读者证件号码</th><th>读者性别</th><th>手机号码</th><th>押金金额</th><th>办证时间</th><th>办证状态</th><th>状态描述</th></thead><tbody id='tablecountdetailsbody'></tbody></table>";
                    }

                    //按设备
                    else if ($("input[name='counttypedisplay']:checked").val() === "device") {
                        //tableCount += "<input id='buttoncountdevice' type='button' value='显示表格' onclick='ShowCountTable(\"tablecountdevice\");' style='margin-left: 100px;'/>";
                        tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountdevice,\"办证统计(按设备)\");' style='margin-left: 100px;'/>";
                        tableCount += "<div id='count_chart_device' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountdevice' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><thead><tr style='background-color: cadetblue; color: white;'><th>设备名称</th><th style='text-align: right;'>成功数量</th><th style='text-align: right;'>成功押金</th><th style='text-align: right;'>失败数量</th><th style='text-align: right;'>失败押金</th></tr></thead><tbody>";
                        bu = data.aggregations.device.buckets;
                        bu.sort(sortByDeviceName("key", false, String));
                        for (var i in bu) {
                            sfdata = bu[i].success.buckets;
                            dhdata = "";
                            sc = "0";
                            sd = "0";
                            fc = "0";
                            fd = "0";
                            for (var j in sfdata) {
                                if(sfdata[j].key_as_string==="true"){
                                    sc = sfdata[j].doc_count;
                                    sd = sfdata[j].deposit.value;
                                }else{
                                    fc = sfdata[j].doc_count;
                                    fd = sfdata[j].deposit.value;
                                }
                            }
                            successData.push(parseInt(sc));
                            failData.push(parseInt(fc));
                            xCategories.push(deviceAliasToLocationMap[bu[i].key]);
                            dhdata += "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\""+bu[i].key+"\",\"\",\"\",1,\"\");'>" + sc + "</a></td>" + "<td style='text-align: right;'>" + sd + "</td>" + "<td style='text-align: right;'><a href='javascript:void(0);' onclick='DisplayBZDetails(\"" + startTime + "\",\"" + endTime + "\",\""+bu[i].key+"\",\"\",\"\",0,\"\");'>" + fc + "</a></td>" +"<td style='text-align: right;'>" + fd + "</td>";
                            tableCount += "<tr><th>" + deviceAliasToLocationMap[bu[i].key] + "</th>" + dhdata + "</tr>";
                        }
                        tableCount += "</tbody></table>";
                        tableCount += "<table id='tablecountdetails' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='display:none;border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><thead><th>设备名称</th><th>读者证类型</th><th>读者条码号</th><th>读者姓名</th><th>读者证件号码</th><th>读者性别</th><th>手机号码</th><th>押金金额</th><th>办证时间</th><th>办证状态</th><th>状态描述</th></thead><tbody id='tablecountdetailsbody'></tbody></table>";
                    }


                    $("div[id^='count_chart']").remove();
                    $("table[id^='tablecount']").remove();

                    $("input[id^='buttoncount']").remove();
                    $("label[name^='devicecountlabel']").remove();
                    $("input[name='devicecountradio']").remove();

                    $("#content").append(tableCount);

                    //按日期显示
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        $('#count_chart_date').highcharts({
                            //data: {
                            //    table: 'tablecountdate'
                            //},
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
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '办证统计(按日期)      共办理 ' + data.hits.total + " 张读者证"
                            },
                            xAxis: {
                                categories:xCategories,
//                            type: 'datetime',
                                labels: {
                                    //step: 1,
                                    rotation: 30
//                                formatter: function () {
////                                    return Highcharts.dateFormat('%Y-%m-%d', this.value);
//                                    if (interval === "1d")
//                                        return Highcharts.dateFormat('%m月%d日', this.value);
//                                    else if (interval === "1m")
//                                        return Highcharts.dateFormat('%B', this.value);
//                                    else if (interval === "1y")
//                                        return Highcharts.dateFormat('%Y年', this.value);
//                                }
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
                                //formatter: function () {
                                //    //return '<b>' + this.series.name + '</b><br/>' +
                                //    //        this.point.y + ' ' + this.point.x;
                                //    if (interval === "1d")
                                //        return '<b>' + Highcharts.dateFormat('%Y年%m月%d日', this.series.value) + '</b><br/>' + this.series.name + '：' + this.point.y;
                                //    else if (interval === "1m")
                                //        return '<b>' + Highcharts.dateFormat('%B', this.series.value) + '</b><br/>' + this.series.name + '：' + this.point.y;
                                //    else if (interval === "1y")
                                //        return '<b>' + Highcharts.dateFormat('%Y年', this.series.value) + '</b><br/>' + this.series.name + '：' + this.point.y;
                                //}
                            },
                            series: [{
                                name: '成功数量',
                                data: successData
                            }, {
                                name: '失败数量',
                                data: failData
                            }]
                        });
                        //chart = $('#count_chart_date').highcharts();
                        //je = chart.series[chart.series.length - 1];
                        //je.remove(); //je.hide();
                        //je = chart.series[chart.series.length - 2];
                        //je.remove(); //je.hide();
                    }

                    //按地点显示
                    else if ($("input[name='counttypedisplay']:checked").val() === "location") {
                        $('#count_chart_location').highcharts({
                            //data: {
                            //    table: 'tablecountlocation'
                            //},
                            //colors: ['#B1CFD9'],
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
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '办证统计(按地点)      共办理 ' + data.hits.total + " 张读者证"
                            },
                            xAxis: {
                                categories: xCategories
                                //title: {
                                //    text: '日期'
                                //}
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
                                    return '<b>' + this.series.name + '</b><br/>' + this.point.y;
                                    //return '<b>' + this.series.name + '</b><br/>' + this.point.y + ' ' + this.point.name.toLowerCase();
                                }
                            },
                            series: [{
                                name: '成功数量',
                                data: successData
                            }, {
                                name: '失败数量',
                                data: failData
                            }]
                        });
                        //chart = $('#count_chart_location').highcharts();
                        //je = chart.series[chart.series.length - 1];
                        //je.remove(); //je.hide();
                        //je = chart.series[chart.series.length - 2];
                        //je.remove(); //je.hide();
                    }

                    //按卡类型显示
                    else if ($("input[name='counttypedisplay']:checked").val() === "cardtype") {
                        $('#count_chart_cardtype').highcharts({
                            //data: {
                            //    table: 'tablecountcardtype'
                            //},
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
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '办证统计(按卡类型)      共办理 ' + data.hits.total + " 张读者证"
                            },
                            xAxis: {
                                categories:xCategories
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
                            //tooltip: {
                            //    formatter: function () {
                            //        return '<b>' + this.series.name + '</b><br/>' + this.point.y + ' ' + this.point.name.toLowerCase();
                            //    }
                            //},
                            series: [{
                                name: '成功数量',
                                data: successData
                            }, {
                                name: '失败数量',
                                data: failData
                            }]
                        });
                    }
                    //按设备显示
                    else if ($("input[name='counttypedisplay']:checked").val() === "device") {
                        $('#count_chart_device').highcharts({
                            //data: {
                            //    table: 'tablecountdevice'
                            //},
                            //colors: ['#B1CFD9'],
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
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '办证统计(按设备)      共办理 ' + data.hits.total + " 张读者证"
                            },
                            xAxis: {
                                categories: xCategories
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
                                //formatter: function () {
                                //    return '<b>' + this.series.name + '</b><br/>' + this.point.y + ' ' + this.point.name.toLowerCase();
                                //}
                            },
                            series:[{
                                name:"成功数量",
                                data:successData
                            },{
                                name:"失败数量",
                                data:failData
                            }]
                        });
                        //chart = $('#count_chart_device').highcharts();
                        //je = chart.series[chart.series.length - 1];
                        //je.remove(); //je.hide();
                        //je = chart.series[chart.series.length - 2];
                        //je.remove(); //je.hide();
                    }

                    //按成功失败显示
                    else if ($("input[name='counttypedisplay']:checked").val() === "success") {
                        $('#count_chart_success').highcharts({
                            data: {
                                table: 'tablecountsuccess'
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
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '办证统计(按办证结果)      共办理 ' + data.hits.total + " 张读者证"
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
                                    return '<b>' + this.series.name + '</b><br/>' + this.point.y + ' ' + this.point.name.toLowerCase();
                                }
                            }
                        });
                        chart = $('#count_chart_success').highcharts();
                        je = chart.series[chart.series.length - 1];
                        je.remove(); //je.hide();
                        je = chart.series[chart.series.length - 1];
                        je.remove(); //je.hide();
                    }  //end of else if success
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
                    alert("CollectionsCount 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                }
            });
        }
    }

    function InventoryBooks(countflag) {
        BeforCount();
        if(countflag === 0){
            var p1 = "<br><table id='papercountsearch' border='0px' cellpadding='0' cellspacing='0' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'>";
            p1 += "<tr><td rowspan='2' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>清点报告</td><td style='width: auto;'>&nbsp;日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;至：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
           p1 += "&nbsp;&nbsp;每页<input id='recordersperpage' style='width: 20px;' type='text' value='10' > 条记录";
           p1 += "&nbsp;&nbsp;<input id='countreportbutton' type='button' value='统计' onclick='Statistics.InventoryBooks(1);' style='font-size: 22px;'></td></tr>";
            p1 += "</table><br>";
            $("#content").html(p1);
            var now = new Date().format("yyyy-MM-dd");
            if(startTime == "")
            {
                $("#starttime").val(now);
                $("#endtime").val(now);
            }
            else
            {
                $("#starttime").val(startTime.format("yyyy-MM-dd"));
                $("#endtime").val(endTime.format("yyyy-MM-dd"));
            }
        } else {
            DisplayInfoByPage("");
       }
    }

    function DisplayInfoByPage(pageurl)
    {
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        startTime = $("#starttime").val();
        endTime = $("#endtime").val();
        if(startTime > endTime){
            alert("起始日期大于结束日期!");
            return;
        }
        endTime=addDate(endTime,1);
        var recordersperpage = $("#recordersperpage").val();


        var intSTime = Date.parse(startTime);
        var intETime = Date.parse(endTime);

        startTime = addSeconds(startTime, 0);
        endTime = addSeconds(endTime, -60*60*24);

        if(pageurl === "")
            navurl = backServerUrl + "api/check_items?start_time=" + intSTime + "&end_time=" + intETime + "&offset=0&limit=" + recordersperpage + "&ordering=";
        else {
            navurl = backServerUrl + pageurl.substring(1);
        }

        $.ajax({
            type: "get",
            url: navurl,
            dataType: "json",
            headers: {'Content-Type': 'application/json', 'Authorization': et},
            beforeSend: function () {
                $("#countreportbutton").addClass("breath_light");
            },
            complete: function () {
                $("#countreportbutton").removeClass("breath_light");
            },
            success: function (data) {
                console.log(data);
                if(data.content.length > 0){
                    var purl = parseURL(navurl);

                    var tableCount = "<table id='tablecountdevice' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto auto 30px;'><caption style='text-align: left;'>共 " + data.count + " 条记录</caption><thead><tr style='background-color: cadetblue; color: white;'><th>条码号</th><th style='text-align: center;'>图书名称</th><th style='text-align: center;'>状态</th><th style='text-align: center;'>应在架位</th><th style='text-align: center;'>实际架位</th></tr></thead><tbody id='tablecountdetailsbody'>";
                    var bu = data.content;
                    for (var i in bu) {
                        tableCount += "<tr><td>" + bu[i].barcode + "</td><td>" + bu[i].title + "</td><td>" + bu[i].status + "</td><td>" + bu[i].act_shelf_str + "</td><td>" + bu[i].shelf_str + "</td></tr>";
                    }
                    inventoryPages = Math.ceil(data.count/purl.params.limit);
                    var currentPage = purl.params.offset/purl.params.limit + 1;
                    tableCount += "<tr><td colspan='4' style='text-align: center; border: 0px green solid;'><input id='prev' type='button' value='上一页' onclick='Statistics.DisplayInfoByPage(\"" + data.prev + "\")'>&nbsp;" + currentPage + "/" + inventoryPages + "&nbsp;<input id='next' type='button' value='下一页' onclick='Statistics.DisplayInfoByPage(\"" + data.next + "\")'></td><td style='text-align: right; border: 0px green solid;'><input id='pagenumber' type='text' style='width: 26px;'>&nbsp;<input type='button' value='跳转' onclick='Statistics.GenInventoryPageUrl()'></td></tr>";
                    tableCount += "</tbody></table>";

                    $("div[id^='count_chart']").remove();
                    $("table[id^='tablecount']").remove();

                    $("input[id^='buttoncount']").remove();
                    $("label[name^='devicecountlabel']").remove();
                    $("input[name='devicecountradio']").remove();

                    $("#content").append(tableCount);
                    if(data.prev === "")
                        $("#prev").prop("disabled",true);
                    else
                        $("#prev").prop("disabled",false);
                    if(data.next === "")
                        $("#next").prop("disabled",true);
                    else
                        $("#next").prop("disabled",false);
                } else {
                    alert("该段时间无清点数据!");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //当前状态(readyState),0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成
                alert("CollectionsCount 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        });
    }
    
    function GenInventoryPageUrl() {
        var prul = parseURL(navurl);
        var pagenumber = $("#pagenumber").val();
        if(pagenumber <1 || pagenumber > inventoryPages){
            alert("页号不在正确的范围！");
            return;
        }
        var offset = (pagenumber - 1) * prul.params.limit;
        // var newurl = prul.protocol + "://" + prul.host + ":" + prul.port +  prul.path + "?start_time=" + prul.params.start_time + "&end_time" + prul.params.end_time + "&offset=" + offset + "&limit=" + prul.params.limit + "&ordering=" + prul.params.ordering;
        var newurl = prul.path + "?start_time=" + prul.params.start_time + "&end_time=" + prul.params.end_time + "&offset=" + offset + "&limit=" + prul.params.limit + "&ordering=" + prul.params.ordering;
        DisplayInfoByPage(newurl);
    }

    function ReaderScoreBoard(countflag) {
        BeforCount();
        if(countflag === 0){
            var p1 = "<br><table id='papercountsearch' border='0px' cellpadding='0' cellspacing='0' style='width:auto; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'>";
            p1 += "<tr><td rowspan='2' style='width: 120px; text-align: center; color: white; background-color: rgba(95, 157, 159, 0.67);'>读者积分榜</td><td style='width: auto;'>&nbsp;日期：<input id='starttime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-1-1\",\"2017-01-01\",1)' readonly='readonly' />&nbsp;&nbsp;&nbsp;至：<input id='endtime' type='text' style='font-size: 20px; width:110px;' onfocus='setday(this,\"yyyy-MM-dd\",\"2016-01-01\",\"2017-01-01\",1)' readonly='readonly' />";
            p1 += "&nbsp;&nbsp;显示前<input id='recordersperpage' style='width: 20px;' type='text' value='10' > 名";
            p1 += "&nbsp;&nbsp;<input id='countreportbutton' type='button' value='统计' onclick='Statistics.ReaderScoreBoard(1);' style='font-size: 22px;'></td></tr>";
            p1 += "</table><br>";
            $("#content").html(p1);
            var now = new Date().format("yyyy-MM-dd");
            if(startTime == "")
            {
                $("#starttime").val(now);
                $("#endtime").val(now);
            }
            else
            {
                $("#starttime").val(startTime.format("yyyy-MM-dd"));
                $("#endtime").val(endTime.format("yyyy-MM-dd"));
            }
        } else {
            startTime = $("#starttime").val();
            endTime = $("#endtime").val();
            if(startTime > endTime){
                alert("起始日期大于结束日期!");
                return;
            }
            // endTime=addDate(endTime,1);
            var limitParam = $("#recordersperpage").val();

            var intSTime = Date.parse(startTime) - 60*60*8*1000;
            var intETime = Date.parse(endTime) + 60*60*16*1000;

            $.ajax({
                type: "get",
                //url: backServerUrl + "api/statistics/jh?start=" + startTime + "T00:00:01.001&end=" + endTime + "T23:59:59.001&interval=1m&top=" + limit + "&device_alias=" + selectedDevice +  "&source=false" + aggr,
                url: backServerUrl + "api/data/ranking_reader?start_time=" + intSTime + "&end_time=" + intETime + "&limit_param=" + limitParam,
                dataType: "json",
                headers: {'Content-Type': 'application/json', 'Authorization': et},
                beforeSend: function(){
                    $("#countreportbutton").addClass("breath_light");
                },
                complete: function(){
                    $("#countreportbutton").removeClass("breath_light");
                },
                success: function (data) {
                    var tableCount = "";
                    var bu = null;

                    //按时间
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        // for (var i in data.aggregations.operation.buckets) {
                        //     if (data.aggregations.operation.buckets[i].key === "borrow")
                        //         bu = data.aggregations.operation.buckets[i].reader_id.buckets;
                        // }
                        // if (bu == null) {
                        //     alert("该段时间内没有数据!");
                        //     return;
                        // }
                        bu=data;
                        if (bu.borrow_ranking.length==0) {
                            $("#buttoncountprintsuccess").remove();
                            $("#count_chart_location").remove();
                            $("#tablecountlocation").remove();
                            alert("该段时间内没有数据!");
                            return;
                        }
                        tableCount += "<input id='buttoncountprintsuccess' type='button' value='打印表格' onclick='PrintCountTable(tablecountlocation,\"读者排行榜\");' style='margin-left: 30px;'/>";
                        tableCount += "<div id='count_chart_location' style='width: 90%; margin: auto;'>统计图表</div>";
                        tableCount += "<table id='tablecountlocation' border='1px' cellpadding='0' cellspacing='0' bordercolor='cadetblue' style='width:500px; border:solid 1px cadetblue; background-color: rgba(151, 217, 219, 0.22); border-collapse:collapse; font-size: 20px; margin: auto;'><thead><tr style='background-color: cadetblue; color: white;'><th>读者姓名</th><th style='text-align: right;'>借阅次数</th></tr></thead><tbody>";
                        var xCategories = [];
                        var borrowData = [];
                        for (var i in bu.borrow_ranking) {
                            xCategories.push(bu.borrow_ranking[i].full_name);
                            borrowData.push(bu.borrow_ranking[i].borrow_times);
                            tableCount += "</td><td>" + bu.borrow_ranking[i].full_name + "</td><td style='text-align: center;'>" + bu.borrow_ranking[i].borrow_times + "</td></tr>";
                        }
                        tableCount += "</tbody></table>";
                    }

                    $('#count_chart_location').remove();
                    $("#tablecountlocation").remove();
                    $("input[id^='buttoncount']").remove();
                    $("#content").append(tableCount);

                    //按时间
                    if ($("input[name='counttypedisplay']:checked").val() === "date") {
                        $('#count_chart_location').highcharts({
                            data: {
                                table: 'tablecountlocation'
                            },
                            colors: ['#B1CFD9', '#50B432', '#DDDF00'],
                            chart: {
                                type: 'column',
                                backgroundColor: 'rgba(0,0,0,0)'
                            },
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: '读者排行榜'
                            },
                            xAxis: {
                                categories: xCategories
                            },
                            yAxis: {
                                allowDecimals: false,
                                title: {
                                    text: '借阅次数'
                                }
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    colorByPoint: true,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y}'
                                    }
                                }
                            },
                            series: [{
                                name: '借阅次数',
                                data: borrowData
                            }]
                        });
                    }
                }
            });
        }
    }


    function GroupChange()
    {
        var checkValue=$("#devicegrouplist").val().toUpperCase();
        //console.log(checkValue);
        $("input[name^='countdeviceinput']").each(function (i) {
            if(checkValue.indexOf(this.value) >= 0){
                //console.log("i = " + i + "   value = " + this.value);
                $(this).prop("checked",true);
            }
            else{
                $(this).prop("checked",false);
            }
        });
    }

    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }//日期转化

    function addDate(date,days){
        var nd = new Date(date);
        nd = nd.valueOf();
        nd = nd + days * 24 * 60 * 60 * 1000;
        nd = new Date(nd);
        //alert(nd.getFullYear() + "年" + (nd.getMonth() + 1) + "月" + nd.getDate() + "日");
        var y = nd.getFullYear();
        var m = nd.getMonth()+1;
        var d = nd.getDate();
        if(m <= 9) m = "0"+m;
        if(d <= 9) d = "0"+d;
        var cdate = y+"-"+m+"-"+d;
        return cdate;
    }

    function addSeconds(date, seconds){
	var nd = new Date(date);
	nd = nd.valueOf();
	nd = nd + seconds * 1000;
	nd = new Date(nd);
	return nd;
    }


    return{
        BorrowCount:BorrowCount,
        ReaderCount:ReaderCount,
        BibliographyCount:BibliographyCount,
        CategoryCount:CategoryCount,
        CollectionsCount:CollectionsCount,
        InventoryBooks : InventoryBooks,
        DisplayInfoByPage : DisplayInfoByPage,
        ReaderScoreBoard : ReaderScoreBoard,
        GenInventoryPageUrl : GenInventoryPageUrl
    }
}();
