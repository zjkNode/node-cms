/**
 * Created by liyajing on 17/9/5.
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib.js'),
    logger = require('../../lib/logger.lib'),
    historyModel = require('../../models/contracts/history.model'),
    contractsTypeService = require('./type.service'),
    baseService = require('../base.service'),
    CONSTANTS = require('../../config/constants.config');

exports.one = function (where, callback) {
    mysql.where(where).select(historyModel.tbname, function (err, rows) {
        if (err) {
            logger.errorDB(__filename, err);
            return callback(err);
        }
        if (!rows || rows.length == 0) return callback(new Error('ERR_NOT_FIND'));
        var row = rows[0];
        return callback(null, row);
    });
}

exports.add = function (contractsId, callback) {
    let params = {
        contractsId: parseInt(contractsId)
    }

    let sql = `INSERT INTO contracts_history (\`cid\`,\`version\`,\`content\`, \`title\`, \`typename\`,\`publish_time\`,\`create_time\`)
    SELECT a.id,(SELECT CASE WHEN ISNULL(MAX(version)) THEN 1 ELSE MAX(version)+1 END FROM contracts_history WHERE cid = :contractsId),a.content,a.title,b.\`name\`,a.publish_time, NOW() from contracts a
   INNER JOIN contracts_type b on a.typeid = b.id
   WHERE a.id = :contractsId`;

    mysql.execute(sql, params, function (err, rows) {
        if (err) {
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null, rows);
    })
};

exports.roll = function (hisId, callback) {
    let params = {
        id: parseInt(hisId)
    }
    let sql = baseService.SQL_rollbackContract;
    mysql.execute(sql, params, function (err, rows) {
        if (err) {
            logger.errorDB(__filename, err);
            return callback(err);
        }
        return callback(null, rows);
    });
}

// exports.delete = function (where, callback) {
//     mysql.where(where).remove(historyModel.tbname, function (err, res) {
//         if (err) {
//             logger.errorDB(__filename, err);
//             return callback(err);
//         }
//         return callback(null);
//     });
// }

exports.lists = function(where, page, callback){
    // 并行无关联
    async.auto({
        contractsType: function(callback){
            contractsTypeService.listsAll({status:CONSTANTS.CONTRACTS_TYPE_STATUS.VALID},function(err,row){
                callback(err,row);
            });
        },
        total:function(callback){
            mysql.where(where).count(historyModel.tbname,function(err,res){
                callback(err,res); // res 将被赋值 total
            });
        },
        lists:['contractsType',function(result, callback){
            mysql.where(where)
                .order({id: 'asc'})
                .limit(page.index, page.size)
                .select(historyModel.tbname, function(err,rows){
                    if(rows){
                        rows.map((row)=>{
                            row.content = _.unescape(row.content);
                            var typename = row.typename;
                            var cType = result.contractsType.filter((item)=>{
                                return item.name === typename;
                            })[0];
                            // console.log(cType);
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