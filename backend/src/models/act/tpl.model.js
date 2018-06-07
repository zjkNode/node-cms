/**
 *  act-tpl模型
 *  createby clmama
 */
var moment = require('moment'),
    CONSTANTS = require('../../config/constants.config');

let validation = {
    'name': {
        notEmpty: { options: [true], errorMessage: '模版名称不能为空' },
        isLength: { options: [0,50], errorMessage: '模版名称不能超过50个字符'}},
    'code': {
        notEmpty: { options: [true], errorMessage: '模版代码不能为空' }
    }
};

let auto = function(tpl) {
    if(!tpl) return;

    if(!tpl.id) {
        tpl.status = CONSTANTS.ACT_TPL_STATUS.VALID; // 1有效  2停用
        tpl.count = 0;
        tpl.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
    } else {
        tpl.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
    }
};

module.exports = {
    tbname: 'act_tpl',
    pk: 'id',//主键,
    validation: validation,
    auto: auto
};
