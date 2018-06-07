/**
 * Created by ufenqi on 18/1/17.
 */
var async = require('async');
// var qs = require('querystring');
var logService = require('../../services/system/logs.service');

var httpPoxy = require('../../lib/http-proxy.lib'),
    logger = require('../../lib/logger.lib'),
    formidable = require('formidable'),
    path = require('path'),
    fs = require('fs'),
    aliOSS = require('../../lib/ali-oss.lib');

exports.one = function (req, res) {
    var data = {
        id: parseInt(req.params.id)
    }
    // var params = JSON.stringify(data);
    console.log('查看参数log' + JSON.stringify(data));

    let url = '/apis/supermarket/getProductById';
    httpPoxy.post(url, data, function (err, data) {
        if (err) {
            res.status(500).end(err);
            return;
        }
        res.status(200).json(data);
    });
}

exports.lists = function (req, res) {
    var data = {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        appCode: req.query.appCode,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        name: req.query.name
    };
    console.log('列表页参数' + JSON.stringify(data));

    let url = '/apis/supermarket/findProductListByCondition';
    httpPoxy.post(url, data, function (err, data) {
        if (err) {
            res.status(500).end(err);
            return;
        }
        res.status(200).json(data);
    });
}

exports.sort = function (req, res) {
    var data = {
        id: parseInt(req.body.id),
        sort: parseInt(req.body.sort)
    };
    // var params = JSON.stringify(data);
    console.log('排序参数' + JSON.stringify(data));

    let url = '/apis/supermarket/sort';
    httpPoxy.post(url, data, function (err, data) {
        if (err) {
            res.status(500).end(err);
            return;
        }
        res.status(200).json(data);
    });
}

exports.updatestatus = function (req, res) {
    var data = {
        id: parseInt(req.body.id),
        status: parseInt(req.body.status)
    };
    // var params = JSON.stringify(data);
    console.log('上下架参数' + JSON.stringify(data));

    let url = '/apis/supermarket/updateStatus';
    httpPoxy.post(url, data, function (err, data) {
        if (err) {
            res.status(500).end(err);
            return;
        }
        res.status(200).json(data);
    });
}

exports.add = function (req, res) {
    var data = {
        appCode: req.body.appCode,
        name: req.body.name,
        url: req.body.url,
        icon: req.body.icon,
        amount: req.body.amount,
        loan: req.body.loan,
        note: req.body.note,
        rate: req.body.rate,
        appid: req.body.appid,
        reg_success_keyword: req.body.reg_success_keyword,
        url_scheme: req.body.url_scheme,
        uvCount: req.body.uvCount,
        self: req.body.self,
        itemAvg: req.body.itemAvg,
        sort: req.body.sort
    };
    // var params = JSON.stringify(data);
    console.log('新增参数log' + JSON.stringify(data));

    let url = '/apis/supermarket/saveProduct';
    httpPoxy.post(url, data, function (err, data) {
        if (err) {
            res.status(500).end(err);
            return;
        }
        console.log('新增接口' + JSON.stringify(data));
        res.status(200).json(data);
    });
}

exports.update = function (req, res) {
    var data = {
        id: parseInt(req.body.id),
        appCode: req.body.appCode,
        name: req.body.name,
        url: req.body.url,
        icon: req.body.icon,
        amount: req.body.amount,
        loan: req.body.loan,
        note: req.body.note,
        rate: req.body.rate,
        appid: req.body.appid,
        regSuccessKeyword: req.body.regSuccessKeyword,
        urlScheme: req.body.urlScheme,
        uvCount: req.body.uvCount,
        self: req.body.self,
        itemAvg: req.body.itemAvg,
        sort: req.body.sort
    };
    // var params = JSON.stringify(data);
    console.log('更新接口参数' + JSON.stringify(data));

    let url = '/apis/supermarket/updateProduct';
    httpPoxy.post(url, data, function (err, data) {
        if (err) {
            res.status(500).end(err);
            return;
        }
        res.status(200).json(data);
    });
}


// 上传图片，并保存数据
exports.save = function (req, res) {
    async.waterfall([
        function (callback) { // 上传到服务器temp目录
            let form = new formidable.IncomingForm();
            let actTempDir = path.join(__dirname, '../../../', 'temp');
            form.uploadDir = actTempDir;
            form.parse(req, function (error, fields, files) {
                if (error) {
                    return callback(error);
                }
                let file = files.file;
                let time = new Date().getTime();
                let newFileName = file.name.replace('.', `_${time}.`);
                let newFile = path.join(actTempDir, newFileName);
                fs.renameSync(file.path, newFile);
                return callback(null, fields, newFile);
            });
        },
        function (data, localFile, callback) { // 上传ali oss
            let rootPath = path.join(__dirname, '../../../temp');
            let ossClient = new aliOSS.Client('imgBucket', 'supermarket/product', rootPath);

            aliOSS.upload(localFile, function (error, resUrl) {
                if (error) {
                    return callback(error);
                }
                fs.unlink(localFile);
                data.icon = resUrl;
                return callback(null, data);
            });

            // aliOSS.upload(localFile, function (error, resUrl) {
            //     if (error) {
            //         return callback(error);
            //     }
            //     fs.unlink(localFile);
            //     data.icon = resUrl;
            //     return callback(null, data);
            // });
        },
        function (data, callback) { // 保存数据
            let url = '/apis/supermarket/saveProduct';
            if (data.id) {
                url = '/apis/supermarket/updateProduct';
            }
            console.log(data);
            httpPoxy.post(url, data, function (error, resData) {
                if (error) {
                    return callback(error);
                }
                return callback(null, resData);
            });
        }], function (err, result) {
        if (err) {
            logger.error(__filename, error);
            return res.status(500).end(err);
        }
        console.log('保存接口' + JSON.stringify(result));
        return res.status(200).json(result);
    });
}


// for test
exports.upload = function (req, res) {
    let form = new formidable.IncomingForm();
    let actTempDir = path.join(__dirname, '../../../', 'temp');
    form.uploadDir = actTempDir;
    form.parse(req, function (error, fields, files) {
        if (error) {
            logger.error(__filename, error);
            return res.status(500).end(err);
        }
        let file = files.file;
        let time = new Date().getTime();
        let newFileName = file.name.replace('.', `_${time}.`);
        let newFile = path.join(actTempDir, newFileName);
        fs.renameSync(file.path, newFile);
        aliOSS.upload(newFile, function (err, aliUrl) {
            if (err) {
                return res.status(500).end();
            }
            return res.status(200).json({
                code: 'SUCCESS',
                file: {
                    path: aliUrl,
                    size: file.size
                }
            });
        });
    });
}