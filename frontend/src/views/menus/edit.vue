<template>
    <el-dialog title="修改菜单" :visible.sync="editFormVisible">
        <el-form label-width="90px" ref="formData" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="菜单级别" prop="pid">
                <el-cascader 
                    change-on-select
                    :options="menuTree" 
                    :props="props" v-model="formData.pid" 
                    @change="pidChange"
                ></el-cascader> 
            </el-form-item> 
            <el-form-item label="菜单名称" prop="name">
                <el-col :span="12">
                    <el-input v-model="formData.name" placeholder="请输入菜单名称"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="菜单地址" prop="alink">
                <el-col :span="12">
                    <el-input v-model="formData.alink" placeholder="请输入菜单访问地址（如 /menus ）"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 域名后的访问地址</i>
                </el-col>
            </el-form-item>
            <el-form-item label="是否可用" prop="status">
                <el-radio-group v-model.number="formData.status">
                    <el-radio v-bind:label="1">正常</el-radio>
                    <el-radio v-bind:label="2">停用</el-radio>
                </el-radio-group>
            </el-form-item> 
            <el-form-item label="菜单排序" prop="sort">
                <el-col :span="12">
                    <el-input v-model.number="formData.sort" placeholder="请输入菜单排序（默认为1）"></el-input>
                </el-col>
                <el-col :span="12" :push="1">
                    <i class="el-icon-warning"> 1-99之间的数字(1优先级最高)</i>
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
    export default {
        props: {
            isEditVisible: { type: Boolean, default: false },
            menuTree:null,
            rowData:null
        },
        data() {
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "sort"){
                    if(val>99 || val<1){
                        callback(new Error('请输入1-99之间的数字'));
                    }else{
                        callback();
                    }
                }else{
                    callback();
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
                    alink:'',
                    status: 1,
                    pid: null,
                    pids:null,
                    sort: 1
                },
                rules: {
                    name: [
                        { required: true, message: '请输入菜单名称', trigger: 'blur' }
                    ],
                    alink: [
                        { required: true, message: '请输入菜单访问地址', trigger: 'blur' }
                    ],
                    status: [
                        { required: true, trigger: 'blur',type:'number'}
                    ],
                    pid: [
                        { required: true, validator:handleInput, trigger: 'change',type:'number' }
                    ],
                    sort: [
                        { required: false, validator:handleInput, trigger: 'change', type:'number' }
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
                this.$options.filters.disableItem(this.menuTree,row.id)
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
                    var apiUrl = "/api/menu/"+ this.formData.id;
                    this.$http.put(apiUrl,data).then((res)=>{
                        this.isLoading = false;
                        this.editFormVisible = false;
                        this.$emit('afterSubmit');
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
                this.formData.pids = this.formData.pid.join(",");
            }
        }
    };

</script>