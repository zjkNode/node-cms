<template>
    <div class="contractsType">
        <h2>合同占位符</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入要查找的占位符名称"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table :data="contractVmList" stripe v-loading="isLoading" style="width: 100%;margin:0 auto;">       
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="type" label="所属合同类型" min-width="200" align="center"  class-name='flat-tree'></el-table-column>
                <el-table-column prop="name" label="占位符名称" min-width="200" align="center"  class-name='flat-tree'></el-table-column>
                <el-table-column prop="placeholder" label="VM占位符"  align="center" min-width="200" ></el-table-column>  
                <el-table-column prop="desc" label="占位符描述"  align="center" min-width="200" ></el-table-column>  
                <el-table-column prop="create_time" label="添加时间" align="center"  min-width="260":formatter="formatterDate"></el-table-column>
                <el-table-column fixed="right" label="操作" width="200" align="center">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="onRemoveClick(scope.$index,scope.row)" style="color: #ff4949;">删除</el-button>
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
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="init" :listsTree="listsTree"></addForm>    
         <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="init" :listsTree='listsTree'  :rowData="rowData"></editForm> 
    </div>
</template>
<script>
    import addForm from "./add.vue";
    import editForm from './edit.vue';
    var moment = require('moment');
    export default {
        components:{ addForm, editForm},
        data(){
            return {
                contractVmList:null,
                contractTypeData:null,
                listsTree:null,
                keys:"",
                items:[],
                addFormVisible: false,
                editFormVisible:false,
                nowPageData:null,
                total:0
            }
        },
        mounted(){
            this.init();
            this.getTreeData();
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
        methods:{
            init(){
                let url = '/api/contracts/vm/lists';
                let params = {
                    keys: this.keys,
                    pageIndex:this.page,
                    pageSize:this.pageSize
                };
                this.isLoading = true;
                this.$http.get(url,{params:params}).then((rs)=>{
                    this.isLoading = false;
                    if(rs.body.code === 'SUCCESS'){
                        let resData = rs.body.data;
                        this.contractVmList = resData.lists;
                        //处理分页数据：
                        this.total = resData.total; 
                                   
                    }
                },(err) => {
                    this.isLoading = false;
                })
            },
            getTreeData(){
                let url = '/api/contracts/type/lists';
                let params = {
                    keys: this.keys
                };
                this.$http.get(url,{params:params}).then((rs)=>{
                    if(rs.body.code === 'SUCCESS'){
                        this.listsTree = rs.body.data.dataTree;
                    }
                },(err) => {
                });
            },
            onRemoveClick(index,row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/contracts/vm/'+ row.id;
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
                    this.$message('已取消删除');
                });
                
            },
            onEditClick(row){
                this.rowData = Object.assign({}, row);
                this.editFormVisible = true;
            },
            onAddVisibleChange(val){
                this.addFormVisible = val;
            },
            onEditVisibleChange(val){
               this.editFormVisible = val;
            },
            formatterDate(row,column,cellValue){
                return moment(cellValue).format("YYYY-MM-DD HH:mm:ss")
            },
            handleCurrentChange(val) {
                this.page = val;
                this.init()
            },
            onSizeChange(val){
                this.pageSize = val;
                this.init()            
            }
        }
    }
</script>
<style>
    .el-row>.el-pagination{
        padding-top: 20px;
    }
</style>
