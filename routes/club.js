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
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = null;

  res.render('club', sendData);
});

router.post('/register/:clubname', function(req, res, next){
    var clubname = req.params['clubname'];
    try{
        mysql.query('SELECT circle_id FROM Circle WHERE circle_name=?', clubname, function(err, result, fields){
            if(err){
                throw err;
            }else{
                if(req.session.mem_id){
                    mysql.query('INSERT INTO Circle_Regi_Holder (Circle_circle_id, Member_mem_id) Values (?,?)', [result[0]['circle_id'], req.session.mem_id], function(err1, result1, fields1){
                        if(err1){
                            throw err1;
                        }else {
                            console.log(JSON.stringify(result1))
                            // TODO : 성공했을 때 뭐?
                            res.redirect('/club' + '/?alertMessage=' + '등록 성공!!!');
                        }
                    })
                }
                else{
                    res.redirect('/club' + '/?alertMessage=' + '로그인이 필요합니다.');
                }
            }
        })
    } catch (err){
        console.log(err);
        res.send('')
    }
})

router.get('/request', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = null;

  res.render('club_request', sendData);
});

router.get('/tgwing', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = null;

  res.render('tgwing', sendData);
});

router.get('/net', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = null;

  res.render('net', sendData);
});

module.exports = router;
