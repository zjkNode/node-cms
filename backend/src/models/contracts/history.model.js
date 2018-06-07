/**
 * Created by ufenqi on 17/9/5.
 */
/**
 *
 * 合同历史数据模型
 */
var moment = require('moment');

let validation = {
    // 'title': {
    //     notEmpty: { options: [true], errorMessage: '合同标题不能为空' }
    // },
    // 'content': {
    //     notEmpty: { options: [true], errorMessage: '' }
    // },
    // 'type': {
    //     notEmpty: { options: [true], errorMessage: '合同标题不能为空' }
    //     // isLength: { options: [0,100], errorMessage: '合同标题不能超过100个字符'}
    // }

};
let auto = function(history) {
    if(!history){
        return ;
    }
    if(!history.id){ // id 不存在，为新增
        history.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    } else { // 修改时，默认字段赋值

    }
};



module.exports = {
    tbname:'contracts_history',
    pk:'id',
    validation:validation,
    auto: auto

};
