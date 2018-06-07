import 'assets/css/reset.css'
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import VueHttp from 'vue-resource'
import VueCookie from 'vue-cookie'
import routerconfig from "../config/routerconfig"

import ElementUI from 'element-ui'
import 'normalize.css';
import 'font-awesome/css/font-awesome.min.css';
import 'element-ui/lib/theme-chalk/index.css';

import { Message } from 'element-ui';
import * as filters from './filters';

//import Vuex from 'vuex'
import store from './store'

Vue.use(VueCookie);
Vue.use(VueRouter)
Vue.use(VueHttp);
// Vue.use(Vuex);
Vue.use(ElementUI);
// Vue.use(Message);
Vue.prototype.$message = Message;

const router = new VueRouter({
    mode: 'history',
    routes: routerconfig
});

router.beforeEach((to,from,next) => {
  document.title = to.meta.title || '消贷前端-后台管理系统'
  
  if(Vue.cookie.get('cmsnodessid')){
    next();
    return;
  }
  
  if(to.path == '/login'){
    next();
    return;
  }

  localStorage.clear();
  Vue.cookie.delete('cmsnodessid');
  next({ path: '/login'});
});


Vue.http.options.xhr = { withCredentials: true }
// if($.cookie('sdx_auth_h5_token'))
//   Vue.http.headers.common['sdx_auth_h5_token'] = $.cookie('sdx_auth_h5_token');

// Send request body as application/x-www-form-urlencoded content type
Vue.http.options.emulateJSON = true;

//Send PUT, PATCH and DELETE requests with a HTTP POST and set the X-HTTP-Method-Override header
//Vue.http.options.emulateHTTP = true;

Vue.http.interceptors.push((request, next)  => {
  
  // continue to next interceptor
  next((response) => {
    switch(response.status){
      case 400: // 验证出错
        let errs = [];
        for (var i = 0; i < response.body.length; i++) {
          let err = response.body[i];
          errs.push(err.message);
        }
        vm.$message.error(errs.join('<br/>'));
        break;
      case 401: // 权限验证失败
        var code = response.body.code;
        if(code == 'NO_SIGNIN'){
          vm.$message.error({
            message: response.body.msg,
            type:'warning'
          });
          next({ path: '/login'});
          return;
        }
        vm.$message({
          message:'对不起！您没有权限操作',
          type:'warning'
        });
        break;
      case 500:// 服务器出错
        vm.$message.error( response.body.msg || '服务器出错');
        break;
      default:
        break;
    }
  });
});
// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

let vm = new Vue({
    el:'#app',
    router,
    store,
    template: '<App/>',
    components: { App }
});