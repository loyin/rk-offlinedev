var do_validate = (savejson)=>{
    for(var lang in savejson){
        var langJson = savejson[lang];
        for(var key in langJson){
            var str = langJson[key];
        }
    }
    return true;
}
var do_validateValue = (key, cnValue, value)=>{    
    var chineseReg = /[\u4e00-\u9fa5]+/ig;
    if(value && chineseReg.test(value)){
        alert('非中文文案不可以含中文');
        return;
    }
    if(/\\r/g.test(value)) {
        alert(`不可以含有"\\r"`)
        return;
    }
    let regex = /\$\s{1,}[0-9]/g
    if(regex.test(value)) {
        alert(`取参占位符不能有空格：${value.match(regex).join(', ')}`)
        return;
    }
    //console.log(key, cnValue, value)
    let regex2 = /\$[0-9]{1,2}/g;
    if(cnValue && value){
        let cnarr = cnValue.match(regex2);
        let enarr = value.match(regex2);
        if(cnarr) cnarr = _.uniq(cnarr);
        if(enarr) enarr = _.uniq(enarr);
        if((!enarr && cnarr) || (enarr && !cnarr)){
            if(confirm('两种语言的取值占位符（也就是$1, $2）的数量不匹配'))
            return;
        }
        if(cnarr)
        if(!enarr || (enarr.length !== cnarr.length)){
            if(confirm('两种语言的取值占位符数量不匹配，中文里有'+cnarr.join(', ')+'，英文里有'+(enarr?enarr.join(', '):'')))
            return;
        }
        if(cnarr && enarr){
            cnarr.sort();
            enarr.sort();
            if(cnarr.join('')!==enarr.join('')){
                if(confirm('两种语言的取值占位符数量不匹配，中文里有'+cnarr.join(', ')+'，英文里有'+enarr.join(', ')))
                return;
            }
        }
    }
    return true;
}
var do_validateDupBetweenTransUntrans = (trans, untrans) =>{
    trans = trans['all_zh-cn'];
    var duplist = [];
    var uniqkeys = {};
    var nonUniqkeys = [];
    for(var fpath in untrans){
        for(var key in untrans[fpath]){
            UntransMap[key] = fpath;//缓存路径信息
            if(uniqkeys[key]) nonUniqkeys.push(key);
            uniqkeys[key] = true;
            if(typeof trans[key] !== 'undefined') {
                duplist.push(key)
            }
        }
    }
    var fatalerror = false;
    if(nonUniqkeys.length > 0){
        notice_error('发现致命错误：untranslated.js里的各文件中有重复的key：'+nonUniqkeys.join('<br>'))
        fatalerror = true;
    }
    if(duplist.length > 0){
        notice_error('发现致命错误：untranslated.js里和all_zh-cn里有重复的key：'+duplist.join('<br>'))
        fatalerror = true;
    }
    if(fatalerror){
        $('#content_loading').css({'color': 'yellow', 'font-size':'23px'}).html('Fatal Error!')
        $('body').css({'background-color':'blue'})
    }
    if(!fatalerror) $('#selfTestBtn').after(`<span style="color:#75cfea;" title="Data test OK!">&squarf;<span>`)
    return !fatalerror;
}
let self_test_completed = false;
do_selfTest = () =>{
    $('#selfTestBtn').removeClass('wrong').removeClass('correct').html('testing...')
    let errors = []
    let count = 0;
    let ids = ['selftestInput2'];//['selftestInput','selftestInput2'];
    ids.forEach((id)=>{
        let ipt = $('#'+id)//document.getElementById('selftestInput')
        let osuperJson = JSON.parse(JSON.stringify(OriginSuperJson));
    
        let _test = (key, val0, val)=>{
            ipt.val(escapeValue(val));
            val = unescapeValue(ipt.val());
            if(typeof val0 !== 'undefined' && val0 !== val) {
                errors.push({key, val0, val1: val})
            }
            count++;
        }
        let baddata1 = '~!@#$%^&*()_+=-0`|}{[]\":;?><$for,./'+"'\n "
        baddata1 += baddata1
        baddata1 += baddata1
        _test('baddata1', baddata1, baddata1);//terrible data test
        for(let key in osuperJson){
            let val = osuperJson[key].en;
            let val0 = val;
            _test(key, val0, val)
        }
        // for(let key in osuperJson){
        //     let val = osuperJson[key].cn;
        //     let val0 = val;
        //     _test(key, val0, val)
        // }
    })
    //测试选中关闭，是否会污染value
    {
        let len = $('#table>tbody>tr').length;
        let list = [0, len-1, , len-3, , len-5]
        let max = 7;
        for(let i=1;i<len;i++){
            if(i%3===0) list.push(i);
            if(list.length>max)break;
        }
        let keys = []
        for(let i=1;i<list.length;i++){
            let tr = $(`#table>tbody>tr:eq(${i})`);
            if(tr){
                keys.push(tr.attr('data-key'))
                handleTrSelect(tr)
                unselect()
            }
        }
        let key = keys.pop();
        let notdirty = true;
        while(key){
            if(checkKeyIsDirty(key)) notdirty = false;
            key = keys.pop();
        }
        if(!notdirty){
            errors.push('unselect后会污染数据')
        }
    }
    $('#selfTestBtn').addClass(errors.length > 0 ? 'wrong':'correct')
    $('#selfTestBtn').html(errors.length > 0 ? `${errors.length} Errors, Self-Test Failed!!`:`&squarf;`).attr('title', errors.length > 0 ? '':`Passed ${count} self-test cases.`)
    if(errors.length > 0){
        console.warn(`ERRORS: ${errors.length}`, errors)
        $('#saveBtn').remove();
        $('body').addClass('fatal_error')
    }
    delete osuperJson;
    self_test_completed = true;
}
