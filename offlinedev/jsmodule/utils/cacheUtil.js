var fs = require('fs');
var _ = require('lodash');
let pathutil = require('path')
var blueimp_md5 = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
let makeDir = require('make-dir')
let auxiliary = require('../../jsmodule/config/auxiliary')

let cache_folder = auxiliary.tmpFolder;
console.log(`[CACHE]${cache_folder}`)

let getFolder = (cacheType, id)=>{
    if(!fs.existsSync(cache_folder)){
        console.log(`cache_folder ${cache_folder} not exist.`);
        return;
    }
    let folder = `${cache_folder}/${cacheType}`;
    if(!fs.existsSync(folder)) fs.mkdirSync(folder);
    return folder;
}
let setCache = (cacheType, id, content)=>{
    let folder = getFolder(cacheType, id)
    if(!folder) return;
    let fpath = `${folder}/${id}.cache`;
    fs.writeFileSync(fpath, content);
}
let getCache = (cacheType, id)=>{
    let folder = getFolder(cacheType, id)
    if(!folder) return;
    let fpath = `${folder}/${id}.cache`;
    if(!fs.existsSync(fpath)) return null;
    let content = fs.readFileSync(fpath, 'utf8')
    return content;
}
let removeCache = (cacheType, id)=>{
    let folder = getFolder(cacheType, id)
    if(!folder) return;
    let fpath = `${folder}/${id}.cache`;
    fs.unlinkSync(fpath, ()=>{

    });
}

module.exports = {
    md5:(str)=>{
        str = str ? str : '';
        return blueimp_md5(str);
    },
    cache_folder,
    setCache,
    getCache,
    removeCache,
}