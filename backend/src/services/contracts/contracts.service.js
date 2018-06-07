/**
 *  contracts 表
 *  createBy susan
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    contractsModel = require('../../models/contracts/contracts.model'),
    contractsTypeService = require('./type.service'),
    CONSTANTS = require('../../config/constants.config');


exports.add = function(where,callback) {
    mysql.insert(contractsModel.tbname , where, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null, resId);
    });
}

exports.delete = function(where, callback){
	mysql.where(where).remove(contractsModel.tbname,function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null);
	});
}

exports.update = function (data, where, callback) {
	mysql.where(where).update(contractsModel.tbname, data, function(err,res){
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
        contractsType: function(callback){
            contractsTypeService.listsAll({status:CONSTANTS.CONTRACTS_TYPE_STATUS.VALID},function(err,row){
                callback(err,row);
            });
        },
        total:function(callback){
            mysql.where(where).count(contractsModel.tbname,function(err,res){
                callback(err,res); // res 将被赋值 total
            });
        },
        lists:['contractsType',function(result, callback){
            mysql.where(where)
                .order({id:'desc',publish_time:'desc'})
                .limit(page.index, page.size)
                .select(contractsModel.tbname, function(err,rows){
                    if(rows){
                        rows.map((row)=>{
                            row.content = _.unescape(row.content);
                            var typeid = row.typeid;
                            var cType = result.contractsType.filter((item)=>{
                                return item.id === typeid;
                            })[0];
                            row.contractsType = cType || { name: '类型已删除'};
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

exports.publish = function(contractsId,callback){
	let where = {
		id: parseInt(contractsId)
	};
	let data = {};
	contractsModel.pub(data);
	exports.update(data,where,callback);
}



// 查询一条数据
exports.one = function(where,callback){
    mysql.where(where).select(contractsModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        }
        return callback(null,rows[0]);
    });
}
