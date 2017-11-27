var request = require('request');
var cheerio = require('cheerio');
var mysqlcon = require('mysql');
// config file
var mysql_config = require('../config/db_config.json');

// mysql config tab
var mysql = mysqlcon.createConnection(mysql_config);

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
/*
mysql.query("DELETE from Post WHERE Board_brd_id=0",function (err, results, fields){
    console.log("Post table clean Okay!!");
    var pageNum = 1;

    for(pageNum = 1; pageNum <= 20; pageNum++){
        var options = {
            "url" : "http://ce.khu.ac.kr/index.php?pg=" + pageNum + "&page=list&hCode=BOARD&bo_idx=2&sfl=&stx=",
            "method" : "GET",
            "Accept":"text/html",
            "Accept-Language" : "ko-KR"
        }
        console.log("pageNum:"+pageNum);
        request(options, function(err, res, body){
            if(err){
                console.log("http://ce.khu.ac.kr request err : " + err);
            }else{
                //console.log(body);
                var $ = cheerio.load(body);
                var tbody = $('#board_list>tbody>Tr');
                tbody.each(function(i, elem){
                    var context = $(this).find('Td');
                    context.each(function(j, elem2){
                        var href;
                        if(href = $(this).find('a').attr('href'))
                            console.log(href);
                        console.log(j + ": " + $(this).text());
                    });
                    console.log('----------------')
                });
                //mysql.query('SELECT Post')
            }
        })
    }
})
 */

var _promise = function(context){
  return new Promise(function(resolve, reject){

  })
}

var pageNum = 1;

for(pageNum = 1; pageNum <= 20; pageNum++) {
    var options = {
        "url": "http://ce.khu.ac.kr/index.php?pg=" + pageNum + "&page=list&hCode=BOARD&bo_idx=2&sfl=&stx=",
        "method": "GET",
        "Accept": "text/html",
        "Accept-Language": "ko-KR"
    }
    request(options, function (err, res, body) {
        if (err) {
            console.log("http://ce.khu.ac.kr request err : " + err);
        } else {
            //console.log(body);
            var $ = cheerio.load(body);
            var tbody = $('#board_list>tbody>Tr');
            tbody.each(function (i, elem) {
                var postObj = {
                    "Board_brd_id" : 0,
                    "Member_mem_id" : 0,
                    "post_username" : "관리자",
                    "post_nickname" : "관리자",
                    "post_hit" : 0,
                    "post_comment_count" : 0
                }

                var context = $(this).find('Td');
                context.each(function (j, elem2) {
                    var href;
                    if(j == 0){
                      if($(this).text() === "[공지]")
                        return;
                      postObj.post_num = Number($(this).text());
                      console.log("num :" + postObj.post_num);
                    }else if(j == 2){ // TODO: file 처리

                    }else if(j == 4){
                      postObj.post_register_datetime = $(this).text();
                      console.log("register_datetime :" + postObj.post_register_datetime);
                      mysql.query("INSERT into Post (Board_brd_id, Member_mem_id, post_num, post_title, post_content, post_username, post_nickname, post_register_datetime, post_hit, post_comment_count) values (?,?,?,?,?,?,?,?,?,?)", [postObj.Board_brd_id, postObj.Member_mem_id, postObj.post_num, postObj.post_title, postObj.post_content, postObj.post_username, postObj.post_nickname, postObj.post_register_datetime, postObj.post_hit, postObj.post_comment_count],function(err, result, fields){
                          if(!err)
                            console.log("Insert Finish!!");
                          else {
                            console.log(err);
                          }
                        });
                    }else if (href = $(this).find('a').attr('href')){
                      postObj.post_title = $(this).text();
                      console.log("title :" + postObj.post_title);
                      var postoptions = {
                        "url" : "http://ce.khu.ac.kr/index.php" + href,
                        "Accept":"text/html",
                        "method":"GET",
                        "Accept-Language": "ko-KR"
                      }
                      request(postoptions, function(err1, res1, body1){
                        var $ = cheerio.load(body1);
                        var td = $('#board_view>tbody>tr>td').html();
                        postObj.post_content = td;
                      })
                    }
                })

            })
        }
    })
}
