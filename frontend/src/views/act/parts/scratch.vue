<template>
	<div v-popover:scratch-pop class="scratchWrapper">
        <el-popover ref="scratch-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px" class="scratchForm">
                <el-form-item label="组件背景">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style['background-color']" placeholder="背景色" @blur="handleConfigChang"></el-input>
                    </el-col>
                     <el-col :span="16" :offset="1">
                        <el-col :span="12">
                            <el-select v-model="bgStyle" placeholder="请选择" @change="handleConfigChang" v-show="comData.wrap.style['background-image']" style="padding-right:10px;">
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
                                :file-list="bgList"
                                :limit="1"
                                accept="image/jpeg,image/png"
                                :on-exceed= "handleExceed"
                                :on-remove="handleBgRemove"
                                :on-success = "handleBgSuccess"
                                :multiple = "false"
                                :auto-upload="true"
                                list-type="text">
                                <el-button type="primary" size="small">上传背景图</el-button>
                            </el-upload>
                        </el-col>
                    </el-col>
                </el-form-item>
                <el-form-item label="内容蒙层">
                    <el-upload action="/api/act/upload"
                        :data="uploadData"
                        :file-list="maskBgList"
                        :limit="1"
                        accept="image/jpeg,image/png"
                        :on-exceed= "handleExceed"
                        :on-remove="handleMaskRemove"
                        :on-success = "handleMaskSuccess"
                        :multiple = "false"
                        :auto-upload="true"
                        list-type="text">
                        <el-button type="primary" size="small">上传蒙层图</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="内容背景">
                    <el-col :span="7">
                        <el-input v-model="comData.box.style['margin-top']" placeholder="外顶距" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.box.style['padding-top']" placeholder="内顶距" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-upload action="/api/act/upload"
                                :data="uploadData"
                                :file-list="boxBgList"
                                :limit="1"
                                accept="image/jpeg,image/png"
                                :on-exceed= "handleExceed"
                                :on-remove="handleBoxRemove"
                                :on-success = "handleBoxSuccess"
                                :multiple = "false"
                                :auto-upload="true"
                                list-type="text">
                                <el-button type="primary" size="small">上传背景图</el-button>
                            </el-upload>
                    </el-col>
                </el-form-item>
                
                <el-form-item label="奖品列表">
                    <el-switch v-model="showPrizes" @change="onPrizeChange"> </el-switch>
                    <el-button v-if="showPrizes" type="text" size="small" plain icon="el-icon-circle-plus" style="margin-left: 10px;" @click="addPrize">添加</el-button>
                </el-form-item>
                <el-row v-if="showPrizes">
                    <el-col class='pcard' :span="7" v-for="(item, index) in tmpPrizes" :key="item.id" :offset="1">
                        <el-card :body-style="{ 'padding': '0px', position:'relative' }" >
                            <div class="ptag" @click="onPrizeClick(item)" @mouseover="onPrizeOver($event,item)">
                                <el-row>
                                    <el-col :span="10">
                                        <el-upload
                                          action="/api/act/upload"
                                          :data="uploadData"
                                          :show-file-list="false"
                                          :on-success="handlePrizeSuccess">
                                          <div class='img' v-if="item.img" :style="'background-image:url('+item.img+')'"></div>
                                          <i v-else class="el-icon-plus pcard-icon"></i>
                                        </el-upload>
                                    </el-col>
                                    <el-col :span="10" :offset="2">
                                        <el-button type="text" size="mini" disabled>奖品Id</el-button>
                                        <el-input size="mini" placeholder="id" v-model="item.id"></el-input> 
                                    </el-col>
                                </el-row>
                                <el-select size="mini" placeholder="选择弹框" v-model="item.alert">
                                   <el-option v-for="opt in alertsOptions"
                                              :data-key="opt.name"
                                              :key="opt.name"
                                              :label="opt.desc"
                                              :value="opt.name">
                                   </el-option>
                                </el-select>
                                <_rmable_button :ref="'rmableBtn_'+ index" :originData="item.button" ></_rmable_button>

                            </div>
                            <i class="el-icon-circle-close" @click="removePrize(index)"></i>
                        </el-card>

                    </el-col>
                    
                </el-row>
            </el-form>
        </el-popover>
        
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class='scratchContainer' ref='scratchContainer'>
            <div class="sbox">
                <img class='smask' :src="comData.mask.img || require('./images/mask_ggl.png')"  :style="'z-index:'+ (curPrize.img ? 0 : 1)"/>
                <div v-if="curPrize.img" class="sprize" :style="'background-image:'+ (curPrize.img ? 'url('+ curPrize.img +')' : '')">
                    <img v-if="curPrize.button" :src="curPrize.button.imageUrl || require('./images/button.jpg')" :data-uuid="curPrize.button.uuid" alt=""/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    var util = require('src/js/common/util');
    import { mapGetters } from 'vuex';
    import _rmable_button from './_rmable_button.vue';
     export default {
        name:'scratch',
        desc:'刮刮乐',
        props: ['originData'], //'uploadData',
        components:{ _rmable_button },
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
                        this.curPrize.button = val;
                        let midPrize = this.curPrize;
                        this.curPrize = null;
                        this.curPrize = midPrize;
                        this.$nextTick(()=>{
                            this.handleBtnChanged(val);
                        });
                        break;
                    }
                }
            }
        },
        data(){
            return {
                comData:{
                    name:"scratch",
                    wrap:{
                        style: {
                            height: '',
                            'background-image': '',
                            'background-color': ''
                        }
                    },
                    box:{
                        style:{
                            'background-image': '',
                            'margin-top':'',
                            'padding-top':''
                        }
                    },
                    content:{
                        style:{
                            width:'',
                            height:'',
                        }
                    },
                    mask:{
                        style:{
                            width:'',
                            height:''
                        },
                        img:''
                    },
                    prizes:[],
                    buttons:{
                        items:[]
                    }
                },
                tmpPrizes:[],
                bgList:[],
                boxBgList:[],
                maskBgList:[],
                bgStyle:'',
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
                showPrizes:false,
                curPrize:{},
            }
            
        },
        mounted(){
            if(this.originData){
                this.comData = this.originData;
                for (let i = 0; i < this.comData.prizes.length; i++) {
                    let prize = this.comData.prizes[i];
                    prize.button = this.comData.buttons.items[i];
                    this.tmpPrizes.push(prize);
                }
                let wrapBgImg = this.comData.wrap.style['background-image'],
                    boxBgImg = this.comData.box.style['background-image'],
                    maskBgImg = this.comData.mask.img;
                this.comData.mask.img = maskBgImg;
                if(wrapBgImg){
                    this.bgList.push({ name: wrapBgImg.split('/').pop(), url: wrapBgImg });
                }
                if(maskBgImg){
                    this.maskBgList.push({ name: maskBgImg.split('/').pop(), url: maskBgImg });
                }
                if(boxBgImg){
                    this.boxBgList.push({ name: boxBgImg.split('/').pop(), url: boxBgImg })
                }

                // let bgValue = this.comData.wrap.style['background-repeat'] || 
                //             this.comData.wrap.style['background-size'];
                // let bgConValue = this.comData.content.style['background-repeat'] || 
                //             this.comData.content.style['background-size'];

                // for (let i = 0; i < this.bgStatus.bgImgStyles.length; i++) {
                //     let item = this.bgStatus.bgImgStyles[i];
                //     if(item.value == bgValue){
                //         this.bgStyle = item;
                //     }
                //     if(item.value == bgConValue){
                //         this.conBgStyle = item;
                //     }
                // }

                this.$nextTick(() => {
                    this.handleConfigChang();
                });
            } else {
                this.addPrize();
            }
        },
        methods:{
            getData(){
                // this.comData.prizes = this.tmpPrizes;
                this.comData.buttons = { items:[] };
                this.comData.prizes = [];
                for (var i = 0; i < this.tmpPrizes.length; i++) {
                   let prize = this.tmpPrizes[i];
                   this.comData.prizes.push({ id: prize.id, img: prize.img, alert: prize.alert });
                   this.comData.buttons.items.push(prize.button);
                }
                return this.comData;
            },
            handleConfigChang(){
                let wh_px = parseInt(this.comData.wrap.style['min-height']),
                    bh_px = parseInt(this.comData.box.style.height),
                    bw_px = parseInt(this.comData.box.style.width),
                    bmt_px = parseInt(this.comData.box.style['margin-top']),
                    bpt_px = parseInt(this.comData.box.style['padding-top']),
                    ch_px = parseInt(this.comData.content.style.height),
                    cw_px = parseInt(this.comData.content.style.width),
                    wh_rem = util.px2rem(wh_px),
                    bh_rem = util.px2rem(bh_px),
                    bw_rem = util.px2rem(bw_px),
                    bmt_rem = util.px2rem(bmt_px),
                    bpt_rem = util.px2rem(bpt_px),
                    ch_rem = util.px2rem(ch_px),
                    cw_rem = util.px2rem(cw_px),
                    $curContainer = $(this.$refs.scratchContainer);

                this.comData.wrap.style['min-height'] = isNaN(wh_px) ? '' : wh_px +'px';
                this.comData.box.style.height = isNaN(bh_px) ? '' : bh_px +'px';
                this.comData.box.style.width = isNaN(bw_px) ? '' : bw_px +'px';
                this.comData.box.style['margin-top'] = isNaN(bmt_px) ? '' : bmt_px +'px';
                this.comData.box.style['padding-top'] = isNaN(bpt_px) ? '' : bpt_px +'px';
               
                this.comData.content.style.height = isNaN(ch_px) ? '' : ch_px +'px';
                this.comData.content.style.width = isNaN(cw_px) ? '' : cw_px +'px';
                
                this.comData.mask.style.height = isNaN(ch_px) ? '' : ch_px +'px';
                this.comData.mask.style.width = isNaN(cw_px) ? '' : cw_px +'px';

                let bgImg = this.comData.wrap.style['background-image'],
                    bgColor = this.comData.wrap.style['background-color'];
                $curContainer.css({
                    'min-height': wh_rem,
                    'background-image': bgImg ? `url(${bgImg})` : '',
                    'background-color': bgColor
                });

                if(this.bgStyle.key){
                    this.comData.wrap.style[this.bgStyle.key] = this.bgStyle.value;
                    $curContainer.css(this.bgStyle.key, this.bgStyle.value);
                    if(this.bgStyle.key != 'background-size'){
                        $curContainer.css('background-size', 'contain');
                    }
                }
                $curContainer.find('.sprize').css({
                    'margin-top': '-'+ch_rem,
                    height: ch_rem,
                    width: cw_rem
                });

                let boxImg = this.comData.box.style['background-image'];
                $curContainer.find('.sbox').css({
                    width: bw_rem,
                    height: bh_rem,
                    'margin-top': bmt_rem,
                    'padding-top':bpt_rem,
                    'background-image': boxImg ? `url(${boxImg})` : '',
                });

                let maskImg = this.comData.mask.img,
                    maskColor = this.comData.content.maskColor;
                $curContainer.find('.smask').css({
                    height: ch_rem,
                    width: cw_rem,
                    visibility: this.curPrize.img ? 'hidden' : 'visible'
                });
            },
            handleBgSuccess(response,file,filelist){
                this.comData.wrap.style['background-image'] = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.wrap.style['min-height'] = res.height;
                    this.handleConfigChang();
                });
            },
            handleBgRemove(file,filelist){
                this.comData.wrap.style['background-image'] = '';
                this.comData.wrap.style.height = '';
                this.handleConfigChang();
            },
            handleMaskSuccess(response,file,filelist){
                this.comData.mask.img = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.content.style.width = res.width;
                    this.comData.content.style.height = res.height;
                    this.handleConfigChang();
                });
            },
            handleMaskRemove(file,filelist){
                this.comData.mask.img = '';
                this.comData.content.style.width = '';
                this.comData.content.style.height = '';
                this.handleConfigChang();
            },
            handleBoxSuccess(response,file,filelist){
                this.comData.box.style['background-image'] = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.box.style.width = res.width;
                    this.comData.box.style.height = res.height;
                    this.handleConfigChang();
                });
            },
            handleBoxRemove(file,filelist){
                this.comData.box.style['background-image'] = '';
                this.comData.box.style.width = '';
                this.comData.box.style.height = '';
                this.handleConfigChang();
            },
            handleExceed(files,fileList){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            handleBtnChanged(btnConfig){
                this.curPrize.button = btnConfig;
                let $container = $(this.$refs.scratchContainer),
                $btnItem = $container.find('img[data-uuid='+ btnConfig.uuid +']');
                if($btnItem.length == 0){
                    return;
                }
                let w = util.px2rem(btnConfig.style.width),
                    t = util.px2rem(btnConfig.style['margin-top']);
                
                $btnItem.css({ width:w, 'margin-top': t});
                $btnItem.attr('src', btnConfig.imageUrl || require('./images/button.jpg'));
            },
            onPrizeClick(prize){
                this.curPrize = prize;
            },
            onPrizeOver(e,prize){
                if(this.curPrize == prize){
                    return;
                }
                this.curPrize = prize;
                this.$nextTick(()=>{
                    this.handleConfigChang();
                    if(this.curPrize.button && this.curPrize.button.uuid){
                        this.handleBtnChanged(prize.button);
                    }
                });
            },
            onPrizeChange(){
                if(!this.showPrizes){
                    this.curPrize = {};
                    this.handleConfigChang();
                }
            },
            handlePrizeSuccess(response, file, filelist){
                this.curPrize.img = response.file.path;
            },
            addPrize(){
                this.tmpPrizes.push({ id: '', img:'', alert:'', button: null })
            },
            removePrize(index){
                this.tmpPrizes.splice(index,1);
                if(this.tmpPrizes.length == 0){
                    this.curPrize = {};
                }
            }
        }
    }
</script>
<style lang='scss'>
.scratchWrapper{
    position: relative;
    &:hover .mask{
        display: flex;
    }
    .prizeList{
        float:left;
    }
    
}
.scratchForm{
    .el-form-item{
        margin-bottom:10px;
    }
    .el-icon-circle-close{
        position:absolute;
        top:0px; right:0px;
        z-index:1;
    }
}


.scratchContainer{
    position: relative;
    min-height:150px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position:bottom;
    .sbox{
        position: relative;
        height:150px;
        width:80%;
        margin:0 auto;
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
    }
    .sprize{
        position:relative;
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
        text-align:center;
        margin: 0 auto;
        img{
            display:inline-block;
        }
    }
    .smask{
        position:relative;
        display:block;
        margin: 0 auto;
        height:100%;
    }
}
</style>