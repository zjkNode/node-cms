<template>
    <el-dialog title="编辑渠道" :visible.sync="editFormVisible">
        <el-form label-width="150px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="标题" prop="sort">
                <el-col :span="12">
                    <el-input v-model="formData.sort" placeholder="请输入标题"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="合同内容" prop="sort">
                <UE :defaultMsg="formData.content" :config="config" ref="ue"></UE>
            </el-form-item>
            <el-form-item label="链接" prop="sort">
                <el-col :span="12">
                    <el-input v-model="formData.sort" placeholder="http(s)://..."></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="状态" prop="sort">
                <el-radio v-model="formData.uv" label="1">显示</el-radio>
                <el-radio v-model="formData.uv" label="2">下架</el-radio>
            </el-form-item>
            <el-form-item label="排序" prop="sort">
                <el-col :span="12">
                    <el-input v-model="formData.sort" placeholder="请输入数字"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="时间">
                <el-col :span="9">
                    <template>
                        <el-date-picker
                                v-model="timevalue"
                                type="datetimerange"
                                range-separator="至"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                align="right">
                        </el-date-picker>
                    </template>
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
    import UE from 'src/components/ue.vue';

    export default{
        components: {UE},
        props: {
            isEditVisible: {type: Boolean, default: false},
            rowData: null
        },
        data(){
            return {
                editFormVisible: this.isEditVisible,
                formData: {
                    'appname': '',
                    'name': '',
                    'status': '',
                    'time': '',
                    'sort': ''
                },
                rules:{

                }
            }
        },
        mounted(){

        },
        watch: {
            isEditVisible(val){
                this.editFormVisible = val;
            },
            editFormVisible(val){
                this.$emit('onEditVisibleChange', val);
            },
        },
        methods: {
            submitForm(formName){

            },
            resetForm(formName){
                this.$refs[formName].resetFields();
                this.editFormVisible = false;
            }
        }
    }
</script>
