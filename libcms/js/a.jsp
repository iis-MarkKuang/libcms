<%--
  Created by IntelliJ IDEA.
  User: VinoMars
  Date: 2016/11/25
  Time: 17:00
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>阿法迪中小型图书馆文献信息管理系统</title>
    <meta http-equiv="Access-Control-Allow-Origin" content="*">
    <script type="text/javascript" src="/js/jquery-2.2.0.js" ></script>
    <script type="text/javascript" src="/js/jquery.easyui.min.js" ></script>
    <script type="text/javascript" src="/js/SkipPage.js"></script>
    <script type="text/javascript" src="/js/easyui-lang-zh_CN.js"></script>
    <link rel="stylesheet" type="text/css" href="/css/page.css">
    <link rel="stylesheet" type="text/css" href="/css/easyui.css">
</head>
<body>
    <table id="pg23_tb4">
        <tr style="display: block;width:100%;padding-top: 20px;">
            <td>按条件搜索：借书证号<input id="modify_barcode" type="text"/>
            </td>
        </tr>
        <tr style="display: block;width: 100%;padding-top: 20px;">
            <td style="width: 300px;text-align: center;"><button onclick="Modify_confirm()">确定</button></td>
            <td style="width: 300px;text-align: center;"><button onclick="Modify_cancel()">取消</button></td>
        </tr>
    </table>

</body>
</html>
