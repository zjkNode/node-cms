/**
 *  合同vm模型
 *  createby susan
 */
var moment = require('moment'),
    CONSTANTS = require('../../config/constants.config');

let validation = {
    'name': {
        notEmpty: { options: [true], errorMessage: '占位符名称 不能为空' },
        isLength: { options:[0,50], errorMessage:'占位符名称不能超过50个字符'}
    },
    'placeholder': {
        notEmpty: { options: [true], errorMessage: 'VM占位符 不能为空' },
        isLength: { options:[0,20], errorMessage:'VM占位符名称不能超过20个字符'}
    }, 
    'typeid': {
        notEmpty: { options: [true], errorMessage: '合同类型ID 不能为空' }
    }
};

let auto = function(vm) {
    if(!vm){
        return ;
    }
    if(!vm.id){ // id 不存在，为新增
        vm.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    } else { // 修改时，默认字段赋值
        vm.update_time = moment().format('YYYY-MM-DD HH:mm:ss');
    }
};

module.exports = {
    tbname:'contracts_vm',
    pk: 'id',
    validation: validation,
    auto: auto
}
