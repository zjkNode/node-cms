
/**
 *
 * 新闻分类模型
 */
var moment = require('moment'),
  CONSTANTS = require('../../config/constants.config');

let validation = {
  'typeid': {
    notEmpty: { options: [true], errorMessage: '文件类型 不能为空' }
  },
  'name': {
    notEmpty: { options: [true], errorMessage: '文件名称 不能为空' },
    isLength: { options: [0,100], errorMessage: '文件名称不能超过100个字符'}
  },
  'filepath':{
    notEmpty: { options: [true], errorMessage: '请上传文件' },
    isLength: { options: [1], errorMessage: '文件只能上传一张'}
  }
};

let auto = function(files) {
  if(!files){
    return ;
  }
  if(!files.id){ // id 不存在，为新增
    files.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
  } else { // 修改时，默认字段赋值
    files.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
  }
  files.author = 'admin';
};

module.exports = {
  tbname:'files',
  validation: validation,
  auto: auto
}
