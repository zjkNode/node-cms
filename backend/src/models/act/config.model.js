/**
 *  act-config模型
 *  createby zjk
 */
var moment = require('moment');

let validation = {
    'name': {
        notEmpty: { options: [true], errorMessage: '配置名称不能为空' }
    },
    'domain': {
        notEmpty: { options: [true], errorMessage: '配置域名不能为空' },
    },
    'oss_code': {
        notEmpty: { options: [true], errorMessage: 'oss路径代码不能为空' }
    },
    'publish_path': {
        notEmpty: { options: [true], errorMessage: '本地路径不能为空' }
    }
};

let auto = function(config) {
    if(!config) return;

    if(!config.id) {
        config.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
        return;
    }
    config.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
};

module.exports = {
    tbname: 'act_config',
    pk: 'id',//主键,
    validation: validation,
    auto: auto
};
