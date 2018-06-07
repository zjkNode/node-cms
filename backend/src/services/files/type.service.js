var async = require('async'),
	mysql = require('../../lib/mysqldb.lib'),
	logger = require('../../lib/logger.lib'),
	fileTypeModel = require('../../models/files/type.model'),
	CONSTANTS = require('../../config/constants.config'),
	baseService = require('../base.service');

exports.one = function (where, callback) {
	mysql.where(where).select(fileTypeModel.tbname,function(err,rows){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		if(!rows) return callback();
		return callback(null,rows[0]);
	});
}

exports.add = function(fileType,callback) {
	mysql.insert(fileTypeModel.tbname , fileType, function(err,resId){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null, resId);
	});
}

exports.update = function (data, where, callback) {
	mysql.where(where).update(fileTypeModel.tbname, data, function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null);
	});
}

exports.delete = function(where, callback){
	mysql.where(where).remove(fileTypeModel.tbname,function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null);
	});
}

exports.lists = function(where,callback){
	mysql.where(where)
		.order({id:'asc'})
		.select(fileTypeModel.tbname, function(err,rows){
			if(err){
				logger.errorDB(__filename, err);
				return callback(err);
			}
			return callback(null,rows);
		});
};

exports.allLists = function(callback){
	let where = {
		status:CONSTANTS.FILE_TYPE_STATUS.NORMAL
	};

	mysql.where(where).select(fileTypeModel.tbname,function(err,res){
		if(err){
		  logger.errorDB(__filename, err);
		  return callback(err);
		}
		return callback(null,res);
	});
}

exports.getChildById = function(fileTypeId, callback){
	let params = {
		tbname: fileTypeModel.tbname,
		id: fileTypeId
	}
	let sql = baseService.SQL_selectChildById;
	mysql.execute(sql,params,function(err, rows){
		if(err){
			logger.errorDB(__filename, err);
			return callback(err);
		}
		return callback(null, rows);
	});
}	
