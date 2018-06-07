/**
 *  tpl controller
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
    actTplModel = require('../../models/act/tpl.model'),
    formidable = require('formidable'),
    configService = require('../../services/system/config.service'),
    logService = require('../../services/system/logs.service'),
    actTplService = require('../../services/act/tpl.service');

exports.one = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '活动模版id 不能为空'}
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'活动模版ID验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var where = {
        id: parseInt(req.params.id)
    };
    actTplService.one(where, function(err, row) {
        if(err){
            logService.log(req, '服务器出错，查询模板出错，模板ID：'+ where.id);
            return res.status(500).end(err);
        }
        let timeId = moment().format("YYYYMMDDHHmmss");
        row.timeId = timeId;
        row.activityCode = utils.uuid();
        return res.status(200).json({ code: 'SUCCESS',data:row});
    });
    //这里少了模版次数增加1    count    +1
};

exports.add = function(req, res, next) {
    async.waterfall([
        configService.getAllConfigs,
        function(results,callback) {
            let data = {
                req: req,
                sysConfig: results
            };
            callback(null,data);
        },
        exports.upload
    ],function(err,tplData) {
        if(err){
            logService.log(req, '服务器出错，上传文件失败');
            return res.status(500).end(err);
        }
        actTplModel.auto(tplData);
        actTplService.add(tplData,function(err,resid) {
            if(err){
                logService.log(req, '服务器出错，新增模版失败');
                return res.status(500).end(err);
            }
            return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
        });
    })
};

exports.updateInfor = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '模版id 不能为空'}
        }
    });
    req.checkBody(actTplModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: parseInt(req.params.id)
    };
    let _tplData = req.body;
    let tplData = {
        id: parseInt(req.params.id),
        name: _tplData.name,
        code: _tplData.code,
        // cover: _tplData.cover,
        parts: _tplData.parts,
        desc: _tplData.desc
    };
    actTplModel.auto(tplData);
    actTplService.update(tplData,map,function(err,resid) {
        if(err){
            logService.log(req, '服务器出错，编辑模版失败');
            return res.status(500).end(err);
        }
        return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
    });
};

exports.update = function(req, res, next) {
    async.waterfall([
        configService.getAllConfigs,
        function(results,callback) {
            let data = {
                req: req,
                sysConfig: results
            };
            callback(null,data);
        },
        exports.upload
    ],function(err,tplData) {
        if(err){
            logService.log(req, '服务器出错，编辑模版失败');
            return res.status(500).end(err);
        }
        let map = {
            id: tplData.id
        };
        actTplModel.auto(tplData);
        actTplService.update(tplData,map,function(err,resid) {
            if(err){
                logService.log(req, '服务器出错，编辑模版失败');
                return res.status(500).end(err);
            }
            return res.status(200).json({ code: 'SUCCESS', msg:'编辑模版成功'});
        });
    })
};

exports.delete = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '模版id 不能为空' }
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    let where = {
        id: parseInt(req.params.id)
    };
    actTplService.delete(where, function(error){
        if(error){
            logService.log(req, '服务器出错，删除模版失败');
            return res.status(500).end(err[0]);
        }
        return res.status(200).json({
            code:'SUCCESS',
            msg:'删除成功'});
    })
};

exports.lists = function(req, res, next) {
    let where = {
    };
    let searchKey = req.query.keys;
    // let page = {
    //     index: parseInt(req.query.pageIndex),
    //     size: parseInt(req.query.pageSize)
    // };
    if(searchKey){
        where._complex = {
            _logic: 'or',
            name: ['like', searchKey],
            code: ['like', searchKey],
            desc: ['like', searchKey]
        }
    }
    actTplService.lists(where, function(err, result){
        if(err){
            logService.log(req, '服务器出错，获取模版列表失败');
            return res.status(500).json(err);
        }
        return res.status(200).json({
            code: 'SUCCESS',
            data: result,
            msg: ''
        });
    });
};

exports.upload = function(data, callback) {
    let req = data.req;
    let uploadDir = data.sysConfig.imageSavePath;
    if(process.env.NODE_ENV == 'dev'){ // 开发环境
        uploadDir = path.join(__dirname, '../../../', uploadDir);
    }
    let tplImagePath = uploadDir + '/act_tpl_image';
    if (!utils.mkdirsSync(tplImagePath, 0777)) {
        return callback('创建目录失败')
    }
    let form = new formidable.IncomingForm();
    form.uploadDir = tplImagePath;
    form.parse(req, function(error, fields, files) {
        if (error) {
            logger.error(__filename, error);
            fs.unlinkSync(files.file.path);
            return callback(error)
        }
        if (!fields.code) {
            logger.error(__filename, 'code参数验证失败');
            fs.unlinkSync(files.file.path);
            return callback('code参数验证失败');
        }
        if (!fields.name || fields.name.length >50) {
            logger.error(__filename, 'name参数验证失败');
            fs.unlinkSync(files.file.path);
            return callback('name参数验证失败');
        }
        let tpl = {
            id: fields.id,
            name: fields.name,
            code: fields.code,
            parts: fields.parts,
            desc: fields.desc,
            cover: fields.cover
        };
        let file = files.file;
        let time = new Date().getTime();
        let imagePath = path.join(tplImagePath, time + '.' + file.name.split('.')[1]);
        fs.rename(file.path, imagePath);

        tpl.cover = path.join('/images/act_tpl_image', time + '.' + file.name.split('.')[1]);
        callback(null, tpl);
    });
};
