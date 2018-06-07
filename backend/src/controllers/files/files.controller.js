/**
 *  files controller
 *  createby clmama
 */
var async = require('async'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  formidable = require('formidable'),
  utils = require('../../lib/utils'),
  logger = require('../../lib/logger.lib'),
  filesModel = require('../../models/files/files.model'),
  filesService = require('../../services/files/files.service'),
  fileTypeService = require('../../services/files/type.service'),
  logService = require('../../services/system/logs.service'),
  configService = require('../../services/system/config.service');

exports.add = function (req,res) {
  req.checkBody(filesModel.validation);
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var file = {
    name:req.body.name,
    filepath:req.body.filepath,
    typeid:req.body.typeid,
    filesize:req.body.filesize
  };
  filesModel.auto(file);
  filesService.add(file,function(err,resid) {
    if(err){
      logService.log(req, '服务器出错，新增文件失败');
      return res.status(500).end(err);
    }
    return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
  });
}

exports.update = function(req,res) {
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: '文件id 不能为空'}
    }
  });
  req.checkBody(filesModel.validation);

  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }
  var map = {
    id: parseInt(req.params.id)
  };
  var files = {
    id: parseInt(req.params.id),
    name:req.body.name,
    filepath:req.body.filepath,
    typeid:parseInt(req.body.typeid),
    filesize:parseInt(req.body.filesize)
  };
  filesModel.auto(files);

  async.auto({
    sysConfig: configService.getAllConfigs,
    unLinkFile: ['sysConfig', function(results, callback){
      let filePath = '';
      if(_.startsWith(results.sysConfig.imageSavePath, '{root}')){
        let localPath = results.sysConfig.imageSavePath.replace('{root}/', path.join(__dirname, '../../'));
        filePath = req.body.oldpath.replace(results.sysConfig.imageDomain, localPath);
      } else {
        filePath = req.body.oldpath.replace(results.sysConfig.imageDomain, results.sysConfig.imageSavePath);
      }
      if(!fs.existsSync(filePath)){
        return callback(null, true);
      }
      fs.unlink(filePath, function(err){
        if(err){
          logger.error(__filename,'删除文件出错:'+ filePath, err);
          return callback(err);
        }
        return callback(null, true);
      });
    }],
    update: ['unLinkFile', function(results, callback){
        if(!results.unLinkFile){
          return callback(new Error("FAIL_RMFILE"));
        }

        filesService.update(files, map, function(err){
          return callback(err);
        });
    }]
  }, function(err, results) {
      if(err){
        logService.log(req, '服务器出错，更新文件失败');
        return res.status(500).end(err[0]);
      }
      return res.status(200).json({code: 'SUCCESS',msg:'更新成功'});
  });
}

exports.delete = function(req, res){
  req.checkParams({
    'id': {
      notEmpty: { options: [true], errorMessage: '文件id 不能为空' }
    }
  });
  if(req.validationErrors()){
    logger.error(__filename,'参数验证失败', req.validationErrors());
    return res.status(400).json(req.validationErrors());
  }

  async.waterfall([
    configService.getAllConfigs,
    function(sysConfig, callback){
      let filePath = '';
      if(_.startsWith(sysConfig.imageSavePath, '{root}')){
        let localPath = sysConfig.imageSavePath.replace('{root}/', path.join(__dirname, '../../'));
        filePath = req.body.filepath.replace(sysConfig.imageDomain, localPath);
      } else {
        filePath = req.body.filepath.replace(sysConfig.imageDomain, sysConfig.imageSavePath);
      }
      if(!fs.existsSync(filePath)){
        return callback(null, true);
      }
      fs.unlink(filePath, function(err){
        if(err){
          logger.error(__filename,'删除文件出错:'+ filePath, err);
          return callback(err);
        }
        return callback(null, true);
      });
    },
    function(isUnlink, callback){
      if(!isUnlink){
        return callback(new Error("FAIL_RMFILE"));
      }
      let where = {
        id: parseInt(req.params.id)
      }
      filesService.delete(where, function(error){
        return callback(error);
      })
    }
  ], function(err, result){
    if(err){
      logService.log(req, '服务器出错，删除文件失败');
      return res.status(500).end(err[0]);
    }
    return res.status(200).json({
        code:'SUCCESS',
        msg:'删除成功'});
  });
}

exports.lists = function(req,res) {
  var where = {
  };
  let searchKey = req.query.keys;
  let page = {
    index: parseInt(req.query.pageIndex),
    size: parseInt(req.query.pageSize)
  }
  if(searchKey){
    where._complex = {
      _logic: 'or',
      name: ['like',searchKey],
      filepath:['like',searchKey]
    }
  }
  filesService.lists(where, page, function(err, result){
    if(err){
      logService.log(req, '服务器出错，获取文件列表失败');
      return res.status(500).json(err);
    }
    return res.status(200).json({
      code: 'SUCCESS',
      data:result,
      msg:''
    });
  });
};

exports.upload = function(req, res) {
  let where = {
    id:parseInt(req.headers.typeid)
  };
  async.auto({
    sysConfig: configService.getAllConfigs,
    fileType: function(callback){
      fileTypeService.one(where, function(err, fileType){
        return callback(err, fileType);
      });
    },
    pFileTypes: ['fileType', function(results, callback){
      let ids = results.fileType.pids.split(',').map((pid) => {
        return parseInt(pid);
      });
      ids.push(results.fileType.id);

      fileTypeService.lists({ id: ['in', ids] }, function(err, fileTypes){
        if(err){
          return callback(err);
        }
        let sortedTypes =  _.sortBy(fileTypes, 'pids');
        return callback(null, sortedTypes);
      });
    }]
  },function(err,results){
    if(err){
      logService.log(req, '服务器出错，上传文件失败');
      return res.status(500).end(err);
    }

    // mk file save path
    let filePath = _.map(results.pFileTypes, 'code').join('/');
    let uploadDir = results.sysConfig.imageSavePath + '/' + filePath;
    if(_.startsWith(uploadDir, '{root}')){
      let rootPath = path.join(__dirname, '../../');
      uploadDir = uploadDir.replace('{root}', rootPath);
    }

    if(!utils.mkdirsSync(uploadDir, 0777)){
      return { code:'FAIL_MKDIR', msg:'创建目录失败! '+ uploadDir };
    }
    var form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.parse(req, function(error, fields, files){
      if(error){
        logger.error(__filename, error);
        return res.status(500).end(error);
      }

      let file = files.file;
      let newPath = file.path + '.' + file.name.split('.')[1];
      fs.renameSync(file.path, newPath, function(error){
        return res.status(500).end(error);
      });

      let fileName = file.path.split('/').pop() + '.' + file.name.split('.')[1];
      let visitPath = results.sysConfig.imageDomain + '/' + filePath + '/' + fileName;
      return res.status(200).json({
        file:{
          path: visitPath,
          size: file.size
        }
      });
    });
  });
}
