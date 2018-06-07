<template>
    <el-dialog title="新增合同类型" :visible.sync="addFormVisible">
        <el-form label-width="100px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="父级类型" prop="pid">
                <el-cascader :options="listsTree" :props="props" v-model="formData.pid" change-on-select @change="pidChange"></el-cascader> 
            </el-form-item>
            <el-form-item label="类型名称" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入合同类别名称"></el-input>
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
    export default{
        props:{
            isAddVisible: { type: Boolean, default: false },
            listsTree:{}
        },
        data(){
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "pid"){
                    if(!val || val.length==0){
                        callback(new Error('父级类别不能为空'));
                    }else{
                        callback();
                    }
                }else if( rule.field == "name"){
                    if( !val){
                        callback(new Error('类别名称不能为空'));
                    }else if(val.length>50){
                        callback(new Error('类别名称过长'));
                    }else{
                        callback();
                    }
                }
            };
            return {
                addFormVisible: this.isAddVisible,
                formData:{
                    pid:[],
                    pids: null,
                    name:''
                },
                props:{
                    value:'id',
                    label:'name'
                },
                rules: {
                    pid:[{required:true, trigger:'change', validator:handleInput}],
                    name:[{required:true, trigger:'change', validator:handleInput}]
                }
            }
        },
        watch:{
            isAddVisible(val){
                this.addFormVisible = val;
            },
            addFormVisible(val){
                this.$emit('onAddVisibleChange',val);
            }
        },
        methods:{
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    var apiUrl = "/api/contracts/type/add";
                    var data = Object.assign({},this.formData);
                    var pids = data.pid;
                    var _pid = pids.slice(-1)[0];
                    data.pid = _pid >0 ? _pid : 0;

                    this.$http.post(apiUrl,data).then((res)=>{
                        this.$refs[formName].resetFields();
                        this.addFormVisible = false;
                        this.$message({
                            message: '提交成功',
                            type: 'success'
                        });
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

    }
</script>
