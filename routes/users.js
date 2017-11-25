var express = require('express');
var router = express.Router();
var request = require('request');
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');
var moment = require('moment');
var session = require('express-session');
var mysql = require('mysql-promise')();
var bkfd2Password = require('pbkdf2-password');         // Member password 암호화 모듈
var hasher = bkfd2Password();

// config file
var mysql_config = require('../config/db_config.json');


// mysql config tab
mysql.configure(mysql_config);

// show server time
router.use(function(req, res, next){
    console.log(moment().format());
    next();
})

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

// 종정시에 계정 있는지 확인하는 function
var checkKhuMember = function(r_id, r_password, callback){
    var cookie = {};
    var id = r_id;
    var password = r_password;
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
                        callback({
                            'SUCCESS' : 0,
                            'ERR_CODE': 'No data in khuis'
                        });
                    else
                        callback({
                            'SUCCESS': 1,
                            'DATA': {
                                'id':StudentID,
                                'name':name
                            }
                        });
                })
            })

        });
    });
}

/*
        Router 모듈
 */


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST Member data, Register Member */
router.post('/register', function(req,res, next){
    checkKhuMember(req.body.id, req.body.khuis_password, function(json){
        var resJson = json;
        if(resJson.SUCCESS === 0){      // 종정시에 아이디가 없는 경우
            res.json(resJson);
        }
        else{
            /* DB에 저장할 Member의 컬럼들 */
            var userId = resJson.DATA.id;
            var userName = resJson.DATA.name;
            var userNickname = req.body.nickname;
            var userLevel = req.body.level;
            var userEmail = req.body.email;
            var registerTime = moment().format('YYYY/MM/DD HH:mm:ss');

            // Password Encrytion 패스워드 암호화, pbkdf2-password 모듈
            hasher({password: req.body.password}, function(err, pass, salt, hash) {

                mysql.query('INSERT INTO Member ' +
                    '(mem_userid, mem_password, mem_pwsalt, mem_username, mem_nickname, mem_level, mem_email, mem_register_datetime)' +
                    'values (?,?,?,?,?,?,?,?)',
                    [userId, hash, salt, userName, userNickname, userLevel, userEmail, registerTime])
                    .then(function(rows){
                        console.log(rows);
                        // TODO : redirect 홈페이지, response 정의
                        res.send("finish");
                    })
                    .catch(function(err){   // TODO: 오류 처리
                        console.log(err);
                        res.send("fail");
                    })
            })
        }
    });
})


router.post('/login', function(req, res, next){
    // TODO: 로그인 후 세션 생성, 로그인 후 홈페이지 작동 방식 구상(ajax? 정적 웹사이트?)
    var id = req.body.id + "";
    var password = req.body.password;
    console.log("p? : " + password);
    mysql.query('SELECT * FROM Member WHERE mem_userid=?', id)
        .then(function(rows){
            console.log(rows[0][0]);
            console.log("mem_p : "+rows[0][0]['mem_password']);
            hasher({password:password, salt:rows[0][0]['mem_pwsalt']}, function(err, pass, salt, hash){
                console.log('db password : ' + rows[0][0]['mem_password']);
                console.log('password : ' + hash);
                if(hash === rows[0][0]['mem_password'] && !(req.session.id)){
                    // session 설정
                    req.session.id = id;
                    req.session.username = rows[0][0]['mem_username'];
                    req.session.nickname = rows[0][0]['mem_nickname'];
                    req.session.level = rows[0][0]['mem_level'];
                    req.session.email = rows[0][0]['mem_email'];

                    console.log(req.session);
                    res.send("ok!");
                }
                else if(req.session.id){    // TODO: 세션이 이미 존재하는 경우 => 로그인 되어 있는 경우
                    res.send("not ok!");
                    console.log(req.session);
                }
                else{   // TODO: 비밀번호 틀렸을 경우 작동 방식 구상
                    res.send("not not ok!");
                }
            })
        })
        .catch(function(err){   // TODO: 오류 처리

        })
});



module.exports = router;
