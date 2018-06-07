<template>
	<div v-popover:turn-pop  class="turnWrapper">
		<el-popover ref="turn-pop" placement="right" width="400" trigger="click">
			<el-form label-width="90px" :model="comData" class="turnForm">
            	<el-form-item label="组件定位" >
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.height" placeholder="高px" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset='1'>
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="顶距px" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="6" :offset="1">(单位：px)</el-col>
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
                                :file-list="bgWrap"
                                accept="image/gif,image/jpeg,image/png"
                                :on-exceed= "handleExceed"
                                :on-remove="onWrapRemove"
                                :on-success="onWrapSuccess"
                                :multiple="false"
                                :auto-upload="true"
                                list-type="text">
                            	<el-button size="small" type="primary">上传</el-button>
                            </el-upload>
                        </el-col>
                   </el-col>
               	</el-form-item>
               	<el-form-item label="转盘">
                    <el-col :span="10">
                        <el-input v-model="comData.wheel.style.width" placeholder="宽度(px)" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span='10' :offset='1'>
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :limit="1"
                            :file-list="bgWheel"
                            accept="image/gif,image/jpeg,image/png"
                            :on-exceed= "handleExceed"
                            :on-remove="onWheelRemove"
                            :on-success = "onWheelSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                        	<el-button size="small" type="primary">上传</el-button>
                        </el-upload>
                    </el-col>
               	</el-form-item>
               	<el-form-item label="奖品颜色">
                    <el-col :span="7">
                        <el-input v-model="oddColor" placeholder="背景1" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input  v-model="evenColor" placeholder="背景2" @blur="handleConfigChang"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input  v-model="comData.wheel.style.color" placeholder="名称" @blur="handleConfigChang"></el-input>
                    </el-col>
               	</el-form-item>
               	<el-form-item label="奖品列表">
				    <el-switch v-model="showPrizes"> </el-switch>
               		<el-radio-group v-if="showPrizes" v-model="prizeCount" size="small" @change="onPrizeChange">
				      <el-radio-button label="6"></el-radio-button>
				      <el-radio-button label="8"></el-radio-button>
				    </el-radio-group>
               	</el-form-item>
               	<el-row v-if="showPrizes">
	       			<el-col class='pcard' :span="7" v-for="(item, index) in comData.prizes" :key="item.id" :offset="1">
					    <el-card :body-style="{ 'padding': '0px' }" >
					    	<div @click="onPrizeClick(item)">
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
						      	<el-input size="mini" type="textarea" resize="none" placeholder="奖品名称" v-model="item.name"></el-input>
						      	
						  	</div>
					    </el-card>
					</el-col>
				</el-row>

				<el-form-item label="抽奖按钮">
					<template v-for="(item, index) in tempBtns">
                        <_rmable_button :ref="'rmableBtn_'+ index" :originData="comData.buttons.items[index]" ></_rmable_button>
                    </template>
				</el-form-item>
            </el-form>
		</el-popover>

		<div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>
		<div class="turnContainer" ref="turnContainer">
			<div class="wheel">
				<div class="turnplate">
					<div class="turborder" :style="'background-image:url('+ require('./images/turntable_bg.png') +')'"></div>
					<div class="core">
						<div class="core-box">
							<div class="prize" :style="'background-color:'+ prize.color" :class="'p_'+prizeCount" v-for="prize in comData.prizes">
								<div class="prize-con">
                                    <pre>{{ prize.name | nl2br }}</pre>
									<div class="img" :style="'background-image:url('+ (prize.img || require('./images/prize.png')) +')'"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
                <div class="start">
                    <template v-for="item in comData.buttons.items">
                        <img :src="item.imageUrl || require('./images/start.png')" :data-uuid="item.uuid" alt=""/>
                    </template>
                </div>
			</div>
		</div>
	</div>
</template>
<script>
    var util = require('src/js/common/util');
    import _rmable_button from './_rmable_button.vue';
	import { mapGetters } from 'vuex';
	export default {
        name:'turnplate',
        desc:'大转盘',
        props: ['originData'],
        components:{ _rmable_button },
        computed: mapGetters({
        	cacheActData: 'getActData',
        	btnConfig: 'getActBtnConfig',
            uploadData: 'getUploadData'
        }),
        filters:{
            nl2br:function(value){
                if(!value) return '';
                return value.replace(',','\n');
            }
        },
        watch: {
            btnConfig(val, oldVal){
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
        data(){
        	return {
        		comData:{
                    name:"turnplate",
        			prizes:[],
        			wheel:{
        				style:{
        					"background-image":''
        				}
        			},
        			wrap:{
        				style:{}
        			},
        			buttons:{
        				items:[]
        			}
        		},
        		showPrizes:false,
        		prizeCount:6,
        		oddColor:"#fefefe",
        		evenColor:"#f3f3f3",
        		curPrize:null,
        		tempBtns:[],
        		bgWrap:[],
        		bgWheel:[],
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
                alertsOptions:[]
        	}
        },
        mounted(){
        	this.bindAlertOptions();
        	this.initPrize();
        	if(this.originData){
                this.comData = this.originData;
                this.comData.prizes.forEach((prize, index) => {
                    prize.name = prize.name.replace(/,/g,'\n');
                    if(prize.color){
                        index % 2 == 0 ? this.evenColor = prize.color : this.oddColor = prize.color;
                    }
                });
                let bgWrapImg = this.comData.wrap.style['background-image'];
                if(bgWrapImg){
                    this.bgWrap.push({ name: bgWrapImg.split('/').pop(), url: bgWrapImg });
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

                let bgWheelImg = this.comData.wheel.style['background-image'];
                if(bgWheelImg){
                    this.bgWheel.push({ name: bgWheelImg.split('/').pop(), url: bgWheelImg });
                }
                this.tempBtns = [];
                for (var i = 0; i < this.comData.buttons.items.length; i++) {
                    this.tempBtns.push('');
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
                        this.comData.buttons.items.push(itemData);
                    }
                }
                this.comData.prizes.forEach((prize) => {
                    prize.name = prize.name.replace(/\n/g,',');
                });
                return this.comData;
            },
        	initPrize(){
                let prizeLength = this.comData.prizes.length;
                if(prizeLength == 0){
                    for (var i = 0; i < this.prizeCount; i++) {
                        this.comData.prizes.push({ id:'', name:'', img:'', alert:'', 
                            color:(i % 2 == 0 ? this.evenColor : this.oddColor) });
                    }
                } else if (prizeLength > this.prizeCount) {
                    this.comData.prizes = this.comData.prizes.slice(0,this.prizeCount);
                } else if (prizeLength < this.prizeCount){
                    let pushCount = this.prizeCount - prizeLength;
                    for (var i = 0; i < pushCount; i++) {
                        this.comData.prizes.push({ id:'', name:'', img:'', alert:'', 
                            color:( this.comData.prizes.length % 2 == 0 ? this.evenColor : this.oddColor) });
                    }
                }

        		this.$nextTick(()=>{
	        		let $container = $(this.$refs.turnContainer);
	        		let $prizes = $container.find('.prize');
	                let total = $prizes.length;
	        		let step = 360 / total;
	        		let skewY = 90 - step;
	        		for (var i = 0; i < total; i++) {
	        			let rotate = step/2 + i*step;
	        			$($prizes[i]).css({
	        				transform:`rotate(${rotate}deg) skewY(${skewY}deg)`,
					    	'-webkit-transform':`rotate(${rotate}deg) skewY(${skewY}deg)`,
					    	'-moz-transform':`rotate(${rotate}deg) skewY(${skewY}deg)`
	        			});
	        		}
        		});
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
                	// 为弹框绑定hover事件
                   //  let $codeAlert = $(this.$refs.codeAlert.$el);
                   //  $codeAlert.find('.el-select-dropdown__item').hover(function(){
                   //      _this.$store.dispatch("setCurActBtnRes",$(this).data('key'));
                   // }, function(){
                   //      _this.$store.dispatch("setCurActBtnRes",null);
                   // });
                });
            },
        	addButton(){
                this.tempBtns.push('');
                this.$nextTick(()=>{
                    let btnItem = this.$refs['rmableBtn_'+ (this.tempBtns.length-1)][0];
                    this.comData.buttons.items.push(btnItem.getData());
                });
            },
        	handleBtnChanged(btnConfig){
                let $container = $(this.$refs.turnContainer),
                $btnItem = $container.find('img[data-uuid='+btnConfig.uuid+']');
                if(!$btnItem){
                    return;
                }
                let w = util.px2rem(btnConfig.style.width),
                    t = util.px2rem(btnConfig.style['margin-top']);

                $btnItem.css({ width:w, 'margin-top': t});
                $btnItem.attr('src', btnConfig.imageUrl || require('./images/button.jpg'));
            },
        	handleConfigChang(){
        		let $container = $(this.$refs.turnContainer);
                let wrap_t = parseInt(this.comData.wrap.style['padding-top']),
                    wrap_h = parseInt(this.comData.wrap.style.height);

                this.comData.wrap.style['padding-top'] = isNaN(wrap_t) ? '' : wrap_t +'px';
                this.comData.wrap.style.height = isNaN(wrap_h) ? '' : wrap_h +'px';
                
                let bgWrapImg = this.comData.wrap.style['background-image'];
                $container.css({
                    height: util.px2rem(wrap_h),
                    'padding-top': util.px2rem(wrap_t),
                    'background-color': this.comData.wrap.style['background-color'],
                    'background-image': bgWrapImg ? `url(${bgWrapImg})` : ''
                });
                if(this.bgStyle.key){
                    this.comData.wrap.style[this.bgStyle.key] = this.bgStyle.value;
                    $container.css(this.bgStyle.key, this.bgStyle.value);
                    if(this.bgStyle.key != 'background-size'){
                        $curContainer.css('background-size', 'contain');
                    }
                }

                let bgWheelImg = this.comData.wheel.style['background-image'];
                let wheel_w = parseInt(this.comData.wheel.style.width);
                this.comData.wheel.style.width = isNaN(wheel_w) ? '' : wheel_w +'px';
                this.comData.wheel.style.height = isNaN(wheel_w) ? '' : wheel_w +'px';
                $container.find('.wheel').css({
                    width: util.px2rem(wheel_w),
                    height: util.px2rem(wheel_w),
                    color: this.comData.wheel.style.color
                });
                $container.find('.turborder').css({
                    'background-image': bgWheelImg ? `url(${bgWheelImg})` : require('./images/prize.png'),
                });

                for (var i = 0; i < this.comData.prizes.length; i++) {
                    this.comData.prizes[i].color = i%2 == 0 ? this.evenColor : this.oddColor;
                }
        	},
        	onPrizeClick(prize){
        		this.curPrize = prize;
        	},
        	onPrizeChange(value){
        		this.prizeCount = parseInt(value);
        		this.initPrize();
        	},
        	handlePrizeSuccess(response, file, fileList){
        		this.curPrize.img = response.file.path;
        	},
        	handleExceed(files,fileList){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            onWrapSuccess(response, file, filelist){
                this.comData.wrap.style['background-image'] = response.file.path;
                let _this = this;
                util.getImageWH(response.file.path).then(res => {
                    _this.comData.wrap.style.height = res.height;
                    _this.handleConfigChang();
                });
            },
            onWrapRemove(file, filelist){
                this.comData.wrap.style['background-image'] = '';
                this.handleConfigChang();
            },
            onWheelSuccess(response, file, filelist){
                this.comData.wheel.style['background-image'] = response.file.path;
                this.handleConfigChang();
            },
            onWheelRemove(file, filelist){
                this.comData.wheel.style['background-image'] = '';
                this.handleConfigChang();
            }
        }
    }
</script>

<style lang='scss'>
	.turnWrapper{
		position: relative;
		&:hover .mask{
            display: flex;
        }
	}
	.turnForm{
		.el-form-item{
			margin-bottom:10px;
		}
	}
	.pcard{
		margin-top:5px;
		.el-upload {
		    border: 1px dashed #d9d9d9;
		    cursor: pointer;
		    width:100%;
		    position: relative;
		    overflow: hidden;
		    &:hover{
		    	border-color: #409EFF;
		    }
		}
		.pcard-icon {
		    font-size: 28px;
		    color: #8c939d;
		    height: 50px;
		    line-height: 50px;
		    text-align: center;
		}
		.img {
		  	background-repeat:no-repeat;
		  	background-size:contain;
		  	background-position:center;
		  	margin: 0 auto;
		    width: 100%;
		    height: 50px;
		    display: block;
		}
		input,textarea{
			border:1px dashed transparent;
			padding: 0 5px;
			&:hover{
				border-color: #409EFF;
			}
		}
		.el-input-group__prepend{
			border-color:transparent;
			background-color:transparent;
			padding:0 5px;
		}
		.el-input__validateIcon{
			display:none;
		}
	}

	.turnContainer{
	    position: relative;
	    background-size: contain;
	    background-repeat: no-repeat;
        background-position:bottom;
	    .wheel{
	    	position: relative;
	    	margin: 0 auto;
	    	display: block;
		    width: 350px;
		    height: 350px;
            color: #ff0000;
	    }
	    .turnplate{
	    	display:block;
	    	position:relative;
	    	width:100%;
	    	height:100%;
	    }
	    .turborder{
	    	position:absolute;
	    	margin: auto;
	    	top:0; right:0; left:0; bottom:0;
	    	background-size:contain;
	    	background-position:center;
            background-repeat: no-repeat;
	    }
	    .core{
	    	position:absolute;
	    	width:290px;
	    	height:290px;
	    	border-radius:50%;
	    	background-size:100% 100%;
	    	background-repeat:no-repeat;
	    	top:0; right:0;left:0;bottom:0;
	    	margin:auto;
	    	overflow:hidden;
	    }
	    .core-box{
	    	width:100%;
	    	height:100%;
	    }
	    .prize{
	    	position:absolute;
	    	width:50%;height:50%;
	    	transform-origin:right bottom;
	    	-webkit-transform-origin:right bottom;
	    	-moz-transform-origin:right bottom;
	    	.prize-con{
	    		position:absolute;
	    		text-align:center;
	    		transform:skewY(-30deg) rotate(-30deg);
                -webkit-transform:skewY(-30deg) rotate(-30deg);
                -moz-transform:skewY(-30deg) rotate(-30deg);
	    		top:50px;
	    		left:50px;
	    		width:100px;
	    		height:90px;
            }
	    	pre{
	    		line-height:20px;
	    		height:40px;
	    		font-size:14px;
                font-weight:700;
	    	}
	    	.img{
	    		width:50px;
	    		height:50px;
	    		display:inline-block;
	    		background-repeat:no-repeat;
	    		background-position:center;
	    		background-size:contain;
	    	}
	    }
	    .prize.p_8{
	    	.prize-con{
	    		transform:skewY(-45deg) rotate(-22.5deg);
                -webkit-transform:skewY(-45deg) rotate(-22.5deg);
                -moz-transform:skewY(-45deg) rotate(-22.5deg);
	    		left:60px;
	    	}
	    }
	    .start{
	    	background-size:100%;
	    	background-repeat:no-repeat;
	    	position:absolute;
	    	top:50%;left:50%;
	    	transform:translate(-50%, -50%);
	    	-webkit-transform:translate(-50%, -50%);
            -moz-transform:translate(-50%, -50%);
	    	img{
	    		width:50px;
	    	}
	    }
	}
</style>