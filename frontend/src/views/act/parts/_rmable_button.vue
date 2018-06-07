<template>
	<div v-popover:button-pop class="rmableBtnWrapper" ref="curPop">
        <el-popover ref="button-pop" placement="right" width="400" trigger="click">
            <_button ref='_button' :originData="originData"></_button>
        </el-popover>
        <el-button size="small">按钮{{index}}</el-button>
        <i v-if='showClose' class="el-icon-circle-close" @click="handleRemove($event)"></i>
    </div>
</template>
<script>
    import _button from "./_button.vue"

    export default {
        name:'buttons',
        desc:'按钮组件',
        props: ['originData','onRemove', 'index'],
        components:{ _button },
        data(){
            return {
                uuid:'',
                button:{},
                showClose:false
            }
        },
        mounted(){
            this.uuid = this.$refs._button.uuid;
            this.showClose = !!this.$listeners.onRemove;
        },
        methods:{
            getData(){
                this.button = this.$refs._button.getData();
                return this.button;
            },
            handleRemove(event){
                event.stopPropagation();
                $(this.$refs.curPop).remove();
                this.$emit('onRemove',this.index);
            }
        }
    }

</script>
<style lang="scss">
    .rmableBtnWrapper{
        float:left;
        margin-right: 5px;
        position:relative;

        .el-icon-circle-close{
            position:absolute;
            top:-3px; right:-5px;
            z-index:1;
        }
    }
</style>
