<template>
    <div class="contractsContent">
        <h2>活动配置</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入配置名称/配置域名/百度代码"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="addFormVisible = true">新增</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table stripe v-loading="isLoading" :data="dataLists">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="name" label="配置名称" align="center" width="160"></el-table-column>
                <el-table-column prop="domain" label="域名" align="center"  width="300"></el-table-column>
                <el-table-column prop="oss_code" label="oss路径" align="center" min-width="100"></el-table-column>
                <el-table-column prop="publish_path" label="本地路径" align="center" min-width="200"></el-table-column>
                <el-table-column prop="baidu_code" label="百度代码" align="center" min-width="300"></el-table-column>
                <el-table-column prop="download_urls" label="安装包地址" align="center" min-width="300" class-name='overflow-ellipsis'></el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="200" align="center" :formatter="formateDate" sortable show-overflow-tooltip></el-table-column>
                <el-table-column prop="update_time" label="更新时间" width="200" align="center" :formatter="formateDate" sortable show-overflow-tooltip></el-table-column>
                <el-table-column fixed="right" label="操作" width="250" align="center">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onEdit(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="onDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="init" :newsTypeData="newsTypeData"></addForm>    
        <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="init" :rowData="rowData" :newsTypeData="newsTypeData"></editForm>  
    </div>
</template>
<script>
    import addForm from "./add.vue";
    import editForm from './edit.vue';
    var moment = require('moment');
    var util = require('src/js/common/util');
    export default {
        components:{ addForm, editForm},
        data(){
            return {
               addFormVisible: false,
               editFormVisible: false,
               isLoading: false,
               keys:'',
               dataLists:[],
               rowData:null
            }
        },
        mounted() {
            this.init();
        },
        filters:{},
        methods: {
            init(){
                let url = '/api/act/config/lists';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if(res.body.code === 'SUCCESS'){
                        this.dataLists = res.body.data;
                    }
                    
                }, (err)=> {
                    this.isLoading = false;
                    console.log(err);
                })
            },
            
            formateDate(row, column, value){
                return util.dateFormate(value);
            },
            onEdit(row){
                this.rowData = Object.assign({}, row);
                this.editFormVisible = true;
            },
            onAddVisibleChange(val){
                this.addFormVisible = val;
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            },
            onDel(index, row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/act/config/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        this.$message({
                            message: '删除成功',
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
            }
        }
    }
</script>
