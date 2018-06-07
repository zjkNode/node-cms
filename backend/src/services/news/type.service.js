var async = require('async'),
  _ = require('lodash'),
  mysql = require('../../lib/mysqldb.lib'),
  logger = require('../../lib/logger.lib'),
  cache = require('../../lib/cache.lib'),
  CONSTANTS = require('../../config/constants.config'),
  newsTypeModel = require('../../models/news/type.model'),
  baseService = require('../base.service');

exports.one = function(where,callback){
  mysql.where(where).select(newsTypeModel.tbname,function(err,rows){
    if(err){
      logger.errorDB(__filename,err);
      return callback(err);
    }
    if(!rows){
      logger.info('news type is not exist:'+ JSON.stringify(where));
      return callback();
    } 
    return callback(null,rows[0]);
  });
}
/**
 * 插入分类数据
 */
exports.add = function(user,callback) {
  mysql.insert(newsTypeModel.tbname , user, function(err,resId){
    if(err){
      logger.errorDB(__filename, err);
      callback(err);
    }else{
      cache.del('cacheNewsTypes');
      callback(null);
    }
  });
};

/**
 * 更新分类类型
 */
exports.update = function (data, where, callback) {
  async.waterfall([
    function(callback){
      let params = {
        tbname: newsTypeModel.tbname,
        pids: data.pids == '0' ? '' : data.pids,
        id: data.id
      };
      mysql.execute(baseService.SQL_updateChildPids,params,function(err, res){
        callback(err, res);
      });
    },
    function(result, callback){
      mysql.where(where).update(newsTypeModel.tbname, data, function(err,res){
        if(err){
          logger.errorDB(__filename, err);
          return callback(err);
        }
        return callback(null);
      });
    }
  ], function(err, result){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    cache.del('cacheNewsTypes');
    return callback(null);
  });
};
/**
 * 删除分类类型
 */
exports.delete = function(where, callback){
  mysql.where(where).remove(newsTypeModel.tbname,function(err,res){
    cache.del('cacheNewsTypes');
    if(err){
      logger.errorDB(__filename, err);
      callback(err);
    }else{
      callback(null,true)
    }
  });
};
/**
 * 查询分类类型
 */

exports.allLists = function(callback){
  let cacheNewsTypes = cache.get('cacheNewsTypes');
    if(cacheNewsTypes){
        return callback(null, _.cloneDeep(cacheNewsTypes));
    }

  let where ={
    status:CONSTANTS.NEWS_TYPE_STATUS.VALID
  };
  mysql.where(where).select(newsTypeModel.tbname,function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    cache.set('cacheNewsTypes', res);
    return callback(null,res);
  });
};

exports.lists = function(where,callback){
  mysql.where(where)
    .order({id:'asc'})
    .select(newsTypeModel.tbname, function(err,rows){
      if(err){
        logger.errorDB(__filename, err);
        return callback(err);
      }
      return callback(null,rows);
    });
};

// 根据条件获取 所有子类别
exports.getChildTypes = function(where,callback){
  async.parallel({
    newsType:function(callback){
      exports.one(where, callback);
    },
    allLists:exports.allLists
  },function(err,results){
    if(err){
      return callback(err);
    }
    if(!results.newsType){
      return callback();
    }

    let suffix_pids = results.newsType.pids + ',' + results.newsType.id;
    suffix_pids = _.trimStart(suffix_pids,'0,'); // 去掉 类似0,1,2 中的0,

    let cTypes = results.allLists.filter((item) => {
      return _.startsWith(item.pids, suffix_pids);
    });

    return callback(null,cTypes);
  });
  
}

// 根据类型Id 获取所有子类型
exports.getChildTypesById = function(typeid,callback){
  let where = {
    id:parseInt(typeid)
  };
  exports.getChildTypes(where,callback);
}

// 根据类型code 获取所有子类型
exports.getChildTypesByCode = function(typeCode,callback){
  let where = {
    code: typeCode,
    status: CONSTANTS.NEWS_TYPE_STATUS.VALID
  };
  exports.getChildTypes(where,callback);
}

// 根据条件获取所有父类型 最后一个是自己
exports.getParentTypes = function(where, callback){

  async.parallel({
    newsType:function(callback){
      exports.one(where, callback);
    },
    allLists:exports.allLists
  },function(err,results){
    if(err){
      return callback(err);
    }
    if(!results.newsType){
      return callback();
    }
    let pids = _.isEmpty(results.newsType.pids) ? [] : results.newsType.pids.split(',');
    pids.push(results.newsType.id+'');
    let pnTypes = results.allLists.filter((item) => {
      return _.includes(pids, item.id+'');
    });

    return callback(null,pnTypes);
  });

}

// 根据类型id 获取所有父类型，最后一个是自己
exports.getParentTypesById = function(typeid, callback){
  let where = {
    id: parseInt(typeid)
  };
  exports.getParentTypes(where,callback);
}

// 根据类型code 获取所有父类型，最后一个是自己
exports.getParentTypesByCode = function(typeCode, callback){
  let where = {
    code: _.trim(typeCode),
    status: CONSTANTS.NEWS_TYPE_STATUS.VALID
  };
  exports.getParentTypes(where,callback);
}


// 根据 typecode 获取类型：{newsType:{}, parents:{}, children:{}}
exports.getTypesByCode = function(typeCode,callback){
  async.auto({
    newsType:function(callback){
      let where = {
        code: typeCode,
        status: CONSTANTS.NEWS_TYPE_STATUS.VALID
      };
      exports.one(where,callback);
    },
    parents:['newsType',function(results,callback){
      let pids = results.newsType.pids.split(',');
      let where = {
        id:['in', pids],
        status: CONSTANTS.NEWS_TYPE_STATUS.VALID
      };
      mysql.where(where)
         .select(newsTypeModel.tbname,function(err,resTypes){
          if(err) return callback(err);

          resTypes = resTypes || [];
          resTypes.push(results.newsType);
          callback(null,resTypes);
         });
    }],
    children:['newsType',function(results,callback){
      let where = {
        pids:['like', results.newsType.id],
        status: CONSTANTS.NEWS_TYPE_STATUS.VALID
      };
      mysql.where(where)
         .select(newsTypeModel.tbname,function(err,resTypes){
          if(err) return callback(err);

          resTypes = resTypes || [];
          resTypes.splice(0, 0, results.newsType);
          callback(null,resTypes);
         });
    }]
  },function(err,results){
    if(err){
      logger.errorDB(__filename,err);
      return callback(err);
    }
    return callback(err,results);
  });
}
