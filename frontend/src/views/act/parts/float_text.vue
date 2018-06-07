<template>
	<div v-popover:float-pop class="floatWrapper">
        <el-popover ref="float-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="内容宽高">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.width" placeholder="宽度" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style.height" placeholder="高度" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['padding-top']" placeholder="内顶距" @blur="handleConfigChang"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="内容背景">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style['background-color']" placeholder="背景色" @blur="handleConfigChang"></el-input>
                    </el-col>
                     <el-col :span="14" :offset="1">
                        <el-col :span="12">
                            <el-select v-model="bgStyle" placeholder="请选择" @change="handleConfigChang" v-show="comData.content.style['background-image']" style="padding-right:9px;">
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
                <el-form-item label="文本定位">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.top" placeholder="顶距" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style.left" placeholder="左距" @blur="handleConfigChang"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="文本设置">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.color" placeholder="颜色" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['font-size']" placeholder="大小" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['line-height']" placeholder="行高" @blur="handleConfigChang"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="文本内容">
                    <el-input type="textarea" :rows='3' v-model="content" placeholder="${N}次数 | 活动时间" @blur="handleConfigChang"></el-input>
                </el-form-item>
            </el-form>
        </el-popover>
        
        

        <div class='floatContainer' ref='floatContainer'>
            <div class="fcontent">
                <div class="mask">
                    <el-button icon="el-icon-edit-outline">编辑</el-button>
                </div>

                <template v-if="content.length > 0" v-for=" line in content.split('\n')">
                    <p>{{line}}</p>
                </template>
                <p v-else>你今天还有 ${N} 次机会</p>
            </div>
        </div>
    </div>
</template>
<script>
    var util = require('src/js/common/util');
    import { mapGetters } from 'vuex';
     export default {
        name:'float_text',
        desc:'浮动文本',
        props: ['originData'], //'uploadData',
        computed: mapGetters({
            cacheActData: 'getActData',
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                comData:{
                    name:"float_text",
                    content:{
                        style:{
                            width:'',
                            height:'',
                            top:'',
                            left:'',
                            'padding-top':'',
                            'line-height':'',
                            'font-size':'',
                            'background-image': '',
                        },
                        text:''
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
                }
            }
            
        },
        mounted(){
            if(this.originData){
                this.comData = this.originData;
                this.content = this.comData.content.text.replace(/\u0001/g,'\n');
                let conBgImg = this.comData.content.style['background-image'];

                if(conBgImg){
                    this.bgList.push({ name: conBgImg.split('/').pop(), url: conBgImg });
                }
                
                let bgValue = this.comData.content.style['background-repeat'] || 
                            this.comData.content.style['background-size'];

                for (let i = 0; i < this.bgStatus.bgImgStyles.length; i++) {
                    let item = this.bgStatus.bgImgStyles[i];
                    if(item.value == bgValue){
                        this.bgStyle = item;
                    }
                }

                this.$nextTick(() => {
                    this.handleConfigChang();
                });
            }
        },
        methods:{
            getData(){
                this.comData.content.text = this.content.replace(/\n/g,'\\u0001');
                return this.comData;
            },
            handleConfigChang(){
                let ch_px = parseInt(this.comData.content.style.height),
                    cw_px = parseInt(this.comData.content.style.width),
                    cpt_px = parseInt(this.comData.content.style['padding-top']),
                    ct_px = parseInt(this.comData.content.style.top),
                    cl_px = parseInt(this.comData.content.style.left),
                    fs_px = parseInt(this.comData.content.style['font-size']),
                    lh_px = parseInt(this.comData.content.style['line-height']),
                    ch_rem = util.px2rem(ch_px),
                    cw_rem = util.px2rem(cw_px),
                    cpt_rem = util.px2rem(cpt_px),
                    ct_rem = util.px2rem(ct_px),
                    cl_rem = util.px2rem(cl_px),
                    lh_rem = util.px2rem(lh_px),
                    $curContainer = $(this.$refs.floatContainer);

                this.comData.content.style.height = isNaN(ch_px) ? '' : ch_px +'px';
                this.comData.content.style.width = isNaN(cw_px) ? '' : cw_px +'px';
                this.comData.content.style['padding-top'] = isNaN(cpt_px) ? '' : cpt_px +'px';
                this.comData.content.style.top = isNaN(ct_px) ? '' : ct_px +'px';
                this.comData.content.style.left = isNaN(cl_px) ? '' : cl_px +'px';
                this.comData.content.style['font-size'] = isNaN(fs_px) ? '' : fs_px +'px';
                this.comData.content.style['line-height'] = isNaN(lh_px) ? '' : lh_px +'px';

                let conImg = this.comData.content.style['background-image'],
                    conColor = this.comData.content.style['background-color'];
                $curContainer.find('.fcontent').css({
                    height: ch_rem,
                    width: cw_rem,
                    color: this.comData.content.style.color,
                    top: ct_rem,
                    left: cl_rem,
                    'padding-top': cpt_rem,
                    'line-height': lh_rem,
                    'background-image': conImg ? `url(${conImg})` : '',
                    'background-color': conColor,
                    'font-size': this.comData.content.style['font-size']
                });
                if(this.bgStyle.key){
                    this.comData.content.style[this.bgStyle.key] = this.bgStyle.value;
                    $curContainer.find('.fcontent').css(this.bgStyle.key, this.bgStyle.value);
                    if(this.bgStyle.key != 'background-size'){
                        $curContainer.find('.fcontent').css('background-size', 'contain');
                    }
                }
            },
            handleBgSuccess(response,file,filelist){
                this.comData.content.style['background-image'] = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.content.style.height = res.height;
                    this.comData.content.style.width = res.width;
                    this.handleConfigChang();
                });
            },
            handleBgRemove(file,filelist){
                this.comData.content.style['background-image'] = '';
                this.comData.content.style.height = '';
                this.comData.content.style.width = '';
                this.handleConfigChang();
            },
            handleExceed(files,fileList){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
        }
    }
</script>
<style lang='scss'>
.floatWrapper{
    position: relative;
}

.floatContainer{
    position: relative;
    .fcontent{
        position:absolute;
        // height:50px;
        // width:70%;
        // left:15%;
        margin:0 auto;
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
        text-align:center;
        overflow:hidden;
        z-index:100;// 在mask 之上，方便编辑
        &:hover .mask{
            display: flex;
        }
    }
}
</style>