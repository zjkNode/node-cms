<template>
    <el-dialog title="新增菜单" :visible.sync="addFormVisible">
        <el-form label-width="90px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="菜单级别" prop="pid" >
                <el-cascader change-on-select :options="menuTree" :props="props" v-model="formData.pid" @change="pidChange"></el-cascader> 
            </el-form-item> 
            <el-form-item label="菜单名称" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入菜单名称"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="菜单地址" prop="alink">
                <el-col :span="12">
                    <el-input v-model="formData.alink" placeholder="请输入菜单访问地址（如 /menus ）"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 域名后的访问地址</i>
                </el-col>
            </el-form-item>
            <el-form-item label="菜单排序" prop="sort">
                <el-col :span="12">
                    <el-input v-model.number="formData.sort" placeholder="请输入菜单排序（默认为1）"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 1-99之间的数字(1优先级最高)</i>
                </el-col>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('formData')">取 消</el-button>
            <el-button type="primary" @click="submitForm('formData')">确 定</el-button>
        </div> 
    </el-dialog>
</template>
<script>
    export default {
        props: {
            isAddVisible: { type: Boolean, default: false },
            menuTree:{}
        },
        data() {
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "sort"){
                    if(val>99 || val<1){
                        callback(new Error('请输入1-99之间的数字'));
                    }else{
                        callback();
                    }
                }else{
                    callback();
                }
            };
            return {
                addFormVisible: this.isAddVisible,
                props:{
                    value:'id',
                    label:'name'
                },
                formData: {
                    name: '',
                    pid: null,
                    pids: null,
                    alink:'',
                    sort: 1
                },
                rules: {
                    name: [
                        { required: true, message: '请输入菜单名称', trigger: 'blur' }
                    ],
                    alink: [
                        { required: true, message: '请输入菜单访问地址', trigger: 'blur' }
                    ],
                    pid: [
                        { required: true, validator:handleInput, trigger: 'change'}
                    ],
                    sort: [
                        { validator:handleInput,required: false,trigger: 'change', type:'number' }
                    ]
                }
            };
        },
        mounted() {
        },
        watch: {
            isAddVisible(val){
                this.addFormVisible = val;
            },
            addFormVisible(val){
                this.$emit('onAddVisibleChange',val);
            }
        },
        methods:{
            submitForm(formName){
                var me = this;
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    var data = Object.assign({},me.formData);
                    var pids = data.pid;
                    var _pid = pids.slice(-1)[0];
                    data.pid = _pid >0 ? _pid : 0;
                    var apiUrl = "/api/menu/add";
                    this.$http.post(apiUrl,data).then((res)=>{
                        this.$refs[formName].resetFields();
                        this.addFormVisible = false;
                        this.$emit('afterSubmit');
                    },(error)=>{
                        console.log(error);
                    });
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.addFormVisible = false;
            },
            pidChange(val){
                if(!val[0]){
                    this.formData.pid=[0];
                };
                this.formData.pids = this.formData.pid.join(",");
            }
        }
    };

</script>