
更新：

	环境发布情况：
		本地环境，不上传oss
		测试环境，上传测试oss,并在活动代码前添加字母 "t"
		生产环境，同时支持上传测试oss与生产oss,且发布测试oss时，在活动代码前不添加字母't'
	所有的发布都发布到测试环境；
	测试环境活动状态：草稿，测试
	线上环境活动状态：草稿，测试(测试可访问), 上架(线上可访问), 线上修改(线上环境不变)，下架(线上不可访问)
	
#2018-04-09
	添加活动模板支持发布到多个域名，域名可配置，apk下载地址可配置，百度统计代码可配置；
	百度埋点事件增加活动code的区分；

#2017-10-30
    添加活动模板管理模块
    npm install unzip2

# 2017-10-26
	添加rsa加密、解密功能
	npm install node-rsa

#2017-10-20
	添加 合同导出pdf功能


说明：
cms-backend/temp: 存放临时文件，
					在本地需要在cms-backend 手动创建；
					在服务器，有负载均衡情况下，需要把temp目录存放在多个负载均能访问的目录，并在“系统配置”里修改 "baseTempPath"属性值

cms-backend/src/themes/activity/components： 存放活动组件，组件由activity-tpl生成的zip包，在“活动管理-组件管理”里上传并保存的目录
					在本地，需要在对应目录下创建
					在服务器端，需要把components放在一个非cms-backend运行的目录，因为cms-backend 重新运行时，可能会丢失已上传的一些组件
					