//动态将代码注入到特定js里
let fs = require('fs');
let pathutil = require('path');
let eachcontentjs = require('eachcontent-js')
var getConfig = require('../../config/configUtil')

let isFirstJs = (fpath)=>{
    if(fpath.match(/seajs\/sea\.js$/)){
        return true;
    }
    return false;
}
let inject_global_script;
let inject_global_mode_script;
let updateJs = (info, content)=>{        
    let fullfilepath = info.fullfilepath;
    if(isFirstJs(fullfilepath)){
        let sourceFolder = getConfig.getSourceFolder()
        let userconfig = getConfig.getUserConfig()
        let dir = pathutil.parse(__filename).dir;

        let defaultjs = `;
        console.warn('[rk-offlinedev]离线开发模式');
        window.rk_offlinedev = {};
        `
        //defaultjs += `\n;${getConfig.getValue('debug.mode')!=='source'?'SESSION.isDev = false;console.warn("[rk-offlinedev]切换到非dev状态：SESSION.isDev = false")':''};`;
        defaultjs += `\n;window.rk_offlinedev.userConfig=`+JSON.stringify(userconfig);

        let srcpath;
        if(getConfig.getValue('debug.mode')==='source') srcpath = pathutil.resolve(dir, '../../static-injects/injectFiles/inject_global_script_Source.js');
        if(getConfig.getValue('debug.mode')==='concat') srcpath = pathutil.resolve(dir, '../../static-injects/injectFiles/inject_global_script_Concat.js');
        
        if(!inject_global_mode_script) inject_global_mode_script = fs.readFileSync(srcpath, 'utf8')
        defaultjs += inject_global_mode_script;

        let gsrcpath = pathutil.resolve(dir, '../../static-injects/injectFiles/inject_global_script.js');
        if(!inject_global_script) inject_global_script = fs.readFileSync(gsrcpath, 'utf8')
        defaultjs += inject_global_script;

        defaultjs += `\n//****** END *******//\n`

        content = content +';\n'+ defaultjs;
    }
    return content;
}
module.exports = {
    updateJs
};