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

  res.render('index', sendData);
});

router.get('/base', function(req, res, next) {
  res.render('base', { title: 'Express' });
});

module.exports = router;
