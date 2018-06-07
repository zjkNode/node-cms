<template>
	<div v-popover:footer-pop class="footersWrapper">
        <el-popover ref="footer-pop" placement="right" width="400" trigger="click">
            <el-form label-width="80px" :rules = "rules" :model="comData.footer.style">
                <el-form-item label="文案内容">
                    <el-row class="everyInput">
                        <el-col :span="13">
                            <el-input placeholder="第一行(必填)" v-model="comData.footer.txt.line1.content" @blur="setTxtFn"></el-input>
                        </el-col>
                        <el-col :span="7" :push="1">
                            <el-input placeholder="font-size" v-model="comData.footer.txt.line1.style['font-size']" @blur="setSizeFn('line1')"></el-input>
                        </el-col>
                        <el-col :span="2" :push="2">(px)</el-col>
                    </el-row>
                    <el-row class="everyInput">
                        <el-col :span="13">
                            <el-input placeholder="第二行(可选)" v-model="comData.footer.txt.line2.content" @blur="setTxtFn"></el-input>
                        </el-col>
                        <el-col :span="7" :push="1">
                            <el-input placeholder="font-size" v-model="comData.footer.txt.line2.style['font-size']" @blur="setSizeFn('line2')"></el-input>
                        </el-col>
                        <el-col :span="2" :push="2">(px)</el-col>
                    </el-row>
                    <el-row class="everyInput">
                        <el-col :span="13">
                            <el-input placeholder="第三行(可选)" v-model="comData.footer.txt.line3.content" @blur="setTxtFn"></el-input>
                        </el-col>
                        <el-col :span="7" :push="1">
                            <el-input placeholder="font-size" v-model="comData.footer.txt.line3.style['font-size']" @blur="setSizeFn('line3')"></el-input>
                        </el-col>
                        <el-col :span="2" :push="2">(px)</el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="文案颜色">
                    <el-col :span="14">
                        <el-input v-model="comData.footer.style['color']" placeholder="字体颜色（如 #ffffff）" @blur="setColorFn"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="展示高度" prop="height">
                    <el-col :span="14">
                        <el-input v-model="comData.footer.style['height']" placeholder="组件高度（如100px）" @blur="setHeightFn"></el-input>
                    </el-col>
                    <el-col :span="6" :push="1">(单位：px)</el-col>
                </el-form-item>
                <el-form-item label="展示背景">
                    <el-col :span="14">
                        <el-input v-model="comData.footer.style['background-color']" placeholder="背景色（如 #ffffff）" @blur="setBgFn"></el-input>
                    </el-col>
                </el-form-item>
            </el-form>
        </el-popover>
        <el-button icon="el-icon-plus" v-show="comData.footer.style.height == '' && !isChild" class="descBtn">添加底部文案</el-button>
        <div class="mask" v-show="comData.footer.style.height !== '' || isChild">
            <el-button icon="el-icon-edit-outline" class="descBtn">修改底部文案</el-button>
        </div>

        <div class="footers" ref="footersContainer">

        </div>
    </div>
</template>
<script>
	require("src/js/common/flexible");
    var util = require('src/js/common/util');
    import { mapGetters } from 'vuex';

    export default {
        name:'footers',
        desc:'底部文案组件',
        props: ['originData'],
        computed: mapGetters({
            cacheActData: 'getActData',
            uploadData: 'getUploadData'
        }),
        data(){
            var handleInput = (rule,val,callback) =>{
                let reg = /(\d)+(px)?/g;
                if(!reg.test(val)){
                    callback(new Error('请填写正确的像素值'))
                }else{
                    callback();
                }
            }
            return {
                comData:{
                    name:"footers",
                    footer:{
                        style:{
                            width:'',
                            height:'',
                            color: '',
                            'background-color':''
                        },
                        txt:{
                            line1:{
                                content: '',
                                style:{
                                    'font-size':''
                                }
                            },
                            line2:{
                                content: '',
                                style:{
                                    'font-size':''
                                }
                            },
                            line3:{
                                content: '',
                                style:{
                                    'font-size':''
                                }
                            }
                        }
                    }
                },
                // uploadData:{
                //     timeId:''
                // },
                rules:{
                    height: [
                        {trigger: 'blur', validator:handleInput}
                    ]
                },
                isChild:false
            }
        },
        mounted(){
            let _this = this;
            if(this.originData){
                this.comData=this.originData;
            };
            this.$nextTick(()=>{
                if(this.originData){
                    this.setHeightFn();
                    this.setBgFn();
                    this.setTxtFn();
                    this.setColorFn();
                };
            })
            
        },
        methods:{
            getData(){
                return this.comData;
            },
            setHeightFn(){
                var h = this.comData.footer.style.height,
                    px = parseInt(h),
                    rem = util.px2rem(px)+'rem';
                if(px){
                    this.comData.footer.style.height = px+'px'
                    $(this.$refs.footersContainer).css('height',rem);
                }else{

                }
            },
            setBgFn(){
                $(this.$refs.footersContainer).css('background-color',this.comData.footer.style['background-color']);
            },
            setTxtFn(){
                let allTxtObj = this.comData.footer.txt,
                    str = '';
                for( var i in allTxtObj){
                    if(allTxtObj[i].content ){
                        if(allTxtObj[i].style['font-size']){
                            str += '<p class="'+i+'" style="font-size: '+allTxtObj[i].style['font-size']+';">'+allTxtObj[i].content+'</p>';
                        }else{
                            str += '<p class="'+i+'">'+allTxtObj[i].content+'</p>';
                        }
                        $(this.$refs.footersContainer).html($(str));
                    }else{
                        $(this.$refs.footersContainer).find('.'+i).remove();
                    }
                }
                $(this.$refs.footersContainer).html() != '' ? this.isChild = true : this.isChild = false;
            },
            setSizeFn(ele){
                let fontSize = this.comData.footer.txt[ele].style['font-size'];
                if(fontSize){
                    if( !parseInt(fontSize)){
                        this.$message.error('请输入正确的像素值');
                        return;
                    }
                    $(this.$refs.footersContainer).find('.'+ele).css('font-size', parseInt(fontSize))
                    this.comData.footer.txt[ele].style['font-size'] = parseInt(fontSize)+'px';
                }
            },
            setColorFn(){
                $(this.$refs.footersContainer).css('color',this.comData.footer.style['color']);
            }
        }
    }

</script>
<style lang="scss">
    .footersWrapper{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-width:540px;
        position: relative;
        &:hover .mask{
            display: flex;
        }
        .descBtn{
            margin: 20px 0;
        }
    }
    .mask{
        height: 100%;
        width:100%;
        background: rgba(0, 0, 0, 0.6);
        position: absolute;
        top:0;
        left:0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        display: none;
    }
    .everyInput{
        margin-bottom: 10px;
    }
    .footers{
        width:100%;
        line-height: 1.3;
        font-size: 10px;
        text-align: center;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
