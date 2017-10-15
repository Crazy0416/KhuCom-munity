var express = require('express');
var router = express.Router();
var moment = require('moment');

// show server time
router.use(function(req, res, next){
    console.log(moment().format());
    next();
})

/* GET home page. */
router.get('/test', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

<<<<<<< HEAD
router.get('/base', function(req, res, next) {
  res.render('base', { title: 'Express' });
});
=======
router.get('/', function(req, res, next){
    res.render('homepage');
})
>>>>>>> 6d3cc37304684302b4858e8360556b3b14d9ec50

module.exports = router;
