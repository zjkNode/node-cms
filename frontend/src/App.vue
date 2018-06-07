<template>
    <div class="main">
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>

</template>
<script>
    
    export default{
        name:"mainApp",
        components:{

        },
        data() {
            return {
            }
        }
    }
</script>
<style lang="scss">
    @import 'src/scss/base';
    html,body{
        height: 100%;
        width: 100%;
        background: #eff0f4;
    }
    .main,.home,.right-sider {
        height: 100%;
        overflow: hidden;
    }
    .right-sider{
        display: flex;
        flex-direction: column;
        flex:1;
    }
    .mainContent{
        overflow:hidden;
        display: flex;
        flex-direction: column;
        flex:1;
        overflow-y: auto;
        margin: 15px;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    }
    .mainContent > div{height: auto;padding: 15px 10px;}
    .mainContent > div > h2 {border-left: 5px solid #324057;color: #324057;padding-left: 10px;margin-bottom: 15px;}
    .mainContent > div > .tools { margin: 10px 0;}
    .mainContent .pagbar{ text-align:center; margin:10px 0;}

    .overflow-ellipsis > div{
        white-space: nowrap !important;
    }
    .flat-tree > div{
        white-space:pre!important;
    }

    .el-table thead th{
        background: #f5f7fa;
    }
    .el-table tbody td{
        padding:10px 0;
    }
</style>
