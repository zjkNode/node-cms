/**
 *  合同内容模型
 *  createby susan
 */
var moment = require('moment'),
    CONSTANTS = require('../../config/constants.config');

let validation = {
    'title': {
        notEmpty: { options: [true], errorMessage: '合同标题 不能为空' },
        isLength: { options: [0,50], errorMessage: '新闻标题不能超过50个字符'}},
    'content': {
        notEmpty: { options: [true], errorMessage: '合同内容 不能为空' }
    },
    'typeid': {
        notEmpty: { options: [true], errorMessage: '合同类型 不能为空' }
    }
};

let auto = function(content) {
    if(!content){
        return ;
    }
    if(!content.id){ // id 不存在，为新增
        content.status = CONSTANTS.CONTRACTS_STATUS.WAITING;
        content.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    } else { // 修改时，默认字段赋值
        content.update_time = moment().format('YYYY-MM-DD HH:mm:ss');
        //将发布过的合同编辑之后变成“待发布”状态；未发布过的依旧保持“未发布”状态
        content.status = 'CASE WHEN `status` = '+CONSTANTS.CONTRACTS_STATUS.WAITING+' THEN '+CONSTANTS.CONTRACTS_STATUS.WAITING+' ELSE '+CONSTANTS.CONTRACTS_STATUS.RE_EDIT+' END';
    }
};
let pub = function(content){
	content.status = CONSTANTS.CONTRACTS_STATUS.PUBLISH;
	content.publish_time=moment().format('YYYY-MM-DD HH:mm:ss');
	content.update_time = moment().format('YYYY-MM-DD HH:mm:ss');
};
module.exports = {
    tbname:'contracts',
    pk: 'id',
    validation: validation,
    auto: auto,
    pub:pub
}
