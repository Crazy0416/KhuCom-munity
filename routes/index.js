var express = require('express');
var router = express.Router();
var moment = require('moment');

// show server time
router.use(function(req, res, next){
    console.log('/index : ' + moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  var sendData = {}
  if(req.session.username)
      sendData.mem_username = req.session.username;
  else
      sendData.mem_username = null;

  if(req.session.loginFail){
      // TODO : 로그인 실패 시 onload 시 alert 띄우게 하기
      req.session.loginFail = undefined;
  }

  res.render('index', sendData);
});

router.get('/base', function(req, res, next) {
  res.render('base', { title: 'Express' });
});

module.exports = router;
