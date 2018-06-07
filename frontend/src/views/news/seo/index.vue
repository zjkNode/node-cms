<template>
    <el-row class="seo">
        <h2>SEO管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入新闻标题/关键词/描述"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus" pull="6"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table :data="newsLists" stripe v-loading="isLoading">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="newsType.name" label="所属类型" align="center" min-width="160"></el-table-column>
                <el-table-column prop="title" label="页面标题" align="center" show-overflow-tooltip min-width="180" ></el-table-column>
                <el-table-column prop="keywords" label="页面关键字" align="center" show-overflow-tooltip min-width="180"></el-table-column>
                <el-table-column prop="description" label="页面描述" align="center" min-width="200" show-overflow-tooltip></el-table-column>
                <el-table-column prop="create_time" label="添加时间" width="180" :formatter="formatterDate" sortable></el-table-column> 
                <el-table-column fixed="right" label="操作" width="100" >
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
                @current-change="onCurrentChange"
                :current-page="pageIndex"
                :page-sizes="[15, 30, 50, 100]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalPage">
            </el-pagination>
        </div>  
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="init" :newsTypeData="newsTypeData"></addForm>    
        <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="init" :rowData="rowData" :newsTypeData="newsTypeData"></editForm>  
    </el-row>
</template>
<script>
    import addForm from "./add.vue";
    import editForm from './edit.vue';
    var moment = require('moment');
    export default {
        components:{ addForm, editForm},
        data(){
            return {
                addFormVisible: false,
                editFormVisible: false,
                newsTypeData:[],
                // newTypeData_noOrder:[],
                newsLists:[],
                rowData: null,
                keys:"",
                pageIndex:1,
                pageSize:15
            }
        },
        mounted(){
            this.init();
            this.getTypeOption();
        },
        methods:{
            init(){
                let url = '/api/news/seo/lists';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex:this.pageIndex
                };

                this.isLoading = true;
                this.$http.get(url, { params: params }).then((res)=>{
                    this.isLoading = false;
                    if(res.body.code === 200){
                        let resData = res.body.data;
                        this.newsLists = resData.lists;
                        this.totalPage = resData.total;

                    }
                },(err) => {
                    this.isLoading = false;
                });
            },
            getTypeOption(){
                let url = '/api/news/type/alllists';
                let param = {};
                this.$http.get(url,param).then( (rs)=>{
                    this.newsTypeData = rs.body.data;
                }, (err)=>{
                    console.log(rs)
                })
            },
            onEditClick(row){
                this.rowData = Object.assign({}, row);
                this.editFormVisible = true;
            },
            onRemoveClick(index,row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/news/seo/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        this.newsLists.splice(index,1);
                    },(err)=>{
                        console.log(err);
                    });
                }).catch(()=>{
                    this.$message({
                        message:'已取消删除'
                    });
                });
            },
            onAddVisibleChange(val){
                this.addFormVisible = val;
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            },
            onCurrentChange(val){
                this.pageIndex = val;
                this.init();
            },
            onSizeChange(val){
                this.pageSize = val;
                this.init();
            },
            // formatterType(row,column,value){
            //     let typeArr = this.newTypeData_noOrder;
            //     for (var i in typeArr){
            //         if( value == typeArr[i].id ){
            //             return typeArr[i].name;
            //         }
            //     }
            // },
            formatterDate(row,column,cellValue){
                if(!cellValue) return '';
                return moment(cellValue).format("YYYY-MM-DD hh:mm:ss")
            }
        }
    }
</script>
