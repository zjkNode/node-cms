<template>
    <el-dialog title="新增SEO" :visible.sync="addFormVisible">
        <el-form label-width="100px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="所属类型" prop="typeid">
                <el-cascader :options="newsTypeData" :props="props" v-model="formData.typeid" change-on-select></el-cascader> 
            </el-form-item>
            <el-form-item label="页面标题" prop="title">
                <el-col :span="12">
                    <el-input v-model="formData.title" placeholder="请输入页面标题"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="页面关键字" prop="keywords">
                <el-col :span="12">
                    <el-input v-model="formData.keywords" placeholder="请输入页面关键字"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 关键词之间以空格分隔，建议3个以内</i>
                </el-col>
            </el-form-item>
            <el-form-item label="页面描述" prop="description">
                <el-col :span="12">
                    <el-input type="textarea" autosize v-model="formData.description" placeholder="请输入相关描述内容"></el-input>
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
            newsTypeData:{}
        },
        data(){
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "keywords"){
                    if(this.formData.keywords==""){
                        callback(new Error("请输入页面关键字"));
                    }
                    let keywords = this.formData.keywords.split(" ").join("|");
                    this.formData.keywords = keywords;
                }
                callback();
            };
            return {
                addFormVisible: this.isAddVisible,
                formData:{
                    typeid:[],
                    title:'',
                    keywords:'',
                    description:''
                },
                props:{
                    value:'id',
                    label:'name'
                },
                rules: {
                    typeid:[{type: "array", required:true, trigger:'blur', message:"请选择所属类型"}],
                    title:[{required:true, trigger:'blur', message:"请输入页面标题"}],
                    keywords:[{required:true, trigger:'change', validator:handleInput}],
                    description: [{required:true, trigger:'blur', message:"请输入页面描述"}]
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
                    var apiUrl = "/api/news/seo/add";
                    var param = this.formData;
                    var _typeid = param.typeid;
                    param.typeid = _typeid.slice(-1);
                    this.$http.post(apiUrl,param).then((res)=>{
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
            }
        }

    }
</script>
