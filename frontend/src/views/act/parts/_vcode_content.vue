<template>
    <el-row>
        <div class="v_code_wrap" v-if="isPreview" ref="vCodeWrap">
            <h3>请输入图片验证码</h3>
            <p>
                <input type="text" placeholder="请输入验证码" class="reg_code"/>
                <img src="" />
            </p>
        </div>
        <template v-else>
            <el-form label-width="70px">
                <el-form-item label="内容宽高">
                    <el-col :span="10">
                        <el-input size="small" v-model="comData.wrap.style.width" placeholder="宽" @blur="handleConfig"></el-input>
                    </el-col>
                    <el-col :span="10" :push="1">
                        <el-input size="small" v-model="comData.wrap.style.height" placeholder="高" @blur="handleConfig"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="位置">
                    <el-input size="small" v-model="comData.wrap.style['padding-top']" placeholder="顶" @blur="handleConfig"></el-input>
                </el-form-item>
                <el-form-item label="边框颜色">
                    <el-input size="small" v-model="comData.wrap.style['border-color']" placeholder="边框颜色" @blur="handleConfig"></el-input>
                </el-form-item>
            </el-form>
        </template>
    </el-row>
</template>
<script type="text/ecmascript-6">
    import { mapGetters } from 'vuex';
    var util = require('src/js/common/util');
    export default {
        props: ['originData', 'isPreview'],
        computed: mapGetters({
            cacheActData: 'getActData',
            uploadData: 'getUploadData'
        }),
        data() {
            return{
                uuid: util.uuid(),
                comData:{
                    wrap:{
                        style:{
                            width:'',
                            height:'',
                            'padding-top':'',
                            'border-color':''
                        }
                    }
                } 
            }
        },
        mounted(){
            this.comData.uuid = this.uuid;
            if(this.originData && Object.keys(this.originData).length > 0){
                this.comData = this.originData;
                this.uuid = this.originData.uuid;
                this.handleConfig();
            }
        },
        methods:{
            getData(){
                return this.comData;
            },
            preview(data){
                let $contentWrap = $(this.$refs.vCodeWrap);
                let w_rem = util.px2rem(data.wrap.style.width),
                    h_rem = util.px2rem(data.wrap.style.height),
                    top_rem = util.px2rem(data.wrap.style['padding-top']);

                $contentWrap.css({
                    width: w_rem,
                    height: h_rem,
                    'padding-top': top_rem
                });

                $contentWrap.find('p').css({
                    'border-color': data.wrap.style['border-color']
                });
                $contentWrap.find('img').css({
                    'border-color': data.wrap.style['border-color']
                });

            },
            handleConfig(){
                let w = parseInt(this.comData.wrap.style.width),
                    h = parseInt(this.comData.wrap.style.height),
                    top = parseInt(this.comData.wrap.style['padding-top']);
                this.comData.wrap.style.width = isNaN(w) ? '' : w +'px';
                this.comData.wrap.style.height = isNaN(h) ? '' : h +'px';
                this.comData.wrap.style['padding-top'] = isNaN(top) ? '' : top +'px';
                this.$store.dispatch("setActAlertContentConfig",this.comData);
            }
        }
    }
</script>
<style lang="scss">
    .v_code_wrap{
        margin:0 auto;
        color:#333;
        width: 70%;
        h3{
            text-align:center;
            margin-bottom:10px;
            color:#fff;
        }
        p{
            border: 1px solid #b2b2b2;
            font-size: 12px;
            margin-top: -1px;
            position: relative;
            background-color:#fff;

            input{
                height:40px;
                display: inline-block;
                vertical-align: middle;
                color: #333;
                border: none;
                padding-left:5%;
                width:95%;
            }
            
            img{
                position:absolute;
                right:-1px;top:-1px;
                width:80px;
                height:43px;
                border-left:1px solid #b2b2b2;
            }
        }
    }
</style>