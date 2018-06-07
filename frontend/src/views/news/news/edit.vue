<template>
    <el-row class="news">
        <h2>新闻内容--编辑</h2>
        <el-form :model="editForm" :rules="editFormRules" ref="editForm" label-width="80px">
            <el-form-item label="选择类型" prop="typeids">
                <el-cascader
                    change-on-select
                    :options="options"
                    :props="props"
                    v-model="editForm.typeids">
                </el-cascader>
            </el-form-item>
            <el-form-item label="新闻标题" prop="title">
                <el-input v-model="editForm.title"></el-input>
            </el-form-item>
            <el-form-item label="新闻时间" prop="publish_time">
                <el-date-picker
                    v-model="editForm.publish_time"
                    type="date"
                    @change="getTime"
                    value-format="yyyy-MM-dd"
                    placeholder="选择日期时间">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="新闻内容" prop="content">
                <UE :defaultMsg="editForm.content" :config="config" :id="ue1" ref="ue"></UE>

            </el-form-item>
            <el-form-item style="text-align: right;">
                <el-button @click="onCancle">取消</el-button>
                <el-button type="primary" @click="editSubmit('editForm')" :loading="editLoading">确定</el-button>
            </el-form-item>
        </el-form>

    </el-row>
</template>
<script type="text/ecmascript-6">
    import UE from 'components/ue.vue';

    var util = require('../../../js/common/util');
    export default {
        data() {
            return {
                config: {
                    initialFrameWidth: null,
                    initialFrameHeight: 350
                },
                ue1: "ue1", // 不同编辑器必须不同的id
                props: {
                    value: 'id',
                    label: 'name'
                },
                options: [],
                //编辑界面数据
                editForm: {
                    id: '',
                    typeids: [],
                    typeid: '',
                    title: '',
                    publish_time: '',
                    content: '请输入内容'
                },
                editLoading: false,
                editFormRules: {
                    typeids: [
                        {type: "array", required: true, message: '请选择类型', trigger: 'change'}
                    ],
                    publish_time: [
                        {required: true, message: '不能为空', trigger: 'blur'}
                    ],
                    title: [
                        {required: true, message: '请输入新闻标题', trigger: 'blur'},
                        {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'}
                    ]
                }
            }
        },
        components: {
            UE
        },
        created() {
//            this.options=this.$parent.news.newsType;
            this.bindNewsTypes();
            this.getNewContent()
        },
        methods: {
            getTime(date) {
                this.editForm.publish_time = date;
            },
            bindNewsTypes() {
                let url = '/api/news/type/alllists';
                this.$http.get(url, null, {credentials: true})
                    .then((res) => {
                        if (res.body.code != 'SUCCESS') {
                            this.$alert(res.body.msg, '友情提示', {
                                confirmButtonText: '确定',
                            });
                            return;
                        }
                        this.options = res.body.data || [];
                    }, (err) => {
                    });
            },
            //获取新闻内容数据
            getNewContent() {
                var url = '/api/news/' + util.getQueryParams('id');
                this.loading = true;
                this.$http.get(url, null, {credentials: true})
                    .then((res) => {
                        this.loading = false;
                        if (res.body.code != 'SUCCESS') {
                            this.$alert(res.body.msg, '友情提示', {
                                confirmButtonText: '确定',
                            });
                            return;
                        }
                        let newsData = res.body.data;
                        this.editForm = newsData;

                        if (newsData.content == '请输入内容') {
                            this.$refs.ue.setUEContent(newsData.content);
                        }

                        if (!newsData.newsType.id) {
                            return;
                        }

                        this.editForm.typeids = newsData.newsType.pids.split(',').map((item) => {
                            return parseInt(item);
                        });
                        this.editForm.typeids.push(this.editForm.typeid);


                    }, (err) => {
                        this.loading = false;
                    });
            },
            //编辑
            editSubmit(formName) {
                var me = this;
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        return;
                    }
                    let content = this.$refs.ue.getUEContent(); // 调用子组件方法
                    let url = '/api/news/' + this.editForm.id;
                    let params = {
                        id: this.editForm.id,
                        typeid: this.editForm.typeids.pop(),
                        title: this.editForm.title,
                        publish_time: this.editForm.publish_time,
                        content: content
                    };
                    this.editLoading = true;
                    this.$http.put(url, params, {credentials: true})
                        .then((res) => {
                            this.editLoading = false;
                            if (res.body.code != 'SUCCESS') {
                                this.$alert(res.body.msg, '友情提示', {
                                    confirmButtonText: '确定',
                                });
                                return;
                            }
                            this.$message({
                                message: '提交成功',
                                type: 'success'
                            });
                            this.$refs[formName].resetFields();
                            this.$router.push({
                                path: '/news/content'
                            });
                        }, (err) => {
                            this.editLoading = false;
                        });
                });
            },
            //取消
            onCancle() {
                this.$router.push({
                    path: '/news/content'
                });
            }
        }
    }
</script>
