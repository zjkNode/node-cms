<template>
    <el-row class="dep">
        <h2>附件管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入附件类型名称/代码"  @input="searchName"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="getFiles" icon="el-icon-search"> 查询</el-button>
                <el-button type="primary" @click="onAddClick()" icon="el-icon-plus" pull="6">新增</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="filelists" stripe v-loading="isLoading" style="width: 100%">
                <el-table-column type="index" width="60"></el-table-column>
                <el-table-column prop="filesTypes.name" label="附件类型" width="150"></el-table-column>
                <el-table-column prop="name" label="附件名称" width="150"></el-table-column>
                <el-table-column prop="filepath" label="附件访问路径" min-width="500"></el-table-column>
                <el-table-column prop="filesize" label="附件大小" :formatter="sizeFormat" min-width="180" ></el-table-column>
                <el-table-column prop="create_time" label="添加时间" :formatter="dateFormat" width="180" show-overflow-tooltip></el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                    <template scope="scope">
                        <el-button @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                        <el-button @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <!--工具条-->
        <div class="block pagbar">
            <el-pagination
                    @size-change="onSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="page"
                    :page-sizes="[15, 30, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
        <!--新增-->
        <el-dialog title="新增文件"  :visible.sync="isAddVisible" :close-on-click-modal="false">
            <el-form :model="addFrom" :rules="rules" ref="addFrom" label-width="90px">
                <el-form-item label="文件类型" prop="typeid">
                    <el-cascader change-on-select :options="fileOptions"  :props="props" v-model="addFrom.typeid">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="文件名称" prop="name">
                    <el-input v-model="addFrom.name" placeholder="请输入文件名称"></el-input>
                </el-form-item>
                <el-form-item label="文件上传" prop="fileLists">
                    <el-upload
                            class="upload-demo"
                            ref="upload"
                            :headers="uploadHeaderData"
                            action="/api/files/upload"
                            :multiple="false"
                            :on-remove="handleRemove"
                            :file-list="addFrom.addfileLists"
                            :on-success="handleSuccess"
                            list-type="picture"
                            :auto-upload="false"
                            :on-change="handleChange">
                        <el-button size="small" type="primary" :disabled="btnupload">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传一份文件,可删除后重新选择</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="onAddCancle">取 消</el-button>
                <el-button type="primary" @click="onAddSubmit('addFrom')" :loading="isAddLoading">确 定</el-button>
            </div>
        </el-dialog>
        <!--编辑-->
        <el-dialog title="修改文件" size="tiny" :visible.sync="isEditVisible">
            <el-form :model="editFrom" :rules="editrules" ref="editFrom" label-width="90px">
                <el-form-item label="文件类型" prop="typeid">
                    <el-cascader change-on-select :options="fileOptions"  :props="props" v-model="editFrom.typeid">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="文件名称" prop="name">
                    <el-input v-model="editFrom.name"></el-input>
                </el-form-item>
                <el-form-item label="文件上传" prop="fileLists" >
                    <el-upload
                            class="upload-demo"
                            ref="editupload"
                            :headers="editHeaderData"
                            :action="actionUrl"
                            :multiple="false"
                            :on-remove="handleRemoveEdit"
                            :on-success="handleSuccessEdit"
                            :file-list="editFrom.fileLists"
                            list-type="picture"
                            :auto-upload="false"
                            :on-change="handleChangeEdit">
                        <el-button size="small" type="primary" :disabled="btnEditupload">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传一份文件,可删除后重新选择</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="isEditVisible=false">取 消</el-button>
                <el-button type="primary" @click="onEditSubmit('editFrom')" :loading="editLoading">确 定</el-button>
            </div>
        </el-dialog>

    </el-row>
</template>
<script type="text/ecmascript-6">
    var moment = require('moment');
    var util = require('../../js/common/util');
export default{
    data(){
        return{
            filelists: null,
            isLoading: false,
            editLoading:false,
            isAddLoading:false,
            isEditLoading: false,
            isAddVisible: false,
            isEditVisible:false,
            keys:"",
            fileOptions:[],
            props:{ value:'id', label:'name' },
            addFrom:{
                typeid:[],
                name:'',
                fileLists:[],
                addfileLists:[]
            },
            uploadHeaderData:{},
            editHeaderData:{},
            editFrom:{
                typeid:[],
                name:'',
                fileLists:[]
            },
            btnupload:false,
            btnEditupload:true,
            rules: {
                typeid:[
                    {type: "array",required: true, message: '请选择类型', trigger: 'change'}
                ],
                name: [
                    {required: true, message:'类型名称不能为空',trigger: 'blur'},
                    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
                ],
                fileLists:[
                    {type: "array",required: true, message:'请上传1张图片',trigger: 'blur'},
                ]
            },
            editrules: {
                typeid:[
                    {type: "array",required: true, message: '请选择类型', trigger: 'change'}
                ],
                name: [
                    {required: true, message:'类型名称不能为空',trigger: 'blur'},
                    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
                ],
                fileLists:[
                    {type: "array",required: true, message:'请上传1张图片',trigger: 'blur'},
                ]
            },
            total: 0,
            page: 1,
            pageSize:15,
            pageIndex:1,
            actionUrl:'/api/files/upload',
            canUpload:false,
            canEditUpload:true,
            editValue:[]

        }
    },
    mounted(){
        this.getAllFiles();
        this.getFileTypes();
    },
    methods:{
        sizeFormat(row,column,cellvalue){
            return util.conver(cellvalue)
        },
        dateFormat(row,column,cellvalue){
            if (!cellvalue) {
                return "";
            }
            return moment(cellvalue).format("YYYY-MM-DD HH:mm:ss");
        },
        //查询
        getFiles(){
            this.getAllFiles()
        },
        //获取所有列表数据
        getAllFiles(){
            let me = this;
            let url = '/api/files/lists';
            let data = {keys:this.keys,pageIndex:this.page,pageSize:this.pageSize};
            me.loading=true;
            me.$http.get(url, {params:data}, {credentials: true})
                    .then((res)=> {
                        me.loading = false;
                        if (res.body.code =='SUCCESS') {
                            var data=res.body.data;
                            me.filelists = data.lists;
                            me.total = data.total;
                        } else {
                            me.$alert(res.body.msg,'友情提示', {
                                confirmButtonText: '确定',
                            });
                        }
                    },(err) => {
                        me.loading = false;
                    });
        },
        //获取类型列表数据
        getFileTypes(){
            let me = this;
            me.fileOptions =[];
            let url = '/api/files/type/treeList';
            let data = '';
            me.loading = true;
            me.$http.get(url, {params:data}, {credentials: true})
                    .then((res)=> {
                        me.loading = false;
                        if (res.body.code =='SUCCESS') {
                            var data = res.body.data;
                            me.fileOptions=!!data ? [...me.fileOptions,...data] : [];
                        } else {
                            me.$alert(res.body.msg,'友情提示', {
                                confirmButtonText: '确定',
                            });
                        }
                    },(err) => {
                        me.loading = false;
                    });
        },
        onAddSubmit(formname){
            var me = this;
            me.$refs[formname].validate((valid)=> {
                if(valid){
                    if(!me.canUpload){
                        me.$message.error('上传图片为一张,请删除多余的图片!');
                        return false;
                    }
                    let typeid=me.addFrom.typeid;
                    me.uploadHeaderData.typeid=typeid[typeid.length-1];
                    me.$nextTick(()=>{
                        me.$refs.upload.submit()
                    })
                }
            })
        },
        onAddCancle(){
            var me = this;
            me.$refs['addFrom'].resetFields();
            me.addFrom.fileLists = [];
            me.addFrom.addfileLists = [];
            me.isAddVisible = false;
            me.btnupload = false;
            $('.upload-demo input[type=file]')[0].disabled=false;
        },
        onEditSubmit(formname){
            var me = this;
            me.$refs[formname].validate((valid)=> {
                if (valid) {
                    if(!me.canEditUpload){
                        me.$message.error('上传图片为一张,请删除多余的图片!');
                        return false;
                    }
                    if(!me.editValue.length){
                        me.editAction();
                        return;
                    }
                    let typeid=me.editFrom.typeid;
                    me.editHeaderData.typeid=typeid[typeid.length-1];
                    me.$nextTick(()=>{
                        me.$refs.editupload.submit()
                    })
                }
            })
        },
        addAction(){
            var me = this;
            var data = Object.assign({},me.addFrom);
            var _typeid = data.typeid.pop();
            var files = data.fileLists;
            data.typeid = _typeid;
            data.filepath = files.length>0 ? files[0].response.file.path :'';
            data.filesize = files.length>0 ? files[0].response.file.size :'';
            var url = '/api/files/add';
            me.isAddLoading = true;
            me.$http.post(url, data, {credentials: true})
                    .then((res)=> {
                        me.isAddLoading = false;
                        if (res.body.code === 'SUCCESS') {
                            me.$message({
                                message: '提交成功',
                                type: 'success'
                            });
                            me.$refs['addFrom'].resetFields();
                            me.addFrom.fileLists=[];
                            me.addFrom.addfileLists=[];
                            me.isAddVisible = false;
                            me.btnupload=false;
                            $('.upload-demo input[type=file]')[0].disabled=false;
                            me.getAllFiles();
                        } else {
                            me.$alert(res.body.msg,'友情提示', {
                                confirmButtonText: '确定',
                            });
                        }
                    },(err) => {
                        me.isAddLoading = false;
                    });

        },
        editAction(){
            var me= this;
            var data = Object.assign({},me.editFrom);
            var _typeid = data.typeid.pop();
            var files=data.fileLists;
            data.typeid = _typeid;
            data.filepath=!!files && files.length>0 && !!me.editValue.length ? files[0].response.file.path : (!!files ? data.filepath : '');
            data.filesize=!!files && files.length>0 && !!me.editValue.length ? files[0].response.file.size :(!!files ? data.filesize : '');
            var url = '/api/files/'+data.id;
            me.editLoading = true;
            me.$http.put(url, data, {credentials: true})
                    .then((res)=> {
                        me.editLoading = false;
                        if (res.body.code === 'SUCCESS') {
                            me.$message({
                                message: '提交成功',
                                type: 'success'
                            });
                            me.$refs['editFrom'].resetFields();
                            me.isEditVisible = false;
                            me.editFrom.fileLists=[];
                            me.editValue=[];
                            me.btnEditupload=true;
                            $('.upload-demo input[type=file]')[0].disabled=true;
                            me.getAllFiles();
                        } else {
                            me.$alert(res.body.msg,'友情提示', {
                                confirmButtonText: '确定',
                            });
                        }
                    },(err) => {
                        me.editLoading = false;
                    });

        },
        onAddClick(){
            this.isAddVisible = true;
            $('.upload-demo button').removeClass('is-disabled');
        },
        onRemoveClick(index,row){
            var me = this;
            var id = row.id;
            me.$confirm('确认删除该记录吗?', '提示', {
                type: 'warning'
            }).then(() => {
                var url = '/api/files/' + id;
                var data =row;
                me.listLoading = true;
                me.$http.delete(url, {body: data}, {credentials: true})
                        .then((res)=> {
                            me.listLoading = false;
                            if (res.body.code =='SUCCESS') {
                                me.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                me.getAllFiles()
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.editLoading = false;
                        });
            })
        },
        //显示编辑页面
        onEditClick(row){
            this.editFrom=row;
            this.editFrom.fileLists=[];
            let _typeid=[];
            if(!!row.filesTypes.id){
                _typeid=row.filesTypes.pids.split(',').map((pid)=>{return parseInt(pid)});
                _typeid.push(parseInt(row.filesTypes.id))
            }
            this.editFrom.typeid=_typeid;
            this.editFrom.fileLists.push({url:row.filepath,size:row.filesize});
            this.editFrom.oldpath=row.filepath;
            this.isEditVisible=true;
            this.$nextTick(()=>{
                $('.upload-demo input').disabled=true;
            })
        },
        //添加图片
        handleChange(file,fileList){
            var me = this;
            me.addFrom.fileLists=fileList;
            me.btnupload=true;
            $('.upload-demo input[type=file]')[0].disabled=true;
            if(fileList.length>1){
                me.$message.error('上传图片为一张,请删除多余的图片!');
                me.canUpload=false;
            }else{
                me.canUpload=true;
            }
        },
        //编辑弹框中添加图片
        handleChangeEdit(file,fileList){
            var me = this;
            me.editFrom.fileLists=fileList;
            $('.upload-demo button').addClass('is-disabled');
            $('.upload-demo input[type=file]')[0].disabled=true;
            if(fileList.length>1){
                me.$message.error('上传图片为一张,请删除多余的图片!');
                me.editValue.push(file);
                me.canEditUpload=false;
            }else{
                me.editValue.push(file);
                me.canEditUpload=true;
            }
        },
        //点击删除图片
        handleRemove(file, fileList) {
            var me = this;
            me.btnupload=false;
            $('.upload-demo input[type=file]')[0].disabled=false;
            if(fileList.length!=1){
                me.canUpload=false;
            }else{
                me.canUpload=true;
            }
        },
        //编辑弹框中删除图片
        handleRemoveEdit(file, fileList){
            var me = this;
            me.btnEditupload=false;
            $('.upload-demo input[type=file]')[0].disabled=false;
            if(fileList.length!=1){
                me.canEditUpload=false;
            }else{
                me.canEditUpload=true;
            }
        },
        //添加图片时上传图片成功
        handleSuccess(res,file,fileList){
            var me = this;
            me.addFrom.fileLists=fileList;
            me.addAction()
        },
        //编辑图片时上传图片成功
        handleSuccessEdit(res,file,fileList){
            var me = this;
            me.editFrom.fileLists=fileList;
            me.editAction()
        },
        handleCurrentChange(val) {
            this.page = val;
            this.getAllFiles();
        },
        onSizeChange(val){
            this.pageSize = val;
            this.getAllFiles();
        },
        searchName(){
            if(!this.keys){
                this.getAllFiles();
            }
        }

    }
}
</script>
<style lang="scss">
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }
    .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
</style>
