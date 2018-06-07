<template>
    <el-row class="category">
        <h2>新闻类型管理</h2>
        <!--工具条-->
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="filters.name" placeholder="请输入查询类型名称/路径/备注" @input="searchName"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" v-on:click="getNews" icon="el-icon-search">查询</el-button>
                <el-button type="primary" v-on:click="addNews" icon="el-icon-plus" pull="6"> 新增</el-button>
            </el-col>
        </el-row>

        <!--列表-->
        <template>
            <el-table :data="newsType" highlight-current-row stripe v-loading="loading" style="width: 100%;">
                <el-table-column type="index" width="60" >
                </el-table-column>
                <el-table-column prop="name" label="类别名称" width="300" :formatter="formatTree" show-overflow-tooltip class-name='flat-tree'>
                </el-table-column>
                <el-table-column prop="code" label="类别代码" width="160" >
                </el-table-column>
                <el-table-column prop="path" label="路径" width="180" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                    <template scope="scope" >
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="desc" label="新闻备注" min-width='180' show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="handleDel(scope.$index, scope.row)" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <!--新增界面-->
        <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
            <el-form :model="ruleForm" :rules="addFormRules" ref="ruleForm" label-width="80px">
                <el-form-item label="选择类别" prop="pid"  ref="selectform">
                    <el-cascader
                            change-on-select
                            :options="options"
                            :props="props"
                            v-model="ruleForm.pid">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="类别名称" prop="name">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
                <el-form-item label="类别代码" prop="code">
                    <el-input v-model="ruleForm.code"></el-input>
                </el-form-item>
                <el-form-item label="路径" prop="path">
                    <el-input v-model="ruleForm.path"></el-input>
                </el-form-item>
                <el-form-item label="分类描述" prop="desc">
                    <el-input type="textarea" v-model="ruleForm.desc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit('ruleForm')" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--编辑界面-->
        <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="新闻类别" prop="pid" >
                    <el-cascader
                            change-on-select
                            :options="options"
                            :props="props"
                            v-model="editForm.pid">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="类别名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="类别代码" prop="code">
                    <el-input v-model="editForm.code" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="路径" prop="path">
                    <el-input v-model="editForm.path" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否可用" prop="status">
                    <el-radio-group v-model="editForm.status">
                        <el-radio class="radio" :label="1">正常</el-radio>
                        <el-radio class="radio" :label="2">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="新闻备注">
                    <el-input type="textarea" v-model="editForm.desc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit('editForm')" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </el-row>
</template>
<script type="text/ecmascript-6">
    //import NProgress from 'nprogress'
    export default {
        data() {
            let handlePath=(rule,val,callback)=>{
                var me = this;
                if(!val){
                    callback(new Error('path不能为空'));
                    return;
                }
                if(!(/^\/[a-z0-9]*[\/[a-z0-9]*]*$/g.test(val))){
                    callback(new Error('path必须以/开头,小写字母和数字跟其后'));
                    return;
                }
                callback();
            };
//            let handleName=(rule,val,callback)=>{
//                if(!!/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im.test(val)){
//                    callback(new Error('不能输入特殊字符'));
//                    return
//                }
//                callback()
//            };
            return {
                props:{
                    value:'id',
                    label:'name'
                },
                selectedOptions:[],
                filters: {
                    name: ''
                },
                total: 0,
                loading: false,
                editLoading: false,
                listLoading:false,
                newsType: [],
                addFormVisible: false,//新增界面是否显示
                editFormVisible: false,//编辑界面是否显示
                //新增界面数据
                ruleForm: {
                    pid: [],
                    name: '',
                    desc: '',
                    path:''
                },
                //编辑界面数据
                editForm: {
                    name: '',
                    pid: [],
                    status:1,
                    desc:'',
                    path:''
                },
                addFormRules: {
                    code: [
                        {required: true,message:'code不能为空', trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    path: [
                        {validator:handlePath,required: true,trigger: 'blur'}
                    ],
                    name: [
                        {required: true,message:'名称不能为空',trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    desc:[
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },
                editFormRules:{
                    code: [
                        {required: true,message:'code不能为空', trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    path: [
                        {validator:handlePath,required: true,trigger: 'blur'}
                    ],
                    name: [
                        {required: true, message:'名称不能为空',trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    desc:[
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },
                pageSize:15,
                pageIndex:1,
                //新增界面数据
                options: [{name:'顶级',id:0,pid:0}],
                editValue:'',
                addLoading: false
            }
        },
        filters:{
            statusFilter(val){
                if(val === 1)
                    return '正常';
                if(val === 2)
                    return '停用';
                return '未知';
            }
        },
        methods: {
            formatTree(row, column,value){
                let flatTree = this.$options.filters.flatTree;
                return flatTree(row, value);
            },
            getPostdata(url, params, callback){
                var me = this;
                me.addLoading = true;
                me.$http.post(url, params, {credentials: true})
                        .then((res)=> {
                            this.addLoading = false;
                            if (res.body.code =='SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.data[0].msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            this.addLoading = false;
                        });
            },
            getGetdata(url, params, callback){
                var me = this;
                me.loading=true;
                me.$http.get(url, {params:params}, {credentials: true})
                        .then((res)=> {
                            me.loading=false;
                            if (res.body.code =='SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.loading=false;
                        });
            },
            getPutdata(url, params, callback){
                var me = this;
                me.editLoading = true;
                me.$http.put(url, params, {credentials: true})
                        .then((res)=> {
                            this.editLoading = false;
                            if (res.body.code =='SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.data[0].msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            this.editLoading = false;
                        });
            },
            getDeletedata(url, params, callback){
                var me = this;
                me.listLoading = true;
                me.$http.delete(url, params, {credentials: true})
                        .then((res)=> {
                            this.listLoading = false;
                            if (res.body.code == 'SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            this.listLoading = false;
                        });
            },
            //获取新闻类型列表数据
            getGategoriesData(){
                let me = this;
                me.editOptions = [{name:'顶级',id:null,pid:0}];
                let url = '/api/news/type/search';
                let data = {name:this.filters.name};
                me.getGetdata(url, data, function (res) {
                    me.newsType = res.body.data;
                });
                me.getOptions();
            },
            getOptions(){
                let me = this;
                me.options =[{name:'顶级',id:-1,pid:0}];
                let url = '/api/news/type/alllists';
                let data = '';
                me.getGetdata(url, data, function (res) {
                    var data = res.body.data;
                    me.options=!!data ? [...me.options,...data] : me.options;
                });
            },
            getNews(){
                this.getGategoriesData()
            },
            //显示新增界面
            addNews(){
                this.addFormVisible = true;
                this.ruleForm = {
                    name: '',
                    desc: '',
//                    pid: ''
                    pid:[]
                };
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                var editForm = Object.assign({}, row);
                if(editForm.pid == 0){
                    editForm.pid=[-1];
                }else{
                    editForm.pid=editForm.pids.split(',');
                    editForm.pid=editForm.pid.map((item)=>{
                        return item-0
                    })
                }
                this.editForm = editForm;
                this.editValue = row.id;
                this.editPath=row.path;
                this.$options.filters.disableItem(this.options,row.id)

            },
            //编辑
            editSubmit(formName) {
                var me = this;
                me.$refs[formName].validate((valid) => {
                    if (valid) {
                            var data = JSON.parse(JSON.stringify(me[formName]));
                            var pids = data.pid;
                            data.pids=(pids.length === 1 && pids[0] <0) ? 0 : pids.join(',');
                            var _pid = pids.pop();
                            if(_pid == me.editValue){
                                me.$alert('不能选择自己作为父集', '新闻类型选择错误', {
                                    confirmButtonText: '确定',
                                    callback: action => {
                                        this.$message({
                                            type: 'info',
                                            message: '重新选择'
                                        });
                                    }
                                });
                                return
                            }
                            data.pid = _pid >0 ? _pid : 0;
                            data.code = data.code.replace(/(^\s*)|(\s*$)/g, "");
                            var url = '/api/news/type/'+data.id;
                            me.getPutdata(url,data,function(res){
                                me.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                me.$refs['editForm'].resetFields();
                                me.editFormVisible = false;
                                me.getNews();
                            })

                    }
                });
            },
            //添加类型
            addSubmit(formName){
                var me = this;
                this.$refs[formName].validate((valid)=> {
                    if (valid) {
                            var data = Object.assign({},me.ruleForm);
                            var pids = data.pid;
                            data.pids=(pids.length === 1 && pids[0] <0) ? 0 : pids.join(',');
                            var _pid = pids.pop();
                            data.pid = _pid >0 ? _pid : 0;
                            data.status = 1;
                            data.code = data.code.replace(/(^\s*)|(\s*$)/g, "");
                            data.path = data.path.replace(/(^\s*)|(\s*$)/g,"");
                            var url = '/api/news/type/add';
                            me.getPostdata(url,data,function(res){
                                me.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                me.$refs['ruleForm'].resetFields();
                                me.addFormVisible = false;
                                me.getNews();
                            })

                    }
                })
            },
            //删除
            handleDel(index, row) {
                var me = this;
                var id = row.id;
                var result = me.options.some(function(item){
                    return item.pid == id;
                });
                if(result){
                    me.$alert('该数据有子集不可删除', '删除错误', {
                        confirmButtonText: '确定',
                        callback: action => {
                            this.$message({
                                type: 'info',
                                message: '未删除'
                            });
                        }
                    })
                }else {
                    me.$confirm('确认删除该记录吗?', '提示', {
                        type: 'warning'
                    }).then(() => {
                        var url = '/api/news/type/' + row.id;
                        var data = row;
                        delete data.create_time;
                        me.getDeletedata(url, data, function (res) {
                            me.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            me.getNews();
                        })
                    }).catch( _ => {
                        this.$message('已取消删除');
                    });
                }
            },
            //跳转分页
            handleCurrentChange(val) {
                this.page = val;
                this.getNews();
            },
            onSizeChange(val){
                this.pageSize = val;
                this.getNews();
            },
            searchName(){
                if(!this.filters.name){
                    this.getGategoriesData()
                }
            }

        },
        computed:{
//            filters(){
//                debugger;
//                var data='';
//                if(!data){
//                    this.getGategoriesData()
//                }
//                return data;
//            }
        },
        mounted() {
//            this.getOptions()
            this.getGategoriesData()
        }
    }

</script>
