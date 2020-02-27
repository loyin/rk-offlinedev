let fs = require('fs')
let pathutil = require('path')
let util = require('util')
let _ = require('lodash')
let makeDir = require('make-dir')
let configUtil = require('../offlinedev/jsmodule/config/configUtil');
configUtil.reloadConfig();
let alias = global.rkGlobalConfig

let rk = require('../offlinedev/jsmodule/utils/rk')
let parser = require('../offlinedev/jsmodule/utils/seajs/regParserMini')
let seajsUtil = require('../offlinedev/jsmodule/utils/seajs/seajsUtil')
let eachcontentjs = require('eachcontent-js')

let sourcepath = `/Users/zhanglei/workspaces/apps-${'ingage'}-web/src/main/webapp/static/source`
let deploypath = `/Users/zhanglei/workspaces/apps-${'ingage'}-web/src/main/webapp/static/deploy`

let seaconfig = seajsUtil.parseSeaConfig(`/Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static`)
console.log(seaconfig)

let t0=new Date()*1;

makeDir.sync(deploypath)
var seaHeaderReg = /^\s*define\s*\([\s\S]*function\s*\(\s*r[\w]+\s*\,\s*e[\w]+\s*\,\s*m[\w]+\s*\)/ig;
eachcontentjs.eachContent(sourcepath, /\.css$/, (content, fpath)=>{
    let fdir = pathutil.parse(fpath).dir;
    let pathid = pathutil.relative(sourcepath, fpath);
    let newpath = pathutil.resolve(deploypath, pathid);
    let newdir = pathutil.parse(newpath).dir;
    makeDir.sync(newdir)

    fs.writeFileSync(newpath, content) 
});
eachcontentjs.eachContent(sourcepath, /\.tpl$/, (content, fpath)=>{
    let fdir = pathutil.parse(fpath).dir;
    let pathid = pathutil.relative(sourcepath, fpath);
    let newpath = pathutil.resolve(deploypath, pathid);
    let newdir = pathutil.parse(newpath).dir;
    makeDir.sync(newdir)

    var isVue = /vue.tpl$/ig.test(fpath);//vue的话，需要预留个空格，否则报错
    let content2 = content;
    content2 = content2.trim().replace(/\s*\r?\n\s*/g, ' ').replace(/\"/g, '\\\"')
    content2 = util.format('define("%s",[],"%s")', pathid, content2)
    //contentMap[fpath] = content;

    //let content2 = util.format('define("%s",%s,"%s")', pathid, '[]', content)
    fs.writeFileSync(newpath, content) 
    fs.writeFileSync(newpath+'.js', `//${new Date()}\n`+content2) 
});
eachcontentjs.eachContent(sourcepath, /\.js$/, (content, fpath)=>{
    let fdir = pathutil.parse(fpath).dir;
    let pathid = pathutil.relative(sourcepath, fpath);
    let newpath = pathutil.resolve(deploypath, pathid);
    let newdir = pathutil.parse(newpath).dir;
    makeDir.sync(newdir)

    if(rk.mightBeCmdFile(content) && !rk.isCookedJsPath(fpath) && !rk.isLibJsPath(fpath)){
        let deps = parser.getRequiresAsArray(content);
        let depspathid = [];
        deps.forEach((raw_req)=>{
            let req_pathid;
            if(seaconfig[raw_req]) {
                req_pathid = seaconfig[raw_req];
            }else{
                let req_fullpath = seajsUtil.resolveRequirePath(sourcepath, fpath, raw_req)     
                req_pathid = pathutil.relative(sourcepath, req_fullpath);
            } 
            req_pathid = seajsUtil.addJsExt(req_pathid)
            depspathid.push(req_pathid)
        })
        if(fpath.indexOf('pageMainCtrl.js')>=0){
            //console.log(deps)
        }
        //console.log(depspathid)
        if(	seaHeaderReg.test(content) 
        ){
            let arr = content.split('\n');
            for(let i=0;i<arr.length;i++){
                let line = arr[i];
                if(line.match(/^\s*define\s*\(/)){
                    console.log(line)
                    line = line.replace(/^\s*define\s*\(/, `define("${pathid}",${JSON.stringify(depspathid)},`)
                    arr[i] = line;
                    break;
                }
            }
            content = arr.join('\n')
            //content = content.replace(/\s*define\s*\(/g,)
            //content = content.trim().replace(/>\s*\r?\n\s*</g, '><').replace(/\s*\r?\n\s*/g, ' ').replace(/\"/g, '\\\"')
            //content = content.replace(seaHeaderReg, 'function(require,exports,module)')
            //content = content.replace(/\)\s*\;?$/g, '');
            //content = util.format('define("%s",%s,%s)', pathid, JSON.stringify(depspathid), content)
            //console.log(deps)
        }
    }

    //console.log(newpath)
    fs.writeFileSync(newpath, `//${new Date()}\n`+content)
});
console.log(new Date()*1-t0)