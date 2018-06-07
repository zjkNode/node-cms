<template>
    <el-dialog title="更新组件" :visible.sync="editFormVisible" width="30%" top="35vh">
        <el-upload
            ref="upload"
            action="/api/act/components/update"
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
            isEditVisible: { type: Boolean, default: false },
            rowData:null
        },
        data(){
            return {
                editFormVisible: this.isEditVisible,
                originName: ''
            }
        },
        watch: {
            isEditVisible(val){
                this.editFormVisible = val;
            },
            editFormVisible(val){
                this.$emit('onEditVisibleChange',val);
            },
            rowData(row){
                this.originName = row.name;
            }
        },
        methods:{
            successFn(response){
                if(response.code == "SUCCESS"){
                    this.$message.success(response.msg);
                    this.editFormVisible = false;
                    this.$refs.upload.clearFiles();
                    this.$parent.init();
                }
            },
            errorFn(err){
                let msg = err.message.split(' ').pop();
                this.$message.error(msg);
            },
            beforeUploadFn(file, fileList){
                if(file.name.indexOf('.zip') == -1){
                    this.$message.warning('抱歉，只能上传zip文件');
                    return false;
                }

                if(file.name !== this.originName+'.zip'){
                    this.$message.warning('抱歉，请保持组件名称一致');
                    return false;
                }
            },
            cancelUploadFn() {
                this.$message('已取消编辑');
                this.editFormVisible = false;
            },
            handleExceed(){
                this.$message.warning(`抱歉，只能上传一个文件，如需修改，请删除后再操作`);
            }
        }
    }
</script>
