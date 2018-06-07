CMS admin页面
    -- vue+webpack+es6 单页面admin应用


更新
#2017-11-7
    vue 升级到2.5.2以上
    element-ui 升级到2.0.3
#2017-10-30
    添加活动模板管理模块

#2017-10-26
    添加node模板，支持密码加密
    npm install jsencrypt




# 结构简介

    ├── build  //配置
    ├── config //配置
    ├── index.html
    ├── package.json
    ├── src //开发所用的所有文件
        ├── assets //第三方公共组件，在编译后会被压缩为vendor.js
        ├── components // vue公共组件
        ├── img
        ├── js //ufq自己开发js
        ├── mock //里面的mock.json是用来写假数据
        ├── scss //需要与views文件对应
        ├── views //所有vue页面
        ├── App.vue //vue引用模板，勿动
        └── main.js //js入口文件，勿动
    └── static // 一些固定不变的东西，比如favicon，logo之类的，在webpack编译时不会进行压缩等操作

# 编写方法
    在views中创建自己的vue文件以及与之对应的scss文件，直接在vue文件中开发即可，如有不懂，可参考现有页面。

# 版本
    node v6.9.1 (npm v3.10.8)

# 启动
    ├──npm run dev  本地启动 端口8088
    ├──npm run mock 启动假数据服务器 端口8089
    ├──npm run mockdev 本地启动服务+数据服务
    ├──npm run build 构建成产包（一般本地不使用）


