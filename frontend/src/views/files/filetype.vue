<template>
    <el-row>
        <h2>附件类型管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入附件类型名称/代码"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="bindTypeList" icon="el-icon-search"> 查询</el-button>
                <el-button type="primary" @click="isAddVisible = true" icon="el-icon-plus" pull="6">新增</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="typeList" stripe v-loading="isLoading" style="width: 100%">
                <el-table-column type="index" width="60"></el-table-column>
                <el-table-column prop="name" label="类型名称" width="150" :formatter="formatTree" show-overflow-tooltip class-name='flat-tree'></el-table-column>
                <el-table-column prop="code" label="类型代码" width="100" ></el-table-column>
                <el-table-column prop="desc" label="类型备注" min-width="180" show-overflow-tooltip></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template scope="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>{{scope.row.status | statusFilter}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="添加时间" :formatter="dateFormat" width="180"></el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                  <template scope="scope">
                    <el-button @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                    <el-button @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #ff4949;">删除</el-button>
                  </template>
                </el-table-column>
          </el-table>
        </el-row>

        <el-dialog title="新增类型" :visible.sync="isAddVisible">
          <el-form :model="addData" :rules="rules" ref="addFrom" label-width="90px">
            <el-form-item label="父级类型" prop="pids">
              <el-cascader change-on-select :options="typeOptions"  :props="props"
                v-model="addData.pids">
              </el-cascader>
            </el-form-item>
            <el-form-item label="类型名称" prop="name">
              <el-input v-model="addData.name" auto-complete="off" name="name" placeholder="附件类型名称"></el-input>
            </el-form-item>
            <el-form-item label="类型代码" prop="code">
              <el-input v-model="addData.code" auto-complete="off" name="code" placeholder="附件类型代码" ></el-input>
            </el-form-item>
            <el-form-item label="类型备注" prop="desc">
              <el-input type="textarea" v-model="addData.desc" auto-complete="off" name="desc" placeholder="附件类型备注"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('addFrom')">取 消</el-button>
            <el-button type="primary" @click="onAddSubmit('addFrom')" :loading="isAddLoading">确 定</el-button>
          </div>
        </el-dialog>
        
        <el-dialog title="修改类型" :visible.sync="isEditVisible">
          <el-form :model="editData" ref="editFrom" :rules="editrules" label-width="90px">
            <el-form-item label="父级类型" prop="pids">
              <el-cascader change-on-select :options="typeOptions" :props="props"
                v-model="editData.pids">
              </el-cascader>
            </el-form-item>
            <el-form-item label="类型名称" prop="name">
              <el-input v-model="editData.name" auto-complete="off" name="name" placeholder="附件类型名称"></el-input>
            </el-form-item>
            <el-form-item label="类型代码" prop="code">
              <el-input v-model="editData.code" auto-complete="off" name="code" placeholder="附件类型代码"></el-input>
            </el-form-item>
            <el-form-item label="类型备注" prop="desc">
              <el-input type="textarea" v-model="editData.desc" auto-complete="off" name="desc" placeholder="附件类型备注"></el-input>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="editData.status">
                <el-radio class="radio" :label="1">正常</el-radio>
                <el-radio class="radio" :label="2">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('editFrom')">取 消</el-button>
            <el-button type="primary" @click="onEditSubmit('editFrom')" :loading='isEditLoading'>确 定</el-button>
          </div>
        </el-dialog>

    </el-row>
</template>
<script>
    var moment = require('moment');

    export default {
    data() {
        let handleCode=(rule,val,callback)=>{
            var me = this;
            if(!val){
                callback(new Error('类型代码不能为空'));
                return;
            }
            if(!(/^[a-zA-Z]|[0-9]/g.test(val))){
                callback(new Error('类型代码必须以字母或者数字开头'));
                return;
            }
            if(val.length > 100 || val.length < 1){
                callback(new Error('长度在 1 到 100 个字符'));
                return;
            }
            callback();
        };
      return {
            typeList: null,
            isLoading: false,
            isAddLoading: false,
            isEditLoading: false,
            isAddVisible: false,
            isEditVisible:false,
            keys:"",
            typeOptions:[{name:'顶级',id:-1,pid:0}],
            props:{ value:'id', label:'name' },
            addData:{
                pids:[],
                name:'',
                code:'',
                desc:''
            },
            editData:{
                pids:[],
                name:'',
                code:'',
                desc:'',
                status:1
            },
            rules: {
                pids: [
                    {type:'array', required: true,message:'父级类型不能为空', trigger: 'change'}
                ],
                name: [
                    {required: true, message:'类型名称不能为空',trigger: 'blur'},
                    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
                ],
                code: [
                    {validator:handleCode,required: true,trigger: 'blur'}
                ],
                desc:[
                    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                ]
            },
          editrules:{
              pids: [
                  {type:'array', required: true,message:'父级类型不能为空', trigger: 'change'}
              ],
              name: [
                  {required: true, message:'类型名称不能为空',trigger: 'blur'},
                  { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
              ],
              code: [
                  {validator:handleCode,required: true,trigger: 'blur'}
              ],
              desc:[
                  { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
              ]
          }
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
        this.refreshData();
    },
    methods:{
        formatTree(row, column,value){
            let flatTree = this.$options.filters.flatTree;
            return flatTree(row, value);
        },
        dateFormat(row,column,cellvalue){
            if (!cellvalue) {  
             return "";  
            }  
            return moment(cellvalue).format("YYYY-MM-DD HH:mm:ss");  
        },
        refreshData(){
            this.bindTypeList();
            this.bindTypeTree();
        },
        bindTypeList(){
            let url = '/api/files/type/lists';
            let params = {
                keys: this.keys,
                pageSize: this.pageSize,
                pageIndex:this.pageIndex
            };
            this.isLoading = true;
            this.$http.get(url,{ params: params}).then((res)=>{
                this.isLoading = false;
                if(res.body.code === 'SUCCESS'){
                    this.typeList = res.body.data;
//                    this.total = resData.total;
                    return;
                } 
                this.$message(res.body.msg);
                
            },(err) => {
                this.isLoading = false;
            });
        },
        bindTypeTree(){
            let url = '/api/files/type/treeList';
            this.$http.get(url,null).then((res)=>{
                if(res.body.code === 'SUCCESS'){
                    let typeTree = res.body.data;
                    typeTree = typeTree || [];
                    typeTree.unshift({ name:'顶级', id:-1, pid:0 });
                    this.typeOptions = typeTree;
                    return;
                } 
                this.$message(res.body.msg);
                
            },(err) => {
                console.log(err);
            });
        },
        onEditClick(row){
            this.editData = Object.assign({}, row);
            this.editData.pids = this.editData.pids.split(',').map((item) => { return item == '0' ? -1 : parseInt(item); });
            this.$options.filters.disableItem(this.typeOptions,row.id)
            this.isEditVisible = true;
        },
        onRemoveClick(index,row){
            this.$confirm('确认删除该附件类型吗?', '友情提示', { type: 'warning'})
            .then((res) => {
                let url = '/api/files/type/'+ row.id;
                this.$http.delete(url).then((res)=>{
                    if(res.body.code == 'SUCCESS'){
                        this.refreshData();
                        return;
                    }

                    this.$message(res.body.msg);
                },(err)=>{
                    this.$message.error('删除附件类型时出错');
                });
            }).catch(()=>{
                this.$message('已取消删除');
            });
            
        },
        onAddSubmit(formName){
            this.$refs[formName].validate((valid) => {
              if (!valid) {
                return false;
              }
              var apiUrl = "/api/files/type/add";
              this.isAddLoading = true;
              this.$http.post(apiUrl,this.addData).then((res)=>{
                this.isAddLoading = false;
                this.$refs[formName].resetFields();
                if(res.body.code == 'SUCCESS'){
                    this.isAddVisible = false;
                    this.refreshData();
                    return;
                } 
                this.$message({
                  showClose: true,
                  duration: 0,
                  message: res.body.msg,
                  type: 'warning'
                });
              },(error)=>{
                this.isAddLoading = false;
              });

            });
        },
        onEditSubmit(formName){
            this.$refs[formName].validate((valid) => {
              if (!valid) {
                return false;
              }
              var apiUrl = "/api/files/type/"+ this.editData.id;
              this.isEditLoading = true;
              this.$http.put(apiUrl,this.editData).then((res)=>{
                this.isEditLoading = false;
                this.$refs[formName].resetFields();
                if(res.body.code == 'SUCCESS'){
                    this.isEditVisible = false;
                    this.refreshData();
                    return;
                } 
                this.$message({
                  showClose: true,
                  duration: 0,
                  message: res.body.msg,
                  type: 'warning'
                });
                
              },(error)=>{
                this.isEditLoading = false;
              });

            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.isAddVisible = this.isEditVisible = false;
        }
    }
  };
</script>
