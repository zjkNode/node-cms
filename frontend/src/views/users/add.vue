<template>
    <el-dialog title="新增用户" :visible.sync="bAddVisible">
      <el-form :model="formData" :rules="rules" ref="userAddForm" label-width="80px">
        <el-form-item label="所在部门" prop="depids">
          <el-cascader change-on-select expand-trigger="hover" :options="depOptions"  :props="props"
            v-model="formData.depids" @change="onDepChange">
          </el-cascader>
        </el-form-item>
        <el-form-item label="角色" prop="roleid" >
          <el-select v-model="formData.roleid"  placeholder="请选择角色" loading-text="加载中..." :loading="isRoleLoading">
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="email">
          <el-input v-model="formData.email" auto-complete="off" name="email" placeholder="登录邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" auto-complete="off" name="password" placeholder="登录密码"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="nickname">
          <el-input v-model="formData.nickname" auto-complete="off" name="nickname" placeholder="真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" auto-complete="off" name="phone" placeholder="联系电话"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('userAddForm')">取 消</el-button>
        <el-button type="primary" @click="submitForm('userAddForm')">确 定</el-button>
      </div>
    </el-dialog>
</template>
<script>
    var util = require('../../js/common/util');
  export default {
    props:{
      isAddVisible:{ type:Boolean, default:false },
      depOptions:null
    },
    data() {
      return {
        bAddVisible: this.isAddVisible,
        props:{ value:'id', label:'name' },
        roleOptions:[],
        formData: {
          email: '',
          password: '',
          nickname: '',
          depids: [],
          roleid: '',
          phone: ''
        },
        rules: {
            email:[
                { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
            ],
            password:[
                { required: true, message: '请输入登录密码', trigger: 'blur' }
            ],
            nickname:[
                { required:true, message:'请输入用户别名',trigger:'blur'}
            ],
            depids: [
                { type: "array", required:true, message:'请选择部门',trigger:'blur' }
            ],
            roleid: [
                { type:"number", required:true, message:'请选择角色',trigger:'blur' }
            ]
        }
      };
    },
    watch:{
      isAddVisible(val){
        this.bAddVisible = val;
      },
      bAddVisible(val){
        this.$emit('onAddVisibleChange',val);
      }
    },
    mounted(){
    },
    methods:{
      initForm(){
      },
      onDepChange(values){
        var depId = values[values.length - 1];
        this.bindRoles(depId);
      },
      bindRoles(depId){
        let url = '/api/roles/listsByDepId';
        this.isRoleLoading = true;
        this.$http.post(url,{ depId: depId }).then((res)=>{
            this.isRoleLoading = false;
            if(res.body.code === 'SUCCESS'){
                let roleList = res.body.data;
                roleList = roleList || [];
                this.roleOptions = roleList;
                return;
            } 
            this.$message(res.body.msg);
            
        },(err) => {
          this.isRoleLoading = false;
            console.log(err);
        });
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return false;
          }
          var apiUrl = "/api/user/add";
          var params = this.formData;
          params.password = util.encrypt(params.password)
          this.$http.post(apiUrl, params).then((res)=>{
            this.$refs[formName].resetFields();
            this.bAddVisible = false;
            this.$emit('afterSubmit');
          },(error)=>{
            console.log(error);
          });

        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.bAddVisible = false;
      }
    }
  };
</script>
