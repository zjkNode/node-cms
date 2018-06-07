<template>
    <div v-popover:registerForm-pop class="regFormWrapper flex-center-v">
        <el-popover ref="registerForm-pop" placement="right" width="400" trigger="click">
           <el-form label-width="90px" :rules = "rules" :model="comData">
            <el-form-item label="组件宽高" >
                    <el-col :span="7">
                        <el-input  v-model="comData.wrap.style.width" placeholder="宽px" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :push="1">
                        <el-input  v-model="comData.wrap.style.height" placeholder="高px" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="6" :push="2">(单位：px)</el-col>
                </el-form-item>
               <el-form-item label="组件背景">
                   <el-col :span="7">
                       <el-input  placeholder="背景（如#000000）" v-model="comData.wrap.style['background-color']" @blur="handleConfigChang"></el-input>
                   </el-col>
                   <el-col :span="17" style="padding-left:10px;">
                        <el-col :span="12">
                            <el-select v-model="bgStyle" placeholder="请选择" @change="handleConfigChang" v-show="!!comData.wrap.style['background-image']" style="padding-right:10px;">
                                <el-option v-for="item in bgStatus.bgImgStyles"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="12">
                            <el-upload action="/api/act/upload"
                                :data="uploadData"
                                :limit="1"
                                :file-list="bgList"
                                accept="image/gif,image/jpeg,image/png"
                                :on-exceed= "handleExceed"
                                :on-remove="handleRemove"
                                :on-success = "handleSuccess"
                                :multiple = "false"
                                :auto-upload="true"
                                list-type="text">
                            <el-button size="small" type="primary">上传</el-button>
                            </el-upload>
                        </el-col>
                   </el-col>
               </el-form-item>
               <el-form-item label="表单样式" >
                    <el-col :span="9">
                        间隙&nbsp;<el-switch v-model="comData.content.space">
                        </el-switch>
                   </el-col>
                   <el-col :span="9" :push="1">
                        圆角&nbsp;<el-switch v-model="comData.content.radius">
                        </el-switch>
                   </el-col>
               </el-form-item>
               <el-form-item label="表单定位" >
                    <el-col :span="6">
                        <el-input  v-model="comData.content.style.width" placeholder="宽px" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="6" :push="1">
                        <el-input  v-model="comData.content.style.height" placeholder="高px" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="6" :push="2">
                        <el-input  v-model="comData.content.style['margin-top']" placeholder="顶px" @blur="handleConfigChang"></el-input>
                    </el-col>
                </el-form-item>
               <el-form-item label="颜色">
                   <el-col :span="6">
                       <el-input  placeholder="边框" v-model = "comData.input.style['border-color']" @blur="handleConfigChang"></el-input>
                   </el-col>
                   <el-col :span="6" :push="1">
                       <el-input  placeholder="图标" v-model = "comData.icon.style.color" @blur="handleConfigChang"></el-input>
                   </el-col>
                   <el-col :span="6" :push="2">
                       <el-input placeholder="验证码" v-model = "comData.btnCode.style.color" @blur="handleConfigChang"></el-input>
                   </el-col>
               </el-form-item>
               <el-form-item label="验证码弹框">
                    <el-select v-model="tempCodeAlert" placeholder="选择弹框" ref="codeAlert">
                       <el-option v-for="item in alertsOptions"
                                  :data-key="item.name"
                                  :key="item.name"
                                  :label="item.desc"
                                  :value="item.name">
                       </el-option>
                   </el-select>
                </el-form-item>
                <el-form-item label="按钮定位" style="margin-bottom:5px;">
                    <el-col :span="10">
                        <el-input 
                        v-model="comData.buttons.space" 
                        :placeholder="(comData.buttons.orientH ? '左右':'上下')+'(px)'" 
                        @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="6" :push="2">
                        <el-switch
                        active-text="水平"
                        v-model="comData.buttons.orientH"></el-switch>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <template v-for="(item, index) in tempBtns">
                        <_rmable_button :ref="'rmableBtn_'+ index" :originData="comData.buttons.items[index]" :index="index" @onRemove="onBtnRemove"></_rmable_button>
                    </template>
                    <el-button type="text" size="small" plain icon="el-icon-circle-plus" @click="addButton" style="margin-left: 10px;">添加</el-button>
                </el-form-item>
           </el-form>
        </el-popover>

        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class="regFormContainer flex-center-v" ref="regFormContainer">
            <div :class="'formContent '+ (comData.content.space ? 'space ': '') + (comData.content.radius ? 'radius' : '') ">
                <p>
                    <i class="icon icon-shouji"></i>
                    <input type="tel" placeholder="请输入手机号码" class="reg_tel"/>
                </p>
                <p>
                    <i class="icon icon-code"></i>
                    <input type="tel" placeholder="请输入验证码" class="reg_code"/>
                    <button class="btn_code">获取验证码</button>
                </p>
            </div>
            <div class="formBottom">
                <ul :class="comData.buttons.orientH ? 'flex' : 'flex-center-v'">
                    <li v-for="item in comData.buttons.items"> 
                        <img class="btn" :src="item.imageUrl || require('./images/button.jpg')" :data-uuid="item.uuid" alt="" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    var util = require('src/js/common/util');
    import _rmable_button from './_rmable_button.vue';
    import { mapGetters } from 'vuex';

    export default {
        name:'forms_reg',
        desc:'注册表单',
        props: ['originData'],
        components:{ _rmable_button },
        computed: mapGetters({
            curBtnRes:'getCurActBtnRes',
            cacheActData: 'getActData',
            btnConfig: 'getActBtnConfig',
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                alertsOptions:[],
                comData:{
                    name:"forms_reg",
                    wrap: {
                        style: {
                            width:'',
                            'background-color':'',
                            'background-image':''
                        }
                    },
                    content:{
                        space:false,
                        radius:true,
                        style:{
                            width:'',
                            height:'',
                        }
                    },
                    input:{
                        style:{
                            'border-color':''
                        }
                    },
                    icon:{
                        style:{
                            color:''
                        }
                    },
                    btnCode:{
                        style:{
                            color:'',
                            'border-color':''
                        },
                        usages:['goAlerts','']
                    },
                    buttons:{
                        orientH:false,
                        space:'10px',
                        items:[]
                    }
                },
                tempCodeAlert:'',
                tempBtns:[],
                bgList:[],
                bgStatus:{
                    bgImgStyles:[{
                        key:'background-repeat',
                        value: 'repeat-x',
                        label: '横向重复'
                    }, {
                        key:'background-repeat',
                        value: 'repeat-y',
                        label: '纵向重复'
                    },{
                        key:'background-size',
                        value: 'cover',
                        label: '覆盖背景'
                    }]
                },
                bgStyle:'',
            }
        },
        watch: {
            btnConfig(val, oldVal){
                // if(!val) return;
                // if(!this.$refs._button) return;
                // let refbtn = this.$refs._button;
                // if(refbtn.uuid == val.uuid){
                //     this.handleBtnChanged(val);
                // }

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
        mounted(){
            this.bindAlertOptions();
            if(this.originData){
                this.comData = this.originData;
                this.tempCodeAlert = this.originData.btnCode.usages[1];
                for (var i = 0; i < this.comData.buttons.items.length; i++) {
                    this.tempBtns.push('');
                }
                let bgImg = this.comData.wrap.style['background-image'];
                if(bgImg){
                    this.bgList.push({ name: bgImg.split('/').pop(), url: bgImg });
                }
                let bgValue = this.comData.wrap.style['background-repeat'] || 
                            this.comData.wrap.style['background-size'];

                for (let i = 0; i < this.bgStatus.bgImgStyles.length; i++) {
                    let item = this.bgStatus.bgImgStyles[i];
                    if(item.value == bgValue){
                        this.bgStyle = item;
                        break;
                    }
                }

                this.$nextTick(()=>{
                    this.handleConfigChang();
                });
            } else {
                this.addButton();
            }
        },
        methods:{
            getData(){
                this.comData.buttons.items = [];
                for(let key in this.$refs){
                    if(key.indexOf('rmableBtn_') > -1){
                        let itemData = this.$refs[key][0].getData();
                        if(this.comData.buttons.orientH){
                            itemData.style['margin'] = '0 '+ this.comData.buttons.space;
                        } else {
                            itemData.style['margin'] = this.comData.buttons.space + ' 0';
                        }
                        this.comData.buttons.items.push(itemData);
                    }
                }
                this.comData.btnCode.usages[1] = this.tempCodeAlert;
                return this.comData;
            },
            bindAlertOptions(){
                let _this = this;
                this.alertsOptions = [];
                for(let i = 0; i < this.cacheActData.parts.length; i++){
                    let item = this.cacheActData.parts[i];
                    if(item.type === 'hidden'){
                        this.alertsOptions.push(item);
                    }
                }
                this.$nextTick(()=>{
                    let $codeAlert = $(this.$refs.codeAlert.$el);
                    $codeAlert.find('.el-select-dropdown__item').hover(function(){
                        _this.$store.dispatch("setCurActBtnRes",$(this).data('key'));
                   }, function(){
                        _this.$store.dispatch("setCurActBtnRes",null);
                   });
                });
            },
            handleBtnChanged(btnConfig){
                let $container = $(this.$refs.regFormContainer),
                $btnItem = $container.find('img[data-uuid='+btnConfig.uuid+']');
                if(!$btnItem){
                    return;
                }
                let w = util.px2rem(btnConfig.style.width),
                    t = util.px2rem(btnConfig.style['margin-top']);

                $btnItem.css({ width:w, 'margin-top': t});
                $btnItem.attr('src', btnConfig.imageUrl || require('./images/button.jpg'));
                this.handelBtnWrapChanged();

            },
            handelBtnWrapChanged(){
                let $container = $(this.$refs.regFormContainer);
                let btnSpace = parseInt(this.comData.buttons.space),
                    btnSpace_rem = util.px2rem(btnSpace);
                this.comData.buttons.space = isNaN(btnSpace) ? '' : btnSpace +'px';
                if(!btnSpace_rem){
                    return;
                }

                let $btns = $container.find('.formBottom img');
                if(this.comData.buttons.orientH){
                    $btns.css({'margin':'0 '+ btnSpace_rem });
                } else {
                    $btns.css({'margin': btnSpace_rem + ' 0' });
                }
            },
            onBtnRemove(){
                let btnUuid = this.$refs['rmableBtn_'+ index][0].uuid;
                for (var i = 0; i < this.comData.buttons.items.length; i++) {
                   let btnItem = this.comData.buttons.items[i];
                   if(btnUuid == btnItem.uuid){
                        this.comData.buttons.items.splice(i,1);
                   }
                }
                delete this.$refs['rmableBtn_'+ index];
            },
            addButton(){
                this.tempBtns.push('');
                this.$nextTick(()=>{
                    let btnItem = this.$refs['rmableBtn_'+ (this.tempBtns.length-1)][0];
                    this.comData.buttons.items.push(btnItem.getData());
                });
            },
            handleConfigChang(){
                let $container = $(this.$refs.regFormContainer);
                let wrap_w = parseInt(this.comData.wrap.style.width),
                    wrap_h = parseInt(this.comData.wrap.style.height),
                    con_w = parseInt(this.comData.content.style.width),
                    con_h = parseInt(this.comData.content.style.height),
                    con_t = parseInt(this.comData.content.style['margin-top']);

                this.comData.wrap.style.width = isNaN(wrap_w) ? '' : wrap_w +'px';
                this.comData.wrap.style.height = isNaN(wrap_h) ? '' : wrap_h +'px';
                this.comData.content.style.width = isNaN(con_w) ? '' : con_w +'px';
                this.comData.content.style.height = isNaN(con_h) ? '' : con_h +'px';
                this.comData.content.style['margin-top'] = isNaN(con_t) ? '' : con_t +'px';
                
                let bgImg = this.comData.wrap.style['background-image'];
                $container.css({
                    height: util.px2rem(wrap_h),
                    width: util.px2rem(wrap_w),
                    'background-color': this.comData.wrap.style['background-color'],
                    'background-image': bgImg ? `url(${bgImg})` : ''
                });
                if(this.bgStyle.key){
                    this.comData.wrap.style[this.bgStyle.key] = this.bgStyle.value;
                    $container.css(this.bgStyle.key, this.bgStyle.value);
                    if(this.bgStyle.key != 'background-size'){
                        $curContainer.css('background-size', 'contain');
                    }
                }

                $container.find('.formContent').css({
                    width: util.px2rem(con_w),
                    height: util.px2rem(con_h),
                    'margin-top':util.px2rem(con_t)
                });

                let borderColor = this.comData.input.style['border-color'];
                this.comData.btnCode.style['border-color'] = borderColor;
                $container.find('p').css({ 'border-color': borderColor });
                $container.find('.icon').css({ color: this.comData.icon.style.color });
                $container.find('.btn_code').css({
                    'border-color': borderColor,
                    color: this.comData.btnCode.style.color
                });
                this.handelBtnWrapChanged();

            },
            handleExceed(files,fileList){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            handleSuccess(response, file, filelist){
                this.comData.wrap.style['background-image'] = response.file.path;
                this.handleConfigChang();
            },
            handleRemove(file, filelist){
                this.comData.wrap.style['background-image'] = '';
                this.handleConfigChang();
                
            }
        }
    }

</script>
<style lang="scss">
    .regFormWrapper{
        min-height: 80px;
        max-width:540px;
        position: relative;
        &:hover .mask{
            display: flex;
        }
    }

    .regFormContainer{
        width: 100%;
        background-size: contain;
        background-repeat:no-repeat;
        .formContent{
            margin: 10px auto;
            width: 90%;
            &.space{
                border:none;
                height: auto;
                p{
                    margin-bottom:20px;
                }
            }
            p{
                border: 1px solid #b2b2b2;
                font-size: 14px;
                margin-top: -1px;
                position: relative;
                background-color:#fff;
            }
            &.radius{
                p:first-child{
                    border-radius:6px 6px 0 0;;
                }
                p:last-child{
                    border-radius: 0 0 6px 6px
                }
                .btn_code{ border-bottom-right-radius: 6px;}
            }
            &.radius.space{
                p{ border-radius:6px; overflow:hidden;}
            }
            input{
                line-height:55px;
                display: inline-block;
                vertical-align: middle;
                color: #333;
                border: none;
                width:75%;
            }
            .btn_code{
                position:absolute;
                right:-1px;top:-1px;
                width:100px;
                line-height:55px;
                border-left:1px solid #b2b2b2;
                background: transparent;
            }
            .icon{
                width: 20%;
                font-size:30px;
                line-height:55px;
            }
        }
        .formBottom{
            margin:10px auto 0;
            width:90%;
            text-align: center;
            .btn{
                max-width: 100%;
                display:inline-block;
            }
        }

    }
    @font-face {font-family: "iconfont";
        src: url('../../../scss/act/registerfont/iconfont.eot?t=1511945462093'); /* IE9*/
        src: url('../../../scss/act/registerfont/iconfont.eot?t=1511945462093#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('data:application/x-font-woff;charset=utf-8;base64,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') format('woff'),
        url('../../../scss/act/registerfont/iconfont.ttf?t=1511945462093') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
        url('../../../scss/act/registerfont/iconfont.svg?t=1511945462093#iconfont') format('svg'); /* iOS 4.1- */
    }

    .icon-shouji:before { content: "\e644"; }
    .icon-code:before {content: "\e624";}
    .icon-ps:before {content: "\e6b2"; }
    .icon{
        font-size: 26px;
        color:#333;
        -webkit-transition: font-size 0.25s ease-out 0s;
        -moz-transition: font-size 0.25s ease-out 0s;
        transition: font-size 0.25s ease-out 0s;
        display: inline-block;
        vertical-align: top;
        width: 60px;
        line-height: 55px;
        text-align: center;

        font-family:"iconfont" !important;
        font-size:16px;
        font-style:normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    .btnContainer img {
        margin:0 auto;
    }
</style>