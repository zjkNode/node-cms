/**
 *  roles controller
 *  createby clmama
 */
var async = require('async'),
  _ = require('lodash'),
  utils = require('../../lib/utils'),
  logger = require('../../lib/logger.lib'),
  rolesModel = require('../../models/system/roles.model'),
  rolesService = require('../../services/system/roles.service'),
  logService = require('../../services/system/logs.service'),
  depService = require('../../services/system/dep.service');


exports.one = function(req,res){
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: '角色id 不能为空'}
    }
  });
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var map = {
    id: parseInt(req.query.id),
  };
  rolesService.one(map,function(err,row) {
    if(err){
      logService.log(req, '服务器出错，获取一条角色错误');
      return res.status(500).end(err);
    }
    return res.status(200).json({ code: 'SUCCESS',data:row, msg:'获取信息成功'});
  });
};

exports.add = function (req,res) {
  req.checkBody(rolesModel.validation);
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var roles = {
    name:req.body.name,
    desc:req.body.desc,
    depid:req.body.depid
  }
  rolesModel.auto(roles);

  rolesService.add(roles,function(err,resid) {
    if(err){
      logService.log(req, '服务器出错，新增角色失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
  });
}

exports.update = function(req,res) {
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: '角色id 不能为空'}
    }
  });
  req.checkBody(rolesModel.validation);

  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var map = {
    id: parseInt(req.params.id)
  };
  var roles = {
    id: parseInt(req.params.id),
    name:req.body.name,
    desc:req.body.desc,
    depid:req.body.depid
  };
  rolesModel.auto(roles);
  rolesService.update(roles, map, function(err){
    if(err){
      logService.log(req, '服务器出错，更新角色失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({code: 'SUCCESS',msg:'更新成功'});
  });
}

exports.updateAuth = function(req,res) {
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: '角色id 不能为空'}
    }
  });
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var map = {
    id: parseInt(req.params.id)
  };
  var roles = {
    id: parseInt(req.params.id),
    authorties:req.body.authorties
  };
  rolesModel.auto(roles);
  rolesService.update(roles, map, function(err){
    if(err){
      logService.log(req, '服务器出错，更新角色权限失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({code: 'SUCCESS',msg:'更新成功'});
  });
}

exports.delete = function(req,res){
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: '角色id 不能为空'}
    }
  });

  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  let map = {
    id: parseInt(req.params.id)
  };
  rolesService.delete(map, function(err){
    if(err){
      logService.log(req, '服务器出错，删除角色失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({code: 'SUCCESS',msg:'删除成功'});
  });
}

exports.lists = function(req,res) {
  let curUser = req.session.user;
  var where = {};
  let searchKey = req.query.keys;
  let page = {
    index: parseInt(req.query.pageIndex),
    size: parseInt(req.query.pageSize)
  }
  if(searchKey){
    where._complex = {
      _logic: 'or',
      name: ['like',searchKey],
      desc:['like',searchKey]
    }
  }
  if(utils.isAdmin(curUser.id)){
    // 超管
    async.waterfall([
      depService.allLists,
      function(depList, callback){
        rolesService.lists(where, page, function(error, resRoles){
          if(error){
            return callback(error);
          }
          resRoles.lists.map((role) => {
            let dep = depList.filter((dep) => {
              return dep.id === role.depid;
            })[0];
            role.dep = dep || { name: '部门已删除' };
          });
          return callback(null, resRoles);
        });
      }
    ], function(err, result){
      if(err){
        logService.log(req, '服务器出错，获取角色列表失败');
        return res.status(500).json(err);
      }
      return res.status(200).json({
                  code: 'SUCCESS',
                  data: result,
                  msg:''
                });
    });

  } else {
    // 非超管
    async.waterfall([
      function(callback){
        depService.getChildById(curUser.depid, function(error, depList) {
          return callback(error, depList);  
        });
      },
      function(depList, callback){
        let depIds = _.map(depList,'id');
        where.depid = ['in', depIds];
        rolesService.lists(where, page, function(error, resRoles) {
          if(error){
            return callback(error);
          }
          resRoles.lists.map((role) => {
            let dep = depList.filter((dep) => {
              return dep.id === role.depid;
            })[0];
            role.dep = dep || { name: '部门已删除' };
          });

          return callback(null, resRoles);
        })
      }
    ], function(err, result){
      return res.status(200).json({
                    code: 'SUCCESS',
                    data: result,
                    msg:''
                  });
    });

  } 
};

//根据部门ID获取该部门下所有的角色
exports.getListsByDepId = function(req, res){
  let where = {
    depid: parseInt(req.body.depId)
  };
  rolesService.getRoleLists(where, function(err, roles){
    if(err){
      logService.log(req, '服务器出错，获取部门角色失败，部门id:'+ depId);
      return res.status(500).end(err);
    }

    return res.status(200).json({ code:'SUCCESS', data: roles, msg: ''});
  });
};
