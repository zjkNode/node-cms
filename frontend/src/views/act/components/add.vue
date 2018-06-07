<template>
    <el-dialog title="新增组件" :visible.sync="addFormVisible" width="30%" top="35vh">
        <el-upload
            ref="upload"
            action="/api/act/components/add"
            :limit="1"
            :on-exceed= "handleExceed"
            accept = "aplication/zip"
            :show-file-list = "true"
            :auto-upload="true"
            :before-upload = "beforeUploadFn"
            :on-success = "successFn"
            :on-error = "errorFn"
            style="margin-left:30px">
            <el-button slot="trigger" size="small" icon="el-icon-plus" type="primary">上传</el-button>
            <span slot="tip" class="el-upload__tip" style="padding-left:20px">* 只能上传zip文件</span>
        </el-upload>
        
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancelUploadFn">取 消</el-button>
        </div> 
    </el-dialog>
</template>
<script>
    export default {
        props: {
            isAddVisible: { type: Boolean, default: false }
        },
        data(){
            return {
                addFormVisible: this.isAddVisible
            }
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
            successFn(response){
                if(response.code == "SUCCESS"){
                    this.addFormVisible = false;
                    this.$message.success(response.msg);
                    this.$refs.upload.clearFiles();
                    this.$parent.init();
                }
            },
            errorFn(err){
                let msg = err.message.split(' ').pop();
                this.$message.error(msg);
            },
            beforeUploadFn(file){
                if(file.name.indexOf('.zip') == -1){
                    this.$message.error('抱歉，只能上传zip文件');
                    return false;
                };
            },
            cancelUploadFn() {
                this.$message('已取消新增');
                this.addFormVisible = false;
            },
            handleExceed(){
                this.$message.error(`抱歉，只能上传一个文件，如需修改，请删除后再操作`);
            }
        }
    }
</script>
