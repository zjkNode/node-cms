let async = require('async'),
	_ = require('lodash'),
	util = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	userModel = require('../../models/system/user.model'),
	userService = require('../../services/system/user.service'),
	logService = require('../../services/system/logs.service'),
	depService = require('../../services/system/dep.service'),
	roleService = require('../../services/system/roles.service');

exports.add = function (req,res) {
	req.checkBody(userModel.validation);
	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	let depid = parseInt(req.body.depids[req.body.depids.length - 1]);
	let user = {
		email:req.body.email,
		nickname:req.body.nickname,
		password:util.decrypt(req.body.password),
		depid: depid,
		roleid: parseInt(req.body.roleid),
		phone:req.body.phone || ''
	}
	userModel.auto(user);

	userService.add(user,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增用户失败');
			return res.status(500).end(error);
		}
		logService.log(req, '新增用户成功'+ user.email);
		return res.status(200).json({ code: 'SUCCESS', msg:'新增用户成功'});
	});

}

exports.update = function(req,res) {
	req.checkParams({
	    'id': { notEmpty: { options: [true], errorMessage: '用户id 不能为空' }
	    }
	  });
	req.checkBody(userModel.validation);

	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	let map = {
		id: parseInt(req.params.id)
	};
	let depid = parseInt(req.body.depids[req.body.depids.length - 1]);
	let user = {
		id: parseInt(req.params.id),
		email:req.body.email,
		nickname:req.body.nickname,
		password:util.decrypt(req.body.password),
		depid: depid,
		roleid: parseInt(req.body.roleid),
		status: parseInt(req.body.status),
		phone:req.body.phone || ''
	}
	userModel.auto(user);
	userService.update(user, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新用户信息失败');
			return res.status(500).end(err);
		}
		logService.log(req, '更新用户信息成功');
		return res.status(200).json({code:'SUCCESS', msg:'更新用户信息成功'});
	});
}

exports.delete = function(req,res){
	req.checkParams({
		'id': { notEmpty: { options: [true], errorMessage: '用户id 不能为空'}
	    }
	});

	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	let map = {
		id: parseInt(req.params.id)
	};
	userService.delete(map, function(err){
		if(err){
			logService.log(req, '服务器出错，删除用户失败');
			return res.status(500).end(err);
		}
		logService.log(req, '删除用户成功');
		return res.status(200).json({code:'SUCCESS', msg:'删除用户成功'});
	});
}

exports.lists = function(req,res) {
	let where = {};
	let searchKey = req.query.keys;
	let page = {
		index: parseInt(req.query.pageIndex),
		size: parseInt(req.query.pageSize)
	};
	if(searchKey){
		where._complex = {
			_logic: 'or',
			email: ['like',searchKey],
			nickname: ['like',searchKey],
			phone: ['like',searchKey],
		};
	}
	let curUser = req.session.user;

	if(!util.isAdmin(curUser.id)){
		where.depid = curUser.depid;
	}

	userService.lists(where, page, function(err, result){
		if(err){
			logService.log(req, '服务器出错，获取用户列表失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({
			code: 'SUCCESS',
			data: result,
			msg:''
		});
	});
}