<template>
	<div class="tpl_edit">
        <h2>活动模板 -- 新增</h2>
		<el-row class="mainWrapper">
		    <el-col :span="7" :push="1" class="tpl_aside" id="tpl_aside">
                <el-card v-for="partObj in allParts">
                    <el-button icon="el-icon-plus">{{ partObj.desc }}</el-button>
                    <div class="card_mask" @click="onCardClick(partObj)" >
                        <span><i class="el-icon-plus"></i> {{ partObj.desc }}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="15" :push="2" class="tpl_main">
                <el-form label-width="90px" ref="formData" :model="formData" :rules="rules" :show-message="true">
                    <el-form-item label="模板名称" prop="name">
                        <el-col :span="12">
                            <el-input placeholder="请输入模板名称" v-model="formData.name"></el-input>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="模板代码" prop="code">
                        <el-col :span="12">
                            <el-input placeholder="请输入模板代码" v-model="formData.code"></el-input>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="模板封面" prop="cover">
                        <el-col :span="18">
                            <el-upload
                                ref = 'upload'
                                action="/api/act/tpl/add"
                                :data = "formData"
                                :limit="1"
                                :on-exceed= "handleExceed"
                                :auto-upload="false"
                                list-type="picture"
                                :on-success = "successFn"
                                :on-change ="handelChangeFn">
                                <el-button slot="trigger" size="small" type="primary">上传图片</el-button>
                                <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过200kb</div>
                            </el-upload>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="模板布局" prop="parts" v-model ="formData.parts">
                        <el-row class="tpl" :style="'background-image:url('+ require('src/img/act_bg.jpg') +')'">
                            <template v-for="(part, index) in formData.parts">
                                <el-card  v-if="allParts[part].type !== 'hidden'">
                                    <div v-bind:is="part"></div>
                                    <div class="card_mask">
                                        <span @click="onRemoveClick(index)"><i class="el-icon-close"></i> 移除</span>
                                    </div>
                                </el-card>
                            </template>
                        </el-row>
                        <ul class="tpl_hidden">
                            <template v-for="(part, index ) in formData.parts">
                                <li v-if="allParts[part].type === 'hidden'" class="flex-center-v">
                                    {{allParts[part].desc+'_'+index}}
                                    <div class='masker' @click="onRemoveClick(index)"><i class="el-icon-close"></i> 移除</div>
                                </li>
                            </template>
                        </ul>
                    </el-form-item>
                    <el-form-item style="padding-left:90px; padding-top:20px;">
                        <el-button type="primary" @click="submitForm('formData')">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
		</el-row>
	</div>
	
</template>
<script>
    var allParts = require('../parts/index');

	export default {
        name:'tplEdit',
        components: allParts,
        data(){
            let handleInput = (rule,val,callback) =>{
                if(/^[a-z]+$/g.test(val)){
                    callback();
                }else{
                    callback(new Error('请输入小写英文字母'));
                }
            };
            return {
                allParts: allParts,
                canLeave: false,
            	formData:{
            		name:'',
                    code:'',
                    cover: null,
                    parts:[]
                },
                rules:{
                    name: [
                        {required:true,message: '请输入模板名称', trigger: 'blur'},
                        { min: 1, max: 49, message: '长度在 1 到 49 个字符', trigger: 'blur' }
                    ],
                    code: [
                        {required:true,message: '请输入由小写英文字母组成的模板代码', trigger: 'blur',validator:handleInput},
                        { min: 1, max: 49, message: '长度在 1 到 49 个字符', trigger: 'blur' }
                    ],
                    cover:[
                        {type: 'boolean',required:true,message: '请上传一张封面图', trigger: 'blur'},
                    ],
                    parts:[{type: 'array', required:true,message: '请至少选择一个组件', trigger: 'blur'}]
                }
            }
        },
        mounted() {
            $("#tpl_aside").css('height',$(".mainContent").innerHeight()-110);
            $(".mainContent")[0].addEventListener('scroll', this.scrollFn)
        },
        beforeRouteLeave(to, from, next){
            if(!this.canLeave){
                this.leaveForm(next);
                return;
            }
            next();
        },
        methods:{
            scrollFn(){
                var wrapTop = $(".mainContent")[0].scrollTop,
                    _H = $(".mainContent").height() ;
                if( wrapTop> 0 && _H>600){
                    $("#tpl_aside").css('top',wrapTop+'px');
                }
            },
        	onCardClick(partObj){
        		this.formData.parts.push(partObj.name);
        	},
        	onRemoveClick(index){
        		this.formData.parts.splice(index,1);
        	},
        	submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if (!valid) {return false;}
                    this.$refs.upload.submit();
                });
        	},
        	leaveForm(next){
                this.$confirm('您尚未提交，确定离开吗？', '友情提示', {type: 'warning'}).then(() => {
                    next();
                }).catch(()=>{
                    this.$message({
                        message:'已取消'
                    });
                });
            },
            successFn(){
                this.canLeave = true;
                this.$message({
                    message: '模板新增成功',
                    type: 'success'
                });
                this.$router.push('/act/tpl');
            },
            handelChangeFn(file, fileList){
                fileList.length != 0 ? this.formData.cover = true : this.formData.cover = null;
            },
            handleExceed(){
                this.$message.warning(`抱歉，只能上传一张封面，如需修改，请删除后再操作`);
            }
        }
    }

</script>
<style lang="scss">
    @import "src/scss/act/tpl";
</style>