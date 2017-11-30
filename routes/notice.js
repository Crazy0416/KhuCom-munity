var express = require('express');
var router = express.Router();
var moment = require('moment');

// show server time
router.use(function(req, res, next){
    console.log(moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = "[로그인 필요]";
  res.render('notice', sendData);
});

router.get('/stu', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = "[로그인 필요]";
  res.render('stu-notice', sendData);
});

router.get('/stu/write', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = "[로그인 필요]";
  res.render('stu-notice_write', sendData);
});


module.exports = router;
