var fs = require('fs');
var pathutil = require('path');

var configJson;

var offlineFolder = pathutil.resolve(__dirname, '../../');
var projectFolder = pathutil.resolve(offlineFolder, '../');
var parentFolder = pathutil.resolve(projectFolder, '../');

var fpath = offlineFolder + '/config.json'
if(fs.existsSync(fpath)){
    var data = fs.readFileSync(fpath, 'utf8');
    if(data){
        configJson = JSON.parse(data);
    }
}else{
    console.log('Can not find:', fpath)
}
let configFilePath = pathutil.resolve(projectFolder, './user-config.json')
let defaultConfig = {
    webProjectPath: '',//default
    http:{
        port: 666
    },
    https:{
        port: 443
    }
};
let config={};
if(!fs.existsSync(configFilePath)){
    config = defaultConfig;
    fs.writeFileSync(configFilePath, JSON.stringify(config));
}else{
    config = fs.readFileSync(configFilePath, 'utf8');
    eval('config='+config)
    config = Object.assign(defaultConfig, config);
}
//var parentFolder = pathutil.resolve(__dirname, '../../../../');
var webroot = config.webProjectPath ? config.webProjectPath : pathutil.resolve(parentFolder, './apps-ingage-web/');
var webappFolder = pathutil.resolve(webroot, './src/main/webapp/');

console.log('user-config=', config)
console.log('web=', webroot)
console.log('---')

let thisUtil = {
    getUserConfig: function(){
        return config;
    },
    get: function (){
        return configJson;
    },
    getMyRoot: function(){
        return parentFolder;
    },
    isCustomizedWebRoot: function(){
        return !!config.webProjectPath;
    },
    getWebRoot: function(){
        return webroot;
    },
    getWebAppFolder: function(){
        return webappFolder;
    },
    getStaticFolder: function(){
        return this.getWebAppFolder() + '/static';
    },
    getSourceFolder: function(){
        return this.getStaticFolder() + '/source';
    },
    initFiles: function(){
        var webpath = webappFolder;
        var rootpath = pathutil.resolve(__dirname, '../../');
        var path = rootpath + '/mocking/'
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        } 
        path = rootpath + '/mocking/actions'
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        } 
        path = rootpath + '/mocking/pages'
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        } 
    }
}
module.exports = thisUtil;