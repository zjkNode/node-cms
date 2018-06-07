<template>
	<div v-popover:button-pop class="btnWrapper flex-center-v">
        <el-popover ref="button-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="组件高度">
                    <el-col :span="14">
                        <el-input v-model="comData.wrap.style['height']" placeholder="组件高度（如100px）" @blur="handleWrapConfig"></el-input>
                    </el-col>
                    <el-col :span="6" :push="1">(单位：px)</el-col>
                </el-form-item>
                <el-form-item label="组件背景">
                    <el-col :span="14">
                        <el-input v-model="comData.wrap.style['background-color']" placeholder="背景色（如 #ffffff）" @blur="handleWrapConfig"></el-input>
                    </el-col>
                     <el-col :span="10" style="padding-left:10px;">
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :file-list="bgList"
                            :limit="1"
                            accept="image/jpeg,image/png"
                            :on-exceed= "handleExceed"
                            :on-remove="handleBgRemove"
                            :on-success = "handleBgSuccess"
                            :on-change = "handleBgChange"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                        <el-button type="primary" size="small">上传背景图</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="按钮定位" style="margin-bottom:5px;">
                    <el-col :span="10">
                        <el-input 
                        v-model="comData.buttons.space" 
                        :placeholder="(comData.buttons.orientH ? '左右':'上下')+'(px)'" 
                        @blur="handleWrapConfig"></el-input>
                    </el-col>
                    <el-col :span="6" :push="2">
                        <el-switch
                        active-text="水平"
                        v-model="comData.buttons.orientH"></el-switch>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <template v-for="(item, index) in tempBtns">
                        <_rmable_button :ref="'rmableBtn_'+ index" :originData="comData.buttons.items[index]" :index="index" @onRemove="onBtnRemove(index)"></_rmable_button>
                    </template>
                    <el-button type="text" size="small" plain icon="el-icon-circle-plus" @click="addButton" style="margin-left: 10px;">添加</el-button>
                </el-form-item>
            </el-form>
        </el-popover>
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>
        <div  class="btnContainer flex-center-v" ref="btnContainer">
            <ul :class="comData.buttons.orientH ? 'flex' : 'flex-center-v'">
                <li v-for="item in comData.buttons.items">
                    <img :src="item.imageUrl || require('./images/button.jpg')" :data-uuid="item.uuid" alt="" />
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    require("src/js/common/flexible");
    var util = require('src/js/common/util');
    import _rmable_button from "./_rmable_button.vue"
    import { mapGetters } from 'vuex';

    export default {
        name:'buttons',
        desc:'按钮组件',
        props: ['originData'], //'uploadData',
        components:{ _rmable_button },
        computed: mapGetters({
            curBtnRes:'getCurActBtnRes',
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
                        // 匹配当前更新的button组件， 更新对应页面样式
                        this.handleBtnChanged(val);
                        break;
                    }
                }
            }
        },
        data(){
            return {
                comData:{
                    name:"buttons",
                    buttons:{
                        orientH:false,
                        space:'20px',
                        items:[]
                    },
                    wrap:{
                        style: {
                            height: '',
                            'background-image': '',
                            'background-color': ''
                        }
                    }
                },
                tempBtns:[],
                bgList:[]
            }
            
        },
        mounted(){
            if(this.originData){
                this.tempBtns = [];
                this.comData = this.originData;
                let bgImg = this.originData.wrap.style['background-image'];
                if(bgImg){
                    this.bgList.push({ name:bgImg.split('/').pop(), url: bgImg});
                }
                for (var i = 0; i < this.comData.buttons.items.length; i++) {
                    this.tempBtns.push('');
                }

                this.$nextTick(()=>{
                    this.handleWrapConfig();
                    
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
                return this.comData;
            },
            handleBtnChanged(btnConfig){
                let w_rem = util.px2rem(btnConfig.style.width),
                    // h_rem = util.px2rem(btnConfig.style.height),
                    t_rem = util.px2rem(btnConfig.style['margin-top']),
                    $curContainer = $(this.$refs.btnContainer);

                // let max_height = h_rem || this.comData.wrap.style.height;
                // $curContainer.find('img[data-uuid='+ btnConfig.uuid +']').css({ width:w_rem, height: h_rem, 'max-height': max_height});
                $curContainer.find('img[data-uuid='+ btnConfig.uuid +']').css({ width:w_rem, 'margin-top': t_rem});
                this.handelBtnWrapChanged();
            },
            handelBtnWrapChanged(){
                let btnSpace = parseInt(this.comData.buttons.space),
                    btnSpace_rem = util.px2rem(btnSpace),
                    $curContainer = $(this.$refs.btnContainer);

                this.comData.buttons.space = isNaN(btnSpace) ? '' : btnSpace +'px';
                
                if(!btnSpace_rem){
                    return;
                }
                let $btns = $curContainer.find('img');
                if(this.comData.buttons.orientH){
                    $btns.css({'margin':'0 '+ btnSpace_rem });
                } else {
                    $btns.css({'margin': btnSpace_rem + ' 0' });
                }
            },
            handleWrapConfig(){
                let h_px = parseInt(this.comData.wrap.style.height),
                    h_rem = util.px2rem(h_px),
                    $curContainer = $(this.$refs.btnContainer);

                this.comData.wrap.style.height = isNaN(h_px) ? '' : h_px +'px';
                let bgImg = this.comData.wrap.style['background-image'],
                    bgColor = this.comData.wrap.style['background-color'];
                $curContainer.css({
                    height: h_rem,
                    'background-image': bgImg ? `url(${bgImg})` : '',
                    'background-color': bgColor
                });
                this.handelBtnWrapChanged();
            },
            handleBgSuccess(response,file,filelist){
                this.comData.wrap.style['background-image'] = response.file.path;
                this.handleWrapConfig();
            },
            handleBgRemove(file,filelist){
                this.comData.wrap.style['background-image'] = '';
                this.handleWrapConfig();
            },
            addButton(){
                this.tempBtns.push('');
                this.$nextTick(()=>{
                    // 为了在页面中插入一张带有uuid属性的图片
                    let btnItem = this.$refs['rmableBtn_'+ (this.tempBtns.length-1)][0];
                    this.comData.buttons.items.push(btnItem.getData());
                });
                
            },
            onBtnRemove(index){
                let btnUuid = this.$refs['rmableBtn_'+ index][0].uuid;
                for (var i = 0; i < this.comData.buttons.items.length; i++) {
                   let btnItem = this.comData.buttons.items[i];
                   if(btnUuid == btnItem.uuid){
                        this.comData.buttons.items.splice(i,1);
                        let $curContainer = $(this.$refs.btnContainer);
                        $curContainer.find('img[data-uuid='+ btnUuid +']').remove();
                   }
                }
                delete this.$refs['rmableBtn_'+ index];
            },
        }
    }

</script>
<style lang="scss">
    .btnWrapper{
        max-width:540px;
        position: relative;
        &:hover .mask{
            display: flex;
        }
        .wrap_edit{
            position:absolute;
            top:0;right:0;left:0;bottom:0;
            align-items: center;
        }
        .descBtn{
            position:absolute;
        }
    }
    .mask{
        background: rgba(0, 0, 0, 0.6);
        position: absolute;
        top:0;
        left:0;
        display: none;
    }
    .btnContainer{
        height:80px;
        background-size:contain;
        overflow:hidden;
        img{
            display:inline-block;
            margin:0 auto;
        }
        ul{
            list-style:none;
        }
        li{
            flex:1;
            float:left;
            text-align:center;
            line-height:0;
        }
    }
</style>
