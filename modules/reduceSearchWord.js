// events 모듈 사용
var events = require('events');
var moment = require('moment');
var searchWordCount = require('../modules/seachWordCount');
var fs = require('fs');

// EventEmitter 객체 생성
var eventEmitter = new events.EventEmitter();

// TODO : Top k 20개 정도로 제한
eventEmitter.on('reduceWord', function(callback){
    var reduceList = [];
    var listObjCnt = searchWordCount.listObj.length;
    var log = "";
    for(key in searchWordCount.listObj){
        var dataObj = {
            'name' : key,
            'value' : searchWordCount.listObj[key]
        }
        reduceList.push(dataObj);
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
});

exports.myevent = eventEmitter;

exports.getListObj =  searchWordCount.listObj;