<template>
	<div v-popover:image-pop class="imgWrapper flex-center-v">
        <el-popover
            ref="image-pop" placement="right" width="400" trigger="click">
            <h4 style="padding: 20px 0;">请上传要展示的图片</h4>
            <el-upload action="/api/act/upload"
                :data="uploadData"
                :file-list="originFileList"
                :on-remove="handleRemove"
                :on-success = "handleSuccess"
                :auto-upload="true"
                accept="image/gif,image/jpeg,image/png"
                :multiple = "true"
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过500kb</div>
            </el-upload>
        </el-popover>
        
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class='imgContainer'>
            <i class="el-icon-picture" style="font-size:50px" v-if="comData.image_path.length == 0"></i>
            <template v-for="item in comData.image_path" else>
                <img :src="item" alt="" />
            </template>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';

	export default {
        name:'images',
        desc:'图片组件',
        props: ['originData'],
        computed: mapGetters({
            cacheActData: 'getActData',
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                comData:{
                    name:'images',
                    image_path:[]
                },
                // uploadData:{
                //     timeId:''
                // },
                originFileList:[]
            }
        },
        mounted(){
            let _this = this;
            if(this.originData){
                this.comData=this.originData;
                for( var i= 0; i< this.comData.image_path.length; i++){
                    let fileName = this.comData.image_path[i].split('/').pop();
                    let fileList = { name:fileName, url: this.comData.image_path[i]};
                    _this.originFileList.push(fileList);
                }
            };
        },
        methods:{
            getData(){
                return this.comData;
            },
            handleSuccess(response, file, filelist){
                this.comData.image_path.push(response.file.path)
            },
            handleRemove(file, filelist){
                this.comData.image_path = this.comData.image_path.filter(function(item){
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
    .imgWrapper{
        min-height: 80px;
        max-width:540px;
        position: relative;
        &:hover .mask{
            display: flex;
        }
    }
    .addImgPart{
        position: relative;
        .addImgBtn{
            position: absolute;
            top:50%;
            left:50%;
            margin-top: -20px;
            margin-left: -60px;
        }
    }

    .imgContainer{
        text-align:center;
    }
</style>