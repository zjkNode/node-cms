/**
 *  contracts_type 表
 *  createBy susan
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    contractsTypeModel = require('../../models/contracts/type.model'),
    CONSTANTS = require('../../config/constants.config'),
    baseService = require('../base.service');
    
exports.add = function(where, callback){
    mysql.insert(contractsTypeModel.tbname , where, function(err,rs){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null, rs);
    });
};

exports.delete = function(where, callback){
    mysql.where(where).remove(contractsTypeModel.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        };
        return callback(null);
    });
};

exports.update = function (data, where, callback) {
    async.waterfall([
		function(callback){
			let params = {
				tbname: contractsTypeModel.tbname,
				pids: data.pids == '0' ? '' : data.pids,
				id: data.id
			};
			mysql.execute(baseService.SQL_updateChildPids,params,function(err, res){
				callback(err, res);
			});
		},
		function(result, callback){
            mysql.where(where).update(contractsTypeModel.tbname, data, function(err,res){
                if(err){
                    logger.errorDB(__filename, err);
                    return callback(err);
                };
                return callback(null);
            });
		}
	], function(err, result){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null);
	});
    
};

exports.listsAll = function(where,callback){
    mysql.where(where)
         .order({id:'asc'})
         .select(contractsTypeModel.tbname, function(err,rs){
            if(err){
                logger.errorDB(__filename, err);
                return callback(err);
            };
            
            return callback(err,rs);
         })
}

// 查询一条数据
exports.one = function(where,callback){
    mysql.where(where).select(contractsTypeModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        }
        return callback(null,rows[0]);
    });
}
