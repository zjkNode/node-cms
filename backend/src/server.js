#!/usr/bin/env node
// var async = require('async');
var http = require('http');
var app = require('../app');
// var database = require('../lib/database.lib');
var logger = require('./lib/logger.lib');
var port = require('./lib/port.lib.js')();
// var scheduleJob = require('./handlers/schedule.handler');
var sysHandler = require('./handlers/system.handler');
// var themes = require('./lib/themes.lib');
// var installService = require('../core/services/install.service');

/**
 * 设置端口
 */
app.set('port', port);//process.env.PORT || '7071'

// themes.init(app);

/**
 * 启动服务器
 */
// async.waterfall([
//   // 检查安装锁
//   function (callback) {
//     installService.status(function (err, hasInstall) {
//       if (err) return callback(err);

//       callback(null, hasInstall);
//     });
//   },
//   function (hasInstall, callback) {
//     if (!hasInstall) {
//       return callback();
//     }

//     async.series([
//       // 连接数据库
//       database.connect,
//       // 升级数据库
//       database.update,
//       // 初始化主题
//       function (callback) {
//         themes.init(app, callback);
//       }
//     ], callback);
//   }
// ], function (err) {
//   if (err) throw err;

  //创建 HTTP 服务器
  var server = http.createServer(app);

  //监听端口
  server.listen(port);
  // 定时任务
  // scheduleJob.job(); 
  sysHandler.init();
  
  server.on('error', function (error) {
    if (error.syscall !== 'listen') throw error;

    var bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        logger.error(bind + ' 需要有更高的权限');
        process.exit(1);

        break;
      case 'EADDRINUSE':
        logger.error(bind + ' 已被使用');
        process.exit(1);

        break;
      default:
        throw error;
    }
  });

  server.on('listening', function () {
    var addr = server.address();

    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    logger.info('正在监听 ' + bind);
  });

  process.on('uncaughtException', function (err) {
    logger.info('程序出现未捕获异常'); 
    logger.info('--------------------------------  uncaught Exception Start: --------------------------------');
    logger.fatal(err); //注意这个错误信息并没有错误发生时的堆栈信息
    logger.info('--------------------------------  uncaught Exception End: --------------------------------');

    // // 强制退出机制
    // var killTimer = setTimeout(function () {
    //   process.exit(1);
    // }, 30000);
    // killTimer.unref();

    // 进程退出，未设置进程重启机制，服务将无法访问
    // process.exit(1); 

    // 关闭server连接  回调时间较长，导制一段时间其他操作点击时，服务器拒绝连接
    // server.close(function(code,signal){ 
    //   server.listen(port);
    // });

    logger.info('关闭连接');
    server.close();
    setTimeout(function(){
      server.listen(port);
    }, 0);
});
// });