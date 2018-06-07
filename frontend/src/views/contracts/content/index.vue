<template>
    <div class="contractsContent">
        <h2>合同内容</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入合同标题"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="handleAdd" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table :data="contractsList" stripe v-loading="isLoading" style="width: 100%;margin:0 auto;">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="contractsType.name" label="合同类别" align="center" width="160"></el-table-column>
                <el-table-column prop="title" label="合同标题" align="center" show-overflow-tooltip width="200"></el-table-column>
                <el-table-column prop="content" label="合同内容" align="center" min-width="260" class-name='overflow-ellipsis' :formatter="formatterContent"></el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template scope="scope" >
                        <el-tag :type="filterType(scope.$value, scope.row)" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="publish_time" label="发布时间" width="260" align="center" :formatter="formatterDate" sortable show-overflow-tooltip></el-table-column>
                <el-table-column fixed="right" label="操作" width="250" align="center">
                    <template scope="scope">
                        <el-button type="text" size="small" v-show="scope.row.status===3" @click="handlePublish(scope.$index, scope.row)" style="color: #ff4949;">重新发布</el-button>
                        <el-button type="text" size="small" v-show="scope.row.status===2" @click="handlePublish(scope.$index, scope.row)" style="color: #ff4949;">发布</el-button>
                        <el-button type="text" size="small" @click="handleLook(scope.$index, scope.row)">预览</el-button>
                        <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" size="small" v-show="scope.row.status===1">
                            <el-dropdown trigger="click" @command="handleDownLoad">
                                <span class="el-dropdown-link" style="color:#20a0ff;font-size:12px;">
                                    下载<i class="el-icon-caret-bottom el-icon--right"></i>
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item :command="{name:'vm',row:scope.row}">vm格式</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </el-button>
                        <el-button type="text"  v-show="scope.row.status===2" size="small" @click="handleDel(scope.$index, scope.row)" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
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
    </div>
</template>
<script>
    var moment = require('moment');
    export default {
        data(){
            return {
                contractsList:null,
                keys:"",
                total:0
            }
        },
        mounted() {
            this.init();
        },
        filters:{
            statusFilter(val){
                if(val === 1)
                    return '已发布';
                if(val === 2)
                    return '未发布';
                if(val === 3)
                    return '待发布';
                return '未知';
            }
        },
        methods: {
            init(){
                let params = {
                    keys: this.keys,
                    pageIndex:this.page,
                    pageSize:this.pageSize
                }
                let url = '/api/contracts/lists';
                this.$http.get(url,{params:params},{credentials: true}).then((rs)=>{
                    this.isLoading = false;
                    if(rs.body.code === 'SUCCESS'){
                        let resData = rs.body.data;
                        this.contractsList = resData.lists;
                        this.total = resData.total;
                    }
                },(err) => {
                    this.isLoading = false;
                })
            },
            //发布合同
            handlePublish(index, row){
                var me = this;
                this.$confirm('确认发布吗？', '友情提示', {type: 'warning'}).then(() => {
                    var data = Object.assign({},row);
                        data={id:data.id,typeid:data.typeid};
                    var url = '/api/contracts/'+row.id;
                    this.$http.post(url,data).then((res)=>{
                        this.$message({
                            message:'发布成功',
                            type: 'success'
                        });
                        this.init();
                    },(err)=>{
                        console.log(err);
                    });
                }).catch(()=>{
                    this.$message({
                        message:'已取消发布'
                    });
                });
            },
            //预览
            handleLook(index, row){
                window.open('/preview/contracts/'+ row.id);
            },
            handleDownLoad(command){
                var row = command.row;
                if(command.name == "vm"){
                    var url = '/preview/contracts/'+ row.id+'.vm';
                    download(url, row.title+'.vm');
                }else{
                    var url = '/preview/contracts/pdf/'+ row.id;
                    download(url, row.title+'.pdf');
                }

                function download(href, title) {
                    const a = document.createElement('a');
                    a.setAttribute('href', href);
                    a.setAttribute('download', title);
                    a.click();
                }
            },
            handleAdd(index,row){
                this.$router.push({
                    path:'/contracts/content/add'
                });
            },
            //显示编辑弹框
            handleEdit(index,row){
                this.rowData = Object.assign({}, row);
                this.$router.push({
                    path:'/contracts/content/edit',
                    query:{id:this.rowData.id}
                });
            },
            //删除数据
            handleDel(index, row) {
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/contracts/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        this.$message({
                            message:'已删除',
                            type: 'success'
                        });
                        this.init();
                    },(err)=>{
                        console.log(err);
                    });
                }).catch(()=>{
                    this.$message({
                        message:'已取消删除'
                    });
                });
            },
            handleCurrentChange(val) {
                this.page = val;
                this.init()
            },
            onSizeChange(val){
                this.pageSize = val;
                this.init()
            },
            filterType(value,row){
                if(row.status === 1){
                    return 'success';
                }else if(row.status === 2){
                    return 'danger';
                }else if(row.status === 3){
                    return 'warning';
                }
            },
            formatterContent(row,column,cellValue){
                return row.content.replace(/<[^>]+>/g,"")
            },
            formatterDate(row,column,cellValue){
                var val=!!cellValue ? moment(cellValue).format("YYYY-MM-DD HH:mm:ss") : '---';
                return val;
            }
        }
    }
</script>