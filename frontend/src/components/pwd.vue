<template>
    <el-dialog title="修改资料" :visible.sync="bEditVisible">
      <el-form :model="formData" :rules="rules" ref="userEditForm" label-width="80px">
        <el-form-item label="用户名" prop="email">
          <el-input v-model="formData.email" auto-complete="off" name="email" placeholder="登录邮箱" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="nickname">
          <el-input v-model="formData.nickname" auto-complete="off" name="nickname" placeholder="真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" auto-complete="off" name="password" placeholder="登录密码"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" auto-complete="off" name="phone" placeholder="联系电话"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('userEditForm')" :loading="isLoading">确 定</el-button>
      </div>
    </el-dialog>
</template>
<script>
    var util = require('../js/common/util');
  export default {
    props:{
      isEditVisible:{ type:Boolean, default:false }
    },
    data() {
      return {
        bEditVisible: this.isEditVisible,
        isLoading: false,
        formData: {
            email: '',
            password: '',
            nickname: '',
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
            ]
        }
      };
    },
    watch:{
        isEditVisible(val){
            this.bEditVisible = val;
        },
        bEditVisible(val){
            this.$emit('onEditVisibleChange',val);
        }
    },
    mounted(){
        this.init();
    },
    methods:{
        init(){
            var apiUrl = "/api/user/userInfo";
            this.$http.get(apiUrl).then((rs)=>{
                this.isLoading = false;
                this.bEditVisible = false;
                this.formData = rs.body.data;
                this.$emit('afterSubmit');
            },(error)=>{
                this.isLoading = false;
                console.log(error);
            });
        },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
            if (!valid) {
                return false;
            }
            this.isLoading = true;
            var apiUrl = "/api/user/userInfo/"+ this.formData.id;
            this.formData.depids = [this.formData.depid];
            this.formData.password = util.encrypt(this.formData.password)
            this.$http.put(apiUrl,this.formData).then((res)=>{
                this.isLoading = false;
                this.bEditVisible = false;

                //更新本地储存
                localStorage.setItem('user',JSON.stringify(this.formData));

                //刷新用户管理
                let isRefreshUser = this.$parent.$parent.$children[1].bindUsers;
                if(isRefreshUser){isRefreshUser()};

                this.$emit('afterSubmit');
            },(error)=>{
                this.isLoading = false;
                console.log(error);
            });
        });
      }
    }
  };
</script>
<style lang="scss">
    
</style>
