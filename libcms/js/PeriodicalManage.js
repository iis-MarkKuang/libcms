var PeriodicalManage = function () {

    var keyudnav= 0;
    var et = window.localStorage["et"];
    var backServerUrl = window.localStorage["backServerUrl"];

    var Periodmanage = new Vue({
        el: '#Periodmanage',
        data: {
        },
        methods:{
            searchperiod:function () {
                var issn = $("#issnfs").val().trim();
                var bookname = $("#booknamefs").val();
                var publisher = $("#publisherfs").val();
                var batch = $("#batchfs").val();

                if(issn === "" && bookname === "" && publisher === "" && batch === ""){
                    alert("搜索条件为空!");
                    return;
                }
                else {
                    var surl = backServerUrl + "api/solicited?publisher="+publisher+"&title="+bookname+"&issn="+issn+""+"&offset=&limit=15";
                    ShowTable(surl);
                }
            },

            searchlate:function () {
                $("#searchlistbody").find("tr").remove();
                $.ajax({
                    type: "GET",
                    url: backServerUrl + "api/solicited/late",
                    dataType: "json",
                    headers: {'Content-Type': 'application/json','Authorization':et},
                    success: function (data) {
                        //nexturl=backServerUrl+data.next.substr(1);
                        //prevurl=backServerUrl+data.prev.substr(1);
                        if(data.count<=0)
                        {
                            alert("未找到晚到期刊!");
                            //SearchBook("","0");
                        }
                        else {
                            var str="";
                            $.each(data,function (i) {
                                str+="<tr>"
                                    +"<td>"+data[i].title.issn+"</td><td>"
                                    +data[i].title.title+"</td><td>"
                                    +data[i].publish.publisher+"</td><td>"
                                    +data[i].bookInfo.period+"</td><td>"
                                    +data[i].datetime.substring(0,16).replace("T"," ")+"</td><td>"
                                    +data[i].bookInfo+"</td>"
                                    +"<td><input type='checkbox' class='ischeckbox' value='"+data[i].flow.isSubscribed+"' disabled " + data[i].flow.isSubscribed ? 'checked' : '' + "></td>"
                                    +"<td><input type='checkbox' class='ischeckbox' value='"+data[i].flow.isActive+"' disabled " + data[i].flow.isActive ? 'checked' : '' + "></td>"
                                    +"<td><input type='button' value='续订' class='BookContinue' name='"+data[i].id+"'></td>"
                                    +"<td><span style='color: red'>晚到</span></td>"
                                    +"</tr>"
                            })
                        }
                        //Pageall=Math.ceil(data.count/limit);
                        //$("#bookpageno span[name='pageall']").html(Pageall+"页");
                        //Disabledfirst();
                        //Disabledlast(Pageall);
                        $("#searchlistbody").append(str);
                        $(".ischeckbox").each(function () {
                            if($(this).val()=="true")
                            {
                                $(this).attr("checked",true);
                            }
                        })
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert(XMLHttpRequest.responseText);
                    },
                });
            },

            update:function () {
                ShowTable("New");
            }
        }
    });

    $(document).ready(function () {
        $("#booklist").on('click','.BookContinue',function () {
            var periodId= $(this).attr("name");
            var surl = backServerUrl + "api/solicited/"+periodId;
            $.ajax({
                type: "PATCH",
                url: surl,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    if(data.result=="updated"&&data.updated)
                    {
                        alert("续订成功")
                    }

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if(XMLHttpRequest.responseText.indexOf("doesn't need to be resolicited"))
                    {
                        alert("该期刊不需要续订");
                    }
                    else{
                        alert("续订失败！");
                    }
                },
            });
        })

        $("#booklist").on('click','.BookDelete',function () {
            var periodId= $(this).attr("name");
            var surl = backServerUrl + "api/solicited/"+periodId;
            $.ajax({
                type: "DELETE",
                url: surl,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    if(data.deleted&&data.result=="deleted")
                    {
                        alert("删除成功!");
                        ShowTable("New");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("删除失败！");
                },
            });
        })
    })

    function ShowTable(surl) {
        //var limit=$("#rows option:selected").text();//每页多少行
        $("#searchlistbody").find("tr").remove();
        if(surl==="New")
            surl = backServerUrl + "api/solicited?publisher=&title=&issn=&batch=&offset=&limit=15";
        $.ajax({
            type: "GET",
            url: surl,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                if(data.count<=0)
                {
                    alert("无法找到符合条件的期刊，请核查检索条件！");
                    //SearchBook("","0");
                }
                else {
                    var purl = parseURL(surl);
                    var body = "";
                    if (purl.params.offset === "")
                        purl.params.offset = 0;
                    $.each(data.content,function (i) {
                        var checked = data.content[i].flow.isSubscribed ? 'checked' : '';
                        body+= "<tr id='bi" + i + "'><td>"
                            + (i + 1 + parseInt(purl.params.offset)) + "</td>"
                            +"<td>"+data.content[i].title.issn+"</td><td>"
                            +data.content[i].title.title+"</td><td>"
                            +data.content[i].publish.publisher+"</td><td>"
                            +data.content[i].bookInfo.period+"</td><td>"
                            +data.content[i].datetime.substring(0,16).replace("T"," ")+"</td><td>"
                            +data.content[i].bookInfo.price+"</td>"
                            +"<td><input type='checkbox' class='ischeckbox' value='"+data.content[i].flow.isSubscribed+"' disabled " + checked + "></td>"
                            +"<td><input type='checkbox' class='ischeckbox' value='"+data.content[i].flow.isActive+"' disabled " + checked + "></td>"
                            +"<td><input type='button' value='续订' class='BookContinue' name='"+data.content[i].id+"'></td>"
                            +"<td><input type='button' value='删除' class='BookDelete' name='"+data.content[i].id+"'>"
                            +"</td></tr>"
                        console.log(body);
                    });

                    if (data.prev === "" && data.next === "") {
                        body += "<tr><td colspan='11'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else if (data.prev === "" && data.next !== "") {
                        body += "<tr><td colspan='11'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' disabled='disabled' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else if (data.prev !== "" && data.next === "") {
                        body += "<tr><td colspan='11'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' disabled='disabled' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    } else {
                        body += "<tr><td colspan='11'>共 " + data.count + " 条记录&nbsp;&nbsp;<input id='prev' type='button' value='上一页' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.prev.substring(1) + "\")'> " + (purl.params.offset / purl.params.limit + 1) + "/" + (Math.ceil(data.count / purl.params.limit)) + "<input id='next' type='button' value='下一页' onclick='PeriodicalManage.ShowTable(\"" + backServerUrl + data.next.substring(1) + "\")'></td></tr>";
                    }
                }
                $("#searchlistbody").html(body);
                $("#bi" + keyudnav).css("backgroundColor", "rgba(151, 217, 219, 0.22)");
                $(".ischeckbox").each(function () {
                    if($(this).val()=="true")
                    {
                        $(this).attr("checked",true);
                    }
                })
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.responseText);
            },
        });
    }//获取期刊列表

    return{
        Periodmanage : Periodmanage,
        ShowTable:ShowTable,
    }
}();

