/**
 *  合同类型模型
 *  createby susan
 */
var moment = require('moment'),
    CONSTANTS = require('../../config/constants.config');

let validation = {
    'name': {
        notEmpty: { options: [true], errorMessage: '合同类型名称 不能为空' },
        isLength: { options: [0,50], errorMessage: '类别名称不能超过50个字符'}
    },
    'pid': {
        notEmpty: { options: [true], errorMessage: '合同级别 不能为空' }
    }
};

let auto = function(configs) {
    if(!configs){
        return ;
    }
    if(!configs.id){ // id 不存在，为新增
        configs.status = CONSTANTS.CONFIG_STATUS.VALID;
        configs.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    } else { // 修改时，默认字段赋值
        configs.update_time = moment().format('YYYY-MM-DD HH:mm:ss');
    }
};
module.exports = {
    tbname:'contracts_type',
    pk: 'id',
    validation: validation,
    auto: auto
}
