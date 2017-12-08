var express = require('express');
var router = express.Router();
var moment = require('moment');

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
