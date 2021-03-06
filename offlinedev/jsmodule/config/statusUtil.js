var fs = require('fs');
var pathutil = require('path');
var _ = require('lodash')
let auxiliary = require('./auxiliary')
var rootpath = auxiliary.tmpFolder;
var config = {};
var configpath;
module.exports = {
    init: function(){
        var path = pathutil.resolve(rootpath, './localStatus.data') //rootpath + '/' + '.localStatus'
        configpath = path;
        //console.log('load: localStatus')
        if(!fs.existsSync(path)){
            fs.writeFileSync(path, JSON.stringify(config));
        }else{
            config = fs.readFileSync(configpath, 'utf8');
            config = JSON.parse(config)
        } 
    },
    setData: function(name, value){
        if(!configpath) this.init()
        config[name] = value;
        //console.log(name, value)
        fs.writeFileSync(configpath, JSON.stringify(config));
    },
    getData: function(name){
        if(!config[name]) this.init()
        return config[name];
    }
}