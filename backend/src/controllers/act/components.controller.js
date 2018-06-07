/**
 *  act controller
 *  createby clmama
 */
var async = require('async'),
    path = require('path'),
    _ = require('lodash'),
    moment = require('moment'),
    fs = require('fs'),
    unzip = require('unzip2'),
    utils = require('../../lib/utils'),
    CONSTANTS = require('../../config/constants.config'),
    logger = require('../../lib/logger.lib'),
    formidable = require('formidable'),
    child_process = require('child_process'),
    actService = require('../../services/act/act.service'),
    tplService = require('../../services/act/tpl.service');

exports.add = function(req, res, next) {
    let cpsPath = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
    let files = fs.readdirSync(cpsPath);
    let callback = function (file) {
        let _file = files.filter((item) => {
            return item == file.name.split('.')[0];
        });
        if(_file.length > 0) {
            fs.unlinkSync(file.path);
            return res.status(400).end('上传组件不可重复');

        }
        unzipFile(file);
        return res.status(200).json({ code: 'SUCCESS', msg:'新增组件成功'});
    };
    upload(req, res, callback);
};

exports.update = function (req, res, next) {
    let cpsPath = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
    let files = fs.readdirSync(cpsPath);
    let callback = function (file) {
        let _file = files.filter((item) => {
            return item == file.name.split('.')[0];
        });
        if(!_file.length) {
            fs.unlinkSync(file.path);
            return res.status(400).end('组件库没有该组件');
        }
        unzipFile(file);
        return res.status(200).json({ code: 'SUCCESS', msg:'更新组件成功'});
    };
    upload(req, res, callback);
};

exports.delete = function(req, res, next) {
    let compName = req.params.name;
    async.auto({
        actUseCnt: function(callback){
            let where = `components like '${compName},%' or components like '%,${compName},%' or components like '%,${compName}'`;
            actService.count(where, callback);
        },
        tplUseCnt: function(callback){
            let where = `parts like '${compName},%' or parts like '%,${compName},%' or parts like '%,${compName}'`;
            tplService.count(where, callback);
        }
    }, function(err, results){
        if(err){
            return res.status(500).end();
        }
        if(results.actUseCnt > 0 || results.tplUseCnt > 0){
            return res.status(200).json({ code: 'FAILED', msg:'组件被活动或模板引用，不能删除'});
        }
        let cpsPath = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
        // 移除组件目录
        child_process.spawn('rm',['-rf',path.join(cpsPath, compName)]);
        // fs.rmdirSync(cpsPath + '/' + compName);
        return res.status(200).json({ code: 'SUCCESS', msg:'删除组件成功'});
    });
    
};

exports.lists = function(req, res, next) {
    let searchKey = req.query.keys;
    let cpsPath = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
    let files = fs.readdirSync(cpsPath);
    let _files = [];
    for(var i = 0, length = files.length; i < length; i++) {
        if(files[i].indexOf(searchKey) > -1){
            let stat = fs.statSync(cpsPath + '/'+ files[i]);
            let isDirector = stat.isDirectory();
            if (isDirector && !(/^\./g.test(files[i]))) {
                _files.push({
                    name: files[i],
                    time: moment(stat.mtime).format('YYYY-MM-DD hh:mm:ss')
                })
            }
        }
    }
    return res.status(200).json({ code: 'SUCCESS', msg:'获取组件列表成功', data: _files});
};

function upload(req, res, callback) {
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
    form.parse(req, function(error, fields, files) {
        if (error) {
            logger.error(__filename, error);
            return res.status(400).json({message: '上传组件压缩包无法解析'});
        }
        if(!(/.zip$/g.test(files.file.name))) {
            logger.errorDB(__filename, '请上传组件压缩包');
            fs.unlinkSync(files.file.path);
            return res.status(400).json({message: '请上传组件压缩包'});
        }
        callback(files.file);
    });
}

function unzipFile(file) {
    let uploadDir = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH,'/');
    let actCpsPath = uploadDir + '/' + file.name.split('.')[0];
    let zipFile = file.path;
    var extract = unzip.Extract({ path: actCpsPath });
    fs.createReadStream(zipFile).pipe(extract);
    fs.unlinkSync(zipFile);
}
