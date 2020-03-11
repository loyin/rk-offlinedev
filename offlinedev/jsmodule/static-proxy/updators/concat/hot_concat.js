let fs = require('fs');
let moment = require('moment')
let _ = require('lodash')
let pathutil = require('path')
let makeDir = require("make-dir")

let rk = require('../../../utils/rk')
let fs_readFile = require('../../supports/fs_readFile')
let configUtil = require('../../../config/configUtil')
let webprojectUtil = require('../../../config/webprojectUtil')
let seajsUtil = require('../../../utils/seajs/seajsUtil')

let updateScript_CssUrl = require('../updateScript_CssUrl')

let sea_alias = global.rkGlobalConfig.runtime.seajsConfig.alias;

/**
 *  注意！不要缓存合并后的大文本，低配机内存扛不住，也没必要。
 *       只需缓存每个文件的文本即可，搭配mc36
 * 
 */
let getBundlePathid = (i)=>{
    return `_hot/output_${i}.bundle.js`;
};
let allpathid;
let timetxt;
global.rkCacheOf_autoConcatPlan = {};
global.rkCacheOf_Deployfilesinfo = {};
let loadHotFileConcatPlan = (sourcefolder)=>{
    let hotfolder = makeDir.sync(pathutil.resolve(sourcefolder, './_hot'))
    let webroot = configUtil.getWebRoot();
    let allrouters = webprojectUtil.loadRouter(webroot)
    let allPageEntrancePathId = [];
    for(let url in allrouters){
        allPageEntrancePathId = allPageEntrancePathId.concat(allrouters[url].scripts)
    }

    timetxt = moment().format('YYYY-MM-DD HH:mm');
    let alldepsmap = seajsUtil.getAllDepsAsMap()
    //seajsUtil.cleanNoOneRequired(alldepsmap)
    fs.writeFileSync(hotfolder+'/dependencyMap.json', JSON.stringify(alldepsmap))
    // alldepsmap['root'] = ["core/rkloader.js",
    //                       'page/js/frame/pageMainCtrl.js',
    //                       'oldcrm/js/core/common-crm.js',
    //                       "platform/page/index/widget.js"
    //                     ];
    let root = [
                // "core/rkloader.js",
                // 'page/js/frame/pageMainCtrl.js',
                // 'oldcrm/js/core/common-crm.js',
                // "platform/page/index/widget.js"
    ];
    //root = root.concat(allPageEntrancePathId)
    for(let pathid in alldepsmap) root.push(pathid);
    alldepsmap['root'] = root;

    //        for(let i=0;i<7;i++) srcs.push(`_hot/output_${i}.bundle`)

    allpathid = seajsUtil.reduceAllDepsIntoArray(alldepsmap, "root");
    let tmparr = []
    allpathid.forEach((pathid)=>{
        if(rk.isCommonRequirePath(pathid) && pathid.match(/\.(js|tpl)$/)) tmparr.push(pathid);
    })
    allpathid = tmparr;
    fs.writeFileSync(hotfolder+'/dependency.powerlist.txt', allpathid.join('\n'))

    let maxBundleSize = 7*1024*1024;
    let currentFileNum = 0;
    let currentSize = 0;
    let totalContentSize = 0;
    let fcount=0;
    let len = allpathid.length;
    global.rkCacheOf_autoConcatPlan = {}

    currentFileNum++;
    let tplbundleid = getBundlePathid('tpl')
    global.rkCacheOf_autoConcatPlan[tplbundleid]={
        idx: currentFileNum,
        files:{}
    };
    //tpl
    for(let i=0;i<allpathid.length;i++){
        let pathid = allpathid[i];
        let fullfilepath = pathutil.resolve(sourcefolder, pathid)
        let isTpl = pathid.match(/\.tpl$/);
        let fpath = fullfilepath;
        if(isTpl){
            fs_readFile.fs_readFile(fpath, {encoding:'utf8', be_sync: true}, (err, content, fileinfo) => {   
                if(content===null || typeof content === 'undefined'){
                    console.log('404:',fpath)
                }
                let deployContent = '';
                deployContent = seajsUtil.changeTplToDeploy(sourcefolder, fullfilepath, content)
                global.rkCacheOf_autoConcatPlan[tplbundleid].files[pathid] = 1;
                global.rkCacheOf_Deployfilesinfo[pathid] = {
                    deployContent,
                    pathid,
                    fpath,
                    mc36: fileinfo.mc36,
                    mightBeCmd: fileinfo.mightBeCmd,
                    isCmd: fileinfo.isCmd
                };
            });
        }
    }
    //js
    for(let i=0;i<allpathid.length;i++){
        let pathid = allpathid[i];
        let fullfilepath = pathutil.resolve(sourcefolder, pathid)
        let isJs = pathid.match(/\.js$/);
        let isTpl = pathid.match(/\.tpl$/);
        fcount++;
        let fpath = fullfilepath;
        fpath = rk_formatPath(fpath);
        //if(currentFileNum >= 3)break;
        if(isJs)
        fs_readFile.fs_readFile(fpath, {encoding:'utf8', be_sync: true}, (err, content, fileinfo) => {   
            if(content===null || typeof content === 'undefined'){
                console.log('404:',fpath)
            }
            let ok = true;
            if(isJs && !rk.mightBeCmdFile(content)) ok=false;
            if(rk.isLibJsPath(fullfilepath)) ok=false;
            if(ok){
                fs_readFile.removeCache(fpath);//因为已经被转译过，因此没必要保留原始的文本了，节约内存
                let deployContent = '';
                if(isJs) deployContent = seajsUtil.changeJsToDeploy(sourcefolder, 
                                                                    fullfilepath, 
                                                                    sea_alias, 
                                                                    content, 
                                                                    {
                                                                        no_hot_url:true,
                                                                        depsPathIdUpdate:(depspathid)=>{//更新css的hot url，打包状态下，只需跟新define函数的就行。
                                                                            if(!configUtil.getValue('debug.concatStaticCssRequests')) return depspathid;
                                                                            depspathid.forEach((pid, idx)=>{
                                                                                let hotid = updateScript_CssUrl.changeToHotPath(fullfilepath, pid)
                                                                                depspathid[idx] = hotid ? hotid : pid;
                                                                            })
                                                                            depspathid = _.uniq(depspathid);
                                                                            return depspathid;
                                                                        }
                                                                    })
                //if(isTpl)deployContent = seajsUtil.changeTplToDeploy(sourcefolder, fullfilepath, content)
                // //混淆实验
                // if(0 && !rk.isCookedJsPath(fullfilepath))
                // deployContent = es6.minify(deployContent, {        
                //     uglifyConfig:{
                //         mangle:{
                //             reserved:['require' ,'exports' ,'module' ,'$']
                //         }
                //     }
                // });
                currentSize += content.length;
                totalContentSize += content.length;
                if(currentSize > maxBundleSize){
                    currentFileNum++;
                    currentSize=0;
                }
                //currentContent += `;\n//${pathid}\n;`+deployContent;
                let bundlePathid = getBundlePathid(currentFileNum)
                if(!global.rkCacheOf_autoConcatPlan[bundlePathid])global.rkCacheOf_autoConcatPlan[bundlePathid]={
                    idx: currentFileNum,
                    files:{}
                };
                //currentPathids += '\n'+pathid
                global.rkCacheOf_autoConcatPlan[bundlePathid].files[pathid] = 1;
                global.rkCacheOf_Deployfilesinfo[pathid] = {
                    deployContent,
                    pathid,
                    fpath,
                    mc36: fileinfo.mc36,
                    mightBeCmd: fileinfo.mightBeCmd,
                    isCmd: fileinfo.isCmd
                };
                if(fcount===len){
                    //last
                }
            }
        });
    }
    console.log('concat files=',currentFileNum)
    console.log('concat totalContentSize=', rk_formatMB(totalContentSize)+'MB')

}
let loadHotFileConcats = (sourcefolder)=>{
    for(let bundleid in global.rkCacheOf_autoConcatPlan){
        let files = global.rkCacheOf_autoConcatPlan[bundleid].files;
        let currentContent = [];
        let currentPathids = [];
        //console.log(i, 'pathid=',files)
        for(let pathid in files){
            let finfo = global.rkCacheOf_Deployfilesinfo[pathid]; 
            currentContent.push(finfo.deployContent);
            currentPathids.push(pathid);
        }
        //global.rkNameOf_HotConcatBundle[bundleid]=true;
        fs.writeFileSync(`${sourcefolder}/${bundleid}`, `//${timetxt}\n`+currentContent.join('\n;'));
        fs.writeFileSync(`${sourcefolder}/${bundleid}.txt`, `//${timetxt}\n`+currentPathids.join('\n'));
    }
    fs.writeFileSync(`${sourcefolder}/_hot/${'allpathid'}.txt`, `//${timetxt}\n`+allpathid.join('\n'));
    // console.log(fcount)
    // console.log(currentSize)

}
module.exports = {
    loadHotFileConcatPlan,
    loadHotFileConcats
};