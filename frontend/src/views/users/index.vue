<template>
    <el-row class="user">
        <h2>用户管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入用户email/姓名/电话"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="bindUsers" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus" pull="6">新增</el-button>
            </el-col>
            
            
        </el-row>
        <el-row>
            <el-table :data="userList" stripe v-loading="isLoading" style="width: 100%">
                <el-table-column type="index" width="60"></el-table-column>
                <el-table-column prop="email" label="登录名" width="180"></el-table-column>
                <el-table-column prop="nickname" label="真实姓名" min-width="180"></el-table-column>
                <el-table-column prop="dep.name" label="所在部门" min-width="180"></el-table-column>
                <el-table-column prop="role.name" label="角色" min-width="180"></el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                    <template scope="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>{{scope.row.status | statusFilter}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="添加时间" :formatter="dateFormat" width="200"></el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                  <template scope="scope">
                    <el-button @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                    <el-button @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #ff4949;">删除</el-button>
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
              :total="total">
            </el-pagination>
        </div>
        <addForm :isAddVisible="addFormVisible" :depOptions="depOptions" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="bindUsers"></addForm>
        <editForm :isEditVisible="editFormVisible" :depOptions="depOptions" :rowData="rowData" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="bindUsers"></editForm>
    </el-row>
</template>
<script type="text/ecmascript-6">
    import addForm from './add.vue';
    import editForm from './edit.vue';
    var moment = require('moment');

    export default {
    components:{ addForm, editForm },
    data() {
      return {
            addFormVisible: false,
            editFormVisible:false,
            isLoading: false,
            keys:"",
            rowData:null,
            depOptions: null,
            userList: null,
            pageSize:15,
            pageIndex:1,
            total:0
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
        this.bindUsers();
        this.bindDepTree();
    },
    methods:{
        onAddVisibleChange(val){
            this.addFormVisible = val;
        },
        onEditVisibleChange(val){
            this.editFormVisible = val;
        },
        filterTag(value,row){
            return row.status == value;
        },
        dateFormat(row,column,cellvalue){
            var date = row[column.property];  
            if (date == undefined) {  
             return "";  
            }  
            return moment(date).format("YYYY-MM-DD HH:mm:ss");  
        },
        bindUsers(){
            let url = '/api/user/lists';
            let params = {
                keys: this.keys,
                pageSize: this.pageSize,
                pageIndex:this.pageIndex
            };
            this.isLoading = true;
            this.$http.get(url,{ params: params}).then((res)=>{
                this.isLoading = false;
                if(res.body.code === 'SUCCESS'){
                    let resData = res.body.data;
                    this.userList = resData.lists;
                    this.total = resData.total;
                }
            },(err) => {
                this.isLoading = false;
            });
        },
        bindDepTree(){
          let url = '/api/dep/treeList';
          this.$http.get(url,null).then((res)=>{
              if(res.body.code === 'SUCCESS'){
                let depTree = res.body.data || [];
                if(depTree[0].id == -1){
                    depTree.splice(0, 1); // 删除第一个 顶级 元素
                }
                this.depOptions = depTree;
                return;
              } 
              this.$message(res.body.msg);
              
          },(err) => {
              console.log(err);
          });
      },
        onAddClick(){
            this.addFormVisible = true;
        },
        onEditClick(row){
            this.rowData = Object.assign({}, row);
            this.editFormVisible = true;
        },
        onRemoveClick(index,row){
            this.$confirm('确认删除该用户吗?', '友情提示', { type: 'warning'})
            .then(() => {
                let url = '/api/user/'+ row.id;
                this.$http.delete(url).then((res)=>{
                    this.userList.splice(index,1);
                },(err)=>{
                    console.log(err);
                });
            }).catch(()=>{
                this.$message({
                    message:'已取消删除'
                });
            });
            
        },
        onSizeChange(val) {
            this.pageSize = val;
            this.bindUsers();
        },
        onCurrentChange(val) {
            this.pageIndex = val;
            this.bindUsers();
        }
    }
  };
</script>
