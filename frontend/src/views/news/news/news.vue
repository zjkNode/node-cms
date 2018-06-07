<template>
    <el-row class="news">
        <h2>新闻内容管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="filters.name" placeholder="请输入查询新闻标题/新闻内容" @input="searchName"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" v-on:click="getNewsData" icon="el-icon-search">查询</el-button>
                <el-button type="primary" v-on:click="addNews" icon="el-icon-plus" pull="6"> 新增</el-button>
                <!--
                <el-button type="primary" v-on:click="publishHome"> 发布首页</el-button>
                <el-button type="primary" v-on:click="publishAll"> 重新发布所有</el-button>
                -->
            </el-col>
        </el-row>
        <!--列表-->
        <template>
            <el-table :data="news" highlight-current-row v-loading="loading" style="width: 100%;">
                <el-table-column type="index" width="60" >
                </el-table-column>
                <el-table-column prop="newsType.name" label="新闻类别" width="120">
                </el-table-column>
                <el-table-column prop="title" label="新闻标题" width="260" :formatter="formatterTitle" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="content" label="新闻内容" min-width="260" :formatter="formatters" class-name='overflow-ellipsis'>
                </el-table-column>
                <el-table-column prop="author" label="新闻发布者" width="120">
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100"  filter-placement="bottom-end" align="center">
                    <template scope="scope" >
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="publish_time" label="新闻发布时间"  :formatter="formatterDate" min-width="180" sortable>
                </el-table-column>
                <el-table-column prop="status" fixed="right" label="操作" width="240" >
                    <template scope="scope" >
                        <!--<el-button type="text" size="small" v-show="!!scope.row.newsType.id && scope.row.status===1" @click="handleAdd(scope.$index, scope.row)" >重新发布</el-button>-->
                        <el-button type="text" size="small" :disabled='scope.row.status !==2' @click="handleAdd(scope.$index, scope.row)">发布</el-button>
                        <el-button type="text" size="small" @click="handleLook(scope.$index, scope.row)">预览</el-button>
                        <el-button type="text" size="small" :disabled='scope.row.status !==2' @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" size="small" :disabled='scope.row.status !==1' @click="handleremove(scope.$index, scope.row)">下线</el-button>
                        <el-button type="text" size="small" :disabled='scope.row.status !==2' @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <!--工具条-->
        <div class="block pagbar">
            <el-pagination
                    @size-change="onSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="page"
                    :page-sizes="[15, 30, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
    </el-row>
</template>
<script type="text/ecmascript-6">
    import UE from 'components/ue.vue';
    var moment = require('moment');
    export default {
        data() {
            return {
                filters:{
                    name:''
                },
                news:[],
                items:[],
                options:[],
                editValue:'',
                total: 0,
                page: 1,
                loading: false,
                listLoading:false,
                pageSize:15,
                pageIndex:1
            }
        },
        components:{ UE },
        filters:{
            statusFilter(value){
                if(value == 1){
                    return '已发布'
                }else{
                    return '未发布'
                }
            }
        },
        mounted() {
            this.getNewsData()
        },
        methods: {

            formatterDate(row,column,cellValue){
                var val=!!cellValue ? moment(cellValue).format("YYYY-MM-DD HH:mm:ss") : '---';
                return val;

            },
            formatterTitle(row,column,cellValue){
                return row.title.replace(/<[^>]+>/g,"")
            },
            formatters(row,column,cellValue){
                return row.content.replace(/<[^>]+>/g,"")
            },
            //获取MOCK
            getPostdata(url, params, callback){
                var me = this;
                me.addLoading = true;
                me.$http.post(url, params, {credentials: true})
                        .then((res)=> {
                            me.addLoading = false;
                            if (res.body.code === 'SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.addLoading = false;
                        });
            },
            getGetdata(url, params, callback){
                var me = this;
                me.loading = true;
                me.$http.get(url, {params:params}, {credentials: true})
                        .then((res)=> {
                            me.loading = false;
                            if (res.body.code =='SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.loading = false;
                        });
            },
            getPutdata(url, params, callback){
                var me = this;
                me.editLoading = true;
                me.$http.put(url, params, {credentials: true})
                        .then((res)=> {
                            me.editLoading = false;
                            if (res.body.code =='SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.editLoading = false;
                        });
            },
            getDeletedata(url, params, callback){
                var me = this;
                me.listLoading = true;
                me.$http.delete(url, params, {credentials: true})
                        .then((res)=> {
                            me.listLoading = false;
                            if (res.body.code =='SUCCESS') {
                                callback && callback(res)
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.editLoading = false;
                        });
            },


            //获取新闻列表数据
            getNewsData(){
                let me = this;
                let url = '/api/news/lists';
                let data = {keys:this.filters.name,pageIndex:this.page,pageSize:this.pageSize};
                me.getGetdata(url, data, function (res) {
                    var data = res.body.data;
                    me.news = data.lists;
                    me.total = data.total;
                });
            },
            //显示新增界面
            addNews(){
                this.$router.push({
                    path:'/news/content/add'
                });
            },
            //发布首页
            publishHome(){
                var me = this;
                this.$confirm('确认发布吗？', '提示', {}).then(() => {
                    var url = '/api/news/publish/home';
                    me.getPostdata(url,null,function(res){
                        me.$message({
                            message: '发布成功',
                            type: 'success'
                        });
                    });
                }).catch(_=>{});
            },
            //发布所有
            publishAll(){
                var me = this;
                this.$confirm('确认发布吗？', '提示', {}).then(() => {
                    var url = '/api/news/publish/all';
                    me.getPostdata(url,null,function(res){
                        me.$message({
                            message: '发布成功',
                            type: 'success'
                        });
                    });
                }).catch(_=>{});
            },
            //发布新闻
            handleAdd(index, row){
                var me = this;
                this.$confirm('确认发布吗？', '提示', {}).then(() => {
                    var data = Object.assign({},row);
                    data={id:data.id,typeid:data.typeid};
                    var url = '/api/news/publish/'+row.id;
                    me.getPostdata(url,data,function(res){
                        me.$message({
                            message: '发布成功',
                            type: 'success'
                        });
                        me.getNewsData()
                    })
                }).catch(_=>{});
            },
            //下架、删除文件
            handleremove(index,row){
                var me = this;
                var id = row.id;
                me.$confirm('确认下线该新闻吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    var url = '/api/news/remove/' + id;
                    var data ='';
                    me.getDeletedata(url, data, function (res) {
                        me.$message({
                            message: '下线成功',
                            type: 'success'
                        });
                        me.getNewsData()
                    })
                }).catch(_=>{});
            },
            //预览
            handleLook(index, row){
                window.open('/preview/news/'+ row.id);
            },


            //显示编辑弹框
            handleEdit(index,row){
                this.$router.push({
                    path:'/news/content/edit',
                    query:{id:parseInt(row.id)}
                })
            },
            //删除数据
            handleDel(index, row) {
                var me = this;
                var id = row.id;
                    me.$confirm('确认删除该记录吗?', '提示', {
                        type: 'warning'
                    }).then(() => {
                        var url = '/api/news/' + id;
                        var data ='';
                        me.getDeletedata(url, data, function (res) {
                            me.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            me.getNewsData()
                        })
                    }).catch(_=>{});
            },

            //跳转分页
            handleCurrentChange(val) {
                this.page = val;
                this.getNewsData()
            },
            onSizeChange(val){
                this.pageSize = val;
                this.getNewsData()
            },
            searchName(){
                if(!this.filters.name){
                    this.getNewsData()
                }
            }
        }
    }

</script>
