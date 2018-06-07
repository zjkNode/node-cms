/**
 *  contracts_vm 表
 *  createBy susan
 */
var _ = require('lodash'),
    async = require('async'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    contractsVmModel = require('../../models/contracts/vm.model'),
    CONSTANTS = require('../../config/constants.config');

exports.add = function(vm,callback) {
   mysql.insert(contractsVmModel.tbname , vm, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null, resId);
    });    
}
exports.delete = function( where, callback){
    mysql.where(where).remove(contractsVmModel.tbname, function(err,res){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        }
        return callback(null);
    })
}

exports.update = function (data, where, callback) {
	mysql.where(where).update(contractsVmModel.tbname, data, function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null);
	});
}
exports.isExist = function(where,callback){
    mysql.where(where).count(contractsVmModel.tbname, function (err, res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null, res > 0);
    })
}

exports.lists = function (where, page, callback) {
    // 并行无关联
    async.parallel({
        total: function (callback) {
            mysql.join('inner join `contracts_type` on `contracts_type`.`id` = `contracts_vm`.`typeid`')
            .where(where).count(contractsVmModel.tbname, function (err, res) {
                callback(err, res); // res 将被赋值 total
            });
        },
        lists: function (callback) {
            mysql.join('inner join `contracts_type` on `contracts_type`.`id` = `contracts_vm`.`typeid`')
                .fields(['`contracts_vm`.*','`contracts_type`.`name` as `type`'])
                .where(where)
                .order({create_time: 'desc'})
                .limit(page.index, page.size)
                .select(contractsVmModel.tbname, function (err, rows) {
                    callback(err, rows);
                });
        }
    }, function (error, results) {
        // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
        // results.total,results.lists
        if (error) {
            logger.errorDB(__filename, error);
            return callback(error);
        }
        let resData = {
            total: results.total || 0,
            pageIndex: page.index,
            pageSize: page.size,
            lists: results.lists || []
        }

        return callback(null, resData);
    });
}
