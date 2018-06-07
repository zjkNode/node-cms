<template>
    <el-dialog title="新增渠道" :visible.sync="addFormVisible">
        <el-form label-width="150px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="用户端" prop="appCode">
                <el-col :span="12">
                    <el-select v-model="formData.appCode" placeholder="请选择" loading-text="加载中...">
                        <el-option
                                v-for="item in appCodeopt"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-col>
            </el-form-item>
            <el-form-item label="产品名称" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入产品名称"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 长度不超过10个字符</i>
                </el-col>
            </el-form-item>
            <el-form-item label="产品链接" prop="url">
                <el-col :span="12">
                    <el-input v-model="formData.url" placeholder="请输入产品链接"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="排序" prop="sort">
                <el-col :span="12">
                    <el-input v-model="formData.sort" placeholder="请输入数字"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="UV限制数量" prop="uvCount">
                <template>
                    <el-col :span="12">
                        <el-input v-model="formData.uvCount" placeholder="请输入UV数量"></el-input>
                    </el-col>
                </template>
            </el-form-item>
            <el-form-item label="是否自营产品" prop="self">
                <el-radio-group v-model="formData.self">
                    <el-radio v-bind:label="1">是</el-radio>
                    <el-radio v-bind:label="2">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="件均" prop="itemAvg">
                <el-col :span="12">
                    <el-input v-model="formData.itemAvg" placeholder="请输入件均数量"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon">(单位:元)</i>
                </el-col>
            </el-form-item>
            <el-form-item label="产品图片" prop="icon">
                <el-upload
                        class="upload-demo"
                        ref="addupload"
                        :data="formData"
                        action="/api/operate/save"
                        :multiple="false"
                        list-type="picture"
                        :auto-upload="false"
                        :on-remove="handleRemove"
                        :on-success="handleSuccess"
                        :on-error="handleError"
                        :on-change="handleChange">
                    <el-button size="small" type="primary" :disabled="btnupload">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传一张图片,可删除后重新选择</div>
                </el-upload>
            </el-form-item>
            <el-form-item label="额度" prop="amount">
                <el-col :span="12">
                    <el-input v-model="formData.amount" placeholder="请输入额度"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="期限" prop="loan">
                <el-col :span="12">
                    <el-input v-model="formData.loan" placeholder="请输入期限"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="简介" prop="note">
                <el-col :span="12">
                    <el-input v-model="formData.note" placeholder="请输入简介"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 长度不超过20个字符</i>
                </el-col>
            </el-form-item>
            <el-form-item label="日利率" prop="rate">
                <el-col :span="12">
                    <el-input v-model="formData.rate" placeholder="请输入日利率"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon">(单位:%)</i>
                </el-col>
            </el-form-item>
            <el-form-item label="appID" prop="appid">
                <el-col :span="12">
                    <el-input v-model="formData.appid" placeholder="请输入应用的唯一ID"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="regSuccessKeyword" prop="regSuccessKeyword">
                <el-col :span="12">
                    <el-input v-model="formData.regSuccessKeyword" placeholder="注册是否成功关键字"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="urlscheme" prop="urlScheme">
                <el-col :span="12">
                    <el-input v-model="formData.urlScheme" placeholder="IOS应用的URL_scheme"></el-input>
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
        props: {
            isAddVisible: {type: Boolean, default: false}
        },
        data(){
            let handleInput = (rule, value, callback) => {
                if (/^[1-9]\d*$/.test(value) == true) {
                    if (value > 9223372036854775807 || value < 1) {
                        callback(new Error('请输入1-9223372036854775807之间的数字'));
                    } else {
                        callback();
                    }
                } else {
//                    callback();
                    callback(new Error('请输入正整数'))
                }
            };
            let handleInputsort = (rule, value, callback) => {
                if (/^[1-9]\d*$/.test(value) == true) {
                    if (value > 32767 || value < 1) {
                        callback(new Error('请输入1-32767之间的数字'));
                    } else {
                        callback();
                    }
                } else {
//                    callback();
                    callback(new Error('请输入正整数!'))
                }
            };
            return {
                addFormVisible: this.isAddVisible,
                appCodeopt: [//用户端
                    {
                        label: '简单借款',
                        value: 100001
                    },
                    {
                        label: '优分期',
                        value: 100003
                    }
                ],
                formData: {
                    'appCode': '',
                    'name': '',
                    'url': '',
                    'icon': '',
                    'amount': '',
                    'loan': '',
                    'note': '',
                    'rate': '',
                    'appid': '',
                    'regSuccessKeyword': '',
                    'urlScheme': '',
                    'uvCount': '',
                    'self': '',
                    'itemAvg': '',
                    'sort': ''
                },
                rules: {
                    appCode: [
                        {type: "number", message: '请选择用户端', required: true, trigger: 'change'}
                    ],
                    name: [
                        {required: true, message: '请输入产品名称', trigger: 'blur'},
                        {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
                    ],
                    url: [
                        {required: true, message: '请输入产品链接', trigger: 'blur'}
                    ],
                    icon: [
                        {required: true, message: '请上传1张图片', trigger: 'change'}
                    ],
                    amount: [
                        {required: true, message: '请输入额度', trigger: 'blur'},
                        {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
                    ],
                    loan: [
                        {required: true, message: '请输入期限', trigger: 'blur'},
                        {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
                    ],
                    note: [
                        {required: true, message: '请输入简介', trigger: 'blur'},
                        {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
                    ],
                    rate: [
                        {required: true, message: '请输入日利率', trigger: 'blur'},
                        {min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur'}
                    ],
                    uvCount: [
                        {required: true, validator: handleInput, trigger: 'change', type: 'number'}
                    ],
                    itemAvg: [
                        {required: true, validator: handleInput, trigger: 'change', type: 'number'}
                    ],
                    self: [
                        {required: true, message: '请选择是否自营', trigger: 'change', type: 'number'}
                    ],
                    sort: [
                        {required: true, validator: handleInputsort, trigger: 'change', type: 'number'}
                    ]
                },
                btnupload: false,
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
            handleRemove(file, fileList){
                this.btnupload = false;
                $('.upload-demo input[type=file]')[0].disabled = false;
            },
            handleSuccess(response, file, fileList){
//                console.log(file);
                this.$message({
                    message: '新增成功',
                    type: 'success'
                });
                this.$emit('afterSubmit');
            },
            handleError(err, file, fileList){

            },
            //添加图片
            handleChange(file, fileList){
                var me = this;
                this.formData.icon = file.url;
                me.btnupload = true;
                $('.upload-demo input[type=file]')[0].disabled = true;
                if (fileList.length > 1) {
                    me.$message.error('上传图片为一张,请删除多余的图片!');
                    me.canUpload = false;
                } else {
                    me.canUpload = true;
                }
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.$refs.addupload.clearFiles();
                this.addFormVisible = false;
                this.btnupload = false;
            },
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
//                    console.log(this.formData);
                    if (!valid) {
                        return false;
                    }
                    this.$refs.addupload.submit();
                    this.addFormVisible = false;
                });
            },
        }
    }
</script>
