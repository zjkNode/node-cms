var async = require('async'),
	_ = require('lodash'),
	util = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	CONSTANTS = require('../../config/constants.config'),
	menuModel = require('../../models/system/menu.model'),
	menuService = require('../../services/system/menu.service'),
	logService = require('../../services/system/logs.service');

exports.add = function (req,res) {
	req.checkBody(menuModel.validation);
	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	var newMenu = {
		name:req.body.name,
		alink:req.body.alink,
		pid:parseInt(req.body.pid),
		pids: req.body.pids,
		sort: parseInt(req.body.sort),
		status:parseInt(req.body.status)
	}
	menuModel.auto(newMenu);
	menuService.add(newMenu,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增菜单失败');
			return res.status(500).end(error);
		}
		logService.log(req, '新增菜单成功'+ newMenu.name);
		return res.status(200).json({ code: 'SUCCESS', msg:'新增菜单成功'});
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
		id: parseInt(req.params.id)
	};
	menuService.delete(map, function(err){
		if(err){
			logService.log(req, '服务器出错，删除菜单失败');
			return res.status(500).end(err);
		}
		logService.log(req, '删除菜单成功');
		return res.status(200).json({code:'SUCCESS', msg:'删除菜单成功'});
	});
}

exports.update = function(req,res) {
	req.checkParams({
	    'id': {
	    	notEmpty: { options: [true], errorMessage: 'id 不能为空'}
	    }
	});
	req.checkBody(menuModel.validation);
	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	var map = {
		id: parseInt(req.params.id)
	};
	var menu = {
		id: parseInt(req.params.id),
		name:req.body.name,
		alink:req.body.alink,
		pid:parseInt(req.body.pid),
		pids:req.body.pids,
		sort:parseInt(req.body.sort),
		status: parseInt(req.body.status)
	}
	menuService.update(menu, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新失败');
			return res.status(500).end(err);
		}
		logService.log(req, '更新成功');
		return res.status(200).json({code:'SUCCESS', msg:'更新成功'});
	});
}

exports.listsTree = function(req,res){
    menuService.listsValid(function(err,rs){
		if(err){
			logService.log(req, '服务器出错，获取菜单列表失败');
			return res.status(500).end(err);
		}
		// 权限过滤 菜单
		let curUser = req.session.user;
		let menus = [];
		if(util.isAdmin(curUser.id)){
			menus = rs;
		} else {
			menus = _.filter(rs, (item)=>{
				return util.authCheck(curUser, item.alink);
			});
		}
		return res.status(200).json({
            code: 'SUCCESS',
            data: util.buildTree(menus,0),
            msg: ""
        });
    })
};

exports.lists = function(req,res){
	var where = {};
	let searchKey = req.query.keys;
    if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like',searchKey],
			alink: ['like',searchKey]
		}
		async.waterfall([
			function(callback){
				menuService.listsAll(where,function(error,resList){
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
				menuService.listsAll({id:['in',ids]},function(error, resList){
					callback(error, resList);
				});
  
	  		}],function(err, result){
				if(err){
					logService.log(req, '服务器出错，获取菜单列表失败');
					return res.status(500).end(err);
				}
				let resList = util.buildTreeTable(result);
				return res.status(200).json({
					code: 'SUCCESS',
					data:{
						allData:resList
					}
				});
	  		});
	} else {
		menuService.listsAll(where,function(err, result){
			if(err){
				logService.log(req, '服务器出错，获取菜单列表失败');
				return res.status(500).end(err);
			}
			let resList = util.buildTreeTable(result);
			return res.status(200).json({
				code: 'SUCCESS',
				data:{
					allData:resList
				}
			});
	  	});
	}
}
