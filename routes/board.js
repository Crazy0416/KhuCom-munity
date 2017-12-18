var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path')
var mysqlConnection = require('mysql')
    // config file
    ,mysql_config = require('../config/db_config.json')
    // mysql config tab
    ,mysql = mysqlConnection.createConnection(mysql_config);
var multer = require('multer')
var _storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../public/img/photo/large/'))
        },
        filename: function(req, file, cb){
            cb(null, Date.now() + '-' + file.originalname)
        }
    })
var upload = multer({storage : _storage})
//////////////////////////////////////////

// show server time
router.use(function(req, res, next){
    console.log('/board : ' + moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;

  res.render('board', sendData);
});

router.get('/photo', function(req, res, next) {
  if(req.query.pageCnt)
      pageCnt= req.query.pageCnt;
  else
      pageCnt= 1;
  var sendData = {}

  mysql.query('SELECT Post_file.pfi_filename ' +
      ' FROM Post INNER JOIN Post_file WHERE Post.Board_brd_id=? AND Post.post_id=Post_file.Post_post_id ORDER BY Post.post_num DESC LIMIT ?,?', [3, (pageCnt-1)*10, 8], function (err, result, fields) {
      if(req.session.username)
          sendData.mem_username = req.session.username;
      else
          sendData.mem_username = null;
      if(err){
          res.render('photo', sendData);
      }
      if(req.query.alertMessage){
          console.log("alert!! in page : " + req.query.alertMessage);
          sendData.alertMessage = req.query.alertMessage;
      }
      console.log("result : " + JSON.stringify(result));
      sendData.photoList = result;

      res.render('photo', sendData);
  })
});

// TODO : 사진 파일 하나만 왔을 때 가정.. 여러개 전달될 때 생각해야함
router.post('/photo', upload.any(), function(req, res, next){
    console.log("files: " + JSON.stringify(req.files))
    console.log("body: " + JSON.stringify(req.body))

    if(req.session.username){
        mysql.query('SELECT brd_count FROM Board WHERE brd_id=?', 3, function (err, result, fields) {
            console.log('POST /stu/write SELECT ok : ' + JSON.stringify(result));
            var post_num = result[0]['brd_count'] + 1;
            console.log('post_num : ' + post_num);
            var post_title = req.body.title;
            var post_mem_id = req.session.mem_id;
            console.log('post_mem_id : '+ post_mem_id)
            var post_content = null;
            var post_username = req.session.username;
            console.log('post_username : '+ post_username)
            var post_nickname = req.session.nickname;
            console.log('post_nickname : '+ post_nickname)
            var registerTime = moment().format('YYYY/MM/DD HH:mm:ss');
            var f_originname = req.files[0].originalname;
            console.log('f_originname : '+ f_originname)
            var f_name = req.files[0].filename;
            console.log('f_name : '+ f_name)
            var f_size = req.files[0].size;
            console.log('f_size : '+ f_size)
            var f_type = req.files[0].mimetype;
            console.log('f_type : '+ f_type)
            var f_is_img = 1;
            var width = 0;
            var height = 0;
            mysql.beginTransaction(function (err) {
                if(err) {throw err;}
                mysql.query('INSERT INTO Post (Board_brd_id, Member_mem_id, post_num, post_title, post_content, post_username, post_nickname, post_register_datetime, post_hit, post_comment_count, post_file, post_image, post_blame, post_del) '
                    + 'Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[3, post_mem_id, post_num, post_title, post_content, post_username, post_nickname, registerTime, 0, 0, null, null, 1, null]
                    , function(err, result, fields){
                        if (err) {
                            return mysql.rollback(function() {
                                throw err;
                            });
                        }
                        console.log('POST /board/photo INSERT ok : ' + JSON.stringify(result));
                        mysql.query('UPDATE Board SET brd_count=brd_count+1 WHERE brd_id=?', 1, function (err1, result1, fields1) {
                            if (err1) {
                                return mysql.rollback(function() {
                                    throw err1;
                                });
                            }
                            console.log('POST /stu/write UPDATE ok : ' + JSON.stringify(result1));
                            console.log('RESULT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! : ' + result['insertId']);
                            mysql.query('INSERT INTO Post_file (Board_brd_id, Member_mem_id, Post_post_id, pfi_originname, pfi_filename, pfi_filesize, pfi_type, pfi_is_image, pfi_width, pfi_height, pfi_datetime) '
                                + 'VALUES (?,?,?,?,?,?,?,?,?,?,?)', [3, post_mem_id, result['insertId'], f_originname, f_name, f_size, f_type, f_is_img, width, height, registerTime], function(err2, result2, fields2){
                                if (err2) {
                                    return mysql.rollback(function() {
                                        throw err2;
                                    });
                                }
                                mysql.commit(function (err2) {
                                    if(err2){
                                        return mysql.rollback(function () {
                                            throw err2;
                                        })
                                    }
                                    console.log('POST /stu/write TRANSACTION SUCCESS!!');
                                    res.redirect('/board/photo'+'/?alertMessage='+'사진등록 완료!!!');
                                })
                            })
                        })
                    });
            })
        })
    }else{
        res.redirect('/board/photo' + '/?alertMessage='+'로그인이 필요합니다.')
    }
})


module.exports = router;