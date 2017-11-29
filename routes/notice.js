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
  res.render('notice');
});

router.get('/stu', function(req, res, next) {
  res.render('stu-notice');
});

router.get('/stu/write', function(req, res, next) {
  res.render('stu-notice_write');
});


module.exports = router;
