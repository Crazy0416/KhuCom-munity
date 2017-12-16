// events 모듈 사용
var events = require('events');
var searchWordCount = require('../modules/seachWordCount');

// EventEmitter 객체 생성
var eventEmitter = new events.EventEmitter();

// TODO : Top k 20개 정도로 제한
eventEmitter.on('reduceWord', function(callback){
    var reduceList = [];
    var listObjCnt = searchWordCount.listObj.length;
    for(key in searchWordCount.listObj){
        var dataObj = {
            'name' : key,
            'value' : searchWordCount.listObj[key]
        }
        reduceList.push(dataObj);
        if(searchWordCount.listObj[listObjCnt-1] === key) {
            callback(reduceList);
        }
    }
})
