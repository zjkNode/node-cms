/**
 *
 * 附件类型模型
 */
var moment = require('moment'),
	CONSTANTS = require('../../config/constants.config');

let validation = {
	'name': {
		notEmpty: { options: [true], errorMessage: '类型名称不能为空' }
	},
	'code':{
		notEmpty: { options:[true], errorMessage: '类型代码不能为空'}
	},
	'pids': {
		notEmpty: { options: [true], errorMessage: '父级类型不能为空' },
		isArray: { errorMessage: 'pids 须为数组类型' }
	}
};

let auto = function(fileType) {
	if(!fileType){
		return ;
	}
	if(!fileType.id){ // id 不存在，为新增
		fileType.status = CONSTANTS.FILE_TYPE_STATUS.NORMAL; // 1有效  2停用
		fileType.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
	} else { // 修改时，默认字段赋值
		fileType.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
	}
};

module.exports = {
	tbname:'file_type',
	pk: 'id',
	validation: validation,
	auto: auto
}