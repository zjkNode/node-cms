var logger = require('../../lib/logger.lib'),
  seoModel = require('../../models/news/seo.model'),
  seoService = require('../../services/news/seo.service'),
  logService = require('../../services/system/logs.service');

exports.add = function (req,res) {
  req.checkBody(seoModel.validation);

  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var seo = {
    typeid:req.body.typeid,
    title:req.body.title,
    keywords:req.body.keywords,
    description:req.body.description,
  }
  seoModel.auto(seo);

  seoService.add(seo,function(err,resId) {
    if(err){
      logService.log(req, '服务器出错，增加新闻SEO失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({ code: 200, msg:'新增新闻SEO成功'});
  });
}

exports.update = function(req,res) {
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: 'seo id 不能为空'}
    }
  });
  req.checkBody(seoModel.validation);

  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var map = {
    id: req.params.id
  };
  var seo = {
    id: req.params.id,
    typeid:req.body.typeid,
    title:req.body.title,
    keywords:req.body.keywords,
    description:req.body.description,
  }
  seoModel.auto(seo);
  seoService.update(seo, map, function(err){

    if(err){
      logService.log(req, '服务器出错，更新新闻SEO失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({code: 200,msg:'更新成功'});
  });
}

exports.delete = function(req,res){
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: 'seo id 不能为空'}
    }
  });

  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  let map = {
    id: req.params.id
  };
  seoService.delete(map, function(err){
    if(err){
      logService.log(req, '服务器出错，删除新闻SEO失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({code: 200,msg:'删除成功'});
  });
}

exports.lists = function(req,res) {
  var where = {};
  let searchKey = req.query.keys;
  let page = {
    index: parseInt(req.query.pageIndex),
    size: parseInt(req.query.pageSize)
  }
  if(searchKey){
    where._complex = {
      _logic: 'or',
      title: ['like',searchKey],
      keywords:['like',searchKey],
      description:['like',searchKey]
    }
  }
  seoService.lists(where, page, function(err, result){
    if(err){
      logService.log(req, '服务器出错，获取新闻SEO失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({
      code: 200,
      data:result,
      msg:'success'
    });
  });
}