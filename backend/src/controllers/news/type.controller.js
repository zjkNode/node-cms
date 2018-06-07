/**
 *  newsTypes controller
 *  createby clmama
 */
var async = require('async'),
  _ = require('lodash'),
  logger = require('../../lib/logger.lib'),
  utils = require('../../lib/utils'),
  newsTypeModel = require('../../models/news/type.model'),
  newsTypeService = require('../../services/news/type.service'),
  logService = require('../../services/system/logs.service');

exports.add = function(req,res){
  req.checkBody(newsTypeModel.validation);
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var datas = req.body;
  newsTypeModel.auto(datas);
  async.parallel({
    validCode:function(callback){
      newsTypeService.one({code:datas.code},function(err,row){
        return callback(err,row);
      })
    },
    validPath:function(callback){
      newsTypeService.one({path:datas.path},function(err,row){
        return callback(err,row);
      })
    }
  },function(err,results){
    if(err){
      logService.log(req, '服务器出错，删除部门失败');
      return res.status(500).end(err);
    }
    let linkErrs = [];
    if(results.validCode){
      linkErrs.push({code:'EXIST_CODE', msg:'该类型代码重复,请重新填写'});
    }
    if(results.validPath){
      linkErrs.push({code:'EXIST_PATH', msg:'该类型路径重复,请重新填写'});
    }
    if(linkErrs.length > 0){
      return res.status(200).json({ code: 'EXIST_REFERENCE', data: linkErrs, msg: '该类型编辑存在重复，无法添加'});
    }
    newsTypeService.add(datas,function(err,result){
      if(err){
        logService.log(req, '服务器出错，新增类型失败');
        return res.status(500).end(error);
      }
      return res.status(200).json({ code: 'SUCCESS', msg:'新增新闻类型成功'});
    })
  })
};

exports.update = function(req,res){
  req.checkBody(newsTypeModel.validation);
  req.checkBody({
    'status': {
      notEmpty: {
        options: [true],
        errorMessage: '是否可见不可为空'
      }
    }
  });
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var params = req.body;
  var data = {
    id:parseInt(req.params.id),
    name:params.name,
    code:params.code,
    path:params.path,
    pids:params.pids,
    pid:parseInt(params.pid),
    desc:params.desc,
    status:parseInt(params.status)
  };
  newsTypeModel.auto(data);
  var wheres = {
    id:parseInt(req.params.id)
  };

  async.parallel({
    validCode:function(callback){
      newsTypeService.one({ id:['!=', data.id], code:data.code},function(err,row){
        return callback(err,row);
      })
    },
    validPath:function(callback){
      newsTypeService.one({ id:['!=', data.id], path:data.path},function(err,row){
        return callback(err,row);
      })
    }
  },function(err,results){
    if(err){
      logService.log(req, '服务器出错，检查类型更新出现字段重复，更新类型失败');
      return res.status(500).end(err);
    }
    let linkErrs = [];
    if(results.validCode){
      linkErrs.push({code:'EXIST_CODE', msg:'该类型代码重复,请重新填写'});
    }
    if(results.validPath){
      linkErrs.push({code:'EXIST_PATH', msg:'该类型路径重复,请重新填写'});
    }
    if(linkErrs.length > 0){
      return res.status(200).json({ code: 'EXIST_REFERENCE', data: linkErrs, msg: '该类型存在重复，无法更新'});
    }
    newsTypeService.update(data,wheres,function(err){
      if(err){
        logService.log(req, '服务器出错，更新新闻类型失败');
        return res.status(500).end(err);
      }
      logService.log(req, '更新新闻类型成功'+data.id);
      return res.status(200).json({code:'SUCCESS', msg:'更新新闻类型成功'});
    })
  })
};

exports.delete = function(req,res){
  req.checkParams({
    'id': {
      notEmpty: {
        options: [true],
        errorMessage: '新闻id 不能为空'
      }
    }
  });
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var params = req.params;
  let wheres = {
    id: parseInt(params.id)
  };

  async.parallel({
    existChildPid:function(callback){
      newsTypeService.one({pid:wheres.id},function(err,row){
        return callback(err,row);
      })
    }
  },function(err,results){
    if(err){
      logService.log(req, '服务器出错，检查类型出现错误，删除类型失败');
      return res.status(500).end(err);
    }
    let linkErrs = [];
    if(results.existChildPid){
      linkErrs.push({code:'EXIST_CHILD_PID', msg:'该类型有子集,不可删除'});
    }
    if(linkErrs.length > 0){
      return res.status(200).json({ code: 'EXIST_REFERENCE', data: linkErrs, msg: '该类型存在父子级关系，无法删除'});
    }
    newsTypeService.delete(wheres, function(err,result){
      if(err){
        logService.log(req, '服务器出错，删除新闻类型失败');
        return res.status(500).end(err);
      }
      logService.log(req, '删除新闻类型成功'+wheres.id);
      return res.status(200).json({
        code:'SUCCESS',
        msg:'删除成功'});

    });
  });
};

exports.lists = function(req,res) {
  var where = {
  };
  let searchKey = req.query.name;
  if(searchKey){
    where._complex = {
      _logic: 'or',
      name: ['like',searchKey],
      desc:['like',searchKey],
      path:['like',searchKey]
    };

  async.waterfall([
    function(callback){
      newsTypeService.lists(where,function(error,resList){
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
      newsTypeService.lists({id:['in',ids]},function(error, resList){
        callback(error, resList);
      });

    }],function(err, result){
      if(err){
        logService.log(req, '服务器出错，获取新闻类型失败');
        return res.status(500).end(err);
      }
      logService.log(req, '搜索新闻类型成功');
      let resList = utils.buildTreeTable(result);
      return res.status(200).json({
        code: 'SUCCESS',
        data:resList
      });
    });
  } else {
    newsTypeService.lists(where,function(err, result){
      if(err){
        logService.log(req, '服务器出错，获取新闻类型失败');
        return res.status(500).end(err);
      }
      let resList = utils.buildTreeTable(result);
      return res.status(200).json({
        code: 'SUCCESS',
        data:resList
      });
    });
  }
};
exports.allLists = function(req,res){
  newsTypeService.allLists(function(err,result){
    if(err){
      logService.log(req, '服务器出错，获取新闻类型失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({
      code: 'SUCCESS',
      data:utils.buildTree(result,0)
    })
  })
}

