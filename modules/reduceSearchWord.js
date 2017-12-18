var moment = require('moment');
var searchWordCount = require('../modules/seachWordCount');
var fs = require('fs');

// TODO : Top k 20개 정도로 제한
module.exports.reduceWord = function(callback){
    var reduceList = [];
    var listObjCnt = Object.keys(searchWordCount.listObj).length;
    if (listObjCnt === 0){
        callback(reduceList);
    }
    for(key in searchWordCount.listObj){
        var dataObj = {
            'name' : key,
            'value' : searchWordCount.listObj[key]
        }
        reduceList.push(dataObj);
        console.log("dataobj : "+ JSON.stringify(dataObj));
        console.log("?? : "+ Object.keys(searchWordCount.listObj)[Object.keys(searchWordCount.listObj).length - 1]);
        if(Object.keys(searchWordCount.listObj)[Object.keys(searchWordCount.listObj).length - 1] === key) {
            callback(reduceList);
        }
    }
}

module.exports.resetWord = function(callback){
    var listObjCnt = searchWordCount.listObj.length;
    var log = "";
    for(key in searchWordCount.listObj){
        if(searchWordCount.listObj[listObjCnt-1] === key) {
            log += searchWordCount.listObj[key];
            searchWordCount.listObj[key] = undefined;
            fs.writeFile(moment().format() + '_log.txt', log, 'utf8', function(err){
                if(err)
                    console.log("reduceWord ERR : " + err);
                callback(reduceList);
            })
        }
        log += searchWordCount.listObj[key] + "\n";
        searchWordCount.listObj[key] = undefined;
    }
}

