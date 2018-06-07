/**
 *  news controller
 *  createby clmama
 * 需要优化: 先查新闻内容，根据内容类型Id 筛选内容类型
 */
const express = require('express'),
    async = require('async'),
    _ = require('lodash'),
    nunjucks = require('nunjucks'),
    fs = require('fs'),
    formidable = require('formidable'),
    path = require('path'),
    utils = require('../../lib/utils'),
    logger = require('../../lib/logger.lib'),
    newsModel = require('../../models/news/news.model'),
    cache = require('../../lib/cache.lib'),
    newsService = require('../../services/news/news.service'),
    moment = require('moment'),
    newsTypeService = require('../../services/news/type.service'),
    glob = require('glob'),
    aliOSS = require('../../lib/ali-oss.lib'),
    seoService = require('../../services/news/seo.service'),
    configService = require('../../services/system/config.service'),
    logService = require('../../services/system/logs.service'),
    CONSTANTS = require('../../config/constants.config');

exports.one = function (req, res) {
    req.checkParams({
        'id': {
            notEmpty: {options: [true], errorMessage: '新闻id 不能为空'}
        }
    });
    if (req.validationErrors()) {
        logger.error(__filename, '参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: parseInt(req.params.id)
    };
    async.auto({
        newsOne: function (callback) {
            newsService.one(map, function (err, row) {
                return callback(err, row);
            });
        },
        newsType: ['newsOne', function (results, callback) {
            let typeid = results.newsOne.typeid;
            newsTypeService.one({id: typeid}, function (err, ntype) {
                return callback(err, ntype);
            })
        }]
    }, function (err, results) {
        if (err) {
            logService.log(req, '获取新闻详情出错：' + results.newsOne.id);
            return res.status(500).end(err.message);
        }
        let newsData = results.newsOne;
        newsData.publish_time = moment(newsData.publish_time).format('YYYY-MM-DD')
        newsData.newsType = results.newsType || {name: '类型已删除'};
        return res.status(200).json({code: 'SUCCESS', data: newsData, msg: ''});
    })
}

exports.add = function (req, res) {
    req.checkBody(newsModel.validation);
    if (req.validationErrors()) {
        logger.error(__filename, '参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var news = {
        typeid: parseInt(req.body.typeid),
        title: req.body.title,
        publish_time: utils.dateFormat(req.body.publish_time),
        content: req.body.content
    }
    async.auto({
        sysConfig: configService.getAllConfigs,
        newsType: function (callback) {
            qType(news.typeid, function (tyerr, typedata) {
                callback(tyerr, typedata)
            })
        },
        imgUpUrl: ['sysConfig', 'newsType', function (results, callback) {
            let publishPath;
            if (_.startsWith(req.hostname, 'local')) {
                 publishPath = path.join(__dirname, '../../../', results.sysConfig.publishPath, '/images');
            }else{
                 publishPath =path.join(results.sysConfig.publishPath, '/images');
            }

            // noinspection JSAnnotator
            if (!utils.mkdirsSync(publishPath, 0777)) {
                return callback({code: 'FAIL_MKDIR', msg: '创建目录失败'});
            }

            //图片存储路径
            let imgUrl = news.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
                let _spimgurl = capture.split('/').pop();
                let _tempimg = path.join(__dirname, '../../../', 'temp/news/', _spimgurl);
                let _upimgurl = path.join('/detail/images/', _spimgurl);
                fs.rename(_tempimg, path.join(publishPath, _spimgurl), function (err) {});
                return "<img src='" + _upimgurl + "'/>"
            });

            return callback(null, imgUrl);
        }]
    }, function (err, results) {
        if (!!err) {
            logService.log(err, '新闻添加失败');
            return res.status(500).end(err);
        }
        news.content = results.imgUpUrl;
        newsModel.auto(news);
        newsService.add(news, function (err, row) {
            if (err) {
                logService.log(req, '服务器出错，新增新闻内容失败');
                return res.status(500).end(error);
            }
            return res.status(200).json({code: 'SUCCESS', msg: '新增新闻内容成功'});
        });
    })
}

exports.update = function (req, res) {
    req.checkParams({
        'id': {
            notEmpty: {options: [true], errorMessage: '新闻id 不能为空'}
        }
    });
    req.checkBody(newsModel.validation);
    if (req.validationErrors()) {
        logger.error(__filename, '参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    var map = {
        id: parseInt(req.params.id)
    };
    var news = {
        id: parseInt(req.params.id),
        typeid: parseInt(req.body.typeid),
        title: req.body.title,
        publish_time: moment(req.body.publish_time).format('YYYY-MM-DD hh:mm:ss'),
        content: req.body.content
    }

    async.auto({
        sysConfig: configService.getAllConfigs,
        newsType: function (callback) {
            qType(news.typeid, function (tyerr, typedata) {
                callback(tyerr, typedata)
            })
        },
        imgUpUrl: ['sysConfig', 'newsType', function (results, callback) {
            let publishPath;
            if (_.startsWith(req.hostname, 'local')) {
                publishPath = path.join(__dirname, '../../../', results.sysConfig.publishPath, '/images');
            }else{
                publishPath =path.join(results.sysConfig.publishPath, '/images');
            }
            // noinspection JSAnnotator
            if (!utils.mkdirsSync(publishPath, 0777)) {
                return callback({code: 'FAIL_MKDIR', msg: '创建目录失败'});
            }
            //图片存储路径
            let imgUrl = news.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
                let _spimgurl = capture.split('/').pop();
                let _tempimg = path.join(__dirname, '../../../', 'temp/news/', _spimgurl);
                let _upimgurl = path.join('/detail/images/', _spimgurl);
                fs.rename(_tempimg, path.join(publishPath, _spimgurl), function (err) {});
                return "<img src='" + _upimgurl + "'/>"
            });
            return callback(null, imgUrl)
        }]
    }, function (err, results) {
        if (!!err) {
            logService.log(err, '修改新闻失败');
            return res.status(500).end(err);
        }
        news.content = results.imgUpUrl;
        newsModel.auto(news);
        newsService.update(news, map, function (err) {
            if (err) {
                logService.log(req, '服务器出错，更新新闻内容失败');
                return res.status(500).end(err);
            }
            return res.status(200).json({code: 'SUCCESS', msg: '更新新闻内容成功'});
        });
    })
}

exports.delete = function (req, res) {
    req.checkParams({
        'id': {
            notEmpty: {options: [true], errorMessage: '新闻id 不能为空'}
        }
    });
    if (req.validationErrors()) {
        logger.error(__filename, '参数验证失败', req.validationErrors());
        return res.status(400).json(req.validationErrors());
    }
    let map = {
        id: parseInt(req.params.id)
    };
    newsService.delete(map, function (err) {
        if (err) {
            logService.log(req, '服务器出错，删除新闻内容失败');
            return res.status(500).end(err);
        }
        return res.status(200).json({code: 'SUCCESS', msg: '删除新闻内容成功'});
    });
}

exports.lists = function (req, res) {
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
            content: ['like', searchKey]
        }
    }
    newsService.lists(where, page, function (err, result) {
        if (err) {
            logService.log(req, '服务器出错，获取新闻内容失败');
            return res.status(500).end(err);
        }
        return res.status(200).json({
            code: 'SUCCESS',
            data: result,
            msg: ''
        });
    });
}

/**
 * ajax 调用 取列表接口，不做权限认证
 * @param {Object} req
 * @param {Object} res
 */
exports.onlineLists = function (req, res) {
    let typeCode = req.params.type;
    let ctype = req.params.ctype;
    let mapKey = '/' + typeCode + '/' + (ctype ? ctype : '');
    let page = {
        index: parseInt(req.query.pn) || 1,
        size: 8
    }
    async.auto({
        allTypes: newsTypeService.allLists,
        zixunCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('zx', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        wendaCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('wd', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        newsType: ['allTypes', function (results, callback) {
            let ntype = results.allTypes.filter((item) => {
                return item.path == mapKey;
            })[0];
            callback(null, ntype);
        }],
        newsData: ['allTypes', 'newsType', function (results, callback) {
            let suffix_pids = results.newsType.pids + ',' + results.newsType.id;
            suffix_pids = _.trimStart(suffix_pids, '0,'); // 去掉 类似0,1,2 中的0,

            let cTypes = results.allTypes.filter((item) => {
                return _.startsWith(item.pids, suffix_pids);
            });
            cTypes.push(results.newsType);

            newsService.getListsByTypes(cTypes, page, function (err, resNews) {
                callback(err, resNews);
            });
        }],
        zixun: ['zixunCTypes', function (results, callback) {
            newsService.randListsByTypes(results.zixunCTypes, 5, function (err, results) {
                callback(err, results);
            });
        }],
        wenda: ['wendaCTypes', function (results, callback) {
            newsService.randListsByTypes(results.wendaCTypes, 5, function (err, results) {
                callback(err, results);
            });
        }]
    }, function (err, results) {
        if (err) {
            return res.status(500).end();
        }
        ;
        var data = {
            newsData: results.newsData,
            zixun: results.zixun,
            wenda: results.wenda
        }
        return res.status(200).json({code: 'SUCCESS', data: data, msg: ''});
    });
}

// exports.preview = function (req, res) {
//     var newsId = parseInt(req.params.id);
//     configService.getAllConfigs(function (err, sysConfig) {
//         if (err) {
//             logService.log(req, '预览新闻详情出错：' + newsId);
//             return res.status(500).end(err.message);
//         }
//         return res.render('jdjk-pc/templates/detail', sysConfig);
//     });
// }

/**
 * 预览首页
 * 已弃用
 * @param {Object} req
 * @param {Object} res
 */
exports.previewHome = function (req, res) {
    let page = {
        index: 1,
        size: 5
    };
    async.auto({
        sysConfig: configService.getAllConfigs,
        seo: function (callback) {
            seoService.getOneByTypeCode('jdjk', function (err, resSeo) {
                callback(err, resSeo);
            });
        },
        zixunCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('zx', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        wendaCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('wd', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        zixun: ['zixunCTypes', function (results, callback) {
            newsService.randListsByTypes(results.zixunCTypes, 5, function (err, results) {
                callback(err, results);
            });
        }],
        wenda: ['wendaCTypes', function (results, callback) {
            newsService.randListsByTypes(results.wendaCTypes, 5, function (err, results) {
                callback(err, results);
            });
        }]
    }, function (err, results) {
        if (err) {
            logService.log(req, '服务器错误: 首页预览失败');
            return res.status(500).end();
        }

        let resData = {
            baseUrl: results.sysConfig.baseUrl,
            curNavCode: 'jdjk',
            seo: results.seo || {},
            zixunNavs: results.zixunCTypes,
            wendaNavs: results.wendaCTypes,
            zixun: results.zixun || [],
            wenda: results.wenda || []
        };
        return res.render('index', resData);
    });
}

/**
 * 新闻详情页
 * 已弃用
 */
// exports.preview = function(req,res){
// 	var newsId = parseInt(req.params.id);
// 	async.auto({
// 		sysConfig: configService.getAllConfigs,
// 		zixunCTypes: function(callback){
// 			newsTypeService.getChildTypesByCode('zx', function(err,cTypes){
// 				callback(err, cTypes);
// 			});
// 		},
// 		wendaCTypes: function(callback){
// 			newsTypeService.getChildTypesByCode('wd', function(err, cTypes){
// 				callback(err, cTypes);
// 			});
// 		},
// 		// 查询新闻内容
// 		news:function(callback){
// 			var where = {
// 				id:newsId
// 			};
// 			newsService.one(where,function(err,row){
// 				callback(err,row);
// 			});
// 		},
// 		pNewsTypes: ['news',function(results,callback){
// 			newsTypeService.getParentTypesById(results.news.typeid, function(err, rows){
// 				callback(err, rows);
// 			});
// 		}],
// 		seo:['news','pNewsTypes', function(results,callback){
// 			if(!results.pNewsTypes){
// 				return callback(new Error('newsType has been deleted!'));
// 			}
// 			var suffix = '-';
// 			for (var i = results.pNewsTypes.length - 1; i >= 1; i--) {
// 				suffix += results.pNewsTypes[i].name;
// 			}
// 			suffix += '-简单借款网';
// 			var content = results.news.title + suffix;
// 			var seo = {
// 				title: content,
// 				keywords: content,
// 				description: content
// 			};
// 			callback(null,seo);
// 		}]
// 	}, function(err,results){
// 		if(err){
// 			logService.log(req, '预览新闻详情出错：'+ newsId);
// 			return res.status(500).end(err.message);
// 		}
// 		let navs = [];
// 		for (var i = 1; i < results.pNewsTypes.length; i++) {
// 			var item = results.pNewsTypes[i];
// 			navs.push({ path: item.path, name: item.name });
// 		}
// 		// 顶级新闻类型下添加新闻时，pNewsTypes只有一级 兼容处理，这样的新闻没啥意义
// 		var pntype = results.pNewsTypes[1] || results.pNewsTypes[0];
// 		let resData = {
// 			baseUrl: results.sysConfig.baseUrl,
// 			zixunNavs: results.zixunCTypes,
// 			wendaNavs: results.wendaCTypes,
// 			curNavCode: pntype.code,
// 			seo:results.seo || {},
// 			news:results.news || {},
// 			navs:navs
// 		};
// 		return res.render('jdjk-pc/templates/detail',resData);
// 	});
// }


/**
 * 新闻列表页，带分页功能  线上实时访问接口
 * 已弃用   （get）
 */
exports.newsLists = function (req, res) {
    let typeCode = req.params.type;
    let ctype = req.params.ctype;
    let mapKey = '/' + typeCode + '/' + (ctype ? ctype : '');

    let page = {
        index: parseInt(req.query.pn) || 1,
        size: 15
    }
    async.auto({
        sysConfig: configService.getAllConfigs,
        allTypes: newsTypeService.allLists,
        zixunCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('zx', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        wendaCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('wd', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        newsType: ['allTypes', function (results, callback) {
            let ntype = results.allTypes.filter((item) => {
                return item.path == mapKey;
            })[0];
            callback(null, ntype);
        }],
        pNewsTypes: ['allTypes', 'newsType', function (results, callback) {
            let pids = _.isEmpty(results.newsType.pids) ? [] : results.newsType.pids.split(',');
            pids.push(results.newsType.id + '');
            let pnTypes = results.allTypes.filter((item) => {
                return _.includes(pids, item.id + '');
            });
            callback(null, pnTypes);
        }],
        cTypes: ['allTypes', function (results, callback) {
            let ntype = results.allTypes.filter((item) => {
                return item.path == '/' + typeCode + '/';
            })[0];


            let suffix_pids = ntype.pids + ',' + ntype.id;
            suffix_pids = _.trimStart(suffix_pids, '0,'); // 去掉 类似0,1,2 中的0,

            let cTypes = results.allTypes.filter((item) => {
                return _.startsWith(item.pids, suffix_pids);
            });
            cTypes.unshift(ntype);
            callback(null, cTypes);
        }],
        newsData: ['allTypes', 'newsType', function (results, callback) {
            let suffix_pids = results.newsType.pids + ',' + results.newsType.id;
            suffix_pids = _.trimStart(suffix_pids, '0,'); // 去掉 类似0,1,2 中的0,

            let cTypes = results.allTypes.filter((item) => {
                return _.startsWith(item.pids, suffix_pids);
            });
            cTypes.push(results.newsType);

            newsService.getListsByTypes(cTypes, page, function (err, resNews) {
                callback(err, resNews);
            });
        }],
        seo: ['allTypes', 'newsType', function (results, callback) {
            seoService.getOneByTypeCode(results.newsType.code, function (err, resSeo) {
                callback(err, resSeo);
            });
        }]
    }, function (err, results) {
        if (err) {
            // logService.log(req, '新闻列表加载失败! 访问路径:'+ mapKey);
            return res.status(500).end();
        }

        var totalPage = Math.ceil(results.newsData.total / page.size);
        var series = [];
        if (totalPage <= 6) {
            for (var i = 1; i <= totalPage; i++) {
                series.push(i);
            }
        } else if (page.index < 4) {
            series = [1, 2, 3, 4, '...', totalPage];
        } else if (page.index > totalPage - 3) {
            series = [1, '...', totalPage - 3, totalPage - 2, totalPage - 1, totalPage];
        } else {
            series = [1, '...', page.index - 1, page.index, page.index + 1, '...', totalPage];
        }
        // 顶级新闻类型下添加新闻时，pNewsTypes只有一级 兼容处理，这样的新闻没啥意义
        var pntype = results.pNewsTypes[1] || results.pNewsTypes[0];

        let resData = {
            baseUrl: results.sysConfig.baseUrl,
            typeKey: results.newsType.code,
            typeCode: typeCode,
            page: {
                first: page.index === 1 ? 0 : 1,
                prev: page.index === 1 ? 0 : (page.index - 1 || 1),
                index: page.index,
                series: series,
                next: totalPage === page.index ? 0 : (page.index + 1),
                end: totalPage === page.index ? 0 : totalPage,
                total: totalPage,
            },
            curNavCode: pntype.code,
            zixunNavs: results.zixunCTypes,
            wendaNavs: results.wendaCTypes,
            seo: results.seo,
            pNewsTypes: results.pNewsTypes,
            cTypes: results.cTypes,
            newsLists: results.newsData.lists
        };
        return res.render('jdjk-pc/templates/list', resData);
    });
}

/**
 * 发布首页，首页静态化
 * 已弃用
 */
exports.publishHome = function (req, res) {
    logService.log(req, '发布首页');
    async.auto({
        sysConfig: configService.getAllConfigs,
        seo: function (callback) {
            seoService.getOneByTypeCode('jdjk', function (err, resSeo) {
                callback(err, resSeo);
            });
        },
        zixunCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('zx', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        wendaCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('wd', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        zixun: ['zixunCTypes', function (results, callback) {
            newsService.randListsByTypes(results.zixunCTypes, 5, function (err, results) {
                callback(err, results);
            });
        }],
        wenda: ['wendaCTypes', function (results, callback) {
            newsService.randListsByTypes(results.wendaCTypes, 5, function (err, results) {
                callback(err, results);
            });
        }]
    }, function (err, results) {
        if (err) {
            logService.log(req, '服务器出错，首页发布失败！');
            return res.status(500).end(err);
        }
        let resData = {
            baseUrl: results.sysConfig.baseUrl,
            seo: results.seo || {},
            curNavCode: 'jdjk',
            zixunNavs: results.zixunCTypes,
            wendaNavs: results.wendaCTypes,
            zixun: results.zixun || [],
            wenda: results.wenda || []
        };
        var publishPath = results.sysConfig.publishPath;
        if (_.startsWith(publishPath, '{root}')) {
            let rootPath = path.join(__dirname, '../../');
            publishPath = publishPath.replace('{root}/', rootPath);
        }
        // if (!utils.mkdirsSync(publishPath, 0777)) {
        //     logService.log(req, '首页发布失败! 发布目录创建失败: ' + publishPath);
        //     return res.status(500).json({code: 'FAIL_MKDIR', msg: 'create director fail! path:' + publishPath})
        // }
        var template = 'Hello ' + name + '!';

        // rendered = nunjucks.renderString(template);
        // res.end(rendered);
        var content = nunjucks.render('index.html', resData);
        fs.writeFileSync(path.join(publishPath, 'index.html'), content);

        return res.status(200).json({code: 'SUCCESS', msg: '首页发布成功'});
    });
};


/**
 * 新闻详情页 静态化首页
 * 已弃用
 * @param {Object} req
 * @param {Object} res
 */
exports.publishAll = function (req, res) {
    logService.log(req, '重新发布所有新闻');

    async.parallel({
        sysConfig: configService.getAllConfigs,
        newsTypes: newsTypeService.allLists,
        zixunCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('zx', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
        wendaCTypes: function (callback) {
            newsTypeService.getChildTypesByCode('wd', function (err, cTypes) {
                callback(err, cTypes);
            });
        },
    }, function (err, results) {
        let page = {
            index: 0,
            size: 30
        };
        let loop = true;
        async.doWhilst(function (callback) {
            newsService.getNewsList(page, function (err, rows) {
                page.index++;
                if (err) {
                    // 会直接进入callback 不能继续发布
                    // return callback(err);
                    // 分页发布过程中，某页发布失败，继续下一页发布， 需要做个标记，方便frontend 提示用户
                    logService.log(req, '服务器出错，批量发布第 ' + page.index + '时出错！继续发布下一页');
                    return callback();
                }
                if (!rows || 0 == rows.length) {
                    loop = false; // 停止循环
                    return callback(null, []);
                }

                var tasks = [];
                _.forEach(rows, function (news) {
                    // 查找当前的类型
                    var nType = results.newsTypes.find((newsType) => {
                        return newsType.id === news.typeid;
                    });
                    // 如果 没找到父级，说明父级被删除了，打印日志
                    if (!nType) {
                        let resData = {
                            code: 'NOT_EXIST_NEWSTYPE',
                            msg: 'news:' + news.id + ' parent news type:' + news.typeid + ' is not exist'
                        }
                        logger.info(resData.msg);
                        logService.log(req, '新闻发布失败！新闻: ' + news.id + ' 的新闻类型：' + news.typeid + ' 不存在或已被删除。 继续发布下一条');
                        return callback(null, resData);
                    }

                    var pids = _.isEmpty(nType.pids) ? [] : nType.pids.split(',');
                    pids.push(nType.id + '');
                    var pnTypes = results.newsTypes.filter((newsType) => {
                        return _.includes(pids, newsType.id + '');
                    });

                    var pubResults = {
                        news: news,
                        pNewsTypes: pnTypes,
                        sysConfig: results.sysConfig,
                        zixunNavs: results.zixunCTypes,
                        wendaNavs: results.wendaCTypes
                    };
                    tasks.push(function (callback) {
                        var pubRes = publishNews(pubResults);
                        if (pubRes.code !== 'SUCCESS') {
                            return callback(new Error(pubRes.msg)); // 这里出错，会中断循环
                        }
                        let resData = {
                            code: 'SUCCESS',
                            data: news,
                            msg: 'news: ' + news.id + ' publish success'
                        };
                        return callback(null, resData);
                    });
                });

                // 每10个一组同时发布
                async.parallelLimit(tasks, 10, function (err, taskResults) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, taskResults);
                });

            });
        }, function () {
            return loop;
        }, function (err, taskResults) {
            // 1、因为分页发布过程中出错，不能抛出错误，以保证持续发布
            // 2、静态化页面时，写文件出错，会抛出错误，以阻断发布
            if (err) {
                logService.log(req, '服务器出错，批量发布新闻出错！' + err.message);
                logger.error(err.message);
                return res.status(500).end(err.message);
            }

            let errs = [];
            _.forEach(taskResults, function (item) {
                if (item.code !== 'SUCCESS') {
                    errs.push(item);
                }
            });
            if (errs.length > 0) {
                logService.log(req, '批量发布成功！部分新闻发布失败，共计：' + errs.length + ' 条');
            }
            let resData = {
                code: 'SUCCESS',
                errors: errs
            };
            return res.status(200).json(resData);
        });
    });
}


/**
 *
 *
 * 2018-05-18更新
 * 新闻详情页  静态化详情页
 * @param {Object} req
 * @param {Object} res
 */
exports.publish = function (req, res) {
    var newsId = parseInt(req.params.id);
    var map = {
        id: newsId
    };
    var news = {
        id: newsId
    };
    async.auto({
        sysConfig: configService.getAllConfigs,
        seoCode: function (callback) {
            seoService.getOneByTypeCode('news', function (err, resSeo) {
                callback(err, resSeo);
            });
        },
        news: function (callback) {
            var where = {
                id: newsId
            };
            newsService.one(where, function (err, row) {
                callback(err, row);
            });
        },
        newsType: ['news', 'sysConfig', 'seoCode', function (results, callback) {
            // 配置环境过滤地址
            if (_.startsWith(req.hostname, 'test') || _.startsWith(req.hostname, 'local')) { // 测试环境
                if (results.sysConfig.hetroneUrl.indexOf('test-www') == -1) {
                    results.sysConfig.hetroneUrl = results.sysConfig.hetroneUrl.replace(/www/, 'test-www');
                }
            }
            //层级查找
            qType(results.news.typeid, function (tyerr, typedata) {
                let publishPath;
                if (_.startsWith(req.hostname, 'local')) {
                    publishPath = path.join(__dirname, '../../../', results.sysConfig.publishPath, '/' + typedata.code + '/');
                }else{
                    publishPath = path.join(results.sysConfig.publishPath, '/' + typedata.code + '/');
                }
                //  noinspection JSAnnotator
                if (!utils.mkdirsSync(publishPath, 0777)) {
                    return callback({code: 'FAIL_MKDIR', msg: '创建目录失败'});
                }
                var htmldata = {
                    baseUrl: results.sysConfig.hetroneUrl,    //外链地址
                    seo: results.seoCode || {},
                    news: results.news || {},
                };
                htmldata.news.publish_time = moment(htmldata.news.publish_time).format('YYYY-MM-DD');
                var content = nunjucks.render(typedata.code + '/templates/detail.html', htmldata);
                fs.writeFileSync(path.join(publishPath, results.news.id + '.html'), content);
                callback(tyerr, typedata)
            })
        }],
        ossUpload: ['news', 'newsType', function (results, callback) {
            if (_.startsWith(req.hostname, 'local')) {
                callback(null, null)
                return
            }
            let ossClient;
            if (_.startsWith(req.hostname, 'test')) {
                ossClient = new aliOSS.Client('test', 'actBucket');
            } else {
                ossClient = new aliOSS.Client('product', 'actBucket');
            }
            let ossPrefix = results.newsType.code;   //oss 地址动态名
            results.news.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
                let imgName = capture.split('/').pop();
                let imgNameUrl;
                if (_.startsWith(req.hostname, 'local')) {
                     imgNameUrl = path.join(__dirname, '../../../', results.sysConfig.publishPath, '/images/', imgName)
                }else{
                    imgNameUrl = path.join(results.sysConfig.publishPath, '/images/', imgName)
                }
                let ossImgurl = path.join(ossPrefix, '/images/', imgName);
                ossClient.upload(ossImgurl, imgNameUrl);
            });

            let publishPath;
            if (_.startsWith(req.hostname, 'local')) {
                publishPath = path.join(__dirname, '../../../', results.sysConfig.publishPath, results.newsType.code)
            }else{
                publishPath = path.join(results.sysConfig.publishPath, results.newsType.code)
            }
            let pattern = path.join(publishPath, results.news.id + '.html');   //文件本地地址
            let ossFile = path.join(ossPrefix, results.news.id + '.html');   //oss 详情文件地址
            ossClient.upload(ossFile, pattern);
            callback(null, null)
        }],
    }, function (err, results) {
        if (err) {
            logService.log(err, '新闻详情生成文件失败');
            return res.status(500).end(err);
        }
        //更新数据库
        newsModel.pub(news);
        newsService.update(news, map, function (err) {
            if (!!err) {
                logService.log(req, '服务器出错，新闻发布失败');
                return res.status(500).end(err);
            }
            return res.status(200).json({code: 'SUCCESS', msg: '新闻发布成功'});
        });
    });
}


/**
 *
 * 2018-05   新增
 * 新闻列表 (get)
 * 类型(id)
 *
 * */
exports.newsListsN = function (req, res) {
    let _typecode = req.query.code,   //查询类型
        _pagenumber = req.query.pagenumber,  //页码
        _pagesize = 10;    //每页10条
    async.auto({
        sysConfig: configService.getAllConfigs,
        typeCode: function (callback) {
            newsTypeService.one({code: _typecode}, function (err, restype) {
                callback(err, restype);
            })
        },
        news: ['typeCode', function (restype, callback) {
            newsService.getListsByTypes([restype.typeCode], {
                index: _pagenumber,
                size: _pagesize
            }, function (err, resnews) {
                callback(err, resnews)
            })
        }],
        newsType:['typeCode',function(results,callback){
            newsTypeService.one({id: results.typeCode.pids.split(',')[0]}, function (err, ntype) {
                callback(err,ntype)
            })
        }],
    }, function (err, results) {
        if (_.startsWith(req.hostname, 'test')) { // 测试环境
            if (results.sysConfig.hetroneUrl.indexOf('test-www') == -1) {
                results.sysConfig.hetroneUrl = results.sysConfig.hetroneUrl.replace(/www/, 'test-www');
            }
        }
        results.news.pagenumber = parseInt(_pagenumber);
        results.news.pagesize = _pagesize;
        results.news.lists.forEach(function (item, index) {
            results.news.lists[index].publish_time = moment(item.publish_time).format('MM/DD');
            results.news.lists[index].content = item.content.replace(/<[^>]+>/g, "").replace(/&nbsp;\s+/ig, "").substr(0, 70) + "......";
            return
        })
        let contentdata = {
            news: results.news,
            baseUrl: results.sysConfig.hetroneUrl,
        };
        let totalpagesizi = Math.ceil(contentdata.news.total / _pagesize);
        //下一页
        contentdata.news.pagenext = contentdata.news.pagenumber < totalpagesizi ? parseInt(contentdata.news.pagenumber) + 1 : totalpagesizi;
        //上一页
        contentdata.news.pagepre = contentdata.news.pagenumber > 1 ? parseInt(contentdata.news.pagenumber - 1) : 1;
        //总页数
        contentdata.news.totalpagesizi = totalpagesizi;

        return res.render(path.join(results.newsType.code,'/templates/information.html'), contentdata);
    })
}


exports.ueConfig = function (req, res) {
    let urlPrefix = req.protocol + '://' + req.headers.host;
    let data = {
        "imagePathFormat": "/temp/{rand:6}",
        "imageUrlPrefix": urlPrefix,
        "imageActionName": "upload",
        "imageFieldName": "file", // 与 element ui 上传组件同步
        "imageMaxSize": 1024 * 1024 * 10, // 10mb app.js 配置同步
        "imageAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"]
    }
    return res.status(200).json(data);
}

exports.ueUpload = function (req, res, next) {
    let form = new formidable.IncomingForm();
    let actTempDir = path.join(__dirname, '../../../', 'temp');
    form.uploadDir = actTempDir;
    form.parse(req, function (error, fields, files) {
        if (error) {
            logger.error(__filename, error);
            return res.status(500).end(err);
        }
        let actTempPath = path.join(actTempDir, 'news');
        // noinspection JSAnnotator
        if (!utils.mkdirsSync(actTempPath, 0777)) {
            return res.status(500).end({code: 'FAIL_MKDIR', msg: '创建目录失败'});
        }
        let file = files.file;
        let time = new Date().getTime();
        let newFileName = file.name.replace(/(.*\/)*([^.]+)/, time);
        let visitPath = path.join('/temp', 'news', newFileName);
        fs.renameSync(file.path, path.join(actTempPath, newFileName));
        return res.status(200).json({
            url: visitPath,
            size: file.size,
            state: 'SUCCESS'
        });
    });
}

//  下架
exports.removeoss = function (req, res) {
    let newsId = parseInt(req.params.id);
    async.auto({
        updatenews: function (callback) {
            var map = {
                id: newsId
            };
            var news = {
                id: newsId,
                status: CONSTANTS.NEWS_STATUS.WAITING,
            };
            newsService.update(news, map, function (err, upnews) {
                callback(err, upnews)
            });
        },
        news: function (callback) {
            var where = {
                id: newsId
            };
            newsService.one(where, function (err, row) {
                callback(err, row);
            });
        },
        deleteOss: ['news', function (results, callback) {
            // if (_.startsWith(req.hostname, 'local')) {
            //     return callback(null, null)
            // };
            let ossClient;
            if (_.startsWith(req.hostname, 'local') || _.startsWith(req.hostname, 'test')) {
                // 本地，测试
                ossClient = new aliOSS.Client('test', 'actBucket');
            } else {
                ossClient = new aliOSS.Client('product', 'actBucket');
            }
            let ossKey;
            qType(results.news.typeid, function (tyerr, typedata) {
                ossKey = path.join(typedata.code, newsId + '.html');
                //图片路径
                results.news.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
                    let _spimgurl = capture.split('/').pop();
                    let _ossimgurl = path.join(typedata.code, '/images/', _spimgurl)
                    ossClient.delete(_ossimgurl);
                });
                ossClient.delete(ossKey);
                callback(tyerr, null)
            })
        }]
    }, function (err, results) {
        if (err) {
            logService.log(req, '下架新闻内容失败');
            return res.status(500).end(err);
        }
        return res.status(200).json({code: 'SUCCESS', msg: '新闻下架成功'});
    })
}


//预览
exports.previewHetrone = function (req, res) {
    var newsId = parseInt(req.params.id);
    async.auto({
        sysConfig: configService.getAllConfigs,
        seoCode: function (callback) {
            seoService.getOneByTypeCode('news', function (err, resSeo) {
                callback(err, resSeo);
            });
        },
        news: ['sysConfig', 'seoCode', function (results, callback) {
            var where = {
                id: newsId
            };
            if (_.startsWith(req.hostname, 'test') && results.sysConfig.hetroneUrl.indexOf('test-www') === -1) { // 测试环境
                results.sysConfig.hetroneUrl = results.sysConfig.hetroneUrl.replace(/www/, 'test-www');
            }
            newsService.one(where, function (err, row) {
                if (!!err) {
                    logService.log(err, '新闻详情生成文件失败');
                    return res.status(500).end(err);
                }
                let htmldata = {
                    baseUrl: results.sysConfig.hetroneUrl,    //外链地址
                    seo: results.seoCode || {},
                    news: row || {},
                };
                htmldata.news.publish_time = moment(htmldata.news.publish_time).format('YYYY-MM-DD');
                callback(err, htmldata);
            });
        }],
    }, function (err, results) {
        qType(results.news.news.typeid, function (tyerr, typedata) {
            return res.render(path.join(typedata.code, '/templates/detail.html'), results.news);
        })
    })
};

//查询 code
function qType(typeid, callback) {
    async.waterfall([
        function (cb) {
            newsTypeService.one({id: typeid}, function (err, ntype) {
                cb(null, ntype)
            })
        },
        function (resntype, cb) {
            newsTypeService.one({id: resntype.pids.split(',')[0]}, function (err, ntype) {
                cb(err, ntype)
            })
        }
    ], function (err, typedata) {
        callback(err, typedata)
    })
}


// function publishNews(results) {
//     let navs = [];
//     if (!results.pNewsTypes) {
//         return {code: 'NOT_EXIST_NEWSTYPE', msg: '发布失败：新闻类型不存在或已被删除'};
//     }
//     for (var i = 1; i < results.pNewsTypes.length; i++) {
//         var item = results.pNewsTypes[i];
//         navs.push({path: item.path, name: item.name});
//     }
//
//     // 顶级新闻类型下添加新闻时，pNewsTypes只有一级 兼容处理，这样的新闻没啥意义
//     var pntype = results.pNewsTypes[1] || results.pNewsTypes[0];
//
//     var seo = getNewsSeo(results.news, results.pNewsTypes);
//     let resData = {
//         baseUrl: results.sysConfig.baseUrl,
//         curNavCode: pntype.code,
//         zixunNavs: results.zixunCTypes,
//         wendaNavs: results.wendaCTypes,
//         seo: seo || {},
//         news: results.news || {},
//         navs: results.navs
//     };
//
//     // /www/static-cms/
//     var publishPath = path.join(results.sysConfig.publishPath, pntype.path);
//     if (_.startsWith(publishPath, '{root}')) {
//         let rootPath = path.join(__dirname, '../../');
//         publishPath = publishPath.replace('{root}/', rootPath);
//     }
//     if (!utils.mkdirsSync(publishPath, 0777)) {
//         return {code: 'FAIL_MKDIR', msg: '创建目录失败! ' + publishPath};
//     }
//
//     var content = nunjucks.render('jdjk-pc/templates/detail.html', resData);
//     fs.writeFileSync(path.join(publishPath, results.news.id + '.html'), content);
//
//     return {code: 'SUCCESS'};
// }
//
//
// function getNewsSeo(news, pNewsTypes) {
//     var content = news.title + '-';
//     for (var i = pNewsTypes.length - 1; i >= 1; i--) {
//         content += pNewsTypes[i].name;
//     }
//     content += '-简单借款网';
//     var seo = {
//         title: content,
//         keywords: content,
//         description: content
//     };
//     return seo;
// }
//
