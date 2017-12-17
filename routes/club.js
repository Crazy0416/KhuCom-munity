var express = require('express');
var router = express.Router();
var moment = require('moment');
var mysqlConnection = require('mysql')
    // config file
    ,mysql_config = require('../config/db_config.json')
    // mysql config tab
    ,mysql = mysqlConnection.createConnection(mysql_config);

// show server time
router.use(function(req, res, next){
    console.log('/club : ' + moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;

  if(req.query.alertMessage){
      console.log("alert!! in page : " + req.query.alertMessage);
      sendData.alertMessage = req.query.alertMessage;
  }

  res.render('club', sendData);
});

router.post('/register/:clubname', function(req, res, next){
    var mysqlConnection = require('mysql')
        // config file
        ,mysql_config = require('../config/db_config.json')
        // mysql config tab
        ,mysql = mysqlConnection.createConnection(mysql_config);
    mysql.connect(function(err){
        var clubname = req.params['clubname'];
        mysql.query('SELECT circle_id FROM Circle WHERE circle_name=?', clubname, function(err, result, fields){
            if(err){
                console.log('POST /register/:clubname SELECT ERR : '+ err);
                res.redirect('/club' + '/?alertMessage=' + '디비 에러!!');
            }else{
                if(req.session.mem_id && req.session.level !== 2){
                    console.log('POST /register/:clubname SELECT result : ' + JSON.stringify(result))
                    mysql.query('INSERT INTO Circle_Regi_Holder (Circle_circle_id, Member_mem_id) Values (?,?)', [result[0]['circle_id'], req.session.mem_id], function(err1, result1, fields1){
                        if(err1){
                            console.log("POST /register/:clubname INSERT ERR : " + err1);
                            if(err1.toString().indexOf('ER_DUP_ENTRY'))
                                res.redirect('/club' + '/?alertMessage=' + '이미 신청 중입니다.');
                            else
                                res.redirect('/club' + '/?alertMessage=' + '서버에 문제가 생겼습니다.');
                        }else {
                            console.log(JSON.stringify(result1))
                            // TODO : 성공했을 때 뭐?
                            res.redirect('/club' + '/?alertMessage=' + '등록 성공!!!');
                        }
                    })
                } else if(req.session.circle){
                    res.redirect('/club' + '/?alertMessage=' + '이미 동아리에 가입 되었습니다.');
                } else{
                    res.redirect('/club' + '/?alertMessage=' + '컴공과가 아니거나 로그인이 필요합니다.');
                }
            }
        })
    })
})

router.get('/request', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;

  res.render('club_request', sendData);
});

router.get('/tgwing', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;

  res.render('tgwing', sendData);
});

router.get('/net', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;

  res.render('net', sendData);
});

module.exports = router;
