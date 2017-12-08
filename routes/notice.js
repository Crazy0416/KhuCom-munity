var http = require('http');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var mysql = require('mysql-promise')();


// config file
var mysql_config = require('../config/db_config.json');
// mysql config tab
mysql.configure(mysql_config);

// show server time
router.use(function(req, res, next){
    console.log('/notice : ' + moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
    var sendData = {}
    if(req.session.username)
        sendData.mem_username = req.session.username;
    else
        sendData.mem_username = "[로그인 필요]";
    res.render('notice', sendData);
});

router.get('/stu', function(req, res, next) {
    var sendData = {}
    if(req.session.username)
        sendData.mem_username = req.session.username;
    else
        sendData.mem_username = "[로그인 필요]";
    res.render('stu-notice', sendData);
});

router.get('/stu/write', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;
  res.render('stu-notice_write', sendData);
});

function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

router.post('/stu/write', function(req, res, next) {1

    mysql.query('SELECT brd_count FROM Board WHERE brd_id=?', 1)    // 학생회 공지사항 Board 정보 가져옴
        .then(function(rows){
            var post_num = rows[0][0]['brd_count'] + 1;
            var post_title = "임의의 글" + post_num;
            var post_mem_id = req.session.mem_id;
            var post_content = req.body['msg'];
            var post_username = req.session.username;
            var post_nickname = req.session.nickname;
            var registerTime = moment().format('YYYY/MM/DD HH:mm:ss');
            return mysql.query('INSERT INTO Post (Board_brd_id, Member_mem_id, post_num, post_title, post_content, post_username, post_nickname, post_register_datetime, post_hit, post_comment_count, post_file, post_image, post_blame, post_del) '
            + 'Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[1, post_mem_id, post_num, post_title, post_content, post_username, post_nickname, registerTime, 0, 0, null, null, null, null]);
        })
        .then(function (rows) {
            console.log("Stu Write INSERT Success!! : " + JSON.stringify(rows));
            res.send({
                'SUCCESS' : 1,
                'url' : req.protocol + '://' + req.get('host') + '/notice/stu'
            })
        })
        .catch(function (err) {
            res.send({
                'SUCCESS' : 0,
                'url' : req.protocol + '://' + req.get('host') + '/notice/stu'
            })
        })

});

module.exports = router;
