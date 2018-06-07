/**
 *  contracts_vm controller
 *  createby susan
 */
var async = require('async'),
    _ = require('lodash'),
    logger = require('../../lib/logger.lib'),
    contractsVmModel = require('../../models/contracts/vm.model'),
    contractsVmService = require('../../services/contracts/vm.service'),
    logService = require('../../services/system/logs.service');

exports.add = function( req, res){
    req.checkBody(contractsVmModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var vm = {
        name:req.body.name,
        placeholder: req.body.placeholder,
        desc:req.body.desc || '',
        typeid:parseInt(req.body.typeid)
    };
    var where = {
        placeholder:vm.placeholder,
        typeid:vm.typeid
    };
    contractsVmModel.auto(vm);
    async.waterfall([
        function(callback){
            contractsVmService.isExist(where,function(err,isExist){
                callback(err,isExist);
            })
        },
        function(isExist,callback){
            if(isExist){
               return callback(null,{ code: 'RELOAD', msg:'此占位符已经存在'});
            }
            contractsVmService.add(vm,function(err){
                return callback(err,{ code: 'SUCCESS', msg:'新增占位符成功'});
            });
        }
    ],function(err,result){
        if(err){
            logService.log(req, '服务器出错，新增占位符失败');
            return res.status(500).end(err);
        }
        return res.status(200).json(result);

    }) 
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
        id: parseInt(req.params.id)
    };
    contractsVmService.delete(map, function(err){
        if(err){
			logService.log(req, '服务器出错，删除占位符失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除占位符成功'});
    });
}

exports.update = function(req,res){
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: 'id 不能为空'}
        }
    });
    req.checkBody(contractsVmModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: parseInt(req.params.id)
    };
    var vm = {
        id: parseInt(req.params.id),
        name:req.body.name,
        placeholder: req.body.placeholder,
        desc:req.body.desc || '',
        typeid: parseInt(req.body.typeid)
    };
    contractsVmModel.auto(vm);
    let where = {
        placeholder: vm.placeholder,
        typeid:vm.typeid,
        id :['<>',vm.id]
    };
    contractsVmModel.auto(vm);
    async.waterfall([
        function(callback){
            contractsVmService.isExist(where,function(err,isExist){
               return callback(err,isExist);
            });
        },
        function(isExist,callback){
            console.log(isExist)
            if(isExist){
               return callback(null,{ code: 'RELOAD', msg:'此占位符已经存在'});
            }
            contractsVmService.update(vm,map,function(err){
               return callback(err, { code: 'SUCCESS', msg:'更新成功'});
           });
        }
    ],function(err,result){
        if(err){
            logService.log(req, '服务器出错，更新失败');
            return res.status(500).end(err);
        }
        return res.status(200).json(result);
    })
}
exports.lists = function(req,res) {
    var where = {};
    let searchKey = req.query.keys;
    let page = {
		index: parseInt(req.query.pageIndex),
		size: parseInt(req.query.pageSize)
    }
    if(searchKey){
        where._complex = {
            _logic: 'or',
            placeholder: ['like',searchKey],
            [contractsVmModel.tbname+'.name']: ['like',searchKey]
        }
    }
    contractsVmService.lists(where,page, function(err, result){
        if(err){
         logService.log(req, '服务器出错，获取占位符列表失败');
         return res.status(500).end(err);
        }
        return res.status(200).json({
            code: 'SUCCESS',
            data: result,
            msg: ""
        });
    }); 
}