<template>
    <el-row class="home" type="flex">
        <leftMenu></leftMenu>
        <el-col class="right-sider">
            <topMenu></topMenu>
            <!--main-->
            <div class="mainContent">
                <transition name="el-fade-in-linear" mode="out-in">
                    <router-view></router-view>
                </transition>
            </div>
            <!--<footerMenu></footerMenu>-->
        </el-col>
    </el-row>
</template>
<script>
        import leftMenu from 'components/leftmenu/index.vue';
        import topMenu from 'components/header.vue';
        import footerMenu from 'components/footer.vue';

        export default{
            name:"mainApp",
            components:{
                leftMenu,
                topMenu,
                footerMenu
            },
            data() {
                return {
                }
            }
        }
</script>

