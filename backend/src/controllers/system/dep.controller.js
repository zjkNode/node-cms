var async = require('async'),
	_ = require('lodash'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	CONSTANTS = require('../../config/constants.config'),
	depModel = require('../../models/system/dep.model'),
	depService = require('../../services/system/dep.service'),
	logService = require('../../services/system/logs.service'),
	userService = require('../../services/system/user.service'),
	roleService = require('../../services/system/roles.service');

exports.add = function (req,res) {
	req.checkBody(depModel.validation);
	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	var pid = parseInt(req.body.pids[req.body.pids.length - 1]);
	var dep = {
		name:req.body.name,
		pid: pid < 0 ? 0 : pid,
		pids: parseInt(req.body.pids[0]) < 0 ? 0 : req.body.pids.join(',')
	};
	depModel.auto(dep);

	depService.add(dep,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增部门失败: '+ dep.name );
			return res.status(500).end(error);
		}
		return res.status(200).json({ code: 'SUCCESS', msg:'新增部门成功'});
	});

}

exports.update = function(req,res) {
	req.checkParams({
	    'id': { notEmpty: { options: [true], errorMessage: '部门id 不能为空' }
	    	}
	  });
	req.checkBody(depModel.validation);

	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	var pid = parseInt(req.body.pids[req.body.pids.length-1]);
	var where = {
		id: parseInt(req.params.id)
	};
	var dep = {
		id: parseInt(req.params.id),
		name:req.body.name,
		pid: pid < 0 ? 0 : pid,
		pids:parseInt(req.body.pids[0]) < 0 ? 0 : req.body.pids.join(','),
		status: parseInt(req.body.status)
	};
	depService.update(dep, where, function(err){
		if(err){
			logService.log(req, '服务器出错，更新部门信息失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新部门信息成功'});
	});
}

exports.delete = function(req,res){
	req.checkParams({
		'id': { notEmpty: { options: [true], errorMessage: '部门id 不能为空'}
	    }
	});

	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	let depId = parseInt(req.params.id);
	
	async.parallel({
		existChildDeps: function(callback){
			// 检查是否存在子部门
			depService.getChildById(depId, function(err, deps){
				let isExist = deps && deps.length > 1; // 第一个是自身
				return callback(err, isExist);
			});
		},
		existRoles: function(callback){
			// 检查部门下是否存在角色设置
			var where = {
				depid: depId
			};
			roleService.getRoleLists(where, function(err,roles){
				let isExist = roles && roles.length > 0;
				return callback(err, isExist);
			})
		},
		existUser: function(callback){
			// 查检部门下是否存在用户
			userService.getUsersByDepId(depId, function(err, users){
				let isExist = users && users.length > 0;
				return callback(err, isExist);
			});
		}
	}, function(err, results){
		if(err){
			logService.log(req, '服务器出错，检查部门依赖关系出错，删除部门失败');
			return res.status(500).end(err);
		}
		let linkErrs = [];
		if(results.existChildDeps){
			linkErrs.push({code:'EXIST_CHILD_DEP', msg:'该部门下存在子部门，不能删除'});
		}
		if(results.existRoles){
			linkErrs.push({ code:'EXIST_ROLES', msg:'该部门下有角色设置，不能删除'})
		}
		if(results.existUser){
			linkErrs.push({ code:'EXIST_USERS', msg: '该部门下存在用户，不能删除'})
		}
		if(linkErrs.length > 0){
			return res.status(200).json({ code: 'EXIST_REFERENCE', data: linkErrs, msg: '该部门存在依赖关系，无法删除'});
		}
		let where = { id: depId };
		depService.delete(where, function(error, callback){
			if(error){
				logService.log(req, '服务器出错，删除部门失败');
				return res.status(500).end(error);
			}
			return res.status(200).json({code:'SUCCESS', msg:'删除部门成功'});
		});
	});
}

exports.lists = function(req,res) {
	var where = {};
	let searchKey = req.query.keys;
	let curUser = req.session.user;
	if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like',searchKey]
		};
	}

	if(utils.isAdmin(curUser.id)){

		async.waterfall([
			function(callback){
				depService.lists(where, function(error, resList){
					callback(error, resList);
				});
			},
			function(resList, callback){
				if(!searchKey){
					return callback(null, resList);
				}

				if( !resList || resList.length == 0){
					return callback(null, null);
				}
				let ids = [];
				_.forEach(resList, (dep) => {
					ids.push(dep.id);
					ids = _.union(ids,dep.pids.split(',').map((pid)=>{ return parseInt(pid); }))
				})
				depService.lists({ id: ['in', ids]}, function(error,resList){
					callback(error, resList);
				});
			}
		],function(err,result){
			if(err){
				logService.log(req, '服务器出错，获取部门列表失败');
				return res.status(500).end(err);
			}
			let resList = result ? utils.buildTreeTable(result) : [];
			return res.status(200).json({
				code: 'SUCCESS',
				data: resList
			});
		});

	}  else {

		async.waterfall([
			function(callback){
				depService.getChildById(curUser.depid, function(error,depList){
					return callback(error,depList);
				});
			},
			function(depList, callback){
				let ids = [];
				_.forEach(depList, (dep) => {
					ids.push(dep.id);
					ids = _.union(ids,dep.pids.split(',').map((pid)=>{ return parseInt(pid); }))
				});

				let idMap = ['in', ids];
				where._complex ? where._complex.id = idMap : where.id = idMap;
				depService.lists(where,function(error,resList){
					callback(error, resList);
				});
			}
		],function(err,result){
			if(err){
				logService.log(req, '服务器出错，获取部门列表失败');
				return res.status(500).end(err);
			}
			let resList = result ? utils.buildTreeTable(result) : [];
			return res.status(200).json({
				code: 'SUCCESS',
				data: resList
			});
		});
	}
}

exports.treelist = function(req,res){
	let curUser = req.session.user;
	if(utils.isAdmin(curUser.id)){
		depService.allLists(function(err,result){
			if(err){
			  logService.log(req, '服务器出错，获取部门类型失败');
			  return res.status(500).end(err);
			}
			let resList = result ? utils.buildTree(result,0) : [];
	      	resList.unshift({ name:'顶级', id:-1, pid: 0});
			return res.status(200).json({
			  code: 'SUCCESS',
			  data: resList
			});
		});
	} else {
		depService.getChildById(curUser.depid,function(err,result){
			if(err){
				logService.log(req, '服务器出错，获取部门失败，部门id:'+ curUser.depid);
				return res.status(500).end(err);
			}
			// 过滤状态 状态为正常的部门
			let resList = _.filter(result, 'status', CONSTANTS.DEP_STATUS.NORMAL) || [];

			return res.status(200).json({ 
					code:'SUCCESS', 
					data: utils.buildTree(resList,result[0].pid),
					msg: ''});
		})
	}
}