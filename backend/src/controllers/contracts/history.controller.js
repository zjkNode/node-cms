/**
 * Created by ufenqi on 17/9/5.
 */
var async = require('async'),
    _ = require('lodash'),
    logger = require('../../lib/logger.lib'),
    historyModel = require('../../models/contracts/history.model'),
    historyService = require('../../services/contracts/history.service'),
    logService = require('../../services/system/logs.service');

exports.rollback = function (req, res) {
    let hisId = parseInt(req.params.id);
    historyService.roll(hisId,function (err){
        if (err) {
            logService.log(req, '合同回滚出错');
            return res.status(500).end(err);
        }
        return res.status(200).json({code: 'SUCCESS', msg: '合同回滚成功'})
    })
}

// exports.deleteHistory = function (req, res) {
//     req.checkParams({
//         'id': {
//             notEmpty: {options: [true], errorMessage: 'id不能为空'}
//         }
//     })
//     if (req.validationErrors()) {
//         logger.error(__filename, '参数验证失败', req.validationErrors());
//         return res.status(400).json(req.validationErrors());
//     }
//     let map = {
//         id: Number(req.params.id)
//     };
//     historyService.delete(map, function (err) {
//         if (err) {
//             logService.log(req, '服务器出错，删除合同失败');
//             return res.status(500).end(err);
//         }
//         logService.log(req, '删除合同成功');
//         return res.status(200).json({code: 'SUCCESS', msg: '删除合同成功'})
//     })
// }


exports.getAllHistory = function (req, res) {
    var where = {};
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    }
    if (searchKey) {
        where._complex = {
            _logic: 'or',
            title: ['like', searchKey],
            typename: ['like',searchKey]
        }
    }
    historyService.lists(where, page, function (err, result) {
        if (err) {
            logService.log(req, '加载合同发布历史出错');
            return res.status(500).end(err);
        }
        return res.status(200).json({
            code: 200,
            data: result,
            msg: 'success'
        });
    });
}


/**
 * 合同历史预览页
 *
 */
exports.preview = function (req, res) {
    let where = {
        id: parseInt(req.params.id)
    }
    historyService.one(where,function(err,row){
        if(err){
            logService.log(req, '服务器出错，获取合同历史失败');
            return res.status(500).end(err);
        }
        row.content = _.unescape(row.content);
        return res.render('contracts/history',{contractsHis:row});
    });
}