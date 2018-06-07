<template>
    <el-row class="contractsAdd">
        <h2>合同内容 — 新增</h2>
        <el-form label-width="90px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="合同类别" prop="typeid">
                <el-cascader @change='typeidChange' change-on-select :options="typeTree" :props="props" v-model="formData.typeid"></el-cascader> 
            </el-form-item> 
            <el-form-item label="合同标题" prop="title">
                <el-col :span="12">
                    <el-input v-model="formData.title" placeholder="请输入合同标题"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="合同内容" prop="content">
                <UE :placeholderData='placeholderData' :defaultMsg="formData.content" :config="config" ref="ue"></UE>
            </el-form-item>
            <el-form-item style="text-align: right;">
                <el-button @click="resetForm('formData')">取消</el-button>
                <el-button type="primary" @click="submitForm('formData')">确定</el-button>
            </el-form-item>
        </el-form>
    </el-row>
</template>
<script>
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
                contractsTypes:{
                    typeTree: []
                },
                typeTree:[],
                config: {
                    initialFrameWidth: null,
                    initialFrameHeight: 350,
                    retainOnlyLabelPasted: true
                },
                rules: {
                    typeid:[{required:true, trigger:'change', validator:handleInput}],
                    title:[{required:true, trigger:'change', validator:handleInput}],
                    content:[{required:true, trigger:'blur', validator:handleInput}]
                },
                componentsType:null,
                placeholderData:[],
                isShow :false,
                preData:[]
            }
        },
        mounted(){
            this.contractsTypeFn();
            this.init();
        },
        methods:{
            init(){
                var _this = this;
                let url = '/api/contracts/vm/lists';
                this.$http.get(url,{credentials: true}).then((rs)=>{
                        if(rs.body.code === 'SUCCESS'){
                            this.preData = rs.body.data.lists;
                        }
                    },(err) => {
                })
            },
            submitForm(formName){
                let content = this.$refs.ue.getUEContent();
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    var apiUrl = "/api/contracts/add";
                    var data = Object.assign({},this.formData);
                    var typeids = data.typeid[data.typeid.length-1];
                    data.typeid = typeids;
                    data.content = content;
                    this.$http.post(apiUrl,data).then((res)=>{
                        this.$refs[formName].resetFields();
                        this.$emit('afterSubmit');
                        this.$message({
                            message: '提交成功',
                            type: 'success'
                        });
                        this.$router.push({
                            path:'/contracts/content'
                        });
                    },(error)=>{
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
            contractsTypeFn(){
                let url = '/api/contracts/type/lists';
                this.$http.get(url).then((rs)=>{
                    this.isLoading = false;
                    if(rs.body.code === 'SUCCESS'){
                        let resData = rs.body.data;
                        this.typeTree = resData.dataTree;
                    }
                },(err) => {
                    this.isLoading = false;
                })
            },
            typeidChange(val){
               if(val[0] !=  this.componentsType){
                    this.$refs.ue.distroyEditor();
                     this.componentsType = val[0]
                    this.vmDataReady()    
                }
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
            }
        }

    }
</script>