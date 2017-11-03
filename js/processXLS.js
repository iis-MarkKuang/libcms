//# sourceURL=processXLS.js
var X = XLSX;

function to_csv(workbook) {
    var result = [];
    workbook.SheetNames.forEach(function(sheetName) {
        var csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        //gcsv = csv;
        //if(csv.length > 0){
        //    result.push("SHEET: " + sheetName);
        //    result.push("");
            result.push(csv);
        //}
    });
    return result;
    //return result.join("\n");
}

function process_wb(wb) {
    var output = "";
    output = to_csv(wb);
    goutput = output;
    var lines = output[0].split('\n');
    var supplier = lines[2].split(',')[1];
    // $("#supplier").val(supplier);
    // $("#supplier").find("option[text='" + supplier + "']").attr("selected",true);
    if($("#supplier").find("option[text='" + supplier + "']").length === 0){
        alert("供应商列表中未发现 " + supplier + " !");
    } else {
        $("#supplier").find("option[text='" + supplier + "']").prop("selected",true);
    }
    var preorderdatearray = lines[3].split(',')[1].split("/");
    var preorderdate = "20" + preorderdatearray[2] + "-" + preorderdatearray[0] + "-" + preorderdatearray[1];
    console.log(preorderdate);
    $("#preorderdate").val(preorderdate);
    // $("#preorderdate").datebox("setValue",preorderdate);
    var tdata = [];
    var index;
    if(lines[5].split(',')[0].length > 0) {
        for (var i = 5; i < lines.length; i++) {
            if (lines[i].length > 10) {
                index = lines[i].lastIndexOf(',');
                // lines[i] = ",," + lines[i].substring(0, index) + "," + supplier + "," + lines[i].substring(index);
                // lines[i] = lines[i].substring(0, index) + "," + supplier + "," + lines[i].substring(index);
                lines[i] = lines[i].substring(0, index) + "," + lines[i].substring(index);
                tdata.push(lines[i].split(','));
            }
        }
    }else{
        tdata.push([""]);
    }

    // console.log("tdata struct");
    // console.log(tdata);

    bookPreorder.mytable.loadData(tdata);
    $("#edittable tr th:eq(0)").css("width","500px");
    $("#edittable tr th:eq(1)").css("width","120px");
    $("#edittable tr th:eq(2)").css("width","120px");
    $("#edittable tr th:eq(3)").css("width","130px");
    $("#edittable tr th:eq(4)").css("width","50px");
    $("#edittable tr th:eq(5)").css("width","40px");
    $("#edittable tr th:eq(6)").css("width","60px");
    CountOrderPrice();
}

function fixdata(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
    return o;
}

var xlf = document.getElementById('xlf');
if(xlf !== null) {
    if (xlf.addEventListener) xlf.addEventListener('change', handleFile, false);
}

function handleFile(e) {
//        rABS = document.getElementsByName("userabs")[0].checked;
//        use_worker = document.getElementsByName("useworker")[0].checked;
    var rABS = false;
    var use_worker = false;
    var files = e.target.files;
    var f = files[0];
    {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function(e) {
//                if(typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker);
            var data = e.target.result;
            if(use_worker) {
                xw(data, process_wb);
            } else {
                var wb;
                if(rABS) {
                    wb = X.read(data, {type: 'binary'});
                } else {
                    var arr = fixdata(data);
                    wb = X.read(btoa(arr), {type: 'base64'});
                }
                process_wb(wb);
            }
        };
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);

        //用于清除当前的文件名称防止系统不处理相同的文件
        e.target.value=''
    }
}

//output xls
function datenum(v, date1904) {
    if(date1904) v+=1462;
    var epoch = Date.parse(v);
    // return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    return (epoch - new Date(Date.UTC(1899, 11, 29))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
    var ws = {};
    var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
    for(var R = 0; R != data.length; ++R) {
        for(var C = 0; C != data[R].length; ++C) {
            if(range.s.r > R) range.s.r = R;
            if(range.s.c > C) range.s.c = C;
            if(range.e.r < R) range.e.r = R;
            if(range.e.c < C) range.e.c = C;
            var cell = {v: data[R][C] };
            if(cell.v == null) continue;
            var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

            // if(typeof cell.v === 'number') cell.t = 'n';
            if(typeof cell.v === 'number'){
                if(cell.v.toString().length > 9)
                    cell.t = 's';
                else
                    cell.t = 'n';
            }
            else if(typeof cell.v === 'boolean') cell.t = 'b';
            else if(cell.v instanceof Date) {
                cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            }
            else if(cell.v.substring(0,2) === "20" && cell.v.substring(4,5) === "/") {
                cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            }
            else cell.t = 's';

            cell.s ={ color: "red"};
            ws[cell_ref] = cell;
        }
    }
    if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

function generateArray(table) {
    var out = [];
    var rows = table.querySelectorAll('tr');
    var ranges = [];
    for (var R = 0; R < rows.length; ++R) {
        var outRow = [];
        var row = rows[R];
        var columns = row.querySelectorAll('td');
        for (var C = 0; C < columns.length; ++C) {
            var cell = columns[C];
            var colspan = cell.getAttribute('colspan');
            var rowspan = cell.getAttribute('rowspan');
            var cellValue = cell.innerText;
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

function generateArrayWithHead(table) {
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
        //最后一列不导出
        for (var C = 0; C < columns.length - 1; ++C) {
            var cell = columns[C];
            var colspan = cell.getAttribute('colspan');
            var rowspan = cell.getAttribute('rowspan');
            var cellValue = cell.innerText;
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
            }

            //Handle Value
            outRow.push(cellValue !== "" ? cellValue : null);

            //Handle Colspan
            if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
        }
        out.push(outRow);
    }
    return [out, ranges];
}

function generateArrayFromEditTable(table) {
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
        for (var C = 0; C < columns.length - 1; ++C) {
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

function Workbook() {
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function GeneralXLS(){
    /* original data */
    // var data = [[1,2,3],[true, false, null, "中文"],["中文1","bar",new Date("2014-02-19T14:30Z"), "0.3"], ["baz", null, "qux"]]
    var data;
    var ws_name = "文献预定";

    var theTable = document.getElementById("edittable");
    console.log("getTabel");
    var oo = generateArrayFromEditTable(theTable);
    data = oo[0];
    var bookseller = $("#supplier").find("option:selected").text();
    // var orderdate = $("#preorderdate").datebox("getValue").replace("-","/").replace("-","/");
    var orderdate = $("#preorderdate").val().replace("-","/").replace("-","/");
    var alltable = [[null,null,"图书馆图书预订单"],[null],["供应商：",bookseller],["预订日期：",orderdate]];
    var nt = alltable.concat(data);
    var wb = new Workbook(), ws = sheet_from_array_of_arrays(nt);
    var ranges = oo[1];

    /* add ranges to worksheet */
    ws['!merges'] = ranges;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:false, type: 'binary'});

    var now = new Date().format("yyyyMMdd-hhmmss");
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "文献预定单" + now + ".xlsx");
    // var _gaq = _gaq || [];
    // _gaq.push(['_setAccount', 'UA-36810333-1']);
    // _gaq.push(['_setDomainName', 'sheetjs.com']);
    // _gaq.push(['_setAllowLinker', true]);
    // _gaq.push(['_trackPageview']);
    //
    // (function() {
    //     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    //     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    //     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    // })();
}

function GeneralSearchOrderXLS(){
    /* original data */
    // var data = [[1,2,3],[true, false, null, "中文"],["中文1","bar",new Date("2014-02-19T14:30Z"), "0.3"], ["baz", null, "qux"]]
    var data;
    var ws_name = "文献预定查询结果";

    var theTable = document.getElementById("edittable");
    console.log("getTabel");
    var oo = generateArrayWithHead(theTable);
    data = oo[0];
    // var bookseller = $("#supplier").find("option:selected").text();
    // var orderdate = $("#preorderdate").datebox("getValue").replace("-","/").replace("-","/");
    // var alltable = [[null,null,"图书馆图书预订单"],[null],["供应商：",bookseller],["预订日期：",orderdate]];
    // var nt = alltable.concat(data);
    var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);
    var ranges = oo[1];

    /* add ranges to worksheet */
    ws['!merges'] = ranges;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:false, type: 'binary'});

    var now = new Date().format("yyyyMMdd-hhmmss");
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "文献预定查询结果" + now + ".xlsx");
    // var _gaq = _gaq || [];
    // _gaq.push(['_setAccount', 'UA-36810333-1']);
    // _gaq.push(['_setDomainName', 'sheetjs.com']);
    // _gaq.push(['_setAllowLinker', true]);
    // _gaq.push(['_trackPageview']);
    //
    // (function() {
    //     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    //     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    //     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    // })();
}

