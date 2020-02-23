var fs = require('fs');
var pathutil = require('path');

var configJson = require('../config/configUtil').get()

let me = {
    isHotUrl: (url)=>{
        return /\_hotresponse\_\.js$/.test(url);
    },
    loadContent: (res, url)=>{
        res.send(`hot-content`);
    }
}
module.exports = me;