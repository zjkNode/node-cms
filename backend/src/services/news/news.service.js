var async = require('async'),
	_ = require('lodash'),
	CONSTANTS = require('../../config/constants.config'),
	mysql = require('../../lib/mysqldb.lib'),
	logger = require('../../lib/logger.lib'),
	newModel = require('../../models/news/news.model'),
	newsTypeService = require('./type.service');

exports.one = function(where,callback){
	mysql.where(where).select(newModel.tbname,function(err,rows){
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
    mysql.insert(newModel.tbname , news, function(err,resId){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null, resId);
	});
}

exports.update = function (data, where, callback) {
	mysql.where(where).update(newModel.tbname, data, function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null);
	});
}

exports.delete = function(where, callback){
	mysql.where(where).remove(newModel.tbname,function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null);
	});
}

exports.publish = function(newsId,callback){
	let where = {
		id: newsId
	};
	let data = {};
	newModel.pub(data);
	exports.update(data,where,callback);
}


exports.lists = function(where, page, callback){
	async.auto({
		// newsTypes: newsTypeService.allLists,
		total:function(callback){
			mysql.where(where).count(newModel.tbname,function(err,res){
				callback(err,res); // res 将被赋值 total
			});
		},
		lists:function(callback){
			mysql.where(where)
				 .order({ create_time: 'desc', publish_time: 'desc' })
				 .limit(page.index, page.size)
				 .select(newModel.tbname, function(err,rows){
					return callback(err,rows);
				});
		},
		newsTypes:["lists", function(results, callback){
			if(!results.lists || results.lists.length === 0){
				return callback();
			}

			let typeIds = _.union(_.map(results.lists, 'typeid'));
			let where = { id: ['in', typeIds] };
			newsTypeService.lists(where, function(err, newsTypes){
				return callback(err, newsTypes);
			});
		}]
	},function(error,results){ 
		// 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
		// results.total,results.lists
		if(error){
			logger.errorDB(__filename, error);
			return callback(error);
		}
		if(results.lists){
			results.lists.map((row)=>{
				row.content = _.unescape(row.content);
				var nType = results.newsTypes.filter((item)=>{
				 return item.id === row.typeid;
				})[0];
				row.newsType = nType || { name: '类型已删除'};
			});
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

// 分页获取 已经发布的所有新闻
exports.getNewsList = function(page, callback){
	let where = {
		status: CONSTANTS.NEWS_STATUS.PUBLISH
	};
	mysql.where(where)
		 .limit(page.index, page.size)
		 .select(newModel.tbname, function(err,rows){
			 if(err){
			 	logger.errorDB(__filename, err);
			 	return callback(err);
			 }
			callback(err,rows);
		});
}

exports.getListsByTypes = function(newsTypes,page,callback){
	let typeIds = [];
	newsTypes.map((item) => {
		typeIds.push(item.id);
	});
	let where = {
		typeid:['in',typeIds.join(',')],
		status: CONSTANTS.NEWS_STATUS.PUBLISH
	};
	async.parallel({
		total:function(callback){
			mysql.where(where)
				 .count(newModel.tbname,function(err,cnt){
			          callback(null,cnt);
				 });
		},
		lists:function(callback){
			mysql.where(where)
				 .order({publish_time:'desc'})
				 .limit(page.index, page.size)
				 .select(newModel.tbname,function(err,rows){
			          if(!rows) return callback(null,null);
			          rows.map((row) => {
			          	row.content = _.unescape(row.content);
			          });
			          callback(err,rows);
				 });
		}
	},function(err,results){
		if(err){
			logger.errorDB(__filename,err);
			return callback(err);
		}
		return callback(null,results);
	});
}

exports.randListsByTypes = function(newsTypes,limit,callback){
	let typeIds = [];
	newsTypes.map((item) => {
		typeIds.push(item.id);
	});
	let where = {
		typeid:['in',typeIds.join(',')],
		status: CONSTANTS.NEWS_STATUS.PUBLISH
	};
	mysql.where(where)
		 .order({fn:'RAND()'})
		 .limit(0, limit)
		 .select(newModel.tbname,function(err,rows){
		 	if(err){
		        logger.errorDB(__filename, err);
		        return callback(err);
		      }
		      if(!rows) return callback(null,null);
		      rows.map((row) => {
		      	row.content = _.unescape(row.content);
		      })
		      return callback(null,rows);
		 });
}



//栏目下所有新闻返回
exports.getNewsListByTypeId = function(newsTypeId,callback){
    let typeIds = [];
    newsTypeId.map((item) => {
        typeIds.push(item.id);
    });
    let where = {
        typeid:['in',typeIds.join(',')],
        status: CONSTANTS.NEWS_STATUS.PUBLISH
    };
    async.parallel({
        total:function(callback){
            mysql.where(where)
                .count(newModel.tbname,function(err,cnt){
                    callback(null,cnt);
                });
        },
        lists:function(callback){
            mysql.where(where)
                .order({publish_time:'desc'})
                .select(newModel.tbname,function(err,rows){
                    if(!rows) return callback(null,null);
                    rows.map((row) => {
                        row.content = _.unescape(row.content);
                    });
                    callback(err,rows);
                });
        }
    },function(err,results){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        }
        return callback(null,results);
    });
}
