var express = require('express');
var router = express.Router();
var request = require('request');
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');
var moment = require('moment');

// show server time
router.use(function(req, res, next){
    console.log(moment().format());
    next();
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/login', function(req, res){
    var cookie = {};
    var id = req.body.id;
    var password = req.body.password;
    var LoginData = "user_id="+ id +"&password="+ password + "&RequestData=";
    var options = {
        url: 'https://khuis.khu.ac.kr/java/servlet/khu.cosy.login.loginCheckAction',
        port: 80,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: LoginData
    };

  console.log("id password" + id + " " + password);
  var reqKHU = request(options);
  reqKHU.on('response', function (res1) {
      res1.on('end', function () {
          setCookie(res1.headers["set-cookie"], cookie);
          console.log("cookie : " + res1.headers["set-cookie"]);

          var options = {
              url: 'https://khuis.khu.ac.kr/java/servlet/controllerCosy?' +
              'action=19&menuId=hsip&startpage=start',
              method: 'GET',
              headers: {
                  'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                  'Accept-Encoding': 'gzip, deflate, br',
                  'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4',
                  'Connection' : 'keep-alive',
                  'Host' : 'khuis.khu.ac.kr',
                  'Referer' : 'https://khuis.khu.ac.kr/java/servlet/khu.cosy.login.loginCheckAction',
                  'Upgrade-Insecure-Requests': 1,
                  'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Whale/0.10.36.20 Safari/537.36',
                  'Cookie' : getCookie(cookie)
              }
          };
          var req2 = request(options);
          req2.on('response', function(res2){
              res2.setEncoding('utf8');
              var output;
              res2.on('data', function(chuncked){
                  output += chuncked;
              })

              res2.on('end',function(){
                  var nameIndex = output.indexOf('사용자 : ');
                  var name = output.substr(nameIndex+6, 4);
                  var StudentID = findStudentIdCookie(cookie);
                  if(!StudentID)
                      res.send("로그인 오류");
                  else
                      res.send("사용자 : " + name + "\n학번 : "+ StudentID);
                  console.log("사용자는? " + name);
                  console.log("학번 : " + StudentID);

              })
          })

      });
  });
});

function setCookie(cookies, cookie) {
    for (var i in cookies) {
        var c = cookies[i];
        var tokens = c.split(";");
        for (var j in tokens) {
            var t = tokens[j].trim();
            var tt = t.split("=");
            cookie[tt[0]] = tt[1];
        }
    }
}
function getCookie(cookie) {
    var str = "";
    for (var i in cookie) {
        str += i + "=" + cookie[i] + "; ";
    }
    return str;
}

function findStudentIdCookie(cookie){
    var str = "";
    for (var i in cookie) {
        if(i === 'USER_ID')
            str = cookie[i];
    }
    return str;
}

module.exports = router;
