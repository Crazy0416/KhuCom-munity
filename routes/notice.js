var express = require('express');
var router = express.Router();
var moment = require('moment');
var mysql = require('mysql-promise');

// show server time
router.use(function(req, res, next){
    console.log(moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('notice');
});

router.get('/stu/:page_num', function(req, res, next) {
  var brdPostCnt;          // 보드 post의 총 개수
  var page_cnt;         // 페이지 총 개수
  var page_num = req.params.page_num;   // view 원하는 페이지 number\
  var data = {};
  mysql.query('SELECT brd_count FROM Board')
      .spread(function(rows){
          brdPostCnt = rows[0]['brd_count'];
          page_cnt = Math.ceil(brdPostCnt / 10);   // 올림
          // 페이지마다 어디까지 보여줄 지 확인
          return mysql.query('SELECT * FROM Post WHERE Board_brd_id=? ORDER BY post_num DESC LIMIT ?, ?', [1,(page_num-1)*10, 10]);
      })
      .spread(function(rows){
          data.data = {};
          rows.forEach(function(ele, index){
              var post = {
                  "post_title": ele.post_title,
                  "post_num" : ele.post_num,
                  "post_nickname" : ele.post_nickname,
                  "post_username" : ele.post_username,
                  "post_hit" : ele.post_hit,
                  "post_comment_count" : ele.post_comment_count,

              };
              data.data['d'+index] = post;
          })
      })
      .then(function(){
          data.page_cnt = page_cnt;
          data.page_num = page_num;
          res.render('stu-notice', data);
      })
});


module.exports = router;
