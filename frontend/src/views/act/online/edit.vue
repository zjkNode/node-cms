<template>
    <div class="act_edit">
        <h2>活动 — 编辑</h2>
        <el-row>
            <el-form label-width="90px" ref="formData" :model="formData" :rules="rules" :show-message="true">
                <el-form-item label="活动名称" prop="name">
                    <el-col :span="8">
                        <el-input v-model="formData.name" placeholder="请输入活动名称"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="活动代码" prop="code">
                    <el-col :span="8">
                        <el-input v-model="formData.code" placeholder="请输入活动代码 (如 act_20)"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="UUID">
                    <el-col :span="8">
                        <el-input v-model="formData.data.activityCode" placeholder="请输入activityCode" :disabled="true"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="设置背景">
                    <el-col :span="8">
                        <el-input v-model="formData.data.style['background-color']" placeholder="背景色（如 #ffffff）" @blur="handleWrapConfig"></el-input>
                    </el-col>
                    <el-col :span="3" style="margin-left:10px;" v-show="formData.data.style['background-image']!=''">
                        <el-select v-model="formData.data.style['background-repeat']" placeholder="请选择" @change="handleWrapConfig">
                            <el-option v-for="item in bgStatus.bgImgStyleOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="4" style="padding-left:10px;">
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :limit="1"
                            :file-list="originBgList"
                            accept="image/gif,image/jpeg,image/png"
                            :on-exceed= "handleBgExceed"
                            :on-remove="handleBgRemove"
                            :on-success = "handleBgSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                        <el-button type="primary">上传背景图</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="模板内容" prop="data">
                    <el-row class="patsCol" id="patsCol">
                        <template v-for="(part, index ) in parts" v-if="allParts[part].type !== 'hidden'">
                            <div v-bind:is="part" :ref="part+'_'+index" :originData="originData[index]"></div> 
                        </template>

                        <template v-for="(part, index ) in parts">
                            <div v-bind:is="part" :ref="part+'_'+index" v-if="allParts[part].type === 'hidden'" :originData="originData[index]" :index='index'></div>
                        </template>
                    </el-row>
                    <ul class="patsCol_hidden">
                        <template v-for="(part, index ) in parts">
                            <li v-if="allParts[part].type === 'hidden'" class="flex-center-v" :class="tempAlertKey == part +'_'+ index ? 'selected' : '' ">
                                {{ allParts[part].desc +'_'+ index }}
                                <div class='masker' @click="showPartsFn(part,index)"></div>
                            </li>
                        </template>
                    </ul>
                </el-form-item>
                <el-form-item style="text-align: center; padding-top:40px;">
                    <el-button @click="giveUp" plain>放弃修改</el-button>
                    <el-button @click="checkJsonFn">查JSON</el-button>
                    <el-button @click="saveDraftsFn">存草稿</el-button>
                    <el-button v-if="domain.name" type="primary" @click="onPublish(domain)">
                        发布到 {{domain.name}}
                    </el-button>
                    <el-dropdown v-else @command="onPublish">
                      <el-button type="primary">
                        去发布<i class="el-icon-arrow-down el-icon--right"></i>
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="item in domains" :command="item">{{item.name}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                </el-form-item>
            </el-form>
        </el-row>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';
    var allParts = require('../parts/index');
    var Util = require("src/js/common/util");

    export default{
        components: allParts,
        computed: mapGetters({
            curBtnRes:'getCurActBtnRes',
            cacheActData: 'getActData',
            uploadData: 'getUploadData'
        }),
        watch: {
            curBtnRes(value, oldValue){
                if(oldValue || this.selectedAlertKey){
                    this.$refs[oldValue || this.selectedAlertKey][0].hide();
                }
                if(value){
                    this.$refs[value][0].show();
                    this.tempAlertKey = value;
                    return;
                }
                if(this.selectedAlertKey){
                    this.tempAlertKey = this.selectedAlertKey;
                    this.$refs[this.selectedAlertKey][0].show();
                    return;
                } 
                this.tempAlertKey = '';
            }
        },
        data(){
            return {
                allParts:allParts,
                parts:[],
                partData:{
                    parts: []
                },
                domain:{},
                domains:[],
                tempAlertKey:'',
                selectedAlertKey:'',
                originBgList:[],
                originData:[],
                formData:{
                    id:'',
                    timeId: '',
                    parts:'',
                    name:'',
                    code:'',
                    data:{
                        style:{
                            "background-color":"",
                            "background-repeat":"",
                            "background-image": ""
                        }
                    }
                },
                rules:{
                    name: [
                        {required:true,message: '请输入活动名称', trigger: 'blur'},
                        { min: 1, max: 49, message: '长度在 1 到 49 个字符', trigger: 'blur' }
                    ],
                    code: [
                        {required:true,message: '请输入活动代码', trigger: 'change'},
                        { min: 1, max: 49, message: '长度在 1 到 49 个字符', trigger: 'blur' }
                    ],
                    data: [
                        {required:true,message: '请输入填充模板内容'},
                    ]
                },
                bgStatus:{
                    show: false,
                    bgImgStyleOptions:[{
                        value: 'no-repeat',
                        label: '适合于屏幕'
                        }, {
                        value: 'repeat-x',
                        label: '横向重复排列'
                        }, {
                        value: 'repeat-y',
                        label: '纵向重复排列'
                    }]
                },
                canLeave: false,
                tplContent: false
            }
        },
        beforeRouteLeave(to, from, next){
            if(!this.canLeave){
                this.leaveForm(next);
                return;
            }
            next();
        },
        mounted(){
            this.getTplData();
            this.getDomains();
            this.$nextTick(()=>{
                this.handleWrapConfig();
            });
        },
        methods:{
            showPartsFn(name,index){
                let curAlertKey = name +'_'+ index;
                if(!curAlertKey){
                    return;
                }
                if(!this.selectedAlertKey){
                    this.tempAlertKey = this.selectedAlertKey = curAlertKey;
                    
                    this.$refs[this.selectedAlertKey][0].show();
                    return;
                }

                if(curAlertKey != this.selectedAlertKey){
                    this.$refs[this.selectedAlertKey][0].hide();
                    this.tempAlertKey = this.selectedAlertKey = curAlertKey;
                    this.$refs[this.selectedAlertKey][0].show();
                    return;
                }
                this.$refs[this.selectedAlertKey][0].hide();
                this.tempAlertKey = this.selectedAlertKey =  '';
            },
            getTplData(){
                let id = Util.getQueryParams("id"),
                    url = '/api/act/'+id;
                this.$http.get(url).then((rs)=>{
                    if(rs.body.code != 'SUCCESS'){
                        return;
                    }
                    let resData = rs.body.data;
                    let styleData = JSON.parse(resData.data);
                    this.formData = resData;
                    this.formData.data = styleData;

                    let originBg = styleData.style['background-image'];//渲染编辑背景
                    if(originBg){
                        let fileName = originBg.split('/').pop();
                        let fileList = { name:fileName, url: originBg};
                        this.originBgList.push(fileList);
                    }
                    if(resData.parts){
                        this.parts = resData.parts.split(",");
                        this.sendOriginData();
                    }
                    this.handleWrapConfig();
                    this.$store.dispatch('setUploadData',{ timeId: resData.timeId });

                    this.$nextTick(() => {
                        this.bindPublishDomain();
                    });
                },(err)=>{
                    console.log(err);
                });
            },
            getDomains(){
                let url = '/api/act/config/lists';
                this.$http.get(url).then((rs)=>{
                    if(rs.body.code != 'SUCCESS'){
                        return;
                    }
                    this.domains = rs.body.data;
                    this.$nextTick(() => {
                        this.bindPublishDomain();
                    });
                },(err)=>{
                    console.log(err);
                });
            },
            bindPublishDomain(){
                if(this.domains && this.domains.length > 0 && this.formData.oss_code){
                    for (var i = 0; i < this.domains.length; i++) {
                       if( this.domains[i].oss_code == this.formData.oss_code){
                            this.domain = this.domains[i];
                            break;
                       }
                    }
                }
            },
            sendOriginData(){//向子组件传入数据
                this.originData = [];
                let tmpActData = {
                    parts:[]
                };
                for(let i = 0; i< this.parts.length; i++){
                    let itemPart = this.allParts[this.parts[i]];
                    this.originData.push(this.formData.data.components[i]);
                    tmpActData.parts.push( {
                            name:itemPart.name +'_'+ i, 
                            desc: itemPart.desc +'_'+ i, 
                            type: itemPart.type 
                        });
                }
                this.$store.dispatch("setActData",tmpActData);

            },
            onPublish(command){
                let url = '/api/act/publish';
                this.addPartsData();
                this.formData.configId = command.id;
                this.$refs.formData.validate((valid) => {
                    if (!valid) {return false;}
                    if(!this.tplContent){
                        this.$message.error('请填充模板内容');
                        return;
                    }
                    this.$http.post(url,JSON.stringify(this.formData)).then((rs)=>{
                        if(rs.body.code === 'SUCCESS'){
                            this.$router.push({
                                path:'/act/lists'
                            });
                        }
                    },(err)=>{
                        console.log(err);
                    });
                });
            },
            // onPreview(){
            //     this.addPartsData();
            //     let timeId = this.formData.timeId;
            //     let tplData = encodeURIComponent(JSON.stringify(this.formData.data));
            //     window.open(`/preview/act?timeId=${timeId}&tplData=${tplData}`, '_blank');
            // },
            saveDraftsFn(){
                let url="/api/act/draft";
                this.addPartsData();
                this.tplContent =  true;//不校验图片是否上传
                if(this.formData.name.length>50 || this.formData.code.length>50){
                    this.$message.error('请将内容控制在50个字符以内哦~');
                    return;
                };
                this.$http.post(url,JSON.stringify(this.formData)).then((rs)=>{
                    if(rs.body.code === 'SUCCESS'){
                        this.$router.push({
                            path:'/act/lists'
                        });
                    }
                },(err)=>{
                    console.log(err);
                });
            },
            checkJsonFn(){
                this.addPartsData();
                console.log(JSON.stringify(this.formData.data))
            },
            giveUp(){
                this.canLeave = true;
                this.$confirm('您将会丢掉的所有修改的数据，确定放弃吗？', '友情提示', {type: 'warning'}).then(() => {
                    this.$router.push({
                        path:'/act/lists'
                    });
                }).catch(()=>{
                    this.$message({
                        message:'已取消'
                    });
                });
                
            },
            addPartsData(){
                this.canLeave = true;
                this.formData.data.components = [];
                this.formData.data.title = this.formData.name || '简单借款';
                this.formData.data.code = this.formData.code;
                for(var i = 0; i< this.parts.length; i++){
                    var part = this.parts[i];
                    let part_index = part+'_'+i;
                    this.formData.data.components.push ( this.$refs[part_index][0].getData() );
                    this.$refs[part_index][0].getData().image_path && this.$refs[part_index][0].getData().image_path.length == 0 ? this.tplContent = false : this.tplContent = true;
                };
            },
            
            handleBgExceed(files,fileList){
                this.$message.warning(`抱歉，只能上传一张背景图，如需修改，请删除后再操作`);
            },
            handleBgRemove(file,filelist){
                this.formData.data.style['background-image'] = "";
                this.handleWrapConfig();
            },
            handleBgSuccess(response,file,filelist){
                this.formData.data.style['background-image'] = response.file.path;
                this.handleWrapConfig();
            },
            handleWrapConfig(){
                let $wrap = $('#patsCol');
                let bgImg = this.formData.data.style['background-image'],
                    bgColor = this.formData.data.style['background-color'];
                bgImg = bgImg ? bgImg : (bgColor ? '' : require('src/img/act_bg.jpg'));
                $wrap.css({
                    'background-image': bgImg ? `url(${bgImg})` : '',
                    'background-color': this.formData.data.style['background-color'] || '',
                    'background-repeat': this.formData.data.style['background-image'] ? this.formData.data.style['background-repeat'] : '',
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
            }
        }
    }
</script>
<style lang="scss">
    @import "src/scss/act/online";
</style>