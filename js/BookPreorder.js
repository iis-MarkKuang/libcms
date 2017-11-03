//# sourceURL=BookPreorder.js
/**
 * Created by lhassy on 2016/12/16.
 */
var bookPreorder = function () {
    var mytable = $('#edittable').editTable({
        data: [['']],           // Fill the table with a js array (this is overridden by the textarea content if not empty)
        tableClass: 'inputtable',   // Table class, for styling
        jsonData: false,        // Fill the table with json data (this will override data property)
        headerCols: [
//            '查重',
//            '订否',
            '文献名称',
            '作者',
            '出版社',
            'ISBN',
            '价格',
            '册数',
            '总价',
//            '供应商',
            '预定号',
            '备注'
        ],      // Fix columns number and names (array of column names)
        maxRows: 999,           // Max number of rows which can be added
        first_row: false,        // First row should be highlighted?
//        row_template: ['textlabel','checkbox',  'text', 'text','text','text','text','text','text','text','text','text'],    // An array of column types set in field_templates
        row_template: ['text', 'text','text','text','number','number','textlabel','textlabel','text'],    // An array of column types set in field_templates
        field_templates: {
            'checkbox' : {
                html: '<input type="checkbox"/>',
                getValue: function (input) {
                    return $(input).is(':checked');
                },
                setValue: function (input, value) {
                    if ( value ){
                        return $(input).attr('checked', true);
                    }
                    return $(input).removeAttr('checked');
                }
            },
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
                html: '<input type="text" value="" onchange="testnumber(this)"/>',
                getValue: function (input) {
                    return $(input).val();
                },
                setValue: function (input, value) {
                    return $(input).attr("value",value);
                }
            }
        }, // An array of custom field type objects
        displayAddDelButton : true,
        // Validate fields
        validate_field: function (col_id, value, col_type, $element) {
            return true;
        }
    });

    function CreateBookSeller() {
        console.log("CreateBookSeller");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        var bookseller = prompt("请输入供应商名称:");
        if(bookseller != "" && bookseller != null){

            var stringJson = {name : bookseller, "description":""};
            $.ajax({
                type: "POST",
                url: backServerUrl + "api/vendor/members",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(stringJson),
                success: function (data) {
                    alert("供应商添加成功!");
                    GetBookSeller();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var functionName = "CreateBookSeller";
                    alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                    // }
                }
            });
        }
    }

    function DeleteBookSeller(){
        console.log("DeleteBookSeller");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        var bookseller = $("#supplier").find("option:selected").text();
        if(confirm("确定要删除当前的供应商 " + bookseller + " 吗?")){
            var booksellerId = $("#supplier").val();
            $.ajax({
                type: "DELETE",
                url: backServerUrl + "api/vendor/members/" + booksellerId,
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                success: function (data) {
                    if(data.deleted)
                        alert("删除供应商成功!");
                    else
                        alert("删除供应商失败! (有与该供应商相关的订单记录)");
                    GetBookSeller();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var functionName =  "DeleteBookSeller";
                    alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                    // }
                }
            });
        }
    }

    function SaveDocPreorder(obj) {
        console.log("SaveDocPreorder");
        var et = window.localStorage["et"];
        var backServerUrl = window.localStorage["backServerUrl"];

        if($(obj).val() === "新建订单"){
            $("#pubutton").val("预订");
            $("#dispcount").text("");
            var date = new Date().format("yyyy-MM-dd");
            // $("#preorderdate").datebox("setValue",date);
            $("#preorderdate").val(date);
            mytable.reset();
            return;
        }

        if($("#edittable").children('table').children('tbody').children('tr').children('td').eq(7).children('input').val() !== ""){
            alert("订单不可重复提交!");
            return;
        }

        if(confirm("确定提交预订单?")){
            var theTable = document.getElementById("edittable");
            var oo = generateArrayFromEditTable(theTable);
            console.log(oo);
            if(oo[0].length < 2 || oo[0][1][0] === null){
                alert("表格没有数据!");
                return;
            }
            // var orderdate = $("#preorderdate").datebox("getValue");
            var orderdate = $("#preorderdate").val();
            var booksellerId = $("#supplier").val();
            var data = [];
            oo[0].forEach(function (o,index) {
                if(index > 0){
                    var title = "";
                    if(o[0] !== null)
                        title = o[0];
                    var author = "";
                    if(o[1] !== null)
                        author = o[1];
                    var publisher = "";
                    if(o[2] !== null)
                        publisher = o[2];
                    var isbn = "";
                    if(o[3] !== null)
                        isbn = o[3];
                    var price = "0";
                    if(o[4] !== null)
                        price = o[4].toString();
                    var quantity = "0";
                    if(o[5] !== null)
                        quantity = o[5].toString();
                    var total = "0";
                    if(o[6] !== null)
                        total = o[6].toString();
                    var description = "";
                    if(o[8] !== null)
                        description = o[8];
                    data.push({"title":title,"author":author,"publisher":publisher,"isbn":isbn,"price":price,"quantity":quantity,"total":total,"description":description,"vendor_id": booksellerId,"order_date":orderdate});
                    // data.push({"title":o[0],"author":o[1],"publisher":o[2],"isbn":o[3],"price":o[4].toString(),"quantity":o[5].toString(),"total":o[6].toString(),"description":o[8],"vendor_id": booksellerId,"order_date":orderdate});
                }
            });
            console.log(data);
            var stringJson = {"data" : data };
            // var stringJson = {"items" : data, "vendor_id": booksellerId,"order_date":orderdate };
            $.ajax({
                type: "POST",
                url: backServerUrl + "api/vendor/bulk/orders",
                dataType: "json",
                headers: {'Content-Type': 'application/json','Authorization':et},
                data:JSON.stringify(stringJson),
                success: function (data) {
                    console.log(data);
                    $("#edittable tbody tr").each(function (index, o) {
                        $(o).children('td').eq(7).children('input').val(data[index].id);
                        // $(o).children('td').eq(7).children('input').val(data.created[index - 1]);
                    });
                    $("#edittable").children('table').children('thead').children('tr').children('th').eq(9).hide();
                    $("#edittable").children('table').children('tbody').children('tr').each(function (index, o) {
                        $(o).children('td').eq(9).hide();
                    });
                    $("#pubutton").val("新建订单");
                    alert("添加文献预定单成功!");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var functionName = "SaveDocPreorder";
                    alert( functionName + " 请求产生错误!\n" + "status = " + XMLHttpRequest.status + "\nstatusText = " + XMLHttpRequest.statusText + "\nreadyState = " + XMLHttpRequest.readyState + "\nresponseText = " + XMLHttpRequest.responseText);
                    // }
                }
            });
        }
    }

    $("#edittable tr th:eq(0)").css("width","500px");
    $("#edittable tr th:eq(1)").css("width","120px");
    $("#edittable tr th:eq(2)").css("width","120px");
    $("#edittable tr th:eq(3)").css("width","130px");
    $("#edittable tr th:eq(4)").css("width","50px");
    $("#edittable tr th:eq(5)").css("width","40px");
    $("#edittable tr th:eq(6)").css("width","60px");

    var X = XLSX;
    var xlf = document.getElementById('xlf');
    if(xlf !== null){
        if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);
    }

    function InitPage() {
        $("#datawindow").css("height",height - 220);
        var now = new Date().format("yyyy-MM-dd");
        $("#preorderdate").val(now);

        GetBookSeller();
    }

    return {
        InitPage : InitPage,
        mytable : mytable,
        SaveDocPreorder : SaveDocPreorder,
        CreateBookSeller : CreateBookSeller,
        DeleteBookSeller : DeleteBookSeller
    }
}();