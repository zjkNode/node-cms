import Home from '../src/views/Home.vue';
import Login from '../src/views/Login.vue';
import homePage from '../src/views/home/home.vue';
import Menus from '../src/views/menus/index.vue';
import Logs from '../src/views/logs/logs.vue';
import News from '../src/views/news/news/news.vue';
import NewsType from '../src/views/news/news_type.vue';
import SEO from '../src/views/news/seo/index.vue';
import Config from '../src/views/config/index.vue';
import Contracts from '../src/views/contracts/content/index.vue';
import ContractsAdd from '../src/views/contracts/content/add.vue';
import ContractsEdit from '../src/views/contracts/content/edit.vue';
import ContractsType from '../src/views/contracts/type/index.vue';
import ContractsHistory from '../src/views/contracts/history/index.vue';
import ContractsPlaceholder from '../src/views/contracts/placeholder/index.vue';
import Role from '../src/views/org/role/role.vue';
import Rule from '../src/views/org/rule.vue';
import NewsAdd from '../src/views/news/news/add.vue';
import NewsEdit from '../src/views/news/news/edit.vue';
import authority from '../src/views/org/role/authority.vue';

import Loan from '../src/views/operate/loan/list.vue';
import Infor from '../src/views/operate/loan/infor.vue';
import Appversionmanage from '../src/views/operate/appversionmanage/list.vue';
import Announcement from '../src/views/operate/announcement/list.vue';


export default[
    {
        path: '/login', name: '', hidden: true, component: Login,
        meta: { requiresAuth: false }
    },
    {
        path: '/', name: '', component: Home,
        children: [
            { path: '/', component: homePage },
            { path: '/sys/org/user', component:(resolve) => { require(['../src/views/users/index.vue'], resolve)},meta: {title: '用户管理'}},
            { path: '/sys/org/dep', component:(resolve) => { require(['../src/views/org/dep.vue'], resolve)},meta: {title: '部门管理'}},
            { path: '/sys/org/role',name: 'role',component: Role, meta: {title: '角色管理'} },
            { path: '/sys/org/role/authority',name: 'authority',component: authority, meta: {title: '角色管理'} },
            { path: '/sys/org/rule',name: 'rule',component: Rule, meta: {title: '系统功能'} },
            { path: '/sys/menus',name: 'menus',component: Menus, meta: {title: '菜单管理'}},
            { path: '/sys/logs', name: 'logs', component: Logs, meta: {title: '日志管理'}},
            { path: '/sys/config',name: 'Config',component: Config, meta: {title: '系统设置'} },
            { path: '/news/seo',name: 'seo',cnName: "SEO管理",component: SEO, meta: {title: 'SEO管理'} },
            { path: '/news/type',name: 'newsType',component: NewsType, meta: {title: '新闻分类'} },
            { path: '/news/content',name: 'new',component: News, meta: {title: '新闻内容'} },
            { path: '/news/content/add',name: 'newsAdd',component:NewsAdd , meta: {title: '新闻内容添加'} },
            { path: '/news/content/edit',name: 'newsEdit',component:NewsEdit , meta: {title: '新闻内容编辑'} },
            { path: '/contracts/content',name: 'contracts',component: Contracts, meta: {title: '合同内容'} },
            { path: '/contracts/content/add',name: 'contractsAdd',component: ContractsAdd, meta: {title: '新增合同内容'} },
            { path: '/contracts/content/edit',name: 'contractsEdit',component: ContractsEdit, meta: {title: '合同内容编辑'} },
            { path: '/contracts/type',name: 'contractsType',component: ContractsType, meta: {title: '合同类型'} },
            { path: '/contracts/placeholder',name: 'contractsPlaceholder',component: ContractsPlaceholder, meta: {title: '合同占位符'} },
            { path: '/contracts/history',name: 'contractsHistory',component: ContractsHistory, meta: {title:'合同历史'}},
            { path: '/files/type',name: 'fileType',component:(resolve) => { require(['../src/views/files/filetype.vue'], resolve)}, meta: {title: '附件类型'} },
            { path: '/files/list',name: 'files',component:(resolve) => { require(['../src/views/files/file.vue'], resolve)}, meta: {title: '文件管理'} },
            
            { path: '/act/tpl',name: 'actTpl',component:(resolve) => { require(['../src/views/act/tpl/index.vue'], resolve)}, meta: {title: '活动模板列表'} },
            { path: '/act/tpl/add',name: 'actTplAdd',component:(resolve) => { require(['../src/views/act/tpl/add.vue'], resolve)}, meta: {title: '活动模板新增'} },
            { path: '/act/tpl/edit',name: 'actTplEdit',component:(resolve) => { require(['../src/views/act/tpl/edit.vue'], resolve)}, meta: {title: '活动模板编辑'} },
            
            { path: '/act/config',name: 'actConf',component:(resolve) => { require(['../src/views/act/config/index.vue'], resolve)}, meta: {title: '活动配置'} },
            { path: '/act/config/add',name: 'actConfAdd',component:(resolve) => { require(['../src/views/act/config/add.vue'], resolve)}, meta: {title: '新增活动配置'} },
            { path: '/act/config/edit',name: 'actConfEdit',component:(resolve) => { require(['../src/views/act/config/edit.vue'], resolve)}, meta: {title: '编辑活动配置'} },

            { path: '/act/lists',name: 'actLists',component:(resolve) => { require(['../src/views/act/online/index.vue'], resolve)}, meta: {title: '活动列表'} },
            { path: '/act/create',name: 'actCreate',component:(resolve) => { require(['../src/views/act/online/create.vue'], resolve)}, meta: {title: '活动创建'} },
            { path: '/act/edit',name: 'actEdit',component:(resolve) => { require(['../src/views/act/online/edit.vue'], resolve)}, meta: {title: '活动编辑'} },
            { path: '/act/components',name: 'actComponents',component:(resolve) => { require(['../src/views/act/components/index.vue'], resolve)}, meta: {title: '活动组件列表'} },
            
            { path: '/operate/loan',name: 'loan',component: Loan, meta: {title: '贷款超市管理'}},
            { path: '/operate/loan/infor',name: 'infor',component: Infor, meta: {title: '贷款超市管理'} },
            { path: '/operate/appversionmanage',name: 'appversionmanage',component: Appversionmanage, meta: {title: 'APP版本管理'}},
            { path: '/operate/announcement',name: 'Announcement',component: Announcement, meta: {title: '公告管理'}},

            
            // 请在本行之前添加路由
            { path: '*', component: (resolve) => { require(['../src/views/404.vue'], resolve)}}
        ]
    }
]