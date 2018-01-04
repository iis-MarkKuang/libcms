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

function process_wbWQ(wb) {
    var output = "";
    output = to_csv(wb);
    goutput = output;
    var lines = output[0].split('\n');
    var tdata = [];
    var index;
    if(lines[5].split(',')[0].length > 0) {
        for (var i = 5; i < lines.length; i++) {
            if (lines[i].length > 10) {
                index = lines[i].lastIndexOf(',');
                lines[i] = ","+lines[i].substring(0, index) +  lines[i].substring(index);
                tdata.push(lines[i].split(','));
            }
        }
    }else{
        tdata.push([""]);
    }

    mytable.loadData(tdata);
    $("#edittable tr th:eq(0)").css("width","20px");
    $("#edittable tr th:eq(1)").css("width","100px");
    $("#edittable tr th:eq(2)").css("width","40px");
    $("#edittable tr th:eq(3)").css("width","300px");
    $("#edittable tr th:eq(4)").css("width","100px");
    $("#edittable tr th:eq(5)").css("width","500px");
    $("#edittable tr th:eq(6)").css("width","100px");
    $("#edittable tr th:eq(7)").css("width","70px");
    $("#edittable tr th:eq(8)").css("width","130px");
    $("#edittable tr th:eq(9)").css("width","180px");
    $("#edittable tr th:eq(10)").css("width","130px");
    $("#edittable tr th:eq(11)").css("width","130px");
    //re = output.split(',');
    //console.log("output = " + output);
//        if(out.innerText === undefined) out.textContent = output;
//        else out.innerText = output;
//        if(typeof console !== 'undefined') console.log("output", new Date());
}

function fixdata(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
    return o;
}

var xlf = document.getElementById('xlf');

function handleFileWQ(e) {
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
                xw(data, process_wbWQ);
            } else {
                var wb;
                if(rABS) {
                    wb = X.read(data, {type: 'binary'});
                } else {
                    var arr = fixdata(data);
                    wb = X.read(btoa(arr), {type: 'base64'});
                }
                process_wbWQ(wb);
            }
        };
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);

        //用于清除当前的文件名称防止系统不处理相同的文件
        e.target.value=''
    }
}

if(xlf.addEventListener) xlf.addEventListener('change', handleFileWQ, false);
