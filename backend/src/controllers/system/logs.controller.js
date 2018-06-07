var async = require('async'),
    logger = require('../../lib/logger.lib'),
    logsModel = require('../../models/system/logs.model'),
    logsService = require('../../services/system/logs.service');

exports.getAllLogs = function (req, res) {
    var where = {
        // status:1
    };
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    }
    if (searchKey) {
        where._complex = {
            _logic: 'or',
            content: ['like', searchKey],
            url: ['like', searchKey],
            username: ['like', searchKey],
        }
    }
    logsService.lists(where, page, function (err, result) {
        if (err) {
            return res.status(500).end(err);
        }
        return res.status(200).json({
            code: 200,
            data: result,
            msg: ''
        });
    });
}
