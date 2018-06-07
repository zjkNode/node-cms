<template>
    <el-dialog title="修改合同类别" :visible.sync="editFormVisible">
        <el-form label-width="90px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="合同类别" prop="pid">
                <el-cascader change-on-select :options="listsTree" :props="props" v-model="formData.pid" @change="pidChange"></el-cascader> 
            </el-form-item> 
            <el-form-item label="合同名称" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入合同分类名称"></el-input>
                </el-col>
            </el-form-item>
             <el-form-item label="是否可用" prop="status">
                <el-radio-group v-model.number="formData.status">
                    <el-radio v-bind:label="1">正常</el-radio>
                    <el-radio v-bind:label="2">停用</el-radio>
                </el-radio-group>
            </el-form-item> 
        </el-form>
         <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('formData')">取 消</el-button>
            <el-button type="primary" @click="submitForm('formData')">确 定</el-button>
        </div> 
    </el-dialog>
</template>
<script>
    export default {
        props: {
            isEditVisible: { type: Boolean, default: false },
            listsTree:null,
            rowData:null
        },
        data() {
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "pid"){
                    if(!val){
                        callback(new Error('请选择合同级别'));
                    }else if(this.formData.id == val[val.length-1]){
                        callback(new Error('不能选择合同级别本身'));
                    }else{
                        callback();
                    };
                }else if( rule.field == "name"){
                    if( !val){
                        callback(new Error('类别名称不能为空'));
                    }else if(val.length>50){
                        callback(new Error('类别名称过长'));
                    }else{
                        callback();
                    }
                }
            };
            return {
                editFormVisible: this.isEditVisible,
                props:{
                    value:'id',
                    label:'name'
                },
                formData: {
                    name: '',
                    status: 1,
                    pid: null,
                    pids: null
                    
                },
                rules: {
                    name: [
                        { required: true, validator:handleInput, trigger: 'change' }
                    ],
                    status: [
                        { required: true, trigger: 'blur',type:'number'}
                    ],
                    pid: [
                        { required: true, validator:handleInput, trigger: 'change',type:'number' }
                    ]
                    
                }
            };
        },
        mounted() {
        },
        watch: {
            isEditVisible(val){
                this.editFormVisible = val;
            },
            editFormVisible(val){
                this.$emit('onEditVisibleChange',val);
            },
            rowData(row){
                this.formData = row;
                let pids = row.pids;
                if(pids.indexOf(",") != -1){
                    this.formData.pid=pids.split(",");
                    this.formData.pid = this.formData.pid.map( (i)=>{
                        return i*1;
                    });
                }else{
                    this.formData.pid=[Number(pids)];
                }
                this.$options.filters.disableItem(this.listsTree,row.id)
            }
        },
        methods:{
            submitForm(formName){
                var me = this;
                this.$refs[formName].validate((valid) => {
                    if (!valid) {return false;}
                    this.isLoading = true;
                    var data = Object.assign({},me.formData);
                    var pids = data.pid;
                    var _pid = pids.slice(-1)[0];
                    data.pid = _pid >0 ? _pid : 0;
                    var apiUrl = "/api/contracts/type/"+ this.formData.id;
                    this.$http.put(apiUrl,data).then((res)=>{
                        this.isLoading = false;
                        this.editFormVisible = false;
                        this.$emit('afterSubmit');
                        this.$message({
                            message:'修改成功',
                            type: 'success'
                        });
                    },(error)=>{
                        this.isLoading = false;
                        console.log(error);
                    });
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.editFormVisible = false;
            },
            pidChange(val){
                if(!val[0]){
                    this.formData.pid=[0];
                };
                this.formData.pids = this.formData.pid.join(",")
            }
        }
    };

</script>