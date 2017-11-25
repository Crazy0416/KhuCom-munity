var request = require('request');
var cheerio = require('cheerio');
var mysql = require('mysql-promise')();
// config file
var mysql_config = require('../config/db_config.json');

// mysql config tab
mysql.configure(mysql_config);

/*
exports.crawling = function(){
    var options = {
        "url" : "http://ce.khu.ac.kr/index.php?hCode=BOARD&bo_idx=2",
        "method" : "GET",
        "Accept":"text/html",
        "Accept-Language" : "ko-KR"
    }
    request(options, function(err, res, body){
        console.log(body);
    })
};
*/

var options = {
    "url" : "http://ce.khu.ac.kr/index.php?hCode=BOARD&bo_idx=2",
    "method" : "GET",
    "Accept":"text/html",
    "Accept-Language" : "ko-KR"
}
request(options, function(err, res, body){
    if(err){
        console.log("http://ce.khu.ac.kr request err : " + err);
    }else{
        //console.log(body);
        var $ = cheerio.load(body);
        var tbody = $('tbody>Tr');
        tbody.each(function(i, elem){
            console.log($(this).find('Td').first().text());
            console.log("-----------------");
        })
        mysql.query('SELECT Post')
    }

})