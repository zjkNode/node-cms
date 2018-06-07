var async = require('async'),
  _ = require('lodash'),
  CONSTANTS = require('../../config/constants.config'),
  mysql = require('../../lib/mysqldb.lib'),
  logger = require('../../lib/logger.lib'),
  filesModel = require('../../models/files/files.model'),
  fileTypeService = require('./type.service'),
  configService = require('../system/config.service');

exports.one = function(where,callback){
  mysql.where(where).select(filesModel.tbname,function(err,rows){
    if(err){
      logger.errorDB(__filename,err);
      return callback(err);
    }
    if(!rows || rows.length == 0) return callback(new Error('ERR_NOT_FIND'));
    var row = rows[0];
    row.content = _.unescape(row.content);
    return callback(null,row);
  });
}

exports.add = function(news,callback) {
  mysql.insert(filesModel.tbname , news, function(err,resId){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null, resId);
  });
};

exports.update = function (data, where, callback) {
  mysql.where(where).update(filesModel.tbname, data, function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null);
  });
};

exports.delete = function(where, callback){
  mysql.where(where).remove(filesModel.tbname,function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null);
  });
};


exports.lists = function(where, page, callback){
  // 并行无关联
  async.auto({
    filesTypes: fileTypeService.allLists,
    total:function(callback){
      mysql.where(where).count(filesModel.tbname,function(err,res){
        callback(err,res); // res 将被赋值 total
      });
    },
    lists:['filesTypes',function(result,callback){
      mysql.where(where)
        .order({id:'desc'})
        .limit(page.index, page.size)
        .select(filesModel.tbname, function(err,rows){
          if(rows){
            rows.map((row)=>{
              var typeid = row.typeid;
              var fType = result.filesTypes.filter((item)=>{
                return item.id === typeid;
              })[0];
              // nTypes.length > 0 ? row.pids = nTypes[0].pids : row.typeid = -1;

              row.filesTypes = fType || { name: '类型已删除'};
            });
          }
          callback(err,rows);
        });
    }]
  },function(error,results){
    // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
    // results.total,results.lists
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