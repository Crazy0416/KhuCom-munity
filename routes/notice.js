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

router.post('/stu/write', function(req, res, next) {
    console.log(0);

    console.log(1);
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
