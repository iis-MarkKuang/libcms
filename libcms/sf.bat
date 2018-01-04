rem set DESIP=27.115.113.158
rem set DESPORT=40011
set DESIP=192.168.0.197
set DESPORT=22
pscp -P %DESPORT% -pw ubuntu js/catalogue.js js/DocumentManagement.js ubuntu@%DESIP%:/opt/np/libcms/web/js
pscp -P %DESPORT% -pw ubuntu js/catalogue.js js/DocumentManagement.js ubuntu@%DESIP%:/opt/libcms/js
pscp -P %DESPORT% -pw ubuntu pages/Page3_*.html ubuntu@%DESIP%:/opt/np/libcms/web/pages
pscp -P %DESPORT% -pw ubuntu pages/Page3_*.html ubuntu@%DESIP%:/opt/libcms/pages
rem pscp -P %DESPORT% -pw ubuntu css/menu.css ubuntu@%DESIP%:/opt/np/libcms/web/css
rem pscp -P %DESPORT% -pw ubuntu css/menu.css ubuntu@%DESIP%:/opt/libcms/css
pause