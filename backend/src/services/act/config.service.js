/**
 *  act-config service
 *  createby zjk
 */
var model = require('../../models/act/config.model'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    async = require('async');

exports.one = function(where,callback){
    mysql.where(where).select(model.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(err);
        }
        if(!rows || rows.length == 0) return callback(new Error('ERR_NOT_FIND'));
        var row = rows[0];
        return callback(null,row);
    });
}

exports.add = function(data, callback) {
    mysql.insert(model.tbname, data, function(error, res) {
        if(error) {
            logger.errorDB(__filename,error);
            return callback(error);
        }
        return callback(null, res)
    })
};

exports.delete = function(where, callback) {
    mysql.where(where).remove(model.tbname,function(err,res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null);
    });
};

exports.update = function(data, where, callback) {
    mysql.where(where).update(model.tbname, data, function(err,res) {
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
         .select(model.tbname, function(err, rows){
            if(err){
                logger.errorDB(__filename, err);
                return callback(err);
            }
            return callback(null, rows);
         });
}