var async = require('async'),
  _ = require('lodash'),
  mysql = require('../../lib/mysqldb.lib'),
  logger = require('../../lib/logger.lib'),
  cache = require('../../lib/cache.lib'),
  rolesModel = require('../../models/system/roles.model'),
  depService=require('../../services/system/dep.service');


exports.one = function(where,callback){
  mysql.where(where).select(rolesModel.tbname,function(err,rows){
    if(err){
      logger.errorDB(__filename,err);
      return callback(err);
    }
    if(!rows){
      logger.info('role is not exist:'+ JSON.stringify(where));
      return callback();
    }
    return callback(null,rows[0]);
  });
};
/**
 * 插入数据
 */
exports.add = function(roles,callback) {
  mysql.insert(rolesModel.tbname , roles, function(err,resid){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null, resid);
  });
};

/**
 * 更新数据
 */
exports.update = function (data, where, callback) {
  mysql.where(where).update(rolesModel.tbname, data, function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null);
  });
}
/**
 * 删除数据
 */
exports.delete = function(where, callback){
  mysql.where(where).remove(rolesModel.tbname,function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null);
  });
};

/**
 * 总数据
 */
 exports.lists = function(where, page, callback){
  async.auto({
    total: function(callback){
      mysql.where(where).count(rolesModel.tbname,function(err,res){
        return callback(err,res); // res 将被赋值 total
      });
    },
    lists: function(callback){
      mysql.where(where)
        .order({id:'desc'})
        .limit(page.index, page.size)
        .select(rolesModel.tbname, function(err,rows){
          return callback(err, rows);
        });
    }
  },function(error,results){
    if(error){
      logger.errorDB(__filename, error);
      return callback(error);
    }
    let resData = {
      total:results.total || 0,
      pageIndex:page.index,
      pageSize: page.size,
      lists: results.lists || []
    }
    return callback(null,resData);
  });
}

exports.getRoleLists = function(where,callback){
  mysql.where(where)
       .select(rolesModel.tbname, function(err, rows){
        if(err){
          logger.errorDB(__filename, err);
          return callback(err);
        }
        return callback(null, rows);
       });
}