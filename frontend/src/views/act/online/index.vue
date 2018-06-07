<template>
    <div class="contractsContent">
        <h2>活动列表</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入活动名称/代码/路径"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="addActFn">创建</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table stripe v-loading="isLoading" :data="actLists">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="name" label="活动名称" align="center" width="160"></el-table-column>
                <el-table-column prop="code" label="活动代码" align="center"  width="200"></el-table-column>
                <el-table-column prop="url" label="活动访问Url" align="center" min-width="300"></el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template scope="scope" >
                        <el-tag :type="scope.row.status | filterType" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="publish_time" label="发布时间" width="200" align="center" :formatter="formateDate" sortable show-overflow-tooltip></el-table-column>
                <el-table-column fixed="right" label="操作" width="250" align="center">
                    <template scope="scope">
                        <el-button type="text" size="small" :disabled="[1,4].indexOf(scope.row.status) > -1" @click="onView(scope.row)">查看</el-button>
                        <el-button type="text" size="small" @click="onEdit(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" :disabled="[2,3].indexOf(scope.row.status) > -1" @click="onDel(scope.row)">删除</el-button>
                        <el-button type="text" size="small" :disabled="scope.row.status != 5" @click="onOnline(scope.row)">上架</el-button>
                        <el-button type="text" size="small" :disabled="[2,3].indexOf(scope.row.status) === -1" @click="onOffline(scope.row)">下架</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <div class="block pagbar">
            <el-pagination
                    @size-change="onSizeChange"
                    @current-change="onCurChange"
                    :current-page="page"
                    :page-sizes="[15, 30, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
    </div>
</template>
<script>
    var moment = require('moment');
    var util = require('src/js/common/util');
    export default {
        data(){
            return {
               isLoading: false,
               keys:'',
               total: 0,
               pageSize:15,
               pageIndex:1,
               actLists:[],
               actStauts:{
                DRAFT: 1, ONLINE: 2,  MODIFY: 3, OFFLINE: 4, ONTEST: 5
               }
            }
        },
        mounted(){
            this.init();
        },
        filters:{
            statusFilter(val){
                let actStauts = {
                    1:'草稿', 2:'已上架',3:'线上修改',4:'已下架',5:'测试'
                };
                return actStauts[val] || '未知';
            },
            filterType(val){
                let tagStatus = {
                    1:'', 2:'success', 3:'warning', 4:'danger', 5:''
                }
                return tagStatus[val] || '';
            }
        },
        methods: {
            init(){
                let url = '/api/act/lists';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                };
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if(res.body.code === 'SUCCESS'){
                        let resData = res.body.data;
                        this.total = resData.total;
                        this.actLists = resData.lists;
                    }
                    
                }, (err)=> {
                    this.isLoading = false;
                    console.log(err);
                })
            },
            addActFn(){
                this.$router.push('/act/tpl');
                this.$message.warning(`请先选择需要用的模板哟~`);
            },
            formateDate(row, column, value){
                return util.dateFormate(value);
            },
            onView(row){
                window.open(row.url);
            },
            onEdit(row){
                this.$router.push('/act/edit?id='+row.id);
            },
            onOnline(row){
                let url = '/api/act/'+ row.id;
                this.$http.post(url).then((res)=>{
                    if(res.data.code == 'SUCCESS'){
                        this.$message({
                            message: res.data.msg,
                            type: 'success'
                        });
                        this.init();
                        return;
                    }
                    this.$message({
                        message: res.data.msg
                    });
                },(err)=>{
                    console.log(err);
                });
            },
            onOffline(row){
                this.$confirm('确认下架吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/act/'+ row.id;
                    this.$http.put(url,row).then((res)=>{
                        this.$message({
                            message: '下架成功',
                            type: 'success'
                        });
                        this.init();
                    },(err)=>{
                        console.log(err);
                    });
                });
            },
            onDel(row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/act/'+ row.id;
                    this.$http.delete(url,{body:row}).then((res)=>{
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.init();
                    },(err)=>{
                        console.log(err);
                    });
                });
            },
            onSizeChange(value){
                this.pageSize = value;
                this.init();
            },
            onCurChange(value){
                this.pageIndex = value;
                this.init();
            }
        }
    }
</script>
