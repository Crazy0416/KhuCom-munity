// events 모듈 사용
var events = require('events');
var searchWordCount = require('../modules/seachWordCount');

// EventEmitter 객체 생성
var eventEmitter = new events.EventEmitter();
/*
eventEmitter.on('reduceWord', function(){
    for(key in searchWordCount.listObj){

    }
})
*/

