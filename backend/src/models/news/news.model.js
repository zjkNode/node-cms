
/**
 *
 * 新闻分类模型
 */
var moment = require('moment'),
	CONSTANTS = require('../../config/constants.config');

let validation = {
	'typeid': {
		notEmpty: { options: [true], errorMessage: '新闻类型 不能为空' }
	},
	'title': {
		notEmpty: { options: [true], errorMessage: '新闻标题 不能为空' },
		isLength: { options: [0,100], errorMessage: '新闻标题不能超过100个字符'}
	},
	'publish_time':{
        notEmpty: { options: [true], errorMessage: '新闻时间 不能为空' },
	},
	'author':{
		isLength: { options: [0,100], errorMessage: '作者名称不能超过100个字符'}
	}
};

let auto = function(news) {
	if(!news){
		return ;
	}
	if(!news.id){ // id 不存在，为新增
        if(!!news.status){
            news.status = news.status;
        }else{
            news.status = CONSTANTS.NEWS_STATUS.WAITING; // 1已发布  2待发布
        }
		news.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
	} else { // 修改时，默认字段赋值
		news.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
	}
	news.author = 'admin';
};
let pub = function(news){
	news.status = CONSTANTS.NEWS_STATUS.PUBLISH;
	news.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
};

module.exports = {
	tbname:'news',
	pk: 'id',
	validation: validation,
	auto: auto,
	pub:pub
}
