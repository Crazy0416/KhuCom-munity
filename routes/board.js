var express = require('express');
var router = express.Router();
var moment = require('moment');

// show server time
router.use(function(req, res, next){
    console.log('/board : ' + moment().format());
    next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = null;

  res.render('board', sendData);
});

router.get('/photo', function(req, res, next) {
  var sendData = {}
  if(req.session.nickname)
      sendData.mem_username = req.session.nickname;
  else
      sendData.mem_username = null;

  res.render('photo', sendData);
});


module.exports = router;
