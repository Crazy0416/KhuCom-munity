var express = require('express');
var router = express.Router();
var moment = require('moment');
var multer = require('multer');
var path = require('path')
var upload = multer({dest:path.join(__dirname, '../public/img/photo/large/')})

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

router.post('/photo', function(req, res, next){

})


module.exports = router;