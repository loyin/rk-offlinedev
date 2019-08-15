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
        <tr><td>offline目录：</td><td><a href="#">${result.masterFolder}</a></td></tr>
        <tr><td>web目录：</td><td style="color:red;"><a href="#">${result.webpath}&nbsp;${result.isCustomizedWebRoot?'(自定义)':''}</a></td></tr>
        <tr><td>分支：</td><td style="color:green;">${result.branchName}</td></tr>
        <tr><td>转义ES6：</td><td>${userConfig.es6.autoTransformJs?'<span class="status_negative">On</span>':'<span class="status_positive">Off</span>'}</td></tr>
        <tr><td colspan="999" style="padding-left: 14px;">----</td></tr>
        <tr><td>Http快速访问：</td><td><a target="_blank" href="${httpurl}">${httpurl}</a></td></tr>
        <tr><td>Host转接用：</td><td><a target="_blank" href="${httpsurl}">${httpsurl}</a></td></tr>
        <tr><td>Java环境用：</td><td><a target="_blank" href="${"https://localhost:444/static/sea-config.js"}">${"https://localhost:444/static/sea-config.js"}</a></td></tr>
        
    </tbody>
    </table>
    `
    $('#infomation').html(html)
}