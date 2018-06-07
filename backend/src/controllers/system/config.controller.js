/**
 *  config controller
 *  createby susan
 */
var logger = require('../../lib/logger.lib'),
    configModel = require('../../models/system/config.model.js'),
    configService = require('../../services/system/config.service.js');

exports.add = function (req,res) {
    req.checkBody(configModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var configs = {
        name:req.body.name,
        desc:req.body.desc,
        key:req.body.key,
        value:req.body.value,
        status:req.body.status
    }
    configModel.auto(configs);
    configService.add(configs,function(err,resId) {
        if(err){return res.status(500).end(err);}
        return res.status(200).json({ code: 200, msg:'新增成功'});
    });
}

exports.delete = function(req,res){
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: 'id 不能为空'}
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    let map = {
        id: req.params.id
    };
    configService.delete(map, function(err){
        if(err){return res.status(500).end(err);}
        return res.status(200).json({code: 200,msg:'删除成功'});
    });
}

exports.update = function(req,res) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: 'id 不能为空'}
        }
    });
    req.checkBody(configModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: req.params.id
    };
    var configs = {
        id: req.params.id,
        name:req.body.name,
        key:req.body.key,
        value:req.body.value,
        status:req.body.status
    };
    configModel.auto(configs);
    configService.update(configs, map, function(err){
        if(err){return res.status(500).end(err);}
        return res.status(200).json({code: 200,msg:'更新成功'});
    });
}

exports.lists = function(req,res) {
    var where = {
    };
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    }
    if(searchKey){
    where._complex = {
        _logic: 'or',
        name: ['like',searchKey],
        desc:['like',searchKey],
        key:['like',searchKey],
        value:['like',searchKey]
    }
    }
    configService.lists(where, page, function(err, result){
    if(err){return res.status(500).end(err);}
        return res.status(200).json({
            code: 200,
            data:result,
            msg:'success'
        });
    });
}