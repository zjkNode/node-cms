<template>
    <el-dialog title="修改活动配置" :visible.sync="editFormVisible">
        <el-form label-width="100px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="配置名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入配置名称"></el-input>
            </el-form-item>
            <el-form-item label="活动域名" prop="domain">
                <el-input v-model="formData.domain" placeholder="请输入活动域名"></el-input>
            </el-form-item>
            <el-form-item label="路径代码" prop="oss_code">
                <el-input v-model="formData.oss_code" disabled placeholder="请输入路径代码"></el-input>
            </el-form-item>
            <el-form-item label="本地路径" prop="publish_path">
                <el-input v-model="formData.publish_path" placeholder="请输入本地路径"></el-input>
            </el-form-item>
            <el-form-item label="百度代码" prop="baidu_code">
                <el-input v-model="formData.baidu_code" placeholder="请输入百度代码"></el-input>
            </el-form-item>
            <el-form-item label="下载地址" prop="download_urls">
                <el-input type="textarea" :rows='5' v-model="formData.download_urls" placeholder="请输入安装包下载地址"></el-input>
                <i class="el-icon-warning">格式：open_android,open_ios,官网地址,应用宝地址,appStore地址每行</i>
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
            return {
                editFormVisible: this.isEditVisible,
                formData:{
                    id:'',
                    name:'',
                    domain:'',
                    oss_code:'',
                    publish_path:'',
                    baidu_code:'',
                    download_urls:''
                },
                rules: {
                    name:[{required:true, trigger:'blur', message:"请输入配置名称"}],
                    domain:[{required:true, trigger:'blur', message:"请输入活动域名"}],
                    oss_code:[{required:true, trigger:'blur', message:"请输入oss路径代码"}],
                    publish_path:[{required:true, trigger:'blur', message:"请输入本地路径"}]
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
                this.formData.download_urls = row.download_urls.replace(/,/g,'\n');
            }
        },
        methods:{
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    this.isLoading = true;
                    let params = Object.assign({}, this.formData);
                    params.download_urls = params.download_urls.replace(/\n/g,',');
                    var apiUrl = "/api/act/config/"+ this.formData.id;
                    this.$http.put(apiUrl,params).then((res)=>{
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
