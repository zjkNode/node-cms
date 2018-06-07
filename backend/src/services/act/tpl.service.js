/**
 *  act-tpl service
 *  createby clmama
 */
var actTplModel = require('../../models/act/tpl.model'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    async = require('async');

exports.one = function(where,callback){
    mysql.where(where).select(actTplModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        }
        if(!rows || rows.length == 0) return callback(new Error('ERR_NOT_FIND'));
        var row = rows[0];
        return callback(null,row);
    });
}

exports.add = function(where, callback) {
    mysql.insert(actTplModel.tbname, where, function(error, res) {
        if(error) {
            logger.errorDB(__filename,error);
            return callback(error);
        }
        return callback(null, res)
    })
};

exports.delete = function(where, callback) {
    mysql.where(where).remove(actTplModel.tbname,function(err,res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null);
    });
};

exports.update = function(data, where, callback) {
    mysql.where(where).update(actTplModel.tbname, data, function(err,res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null);
    });
};

exports.lists = function(where, callback) {
    mysql.where(where)
         .order({id:'desc'})
         .select(actTplModel.tbname, function(err, rows){
            if(err){
                logger.errorDB(__filename, err);
                return callback(err);
            }
            return callback(null, rows);
         });


    // async.parallel({
    //     total:function(callback){
    //         mysql.where(where).count(actTplModel.tbname, function(err,res) {
    //             callback(err, res); // res 将被赋值 total
    //         });
    //     },
    //     lists:function(callback){
    //         mysql.where(where)
    //             .order({ id:'desc' })
    //             .limit(page.index, page.size)
    //             .select(actTplModel.tbname, function(err, rows) {
    //                 callback(err, rows);
    //             });
    //     }
    // },function(error,results) {
    //     // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
    //     // results.total,results.lists
    //     if(error) {
    //         logger.errorDB(__filename, error);
    //         return callback(error);
    //     }
    //     let resData = {
    //         total: results.total || 0,
    //         pageIndex: page.index,
    //         pageSize: page.size,
    //         lists: results.lists || []
    //     };
    //     return callback(null, resData);
    // });
}

exports.count = function(where, callback){
    mysql.where(where)
         .count(actTplModel.tbname, function(error, cnt){
            if(error) {
                logger.errorDB(__filename, error);
                return callback(error);
            }
            return callback(null, cnt);
         });
}