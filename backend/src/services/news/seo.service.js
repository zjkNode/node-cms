var async = require('async'),
  _ = require('lodash'),
  mysql = require('../../lib/mysqldb.lib'),
  logger = require('../../lib/logger.lib'),
  seoModel = require('../../models/news/seo.model'),
  newsTypeService = require('./type.service');

exports.one = function(where,callback){

  mysql.where(where).select(newModel.tbname,function(err,rows){
    if(err){
      logger.errorDB(__filename,err);
      return callback(err);
    }
    if(!rows) return callback();
    return callback(null,rows[0]);
  });
}

exports.add = function(news,callback) {
  mysql.insert(seoModel.tbname , news, function(err,resId){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null, resId);
  });
}

exports.update = function (data, where, callback) {
  mysql.where(where).update(seoModel.tbname, data, function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null);
  });
}

exports.delete = function(where, callback){
  mysql.where(where).remove(seoModel.tbname,function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(err);
    }
    return callback(null);
  });
}

exports.lists = function(where, page, callback){
  // 并行无关联
  async.auto({
    newsTypes: newsTypeService.allLists,
    total:function(callback){
      mysql.where(where).count(seoModel.tbname,function(err,res){
        callback(err,res); // res 将被赋值 total
      });
    },
    lists:['newsTypes',function(result,callback){
      mysql.where(where)
           .order({id:'desc'})
           .limit(page.index, page.size)
           .select(seoModel.tbname, function(err,rows){
            if(rows){
              rows.map((row)=>{
                // row.content = _.unescape(row.content);
                var typeid = row.typeid;
                var nType = result.newsTypes.filter((item)=>{
                  return item.id === typeid;
                })[0];
                // nTypes.length > 0 ? row.pids = nTypes[0].pids : row.typeid = -1;

                row.newsType = nType || { name: '类型已删除'};
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

exports.getOneByTypeCode = function(typeCode,callback){
  let where = {
    'news_type.code': typeCode
  }
  mysql.join('left join `news_type` on `news_type`.`id` = `news_seo`.`typeid`')
       .fields(['`news_seo`.*'])
       .order({'news_seo.id':'desc'})
       .where(where)
       .select(seoModel.tbname,function(err, rows){
          if(err){
            logger.errorDB(__filename, err);
            return callback(err);
          }
          if(!rows) return callback(null,null);
          return callback(null,rows[0])
       });
}
