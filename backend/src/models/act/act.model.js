/**
 *  act-tpl模型
 *  createby clmama
 */
var moment = require('moment'),
    CONSTANTS = require('../../config/constants.config');

let validation = {
    'name': {
        notEmpty: { options: [true], errorMessage: '活动名称不能为空' },
        isLength: { options: [0,50], errorMessage: '活动名称不能超过50个字符'}},
    'code': {
        notEmpty: { options: [true], errorMessage: '活动代码不能为空' }
    }
};

let auto = function(act) {
    if(!act) return;

    if(!act.id) {
        act.status = CONSTANTS.ACT_STATUS.DRAFT;
        act.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
    } else {
        act.status = 'CASE WHEN `status` = '+ CONSTANTS.ACT_STATUS.ONLINE +' THEN '+ CONSTANTS.ACT_STATUS.MODIFY +' ELSE `status` END';
        act.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
    }
};

let pub = function(act){
    act.status = CONSTANTS.ACT_STATUS.ONLINE;
    act.update_time = act.publish_time = moment().format('YYYY-MM-DD HH:mm:ss');
};
module.exports = {
    tbname: 'act',
    pk: 'id',//主键,
    validation: validation,
    auto: auto,
    pub: pub
};
