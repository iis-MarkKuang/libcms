/**
 * Created by Administrator on 2016/3/15.
 */
function getBasePath()
{
    var obj=window.location;
    var contextPath=obj.pathname.split("/")[1];
    var basePath=obj.protocol+"//"+obj.host+"/"+contextPath;
    return basePath;
}

function getRootPath()
{
    var obj=window.location;
    var basePath=obj.protocol+"//"+obj.host;
    return basePath;
}

function isMobileDevice()
{
    if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i))
    {
        return true;
    }
    else
        return false;
}

function checkInputDate(sdate){
    var   strDate=sdate;
    var  re =/^(\d{4})-(\d{2})-(\d{2})$/;
    if(re.test(strDate))//判断日期格式符合YYYY-MM-DD标准
    {
        var   dateElement=new   Date(RegExp.$1,parseInt(RegExp.$2,10)-1,RegExp.$3);
        if(!((dateElement.getFullYear()==parseInt(RegExp.$1))&&((dateElement.getMonth()+1)==parseInt(RegExp.$2,10))&&(dateElement.getDate()==parseInt(RegExp.$3))))//判断日期逻辑
        {
            return false;
        }
    }
    else
    {
        return false;
    }
    return true;
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt)
{ //author: meizz
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

var EventUtil = {
    addHandler:function(elem,type,handler){
        if(elem.addEventListener)
        {
            elem.addEventListener(type,handler,false);
        }else if(elem.attachEvent)
        {
            elem.attachEvent("on"+type,handler);
        }else
        {
            elem["on"+type]=handler;
        }
    },
    removeHandler:function(elem,type,handler){
        if(elem.removeEventListener)
        {
            elem.removeEventListener(type,handler,false);
        }else if(elem.detachEvent)
        {
            elem.detachEvent("on"+type,handler);
        }else
        {
            elem["on"+type]=null;
        }
    },
    getEvent:function(event){
        return event?event:window.event;
    },
    getTarget:function(event){
        return event.target||event.srcElement;
    },
    preventDefault:function(event){
        if(event,preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false;
        }
    },
    stopPropagation:function(event){
        if(event.stopPropagation){
            event.stopPropagation();
        }else{
            event.cancelBubble=true;
        }
    }

};

Function.prototype.getName = function(){
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
};

function getFuncName(_callee) {
    var _text = _callee.toString();
    var _scriptArr = document.scripts;
    for (var i=0; i<_scriptArr.length; i++) {
        var _start = _scriptArr[ i].text.indexOf(_text);
        if (_start != -1) {
            if (/^functions*(.*).*rn/.test(_text)) {
                var _tempArr = _scriptArr[ i].text.substr(0, _start).split('rn');
                return _tempArr[_tempArr.length - 1].replace(/(var)|(s*)/g, '').replace(/=/g, '');
            } else {
                return _text.match(/^functions*([^(]+).*rn/)[1];
            }
        }
    }
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

