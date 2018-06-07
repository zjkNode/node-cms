/**
 *  act service
 *  createby clmama
 */
var actModel = require('../../models/act/act.model'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    async = require('async');

exports.one = function(where,callback){
    mysql.where(where).select(actModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        }
        if(!rows || rows.length == 0) return callback(new Error('ERR_NOT_FIND'));
        var row = rows[0];
        row.data = _.unescape(row.data);
        return callback(null,row);
    });
}

exports.add = function(where, callback) {
    mysql.insert(actModel.tbname, where, function(error, res) {
        if(error) {
            logger.errorDB(__filename,error);
            return callback(error);
        }
        return callback(null, res)
    })
};

exports.delete = function(where, callback) {
    mysql.where(where).remove(actModel.tbname,function(err,res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null);
    });
};

exports.update = function(data, where, callback) {
    mysql.where(where).update(actModel.tbname, data, function(err,res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null);
    });
};

exports.lists = function(where, page, callback) {
    async.parallel({
        total:function(callback){
            mysql.where(where).count(actModel.tbname, function(err,res) {
                callback(err, res); // res 将被赋值 total
            });
        },
        lists:function(callback){
            mysql.where(where)
                .order({ id:'desc' })
                .limit(page.index, page.size)
                .select(actModel.tbname, function(err, rows) {
                    callback(err, rows);
                });
        }
    },function(error,results) {
        // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
        // results.total,results.lists
        if(error) {
            logger.errorDB(__filename, error);
            return callback(error);
        }
        let resData = {
            total: results.total || 0,
            pageIndex: page.index,
            pageSize: page.size,
            lists: results.lists || []
        };
        return callback(null, resData);
    });
}

exports.count = function(where, callback){
    mysql.where(where)
         .count(actModel.tbname, function(error, cnt){
            if(error) {
                logger.errorDB(__filename, error);
                return callback(error);
            }
            return callback(null, cnt);
         });
}