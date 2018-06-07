<template>
    <el-row class="contractsEdit">
        <h2>合同内容 — 编辑</h2>
        <el-form label-width="90px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="合同类别" prop="typeid">
                <el-cascader @change='typeidChage' change-on-select :options="typeTree" :props="props" v-model="formData.typeid"></el-cascader> 
            </el-form-item> 
            <el-form-item label="合同标题" prop="title">
                <el-col :span="12">
                    <el-input v-model="formData.title" placeholder="请输入合同标题"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="合同内容" prop="content">
                <UE  v-if='isShow' :placeholderData='placeholderData' :defaultMsg="formData.content" :config="config" ref="ue"></UE>
            </el-form-item>
            <el-form-item style="text-align: right;">
                <el-button @click="resetForm('formData')">取消</el-button>
                <el-button type="primary" @click="submitForm('formData')">确定</el-button>
            </el-form-item>
        </el-form>
    </el-row>
</template>
<script>
    var Util = require("src/js/common/util");
    import UE from 'src/components/ueContract.vue';
    export default {
        components: {UE},
        data(){
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "typeid"){
                    if(!val || val.length == 0){
                        callback(new Error('合同类别不能为空'));
                    }else{
                        callback();
                    }
                }else if( rule.field == "content"){
                    if( !this.$refs.ue.getUEContent()){
                        callback(new Error('合同内容不能为空'));
                    }else{
                        callback();
                    }
                }else if( rule.field == "title"){
                    if( !val){
                        callback(new Error('合同标题不能为空'));
                    }else if(val.length>50){
                        callback(new Error('合同标题过长'));
                    }else{
                        callback();
                    }
                }
            };
            return {
                formData: {
                    typeid: [],
                    title: '',
                    content: ''
                },
                props:{
                    value:'id',
                    label:'name'
                },
                typeTree:[],
                config: {
                    initialFrameWidth: null,
                    initialFrameHeight: 350,
                    retainOnlyLabelPasted: true
                },
                rules: {
                    typeid:[{required:true, trigger:'change', validator:handleInput}],
                    title:[{required:true, trigger:'blur', message:"标题不能为空"}],
                    content:[{required:true, trigger:'blur', validator:handleInput}]
                },
                componentsType:null,
                placeholderData:[],
                preData:[],
                isShow: false
            }
        },
        created(){
            this.init();
        },
        methods:{
            init(){
                let id = Util.getQueryParams("id"),
                    url = '/api/contracts/'+id;
                this.$http.get(url).then((rs)=>{
                    if(rs.body.code === 'SUCCESS' ){
                        let resData = rs.body.data;
                        let _pids = resData.contractType.pids;
                        if(_pids){
                            let pids = _pids.split(",");
                            pids = pids.map( (i)=>{
                                return i*1;
                            });
                            let typeid = pids.concat([resData.typeid]);
                            this.formData.typeid=typeid;
                        }else{
                            this.formData.typeid=[resData.typeid];
                        }
                        this.formData.title  =  resData.title;
                        this.formData.content  =  resData.content;
                        this.typeTree = resData.contractsTree
                        //为获取vm数据 
                        this.componentsType = this.formData.typeid[0];
                        this.getPlaceholderData()
                    }
                },(err)=>{
                    console.log(err);
                });
            },
            getPlaceholderData(){
                var _this = this;
                let url = '/api/contracts/vm/lists';
                this.$http.get(url,{credentials: true}).then((rs)=>{
                    if(rs.body.code === 'SUCCESS'){
                        this.preData = rs.body.data.lists; 
                        this.isShow = true;
                        this.vmDataReady()
                    }
                },(err) => {
                })
            },
            submitForm(formName){
                var me = this;
                let content = this.$refs.ue.getUEContent();
                this.$refs[formName].validate((valid) => {
                    if (!valid) {return false;}
                    this.isLoading = true;
                    var data = Object.assign({},me.formData);
                    var _typeid = data.typeid[data.typeid.length-1];
                    data.typeid = _typeid;
                    data.content = content;
                    var apiUrl = "/api/contracts/"+ Util.getQueryParams("id");
                    this.$http.put(apiUrl,data).then((res)=>{
                        this.$refs[formName].resetFields();
                        this.isLoading = false;
                        this.$emit('afterSubmit');
                        this.$message({
                            message:'修改成功',
                            type: 'success'
                        });
                        this.$router.push({
                            path:'/contracts/content'
                        });
                    },(error)=>{
                        this.isLoading = false;
                        console.log(error);
                    });

                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.$router.push({
                    path:'/contracts/content'
                });
            },
            vmDataReady(){
                var _this = this;
                var array = []
                this.preData.map((val,index,arr)=>{
                    if(this.componentsType == val.typeid){
                        let obj = {}
                        obj.label = val.name
                        obj.value = val.placeholder
                        array.push(obj)
                    }
                })
                this.placeholderData = array;
                this.$nextTick(()=>{
                    this.$refs.ue.createEditor();
                })
            },
            typeidChage(val){
                if(val[0] !=  this.componentsType){
                    this.$refs.ue.distroyEditor();
                    this.componentsType=val[0]
                    this.vmDataReady()
                }
            }
        }     
    }
</script>
