const path = require('path');
const {fse} = require('@elux/cli-utils');

const projectDist = path.join(__dirname, './client');
const nginxDist = path.join(__dirname, '../xiaoli-desktop/client');

// eslint-disable-next-line no-console
console['log'](`正在复制：${projectDist} -> ${nginxDist}`);
fse.removeSync(nginxDist);
fse.copySync(projectDist, nginxDist);
fse.moveSync(path.join(nginxDist, './index.html'), path.join(nginxDist, '../index.html'), {overwrite: true});
