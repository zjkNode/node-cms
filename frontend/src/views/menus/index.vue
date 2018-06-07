<template>
    <el-row class="menus">
        <h2>菜单管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入菜单名称/链接地址"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table :data="menuList" stripe v-loading="isLoading" style="width: 100%;">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="name" label="菜单名称" show-overflow-tooltip width="300" :formatter="formatTree" class-name='flat-tree'></el-table-column>
                <el-table-column prop="alink" label="链接地址" show-overflow-tooltip min-width="180"></el-table-column>
                <el-table-column prop="sort" label="排序" width="70" align="center"></el-table-column> 
                <el-table-column prop="status" label="状态" width="80"  filter-placement="bottom-end" align="center">
                    <template scope="scope" >
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="添加时间" align="center" width="200" :formatter="formatterDate" show-overflow-tooltip></el-table-column>
                <el-table-column fixed="right" label="操作" width="100" >
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="onRemoveClick(scope.$index,scope.row)" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
                
            </el-table>
        </el-row>
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="init" :menuTree="menuTree"></addForm>   
        <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="init" :rowData="rowData" :menuTree="menuTree"></editForm> 
    </el-row>
</template>
<script>
    import addForm from './add.vue';
    import editForm from './edit.vue';
    var moment = require('moment');
    export default {
        components:{ addForm, editForm},
        data(){
            return {
                isLoading: true,
                menuList: null,
                menuTree: null,
                rowData: null,
                keys:"",
                addFormVisible: false,
                editFormVisible:false
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
        mounted(){
            this.init();
        },
        methods: {
            init(){
                this.$parent.$parent.$children[0].onMenuReload();
                this.getMenuTree();
                let url = '/api/menu/lists';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url,{ params: params}).then((res)=>{
                    this.isLoading = false;
                    if(res.body.code === 'SUCCESS'){
                        let resData = res.body.data;
                        this.menuList = resData.allData;
                    }
                },(err) => {
                    this.isLoading = false;
                });
            },
            getMenuTree(){
                this.isLoading = true;
                let url = '/api/menu/listsTree';
                this.$http.get(url).then((res)=>{
                    this.isLoading = false;
                    if(res.body.code === 'SUCCESS'){
                        let tree = res.body.data;
                        let arr1 = [{name:'顶级菜单',id:0,pid:0}];
                        tree ? this.menuTree = arr1.concat(tree) : this.menuTree = arr1;
                    }
                },(err) => {
                    this.isLoading = false;
                });
            },
            onEditClick(row){
                this.rowData = Object.assign({}, row);
                this.editFormVisible = true;
            },
            onRemoveClick(index,row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/menu/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        this.$parent.$parent.$children[0].onMenuReload()
                        this.menuList.splice(index,1);
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
            filterTag(value,row){
                return row.status == value;
            },
            onAddVisibleChange(val){
                this.addFormVisible = val;
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            },
            formatterDate(row,column,cellValue){
                return moment(cellValue).format("YYYY-MM-DD hh:mm:ss")
            },
            formatTree(row, column,value){
                let flatTree = this.$options.filters.flatTree;
                return flatTree(row, value);
            }
        }
    }
</script>
