let showInfomation = (result)=>{
    $('#branchname').text()
    $('#webpath').html(``)


    let userConfig = result.userConfig;
    console.log(userConfig)
    let httpurl = `http://localhost:${userConfig.http.port}/static/sea-config.js`;
    let httpsurl = `https://localhost:${userConfig.https.port}/static/sea-config.js`;
    let html = `<table border=0 class="infotable">
    <thead class="table_title">
        <tr>
            <th align="left" colspan="999">状态</th>
        </tr>
    </thead>
    <tbody>
        <tr><td align="right">我的目录：</td><td><span style="color:blue;">${result.masterFolder}</span></td></tr>
        <tr><td align="right">Web工程目录：</td><td>
                                                    <span style="color:blue;" class="${result.isCustomizedWebRoot?' customized ':''}">
                                                        ${result.webpath}
                                                    </span>
                                                    <span>&nbsp;(${result.branchName})</span>
                                                </td>
        </tr>
        <tr><td align="right">转义ES6：</td><td>${userConfig.es6.autoTransformJs?'<span class="status_negative">On</span>':'<span class="status_positive">Off</span>'}</td></tr>
        <tr><td align="right" valign="top">子工程：</td><td><table><tbody id="subproject_list"></tbody></table></td></tr>
        <tr style="display:none;"><td colspan="999" style="padding-left: 14px;">&nbsp;</td></tr>
        <tr><td align="right">Http快速访问：</td><td><a target="_blank" href="${httpurl}">${httpurl}</a></td></tr>
        <tr><td align="right">Host调试用：</td><td><a target="_blank" href="${httpsurl}">${httpsurl}</a></td></tr>
        <tr><td align="right">Java环境用：</td><td><a target="_blank" href="${"https://localhost:444/static/sea-config.js"}">${"https://localhost:444/static/sea-config.js"}</a></td></tr>
        
    </tbody>
    </table>
    `
    $('#infomation').html(html)
    showSubProjects(result)
}
let showSubProjects = (result)=>{
    let has = false;
    let html = ``
    if(result.filters && result.filters.length > 0){     
        has = true;   
        result.filters.forEach((item)=>{
            html += `<tr>
                        <td align="left">路径<span class="url_pattern">${item.url_pattern}</span></td>
                        <td><span class="projectpath">${item.localpath}</span></td>
                    </tr>`
        })
    }
    if(result.projects && result.projects.length > 0){   
        has = true;   
        result.projects.forEach((item)=>{
            let branchMatch = (item.def_branchname === item.branchname)
            html += `<tr>
                        <td align="left">工程名<span class="projectname">${item.project}</span></td>
                        <td>
                        <span class="projectpath ${!item.branchname?'status_negative':''}">
                            ${item.projectPath}
                        </span>
                        &nbsp;
                        (${item.branchname?item.branchname:'<span class="status_negative">不是工程！</span>'})
                        ${branchMatch?item.branchname:`(<span class="status_negative">分支不符合要求</span>)`}
                        ${branchMatch?'':`(<span class="status_negative">期望分支是${item.def_branchname}</span>)`}
                        </td>
                    </tr>`
        })
    }
    if(!has) html = `<tr><td align="right">无</td></tr>`
    $('#subproject_list').html(html)
}