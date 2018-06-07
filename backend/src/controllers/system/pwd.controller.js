var utils = require('../../lib/utils'),
	pwdModel = require('../../models/system/pwd.model'),
	userService = require('../../services/system/user.service'),
	logService = require('../../services/system/logs.service');

exports.update = function(req,res) {
	req.checkParams({
	    'id': { notEmpty: { options: [true], errorMessage: '用户id 不能为空' }
	    }
	  });
	req.checkBody(pwdModel.validation);

	if(req.validationErrors()){
		logger.error(__filename,'参数验证失败', req.validationErrors());
		return res.status(400).json(req.validationErrors());	
	}
	var map = {
		id: parseInt(req.params.id)
	};
	var user = {
		id: parseInt(req.params.id),
		email:req.body.email,
		nickname:req.body.nickname,
        password: utils.decrypt(req.body.password),
        depid: req.body.depid,
		roleid: parseInt(req.body.roleid),
		status: parseInt(req.body.status),
        phone:req.body.phone || ''
    }
    pwdModel.auto(user);

	userService.update(user, map, function(err){
		if(err){
			logService.log(req, '服务器出错，修改用户信息失败');
			return res.status(500).end(err);
		}
        req.session.user = user;
		return res.status(200).json({code:'SUCCESS', msg:'修改用户信息成功'});
	});
};

exports.userInfo = function(req,res){
    return res.status(200).json({ 
        code: 'SUCCESS',
        data:req.session.user, 
        msg:'获取信息成功'
    });
};