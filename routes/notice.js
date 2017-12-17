var http = require('http');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var mysqlConnection = require('mysql');

// config file
var mysql_config = require('../config/db_config.json');
// mysql config tab
var mysql = mysqlConnection.createConnection(mysql_config);


// show server time
router.use(function(req, res, next){
    console.log('/notice : ' + moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
    var sendData = {}
    var pageCnt;
    if(req.query.pageCnt)
        pageCnt= req.query.pageCnt;
    else
        pageCnt= 1;
    mysql.query('SELECT post_num, post_title, post_username, post_register_datetime, post_hit, Board_brd_id ' +
        ' FROM Post WHERE Board_brd_id=? ORDER BY post_num DESC LIMIT ?,?', [0, (pageCnt-1)*10, 10], function (err, result, fields) {
        if(req.session.username)
            sendData.mem_username = req.session.username;
        else
            sendData.mem_username = null;
        if(err){
            res.render('notice', sendData);
        }
        console.log("result : " + JSON.stringify(result));
        sendData.stuNoticePost = result;

        res.render('stu-notice', sendData);
    })
});

router.get('/stu', function(req, res, next) {
    var sendData = {};
    var pageCnt;
    if(req.query.pageCnt)
        pageCnt= req.query.pageCnt;
    else
        pageCnt= 1;
    mysql.query('SELECT post_num, post_title, post_username, post_register_datetime, post_hit, Board_brd_id ' +
        ' FROM Post WHERE Board_brd_id=? ORDER BY post_num DESC LIMIT ?,?', [1, (pageCnt-1)*10, 10], function (err, result, fields) {
        if(req.session.username)
            sendData.mem_username = req.session.username;
        else
            sendData.mem_username = null;

        if(err){
            res.render('stu-notice', sendData);
        }
        if(req.query.alertMessage){
            console.log("alert!! in page : " + req.query.alertMessage);
            sendData.alertMessage = req.query.alertMessage;
        }
        console.log("result : " + JSON.stringify(result));
        sendData.stuNoticePost = result;

        res.render('stu-notice', sendData);
    })
});

router.get('/stu/detail/brd/:brd_id/num/:idx', function(req,res, next) {
  var sendData = {}
  var post_num = req.params.idx;
  var brd_id = req.params.brd_id;

  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;

  if(req.session.loginFail){
      // TODO : 로그인 실패 시 onload 시 alert 띄우게 하기
      req.session.loginFail = undefined;
  }

  mysql.query('SELECT post_title, post_register_datetime, post_username, post_content '
            + 'FROM Post WHERE Board_brd_id=? AND post_num=?', [brd_id, post_num], function(err, result, fields){
      console.log("GET /stu/detail/brd/:brd_id/num/:idx SELECT : " + JSON.stringify(result));
      sendData.post = result[0];

      res.render('stu-notice_detail', sendData);
  })
});

router.get('/stu/write', function(req, res, next) {
  var sendData = {}

  // Check login
  if(req.session.level === 0){
      sendData.mem_username = req.session.username;
      res.render('stu-notice_write', sendData);
  }
  else{
      res.redirect('/notice/stu' + "/?alertMessage=" + "관리자가 아니거나 로그인이 필요합니다.");
  }
});

router.post('/stu/write', function(req, res, next) {
    mysql.query('SELECT brd_count FROM Board WHERE brd_id=?', 1, function (err, result, fields) {
        console.log('POST /stu/write SELECT ok : ' + JSON.stringify(result));
        var post_num = result[0]['brd_count'] + 1;
        console.log('post_num : ' + post_num);
        var post_title = "임의의 글" + post_num;
        var post_mem_id = req.session.mem_id;
        var post_content = req.body['msg'];
        var post_username = req.session.username;
        var post_nickname = req.session.nickname;
        var registerTime = moment().format('YYYY/MM/DD HH:mm:ss');
        mysql.beginTransaction(function (err) {
            if(err) {throw err;}
            mysql.query('INSERT INTO Post (Board_brd_id, Member_mem_id, post_num, post_title, post_content, post_username, post_nickname, post_register_datetime, post_hit, post_comment_count, post_file, post_image, post_blame, post_del) '
                + 'Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[1, post_mem_id, post_num, post_title, post_content, post_username, post_nickname, registerTime, 0, 0, null, null, null, null]
                , function(err, result, fields){
                    if (err) {
                        return mysql.rollback(function() {
                            throw err;
                        });
                    }
                    console.log('POST /stu/write INSERT ok : ' + JSON.stringify(result));
                    mysql.query('UPDATE Board SET brd_count=brd_count+1 WHERE brd_id=?', 1, function (err1, result1, fields1) {
                        if (err1) {
                            return mysql.rollback(function() {
                                throw err1;
                            });
                        }
                        console.log('POST /stu/write UPDATE ok : ' + result1 + '\n' + fields1);

                        mysql.commit(function (err2) {
                            if(err2){
                                return mysql.rollback(function () {
                                    throw err2;
                                })
                            }
                            console.log('POST /stu/write TRANSACTION SUCCESS!!');
                            res.send({
                                'SUCCESS' : 1,
                                'url' : req.protocol + '://' + req.get('host') + '/notice/stu'
                            })
                        })
                    })
                });
        })
    })  // TODO : 에러 핸들링
        /*
        .catch(function (err) {
            console.log('POST /stu/write : ' + err);
            res.send({
                'SUCCESS' : 0,
                'url' : req.protocol + '://' + req.get('host') + '/notice/stu'
            })
        })
        */

});

module.exports = router;
