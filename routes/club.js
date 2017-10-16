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
  res.render('club');
});

router.get('/tgwing', function(req, res, next) {
  res.render('tgwing');
});

router.get('/net', function(req, res, next) {
  res.render('net');
});

module.exports = router;
