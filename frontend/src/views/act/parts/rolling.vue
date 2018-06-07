<template>
	<div v-popover:roll-pop class="rollWrapper">
        <el-popover ref="roll-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="组件高度">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.height" placeholder="组件高度" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="内顶距" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">(单位：px)</el-col>
                </el-form-item>
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
                <el-form-item label="内容背景">
                    <el-col :span="7">
                        <el-input v-model="comData.box.style['background-color']" placeholder="背景色" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="16" :offset="1">
                        <el-col :span="12">
                            <el-select v-show="comData.box.style['background-image']" v-model="boxBgStyle" placeholder="请选择" @change="handleConfigChang"  style="padding-right:10px;">
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
                    </el-col>
                </el-form-item>
                <el-form-item label="内容设置">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.color" placeholder="文本颜色" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['line-height']" placeholder="行高" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="conEdge" placeholder="边距" @blur="handleConfigChang"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="滚动方向">
                    <el-radio-group size="small" v-model="comData.content.orient" @change="onOrientChange">
                      <el-radio-button label="orientH">横向</el-radio-button>
                      <el-radio-button label="orientV">纵向</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="滚动文本">
                    <el-input type="textarea" :rows='8' v-model="content" placeholder="文本内容"></el-input>
                </el-form-item>
            </el-form>
        </el-popover>
        
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class='rollContainer' ref='rollContainer'>
            <div class="rbox">
                <div class="rcontent">
                    <template v-if="comData.content.orient == 'orientH'">
                    {{ content || '滚动文本' }}
                    </template>
                    <template v-else v-for="item in content.split('\n')">
                        <p>{{item}}</p>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    var util = require('src/js/common/util');
    import { mapGetters } from 'vuex';
     export default {
        name:'rolling',
        desc:'滚动文本',
        props: ['originData'], //'uploadData',
        computed: mapGetters({
            cacheActData: 'getActData',
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                comData:{
                    name:"rolling",
                    wrap:{
                        style: {
                            height: '',
                            'background-image': '',
                            'background-color': '',
                            'padding-top':''
                        }
                    },
                    box:{
                        style:{
                            'background-image': '',
                            'background-color': '',
                            width:'',
                            height:''
                        }
                    },
                    content:{
                        style:{
                            width:'',
                            height:'',
                            padding:''
                        },
                        text:'',
                        orient:'orientH' // orientH   orientV
                    }
                },
                content:'',
                bgList:[],
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
                boxBgList:[],
                boxBgStyle:'',
                conEdge:'',
            }
            
        },
        mounted(){
            if(this.originData){
                this.comData = this.originData;
                this.content = this.comData.content.text.replace(/\u0001/g,'\n');
                let wrapBgImg = this.comData.wrap.style['background-image'],
                    boxBgImg = this.comData.box.style['background-image'];

                if(wrapBgImg){
                    this.bgList.push({ name: wrapBgImg.split('/').pop(), url: wrapBgImg });
                }
                if(boxBgImg){
                    this.boxBgList.push({ name: boxBgImg.split('/').pop(), url: boxBgImg });
                }
                let bgValue = this.comData.wrap.style['background-repeat'] || 
                            this.comData.wrap.style['background-size'];
                let bgBoxValue = this.comData.box.style['background-repeat'] || 
                            this.comData.box.style['background-size'];

                for (let i = 0; i < this.bgStatus.bgImgStyles.length; i++) {
                    let item = this.bgStatus.bgImgStyles[i];
                    if(item.value == bgValue){
                        this.bgStyle = item;
                    }
                    if(item.value == bgBoxValue){
                        this.boxBgStyle = item;
                    }
                }
                let pdArr = this.comData.box.style.padding.split(' ');
                if(pdArr.length > 0){
                    this.conEdge = parseInt(pdArr[0]) || parseInt(pdArr[1]);
                }

                this.$nextTick(() => {
                    this.handleConfigChang();
                });
            }
        },
        methods:{
            getData(){
                this.comData.content.text = this.content.replace(/\n/g,'\\u0001');
                // this.comData.box = {
                //     style: {
                //         'background-image': this.comData.content.style['background-image'],
                //         'background-color': this.comData.content.style['background-color']
                //     }
                // };
                // delete this.comData.content.style['background-image'];
                // delete this.comData.content.style['background-color'];

                return this.comData;
            },
            handleConfigChang(){
                let wh_px = parseInt(this.comData.wrap.style.height),
                    wt_px = parseInt(this.comData.wrap.style['padding-top']),
                    cbh_px = parseInt(this.comData.box.style.height),
                    cbw_px = parseInt(this.comData.box.style.width),
                    clh_px = parseInt(this.comData.content.style['line-height']),
                    cedge_px = parseInt(this.conEdge),
                    wh_rem = util.px2rem(wh_px),
                    wt_rem = util.px2rem(wt_px),
                    cbh_rem = util.px2rem(cbh_px),
                    cbw_rem = util.px2rem(cbw_px),
                    clh_rem = util.px2rem(clh_px),
                    cedge_rem = util.px2rem(cedge_px),
                    $curContainer = $(this.$refs.rollContainer);

                this.comData.wrap.style.height = isNaN(wh_px) ? '' : wh_px +'px';
                this.comData.wrap.style['padding-top'] = isNaN(wt_px) ? '' : wt_px +'px';
                this.comData.box.style.height = isNaN(cbh_px) ? '' : cbh_px +'px';
                this.comData.box.style.width = isNaN(cbw_px) ? '' : cbw_px +'px';
                this.comData.box.style['padding'] = isNaN(cedge_px) ? '' : (this.comData.content.orient == 'orientH' ? `0 ${cedge_px}px` : `${cedge_px}px 0 0 0`);
                this.conEdge = isNaN(cedge_px) ? '' : cedge_px +'px';
                this.comData.content.style['line-height'] = isNaN(clh_px) ? '' : clh_px +'px';
                this.comData.content.style.height = isNaN(clh_px) ? '' : (this.comData.content.orient == 'orientH' ? clh_px : clh_px*3) +'px'; // 3代表3行

                let bgImg = this.comData.wrap.style['background-image'],
                    bgColor = this.comData.wrap.style['background-color'];
                $curContainer.css({
                    height: wh_rem,
                    'padding-top': wt_rem,
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
                let boxImg = this.comData.box.style['background-image'],
                    boxColor = this.comData.box.style['background-color'];
                $curContainer.find('.rbox').css({
                    height: cbh_rem,
                    width: cbw_rem,
                    'background-image': boxImg ? `url(${boxImg})` : '',
                    'background-color': boxColor,
                    padding: this.comData.content.orient == 'orientH' ? `0 ${cedge_rem}` : `${cedge_rem} 0 0 0`,
                });
                if(this.boxBgStyle.key){
                    this.comData.box.style[this.boxBgStyle.key] = this.boxBgStyle.value;
                    $curContainer.find('.rbox').css(this.boxBgStyle.key, this.boxBgStyle.value);
                    if(this.bgStyle.key != 'background-size'){
                        $curContainer.find('.rbox').css('background-size', 'contain');
                    }
                }
                $curContainer.find('.rcontent').css({
                    height: util.px2rem(this.comData.content.style.height),
                    // width: cw_rem,
                    color: this.comData.content.style.color,
                    'line-height': clh_rem,
                });
            },
            onOrientChange(){
                this.handleConfigChang();
            },
            handleBgSuccess(response,file,filelist){
                this.comData.wrap.style['background-image'] = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.wrap.style.height = res.height;
                    this.handleConfigChang();
                });
            },
            handleBgRemove(file,filelist){
                this.comData.wrap.style['background-image'] = '';
                this.comData.wrap.style.height = '';
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
        }
    }
</script>
<style lang='scss'>
.rollWrapper{
    position: relative;
    &:hover .mask{
        display: flex;
    }
}


.rollContainer{
    position: relative;
    background-size: contain;
    background-repeat: no-repeat;
    background-position:bottom;
    .rbox{
        position: relative;
        width:70%;
        margin:0 auto;
        line-height:45px;
        background-image: url('./images/bg_roll.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
    }
    .rcontent{
        position:relative;
        text-align:center;
        white-space:nowrap;
        overflow:hidden;        
    }
}
</style>