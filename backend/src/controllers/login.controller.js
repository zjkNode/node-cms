
var async = require('async'),
  _ = require('lodash'),
  utils = require('../lib/utils'),
  logger = require('../lib/logger.lib'),
  userService = require('../services/system/user.service'),
  logService = require('../services/system/logs.service'),
  ruleService = require('../services/system/rule.service'),
  roleService = require('../services/system/roles.service'),
  depService = require('../services/system/dep.service');


exports.signIn = function (req,res) {
   req.checkBody({
    'email': {
        notEmpty: { options: [true], errorMessage: 'email 不能为空' },
        isEmail: { errorMessage: 'email 格式不正确' }
      },
      'password': {
        notEmpty: { options: [true], errorMessage: '密码 不能为空' },
        isLength: { options: [6], errorMessage: '密码 不能小于 6 位'}
      }
   });

  if (req.validationErrors()) {
  	logger.error(__filename, '参数验证失败', req.validationErrors());
  	return res.status(400).json(req.validationErrors());
  }
  var params = {
    email:req.body.email
  };

  async.auto({
    user: function(callback) {
      userService.one(params, function(error, user){
        
        if(error){
          logService.log(req,'登录失败:服务器出错');
          return callback(error);
        }
        if(!user){
          return callback(new Error('NOT_EXIST_USER'), {code:'NOT_EXIST_USER', msg:'用户名不存在'});
        }
        if(user.password !== utils.decrypt(req.body.password)){
          return callback(new Error('ERR_USER_OR_PWD'), {code:'ERR_USER_OR_PWD', msg:'用户名或密码不正确'});
        }
        delete user.password; // 验证完成，移除密码
        return callback(null, user);
      });
    },
    role:['user', function(results, callback){
      roleService.one({ id: results.user.roleid }, function(error, role){
        return callback(error, role);
      });
    }],
    deps:['user', function(results, callback){
      depService.getParentsById(results.user.depid, function(error, deps){
        return callback(error, deps);
      })
    }],
    rules:['user', 'role', function(results, callback){
      // 超管 所有权限
      if(utils.isAdmin(results.user.id)){
        return callback(null, ['ALL']);
      }
      ruleService.getRulesByRole(results.role, function(error, rules){
        if(error){
          logService.log(req, '获取用户权限异常: '+ JSON.stringify(results.user));
          return callback(error);
        }
        let rulesArr = _.map(rules, 'path');
        return callback(error, rulesArr);
      });
    }]
  }, function(err, results) {
      if(err){
        if(results){
          logService.log(req, results);
          return res.status(200).json(results);
        }
        return res.status(500).end(error);
      }
      let curUser = results.user;
      curUser.role = results.role;
      curUser.deps = results.deps;
      curUser.rules = results.rules;

      req.session.user = curUser;
      logService.log(req,'登录成功:'+ curUser.nickname);
      return res.status(200).json({
        code:'SUCCESS',
        data: curUser
      });
  });

  // async.waterfall([
  //   function(callback){
  //     userService.one(params, function(error, user){
  //       if(error){
  //         logService.log(req,'登录失败:服务器出错');
  //         return callback(error);
  //       }
  //       if(!user){
  //         return callback(new Error('NOT_EXIST_USER'), {code:'NOT_EXIST_USER', msg:'用户名不存在'});
  //       }
  //       if(user.password !== req.body.password){
  //         return callback(new Error('ERR_USER_OR_PWD'), {code:'ERR_USER_OR_PWD', msg:'用户名或密码不正确'});
  //       }
  //       delete user.password; // 验证完成，移除密码
  //       return callback(null, user);
  //     });
  //   },
  //   function(user, callback){
  //     // 超管 所有权限
  //     if(utils.isAdmin(user.id)){
  //       user.rules = ['ALL'];
  //       return callback(null, user);
  //     }

  //     // 根据用户，查询用户权限，用户权限是对每个数据接口定义好的权限 
  //     ruleService.getRulesByRoleId(user.roleid, function(error, rules){
  //       if(error){
  //         logService.log(req, '获取用户权限异常: '+ JSON.stringify(user));
  //         return callback(error);
  //       }
  //       user.rules = _.map(rules, 'path');
  //       return callback(null, user);
  //     });
  //   }
  // ], function(error, result) {
  //   if(error){
  //     if(result){
  //       logService.log(req, result.msg);
  //       return res.status(200).json(result);
  //     }

  //     return res.status(500).end(error);
  //   }

  //   req.session.user = result;
  //   logService.log(req,'登录成功:'+ result.nickname);
  //   return res.status(200).json({
  //     code:'SUCCESS',
  //     data:result
  //   });
  // });
}

exports.signOut = function(req, res){
  req.session.user = null;
  return res.status(200).json({ code:'SUCCESS', msg:'成功退出系统'});
}