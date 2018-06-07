<template>
    <div>
        <div class="img_content_wrap" v-if="isPreview" ref="imgContentWrap">
            <template class="" v-for="item in previewData.image_path">
                <img :src="item" alt="" />
            </template>
        </div>
        <template v-else>
            <el-form label-width="70px">
                <el-form-item label="内容宽高">
                    <el-col :span="10">
                        <el-input size="small" v-model="comData.wrap.style['width']" placeholder="宽" @blur="handleConfig"></el-input>
                    </el-col>
                    <el-col :span="10" :push="1">
                        <el-input size="small" v-model="comData.wrap.style['height']" placeholder="高" @blur="handleConfig"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="位置(顶)">
                    <el-input size="small" v-model="comData.wrap.style['padding-top']" placeholder="顶" @blur="handleConfig"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload action="/api/act/upload"
                        :data="uploadData"
                        :file-list="contentFileList"
                        :limit="1"
                        accept="image/jpeg,image/png"
                        :on-remove="handleRemove"
                        :on-success = "handleSuccess"
                        :multiple = "false"
                        :auto-upload="true"
                        list-type="text">
                    <el-button type="primary" size="small">上传图片</el-button>
                    </el-upload>
                </el-form-item>
            </el-form>
        </template>
    </div>
</template>
<script>
    var util = require('src/js/common/util');
    import { mapGetters } from 'vuex';


    export default{
        props: ['originData', 'isPreview'],
        data(){
            return {
                uuid: util.uuid(),
                contentFileList:[],
                comData:{
                    image_path:[],// todo 这个地方需要修改，只能包含一个图片的
                    wrap:{
                       style:{
                            width:'',
                            height:'',
                            'padding-top':''
                        } 
                    }
                    
                },
                previewData:{
                    image_path:[]
                }
            }
        },
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        mounted(){
            this.comData.uuid = this.uuid;
            if(this.originData && Object.keys(this.originData).length > 0){
                this.comData = this.originData;
                this.uuid = this.originData.uuid;
                for (var i = 0; i < this.comData.image_path.length; i++) {
                    let imgUrl = this.comData.image_path[i];
                    this.contentFileList.push({ 
                        name: imgUrl.split('/').pop(), 
                        url: imgUrl 
                    });
                }
                this.handleConfig();
                
            }
        },
        methods:{
            getData(){
				return this.comData;
			},
            preview(data){
                this.previewData = data;
                let $contentWrap = $(this.$refs.imgContentWrap);
                let w_rem = util.px2rem(data.wrap.style.width),
                    h_rem = util.px2rem(data.wrap.style.height),
                    top_rem = util.px2rem(data.wrap.style['padding-top']);

                $contentWrap.css({
                    width: w_rem,
                    height: h_rem,
                    'padding-top': top_rem
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
            },
            handleSuccess(response, file, filelist){
                this.comData.image_path.push(response.file.path);
                util.getImageWH(response.file.path).then(res => {
                    this.comData.wrap.style.width = res.width;
                    this.handleConfig();
                });
                // this.$store.dispatch("setActAlertContentConfig",this.comData);
            },
            handleRemove(file, filelist){
                // this.comData.image_path = this.comData.image_path.filter(function(item){
                //     if(file.response){
                //         return item != file.response.file.path;
                //     } else {
                //         return item != file.url;
                //     }
                // });
                this.comData.image_path = [];
                this.comData.wrap.style.width = '';
                this.handleConfig();
                // this.$store.dispatch("setActAlertContentConfig",this.comData);
            }
        }
        
    }
</script>
<style lang="scss">
    .img_content_wrap{
        margin:0 auto;
    }
</style>
