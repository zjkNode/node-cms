<template>
    <div class="troubleContainer">
        <div class="notice">
            <img src="../img/bg_fail.png"><br/>
	    	{{ msg }}
        </div>
        <div class="error">
            <img src="../img/net_error.png"><br/>
            当前网络不可用，请检查您的网络设置<br/>
            <div class="reloadBtn" @click="onReload">重新加载</div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'trouble',
        props: ['msg'],
        data() {
            return {
                test:''
            }
        },
        components: {
            
        },
        mounted: function() {
            
        },
        methods: {
            onReload(){
                window.location.reload();
            }
        }
    }
</script>
<style lang="scss">
    @import '../scss/base.scss';
    .troubleContainer{
        font-size: .4rem;
        .notice, .error{
            text-align: center;
            margin-top: 50%;
            display:none;
            img{
                margin:0 auto;
                display: block;
                width: 30%;
                margin-bottom: .266667rem
            }
        }
        .reloadBtn{
            color: $blue;
            border: solid .026667rem $blue;
            font-size: .4rem;
            border-radius: .08rem;
            width: 3.733333rem;
            height: 1.066667rem;
            line-height: 1.066667rem;
            margin: .933333rem auto;
        }
    }
</style>
