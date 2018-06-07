/**
 *  conifg 表
 *  createBy susan
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    cache = require('../../lib/cache.lib'),
    CONSTANTS = require('../../config/constants.config'),
    configModel = require('../../models/system/config.model.js');

exports.add = function(configs,callback) {
    mysql.insert(configModel.tbname , configs, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        cache.del('cacheConfigs');
        return callback(null, resId);
    });
};

exports.delete = function(where, callback){
    mysql.where(where).remove(configModel.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        };
        cache.del('cacheConfigs');
        return callback(null);
    });
};

exports.update = function (data, where, callback) {
    mysql.where(where).update(configModel.tbname, data, function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        };
        cache.del('cacheConfigs');
        return callback(null);
    });
};

exports.lists = function(where, page, callback){
    // 并行无关联
    async.parallel({
        total:function(callback){
            mysql.where(where).count(configModel.tbname,function(err,res){
                callback(err,res); // res 将被赋值 total
            });
        },
        lists:function(callback){
            mysql.where(where)
            .order({id:'desc'})
            .limit(page.index, page.size)
            .select(configModel.tbname, function(err,rows){
                if(rows){
                    rows.map((row)=>{
                        row.content = _.unescape(row.content);
                    });
                }
                callback(err,rows);
            });
        }
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

exports.getAllConfigs = function(callback){
    let cacheConfigs = cache.get('cacheConfigs');
    if(cacheConfigs){
        return callback(null, _.cloneDeep(cacheConfigs));
    }

    let where = {
        status:CONSTANTS.CONFIG_STATUS.VALID
    };
    mysql.where(where).select(configModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(err);
        }
        var configs = {};
        _.each(rows,(row) => {
            configs[row.key] = row.value;

        });
        cache.set('cacheConfigs', configs);
        callback(null,configs);
    });
}
