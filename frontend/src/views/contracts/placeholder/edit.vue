<template>
    <el-dialog title="修改占位符" :visible.sync="editFormVisible">
        <el-form label-width="120px" ref="formData" :rules="rules" :model="formData" :show-message="true">
            <el-form-item label="合同类别" prop="typeid">
                <el-select v-model="formData.typeid">
                    <el-option
                        v-for='item in listsTree'
                        :key = 'item.id'
                        :label='item.name'
                        :value = 'item.id'
                        >   
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="占位符名称" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入占位符名称"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="VM占位符" prop="placeholder">
                <el-col :span="12">
                    <el-input v-model="formData.placeholder" placeholder="请输入VM占位符"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="描述" prop="desc">
                <el-col :span="12">
                    <el-input v-model="formData.desc" placeholder="请输入占位符描述"></el-input>
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
            isEditVisible: { type: Boolean, default: false },
            listsTree:null,
            rowData:null
        },
        data() {
            return {
                editFormVisible: this.isEditVisible,
                formData: {
                    id:null,
                    name: '',
                    placeholder:'',
                    typeid:null,
                    desc:''
                },
                rules: {
                    typeid:[
                        { type:'number', required: true, message: '请选择合同类型', trigger: 'change' }
                    ],
                    name: [
                        {required: true, message: '请输入占位符名称', trigger: 'change'},
                        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'change' }
                    ],
                    placeholder: [
                        {required: true, message: '请输入占位符代码', trigger: 'change'},
                        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'change' }
                    ]
                }
            };
        },
        mounted(){
        },
        watch: {
            isEditVisible(val){
                this.editFormVisible = val;
            },
            editFormVisible(val){
                this.$emit('onEditVisibleChange',val);
            },
            rowData(val){
                this.formData = val;
            }
        },
        methods:{
            submitForm(formName){
                var me = this;
                this.$refs[formName].validate((valid) => {
                    if (!valid) {return false;}
                    var data = Object.assign({},me.formData);
                    var apiUrl = "/api/contracts/vm/"+ this.formData.id;
                    this.$http.put(apiUrl,data).then((res)=>{
                        let msgObj = {};
                        if(res.body.code == "SUCCESS"){
                            this.editFormVisible = false;
                            this.$emit('afterSubmit');
                            msgObj = {message: '更新成功',type: 'success'}
                        }else{
                            msgObj = {message: `更新失败- ${data.placeholder} 占位符已存在`,type: 'error'}
                            this.formData.placeholder = ''
                        }
                        this.$message(msgObj); 
                    },(error)=>{
                        console.log(error);
                    });
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.editFormVisible = false;
            }
        }
    };

</script>