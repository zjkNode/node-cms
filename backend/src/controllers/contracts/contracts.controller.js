/**
 *  contracts controller
 *  createby susan
 */
var async = require('async'),
    _ = require('lodash'),
    // nodePDF = require('nodepdf'),
    logger = require('../../lib/logger.lib'),
    util = require('../../lib/utils.js'),
    contractsModel = require('../../models/contracts/contracts.model.js'),
    contractsService = require('../../services/contracts/contracts.service.js'),
    contractsTypeService = require('../../services/contracts/type.service'),
    historyService = require('../../services/contracts/history.service'),
    logService = require('../../services/system/logs.service');

exports.add = function(req,res){
    req.checkBody(contractsModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var contents = {
        typeid:parseInt(req.body.typeid),
        title:req.body.title,
        content:req.body.content
    }
    contractsModel.auto(contents);
    contractsService.add(contents,function(err,rs) {
        if(err){
			logService.log(req, '服务器出错，新增合同内容失败');
			return res.status(500).end(error);
		}
        return res.status(200).json({ code: 'SUCCESS', msg:'新增合同内容成功'});
    });
}

exports.delete =  function(req,res){
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '合同id 不能为空'}
        }
    });
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    let map = {
        id: parseInt(req.params.id)
    };
    contractsService.delete(map, function(err){
        if(err){
			logService.log(req, '服务器出错，删除合同内容失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除合同内容成功'});
    });
}

exports.update = function(req,res) {
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: '合同id 不能为空'}
        }
    });
    req.checkBody(contractsModel.validation);
    if(req.validationErrors()){
        logger.error(__filename,'参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: parseInt(req.params.id)
    };
    
    var contents = {
        id: parseInt(req.params.id),
        typeid:parseInt(req.body.typeid),
        title:req.body.title,
        content:req.body.content
    };
    contractsModel.auto(contents);
    contractsService.update(contents, map, function(err){
        if(err){
			logService.log(req, '服务器出错，更新失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新成功'});
    });
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
            title: ['like',searchKey]
        }
    }
    contractsService.lists(where,page, function(err, result){
        if(err){
			logService.log(req, '服务器出错，获取合同内容列表失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({
            code: 'SUCCESS',
            data: result,
            msg: ""
        });
    });
}

exports.one = function(req,res){
    let where={
        id: parseInt(req.params.id)
    };
    async.auto({
        contractsList : function(callback){
            contractsTypeService.listsAll({},function(err,row){
                callback(err,row);
            });
        },
        oneContract:function(callback){
            contractsService.one(where,function(err,row){
                 callback(err,row);
            });
        },
        oneType:["contractsList","oneContract",function(results,callback){
            let where = {
                id: results.oneContract.typeid
            }
            let row = results.oneContract;
            var typeid = row.typeid;
            var cType = results.contractsList.filter((item)=>{
                return item.id === typeid;
            })[0];
            row.contractType = cType || { name: '类型已删除'};
            row.content = _.unescape(row.content);
            callback(null,row);
        }]

    },function(err,results){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        };
        let contract = results.oneContract;
        let contractsTree = util.buildTree(results.contractsList,0);
        contract.contractsTree = contractsTree;
		return res.status(200).json({code:'SUCCESS', data:contract, msg:'内容发布成功'});
    })
}

/**
 * 合同内容页
 *
 */
exports.preview = function(req,res){
    let where={
        id: parseInt(req.params.id)
    }
    contractsService.one(where,function(err,row){
        if(err){
            logService.log(req, '服务器出错，获取合同失败');
            return res.status(500).end(err);
        }
        row.content = _.unescape(row.content);
        return res.render('contracts/contracts',{contracts:row});
    });
}

// exports.previewpdf = function(req,res){
//     let where = {
//         id: parseInt(req.params.id)
//     }
//     contractsService.one(where,function(err,row){
//         if(err){
//             logService.log(req, '服务器出错，获取合同失败');
//             return res.status(500).end(err);
//         }
//         row.content = _.unescape(row.content);
//         var pdf = new nodePDF('temp/pdf/contracts.pdf', 'temp/pdf/contracts.pdf', {
//             'content': row.content,
//             'viewportSize': {
//                 'width': 1440,
//                 'height': 900
//             },
//         });
//         pdf.on('done', function(pathToFile){
//             return res.sendFile(pathToFile);
//         });
//     });
// }


/**
 * 合同内容页发布
 * @param {Object} req
 * @param {Object} res
 */
exports.publish = function(req,res){
	var contractsId = parseInt(req.params.id);
	var contractsTypeId = parseInt(req.body.typeid);
    async.waterfall([
        function (callback) {
            contractsService.publish(contractsId, function (err) {
                callback(err,res);
            });
        },
        function (param, callback) {
            historyService.add(contractsId, function (err, result) {
                callback(err, result);
            });
        }
    ], function (err, result) {
        if (err) {
            logService.log(req, '服务器出错，发布合同失败！');
            return res.status(500).end();
        }
        return res.status(200).json({code: 'SUCCESS', msg: '合同发布成功'});
    })
}