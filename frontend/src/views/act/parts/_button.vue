<template>
	<div>
		<el-form-item label="按钮图片" >
            <el-col>
                <el-upload action="/api/act/upload"
                    :data="uploadData"
                    :file-list="btnImgList"
                    :limit="1"
                    :on-exceed= "handleExceed"
                    :on-remove="handleRemove"
                    :on-success = "handleSuccess"
                    :auto-upload="true"
                    accept="image/gif,image/jpeg,image/png"
                    :multiple = "false"
                    list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过500kb</div>
                </el-upload>
            </el-col>
        </el-form-item>
        <el-form-item label="按钮定位" >
            <el-col :span="7">
                <el-input v-model="button.style.width" placeholder="宽度" @blur="handleChanged"></el-input>
            </el-col>
            <el-col :span="7" :push="1">
                <el-input v-model="button.style['margin-top']" placeholder="顶距" @blur="handleChanged"></el-input>
            </el-col>
            <el-col :span="6" :push="2">(单位：px)</el-col>
        </el-form-item>
        <el-form-item label="按钮功能" >
            <el-col>
                <el-cascader 
                :options="btnUsages" 
                v-model="button.usages" 
                placeholder="请选择按钮功能" 
                @active-item-change="handleItemChange"
                @change="changeSelectFn"></el-cascader>
                <el-button type="text" size="small" plain icon="el-icon-circle-plus" style="margin-left: 10px;" v-if="button.usages == 'goResponse'" @click="addResStatus">状态</el-button>
            </el-col>
            <el-col :span="18" style="margin-top:10px;" v-if="button.usages == 'goOthers'">
                <el-input v-model="button.href" placeholder="请输入按钮要跳转H5链接地址"></el-input>
            </el-col>
            <el-col style="margin-top:10px;" v-if="button.usages == 'goResponse'">
                <template v-for="(item,index) in tempResStatus">
                    <_response :originData="button.responses[index]" :index="index" @delBackEndFn="delBackEndFn" :ref="'response_'+ index"></_response>
                </template>
            </el-col>
        </el-form-item>
	</div>
</template>
<script>
    import _response from "./_response.vue"
    import { mapGetters } from 'vuex';
    var util = require('src/js/common/util');
	
	export default  {
        props: ['originData'],
        components:{ _response },
        computed: mapGetters({
            cacheActData: 'getActData',
            uploadData: 'getUploadData'
        }),
		data(){
			return {
                uuid: util.uuid(), // 子组件，可能被多次引用，uuid 用于区分不同的实例,
				button:{
					imageUrl:'',
					usages:[],
	                href:'',
	                style:{
	                    width:'',
	                    'margin-top':''
	                },
	                responses:[]
				},
				btnUsages:[
                    { value: 'download', label: '去下载' }, 
                    { value: 'goApp', label: '去app', children:[
                            { value: 'goAppIndex', label: '首页' },
                            { value: 'goAppAccount', label: '帐户页' },
                            { value: 'goAppCoupons', label: '优惠券页' },
                            { value: 'goAppCredit', label: '认证中心页' },
                            { value: 'goAppCard', label: '会员卡页' },
                            { value: 'goAppMarket', label: '贷款超市' }
                    ]},
                    { value: 'goAlerts', label: '去弹框'},
                    { value: 'goAlertClose', label: '去关闭弹框' },
                    { value: 'goResponse', label: '去响应' },
                    { value: 'goOthers', label: '去其他H5链接' }
                ],
                tempResStatus:[''],
                btnImgList:[]
			}
		},
		mounted(){
            this.button.uuid = this.uuid;
            this.bindAlters();
            if(this.originData){
                this.tempResStatus = [];
                this.button = this.originData;
                this.uuid = this.originData.uuid;
                this.button.responses = this.originData.responses || [];
                let imgUrl = this.button.imageUrl;
                if(imgUrl){
                    this.btnImgList.push({ name:imgUrl.split('/').pop(), url: imgUrl});
                }
                for (var i = 0; i < this.button.responses.length; i++) {
                    this.tempResStatus.push('');
                }
                this.handleChanged();
            }
		},
		methods:{
			getData(){
				this.button.responses = [];
                for(let key in this.$refs){
                    if(key.indexOf('response_') > -1){
                        this.button.responses.push(this.$refs[key][0].getData());
                    }
                }
				return this.button;
			},
			delBackEndFn(index){
                delete this.$refs['response_'+ index];
            },
            bindAlters(){
                let alters = [];
                for(let i = 0; i < this.cacheActData.parts.length; i++){
                    let item = this.cacheActData.parts[i];
                    if(item.type === 'hidden'){
                        alters.push({ value: item.name, label: item.desc });
                    }
                }
                let conf = { value: 'goAlerts', label: '去弹框', children:alters };
                this.btnUsages.splice(2,1,conf);
            },
            changeSelectFn(value){
                this.button.usages = value;
                let selectedStr = value[value.length-1];
                if(selectedStr !== 'goOthers'){
                    this.button.href = '' ;
                }
            },
            handleItemChange(val){
                var _this = this;
                this.$nextTick(()=>{
                    let $alerts = $('.el-cascader-menus:visible').find('ul:last li');
                    if(val != 'goAlerts'){
                        $alerts.unbind('mouseenter').unbind('mouseleave');;
                        return;
                    }
                    
                    $alerts.hover(function(){
                        let $sender = $(this);
                        let index = $alerts.index($sender);
                        let curAlert = _this.btnUsages[2].children[index];
                        _this.$store.dispatch("setCurActBtnRes",curAlert.value);
                    }, function(){
                        _this.$store.dispatch("setCurActBtnRes",null);
                    });
                });
            },
            handleExceed(files,fileList){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            handleSuccess(response, file, filelist){
                this.button.imageUrl = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.button.style.width = res.width;
                    this.handleChanged();
                });
            },
            handleRemove(file, filelist){
                this.button.imageUrl = '';
                this.button.style.width = '';
                this.$store.dispatch("setButtonConfig",this.button);
            },
            handleChanged(){
                let _this = this;
            	let w = parseInt(this.button.style.width),
            	    t = parseInt(this.button.style['margin-top']);
            	this.button.style.width = isNaN(w) ? '' : w +'px';
            	this.button.style['margin-top'] = isNaN(t) ? '' : t +'px';
                // vuex store bug: change state to more the one time, watch can watch the last one only
                setTimeout(function(){
                    _this.$store.dispatch("setButtonConfig",_this.button);
                }, 100);
                
                
            },
            addResStatus(){
                this.tempResStatus.push('');
                this.$nextTick(()=>{
                    let resItem = this.$refs['response_'+ (this.tempResStatus.length-1)][0];
                    this.button.responses.push(resItem.getData());
                });
            }
		}
	}

</script>