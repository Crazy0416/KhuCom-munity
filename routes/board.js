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
  res.render('board');
});

router.get('/photo', function(req, res, next) {
  res.render('photo');
});


module.exports = router;
