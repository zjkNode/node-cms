/*
 Navicat Premium Data Transfer

 Source Server         : devhost
 Source Server Type    : MySQL
 Source Server Version : 50626
 Source Host           : 172.16.51.30
 Source Database       : cms_system

 Target Server Type    : MySQL
 Target Server Version : 50626
 File Encoding         : utf-8

 Date: 10/10/2017 11:33:27 AM
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `config`
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '系统配置Id',
  `name` varchar(50) NOT NULL COMMENT '配置名称',
  `desc` varchar(100) DEFAULT NULL COMMENT '配置描述',
  `key` varchar(100) NOT NULL COMMENT '配置在缓存里的key值',
  `value` varchar(100) DEFAULT NULL COMMENT '配置值: 数组 以换行符\\r\\n区分',
  `status` tinyint(4) NOT NULL COMMENT '状态：1有效 2无效',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='系统配置表';

-- ----------------------------
--  Records of `config`
-- ----------------------------
BEGIN;
INSERT INTO `config` VALUES 
('1', '简单借款官网baseUrl', '简单借款官网baseUrl', 'baseUrl', 'https://www.jiandanjiekuan.com/', '1', null, '2017-08-20 11:02:58'),
('2', '简单借款官网publishPath', '简单借款官网 静态化页面发布目录', 'publishPath', '{root}/www/static_cms', '1', '2017-08-22 10:44:13', '2017-08-21 02:15:01'),
('3', '图片访问域名', 'dev环境上传图片成功后，访问的域名', 'imageDomain', 'http://local_node.jiandanjiekuan.com/image/', '1', null, '2017-09-22 10:48:27'),
('4', '图片上传保存路径', '文件管理,上传图片类型文件，服务器保存路径', 'imageSavePath', '{root}/www/static_image', '1', null, '2017-09-22 11:40:56');
COMMIT;

-- ----------------------------
--  Table structure for `contracts`
-- ----------------------------
DROP TABLE IF EXISTS `contracts`;
CREATE TABLE `contracts` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '合同id',
  `title` varchar(50) NOT NULL COMMENT '合同标题',
  `content` mediumtext NOT NULL COMMENT '合同内容',
  `status` tinyint(4) NOT NULL DEFAULT '2' COMMENT '合同状态：1已发布 2未发布',
  `typeid` int(11) NOT NULL COMMENT '合同类型id',
  `publish_time` datetime DEFAULT NULL COMMENT '最近一次发布时间',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='合同表';


-- ----------------------------
--  Table structure for `contracts_history`
-- ----------------------------
DROP TABLE IF EXISTS `contracts_history`;
CREATE TABLE `contracts_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '合同发布历史id',
  `cid` int(11) NOT NULL COMMENT '合同id',
  `title` varchar(50) NOT NULL COMMENT '合同标题',
  `version` int(11) NOT NULL DEFAULT 1 COMMENT '合同版本',
  `content` text NOT NULL COMMENT '合同内容',
  `typename` varchar(100) NOT NULL COMMENT '合同类型   父类-子类',
  `publish_time` datetime NOT NULL COMMENT '发布时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='合同发布历史表';

-- ----------------------------
--  Table structure for `contracts_type`
-- ----------------------------
DROP TABLE IF EXISTS `contracts_type`;
CREATE TABLE `contracts_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '合同类型Id',
  `name` varchar(50) NOT NULL COMMENT '合同分类名称',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级分类id 默认顶级0',
  `pids` varchar(100) NOT NULL DEFAULT '' COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态：1有效 2无效',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='合同类型表';

-- ----------------------------
--  Records of `contracts_type`
-- ----------------------------
BEGIN;
INSERT INTO `contracts_type` VALUES 
('1', '简单借款', '0', '0', '1', '2017-09-18 16:29:07', '2017-09-18 16:29:09'),
('2', '优分期', '0', '0', '1', '2017-09-26 06:08:41', '2017-09-18 16:29:27'),
('3', '简单借款合同', '1', '1', '1', '2017-09-27 01:48:36', '2017-09-18 16:33:16'),
('4', '优分期合同', '2', '2', '1', '2017-09-26 06:09:26', '2017-09-18 16:33:42');
COMMIT;

-- ----------------------------
--  Table structure for `contracts_vm`
-- ----------------------------
DROP TABLE IF EXISTS `contracts_vm`;
CREATE TABLE `contracts_vm` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '占位符Id',
  `name` varchar(50) NOT NULL COMMENT 'VM占位符名称',
  `placeholder` varchar(20) NOT NULL COMMENT 'VM占位符',
  `desc` varchar(100) DEFAULT NULL COMMENT '备注',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='合同VM模板占位符表';

-- ----------------------------
--  Table structure for `dep`
-- ----------------------------
DROP TABLE IF EXISTS `dep`;
CREATE TABLE `dep` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '部门Id',
  `name` varchar(50) NOT NULL COMMENT '部门名称',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级部门id 默认顶级0',
  `pids` varchar(100) NOT NULL DEFAULT '' COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL COMMENT '部门状态：1有效 2无效',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='部门表';

-- ----------------------------
--  Records of `dep`
-- ----------------------------
BEGIN;
INSERT INTO `dep` VALUES 
('1', '超级管理员', '0', '0', '1', null, '2017-09-18 03:27:37');
COMMIT;

-- ----------------------------
--  Table structure for `file_type`
-- ----------------------------
DROP TABLE IF EXISTS `file_type`;
CREATE TABLE `file_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '文件类型id ',
  `name` varchar(50) NOT NULL COMMENT '文件类型名称',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级分类id 默认顶级0',
  `pids` varchar(100) NOT NULL DEFAULT '' COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL COMMENT '状态：1有效 2无效',
  `code` varchar(50) DEFAULT NULL COMMENT '类型代码，文件将根据代码拼实际访问路径',
  `desc` varchar(100) DEFAULT NULL COMMENT '类型备注',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime DEFAULT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='文件类型表';

-- ----------------------------
--  Table structure for `files`
-- ----------------------------
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '文件id ',
  `typeid` int(11) NOT NULL COMMENT '文件类型id',
  `name` varchar(50) NOT NULL COMMENT '文件名称',
  `filepath` varchar(100) DEFAULT NULL COMMENT '文件访问绝对路径',
  `filesize` int(11) DEFAULT NULL COMMENT '文件大小',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime DEFAULT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='文件表';

-- ----------------------------
--  Table structure for `logs`
-- ----------------------------
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '操作日志id ',
  `content` varchar(200) DEFAULT NULL COMMENT '操作内容',
  `url` varchar(100) NOT NULL COMMENT '操作url',
  `ip` varchar(20) DEFAULT NULL COMMENT '用户Ip',
  `username` varchar(20) NOT NULL COMMENT '登录用户名',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统日志表';


-- ----------------------------
--  Table structure for `menus`
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单Id',
  `name` varchar(50) NOT NULL COMMENT '菜单名称',
  `alink` varchar(100) NOT NULL COMMENT '菜单链接地址',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级菜单Id 默认顶级0',
  `pids` varchar(100) NOT NULL DEFAULT '' COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '菜单状态：1有效 2停用',
  `sort` int(11) DEFAULT NULL COMMENT '菜单排序',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8 COMMENT='系统菜单表';

-- ----------------------------
--  Records of `menus`
-- ----------------------------
BEGIN;
INSERT INTO `menus` VALUES 
('1', '系统管理', '/sys', '0', '0', '1', '1', null, '2017-08-15 05:30:16'),
('2', '系统菜单', '/sys/menus', '1', '1', '1', '1', null, '2017-08-15 11:11:27'),
('3', '日志管理', '/sys/logs', '1', '1', '1', '2', null, '2017-08-15 10:46:47'),
('4', '组织架构', '/sys/org', '1', '1', '1', '1', null, '2017-08-15 11:11:41'),
('5', '用户管理', '/sys/org/user', '4', '1,4', '1', '3', null, '2017-08-15 10:33:50'),
('6', '部门管理', '/sys/org/dep', '4', '1,4', '1', '1', null, '2017-08-15 05:39:50'),
('7', '角色管理', '/sys/org/role', '4', '1,4', '1', '2', null, '2017-08-15 10:33:37'),
('8', '系统功能', '/sys/org/rule', '4', '1,4', '1', '2', null, '2017-08-16 12:01:19'),
('9', '新闻管理', '/news', '0', '0', '1', '2', null, '2017-08-15 11:31:38'),
('10', '新闻类型', '/news/type', '9', '9', '1', '1', null, '2017-08-15 11:32:07'),
('11', '新闻内容', '/news/content', '9', '9', '1', '2', null, '2017-08-15 11:31:50'),
('12', '新闻SEO', '/news/seo', '9', '9', '1', '3', null, '2017-08-15 10:42:07'),
('13', '系统配置', '/sys/config', '1', '1', '1', '5', null, '2017-08-15 10:44:06'),
('14', '合同管理', '/contracts', '0', '0', '1', '3', null, '2017-08-15 11:55:17'),
('15', '合同类型', '/contracts/type', '14', '14', '1', '1', null, '2017-08-15 11:55:53'),
('16', '合同历史', '/contracts/history', '14', '14', '1', '2', null, '2017-08-15 11:56:34'),
('17', '合同内容', '/contracts/content', '14', '14', '1', '3', null, '2017-08-15 11:57:09'),
('18', '合同占位符', '/contracts/vm', '14', '14', '2', '4', null, '2017-08-16 12:00:41'),
('19', '附件管理', '/files', '0', '0', '1', '4', null, '2017-08-16 12:01:19'),
('20', '附件类型', '/files/type', '19', '19', '1', '4', null, '2017-08-16 12:01:19'),
('21', '附件列表', '/files/list', '19', '19', '1', '4', null, '2017-08-16 12:01:19');
COMMIT;

-- ----------------------------
--  Table structure for `news`
-- ----------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '新闻Id',
  `typeid` int(11) NOT NULL COMMENT '新闻分类id',
  `title` varchar(100) NOT NULL COMMENT '新闻标题',
  `content` text COMMENT '新闻内容',
  `status` tinyint(4) NOT NULL COMMENT '新闻状态：1发布 2未发布',
  `author` varchar(20) DEFAULT NULL COMMENT '新闻作者',
  `publish_time` datetime DEFAULT NULL COMMENT '新闻发布时间',
  `update_time` datetime DEFAULT NULL COMMENT '新闻更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='新闻资讯表';

-- ----------------------------
--  Table structure for `news_seo`
-- ----------------------------
DROP TABLE IF EXISTS `news_seo`;
CREATE TABLE `news_seo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `typeid` int(11) NOT NULL COMMENT '新闻类型Id',
  `title` varchar(100) NOT NULL COMMENT 'SEO title',
  `keywords` varchar(200) NOT NULL COMMENT 'SEO keywords',
  `description` varchar(200) NOT NULL COMMENT 'SEO description',
  `update_time` datetime DEFAULT NULL COMMENT '最新更新时间',
  `create_time` datetime DEFAULT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COMMENT='新闻SEO配置表';

-- ----------------------------
--  Records of `news_seo`
-- ----------------------------
BEGIN;
INSERT INTO `news_seo` VALUES 
('1', '1', '小额信贷_个人小额贷款_信用贷款_小额贷款-简单借款网提供快速贷款服务', '简单借款,和创金服,小额信贷,小额贷款,个人贷款,快速借款,手机贷款', '简单借款是和创金服旗下专注金融领域小额信贷的移动端信用贷款平台,为工作人群提供个人贷款、小额贷款、手机贷款、网络贷款快速借款等贷款服务,致力打造以信用为凭证、无需担保的个人信用钱包。个人快速借款、快速贷款就上简单借款贷款平台！', null, '2017-08-16 01:01:06'),
('2', '2', '【小额贷款资讯|信用卡贷款资讯|公积金贷款资讯|抵押贷款资讯】 _简单借贷网', '小额贷款资讯，信用卡贷款资讯，公积金贷款资讯，抵押贷款资讯', '简单借贷网为您提供大量小额贷款资讯，信用卡贷款资讯，公积金贷款资讯，抵押贷款资讯等行业资讯，简单借贷网帮您快速贷到款！', null, '2017-08-16 01:02:21'),
('3', '4', '【公积金贷款利率|公积金贷款流程|公积金贷款条件】-贷款资讯_简单借贷网', '公积金贷款利率，公积金贷款流程，公积金贷款条件，公积金贷款攻略', '简单借贷网为您提供最全的公积金贷款利率，公积金贷款流程，来简单借贷网查看最新公积金贷款条件，简单贷款网帮您快速贷到款！', null, '2017-08-16 01:03:28'),
('4', '5', '【小额贷款利率|小额贷款流程|小额贷款条件】-贷款资讯_简单借贷网', '小额贷款利率，小额贷款流程，小额贷款条件，小额贷款攻略', '简单借贷网为您提供最全的小额贷款利率，小额贷款流程，来简单借贷网查看最新小额贷款条件，简单贷款网帮您快速贷到款！', null, '2017-08-16 01:04:10'),
('5', '6', '【抵押贷款利率|抵押贷款流程|抵押贷款条件】-贷款资讯_简单借贷网', '抵押贷款利率，抵押贷款流程，抵押贷款条件，抵押贷款攻略', '简单借贷网为您提供最全的抵押贷款利率，抵押贷款流程，来简单借贷网查看最新抵押贷款条件，简单贷款网帮您快速贷到款！', null, '2017-08-16 01:04:51'),
('6', '7', '【信用卡贷款利率|信用卡贷款流程|信用卡贷款条件】-贷款资讯_简单借贷网', '信用卡贷款利率，信用卡贷款流程，信用卡贷款条件，信用卡贷款攻略', '简单借贷网为您提供最全的信用卡贷款利率，信用卡贷款流程，来简单借贷网查看最新信用卡贷款条件，简单贷款网帮您快速贷到款！', null, '2017-08-16 01:05:35'),
('7', '3', '【抵押贷款咨询|买车贷款咨询|买房贷款咨询|个人贷款咨询】 -贷款问答_简单借贷网', '抵押贷款咨询，买车贷款咨询，买房贷款咨询，个人贷款咨询', '简单借贷网贷款问答平台免费为您解决个人贷款咨询，买房贷款咨询，买车贷款咨询，抵押贷款咨询等相关贷款咨询，简单借贷网帮您快速贷到款！', null, '2017-08-16 01:06:50'),
('8', '9', '【抵押贷款咨询|抵押贷款问题】-贷款问答_简单借贷网', '抵押贷款咨询，|抵押贷款问答，抵押贷款问题', '简单借贷网为您提供最全的抵押贷款咨询，来简单借贷网查看最新抵押贷款问题，如何抵押贷款就来简单贷款网帮您快速贷到款！', null, '2017-08-16 01:07:29'),
('9', '10', '【个人贷款咨询|个人贷款问题】-贷款问答_简单借贷网', '个人贷款咨询，|个人贷款问答，个人贷款问题', '简单借贷网为您提供最全的个人贷款咨询，来简单借贷网查看最新个人贷款问题，如何个人贷款就来简单贷款网帮您快速贷到款！', null, '2017-08-16 01:08:28'),
('10', '11', '【买房贷款咨询|买房贷款问题】-贷款问答_简单借贷网', '买房贷款咨询，|买房贷款问答，买房贷款问题', '简单借贷网为您提供最全的买房贷款咨询，来简单借贷网查看最新买房贷款问题，如何买房贷款就来简单贷款网帮您快速贷到款！', null, '2017-08-16 01:09:11'),
('11', '12', '【买车贷款咨询|买车贷款问题】-贷款问答_简单借贷网', '买车贷款咨询，|买车贷款问答，买车贷款问题', '简单借贷网为您提供最全的买车贷款咨询，来简单借贷网查看最新买车贷款问题，如何买车贷款就来简单贷款网帮您快速贷到款！', null, '2017-08-16 01:09:54');
COMMIT;

-- ----------------------------
--  Table structure for `news_type`
-- ----------------------------
DROP TABLE IF EXISTS `news_type`;
CREATE TABLE `news_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '类型名称',
  `code` varchar(50) NOT NULL COMMENT '类型代码 不能重复',
  `path` varchar(100) NOT NULL COMMENT '访问路径',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级类型id',
  `pids` varchar(100) NOT NULL COMMENT '所有父级Id集合，以逗号分隔',
  `desc` varchar(100) DEFAULT NULL COMMENT '类型备注',
  `status` tinyint(4) NOT NULL COMMENT '类型状态：1有效 2无效',
  `update_time` datetime DEFAULT NULL COMMENT '最新更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COMMENT='新闻类型表';

-- ----------------------------
--  Records of `news_type`
-- ----------------------------
BEGIN;
INSERT INTO `news_type` VALUES 
('1', '简单借款官网', 'jdjk', '', '0', '0', '简单借款官网 栏目', '1', null, '2017-08-15 11:35:22'),
('2', '资讯', 'zx', '/zixun/', '1', '1', '资讯 大类', '1', null, '2017-08-15 11:35:51'),
('3', '问答', 'wd', '/wenda/', '1', '1', '问答', '1', null, '2017-08-15 11:36:30'),
('4', '公积金贷款', 'zxgjjdk', '/zixun/gongjijindaikuan', '2', '1,2', '资讯 -- 公积金贷款', '1', null, '2017-08-15 11:37:33'),
('5', '小额贷款', 'zxxedk', '/zixun/xiaoedaikuan', '2', '1,2', '小额贷款', '1', null, '2017-08-15 11:38:20'),
('6', '抵押贷款', 'zxdydk', '/zixun/diyadaikuan', '2', '1,2', '抵押贷款', '1', null, '2017-08-15 11:38:54'),
('7', '信用卡贷款', 'zxxykdk', '/zixun/xinyongkadaikuan', '2', '1,2', '信用卡贷款', '1', null, '2017-08-15 11:39:23'),
('8', '法律法规', 'zxflfg', '/zixun/falvfagui', '2', '1,2', '法律法规', '1', null, '2017-08-15 11:39:53'),
('9', '抵押贷款', 'wddydk', '/wenda/diyadaikuan', '3', '1,3', '问答--抵押贷款', '1', null, '2017-08-15 11:43:28'),
('10', '个人贷款', 'wdgrdk', '/wenda/gerendaikuan', '3', '1,3', '个人贷款', '1', null, '2017-08-15 11:44:32'),
('11', '买房贷款', 'wdmfdk', '/wenda/maifangdaikuan', '3', '1,3', '买房贷款', '1', null, '2017-08-15 11:45:02'),
('12', '买车贷款', 'wdmcdk', '/wenda/maichedaikuan', '3', '1,3', '买车贷款', '2', '2017-09-26 02:22:07', '2017-08-15 11:45:33');
COMMIT;

-- ----------------------------
--  Table structure for `roles`
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '角色id',
  `depid` int(11) NOT NULL COMMENT '所属部门id',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `desc` varchar(50) DEFAULT NULL COMMENT '角色描述',
  `authorties` varchar(200) DEFAULT NULL COMMENT '权限菜单Id 以逗号区分',
  `update_time` datetime DEFAULT NULL COMMENT '最近更新时间',
  `create_time` datetime DEFAULT NULL COMMENT '角色添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='系统角色表';

-- ----------------------------
--  Records of `roles`
-- ----------------------------
BEGIN;
INSERT INTO `roles` VALUES 
('1', '1', '超管', '系统超级管理员，具有系统全部权限', '1,2,3,7,8,4,5,9', '2017-09-19 06:22:04', '2017-09-18 03:28:24'); 
COMMIT;

-- ----------------------------
--  Table structure for `rule`
-- ----------------------------
DROP TABLE IF EXISTS `rule`;
CREATE TABLE `rule` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '功能id',
  `name` varchar(50) NOT NULL COMMENT '功能名称',
  `path` varchar(100) NOT NULL COMMENT '功能路径',
  `pid` int(11) DEFAULT NULL COMMENT '父级功能id',
  `pids` varchar(100) NOT NULL COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL COMMENT '功能状态：1有效  2停用',
  `update_time` datetime DEFAULT NULL COMMENT '最近更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COMMENT='系统功能表';

-- ----------------------------
--  Records of `rule`
-- ----------------------------
BEGIN;
INSERT INTO `rule` VALUES 
('1', '系统管理', '/sys', '0', '0', '1', '2017-09-30 02:25:48', '2017-09-18 03:56:19'),
('2', '系统菜单', '/sys/menus', '1', '1', '1', '2017-09-26 11:56:53', '2017-09-18 03:56:26'),
('3', '日志管理', '/sys/logs', '1', '1', '1', '2017-09-26 11:57:22', '2017-09-18 03:56:33'),
('4', '系统配置', '/sys/config', '1', '1', '1', '2017-09-26 11:58:01', '2017-09-18 03:56:42'),
('5', '组织架构', '/sys/org', '1', '1', '1', '2017-09-26 11:58:45', '2017-09-18 03:56:56'),
('6', '部门管理', '/sys/org/dep', '5', '1,5', '1', '2017-09-26 11:59:19', '2017-09-18 03:57:32'),
('7', '角色管理', '/sys/org/role', '5', '1,5', '1', '2017-09-26 12:00:04', '2017-09-18 03:57:44'),
('8', '系统功能', '/sys/org/rule', '5', '1,5', '1', '2017-09-26 12:01:19', '2017-09-18 03:59:04'),
('9', '用户管理', '/sys/org/user', '5', '1,5', '1', '2017-09-26 12:01:44', '2017-09-18 03:59:23'),
('10', '新闻管理', '/news', '0', '0', '1', null, '2017-09-26 12:03:47'),
('11', '新闻类型', '/news/type', '10', '10', '1', null, '2017-09-26 01:54:07'),
('12', '新闻内容', '/news/content', '10', '10', '1', null, '2017-09-26 01:54:34'),
('13', '新闻SEO', '/news/seo', '10', '10', '1', null, '2017-09-26 01:55:02'),
('14', '合同管理', '/contracts', '0', '0', '1', null, '2017-09-26 01:55:39'),
('15', '合同类型', '/contracts/type', '14', '14', '1', null, '2017-09-26 01:56:00'),
('16', '合同历史', '/contracts/history', '14', '14', '1', null, '2017-09-26 01:56:34'),
('17', '合同内容', '/contracts/content', '14', '14', '1', null, '2017-09-26 01:56:56'),
('18', '附件管理', '/files', '0', '0', '1', null, '2017-09-26 01:57:29'),
('19', '附件类型', '/files/type', '18', '18', '1', null, '2017-09-26 01:57:54'),
('20', '附件列表', '/files/list', '18', '18', '1', null, '2017-09-26 01:58:12');
COMMIT;

-- ----------------------------
--  Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `email` varchar(100) NOT NULL COMMENT '登录邮箱',
  `nickname` varchar(20) NOT NULL COMMENT '用户别名',
  `password` varchar(32) NOT NULL COMMENT '登录密码 md5',
  `depid` int(11) NOT NULL COMMENT '部门id',
  `roleid` int(11) NOT NULL COMMENT '角色id',
  `phone` varchar(20) DEFAULT '' COMMENT '联系电话',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '用户状态：1:有效  2:停用',
  `update_time` datetime DEFAULT NULL COMMENT '最近更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='系统用户表';

-- ----------------------------
--  Records of `users`
-- ----------------------------
BEGIN;
INSERT INTO `users` VALUES 
('1', 'admin@jdjk.com', 'admin', 'e10adc3949ba59abbe56e057f20f883e', '1', '1', '182099883764', '1', '2017-09-29 05:03:54', '2017-08-22 11:34:14');
COMMIT;


/******** 2017-10-30 添加活动模板化管理数据库表 ***********/

-- ----------------------------
--  Table structure for `act_tpl`
-- ----------------------------
DROP TABLE IF EXISTS `act_tpl`;
CREATE TABLE `act_tpl` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '模板id',
  `name` varchar(100) NOT NULL COMMENT '模板名称',
  `code` varchar(50) NOT NULL COMMENT '模板代码：不能重复',
  `template` varchar(255) NOT NULL COMMENT '模板文件',
  `parts` varchar(100) NOT NULL DEFAULT '' COMMENT '模板引用组件集合，以逗号分隔',
  `desc` varchar(255) DEFAULT NULL COMMENT '模板说明',
  `status` tinyint(4) NOT NULL COMMENT '模板状态：1、停用； 2、正常',
  `count` int(11) NOT NULL DEFAULT '0' COMMENT '模板使用次数',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='活动模板表';


-- ----------------------------
--  Table structure for `act`
-- ----------------------------
DROP TABLE IF EXISTS `act`;
CREATE TABLE `act` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '活动id',
  `name` varchar(100) NOT NULL COMMENT '活动名称',
  `code` varchar(50) NOT NULL COMMENT '活动代码：不可重复',
  `url` varchar(200) NOT NULL COMMENT '活动访问Url',
  `data` text COMMENT '活动页面数据，json 格式',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '活动状态：1:草稿  2:上线  3:修改',
  `template` varchar(100) NOT NULL,
  `parts` varchar(100) NOT NULL DEFAULT '' COMMENT '模板引用组件集合，以逗号分隔',
  `user_id` int(11) NOT NULL COMMENT '活动创建者id  当前登录用户id',
  `create_time` datetime NOT NULL COMMENT '活动创建时间',
  `uuser_id` int(11) DEFAULT NULL COMMENT '活动最近一次修改者id',
  `update_time` datetime DEFAULT NULL COMMENT '活动最近一次更新时间',
  `publish_time` datetime DEFAULT NULL COMMENT '活动发布时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='活动列表';


-- 为表添加索引
-- news
ALTER TABLE `news` ADD INDEX `idx_typeid` ( `typeid` ); 
-- 

-- news_type
ALTER TABLE `news_type` ADD UNIQUE `idx_code` (`code`);

-- act_tpl
ALTER TABLE `act_tpl` ADD UNIQUE `idx_code` (`code`);

-- act
ALTER TABLE `act` ADD INDEX `idx_code` (`code`);

/******** 2017-12-06 活动模板重构 ***********/

ALTER TABLE `act_tpl` DROP COLUMN `template`; 
ALTER TABLE `act_tpl` ADD COLUMN `cover` varchar(100) DEFAULT NULL COMMENT '模板封面' AFTER `code`;


ALTER TABLE `act` DROP COLUMN `template`; 
ALTER TABLE `act` DROP COLUMN `parts`; 
ALTER TABLE `act` ADD COLUMN `activity_code` varchar(50) DEFAULT NULL COMMENT '活动uuid' AFTER `code`;
ALTER TABLE `act` ADD COLUMN `components` varchar(100) DEFAULT NULL COMMENT '活动引用组件集合，以逗号分隔' AFTER `status`;


/*************** 活动模板支持多域名发布 2018-3-22 ******************/

DROP TABLE IF EXISTS `act_config`;
CREATE TABLE `act_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置id',
  `name` varchar(100) NOT NULL COMMENT '配置名称',
  `domain` varchar(100) NOT NULL COMMENT '活动域名', 
  `oss_code` varchar(50) NOT NULL COMMENT 'oss路径代码，直接跟在域名后，在nginx代理标识', 
  `baidu_code` varchar(50) NULL COMMENT '百度统计代码code',
  `download_urls` varchar(200) NULL COMMENT '安装包下载地址：open_android,open_ios,官网地址,应用宝,appStore',
  `publish_path` varchar(50) NULL COMMENT '本地发布文件保存路径',
  `user_id` int(11) NOT NULL COMMENT '创建者id  当前登录用户id',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `uuser_id` int(11) DEFAULT NULL COMMENT '最近一次修改者id',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='活动多域名配置表';


ALTER TABLE `act` ADD COLUMN `oss_code` varchar(50) DEFAULT NULL COMMENT 'oss路径代码' AFTER `code`;

ALTER TABLE `act_config` MODIFY COLUMN `download_urls` varchar(1024) DEFAULT NULL COMMENT '安装包下载地址：open_android,open_ios,官网地址,应用宝,appStore';

ALTER TABLE `act` MODIFY COLUMN `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '活动状态：1草稿 2上线 3修改 4下线, 5测试环境';

/************增加合同占位符--添加占位符类型字段 2018-04-24***********/

ALTER TABLE `contracts_vm` ADD COLUMN `typeid` int(11) NOT NULL COMMENT '归属合同id' AFTER `placeholder`;


SET FOREIGN_KEY_CHECKS = 1;


