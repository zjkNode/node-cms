<template>
    <el-row class="news">
        <h2>新闻内容--添加</h2>
        <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="80px">
            <el-form-item label="选择类型" prop="typeids">
                <el-cascader
                        change-on-select
                        :options="options"
                        :props="props"
                        v-model="addForm.typeids">
                </el-cascader>
            </el-form-item>
            <el-form-item label="新闻标题" prop="title">
                <el-input v-model="addForm.title"></el-input>
            </el-form-item>

            <el-form-item label="新闻时间" prop="publish_time">
                <el-date-picker
                    v-model="addForm.publish_time"
                    type="date"
                    @change="getTime"
                    value-format="yyyy-MM-dd"
                    placeholder="选择日期时间">
                </el-date-picker>
            </el-form-item>

            <el-form-item label="新闻内容" prop="content">
                <UE :defaultMsg="defaultMsg" :config="config" :id="ue1" ref="ue">
                </UE>
            </el-form-item>
            <el-form-item style="text-align: right;">
                <el-button @click="onCancle">取消</el-button>
                <el-button type="primary" @click="addSubmit('addForm')" :loading="addLoading">确定</el-button>
            </el-form-item>
        </el-form>

    </el-row>
</template>
<script type="text/ecmascript-6">
    import UE from 'components/ue.vue';
    export default{
        data(){
            return {
                defaultMsg: '请输入内容',
                config: {
                    initialFrameWidth: null,
                    initialFrameHeight: 350
                },
                ue1: "ue1", // 不同编辑器必须不同的id
                props:{
                    value:'id',
                    label:'name'
                },
                options:[],
                    //新增界面数据
                addForm:{
                    typeids:[],
                    title:'',
                    content:'',
                    publish_time:''
                },
                addLoading:false,
                addFormRules: {
                    typeids:[
                        {type: "array",required: true, message: '请选择类型', trigger: 'change'}
                    ],
                    publish_time:[
                        {required: true, message: '不能为空', trigger: 'blur'}
                    ],
                    title: [
                        {required: true, message: '请输入新闻标题', trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        components:{ UE },
        mounted(){
            this.getOptions()
        },
        methods:{
            getTime(date){
                this.addForm.publish_time = date;
            },
            getOptions(){
                let url = '/api/news/type/alllists';
                this.loading = true;
                this.$http.get(url, null, {credentials: true})
                        .then((res)=> {
                            this.loading = false;
                            if(res.body.code != 'SUCCESS'){
                                this.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                                return;
                            }
                            this.options = res.body.data || [];
                        },(err) => {
                            this.loading = false;
                        });
            },
            //编辑器获取内容
            getUEContent() {
                let content = this.$refs.ue.getUEContent(); // 调用子组件方法
                this.addForm.content = content;
            },
            //添加类型
            addSubmit(formName){
                this.$refs[formName].validate((valid)=> {
                    if(!valid){
                        return;
                    }

                    let content = this.$refs.ue.getUEContent();
                    let params = {
                        typeid: this.addForm.typeids.pop(),
                        title: this.addForm.title,
                        publish_time:this.addForm.publish_time,
                        content: content
                    }

                    let url = '/api/news/add';
                    this.addLoading = true;
                    this.$http.post(url, params, {credentials: true})
                            .then((res) => {
                                this.addLoading = false;
                                if(res.body.code != "SUCCESS"){
                                     this.$alert(res.body.msg,'友情提示', {
                                        confirmButtonText: '确定',
                                    });
                                }
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs[formName].resetFields();
                                this.$router.push({
                                    path:'/news/content'
                                });
                            },(err) => {
                                this.addLoading = false;
                            });
                });
            },
            //取消
            onCancle(){
                this.$router.push({
                    path:'/news/content'
                });
            }
        }
    }
</script>
