var path = require('path');
var _ = require('lodash');
var express = require('express');
// var hbs = require('express-hbs');
var nunjucks = require('nunjucks');
var compression = require('compression');
//var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('./src/lib/validator.lib');
var session = require('./src/lib/session.lib');
var logger = require('./src/lib/logger.lib');
var router = require('./src/lib/route-map.lib');
var filter = require('./src/lib/filter.lib');
var authHandler = require('./src/handlers/auth.handler');
var exceptionHandler = require('./src/handlers/exception.handler');
var errors = require('./src/controllers/errors.controller').error;
var CONSTANTS = require('./src/config/constants.config');

var app = express();

var env = nunjucks.configure(path.join(__dirname,'src/themes'),{
	autoescape:true,
	noCache: true, // nunjucks 不缓存模板文件
	express: app
});
env.addFilter('styleFn', filter.styleFilter, true);
env.addFilter('comFilter', filter.comFilter);

app.set('view engine','html');
/**
 * 设置模板解析
 */
// app.engine('.html', hbs.express4({
//     // layoutsDir: 'src/views/partials/',
// partialsDir: 'src/themes/jdjk-pc/partials/',
// extname: '.html'
// }));
// app.set('view engine', '.html');
// app.set('views', 'src/themes/jdjk-pc');


/**
 * 中间件
 */
app.use(compression());
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger.access());
app.use(bodyParser.json({ limit:'10mb' }));
app.use(bodyParser.urlencoded({ limit:'10mb', extended: true }));
app.use(validator());
app.use(cookieParser());
app.use(session.check(), session.init());
// app.use(express.static(path.join(__dirname, 'temp')));
app.use('/temp', express.static(path.join(__dirname, 'temp'))); // 活动上传图片临时目录访问路径
app.use('/activity', express.static(path.join(__dirname, 'src/themes/activity')));
app.use('/images', express.static(path.join(__dirname, 'www/nodecms')));

// 异常拦截器
app.use(exceptionHandler);

// 权限拦截器
app.use(authHandler);

/**
 * 转给 Roter 处理路由
 */
app.use(router);

/**
 * 错误处理程序
 */
app.use(errors);

/**
 * 导出 APP
 */
module.exports = app;