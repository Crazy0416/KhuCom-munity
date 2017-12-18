var express = require('express');
var router = express.Router();
var moment = require('moment');
var mysqlConnection = require('mysql');
var searchWordCount = require('../modules/seachWordCount')

// config file
var mysql_config = require('../config/db_config.json');
// mysql config tab
var mysql = mysqlConnection.createConnection(mysql_config);

// show server time
router.use(function(req, res, next){
    console.log('/index : ' + moment().format());
    next();
})

router.get('/cloud', function(req, res, next){
    res.sendFile(__dirname+'/testcloud.html');
})

/*
 *  GET search post
 *  */
router.get('/search', function(req, res, next){
    var sendData = {};
    var search = req.query.search;
    var searchWord = search.split(' ');
    for(word in searchWord){
        if(typeof searchWordCount.listObj[word] !== "undefined"){
            searchWordCount.listObj[word]++;
        }
        else
            searchWordCount.listObj[word] = 1;
    }

    if(req.query.pageCnt)
        pageCnt= req.query.pageCnt;
    else
        pageCnt= 1;

    mysql.query('SELECT post_num, post_title, post_username, post_register_datetime, post_hit ' +
        ' FROM Post WHERE post_title LIKE ? ORDER BY post_num DESC LIMIT ?,?', ["%"+search+"%", (pageCnt-1)*10, 10], function (err, result, fields) {
        if(req.session.username)
            sendData.mem_username = req.session.username;
        else
            sendData.mem_username = null;
        if(err){
            res.render('search', sendData);
        }
        console.log("result : " + JSON.stringify(result));
        sendData.searchPost = result;

        res.render('search', sendData);
    })
})

/* GET home page. */
router.get('/', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;
  mysql.query('SELECT Post_file.pfi_filename ' +
      ' FROM Post INNER JOIN Post_file WHERE Post.Board_brd_id=? AND Post.post_id=Post_file.Post_post_id ORDER BY Post.post_num DESC LIMIT ?,?', [3, 0, 6], function (err, result, fields) {
      if(req.session.username)
          sendData.mem_username = req.session.username;
      else
          sendData.mem_username = null;
      if(err){
          sendData.indexPhotoList = null;
      }
      if(req.query.alertMessage){
          console.log("alert!! in page : " + req.query.alertMessage);
          sendData.alertMessage = req.query.alertMessage;
      }
      console.log("result : " + JSON.stringify(result));
      sendData.indexPhotoList = result;
      if(req.session.level === 4){
          sendData.circleRegisterList = [];
          mysql.query('SELECT Circle_Regi_Holder.Circle_circle_id ,Circle_Regi_Holder.Member_mem_id, Member.mem_username, Circle_Regi_Holder.crh_register FROM Circle_Regi_Holder INNER JOIN Member WHERE Member.mem_id=Circle_Regi_Holder.Member_mem_id AND Circle_Regi_Holder.Circle_circle_id=?', req.session.circle, function(err, result, fields){
              console.log('GET / SELECT : ' + JSON.stringify(result));
              sendData.circleRegisterList = result;
              if(req.query.alertMessage){
                  console.log("alert!! in page : " + req.query.alertMessage);
                  sendData.alertMessage = req.query.alertMessage;
              }
              res.render('index', sendData);
          })
      }else {
          if(req.query.alertMessage){
              console.log("alert!! in page : " + req.query.alertMessage);
              sendData.alertMessage = req.query.alertMessage;
          }

          res.render('index', sendData);
      }
  })
});

router.get('/base', function(req, res, next) {

    res.render('base', { title: 'Express' });
});

module.exports = router;
