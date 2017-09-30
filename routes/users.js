var express = require('express');
var router = express.Router();
var tmpLoginJson = require('../config/tmpLoginJson.json');
var request = require('request');
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res){
  var options = {
      method: 'POST',
      url: 'https://klas.khu.ac.kr/user/loginUser.do',
      headers:{
          'content-type': 'application/json' },
      body:JSON.stringify(tmpLoginJson)
  };
  console.log(JSON.stringify(tmpLoginJson));
  var req1 = request(options);
   req1.on('response', function (res1) {
       var output = "";

       res1.on('data', function (chunk) {
           output += iconv.convert(chunk).toString('UTF-8');
       });

       res1.on('end', function () {
           console.log(output);
           res.send(output);
       });
   });

})

module.exports = router;
