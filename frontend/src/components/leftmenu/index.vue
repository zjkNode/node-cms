<template>
    <el-col class="left-sider">
        <div class="logo">
            <img src="../../img/admin.png" alt="" />
        </div>
        <el-menu background-color="#324157" active-background-color="red" text-color="#fff" active-text-color="#ffd04b" :default-active="$route.alink" router class="menulists">
            <tree :lists="menuList"></tree>
        </el-menu>
    </el-col>
</template>
<script>
    import Tree from './tree.vue';
    export default {
        name:"leftMenu",
        components:{Tree},
        data(){
            return {
                menuList:[]
            }
        },
        mounted(){
            this.onMenuReload();
        },
        methods:{
            onMenuReload(){
                let url = '/api/menu/listsTree';
                this.$http.get(url).then( (res) =>{
                    let rs = res.body;
                    if(rs.code == 'SUCCESS'){
                        this.menuList = rs.data;
                    }
                })
            }
        },
        
    }
</script>
<style>
    .left-sider{
        background: #324157;
        width: 230px!important;
        height: 100%;
        color: #bfcbd9;
    }
    .logo{
        height: 30%;
        display:flex;
        align-items: center;
        border-bottom: solid 1px #ccc;
    }
    .logo img{
        height: 50%;
        width: auto;
        margin:0 auto;
    }
    .menulists{
        height: 70%;
        overflow-y: auto;
        border-right:none;
    }
</style>
