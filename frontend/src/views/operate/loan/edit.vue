<template>
    <el-dialog title="编辑渠道" :visible.sync="editFormVisible">
        <el-form label-width="150px" ref="formData" :model="formData" :rules="rules" :show-message="true">
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
            <el-form-item label="渠道图片" prop="icon">
                <el-upload
                        class="upload-demo"
                        ref="editupload"
                        action="/api/operate/save"
                        :multiple="false"
                        :data="formData"
                        list-type="picture"
                        :auto-upload="false"
                        :file-list="imgList"
                        :on-remove="handleRemove"
                        :on-change="handleChange"
                        :on-success="successFn">
                    <el-button size="small" type="primary" :disabled="btnEditupload">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传一份文件,可删除后重新选择</div>
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
            isEditVisible: {type: Boolean, default: false},
            rowData: null
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
                btnEditupload: true,
                editFormVisible: this.isEditVisible,
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
                        {type: "number", required: true, message: '请选择用户端', trigger: 'change'}
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
                imgList: [],
                updateFile: false,
            }
        },
        components: {},
        mounted(){

        },
        watch: {
            isEditVisible(val){
                this.editFormVisible = val;
            },
            editFormVisible(val){
                this.$emit('onEditVisibleChange', val);
            },
            rowData(row){
                this.formData = row;
                this.imgList = [];
                this.imgList.push({url: row.icon});
//                console.log(this.imgList);
            }
        },
        methods: {
            handleRemove(file, fileList){//移除
                this.btnEditupload = false;
                $('.upload-demo input[type=file]')[0].disabled = false;
            },
            handleChange(file, fileList){//change
//                this.formData.icon = file.url;
                this.btnEditupload = true;
                $('.upload-demo input[type=file]')[0].disabled = true;
                fileList.length != 0 ? this.updateFile = true : this.updateFile = false;
            },
            successFn(response, file, fileList){
                this.canLeave = true;
                this.$message({
                    message: '编辑成功',
                    type: 'success'
                });
//                this.$router.push('/operate/loan');
                this.$emit('afterSubmit');

            },
            resetForm(formName){
                this.$refs[formName].resetFields();
                this.$refs.editupload.clearFiles();
                this.editFormVisible = false;
            },
            submitForm(formName){
//                console.log(this.updateFile + '-------');
                if (this.updateFile) {
                    this.$refs[formName].validate((valid) => {
                        if (!valid) {
                            return false;
                        }
                        this.$refs.editupload.submit();
                        this.editFormVisible = false;
                    });
                } else {
//                    console.log(this.formData);
                    this.isLoading = true;
                    var apiUrl = '/api/operate/update/' + this.formData.id;
                    var params = this.formData;
                    params.icon = this.imgList[0].url;
//                    console.log(this.imgList[0].url);
                    this.$http.put(apiUrl, params).then((res)=> {
                        this.isLoading = false;
                        if (res.body.code === 200) {
                            this.editFormVisible = false;
                            this.$emit('afterSubmit');
                            this.successFn();
                        } else {
                            this.$alert(res.body.message, '友情提示', {
                                confirmButtonText: '确定'
                            });
                        }
                    }, (error)=> {
                        this.isLoading = false;
                        console.log(error);
                    });
                }
            },
        }
    }
</script>
