/**
 *  act_config controller
 *  createby zjk
 */
var moment = require('moment'),
    logger = require('../../lib/logger.lib'),
    configModel = require('../../models/act/config.model'),
    logService = require('../../services/system/logs.service'),
    actConfigService = require('../../services/act/config.service');

exports.add = function(req, res, next) {
    req.checkBody(configModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var conf = {
        name:req.body.name,
        domain:req.body.domain,
        oss_code:req.body.oss_code,
        publish_path:req.body.publish_path,
        baidu_code:req.body.baidu_code,
        download_urls:req.body.download_urls,
        user_id: req.session.user.id
    }
    configModel.auto(conf);
    actConfigService.add(conf,function(err,rs) {
        if(err){
            logService.log(req, '服务器出错，新增活动配置失败');
            return res.status(500).end(error);
        }
        return res.status(200).json({ code: 'SUCCESS', msg:'新增活动配置成功'});
    });
}

exports.update = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '活动配置id 不能为空'}
        }
    });
    req.checkBody(configModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: parseInt(req.params.id)
    };
    
    var conf = {
        id: parseInt(req.params.id),
        name:req.body.name,
        domain:req.body.domain,
        oss_code:req.body.oss_code,
        publish_path:req.body.publish_path,
        baidu_code:req.body.baidu_code,
        download_urls:req.body.download_urls,
        uuser_id: req.session.user.id
    };
    configModel.auto(conf);
    actConfigService.update(conf, map, function(err){
        if(err){
            logService.log(req, '服务器出错，更新失败');
            return res.status(500).end(err);
        }
        return res.status(200).json({code:'SUCCESS', msg:'更新成功'});
    });
}

exports.delete = function(req, res, next) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '活动配置id 不能为空' }
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    let where = {
        id: parseInt(req.params.id)
    };
    actConfigService.delete(where, function(error){
        if(error){
            logService.log(req, '服务器出错，删除活动配置失败');
            return res.status(500).end(err[0]);
        }
        return res.status(200).json({ code:'SUCCESS', msg:'删除成功'});
    })
}

exports.lists = function(req, res, next) {
    let where = {
    };
    let searchKey = req.query.keys;
    if(searchKey){
        where._complex = {
            _logic: 'or',
            name: ['like', searchKey],
            domain: ['like', searchKey],
            baidu_code: ['like', searchKey]
        }
    }
    actConfigService.lists(where, function(err, result){
        if(err){
            logService.log(req, '服务器出错，获取活动配置列表失败');
            return res.status(500).json(err);
        }
        return res.status(200).json({ code: 'SUCCESS', data: result, msg: ''});
    });
}
