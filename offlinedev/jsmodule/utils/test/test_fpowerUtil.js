let fpowerUtil = require('../fpowerUtil')
require('../fpowerUtil')
require('../fpowerUtil')
require('../fpowerUtil')
require('../fpowerUtil')

fpowerUtil.loadPower()

for(let i=0;i<6000;i++){
    let filename = (Math.random()+'').substring(2,4)
    fpowerUtil.plusFilePower(`/Users/zhanglei/workspaces/rk-offlinedev-auxiliary/tmp/${filename}.file`);
}

console.log(fpowerUtil.getPowerData())
fpowerUtil.savePower()