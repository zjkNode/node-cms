/**
 *  contractsType controller
 *  createby susan
 */
var async = require('async'),
    _ = require('lodash'),
    util = require('../../lib/utils'),
    logger = require('../../lib/logger.lib'),
    CONSTANTS = require('../../config/constants.config'),
    contractsTypeModel = require('../../models/contracts/type.model'),
    contractsTypeService = require('../../services/contracts/type.service'),
    logService = require('../../services/system/logs.service');

exports.add = function(req,res){
    req.checkBody(contractsTypeModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var types = {
        name:req.body.name,
        pid:parseInt(req.body.pid),
        pids:req.body.pids
    }
    contractsTypeModel.auto(types);
    contractsTypeService.add(types,function(err,rs) {
        if(err){
			logService.log(req, '服务器出错，新增合同类型失败');
			return res.status(500).end(error);
		}
		logService.log(req, '新增合同类型成功'+ types.name);
        return res.status(200).json({ code: 'SUCCESS', msg:'新增合同类型成功'});
    });
};

exports.delete =  function(req,res){
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
    contractsTypeService.delete(map, function(err){
        if(err){
			logService.log(req, '服务器出错，删除合同类型失败');
			return res.status(500).end(err);
		}
		logService.log(req, '删除合同类型成功');
		return res.status(200).json({code:'SUCCESS', msg:'删除合同类型成功'});
    });
};

exports.update = function(req,res) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: 'id 不能为空'}
        }
    });
    req.checkBody(contractsTypeModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: parseInt(req.params.id)
    };
    
    var types = {
        id: parseInt(req.params.id),
        pid: parseInt(req.body.pid),
        pids: req.body.pids,
        name:req.body.name,
        status:parseInt(req.body.status)
    };
    contractsTypeModel.auto(types);
    contractsTypeService.update(types, map, function(err){
        if(err){
			logService.log(req, '服务器出错，更新失败');
			return res.status(500).end(err);
		}
		logService.log(req, '更新成功');
		return res.status(200).json({code:'SUCCESS', msg:'更新成功'});
    });
}

exports.lists = function(req,res) {
    var where = {};
    let searchKey = req.query.keys;
    if(searchKey){
        where._complex = {
            _logic: 'or',
            name: ['like',searchKey]
        }
        async.waterfall([
            function(callback){
                contractsTypeService.listsAll(where,function(error,resList){
                    callback(error,resList);
                });
            },
            function(resList,callback){
                let ids = [];
                for(let i = 0; i < resList.length; i++){
                    let item = resList[i];
                    ids.push(item.id);
                    ids = _.union(ids,item.pids.split(',').map((pid)=>{ return parseInt(pid); }))
                }
                contractsTypeService.listsAll({id:['in',ids]},function(error, resList){
                    callback(error, resList);
                });
            }
        ],function(err, result){
            if(err){
                logService.log(req, '服务器出错，获取合同类型列表失败');
                return res.status(500).end(err);
            }
            let resList = util.buildTreeTable(result);
            return res.status(200).json({
                code: 'SUCCESS',
                data:{
                    allData: resList,
                    dataTree: util.buildTree(result,0)
                }
            });
        })
    } else {
        async.parallel({//并行无关联
            contractsTypeValid: function(callback){
                contractsTypeService.listsAll({status:CONSTANTS.CONTRACTS_TYPE_STATUS.VALID},function(err,row){
                    callback(err,row);
                });
            },
            contractsTypeAll: function(callback){
                contractsTypeService.listsAll({},function(err,row){
                    callback(err,row);
                });
            }
        },function(err,rs){
            if(err){
                logService.log(req, '服务器出错，获取合同类型列表失败');
                return res.status(500).end(err);
            };
            return res.status(200).json({code:'SUCCESS', data:{
                allData: util.buildTreeTable(rs.contractsTypeAll),
                dataTree: util.buildTree(rs.contractsTypeValid,0)
            }, msg:'内容发布成功'});
        })
    }
}

