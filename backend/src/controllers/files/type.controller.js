var async = require('async'),
	_ = require('lodash'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	fileTypeModel = require('../../models/files/type.model'),
	fileTypeService = require('../../services/files/type.service'),
	logService = require('../../services/system/logs.service');

exports.add = function (req,res) {
	req.checkBody(fileTypeModel.validation);
	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	var pid = parseInt(req.body.pids[req.body.pids.length - 1]);
	var fileType = {
		name:req.body.name,
		pid: pid < 0 ? 0 : pid,
		pids: parseInt(req.body.pids[0]) < 0 ? 0 : req.body.pids.join(','),
		code: req.body.code,
		desc: req.body.desc
	};
	fileTypeModel.auto(fileType);

	fileTypeService.add(fileType,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增附件类型失败: '+ fileType.name );
			return res.status(500).end(err);
		}
		return res.status(200).json({ code: 'SUCCESS', msg:'新增附件类型成功'});
	});

}

exports.update = function(req,res) {
	req.checkParams({
	    'id': { notEmpty: { options: [true], errorMessage: '附件类型id 不能为空' }
	    	}
	  });
	req.checkBody(fileTypeModel.validation);

	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	var pid = parseInt(req.body.pids[req.body.pids.length-1]);
	var where = {
		id: parseInt(req.params.id)
	};
	var fileType = {
		id: parseInt(req.params.id),
		name:req.body.name,
		pid: pid < 0 ? 0 : pid,
		pids:parseInt(req.body.pids[0]) < 0 ? 0 : req.body.pids.join(','),
		code: req.body.code,
		desc: req.body.desc,
		status: parseInt(req.body.status)
	};
	fileTypeService.update(fileType, where, function(err){
		if(err){
			logService.log(req, '服务器出错，更新附件类型信息失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新附件类型信息成功'});
	});
}

exports.delete = function(req,res){
	req.checkParams({
		'id': { notEmpty: { options: [true], errorMessage: '附件类型id 不能为空'}
	    }
	});

	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	
	let where = { 
		id: parseInt(req.params.id) 
	};
	fileTypeService.delete(where, function(error, callback){
		if(error){
			logService.log(req, '服务器出错，删除附件类型失败');
			return res.status(500).end(error);
		}
		// todo 删除物理附件
		return res.status(200).json({code:'SUCCESS', msg:'删除附件类型成功'});
	});
}

exports.lists = function(req,res) {
	var where = {};
	let searchKey = req.query.keys;
	if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like', searchKey],
			code: ['like', searchKey]
		}
		async.waterfall([
			function(callback){
				fileTypeService.lists(where,function(err,result){
					callback(err,result);
				});
			},
			function(result,callback){
				var ids = [];
				for(var i = 0; i < result.length; i++){
					var item = result[i];
					ids.push(item.id);
					ids = _.union(ids,item.pids.split(',').map((pid)=>{
						return parseInt(pid)
					}));
				}
				fileTypeService.lists({id:['in',ids]},function(err,result){
					callback(err,result);
				});
			}
		],function(err,result){
			if(err){
				logService.log(req, '服务器出错，获取附件类型列表失败');
				return res.status(500).end(err);
			}
			let resList = utils.buildTreeTable(result);
			return res.status(200).json({
				code: 'SUCCESS',
				data:resList,
				msg:''
			});
		});
	} else {
		fileTypeService.lists(where,function(err, result){
			if(err){
				logService.log(req, '服务器出错，获取附件类型列表失败');
				return res.status(500).end(err);
			}
			let resLists = utils.buildTreeTable(result);
			return res.status(200).json({
				code: 'SUCCESS',
				data:resLists,
				msg:''
			});
		});
	}
}

exports.treelist = function(req,res){
	fileTypeService.allLists(function(err,result){
		if(err){
		  logService.log(req, '服务器出错，获取附件类型失败');
		  return res.status(500).end(err);
		}
		return res.status(200).json({
		  code: 'SUCCESS',
		  data: utils.buildTree(result,0)
		});
	});
}


