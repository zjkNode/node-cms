<template>
    <el-dialog title="新增版本" :visible.sync="addFormVisible">
        <el-form label-width="150px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="客户端" prop="appname">
                <template>
                    <el-select v-model="chooseApp" placeholder="请选择">
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="当前版本" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入当前版本"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="需要更新版本" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入需要更新版本"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 版本之间用","隔开</i>
                </el-col>
            </el-form-item>
            <el-form-item label="忽略更新版本" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入忽略更新版本"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 版本之间用","隔开</i>
                </el-col>
            </el-form-item>
            <el-form-item label="更新文案" prop="name">
                <el-col :span="12">
                    <el-input
                            type="textarea"
                            autosize
                            placeholder="请输入内容"
                            v-model="textarea3">
                    </el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="需强更版本" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入需强更版本"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 版本之间用","隔开</i>
                </el-col>
            </el-form-item>
            <el-form-item label="忽略强更版本" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入忽略强更版本"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 版本之间用","隔开</i>
                </el-col>
            </el-form-item>
            <el-form-item label="强更文案" prop="name">
                <el-col :span="12">
                    <el-input
                            type="textarea"
                            autosize
                            placeholder="请输入内容"
                            v-model="textarea3">
                    </el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="包大小" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入包大小"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="包MD5" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入包MD5"></el-input>
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
        props: {
            isAddVisible: {type: Boolean, default: false}
        },
        data(){
            return {
                addFormVisible: this.isAddVisible,
                formData: {
                    'appname': '',
                    'name': '',
                    'status': '',
                    'time': '',
                    'sort': '',
                    'uv': '2'
                },
                rules: {
                    appname: [{required: true, message: '请输入APP名称', trigger: 'blur'}]
                }
            }
        },
        components: {},
        mounted(){

        },
        watch: {
            isAddVisible(val){
                this.addFormVisible = val;
            },
            addFormVisible(val){
                this.$emit('onAddVisibleChange', val);
            }
        },
        methods: {
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.addFormVisible = false;
            },
            submitForm(formName){

            }
        }
    }
</script>
