<template>
    <div class="alertsWrapper flex-center-v" v-show="wrapShow">
        <div class="mask"></div>

        <el-popover ref="shares-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="弹框宽高" >
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style['width']" placeholder="宽" @blur="handleWrapChanged"></el-input>
                    </el-col>
                    <el-col :span="7" :push="1">
                        <el-input v-model="comData.wrap.style['height']" placeholder="高" @blur="handleWrapChanged"></el-input>
                    </el-col>
                    <el-col :span="6" :push="2">(单位：px)</el-col>
                </el-form-item>
                <el-form-item label="弹框背景">
                    <el-row>
                        <el-col :span="15">
                            <el-input v-model="comData.wrap.style['background-color']" placeholder="色值（以#开头）" @blur="handleWrapChanged"></el-input>
                        </el-col>
                        <!-- <el-col :span="6">
                            <el-checkbox v-model="bgStatus.radius" @change="handleWrapChanged">需要圆角</el-checkbox>
                        </el-col> -->
                    </el-row>
                    <el-row style="margin-top: 10px;">
                        <el-col :span="12">
                            <el-select v-model="comData.wrap.style['background-repeat']" placeholder="请选择" @change="handleWrapConfig" v-show="bgStatus.show" style="padding-right:10px;">
                                <el-option v-for="item in bgStatus.bgImgStyleOptions"
                                           :key="item.value"
                                           :label="item.label"
                                           :value="item.value">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="12">
                            <el-upload action="/api/act/upload"
                                       :data="uploadData"
                                       :limit="1"
                                       :file-list="bgList"
                                       accept="image/gif,image/jpeg,image/png"
                                       :on-exceed= "handleBgExceed"
                                       :on-remove="handleBgRemove"
                                       :on-success = "handleBgSuccess"
                                       :multiple = "false"
                                       :auto-upload="true"
                                       list-type="text">
                                <el-button size="small" type="primary">上传背景图</el-button>
                            </el-upload>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="弹框圆角">
                    <el-col :span="24">
                        <el-switch
                                v-model="bgStatus.radius"
                                @change="handleWrapChanged"
                                active-color="#13ce66"
                                active-text="ON">
                        </el-switch>
                        <!-- <el-checkbox v-model="bgStatus.radius" @change="handleWrapChanged">需要圆角</el-checkbox> -->
                    </el-col>
                </el-form-item>
                <el-form-item label="弹框头图">
                    <el-col :span="18">
                    <el-upload action="/api/act/upload"
                    :data="uploadData"
                    :file-list="contentFileList"
                    :on-remove="handleRemove"
                    :on-success = "handleSuccess"
                    :auto-upload="true"
                    accept="image/jpeg,image/png"
                    :multiple = "false"
                    list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过200kb</div>
                    </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="弹框文本">
                    <el-col :span="15">
                        <el-input v-model="comData.txt" placeholder="请填写想输入的文本" @blur="handletxtChanged"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="弹框按钮" style="margin-bottom:5px;">
                    <el-button type="text" size="small" plain icon="el-icon-circle-plus" @click="addButton" style="margin-left: 10px;">添加按钮</el-button>
                </el-form-item>
                <el-form-item>
                    <template v-for="(item, index) in tempBtns">
                        <_rmable_button :ref="'rmableBtn_'+ index" :originData="comData.buttons[index]" :index="index" @onRemove="onBtnRemove"></_rmable_button>
                    </template>
                </el-form-item>
            </el-form>
        </el-popover>

        <div class="alertsContainer" v-show="containerShow" ref="alertsContainer">
            <div class="alert-content">
                <template v-for="item in comData.contents.image_path">
                    <img :src="item" alt="" class="iconContent"/>
                </template>
                <p class="codeCaption" ref = "codeCaption"></p>
                <p class="imgCodeInput">
                    <el-col class="codeInput" :span="22">
                        <el-input ></el-input>
                    </el-col>
                    <img src="" />
                </p>
            </div>
            <div class="alert-bottom flex">
                <template v-for="item in comData.buttons">
                    <img :src="item.imageUrl" :data-uuid="item.uuid" alt="" />
                </template>

            </div>
        </div>

        <div class="showPop flex-center-v" v-popover:shares-pop>
            <el-button icon="el-icon-plus" v-if="!containerShow">添加验证码弹框</el-button>
            <div class="mask" v-else>
                <el-button  icon="el-icon-edit-outline">修改弹框</el-button>
            </div>
        </div>
    </div>
</template>
<script>
    require("src/js/common/flexible");
    var util = require('src/js/common/util');
    import _button from './_button.vue';
    import _rmable_button from './_rmable_button.vue';
    import { mapGetters } from 'vuex';

    export default {
        name:'imgcode',
        desc:'验证码弹框',
        type:'hidden',
        props: ['originData'], //'uploadData',
        components:{ _button, _rmable_button },
        computed: mapGetters({
            cacheActData: 'getActData',
            btnConfig: 'getActBtnConfig',
            uploadData: 'getUploadData'
        }),
        watch: {
            btnConfig(val, oldVal){
                if(!val) return;
                for(let key in this.$refs){
                    if(key.indexOf('rmableBtn_') == -1){
                        continue;
                    }
                    let refPart = this.$refs[key][0];
                    if(refPart.uuid == val.uuid){
                        this.handleBtnChanged(val);
                        break;
                    }
                }
            }
        },
        data(){
            return {
                containerShow: false,
                wrapShow: false,
                comData:{
                    name:"imgcode",
                    wrap:{
                        style: {
                            width: '',
                            height: '',
                            'background-color':'',
                            'background-image': '',
                            'background-repeat':'',
                            'border-radius':''
                        }
                    },
                    contents:{
                        image_path:[],
                        txt:''
                    },
                    buttons:[]
                },
                tempBtns:[],
                bgList:[],
                contentFileList:[],
                bgStatus:{
                    show: false,
                    radius: false,
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
                }
            }

        },
        mounted(){
            let _this = this;
            if(this.originData){
                this.tempBtns = [];

                this.comData = this.originData;
                for (var i = 0; i < this.comData.contents.image_path.length; i++) {
                    let imgUrl = this.comData.contents.image_path[i];
                    this.contentFileList.push({
                        name: imgUrl.split('/').pop(),
                        url: imgUrl
                    });
                }
                let bgImg = this.comData.wrap.style['background-image'];
                if(bgImg){
                    this.bgList.push({
                        name: bgImg.split('/').pop(),
                        url: bgImg
                    });
                }

                for (let i = 0; i < this.originData.buttons.length; i++) {
                    this.tempBtns.push('');
                }

                this.$nextTick(()=>{
                    this.handleWrapChanged();
            });
            };
        },
        methods:{
            getData(){
                this.comData.buttons = [];
                for(let key in this.$refs){
                    if(key.indexOf('rmableBtn_') > -1){
                        this.comData.buttons.push(this.$refs[key][0].getData());
                    }
                }

                return this.comData;
            },
            show(){
                this.containerShowFn();
                this.wrapShow = true;
            },
            hide(){
                this.wrapShow = false;
            },
            containerShowFn(){
                for(let i in this.comData.wrap.style){
                    if(this.comData.wrap.style[i] !== ''){
                        this.containerShow = true;
                        break;
                    }
                    this.containerShow = false;
                }
            },
            handletxtChanged(){
                var txt = this.comData.txt;
                this.$refs.codeCaption.innerHTML = txt;
            },
            handleWrapChanged(){
                this.containerShowFn();
                let $container = $(this.$refs.alertsContainer);
                let w = parseInt(this.comData.wrap.style.width),
                        h = parseInt(this.comData.wrap.style.height),
                        w_rem = util.px2rem(w),
                        h_rem = util.px2rem(h);
                this.comData.wrap.style.width = isNaN(w) ? '' : w +'px';
                this.comData.wrap.style.height = isNaN(h) ? '' : h +'px';
                let bgImg = this.comData.wrap.style['background-image'];
                this.bgStatus.show = !!bgImg;
                $container.find('.iconContent').css({'max-height': h_rem});
                $container.css({
                    height: h_rem,
                    width: w_rem,
                    'background-color': this.comData.wrap.style['background-color'],
                    'background-image': bgImg ? `url(${bgImg})` : '',
                    'background-repeat': this.comData.wrap.style['background-repeat'],
                    'border-radius': this.bgStatus.radius ? '4px':''
                });

            },
            handleWrapConfig(){
                let $wrap = $(this.$refs.alertsContainer);
                let bgImg = this.comData.wrap.style['background-image'];
                this.bgStatus.show = !!bgImg;
                $wrap.css({
                    'background-color': this.comData.wrap.style['background-color'] || '',
                    'background-image': bgImg ? `url(${bgImg})`: '',
                    'background-repeat': this.comData.wrap.style['background-repeat'] || '',
                });
            },
            onBtnRemove(index){
                let btnUuid = this.$refs['rmableBtn_'+ index][0].uuid;
                for (var i = 0; i < this.comData.buttons.length; i++) {
                    let btnItem = this.comData.buttons[i];
                    if(btnUuid == btnItem.uuid){
                        this.comData.buttons.splice(i,1);
                    }
                }
                delete this.$refs['rmableBtn_'+ index];
            },
            addButton(){
                this.tempBtns.push('');
                this.$nextTick(()=>{
                    let btnItem = this.$refs['rmableBtn_'+ (this.tempBtns.length-1)][0];
                this.comData.buttons.push(btnItem.getData());
            });

            },
            handleBtnChanged(btnConfig){
                this.containerShow = true;
                let $container = $(this.$refs.alertsContainer),
                    $btnItem = $container.find('img[data-uuid='+btnConfig.uuid+']');
                if(!$btnItem){
                    return;
                }
                let w = util.px2rem(btnConfig.style.width),
                    t = util.px2rem(btnConfig.style['margin-top']);
                $btnItem.css({ width:w, 'margin-top': t});
            },
            handleBgSuccess(response,file,filelist){
                this.comData.wrap.style['background-image'] = response.file.path;
                this.handleWrapChanged();
            },
            handleBgRemove(file,filelist){
                this.comData.wrap.style['background-image'] = "";
                this.comData.wrap.style['background-repeat'] = "";
                this.handleWrapChanged();
            },
            handleBgExceed(files,fileList){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            handleSuccess(response, file, filelist){
                this.comData.contents.image_path.push(response.file.path)
            },
            handleRemove(file, filelist){
                this.comData.contents.image_path = this.comData.contents.image_path.filter(function(item){
                    if(file.response){
                        return item != file.response.file.path;
                    }else{
                        return item != file.url;
                    }
                });
            }
        }
    }

</script>
<style lang="scss">
    @import 'src/scss/base';

    .alertsWrapper{
        position:absolute;
        left:0; right:0; bottom:0;top:0;
        background-color:rgba(0,0,0,0.8);

    }
    .altBtn{
        position:relative;
    .el-icon-circle-close{
        position:absolute;
        top:-5px;right:-5px;
        z-index:1;
    }
    }
    .showPop{
        min-height: 80px;
        top:0;left:0;right:0; bottom: 0;
        overflow: hidden;
        position:absolute;
    &:hover .mask{
         display: flex;
     }
    }
    .mask{
        overflow: hidden;
        background: rgba(0, 0, 0, 0.7);
        position: absolute;
        top:0;left:0;right:0; bottom: 0;
        z-index:99;
        display: none;
    }
    .alertsContainer{
        margin:0 auto;
        color: #ffffff;
        background-size: contain;
    .alert-content{
        overflow-y:scroll;
        overflow-x:hidden;
        min-height: 2rem;
    .iconContent {
        display: block;
        width: 100%;
        height: auto;
        margin:0 auto;
    }
    }
    .alert-bottom{
        min-height:2rem;
    img{
        margin:0 auto;
    }
    }
    }
    .codeInput{
        margin: 0 auto;
        float: none;
    }
    .codeCaption {
        font-size: 12px;
        color: #000;
        text-align: center;
    }
    .imgCodeInput {
        position: relative;
    }
    .imgCodeInput img {
        position: absolute;
        right: 0;
        top: 0;
        width:40%;
        height:40px;
    }
</style>
