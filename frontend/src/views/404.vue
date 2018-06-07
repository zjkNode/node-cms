<template>
	<div class="notFound">
        <img src="../img/notfound.png" alt="" class="img">
        页面找不到了<br/>请核验访问地址或在地址栏重新输入
    </div>
</template>
<script>
export default {
    name: 'p404',
    data () {
        return {
        }
    },
    components: {
        
    },
    mounted: function() {
        this.$nextTick(() => {
        })
    },
    methods:{
        
    }
}
</script>
<style>
    .notFound{
        height: 100%;
        text-align: center;
        font-size: .32rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .img{
        display: block;
        width: 25%;
        height: auto;
        margin: 0 auto;
        padding-bottom: .266667rem;
    }
</style>
