<template>
    <el-dialog title="修改SEO" :visible.sync="editFormVisible">
        <el-form label-width="100px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="所属类型" prop="typeid">
                <el-cascader
                        change-on-select
                        :options="newsTypeData"
                        :props="props"
                        v-model="formData.typeid">
                </el-cascader>
            </el-form-item>
            <el-form-item label="页面标题" prop="title">
                <el-col :span="12">
                    <el-input v-model="formData.title" placeholder="请输入页面标题"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="页面关键词" prop="keywords">
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
<script type="text/ecmascript-6">
    export default{
        props:{
            isEditVisible: { type: Boolean, default: false },
            newsTypeData:{},
            rowData:null,
        },
        data(){
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "keywords"){
                    let keywords = this.formData.keywords.split(" ").join("|");
                    this.formData.keywords = keywords;
                }
                callback();
            };
            return {
                editFormVisible: this.isEditVisible,
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
            isEditVisible(val){
                this.editFormVisible = val;
            },
            editFormVisible(val){
                this.$emit('onEditVisibleChange',val);
            },
            rowData(row){
                this.formData = row;
                if(row.newsType.pids){
                    let _typeid = row.newsType.pids.split(',');
                    _typeid.push(row.newsType.id);
                    this.formData.typeid = _typeid.map((item) => { return parseInt(item); });
                }else{
                    this.formData.typeid=[];
                }
            }
        },
        activated(){
            this.bindNewsType();
        },
        methods:{
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    this.isLoading = true;
                    var param = {
                        title:this.formData.title,
                        keywords:this.formData.keywords,
                        description:this.formData.description
                    }
                    var _typeid = this.formData.typeid;
                    param.typeid = _typeid[_typeid.length-1];
                    var apiUrl = "/api/news/seo/"+ this.formData.id;
                    this.$http.put(apiUrl,param).then((res)=>{
                        this.isLoading = false;
                        this.editFormVisible = false;
                        this.$emit('afterSubmit');
                    },(error)=>{
                        this.isLoading = false;
                        console.log(error);
                    });
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.editFormVisible = false;
            }
        }

    }
</script>
