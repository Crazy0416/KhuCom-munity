var express = require('express');
var router = express.Router();
var request = require('request');
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');
var moment = require('moment');
var session = require('express-session');
var cheerio = require('cheerio');
var mysql = require('mysql-promise')();
var bkfd2Password = require('pbkdf2-password');         // Member password 암호화 모듈
var hasher = bkfd2Password();

// config file
var mysql_config = require('../config/db_config.json');


// mysql config tab
mysql.configure(mysql_config);

// show server time
router.use(function(req, res, next){
    console.log('/user : ' + moment().format());
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
            //console.log("cookie : " + res1.headers["set-cookie"]);

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
                    //console.log(output);
                    var $ = cheerio.load(output);
                    try{
                        var Mem_name = $('#GNB-student').first().text().split('님')[0].split(':')[1].substr(1);
                        var Mem_Company = $('#GNB-student').find('p').eq(1).text().split(':')[1].substr(1);
                    }catch(err){
                        console.log('ERR!!! :  ' + err);
                    }
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
                                'name':Mem_name,
                                'company': Mem_Company
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

/* GET users listing. */
router.get('/register', function(req, res, next) {
  if(req.session){
      res.render('register', {
          "mem_username" : req.session.username
      });
  }else {
      res.render('register', {
          "mem_username" : null
      });
  }

});

router.post('/authentication', function(req, res, next){
    var khuis_id = req.body['khuis_id'];
    var khuis_pw = req.body['khuis_pw'];
    checkKhuMember(khuis_id, khuis_pw, function(json){
        var resJson = json;
        if(resJson.SUCCESS === 1){      // 종정시에 아이디가 있는 경우]
            console.log('종정시 인증 id : '+ resJson['DATA']['name'] + ' 이름 : ' + resJson['DATA']['name'] + ' 소속 : ' + resJson['DATA']['company']);
            req.session.authen = 1;             // 경희대 인증하지 않았다면 서버에서 register 불가
            req.session.khuis_id = khuis_id;
            req.session.name = resJson['DATA']['name'];
            req.session.company = resJson['DATA']['company'];
            res.send(json);
        }else{                          // 종정시에 아이디가 없는 경우
            console.log('종정시 인증 실패 : ' + resJson['ERR_CODE']);
            req.session.authen = 0;
            res.send(json);
        }
    })

})

/* POST Member data, Register Member */
router.post('/register', function(req,res, next){
    if(req.session.authen === 1){       // 종정시 인증 했다면
        var resJson = req.body;
        /* DB에 저장할 Member의 컬럼들 */
        var userId = resJson.userid;
        var userKhuis_id = req.session.khuis_id;
        var userPw = resJson.password;
        var userName = req.session.name;
        var userNickname = resJson.nickname;
        var userLevel;
        var userEmail = resJson.mail;
        var userGender = (resJson.gender == "male") ? 0 : 1;
        var registerTime = moment().format('YYYY/MM/DD HH:mm:ss');
        console.log('register 회사 : ' + req.session.company)
        if(req.session.company.indexOf('전자정보대학 컴퓨터공학과') >= 0)
            userLevel = 3;
        else
            userLevel = 2;
        // Password Encrytion 패스워드 암호화, pbkdf2-password 모듈
        hasher({password: userPw}, function(err, pass, salt, hash) {
            mysql.query('INSERT INTO Member ' +
                '(mem_userid, mem_password, mem_pwsalt, mem_username, mem_nickname, mem_level, mem_email, mem_register_datetime, mem_gender, mem_khuisId)' +
                'values (?,?,?,?,?,?,?,?,?,?)',
                [userId, hash, salt, userName, userNickname, userLevel, userEmail, registerTime, userGender, userKhuis_id])
                .then(function(rows){
                    console.log(rows);
                    req.session.authen = undefined; req.session.khuis_id = undefined; req.session.name = undefined; req.session.company = undefined;
                    // TODO : redirect 홈페이지, response 정의
                    res.redirect('/');
                })
                .catch(function(err){   // TODO: 오류 처리
                    console.log(err);
                    console.log('redirect to :' + req.protocol + '://' + req.get('host') + '/index')
                    res.send({
                        "SUCCESS" : 0,
                        "ERR_CODE" : 'DB 에러',
                        'url' : req.protocol + '://' + req.get('host') + '/index'
                    });
                })
        })
    }else {
        console.log('종정시에 인증하지 않았음');
        console.log('redirect to :' + req.protocol + '://' + req.get('host') + '/index')
        res.send({
            "SUCCESS" : 0,
            "ERR_CODE" : '종정시에 인증이 되지 않았습니다.',
            'url' : req.protocol + '://' + req.get('host') + '/index'
        })
    }

})

router.get('/login', function(req, res, next) {
    res.render('login', {
        "mem_username" : req.session.username
    });
});

router.post('/login', function(req, res, next){
    // TODO: 로그인 후 세션 생성, 로그인 후 홈페이지 작동 방식 구상(ajax? 정적 웹사이트?)
    var id = req.body.userid + "";
    var password = req.body.password;
    console.log("id : " + id + " " + "p? : " + password);
    mysql.query('SELECT * FROM Member WHERE mem_userid=?', id)
        .then(function(rows){
            console.log(rows[0]);
            console.log(rows[0][0]);
            console.log("mem_p : "+rows[0][0]['mem_password']);
            hasher({password:password, salt:rows[0][0]['mem_pwsalt']}, function(err, pass, salt, hash){
                console.log('db password : ' + rows[0][0]['mem_password']);
                console.log('hash : ' + hash);
                console.log('password: '+ pass);
                console.log("session id : " + req.session.Id);
                if(hash === rows[0][0]['mem_password'] && (typeof req.session.Id === "undefined")){
                    // session 설정
                    req.session.Id = id;
                    req.session.username = rows[0][0]['mem_username'];
                    req.session.nickname = rows[0][0]['mem_nickname'];
                    req.session.level = rows[0][0]['mem_level'];
                    req.session.email = rows[0][0]['mem_email'];
                    req.session.mem_id = rows[0][0]['mem_id'];
                    req.session.circle = rows[0][0]['Circle_circle_id'];
                    console.log(req.session);
                    res.redirect('/');
                }
                else if(hash !== rows[0][0]['mem_password']){    // TODO: 세션이 이미 존재하는 경우 => 로그인 되어 있는 경우
                    res.redirect('/?alertMessage=' + '비밀번호가 틀렸습니다.');
                } else if(typeof req.session.Id !== "undefined"){   // TODO: 비밀번호 틀렸을 경우 작동 방식 구상
                    res.redirect('/?alertMessage=' + '이미 로그인 되어있습니다.');
                }
            })
        })
        .catch(function(err){   // TODO: 오류 처리
            console.log(err);
            res.redirect('/?alertMessage=' + '아이디가 존재하지 않습니다.');
        })
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(){
    req.session;
  });

  res.redirect('/');
});

module.exports = router;
