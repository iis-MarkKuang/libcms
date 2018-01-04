//# sourceURL=BookSigned.js
/**
 * Created by lhassy on 2016/12/16.
 */
var bookSigned = function () {

    var myordertable = $('#edittable').editTable({
        data: [['']],           // Fill the table with a js array (this is overridden by the textarea content if not empty)
        tableClass: 'inputtable',   // Table class, for styling
        jsonData: false,        // Fill the table with json data (this will override data property)
        headerCols: [
            '文献名称',
            '作者',
            '出版社',
            'ISBN',
            '价格',
            '册数',
            '总价',
            '供应商',
            '预定日期',
            '到馆日期',
            '实价',
            '实数',
            '预定号',
            '备注'
        ],      // Fix columns number and names (array of column names)
        maxRows: 999,           // Max number of rows which can be added
        first_row: false,        // First row should be highlighted?
        row_template: ['text', 'text','text','text','textlabel','textlabel','textlabel','textlabel','textlabel','textlabel','text','text','textlabel','text'],    // An array of column types set in field_templates
        field_templates: {
            'textlabel' : {
                html: '<input type="text" value="" readonly="readonly"/>',
                getValue: function (input) {
                    return $(input).val();
                },
                setValue: function (input, value) {
                    return $(input).attr("value",value);
                }
            },
            'number' : {
                html: '<input type="tel" value=""/>',
                getValue: function (input) {
                    return $(input).val();
                },
                setValue: function (input, value) {
                    return $(input).attr("value",value);
                }
            }
        }, // An array of custom field type objects
        displayAddDelButton : false,
        // Validate fields
        validate_field: function (col_id, value, col_type, $element) {
            return true;
        }
    });

    function SearchPreorder() {
        console.log("SearchPreorder");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        // var signeddate = $("#bookindate").datebox("getValue");
        var vendor_id = $("#supplier").val();
        var isbn = $("#isbnfs").val();

        $.ajax({
            type: "GET",
            url: backServerUrl + "api/vendor/orders?limit=500&offset=&order_date=&create_at=&is_arrived=false&vendor_id="+ vendor_id + "&isbn=" + isbn,
            dataType: "json",
            headers: {'Content-Type': 'application/json','Authorization':et},
            success: function (data) {
                console.log(data);
                var tdata = [];
                var tsubdata = [];
                var obcount = 0;
                var opcount = 0;
                var rbcount = 0;
                var rpcount = 0;
                data.content.forEach(function (o) {
                    obcount += o.quantity;
                    opcount += o.price * o.quantity;
                    rbcount += o.actual_quantity;
                    rpcount += o.actual_price * o.actual_quantity;
                    tsubdata = [];
                    tsubdata.push(o.title);
                    tsubdata.push(o.author);
                    tsubdata.push(o.publisher);
                    tsubdata.push(o.isbn);
                    tsubdata.push(o.price);
                    tsubdata.push(o.quantity);
                    tsubdata.push(o.total);
                    tsubdata.push(o.vendor.name);
                    tsubdata.push(o.order_date.substring(0,10));
                    tsubdata.push("");   //$("#bookindate").datebox("getValue")
                    tsubdata.push(o.actual_price);
                    tsubdata.push(o.actual_quantity);
                    tsubdata.push(o.id);
                    tsubdata.push(o.description);
                    tdata.push(tsubdata);
                });
                $("#dispscount").html("预订总册数: " + obcount + "  &nbsp;&nbsp;&nbsp;&nbsp;预订总金额: " + opcount.toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp; 实到总册数: " + rbcount + "&nbsp;&nbsp;&nbsp;&nbsp;实际总金额: " + rpcount.toFixed(2));
                console.log(tdata);
                myordertable.loadData(tdata);

                //监听数值输入
                $("#edittable input").blur(function(){
                    // var signeddate = $("#bookindate").datebox("getValue");
                    var signeddate = $("#bookindate").val();
                    var actural_count = $(this).parent().parent().children('td').eq(11).children('input').val();
                    if((actural_count === "" || actural_count === "0")) {
                        $(this).parent().parent().children('td').eq(9).children('input').val("");
                    }else{
                        if($(this).parent().parent().children('td').eq(9).children('input').val() === ""){
                            // $(this).parent().parent().children('td').eq(9).children('input').prop("readonly",false);
                            $(this).parent().parent().children('td').eq(9).children('input').val(signeddate);
                        }
                        CountOrderPrice2();
                    }
                    // $(this).css("background-color","#D6D6FF");
                });

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var functionName = "SearchPreorder";
                alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
            }
        });
    }

    function CountOrderPrice2() {
        var obcount = 0;
        var opcount = 0;
        var rbcount = 0;
        var rpcount = 0;
        $("#edittable").children("table").children("tbody").children("tr").each(function(){
            obcount += Number.parseFloat($(this).children("td").eq(5).children("input").val());
            opcount += Number.parseFloat($(this).children("td").eq(6).children("input").val());
            rbcount += Number.parseFloat($(this).children("td").eq(11).children("input").val());
            rpcount += Number.parseFloat($(this).children("td").eq(10).children("input").val()) * Number.parseFloat($(this).children("td").eq(11).children("input").val());
        });
        $("#dispscount").html("预订总册数: " + obcount + "  &nbsp;&nbsp;&nbsp;&nbsp;预订总金额: " + opcount.toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp; 实到总册数: " + rbcount + "&nbsp;&nbsp;&nbsp;&nbsp;实际总金额: " + rpcount.toFixed(2));
    }

    function SaveDocSigned() {
        console.log("SaveDocSigned");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        if(confirm("确定保存?")){
            var theTable = document.getElementById("edittable");
            var oo = generateArrayFromEditTableForSigned(theTable);
            if(oo[0].length < 2){
                alert("表格没有数据!");
                return;
            }
            console.log("oo[0]");
            console.log(oo[0]);
            var data = [];
            var checkdata = true;
            oo[0].forEach(function (o,index) {
                if(index > 0){
                    if(o[10] === 0 || o[11] === 0){
                        alert("保存的记录中含有 '实价' 或 '实数' 为0的记录, 请填写正确后再保存!");
                        checkdata = false;
                        return false;
                    }
                    data.push({"id":o[12],"title":o[0],"author":o[1],"publisher":o[2],"isbn":o[3],"price":o[4],"quantity":o[5],"total":o[6],"order_date":o[8],"arrive_at":o[9],"actual_price":o[10],"actual_quantity":o[11],"actual_total":o[10]*o[11],"description":o[13],"vendor_id":booksellerToIdMap[o[7]]});
                }
            });

            if(!checkdata)
                return;

            console.log(data);
            var stringJson = {"data" : data};
            $.ajax({
                type: "PATCH",
                url: backServerUrl + "api/vendor/bulk/orders",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(stringJson),
                success: function (data) {
                    console.log(data);
                    alert("文献签到成功!");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var functionName = "SaveDocSigned";
                    alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                    // }
                }
            });
        }
    }

    function generateArrayFromEditTableForSigned(table) {
        var out = [];
        var rows = table.querySelectorAll('tr');
        var ranges = [];
        for (var R = 0; R < rows.length; ++R) {
            var outRow = [];
            var row = rows[R];
            var columns;
            if(R === 0){
                columns = row.querySelectorAll('th');
            }else{
                columns = row.querySelectorAll('td');
            }
            for (var C = 0; C < columns.length; ++C) {
                var cell = columns[C];
                var colspan = cell.getAttribute('colspan');
                var rowspan = cell.getAttribute('rowspan');
                var cellValue;
                if(R === 0){
                    cellValue = cell.innerText;
                }else{
                    cellValue = cell.querySelector('input').value;
                }
                if(cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

                //Skip ranges
                ranges.forEach(function(range) {
                    if(R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
                        for(var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
                    }
                });

                //Handle Row Span
                if (rowspan || colspan) {
                    rowspan = rowspan || 1;
                    colspan = colspan || 1;
                    ranges.push({s:{r:R, c:outRow.length},e:{r:R+rowspan-1, c:outRow.length+colspan-1}});
                };

                //Handle Value
                outRow.push(cellValue !== "" ? cellValue : null);

                //Handle Colspan
                if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
            }
            out.push(outRow);
        }
        return [out, ranges];
    }

    function InitPage() {
        GetBookSeller();
        $("#datawindow").css("height",height - 220);
        var now = new Date().format("yyyy-MM-dd");
        $("#bookindate").val(now);
    }
    return{
        InitPage : InitPage,
        SearchPreorder : SearchPreorder,
        SaveDocSigned : SaveDocSigned,
    }
}();