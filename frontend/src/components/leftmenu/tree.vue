<template>
    <div>
        <template v-for = "item in lists">
            <el-submenu v-if="item.name && item.children && item.children.length>0" :index="item.alink">
                <template slot="title"><i class="el-icon-menu" style="color:#fff;" v-if="item.pid == 0"></i>{{item.name}}</template> 
                <el-menu-item v-for = "child in item.children" :index="child.alink" :key="child.alink" v-if="!child.children">
                    {{child.name}}
                </el-menu-item>
                <TreeCon :children="item.children"></TreeCon>
            </el-submenu> 
            <el-menu-item v-else-if="item.name" :index="item.alink">
                <i class="el-icon-menu" v-if="item.pid == 0"></i>{{item.name}}
            </el-menu-item>          
        </template>
        
    </div>
    
</template>
<script>
    export default {
        props:['lists'],
        components: {},
        beforeCreate: function () {
            this.$options.components.TreeCon = require('./tree_contents.vue')
        }
    }

</script>
