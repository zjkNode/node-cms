<template>
    <div class="contractsType">
        <h2>合同类型</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入要查找的合同类型"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table :data="contractTypeList" stripe v-loading="isLoading" style="width: 100%;margin:0 auto;">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="name" label="类别名称" :formatter="formatTree" class-name='flat-tree'></el-table-column>
                <!-- <el-table-column prop="pid" label="合同级别" align="center" :formatter="formatterPid"></el-table-column> -->
                <el-table-column prop="status" label="状态" width="80" align="center">
                    <template scope="scope" >
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="添加时间" align="center" :formatter="formatterDate"></el-table-column>
                <el-table-column fixed="right" label="操作" width="100" >
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="onRemoveClick(scope.$index,scope.row)" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="init" :listsTree="listsTree"></addForm>    
         <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="init" :rowData="rowData" :listsTree="listsTree"></editForm> 
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
                contractTypeList:null,
                contractTypeData:null,
                listsTree:null,
                keys:"",
                items:[],
                addFormVisible: false,
                editFormVisible:false
            }
        },
        mounted(){
            this.init();
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
                let url = '/api/contracts/type/lists';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url,{params:params},{credentials: true}).then((rs)=>{
                    this.isLoading = false;
                    if(rs.body.code === 'SUCCESS'){
                        let resData = rs.body.data;
                        this.contractTypeList = resData.allData;
                        this.items = resData.allData;
                        let tree = resData.dataTree;
                        let arrTop = [{name:'顶级菜单',id:0,pid:0}];
                        tree ? this.listsTree = arrTop.concat(tree) : this.listsTree = arrTop;
                    }
                },(err) => {
                    this.isLoading = false;
                })
            },
            onRemoveClick(index,row){
                var result = this.contractTypeList.some(function(item){
                    return item.pid == row.id;
                });
                if(result){
                    this.$alert('该数据有子集不可删除', '删除错误', {
                        confirmButtonText: '确定',
                        callback: action => {
                            this.$message({
                                type: 'info',
                                message: '未删除'
                            });
                        }
                    })
                }else{
                    this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                    .then(() => {
                        let url = '/api/contracts/type/'+ row.id;
                        this.$http.delete(url).then((res)=>{
                            this.contractTypeList.splice(index,1);
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
                }
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
            formatterPid(row,column,value){
                let pid = row.pid;
                if(pid === 0){
                    return '顶级'
                }else{
                    let list = this.items.filter( (i) => {
                        return i.id === pid;
                    })
                    let name=list.length>0 ? list[0].name : '空';
                    return name;
                }
            },
            formatterDate(row,column,cellValue){
                return moment(cellValue).format("YYYY-MM-DD HH:mm:ss")
            },
            formatTree(row, column,value){
                let flatTree = this.$options.filters.flatTree;
                return flatTree(row, value);
            }
        }
    }
</script>
