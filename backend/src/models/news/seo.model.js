/**
 *
 * 新闻分类模型
 */
var moment = require('moment');

let validation = {
  'typeid': {
    notEmpty: { options: [true], errorMessage: '新闻类型 不能为空' }
  },
  'title': {
    notEmpty: { options: [true], errorMessage: '栏目seo 不能为空' }
  },
  'keywords': {
    notEmpty: { options: [true], errorMessage: 'seo keywords 不能为空' }
  },
  'description': {
    notEmpty: { options: [true], errorMessage: 'seo description 不能为空' }
  }
};

let auto = function(news) {
  if(!news){
    return ;
  }
  if(!news.id){ // id 不存在，为新增
    news.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
  } else { // 修改时，默认字段赋值
    news.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
  }
};

module.exports = {
  tbname:'news_seo',
  pk: 'id',
  validation: validation,
  auto: auto
}
