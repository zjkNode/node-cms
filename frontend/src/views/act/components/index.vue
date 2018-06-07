<template>
    <div>
        <h2>组件列表</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入活动组件名称"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="addFormVisible = true">创建</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table stripe v-loading="isLoading" :data="componentsLists">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="name" label="组件名称" align="center"  min-width="200"></el-table-column>
                <el-table-column prop="time" label="更新时间" min-width="200" align="center" :formatter="formateDate" sortable show-overflow-tooltip></el-table-column>
                <el-table-column fixed="right" label="操作" width="250" align="center">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onEdit(scope.$index, scope.row)">更新</el-button>
                        <el-button type="text" size="small" @click="onDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange"></addForm>   
        <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" :rowData="rowData"></editForm> 

    </div>
</template>
<script>
    var moment = require('moment');
    var util = require('src/js/common/util');
    import addForm from './add.vue';
    import editForm from './edit.vue';
    export default {
        components:{ addForm, editForm},
        data(){
            return {
                isLoading: false,
                keys:'',
                rowData: null,
                componentsLists:[],
                addFormVisible: false,
                editFormVisible: false
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init(){
                let url = '/api/act/components/lists';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if(res.body.code === 'SUCCESS'){
                        let resData = res.body.data;
                        this.componentsLists = resData;
                    }
                }, (err)=> {
                    this.isLoading = false;
                    console.log(err);
                })
            },
            onAddVisibleChange(val){
                this.addFormVisible = val;
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            },
            formateDate(row, column, value){
                return util.dateFormate(value);
            },
            onEdit(index, row){
                this.editFormVisible = true;
                this.rowData = Object.assign({}, row);
            },
            onDel(index, row, txt){
                this.$confirm('确认删除该组件吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/act/components/'+ row.name;
                    this.$http.delete(url).then((res)=>{
                        let resData = res.body;
                        if( resData.code === 'SUCCESS'){
                            this.$message.success(resData.msg);
                            this.init();
                        }else{
                            this.$message.error(resData.msg);
                        }
                        
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
<style lang="scss">
    
</style>
