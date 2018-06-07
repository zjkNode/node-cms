/**
 *  act controller
 *  createby clmama
 */
var async = require('async'),
    path = require('path'),
    _ = require('lodash'),
    cleanCss = require('clean-css'),
    uglifyJs = require('uglify-js'),
    child_process = require('child_process'),
    moment = require('moment'),
    fs = require('fs'),
    glob = require('glob'),
    unzip = require('unzip2'),
    nunjucks = require('nunjucks'),
    utils = require('../../lib/utils'),
    logger = require('../../lib/logger.lib'),
    aliOSS = require('../../lib/ali-oss.lib'),
    actModel = require('../../models/act/act.model'),
    formidable = require('formidable'),
    configService = require('../../services/system/config.service'),
    CONSTANTS = require('../../config/constants.config'),
    logService = require('../../services/system/logs.service'),
    actService = require('../../services/act/act.service'),
    actConfigService = require('../../services/act/config.service'),
    actTplService = require('../../services/act/tpl.service');

exports.one = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '活动id 不能为空'}
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'活动ID验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var where = {
        id: parseInt(req.params.id)
    };
    actService.one(where, function(err, row) {
        if(err){
            logService.log(req, '服务器出错，新增模版失败');
            return res.status(500).end(err);
        }
        row.activityCode = row.activity_code;
        row.parts = row.components;
        delete row.components;
        delete row.activity_code;
        let timeId = moment().format("YYYYMMDDHHmmss");
        row.timeId = timeId;
        return res.status(200).json({ code: 'SUCCESS',data:row});
    });
}

exports.draft = function(req, res, next) {
    let where = {};
    let actData = {
        id: req.body.id,
        name: req.body.name,
        code: req.body.code,
        activity_code: req.body.activityCode,
        data: JSON.stringify(req.body.data),
        url: req.body.url,
        components: req.body.parts
    };
    if(actData.id){
        actData.uuser_id = req.session.user.id;
        where.id = actData.id;
    } else {
        actData.user_id = req.session.user.id;
    }
    actModel.auto(actData);
    if(Object.keys(where).length > 0 ){
        actService.update(actData, where, function(err, row) {
            if(err){
                logService.log(req, '服务器出错，活动存草稿失败');
                return res.status(500).end(err);
            }
            return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
        })
    }else{
        actService.add(actData, function(err, row) {
            if(err){
                logService.log(req, '服务器出错，活动存草稿失败');
                return res.status(500).end(err);
            }
            return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
        })
    }
}

// 所有发布，都发布到测试环境
exports.publish = function(req, res, next) {
    req.checkBody(actModel.validation);
    if (req.validationErrors()) {
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    if(!req.body.configId){
        logger.error(__filename,'参数验证失败:发布到环境不能为空');
        return res.status(400).json();
    }

    let actData = {
        id: req.body.id ? parseInt(req.body.id) : 0,
        name: req.body.name,
        code: req.body.code,
        components: req.body.parts,
        url: req.body.url,
        // data: JSON.stringify(req.body.data),
        activity_code: req.body.activityCode,
        user_id: req.session.user.id
    };
    let tplData = JSON.stringify(req.body.data);
    actModel.auto(actData);
    actData.status = CONSTANTS.ACT_STATUS.ONTEST;

    let actPublishPath = '', 
        actPathCode = actData.code;
    let rootPath = path.join(__dirname, '../../../');// cms-backend

    async.auto({
        actConfig:function(callback){
            var where = {
                id: parseInt(req.body.configId)
            };
            actConfigService.one(where, function(err, row) {
                if(err){
                    return callback(new Error('服务器出错，活动配置出错,配置Id：'+ where.id));
                }
                return callback(null, row);
            });
        },
        actData:['actConfig',function(results, callback){
            let actConfig = results.actConfig;
            actPublishPath = actConfig.publish_path;
            if(_.startsWith(req.hostname, 'local')){ // 本地环境
                actPathCode = 'l'+ actData.code;
                actPublishPath = path.join(rootPath, actPublishPath);
                actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/,'$1local_$3');
            } else {
                // 测试环境，生产环境，首次发布都发布到测试环境
                actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/,'$1test-$3');
            }
            if(_.startsWith(req.hostname, 'test')){ // 测试环境
                actPathCode = 't'+ actData.code;
            }
            // actPublishPath = path.join(actPublishPath, actData.code);
            actPublishPath = path.join(actPublishPath, actPathCode);
            let actDirPath = actPublishPath;
            // 支持一个活动多个页面
            let pageDir = '1';
            if(!actData.url){ // 不存在url 则为新建
                if(fs.existsSync(actPublishPath)){
                    let files = fs.readdirSync(actPublishPath);
                    var dirs = files.filter((item) => {
                        let stat = fs.statSync(actPublishPath +'/'+ item);
                        return stat.isDirectory();
                    });
                    pageDir = (dirs.length + 1) +'';
                }
            } else {
                let urlPaths = actData.url.split('/');
                pageDir = urlPaths[urlPaths.length - 2];
            }
            actPublishPath = path.join(actPublishPath, pageDir + '/');
            
            if(!utils.mkdirsSync(actPublishPath + 'img', 0777)){
                return callback('创建目录失败')
            }

            // copy static js and css todo
            // let actTplPath = path.join(__dirname,'../../../src/themes/activity', 'static/');
            if(_.startsWith(req.hostname,'local')){
                let actTplPath = path.join(rootPath,'src/themes/activity/static/'); // mac环境
                child_process.spawn('cp',['-rf', actTplPath, actDirPath]); // mac环境 copy static 
            } else {
                let actCssPath = path.join(rootPath,'src/themes/activity/static/css/');
                let actJsPath = path.join(rootPath,'src/themes/activity/static/js/');
                let actImgPath = path.join(rootPath,'src/themes/activity/static/img/');
                let cp = child_process.spawn('cp',['-rf', actCssPath, actJsPath,actImgPath, actDirPath]); // copy static files
                cp.stderr.on('data',(data)=>{
                   logger.error(__filename,'拷贝css js img失败:'+ data);
                });
            }

            actData.oss_code = actConfig.oss_code;
            // actData.baidu_code = actConfig.baidu_code;
            // pages 需要 actDomain 的nginx 配置location /pages/规则
            // actData.url = sysConfig.actDomain + path.join('/pages/',actData.code, pageDir, 'index.html');
            // actData.url = actConfig.domain + path.join('/', actConfig.oss_code, actData.code, pageDir, 'index.html');
            actData.url = actConfig.domain + path.join('/', actConfig.oss_code, actPathCode, pageDir, 'index.html');

            // copy 编辑活动时上传的临时图片  发布成功了，删除临时目录
            var reg = new RegExp("\"/(temp/.*?[^\"])\"","ig");
            while(r = reg.exec(tplData)) {
                let actTempSrc = path.join(rootPath, r[1]);
                if(!fs.existsSync(actTempSrc)){
                    return callback(new Error(`图片 ${actTempSrc} 不存在或已被删除`));
                }
                child_process.spawn('cp',['-f', actTempSrc, actPublishPath +'img/']); // copy temp files
            }

            // 更新 page data数据 /temp/timeid  to  actDomain/pages/actCode/img
            // actData.data = actData.data.replace(/\/temp\/\d+[^\"]/gm, `/pages/${actData.code}/${pageDir}/img/`);
            // tplData = tplData.replace(/\/temp\/\d+[^\"]/gm, `${actConfig.domain}/${actConfig.oss_code}/${actData.code}/${pageDir}/img/`);
            tplData = tplData.replace(/\/temp\/\d+[^\"]/gm, `${actConfig.domain}/${actConfig.oss_code}/${actPathCode}/${pageDir}/img/`);
            
            // 用解析后的文件覆盖模板文件
            let contentData = JSON.parse(tplData);
            contentData.baidu_code = actConfig.baidu_code;
            contentData.download_urls = actConfig.download_urls;
            actData.data = JSON.stringify(contentData);
            let content = nunjucks.render('activity/layout.html', contentData);
            // 2018-3-22 公共的js css 放到活动目录，这样活动可完全独立
            // replace './static/[js|css]' to 'actDomain/public/static/[js|css]' 
            // content = content.replace(/\"\.{0,2}\/static\//ig, `"${sysConfig.actDomain}/public/static/`);
            fs.writeFileSync(path.join(actPublishPath, 'index.html'), content, 'utf-8');

            // create min.js
            let jsPaths = filterComps(contentData.components, 'js');
            let jsMin = { code: ''};
            if(jsPaths.length > 0){
                jsMin = uglifyJs.minify(jsPaths);
            }
            if(!jsMin.code){
                logger.warn(jsMin);
            }
            fs.writeFileSync(actPublishPath +'min.js', jsMin.code || '', 'utf8');

            // create min.css
            let cssPaths = filterComps(contentData.components, 'css');
            new cleanCss().minify(cssPaths, function(err, output){
                if(err){
                    return callback(err);
                } 
                fs.writeFileSync(actPublishPath +'min.css', output.styles || '', 'utf8');
                return callback(null, actData);
            });
        }],
        uploadOSS:['actConfig','actData',function(results, callback){
            let actData = results.actData;
            let actConfig = results.actConfig;
            // let filesRootPath = path.join(actConfig.publish_path, actData.code);
            // let ossPrefix = `${actConfig.oss_code}/${actData.code}`;
            let filesRootPath = path.join(actConfig.publish_path, actPathCode);
            if(_.startsWith(req.hostname,'local')){
                // 完全为了本地调试
                filesRootPath = path.join(rootPath, actConfig.publish_path, actPathCode);
            }
            let ossPrefix = `${actConfig.oss_code}/${actPathCode}`;
            let pattern = path.join(filesRootPath,'**');
            let ossClient = new aliOSS.Client('test', 'actBucket');

            console.log(filesRootPath);
            glob(pattern,{nodir: true}, function(err, files){
                if(err){
                    return callback(err);
                }
                console.log(files);
                files.forEach( localFile => {
                    let objKey = localFile.replace(filesRootPath,'');
                    let ossFile = path.join(ossPrefix, objKey);
                    ossClient.upload(ossFile, localFile);
                });
            });

            return callback(null, actData);
        }],
        saveAct:['actData', function(results, callback){
            let actData = results.actData;
            if(actData.id === 0){
                actService.add(actData, function(err, row) {
                  return callback(err, row)
                });
            } else {
                actService.update(actData, { id: actData.id }, function(err, row) {
                   return callback(err, row);
                });
            }
        }]
    }, function(err, results){
        if(err){
            logger.error(__filename,err);
            // 移除发布失败的目录
            actData.id == 0 && child_process.spawn('rm',['-rf', actPublishPath]); 
            return res.status(500).end();
        }

        // 移除临时目录
        child_process.spawn('rm',['-rf',path.join(rootPath, 'temp', req.body.timeId)]); 
        return res.status(200).json({ code: 'SUCCESS', msg:'测试环境发布成功' });
    });
}

exports.online = function(req, res, next){
    if(_.startsWith(req.hostname, 'local')){
        return res.status(200).json({ code:'LOCALENV', msg:'本地环境，直接访问即可'});
    }
    if(_.startsWith(req.hostname, 'test')){
        return res.status(200).json({ code:'LOCALENV', msg:'测试环境，直接访问即可'});
    }

    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '活动id 不能为空'}
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'活动ID验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    async.auto({
        actData: function(callback){
            var where = {
                id: parseInt(req.params.id)
            };
            actService.one(where, function(err, row){
                if(err){
                    return callback(err);
                }
               return callback(null, row); 
            });
        },
        actConfig:['actData', function(results, callback){
            let actData = results.actData;
            let where = {
                oss_code: actData.oss_code
            };
            actConfigService.one(where, function(err, row){
                if(err){
                    return callback(err);
                }
                return callback(null, row);
            });
        }],
        uploadOSS: ['actData', 'actConfig', function(results, callback){
            // update actData
            let actData = results.actData;
            let actConfig = results.actConfig;
            let rootPath = path.join(__dirname, '../../../');

            actData.data = actData.data.replace(/http(s?):\/\/test.*?\//gm, actConfig.domain +'/');
            let contentData = JSON.parse(actData.data);
            let content = nunjucks.render('activity/layout.html', contentData);
            let actPagePath = actData.url.replace(new RegExp(`http(s?)://test.*?/${actConfig.oss_code}/`,'g'), actConfig.publish_path +'/');

            fs.writeFileSync(actPagePath, content, 'utf-8');
            actData.url = actData.url.replace(/http(s?):\/\/test.*?\//gm, actConfig.domain +'/');

            
            let filesRootPath = path.join(actConfig.publish_path, actData.code);
            let ossPrefix = `${actConfig.oss_code}/${actData.code}`;
            let ossClient = new aliOSS.Client('product', 'actBucket');
            let pattern = path.join(filesRootPath,'**');
            glob(pattern,{nodir: true}, function(err, files){
                if(err){
                    return callback(err);
                }
                files.forEach( localFile => {
                    let objKey = localFile.replace(filesRootPath,'');
                    let ossFile = path.join(ossPrefix, objKey);
                    ossClient.upload(ossFile, localFile);
                });
            });

            return callback(null, actData);
        }],
        updateAct: ['uploadOSS', function(results, callback){
            let updateData = {
                url: results.actData.url,
                data: results.actData.data,
                uuser_id: req.session.user.id,
            }
            actModel.pub(updateData);
            actService.update(updateData, { id: results.actData.id }, function(err, row) {
               return callback(err, row);
            });
        }]
    }, function(error, results){
        if(error){
            logger.error(__filename,error);
            return res.status(500).end(error);
        }
        return res.status(200).json({ code: 'SUCCESS', msg:'活动上架成功' });
    });
}

// exports.publish = function(req, res, next) {
//     req.checkBody(actModel.validation);
//     if (req.validationErrors()) {
//         logger.error(__filename,'参数验证失败', req.validationErrors());
//         return res.status(400).json(req.validationErrors());
//     }
//     if(!req.body.configId){
//         logger.error(__filename,'参数验证失败:发布到环境不能为空');
//         return res.status(400).json();
//     }

//     let actData = {
//         id: req.body.id ? parseInt(req.body.id) : 0,
//         name: req.body.name,
//         code: req.body.code,
//         components: req.body.parts,
//         url: req.body.url,
//         toProduct: req.body.toProduct,
//         // data: JSON.stringify(req.body.data),
//         activity_code: req.body.activityCode,
//         user_id: req.session.user.id
//     };
//     let tplData = JSON.stringify(req.body.data);
//     actModel.auto(actData);
//     actModel.pub(actData);

//     let actPublishPath = '', 
//         actPathCode = actData.code;
//     let rootPath = path.join(__dirname, '../../../');// cms-backend

//     async.auto({
//         actConfig:function(callback){
//             var where = {
//                 id: parseInt(req.body.configId)
//             };
//             actConfigService.one(where, function(err, row) {
//                 if(err){
//                     return callback(new Error('服务器出错，活动配置出错,配置Id：'+ where.id));
//                 }
//                 return callback(null, row);
//             });
//         },
//         actData:['actConfig',function(results, callback){
//             let actConfig = results.actConfig;
//             actPublishPath = actConfig.publish_path;
//             if(_.startsWith(req.hostname, 'local')){ // 本地环境
//                 actPublishPath = path.join(rootPath, actPublishPath);
//                 actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/,'$1local_$3');
//             } else if(_.startsWith(req.hostname, 'test')){ // 测试环境
//                 actPathCode = 't'+ actData.code;
//                 actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/,'$1test-$3');
//             } else if(!actData.toProduct){ // 生产环境，发布到测试环境
//                 actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/,'$1test-$3');
//             }

//             // actPublishPath = path.join(actPublishPath, actData.code);
//             actPublishPath = path.join(actPublishPath, actPathCode);
//             let actDirPath = actPublishPath;
//             // 支持一个活动多个页面
//             let pageDir = '1';
//             if(!actData.url){ // 不存在url 则为新建
//                 if(fs.existsSync(actPublishPath)){
//                     let files = fs.readdirSync(actPublishPath);
//                     var dirs = files.filter((item) => {
//                         let stat = fs.statSync(actPublishPath +'/'+ item);
//                         return stat.isDirectory();
//                     });
//                     pageDir = (dirs.length + 1) +'';
//                 }
//             } else {
//                 let urlPaths = actData.url.split('/');
//                 pageDir = urlPaths[urlPaths.length - 2];
//             }
//             actPublishPath = path.join(actPublishPath, pageDir + '/');
            
//             if(!utils.mkdirsSync(actPublishPath + 'img', 0777)){
//                 return callback('创建目录失败')
//             }

//             // copy static js and css todo
//             // let actTplPath = path.join(__dirname,'../../../src/themes/activity', 'static/');
//             if(_.startsWith(req.hostname,'local')){
//                 let actTplPath = path.join(rootPath,'src/themes/activity/static/'); // mac环境
//                 child_process.spawn('cp',['-rf', actTplPath, actDirPath]); // mac环境 copy static 
//             } else {
//                 let actCssPath = path.join(rootPath,'src/themes/activity/static/css/');
//                 let actJsPath = path.join(rootPath,'src/themes/activity/static/js/');
//                 let cp = child_process.spawn('cp',['-rf', actCssPath, actJsPath, actDirPath]); // copy static files
//                 cp.stderr.on('data',(data)=>{
//                    logger.error(__filename,'拷贝css js 失败:'+ data);
//                 });
//             }

//             actData.oss_code = actConfig.oss_code;
//             // actData.baidu_code = actConfig.baidu_code;
//             // pages 需要 actDomain 的nginx 配置location /pages/规则
//             // actData.url = sysConfig.actDomain + path.join('/pages/',actData.code, pageDir, 'index.html');
//             // actData.url = actConfig.domain + path.join('/', actConfig.oss_code, actData.code, pageDir, 'index.html');
//             actData.url = actConfig.domain + path.join('/', actConfig.oss_code, actPathCode, pageDir, 'index.html');

//             // copy 编辑活动时上传的临时图片  发布成功了，删除临时目录
//             var reg = new RegExp("\"/(temp/.*?[^\"])\"","ig");
//             while(r = reg.exec(tplData)) {
//                 let actTempSrc = path.join(rootPath, r[1]);
//                 if(!fs.existsSync(actTempSrc)){
//                     return callback(new Error(`图片 ${actTempSrc} 不存在或已被删除`));
//                 }
//                 child_process.spawn('cp',['-f', actTempSrc, actPublishPath +'img/']); // copy temp files
//             }

//             // 更新 page data数据 /temp/timeid  to  actDomain/pages/actCode/img
//             // actData.data = actData.data.replace(/\/temp\/\d+[^\"]/gm, `/pages/${actData.code}/${pageDir}/img/`);
//             // tplData = tplData.replace(/\/temp\/\d+[^\"]/gm, `${actConfig.domain}/${actConfig.oss_code}/${actData.code}/${pageDir}/img/`);
//             tplData = tplData.replace(/\/temp\/\d+[^\"]/gm, `${actConfig.domain}/${actConfig.oss_code}/${actPathCode}/${pageDir}/img/`);
//             if(actData.toProduct){ // 发布到生产环境，需要再次替换发布到测试环境的图片https://test-
//                 // cp tPath files to pPath
//                 tplData = tplData.replace(/(http(s?):\/\/test-.*?)\//gm, actConfig.domain);
//             }
//             // 用解析后的文件覆盖模板文件
//             let contentData = JSON.parse(tplData);
//             contentData.baidu_code = actConfig.baidu_code;
//             contentData.download_urls = actConfig.download_urls;
//             actData.data = JSON.stringify(contentData);
//             let content = nunjucks.render('activity/layout.html', contentData);
//             // 2018-3-22 公共的js css 放到活动目录，这样活动可完全独立
//             // replace './static/[js|css]' to 'actDomain/public/static/[js|css]' 
//             // content = content.replace(/\"\.{0,2}\/static\//ig, `"${sysConfig.actDomain}/public/static/`);
//             fs.writeFileSync(path.join(actPublishPath, 'index.html'), content, 'utf-8');

//             // create min.js
//             let jsPaths = filterComps(contentData.components, 'js');
//             let jsMin = { code: ''};
//             if(jsPaths.length > 0){
//                 jsMin = uglifyJs.minify(jsPaths);
//             }
//             if(!jsMin.code){
//                 logger.warn(jsMin);
//             }
//             fs.writeFileSync(actPublishPath +'min.js', jsMin.code || '', 'utf8');

//             // create min.css
//             let cssPaths = filterComps(contentData.components, 'css');
//             new cleanCss().minify(cssPaths, function(err, output){
//                 if(err){
//                     return callback(err);
//                 } 
//                 fs.writeFileSync(actPublishPath +'min.css', output.styles || '', 'utf8');
//                 return callback(null, actData);
//             });
//         }],
//         uploadOSS:['actConfig','actData',function(results, callback){
//             let actData = results.actData;
//             let actConfig = results.actConfig;
//             // if(_.startsWith(req.hostname, 'local')){
//             //     // 本地环境，不上传oss
//             //     return callback(null, results.actData);
//             // }
            
//             // let filesRootPath = path.join(actConfig.publish_path, actData.code);
//             // let ossPrefix = `${actConfig.oss_code}/${actData.code}`;
//             let filesRootPath = path.join(actConfig.publish_path, actPathCode);
//             if(_.startsWith(req.hostname,'local')){
//                 // 完全为了本地调试
//                 filesRootPath = path.join(rootPath, actConfig.publish_path, actPathCode);
//             }
//             let ossPrefix = `${actConfig.oss_code}/${actPathCode}`;
//             let pattern = path.join(filesRootPath,'**');
//             let ossConfEnv = (!_.startsWith(req.hostname,'test') && actData.toProduct) ? 'product' : 'test';
//             let ossClient = new aliOSS.Client(ossConfEnv, 'actBucket');

//             console.log(filesRootPath);
//             glob(pattern,{nodir: true}, function(err, files){
//                 if(err){
//                     return callback(err);
//                 }
//                 console.log(files);
//                 files.forEach( localFile => {
//                     let objKey = localFile.replace(filesRootPath,'');
//                     let ossFile = path.join(ossPrefix, objKey);
//                     ossClient.upload(ossFile, localFile);
//                 });
//             });

//             return callback(null, actData);
//         }],
//         saveAct:['actData', function(results, callback){
//             let actData = results.actData;
//             if(actData.id === 0){
//                 actService.add(actData, function(err, row) {
//                   return  callback(err, row)
//                 });
//             } else {
//                 actService.update(actData, { id: actData.id }, function(err, row) {
//                    return callback(err, row);
//                 });
//             }
//         }]
//     }, function(err, results){
//         if(err){
//             logService.log(req, '服务器出错，发布活动失败:'+ err.message);
//             logger.error(__filename,err);
//             // 移除发布失败的目录
//             actData.id == 0 && child_process.spawn('rm',['-rf', actPublishPath]); 
//             return res.status(500).end();
//         }

//         // 移除临时目录
//         child_process.spawn('rm',['-rf',path.join(rootPath, 'temp', req.body.timeId)]); 
//         return res.status(200).json({ code: 'SUCCESS', msg:'发布活动成功' });
//     });

//     // async.waterfall([
//     //     // configService.getAllConfigs,
//     //     function(callback){
//     //         var where = {
//     //             id: parseInt(req.body.id)
//     //         };
//     //         actConfigService.one(where, function(err, row) {
//     //             if(err){
//     //                 return callback(new Error('服务器出错，活动配置出错,配置Id：'+ where.id));
//     //             }
                
//     //             return callback(row);
//     //         });
//     //     },
//     //     function(actConfig, callback) {
//     //         actPublishPath = actConfig.publish_path;
//     //         if(_.startsWith(req.hostname, 'local')){
//     //             actPublishPath = rootPath + actPublishPath;
//     //             actConfig.domain = 'local_'+ actConfig.domain;
//     //         }
//     //         if(_.startsWith(req.hostname, 'test')){
//     //             actConfig.domain = 'test-'+ actConfig.domain;
//     //         }
//     //         actPublishPath = path.join(actPublishPath, actData.code);

//     //         // copy static js and css todo
//     //         // let actTplPath = path.join(__dirname,'../../../src/themes/activity', 'static/');
//     //         let actTplPath = path.join(rootPath,'src',CONSTANTS.ACT_COMPONENTS_PATH,'static/');
//     //         child_process.spawn('cp',['-rf', actTplPath, actPublishPath]); // copy static files
            
//     //         // 支持一个活动多个页面
//     //         let pageDir = '1';
//     //         if(!actData.url){ // 不存在url 则为新建
//     //             if(fs.existsSync(actPublishPath)){
//     //                 let files = fs.readdirSync(actPublishPath);
//     //                 var dirs = files.filter((item) => {
//     //                     let stat = fs.statSync(actPublishPath +'/'+ item);
//     //                     return stat.isDirectory();
//     //                 });
//     //                 pageDir = (dirs.length + 1) +'';
//     //             }
//     //         } else {
//     //             let urlPaths = actData.url.split('/');
//     //             pageDir = urlPaths[urlPaths.length - 2];
//     //         }
//     //         actPublishPath = path.join(actPublishPath, pageDir + '/');
            


//     //         if(!utils.mkdirsSync(actPublishPath + 'img', 0777)){
//     //             return callback('创建目录失败')
//     //         }

//     //         actData.baidu_code = actConfig.baidu_code;
//     //         // pages 需要 actDomain 的nginx 配置location /pages/规则
//     //         // actData.url = sysConfig.actDomain + path.join('/pages/',actData.code, pageDir, 'index.html');
//     //         actData.url = actConfig.domain + path.join(actConfig.oss_code,actData.code, pageDir, 'index.html');

//     //         // copy 编辑活动时上传的临时图片  发布成功了，删除临时目录
//     //         var reg = new RegExp("\"/(temp/.*?[^\"])\"","ig");
//     //         while(r = reg.exec(actData.data)) {
//     //             let actTempSrc = path.join(rootPath, r[1]);
//     //             if(!fs.existsSync(actTempSrc)){
//     //                 return callback(new Error(`图片 ${actTempSrc} 不存在或已被删除`));
//     //             }
//     //             child_process.spawn('cp',['-f', actTempSrc, actPublishPath +'img/']); // copy temp files
//     //         }

//     //         // 更新 page data数据 /temp/timeid  to  actDomain/pages/actCode/img
//     //         // actData.data = actData.data.replace(/\/temp\/\d+[^\"]/gm, `/pages/${actData.code}/${pageDir}/img/`);
//     //         actData.data = actData.data.replace(/\/temp\/\d+[^\"]/gm, `/${actConfig.oss_code}/${actData.code}/${pageDir}/img/`);
//     //         // 用解析后的文件覆盖模板文件
//     //         let contentData = JSON.parse(actData.data);
//     //         let content = nunjucks.render('activity/layout.html', contentData);
//     //         // 2018-3-22 公共的js css 放到活动目录，这样活动可完全独立
//     //         // replace './static/[js|css]' to 'actDomain/public/static/[js|css]' 
//     //         // content = content.replace(/\"\.{0,2}\/static\//ig, `"${sysConfig.actDomain}/public/static/`);
//     //         fs.writeFileSync(path.join(actPublishPath, 'index.html'), content, 'utf-8');

//     //         // create min.js
//     //         let jsPaths = filterComps(contentData.components, 'js');
//     //         let jsMin = { code: ''};
//     //         if(jsPaths.length > 0){
//     //             jsMin = uglifyJs.minify(jsPaths);
//     //         }
//     //         if(!jsMin.code){
//     //             logger.warn(jsMin);
//     //         }
//     //         fs.writeFileSync(actPublishPath +'min.js', jsMin.code || '', 'utf8');

//     //         // create min.css
//     //         let cssPaths = filterComps(contentData.components, 'css');
//     //         new cleanCss().minify(cssPaths, function(err, output){
//     //             if(err){
//     //                 return callback(err);
//     //             } 
//     //             fs.writeFileSync(actPublishPath +'min.css', output.styles || '', 'utf8');
//     //             return callback(null, actData);
//     //         });
//     //     },
//     //     function(actData, callback){ // 上传oss
//     //         let rootPath = path.join(rootPath, '/www/static_act', actData.code);
//     //         let ossClient = new aliOSS.Client('actBucket','xxz/'+ actData.code, rootPath);
//     //         let pattern = path.join(rootPath,'**');
//     //         glob(pattern,{nodir: true}, function(err, files){
//     //             if(err){
//     //                 return callback(err);
//     //             }

//     //             files.forEach( fileName => {
//     //                 ossClient.upload(fileName);
//     //             });
//     //         });

//     //         return callback(null, actData);
//     //     },
//     //     function(actData, callback){
//     //         if(actData.id === 0){
//     //             actService.add(actData, function(err, row) {
//     //               return  callback(err, row)
//     //             });
//     //         } else {
//     //             actService.update(actData, { id: actData.id }, function(err, row) {
//     //                return callback(err, row);
//     //             });
//     //         }
//     //     }
//     // ],function(err, results) {
//     //     if(err){
//     //         logService.log(req, '服务器出错，发布活动失败:'+ err.message);
//     //         // 移除发布失败的目录
//     //         actData.id == 0 && child_process.spawn('rm',['-rf', actPublishPath]); 
//     //         return res.status(500).end();
//     //     }

//     //     // 移除临时目录
//     //     child_process.spawn('rm',['-rf',path.join(__dirname, '../../../temp', req.body.timeId)]); 
//     //     return res.status(200).json({ code: 'SUCCESS', msg:'发布活动成功' });
//     // });
// }

// 活动预览
// exports.preview = function(req, res, next){
//     let tplData = JSON.parse(req.query.tplData);
//     let timeId = req.query.timeId;
//     configService.getAllConfigs(function(err, sysConfig){
//         if(err){
//             logService.log(req, '服务器出错，预览活动失败:'+ err.message);
//             return res.send('服务器出错，预览活动失败');
//         }
//         let rootPath = path.join(__dirname, '../../../');// cms-backend
        
//         let actDomain = sysConfig.actDomain;
//         let content = nunjucks.render('activity/layout.html', tplData);
//         // replace './static/[js|css]' to 'actDomain/public/static/[js|css]'
//         content = content.replace(/\"\.{0,2}\/static\//ig, `"${actDomain}/public/static/`);
//         // replace './min.[css|js]' to '/temp/timeId/min.[css|js]' 
//         content = content.replace(new RegExp('\\.{0,2}\/min\\.', 'gi'), `/temp/${timeId}/min.`);
        
//         // 编辑活动时，可能没有上传图片，但因为js css 需要临时存放
//         let tempPath = `${rootPath}/temp/${timeId}/`;
//         if(!utils.mkdirsSync(tempPath, 0777)){ 
//             return callback('创建目录失败')
//         }
//         // 预览活动时，js css 静态化到临时目录
//         // create min.js
//         let jsPaths = filterComps(tplData.components, 'js');
//         let jsMin = { code: ''};
//         if(jsPaths.length > 0){
//             jsMin = uglifyJs.minify(jsPaths);
//         }
//         fs.writeFileSync(`${tempPath}min.js`, jsMin.code || '', 'utf8');
        
//         // create min.css
//         let cssPaths = filterComps(tplData.components, 'css');
//         new cleanCss().minify(cssPaths, function(error, output){
//             if(error){
//                 logService.log(req, '服务器出错，预览活动失败');
//                 return res.send('服务器出错，预览活动失败');
//             } 
//             fs.writeFileSync(`${tempPath}min.css`, output.styles || '', 'utf8');
//             return res.send(content);
//         });
//     });
// }

exports.offline = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '活动id 不能为空' }
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    let where = {
        id: parseInt(req.params.id)
    };
    async.waterfall([
        function(callback){
            actService.one(where, function(err, actData){
                if(err){
                    return callback(err);
                }
                if(!actData){
                    return callback(new Error({code:'NOT_EXIST', msg: '活动不存在或已被删除'}))
                }

                let ossKey = actData.url.substring(actData.url.indexOf('/',8)+1);
                if(_.startsWith(req.hostname,'local') || _.startsWith(req.hostname, 'test')){
                    // 本地，测试
                    let ossClient = new aliOSS.Client('test', 'actBucket');
                    ossClient.delete(ossKey);
                } else {
                    let ossClient = new aliOSS.Client('product', 'actBucket');
                    ossClient.delete(ossKey);
                }
                
                return callback(null, null);
            });
        },
        function(result, callback){
            let params = {
                status: CONSTANTS.ACT_STATUS.OFFLINE
            }
            actService.update(params, where, function(err) {
                return callback(err)
            })
        }], function(error, result){
            if(error){
                logService.log(req,  '服务器出错，下架活动失败');
                return res.status(500).end(error);
            }
            return res.status(200).json({ code: 'SUCCESS', msg:'下架活动成功'});
        });

    // async.waterfall([
    //     configService.getAllConfigs,
    //     function(sysConfig, callback){
    //         actService.one(where, function(err, actData){
    //             if(err){
    //                 return callback(err);
    //             }
    //             if(!actData){
    //                 return callback(new Error({code:'NOT_EXIST', msg: '活动不存在或已被删除'}))
    //             }
    //             let actPublishPath = sysConfig.actPublishPath;
    //             if(_.startsWith(req.hostname, 'local')){
    //                 let rootPath = path.join(__dirname, '../../../');// cms-backend
    //                 // actPublishPath = actPublishPath.replace('{root}', rootPath);
    //                 actPublishPath = path.join(rootPath, actPublishPath);
    //             }
    //             let pagePath = path.join(actPublishPath, actData.url.substring(actData.url.indexOf(`/${actData.code}/`)));
    //             // fs.renameSync(pagePath, pagePath +'.'+ moment().millisecond());
    //             // // 本地环境，不上传oss
    //             // if(!_.startsWith(req.hostname, 'local') ||
    //             //    !_.startsWith(req.hostname, 'test')){
    //             //     // 只删除线上oss 防止继续访问
    //             //     let ossKey = actData.url.substring(actData.url.indexOf('/',8)+1);
    //             //     let ossClient = new aliOSS.Client('product', 'actBucket');
    //             //     ossClient.delete(ossKey);
    //             // }
    //             fs.existsSync(pagePath) && fs.unlinkSync(pagePath);
    //             return callback(null, null);
    //         });
    //     },
    //     function(result, callback){
    //         let params = {
    //             status: CONSTANTS.ACT_STATUS.OFFLINE
    //         }
    //         actService.update(params, where, function(err) {
    //             return callback(err)
    //         })
    //     }], function(error, result){
    //         if(error){
    //             logService.log(req,  '服务器出错，下架活动失败');
    //             return res.status(500).end(error);
    //         }
    //         return res.status(200).json({ code: 'SUCCESS', msg:'下架活动成功'});
    //     });
}

exports.delete = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '活动id 不能为空' }
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    let where = {
        id: parseInt(req.params.id)
    };
    //删除活动，只删除oss上文件，修改数据库活动记录为删除状态
    async.waterfall([
        function(callback){
            actService.one(where, function(err, actData){
                if(err){
                    return callback(err);
                }
                if(!actData){
                    return callback(new Error('活动不存在或已被删除'))
                }
                if(actData.status == CONSTANTS.ACT_STATUS.ONLINE ||
                   actData.status == CONSTANTS.ACT_STATUS.MODIFY){
                    return callback(new Error('线上活动不允许删除'));
                }
                return callback(null, actData);
            });
        }, function(actData,callback){
            if(!actData){
                return callback(null, null);
            }

            //删除活动，删除服务器生成的活动文件
            //fs.existsSync(pagePath) && fs.unlinkSync(pagePath);
            actService.delete(where, function(err) {
               return callback(err);
            });
        }], function(err, actData){
            if(err){
                logService.log(req, '删除活动失败:'+ err.message);
                return res.status(500).end(err);
            }
            return res.status(200).json({ code: 'SUCCESS', msg:'删除活动成功'});
        });


    // 请勿删除 上面是oss删除方式，下面是本地文件删除方式 zjk
    // async.waterfall([
    //     configService.getAllConfigs,
    //     function(sysConfig, callback){
    //         actService.one(where, function(err, actData){
    //             if(err){
    //                 return callback(err);
    //             }
    //             if(!actData){
    //                 return callback(new Error('活动不存在或已被删除'))
    //             }
    //             if(actData.status == CONSTANTS.ACT_STATUS.ONLINE ||
    //                actData.status == CONSTANTS.ACT_STATUS.MODIFY){
    //                 return callback(new Error('线上活动不允许删除'));
    //             }
    //             if(actData.status == CONSTANTS.ACT_STATUS.DRAFT){ // 草稿，直接删除数据库记录，不删除文件
    //                 return callback(null, null);
    //             }

    //             let actPublishPath = sysConfig.actPublishPath;
    //             if(_.startsWith(actPublishPath, '{root}')){
    //                 let rootPath = path.join(__dirname, '../../../');// cms-backend
    //                 actPublishPath = actPublishPath.replace('{root}', rootPath);
    //             }
    //             let pagePath = path.join(actPublishPath, actData.url.substring(actData.url.indexOf(`/${actData.code}/`)));
    //             let dirPath = path.dirname(pagePath);
    //             child_process.spawn('rm',['-rf', dirPath]);
    //             return callback(null, null);
    //         });
    //     },
    //     function(result, callback){
    //         actService.delete(where, function(err) {
    //            return callback(err);
    //         });
    //     }], function(error, result){
    //         if(error){
    //             logService.log(req, '服务器出错，删除活动失败:'+ error.message);
    //             return res.status(500).end(error);
    //         }
    //         return res.status(200).json({ code: 'SUCCESS', msg:'删除活动成功'});
    // });
}

exports.upload = function(req, res, next) {
    let form = new formidable.IncomingForm();
    let actTempDir = path.join(__dirname,'../../../', 'temp');
    form.uploadDir = actTempDir;
    form.parse(req, function(error, fields, files) {
        if (error) {
            logger.error(__filename, error);
            return res.status(500).end(err);
        }
        if (!fields.timeId) {
            logger.errorDB(__filename, 'timeId参数验证失败');
            return res.status(400).end('timeId参数验证失败');
        }
        let  actTempPath = path.join(actTempDir, fields.timeId);
        if (!utils.mkdirsSync(actTempPath, 0777)) {
            return callback('创建目录失败')
        }

        let file = files.file;
        let time = new Date().getTime();
        let newFileName = file.name.replace(/(.*\/)*([^.]+)/, time);
        let visitPath = path.join('/temp', fields.timeId, newFileName);
        fs.renameSync(file.path, path.join(actTempPath, newFileName));
        return res.status(200).json({
            code: 'SUCCESS',
            file:{
                path: visitPath,
                size: file.size
            }
        });
    });
}

exports.lists = function(req, res, next) {
    let where = {};
    
    if(!utils.isAdmin(req.session.user.id)){
        where.status = ['!=', CONSTANTS.ACT_STATUS.DELETED];
    }
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    };
    if(searchKey){
        where._complex = {
            _logic: 'or',
            name: ['like', searchKey],
            code: ['like', searchKey]
        }
    }
    actService.lists(where, page, function(err, result){
        if(err){
            logService.log(req, '服务器出错，获取活动列表失败');
            return res.status(500).json(err);
        }
        return res.status(200).json({
            code: 'SUCCESS',
            data:result,
            msg:''
        });
    });
}


/* private methods */
function filterComps(compObjs, type){
    let targetPaths = []; cachePath = {};
    // let compRootPath = path.join('src/themes', CONSTANTS.ACT_COMPONENTS_PATH);
    let compRootPath = path.join(__dirname,'../../../src/themes', CONSTANTS.ACT_COMPONENTS_PATH);
    for (var i = 0; i < compObjs.length; i++) {
        let item = compObjs[i].name;
        if(cachePath.hasOwnProperty(item)){ // 检查缓存中是否存在引用
            continue;
        }
        cachePath[item] = `${compRootPath}/${item}/${item}.${type}`;
        if(!fs.existsSync(cachePath[item])){
            console.info('not exist: '+ cachePath[item]);
            continue;
        }

        targetPaths.push(cachePath[item]);
    }
    return targetPaths;
}



